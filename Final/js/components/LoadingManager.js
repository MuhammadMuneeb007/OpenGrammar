/**
 * Loading Manager Component
 * Handles the iPhone-style loading screen with animations and timing
 */

class LoadingManager {
    constructor(grammarChecker) {
        this.grammarChecker = grammarChecker;
        this.loadingState = {
            isVisible: true,
            startTime: Date.now(),
            minDisplayTime: 3000,
            componentsReady: false
        };
        
        this.loadingTips = [
            'Preparing your writing assistant...',
            'Loading AI-powered grammar analysis...',
            'Setting up real-time corrections...',
            'Initializing document metrics...',
            'Preparing synonym suggestions...',
            'Loading writing enhancement tools...',
            'Setting up coherence analysis...',
            'Initializing readability scoring...',
            'Preparing export functionality...',
            'Almost ready to enhance your writing!'        ];
        
        this.keyHandler = null;
        // Don't auto-initialize - let the main app control it
    }

    /**
     * Initialize loading screen functionality
     */
    initialize() {
        console.log('LoadingManager: Initializing loading screen');
        this.showLoadingScreen();
        this.hideMainContentForLoading();
        this.preloadResources();
        this.animateLoadingProgress();
        this.setupKeyboardHandler();
        
        // Set components ready after a short delay
        setTimeout(() => {
            console.log('LoadingManager: Components ready, checking if loading complete');
            this.loadingState.componentsReady = true;
            this.checkLoadingComplete();
        }, 2000);
    }

    /**
     * Hide main content while loading screen is visible
     */
    hideMainContentForLoading() {
        const mainElements = [
            '.header',
            '.main',
            '.review-section'
        ];
        
        mainElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.visibility = 'hidden';
            });
        });
    }

    /**
     * Show main content after loading screen is hidden
     */
    showMainContent() {
        const mainElements = [
            '.header',
            '.main',
            '.review-section'
        ];
        
        mainElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            });
        });
    }    /**
     * Show the loading screen
     * Minimal implementation - just logo and button on gradient background
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            loadingScreen.classList.remove('hidden');
            this.loadingState.isVisible = true;
            
            // Ensure no container styling is applied
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                // Remove any accidentally applied container styles
                loadingContent.style.background = 'none';
                loadingContent.style.padding = '0';
                loadingContent.style.border = 'none';
                loadingContent.style.boxShadow = 'none';
                loadingContent.style.backdropFilter = 'none';
            }
        }
    }

    /**
     * Hide the loading screen with animation
     */
    hideLoadingScreen(callback) {
        if (!this.loadingState.isVisible) {
            console.log('LoadingManager: Loading screen already hidden');
            return;
        }
        
        console.log('LoadingManager: Hiding loading screen');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            this.loadingState.isVisible = false;
            
            // Use anime.js for smooth transition if available
            if (typeof anime !== 'undefined') {
                anime({
                    targets: loadingScreen,
                    opacity: 0,
                    scale: 1.1,
                    duration: 800,
                    easing: 'easeInOutQuart',
                    complete: () => {
                        console.log('LoadingManager: Animation complete, hiding element');
                        loadingScreen.style.display = 'none';
                        loadingScreen.classList.add('hidden');
                        this.showMainContent();
                        this.removeKeyboardHandler();
                        if (callback) callback();
                    }
                });
            } else {
                // Fallback without anime.js
                console.log('LoadingManager: Using fallback animation');
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    this.showMainContent();
                    this.removeKeyboardHandler();
                    if (callback) callback();
                }, 800);
            }
        } else {
            console.error('LoadingManager: Loading screen element not found');
        }
    }

    /**
     * Animate loading progress bar and show tips
     */
    animateLoadingProgress() {
        const progressBar = document.querySelector('.iphone-loading-progress');
        const loadingTip = document.querySelector('.loading-tip');
        
        if (!progressBar) return;

        // Animate progress bar
        if (typeof anime !== 'undefined') {
            anime({
                targets: progressBar,
                width: ['0%', '100%'],
                duration: this.loadingState.minDisplayTime,
                easing: 'easeOutQuart'
            });
        }
        
        // Show rotating tips
        this.showRandomLoadingTips();
    }

    /**
     * Show random loading tips with rotation
     */
    showRandomLoadingTips() {
        const loadingTip = document.querySelector('.loading-tip');
        if (!loadingTip) return;
        
        let currentTipIndex = 0;
        
        const showNextTip = () => {
            if (!this.loadingState.isVisible) return;
            
            const tip = this.loadingTips[currentTipIndex];
            loadingTip.textContent = tip;
            
            if (typeof anime !== 'undefined') {
                anime({
                    targets: loadingTip,
                    opacity: [0, 1, 1, 0],
                    duration: 2000,
                    easing: 'easeInOutCubic',
                    complete: () => {
                        currentTipIndex = (currentTipIndex + 1) % this.loadingTips.length;
                        if (this.loadingState.isVisible) {
                            setTimeout(showNextTip, 500);
                        }
                    }
                });
            } else {
                setTimeout(() => {
                    currentTipIndex = (currentTipIndex + 1) % this.loadingTips.length;
                    if (this.loadingState.isVisible) {
                        setTimeout(showNextTip, 2000);
                    }
                }, 2000);
            }
        };
        
        showNextTip();
    }

    /**
     * Setup keyboard handler for loading screen
     */
    setupKeyboardHandler() {
        this.keyHandler = (event) => {
            if (event.key.toLowerCase() === 's' && this.loadingState.isVisible) {
                event.preventDefault();
                console.log('S key pressed - skipping loading screen');
                this.forceHide();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        console.log('Loading screen keyboard handler attached');
    }

    /**
     * Remove keyboard handler
     */
    removeKeyboardHandler() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
            console.log('Loading screen keyboard handler removed');
        }
    }

    /**
     * Update loading message (can be called from location service)
     */
    updateLoadingMessage(message) {
        const locationWelcome = document.getElementById('locationWelcome');
        if (locationWelcome && this.loadingState.isVisible) {
            locationWelcome.textContent = message;
            
            if (typeof anime !== 'undefined') {
                anime({
                    targets: locationWelcome,
                    scale: [1, 1.05, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        }
    }    /**
     * Preload critical resources for better performance
     */
    preloadResources() {
        // Preload any critical images or resources
        const criticalImages = [
            './static/logo.PNG'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        // Warm up localStorage access
        try {
            localStorage.getItem('opengrammar_view_count');
            localStorage.getItem('opengrammar_reviews');
        } catch (e) {
            console.log('localStorage not available');
        }
    }    /**
     * Check if loading is complete and hide screen if ready
     */
    checkLoadingComplete() {
        const elapsed = Date.now() - this.loadingState.startTime;
        const minTimeReached = elapsed >= this.loadingState.minDisplayTime;
        
        if (minTimeReached && this.loadingState.componentsReady) {
            // Add a small delay for smoother experience
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 500);
        }
    }    /**
     * Force hide loading screen (for manual triggers)
     */
    forceHide() {
        console.log('LoadingManager: Force hiding loading screen');
        
        // Hide immediately regardless of state
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.add('hidden');
        }
        
        this.loadingState.isVisible = false;
        this.showMainContent();
        this.removeKeyboardHandler();
    }

    /**
     * Check if loading screen is visible
     */
    isVisible() {
        return this.loadingState.isVisible;
    }

    /**
     * Show loading screen (public method)
     */
    show() {
        this.showLoadingScreen();
    }

    /**
     * Hide loading screen (public method)
     */
    hide(callback) {
        this.hideLoadingScreen(callback);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
