/**
 * Feature Integration Manager
 * Ensures all OpenGrammar features work together seamlessly
 */
class FeatureIntegrationManager {
    constructor() {
        this.features = {
            textStatistics: null,
            writingTools: null,
            advancedAnalysis: null,
            themeManager: null,
            mobileManager: null
        };
        
        this.mainTextArea = null;
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Find the main text area
        this.mainTextArea = document.getElementById('inputText');
        
        if (!this.mainTextArea) {
            console.warn('⚠️ Main text area not found. Feature integration may not work properly.');
            return;
        }
        
        // Setup global text change listeners
        this.setupGlobalListeners();
        
        // Initialize feature connections
        this.connectFeatures();
        
        // Setup refresh mechanism
        this.setupRefreshMechanism();
        
        this.initialized = true;
        console.log('🔗 Feature Integration Manager initialized');
    }
    
    setupGlobalListeners() {
        if (!this.mainTextArea) return;
        
        // Listen for all text changes
        const handleTextChange = this.debounce(() => {
            this.notifyAllFeatures();
        }, 300);
        
        this.mainTextArea.addEventListener('input', handleTextChange);
        this.mainTextArea.addEventListener('paste', () => {
            setTimeout(() => this.notifyAllFeatures(), 100);
        });
        
        // Listen for programmatic text changes
        this.observeTextChanges();
    }
    
    observeTextChanges() {
        if (!this.mainTextArea) return;
        
        let lastValue = this.mainTextArea.value;
        
        // Check for value changes every 500ms
        setInterval(() => {
            const currentValue = this.mainTextArea.value;
            if (currentValue !== lastValue) {
                lastValue = currentValue;
                this.notifyAllFeatures();
            }
        }, 500);
    }
    
    connectFeatures() {
        // Connect to existing global instances
        setTimeout(() => {
            this.features.textStatistics = window.textStatistics;
            this.features.writingTools = window.writingTools;
            this.features.advancedAnalysis = window.advancedAnalysis;
            this.features.themeManager = window.themeManager;
            this.features.mobileManager = window.mobileManager;
            
            // Initial notification to all features
            this.notifyAllFeatures();
        }, 1000);
    }
    
    notifyAllFeatures() {
        if (!this.mainTextArea) return;
        
        const currentText = this.mainTextArea.value || '';
        
        // Notify text statistics
        if (this.features.textStatistics && this.features.textStatistics.updateStatsFromMainText) {
            this.features.textStatistics.updateStatsFromMainText();
        }
        
        // Notify writing tools
        if (this.features.writingTools && this.features.writingTools.refreshFromMainText) {
            this.features.writingTools.refreshFromMainText();
        }
        
        // Notify advanced analysis
        if (this.features.advancedAnalysis && this.features.advancedAnalysis.updateAnalysis) {
            this.features.advancedAnalysis.updateAnalysis();
        }
        
        // Dispatch global event for other components
        document.dispatchEvent(new CustomEvent('opengrammar-text-changed', {
            detail: { text: currentText }
        }));
    }
    
    setupRefreshMechanism() {
        // Add refresh button to UI
        this.addRefreshButton();
        
        // Auto-refresh when switching tabs
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.notifyAllFeatures(), 100);
            }
        });
    }
    
    addRefreshButton() {
        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;
        
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-features-btn';
        refreshBtn.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Refresh</span>
        `;
        refreshBtn.title = 'Refresh all features with current text';
        refreshBtn.style.cssText = `
            background: var(--primary-color, #3b82f6);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
        `;
        
        refreshBtn.addEventListener('click', () => {
            this.forceRefreshAll();
            this.showRefreshFeedback(refreshBtn);
        });
        
        refreshBtn.addEventListener('mouseenter', () => {
            refreshBtn.style.transform = 'translateY(-1px)';
            refreshBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        });
        
        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.transform = 'translateY(0)';
            refreshBtn.style.boxShadow = 'none';
        });
        
        statsBar.appendChild(refreshBtn);
    }
    
    forceRefreshAll() {
        console.log('🔄 Force refreshing all features...');
        this.notifyAllFeatures();
        
        // Also refresh any panels that might be collapsed
        this.expandAllPanels();
    }
    
    expandAllPanels() {
        // Expand text statistics if collapsed
        const statsPanel = document.querySelector('.text-stats-panel .stats-content.collapsed');
        if (statsPanel) {
            const toggleBtn = document.querySelector('.text-stats-panel .toggle-stats');
            if (toggleBtn) toggleBtn.click();
        }
        
        // Expand writing tools if collapsed
        const toolsPanel = document.querySelector('.writing-tools-panel .tools-content.collapsed');
        if (toolsPanel) {
            const toggleBtn = document.querySelector('.writing-tools-panel .toggle-tools');
            if (toggleBtn) toggleBtn.click();
        }
        
        // Expand advanced analysis if collapsed
        const analysisPanel = document.querySelector('.advanced-analysis-panel .analysis-content.collapsed');
        if (analysisPanel) {
            const toggleBtn = document.querySelector('.advanced-analysis-panel .toggle-analysis');
            if (toggleBtn) toggleBtn.click();
        }
    }
    
    showRefreshFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <i class="fas fa-check"></i>
            <span>Updated!</span>
        `;
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'var(--primary-color, #3b82f6)';
        }, 1500);
    }
    
    // Utility function for debouncing
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
    
    // Public API methods
    getMainText() {
        return this.mainTextArea ? this.mainTextArea.value : '';
    }
    
    setMainText(text) {
        if (this.mainTextArea) {
            this.mainTextArea.value = text;
            this.notifyAllFeatures();
        }
    }
    
    isReady() {
        return this.initialized && !!this.mainTextArea;
    }
}

// Initialize the integration manager
window.featureIntegrationManager = new FeatureIntegrationManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureIntegrationManager;
}
