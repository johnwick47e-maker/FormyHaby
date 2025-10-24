// Minimal interactive prototype: 3x3 puzzle + drag-to-target hearts
const PUZZLE_ROWS = 3, PUZZLE_COLS = 3;
const puzzleEl = document.getElementById('puzzle');
const resetBtn = document.getElementById('resetPuzzle');
const step2 = document.getElementById('step2');
const final = document.getElementById('final');
const draggablesEl = document.getElementById('draggables');
const targetsEl = document.getElementById('targets');

let tiles = [];
let initialDraggablesOrder = [];
let selectedHeart = null;

function createPuzzle(){
  // Clear puzzle state
  window.puzzleCreated = false;
  console.info('PUZZLE: Starting puzzle creation');
  puzzleEl.innerHTML = '';
  tiles = [];
  const imgSrc = window.location.pathname.endsWith('/') ? 
    '63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif' : 
    window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + '63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif';
  
  // Create loading indicator
  const loading = document.createElement('div');
  loading.style.textAlign = 'center';
  loading.style.padding = '20px';
  loading.style.color = 'var(--muted)';
  loading.textContent = 'Loading puzzle...';
  puzzleEl.appendChild(loading);
  
  // Preload image to ensure proper sizing
  console.info('PUZZLE: Creating image element');
  const img = new Image();
  console.info('PUZZLE: Starting to load image:', imgSrc);
  // Use a flag to prevent double initialization
  let initialized = false;
  img.onload = () => {
    if(initialized) return;
    initialized = true;
    console.info('PUZZLE: Image loaded successfully:', img.width, 'x', img.height);
    // Create tiles immediately once image is loaded
    puzzleEl.innerHTML = ''; // Clear loading message
      console.info('PUZZLE: Creating tiles...');
      puzzleEl.innerHTML = ''; // Clear loading message
    // Use a fixed "normal" puzzle size so piece math is predictable
    const puzzleWidth = 540;
    const puzzleHeight = 360; // 540 / (3:2) approx — matches our CSS defaults
    // Ensure the puzzle container dimensions and remove gaps so tiles align exactly
    puzzleEl.style.width = puzzleWidth + 'px';
    puzzleEl.style.height = puzzleHeight + 'px';
    puzzleEl.style.gap = '0px';
    
    console.info('PUZZLE: Starting tile creation...');
for(let r=0;r<PUZZLE_ROWS;r++){
      for(let c=0;c<PUZZLE_COLS;c++){
        const index = r*PUZZLE_COLS + c;
        console.info('PUZZLE: Creating tile', index, 'at position', r, c);
        const div = document.createElement('div');
  div.className = 'tile';
  // make this tile flush so its background aligns to the full image (no border/gap)
  div.style.border = 'none';
  div.style.borderRadius = '0px';
  // set explicit tile size to avoid layout rounding differences
  const tileW = puzzleWidth / PUZZLE_COLS;
  const tileH = puzzleHeight / PUZZLE_ROWS;
  div.style.width = tileW + 'px';
  div.style.height = tileH + 'px';
        div.dataset.index = index; // correct position
        div.style.backgroundImage = `url(${imgSrc})`;
        const posX = - (c * (puzzleWidth/PUZZLE_COLS));
        const posY = - (r * (puzzleHeight/PUZZLE_ROWS));
        div.style.backgroundPosition = `${posX}px ${posY}px`;
        div.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;
        div.draggable = true;
        div.addEventListener('dragstart', onDragStart);
        div.addEventListener('dragend', onDragEnd);
        div.addEventListener('dragover', e=>e.preventDefault());
        div.addEventListener('drop', onDropOnTile);
        tiles.push(div);
      }
    }
    // shuffle and append tiles
    shuffle(tiles);
    console.info('PUZZLE: Created', tiles.length, 'tiles');
    tiles.forEach(t=>puzzleEl.appendChild(t));
    console.info('PUZZLE: All tiles appended to puzzle');
  };
  img.onerror = (err) => {
    console.error('PUZZLE ERROR: Image failed to load:', imgSrc, err);
    console.info('PUZZLE ERROR: Full image path:', window.location.origin + '/' + imgSrc);
    loading.innerHTML = `
      <div style="color: red;">Error loading puzzle image.</div>
      <button onclick="location.reload()" style="margin-top: 10px;" class="btn small">
        Retry
      </button>
    `;
  };
  // Start loading the image and log its status
  console.info('PUZZLE: Setting image source to:', imgSrc);
  img.src = imgSrc;
  console.info('PUZZLE: Image load started');
}

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}

