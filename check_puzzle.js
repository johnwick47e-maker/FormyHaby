const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m=>console.log('PAGE:', m.text()));
  page.on('pageerror', e=>console.log('PAGE ERROR:', e.message));
  try{
    await page.goto('http://localhost:8000', {waitUntil:'networkidle'});
  await page.waitForSelector('#puzzle', {state:'attached', timeout:5000});
  // wait a moment for image onload handlers
  await page.waitForTimeout(800);
  const tilesCount = await page.$$eval('#puzzle .tile', els=>els.length);
  console.log('tilesCount=', tilesCount);
  // Check image URL direct
  const res = await page.request.get('http://localhost:8000/42d62442-4995-4c90-ba9d-4d3b24a24859.jfif');
  console.log('image status=', res.status());
  const sjs = await page.request.get('http://localhost:8000/script.js');
  console.log('script.js status=', sjs.status());
  const css = await page.request.get('http://localhost:8000/styles.css');
  console.log('styles.css status=', css.status());
  const inner = await page.$eval('#puzzle', el=>el.innerHTML);
  console.log('puzzle innerHTML length=', inner.length);

  // If tiles are missing, try invoking createPuzzle directly in page context
  const created = await page.evaluate(()=>{ try{ if(typeof createPuzzle==='function'){ createPuzzle(); return true; } return false; }catch(e){ console.error('createPuzzle call failed', e); return false; } });
  console.log('invoked createPuzzle directly=', created);
  await page.waitForTimeout(800);
  const tilesCount2 = await page.$$eval('#puzzle .tile', els=>els.length);
  console.log('tilesCount after direct call=', tilesCount2);
    if(tilesCount>0){
      const bg = await page.$eval('#puzzle .tile', el => getComputedStyle(el).backgroundImage);
      console.log('tile backgroundImage=', bg);
    } else {
      console.log('No tiles found');
    }
    await browser.close();
  }catch(e){ console.error('ERR', e); await browser.close(); process.exit(2);} 
})();
