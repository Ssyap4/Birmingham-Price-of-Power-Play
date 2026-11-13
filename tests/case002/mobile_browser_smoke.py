#!/usr/bin/env python3
"""Small real-browser smoke test for isolated Case 002 mobile prototype.
No 202 Case 001 scenarios. Runs both Chromium and WebKit at phone widths.
"""
import contextlib
import functools
import json
import subprocess
import http.server
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
INDEX = "/preview/case002-prototype/index.html"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

def main():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    address = f"http://127.0.0.1:{server.server_port}{INDEX}"
    try:
        with sync_playwright() as p:
            for browser_name in ("chromium", "webkit"):
                browser = getattr(p, browser_name).launch(headless=True)
                try:
                    context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3,
                        is_mobile=True,
                        has_touch=True,
                    )
                    page = context.new_page()
                    failures = []
                    page.on("pageerror", lambda err: failures.append(str(err)))
                    response = page.goto(address, wait_until="load")
                    assert response.status == 200, f"{browser_name}: URL failed"
                    assert page.locator("#begin").is_visible()
                    assert page.locator("#begin").bounding_box()["height"] >= 44
                    page.locator("#begin").click()
                    assert page.locator("#sceneId").inner_text().startswith("P01")
                    assert "Ночной тормоз" in page.locator("#sceneTitle").inner_text()
                    assert page.locator("#heroPortrait").is_visible()
                    assert page.locator("#heroPortrait").get_attribute("alt").startswith(
                        "Портрет сыщика:"
                    )
                    page.locator("#heroPortrait").evaluate(
                        "img => img.decode().then(() => true)"
                    )
                    assert page.locator("#heroPortrait").evaluate(
                        "img => img.complete && img.naturalWidth > 0"
                    ), f"{browser_name}: previously approved hero portrait did not load"
                    assert page.locator("#game").get_attribute("data-art-scene") == "P01"
                    assert not page.locator("#sceneCast").is_visible(), (
                        "Unknown prologue figures must not reveal NPC identity"
                    )
                    assert page.locator("#game").get_attribute("data-art-variant") == "default"
                    assert page.locator("#game").get_attribute("data-art-verified") == "false", (
                        "Uncreated illustrations must never be presented as available"
                    )
                    assert page.locator("#sceneArtwork").is_hidden()
                    assert page.locator("#sceneArtworkImage").get_attribute("src") is None
                    assert "Частная железнодорожная ветка" in page.locator(
                        "#sceneLocation"
                    ).inner_text()
                    page.locator(".choice:not([disabled])").first.click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.locator("#sceneArtwork").is_hidden()
                    assert "Контора сыщика" in page.locator("#sceneLocation").inner_text()
                    assert page.locator("#sceneCast").is_visible()
                    assert page.locator("#sceneCast").get_attribute("data-people") == "mabel"
                    assert "Мэйбл Кросс" in page.locator("#sceneCast").inner_text()
                    assert page.locator("#sceneCast img").count() == 0, (
                        "Unapproved Mabel portrait must not be substituted"
                    )
                    assert page.locator("#saveStatus").inner_text().startswith("Автосохранение")
                    page.reload(wait_until="load")
                    assert page.locator("#resume").is_enabled()
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02"), "save didn't reload"
                    page.locator(".choice:not([disabled])").first.click()  # A01
                    assert page.locator("#sceneId").inner_text().startswith("A01")
                    page.locator(".choice:not([disabled])").nth(1).click()  # A03 via bridge
                    assert page.locator("#sceneId").inner_text().startswith("A03")
                    assert "Роуэн" in page.locator("#sceneCast").inner_text()
                    assert "Томми" not in page.locator("#sceneCast").inner_text()
                    page.locator(".choice:not([disabled])").first.click()  # A05
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    assert page.locator("#game").get_attribute("data-art-scene") == "A05"
                    assert "Старинный билет Курзон-стрит" in page.locator("#notice").inner_text()
                    assert page.locator("#toolContent li").count() >= 1
                    assert "сведения в досье" in page.locator("#toolContent").inner_text(), (
                        "clue must show recorded-not-original custody on iPhone"
                    )
                    page.locator('button[data-tab="witnesses"]').click()
                    people = page.locator("#toolContent").inner_text()
                    assert "Мэйбл Кросс" in people
                    assert "Констебль Роуэн" in people
                    assert "Эдвард Хейл" in people
                    assert "Томми Кросс" not in people, (
                        "People dossier must not expose Tommy before his introduction"
                    )
                    assert "Льюис Брэкетт" not in people, (
                        "People dossier must not spoil unrevealed antagonist"
                    )
                    page.locator('button[data-tab="deductions"]').click()
                    assert "Подлог отправления" in page.locator("#toolContent").inner_text()
                    page.locator('button[data-tab="journal"]').click()
                    assert "Сцена A05" in page.locator("#toolContent").inner_text()
                    assert "Старинный билет Курзон-стрит" in page.locator("#toolContent").inner_text()
                    page.reload(wait_until="load")
                    page.locator("#resume").click()
                    page.locator('button[data-tab="journal"]').click()
                    assert "Сцена A05" in page.locator("#toolContent").inner_text(), (
                        "Chronicle entries must survive Safari/Chromium reloads"
                    )
                    for width in (360, 390, 430):
                        page.set_viewport_size({"width": width, "height": 790})
                        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
                        assert not overflow, f"{browser_name}: horizontal overflow at {width}"
                        cast_bounds = page.locator("#sceneCast").bounding_box()
                        if cast_bounds:
                            assert cast_bounds["width"] <= width + 1, (
                                f"{browser_name}: cast overflows at {width}px"
                            )
                        for selector in (".choice:not([disabled])", ".tool-tab"):
                            minimum = page.locator(selector).first.bounding_box()["height"]
                            assert minimum >= 44, f"{browser_name} {width}: {selector} too short"
                    assert not failures, f"{browser_name} console errors: {failures}"
                    print(f"PASS {browser_name}: 360/390/430px, approved hero portrait, honest NPC speaker slots, saved journal and inventory")
                    context.close()
                    if browser_name == "chromium":
                        route_source = (
                            "const m=require('./tests/case002/simulate-story-model-v2.js');"
                            "console.log(JSON.stringify(m.goodRoute('jack','trainEscape').actionLog));"
                        )
                        output = subprocess.check_output(
                            ["node", "-e", route_source], cwd=ROOT, text=True
                        )
                        route = json.loads(output.strip().splitlines()[-1])
                        full_ctx = browser.new_context(
                            viewport={"width": 390, "height": 844},
                            device_scale_factor=3, is_mobile=True, has_touch=True
                        )
                        full_page = full_ctx.new_page()
                        errors = []
                        full_page.on("pageerror", lambda err: errors.append(str(err)))
                        full_page.goto(address, wait_until="load")
                        full_page.locator("#begin").click()
                        for source, target, action in route[:-1]:
                            assert full_page.locator("#sceneId").inner_text().startswith(source), (
                                f"Full mobile route drifted at {source} -> {target}"
                            )
                            choice = full_page.locator(
                                f'button.choice[data-to="{target}"][data-action="{action}"]'
                            )
                            assert choice.count() == 1 and choice.is_enabled(), (
                                f"Missing enabled choice {source} -> {target}/{action}"
                            )
                            choice.click()
                        assert full_page.locator("#sceneId").inner_text().startswith("F09")
                        final_choices = full_page.locator("button.choice")
                        assert final_choices.count() == 1, (
                            "Unqualified endings were exposed as disabled plot spoilers"
                        )
                        assert final_choices.first.get_attribute("data-to") == "Z02"
                        full_page.locator('button[data-tab="journal"]').click()
                        assert full_page.locator(".case-journal > li").count() > 0
                        full_page.reload(wait_until="load")
                        full_page.locator("#resume").click()
                        assert full_page.locator("#sceneId").inner_text().startswith("F09")
                        assert full_page.locator("button.choice").count() == 1
                        assert not errors, f"Full-route browser errors: {errors}"
                        print(
                            "PASS chromium: full Case 002 mobile route, earned-only endings, "
                            "saved story consequences and restoration"
                        )
                        full_ctx.close()
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

if __name__ == "__main__":
    main()
