/**
 * UI Manager Component
 * Handles all UI-related functionality, animations, and interactions
 */

class UIManager {
    constructor(config) {
        this.config = config;
        this.setupAnimations();
        this.setupTooltips();
        this.setupResponsiveLayout();
        this.setupTheme();
    }

    /**
     * Setup animations and interactions
     */
    setupAnimations() {
        if (typeof anime === 'undefined') {
            console.warn('Anime.js not loaded, using fallback animations');
            return;
        }
        
        this.setupButtonAnimations();
    }

    /**
     * Animate page elements on load
     */
    animatePageLoad() {
        if (typeof anime === 'undefined') return;

        // Animate panels
        anime({
            targets: '.editor-panel, .results-panel',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutExpo'
        });

        // Animate metric cards
        anime({
            targets: '.metric-card',
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 500 }),
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });

        // Animate buttons
        anime({
            targets: '.btn',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(50, { start: 700 }),
            duration: 500,
            easing: 'easeOutCubic'
        });
    }

    /**
     * Setup button hover animations
     */
    setupButtonAnimations() {
        if (typeof anime === 'undefined') return;

        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    anime({
                        targets: btn,
                        scale: 1.05,
                        duration: 200,
                        easing: 'easeOutCubic'
                    });
                }
            });

            btn.addEventListener('mouseleave', () => {
                anime({
                    targets: btn,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutCubic'
                });
            });
        });
    }

    /**
     * Initialize tooltips
     */
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.setAttribute('title', element.dataset.tooltip);
        });
    }

    /**
     * Setup responsive layout
     */
    setupResponsiveLayout() {
        const handleResponsiveChanges = () => {
            const isMobile = window.innerWidth < 768;
            document.body.classList.toggle('mobile', isMobile);
        };
        
        handleResponsiveChanges();
        window.addEventListener('resize', this.debounce(handleResponsiveChanges, 250));
    }

    /**
     * Initialize theme
     */
    setupTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
    }

    /**
     * Show toast notification with animation
     */
    showToast(type, title, message) {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-${this.getToastIcon(type)}"></i>
                </div>
                <div class="toast-text">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        toastContainer.appendChild(toast);

        // Animate in
        if (typeof anime !== 'undefined') {
            anime({
                targets: toast,
                translateX: [300, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutCubic'
            });
        }

        // Auto hide after 5 seconds
        setTimeout(() => this.hideToast(toast), 5000);
    }

    /**
     * Hide toast with animation
     */
    hideToast(toast) {
        if (typeof anime !== 'undefined') {
            anime({
                targets: toast,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInCubic',
                complete: () => toast.remove()
            });
        } else {
            toast.remove();
        }
    }

    /**
     * Create toast container if it doesn't exist
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Get appropriate icon for toast type
     */
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Switch between tabs with animation
     */
    switchTab(targetTabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === targetTabName) {
                tab.classList.add('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(targetTabName);
        if (targetPanel) {
            targetPanel.classList.add('active');
            
            // Animate tab content
            if (typeof anime !== 'undefined') {
                anime({
                    targets: targetPanel,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 400,
                    easing: 'easeOutCubic'
                });
            }
        }

        return targetTabName;
    }

    /**
     * Animate counter with smooth counting effect
     */
    animateCounter(element, start, end, duration) {
        if (!element) return;

        const startTime = Date.now();
        const startValue = parseInt(start) || 0;
        const endValue = parseInt(end) || 0;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Add celebration effect when counter finishes
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: element,
                        scale: [1, 1.1, 1],
                        duration: 600,
                        easing: 'easeOutElastic(1, .8)'
                    });
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Debounce utility function
     */
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

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update statistics display with animation
     */
    updateStatsDisplay(stats) {
        const elements = {
            wordCount: stats.words,
            charCount: stats.characters,
            complexity: stats.complexity
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 200);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
