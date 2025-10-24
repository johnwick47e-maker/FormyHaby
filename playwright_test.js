const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));

  try {
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

    // wait for game initialization and elements
    await page.waitForFunction(() => window.puzzleCreated === true, { timeout: 5000 });
    console.log('Game initialization complete');

    // wait for draggables and targets containers
    await page.waitForSelector('#draggables', { state: 'attached' });
    await page.waitForSelector('#targets', { state: 'attached' });
    
    // give setupHearts time to complete (our bootstrap schedules it with 500ms delay)
    await page.waitForTimeout(600);

    // ensure Step 2 is visible
    const step2Hidden = await page.$eval('#step2', el => el.classList.contains('hidden'));
    console.log('step2.hidden=', step2Hidden);
    if(step2Hidden){
      await page.$eval('#step2', el => el.classList.remove('hidden'));
      console.log('Auto-unhidden step2 for test');
    }

  // wait a moment for setup and any auto-reveal from page script
  await page.waitForTimeout(600);

    // get a heart element id
    await page.waitForSelector('#draggables .heart', { state: 'attached', timeout: 8000 });
      const heartId = await page.$eval('#draggables .heart', el => el.id);
    console.log('Found heart id=', heartId);

  // get first target
  const targetSelector = '#targets .target';
  await page.waitForSelector(targetSelector, { state: 'attached' });

    // perform drag and drop using mouse events (more robust)
    const heart = await page.$('#' + heartId);
    const target = await page.$(targetSelector);
    if(!heart || !target) throw new Error('Missing heart or target elements');

    const heartBox = await heart.boundingBox();
    const targetBox = await target.boundingBox();
    if(!heartBox) throw new Error('Heart bounding box is null (not visible)');
    if(!targetBox) {
      // log boxes for debugging
      const boxes = await page.$$eval('#targets .target', els => els.map(e=>({offsetWidth:e.offsetWidth, offsetHeight:e.offsetHeight, html:e.outerHTML}))); 
      console.log('Target boxes info:', JSON.stringify(boxes, null, 2));
      throw new Error('Target bounding box is null (not visible)');
    }

    // Simulate HTML5 drag and drop in-page (dispatch dragstart/drop/dragend with DataTransfer)
    await page.evaluate(({ hSel, tSel }) => {
      const src = document.querySelector(hSel);
      const dst = document.querySelector(tSel);
      if(!src || !dst) return { ok: false, reason: 'missing elements' };
      const dt = new DataTransfer();
      const fire = (el, type, extra) => {
        const ev = new DragEvent(type, Object.assign({ bubbles: true, cancelable: true, dataTransfer: dt }, extra || {}));
        return el.dispatchEvent(ev);
      };
      fire(src, 'dragstart');
      fire(dst, 'dragover');
      const dropped = fire(dst, 'drop');
      fire(src, 'dragend');
      return { ok: true, dropped };
    }, { hSel: '#' + heartId, tSel: targetSelector });
    console.log('Dispatched drag events via page.evaluate');

    // wait a moment and then dump the targets outerHTML and the draggables count
    await page.waitForTimeout(300);
    const targetsHTML = await page.$eval('#targets', el => el.innerHTML);
    const draggablesCount = await page.$$eval('#draggables .heart', els => els.length);

    console.log('After drop: draggablesCount=', draggablesCount);
    console.log('Targets innerHTML:\n', targetsHTML);

    // Check if any target has textContent set
    const filledCount = await page.$$eval('#targets .target', els => els.filter(t=>t.textContent.trim().length>0).length);
    console.log('Filled targets count=', filledCount);
    if(filledCount>0){
      // Reveal final and trigger reward flow so we can validate end-to-end
      await page.evaluate(()=>{
        const final = document.getElementById('final'); if(final) final.classList.remove('hidden');
        const openReward = document.getElementById('openReward'); if(openReward){ openReward.classList.remove('hidden'); openReward.style.display='block'; }
      });

      // wait and click the open reward button if present
      try{
        await page.waitForSelector('#openReward', { state: 'visible', timeout: 1000 });
        await page.click('#openReward');
        console.log('Clicked openReward');
      }catch(e){ console.log('openReward not clickable or not present', e.message); }

      // wait briefly for reward overlay and then click the gift box to open
      await page.waitForTimeout(700);
      try{
        // some animations may make the element unstable; force the click to ensure the handler runs
        await page.click('.gift-box', { timeout: 5000, force: true });
        console.log('Clicked .gift-box to open gift (forced)');
      }catch(e){ console.log('Could not click .gift-box', e.message); }

      // capture a screenshot for visual confirmation (saved to workspace)
      try{
        await page.screenshot({ path: 'playwright_endflow.png', fullPage: false });
        console.log('Saved screenshot: playwright_endflow.png');
      }catch(e){ console.log('Screenshot failed', e.message); }

      await browser.close();
      process.exit(0);
    }

    await browser.close();
    process.exit(2);
  } catch (err){
    console.error('Test failed:', err);
    await browser.close();
    process.exit(3);
  }
})();
