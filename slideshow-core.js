// Core slideshow functionality
window.slideshowCore = {
    state: {
        currentPlaylist: 'pangako',
        items: [],
        index: 0,
        timer: null
    },

    async initialize() {
        try {
            const res = await fetch('storyboard.json');
            if (!res.ok) throw new Error('Failed to load storyboard.json');
            this.state.items = await res.json();
            console.info('Loaded', this.state.items.length, 'items from storyboard.json');
        } catch (err) {
            console.error('Failed to load storyboard:', err);
            this.state.items = [];
            return;
        }
        this.state.index = 0;
        
        // Setup audio
        await this.setupAudio();
    },

    async setupAudio() {
        // Create audio elements
        const audioPangako = document.getElementById('audioPangako') || new Audio('pangako.mp3');
        const audioMaging = document.getElementById('audioMaging') || new Audio('maging_sino.mp3');
        
        audioPangako.id = 'audioPangako';
        audioMaging.id = 'audioMaging';
        
        // Ensure they're in the DOM
        if (!document.getElementById('audioPangako')) {
            document.body.appendChild(audioPangako);
        }
        if (!document.getElementById('audioMaging')) {
            document.body.appendChild(audioMaging);
        }
        
        // Chain the audio tracks
        audioPangako.addEventListener('ended', () => {
            if (this.state.currentPlaylist === 'pangako') {
                this.state.currentPlaylist = 'maging';
                audioMaging.currentTime = 0;
                audioMaging.play().catch(console.warn);
            }
        }, { once: true });
        
        // Preload audio
        try {
            audioPangako.load();
            audioMaging.load();
        } catch (err) {
            console.warn('Audio preload failed:', err);
        }
    },

    showItem(idx) {
        // Handle looping
        if (idx >= this.state.items.length) {
            idx = 0;
        }
        if (idx < 0) {
            idx = this.state.items.length - 1;
        }

        this.state.index = idx;
        const slideshow = document.getElementById('slideshow');
        if (!slideshow) return;

        const item = this.state.items[idx];
        if (!item) return;

        // Clean up previous video if any
        const previousVideo = slideshow.querySelector('video');
        if (previousVideo) {
            previousVideo.pause();
            previousVideo.removeAttribute('src');
            previousVideo.load();
        }

        // Clear previous content and stop timers
        slideshow.innerHTML = '';
        clearTimeout(this.state.timer);

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
                mediaEl.play().catch(() => this.showNext());
            };

            mediaEl.onended = () => this.showNext();
            
            mediaEl.onerror = () => {
                console.warn('Video failed:', item.src);
                this.showNext();
            };
        } else {
            mediaEl.onload = () => {
                mediaEl.classList.add('active');
                captionEl.style.opacity = '1';
                
                // Schedule next slide for images
                this.state.timer = setTimeout(() => this.showNext(), item.duration || 8000);
            };
            
            mediaEl.onerror = () => {
                console.warn('Image failed:', item.src);
                this.showNext();
            };
        }

        // Load the media
        mediaEl.src = item.src;
    },

    showNext() {
        const nextIndex = this.state.index + 1;
        if (nextIndex < this.state.items.length) {
            this.state.index = nextIndex;
            this.showItem(nextIndex);
        }
    },

    start() {
        this.showItem(0);
        
        // Start first audio
        const audioPangako = document.getElementById('audioPangako');
        if (audioPangako) {
            audioPangako.currentTime = 0;
            audioPangako.play().catch(console.warn);
        }
    }
};