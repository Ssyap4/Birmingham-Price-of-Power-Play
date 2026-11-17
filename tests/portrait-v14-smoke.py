"""Small Chromium/WebKit portrait QA for V14 presentation only; no mission playthroughs."""
from __future__ import annotations
import http.server
import json
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'work'/'portrait-v14'
OUT.mkdir(parents=True,exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):
        pass

with socketserver.TCPServer(('127.0.0.1',0),Handler) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin=f'http://127.0.0.1:{server.server_address[1]}'
    results=[]
    with sync_playwright() as p:
        for engine in ('chromium','webkit'):
            browser=getattr(p,engine).launch()
            for width in (320,390):
                context=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
                page=context.new_page()
                errors=[]
                page.on('pageerror',lambda err: errors.append(str(err)))
                page.route('https://**/*',lambda route:route.abort())
                page.goto(origin+'/index.html',wait_until='domcontentloaded')
                page.locator('#districtsCard').tap()
                page.wait_for_function("!document.getElementById('districts').hidden && !!document.querySelector('#districtAudioDock .bh-audio-controls')")
                atlas=page.evaluate("""() => {
                    const root=document.getElementById('districts');
                    const audio=document.querySelector('#districtAudioDock .bh-audio-controls');
                    const map=document.querySelector('#districts .map-panel');
                    const a=audio.getBoundingClientRect(),m=map.getBoundingClientRect();
                    return {opacity:getComputedStyle(root).opacity,animation:getComputedStyle(root).animationName,
                      audioBeforeMap:a.bottom<=m.top+1,buttons:audio.querySelectorAll('button').length,
                      exitVisible:getComputedStyle(document.getElementById('gameExitBtn')).display!=='none',
                      overflow:document.documentElement.scrollWidth-innerWidth};
                }""")
                assert atlas['opacity']=='1' and atlas['animation']=='none', (engine,width,atlas)
                assert atlas['audioBeforeMap'] and not atlas['exitVisible'] and atlas['buttons']>=3, (engine,width,atlas)
                assert atlas['overflow']<=1, (engine,width,atlas)
                page.screenshot(path=str(OUT/f'{engine}-{width}-atlas-v14.png'),full_page=True)
                page.locator('#districts [data-campaign-jump="archive"]').tap()
                page.wait_for_function("!document.getElementById('campaignAchievements').hidden")
                archive=page.evaluate("""() => {
                   const tabs=document.querySelector('#campaignAchievements .campaign-tabs');
                   const buttons=[...tabs.querySelectorAll('button')].map(el=>el.getBoundingClientRect());
                   const screen=document.getElementById('campaignAchievements');
                   return {rows:new Set(buttons.map(el=>Math.round(el.top))).size,
                     opacity:getComputedStyle(screen).opacity,animation:getComputedStyle(screen).animationName,
                     layout:getComputedStyle(tabs).display,overflow:document.documentElement.scrollWidth-innerWidth};
                }""")
                assert archive['rows']==1 and archive['layout']=='grid', (engine,width,archive)
                assert archive['opacity']=='1' and archive['animation']=='none' and archive['overflow']<=1, (engine,width,archive)
                page.screenshot(path=str(OUT/f'{engine}-{width}-archive-v14.png'),full_page=False)
                page.locator('#campaignAchievements [data-campaign-jump="criminal"]').tap()
                page.wait_for_function("!document.getElementById('criminalScreen').hidden")
                assert page.locator('#criminalScreen .cr-map').is_visible()
                assert not page.locator('#gameExitBtn').is_visible()
                page.locator('#criminalScreen [data-campaign-jump="detective"]').tap()
                page.wait_for_function("!document.getElementById('districts').hidden")
                page.wait_for_function("!!document.querySelector('#districtAudioDock .bh-audio-controls')")
                page.locator('#districtBack').tap()
                page.wait_for_function("!document.getElementById('home').hidden")
                page.wait_for_function("!!document.querySelector('#cinemaAudioDock .bh-audio-controls')")
                assert not errors, (engine,width,errors)
                results.append({'engine':engine,'width':width,'atlas':atlas,'archive':archive})
                context.close()
            browser.close()
    server.shutdown()
(OUT/'report.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print('PASS V14 portrait smoke: 4 browser/width combinations, atlas/audio/archive/campaign/home')