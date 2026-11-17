#!/usr/bin/env python3
"""One risk-proportionate old-entry check from the exact unified package.
No repeated 202-route campaign simulation; game engines remain unchanged.
"""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
import sys, json, subprocess

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


def reading_language(page, selector):
    target=page.locator(selector)
    target.wait_for(state="visible")
    metrics=target.evaluate("""e=>{const s=getComputedStyle(e);
      return {color:s.color,font:s.fontFamily,line:parseFloat(s.lineHeight)/parseFloat(s.fontSize),
        size:parseFloat(s.fontSize),token:s.getPropertyValue('--campaign-reading-ink').trim()};}""")
    assert metrics["token"]=="#efddc6", (selector,metrics)
    assert metrics["color"]=="rgb(239, 221, 198)", (selector,metrics)
    assert "Georgia" in metrics["font"], (selector,metrics)
    assert metrics["size"]>=16.8 and metrics["line"]>=1.65, (selector,metrics)
    return metrics

def episode_material(page, selector, token):
    el=page.locator(selector).first
    el.wait_for(state="visible")
    m=el.evaluate("""(e,t)=>{const s=getComputedStyle(e);return {radius:s.borderTopLeftRadius,
      background:s.backgroundImage,color:s.backgroundColor,token:s.getPropertyValue(t).trim()};}""",token)
    assert m["radius"]=="7px", (selector,m)
    assert m["token"], (selector,m)
    return m

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
                second_rule=episode_material(page,"#caseBriefing .briefing-rule","--campaign-episode-rule")
                assert second_rule["color"]=="rgb(23, 20, 17)",second_rule
                tap(page, "#briefContinue")
                assert page.locator("#heroGallery .hero-card").count()==5
                assert page.locator('#heroGallery .hero-card[aria-pressed="true"]').count()==1
                second_hero=episode_material(page,'#heroGallery .hero-card[aria-pressed="true"]','--campaign-work-active')
                second_other=episode_material(page,'#heroGallery .hero-card[aria-pressed="false"]','--campaign-work-card')
                assert second_hero["background"]!=second_other["background"]
                page.locator("#heroGallery").screenshot(path=str(OUT / (name + "-v55-case002-hero-picker.png")))
                tap(page, "#begin")
                assert page.locator("#game").is_visible()
                assert page.locator("#sceneId").inner_text().startswith("P01")
                tap(page, 'button.choice[data-to="P02"]')
                assert page.locator("#sceneId").inner_text().startswith("P02")
                second_visual=reading_language(page,"#sceneText")
                # Measure the actual released touch target, not a transient
                # animation frame; record geometry on failure for diagnosis.
                read=page.locator("#readScene")
                read.wait_for(state="visible")
                read.scroll_into_view_if_needed()
                page.wait_for_function("""()=>{const e=document.querySelector('#readScene');
                  return e&&e.getClientRects().length&&e.getAnimations().every(a=>a.playState!=='running')&&
                    !e.matches(':active')}""")
                read_metrics=read.evaluate("""e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();
                  return {height:r.height,width:r.width,layoutHeight:e.offsetHeight,
                    minHeight:s.minHeight,radius:s.borderTopLeftRadius,transform:s.transform}}""")
                assert read_metrics["height"]>=48 and read_metrics["layoutHeight"]>=48 and read_metrics["radius"]=="5px",read_metrics
                assert page.locator("#casePulse span").evaluate_all("""els=>els.length===3&&els.every(e=>{const s=getComputedStyle(e);return s.borderTopLeftRadius==='5px'&&s.fontVariantNumeric==='tabular-nums'&&s.color==='rgb(239, 221, 198)'})""")
                assert page.locator("#caseTools").evaluate("e=>getComputedStyle(e).borderTopLeftRadius")== "7px"
                second = page.evaluate(
                    "localStorage.getItem('birmingham_case002_draft_v3_jack')"
                )
                tap(page, "#case002MapReturn")
                page.wait_for_url("**/index.html#district-digbeth")
                tap(page, '.map-pin[data-district="small-heath"]')
                tap(page, "#launchFirstCase")
                assert page.locator("#heroSelection").is_visible()
                assert page.locator("#heroCards .hero-card").count()==5
                assert page.locator('#heroCards .hero-card[aria-pressed="true"]').count()==1
                first_hero=episode_material(page,'#heroCards .hero-card[aria-pressed="true"]','--campaign-work-active')
                first_other=episode_material(page,'#heroCards .hero-card[aria-pressed="false"]','--campaign-work-card')
                assert first_hero["background"]==second_hero["background"],(first_hero,second_hero)
                assert first_other["background"]==second_other["background"],(first_other,second_other)
                page.locator("#heroCards").screenshot(path=str(OUT / (name + "-v55-case001-hero-picker.png")))
                tap(page, "#heroSelection .hero-begin")
                assert page.locator("#case001Briefing").is_visible()
                first_rule=episode_material(page,"#case001Briefing .case001-briefing-points section","--campaign-episode-rule")
                assert first_rule["color"]==second_rule["color"],(first_rule,second_rule)
                tap(page, "#case001Briefing .briefing-start")
                assert page.locator("#caseGame").is_visible()
                assert page.locator("#caseChoices button").count() > 0
                first_visual=reading_language(page,"#caseText")
                assert page.locator("#caseGame").evaluate("e=>{const s=getComputedStyle(e);return s.opacity==='1'&&s.animationName==='none'}")
                assert page.locator("body>.shell>.top").evaluate("""el=>{const b=el.querySelector('.brand').getBoundingClientRect(),a=el.querySelector('.top-actions').getBoundingClientRect(),w=el.querySelector('.brand strong');return b.right<=a.left+1&&w.scrollWidth<=w.clientWidth+1}""")
                page.locator("body>.shell>.top").screenshot(path=str(OUT/(name+"-v60-case001-header.png")))
                page.wait_for_function("""()=>{const i=document.querySelector('#caseArt .case001-portrait-image');return i&&!i.hidden&&i.complete&&i.naturalWidth>0}""")
                art_geometry=page.locator("#caseArt .case001-portrait-image").evaluate("""i=>{const s=getComputedStyle(i),r=i.getBoundingClientRect(),stage=i.parentElement;return {ratio:(r.width-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth))/(r.height-parseFloat(s.borderTopWidth)-parseFloat(s.borderBottomWidth)),original:i.naturalWidth/i.naturalHeight,fill:r.width/stage.clientWidth,fit:s.objectFit,stageHeight:stage.clientHeight,imageHeight:r.height}}""")
                assert abs(art_geometry["ratio"]-art_geometry["original"])<.035,art_geometry
                assert art_geometry["fill"]>.9 and art_geometry["fit"]=="contain",art_geometry
                assert art_geometry["stageHeight"]-art_geometry["imageHeight"]<100,art_geometry
                assert page.locator("#case001PulseClues").evaluate("e=>getComputedStyle(e).fontVariantNumeric")=="tabular-nums"
                first = page.evaluate(
                    "localStorage.getItem('birmingham_case_smol_heath_v1_jack')"
                )
                page.screenshot(
                    path=str(OUT / (name + "-case001-start.png")), full_page=True
                )
                # V57: reading is a reversible detour, not a game decision.
                tap(page, "#caseScene .case001-read-scene")
                assert page.evaluate("document.activeElement.matches('.case-dialogue:not([hidden]),.case-paper')")
                page.evaluate("""()=>{const r=document.querySelector('#caseScene').getBoundingClientRect();window.scrollTo({top:window.scrollY+r.top+35,behavior:'instant'})}""")
                before_read=page.evaluate("window.scrollY")
                assert before_read>0
                tap(page, "#case001QuickNav [data-go='choices']")
                page.wait_for_function("document.querySelector('#case001QuickNav [data-go=scene]').dataset.returnPoint==='true'")
                tap(page, "#case001QuickNav [data-go='choices']")
                tap(page, "#case001QuickNav [data-go='scene']")
                page.wait_for_function("y=>Math.abs(window.scrollY-y)<=4",arg=before_read)
                assert page.locator("#case001QuickNav [data-go='scene']").get_attribute("data-return-point") is None
                assert page.evaluate("localStorage.getItem('birmingham_case_smol_heath_v1_jack')")==first
                tap(page, "#case001QuickNav [data-go='scene']")
                # A temporary, isolated save fixture exercises the actual board.
                keys=page.evaluate("""() => {
                  const hero=window.BirminghamHero.selectedId;
                  const key='birmingham_case_smol_heath_v1_'+hero;
                  const meta='birmingham_case_v20_findings_'+hero;
                  const original=localStorage.getItem(key),originalMeta=localStorage.getItem(meta);
                  const state=JSON.parse(original);state.items=['invoice','route'];
                  localStorage.setItem(key,JSON.stringify(state));
                  localStorage.setItem(meta,JSON.stringify({started:state.started,deductions:[],reactions:[]}));
                  window.BirminghamCase.resume();
                  return {key,meta,original,originalMeta};
                }""")
                tap(page, "#case001QuickNav [data-go='evidence']")
                assert page.locator(".v33-shade").is_visible()
                assert page.locator(".v33-window").evaluate("e=>getComputedStyle(e).borderTopLeftRadius")== "7px"
                tap(page, '.v33-tile[data-id="invoice"]')
                assert "Совместимых улик: 1" in page.locator(".v33-selection-note").inner_text()
                assert page.locator('.v33-tile[data-id="invoice"]').get_attribute("aria-pressed")=="true"
                assert page.locator('.v33-tile[data-id="invoice"] .v33-tile-state').inner_text()=="Выбрана"
                other=page.locator('.v33-tile[data-id="route"]')
                assert other.get_attribute("data-selection")=="compatible"
                assert "можно сопоставить" in other.get_attribute("aria-label")
                assert other.locator(".v33-tile-state").is_visible()
                tap(page,'.v33-tile[data-id="invoice"]')
                assert other.get_attribute("data-selection")=="idle"
                assert other.locator(".v33-tile-state").is_hidden()
                tap(page,'.v33-tile[data-id="invoice"]')
                page.evaluate("""key => {
                  const original=Storage.prototype.setItem;
                  window.__restoreV33=()=>{Storage.prototype.setItem=original;delete window.__restoreV33};
                  Storage.prototype.setItem=function(k,v){if(k===key)throw new Error('test storage refusal');return original.call(this,k,v)};
                }""",keys["meta"])
                tap(page, '.v33-tile[data-id="route"]')
                assert page.locator(".v33-result-status").get_attribute("data-saved")=="false"
                assert "Не удалось сохранить" in page.locator(".v33-result-status").inner_text()
                assert page.evaluate("k=>JSON.parse(localStorage.getItem(k)).deductions",keys["meta"])==[]
                page.evaluate("window.__restoreV33()")
                tap(page, ".v33-result button")
                assert page.locator(".v33-shade").is_visible()
                tap(page, '.v33-tile[data-id="invoice"]')
                tap(page, '.v33-tile[data-id="route"]')
                assert page.locator(".v33-result-status").get_attribute("data-saved")=="true"
                assert page.evaluate("k=>JSON.parse(localStorage.getItem(k)).deductions",keys["meta"])==["Путь груза"]
                tap(page, ".v33-result button")
                assert page.locator(".v33-shade").is_hidden()
                page.wait_for_function("document.activeElement?.matches('#case001QuickNav [data-go=evidence]')")
                tap(page, "#case001QuickNav [data-go='evidence']")
                assert page.locator(".v33-solved-board .v33-tile").count()==2
                assert page.locator(".v33-solved-board .v33-tile").evaluate_all("els=>els.every(e=>e.dataset.linked==='true'&&e.getAttribute('aria-label').includes('связана с выводом'))")
                page.screenshot(path=str(OUT / (name + "-v33-deduction-confirmed.png")))
                tap(page, ".v33-close")
                page.evaluate("""k => {
                  localStorage.setItem(k.key,k.original);
                  if(k.originalMeta===null)localStorage.removeItem(k.meta);
                  else localStorage.setItem(k.meta,k.originalMeta);
                  window.BirminghamCase.resume();
                }""",keys)
                # V34: an earned award survives its flyout and is read in the scene.
                award_fixture=page.evaluate("""k => {
                  const awardKey='birmingham_campaign_awards_v1';
                  const old=localStorage.getItem(awardKey);
                  const state=JSON.parse(k.original);
                  state.items=['envelope','key','invoice','route','ledger','receipt','ash','testimony','note'];
                  localStorage.setItem(k.key,JSON.stringify(state));window.BirminghamCase.resume();
                  return {awardKey,old};
                }""",keys)
                receipt=page.locator("#case001UnlockReceipt")
                receipt.wait_for(state="visible")
                first_receipt=episode_material(page,"#case001UnlockReceipt","--campaign-episode-receipt")
                assert "Острый взгляд" in receipt.inner_text()
                assert page.locator(".case001-board-guide").count()==0
                stored_award=page.evaluate("k=>localStorage.getItem(k)",award_fixture["awardKey"])
                assert "clue9" in json.loads(stored_award)
                page.wait_for_function("!document.querySelector('.campaign-unlock-popup')",timeout=20000)
                assert receipt.is_visible()
                page.screenshot(path=str(OUT / (name + "-v34-case001-achievement.png")),full_page=True)
                tap(page,"#case001UnlockReceipt button")
                assert receipt.is_hidden()
                assert page.evaluate("k=>localStorage.getItem(k)",award_fixture["awardKey"])==stored_award
                page.evaluate("""({k,a}) => {
                  localStorage.setItem(k.key,k.original);
                  if(k.originalMeta===null)localStorage.removeItem(k.meta);
                  else localStorage.setItem(k.meta,k.originalMeta);
                  if(a.old===null)localStorage.removeItem(a.awardKey);
                  else localStorage.setItem(a.awardKey,a.old);
                  window.BirminghamCase.resume();
                }""",{"k":keys,"a":award_fixture})
                # Read-only presentation of a risky choice using a synthetic scene fixture.
                page.evaluate("""k=>{
                  const s=JSON.parse(k.original);s.node='canal';s.riskSeen=[];
                  localStorage.setItem(k.key,JSON.stringify(s));window.BirminghamCase.resume();
                }""",keys)
                risky=page.locator("#caseChoices [data-choice-target='sneak']")
                assert risky.is_enabled() and risky.get_attribute("data-risk-kind")=="wound"
                assert "возможное ранение" in risky.inner_text()
                assert risky.evaluate("e=>getComputedStyle(e).borderLeftColor")=="rgb(211, 160, 92)"
                ordinary=page.locator("#caseChoices [data-risk-kind='ordinary']:not([disabled])").first
                assert ordinary.evaluate("e=>getComputedStyle(e).backgroundImage")!=risky.evaluate("e=>getComputedStyle(e).backgroundImage")
                page.evaluate("""k=>{
                  const s=JSON.parse(localStorage.getItem(k.key));s.riskSeen=['sneak'];
                  localStorage.setItem(k.key,JSON.stringify(s));window.BirminghamCase.resume();
                }""",keys)
                assert risky.get_attribute("data-risk-kind")=="ordinary"
                assert "возможное ранение" not in risky.inner_text()
                page.evaluate("""k=>{
                  localStorage.setItem(k.key,k.original);
                  if(k.originalMeta===null)localStorage.removeItem(k.meta);else localStorage.setItem(k.meta,k.originalMeta);
                  window.BirminghamCase.resume();
                }""",keys)
                # Final-archive fixture: actual terminal screen, deliberately damaged archive.
                # Not a claim that this fixture is a played ending.
                final_fixture=page.evaluate("""k=>{
                  const record='birmingham_campaign_records_v1',reward='birmingham_campaign_unique_rewards_v1',awards='birmingham_campaign_awards_v1';
                  const originals=Object.fromEntries([record,reward,awards].map(key=>[key,localStorage.getItem(key)]));
                  const s=JSON.parse(k.original);s.node='endingRescue';s.ending=s.node;
                  localStorage.setItem(k.key,JSON.stringify(s));window.BirminghamCase.resume();
                  return originals;
                }""",keys)
                page.wait_for_function("document.querySelector('.case001-finale-archive-note')?.dataset.status==='verified'")
                assert page.locator("#case001QuickNav [data-go='choices']").inner_text()=="ИТОГ"
                terminal_bytes=page.evaluate("k=>localStorage.getItem(k)",keys["key"])
                tap(page,"#case001QuickNav [data-go='choices']")
                assert page.evaluate("document.activeElement.matches('.v33-ending-report')")
                page.wait_for_function("document.querySelector('#case001QuickNav [data-go=choices]').getAttribute('aria-current')==='location'")
                assert page.evaluate("k=>localStorage.getItem(k)",keys["key"])==terminal_bytes
                page.screenshot(path=str(OUT/(name+"-v64-case001-outcome.png")))
                page.evaluate("""()=>{const key='birmingham_campaign_records_v1';localStorage.setItem(key,'{broken');window.dispatchEvent(new StorageEvent('storage',{key}));}""")
                page.wait_for_function("document.querySelector('.case001-finale-archive-note')?.dataset.status==='damaged'")
                assert page.evaluate("localStorage.getItem('birmingham_campaign_records_v1')")=="{broken"
                tap(page,".case001-finale-actions button:last-child")
                assert page.locator("#districts").is_visible() and page.locator("#caseGame").is_hidden()
                assert page.locator('.map-pin[data-district="small-heath"]').get_attribute("aria-pressed")=="true"
                assert page.evaluate("document.activeElement.matches('.map-pin[data-district=small-heath]')")
                assert page.evaluate("k=>localStorage.getItem(k)",keys["key"])==terminal_bytes
                page.evaluate("""({k,originals})=>{
                  localStorage.setItem(k.key,k.original);
                  if(k.originalMeta===null)localStorage.removeItem(k.meta);else localStorage.setItem(k.meta,k.originalMeta);
                  for(const [key,v] of Object.entries(originals)){if(v===null)localStorage.removeItem(key);else localStorage.setItem(key,v);}
                  window.BirminghamCase.resume();
                }""",{"k":keys,"originals":final_fixture})
                assert page.locator("#case001QuickNav [data-go='choices']").inner_text()=="РЕШЕНИЯ"
                # V37: the global exit no longer deletes the active investigation.
                assert "Сбросить" in page.locator("#caseDiscardBtn").inner_text()
                page.once("dialog",lambda d:d.dismiss())
                tap(page,"#gameExitBtn")
                assert page.locator("#caseGame").is_visible()
                assert page.evaluate("k=>localStorage.getItem(k)",keys["key"])==first
                page.once("dialog",lambda d:d.accept())
                tap(page,"#gameExitBtn")
                assert page.locator("#home").is_visible()
                assert page.evaluate("k=>localStorage.getItem(k)",keys["key"])==first
                # Leaving old entry UI and playing a new intro must preserve both raw slots.
                tap(page, "#criminalEntry")
                tap(page, '.cr-pin[data-mission="CR02"]')
                tap(page, '[data-action="start"]')
                criminal_visual=reading_language(page,"#crStory > p")
                assert page.locator("#criminalScreen").evaluate("e=>getComputedStyle(e).backgroundColor")=="rgb(24, 20, 16)"
                assert page.locator("#criminalScreen .cr-top button").first.evaluate("e=>getComputedStyle(e).backgroundImage")!="none"
                assert max(x["size"] for x in (first_visual,second_visual,criminal_visual))-min(x["size"] for x in (first_visual,second_visual,criminal_visual))<.1
                print("PASS common narrative material and reading metrics",name,flush=True)
                page.screenshot(path=str(OUT/(name+"-criminal-v51-reader.png")),full_page=True)
                tap(page, '[data-choice="go"]')
                tap(page, '[data-action="home"]')
                tap(page, "#storyStart")
                assert page.locator("#campaignAchievements").is_visible()
                assert page.locator("#campaignSecondCaseAchievements").is_visible()
                assert page.locator("#campaignCriminalAchievements").is_visible()
                assert page.locator("#campaignTrialsAchievements").is_visible()
                assert not page.locator("#campaignTrialsAchievements").evaluate("e=>!!e.closest('#campaignFirstCaseAchievements')")
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
                tap(page,"#homeBtn")
                tap(page,"#cabinetProfile")
                page.locator("#profile").wait_for(state="visible")
                assert page.locator("#profile .player-overview-live").evaluate_all("els=>els.map(e=>e.dataset.active)")==["1","1","1"]
                assert page.locator("#profile .player-overview-live").evaluate_all("els=>els.every(e=>e.dataset.issues==='0')")
                assert page.evaluate("localStorage.getItem('birmingham_case_smol_heath_v1_jack')")==first
                assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==second
                tap(page,"#profile .campaign-profile-links [data-open-section='campaignDossiers']")
                assert page.locator("#campaignDossiers .campaign-live").first.inner_text().startswith("Расследование в работе")
                assert not errors, errors
                print(
                    "PASS",
                    name,
                    "same package: criminal return -> 002 P02 -> 001 start -> criminal -> shared archive -> profile active slots, saves unchanged",
                )
                # Fresh context: follow one canonical Case002 route until an
                # actual earned achievement is followed by an ordinary decision.
                # No fabricated achievement, engine or archive state.
                route_source=("const m=require('./tests/case002/simulate-story-model-v2.js');"
                              "console.log(JSON.stringify(m.goodRoute('jack','trainEscape').actionLog));")
                route=json.loads(subprocess.check_output(["node","-e",route_source],cwd=ROOT,text=True).strip().splitlines()[-1])
                proof_ctx=browser.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
                proof=proof_ctx.new_page()
                proof_errors=[]
                proof.on("pageerror",lambda e:proof_errors.append(str(e)))
                proof.on("dialog",lambda d:d.accept())
                proof.goto(origin+"/preview/case002-prototype/index.html?from=map",wait_until="domcontentloaded")
                tap(proof,"#briefContinue")
                tap(proof,"#begin")
                known=None;verified=False
                for route_index,(source,target,action) in enumerate(route[:-1]):
                    choice=proof.locator(f'button.choice[data-to="{target}"][data-action="{action}"]')
                    assert choice.is_enabled(),(name,source,target)
                    choice.tap()
                    earned=set(proof.locator("#caseAchievementReceipt li[data-achievement-id]").evaluate_all("els=>els.map(e=>e.dataset.achievementId)"))
                    if known is not None:
                        assert known.issubset(earned),(name,"unread achievements lost",known,earned)
                        if earned==known:
                            assert proof.locator("#caseUnlockToast").is_hidden()
                            verified=True
                            break
                    if earned:
                        known=earned
                        toast=proof.locator("#caseUnlockToast")
                        if toast.is_visible():tap(proof,".case-unlock-toast-close")
                assert verified,(name,"canonical route did not exercise unread receipt continuity")
                second_receipt=episode_material(proof,"#caseAchievementReceipt","--campaign-episode-receipt")
                assert second_receipt["background"]==first_receipt["background"],(first_receipt,second_receipt)
                print("PASS common briefing and persistent receipt material",name,flush=True)
                proof.locator("#caseAchievementReceipt").scroll_into_view_if_needed()
                proof.screenshot(path=str(OUT/(name+"-v34-case002-unread-achievement.png")))
                # Journal and evidence tools must not rewrite the actual route.
                raw_before=proof.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")
                tap(proof,"#quickNav [data-go='journal']")
                assert proof.locator(".journal-compass-kicker").inner_text().startswith("ТЕКУЩАЯ СЦЕНА · ")
                if proof.locator(".journal-event").count():
                    assert proof.locator(".journal-event-scene").first.inner_text()=="ПОСЛЕДНЯЯ ЗАПИСЬ"
                    assert proof.locator(".journal-event-title").count()==proof.locator(".journal-event").count()
                tap(proof,"#quickNav [data-go='deductions']")
                if proof.locator(".pair-item").count():
                    clue=proof.locator(".pair-item").first
                    clue.tap()
                    assert proof.locator(".pair-item[aria-pressed='true'] .pair-item-state").inner_text()=="ВЫБРАНА · ПЕРВАЯ УЛИКА"
                    proof.locator(".pair-item[aria-pressed='true']").tap()
                    assert proof.locator(".pair-item[aria-pressed='true']").count()==0
                assert proof.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==raw_before
                # Complete the same real route rather than simulate it a second time.
                for source,target,action in route[route_index+1:]:
                    choice=proof.locator(f'button.choice[data-to="{target}"][data-action="{action}"]')
                    assert choice.is_enabled(),(name,source,target)
                    choice.tap()
                proof.locator("#finalePanel").wait_for(state="visible")
                assert proof.locator("#finaleArchive").get_attribute("data-status")=="verified"
                assert "черновом архиве" not in proof.locator("#finalePanel").inner_text()
                final_save=proof.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")
                with proof.expect_navigation(url="**/index.html#district-digbeth",wait_until="load",timeout=15000):
                    tap(proof,"#finalePanel .finale-actions button:last-child")
                proof.locator("#launchSecondCase").wait_for(state="visible")
                assert proof.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==final_save
                assert not proof_errors,proof_errors
                proof_ctx.close()
                browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
