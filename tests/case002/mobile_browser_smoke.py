#!/usr/bin/env python3
"""Small real-browser smoke test for isolated Case 002 mobile prototype.
No 202 Case 001 scenarios. Runs both Chromium and WebKit at phone widths.
"""
import contextlib
import functools
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
                    page.locator(".choice:not([disabled])").first.click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.locator("#saveStatus").inner_text().startswith("Автосохранение")
                    page.reload(wait_until="load")
                    assert page.locator("#resume").is_enabled()
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02"), "save didn't reload"
                    page.locator(".choice:not([disabled])").first.click()  # A01
                    assert page.locator("#sceneId").inner_text().startswith("A01")
                    page.locator(".choice:not([disabled])").nth(1).click()  # A03 via bridge
                    assert page.locator("#sceneId").inner_text().startswith("A03")
                    page.locator(".choice:not([disabled])").first.click()  # A05
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    assert "old_excursion_ticket" in page.locator("#notice").inner_text()
                    assert page.locator("#toolContent li").count() >= 1
                    page.locator('button[data-tab="witnesses"]').click()
                    assert "Томми Кросс" in page.locator("#toolContent").inner_text()
                    page.locator('button[data-tab="deductions"]').click()
                    assert "Подлог отправления" in page.locator("#toolContent").inner_text()
                    for width in (360, 390, 430):
                        page.set_viewport_size({"width": width, "height": 790})
                        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
                        assert not overflow, f"{browser_name}: horizontal overflow at {width}"
                        for selector in (".choice:not([disabled])", ".tool-tab"):
                            minimum = page.locator(selector).first.bounding_box()["height"]
                            assert minimum >= 44, f"{browser_name} {width}: {selector} too short"
                    assert not failures, f"{browser_name} console errors: {failures}"
                    print(f"PASS {browser_name}: 360/390/430px, touch targets, clue notice, save resume, inventory, deduced facts")
                    context.close()
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

if __name__ == "__main__":
    main()
