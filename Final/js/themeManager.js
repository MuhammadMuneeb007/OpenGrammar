/**
 * Theme Manager - Handle multiple themes and user preferences
 */
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                icon: 'fas fa-sun'
            },
            dark: {
                name: 'Dark',
                icon: 'fas fa-moon'
            },            auto: {
                name: 'Auto',
                icon: 'fas fa-adjust'
            },
            'high-contrast': {
                name: 'High Contrast',
                icon: 'fas fa-eye'
            },
            sepia: {
                name: 'Sepia',
                icon: 'fas fa-book'
            }
        };
        
        this.currentTheme = 'auto';
        this.init();
    }

    init() {
        this.createThemeControls();
        this.bindEvents();
        this.loadSavedTheme();
        this.applyTheme();
    }

    createThemeControls() {
        const themeContainer = document.createElement('div');
        themeContainer.className = 'theme-controls';
        themeContainer.innerHTML = `
            <div class="theme-selector">
                <button class="theme-toggle-btn" id="themeToggle" title="Change Theme">
                    <i class="fas fa-palette"></i>
                </button>
                <div class="theme-dropdown" id="themeDropdown">
                    <div class="theme-dropdown-header">
                        <i class="fas fa-palette"></i>
                        <span>Choose Theme</span>
                    </div>
                    ${Object.entries(this.themes).map(([key, theme]) => `
                        <button class="theme-option" data-theme="${key}">
                            <i class="${theme.icon}"></i>
                            <span>${theme.name}</span>
                            <span class="theme-check"><i class="fas fa-check"></i></span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert into header
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(themeContainer);
        }
    }

    bindEvents() {
        const toggleBtn = document.getElementById('themeToggle');
        const dropdown = document.getElementById('themeDropdown');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && e.target !== toggleBtn) {
                dropdown.classList.remove('active');
            }
        });

        // Theme option clicks
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
                dropdown.classList.remove('active');
            });
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.currentTheme === 'auto') {
                    this.applyTheme();
                }
            });
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme();
        this.updateThemeControls();
        
        // Save to localStorage
        try {
            localStorage.setItem('opengrammar_theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }

        // Emit theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: theme }
        }));
    }

    applyTheme() {
        const body = document.body;
        const html = document.documentElement;
        
        // Remove all theme classes
        Object.keys(this.themes).forEach(theme => {
            body.classList.remove(`theme-${theme}`);
            html.classList.remove(`theme-${theme}`);
        });

        let effectiveTheme = this.currentTheme;

        // Handle auto theme
        if (this.currentTheme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                effectiveTheme = 'dark';
            } else {
                effectiveTheme = 'light';
            }
        }

        // Apply theme classes
        body.classList.add(`theme-${effectiveTheme}`);
        html.classList.add(`theme-${effectiveTheme}`);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);
    }

    updateMetaThemeColor(theme) {
        let themeColor = '#ffffff'; // light default
        
        switch (theme) {
            case 'dark':
                themeColor = '#1f2937';
                break;
            case 'high-contrast':
                themeColor = '#000000';
                break;
            case 'sepia':
                themeColor = '#f4f1e8';
                break;
        }

        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = themeColor;
    }

    updateThemeControls() {
        document.querySelectorAll('.theme-option').forEach(option => {
            const isActive = option.dataset.theme === this.currentTheme;
            option.classList.toggle('active', isActive);
        });

        // Update toggle button icon
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = this.themes[this.currentTheme]?.icon || 'fas fa-palette';
            }
        }
    }

    loadSavedTheme() {
        try {
            const saved = localStorage.getItem('opengrammar_theme');
            if (saved && this.themes[saved]) {
                this.currentTheme = saved;
            }
        } catch (e) {
            console.warn('Could not load saved theme');
        }
    }

    getTheme() {
        return this.currentTheme;
    }

    // Utility method for other components to get theme-aware colors
    getThemeColors() {
        const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const effectiveTheme = this.currentTheme === 'auto' ? (isSystemDark ? 'dark' : 'light') : this.currentTheme;
        
        const colors = {
            light: {
                primary: '#3b82f6',
                secondary: '#6b7280',
                background: '#ffffff',
                surface: '#f9fafb',
                text: '#111827',
                textSecondary: '#6b7280'
            },
            dark: {
                primary: '#60a5fa',
                secondary: '#9ca3af',
                background: '#111827',
                surface: '#1f2937',
                text: '#f9fafb',
                textSecondary: '#d1d5db'
            },
            'high-contrast': {
                primary: '#0000ff',
                secondary: '#666666',
                background: '#ffffff',
                surface: '#f0f0f0',
                text: '#000000',
                textSecondary: '#333333'
            },
            sepia: {
                primary: '#8b4513',
                secondary: '#a0522d',
                background: '#f4f1e8',
                surface: '#ede7d3',
                text: '#3e2723',
                textSecondary: '#5d4037'
            }
        };

        return colors[effectiveTheme] || colors.light;
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}
