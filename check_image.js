const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();
  
  // Log console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Navigate to the page
  await page.goto('http://localhost:8000/');
  
  // Wait a bit and check for errors
  await page.waitForTimeout(1000);
  
  // Try to fetch image directly
  const imgPath = '42d62442-4995-4c90-ba9d-4d3b24a24859.jfif';
  const response = await page.evaluate(async (imgSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ 
        success: true, 
        width: img.width, 
        height: img.height 
      });
      img.onerror = () => resolve({ 
        success: false, 
        error: 'Failed to load image'
      });
      img.src = imgSrc;
    });
  }, imgPath);
  
  console.log('Image load result:', response);
  
  // Check if puzzle container exists and has tiles
  const puzzleInfo = await page.evaluate(() => {
    const puzzle = document.getElementById('puzzle');
    return {
      exists: !!puzzle,
      childCount: puzzle ? puzzle.children.length : 0,
      innerHTML: puzzle ? puzzle.innerHTML : ''
    };
  });
  
  console.log('Puzzle container:', puzzleInfo);
  
  await browser.close();
})().catch(console.error);