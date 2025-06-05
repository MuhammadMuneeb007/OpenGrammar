/**
 * Text Manager Component
 * Handles text statistics, file operations, and text manipulation
 */

class TextManager {
    constructor(config, uiManager) {
        this.config = config;
        this.uiManager = uiManager;
        this.textStats = {
            words: 0,
            characters: 0,
            sentences: 0,
            paragraphs: 0,
            complexity: 'Basic'
        };
        
        this.synonymCache = new Map();
        this.setupEventListeners();
        this.loadSampleText();
    }

    /**
     * Setup event listeners for text-related functionality
     */
    setupEventListeners() {
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('input', this.debounce(() => {
                this.updateTextStats();
                this.saveToLocalStorage();
            }, 300));
            
            textEditor.addEventListener('dblclick', this.handleWordDoubleClick.bind(this));
            textEditor.addEventListener('paste', this.handlePaste.bind(this));
        }
    }

    /**
     * Load sample text for demonstration
     */
    loadSampleText() {
        const sampleText = `Welcome to OpenGrammar! This AI-powered writing assistant help you improve your text quality. OpenGrammar analyzes your writing for grammar errors, style issues, and coherence problems. Simply paste or type your text above and click "Check Grammar" to get started. The tool will provide detailed feedback to enhance your writing skills.`;
        
        const textEditor = document.getElementById('inputText');
        if (textEditor && !textEditor.value.trim()) {
            textEditor.value = sampleText;
            this.updateTextStats();
        }
    }

    /**
     * Update text statistics
     */
    updateTextStats() {
        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        const text = textEditor.value;
        
        // Calculate basic stats
        this.textStats.characters = text.length;
        this.textStats.words = text.trim() ? text.trim().split(/\s+/).length : 0;
        this.textStats.sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
        this.textStats.paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
        
        // Calculate complexity
        this.textStats.complexity = this.calculateComplexity(text);
        
        // Update UI
        this.uiManager.updateStatsDisplay(this.textStats);
    }

    /**
     * Calculate text complexity
     */
    calculateComplexity(text) {
        if (!text.trim()) return 'Basic';
        
        const words = text.trim().split(/\s+/);
        const totalWords = words.length;
        const sentences = (text.match(/[.!?]+/g) || []).length || 1;
        const avgWordsPerSentence = totalWords / sentences;
        
        // Count complex words (more than 6 characters)
        const complexWords = words.filter(word => word.length > 6).length;
        const complexWordRatio = complexWords / totalWords;
        
        if (avgWordsPerSentence > 20 || complexWordRatio > 0.3) {
            return 'Advanced';
        } else if (avgWordsPerSentence > 15 || complexWordRatio > 0.2) {
            return 'Intermediate';
        } else {
            return 'Basic';
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size
        if (file.size > this.config.maxFileSize) {
            this.uiManager.showToast('error', 'File Too Large', 
                `File size must be less than ${this.config.maxFileSize / 1024 / 1024}MB`);
            return;
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFileTypes.includes(fileExtension)) {
            this.uiManager.showToast('error', 'Unsupported File Type', 
                `Supported formats: ${this.config.supportedFileTypes.join(', ')}`);
            return;
        }

        try {
            let text = '';
            
            if (fileExtension === '.txt') {
                text = await this.readTextFile(file);
            } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
                text = await this.extractTextFromImage(file);
            } else if (['.doc', '.docx'].includes(fileExtension)) {
                text = await this.extractTextFromDocument(file);
            } else if (fileExtension === '.pdf') {
                text = await this.extractTextFromPDF(file);
            }

            if (text.trim()) {
                const textEditor = document.getElementById('inputText');
                if (textEditor) {
                    textEditor.value = text;
                    this.updateTextStats();
                    this.uiManager.showToast('success', 'File Loaded', 'Text extracted and loaded successfully');
                }
            } else {
                this.uiManager.showToast('warning', 'No Text Found', 'No readable text was found in the file');
            }
        } catch (error) {
            console.error('File processing error:', error);
            this.uiManager.showToast('error', 'File Processing Failed', 'Unable to process the selected file');
        }

        // Reset file input
        event.target.value = '';
    }

    /**
     * Read text file
     */
    async readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Extract text from image using OCR (placeholder)
     */
    async extractTextFromImage(file) {
        // This would require an OCR library like Tesseract.js
        // For now, return a placeholder message
        throw new Error('Image text extraction requires OCR functionality to be implemented');
    }

    /**
     * Extract text from document (placeholder)
     */
    async extractTextFromDocument(file) {
        // This would require a library to parse DOC/DOCX files
        throw new Error('Document text extraction requires additional libraries to be implemented');
    }

    /**
     * Extract text from PDF (placeholder)
     */
    async extractTextFromPDF(file) {
        // This would require PDF.js or similar library
        throw new Error('PDF text extraction requires PDF processing library to be implemented');
    }

    /**
     * Copy text to clipboard
     */
    async copyText() {
        const textEditor = document.getElementById('inputText');
        if (!textEditor) {
            this.uiManager.showToast('error', 'Error', 'Text editor not found');
            return;
        }

        const text = textEditor.value;
        if (!text.trim()) {
            this.uiManager.showToast('warning', 'No Text', 'There is no text to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.uiManager.showToast('success', 'Text Copied!', 'Text has been copied to your clipboard');
        } catch (err) {
            // Fallback for older browsers
            textEditor.select();
            try {
                document.execCommand('copy');
                this.uiManager.showToast('success', 'Text Copied!', 'Text has been copied to your clipboard');
            } catch (fallbackErr) {
                this.uiManager.showToast('error', 'Copy Failed', 'Unable to copy text to clipboard');
            }
        }
    }    /**
     * Handle word double-click for synonyms
     */
    async handleWordDoubleClick(event) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        // Check if selection exists and has ranges
        if (!selectedText || selectedText.length < 2 || selection.rangeCount === 0) return;
        
        // Clean the word (remove punctuation)
        const word = selectedText.replace(/[^\w]/g, '').toLowerCase();
        if (!word) return;

        const rect = selection.getRangeAt(0).getBoundingClientRect();
        await this.showSynonymTooltip(word, {
            x: rect.left + rect.width / 2,
            y: rect.top
        });
    }

    /**
     * Show synonym tooltip
     */
    async showSynonymTooltip(word, position) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.synonym-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        try {
            const synonyms = await this.getSynonyms(word);
            
            if (synonyms.length === 0) {
                this.uiManager.showToast('info', 'No Synonyms', `No synonyms found for "${word}"`);
                return;
            }

            this.createSynonymTooltip(word, synonyms, position);
        } catch (error) {
            console.error('Synonym lookup error:', error);
            this.uiManager.showToast('error', 'Synonym Error', 'Unable to fetch synonyms');
        }
    }

    /**
     * Get synonyms for a word
     */
    async getSynonyms(word) {
        // Check cache first
        if (this.synonymCache.has(word)) {
            return this.synonymCache.get(word);
        }

        try {
            // Try API first (you would need to implement this with a real synonym API)
            const synonyms = await this.fetchSynonymsFromAPI(word);
            this.synonymCache.set(word, synonyms);
            return synonyms;
        } catch (error) {
            // Fallback to local synonyms
            const localSynonyms = this.getLocalSynonyms(word);
            this.synonymCache.set(word, localSynonyms);
            return localSynonyms;
        }
    }

    /**
     * Fetch synonyms from API (placeholder)
     */
    async fetchSynonymsFromAPI(word) {
        // This would use a real synonym API like Datamuse or WordsAPI
        // For now, throw an error to trigger fallback
        throw new Error('API not implemented');
    }

    /**
     * Get local synonyms for common words (fallback)
     */
    getLocalSynonyms(word) {
        const synonymDict = {
            'good': ['excellent', 'great', 'wonderful', 'fantastic', 'superb'],
            'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful'],
            'big': ['large', 'huge', 'enormous', 'massive', 'gigantic'],
            'small': ['tiny', 'little', 'miniature', 'petite', 'compact'],
            'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'content'],
            'sad': ['unhappy', 'sorrowful', 'melancholy', 'dejected', 'downcast'],
            'fast': ['quick', 'rapid', 'swift', 'speedy', 'hasty'],
            'slow': ['sluggish', 'leisurely', 'gradual', 'unhurried', 'delayed']
        };
        
        return synonymDict[word.toLowerCase()] || [];
    }

    /**
     * Create synonym tooltip
     */
    createSynonymTooltip(word, synonyms, position) {
        const tooltip = document.createElement('div');
        tooltip.className = 'synonym-tooltip';
        tooltip.innerHTML = `
            <div class="synonym-header">
                <strong>Synonyms for "${word}":</strong>
                <button class="tooltip-close">&times;</button>
            </div>
            <div class="synonym-list">
                ${synonyms.map(synonym => 
                    `<span class="synonym-item" data-synonym="${synonym}">${synonym}</span>`
                ).join('')}
            </div>
        `;

        // Position tooltip
        tooltip.style.left = `${position.x}px`;
        tooltip.style.top = `${position.y - 10}px`;
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';

        document.body.appendChild(tooltip);

        // Add event listeners
        tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
            tooltip.remove();
        });

        tooltip.querySelectorAll('.synonym-item').forEach(item => {
            item.addEventListener('click', () => {
                this.replaceSynonym(word, item.dataset.synonym);
                tooltip.remove();
            });
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 10000);

        // Animate in
        if (typeof anime !== 'undefined') {
            anime({
                targets: tooltip,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 300,
                easing: 'easeOutCubic'
            });
        }
    }

    /**
     * Replace word with synonym
     */
    replaceSynonym(originalWord, synonym) {
        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(synonym));
            
            // Clear selection
            selection.removeAllRanges();
            
            // Update stats
            this.updateTextStats();
            
            this.uiManager.showToast('success', 'Word Replaced', 
                `Replaced "${originalWord}" with "${synonym}"`);
        }
    }

    /**
     * Handle paste events
     */
    handlePaste(event) {
        // Allow default paste behavior but update stats after
        setTimeout(() => {
            this.updateTextStats();
        }, 100);
    }

    /**
     * Save text to localStorage
     */
    saveToLocalStorage() {
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            try {
                localStorage.setItem('opengrammar_text', textEditor.value);
            } catch (error) {
                console.log('Failed to save to localStorage:', error);
            }
        }
    }

    /**
     * Load text from localStorage
     */
    loadFromLocalStorage() {
        const textEditor = document.getElementById('inputText');
        if (textEditor && !textEditor.value.trim()) {
            try {
                const savedText = localStorage.getItem('opengrammar_text');
                if (savedText) {
                    textEditor.value = savedText;
                    this.updateTextStats();
                }
            } catch (error) {
                console.log('Failed to load from localStorage:', error);
            }
        }
    }

    /**
     * Get current text statistics
     */
    getTextStats() {
        return { ...this.textStats };
    }

    /**
     * Clear text and reset stats
     */
    clearText() {
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.value = '';
            this.updateTextStats();
            this.uiManager.showToast('info', 'Text Cleared', 'Text editor has been cleared');
        }
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextManager;
}
