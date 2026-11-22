// Kit 22.11.2026: Hover-Test mit echter Maus (CDP) gegen test/harness.html – nur lokal, ohne HA.
// Für jede klickbare Fläche (Karte und Auswahl): Maus drauf, prüfen dass (1) sich im DOM nichts ändert,
// (2) sich außerhalb der Fläche kein Pixel ändert, (3) sich innerhalb der Fläche nur leicht etwas ändert.
const { spawn } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const H = 'file://' + path.resolve(__dirname, 'harness.html');
const prof = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'mw-hover-'));
const port = 9341;
const chrome = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${prof}`, '--window-size=700,1000', '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let ws, id = 0; const pend = new Map();
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; };
  let fails = 0, checked = 0;
  try {
    let target;
    for (let i = 0; i < 40 && !target; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = l.find((t) => t.type === 'page'); } catch {} if (!target) await sleep(250); }
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); } });
    await send('Page.enable'); await send('Runtime.enable');
    const shot = async () => (await send('Page.captureScreenshot', { format: 'png' })).data;
    // Pixelvergleich im Browser (Canvas)
    const diff = (a, b, box) => ev(`(async()=>{const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});
      const [A,B]=await Promise.all([ld(${JSON.stringify(a)}),ld(${JSON.stringify(b)})]);const w=A.width,h=A.height,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
      x.drawImage(A,0,0);const da=x.getImageData(0,0,w,h).data;x.clearRect(0,0,w,h);x.drawImage(B,0,0);const db=x.getImageData(0,0,w,h).data;
      const bx=${JSON.stringify(box)};let out=0,inn=0,maxIn=0,outPts=[];for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const k=(yy*w+xx)*4;const d=Math.max(Math.abs(da[k]-db[k]),Math.abs(da[k+1]-db[k+1]),Math.abs(da[k+2]-db[k+2]));if(!d)continue;
      const ins=xx>=bx.x-1&&xx<=bx.x+bx.w+1&&yy>=bx.y-1&&yy<=bx.y+bx.h+1;if(ins){inn++;maxIn=Math.max(maxIn,d)}else{out++;if(outPts.length<3)outPts.push([xx,yy,d])}}return {out,inn,maxIn,outPts}})()`);
    const run = async (name, query, prep) => {
      await send('Page.navigate', { url: `${H}?${query}` }); await sleep(1500);
      await ev(`(async()=>{${prep || ''};{const k=document.querySelector('mealie-wishlist-card');const s=document.createElement('style');s.textContent='*{caret-color:transparent!important}';k.shadowRoot.appendChild(s);k.shadowRoot.activeElement&&k.shadowRoot.activeElement.blur();}})()`); await sleep(400);
      const sel = '.wish,.meal,.tile,.hit,.mix,.more-btn,button.icon';
      const n = await ev(`(()=>{const c=document.querySelector('mealie-wishlist-card');return c.shadowRoot.querySelectorAll(${JSON.stringify(sel)}).length})()`);
      for (let i = 0; i < n; i++) {
        const box = await ev(`(()=>{const c=document.querySelector('mealie-wishlist-card');const e=c.shadowRoot.querySelectorAll(${JSON.stringify(sel)})[${i}];if(!e)return null;const r=e.getBoundingClientRect();
          if(r.width<2||r.bottom<0||r.top>innerHeight)return null;const top=c.shadowRoot.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!top||!(e===top||e.contains(top)))return null;return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),cls:e.className}})()`);
        if (!box) continue;
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }); await sleep(120);
        await ev(`(()=>{const c=document.querySelector('mealie-wishlist-card');window.__mut=0;window.__mo&&window.__mo.disconnect();window.__mo=new MutationObserver(l=>window.__mut+=l.length);window.__mo.observe(c.shadowRoot,{subtree:true,childList:true,attributes:true,characterData:true})})()`);
        const a = await shot();
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x + box.w / 2, y: box.y + box.h / 2 }); await sleep(150);
        const b = await shot();
        const mut = await ev('window.__mut');
        const d = await diff(a, b, box);
        checked++;
        const bad = mut > 0 || d.out > 0;
        if (bad) fails++;
        if (bad) console.log(`FEHLER ${name} ${box.cls}: DOM-Änderungen ${mut}, Pixel außerhalb ${d.out} ${JSON.stringify(d.outPts)}`);
      }
    };
    await run('karte', 'step=card&cfg=%7B%22show_images%22%3Atrue%7D', '');
    await run('auswahl', 'step=card', `const c=document.querySelector('mealie-wishlist-card');c.shadowRoot.querySelector('.wish').click();await new Promise(r=>setTimeout(r,500));`);
    await run('suche', 'step=card', `const c=document.querySelector('mealie-wishlist-card');c.shadowRoot.querySelector('.wish').click();await new Promise(r=>setTimeout(r,500));const i=c.shadowRoot.querySelector('input.q');i.value='g';i.dispatchEvent(new Event('input'));i.blur();`);
    console.log(fails ? `HOVER ${fails} Fehler bei ${checked} Flächen` : `HOVER OK ${checked} Flächen`);
  } catch (e) { console.log('HOVER ABBRUCH', e.message); fails = 1; }
  finally { try { ws && ws.close(); } catch {} chrome.kill('SIGKILL'); await sleep(300); fs.rmSync(prof, { recursive: true, force: true }); process.exit(fails ? 1 : 0); }
})();
