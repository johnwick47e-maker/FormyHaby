const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m=>console.log('PAGE LOG:', m.text()));
  try{
    await page.goto('http://localhost:8000', { waitUntil:'networkidle' });
    await page.waitForSelector('#puzzle .tile', { state:'attached', timeout:3000 });
    // get first two tiles
    const ids = await page.$$eval('#puzzle .tile', els => els.map((el,i)=>({html:el.outerHTML, index:i})) );
    console.log('tile count', ids.length);
    // simulate HTML5 dragdrop of first tile onto second
    const result = await page.evaluate(()=>{
      const src = document.querySelector('#puzzle .tile');
      const dst = document.querySelectorAll('#puzzle .tile')[1];
      if(!src || !dst) return 'missing';
      const dt = new DataTransfer();
      const fire = (el, type) => el.dispatchEvent(new DragEvent(type, {bubbles:true,cancelable:true,dataTransfer:dt}));
      fire(src,'dragstart');
      fire(dst,'dragover');
      const dropped = fire(dst,'drop');
      fire(src,'dragend');
      return {dropped};
    });
    console.log('drop result', result);
    // check order
    const order = await page.$$eval('#puzzle .tile', els=>els.map(el=>el.dataset.index));
    console.log('order after drop', order);
    await browser.close();
  }catch(e){ console.error('ERR', e); await browser.close(); process.exit(2); }
})();
