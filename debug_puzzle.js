const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });  // Run in non-headless mode
  const page = await browser.newPage();
  
  // Log console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Navigate to the page
  await page.goto('http://localhost:8000/');
  
  // Wait for script to load
  await page.waitForSelector('script[src="script.js"]');
  
  // Inject a test function
  await page.evaluate(() => {
    window.testCreatePuzzle = function() {
      console.log('Testing createPuzzle...');
      if (typeof createPuzzle === 'function') {
        console.log('createPuzzle exists, calling it...');
        try {
          createPuzzle();
          console.log('createPuzzle called successfully');
        } catch (e) {
          console.error('Error calling createPuzzle:', e);
        }
      } else {
        console.error('createPuzzle is not defined!');
      }
    };
  });
  
  // Wait a bit and trigger the test
  await page.waitForTimeout(1000);
  
  const puzzleCheck = await page.evaluate(() => {
    window.testCreatePuzzle();
    
    const puzzle = document.getElementById('puzzle');
    return {
      puzzleExists: !!puzzle,
      innerHTML: puzzle ? puzzle.innerHTML : null,
      childCount: puzzle ? puzzle.children.length : 0
    };
  });
  
  console.log('Puzzle check results:', puzzleCheck);
  
  // Keep the browser open for inspection
  await page.waitForTimeout(10000);
  
  await browser.close();
})().catch(console.error);