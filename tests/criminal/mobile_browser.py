#!/usr/bin/env python3
"""Real touch acceptance of the exported same-origin package. No mock DOM.
Run with --system-chromium for an installed Chromium; default covers Chromium+WebKit.
Generate engine evidence first: node tests/criminal/playthroughs.js.
"""
import json, sys, contextlib
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "campaign-unified-dist"
OUT = ROOT / "work/criminal/browser"
OUT.mkdir(parents=True, exist_ok=True)
PLANS = json.loads((ROOT / "work/criminal/playthroughs.json").read_text())
PREFIX = "birmingham_criminal_v2_"
OLD = [
    *[
        prefix + hero
        for hero in ["jack", "finn", "eleanor", "victor", "samuel"]
        for prefix in [
            "birmingham_case_smol_heath_v1_",
            "birmingham_case_v20_findings_",
            "birmingham_case002_draft_v3_",
        ]
    ],
    "birmingham_case002_records_draft_v3",
    "birmingham_case002_rewards_draft_v3",
    "birmingham_campaign_records_v1",
    "birmingham_campaign_awards_v1",
    "birmingham_campaign_unique_rewards_v1",
]


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def value(page, id):
    return page.evaluate(
        "(k)=>JSON.parse(localStorage.getItem(k))", PREFIX + "save_" + id
    )


def bounds(page):
    assert not page.evaluate(
        "document.documentElement.scrollWidth>innerWidth+1"
    ), "horizontal overflow"
    for button in page.locator("#criminalScreen button:not([disabled])").all():
        assert button.bounding_box()["height"] >= 43, "target smaller than 44px"


def touch(page, selector):
    loc = page.locator(selector).first
    loc.scroll_into_view_if_needed()
    loc.tap()


def start(page, id, seed):
    touch(page, "#criminalEntry")
    touch(page, f'.cr-pin[data-mission="{id}"]')
    page.evaluate("(n)=>window.__crSeed=n", seed)
    if page.locator('[data-action="start"]').count():
        touch(page, '[data-action="start"]')
    else:
        touch(page, '[data-action="restart"]')
    assert value(page, id)["rng"]["seed"] == seed