let dragEl = null;
function onDragStart(e){
  dragEl = e.target;
  e.dataTransfer.setData('text/plain', e.target.dataset.index);
  e.target.classList.add('dragging');
  // Try to use the tile element as the drag image so the browser uses a stable snapshot
  try{
    if(e.dataTransfer && typeof e.dataTransfer.setDragImage === 'function'){
      e.dataTransfer.setDragImage(e.target, Math.floor(e.target.offsetWidth/2), Math.floor(e.target.offsetHeight/2));
    }
  }catch(err){ /* ignore if unavailable */ }
}
function onDragEnd(e){
  e.target.classList.remove('dragging');
  dragEl = null;
  checkPuzzleSolved();
}
function onDropOnTile(e){
  e.preventDefault();
  // Swap the dragged tile (dragEl) with the tile that received the drop
  const src = dragEl;
  const dst = e.currentTarget || e.target;
  if(!src || !dst || src === dst) return;
  const parent = puzzleEl;
  try{
    // Use temporary placeholders to swap nodes safely
    const placeholderA = document.createElement('div');
    const placeholderB = document.createElement('div');
    parent.replaceChild(placeholderA, src);
    parent.replaceChild(placeholderB, dst);
    parent.replaceChild(src, placeholderB);
    parent.replaceChild(dst, placeholderA);
  }catch(err){
    // Fallback: try simple insertBefore approach
    const srcNext = src.nextSibling;
    const dstNext = dst.nextSibling;
    parent.insertBefore(src, dstNext);
    parent.insertBefore(dst, srcNext);
  }
  // After swapping, clear drag state and check for solved
  if(src.classList) src.classList.remove('dragging');
  dragEl = null;
  checkPuzzleSolved();
}

