// Audio handling functionality
window.audioHandler = {
    audioElements: {
        pangako: null,
        maging: null
    },
    
    async setup() {
        // Create audio elements if they don't exist
        if (!this.audioElements.pangako) {
            this.audioElements.pangako = new Audio('pangako.mp3');
            this.audioElements.pangako.id = 'audioPangako';
        }
        
        if (!this.audioElements.maging) {
            this.audioElements.maging = new Audio('maging_sino.mp3');
            this.audioElements.maging.id = 'audioMaging';
        }
        
        // Ensure they're in the DOM
        if (!document.getElementById('audioPangako')) {
            document.body.appendChild(this.audioElements.pangako);
        }
        if (!document.getElementById('audioMaging')) {
            document.body.appendChild(this.audioElements.maging);
        }
        
        // Set up audio chaining
        this.audioElements.pangako.addEventListener('ended', () => {
            if (window.slideshowState.currentPlaylist === 'pangako') {
                window.slideshowState.currentPlaylist = 'maging';
                this.audioElements.maging.currentTime = 0;
                this.audioElements.maging.play().catch(console.warn);
            }
        }, { once: true });
        
        // Load audio files
        await Promise.all([
            new Promise(resolve => {
                this.audioElements.pangako.addEventListener('canplaythrough', resolve, { once: true });
                this.audioElements.pangako.load();
            }),
            new Promise(resolve => {
                this.audioElements.maging.addEventListener('canplaythrough', resolve, { once: true });
                this.audioElements.maging.load();
            })
        ]).catch(console.warn);
        
        return this.audioElements;
    },
    
    async start() {
        try {
            const audio = this.audioElements.pangako;
            if (audio) {
                audio.currentTime = 0;
                audio.volume = 1;
                audio.muted = false;
                await audio.play();
                console.info('Started first audio track');
            }
        } catch (err) {
            console.warn('Failed to start audio:', err);
        }
    }
};