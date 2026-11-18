"""Controlled delayed app.js delivery: no interaction before initialization."""
import asyncio
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
async def run():
 server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
 Thread(target=server.serve_forever,daemon=True).start()
 origin=f'http://127.0.0.1:{server.server_port}'
 try:
  async with async_playwright() as p:
   for name in ('chromium','webkit'):
    b=await getattr(p,name).launch()
    c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=await c.new_page();release=asyncio.Event();received=asyncio.Event()
    async def hold(route):
     received.set();await release.wait();await route.continue_()
    await page.route('**/preview/case002-prototype/app.js',hold)
    await page.route('https://**/*',lambda route:route.abort())
    try:
     await page.goto(origin+'/preview/case002-prototype/index.html?from=map',wait_until='commit')
     await asyncio.wait_for(received.wait(),timeout=10)
     button=page.locator('#briefContinue')
     await button.wait_for(state='visible',timeout=10000)
     disabled=await button.is_disabled()
     assert disabled, 'briefing action enabled before initialization'
     assert await page.locator('#briefLoading').is_visible()
     print(name,'PASS: loading button disabled before initialization',flush=True)
     release.set()
     await page.wait_for_load_state('domcontentloaded')
     assert await button.is_enabled()
     assert await page.locator('#briefLoading').is_hidden()
     await button.tap()
     assert await page.locator('#launch').is_visible()
     print(name,'post-init first usable tap PASS',flush=True)
    finally:
     release.set();await c.close();await b.close()
 finally:server.shutdown()
asyncio.run(run())