function checkPuzzleSolved(){
  // Check if tiles are in correct order by reading dataset.index in DOM order
  const nodes = Array.from(puzzleEl.children);
  let solved = true;
  nodes.forEach((n,i)=>{
    if(parseInt(n.dataset.index,10)!==i) solved=false;
  });
  if(solved){
    // Add success effect to puzzle
    nodes.forEach((tile, i) => {
      setTimeout(() => {
        tile.style.transform = 'scale(1.02)';
        tile.style.boxShadow = '0 4px 12px rgba(106,76,255,0.2)';
        tile.style.borderColor = 'var(--purple)';
      }, i * 50);
    });
    
    // Celebration effect
    if(typeof confetti === 'function'){
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
    
    // reveal step2
    setTimeout(() => {
      step2.classList.remove('hidden');
      step2.scrollIntoView({behavior:'smooth'});
    }, 800);
  }
}

resetBtn.addEventListener('click', ()=>{
  // Reset puzzle completely
  puzzleEl.innerHTML = '';
  tiles = [];
  window.puzzleCreated = false;
  createPuzzle();
});

// Hearts drag targets (simple drag-to-target game)
const HEART_COUNT = 4;

window.setupHearts = function setupHearts(){
  console.info('setupHearts: start');
  draggablesEl.innerHTML='';
  targetsEl.innerHTML='';
  const letters = ['H','A','B','Y'];
  // create shuffled hearts
  const order = letters.slice().sort(()=>Math.random()-0.5);
  initialDraggablesOrder = order.slice();

  order.forEach((t, i)=>{
    const h = createHeart(t, i);
    draggablesEl.appendChild(h);
  });

  console.info('setupHearts: created', order.length, 'hearts');

  // targets in correct order H A B Y
  letters.forEach((l, i)=>{
    const t = document.createElement('div');
    t.className='target';
    t.dataset.letter = l;
    t.addEventListener('dragover', e=>{ e.preventDefault(); t.classList.add('highlight'); });
    t.addEventListener('dragleave', e=>{ t.classList.remove('highlight'); });
    t.addEventListener('drop', e=>{ t.classList.remove('highlight'); onDropOnTarget(e); });
    // click/tap fallback: place selected heart if any
    t.addEventListener('click', ()=>{
      if(selectedHeart) {
        // simulate drop
        tryPlaceHeart(selectedHeart, t);
      }
    });
    targetsEl.appendChild(t);
  });
}

window.createHeart = function createHeart(letter, idx){
  const h = document.createElement('div');
  h.className='heart';
  h.draggable=true;
  // id can be reused; ensure unique-ish
  h.id = 'heart-' + Math.random().toString(36).slice(2,8);
  h.textContent = letter;
  // Drag handlers
  h.addEventListener('dragstart', e=>{
    e.dataTransfer.setData('text/plain', h.id);
    h.classList.add('dragging');
    setTimeout(()=>{ if(document.body.contains(h)) h.classList.add('hidden'); },50);
  });
  h.addEventListener('dragend', e=>{ if(document.body.contains(h)) h.classList.remove('hidden'); h.classList.remove('dragging'); });
  // Click/tap fallback: select the heart for placement on target click
  h.addEventListener('click', (ev)=>{
    ev.stopPropagation();
    if(selectedHeart===h){ h.classList.remove('selected'); selectedHeart = null; return; }
    document.querySelectorAll('.heart.selected').forEach(x=>x.classList.remove('selected'));
    selectedHeart = h; h.classList.add('selected');
  });
  return h;
}

function rebuildDraggables(){
  // Recreate draggables in the original order, skipping already-placed letters
  const placed = Array.from(targetsEl.children).map(t=>t.textContent.trim()).filter(x=>x.length>0);
  draggablesEl.innerHTML='';
  initialDraggablesOrder.forEach((letter)=>{
    if(placed.includes(letter)) return; // skip placed
    const h = createHeart(letter);
    draggablesEl.appendChild(h);
  });
}

function onDropOnTarget(e){
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const heart = document.getElementById(id);
  const target = e.currentTarget;
  if(!heart) return;
  const letter = heart.textContent.trim();
  // If correct letter for this target
  if(letter === target.dataset.letter){
    target.textContent = letter;
    target.style.background = 'linear-gradient(90deg,var(--mint),var(--blue))';
    if(heart.parentElement) heart.parentElement.removeChild(heart);
    console.info('Dropped', letter, 'onto target', target);
    checkHeartsComplete();
  } else {
    // Wrong placement: remind user and restore left words order
    showToast('Wrong placement — try again');
    target.classList.add('shake');
    heart.classList.add('shake');
    setTimeout(()=>{ target.classList.remove('shake'); heart.classList.remove('shake'); }, 700);
    // make sure dragged heart is visible again
    heart.classList.remove('hidden');
    // rebuild left draggables in original order (skip already placed targets)
    rebuildDraggables();
  }
}

function tryPlaceHeart(heart, target){
  if(!heart || !target) return;
  const letter = heart.textContent.trim();
  if(letter === target.dataset.letter){
    target.textContent = letter;
    target.style.background = 'linear-gradient(90deg,var(--mint),var(--blue))';
    if(heart.parentElement) heart.parentElement.removeChild(heart);
    selectedHeart = null;
    document.querySelectorAll('.heart.selected').forEach(x=>x.classList.remove('selected'));
    checkHeartsComplete();
  } else {
    showToast('Wrong placement — try again');
    target.classList.add('shake');
    heart.classList.add('shake');
    setTimeout(()=>{ target.classList.remove('shake'); heart.classList.remove('shake'); }, 700);
    rebuildDraggables();
  }
}

function showToast(msg){
  let t = document.getElementById('game-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'game-toast';
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.transform = 'translateX(-50%)';
    t.style.bottom = '28px';
    t.style.background = 'rgba(16,24,40,0.9)';
    t.style.color = 'white';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '10px';
    t.style.zIndex = 120;
    t.style.fontWeight = 700;
    t.style.opacity = '0';
    t.style.transition = 'opacity .22s ease';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(()=>{ if(t) t.style.opacity = '0'; }, 1200);
}

function checkHeartsComplete(){
  const targets = Array.from(targetsEl.children);
  let ok = true;
  targets.forEach(t=>{
    if(t.textContent.trim() !== t.dataset.letter) ok=false;
  });
  if(ok){
    // Reveal final area so user can open the gift immediately after Step 2
    try{
      final.classList.remove('hidden');
      final.scrollIntoView({behavior:'smooth'});
    }catch(e){ /* ignore if not found */ }

    // Make the open-reward button visible and wire it to the explosion/open flow
    const openBtn = document.getElementById('openReward');
    if(openBtn){
      openBtn.classList.remove('hidden');
      openBtn.style.display = 'inline-block';
      // ensure we don't attach multiple handlers
      if(!openBtn.dataset.bound){
        openBtn.addEventListener('click', async ()=>{
          // show overlay immediately
          showGift();
          // try to start the first audio immediately (user gesture) so autoplay policies allow playback
          try{
            const a1 = document.getElementById('audioPangako');
            if(a1){ a1.muted = false; await a1.play().catch(()=>{}); }
          }catch(e){ /* ignore play errors */ }
          // preload media manifest (best-effort) then open the gift (explosion)
          try{
            const resp = await fetch('media-manifest.json');
            if(resp.ok){
              const mm = await resp.json();
              const a1 = document.getElementById('audioPangako');
              const a2 = document.getElementById('audioMaging');
              if(mm.audios && mm.audios[0] && a1) a1.src = mm.audios[0];
              if(mm.audios && mm.audios[1] && a2) a2.src = mm.audios[1];
            }
          }catch(err){ /* ignore manifest errors */ }
          // short delay to allow overlay animation, then trigger open gift animation
          setTimeout(()=>{
            try{ openGift(); }catch(e){ console.warn('openGift failed', e); }
          }, 350);
        }, { once: true });
        openBtn.dataset.bound = '1';
      }
    }

    // small celebration: confetti if available
    if(typeof confetti === 'function'){
      confetti({particleCount:60,spread:110,origin:{y:0.5}});
    }
  }
}

// Init
document.getElementById('rewardOverlay').classList.add('hidden');
document.getElementById('final').classList.add('hidden');
// Initialize game
(function initGame() {
  createPuzzle();
  setTimeout(() => setupHearts(), 200);
})();

  // No download zip functionality needed  // ----------------- Step 3: Heart Catcher game -----------------
  const step3 = document.getElementById('step3');
  const startGame = document.getElementById('startGame');
  const heartsContainer = document.getElementById('heartsContainer');
  const timerEl = document.getElementById('timer');
  const gameResult = document.getElementById('gameResult');
  const openRewardBtn = document.getElementById('openReward');
  const rewardOverlay = document.getElementById('rewardOverlay');
  const claimReward = document.getElementById('claimReward');
  const playerArea = document.getElementById('playerArea');
  const pausePlay = document.getElementById('pausePlay');
  const nextMedia = document.getElementById('nextMedia');
  const closeReward = document.getElementById('closeReward');
  const slideshow = document.getElementById('slideshow');

  let gameTimer = null;
  let timeLeft = 12;
  let caught = 0;

  function spawnHeart(){
    const h = document.createElement('div');
    h.className='heart-float';
    h.textContent='❤';
    const x = Math.random()*(heartsContainer.clientWidth-60);
    const y = heartsContainer.clientHeight + 40;
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    heartsContainer.appendChild(h);

    // animate upward
    const duration = 4000 + Math.random()*3000;
    const endY = -80;
    const start = performance.now();
    function frame(now){
      const t = Math.min(1,(now-start)/duration);
      const curY = y + (endY - y)*t;
      h.style.top = `${curY}px`;
      if(t<1){
        requestAnimationFrame(frame);
      }else{
        h.remove();
      }
    }
    requestAnimationFrame(frame);

    h.addEventListener('click', ()=>{
      caught++;
      h.remove();
      gameResult.textContent = `Caught: ${caught}`;
    });
  }

  function startHeartGame(){
    caught = 0; timeLeft=12; gameResult.textContent=''; timerEl.textContent = timeLeft;
    const spawnInterval = setInterval(spawnHeart, 500);
    gameTimer = setInterval(()=>{
      timeLeft--;
      timerEl.textContent = timeLeft;
      if(timeLeft<=0){
        clearInterval(gameTimer); clearInterval(spawnInterval);
        // remove remaining hearts
        heartsContainer.querySelectorAll('.heart-float').forEach(n=>n.remove());
        if(caught>=8){
          gameResult.textContent = `Great! You caught ${caught} hearts — all challenges completed!`;
          // Show final section with the gift button
          final.classList.remove('hidden');
          final.scrollIntoView({behavior:'smooth'});
          // Enable the open reward button
          openRewardBtn.classList.remove('hidden');
          openRewardBtn.style.display = 'block';
          if(typeof confetti === 'function'){
            confetti({particleCount:100,spread:160,origin:{y:0.6}});
            setTimeout(()=>confetti({particleCount:50,spread:120,origin:{y:0.5}}),500);
          }
        }else{
          gameResult.textContent = `Only ${caught} caught — try again to complete the challenge.`;
        }
      }
    },1000);
  }

  startGame.addEventListener('click', ()=>{
    if(step2.classList.contains('hidden')){
      // ensure previous steps done
      alert('Please complete the earlier steps first.');
      return;
    }
    step3.classList.remove('hidden');
    startHeartGame();
  });
  
  // Initialize the game
  window.addEventListener('load', () => {
    createPuzzle();
  });

  // Reward flow
  async function showGift() {
    console.info('Opening gift and preparing slideshow...');
    
    // Show the reward overlay with the gift
    rewardOverlay.style.display = 'flex';
    rewardOverlay.classList.remove('hidden');
    rewardOverlay.setAttribute('aria-hidden', 'false');
    
    // Reset gift state
    const giftAnimation = document.querySelector('.gift-animation');
    const playerArea = document.querySelector('.player-area');
    giftAnimation.classList.remove('hidden');
    playerArea.classList.add('hidden');
    
    // Slideshow initialization is now handled by slideshow-core.js
    if (window.slideshowCore) {
        window.slideshowCore.initialize();
    }
    
    console.info('Prepared slideshow with', slideshowItems.length, 'items');
    
    // Add confetti effect when the gift appears
    if(typeof confetti === 'function'){
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 }
      });
    }

    // Set up second audio track to play when first one ends
    const audioPangako = document.getElementById('audioPangako');
    const audioMaging = document.getElementById('audioMaging');
    
        if (audioPangako && audioMaging) {
      audioPangako.addEventListener('ended', async () => {
        try {
          audioMaging.volume = 1;
          audioMaging.muted = false;
          await audioMaging.play();
          console.info('Started second audio track');
        } catch(e) {
          console.warn('Second audio track failed:', e);
        }
      }, { once: true }); // Only trigger once
    }
    
    // Start the slideshow
    slideshowIndex = 0;
    showSlideshowItem(0);
  }

  openRewardBtn.addEventListener('click', async ()=>{
    showGift();

    // Set up audio elements if they don't exist
    const audioElements = {
        pangako: document.getElementById('audioPangako') || new Audio('pangako.mp3'),
        maging: document.getElementById('audioMaging') || new Audio('maging_sino.mp3')
    };
    
    // Set IDs and ensure they're in the DOM
    if (!document.getElementById('audioPangako')) {
        audioElements.pangako.id = 'audioPangako';
        document.body.appendChild(audioElements.pangako);
    }
    
    if (!document.getElementById('audioMaging')) {
        audioElements.maging.id = 'audioMaging';
        document.body.appendChild(audioElements.maging);
    }

    // Try loading from manifest first
    try {
      const resp = await fetch('media-manifest.json');
      if(resp.ok){
        const mm = await resp.json();
        if(mm.audios && mm.audios.length){
          if(mm.audios[0]) audioPangako.src = mm.audios[0];
          if(mm.audios[1]) audioMaging.src = mm.audios[1];
        }
      }
    } catch(e) {
      console.info('Using default audio files');
    }

    // Ensure audio elements are ready to play
    audioPangako.load();
    audioMaging.load();

    // try starting first audio with user gesture
    try {
      audioPangako.volume = 1;
      audioPangako.muted = false;
      await audioPangako.play();
      console.info('Started first audio track');
    } catch(e) {
      console.warn('Audio autoplay failed:', e);
    }

    // Short delay then open the gift (explosion/animation -> slideshow)
    setTimeout(()=>{ try{ openGift(); }catch(err){ console.warn('openGift error', err); } }, 300);
  });

  // Reward flow
  async function openGift() {
    // Initialize slideshow core
    if (window.slideshowCore) {
        await window.slideshowCore.initialize();
    }
    
    // Show reward overlay and setup gift animation
    rewardOverlay.style.display = 'flex';
    rewardOverlay.classList.remove('hidden');
    rewardOverlay.setAttribute('aria-hidden', 'false');
    
    // Reset states
    const giftAnimation = document.querySelector('.gift-animation');
    const playerArea = document.querySelector('.player-area');
    const giftBox = document.querySelector('.gift-box');
    giftAnimation.classList.remove('hidden');
    playerArea.classList.add('hidden');
    giftBox.classList.add('opening');
    
    // Start slideshow if core exists
    if (window.slideshowCore) {
        window.slideshowCore.start();
    }
    
    // Multiple confetti bursts
    if(typeof confetti === 'function'){
      const colors = ['#6a4cff', '#7ee0c7', '#60a5ff', '#ff6b6b'];
      
      // First burst
      confetti({
        particleCount: 100,
        spread: 180,
        origin: { y: 0.5 },
        colors: colors,
        scalar: 1.2,
        gravity: 0.8
      });
      
      // Second burst after small delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 140,
          origin: { y: 0.55 },
          colors: colors,
          scalar: 1.3,
          gravity: 1
        });
      }, 200);
      
      // Final burst
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 },
          colors: colors,
          scalar: 1.4,
          gravity: 1.2,
          ticks: 300
        });
      }, 400);
    }
    
    // Show content with smooth transition
    setTimeout(() => {
      giftAnimation.style.opacity = '0';
      setTimeout(() => {
        giftAnimation.classList.add('hidden');
        playerArea.classList.remove('hidden');
        requestAnimationFrame(() => {
          playerArea.style.opacity = '0';
          requestAnimationFrame(() => {
            playerArea.style.opacity = '1';
          });
        });
      }, 300);
    }, 800);
  }

  // Make both gift box and button trigger the opening
  document.querySelector('.gift-box').addEventListener('click', openGift);
  claimReward.addEventListener('click', openGift);

  // (Removed duplicate openReward handler — consolidated earlier to trigger openGift)

  // Remove close button functionality
  if (closeReward) {
    closeReward.style.display = 'none';
  }

  // Remove pause/play button functionality - we want continuous play
  if (pausePlay) {
    pausePlay.style.display = 'none';
  }

  nextMedia.addEventListener('click', ()=>{
    advanceMedia();
  });

  // Playlist + slideshow implementation
  const playlist = [document.getElementById('audioPangako'), document.getElementById('audioMaging')];
  let playlistIndex = 0;
  let slideshowItems = []; // list of {type:'img'|'video', src: '...', duration, caption}
  let slideshowIndex = 0;
  let slideTimer = null;
  let slideStart = 0;
  let isPlaying = false;

  async function collectLocalMedia(){
    slideshowItems = [];
    try{
      const res = await fetch('storyboard.json');
      if(!res.ok) throw new Error('no storyboard');
      const arr = await res.json();
      slideshowItems = arr.map(it=>({type:it.type||'img', src:it.src, duration:it.duration||8000, caption:it.caption||''}));
    }catch(err){
      // fallback: pick main photo + other images & videos found by naming
      const main = '63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif';
      slideshowItems.push({type:'img', src: main, duration:8000, caption:''});
      for(let i=1;i<=6;i++) slideshowItems.push({type:'img', src:`photo${i}.jpg`, duration:8000, caption:''});
      for(let i=1;i<=3;i++) slideshowItems.push({type:'video', src:`vid${i}.mp4`, duration:12000, caption:''});
    }
    return slideshowItems;
  }

  async function startPlaylistAndSlideshow() {
    console.info('Starting playlist and slideshow...');
    
    // Reset slideshow state
    slideshowIndex = 0;
    window.currentPlaylist = 'pangako';
    
    // Get or create audio elements
    let audioP = document.getElementById('audioPangako');
    let audioM = document.getElementById('audioMaging');
    
    if (!audioP) {
        audioP = new Audio('pangako.mp3');
        audioP.id = 'audioPangako';
        document.body.appendChild(audioP);
    }
    
    if (!audioM) {
        audioM = new Audio('maging_sino.mp3');
        audioM.id = 'audioMaging';
        document.body.appendChild(audioM);
    }
    
    // Load audio tracks
    await Promise.all([
        new Promise(resolve => {
            audioP.addEventListener('canplaythrough', resolve, { once: true });
            audioP.load();
        }),
        new Promise(resolve => {
            audioM.addEventListener('canplaythrough', resolve, { once: true });
            audioM.load();
        })
    ]).catch(console.warn);
    
    // Set up audio switching
    audioP.addEventListener('ended', () => {
        if (window.currentPlaylist === 'pangako') {
            window.currentPlaylist = 'maging';
            audioM.currentTime = 0;
            audioM.play().catch(console.warn);
        }
    }, { once: true });
    
    // Start audio and show first item
    audioP.currentTime = 0;
    await audioP.play().catch(console.warn);
    
    // Start showing slides
    if (window.slideshowCore && typeof window.slideshowCore.start === 'function') {
        window.slideshowCore.start();
    } else {
        console.warn('Slideshow core not found');
        showSlideshowItem(0);
    }
}

