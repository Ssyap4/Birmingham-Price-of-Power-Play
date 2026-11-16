#!/usr/bin/env python3
"""Strict HTTPS smoke for the separate Vercel criminal preview and version-pinned art CDN."""
import os, json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get("CRIMINAL_PREVIEW_URL", "").rstrip("/")
assert URL.startswith("https://") and URL.endswith(".vercel.app"), "Expected an isolated HTTPS Vercel URL"
OUT = Path("work/criminal/remote")
OUT.mkdir(parents=True, exist_ok=True)
report = []

def tap(page, selector):
    item = page.locator(selector).first
    item.scroll_into_view_if_needed()
    item.tap()

with sync_playwright() as p:
    for engine in ("webkit", "chromium"):
        browser = getattr(p, engine).launch(headless=True)
        ctx = browser.new_context(
            viewport={"width":390,"height":844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=1,
        )
        page = ctx.new_page()
        errors, bad = [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("response", lambda r: bad.append({"url":r.url,"status":r.status}) if r.status>=400 else None)
        page.goto(URL+"/", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector("#criminalEntry", timeout=60000)
        page.wait_for_function("() => Boolean(window.CriminalEngine && document.getElementById('criminalScreen'))", timeout=60000)
        assert page.locator("#home").is_visible()
        tap(page, "#criminalEntry")
        assert page.locator(".cr-pin").count()==5
        assert page.locator("#criminalScreen").is_visible()
        for mission in ("CR01","CR05"):
            tap(page, f'.cr-pin[data-mission="{mission}"]')
            page.wait_for_function(
                """() => {
                    const im=document.querySelector('#criminalScreen .cr-frame img');
                    return im && im.complete && im.naturalWidth===720 && im.naturalHeight===900;
                }""", timeout=30000
            )
            tap(page, '[data-action="start"]')
            assert page.locator("#criminalScreen .cr-choices button").count()>=1
            tap(page, "#criminalScreen .cr-choices button:not([disabled])")
            assert page.locator("#criminalScreen .cr-consequence").is_visible()
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
            tap(page, '[data-action="home"]')
            assert page.locator("#home").is_visible()
            tap(page, "#criminalEntry")
        if engine=="webkit":
            page.screenshot(path=str(OUT/"live-webkit-map.png"),full_page=True)
        assert not errors, {"engine":engine,"js":errors}
        assert not bad, {"engine":engine,"http":bad}
        report.append({"browser":engine,"status":"PASS","missions":["CR01","CR05"],"badResponses":0,"jsErrors":0})
        ctx.close()
        browser.close()
(OUT/"summary.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print("PASS remote Vercel+CDN WebKit/Chromium",report)
