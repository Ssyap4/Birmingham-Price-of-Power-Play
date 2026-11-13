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
import sys

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
INDEX = "/preview/case002-prototype/index.html"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

def main():
    quick = "--quick" in sys.argv
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    address = f"http://127.0.0.1:{server.server_port}{INDEX}"
    try:
        with sync_playwright() as p:
            for browser_name in (("chromium",) if quick else ("chromium", "webkit")):
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
                    assert page.locator("#chapterIntertitle").is_visible()
                    assert page.locator("#chapterIntertitle").get_attribute("data-chapter") == "P"
                    assert "Ночь, когда" in page.locator("#intertitleLine").inner_text()
                    assert page.locator("#quickNav button").count() == 5
                    assert page.locator("#pulseEvidence").inner_text() == "Улик: 0"
                    assert page.locator("#pulseProof").inner_text() == "Выводов: 0"
                    page.locator('#quickNav button[data-go="choices"]').click()
                    assert page.locator("#choicesPanel").is_visible()
                    assert page.locator("#sceneId").inner_text().startswith("P01"), (
                        "Quick navigation must not advance the story"
                    )
                    page.locator('#quickNav button[data-go="scene"]').click()
                    assert page.locator("#storyPanel").is_visible()
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
                    page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert page.locator("#sceneArtwork").is_visible(), (
                        "First approved P01 image must load on the phone"
                    )
                    assert page.locator("#sceneArtwork").get_attribute("data-portrait") == "true"
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.naturalWidth === 720 && img.naturalHeight === 900"
                    ), "P01 mobile crop must be a genuine independently registered WebP"
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('case002-p01-scene--mobile.webp')"
                    )
                    assert "Частная железнодорожная ветка" in page.locator(
                        "#sceneLocation"
                    ).text_content()
                    page.locator(".choice:not([disabled])").first.click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.locator("#chapterIntertitle").is_hidden(), (
                        "Intertitle must not repeat on every scene of the chapter"
                    )
                    p02_registered = page.evaluate("""() =>
                        window.BirminghamCase002ApprovedArt.manifest.sceneImages.some(
                            e => e.sceneId === 'P02' && e.review === 'approved'
                        )""")
                    if p02_registered:
                        page.wait_for_function(
                            "() => document.querySelector('#game').dataset.artVerified === 'true'",
                            timeout=8000
                        )
                        assert page.locator("#sceneArtwork").is_visible()
                    else:
                        assert page.locator("#sceneArtwork").is_hidden()
                    assert "Контора сыщика" in page.locator("#sceneLocation").text_content()
                    assert page.locator("#sceneCast").is_visible()
                    assert page.locator("#sceneCast").get_attribute("data-people") == "mabel"
                    assert "Мэйбл Кросс" in page.locator("#sceneCast").inner_text()
                    assert page.locator("#sceneText .scene-spoken-line").count() >= 3, (
                        "P02 must visually distinguish direct dialogue from narration"
                    )
                    assert "К моему брату. Томми больше нет дома." in page.locator(
                        "#sceneText"
                    ).inner_text(), "Scene prose must keep original story words"
                    assert page.locator("#sceneText script").count() == 0
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
                    page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert page.locator("#sceneArtwork").is_visible(), (
                        "Approved A01 scene must be visible on the phone"
                    )
                    assert page.locator("#sceneArtwork").get_attribute("data-portrait") == "true"
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.naturalWidth === 720 && el.naturalHeight === 900"
                    ), "A01 must load a separate 720x900 phone WebP"
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.currentSrc.endsWith('/case002-a01-scene--mobile.webp')"
                    ), "Wrong A01 mobile image"
                    assert page.locator("#chapterIntertitle").is_visible()
                    assert page.locator("#chapterIntertitle").get_attribute("data-chapter") == "I"
                    assert "ВИАДУКА" in page.locator("#intertitleLine").inner_text().upper()
                    # Verify the optional A02 -> A04 route independently:
                    # golden ending paths alone did not cover this real scene.
                    form_context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    form_page = form_context.new_page()
                    form_errors = []
                    form_page.on("pageerror", lambda err: form_errors.append(str(err)))
                    form_page.goto(address, wait_until="load")
                    form_page.locator("#begin").click()
                    for target in ("P02", "A01", "A02", "A04"):
                        action = form_page.locator(f'button.choice[data-to="{target}"]')
                        assert action.count() == 1 and action.is_enabled(), (
                            f"{browser_name}: optional route to {target} is unreachable"
                        )
                        action.click()
                        assert form_page.locator("#sceneId").inner_text().startswith(target)
                    form_page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert form_page.locator("#sceneArtwork").is_visible()
                    assert form_page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.naturalWidth === 720 && el.naturalHeight === 900"
                    ), f"{browser_name}: A04 mobile artwork is not decoded"
                    assert form_page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.currentSrc.endsWith('/case002-a04-scene--mobile.webp')"
                    ), f"{browser_name}: A04 has wrong approved phone image"
                    assert not form_errors, f"{browser_name} optional branch JS errors: {form_errors}"
                    form_context.close()
                    page.locator(".choice:not([disabled])").nth(1).click()  # A03 via bridge
                    assert page.locator("#sceneId").inner_text().startswith("A03")
                    assert "Роуэн" in page.locator("#sceneCast").inner_text()
                    assert "Томми" not in page.locator("#sceneCast").inner_text()
                    page.locator(".choice:not([disabled])").first.click()  # A05
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    assert page.locator("#game").get_attribute("data-art-scene") == "A05"
                    assert "Старинный билет Курзон-стрит" in page.locator("#notice").inner_text()
                    assert page.locator("#noticeJump").is_visible()
                    assert "УЛИКУ" in page.locator("#noticeJump").inner_text()
                    assert page.locator("#pulseEvidence").inner_text() == "Улик: 1"
                    assert page.locator("#toolContent li").count() >= 1
                    page.locator("#noticeJump").click()
                    assert page.locator("#notice").is_hidden()
                    assert page.locator('button[data-tab="evidence"]').get_attribute("aria-pressed") == "true"
                    assert page.locator(
                        '.evidence-card[data-evidence-id="old_excursion_ticket"]'
                    ).evaluate("(el) => document.activeElement === el"), (
                        "New evidence must receive keyboard focus after jumping from notice"
                    )
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    assert "сведения в досье" in page.locator("#toolContent").inner_text().lower(), (
                        "clue must show recorded-not-original custody on iPhone"
                    )
                    ticket = page.locator('.evidence-card[data-evidence-id="old_excursion_ticket"]')
                    assert ticket.count() == 1
                    assert ticket.locator("svg.evidence-symbol").count() == 1
                    assert ticket.locator("svg.evidence-symbol").get_attribute("viewBox") == "0 0 64 64"
                    assert "Старинный билет Курзон-стрит" in ticket.inner_text()
                    assert "Кирпичный виадук" not in ticket.inner_text(), (
                        "Evidence origin must come from actual acquired source"
                    )
                    page.locator('#quickNav button[data-go="witnesses"]').click()
                    assert page.locator('button[data-tab="witnesses"]').get_attribute("aria-pressed") == "true"
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
                    assert page.locator(".deduction-card").count() == 0, (
                        "An old railway ticket must not reveal future deductions or murderer"
                    )
                    assert "Брэкеттом" not in page.locator("#toolContent").inner_text()
                    assert "Пока нет подтверждённых" in page.locator("#toolContent").inner_text()
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
                        nav = page.locator("#quickNav").bounding_box()
                        assert nav and nav["width"] <= width + 1
                        assert nav["y"] + nav["height"] <= 791, (
                            f"{browser_name}: bottom navigation escapes phone viewport"
                        )
                        for navbutton in page.locator("#quickNav button").all():
                            assert navbutton.bounding_box()["height"] >= 44
                        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
                        assert not overflow, f"{browser_name}: horizontal overflow at {width}"
                        icons = page.locator(".evidence-card svg.evidence-symbol")
                        if icons.count():
                            assert icons.first.bounding_box()["width"] >= 44, (
                                f"{browser_name}: evidence icons too small at {width}px"
                            )
                        cast_bounds = page.locator("#sceneCast").bounding_box()
                        if cast_bounds:
                            assert cast_bounds["width"] <= width + 1, (
                                f"{browser_name}: cast overflows at {width}px"
                            )
                        for selector in (".choice:not([disabled])", ".tool-tab"):
                            minimum = page.locator(selector).first.bounding_box()["height"]
                            assert minimum >= 44, f"{browser_name} {width}: {selector} too short"
                    # Simulate a reviewed landscape scene and a missing
                    # mobile-specific crop. The production manifest remains
                    # untouched: this mock is strictly inside the browser QA.
                    art_context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    art_page = art_context.new_page()
                    svg_landscape = (
                        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">'
                        '<rect width="1600" height="900" fill="#252525"/></svg>'
                    )
                    art_page.route("**/assets/case002/scenes/mobile-test-landscape.webp",
                        lambda route: route.fulfill(
                            status=200, content_type="image/svg+xml", body=svg_landscape
                        )
                    )
                    art_page.goto(address, wait_until="load")
                    art_page.evaluate("""() => {
                        const gate = window.BirminghamCase002ApprovedArt;
                        const original = gate.resolveScene;
                        gate.resolveScene = stage => stage.sceneId === 'P01' ? {
                          sceneId: 'P01', variantKey: 'default',
                          src: '../../assets/case002/scenes/mobile-test-landscape.webp',
                          mobileSrc: '../../assets/case002/scenes/mobile-test-missing--mobile.webp',
                          alt: 'Проверка резервного кадра'
                        } : original(stage);
                    }""")
                    art_page.locator("#begin").click()
                    art_page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=6000
                    )
                    assert art_page.locator("#game").get_attribute("data-art-fallback") == "true", (
                        f"{browser_name}: missing phone WebP did not fall back to approved landscape"
                    )
                    assert art_page.locator("#sceneArtwork").is_visible()
                    assert art_page.locator("#sceneArtwork").get_attribute("data-portrait") == "false"
                    assert art_page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.naturalWidth === 1600 && el.naturalHeight === 900"
                    ), f"{browser_name}: scene fallback geometry invalid"
                    art_context.close()
                    # In a real Telegram webview the native and Telegram UI
                    # safe areas must stack, without requiring network SDK
                    # access when opened as plain Safari/Chromium HTML.
                    tg_context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    tg_page = tg_context.new_page()
                    tg_page.add_init_script("""(() => {
                        window.__case002TelegramHandlers = {};
                        window.Telegram = {WebApp: {
                          safeAreaInset: {top:24,bottom:18,left:6,right:6},
                          contentSafeAreaInset: {top:40,bottom:8,left:0,right:0},
                          onEvent(name, cb) {window.__case002TelegramHandlers[name] = cb;},
                          offEvent(name) {delete window.__case002TelegramHandlers[name];}
                        }};
                    })();""")
                    tg_page.goto(address, wait_until="load")
                    tg_insets = tg_page.evaluate("""() => {
                        const st = document.documentElement.style;
                        return {
                          top:st.getPropertyValue('--case002-safe-top'),
                          bottom:st.getPropertyValue('--case002-safe-bottom'),
                          left:st.getPropertyValue('--case002-safe-left')
                        };
                    }""")
                    assert tg_insets == {"top":"64px","bottom":"26px","left":"6px"}, (
                        f"{browser_name}: Telegram content and device safe areas not combined: {tg_insets}"
                    )
                    tg_page.locator("#begin").click()
                    assert tg_page.locator("#quickNav").is_visible()
                    shell_top = tg_page.locator(".app-shell").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).paddingTop)"
                    )
                    nav_bottom_padding = tg_page.locator("#quickNav").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).paddingBottom)"
                    )
                    assert shell_top >= 64, f"{browser_name}: Telegram header overlaps case"
                    assert nav_bottom_padding >= 34, f"{browser_name}: Telegram home bar overlaps commands"
                    updated_top = tg_page.evaluate("""() => {
                        window.Telegram.WebApp.contentSafeAreaInset.top = 72;
                        window.__case002TelegramHandlers.contentSafeAreaChanged();
                        return document.documentElement.style.getPropertyValue('--case002-safe-top');
                    }""")
                    assert updated_top == "96px", f"{browser_name}: safe-area event is stale"
                    tg_context.close()
                    assert not failures, f"{browser_name} console errors: {failures}"
                    print(f"PASS {browser_name} {'quick' if quick else 'full'}: phone widths, canonical portraits, opening scenes, local clues, save/journal and layout")
                    context.close()
                    if browser_name == "chromium" and not quick:
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
                        full_page.locator('button[data-tab="deductions"]').click()
                        deductions = full_page.locator(".deduction-card")
                        assert deductions.count() >= 1, "Investigated case has no earned deductions"
                        evidence_jump = full_page.locator(".deduction-source").first
                        assert evidence_jump.count() == 1 and evidence_jump.is_enabled()
                        expected_id = evidence_jump.get_attribute("data-evidence-id")
                        evidence_jump.click()
                        assert full_page.locator(
                            'button[data-tab="evidence"]'
                        ).get_attribute("aria-pressed") == "true"
                        focused = full_page.locator(
                            f'.evidence-card[data-evidence-id="{expected_id}"]'
                        )
                        assert focused.count() == 1 and "is-focused" in (
                            focused.get_attribute("class") or ""
                        ), "Deduction link must jump to acquired supporting evidence"
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
