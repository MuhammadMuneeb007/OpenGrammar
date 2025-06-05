/**
 * SynonymManager - Dedicated class for handling synonym functionality
 * Provides word replacement, synonym lookup, and intelligent text selection
 */
class SynonymManager {
    constructor() {
        console.log('SynonymManager constructor called');
        this.isActive = false;
        this.selectedWord = null;
        this.selectedRange = null;
        this.storedSelection = null;
        this.synonymCache = new Map();
        this.init();
    }

    /**
     * Initialize the synonym manager
     */
    init() {
        this.bindEvents();
        this.createTooltip();
    }

    /**
     * Bind events for synonym functionality
     */
    bindEvents() {
        // Bind synonym button click
        const synonymBtn = document.getElementById('synonymBtn');
        if (synonymBtn) {
            synonymBtn.addEventListener('click', this.toggleSynonymMode.bind(this));
        }

        // Bind text selection events
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('mouseup', this.handleTextSelection.bind(this));
            textEditor.addEventListener('keyup', this.handleTextSelection.bind(this));
        }

        // Close tooltip when clicking outside
        document.addEventListener('click', (event) => {
            const tooltip = document.getElementById('synonymTooltip');
            const synonymBtn = document.getElementById('synonymBtn');
            
            if (tooltip && 
                !tooltip.contains(event.target) && 
                event.target !== synonymBtn &&
                !synonymBtn.contains(event.target)) {
                this.hideSynonymTooltip();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Escape to close tooltip
            if (event.key === 'Escape') {
                this.hideSynonymTooltip();
                this.deactivateSynonymMode();
            }
            
            // Alt + S to toggle synonym mode
            if (event.altKey && event.key === 's') {
                event.preventDefault();
                this.toggleSynonymMode();
            }
        });
    }

