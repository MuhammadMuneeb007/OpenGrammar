/**
 * Modern Grammar Checker - Main Application Class (Refactored)
 * A comprehensive grammar and writing analysis tool using modular components
 */

class GrammarChecker {
    constructor() {
        // Configuration
        this.config = {
            apiBaseUrl: 'https://f9c8-130-102-10-78.ngrok-free.app',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            supportedFileTypes: ['.txt', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
            autoSaveDelay: 2000,
            animationDuration: 300
        };

        // State management
        this.state = {
            isAnalyzing: false,
            currentAnalysis: null,
            corrections: new Map(),
            activeTab: 'corrections',
            textStats: {
                words: 0,
                characters: 0,
                sentences: 0,
                paragraphs: 0,
                complexity: 'Basic'
            }
        };

        // Initialize components
        this.initializeComponents();
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize all component managers
     */
    initializeComponents() {
        // Initialize Loading Manager first (it controls the initial loading screen)
        this.loadingManager = new LoadingManager(this);
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        
        // Initialize Text Manager
        this.textManager = new TextManager(this);
        
        // Initialize Modal Manager
        this.modalManager = new ModalManager(this);
        
        // Initialize Analysis Manager
        this.analysisManager = new AnalysisManager(this);
        
        // Initialize Feature Manager
        this.featureManager = new FeatureManager(this);
    }

    /**
     * Initialize the application
     */
    init() {
        // Start loading screen
        this.loadingManager.show();
        
        // Initialize components in sequence
        this.bindEvents();
        this.setupUI();
        this.loadSampleText();
        this.textManager.updateStats();
        this.uiManager.setupAnimations();
        
        // Initialize features
        this.featureManager.initializeViewCounter();
        this.featureManager.initializeLocationWelcome();
        this.featureManager.initializeReviewSystem();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            this.loadingManager.hide(() => {
                this.uiManager.animatePageLoad();
            });
        }, 2000);
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Text editor events
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('input', this.debounce(() => {
                this.textManager.updateStats();
                this.saveToLocalStorage();
            }, 300));
            
            textEditor.addEventListener('dblclick', this.textManager.handleWordDoubleClick.bind(this.textManager));
            textEditor.addEventListener('paste', this.textManager.handlePaste.bind(this.textManager));
        }

        // Button events
        const checkGrammarBtn = document.getElementById('checkGrammar');
        if (checkGrammarBtn) {
            checkGrammarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.analysisManager.analyzeText();
            });
        }

        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.analysisManager.acceptAllCorrections();
            });
        }

        const uploadBtn = document.getElementById('uploadFileBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('fileInput')?.click();
            });
        }

        const copyBtn = document.getElementById('copyText');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.textManager.copyText();
            });
        }

        const downloadBtn = document.getElementById('downloadPDF');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportToPDF();
            });
        }

        // File upload
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', this.textManager.handleFileUpload.bind(this.textManager));
        }

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', this.uiManager.switchTab.bind(this.uiManager));
        });

        // Modal events
        this.modalManager.bindEvents();

        // Synonym tooltip events
        this.textManager.bindSynonymEvents();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Setup button hover animations
        this.uiManager.setupButtonAnimations();
    }

    /**
     * Setup UI components
     */
    setupUI() {
        this.uiManager.setupUI();
    }

    /**
     * Load sample text into the editor
     */
    loadSampleText() {
        const textEditor = document.getElementById('inputText');
        if (textEditor && !textEditor.value.trim()) {
            const sampleText = `Welcome to OpenGrammar! This is your AI-powered writing assistant that helps improve your grammar, style, and overall writing quality.

Try typing some text or paste your document here to get started. Our advanced AI will analyze your writing and provide suggestions to make it even better.

Some example issues we can help with:
• Grammar mistakes and typos
• Sentence structure improvements  
• Clarity and readability suggestions
• Writing style enhancements

Let's make your writing shine!`;
            
            textEditor.value = sampleText;
            this.textManager.updateStats();
        }
    }

    /**
     * Export text to PDF
     */
    exportToPDF() {
        const textEditor = document.getElementById('inputText');
        if (!textEditor || !textEditor.value.trim()) {
            this.uiManager.showToast('Please enter some text to export', 'warning');
            return;
        }

        try {
            if (typeof PDFGenerator !== 'undefined') {
                const generator = new PDFGenerator();
                generator.generatePDF(textEditor.value, this.state.textStats);
                this.uiManager.showToast('PDF exported successfully!', 'success');
            } else {
                throw new Error('PDF Generator not available');
            }
        } catch (error) {
            console.error('PDF Export Error:', error);
            this.uiManager.showToast('Failed to export PDF. Please try again.', 'error');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl+Enter or Cmd+Enter to analyze
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.analysisManager.analyzeText();
        }
        
        // Ctrl+S or Cmd+S to save (prevent default and show toast)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveToLocalStorage();
            this.uiManager.showToast('Content saved locally!', 'success');
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.modalManager.closeAllModals();
        }
    }

    /**
     * Handle before page unload
     */
    handleBeforeUnload(e) {
        if (this.state.isAnalyzing) {
            e.preventDefault();
            e.returnValue = 'Analysis in progress. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Responsive handling can be added here
        console.log('Window resized');
    }

    /**
     * Save content to localStorage
     */
    saveToLocalStorage() {
        try {
            const textEditor = document.getElementById('inputText');
            if (textEditor) {
                localStorage.setItem('grammarChecker_text', textEditor.value);
                localStorage.setItem('grammarChecker_timestamp', Date.now().toString());
            }
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Restore content from localStorage
     */
    restoreFromLocalStorage() {
        try {
            const savedText = localStorage.getItem('grammarChecker_text');
            const textEditor = document.getElementById('inputText');
            
            if (savedText && textEditor && !textEditor.value) {
                textEditor.value = savedText;
                this.textManager.updateStats();
            }
        } catch (error) {
            console.error('Failed to restore from localStorage:', error);
        }
    }

    /**
     * Utility function to debounce function calls
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
     * Get current text from editor
     */
    getCurrentText() {
        const textEditor = document.getElementById('inputText');
        return textEditor ? textEditor.value : '';
    }

    /**
     * Set text in editor
     */
    setCurrentText(text) {
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.value = text;
            this.textManager.updateStats();
            this.saveToLocalStorage();
        }
    }

    /**
     * Update the state
     */
    updateState(updates) {
        Object.assign(this.state, updates);
    }

    /**
     * Get component by name
     */
    getComponent(name) {
        switch (name) {
            case 'ui': return this.uiManager;
            case 'text': return this.textManager;
            case 'modal': return this.modalManager;
            case 'loading': return this.loadingManager;
            case 'analysis': return this.analysisManager;
            case 'feature': return this.featureManager;
            default: return null;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.grammarChecker = new GrammarChecker();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarChecker;
}
