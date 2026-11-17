"""V16 narrow-scope iPhone UX regression: scrolling, controls, routes, visible animation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import http.server, socketserver, threading, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"work"/"iphone-v16"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def log_message(self,*args):pass

def tap(page,sel):
 el=page.locator(sel).first
 el.scroll_into_view_if_needed()
 el.tap(timeout=15000)

def current(page,screen):
 active=page.locator(f"#{screen} .campaign-tabs [data-open-section='{screen}']")
 assert active.count()==1 and active.get_attribute("aria-current")=="true",(screen,active.count())
 other=page.locator(f"#{screen} .campaign-tabs button:not([data-open-section='{screen}'])")
 for n in range(other.count()):
  assert other.nth(n).get_attribute("aria-current")=="false",screen

report=[]
with socketserver.TCPServer(("127.0.0.1",0),Handler) as srv:
 threading.Thread(target=srv.serve_forever,daemon=True).start()
 url="http://127.0.0.1:"+str(srv.server_address[1])+"/index.html"
 with sync_playwright() as p:
  for engine,width in [("webkit",390),("webkit",320),("webkit",360),("webkit",430),("chromium",390)]:
   browser=getattr(p,engine).launch(headless=True)
   ctx=browser.new_context(viewport={"width":width,"height":844},is_mobile=True,
     has_touch=True,device_scale_factor=1,reduced_motion="no-preference")
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda err:errors.append(str(err)))
   page.route("https://**/*",lambda route:route.abort())
   page.goto(url,wait_until="domcontentloaded",timeout=45000)
   page.locator("#home.cinema-home").wait_for(state="visible")
   effects=page.evaluate("""() => {
    const root=getComputedStyle(document.documentElement);
    const hero=document.querySelector('#home .cinema-hero');
    const pseudo=getComputedStyle(hero,'::before');
    const rain=getComputedStyle(document.querySelector('#home .cinema-rain'));
    const smoke=getComputedStyle(document.querySelector('#home .cinema-smoke'));
    return {scroll:root.scrollBehavior,
      lamp:pseudo.animationName,rain:rain.animationName,smoke:smoke.animationName,
      rainImage:rain.backgroundImage};
   }""")
   assert effects["scroll"]=="auto",(engine,width,effects)
   assert "cinema-v16-lamplight" in effects["lamp"]
   assert "cinema-v16-raindrops" in effects["rain"]
   assert "cinema-v16-smoke" in effects["smoke"]
   assert "repeating-linear-gradient" not in effects["rainImage"]
   page.wait_for_timeout(350)
   page.screenshot(path=str(OUT/f"{engine}-{width}-home.png"),full_page=False)
   scroll=page.evaluate("""() => {
     const wanted=Math.min(355,document.documentElement.scrollHeight-innerHeight);
     window.scrollTo({top:wanted,behavior:'auto'});
     return {wanted,actual:scrollY,max:document.documentElement.scrollHeight-innerHeight};
   }""")
   assert scroll["max"]>300,(engine,width,scroll)
   assert abs(scroll["wanted"]-scroll["actual"])<=3,(engine,width,scroll)
   page.wait_for_timeout(180)
   assert abs(page.evaluate("scrollY")-scroll["wanted"])<=3,(engine,width,scroll)
   # Resize is an approximation of browser chrome changing, not a physical swipe.
   page.set_viewport_size({"width":width,"height":780})
   page.wait_for_timeout(180)
   assert abs(page.evaluate("scrollY")-scroll["wanted"])<=3,(engine,width,"viewport resize moved scroll")
   page.set_viewport_size({"width":width,"height":844})
   page.wait_for_timeout(180)
   assert abs(page.evaluate("scrollY")-scroll["wanted"])<=3
   page.emulate_media(reduced_motion="reduce")
   assert page.evaluate("""() => ['.cinema-rain','.cinema-smoke'].every(s=>getComputedStyle(document.querySelector('#home '+s)).animationName==='none') && getComputedStyle(document.querySelector('#home .cinema-rain'),'::after').animationName==='none'""")
   page.emulate_media(reduced_motion="no-preference")
   tap(page,"#districtsCard")
   page.locator("#districts").wait_for(state="visible")
   page.locator("#districtAudioDock .bh-audio-controls").wait_for(state="visible")
   # The real event is approximated; verify neither observer steals the dock.
   page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
   assert page.locator("#districtAudioDock .bh-audio-controls").count()==1
   assert page.locator(".bh-audio-controls").count()==1
   tap(page,"#homeBtn")
   page.locator("#home").wait_for(state="visible")
   page.locator("#cinemaAudioDock .bh-audio-controls").wait_for(state="visible")
   tap(page,"#cabinetProfile")
   page.locator("#profile").wait_for(state="visible")
   assert page.locator("#home").is_hidden()
   assert page.locator("#profile .campaign-profile-links [data-open-section]").count()==3
   assert page.evaluate("scrollY")<12,(engine,width,"profile unexpectedly scrolled to middle")
   page.screenshot(path=str(OUT/f"{engine}-{width}-profile.png"),full_page=False)
   tap(page,"#profile .campaign-profile-links [data-open-section='campaignAchievements']")
   page.locator("#campaignAchievements").wait_for(state="visible")
   current(page,"campaignAchievements")
   assert page.locator("#profile").is_hidden()
   assert page.evaluate("scrollY")<12,(engine,width,"achievements entry scrolled unexpectedly")
   tap(page,"#campaignAchievements .campaign-tabs [data-open-section='campaignDossiers']")
   page.locator("#campaignDossiers").wait_for(state="visible")
   current(page,"campaignDossiers")
   tap(page,"#campaignDossiers .campaign-tabs [data-open-section='campaignHistory']")
   page.locator("#campaignHistory").wait_for(state="visible")
   current(page,"campaignHistory")
   tap(page,"#campaignHistory .campaign-portal-v13 [data-campaign-jump='profile']")
   page.locator("#profile").wait_for(state="visible")
   assert page.locator("#campaignHistory").is_hidden()
   tap(page,"#profile .campaign-portal-v13 [data-campaign-jump='archive']")
   page.locator("#campaignAchievements").wait_for(state="visible")
   current(page,"campaignAchievements")
   page.screenshot(path=str(OUT/f"{engine}-{width}-achievements.png"),full_page=False)
   tap(page,"#homeBtn")
   page.locator("#home").wait_for(state="visible")
   tap(page,"#storyStart")
   page.locator("#campaignAchievements").wait_for(state="visible")
   current(page,"campaignAchievements")
   tap(page,"#campaignAchievements .campaign-tabs [data-open-section='campaignDossiers']")
   page.locator("#campaignDossiers").wait_for(state="visible")
   current(page,"campaignDossiers")
   tap(page,"#homeBtn")
   page.locator("#home").wait_for(state="visible")
   assert page.locator("#cinemaAudioDock .bh-audio-controls").count()==1
   assert not errors,(engine,width,errors)
   assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
   report.append({"engine":engine,"width":width,"status":"PASS",
       "scroll":scroll,"effects":{k:v for k,v in effects.items() if k!="rainImage"},
       "routes":"profile -> achievements -> dossiers -> history -> profile -> achievements -> home -> achievements -> dossiers -> home",
       "jsErrors":0})
   ctx.close()
   browser.close()
 srv.shutdown()
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print("PASS V16 Safari routes/motion/scroll: ",len(report),"combinations")
