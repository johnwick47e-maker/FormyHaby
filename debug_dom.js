const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m=>console.log('PAGE LOG:', m.text()));
  page.on('pageerror', e=>console.log('PAGE ERROR:', e.message));
  try{
    await page.goto('http://localhost:8000', { waitUntil:'networkidle' });
    await page.waitForTimeout(600);
  const draggablesExists = await page.$('#draggables') !== null;
    console.log('draggables exists=', draggablesExists);
    const draggInner = await page.$eval('#draggables', el=>el.innerHTML);
    console.log('draggables inner length=', draggInner.length);
    console.log('draggables inner html:\n', draggInner);
  // Check types of key functions on the window
  const types = await page.evaluate(()=>({ createPuzzle: typeof createPuzzle, setupHearts: typeof setupHearts, createHeart: typeof createHeart }));
  console.log('function types:', types);
  // Try invoking setupHearts directly to see if it populates draggables
  const setupCalled = await page.evaluate(()=>{ try{ if(typeof setupHearts==='function'){ setupHearts(); return true;} return false;}catch(e){ return 'err:'+e.message; } });
  console.log('setupHearts invoked via evaluate=', setupCalled);
  await page.waitForTimeout(400);
  const draggInner2 = await page.$eval('#draggables', el=>el.innerHTML);
  console.log('draggables inner length after evaluate=', draggInner2.length);
  console.log('draggables inner html after evaluate:\n', draggInner2);
    await browser.close();
  }catch(e){ console.error('ERR', e); await browser.close(); process.exit(2);} 
})();
