/**
 * Mobile Responsive Enhancement Manager
 * Provides adaptive UI enhancements for mobile devices
 */
class MobileManager {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.orientation = this.getOrientation();
        this.touchSupport = this.detectTouch();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileEnhancements();
        this.setupTouchGestures();
        this.optimizeForMobile();
        
        console.log('📱 Mobile Manager initialized', {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            orientation: this.orientation,
            touchSupport: this.touchSupport
        });
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && 
               window.innerWidth >= 768 && window.innerWidth <= 1024;
    }
    
    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    setupEventListeners() {
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                this.handleOrientationChange();
            }, 100);
        });
        
        // Resize events
        window.addEventListener('resize', this.debounce(() => {
            this.isMobile = this.detectMobile();
            this.isTablet = this.detectTablet();
            this.updateLayout();
        }, 250));
        
        // Viewport changes for mobile browsers
        window.addEventListener('scroll', this.throttle(() => {
            this.handleMobileScroll();
        }, 16));
    }
    
    setupMobileEnhancements() {
        if (!this.isMobile && !this.isTablet) return;
        
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        if (this.isTablet) document.body.classList.add('tablet-device');
        
        // Enhance touch targets
        this.enhanceTouchTargets();
        
        // Optimize input fields
        this.optimizeInputs();
        
        // Setup mobile-friendly modals
        this.setupMobileModals();
        
        // Add swipe gestures
        this.setupSwipeGestures();
    }
    
    enhanceTouchTargets() {
        const buttons = document.querySelectorAll('button, .clickable, .btn');
        buttons.forEach(button => {
            if (!button.classList.contains('touch-optimized')) {
                button.classList.add('touch-optimized');
                
                // Minimum touch target size (44px recommended)
                const rect = button.getBoundingClientRect();
                if (rect.height < 44 || rect.width < 44) {
                    button.style.minHeight = '44px';
                    button.style.minWidth = '44px';
                    button.style.display = 'inline-flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                }
            }
        });
    }
    
    optimizeInputs() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            if (parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
            
            // Add mobile-specific attributes
            if (input.type === 'email') {
                input.setAttribute('autocapitalize', 'none');
                input.setAttribute('autocorrect', 'off');
            }
            
            if (input.type === 'search') {
                input.setAttribute('autocapitalize', 'none');
            }
            
            // Virtual keyboard handling
            input.addEventListener('focus', () => {
                this.handleVirtualKeyboard(true);
            });
            
            input.addEventListener('blur', () => {
                this.handleVirtualKeyboard(false);
            });
        });
    }
    
    setupMobileModals() {
        const modals = document.querySelectorAll('.modal, .popup');
        modals.forEach(modal => {
            if (this.isMobile) {
                modal.classList.add('mobile-modal');
                
                // Full-screen modals on mobile
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.zIndex = '9999';
            }
        });
    }
    
    setupSwipeGestures() {
        if (!this.touchSupport) return;
        
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }
    
    setupTouchGestures() {
        if (!this.touchSupport) return;
        
        // Pull to refresh (if applicable)
        this.setupPullToRefresh();
        
        // Long press gestures
        this.setupLongPress();
        
        // Pinch to zoom (for specific elements)
        this.setupPinchZoom();
    }
    
    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const threshold = 100;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0 && startY > 0) {
                pullDistance = e.touches[0].clientY - startY;
                
                if (pullDistance > 0 && pullDistance < threshold) {
                    // Show pull indicator
                    this.showPullIndicator(pullDistance / threshold);
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (pullDistance >= threshold) {
                // Trigger refresh
                this.triggerRefresh();
            }
            this.hidePullIndicator();
            startY = 0;
            pullDistance = 0;
        }, { passive: true });
    }
    
    setupLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.handleLongPress(e.target, e);
            }, 800);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }
    
    setupPinchZoom() {
        const zoomableElements = document.querySelectorAll('.zoomable, .text-area');
        
        zoomableElements.forEach(element => {
            let initialDistance = 0;
            let initialScale = 1;
            
            element.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                    initialScale = parseFloat(element.style.transform?.match(/scale\\(([^)]+)\\)/)?.[1] || 1);
                }
            });
            
            element.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    
                    const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                    const scale = initialScale * (currentDistance / initialDistance);
                    
                    element.style.transform = `scale(${Math.max(0.5, Math.min(3, scale))})`;
                }
            });
        });
    }
    
    handleOrientationChange() {
        // Adjust layout based on new orientation
        document.body.classList.toggle('landscape', this.orientation === 'landscape');
        document.body.classList.toggle('portrait', this.orientation === 'portrait');
        
        // Refresh layout calculations
        setTimeout(() => {
            this.updateLayout();
            this.optimizeForMobile();
        }, 300);
    }
    
    handleMobileScroll() {
        // Hide/show elements based on scroll
        const scrollY = window.scrollY;
        const header = document.querySelector('.header');
        
        if (header && this.isMobile) {
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
    
    handleVirtualKeyboard(isOpen) {
        if (this.isMobile) {
            document.body.classList.toggle('keyboard-open', isOpen);
            
            if (isOpen) {
                // Scroll to focused element
                setTimeout(() => {
                    const focused = document.activeElement;
                    if (focused && focused.scrollIntoView) {
                        focused.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }
                }, 300);
            }
        }
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
            // Vertical swipe
            if (deltaY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }
    
    handleLongPress(element, event) {
        // Custom long press actions
        if (element.classList.contains('text-content')) {
            this.showTextActions(element, event);
        }
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    onSwipeLeft() {
        // Navigate to next section or close panels
        const openPanel = document.querySelector('.panel.open');
        if (openPanel) {
            openPanel.classList.remove('open');
        }
    }
    
    onSwipeRight() {
        // Navigate to previous section or open panels
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && this.isMobile) {
            sidebar.classList.toggle('open');
        }
    }
    
    onSwipeUp() {
        // Minimize or hide bottom elements
        const bottomSheet = document.querySelector('.bottom-sheet');
        if (bottomSheet) {
            bottomSheet.classList.add('minimized');
        }
    }
    
    onSwipeDown() {
        // Show bottom elements or refresh
        const bottomSheet = document.querySelector('.bottom-sheet');
        if (bottomSheet) {
            bottomSheet.classList.remove('minimized');
        }
    }
    
    showPullIndicator(progress) {
        let indicator = document.querySelector('.pull-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'pull-indicator';
            indicator.innerHTML = '<i class=\"fas fa-arrow-down\"></i>';
            document.body.appendChild(indicator);
        }
        
        indicator.style.opacity = progress;
        indicator.style.transform = `translateY(${progress * 50}px)`;
    }
    
    hidePullIndicator() {
        const indicator = document.querySelector('.pull-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }
    }
    
    triggerRefresh() {
        // Refresh current analysis or content
        if (window.grammarChecker && window.grammarChecker.checkText) {
            window.grammarChecker.checkText();
        }
        
        this.showNotification('Content refreshed');
    }
    
    showTextActions(element, event) {
        // Show context menu for text actions
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.innerHTML = `
            <button onclick=\"this.parentElement.remove()\">Copy</button>
            <button onclick=\"this.parentElement.remove()\">Select All</button>
            <button onclick=\"this.parentElement.remove()\">Share</button>
        `;
        
        menu.style.position = 'fixed';
        menu.style.left = event.touches?.[0]?.clientX + 'px' || '50%';
        menu.style.top = event.touches?.[0]?.clientY + 'px' || '50%';
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        setTimeout(() => menu.remove(), 3000);
    }
    
    updateLayout() {
        // Update grid layouts for mobile
        const grids = document.querySelectorAll('.grid, .analysis-grid');
        grids.forEach(grid => {
            if (this.isMobile) {
                grid.style.gridTemplateColumns = '1fr';
            } else if (this.isTablet) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                grid.style.gridTemplateColumns = '';
            }
        });
    }
    
    optimizeForMobile() {
        if (!this.isMobile) return;
        
        // Optimize font sizes
        this.optimizeFontSizes();
        
        // Optimize spacing
        this.optimizeSpacing();
        
        // Optimize animations
        this.optimizeAnimations();
    }
    
    optimizeFontSizes() {
        const elements = document.querySelectorAll('h1, h2, h3, p, span');
        elements.forEach(el => {
            const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
            if (currentSize < 14) {
                el.style.fontSize = '14px';
            }
        });
    }
    
    optimizeSpacing() {
        const containers = document.querySelectorAll('.container, .content, .section');
        containers.forEach(container => {
            if (this.isMobile) {
                container.style.padding = '16px';
                container.style.margin = '8px 0';
            }
        });
    }
    
    optimizeAnimations() {
        // Reduce animations on mobile for better performance
        if (this.isMobile) {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--notification-bg, #333);
            color: var(--notification-text, #fff);
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Utility functions
    getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileManager = new MobileManager();
    });
} else {
    window.mobileManager = new MobileManager();
}
