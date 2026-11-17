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

def trial_bounds(page,screen,width):
 page.wait_for_function("""({screen,width})=>{
  const el=document.getElementById(screen),r=el.getBoundingClientRect(),head=document.querySelector('.shell>.top'),h=head.getBoundingClientRect(),style=getComputedStyle(el);
  return style.opacity==='1'&&r.width>0&&r.left>=-1&&r.right<=width+1&&h.left>=-1&&h.right<=width+1&&document.documentElement.scrollWidth<=width+1&&innerWidth<=width+1;
 }""",arg={"screen":screen,"width":width},timeout=5000)
 assert page.locator("#"+screen).evaluate("e=>getComputedStyle(e).animationName")== "none"
 for selector in ["#profileBtn","#homeBtn"]:
  b=page.locator(selector)
  if b.is_visible():
   r=b.bounding_box()
   assert r["x"]>=-1 and r["x"]+r["width"]<=width+1 and r["height"]>=44, (screen,width,selector,r)

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
   # V26: the effects use the actual cropped source-image coordinate system.
   geometry_check="""() => {
    const hero=document.querySelector('#home .cinema-hero'),r=hero.getBoundingClientRect();
    const s=getComputedStyle(hero),k=Math.max(r.width/720,r.height/900);
    const x=(r.width-720*k)*.5,y=(r.height-900*k)*.54;
    const record=hero.querySelector('.cinema-vinyl-glint').getBoundingClientRect();
    const smoke=getComputedStyle(hero.querySelector('.cinema-smoke'));
    const rain=hero.querySelector('.cinema-rain').getBoundingClientRect();
    const near=(a,b)=>Math.abs(a-b)<1.2;
    return Math.abs(parseFloat(s.getPropertyValue('--cabinet-scale'))-k)<.001
      && near(record.left-r.left,x+536*k) && near(record.top-r.top,y+470*k)
      && near(record.width,146*k) && near(record.height,20*k)
      && near(parseFloat(smoke.left),x+146*k) && near(parseFloat(smoke.top),y+435*k)
      && near(rain.left-r.left,x) && near(rain.top-r.top,y)
      && near(rain.width,720*k) && near(rain.height,900*k);
   }"""
   page.wait_for_function(geometry_check)
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
   menu=page.locator("#home .cinema-menu")
   assert menu.locator(".cabinet-entry").count()==6
   assert menu.locator(".cabinet-entry-icon").count()==0
   page.wait_for_function("Array.from(document.querySelectorAll('#home .cabinet-entry-art img')).every(i=>i.complete && i.naturalWidth>0)")
   assert page.locator("#criminalEntry .cabinet-entry-art img").evaluate("i=>i.getAttribute('src')==='assets/cabinet/criminal-menu-v23.webp' && i.naturalWidth===792 && i.naturalHeight===720")
   assert page.locator("#storyStart .cabinet-entry-art img").evaluate("i=>i.getAttribute('src')==='assets/cabinet/achievements-menu-v24.webp' && i.naturalWidth===788 && i.naturalHeight===720 && getComputedStyle(i).objectFit==='cover' && getComputedStyle(i).transform==='none'")
   assert page.locator(".cabinet-entry-quiz .cabinet-entry-art img").evaluate("i=>i.getAttribute('src')==='assets/cabinet/trials-menu-v25.webp' && i.naturalWidth===960 && i.naturalHeight===720 && getComputedStyle(i).objectFit==='cover' && getComputedStyle(i).transform==='none'")
   assert page.evaluate("""async () => {
    const images=[...document.querySelectorAll('#home .cabinet-entry-art img')];
    await Promise.all(images.map(i=>i.decode()));
    return images.every(i=>i.naturalWidth>0 && getComputedStyle(i).opacity==='1');
   }""")
   assert page.locator("#profileCard .cabinet-entry-art").evaluate("el=>getComputedStyle(el).padding==='0px' && el.querySelectorAll('img').length===2 && [...el.querySelectorAll('img')].every(i=>getComputedStyle(i).borderTopWidth==='0px')")
   cards=menu.locator(".cabinet-entry")
   for i in range(6):
    geometry=cards.nth(i).evaluate("""el=>{let a=el.querySelector('.cabinet-entry-art').getBoundingClientRect(), t=el.querySelector('.cabinet-entry-copy').getBoundingClientRect(), b=el.getBoundingClientRect();return {ratio:a.width/b.width,height:a.height,overlap:a.right>t.left+1,scrim:getComputedStyle(el,'::before').content}}""")
    assert .36<=geometry["ratio"]<=.46 and geometry["height"]>=105 and not geometry["overlap"] and geometry["scrim"]=="none",(engine,width,i,geometry)
    # Scroll every actual art surface into the viewport before capture, then
    # allow two rendering frames. The full-page screenshot alone hid a paint defect.
    card=cards.nth(i)
    card.scroll_into_view_if_needed()
    page.evaluate("()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))")
    card.screenshot(path=str(OUT/f"{engine}-{width}-v21-card-{i+1}.png"))
   menu.screenshot(path=str(OUT/f"{engine}-{width}-v21-menu.png"))
   page.evaluate("window.scrollTo(0,0)")
   page.wait_for_function("!document.querySelector('#home').classList.contains('cinema-still')")
   if engine=="webkit" and width==390:
    # Record the same cabinet at four moments for human visual comparison.
    for seconds,delay in [(0,0),(1,1000),(3,2000),(6,3000)]:
     page.wait_for_timeout(delay)
     page.locator("#home .cinema-hero").screenshot(path=str(OUT/f"webkit-390-cabinet-t{seconds}.png"),animations="allow")
    # Exercise the music-playing visual state independently of codec/autoplay support.
    was_playing=page.evaluate("document.body.classList.contains('bh-music-playing')")
    page.evaluate("document.body.classList.add('bh-music-playing')")
    assert page.locator("#home .cinema-vinyl-glint").evaluate("el=>getComputedStyle(el,'::before').animationName==='cinema-vinyl' && parseFloat(getComputedStyle(el).opacity)>=.4")
    # WebKit may report the underlying pseudo-element transform rather than
    # its animated value. Verify actual painted pixels in the record area.
    vinyl=page.locator("#home .cinema-vinyl-glint")
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_function("!document.querySelector('#home').classList.contains('cinema-still')")
    assert vinyl.evaluate("el=>getComputedStyle(el,'::before').animationPlayState==='running'")
    frames=[]
    for _ in range(4):
     frames.append(vinyl.screenshot(animations="allow"))
     page.wait_for_timeout(137)
    assert len(set(frames))>1,"stationary record overlay: identical painted frames"
    for frame in range(2):
     page.wait_for_timeout(470)
     page.locator("#home .cinema-hero").screenshot(path=str(OUT/f"webkit-390-v24-vinyl-{frame}.png"),animations="allow")
    if not was_playing:
     page.evaluate("document.body.classList.remove('bh-music-playing')")
   was_playing=page.evaluate("document.body.classList.contains('bh-music-playing')")
   page.evaluate("document.body.classList.add('bh-music-playing')")
   page.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)")
   page.wait_for_function("document.querySelector('#home').classList.contains('cinema-still')")
   assert page.evaluate("getComputedStyle(document.querySelector('#home .cinema-rain'),'::after').animationPlayState")=="paused"
   assert page.evaluate("getComputedStyle(document.querySelector('#home .cinema-vinyl-glint'),'::before').animationPlayState")=="paused"
   if not was_playing:
    page.evaluate("document.body.classList.remove('bh-music-playing')")
   page.evaluate("window.scrollTo(0,0)")
   page.wait_for_function("!document.querySelector('#home').classList.contains('cinema-still')")
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
   page.wait_for_function(geometry_check)
   page.wait_for_timeout(180)
   assert abs(page.evaluate("scrollY")-scroll["wanted"])<=3,(engine,width,"viewport resize moved scroll")
   page.set_viewport_size({"width":width,"height":844})
   page.wait_for_function(geometry_check)
   page.wait_for_timeout(180)
   assert abs(page.evaluate("scrollY")-scroll["wanted"])<=3
   was_playing=page.evaluate("document.body.classList.contains('bh-music-playing')")
   page.evaluate("document.body.classList.add('bh-music-playing')")
   page.emulate_media(reduced_motion="reduce")
   assert page.evaluate("getComputedStyle(document.querySelector('#home .cinema-vinyl-glint'),'::before').animationName==='none'")
   assert page.evaluate("""() => ['.cinema-rain','.cinema-smoke'].every(s=>getComputedStyle(document.querySelector('#home '+s)).animationName==='none') && getComputedStyle(document.querySelector('#home .cinema-rain'),'::after').animationName==='none'""")
   page.emulate_media(reduced_motion="no-preference")
   if not was_playing:
    page.evaluate("document.body.classList.remove('bh-music-playing')")
   tap(page,"#districtsCard")
   page.locator("#districts").wait_for(state="visible")
   assert page.locator("body>.shell>.top").evaluate("""el=>{const brand=el.querySelector('.brand'),actions=el.querySelector('.top-actions'),word=brand.querySelector('strong'),menu=el.querySelector('#homeBtn');const b=brand.getBoundingClientRect(),a=actions.getBoundingClientRect();return b.right<=a.left+1&&word.scrollWidth<=word.clientWidth+1&&menu.getBoundingClientRect().height>=44}"""),(engine,width,"internal header overlap")
   page.locator("body>.shell>.top").screenshot(path=str(OUT/f"{engine}-{width}-v29-internal-header.png"))
   title=page.locator("#districts .district-atlas-title")
   assert title.evaluate("""el=>{const bounds=el.getBoundingClientRect(), words=[...el.querySelectorAll('span')];return words.length===2&&words.every(w=>{const range=document.createRange();range.selectNodeContents(w);const rects=[...range.getClientRects()];return rects.length===1&&rects[0].left>=bounds.left-1&&rects[0].right<=bounds.right+1})}"""),(engine,width,"atlas heading wraps or clips")
   page.locator("#districts .districts-heading").screenshot(path=str(OUT/f"{engine}-{width}-v28-atlas-heading.png"))
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
   assert page.locator("#profile .campaign-portal-v13").count()==0
   page.wait_for_function("document.querySelector('#profile .profile-v21-art img').naturalWidth===959")
   assert page.locator("#profile .profile-v21-art img").evaluate("el=>el.naturalHeight===540 && getComputedStyle(el).objectFit==='contain'")
   page.locator("#profile .profile-v21-art").screenshot(path=str(OUT/f"{engine}-{width}-v22-profile-art.png"))
   assert page.locator("#profile .player-overview-card").count()==3
   assert page.evaluate("scrollY")<12,(engine,width,"profile unexpectedly scrolled to middle")
   page.screenshot(path=str(OUT/f"{engine}-{width}-profile.png"),full_page=False)
   tap(page,"#profile .campaign-profile-links [data-open-section='campaignAchievements']")
   page.locator("#campaignAchievements").wait_for(state="visible")
   current(page,"campaignAchievements")
   assert page.locator("#campaignAchievements .campaign-002-overview").evaluate("""el=>{const cells=[...el.querySelectorAll('.campaign-002-metric')];const boxes=cells.map(c=>c.getBoundingClientRect());return cells.length===3&&boxes.every(b=>Math.abs(b.top-boxes[0].top)<2)&&cells.every(c=>c.scrollWidth<=c.clientWidth+1)}"""),(engine,width,"archive metric layout")
   assert page.locator("#campaignAchievements .campaign-tabs").evaluate("el=>[...el.querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=48&&b.scrollWidth<=b.clientWidth+1)")
   page.locator("#campaignAchievements .campaign-002-overview").screenshot(path=str(OUT/f"{engine}-{width}-v28-archive-summary.png"))
   assert page.locator("#profile").is_hidden()
   assert page.evaluate("scrollY")<12,(engine,width,"achievements entry scrolled unexpectedly")
   # Expand two independent folds and preserve explicit closure of a nested one.
   page.evaluate("""() => {
    document.querySelector('#campaignFirstCaseAchievements').open=true;
    document.querySelector('#campaignSecondCaseMilestones').open=true;
    const nested=document.querySelector('#campaignFirstCaseAchievements details[open]');
    if(nested)nested.open=false;
   }""")
   closed=page.locator("#campaignFirstCaseAchievements details[data-archive-fold]").first
   closed.evaluate("(el)=>el.open=false")
   page.locator("#campaignSecondCaseMilestones > summary").scroll_into_view_if_needed()
   archive_y=page.evaluate("scrollY")
   page.evaluate("window.BirminghamCampaign.open('campaignAchievements')")
   assert abs(page.evaluate("scrollY")-archive_y)<=3,(engine,width,"same archive tab snapped")
   page.evaluate("document.dispatchEvent(new Event('birmingham:case-findings-changed'))")
   assert page.locator("#campaignFirstCaseAchievements").evaluate("(el)=>el.open")
   assert page.locator("#campaignSecondCaseMilestones").evaluate("(el)=>el.open")
   assert not closed.evaluate("(el)=>el.open")
   assert abs(page.evaluate("scrollY")-archive_y)<=3,(engine,width,"archive refresh shifted scroll")
   tap(page,"#campaignAchievements .campaign-tabs [data-open-section='campaignDossiers']")
   page.locator("#campaignDossiers").wait_for(state="visible")
   current(page,"campaignDossiers")
   assert page.locator("#campaignDossiers .campaign-portrait").first.evaluate("(el)=>getComputedStyle(el).objectFit")=="contain"
   assert page.locator("#campaignDossiers .campaign-002-jumps").evaluate("""el=>{const buttons=[...el.querySelectorAll('button')];return buttons.length===5&&buttons.every(b=>b.getBoundingClientRect().height>=48)&&Math.abs(buttons[4].getBoundingClientRect().width-el.getBoundingClientRect().width)<2}""")
   page.locator("#campaignDossiers .campaign-002-jumps").screenshot(path=str(OUT/f"{engine}-{width}-v28-dossier-index.png"))
   page.locator("#campaignDossiers .campaign-portrait").first.scroll_into_view_if_needed()
   page.screenshot(path=str(OUT/f"{engine}-{width}-dossier.png"))
   tap(page,"#campaignDossiers .campaign-tabs [data-open-section='campaignHistory']")
   page.locator("#campaignHistory").wait_for(state="visible")
   current(page,"campaignHistory")
   assert page.locator(".campaign-hub .campaign-portal-v13").count()==0
   assert page.locator(".campaign-hub .campaign-criminal-jump").count()==0
   tap(page,"#homeBtn")
   tap(page,"#cabinetProfile")
   page.locator("#profile").wait_for(state="visible")
   assert page.locator("#campaignHistory").is_hidden()
   tap(page,"#profile .campaign-profile-links [data-open-section='campaignAchievements']")
   page.locator("#campaignAchievements").wait_for(state="visible")
   current(page,"campaignAchievements")
   assert page.locator("#campaignFirstCaseAchievements").evaluate("(el)=>el.open")
   assert page.locator("#campaignSecondCaseMilestones").evaluate("(el)=>el.open")
   assert not page.locator("#campaignFirstCaseAchievements details[data-archive-fold]").first.evaluate("(el)=>el.open")
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
   # Real same-origin navigation and an actual engine-created incomplete slot.
   # One width per engine is sufficient; geometry is already tested above.
   if width==390:
    tap(page,"#districtsCard")
    tap(page,'.map-pin[data-district="digbeth"]')
    launch=page.locator("#launchSecondCase")
    assert launch.evaluate("el=>el.getBoundingClientRect().height>=60&&el.scrollWidth<=el.clientWidth+1")
    launch.screenshot(path=str(OUT/f"{engine}-{width}-v29-case-entry.png"))
    tap(page,"#launchSecondCase")
    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
    assert page.locator("#caseBriefing .briefing-rule").count()==3
    assert page.locator("#briefContinue").evaluate("el=>el.getBoundingClientRect().height>=54&&el.scrollWidth<=el.clientWidth+1")
    page.locator("#caseBriefing .briefing-rules").screenshot(path=str(OUT/f"{engine}-{width}-v30-briefing-rules.png"))
    tap(page,"#briefContinue")
    tap(page,'#heroGallery [data-hero="jack"]')
    tap(page,"#begin")
    page.locator("#game").wait_for(state="visible")
    tap(page,'button.choice[data-to="P02"]')
    assert page.locator("#sceneId").inner_text().startswith("P02")
    save=page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")
    assert save and json.loads(save)["node"]=="P02"
    tap(page,"#case002MapReturn")
    page.wait_for_url("**/index.html#district-digbeth")
    page.locator("#launchSecondCase").wait_for(state="visible")
    assert "В РАБОТЕ: 1" in page.locator("#campaignDistrictState").inner_text()
    assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==save
    # The in-app archive leaves the existing Digbeth URL untouched.
    tap(page,"#districts .campaign-portal-v13 [data-campaign-jump='archive']")
    page.locator("#campaignAchievements").wait_for(state="visible")
    assert page.url.endswith("#district-digbeth")
    tap(page,"#campaignAchievements .campaign-002-to-digbeth")
    page.locator("#launchSecondCase").wait_for(state="visible")
    assert page.locator("#campaignAchievements").is_hidden()
    assert "В РАБОТЕ: 1" in page.locator("#campaignDistrictState").inner_text()
    tap(page,"#launchSecondCase")
    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
    tap(page,"#resume")
    assert page.locator("#sceneId").inner_text().startswith("P02")
    assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==save
    tap(page,"#case002MapReturn")
    page.wait_for_url("**/index.html#district-digbeth")
    page.locator("#launchSecondCase").wait_for(state="visible")
    page.screenshot(path=str(OUT/f"{engine}-{width}-digbeth-resume.png"))
    tap(page,"#homeBtn")
    page.locator("#home").wait_for(state="visible")
    # Assert criminal atlas -> common archive -> profile -> detective atlas.
    tap(page,"#criminalEntry")
    page.locator("#criminalScreen .cr-map").wait_for(state="visible")
    assert page.locator("#criminalScreen .cr-mission-list").evaluate("""el=>{const cards=[...el.querySelectorAll('button[data-mission]')];return cards.length===5&&cards.every(c=>c.getBoundingClientRect().height>=98&&c.scrollWidth<=c.clientWidth+1&&c.querySelector('.cr-mission-action'))}""")
    page.locator("#criminalScreen .cr-mission-list").screenshot(path=str(OUT/f"{engine}-{width}-v29-criminal-entry.png"))
    tap(page,"#criminalScreen .campaign-portal-v13 [data-campaign-jump='archive']")
    page.locator("#campaignAchievements").wait_for(state="visible")
    tap(page,"#homeBtn")
    tap(page,"#cabinetProfile")
    page.locator("#profile").wait_for(state="visible")
    tap(page,"#homeBtn")
    tap(page,"#districtsCard")
    page.locator("#districts").wait_for(state="visible")
    assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==save
    tap(page,"#homeBtn")
    page.locator("#home").wait_for(state="visible")
    # Isolated test context only: malformed archive bytes must survive browsing.
    page.evaluate("""() => {
     localStorage.setItem('birmingham_campaign_records_v1','{broken-records');
     localStorage.setItem('birmingham_campaign_unique_rewards_v1','{broken-rewards');
     localStorage.setItem('birmingham_campaign_awards_v1','{broken-awards');
    }""")
    page.goto(url,wait_until="domcontentloaded")
    tap(page,"#cabinetProfile")
    assert page.locator("#profile .player-overview-card").first.get_attribute("data-status")=="damaged"
    tap(page,"#profile .campaign-profile-links [data-open-section='campaignAchievements']")
    page.locator("#campaignAchievements .campaign-001-alert").wait_for(state="visible")
    assert page.locator("#campaignFirstCaseAchievements .campaign-award.unlocked").count()==0
    assert page.evaluate("""() => ['records','unique_rewards','awards'].map(k=>localStorage.getItem('birmingham_campaign_'+k+'_v1'))""")==["{broken-records","{broken-rewards","{broken-awards"]
    assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==save
    tap(page,"#homeBtn")
    page.locator("#home").wait_for(state="visible")
   if engine=="chromium" and width==390:
    # Test real local MP3 playback, not only animation or playlist mathematics.
    page.goto(url,wait_until="domcontentloaded")
    page.locator("#home").wait_for(state="visible")
    if page.locator("#bhMusic").get_attribute("aria-pressed")=="false":tap(page,"#bhMusic")
    else:tap(page,"#bhMenuTrack")
    page.wait_for_function("BirminghamAudio.getState().mode==='menu' && BirminghamAudio.getState().currentTime>.15",timeout=15000)
    page.wait_for_function("BirminghamAudio.getState().phase==='idle'",timeout=10000)
    first_track=page.evaluate("BirminghamAudio.getState().trackId")
    tap(page,"#bhMenuTrack")
    page.wait_for_function("id=>BirminghamAudio.getState().mode==='menu' && BirminghamAudio.getState().trackId!==id && BirminghamAudio.getState().currentTime>.15",arg=first_track,timeout=15000)
    assert {first_track,page.evaluate("BirminghamAudio.getState().trackId")}=={"covert-affair","just-as-soon"}
    tap(page,"#criminalEntry")
    page.wait_for_function("BirminghamAudio.getState().mode==='criminal' && BirminghamAudio.getState().currentTime>.15",timeout=15000)
    tap(page,"#homeBtn")
    page.wait_for_function("BirminghamAudio.getState().mode==='menu'",timeout=15000)
    tap(page,"#bhMusic")
    page.wait_for_function("BirminghamAudio.getState().activeCount===0 && BirminghamAudio.getState().levels.every(x=>x===0)")
    assert page.evaluate("localStorage.getItem('bh_music_enabled')")=="false"
    tap(page,"#bhMusic")
    page.wait_for_function("BirminghamAudio.getState().mode==='menu' && BirminghamAudio.getState().currentTime>.15",timeout=15000)
    tap(page,"#districtsCard")
    tap(page,'.map-pin[data-district="digbeth"]')
    tap(page,"#launchSecondCase")
    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
    # A saved P02 slot was created by the route test above. The briefing
    # is intentionally skipped on re-entry; the actual resume button is the gesture.
    page.locator("#launch").wait_for(state="visible")
    assert page.locator("#caseBriefing").is_hidden()
    assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==save
    tap(page,"#resume")
    assert page.locator("#sceneId").inner_text().startswith("P02")
    page.wait_for_function("BirminghamAudio.getState().mode==='detective' && BirminghamAudio.getState().currentTime>.15",timeout=15000)
    assert page.locator("#case002AudioDock .bh-audio-controls").count()==1
    tap(page,"#bhMusic")
    page.wait_for_function("BirminghamAudio.getState().activeCount===0")
    assert page.evaluate("localStorage.getItem('bh_music_enabled')")=="false"
    page.goto(url,wait_until="domcontentloaded")
    assert page.locator("#bhMusic").get_attribute("aria-pressed")=="false"
   if width==390:
    # Both existing trial modes must be reachable from the single home card.
    page.goto(url,wait_until="domcontentloaded")
    tap(page,".cabinet-entry-quiz")
    page.locator("#choose").wait_for(state="visible")
    assert page.locator("#difficultyList button.mode").count()==4
    assert page.locator("#difficultyList .mode.upcoming").count()==1
    assert page.locator("#trialMode [data-trial-mode='classic']").get_attribute("aria-pressed")=="true"
    assert page.locator("#choose .trial-audio-dock .bh-audio-controls").count()==1
    tap(page,"#trialMode [data-trial-mode='timed']")
    assert page.locator("#trialMode [data-trial-mode='timed']").get_attribute("aria-pressed")=="true"
    assert "15 секунд" in page.locator("#chooseDescription").inner_text()
    trial_bounds(page,"choose",width)
    page.screenshot(path=str(OUT/f"{engine}-{width}-v39-trials-selector.png"),full_page=True)
    tap(page,"#difficultyList button.mode")
    page.locator("#play").wait_for(state="visible")
    assert page.locator("#clockWrap").is_visible()
    page.wait_for_function("Number(document.getElementById('clock').textContent)<15")
    page.wait_for_function("document.getElementById('questionImage').dataset.imageStatus==='ready'")
    trial_bounds(page,"play",width)
    assert page.locator("#answers .answer:visible").count()==4
    page.screenshot(path=str(OUT/f"{engine}-{width}-v39-trial-full-question.png"),full_page=True)
    # Simulate the mobile lifecycle without relying on the test-host tab focus.
    page.evaluate("""() => {Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))}""")
    paused=page.locator("#clock").inner_text()
    page.wait_for_timeout(1250)
    assert page.locator("#clock").inner_text()==paused
    page.evaluate("""() => {delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))}""")
    page.wait_for_function("old=>Number(document.getElementById('clock').textContent)<Number(old)",arg=paused)
    # A cancelled leave must preserve the active timer.
    page.once("dialog",lambda d:d.dismiss())
    tap(page,"#homeBtn")
    assert page.locator("#play").is_visible()
    assert page.locator("#play .trial-audio-dock .bh-audio-controls").count()==1
    assert page.locator("#gameExitBtn").is_hidden()
    tap(page,"#fiftyBtn")
    assert page.locator("#answers .answer:visible").count()==2
    assert page.locator("#fiftyBtn").is_disabled()
    page.screenshot(path=str(OUT/f"{engine}-{width}-v32-trial-question.png"),full_page=True)
    tap(page,"#skipBtn")
    assert page.locator("#skipBtn").is_disabled()
    tap(page,"#nextBtn")
    assert page.locator("#questionNumber").inner_text().startswith("02")
    for _ in range(3):
     wrong=page.evaluate("""() => {
       const q=Object.values(window.BIRMINGHAM_QUESTIONS).flat().find(x=>x.question===document.getElementById('questionText').textContent);
       return [...document.querySelectorAll('#answers .answer')].findIndex(b=>b.textContent!==q.correct);
     }""")
     assert wrong>=0
     page.locator("#answers .answer").nth(wrong).tap()
     tap(page,"#nextBtn")
    page.locator("#result").wait_for(state="visible")
    assert page.locator("#resultTitle").inner_text()=="ПОПЫТКА ЗАВЕРШЕНА"
    assert page.locator("#result .trial-audio-dock .bh-audio-controls").count()==1
    assert page.locator("#trialSaveStatus").get_attribute("data-status")=="ready"
    trial_bounds(page,"result",width)
    page.screenshot(path=str(OUT/f"{engine}-{width}-v39-trial-result.png"),full_page=True)
    tap(page,"#retryBtn")
    assert page.locator("#trialMode [data-trial-mode='timed']").get_attribute("aria-pressed")=="true"
    tap(page,"#trialMode [data-trial-mode='classic']")
    tap(page,"#difficultyList button.mode")
    assert page.locator("#clockWrap").is_hidden()
    page.once("dialog",lambda d:d.dismiss())
    tap(page,"#homeBtn")
    assert page.locator("#play").is_visible()
    page.once("dialog",lambda d:d.accept())
    tap(page,"#homeBtn")
    page.locator("#home").wait_for(state="visible")
    page.locator("#cinemaAudioDock .bh-audio-controls").wait_for(state="visible")
    tap(page,"#cabinetProfile")
    assert page.locator("#dossierHistory").is_visible()
    assert page.locator("#dossierHistory .dossier-record").count()>=1
    assert page.locator("#achievementList .achievement").count()==6
    assert page.locator("#levelRecords .achievement").count()==4
    tap(page,"#profile .campaign-profile-links [data-open-section=campaignAchievements]")
    assert page.locator("#campaignTrialsAchievements").is_visible()
    assert not page.locator("#campaignTrialsAchievements").evaluate("e=>!!e.closest('#campaignFirstCaseAchievements')")
    tap(page,"#campaignAchievements [data-jump-to=campaignTrialsAchievements]")
    assert page.locator("#campaignTrialsAchievements").evaluate("e=>document.activeElement===e")
    tap(page,"#campaignAchievements [data-open-section=campaignHistory]")
    assert page.locator("#campaignTrialsHistory").is_visible()
    tap(page,"#campaignHistory [data-jump-to=campaignTrialsHistory]")
    tap(page,"#campaignTrialsHistory summary")
    assert page.locator("#campaignTrialsHistory .trial-history-row").count()>=1
    tap(page,"#homeBtn")
    assert page.locator(".bh-audio-controls").count()==1
   if width!=390:
    # Compact portrait layouts: exercise actual selector and active question,
    # not only the final home viewport.
    page.goto(url,wait_until="domcontentloaded")
    tap(page,".cabinet-entry-quiz")
    trial_bounds(page,"choose",width)
    tap(page,"#difficultyList button.mode")
    trial_bounds(page,"play",width)
    page.wait_for_function("document.getElementById('questionImage').dataset.imageStatus==='ready'")
    page.screenshot(path=str(OUT/f"{engine}-{width}-v39-trial-full-question.png"),full_page=True)
    for _ in range(3):
     wrong=page.evaluate("""() => {
       const q=Object.values(window.BIRMINGHAM_QUESTIONS).flat().find(x=>x.question===document.getElementById('questionText').textContent);
       return [...document.querySelectorAll('#answers .answer')].findIndex(b=>b.textContent!==q.correct);
     }""")
     assert wrong>=0
     page.locator("#answers .answer").nth(wrong).tap()
     tap(page,"#nextBtn")
    trial_bounds(page,"result",width)
    page.screenshot(path=str(OUT/f"{engine}-{width}-v39-trial-result.png"),full_page=True)
    tap(page,"#resultHomeBtn")
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
