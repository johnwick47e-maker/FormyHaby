// Slideshow functionality
window.slideshowState = {
    currentPlaylist: 'pangako',
    items: [],
    index: 0,
    timer: null
};

function showSlideshowItem(idx) {
    console.info('Starting to show slideshow item:', idx);
    
    if (idx >= window.slideshowState.items.length) {
        console.info('Slideshow complete - reached end');
        return;
    }
    
    const item = window.slideshowState.slideshowItems[idx];
    if (!item) {
        console.warn('No slideshow item found at index:', idx);
        return;
    }
    
    const item = slideshowItems[idx];
    if (!item) {
        console.warn('No slideshow item found at index:', idx);
        return;
    }

    // Clear previous content and timers
    slideshow.innerHTML = '';
    clearTimeout(slideTimer);

    // Create new wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'slideshow-item';
    slideshow.appendChild(wrapper);
    
    // Create media element first
    const mediaEl = item.type === 'video' ? document.createElement('video') : new Image();
    mediaEl.className = 'media';
    wrapper.appendChild(mediaEl);

    // Create caption
    const captionEl = document.createElement('div');
    captionEl.className = 'caption';
    captionEl.innerHTML = `<div class="caption-text">${item.caption || ''}</div>`;
    wrapper.appendChild(captionEl);
    
    // Set up media element based on type
    if (item.type === 'video') {
        mediaEl.autoplay = true;
        mediaEl.loop = false;
        mediaEl.muted = false;
        mediaEl.controls = false;
        mediaEl.playsInline = true;
        
        mediaEl.onloadedmetadata = () => {
            console.info('Video metadata loaded:', item.src);
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
        };
        
        mediaEl.oncanplay = () => {
            console.info('Video can play:', item.src);
            mediaEl.play().catch(err => {
                console.warn('Video play error:', err);
                setTimeout(() => showSlideshowItem(idx + 1), 1000);
            });
        };
        
        mediaEl.onended = () => {
            console.info('Video ended, moving to next item');
            showSlideshowItem(idx + 1);
        };
        
        mediaEl.onerror = () => {
            console.warn('Video failed to load:', item.src);
            setTimeout(() => showSlideshowItem(idx + 1), 1000);
        };
    } else {
        mediaEl.onload = () => {
            console.info('Image loaded:', item.src);
            mediaEl.classList.add('active');
            captionEl.style.opacity = '1';
            
            // Schedule next slide
            clearTimeout(slideTimer);
            slideTimer = setTimeout(() => {
                console.info('Image duration complete, moving to next item');
                showSlideshowItem(idx + 1);
            }, item.duration || 8000);
        };
        
        mediaEl.onerror = () => {
            console.warn('Image failed to load:', item.src);
            setTimeout(() => showSlideshowItem(idx + 1), 1000);
        };
    }
    
    // Start loading the media
    mediaEl.src = item.src;
    console.info('Started loading media:', item.src);
}

// Initialize slideshow items when gift opens
function initializeSlideshow() {
    window.slideshowState.slideshowItems = [
        // First two main images
        { type: 'img', src: '42d62442-4995-4c90-ba9d-4d3b24a24859.jfif', duration: 8000, caption: 'My promise to you...' },
        { type: 'img', src: '63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif', duration: 8000, caption: 'I promise to love you' },
        // First song slides
        { type: 'video', src: 'vid1.mp4', duration: 15000, caption: 'There will be no other than you' },
        { type: 'img', src: 'photo1.jpg', duration: 8000, caption: 'With all my heart' },
        { type: 'img', src: 'photo2.jpg', duration: 8000, caption: 'For all my life' },
        { type: 'img', src: 'photo3.jpg', duration: 8000, caption: 'I will never leave you' },
        { type: 'video', src: 'vid2.mp4', duration: 15000, caption: 'You are my only love' },
        { type: 'img', src: 'photo4.jpg', duration: 8000, caption: 'This is my promise to you' },
        // Second song slides
        { type: 'img', src: 'photo5.jpg', duration: 8000, caption: 'Whoever you may be...' },
        { type: 'video', src: 'vid3.mp4', duration: 15000, caption: 'I love you so much' },
        { type: 'img', src: 'photo6.jpg', duration: 8000, caption: 'In every moment' },
        { type: 'img', src: 'photo7.jpg', duration: 8000, caption: 'When the time is right' },
        { type: 'img', src: 'photo8.jpg', duration: 8000, caption: 'Just you and me' },
        { type: 'img', src: 'photo9.jpg', duration: 8000, caption: 'Together forever' },
        { type: 'img', src: 'photo10.jpg', duration: 8000, caption: 'You and I' }
    ];
    window.slideshowIndex = 0;
    console.info('Initialized slideshow with', slideshowItems.length, 'items');
    return slideshowItems;
}