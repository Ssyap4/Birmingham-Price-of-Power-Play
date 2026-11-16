#!/usr/bin/env python3
"""Real unified release acceptance: packaged static files, phone Chromium + WebKit.
Walk main menu -> Digbeth -> Case 002 -> map -> Small Heath -> Case 001 ->
map -> resume Case 002, all with one browser origin and durable save keys.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import contextlib
import json

ROOT=Path(__file__).resolve().parents[2]/"campaign-unified-dist"
SHOTS=Path(__file__).resolve().parents[2]/"campaign-unified-qa-screens"

class Silent(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def run():
    assert (ROOT/"index.html").is_file(), "Build campaign-unified-dist first"
    SHOTS.mkdir(parents=True,exist_ok=True)
    server=ThreadingHTTPServer(("127.0.0.1",0),partial(Silent,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            for name in ("chromium","webkit"):
                browser=getattr(p,name).launch(headless=True)
                try:
                    context=browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=3,is_mobile=True,has_touch=True)
                    page=context.new_page()
                    errors=[]
                    page.on("pageerror",lambda e:errors.append(str(e)))
                    page.route("https://telegram.org/js/telegram-web-app.js",
                               lambda route:route.abort())
                    origin=f"http://127.0.0.1:{server.server_port}"
                    response=page.goto(origin+"/index.html",wait_until="domcontentloaded")
                    assert response.status==200
                    assert page.locator("#home").is_visible()
                    assert page.locator("#districtsCard").is_visible()
                    page.evaluate("""() => {
                        localStorage.setItem('birmingham_campaign_unique_rewards_v1',
                         JSON.stringify({'001:jack:endingTruth':1700000000000}));
                        localStorage.setItem('birmingham_campaign_records_v1',
                         JSON.stringify([{
                           key:'001:jack:1699999999000:endingTruth',
                           caseId:'001',caseTitle:'Долг, который не прощают',
                           heroId:'jack',started:1699999999000,
                           finished:1700000000000,ending:'endingTruth',
                           items:[],deductions:[],visited:[],health:100
                         }]));
                    }""")
                    old_rewards=page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")
                    old_records=page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")
                    page.locator("#districtsCard").click()
                    assert page.locator("#districts").is_visible()
                    assert page.locator(".map-pin").count()==5
                    assert page.locator(".district-case-label").inner_text()==(
                        "ДЕЛО №001 · ДОСТУПНО")
                    assert page.locator("#launchFirstCase").is_visible()
                    assert page.locator("#launchSecondCase").is_hidden()
                    for locked_district in ("aston","centre","jewellery"):
                        page.locator(f'.map-pin[data-district="{locked_district}"]').click()
                        assert page.locator(".district-case-label").inner_text()==(
                            "ИЗ АРХИВА БУДУЩИХ ДЕЛ")
                        assert page.locator(".district-locked").is_visible()
                        assert page.locator("#launchSecondCase").is_hidden()
                        assert page.locator("#launchFirstCase").is_hidden()
                    page.locator('.map-pin[data-district="digbeth"]').click()
                    assert page.locator(".district-case-label").inner_text()==(
                        "ДЕЛО №002 · ДОСТУПНО")
                    # Leaving and reopening the district map used to preserve
                    # an obsolete Digbeth label while resetting to Small Heath.
                    page.locator("#districtBack").click()
                    assert page.locator("#home").is_visible()
                    page.locator("#districtsCard").click()
                    assert page.locator('.map-pin[data-district="small-heath"]').get_attribute(
                        "aria-pressed")=="true"
                    assert page.locator(".district-case-label").inner_text()==(
                        "ДЕЛО №001 · ДОСТУПНО")
                    assert page.locator("#launchSecondCase").is_hidden()
                    assert page.locator("#launchFirstCase").is_visible()
                    page.locator('.map-pin[data-district="digbeth"]').click()
                    assert page.locator("#launchSecondCase").is_visible()
                    assert page.locator("#launchFirstCase").is_hidden()
                    assert page.locator("#districtCase").inner_text()==(
                        "Последний поезд из Бирмингема")
                    assert "Пропавший груз" in page.locator(
                        ".campaign-case002-future").inner_text()
                    page.screenshot(path=str(SHOTS/f"{name}-digbeth.png"))
                    page.locator("#launchSecondCase").click()
                    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                    assert page.url.startswith(origin+"/")
                    assert page.locator("#case002MapReturnBar").is_visible()
                    assert page.locator("#caseBriefing").is_visible()
                    assert page.locator(".briefing-visual img").evaluate(
                        "img => img.complete && img.naturalWidth===720 && img.naturalHeight===900")
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    page.screenshot(path=str(SHOTS/f"{name}-case002-briefing.png"))
                    page.locator("#briefContinue").click()
                    assert page.locator("#launch").is_visible()
                    assert page.locator("#heroGallery .hero-card").count()==5
                    assert page.locator("#priorDetails").is_visible(), (
                        "Case 002 must see the actual saved Case 001 canon on same origin")
                    assert page.locator("#prior option").count()>=2
                    page.locator("#begin").click()
                    assert page.locator("#game").is_visible()
                    assert page.locator("#sceneId").inner_text().startswith("P01")
                    assert page.locator("#case002MapReturnBar").is_visible()
                    page.locator('button.choice[data-to="P02"]').first.click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    case2=page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")
                    assert case2 and json.loads(case2)["node"]=="P02"
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")==old_rewards
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    # New cross-case navigation: Case 002 -> shared achievements
                    # -> Digbeth map -> resume exact same scene and save.
                    assert page.locator("#case002SharedArchiveLink").is_visible()
                    page.locator("#case002SharedArchiveLink").click()
                    page.wait_for_url("**/index.html#campaignAchievements")
                    assert page.locator("#campaignAchievements").is_visible()
                    assert page.locator("#campaignSecondCaseAchievements").is_visible()
                    assert page.locator(
                        "#campaignAchievements .campaign-002-to-digbeth").is_visible()
                    assert page.locator(
                        "#campaignAchievements .campaign-002-to-digbeth").get_attribute(
                        "href")=="#district-digbeth"
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator("#campaignAchievements .campaign-002-to-digbeth").click()
                    page.wait_for_url("**/index.html#district-digbeth")
                    # Same-document hashchange follows URL update in the event
                    # loop, so is_visible() can race the router by one tick.
                    page.wait_for_function("""() => {
                        const d=document.getElementById('districts');
                        const b=document.getElementById('launchSecondCase');
                        return d && !d.hidden && b && !b.hidden &&
                          document.querySelector('.map-pin.selected')?.dataset.district === 'digbeth';
                    }""",timeout=5000)
                    assert page.locator("#districts").is_visible()
                    assert page.locator("#launchSecondCase").is_visible()
                    page.locator("#launchSecondCase").click()
                    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                    assert page.locator("#caseBriefing").is_hidden()
                    assert page.locator("#resume").is_visible()
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator("#case002MapReturn").click()
                    page.wait_for_url("**/index.html#district-digbeth")
                    assert page.locator("#districts").is_visible()
                    assert page.locator('.map-pin[data-district="digbeth"]').get_attribute(
                        "aria-pressed")=="true"
                    assert page.locator("#launchSecondCase").is_visible()
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator('.map-pin[data-district="small-heath"]').click()
                    assert page.locator(".district-case-label").inner_text()==(
                        "ДЕЛО №001 · ДОСТУПНО")
                    assert page.locator("#launchFirstCase").is_visible()
                    assert page.locator("#launchSecondCase").is_hidden()
                    page.locator("#launchFirstCase").click()
                    assert page.locator("#heroSelection").is_visible()
                    page.locator("#heroSelection .hero-begin").click()
                    assert page.locator("#case001Briefing").is_visible()
                    page.locator("#case001Briefing .briefing-start").click()
                    assert page.locator("#caseGame").is_visible()
                    case1=page.evaluate("""() => localStorage.getItem(
                        'birmingham_case_smol_heath_v1_jack')""")
                    assert case1, "The original Case 001 must create its own save"
                    page.screenshot(path=str(SHOTS/f"{name}-case001.png"))
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator("#caseBack").click()
                    assert page.locator("#districts").is_visible()
                    page.locator('.map-pin[data-district="digbeth"]').click()
                    page.locator("#launchSecondCase").click()
                    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                    assert page.locator("#launch").is_visible()
                    assert page.locator("#caseBriefing").is_hidden()
                    assert page.locator("#resume").is_visible()
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case_smol_heath_v1_jack')""")==case1
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")==old_rewards
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    assert page.locator("#caseRewardCount").inner_text()=="0"
                    assert page.locator("#caseUnlockToast").is_hidden()
                    page.set_viewport_size({"width":320,"height":790})
                    assert not page.evaluate(
                        "() => document.documentElement.scrollWidth > window.innerWidth+1"), (
                        name+" case002 overflows 320px vertical phone")
                    assert not errors, name+" page errors: "+str(errors)
                    page.screenshot(path=str(SHOTS/f"{name}-resumed-002-320.png"))
                    # Return to the actual main menu and exercise the new
                    # *read-only* combined archive with two valid earned seals,
                    # one unfinished reward receipt and one orphaned seal.
                    page.goto(origin+"/index.html",wait_until="domcontentloaded")
                    page.evaluate("""() => {
                        const e=window.BirminghamCase002Engine;
                        const a=window.BirminghamCase002Achievements;
                        const pairs=[
                            ['jack','trainEscape'],['finn','trainTruth'],
                            ['samuel','trainDeal']
                        ];
                        const rows=pairs.map(([heroId,ending],i)=>({
                           caseId:'002',heroId,ending,attemptId:'unified-test-'+i,
                           started:1700000000000+i*1000,
                           finished:1700000000500+i*1000,evidence:[],
                           witnesses:{ada:'protected',tommy:'detained',mercer:'located'},
                           flags:{}
                        }));
                        localStorage.setItem(e.RECORD_KEY,JSON.stringify(rows));
                        localStorage.setItem(e.REWARD_KEY,JSON.stringify([
                            '002:jack:trainEscape','002:finn:trainTruth',
                            '002:eleanor:trainControl'
                        ]));
                        localStorage.setItem(a.KEY,JSON.stringify([
                          {id:'two-tracks',hero:'jack',
                           attemptId:'unified-test-0',scene:'P02'},
                          {id:'eight-clues',hero:'finn',
                           attemptId:'unified-test-1',scene:'P02'}
                        ]));
                    }""")
                    archive_before=page.evaluate("""() => Object.fromEntries([
                       window.BirminghamCase002Engine.RECORD_KEY,
                       window.BirminghamCase002Engine.REWARD_KEY,
                       window.BirminghamCase002Achievements.KEY,
                       window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                      ].map(k=>[k,localStorage.getItem(k)]))""")
                    page.locator("#storyStart").click()
                    archive=page.locator("#campaignSecondCaseAchievements")
                    if not archive.is_visible():
                        print("UNIFIED_ARCHIVE_DIAGNOSTIC",{
                         "screen":page.locator("#campaignAchievements").is_visible(),
                         "bridge":page.evaluate("() => typeof window.BirminghamCase002CampaignArchive"),
                         "graph":page.evaluate("() => typeof window.BirminghamCase002Data"),
                         "achievements":page.evaluate("() => typeof window.BirminghamCase002Achievements"),
                         "sections":page.locator("#campaignAchievements .campaign-content").inner_text()[:650],
                         "archive_count":archive.count(),
                         "errors":errors,
                        },flush=True)
                    assert archive.is_visible(), "Case 002 common archive not visible"
                    # Both cases remain present and discoverable, but long
                    # collections start folded instead of forcing deep scroll.
                    first_fold=page.locator("#campaignFirstCaseAchievements")
                    assert first_fold.is_visible()
                    assert first_fold.get_attribute("open") is None
                    assert first_fold.locator(".campaign-award").count()==18
                    milestones=page.locator("#campaignSecondCaseMilestones")
                    assert milestones.is_visible()
                    assert milestones.get_attribute("open") is None
                    assert archive.locator(".campaign-002-achievement").first.is_hidden()
                    jumps=page.locator("#campaignAchievements .campaign-002-jumps")
                    assert jumps.locator("button").count()==2
                    jumps.locator('[data-jump-to="campaignFirstCaseAchievements"]').click()
                    assert first_fold.get_attribute("open") is not None
                    assert first_fold.locator(".campaign-award").first.is_visible()
                    jumps.locator('[data-jump-to="campaignSecondCaseAchievements"]').click()
                    assert archive.is_visible()
                    milestones.locator("summary").click()
                    assert milestones.get_attribute("open") is not None
                    assert archive.locator(".campaign-002-achievement").first.is_visible()
                    assert archive.locator(".campaign-002-achievement").count()==18
                    assert archive.locator('.campaign-002-achievement[data-unlocked="true"]').count()==2
                    assert archive.locator(".campaign-002-reward-group").count()==5
                    # In-case and shared archives must enforce the SAME
                    # no-spoiler contract for unopened milestone conditions.
                    assert archive.locator(
                       '.campaign-002-achievement[data-unlocked="false"]').count()==16
                    locked=archive.locator(
                       '.campaign-002-achievement[data-unlocked="false"]')
                    assert locked.locator("strong").first.inner_text()==(
                        "НЕИЗВЕСТНОЕ ДОСТИЖЕНИЕ")
                    assert locked.locator("p").first.inner_text()==(
                        "Условие откроется после получения.")
                    assert "Доказать убийство Эдварда Хейла" not in (
                        locked.inner_text())
                    earned=archive.locator(
                       '.campaign-002-achievement[data-achievement-id="two-tracks"]')
                    assert earned.locator("strong").inner_text()=="Два следа на карте"
                    assert earned.locator("p").inner_text()==(
                       "Исследовать два независимых маршрута.")
                    assert archive.locator('.campaign-reward-card[data-verified="true"]').count()==2
                    assert "2 / 35" in archive.locator(".campaign-intro").first.inner_text()
                    assert "Ключей наград без подтверждённого прохождения: 1" in archive.inner_text()
                    assert "Уникальных прохождений без записанного знака: 1" in archive.inner_text()
                    assert "3 / 18" not in archive.inner_text(), (
                        "A fabricated achievement must never be credited"
                    )
                    page.locator('#campaignAchievements [data-open-section="campaignHistory"]').click()
                    assert page.locator("#campaignSecondCaseHistory").is_visible()
                    assert page.locator(".campaign-002-attempt").count()==3
                    history_jumps=page.locator("#campaignHistory .campaign-002-jumps")
                    assert history_jumps.locator("button").count()==2
                    history_jumps.locator('[data-jump-to="campaignSecondCaseHistory"]').click()
                    assert page.locator("#campaignSecondCaseHistory").is_visible()
                    assert page.evaluate("""() => document.activeElement.id""")==(
                        "campaignSecondCaseHistory"
                    )
                    summary=page.locator("#campaignHistory .campaign-summary").inner_text()
                    assert "4 / 65" in summary, (
                        "One Case 001 and three Case 002 unique outcomes must share the total"
                    )
                    assert "4" in summary
                    page.locator('#campaignHistory [data-open-section="campaignDossiers"]').click()
                    assert page.locator("#campaignDossiers").is_visible()
                    assert page.locator(".campaign-002-card-title").count()==5
                    hero_jumps=page.locator("#campaignDossiers .campaign-002-jumps")
                    assert hero_jumps.locator("button").count()==5
                    hero_jumps.locator('[data-jump-to="campaignHerofinn"]').click()
                    assert page.evaluate("""() => document.activeElement.id""")==(
                        "campaignHerofinn"
                    )
                    assert "В работе: «Гостья под дождём»" in page.locator(
                        "#campaignDossiers .campaign-card").first.inner_text()
                    assert "Продолжается: P02" not in page.locator(
                        "#campaignDossiers .campaign-card").first.inner_text()
                    assert page.locator(
                        '#campaignDossiers .campaign-tags.campaign-002-tags span[data-unlocked="true"]').count()==3
                    archive_after=page.evaluate("""() => Object.fromEntries([
                       window.BirminghamCase002Engine.RECORD_KEY,
                       window.BirminghamCase002Engine.REWARD_KEY,
                       window.BirminghamCase002Achievements.KEY,
                       window.BirminghamCase002Engine.SAVE_PREFIX+'jack'
                      ].map(k=>[k,localStorage.getItem(k)]))""")
                    assert archive_after==archive_before, (
                        "Viewing the shared archive must never write Case 002 state"
                    )
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    page.set_viewport_size({"width":320,"height":790})
                    assert not page.evaluate(
                        "() => document.documentElement.scrollWidth > innerWidth + 1"
                    ),name+" combined archive overflows 320px phone"
                    page.screenshot(path=str(SHOTS/f"{name}-unified-archive-320.png"))
                    assert not errors, name+" archive JS errors: "+str(errors)
                    context.close()
                    # Silent loss of a Case 001 achievement write must NEVER
                    # show the player a celebratory popup or a phantom seal.
                    restricted=browser.new_context(
                        viewport={"width":375,"height":812},is_mobile=True,
                        device_scale_factor=2,has_touch=True)
                    blocked=restricted.new_page()
                    blocked.route("https://telegram.org/js/telegram-web-app.js",
                                  lambda route:route.abort())
                    blocked.goto(origin+"/index.html",wait_until="domcontentloaded")
                    blocked.evaluate("""() => localStorage.setItem(
                       'birmingham_case_smol_heath_v1_jack',JSON.stringify({
                        node:'endingPower',items:[
                          'envelope','key','invoice','receipt','route',
                          'ledger','testimony','note','witness','ash','overheard'
                        ],trail:['intro','office','pump'],
                        flags:{},started:1770000000000,health:75,riskSeen:[]
                       }))""")
                    blocked.add_init_script("""(() => {
                       const original=Storage.prototype.setItem;
                       Storage.prototype.setItem=function(key,value){
                        // Simulate Safari acknowledging a write while quietly
                        // discarding it. Other localStorage keys still work.
                        if(key==='birmingham_campaign_awards_v1'||
                           key==='birmingham_campaign_unique_rewards_v1')
                          return;
                        return original.call(this,key,value);
                       };
                    })()""")
                    blocked.reload(wait_until="domcontentloaded")
                    blocked.evaluate("""() => document.dispatchEvent(
                      new CustomEvent('birmingham:case-findings-changed'))""")
                    assert blocked.locator(".campaign-unlock-popup").count()==0, (
                        name+" phantom achievement announced after discarded write")
                    assert blocked.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_awards_v1')""") is None
                    blocked.locator("#storyStart").click()
                    assert blocked.locator(
                        "#campaignFirstCaseAchievements .campaign-award.unlocked"
                    ).count()==0
                    assert blocked.locator(
                        "#campaignFirstCaseAchievements .campaign-reward-card.earned"
                    ).count()==0
                    restricted.close()
                    print("PASS "+name+": cross-case archive deep links, Digbeth "
                          "return, Case001 saved-write acknowledgement and no "
                          "phantom notifications; 002 resume and archives intact")
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()

if __name__=="__main__":
    run()
