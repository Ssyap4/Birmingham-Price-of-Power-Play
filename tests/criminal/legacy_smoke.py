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
                tap(page, "#begin")
                assert page.locator("#game").is_visible()
                assert page.locator("#sceneId").inner_text().startswith("P01")
                tap(page, 'button.choice[data-to="P02"]')
                assert page.locator("#sceneId").inner_text().startswith("P02")
                second_visual=reading_language(page,"#sceneText")
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
                first_rule=episode_material(page,"#case001Briefing .case001-briefing-points section","--campaign-episode-rule")
                assert first_rule["color"]==second_rule["color"],(first_rule,second_rule)
                tap(page, "#case001Briefing .briefing-start")
                assert page.locator("#caseGame").is_visible()
                assert page.locator("#caseChoices button").count() > 0
                first_visual=reading_language(page,"#caseText")
                first = page.evaluate(
                    "localStorage.getItem('birmingham_case_smol_heath_v1_jack')"
                )
                page.screenshot(
                    path=str(OUT / (name + "-case001-start.png")), full_page=True
                )
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
                tap(page, '.v33-tile[data-id="invoice"]')
                assert "Совместимых улик: 1" in page.locator(".v33-selection-note").inner_text()
                assert page.locator('.v33-tile[data-id="invoice"]').get_attribute("aria-pressed")=="true"
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
                assert not errors, errors
                print(
                    "PASS",
                    name,
                    "same package: criminal return -> 002 P02 -> 001 start -> criminal -> shared archive, slots unchanged",
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
                proof.goto(origin+"/preview/case002-prototype/index.html",wait_until="domcontentloaded")
                tap(proof,"#briefContinue")
                tap(proof,"#begin")
                known=None;verified=False
                for source,target,action in route[:-1]:
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
                assert not proof_errors,proof_errors
                proof_ctx.close()
                browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    run()
