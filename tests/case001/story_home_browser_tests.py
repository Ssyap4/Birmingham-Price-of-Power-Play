#!/usr/bin/env python3
"""Browser smoke tests for the story-first home, five districts and secondary modes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tests" / "case001" / "artifacts" / "story-home"
OUT.mkdir(parents=True, exist_ok=True)
ART = ROOT / "assets" / "cabinet" / "birmingham_cabinet_office_art.webp"
assert ART.is_file(), "Approved cabinet illustration is missing from the repository"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(1440, 900), (900, 800), (600, 850), (375, 812), (320, 700)]:
        page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto((ROOT / "index.html").as_uri(), wait_until="load")
        page.locator("#storyStart").wait_for(state="visible")
        art_loaded = page.evaluate("""async (src) => {
          const img = new Image();
          img.src = src;
          try { await img.decode(); } catch { return false; }
          return img.naturalWidth >= 800 && img.naturalHeight >= 600;
        }""", ART.as_uri())
        assert art_loaded, f"Cabinet artwork did not decode at {width}"
        assert any(name in page.locator(".cabinet-room").evaluate("(el) => getComputedStyle(el).backgroundImage") for name in ("cabinet-scene.webp", "birmingham_cabinet_office_art.webp", "approved-header.webp")), "Cabinet artwork not referenced by CSS"
        assert page.locator("#districtsCard").is_visible(), f"Campaign missing at {width}"
        assert page.locator("#profileCard").is_visible(), f"Dossier missing at {width}"
        assert page.locator("#home .cabinet-menu .cabinet-entry").count() == 5, f"Expected five illustrated cabinet entries at {width}"
        assert page.locator("#storyStart").get_attribute("aria-label") == "Достижения", f"Achievements accessible label missing at {width}"
        assert page.locator("#storyStart .cabinet-entry-copy").evaluate("(el) => getComputedStyle(el).display") == "none", f"Hidden DOM label overlaps illustrated artwork at {width}"
        assert page.locator('[data-mode="classic"]').count() == 1
        assert page.locator('#cabinetSettings').count() == 1
        # Allow entrance animation to settle before capturing the actual mobile menu.
        page.wait_for_timeout(900)
        if width <= 700 and height > width:
            alpha = page.locator('#home .cabinet-entry').evaluate_all("els => els.map(e => +getComputedStyle(e).opacity)")
            assert all(x >= .98 for x in alpha), f"Mobile cards still invisible after reveal: {alpha}"
        page.screenshot(path=str(OUT / f"home-{width}.png"), full_page=True)
        scene = page.locator("#home .cabinet-scene").bounding_box()
        menu = page.locator("#home .cabinet-menu").bounding_box()
        assert scene and menu, f"Cabinet composition missing at {width}"
        assert menu["x"] >= scene["x"] - 1, f"Menu outside cabinet at {width}"
        assert menu["x"] + menu["width"] <= scene["x"] + scene["width"] + 2, f"Menu overflows cabinet at {width}"
        # Prevent content clipping and sideways scrolling at each breakpoint.
        metrics = page.evaluate("""() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
          feature: document.querySelector('#districtsCard').getBoundingClientRect().width
        })""")
        assert metrics["scroll"] <= metrics["viewport"] + 2, f"Horizontal overflow at {width}: {metrics}"
        assert metrics["feature"] > 200, f"Campaign tile too narrow at {width}"
        page.locator("#storyStart").click()
        assert page.locator("#campaignAchievements").is_visible(), "Achievements must open their own page"
        assert page.locator("#campaignAchievements .campaign-award").count() == 18, "Curated campaign achievements missing"
        page.locator("#homeBtn").click()
        page.locator("#districtsCard").click()
        assert page.locator("#districts").is_visible(), f"Map did not open at {width}"
        for district in ["small-heath", "aston", "digbeth", "centre", "jewellery"]:
            pin = page.locator(f'.map-pin[data-district="{district}"]')
            pin.click()
            assert pin.get_attribute("aria-pressed") == "true", f"Pin {district} not selected"
            assert page.locator("#districtTitle").inner_text().strip(), f"Missing title for {district}"
        page.screenshot(path=str(OUT / f"districts-{width}.png"), full_page=True)
        page.locator("#districtBack").click()
        assert page.locator("#home").is_visible(), "Cannot return from map"
        page.locator('[data-mode="classic"]').click()
        assert page.locator("#choose").is_visible(), "Classic mode does not open"
        page.locator("#homeBtn").click()
        page.locator("#cabinetSettings").click()
        assert page.locator("#cabinetSettingsDialog").is_visible(), "Settings did not open"
        motion = page.locator("#cabinetReduceMotion")
        motion.check()
        assert page.locator("html").evaluate("(el) => el.classList.contains(\'cabinet-reduced-motion\')"), "Reduced motion setting did not apply"
        assert page.evaluate("localStorage.getItem(\'birmingham-reduce-motion\')") == "true", "Setting was not saved"
        page.locator("#cabinetSettingsDialog button[type=submit]").click()
        assert not page.locator("#cabinetSettingsDialog").is_visible(), "Settings did not close"
        page.reload(wait_until="load")
        assert page.locator("html").evaluate("(el) => el.classList.contains(\'cabinet-reduced-motion\')"), "Setting was not restored"
        page.locator("#cabinetSettings").click()
        page.locator("#cabinetReduceMotion").uncheck()
        page.locator("#cabinetSettingsDialog button[type=submit]").click()
        page.locator("#profileCard").click()
        assert page.locator("#campaignDossiers").is_visible(), "Character dossier does not open"
        assert page.locator("#campaignDossiers .campaign-card").count() == 5, "Expected five hero dossiers"
        page.locator("#homeBtn").click()
        assert page.locator("#home").is_visible(), "Cannot return from dossier"
        page.locator("#profileCard").click()
        page.locator("#campaignDossiers .campaign-tabs [data-open-section=campaignHistory]").click()
        assert page.locator("#campaignHistory").is_visible(), "Campaign history page did not open"
        assert page.locator("#campaignHistory .campaign-summary").count() == 1, "History summary missing"
        page.locator("#homeBtn").click()
        assert not errors, f"JavaScript errors at {width}: {errors}"
        print(f"OK: {width}x{height} — home, five districts, modes, dossier, no overflow")
        page.close()
    # Real mobile contexts: portrait is playable without a rotation overlay.
    for width, height in [(375, 812), (812, 375), (667, 375), (844, 390)]:
        context = browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=1, is_mobile=True, has_touch=True,
        )
        page = context.new_page()
        page.goto((ROOT / "index.html").as_uri(), wait_until="load")
        page.wait_for_function("document.querySelector('#home').classList.contains('cabinet-art-ready')")
        assert page.locator("#cabinetRotatePrompt").count() == 0, "Obsolete rotation prompt present"
        if width > height:
            page.screenshot(path=str(OUT / f"home-landscape-{width}.png"), full_page=True)
            scene = page.locator("#home .cabinet-scene").bounding_box()
            menu = page.locator("#home .cabinet-menu").bounding_box()
            assert scene and menu and menu["x"] > scene["x"] + scene["width"] * .5, "Landscape menu not on right"
            for entry in page.locator("#home .cabinet-entry").all():
                assert entry.is_visible(), "Landscape entry hidden"
                box = entry.bounding_box()
                assert box and box["y"] >= menu["y"] - 1 and box["y"] + box["height"] <= menu["y"] + menu["height"] + 2, "Landscape entry clipped"
            page.locator("#districtsCard").click()
            assert page.locator("#districts").is_visible(), "Landscape campaign navigation failed"
            page.locator("#homeBtn").click()
            page.locator('[data-mode="classic"]').click()
            assert page.locator("#choose").is_visible(), "Landscape trials navigation failed"
            page.locator("#homeBtn").click()
            page.locator("#cabinetSettings").click()
            assert page.locator("#cabinetSettingsDialog").is_visible(), "Landscape settings failed"
            page.locator("#cabinetSettingsDialog button[type=submit]").click()
            page.locator("#profileCard").click()
            assert page.locator("#campaignDossiers").is_visible(), "Landscape dossier failed"
            page.locator("#homeBtn").click()
            assert page.locator("#home").is_visible(), "Landscape return to home failed"
        else:
            page.screenshot(path=str(OUT / "home-portrait-mobile.png"), full_page=True)
        context.close()
    browser.close()
