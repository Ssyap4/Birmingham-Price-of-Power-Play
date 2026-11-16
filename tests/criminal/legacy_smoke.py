#!/usr/bin/env python3
"""One risk-proportionate old-entry check from the exact unified package.
No repeated 202-route campaign simulation; game engines remain unchanged.
"""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
import sys, json

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "work/criminal/browser"
OUT.mkdir(parents=True, exist_ok=True)


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def tap(page, selector):
    el = page.locator(selector)
    el.scroll_into_view_if_needed()
    el.tap()


def run():
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(Quiet, directory=str(ROOT / "campaign-unified-dist"))
    )
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as p:
            for name in (
                ["chromium"]
                if "--system-chromium" in sys.argv
                else ["chromium", "webkit"]
            ):
                options = {"headless": True}
                if "--system-chromium" in sys.argv:
                    options["executable_path"] = "/usr/bin/chromium"
                browser = getattr(p, name).launch(**options)
                ctx = browser.new_context(
                    viewport={"width": 390, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                page = ctx.new_page()
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.route("https://**/*", lambda r: r.abort())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                # Return from the new mode before entering the old five-district map.
                tap(page, "#criminalEntry")
                tap(page, '[data-action="home"]')
                tap(page, "#districtsCard")
                assert page.locator(".map-pin").count() == 5
                tap(page, '.map-pin[data-district="digbeth"]')
                tap(page, "#launchSecondCase")
                page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                assert page.locator("#caseBriefing").is_visible()
                tap(page, "#briefContinue")
                tap(page, "#begin")
                assert page.locator("#game").is_visible()
                assert page.locator("#sceneId").inner_text().startswith("P01")
                tap(page, 'button.choice[data-to="P02"]')
                assert page.locator("#sceneId").inner_text().startswith("P02")
                second = page.evaluate(
                    "localStorage.getItem('birmingham_case002_draft_v3_jack')"
                )
                tap(page, "#case002MapReturn")
                page.wait_for_url("**/index.html#district-digbeth")
                tap(page, '.map-pin[data-district="small-heath"]')
                tap(page, "#launchFirstCase")
                assert page.locator("#heroSelection").is_visible()
                tap(page, "#heroSelection .hero-begin")
                assert page.locator("#case001Briefing").is_visible()
                tap(page, "#case001Briefing .briefing-start")
                assert page.locator("#caseGame").is_visible()
                assert page.locator("#caseChoices button").count() > 0
                first = page.evaluate(
                    "localStorage.getItem('birmingham_case_smol_heath_v1_jack')"
                )
                page.screenshot(
                    path=str(OUT / (name + "-case001-start.png")), full_page=True
                )
                # Leaving old entry UI and playing a new intro must preserve both raw slots.
                tap(page, "#homeBtn")
                tap(page, "#criminalEntry")
                tap(page, '.cr-pin[data-mission="CR02"]')
                tap(page, '[data-action="start"]')
                tap(page, '[data-choice="go"]')
                tap(page, '[data-action="home"]')
                tap(page, "#storyStart")
                assert page.locator("#campaignAchievements").is_visible()
                assert page.locator("#campaignSecondCaseAchievements").is_visible()
                assert page.locator("#campaignCriminalAchievements").is_visible()
                assert "Работа для своих" in page.locator("#campaignCriminalAchievements").inner_text()
                assert (
                    page.evaluate(
                        "localStorage.getItem('birmingham_case_smol_heath_v1_jack')"
                    )
                    == first
                )
                assert (
                    page.evaluate(
                        "localStorage.getItem('birmingham_case002_draft_v3_jack')"
                    )
                    == second
                )
                assert not errors, errors
                print(
                    "PASS",
                    name,
                    "same package: criminal return -> 002 P02 -> 001 start -> criminal -> shared archive, slots unchanged",
                )
                browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