function showSlideshowItem(idx) {
    console.info('========= Showing Slideshow Item ' + (idx + 1) + ' of ' + slideshowItems.length + ' =========');
    
    const item = slideshowItems[idx];
    if (!item) {
        console.warn('ERROR: No slideshow item found at index:', idx);
        return;
    }

    // Clear previous content and timers
    slideshow.innerHTML = '';
    clearTimeout(slideTimer);

    // Create new wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'slideshow-item';
    slideshow.appendChild(wrapper);
    
    // Function to show next slide
    const showNextSlide = () => {
        const nextIndex = idx + 1;
        if (nextIndex < slideshowItems.length) {
            console.info('Moving to next slide:', nextIndex);
            showSlideshowItem(nextIndex);
        } else {
            console.info('Reached end of slideshow');
        }
    };
    
    console.info('Loading media:', item.type, item.src);
    
    // Create media element first
    const mediaEl = item.type === 'video' ? document.createElement('video') : new Image();
    mediaEl.className = 'media';
    
    // Add data attributes for debugging
    mediaEl.dataset.itemIndex = idx;
    mediaEl.dataset.itemType = item.type;
    mediaEl.dataset.itemSrc = item.src;
    
    wrapper.appendChild(mediaEl);

    // Create caption
    const captionEl = document.createElement('div');
    captionEl.className = 'caption';
    captionEl.innerHTML = `<div class="caption-text">${item.caption || ''}</div>`;
    wrapper.appendChild(captionEl);
    
    if (item.type === 'video') {
        console.info('Setting up video:', item.src);
        mediaEl.autoplay = true;
        mediaEl.loop = false;
        mediaEl.muted = false;
        mediaEl.controls = false;
        mediaEl.playsInline = true;
        
        // Set up all video event handlers
        mediaEl.onloadedmetadata = () => {
            console.info('Video metadata loaded for slide', idx + 1);
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
        };
        
        mediaEl.oncanplay = () => {
            console.info('Video ready to play:', item.src);
            mediaEl.play().catch(err => {
                console.warn('Video play error:', err);
                showNextSlide();
            });
        };
        
        mediaEl.onended = () => {
            console.info('Video finished, advancing to next slide');
            showNextSlide();
        };

        mediaEl.onerror = (e) => {
            console.warn('Video error for slide', idx + 1, e.target.error);
            showNextSlide();
        };
    } else {
        console.info('Setting up image:', item.src);
        mediaEl.onload = () => {
            console.info('Image loaded successfully for slide', idx + 1);
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
            
            // Preload next image if available
            const nextIndex = idx + 1;
            if (nextIndex < slideshowItems.length && slideshowItems[nextIndex].type === 'img') {
                const preloadImg = new Image();
                preloadImg.src = slideshowItems[nextIndex].src;
            }
            
            // Schedule next slide
            clearTimeout(slideTimer);
            slideTimer = setTimeout(() => {
                console.info('Advancing to next slide after image duration');
                showNextSlide();
            }, item.duration || 8000);
        };

        mediaEl.onerror = () => {
            console.warn('Image failed to load for slide', idx + 1);
            setTimeout(() => {
                const nextIndex = (idx + 1) % slideshowItems.length;
                showSlideshowItem(nextIndex);
            }, 1000);
        };
    }
    
    // Set source and log
    console.info('Starting to load media for slide', idx + 1);
    mediaEl.src = item.src;
    
    // Add media to wrapper and start loading
    wrapper.appendChild(mediaEl);
    mediaEl.src = item.src;
    
    console.info('Started loading media:', item.src);

    // Create media element based on type
    let media;
    if (item.type === 'video') {
        media = document.createElement('video');
        media.className = 'media';
        media.autoplay = true;
        media.loop = false;
        media.muted = false;
        media.controls = false;
        media.playsInline = true;
        
        media.oncanplay = () => {
            requestAnimationFrame(() => {
                media.classList.add('active');
                caption.style.opacity = '1';
            });
        };

        media.onended = () => {
            const nextIndex = (idx + 1) % slideshowItems.length;
            showSlideshowItem(nextIndex);
        };
    } else {
        media = new Image();
        media.className = 'media';
        
        media.onload = () => {
            requestAnimationFrame(() => {
                media.classList.add('active');
                caption.style.opacity = '1';
            });
            
            // Schedule next slide for images
            clearTimeout(slideTimer);
            slideTimer = setTimeout(() => {
                const nextIndex = (idx + 1) % slideshowItems.length;
                console.info('Advancing to next slide:', nextIndex);
                showSlideshowItem(nextIndex);
            }, item.duration || 8000);
            
            // Preload next image if available
            if (slideshowItems[idx + 1] && slideshowItems[idx + 1].type === 'img') {
                const preloadImg = new Image();
                preloadImg.src = slideshowItems[idx + 1].src;
            }
        };
    }

    // Create caption
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.innerHTML = `<div class="caption-text">${item.caption || ''}</div>`;
    wrapper.appendChild(caption);

    // Handle load errors
    media.onerror = () => {
        console.warn('Failed to load media:', item.src);
        // Try next slide after error
        setTimeout(() => {
            const nextIndex = (idx + 1) % slideshowItems.length;
            showSlideshowItem(nextIndex);
        }, 1000);
    };

    // Add media to wrapper and start loading
    wrapper.appendChild(media);
    media.src = item.src;

    // Function to schedule next slide
    function scheduleNext() {
        clearTimeout(slideTimer);
        slideTimer = setTimeout(() => {
            const nextIndex = (idx + 1) % slideshowItems.length;
            if (nextIndex === 0 && currentGroup.end < slideshowItems.length - 1) {
                // Don't loop if we haven't reached the end of all slides
                return;
            }
            showSlideshowItem(nextIndex);
        }, item.duration);
    }

    // Handle image loading
    if (item.type === 'img') {
        // Preload next image
        if (idx + 1 < slideshowItems.length) {
            const nextItem = slideshowItems[idx + 1];
            if (nextItem.type === 'img') {
                const preloadImg = new Image();
                preloadImg.src = nextItem.src;
            }
        }

        media.onload = () => {
            requestAnimationFrame(() => {
                media.classList.add('active');
                caption.style.opacity = '1';
                scheduleNext();
            });
        };

        media.onerror = () => {
            console.warn('Failed to load image:', item.src);
            scheduleNext();
        };

        // Start loading the image
        media.src = item.src;
    } else if (item.type === 'video') {
        media.autoplay = true;
        media.loop = false;
        media.muted = false;
        media.controls = false;
        
        media.oncanplay = () => {
            media.classList.add('active');
            caption.style.opacity = '1';
        };

        media.onended = () => {
            const nextIndex = (idx + 1) % slideshowItems.length;
            showSlideshowItem(nextIndex);
        };

        media.src = item.src;
        media.play().catch(console.warn);
    }
}

  function advanceMedia(){
    if (window.slideshowCore) {
      window.slideshowCore.showItem(window.slideshowCore.index + 1);
    }
  }

  // Slideshow state managed by core now

  // Accessibility: close overlay with escape
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      if(!rewardOverlay.classList.contains('hidden')) closeReward.click();
    }
  });

// Accessibility: keyboard hint for puzzle
puzzleEl.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    // reshuffle
    createPuzzle();
  }
});

// end of script