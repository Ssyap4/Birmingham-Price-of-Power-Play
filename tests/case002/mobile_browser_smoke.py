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


def ensure_selection(page):
    """Follow the non-spoiling brief on a fresh run; saved runs skip it."""
    if page.locator("#caseBriefing").is_visible():
        assert page.locator("#launch").is_hidden()
        assert page.locator("#briefContinue").is_visible()
        page.locator("#briefContinue").click()
    assert page.locator("#launch").is_visible()

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
                    assert page.locator("#caseBriefing").is_visible()
                    assert page.locator("#launch").is_hidden()
                    assert page.locator(".masthead").is_hidden()
                    assert page.locator("#resume").is_hidden()
                    assert "виадука" in page.locator("#caseBriefing").inner_text().lower()
                    assert page.locator("#caseBriefing").get_attribute("aria-describedby") == "briefPremise"
                    page.locator(".briefing-visual img").evaluate("img => img.decode()")
                    cta = page.locator("#briefContinue").bounding_box()
                    assert cta and cta["y"] + cta["height"] <= 844, (
                        f"{browser_name}: briefing enter button falls below the first iPhone screen"
                    )
                    assert page.locator(".briefing-rule").count() == 3
                    assert "сохраняется" in page.locator("#caseBriefing").inner_text().lower()
                    visual_dir=ROOT/"case002-qa-screens"
                    page.screenshot(path=str(visual_dir/f"{browser_name}-briefing.png"),full_page=True)
                    ensure_selection(page)
                    assert page.locator(".masthead").is_hidden()
                    assert page.locator("#resume").is_hidden()
                    assert page.locator("#begin").is_visible()
                    visual_dir.mkdir(parents=True,exist_ok=True)
                    page.wait_for_function(
                        "() => [...document.querySelectorAll('#heroGallery img')].every(i => i.complete && i.naturalWidth > 0)",
                        timeout=8000
                    )
                    page.screenshot(path=str(visual_dir/f"{browser_name}-launch.png"),full_page=True)
                    assert page.locator("#heroGallery .hero-card").count() == 5
                    assert "Джек Харпер" in page.locator("#selectedHeroStatus").inner_text()
                    assert page.locator(".hero-save-badge:visible").count() == 0
                    assert page.locator(".briefing-visual img").get_attribute("src").endswith("case002-mabel-portrait.webp")
                    assert page.locator("#hero").get_attribute("type") == "hidden"
                    assert page.locator("#priorDetails").is_hidden()
                    assert page.locator('#heroGallery .hero-card[aria-pressed="true"]').count() == 1
                    for hero_id in ("jack","finn","eleanor","victor","samuel"):
                        assert page.locator(f'.hero-card[data-hero="{hero_id}"] img').get_attribute("src").endswith(f"/assets/heroes/{hero_id}.webp")

                    if not quick:
                        outcomes = page.evaluate("""async () => {
                            const personal = new Set(["HJ01","HF01","HE01","HV01","HS01","HF02","HS02"]);
                            const entries = window.BirminghamCase002ApprovedArt.manifest.sceneImages
                                .filter(e => /^Z0[1-7]$/.test(e.sceneId) || personal.has(e.sceneId));
                            return Promise.all(entries.map(e => new Promise(resolve => {
                                const img = new Image();
                                img.onload = () => resolve({id:e.sceneId,ok:true,
                                    width:img.naturalWidth,height:img.naturalHeight});
                                img.onerror = () => resolve({id:e.sceneId,ok:false});
                                img.src = new URL("../../assets/case002/scenes/" +
                                    e.mobileFile, window.location.href).href;
                            })));
                        }""")
                        assert len(outcomes) == 21, (
                            f"{browser_name}: expected 14 ending states + 7 distinct hero portraits, got {outcomes}"
                        )
                        assert {x["id"] for x in outcomes if x["id"].startswith("H")} == {
                            "HJ01", "HF01", "HE01", "HV01", "HS01", "HF02", "HS02"
                        }, f"{browser_name}: wrong hero-specific art registry"
                        assert all(
                            x["ok"] and x["width"] == 720 and x["height"] == 900
                            for x in outcomes
                        ), f"{browser_name}: ending or personal scene WebP unavailable: {outcomes}"
                    assert page.locator("#begin").bounding_box()["height"] >= 44
                    ensure_selection(page)
                    page.locator("#begin").click()
                    assert page.locator("#storyPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: entering the case must focus its story landmark"
                    assert page.locator(".masthead").is_visible()
                    assert page.locator("#sceneId").inner_text().startswith("P01")
                    assert "Ночной тормоз" in page.locator("#sceneTitle").inner_text()
                    assert page.locator("#chapterIntertitle").is_visible()
                    assert page.locator("#chapterIntertitle").evaluate(
                        "(el) => 0 <= el.getBoundingClientRect().top < 170"
                    ), f"{browser_name}: start must show the opening chapter, not the distant masthead"
                    assert page.locator("#chapterIntertitle").get_attribute("data-chapter") == "P"
                    assert "Ночь, когда" in page.locator("#intertitleLine").inner_text()
                    assert page.locator("#quickNav button").count() == 6
                    # Read-only handoff from the end of prose to choices and back.
                    assert page.locator("#readerBridge").count() == 1
                    assert page.locator(".choice-available .choice:not([disabled])").count() >= 1
                    assert page.locator(".choice-availability").count() == 1
                    assert page.locator(".choice-locked .choice:not([disabled])").count() == 0
                    assert page.locator(".choice-locked-toggle").count() == (
                        1 if page.locator(".choice-locked .choice").count() else 0
                    )
                    assert page.locator("#readerBridgeMarker").inner_text().endswith("P01")
                    assert page.locator("#lastDecisionReceipt").is_hidden()
                    assert "доступн" in page.locator("#readerBridgeSummary").inner_text()
                    first_save=page.evaluate("""() => localStorage.getItem(
                        window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""")
                    page.locator("#readerToChoices").click()
                    assert page.locator("#choicesPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: reader next must focus decisions"
                    assert page.locator("#sceneId").inner_text().startswith("P01")
                    page.locator("#choicesBackToText").click()
                    assert page.locator("#sceneText").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: reader back must focus current narration"
                    assert page.evaluate("""() => localStorage.getItem(
                        window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""") == first_save, (
                        "Reading controls must never rewrite a save or progress a scene"
                    )
                    assert page.locator("#pulseEvidence").inner_text() == "Улик: 0"
                    assert page.locator("#pulseProof").inner_text() == "Выводов: 0"
                    page.locator('#quickNav button[data-go="journal"]').click()
                    assert page.locator('button[data-tab="journal"]').get_attribute("aria-pressed") == "true"
                    assert page.locator('#quickNav [data-go="journal"]').get_attribute("aria-current") == "location"
                    assert page.locator("#sceneId").inner_text().startswith("P01")
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
                    assert page.locator("#heroPortrait").get_attribute("src").endswith("/assets/heroes/jack.webp")
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
                    assert page.locator("#sceneArtChapter").inner_text().startswith("СЦЕНА P01")
                    assert "Частная железнодорожная ветка" in page.locator("#sceneArtPlace").inner_text()
                    assert page.locator("#sceneArtwork").evaluate(
                        "(figure) => figure.querySelector('figcaption') !== null"
                    )
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.getBoundingClientRect().height / img.getBoundingClientRect().width > 1.20"
                    ), "Portrait artwork must not be stretched or flattened"
                    assert "Частная железнодорожная ветка" in page.locator(
                        "#sceneLocation"
                    ).text_content()
                    page.locator(".choice:not([disabled])").first.click()
                    assert page.locator("#storyPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: a decision must transfer focus to the next scene"
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.locator("#readerBridge").count() == 1
                    assert page.locator("#readerBridgeMarker").inner_text().endswith("P02")
                    assert page.locator("#storyPanel").evaluate(
                        "(el) => 0 <= el.getBoundingClientRect().top < 170"
                    ), f"{browser_name}: after a decision the next scene must be on screen"
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
                    assert page.locator("#sceneText .scene-spoken-line").nth(0).get_attribute("data-speaker") == "Мэйбл Кросс"
                    assert page.locator("#sceneText .scene-spoken-line").nth(1).get_attribute("data-speaker") == "Вы"
                    assert page.locator(".narrative-divider").is_visible()
                    assert page.locator(".choices-hint").count() == 1
                    assert page.locator("#choicesPanel .choice:not([disabled])").first.bounding_box()["height"] >= 48
                    page.screenshot(path=str(visual_dir/f"{browser_name}-dialogue.png"),full_page=True)
                    assert page.locator("#readScene").bounding_box()["height"] >= 44
                    page.locator("#readScene").click()
                    assert page.locator("#sceneText").evaluate(
                        "(el) => document.activeElement === el && "
                        "0 <= el.getBoundingClientRect().top < 170"
                    ), f"{browser_name}: reading shortcut must focus the actual text"
                    assert page.locator("#sceneId").inner_text().startswith("P02"), (
                        "Reading shortcut must not spend a story choice"
                    )
                    assert "К моему брату. Томми больше нет дома." in page.locator(
                        "#sceneText"
                    ).inner_text(), "Scene prose must keep original story words"
                    assert page.locator("#sceneText script").count() == 0
                    mabel_registered = page.evaluate("""() =>
                        window.BirminghamCase002ApprovedArt.manifest.npcPortraits.some(
                            e => e.id === 'mabel' && e.review === 'approved'
                        )""")
                    if mabel_registered:
                        page.wait_for_function(
                            "() => { const i = document.querySelector('#sceneCast img'); return i && i.complete && i.naturalWidth >= 500 && i.naturalHeight >= 600; }",
                            timeout=8000
                        )
                        assert page.locator("#sceneCast img").count() == 1
                        assert page.locator("#sceneCast img").evaluate(
                            "(img) => img.currentSrc.endsWith('/case002-mabel-portrait.webp')"
                        ), "P02 must display the approved Mabel portrait"
                        assert page.locator("#sceneCast .scene-participant-monogram").is_hidden()
                    else:
                        assert page.locator("#sceneCast img").count() == 0, (
                            "Unapproved Mabel portrait must not be substituted"
                        )
                    assert page.locator("#saveStatus").inner_text().startswith("Автосохранение")
                    # Starting a new attempt creates a save during play, but the
                    # launch screen's initial resume button was disabled. Going
                    # back must refresh it without reloading Safari or changing
                    # the current scene/progress.
                    page.locator("#backToLaunch").click()
                    assert page.locator("#launch").is_visible()
                    assert page.locator("#game").is_hidden()
                    assert page.locator('#heroGallery .hero-card[aria-pressed="true"]').evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: returning to launch must focus the active hero card"
                    assert page.locator("#resume").is_enabled(), (
                        f"{browser_name}: resume must activate on returning to hero selection"
                    )
                    assert page.locator('.hero-card[data-hero="jack"] .hero-save-badge').is_visible()
                    assert page.locator('.hero-card[data-hero="finn"] .hero-save-badge').is_hidden()
                    page.locator('.hero-card[data-hero="finn"]').click()
                    assert page.locator("#resume").is_hidden()
                    assert "Финн О’Коннор" in page.locator("#selectedHeroStatus").inner_text()
                    page.locator('.hero-card[data-hero="jack"]').click()
                    assert page.locator("#resume").is_visible()
                    ensure_selection(page)
                    page.locator("#resume").click()
                    assert page.locator("#storyPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: resuming a save must focus the story landmark"
                    assert page.locator("#sceneId").inner_text().startswith("P02"), (
                        "Returning to hero selection must not discard the last scene"
                    )
                    page.reload(wait_until="load")
                    assert page.locator("#resume").is_enabled()
                    ensure_selection(page)
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02"), "save didn't reload"
                    page.locator(".choice:not([disabled])").first.click()  # A01
                    assert page.locator("#sceneId").inner_text().startswith("A01")
                    assert page.locator(".choice-available .choice:not([disabled])").count() >= 1
                    # Show reasons only on request. Inspect visibility, touch
                    # accessibility and save integrity without spending a choice.
                    blocked=page.locator(".choice-locked .choice")
                    if blocked.count():
                        toggle=page.locator(".choice-locked-toggle")
                        assert toggle.get_attribute("aria-expanded") == "false"
                        assert page.locator("#lockedChoices").is_hidden()
                        previous=page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""")
                        toggle.click()
                        assert toggle.get_attribute("aria-expanded") == "true"
                        assert page.locator("#lockedChoices").is_visible()
                        assert blocked.first.is_disabled()
                        assert blocked.first.locator(".lock-reason").count() == 1
                        toggle.click()
                        assert page.locator("#lockedChoices").is_hidden()
                        assert page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""") == previous
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
                    assert page.locator("#chapterIntertitle").evaluate(
                        "(el) => 0 <= el.getBoundingClientRect().top < 170"
                    ), f"{browser_name}: act transition must preserve chapter intertitle"
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
                    ensure_selection(form_page)
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
                    page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.naturalWidth === 720 && el.naturalHeight === 900 && "
                        "el.currentSrc.endsWith('/case002-a03-scene--mobile.webp')"
                    ), f"{browser_name}: A03 must show its own approved phone artwork"
                    page.locator(".choice:not([disabled])").first.click()  # A05
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    assert page.locator("#game").get_attribute("data-art-scene") == "A05"
                    page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert page.locator("#sceneArtworkImage").evaluate(
                        "(el) => el.naturalWidth === 720 && el.naturalHeight === 900 && "
                        "el.currentSrc.endsWith('/case002-a05-scene--mobile.webp')"
                    ), f"{browser_name}: A05 old ticket must show its own approved phone artwork"
                    assert "Старинный билет Курзон-стрит" in page.locator("#notice").inner_text()
                    assert page.locator("#storyPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: new evidence must not strand focus on a deleted choice"
                    assert page.locator("#noticeJump").is_visible()
                    assert "УЛИКУ" in page.locator("#noticeJump").inner_text()
                    assert page.locator("#lastDecisionReceipt").is_visible()
                    assert page.locator("#lastDecisionReceipt").get_attribute("data-scene-id") == "A05"
                    assert page.locator("#lastDecisionToggle").get_attribute("aria-expanded") == "false"
                    assert page.locator("#pulseEvidence").inner_text() == "Улик: 1"
                    clue_jump=page.locator('#sceneFinds .scene-finds-link[data-evidence-id="old_excursion_ticket"]')
                    assert clue_jump.count() == 1 and clue_jump.is_visible()
                    assert "Старинный билет" in clue_jump.inner_text()
                    assert page.locator('#quickNav [data-go="evidence"]').get_attribute("data-unread") == "true"
                    assert "1 новая улика" in page.locator('#quickNav [data-go="evidence"]').get_attribute("aria-label")
                    assert page.locator("#toolContent li").count() >= 1
                    # Closing the floating receipt must not erase the persistent,
                    # earned-only clue shortcut in the scene.
                    page.locator("#noticeDismiss").click()
                    assert page.locator("#notice").is_hidden()
                    assert page.locator("#lastDecisionReceipt").is_visible()
                    previous_save=page.evaluate("""() => localStorage.getItem(
                        window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""")
                    page.locator("#lastDecisionToggle").click()
                    assert page.locator("#lastDecisionToggle").get_attribute("aria-expanded") == "true"
                    assert "Старинный билет" in page.locator("#lastDecisionDetails").inner_text()
                    assert page.locator("#lastDecisionDetails .last-decision-open").is_visible()
                    page.locator("#lastDecisionToggle").click()
                    assert page.locator("#lastDecisionDetails").is_hidden()
                    assert page.evaluate("""() => localStorage.getItem(
                        window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""") == previous_save
                    assert clue_jump.is_visible()
                    clue_jump.click()
                    assert page.locator("#sceneFinds").is_hidden()
                    assert page.locator('button[data-tab="evidence"]').get_attribute("aria-pressed") == "true"
                    assert page.locator('#quickNav [data-go="evidence"]').get_attribute("data-unread") == "false"
                    assert page.locator('#quickNav [data-go="evidence"]').get_attribute("aria-current") == "location"
                    assert page.locator(
                        '.evidence-card[data-evidence-id="old_excursion_ticket"]'
                    ).evaluate("(el) => document.activeElement === el"), (
                        "New evidence must receive keyboard focus after using scene shortcut"
                    )
                    assert page.locator("#sceneId").inner_text().startswith("A05")
                    # A collected clue can be sent straight to the comparison wall.
                    page.locator('.evidence-card[data-evidence-id="old_excursion_ticket"] .evidence-to-board').click()
                    assert page.locator('button[data-tab="deductions"]').get_attribute("aria-pressed") == "true"
                    assert page.locator('.pair-item[data-evidence-id="old_excursion_ticket"]').get_attribute("aria-pressed") == "true"
                    assert "Старинный билет" in page.locator(".pair-connection").inner_text()
                    # Return to dossier without advancing the case.
                    page.locator('button[data-tab="evidence"]').click()
                    assert page.locator('button[data-tab="evidence"]').evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: switching dossier tabs must retain focus on the selected tab"
                    assert page.locator("#caseTools").evaluate(
                        "(el) => el.getBoundingClientRect().top < 540"
                    ), f"{browser_name}: dossier tabs must return to top of the selected section"
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
                    assert page.locator(".people-dossier-gallery .person-entry").count() >= 3
                    mabel_card=page.locator('.person-entry[data-person="mabel"]')
                    assert mabel_card.count() == 1
                    assert mabel_card.locator(".person-portrait").count() == 1
                    assert mabel_card.locator(".person-portrait").get_attribute("loading") == "eager", (
                        f"{browser_name}: a hidden lazy portrait cannot reliably appear on iPhone"
                    )
                    mabel_card.locator(".person-portrait").evaluate("img => img.decode()")
                    assert mabel_card.locator(".person-portrait").evaluate(
                        "img => img.naturalWidth >= 500 && img.naturalHeight >= 600"
                    ), f"{browser_name}: approved Mabel portrait missing from dossier"
                    assert mabel_card.locator(".person-monogram").is_hidden()
                    assert page.locator('.person-entry[data-person="tommy"]').count() == 0
                    page.screenshot(path=str(visual_dir/f"{browser_name}-people.png"),full_page=True)
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
                    assert page.locator(".case-journal .journal-event").count() >= 1
                    assert page.locator('.journal-event[data-scene="A05"]').count() == 1
                    assert "Старинный билет" in page.locator('.journal-event[data-scene="A05"]').inner_text()
                    assert page.locator(".journal-event-note[data-kind='evidence']").count() >= 1
                    page.screenshot(path=str(visual_dir/f"{browser_name}-journal.png"),full_page=True)
                    assert page.locator(".case-journal").evaluate(
                        "(el) => getComputedStyle(el).overflowY === 'visible'"
                    ), f"{browser_name}: case journal must use the page scroll, not a nested box"
                    page.reload(wait_until="load")
                    ensure_selection(page)
                    page.locator("#resume").click()
                    page.locator('button[data-tab="journal"]').click()
                    assert "Сцена A05" in page.locator("#toolContent").inner_text(), (
                        "Chronicle entries must survive Safari/Chromium reloads"
                    )
                    for width in (320, 360, 390, 430):
                        page.set_viewport_size({"width": width, "height": 790})
                        nav = page.locator("#quickNav").bounding_box()
                        assert nav and nav["width"] <= width + 1
                        assert nav["y"] + nav["height"] <= 791, (
                            f"{browser_name}: bottom navigation escapes phone viewport"
                        )
                        expected_columns = 3 if width < 360 else 6
                        columns = page.locator("#quickNav").evaluate(
                            "el => getComputedStyle(el).gridTemplateColumns.split(' ').length"
                        )
                        assert columns == expected_columns, (
                            f"{browser_name}: {width}px dock should have {expected_columns} columns, got {columns}"
                        )
                        assert page.locator("#notice").evaluate("""el => {
                            const nav = document.querySelector('#quickNav');
                            return parseFloat(getComputedStyle(el).bottom) >=
                                   nav.getBoundingClientRect().height + 8;
                        }"""), f"{browser_name}: {width}px receipt must clear mobile dock"
                        for navbutton in page.locator("#quickNav button").all():
                            assert navbutton.bounding_box()["height"] >= 44
                            font_size = navbutton.evaluate(
                                "(el) => parseFloat(getComputedStyle(el).fontSize)"
                            )
                            assert font_size >= 11.15, (
                                f"{browser_name}: {width}px quick navigation text too small ({font_size})"
                            )
                            label_metrics = navbutton.evaluate("""el => {
                                const r = document.createRange();
                                r.selectNodeContents(el);
                                return {label: el.innerText, count:r.getClientRects().length,
                                  widths:[...r.getClientRects()].map(x => x.width),
                                  buttonWidth:el.getBoundingClientRect().width};
                            }""")
                            if label_metrics["count"] > 1 and width == 320:
                                page.screenshot(path=str(visual_dir/f"{browser_name}-dock-320.png"))
                            assert label_metrics["count"] <= 1, (
                                f"{browser_name}: {width}px quick navigation wrap: {label_metrics}"
                            )
                        assert page.locator("#readerToChoices").bounding_box()["height"] >= 44, (
                            f"{browser_name}: reader next must be touch-sized at {width}px"
                        )
                        assert page.locator("#choicesBackToText").bounding_box()["height"] >= 44
                        if page.locator(".choice-locked-toggle").count():
                            assert page.locator(".choice-locked-toggle").bounding_box()["height"] >= 44
                        for tabbutton in page.locator(".tool-tab").all():
                            assert tabbutton.evaluate(
                                "(el) => parseFloat(getComputedStyle(el).fontSize)"
                            ) >= 11.15, f"{browser_name}: {width}px dossier tabs unreadable"
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
                    # A stale, detached choice dispatched twice cannot advance
                    # a story twice or replace the first valid action's notice.
                    double_ctx = browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=3,is_mobile=True,has_touch=True
                    )
                    double_page = double_ctx.new_page()
                    double_page.goto(address, wait_until="load")
                    ensure_selection(double_page)
                    double_page.locator("#begin").click()
                    double_page.locator('button.choice[data-to="P02"]').evaluate(
                        "(el) => {el.click();el.click();}"
                    )
                    assert double_page.locator("#sceneId").inner_text().startswith("P02")
                    assert double_page.evaluate("""() => JSON.parse(localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                    )).history.length""") == 1, (
                        f"{browser_name}: repeated old button spent two transitions"
                    )
                    assert "Действие не применено" not in (
                        double_page.locator("#notice").inner_text()
                    ), f"{browser_name}: duplicate click produced a false error"
                    double_ctx.close()
                    # Two Safari tabs sharing a hero: the older tab must not
                    # overwrite the newer tab's primary storage slot.
                    tabs_ctx = browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=3,is_mobile=True,has_touch=True
                    )
                    first_tab = tabs_ctx.new_page()
                    first_tab.goto(address, wait_until="load")
                    ensure_selection(first_tab)
                    first_tab.locator("#begin").click()
                    first_tab.locator('button.choice[data-to="P02"]').click()
                    second_tab = tabs_ctx.new_page()
                    second_tab.goto(address, wait_until="load")
                    ensure_selection(second_tab)
                    second_tab.locator("#resume").click()
                    assert second_tab.locator("#sceneId").inner_text().startswith("P02")
                    first_tab.locator('button.choice[data-to="A01"]').click()
                    live_save = first_tab.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                    )""")
                    assert json.loads(live_save)["node"] == "A01"
                    second_tab.locator('button.choice[data-to="A01"]').click()
                    assert second_tab.locator("#sceneId").inner_text().startswith("P02"), (
                        f"{browser_name}: stale Safari tab incorrectly advanced"
                    )
                    assert "обновилось в другой вкладке" in (
                        second_tab.locator("#notice").inner_text()
                    ), f"{browser_name}: stale tab did not explain the conflict"
                    assert second_tab.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                    )""") == live_save, f"{browser_name}: stale tab overwrote new progress"
                    assert second_tab.locator("#noticeExit").is_visible(), (
                        f"{browser_name}: stale-save conflict needs a visible exit above fixed panels"
                    )
                    assert second_tab.locator("#noticeExit").bounding_box()["height"] >= 44
                    second_tab.locator("#noticeExit").click()
                    assert second_tab.locator("#notice").is_hidden()
                    assert second_tab.locator("#launch").is_visible()
                    ensure_selection(second_tab)
                    second_tab.locator("#resume").click()
                    assert second_tab.locator("#sceneId").inner_text().startswith("A01"), (
                        f"{browser_name}: stale tab cannot reopen latest saved scene"
                    )
                    tabs_ctx.close()
                    # Mock multiple post-choice receipts in a separate tab only.
                    # This tests the notice UI without forging any game outcome.
                    receipt_ctx = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    receipt_page = receipt_ctx.new_page()
                    receipt_page.goto(address, wait_until="load")
                    receipt_page.evaluate("""() => {
                        window.BirminghamCase002Consequences.receipts = () => [
                            {kind:'witness',text:'Ада Уэбб: под защитой.'},
                            {kind:'evidence',text:'Новая улика: журнал стрелочника.'},
                            {kind:'consequence',text:'Проверена схема частного отвода.'},
                            {kind:'final',text:'Сохранена запись о принятом решении.'}
                        ];
                    }""")
                    ensure_selection(receipt_page)
                    receipt_page.locator("#begin").click()
                    receipt_page.locator('button.choice[data-to="P02"]').click()
                    assert receipt_page.locator("#noticeExpand").is_visible(), (
                        f"{browser_name}: four consequences need an expand control"
                    )
                    assert receipt_page.locator("#lastDecisionReceipt").is_visible()
                    assert "4 изменения" in receipt_page.locator("#lastDecisionToggle").inner_text()
                    assert receipt_page.locator("#lastDecisionDetails").is_hidden()
                    assert receipt_page.locator("#noticeExpand").get_attribute("aria-expanded") == "false"
                    assert "Откройте подробности" in receipt_page.locator("#noticeContent").inner_text()
                    receipt_page.locator("#noticeExpand").click()
                    assert receipt_page.locator("#noticeExpand").get_attribute("aria-expanded") == "true"
                    for phrase in (
                        "Ада Уэбб", "журнал стрелочника",
                        "схема частного отвода", "принятом решении"
                    ):
                        assert phrase in receipt_page.locator("#noticeContent").inner_text(), (
                            f"{browser_name}: expanded notice lost consequence {phrase}"
                        )
                    receipt_page.locator("#noticeExpand").click()
                    assert receipt_page.locator("#noticeExpand").get_attribute("aria-expanded") == "false"
                    assert "Откройте подробности" in receipt_page.locator("#noticeContent").inner_text()
                    receipt_page.locator("#noticeDismiss").click()
                    assert receipt_page.locator("#notice").is_hidden()
                    assert receipt_page.locator("#storyPanel").evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: dismissing a receipt must restore live focus"
                    receipt_page.locator("#lastDecisionToggle").click()
                    for phrase in ("Ада Уэбб","журнал стрелочника",
                                   "схема частного отвода","принятом решении"):
                        assert phrase in receipt_page.locator("#lastDecisionDetails").inner_text(), (
                            f"{browser_name}: dismissed toast must leave all four true consequences accessible"
                        )
                    # A second choice creates a new receipt; manually switching
                    # the dossier must dismiss it instead of obscuring the tab.
                    receipt_page.locator('button.choice[data-to="A01"]').click()
                    assert receipt_page.locator("#notice").is_visible()
                    assert receipt_page.locator("#notice").evaluate(
                        "(el) => getComputedStyle(el).pointerEvents === 'none'"
                    ), f"{browser_name}: floating decision receipt captures navigation taps"
                    assert receipt_page.locator("#noticeDismiss").evaluate(
                        "(el) => getComputedStyle(el).pointerEvents === 'auto'"
                    ), f"{browser_name}: receipt dismissal must stay clickable"
                    receipt_page.locator('button[data-tab="witnesses"]').click()
                    assert receipt_page.locator("#notice").is_hidden()
                    assert receipt_page.locator('button[data-tab="witnesses"]').get_attribute(
                        "aria-pressed"
                    ) == "true"
                    assert receipt_page.locator('button[data-tab="witnesses"]').evaluate(
                        "(el) => document.activeElement === el"
                    ), f"{browser_name}: manual dossier switch must preserve tab focus"
                    receipt_ctx.close()
                    # Portrait-only rule: a rotated phone shows a pause screen,
                    # never horizontal artwork or playable landscape controls.
                    rotate_ctx = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    rotate_page = rotate_ctx.new_page()
                    rotate_errors = []
                    rotate_page.on("pageerror", lambda err: rotate_errors.append(str(err)))
                    rotate_page.goto(address, wait_until="load")
                    ensure_selection(rotate_page)
                    rotate_page.locator("#begin").click()
                    rotate_page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert rotate_page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('/case002-p01-scene--mobile.webp')"
                    ), f"{browser_name}: P01 must use the vertical master"
                    initial_scene = rotate_page.locator("#sceneId").inner_text()
                    initial_choices = rotate_page.locator("button.choice").count()
                    rotate_page.set_viewport_size({"width": 844, "height": 390})
                    assert rotate_page.locator("#portraitGate").is_visible(), (
                        f"{browser_name}: phone landscape must show the portrait-only gate"
                    )
                    assert rotate_page.locator("#app").evaluate(
                        "(el) => getComputedStyle(el).visibility === 'hidden'"
                    ), f"{browser_name}: game is still playable in landscape"
                    assert "вертикальное положение" in rotate_page.locator(
                        "#portraitGate"
                    ).inner_text()
                    assert rotate_page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('/case002-p01-scene--mobile.webp')"
                    ), f"{browser_name}: rotating must not load retired horizontal artwork"
                    rotate_page.set_viewport_size({"width": 390, "height": 844})
                    assert rotate_page.locator("#portraitGate").is_hidden(), (
                        f"{browser_name}: portrait gate must dismiss on returning upright"
                    )
                    assert rotate_page.locator("#storyPanel").is_visible()
                    assert rotate_page.locator("#sceneId").inner_text() == initial_scene
                    assert rotate_page.locator("button.choice").count() == initial_choices
                    assert rotate_page.locator("#sceneArtwork").get_attribute(
                        "data-portrait"
                    ) == "true"
                    assert rotate_page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('/case002-p01-scene--mobile.webp')"
                    )
                    assert not rotate_errors, (
                        f"{browser_name}: orientation gate caused JS errors: {rotate_errors}"
                    )
                    rotate_ctx.close()
                    # Even when an old landscape master exists, a broken portrait
                    # must fail closed rather than silently substitute wide art.
                    art_ctx = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=3, is_mobile=True, has_touch=True
                    )
                    art_page = art_ctx.new_page()
                    art_page.goto(address, wait_until="load")
                    art_page.evaluate("""() => {
                        const gate = window.BirminghamCase002ApprovedArt;
                        const old = gate.resolveScene;
                        gate.resolveScene = stage => stage.sceneId === 'P01' ? {
                          sceneId: 'P01', variantKey: 'default',
                          src: '../../assets/case002/scenes/case002-p01-scene.webp',
                          mobileSrc: '../../assets/case002/scenes/portrait-policy-test-missing.webp',
                          alt: 'Проверка политики портретного арта'
                        } : old(stage);
                    }""")
                    ensure_selection(art_page)
                    art_page.locator("#begin").click()
                    art_page.wait_for_function("""() =>
                        document.querySelector('#sceneArtworkImage').complete
                    """, timeout=6000)
                    art_page.wait_for_function(
                        "() => !document.querySelector('#artRecovery').hidden",
                        timeout=6000
                    )
                    assert art_page.locator("#sceneArtwork").is_hidden(), (
                        f"{browser_name}: missing portrait wrongly displayed landscape"
                    )
                    assert art_page.locator("#artRetry").is_visible(), (
                        f"{browser_name}: failed portrait must have a safe retry"
                    )
                    assert "Иллюстрация временно недоступна" in (
                        art_page.locator("#artRecovery").inner_text()
                    )
                    assert art_page.locator("#game").get_attribute(
                        "data-art-fallback"
                    ) == "false", f"{browser_name}: retired landscape fallback is active"
                    assert art_page.locator("#sceneArtworkImage").get_attribute(
                        "src"
                    ).endswith('/portrait-policy-test-missing.webp')
                    failed_scene = art_page.locator("#sceneId").inner_text()
                    failed_save = art_page.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""")
                    art_page.locator("#artRetry").click()
                    art_page.wait_for_function(
                        "() => !document.querySelector('#artRecovery').hidden",
                        timeout=6000
                    )
                    assert art_page.locator("#sceneId").inner_text() == failed_scene
                    assert art_page.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""") == failed_save, (
                        f"{browser_name}: art retry changed the game save"
                    )
                    # A new scene and a resumed save must clear the old error:
                    # a failure in P01 must not appear over approved P02 art.
                    art_page.locator('button.choice[data-to="P02"]').click()
                    assert art_page.locator("#sceneId").inner_text().startswith("P02")
                    assert art_page.locator("#artRecovery").is_hidden(), (
                        f"{browser_name}: prior scene art error leaked into P02"
                    )
                    art_page.wait_for_function("""() =>
                        document.querySelector('#game').dataset.artVerified === 'true'
                    """, timeout=8000)
                    art_page.reload(wait_until="load")
                    ensure_selection(art_page)
                    art_page.locator("#resume").click()
                    assert art_page.locator("#sceneId").inner_text().startswith("P02")
                    assert art_page.locator("#artRecovery").is_hidden(), (
                        f"{browser_name}: prior scene art error survived save reload"
                    )
                    art_ctx.close()
                    # A single transient image failure should recover using
                    # the SAME approved portrait, not a landscape replacement.
                    retry_ctx = browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=3,is_mobile=True,has_touch=True
                    )
                    retry_page = retry_ctx.new_page()
                    attempts = [0]
                    def intercept_portrait(route):
                        attempts[0] += 1
                        if attempts[0] == 1:
                            route.abort()
                        else:
                            route.continue_()
                    retry_page.route("**/case002-p01-scene--mobile.webp", intercept_portrait)
                    retry_page.goto(address,wait_until="load")
                    ensure_selection(retry_page)
                    retry_page.locator("#begin").click()
                    retry_page.locator("#artRetry").wait_for(state="visible",timeout=8000)
                    assert retry_page.locator("#sceneArtwork").is_hidden()
                    retry_scene = retry_page.locator("#sceneId").inner_text()
                    retry_save = retry_page.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""")
                    retry_page.locator("#artRetry").click()
                    retry_page.wait_for_function(
                        "() => document.querySelector('#game').dataset.artVerified === 'true'",
                        timeout=8000
                    )
                    assert attempts[0] >= 2
                    assert retry_page.locator("#sceneArtwork").is_visible()
                    assert retry_page.locator("#artRecovery").is_hidden()
                    assert retry_page.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('/case002-p01-scene--mobile.webp')"
                    )
                    assert retry_page.locator("#sceneId").inner_text() == retry_scene
                    assert retry_page.evaluate("""() => localStorage.getItem(
                      window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""") == retry_save
                    retry_ctx.close()
                    # Desktop preview stays vertical, without forcing desktop
                    # reviewers into the phone-orientation gate.
                    desk_ctx = browser.new_context(viewport={"width":1024,"height":768})
                    desk = desk_ctx.new_page()
                    desk.goto(address, wait_until="load")
                    ensure_selection(desk)
                    desk.locator("#begin").click()
                    desk.wait_for_function("""() =>
                        document.querySelector('#game').dataset.artVerified === 'true'
                    """, timeout=8000)
                    assert desk.locator("#portraitGate").is_hidden()
                    assert desk.locator("#sceneArtwork").get_attribute("data-portrait") == "true"
                    assert desk.locator("#sceneArtworkImage").evaluate(
                        "(img) => img.currentSrc.endsWith('/case002-p01-scene--mobile.webp')"
                    ), f"{browser_name}: desktop preview must retain portrait scene artwork"
                    assert desk.locator(".app-shell").bounding_box()["width"] <= 521
                    desk_ctx.close()
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
                    ensure_selection(tg_page)
                    tg_page.locator("#begin").click()
                    assert tg_page.locator("#quickNav").is_visible()
                    shell_top = tg_page.locator(".app-shell").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).paddingTop)"
                    )
                    nav_bottom_padding = tg_page.locator("#quickNav").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).paddingBottom)"
                    )
                    css_diag = tg_page.evaluate("""() => ({
                        tag:document.documentElement.getAttribute("data-case002-telegram"),
                        inlineTop:document.documentElement.style.getPropertyValue("--case002-safe-top"),
                        computedTop:getComputedStyle(document.documentElement).getPropertyValue("--case002-safe-top"),
                        padding:getComputedStyle(document.querySelector(".app-shell")).paddingTop,
                        width:innerWidth, viewport:document.querySelector('meta[name="viewport"]')?.content
                    })""")
                    assert shell_top >= 64, f"{browser_name}: Telegram header overlaps case: {css_diag}"
                    assert nav_bottom_padding >= 34, f"{browser_name}: Telegram home bar overlaps commands"
                    for selector in ("#storyPanel","#choicesPanel","#caseTools",
                                     "#chapterIntertitle","#sceneText"):
                        margin = tg_page.locator(selector).evaluate(
                            "(el) => parseFloat(getComputedStyle(el).scrollMarginTop)"
                        )
                        assert margin >= 82, (
                            f"{browser_name}: Telegram top inset omitted from {selector}: {margin}"
                        )
                    tg_page.locator("#readScene").click()
                    assert tg_page.locator("#sceneText").evaluate(
                        "(el) => el.getBoundingClientRect().top >= 70"
                    ), f"{browser_name}: reading jump hides text under Telegram top chrome"
                    updated_top = tg_page.evaluate("""() => {
                        window.Telegram.WebApp.contentSafeAreaInset.top = 72;
                        window.__case002TelegramHandlers.contentSafeAreaChanged();
                        return document.documentElement.style.getPropertyValue('--case002-safe-top');
                    }""")
                    assert updated_top == "96px", f"{browser_name}: safe-area event is stale"
                    new_padding = tg_page.locator(".app-shell").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).paddingTop)"
                    )
                    assert new_padding >= 96, f"{browser_name}: safe-area change did not reach rendered layout"
                    new_margin = tg_page.locator("#sceneText").evaluate(
                        "(el) => parseFloat(getComputedStyle(el).scrollMarginTop)"
                    )
                    assert new_margin >= 114, (
                        f"{browser_name}: reading jump not updated after Telegram header grew"
                    )
                    tg_page.locator("#readScene").click()
                    assert tg_page.locator("#sceneText").evaluate(
                        "(el) => el.getBoundingClientRect().top >= 106"
                    ), f"{browser_name}: dynamically larger Telegram header clips scene text"
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
                        ensure_selection(full_page)
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
                        if full_page.locator(".journal-show-all").is_visible():
                            older=full_page.locator(".journal-event[hidden]")
                            assert older.count() > 0
                            before_expand=older.count()
                            full_page.locator(".journal-show-all").click()
                            assert full_page.locator(".journal-show-all").is_hidden()
                            assert full_page.locator(".journal-event[hidden]").count() == 0
                            assert full_page.locator(".journal-event").count() >= before_expand + 6
                            assert full_page.locator(".journal-event:focus").count() == 1
                            full_page.locator('button[data-tab="deductions"]').click()
                            full_page.locator('#quickNav button[data-go="journal"]').click()
                            assert full_page.locator(".journal-event[hidden]").count() == 0, (
                                "Reopening the journal must preserve expanded earlier records"
                            )
                            assert full_page.locator(".journal-show-all").count() == 0
                        assert full_page.locator(".case-journal").evaluate(
                            "(el) => getComputedStyle(el).overflowY === 'visible' && "
                            "el.scrollHeight <= el.clientHeight + 1"
                        ), "A long journal must not trap iPhone scrolling inside a 360px box"
                        full_page.reload(wait_until="load")
                        ensure_selection(full_page)
                        full_page.locator("#resume").click()
                        assert full_page.locator("#sceneId").inner_text().startswith("F09")
                        assert full_page.locator("button.choice").count() == 1
                        full_page.locator('button[data-tab="deductions"]').click()
                        deductions = full_page.locator(".deduction-card")
                        assert deductions.count() >= 1, "Investigated case has no earned deductions"
                        assert full_page.locator(".pair-board .pair-item").count() >= 2
                        initial_save=full_page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""")
                        full_page.locator(".pair-board .pair-item").first.click()
                        assert full_page.locator('.pair-item[aria-pressed="true"]').count() == 1
                        assert full_page.locator(".pair-item-hint").count() == 1
                        assert full_page.locator(".pair-connection .is-filled").count() == 1
                        full_page.locator('.pair-item[aria-pressed="false"]').first.click()
                        assert full_page.locator(".pair-result").is_visible()
                        assert full_page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX + 'jack')""") == initial_save, (
                            "Evidence comparison must not modify the engine save"
                        )
                        full_page.screenshot(path=str(visual_dir/"chromium-deduction.png"),full_page=True)
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

                        source, target, action = route[-1]
                        assert source == "F09" and target == "Z02"
                        last_choice = full_page.locator(
                            f'button.choice[data-to="{target}"][data-action="{action}"]'
                        )
                        assert last_choice.count() == 1 and last_choice.is_enabled()
                        saved_f09 = full_page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX + 'jack'
                        )""")
                        assert saved_f09 and json.loads(saved_f09)["node"] == "F09"
                        last_choice.click()
                        assert full_page.locator("#sceneId").inner_text().startswith("Z02")
                        assert full_page.locator("#finalePanel").is_visible()
                        assert full_page.locator("#readerBridge").get_attribute("data-finished") == "true"
                        assert "ПОСМОТРЕТЬ ИТОГ" in full_page.locator("#readerToChoices").inner_text()
                        assert full_page.locator("#notice").is_hidden(), (
                            "Successful finale should not be obscured by a duplicate receipt"
                        )
                        assert full_page.locator("#finalePanel").get_attribute("data-ending") == "trainEscape"
                        assert "Люди без прошлого" in full_page.locator(".finale-title").inner_text()
                        assert full_page.locator(".finale-metric").count() == 3
                        assert full_page.locator(".finale-action").count() == 2
                        assert "СТАТУС АРХИВА" in full_page.locator("#finaleArchive").inner_text()
                        assert full_page.locator('#quickNav [data-go="choices"]').inner_text() == "ИТОГ"
                        assert full_page.locator("button.choice").count() == 0
                        full_page.wait_for_function(
                            "() => document.querySelector('#game').dataset.artVerified === 'true'",
                            timeout=8000,
                        )
                        variant = full_page.locator("#game").get_attribute("data-art-variant")
                        assert variant.startswith("evacuated-")
                        assert full_page.locator("#sceneArtwork").is_visible()
                        assert full_page.locator("#sceneArtworkImage").evaluate(
                            "(img) => img.naturalWidth === 720 && img.naturalHeight === 900"
                        )
                        assert full_page.locator("#sceneArtworkImage").evaluate(
                            "(img, v) => img.currentSrc.endsWith('case002-z02-scene--' + v + '--mobile.webp')",
                            variant,
                        ), f"Wrong ending art for Z02: {variant}"
                        assert "зарегистрированы в черновом архиве" in full_page.locator(
                            "#finaleArchive"
                        ).inner_text(), "Normal completion must verify actual archived outcome"
                        assert "зарегистрированы" not in full_page.locator(".finale-eyebrow").inner_text()
                        full_page.screenshot(path=str(visual_dir/"chromium-finale.png"),full_page=True)
                        archived_before=full_page.evaluate("""() => localStorage.getItem(
                            window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""")
                        full_page.locator(".finale-action.secondary").click()
                        assert full_page.locator('button[data-tab="journal"]').get_attribute("aria-pressed") == "true"
                        assert (
                            full_page.evaluate("""() => localStorage.getItem(
                                window.BirminghamCase002Engine.SAVE_PREFIX+'jack')""") == archived_before
                        ), "Finale journal navigation must not rewrite the ending"
                        assert not errors, f"Full-route browser errors: {errors}"
                        # Leaving a terminal view returns to hero selection, keeping
                        # the finished save and making resume possible.
                        full_page.locator(".finale-action:not(.secondary)").click()
                        assert full_page.locator("#launch").is_visible()
                        assert full_page.locator("#resume").is_visible()
                        assert full_page.locator("#game").is_hidden()
                        full_page.locator("#resume").click()
                        assert full_page.locator("#finalePanel").is_visible()
                        assert full_page.locator("#sceneId").inner_text().startswith("Z02")
                        # A damaged completion archive is not a rejected choice:
                        # the engine has already committed the final node first.
                        damaged_ctx = browser.new_context(
                            viewport={"width":390,"height":844},
                            device_scale_factor=3,is_mobile=True,has_touch=True
                        )
                        damaged_page = damaged_ctx.new_page()
                        damaged_page.goto(address, wait_until="load")
                        damaged_page.evaluate("""saved => {
                          const api=window.BirminghamCase002Engine;
                          localStorage.setItem(api.SAVE_PREFIX+'jack',saved);
                          localStorage.setItem(api.RECORD_KEY,'{damaged-json');
                        }""",saved_f09)
                        damaged_page.reload(wait_until="load")
                        ensure_selection(damaged_page)
                        damaged_page.locator("#resume").click()
                        damaged_page.locator('button.choice[data-to="Z02"]').click()
                        assert damaged_page.locator("#sceneId").inner_text().startswith("Z02"), (
                            "A post-commit archive error must not strand player on F09"
                        )
                        assert damaged_page.locator("#notice").is_visible()
                        assert "Решение принято" in damaged_page.locator("#notice").inner_text()
                        assert "Архив итогов или наград повреждён" in damaged_page.locator(
                            "#choiceList"
                        ).inner_text(), "Corrupt archive must not claim reward was granted"
                        assert damaged_page.locator("#finalePanel").is_visible()
                        assert "повреждён" in damaged_page.locator("#finaleArchive").inner_text()
                        assert "зарегистрированы" not in damaged_page.locator("#finaleArchive").inner_text()
                        assert json.loads(damaged_page.evaluate("""() => localStorage.getItem(
                          window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                        )"""))["node"] == "Z02", "Terminal scene must remain in primary save"
                        damaged_page.reload(wait_until="load")
                        ensure_selection(damaged_page)
                        damaged_page.locator("#resume").click()
                        assert damaged_page.locator("#sceneId").inner_text().startswith("Z02"), (
                            "Archive corruption must not prevent reopening a valid finished save"
                        )
                        assert "Расследование восстановлено из сохранения" in (
                            damaged_page.locator("#notice").inner_text()
                        ), "Recovered completed attempt must report unarchived result"
                        assert "повреждён" in damaged_page.locator("#finaleArchive").inner_text()
                        damaged_ctx.close()
                        # Safari privacy mode can deny localStorage entirely.
                        # A complete offline playthrough must not claim rewards.
                        private_ctx = browser.new_context(
                            viewport={"width":390,"height":844},
                            device_scale_factor=3,is_mobile=True,has_touch=True
                        )
                        private_page = private_ctx.new_page()
                        private_page.add_init_script("""(() => {
                          Object.defineProperty(window,'localStorage',{
                            configurable:true,
                            get(){throw new Error('Privacy storage unavailable');}
                          });
                        })();""")
                        private_page.goto(address, wait_until="load")
                        ensure_selection(private_page)
                        private_page.locator("#begin").click()
                        for src,to,act in route:
                            target_choice = private_page.locator(
                                f'button.choice[data-to="{to}"][data-action="{act}"]'
                            )
                            assert target_choice.count() == 1 and target_choice.is_enabled(), (
                                f"Private mode route unexpectedly blocked: {src} -> {to}"
                            )
                            target_choice.click()
                        assert private_page.locator("#sceneId").inner_text().startswith("Z02")
                        assert "Хранилище недоступно: итог и награда не записаны" in (
                            private_page.locator("#finaleArchive").inner_text()
                        ), "Private mode must not promise a persisted completion"
                        assert private_page.locator("#finalePanel").is_visible()
                        assert "сохранено" not in private_page.locator("#choicesHint").inner_text().lower()
                        private_ctx.close()
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