    /**
     * Create the synonym tooltip element
     */
    createTooltip() {
        // Check if tooltip already exists
        if (document.getElementById('synonymTooltip')) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'synonymTooltip';
        tooltip.className = 'synonym-tooltip';
        tooltip.innerHTML = `
            <div class="synonym-header">
                <h4>Synonyms</h4>
                <button id="closeTooltip" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="synonymContent" class="synonym-content">
                <div class="loading-text">Finding synonyms...</div>
            </div>
        `;
        
        document.body.appendChild(tooltip);

        // Bind close button
        const closeBtn = document.getElementById('closeTooltip');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideSynonymTooltip.bind(this));
        }
    }    /**
     * Toggle synonym mode on/off
     */
    toggleSynonymMode() {
        console.log('toggleSynonymMode called, current state:', this.isActive);
        this.isActive = !this.isActive;
        const btn = document.getElementById('synonymBtn');
        const textEditor = document.getElementById('inputText');

        if (this.isActive) {
            this.activateSynonymMode();
        } else {
            this.deactivateSynonymMode();
        }
    }

    /**
     * Activate synonym mode
     */
    activateSynonymMode() {
        this.isActive = true;
        const btn = document.getElementById('synonymBtn');
        const textEditor = document.getElementById('inputText');

        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = `
                <i class="fas fa-eye"></i>
                <span>Synonym Mode ON</span>
            `;
        }

        if (textEditor) {
            textEditor.classList.add('synonym-mode');
            textEditor.style.cursor = 'crosshair';
        }

        this.showToast('info', 'Synonym Mode Active', 'Select any word to see synonyms. Press Escape to exit.');
    }

    /**
     * Deactivate synonym mode
     */
    deactivateSynonymMode() {
        this.isActive = false;
        const btn = document.getElementById('synonymBtn');
        const textEditor = document.getElementById('inputText');

        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = `
                <i class="fas fa-book"></i>
                <span>Find Synonyms</span>
            `;
        }

        if (textEditor) {
            textEditor.classList.remove('synonym-mode');
            textEditor.style.cursor = 'text';
        }

        this.hideSynonymTooltip();
    }    /**
     * Handle text selection in the editor
     */
    handleTextSelection(event) {
        console.log('handleTextSelection called, isActive:', this.isActive);
        if (!this.isActive) return;

        const textEditor = document.getElementById('inputText');
        if (!textEditor) {
            console.error('Text editor not found in handleTextSelection');
            return;
        }

        // For textarea elements, use selectionStart and selectionEnd
        const selectionStart = textEditor.selectionStart;
        const selectionEnd = textEditor.selectionEnd;
        
        console.log('Selection range:', { selectionStart, selectionEnd });

        // Get selected text from textarea
        const selectedText = textEditor.value.substring(selectionStart, selectionEnd).trim();
        console.log('Selected text:', selectedText);

        // If no text selected or text is too short, try to select word at cursor
        if (!selectedText || selectedText.length < 2) {
            console.log('No text selected or too short, trying to select word at cursor');
            this.selectWordAtCursor(textEditor);
            return;
        }

        // Validate that selection is a single word (no spaces, reasonable length)
        if (this.isValidWord(selectedText)) {
            console.log('Valid word selected:', selectedText);
            this.selectedWord = selectedText;
            
            // Store selection for later use
            this.storedSelection = {
                word: selectedText,
                start: selectionStart,
                end: selectionEnd,
                timestamp: Date.now()
            };
            
            console.log('Stored selection:', this.storedSelection);
            this.showSynonymTooltip(selectedText, event);
        } else {
            console.log('Invalid word selected:', selectedText);
            this.hideSynonymTooltip();
        }
    }

    /**
     * Select word at cursor position
     */
    selectWordAtCursor(textEditor) {
        const cursorPos = textEditor.selectionStart;
        const text = textEditor.value;
        
        // Find word boundaries
        let wordStart = cursorPos;
        let wordEnd = cursorPos;

        // Move backward to find word start
        while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
            wordStart--;
        }

        // Move forward to find word end
        while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
            wordEnd++;
        }

        const word = text.substring(wordStart, wordEnd);        if (this.isValidWord(word)) {
            // Select the word
            textEditor.setSelectionRange(wordStart, wordEnd);
            this.selectedWord = word;
            
            // Store the selection for later use
            this.storedSelection = {
                start: wordStart,
                end: wordEnd,
                word: word
            };
            
            console.log('Word selected at cursor:', word, 'at position:', { wordStart, wordEnd });
            
            // Calculate position for tooltip
            const rect = textEditor.getBoundingClientRect();
            const lineHeight = parseInt(window.getComputedStyle(textEditor).lineHeight) || 20;
            const charWidth = 8; // Approximate character width
            
            // Estimate position (this is approximate)
            const position = {
                x: rect.left + (cursorPos % 50) * charWidth,
                y: rect.top + Math.floor(cursorPos / 50) * lineHeight + 30
            };

            this.showSynonymTooltip(word, { clientX: position.x, clientY: position.y });
        }
    }

    /**
     * Check if a string is a valid word for synonym lookup
     */
    isValidWord(word) {
        return word && 
               word.length >= 2 && 
               word.length <= 20 && 
               /^[a-zA-Z]+$/.test(word) && 
               !word.includes(' ');
    }    /**
     * Show synonym tooltip with word suggestions
     */
    async showSynonymTooltip(word, event) {
        console.log('showSynonymTooltip called with word:', word);
        
        const tooltip = document.getElementById('synonymTooltip');
        const content = document.getElementById('synonymContent');
        
        if (!tooltip || !content) {
            console.error('Tooltip elements not found');
            return;
        }

        // Store current selection from text editor - ensure we capture it immediately
        const textEditor = document.getElementById('inputText');
        if (textEditor && !this.storedSelection) {
            const selectionStart = textEditor.selectionStart;
            const selectionEnd = textEditor.selectionEnd;
            const selectedText = textEditor.value.substring(selectionStart, selectionEnd);
            
            this.storedSelection = {
                start: selectionStart,
                end: selectionEnd,
                word: selectedText.trim() || word,
                timestamp: Date.now()
            };
            console.log('Stored fresh selection:', this.storedSelection);
        }

        // Position tooltip near the mouse or text selection
        let x = event.clientX || event.x || 0;
        let y = event.clientY || event.y || 0;
        
        // If we have a text editor, try to position relative to it
        if (textEditor) {
            const rect = textEditor.getBoundingClientRect();
            
            // Position tooltip to the right of the selection if possible
            if (x < rect.left || x > rect.right) {
                x = rect.left + 20;
            }
            if (y < rect.top || y > rect.bottom) {
                y = rect.top + 50;
            }
        }
        
        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (x + 300 > viewportWidth) x = viewportWidth - 320;
        if (y + 200 > viewportHeight) y = y - 220;
          tooltip.style.left = `${Math.max(10, x)}px`;
        tooltip.style.top = `${Math.max(10, y)}px`;
        
        console.log('Tooltip positioned at:', { x, y });
        
        // Show loading state
        content.innerHTML = '<div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Finding synonyms...</div>';
        tooltip.classList.add('active');
        tooltip.classList.add('show');

        try {
            // Check cache first
            const cacheKey = word.toLowerCase();
            if (this.synonymCache.has(cacheKey)) {
                console.log('Using cached synonyms for:', word);
                this.displaySynonyms(this.synonymCache.get(cacheKey), word);
                return;
            }

            // Fetch synonyms
            console.log('Fetching synonyms for:', word);
            let synonyms = await this.fetchSynonyms(word);
            
            // Cache the results
            this.synonymCache.set(cacheKey, synonyms);
            
            console.log('Found synonyms:', synonyms);
            this.displaySynonyms(synonyms, word);

        } catch (error) {
            console.error('Synonym lookup error:', error);
            content.innerHTML = '<div class="error-text"><i class="fas fa-exclamation-circle"></i> Unable to load synonyms</div>';
        }
    }

    /**
     * Fetch synonyms from multiple sources
     */
    async fetchSynonyms(word) {
        let synonyms = [];

        // Try online API first
        try {
            const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`);
            if (response.ok) {
                const data = await response.json();
                synonyms = data.map(item => item.word).slice(0, 8);
            }
        } catch (error) {
            console.warn('Online synonym API failed:', error);
        }

        // Fallback to local database
        if (synonyms.length === 0) {
            synonyms = this.getLocalSynonyms(word.toLowerCase());
        }

        return synonyms;
    }

    /**
     * Display synonyms in the tooltip
     */
    displaySynonyms(synonyms, originalWord) {
        const content = document.getElementById('synonymContent');
        if (!content) return;

        if (synonyms.length > 0) {
            const synonymsHtml = synonyms.map(synonym => `
                <button class="synonym-item" data-synonym="${synonym}" data-original="${originalWord}">
                    <span class="synonym-word">${synonym}</span>
                    <i class="fas fa-arrow-right synonym-arrow"></i>
                </button>
            `).join('');

            content.innerHTML = `
                <div class="synonym-list">
                    <div class="original-word">Replace: <strong>${originalWord}</strong></div>
                    ${synonymsHtml}
                </div>
            `;            // Bind click events to synonym items
            content.querySelectorAll('.synonym-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const synonym = item.dataset.synonym;
                    const original = item.dataset.original;
                    
                    console.log('Synonym item clicked:', { synonym, original, storedSelection: this.storedSelection });
                    
                    // Add visual feedback
                    item.style.background = '#007acc';
                    item.style.color = 'white';
                    
                    // Delay the replacement slightly to ensure UI feedback is visible
                    setTimeout(() => {
                        this.replaceSynonym(original, synonym);
                    }, 100);
                });
                
                // Add hover effects
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.background = '';
                });
            });
        } else {
            content.innerHTML = `
                <div class="no-synonyms">
                    <i class="fas fa-search"></i>
                    <p>No synonyms found for "<strong>${originalWord}</strong>"</p>
                    <small>Try selecting a different word</small>
                </div>
            `;
        }
    }    /**
     * Replace selected word with chosen synonym
     */
    replaceSynonym(originalWord, synonym) {
        console.log('=== REPLACE SYNONYM START ===');
        console.log('replaceSynonym called with:', { originalWord, synonym });
        console.log('Current storedSelection:', this.storedSelection);
        
        const textEditor = document.getElementById('inputText');
        if (!textEditor) {
            console.error('Text editor not found!');
            return;
        }

        const text = textEditor.value;
        console.log('Current text length:', text.length);

        // Use stored selection if available and valid
        let selectionStart, selectionEnd, selectedText;
        
        if (this.storedSelection && 
            this.storedSelection.word.toLowerCase() === originalWord.toLowerCase() &&
            this.storedSelection.start >= 0 &&
            this.storedSelection.end <= text.length) {
            
            selectionStart = this.storedSelection.start;
            selectionEnd = this.storedSelection.end;
            selectedText = text.substring(selectionStart, selectionEnd);
            
            console.log('Using stored selection:', { 
                selectionStart, 
                selectionEnd, 
                selectedText,
                matches: selectedText.toLowerCase() === originalWord.toLowerCase()
            });
            
        } else {
            // Fallback to current selection
            selectionStart = textEditor.selectionStart;
            selectionEnd = textEditor.selectionEnd;
            selectedText = text.substring(selectionStart, selectionEnd);
            
            console.log('Using current selection:', { 
                selectionStart, 
                selectionEnd, 
                selectedText 
            });
        }

        // Verify the selected text matches the original word
        if (selectedText.toLowerCase() === originalWord.toLowerCase()) {
            console.log('✓ Selected text matches original word');
            
            // Preserve case of original word
            const formattedSynonym = this.preserveCase(selectedText, synonym);
            console.log('Formatted synonym:', formattedSynonym);
            
            // Replace the selected text
            const beforeText = text.substring(0, selectionStart);
            const afterText = text.substring(selectionEnd);
            const newText = beforeText + formattedSynonym + afterText;
            
            console.log('Text replacement details:', {
                beforeLength: beforeText.length,
                replacedWordLength: selectedText.length,
                synonymLength: formattedSynonym.length,
                afterLength: afterText.length,
                newTotalLength: newText.length
            });
            
            textEditor.value = newText;
            
            // Update cursor position
            const newCursorPos = selectionStart + formattedSynonym.length;
            textEditor.setSelectionRange(newCursorPos, newCursorPos);
            textEditor.focus();
            
            // Update stats if function exists
            if (window.grammarChecker && typeof window.grammarChecker.updateTextStats === 'function') {
                window.grammarChecker.updateTextStats();
            }
            
            console.log('✓ Word replaced successfully');
            this.showToast('success', 'Word Replaced', `"${selectedText}" replaced with "${formattedSynonym}"`);
            this.hideSynonymTooltip();
            
        } else {
            console.log('✗ Selected text does not match - trying regex approach');
            console.log('Comparison:', { 
                selectedTextLower: selectedText.toLowerCase(), 
                originalWordLower: originalWord.toLowerCase()
            });
            
            // Alternative approach: find and replace the word in the text using regex
            const escapedWord = originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
            const match = regex.exec(text);
            
            if (match) {
                console.log('✓ Found word using regex at position:', match.index);
                const formattedSynonym = this.preserveCase(match[0], synonym);
                const newText = text.substring(0, match.index) + formattedSynonym + text.substring(match.index + match[0].length);
                textEditor.value = newText;
                
                // Set cursor after the replaced word
                const newCursorPos = match.index + formattedSynonym.length;
                textEditor.setSelectionRange(newCursorPos, newCursorPos);
                textEditor.focus();
                
                // Update stats if function exists
                if (window.grammarChecker && typeof window.grammarChecker.updateTextStats === 'function') {
                    window.grammarChecker.updateTextStats();
                }
                
                console.log('✓ Word found and replaced using regex');
                this.showToast('success', 'Word Replaced', `"${match[0]}" replaced with "${formattedSynonym}"`);
                this.hideSynonymTooltip();
            } else {
                console.error('✗ Word not found in text using regex');
                this.showToast('error', 'Replacement Failed', `Could not find "${originalWord}" in the text.`);
            }
        }

        // Clear stored selection
        this.storedSelection = null;
        console.log('=== REPLACE SYNONYM END ===');
    }

    /**
     * Preserve the case pattern of the original word
     */
    preserveCase(original, replacement) {
        if (original === original.toLowerCase()) {
            return replacement.toLowerCase();
        } else if (original === original.toUpperCase()) {
            return replacement.toUpperCase();
        } else if (original[0] === original[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
        } else {
            return replacement;
        }
    }    /**
     * Hide the synonym tooltip
     */
    hideSynonymTooltip() {
        const tooltip = document.getElementById('synonymTooltip');
        if (tooltip) {
            tooltip.classList.remove('active');
            tooltip.classList.remove('show');
        }
    }

    /**
     * Local synonym database for offline use
     */
    getLocalSynonyms(word) {
        const synonymDatabase = {
            'good': ['excellent', 'great', 'wonderful', 'fine', 'nice', 'superb'],
            'bad': ['terrible', 'awful', 'poor', 'horrible', 'dreadful', 'lousy'],
            'big': ['large', 'huge', 'enormous', 'massive', 'giant', 'vast'],
            'small': ['tiny', 'little', 'minute', 'miniature', 'compact', 'petite'],
            'fast': ['quick', 'rapid', 'swift', 'speedy', 'hasty', 'brisk'],
            'slow': ['gradual', 'leisurely', 'sluggish', 'unhurried', 'delayed', 'tardy'],
            'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'elated'],
            'sad': ['unhappy', 'sorrowful', 'melancholy', 'depressed', 'gloomy', 'dejected'],
            'beautiful': ['lovely', 'gorgeous', 'stunning', 'attractive', 'pretty', 'elegant'],
            'ugly': ['unattractive', 'hideous', 'unsightly', 'repulsive', 'grotesque', 'plain'],
            'smart': ['intelligent', 'clever', 'bright', 'brilliant', 'wise', 'sharp'],
            'stupid': ['foolish', 'dumb', 'ignorant', 'silly', 'senseless', 'mindless'],
            'strong': ['powerful', 'mighty', 'robust', 'sturdy', 'tough', 'solid'],
            'weak': ['feeble', 'frail', 'fragile', 'delicate', 'brittle', 'flimsy'],
            'hot': ['warm', 'heated', 'burning', 'scorching', 'blazing', 'sweltering'],
            'cold': ['cool', 'chilly', 'freezing', 'frigid', 'icy', 'frosty'],
            'new': ['fresh', 'recent', 'modern', 'novel', 'current', 'latest'],
            'old': ['ancient', 'aged', 'elderly', 'vintage', 'antique', 'mature'],
            'easy': ['simple', 'effortless', 'straightforward', 'uncomplicated', 'basic', 'elementary'],
            'hard': ['difficult', 'challenging', 'tough', 'complex', 'demanding', 'arduous'],
            'important': ['significant', 'crucial', 'vital', 'essential', 'critical', 'major'],
            'help': ['assist', 'aid', 'support', 'guide', 'facilitate', 'contribute'],
            'show': ['display', 'demonstrate', 'reveal', 'exhibit', 'present', 'illustrate'],
            'make': ['create', 'build', 'construct', 'produce', 'manufacture', 'generate'],
            'think': ['consider', 'ponder', 'reflect', 'contemplate', 'deliberate', 'reason'],
            'say': ['speak', 'state', 'declare', 'express', 'mention', 'utter'],
            'get': ['obtain', 'acquire', 'receive', 'gain', 'secure', 'achieve'],
            'give': ['provide', 'offer', 'present', 'donate', 'contribute', 'supply'],
            'take': ['grab', 'seize', 'capture', 'acquire', 'obtain', 'collect'],
            'come': ['arrive', 'approach', 'reach', 'appear', 'emerge', 'enter'],
            'go': ['leave', 'depart', 'exit', 'travel', 'proceed', 'move'],
            'see': ['observe', 'notice', 'spot', 'view', 'witness', 'perceive'],
            'know': ['understand', 'comprehend', 'realize', 'recognize', 'acknowledge', 'grasp'],
            'want': ['desire', 'wish', 'crave', 'need', 'require', 'long'],
            'like': ['enjoy', 'appreciate', 'love', 'adore', 'favor', 'prefer'],
            'use': ['utilize', 'employ', 'apply', 'operate', 'implement', 'exercise'],
            'find': ['discover', 'locate', 'uncover', 'detect', 'spot', 'identify'],
            'tell': ['inform', 'notify', 'advise', 'explain', 'communicate', 'reveal'],
            'ask': ['inquire', 'question', 'request', 'query', 'demand', 'petition'],
            'work': ['function', 'operate', 'labor', 'toil', 'perform', 'execute'],
            'play': ['perform', 'act', 'compete', 'participate', 'engage', 'frolic'],
            'move': ['shift', 'transfer', 'relocate', 'transport', 'migrate', 'progress'],
            'live': ['exist', 'reside', 'dwell', 'inhabit', 'survive', 'flourish'],
            'love': ['adore', 'cherish', 'treasure', 'worship', 'devotion', 'passion'],
            'hate': ['despise', 'loathe', 'detest', 'abhor', 'dislike', 'resent']
        };

        return synonymDatabase[word] || [];
    }

    /**
     * Show toast notification (fallback to console if toast function not available)
     */
    showToast(type, title, message) {
        if (window.grammarChecker && typeof window.grammarChecker.showToast === 'function') {
            window.grammarChecker.showToast(type, title, message);
        } else {
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
        }
    }
}

// Initialize synonym manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing SynonymManager...');
    window.synonymManager = new SynonymManager();
    console.log('SynonymManager initialized:', window.synonymManager);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynonymManager;
}
