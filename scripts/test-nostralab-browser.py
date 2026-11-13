"""Regression tests of the published catalog, with all external traffic mocked/blocked.

Install playwright and its Chromium browser, then run this script from any cwd.
NOSTRALAB_BROWSER may point to an existing Chromium/Edge executable.
NOSTRALAB_TEST_OUTPUT selects an optional directory for JSON and screenshots.
"""
import functools
import json
import math
import os
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CAT = json.loads((ROOT/'nostralab/catalogo.json').read_text(encoding='utf-8'))['experiencias']
OUT = Path(os.environ.get('NOSTRALAB_TEST_OUTPUT', ROOT/'test-results/nostralab'))
OUT.mkdir(parents=True, exist_ok=True)
checks = []

def check(name, actual, expected=True, tolerance=None):
    ok = abs(actual-expected) <= tolerance if tolerance is not None else actual == expected
    checks.append(dict(name=name, actual=actual, expected=expected, passed=ok))

def slider(page, name, value):
    page.locator('#'+name).evaluate('(e,v)=>{e.value=String(v);e.dispatchEvent(new Event("input",{bubbles:true}));}', value)

def entry(page, name, value):
    page.locator('#'+name).fill(str(value))
    page.locator('#'+name).press('Tab')

class QuietServer(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}'
snapshots = ['NostraLABMat001Test.getState()', '__nostralabQA.snapshot()', '({...p,...s})',
             'NostraLABReflectionTest.snapshot()', 'NostraLABTest.getState()']
buttons = [('startBtn','resetBtn'),('btnPlay','btnReset'),('play','reset'),('play','reset'),('playBtn','resetBtn')]

