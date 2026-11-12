"""Mobile detective inventory checks in the supported landscape orientation."""
import json
from playwright.sync_api import sync_playwright
import run_tests as q

WIDTHS = (667, 812, 844)
results = []

def check(browser, width):
    g = q.game(browser, mobile=True)
    try:
        g.p.set_viewport_size({'width': width, 'height': 375})
        controls = g.p.evaluate("""() => {
          const exit=document.querySelector('#gameExitBtn');
          const audio=document.querySelector('.bh-audio-controls');
          const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
          const music=document.querySelector('#bhMusic'),effects=document.querySelector('#bhEffects');
          return {exit:exit?rect(exit):null,audio:audio?rect(audio):null,music:music?rect(music):null,effects:effects?rect(effects):null};
        }""")
        assert controls['exit'] and controls['audio'], controls
        assert controls['music'] and controls['effects'], controls
        def intersects(a,b):
            return a['left'] < b['right'] - 1 and a['right'] > b['left'] + 1 and a['top'] < b['bottom'] - 1 and a['bottom'] > b['top'] + 1
        assert not intersects(controls['exit'],controls['music']), controls
        assert not intersects(controls['exit'],controls['effects']), controls
        assert not intersects(controls['music'],controls['effects']), controls
        assert all(0 <= controls[k]['left'] and controls[k]['right'] <= width + 1 for k in ['exit','audio','music','effects']), controls
        g.path(['envelope', 'widow'])
        g.p.locator('.v34-open-inventory').click()
        shade = g.p.locator('.v33-shade')
        window = g.p.locator('.v33-window')
        assert shade.is_visible() and window.is_visible()
        data = g.p.evaluate("""() => {
          const shade=document.querySelector('.v33-shade');
          const win=document.querySelector('.v33-window');
          const close=document.querySelector('.v33-close');
          const tiles=[...document.querySelectorAll('.v33-tile')];
          const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
          return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
            shade:rect(shade),window:rect(win),close:rect(close),
            tiles:tiles.map(rect),columns:getComputedStyle(document.querySelector('.v33-board')).gridTemplateColumns.split(' ').length,
            windowScrollHeight:win.scrollHeight,windowClientHeight:win.clientHeight};
        }""")
        assert data['documentWidth'] <= width + 1, data
        assert data['window']['left'] >= -1 and data['window']['right'] <= width + 1, data
        assert data['close']['width'] >= 44 and data['close']['height'] >= 44, data
        assert data['columns'] >= 2, data
        assert all(t['width'] > 0 and t['left'] >= -1 and t['right'] <= width + 1 for t in data['tiles']), data
        g.p.locator('.v33-close').click()
        assert not shade.is_visible()
        return {'width': width, 'columns': data['columns'], 'items': len(data['tiles'])}
    finally:
        g.ctx.close()

try:
    with sync_playwright() as p:
        browser=q.launch_browser(p)
        try:
            for width in WIDTHS:
                try:
                    detail=check(browser,width)
                    results.append({'name':f'mobile/{width}','status':'passed','detail':detail})
                    print('PASS',width,flush=True)
                except Exception as e:
                    results.append({'name':f'mobile/{width}','status':'failed','error':str(e)})
                    print('FAIL',width,str(e),flush=True)
        finally:
            browser.close()
finally:
    q.server.shutdown()
    (q.OUT/'mobile-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
if len(results)!=len(WIDTHS) or any(r['status']!='passed' for r in results):
    raise SystemExit(1)
