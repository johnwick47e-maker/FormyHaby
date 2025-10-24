const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();
  
  // Log console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Navigate to the page and wait for puzzle container
  await page.goto('http://localhost:8000/');
  await page.waitForSelector('#puzzle');
  
  // Wait a bit for potential initialization
  await page.waitForTimeout(2000);
  
  // Check puzzle state
  const puzzleState = await page.evaluate(() => {
    const puzzle = document.getElementById('puzzle');
    const tiles = puzzle.children;
    return {
      tilesCount: tiles.length,
      tilesWithBackground: Array.from(tiles).filter(t => t.style.backgroundImage).length,
      firstTileBackground: tiles.length > 0 ? tiles[0].style.backgroundImage : null,
      puzzleStyles: {
        width: puzzle.style.width,
        height: puzzle.style.height,
        display: getComputedStyle(puzzle).display,
        gap: puzzle.style.gap
      }
    };
  });
  
  console.log('Puzzle state:', puzzleState);
  
  await browser.close();
})().catch(console.error);