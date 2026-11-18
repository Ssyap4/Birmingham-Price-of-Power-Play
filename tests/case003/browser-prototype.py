"""Case003 browser test: real taps, file:// and loopback HTTP, no asset substitutions."""
from pathlib import Path
import contextlib, os, threading, http.server, functools
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
HTML=ROOT/"preview/case003-prototype/play.html"
OUT=ROOT/"work/case003-prototype";OUT.mkdir(parents=True,exist_ok=True)
KEY="birmingham_case003_draft_v1_"
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,source,outputfile):
  with contextlib.suppress(BrokenPipeError,ConnectionResetError,ConnectionAbortedError):super().copyfile(source,outputfile)
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
URL=f"http://127.0.0.1:{server.server_port}/preview/case003-prototype/play.html"
def run(browser,url,width,tag):
 ctx=browser.new_context(viewport={"width":width,"height":844},is_mobile=True,has_touch=True,reduced_motion="reduce")
 p=ctx.new_page();p.set_default_timeout(7000);errors=[];http=[]
 p.on("pageerror",lambda e:errors.append(str(e)))
 p.on("response",lambda r:http.append(r.url) if r.status>=400 else None)
 def tap(selector):
  p.locator(selector).tap()
 def state(hero="jack"):
  return p.evaluate("k=>JSON.parse(localStorage.getItem(k))",KEY+hero)
 def act(*actions):
  for a in actions:tap(f'[data-action="{a}"]')
 def fit():
  assert p.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
  p.wait_for_function("Array.from(document.images).filter(i=>i.getClientRects().length).every(i=>i.complete&&i.naturalWidth>0)")
 p.goto(url);tap("#choose");fit();p.screenshot(path=str(OUT/(tag+"-heroes.png")),full_page=True)
 tap("#begin");assert state()["state"]["node"]=="P01"
 act("continue","glass","continue","neighbour","continue")
 tap('[data-tab="evidence"]');assert "Осколки" in p.locator("#toolContent").inner_text()
 tap('[data-tab="claims"]');tap('[data-claim="staged"]')
 tap('input[value="glass"]');tap('[data-prove="staged"]')
 assert state()["state"]["claims"]==[]
 tap('input[value="sound"]');tap('[data-prove="staged"]')
 assert state()["state"]["claims"]==["staged"]
 p.screenshot(path=str(OUT/(tag+"-claims.png")),full_page=True)
 assert "инсценировкой" in p.locator("#toolContent").inner_text()
 tap('[data-tab="scene"]');saved=state();p.reload();tap("#choose");tap("#resume");assert state()==saved
 p.screenshot(path=str(OUT/(tag+"-scene.png")),full_page=True);fit()
 act("summarize","investigate","finish","continue","continue","continue","summary","continue","finish","continue","finish","continue","report")
 assert state()["state"]["ending"]=="Z06" and len(state()["records"])==1
 assert "Новая уникальная награда" in p.locator("#award").inner_text()
 p.screenshot(path=str(OUT/(tag+"-ending.png")),full_page=True)
 tap('[data-tab="exit"]');p.once("dialog",lambda d:d.accept());tap("#begin")
 act("continue","summarize","investigate","finish","continue","continue","continue","summary","continue","finish","continue","finish","continue","report")
 assert len(state()["records"])==2 and p.locator("#award").is_hidden()
 tap('[data-tab="exit"]');tap('[data-hero="finn"]');tap("#begin");assert state("finn")["state"]["node"]=="P01";assert state()["state"]["ending"]=="Z06"
 act("continue");other=ctx.new_page();other.goto(url);other.locator("#choose").tap();other.locator('[data-hero="finn"]').tap();other.locator("#resume").tap();other.locator('[data-action="summarize"]').tap()
 if url.startswith("http"):
  p.locator("#launch").wait_for(state="visible");assert "другой вкладке" in p.locator("#status").inner_text()
 other.close()
 # Explicit damage injection only at this boundary.
 p.reload();tap("#choose");p.evaluate("k=>localStorage.setItem(k,'{')",KEY+"finn");tap('[data-hero="finn"]')
 assert p.locator("#resume").is_hidden();p.once("dialog",lambda d:d.dismiss());tap("#begin")
 assert p.evaluate("k=>localStorage.getItem(k)",KEY+"finn")=="{"
 p.once("dialog",lambda d:d.accept());tap("#begin");assert state("finn")["state"]["node"]=="P01"
 assert p.evaluate("k=>Object.keys(localStorage).some(x=>x.startsWith(k+'_damaged_')&&localStorage.getItem(x)==='{')",KEY+"finn")
 if tag=="webkit":
  act("continue","summarize","investigate","owner","carrier","street","finish","continue","continue","continue","summary","continue","finish","continue","dealer","leave","secure","secure")
  tap('[data-tab="claims"]');tap('[data-claim="provenance"]')
  for clue in ["parcel","owner","transfer"]:tap(f'input[value="{clue}"]')
  tap('[data-prove="provenance"]')
  assert "Часы опознаны" in p.locator("#toolContent").inner_text()
  tap('[data-tab="scene"]');act("finish","continue","restore")
  assert state("finn")["state"]["ending"]=="Z02"
  assert "Владелец часов" in p.locator("#sceneText").inner_text()
  assert "Клара узнаёт" not in p.locator("#sceneText").inner_text()
  p.screenshot(path=str(OUT/"webkit-alternative-ending.png"),full_page=True)
 assert not errors,errors;assert not http,http
 print(tag,"PASS",flush=True);ctx.close()
with sync_playwright() as p:
 for name,engine,width,url in [("chromium",p.chromium,390,HTML.as_uri()),("webkit",p.webkit,320,URL)]:
  if os.environ.get("CASE003_BROWSER") not in (None,name):continue
  b=engine.launch(headless=True)
  try:run(b,url,width,name)
  finally:b.close()
server.shutdown()