with sync_playwright() as pw:
    launch = {'headless': True}
    if os.environ.get('NOSTRALAB_BROWSER'): launch['executable_path'] = os.environ['NOSTRALAB_BROWSER']
    browser = pw.chromium.launch(**launch)
    for i, lab in enumerate(CAT):
        context = browser.new_context(viewport={'width':1280,'height':900})
        external, errors = [], []
        def route(r):
            if r.request.url.startswith(BASE): r.continue_()
            else: external.append(r.request.url); r.abort()
        context.route('**/*', route)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE+'/nostralab/'+lab['ruta'])
        initial = page.evaluate(snapshots[i])
        page.wait_for_timeout(200)
        key = 'theta' if i == 0 else 't'
        check(f'{i}: no autoplay', page.evaluate(snapshots[i])[key], initial[key])
        for width in [320,360,390,768,1280]:
            page.set_viewport_size({'width':width,'height':900})
            page.wait_for_timeout(60)
            check(f'{i}: page width {width}', page.evaluate('document.documentElement.scrollWidth'), width)
        play, reset = buttons[i]
        page.locator('#'+play).click(); page.wait_for_timeout(250)
        check(f'{i}: advances', page.evaluate(snapshots[i])[key] != initial[key])
        page.locator('#'+play).click(); paused = page.evaluate(snapshots[i])[key]
        page.wait_for_timeout(120)
        check(f'{i}: paused', page.evaluate(snapshots[i])[key], paused)
        page.locator('#'+reset).click()
        check(f'{i}: reset', page.evaluate(snapshots[i])[key], initial[key])

        if i == 0:
            for deg in [-360,-270,-180,-90,0,30,45,60,90,180,270,360,89.9999999,90.0000001]:
                val = page.evaluate('d=>{NostraLABMat001Test.setTheta(d*Math.PI/180);return NostraLABMat001Test.getState().values}', deg)
                a = math.radians(deg)
                check(f'trig sin {deg}', val['sen'], math.sin(a), 1e-14)
                check(f'trig cos {deg}', val['cos'], math.cos(a), 1e-14)
                if deg in (89.9999999,90.0000001):
                    check(f'trig finite tangent {deg}', val['tan'] is not None and math.isfinite(val['tan']))
                    check(f'trig tangent accuracy {deg}', val['tan']/math.tan(a), 1, 1e-12)
                if deg in (-270,-90,90,270): check(f'trig exact singularity {deg}', val['tan'], None)
        if i == 1:
            slider(page,'amp',1); slider(page,'lambda',2)
            check('harmonic warning kept', 'A·k' in page.locator('#physicsWarning').inner_text())
        if i == 3:
            entry(page,'n-vi','8,25')
            check('manual speed retained',page.evaluate(snapshots[i])['vi'],8.25)
            check('speed slider agrees',float(page.locator('#r-vi').input_value()),8.25)
            entry(page,'n-T','12,34')
            state=page.evaluate(snapshots[i]); expected=math.sqrt(12.34/.18)
            check('tension-derived speed',state['vi'],expected,1e-12)
            check('derived slider agrees',float(page.locator('#r-vi').input_value()),state['vi'],1e-12)
            check('derived field precision',float(page.locator('#n-vi').input_value().replace(',','.')),state['vi'],5e-7)
            page.locator('#n-vi').focus();page.locator('#n-vi').press('Tab')
            page.locator('#n-T').focus();page.locator('#n-T').press('Tab')
            check('focus blur does not change physics',page.evaluate(snapshots[i])['vi'],state['vi'])
            entry(page,'n-vi','99');check('invalid speed does not change physics',page.evaluate(snapshots[i])['vi'],state['vi'])
            page.locator('#reset').click()
            page.locator('[data-option="support"][data-value="free"]').click()
            slider(page,'r-amp',.45)
            for width in [320,390,768,1280]:
                page.set_viewport_size({'width':width,'height':900});page.wait_for_timeout(70)
                g=page.evaluate('NostraLABReflectionTest.geometry()')
                check(f'free maximum inside plot {width}',g['cy']-.9*g['scale'] >= g['top']+20)
            scale=page.evaluate('NostraLABReflectionTest.geometry().scale')
            page.locator('#play').click()
            page.wait_for_function('NostraLABReflectionTest.snapshot().t>=3.5/8.2')
            page.locator('#play').click()
            check('scale stable during animation',page.evaluate('NostraLABReflectionTest.geometry().scale'),scale)
            page.locator('#scene').screenshot(path=str(OUT/'reflection-free-maximum.png'))
            for mode in ['end','join']:
                page.locator(f'[data-module="{mode}"]').click()
                options=('fixed','free') if mode=='end' else ('light','heavy')
                kind='support' if mode=='end' else 'direction'
                for option in options:
                    page.locator(f'[data-option="{kind}"][data-value="{option}"]').click()
                    slider(page,'r-amp',.45)
                    if mode=='join':slider(page,'r-muLight',.1);slider(page,'r-muHeavy',.8)
                    d=page.evaluate('NostraLABReflectionTest.data()');g=page.evaluate('NostraLABReflectionTest.geometry()')
                    peak=.45*max(1,1+d['r'],abs(d['r']))
                    check(f'{mode}/{option}: peak visible',g['cy']-peak*g['scale']>=g['top']+20)
                    check(f'{mode}/{option}: energy conserved',d['R']+d['P'],1,1e-12)
                    if mode=='join':check(f'{option}: flux ratio',d['P'],d['v1']/d['v2']*d['tr']**2,1e-12)
        if i == 4:
            for phase,category in [(0,'constructiva'),(1,'parcial'),(179,'parcial'),(180,'destructiva'),(181,'parcial'),(359,'parcial'),(360,'constructiva')]:
                slider(page,'range_phase',phase)
                check(f'interference {phase}: classification',page.evaluate('NostraLABTest.category()'),category)
                actual=page.evaluate('NostraLABTest.snapshot().ar')
                check(f'interference {phase}: amplitude',actual,math.sqrt(max(0,2*.08**2*(1+math.cos(math.radians(phase))))),1e-12)
                if phase==179:
                    page.locator('#prediction').select_option('destructiva');page.locator('#checkBtn').click()
                    feedback=page.locator('#checkResult').inner_text()
                    check('179 rejects cancellation claim','Revisa tu hipótesis' in feedback and 'interferencia parcial' in feedback)
                    page.locator('#checkResult').screenshot(path=str(OUT/'interference-179.png'))
            slider(page,'range_a1',0);slider(page,'range_a2',0)
            page.locator('#prediction').select_option('ninguna');page.locator('#checkBtn').click()
            check('both off',page.evaluate('NostraLABTest.category()'),'ninguna')
            check('both off feedback','Ambas fuentes están apagadas' in page.locator('#checkResult').inner_text())
            slider(page,'range_a2',.08);check('one off',page.evaluate('NostraLABTest.category()'),'una')
            check('metadata models consistent','corte unidimensional y=0 m' not in page.content())
        check(f'{i}: no script errors',errors,[])
        check(f'{i}: offline',external,[])
        context.close()

    context=browser.new_context(viewport={'width':390,'height':900})
    responses=[];mocked=[];unavailable=[False]
    def portal_route(r):
        if 'cloudfunctions.net/nostraLabVisits' in r.request.url:
            data=r.request.post_data_json;mocked.append(data)
            r.fulfill(status=503 if unavailable[0] else 200,content_type='application/json',body=json.dumps({'ok':True,'labId':data['labId'],'total':1234}))
        elif r.request.url.startswith(BASE):r.continue_()
        else:r.abort()
    context.route('**/*',portal_route)
    page=context.new_page()
    page.on('response',lambda r:responses.append(r.url) if r.status==404 else None)
    page.goto(BASE+'/nostralab/');page.locator('.lab').first.wait_for()
    check('catalog five labs',page.locator('.lab').count(),5)
    page.locator('[data-curso="Física"]').click();check('physics filter',page.locator('.lab').count(),4)
    page.locator('[data-curso="Todos"]').click()
    thumbnail=next(x['miniatura'] for x in CAT if x['id']=='superposicion-interferencia-ondas-v009')
    image=page.locator(f'.lab img[src="./{thumbnail}"]')
    image.scroll_into_view_if_needed();image.evaluate('e=>e.decode()')
    check('thumbnail 16:9',image.evaluate('e=>e.naturalWidth/e.naturalHeight'),16/9,1e-12)
    check('premium thumbnails have no overlay',page.locator('.lab').filter(has=page.locator('img[src*="-premium-"]')).locator('.media-corner').count(),0)
    page.locator('#experiencias').screenshot(path=str(OUT/'catalog-mobile.png'))
    check('catalog one institutional footer',page.locator('footer').count(),1)
    for i,lab in enumerate(CAT):
        page.goto(BASE+'/nostralab/laboratorio.html?id='+lab['id'])
        page.locator('#nostralab-visitas').wait_for()
        check(f'viewer {i}: active route',page.locator('#experimento').get_attribute('src'),'./'+lab['ruta'])
        button=page.frame_locator('#experimento').locator('#'+buttons[i][0]);button.click()
        check(f'viewer {i}: runs','Pausar' in button.inner_text());button.click()
        check(f'viewer {i}: visit display',page.locator('#nostralab-visitas-total').inner_text(),'1,234')
        token=mocked[-1]['sessionId'];page.reload();page.locator('#nostralab-visitas').wait_for()
        check(f'viewer {i}: stable session',mocked[-1]['sessionId'],token)
    unavailable[0]=True;page.reload();page.wait_for_timeout(300)
    check('counter unavailable: badge hidden',page.locator('#nostralab-visitas').is_visible(),False)
    button=page.frame_locator('#experimento').locator('#playBtn');button.click()
    check('counter unavailable: science works','Pausar' in button.inner_text())
    check('portal no 404',responses,[])
    browser.close()
server.shutdown()
(OUT/'results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
failed=[c for c in checks if not c['passed']]
print(json.dumps({'checks':len(checks),'passed':len(checks)-len(failed),'failed':failed},ensure_ascii=False,indent=2))
raise SystemExit(1 if failed else 0)