def run():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(DIST)))
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    summary = []
    try:
        with sync_playwright() as p:
            for name in (
                ["chromium"]
                if "--system-chromium" in sys.argv
                else ["chromium", "webkit"]
            ):
                opts = {"headless": True}
                if "--system-chromium" in sys.argv:
                    opts["executable_path"] = "/usr/bin/chromium"
                browser = getattr(p, name).launch(**opts)
                for width in (
                    [] if "--faults-only" in sys.argv else [320, 360, 390, 430]
                ):
                    ctx = browser.new_context(
                        viewport={"width": width, "height": 844},
                        is_mobile=True,
                        has_touch=True,
                        device_scale_factor=1,
                    )
                    ctx.add_init_script(
                        """(()=>{const old=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{old(a);if(a instanceof Uint32Array&&a.length===2&&Number.isInteger(window.__crSeed))a[0]=window.__crSeed;return a;};})();"""
                    )
                    page = ctx.new_page()
                    errors = []
                    missing = []
                    page.on("pageerror", lambda e: errors.append(str(e)))
                    page.on(
                        "response",
                        lambda r: (
                            missing.append(r.url)
                            if r.status >= 400 and r.url.startswith(origin)
                            else None
                        ),
                    )
                    page.on("dialog", lambda d: d.accept())
                    page.route("https://**/*", lambda r: r.abort())
                    page.goto(origin + "/index.html", wait_until="domcontentloaded")
                    assert page.locator("#districtsCard").get_attribute("aria-label") == "Детективные дела"
                    # New home is independent of the historic illustrated cabinet.
                    assert page.locator("#home.cinema-home").count() == 1
                    assert page.locator("#home .cinema-hero").is_visible()
                    heading = page.evaluate("""() => {
                        const h=document.querySelector('#home .cinema-crest h1');
                        if(!h||!h.firstChild)return {ok:false,reason:'missing heading'};
                        const range=document.createRange();
                        range.selectNodeContents(h.firstChild);
                        const bounds=range.getBoundingClientRect();
                        return {ok:bounds.width>0 && bounds.left>=-1 &&
                          bounds.right<=innerWidth+1,
                          left:bounds.left,right:bounds.right,width:bounds.width,
                          viewport:innerWidth,font:getComputedStyle(h).fontSize,
                          childType:h.firstChild.nodeType,
                          text:h.firstChild.textContent};
                    }""")
                    assert heading["ok"], f"Cinematic title bounds on {name} {width}px: {heading}"

                    assert "assets/cabinet/cinema-home-art-v12.webp" in page.locator("#home .cinema-art").evaluate(
                        "e => getComputedStyle(e).backgroundImage"
                    )
                    assert page.evaluate("""async () => {
                        const img=new Image();
                        img.src='assets/cabinet/cinema-home-art-v12.webp';
                        try {await img.decode();}catch{return false;}
                        return img.naturalWidth===720 && img.naturalHeight===900;
                    }"""), "V12 cinematic artwork failed to decode"

                    assert page.locator("#home .cinema-rain").count() == 1
                    assert page.locator("#home .cinema-smoke").count() == 2
                    assert page.locator("#home .cinema-vinyl-glint").count() == 1
                    assert page.locator("#home .cinema-gramophone").count() == 0
                    assert page.locator("#home .cabinet-menu > button").count() == 6
                    assert page.locator("#districtsCard").get_attribute("aria-label") == "Детективные дела"
                    assert page.locator("#criminalEntry").get_attribute("aria-label") == "Работа для своих"
                    assert page.locator("#cabinetProfile").get_attribute("aria-label") == "Профиль"
                    assert page.locator("#storyStart .cabinet-entry-copy small").inner_text() == "Знаки расследований и поручений · Общий архив"
                    assert not page.locator("#cabinetSettings").count()
                    assert not page.locator("#cabinetSettingsDialog").count()
                    assert page.locator("#bhMusic").is_visible()
                    assert page.locator("#bhEffects").is_visible()
                    assert page.locator("#bhMenuTrack").is_visible()
                    assert page.locator("#cinemaAudioDock > .bh-audio-controls").count() == 1
                    assert page.evaluate("""() => {
                        const audio=document.querySelector('#cinemaAudioDock .bh-audio-controls');
                        const a=audio.getBoundingClientRect();
                        const cards=[...document.querySelectorAll('#home .cabinet-menu > button')];
                        return a.width>240 && a.height>=44 && cards.every(el=>{
                            const c=el.getBoundingClientRect();
                            return a.bottom<=c.top || a.top>=c.bottom;
                        })
                    }"""), "music controls overlap a main-menu card"
                    assert "1 / 2" in page.locator("#bhMenuTrack").inner_text()
                    touch(page, "#bhMenuTrack")
                    assert "2 / 2" in page.locator("#bhMenuTrack").inner_text()
                    for selector, image in (
                        ("#districtsCard", "assets/original-art/city-card-clean.webp"),
                        ("#criminalEntry", "assets/criminal/cr01-arrival.webp"),
                        (".cabinet-entry-quiz", "assets/original-art/challenges.webp"),
                        ("#storyStart", "assets/original-art/clock.webp"),
                        ("#profileCard", "assets/original-art/city.webp"),
                        ("#cabinetProfile", "assets/original-art/profile.webp"),
                    ):
                        assert page.locator(selector + " .cabinet-entry-copy strong").is_visible()
                        found=page.locator(selector).evaluate(
                            "e => getComputedStyle(e,'::before').backgroundImage"
                        )
                        assert image in found, (selector, found)
                    seal=page.locator("#cabinetProfile .cabinet-profile-seal")
                    assert "assets/cabinet/profile-seal.svg" in seal.evaluate(
                        "e => getComputedStyle(e).backgroundImage"
                    )
                    assert page.evaluate("""async () => {
                        for(const src of [
                            'assets/original-art/profile.webp',
                            'assets/original-art/city-card-clean.webp',
                            'assets/cabinet/profile-seal.svg']){
                            const img=new Image();img.src=src;
                            try{await img.decode()}catch{return false}
                            if(img.naturalWidth<96)return false;
                        }
                        return true
                    }"""), "cinema artwork did not decode"
                    assert page.evaluate("""() => {
                        const cards=[...document.querySelectorAll('#home .cabinet-menu > button')];
                        return cards.length===6 && cards.every(el=>{
                          const b=el.getBoundingClientRect();
                          const t=el.querySelector('strong').getBoundingClientRect();
                          return b.width>=240 && b.height>=44 && b.left>=-1 &&
                            b.right<=innerWidth+1 && t.width>0 && t.left>=b.left-1 &&
                            t.right<=b.right+1
                        }) && document.documentElement.scrollWidth<=innerWidth+1
                    }"""), "cinematic home clipped a button or title"
                    page.screenshot(path=str(OUT / (name + "-" + str(width) + "-cinema-menu.png")), full_page=True)
                    touch(page, "#storyStart")
                    assert page.locator("#campaignAchievements").is_visible()
                    assert page.locator("body > .bh-audio-controls").count() == 1
                    touch(page, "#homeBtn")
                    assert page.locator("#home").is_visible()
                    assert page.locator("#cinemaAudioDock > .bh-audio-controls").count() == 1
                    touch(page, "#profileCard")
                    assert page.locator("#campaignDossiers").is_visible()
                    touch(page, "#homeBtn")
                    assert page.locator("#home").is_visible()
                    touch(page, "#districtsCard")
                    assert page.locator("#districts").is_visible()
                    assert page.locator('#districts .campaign-portal-v13 [data-campaign-jump]').count() == 3
                    assert page.locator("#campaignDistrictState").count() == 1
                    touch(page, '#districts [data-campaign-jump="archive"]')
                    assert page.locator("#campaignAchievements").is_visible()
                    archive_intro = page.locator("#campaignAchievements .campaign-head p").inner_text()
                    assert "№001 и №002" in archive_intro and "Работа для своих" in archive_intro, archive_intro
                    assert page.locator('#campaignAchievements .campaign-portal-v13 [data-campaign-jump]').count() == 3
                    touch(page, '#campaignAchievements [data-campaign-jump="criminal"]')
                    assert page.locator("#criminalScreen .cr-map").is_visible()
                    assert page.locator('#criminalScreen .campaign-portal-v13 [data-campaign-jump]').count() == 3
                    touch(page, '#criminalScreen [data-campaign-jump="detective"]')
                    assert page.locator("#districts").is_visible()
                    assert not page.locator("body[data-criminal='active']").count()
                    assert page.locator(".campaign-hub:not([hidden])").count() == 0
                    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
                    if width == 390:
                        page.screenshot(path=str(OUT / (name + "-unified-v13-detective-map.png")), full_page=True)
                    touch(page, "#districtBack")
                    assert page.locator("#home").is_visible()
                    if width == 390:
                        page.screenshot(path=str(OUT / (name + "-main-menu-v7.png")), full_page=True)
                        page.locator("#cabinetProfile").screenshot(path=str(OUT / (name + "-profile-illustrated-tile.png")))
                    assert not page.locator("#cabinetSettings").count()
                    assert not page.locator("#cabinetSettingsDialog").count()
                    if width in (320, 390):
                        touch(page, "#cabinetProfile")
                        assert page.locator("#profile").is_visible()
                        assert page.evaluate("getComputedStyle(document.getElementById('profile')).opacity") == "1"
                        assert page.locator("#profile .profile-hero").is_visible()
                        assert page.locator("#profile .profile-hero h2").inner_text() == "ТВОЯ ИСТОРИЯ"
                        assert page.locator("#playerCampaignOverview").is_visible()
                        assert page.locator('#profile .campaign-portal-v13 [data-campaign-jump]').count() == 3
                        assert page.locator(".player-overview-card").count() == 3
                        assert page.locator("#profileBtn").inner_text().endswith("ПРОФИЛЬ")
                        if width == 390:
                            page.screenshot(path=str(OUT / (name + "-personal-profile.png")), full_page=True)
                        touch(page, "#homeBtn")
                        assert page.locator("#home").is_visible()
                    touch(page, "#criminalEntry")
                    bounds(page)
                    assert page.locator("#criminalScreen h1").inner_text() == "Работа для своих"
                    assert page.locator(".cr-pin").count() == 5
                    assert page.locator("#criminalScreen .campaign-portal-v13").count() == 1
                    if width == 390:
                        page.screenshot(
                            path=str(OUT / (name + "-map.png")), full_page=True
                        )
                    touch(page, '[data-action="home"]')
                    assert page.locator("#home").is_visible()
                    # Set raw legacy bytes after startup. The criminal mode must not write them.
                    page.evaluate(
                        '(keys)=>keys.forEach((k,i)=>localStorage.setItem(k,JSON.stringify({fixture:i})+" "))',
                        OLD,
                    )
                    before = page.evaluate(
                        "(ks)=>ks.map(k=>localStorage.getItem(k))", OLD
                    )
                    if width != 390:
                        start(page, "CR01", 0)
                        bounds(page)
                        touch(page, '[data-choice="accept"]')
                        saved = value(page, "CR01")
                        assert saved["revision"] == 1
                        page.reload(wait_until="domcontentloaded")
                        touch(page, '[data-action="resume"]')
                        assert value(page, "CR01") == saved
                        touch(page, '[data-action="ack"]')
                        bounds(page)
                        touch(page, ".cr-inventory summary")
                        assert page.locator(".cr-inventory[open]").count() == 1
                        assert page.locator(".cr-gear-illustration").count() >= 2
                        page.wait_for_function("() => [...document.querySelectorAll('#criminalScreen .cr-gear-illustration')].every(i=>i.complete&&i.naturalWidth===96)")
                        page.screenshot(
                            path=str(OUT / (name + "-" + str(width) + "-scene.png")),
                            full_page=True,
                        )
                        touch(page, '[data-action="home"]')
                        touch(page, "#criminalEntry")
                        assert page.locator('.cr-pin[data-mission="CR01"]').get_attribute("data-progress") == "active"
                        assert "В работе · акт" in page.locator('.cr-mission-list [data-mission="CR01"]').inner_text()
                        touch(page, '[data-action="home"]')
                    else:
                        for id, types in PLANS.items():
                            for kind, proof in types.items():
                                start(page, id, proof["rng"]["seed"])
                                last_act = 1
                                for step in proof["history"]:
                                    s = value(page, id)
                                    assert s["sceneId"] == step["from"], (
                                        id,
                                        kind,
                                        step,
                                        s["sceneId"],
                                    )
                                    # The actual rendered choice uses the same choiceId and risk as the engine.
                                    assert page.evaluate(
                                        """s=>CriminalEngine.choices(s).every(c=>{const b=document.querySelector('[data-choice="'+c.id+'"]');return b&&Number(b.dataset.risk)===c.risk.probability&&b.textContent.includes(c.risk.level)&&b.disabled===!c.available;})""",
                                        s,
                                    )
                                    bounds(page)
                                    touch(page, f'[data-choice="{step["choiceId"]}"]')
                                    next = value(page, id)
                                    assert next["revision"] == s["revision"] + 1
                                    assert page.evaluate(
                                        "s=>CriminalEngine.validateState(s).ok", next
                                    )
                                    if next["status"] == "finished":
                                        break
                                    assert page.locator(".cr-consequence").is_visible()
                                    act = page.evaluate(
                                        "s=>CriminalContent.missions[s.missionId].scenes[s.sceneId].act",
                                        next,
                                    )
                                    if act != last_act:
                                        page.reload(wait_until="domcontentloaded")
                                        touch(page, '[data-action="resume"]')
                                        assert value(page, id) == next
                                        last_act = act
                                    touch(page, '[data-action="ack"]')
                                final = value(page, id)
                                assert (
                                    final["status"] == "finished"
                                    and final["terminalId"] == proof["terminalId"]
                                )
                                # Ending has a story-specific afterword, grounded in saved flags.
                                assert page.locator(".cr-epilogue-card").count() >= 1
                                assert page.locator(".cr-epilogue h2").inner_text() == "После этой ночи"
                                # The first confirmed ending raises a one-time toast.
                                assert page.locator(".cr-reward-toast").is_visible()
                                assert "Новый знак получен" in page.locator(".cr-reward-toast").inner_text()
                                touch(page, '[data-action="dismissReward"]')
                                assert not page.locator(".cr-reward-toast").count()
                                ledger = page.evaluate(
                                    "(k)=>JSON.parse(localStorage.getItem(k))",
                                    PREFIX + "ledger",
                                )
                                count = len(ledger["attempts"])
                                page.reload(wait_until="domcontentloaded")
                                touch(page, '[data-action="resume"]')
                                assert (
                                    len(
                                        page.evaluate(
                                            "(k)=>JSON.parse(localStorage.getItem(k)).attempts",
                                            PREFIX + "ledger",
                                        )
                                    )
                                    == count
                                )
                                assert page.locator(".cr-result").is_visible()
                                assert page.locator(".cr-epilogue-card").count() >= 1
                                # Reopening a persisted final must never announce a duplicate award.
                                assert not page.locator(".cr-reward-toast").count()
                                bounds(page)
                                if kind == "care":
                                    page.screenshot(
                                        path=str(
                                            OUT / (name + "-" + id + "-ending.png")
                                        ),
                                        full_page=True,
                                    )
                                touch(page, '[data-action="home"]')
                        # Stale double touch: result acknowledgement cannot create a second gameplay action.
                        start(page, "CR01", 0)
                        button = page.locator('[data-choice="accept"]')
                        button.scroll_into_view_if_needed()
                        box = button.bounding_box()
                        page.touchscreen.tap(box["x"] + 20, box["y"] + 20)
                        page.touchscreen.tap(box["x"] + 20, box["y"] + 20)
                        assert value(page, "CR01")["revision"] == 1
                        touch(page, '[data-action="map"]')
                        touch(page, '[data-action="chronicle"]')
                        assert (
                            "10 завершённых попыток"
                            in page.locator("#criminalScreen").inner_text()
                        )
                        assert page.locator(".cr-epilogue-compact").count() == 10
                        assert page.locator(".cr-record").count() == 10
                        touch(page, '[data-archive-mission="CR01"]')
                        assert page.locator(".cr-record").count() == 2
                        assert page.locator('[data-archive-mission="CR01"]').get_attribute("aria-pressed") == "true"
                        touch(page, '[data-archive-mission="all"]')
                        assert page.locator(".cr-record").count() == 10
                        assert page.locator('[data-action="archiveNext"]').is_disabled()
                        touch(page, ".cr-epilogue-compact summary")
                        assert page.locator(".cr-epilogue-compact[open]").count() == 1
                        page.screenshot(
                            path=str(OUT / (name + "-chronicle.png")), full_page=True
                        )
                        saved_ledger = page.evaluate(
                            "localStorage.getItem('birmingham_criminal_v2_ledger')"
                        )
                        touch(page, '[data-action="home"]')
                        touch(page, "#storyStart")
                        assert page.locator("#campaignAchievements").is_visible()
                        assert page.evaluate("id => getComputedStyle(document.getElementById(id)).opacity", "campaignAchievements") == "1"
                        assert page.locator("#campaignCriminalAchievements").is_visible()
                        assert page.locator("#campaignCriminalAchievements .campaign-criminal-fold").count() >= 5
                        assert "10 уникальных знаков" in page.locator("#campaignCriminalAchievements").inner_text()
                        assert page.locator("#campaignCriminalAchievements .campaign-criminal-fold").first.is_visible()
                        page.locator("#campaignCriminalAchievements .campaign-criminal-fold summary").first.tap()
                        assert page.locator("#campaignCriminalAchievements .campaign-criminal-fold").first.locator(".campaign-criminal-seal.earned").count() == 2
                        touch(page, '#campaignAchievements [data-open-section="campaignHistory"]')
                        assert page.locator("#campaignHistory").is_visible()
                        assert page.evaluate("id => getComputedStyle(document.getElementById(id)).opacity", "campaignHistory") == "1"
                        assert page.locator("#campaignCriminalHistory .campaign-criminal-attempt").count() == 8
                        touch(page, '#campaignHistory [data-open-section="campaignDossiers"]')
                        assert page.locator("#campaignDossiers").is_visible()
                        assert page.locator('#campaignDossiers .campaign-portal-v13 [data-campaign-jump]').count() == 3
                        assert page.evaluate("id => getComputedStyle(document.getElementById(id)).opacity", "campaignDossiers") == "1"
                        assert page.locator("#campaignCriminalDossiers .campaign-criminal-hero").count() == 5
                        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
                        assert saved_ledger == page.evaluate("localStorage.getItem('birmingham_criminal_v2_ledger')")
                        page.screenshot(path=str(OUT / (name + "-combined-archive.png")), full_page=True)
                        touch(page, "#campaignCriminalDossiers .campaign-criminal-jump")
                        assert page.locator("#criminalScreen h1").inner_text() == "Работа для своих"
                        touch(page, '[data-action="home"]')
                    assert (
                        page.evaluate("(ks)=>ks.map(k=>localStorage.getItem(k))", OLD)
                        == before
                    ), "legacy save bytes changed"
                    assert not errors, errors
                    assert not missing, missing
                    summary.append(
                        {
                            "browser": name,
                            "width": width,
                            "touch": True,
                            "legacyBytes": "unchanged",
                            "errors": errors,
                        }
                    )
                    ctx.close()
                # Read-blocked storage and quota states are new-mode warnings, never success claims.
                ctx = browser.new_context(
                    viewport={"width": 320, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                page = ctx.new_page()
                page.route("https://**/*", lambda r: r.abort())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                page.evaluate(
                    """()=>{const g=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k.startsWith('birmingham_criminal_v2_'))throw Error('private');return g.call(this,k);};}"""
                )
                touch(page, "#criminalEntry")
                touch(page, '.cr-pin[data-mission="CR01"]')
                assert not page.locator('[data-action="start"]').count()
                assert page.locator('[data-action="memoryStart"]').is_visible()
                touch(page, '[data-action="memoryStart"]')
                assert "Игра без сохранения" in page.locator(".cr-warning").inner_text()
                touch(page, '[data-choice="accept"]')
                assert not page.locator(".cr-save-status").count()
                ctx.close()
                # Corrupt slot cannot be replaced by an ordinary Start.
                ctx = browser.new_context(
                    viewport={"width": 320, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                page = ctx.new_page()
                page.route("https://**/*", lambda r: r.abort())
                page.on("dialog", lambda d: d.accept())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                page.evaluate(
                    '(k)=>localStorage.setItem(k,"CORRUPT exact bytes\\n")',
                    PREFIX + "save_CR01",
                )
                touch(page, "#criminalEntry")
                touch(page, '.cr-pin[data-mission="CR01"]')
                assert not page.locator('[data-action="start"]').count()
                touch(page, '[data-action="resetCorrupt"]')
                assert value(page, "CR01")["revision"] == 0
                assert page.evaluate(
                    """p=>Object.keys(localStorage).some(k=>k.startsWith(p+'backup_CR01_')&&localStorage.getItem(k)==='CORRUPT exact bytes\\n')""",
                    PREFIX,
                )
                ctx.close()
                # A calculated random result is withheld until an exact write succeeds.
                ctx = browser.new_context(
                    viewport={"width": 320, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                page = ctx.new_page()
                page.route("https://**/*", lambda r: r.abort())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                touch(page, "#criminalEntry")
                touch(page, '.cr-pin[data-mission="CR01"]')
                touch(page, '[data-action="start"]')
                touch(page, '[data-choice="accept"]')
                touch(page, '[data-action="ack"]')
                touch(page, '[data-choice="front"]')
                touch(page, '[data-action="ack"]')
                before = value(page, "CR01")
                expected = page.evaluate(
                    's=>CriminalEngine.choose(s,"threat",s.revision)', before
                )
                page.evaluate(
                    """()=>{window.__oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('birmingham_criminal_v2_'))throw Error('quota');return window.__oldSet.call(this,k,v);};}"""
                )
                touch(page, '[data-choice="threat"]')
                assert value(page, "CR01") == before
                assert (
                    "Ход рассчитан, но не сохранён"
                    in page.locator("#criminalScreen h1").inner_text()
                )
                assert not page.locator(".cr-consequence").count()
                # Both top-menu and legacy profile navigation must honour a cancelled
                # pending-write warning without discarding the in-memory RNG outcome.
                page.once("dialog", lambda d: d.dismiss())
                touch(page, '[data-action="home"]')
                assert page.locator("#criminalScreen").is_visible()
                assert "Ход рассчитан, но не сохранён" in page.locator("#criminalScreen h1").inner_text()
                page.once("dialog", lambda d: d.dismiss())
                page.evaluate("document.getElementById('profileBtn').click()")
                assert page.locator("#criminalScreen").is_visible()
                assert value(page, "CR01") == before
                page.evaluate("()=>{Storage.prototype.setItem=window.__oldSet;}")
                touch(page, '[data-action="retryWrite"]')
                assert value(page, "CR01") == expected
                ctx.close()
                # A terminal slot can be recovered after an archive-write failure, once only.
                ctx = browser.new_context(
                    viewport={"width": 390, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                page = ctx.new_page()
                page.route("https://**/*", lambda r: r.abort())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                page.evaluate(
                    '(s)=>localStorage.setItem("birmingham_criminal_v2_save_CR03",JSON.stringify(s))',
                    PLANS["CR03"]["care"],
                )
                page.evaluate(
                    """()=>{window.__oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='birmingham_criminal_v2_ledger')throw Error('quota ledger');return window.__oldSet.call(this,k,v);};}"""
                )
                touch(page, "#criminalEntry")
                touch(page, '.cr-pin[data-mission="CR03"]')
                touch(page, '[data-action="resume"]')
                assert (
                    "Финал не объявляется награждённым"
                    in page.locator(".cr-warning").inner_text()
                )
                assert (
                    page.evaluate(
                        'localStorage.getItem("birmingham_criminal_v2_ledger")'
                    )
                    is None
                )
                page.evaluate("()=>{Storage.prototype.setItem=window.__oldSet;}")
                touch(page, '[data-action="retryArchive"]')
                assert (
                    len(
                        page.evaluate(
                            'JSON.parse(localStorage.getItem("birmingham_criminal_v2_ledger")).attempts'
                        )
                    )
                    == 1
                )
                ctx.close()
                # Telegram supplied insets are scoped to the new screen and update live.
                ctx = browser.new_context(
                    viewport={"width": 320, "height": 844},
                    is_mobile=True,
                    has_touch=True,
                )
                ctx.add_init_script(
                    """window.Telegram={WebApp:{safeAreaInset:{top:20,bottom:12,left:0,right:0},contentSafeAreaInset:{top:30,bottom:8,left:0,right:0},ready(){},expand(){},onEvent(name,fn){(window.__insets??={})[name]=fn;}}};"""
                )
                page = ctx.new_page()
                page.route("https://**/*", lambda r: r.abort())
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                touch(page, "#criminalEntry")
                assert (
                    page.locator("#criminalScreen").evaluate(
                        "e=>getComputedStyle(e).paddingTop"
                    )
                    == "50px"
                )
                bounds(page)
                page.evaluate(
                    "Telegram.WebApp.contentSafeAreaInset.top=10;window.__insets.safeAreaChanged()"
                )
                assert (
                    page.locator("#criminalScreen").evaluate(
                        "e=>getComputedStyle(e).paddingTop"
                    )
                    == "30px"
                )
                ctx.close()
                print(
                    "PASS", name, "private/quota/corrupt/archive/inset browser checks"
                )
                # Offline local HTML path works with ordinary script tags and local WebPs.
                if "--system-chromium" not in sys.argv:
                    ctx = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        is_mobile=True,
                        has_touch=True,
                    )
                    page = ctx.new_page()
                    page.route("https://**/*", lambda r: r.abort())
                    page.goto(
                        (DIST / "index.html").as_uri(), wait_until="domcontentloaded"
                    )
                    touch(page, "#criminalEntry")
                    touch(page, '.cr-pin[data-mission="CR05"]')
                    assert (
                        page.locator("#criminalScreen h1").inner_text()
                        == "Последний рейс"
                    )
                    page.wait_for_function(
                        """() => {
                        const im = document.querySelector('.cr-frame img');
                        return im && im.complete && im.naturalWidth === 720 && im.naturalHeight === 900;
                    }"""
                    )
                    assert page.locator(".cr-frame img").evaluate(
                        "(im)=>im.complete&&im.naturalWidth===720"
                    )
                    ctx.close()
                else:
                    summary.append(
                        {
                            "browser": name,
                            "fileProtocol": "unverified locally: managed browser blocks file URLs; CI gate required",
                        }
                    )
                browser.close()
        (OUT / "summary.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2)
        )
        print(json.dumps(summary, ensure_ascii=False))
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
