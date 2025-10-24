// Slideshow functionality
window.slideshowState = {
    currentPlaylist: 'pangako',
    items: [],
    index: 0,
    timer: null
};

function showSlideshowItem(idx) {
    const slideshow = document.getElementById('slideshow');
    if (!slideshow) return;
    
    if (idx >= window.slideshowState.items.length) {
        console.info('Slideshow complete - reached end');
        return;
    }
    
    const item = window.slideshowState.items[idx];
    if (!item) return;
    
    // Clear previous content and timers
    slideshow.innerHTML = '';
    clearTimeout(window.slideshowState.timer);
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'slideshow-item';
    slideshow.appendChild(wrapper);
    
    // Create media element
    const mediaEl = item.type === 'video' ? document.createElement('video') : new Image();
    mediaEl.className = 'media';
    wrapper.appendChild(mediaEl);
    
    // Add caption
    const captionEl = document.createElement('div');
    captionEl.className = 'caption';
    captionEl.innerHTML = `<div class="caption-text">${item.caption || ''}</div>`;
    wrapper.appendChild(captionEl);
    
    // Setup based on media type
    if (item.type === 'video') {
        mediaEl.autoplay = true;
        mediaEl.loop = false;
        mediaEl.muted = false;
        mediaEl.controls = false;
        mediaEl.playsInline = true;
        
        mediaEl.onloadedmetadata = () => {
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
        };
        
        mediaEl.oncanplay = () => {
            mediaEl.play().catch(() => {
                window.slideshowState.index++;
                showSlideshowItem(window.slideshowState.index);
            });
        };
        
        mediaEl.onended = () => {
            window.slideshowState.index++;
            showSlideshowItem(window.slideshowState.index);
        };
    } else {
        mediaEl.onload = () => {
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
            
            // Schedule next slide for images
            window.slideshowState.timer = setTimeout(() => {
                window.slideshowState.index++;
                showSlideshowItem(window.slideshowState.index);
            }, item.duration || 8000);
        };
    }
    
    // Start loading
    mediaEl.src = item.src;
}

function initializeSlideshow() {
    // Initialize with slides (excluding the puzzle image)
    window.slideshowState.items = [
        // First image
        { type: 'img', src: '42d62442-4995-4c90-ba9d-4d3b24a24859.jfif', duration: 8000, caption: 'My promise to you...' },
        // Videos and other images
        { type: 'video', src: 'vid1.mp4', duration: 15000, caption: 'There will be no other than you' },
        { type: 'img', src: 'photo1.jpg', duration: 8000, caption: 'With all my heart' },
        { type: 'img', src: 'photo2.jpg', duration: 8000, caption: 'For all my life' },
        { type: 'img', src: 'photo3.jpg', duration: 8000, caption: 'I will never leave you' },
        { type: 'video', src: 'vid2.mp4', duration: 15000, caption: 'You are my only love' },
        { type: 'img', src: 'photo4.jpg', duration: 8000, caption: 'This is my promise to you' },
        { type: 'img', src: 'photo5.jpg', duration: 8000, caption: 'Whoever you may be...' },
        { type: 'video', src: 'vid3.mp4', duration: 15000, caption: 'I love you so much' },
        { type: 'img', src: 'photo6.jpg', duration: 8000, caption: 'In every moment' },
        { type: 'img', src: 'photo7.jpg', duration: 8000, caption: 'When the time is right' },
        { type: 'img', src: 'photo8.jpg', duration: 8000, caption: 'Just you and me' },
        { type: 'img', src: 'photo9.jpg', duration: 8000, caption: 'Together forever' },
        { type: 'img', src: 'photo10.jpg', duration: 8000, caption: 'You and I' }
    ];
    window.slideshowState.index = 0;
    return window.slideshowState.items;
}

async function startSlideshow() {
    // Setup audio
    const audioPangako = document.getElementById('audioPangako') || new Audio('pangako.mp3');
    const audioMaging = document.getElementById('audioMaging') || new Audio('maging_sino.mp3');
    
    if (!document.getElementById('audioPangako')) {
        audioPangako.id = 'audioPangako';
        document.body.appendChild(audioPangako);
    }
    if (!document.getElementById('audioMaging')) {
        audioMaging.id = 'audioMaging';
        document.body.appendChild(audioMaging);
    }
    
    // Chain audio tracks
    audioPangako.addEventListener('ended', () => {
        audioMaging.currentTime = 0;
        audioMaging.play().catch(console.warn);
    }, { once: true });
    
    // Start first audio
    try {
        audioPangako.currentTime = 0;
        await audioPangako.play();
    } catch(err) {
        console.warn('Failed to start audio:', err);
    }
    
    // Start slideshow
    showSlideshowItem(0);
}