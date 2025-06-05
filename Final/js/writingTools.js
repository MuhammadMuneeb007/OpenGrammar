/**
 * Writing Tools Manager
 * Provides various writing assistance tools and utilities
 */
class WritingTools {
    constructor() {
        this.tools = {
            wordCloud: null,
            textFormatter: null,
            findReplace: null,
            textTransforms: null,
            documentTemplates: null
        };
        
        this.init();
    }
    
    init() {
        this.createToolsPanel();
        this.setupEventListeners();
        console.log('🛠️ Writing Tools initialized');
    }
    
    createToolsPanel() {
        const container = document.querySelector('.main') || document.body;
        
        const toolsPanel = document.createElement('div');
        toolsPanel.className = 'writing-tools-panel';
        toolsPanel.innerHTML = `
            <div class="tools-header">
                <h3>
                    <i class="fas fa-tools"></i>
                    Writing Tools
                </h3>
                <button class="toggle-tools" aria-label="Toggle writing tools">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="tools-content">
                <div class="tools-grid">
                    <div class="tool-category">
                        <h4>Text Formatting</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="uppercase">
                                <i class="fas fa-font"></i>
                                UPPERCASE
                            </button>
                            <button class="tool-btn" data-tool="lowercase">
                                <i class="fas fa-font"></i>
                                lowercase
                            </button>
                            <button class="tool-btn" data-tool="titlecase">
                                <i class="fas fa-font"></i>
                                Title Case
                            </button>
                            <button class="tool-btn" data-tool="sentencecase">
                                <i class="fas fa-font"></i>
                                Sentence case
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-category">
                        <h4>Text Transforms</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="reverse">
                                <i class="fas fa-exchange-alt"></i>
                                Reverse Text
                            </button>
                            <button class="tool-btn" data-tool="remove-spaces">
                                <i class="fas fa-compress"></i>
                                Remove Spaces
                            </button>
                            <button class="tool-btn" data-tool="remove-duplicates">
                                <i class="fas fa-copy"></i>
                                Remove Duplicates
                            </button>
                            <button class="tool-btn" data-tool="sort-lines">
                                <i class="fas fa-sort-alpha-down"></i>
                                Sort Lines
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-category">
                        <h4>Find & Replace</h4>
                        <div class="find-replace-tool">
                            <div class="input-group">
                                <input type="text" id="find-text" placeholder="Find text...">
                                <input type="text" id="replace-text" placeholder="Replace with...">
                            </div>
                            <div class="find-replace-options">
                                <label>
                                    <input type="checkbox" id="case-sensitive"> Case sensitive
                                </label>
                                <label>
                                    <input type="checkbox" id="whole-words"> Whole words
                                </label>
                                <label>
                                    <input type="checkbox" id="regex-mode"> Regex
                                </label>
                            </div>
                            <div class="find-replace-buttons">
                                <button class="tool-btn secondary" data-tool="find">
                                    <i class="fas fa-search"></i>
                                    Find
                                </button>
                                <button class="tool-btn" data-tool="replace">
                                    <i class="fas fa-exchange-alt"></i>
                                    Replace All
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-category">
                        <h4>Word Analysis</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="word-cloud">
                                <i class="fas fa-cloud"></i>
                                Word Cloud
                            </button>
                            <button class="tool-btn" data-tool="frequency">
                                <i class="fas fa-chart-bar"></i>
                                Word Frequency
                            </button>
                            <button class="tool-btn" data-tool="unique-words">
                                <i class="fas fa-list"></i>
                                Unique Words
                            </button>
                            <button class="tool-btn" data-tool="export-words">
                                <i class="fas fa-download"></i>
                                Export List
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-category">
                        <h4>Text Cleanup</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="trim-whitespace">
                                <i class="fas fa-broom"></i>
                                Trim Whitespace
                            </button>
                            <button class="tool-btn" data-tool="remove-empty-lines">
                                <i class="fas fa-compress-alt"></i>
                                Remove Empty Lines
                            </button>
                            <button class="tool-btn" data-tool="fix-punctuation">
                                <i class="fas fa-dot-circle"></i>
                                Fix Punctuation
                            </button>
                            <button class="tool-btn" data-tool="smart-quotes">
                                <i class="fas fa-quote-right"></i>
                                Smart Quotes
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-category">
                        <h4>Quick Actions</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="copy-text">
                                <i class="fas fa-copy"></i>
                                Copy All
                            </button>
                            <button class="tool-btn" data-tool="clear-text">
                                <i class="fas fa-trash"></i>
                                Clear Text
                            </button>
                            <button class="tool-btn" data-tool="undo">
                                <i class="fas fa-undo"></i>
                                Undo
                            </button>
                            <button class="tool-btn" data-tool="redo">
                                <i class="fas fa-redo"></i>
                                Redo
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="word-cloud-container" id="word-cloud-container" style="display: none;">
                    <h4>Word Cloud</h4>
                    <div class="word-cloud-canvas" id="word-cloud-canvas"></div>
                    <button class="close-word-cloud" onclick="this.parentElement.style.display='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Insert after existing panels
        const existingPanel = container.querySelector('.text-stats-panel');
        if (existingPanel) {
            existingPanel.parentNode.insertBefore(toolsPanel, existingPanel.nextSibling);
        } else {
            container.appendChild(toolsPanel);
        }
        
        this.panel = toolsPanel;
        this.setupToolsToggle();
        this.undoStack = [];
        this.redoStack = [];
    }
    
    setupToolsToggle() {
        const toggleBtn = this.panel.querySelector('.toggle-tools');
        const content = this.panel.querySelector('.tools-content');
        const icon = toggleBtn.querySelector('i');
        
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');
            
            if (isCollapsed) {
                content.classList.remove('collapsed');
                icon.className = 'fas fa-chevron-up';
                toggleBtn.setAttribute('aria-label', 'Collapse writing tools');
            } else {
                content.classList.add('collapsed');
                icon.className = 'fas fa-chevron-down';
                toggleBtn.setAttribute('aria-label', 'Expand writing tools');
            }
        });
    }
    
    setupEventListeners() {
        // Tool button clicks
        this.panel.addEventListener('click', (e) => {
            if (e.target.classList.contains('tool-btn') || e.target.closest('.tool-btn')) {
                const btn = e.target.classList.contains('tool-btn') ? e.target : e.target.closest('.tool-btn');
                const tool = btn.dataset.tool;
                if (tool) {
                    this.executeTool(tool);
                }
            }
        });
        
        // Find/Replace enter key
        const findInput = this.panel.querySelector('#find-text');
        const replaceInput = this.panel.querySelector('#replace-text');
        
        if (findInput) {
            findInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeTool('find');
                }
            });
        }
        
        if (replaceInput) {
            replaceInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeTool('replace');
                }
            });
        }
    }
    
    executeTool(toolName) {
        const textArea = this.getTextArea();
        if (!textArea) {
            this.showNotification('No text area found', 'error');
            return;
        }
        
        const currentText = this.getText(textArea);
        this.saveToUndoStack(currentText);
        
        try {
            switch (toolName) {
                case 'uppercase':
                    this.setText(textArea, currentText.toUpperCase());
                    break;
                case 'lowercase':
                    this.setText(textArea, currentText.toLowerCase());
                    break;
                case 'titlecase':
                    this.setText(textArea, this.toTitleCase(currentText));
                    break;
                case 'sentencecase':
                    this.setText(textArea, this.toSentenceCase(currentText));
                    break;
                case 'reverse':
                    this.setText(textArea, currentText.split('').reverse().join(''));
                    break;
                case 'remove-spaces':
                    this.setText(textArea, currentText.replace(/\\s+/g, ''));
                    break;
                case 'remove-duplicates':
                    this.setText(textArea, this.removeDuplicateLines(currentText));
                    break;
                case 'sort-lines':
                    this.setText(textArea, this.sortLines(currentText));
                    break;
                case 'find':
                    this.findText();
                    break;
                case 'replace':
                    this.replaceText();
                    break;
                case 'word-cloud':
                    this.generateWordCloud(currentText);
                    break;
                case 'frequency':
                    this.showWordFrequency(currentText);
                    break;
                case 'unique-words':
                    this.showUniqueWords(currentText);
                    break;
                case 'export-words':
                    this.exportWordList(currentText);
                    break;
                case 'trim-whitespace':
                    this.setText(textArea, this.trimWhitespace(currentText));
                    break;
                case 'remove-empty-lines':
                    this.setText(textArea, this.removeEmptyLines(currentText));
                    break;
                case 'fix-punctuation':
                    this.setText(textArea, this.fixPunctuation(currentText));
                    break;
                case 'smart-quotes':
                    this.setText(textArea, this.addSmartQuotes(currentText));
                    break;
                case 'copy-text':
                    this.copyToClipboard(currentText);
                    break;
                case 'clear-text':
                    this.setText(textArea, '');
                    break;
                case 'undo':
                    this.undo();
                    break;
                case 'redo':
                    this.redo();
                    break;
                default:
                    console.warn('Unknown tool:', toolName);
            }
            
            // Trigger text analysis update
            this.triggerTextUpdate(textArea);
            
        } catch (error) {
            console.error('Tool execution error:', error);
            this.showNotification('Tool execution failed', 'error');
        }
    }
    
    // Add manual refresh method for writing tools
    refreshFromMainText() {
        const textArea = this.getTextArea();
        if (textArea) {
            const currentText = this.getText(textArea);
            // Update any internal state if needed
            console.log('📝 Writing tools refreshed with current text');
        }
    }
    
    // Add method to check if text area is available
    isTextAreaAvailable() {
        return !!this.getTextArea();
    }
    
    getTextArea() {
        return document.querySelector('#inputText') || 
               document.querySelector('#text-input') || 
               document.querySelector('textarea') ||
               document.querySelector('[contenteditable="true"]');
    }
    
    getText(element) {
        return element.value || element.textContent || element.innerText || '';
    }
    
    setText(element, text) {
        if (element.value !== undefined) {
            element.value = text;
        } else {
            element.textContent = text;
        }
    }
      toTitleCase(text) {
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    
    toSentenceCase(text) {
        return text.toLowerCase().replace(/(^|[.!?]\\s*)([a-z])/g, (match, p1, p2) => 
            p1 + p2.toUpperCase()
        );
    }
    
    removeDuplicateLines(text) {
        const lines = text.split('\\n');
        const uniqueLines = [...new Set(lines)];
        return uniqueLines.join('\\n');
    }
    
    sortLines(text) {
        const lines = text.split('\\n');
        const sortedLines = lines.sort((a, b) => a.localeCompare(b));
        return sortedLines.join('\\n');
    }
    
    trimWhitespace(text) {
        return text.split('\\n')
                  .map(line => line.trim())
                  .join('\\n')
                  .trim();
    }
    
    removeEmptyLines(text) {
        return text.split('\\n')
                  .filter(line => line.trim().length > 0)
                  .join('\\n');
    }
    
    fixPunctuation(text) {
        return text
            .replace(/\\s+([.!?])/g, '$1') // Remove spaces before punctuation
            .replace(/([.!?])([A-Z])/g, '$1 $2') // Add space after punctuation
            .replace(/\\s+/g, ' ') // Fix multiple spaces
            .replace(/([.!?])\\s*([.!?])/g, '$1$2'); // Fix multiple punctuation
    }    addSmartQuotes(text) {
        return text
            .replace(/\"([^\"]*)\"/g, '"$1"') // Replace straight quotes with smart quotes
            .replace(/'([^']*)'/g, '\u2018$1\u2019') // Replace straight apostrophes with smart apostrophes
            .replace(/(\\s|^)'(\\w)/g, '$1\u2018$2') // Opening single quotes
            .replace(/(\\w)'(\\s|$)/g, '$1\u2019$2'); // Closing single quotes
    }
    
    findText() {
        const findInput = this.panel.querySelector('#find-text');
        const caseSensitive = this.panel.querySelector('#case-sensitive').checked;
        const wholeWords = this.panel.querySelector('#whole-words').checked;
        const regexMode = this.panel.querySelector('#regex-mode').checked;
        
        const findTerm = findInput.value;
        if (!findTerm) {
            this.showNotification('Please enter text to find', 'warning');
            return;
        }
        
        const textArea = this.getTextArea();
        const text = this.getText(textArea);
        
        let matches = 0;
        try {
            let searchRegex;
            
            if (regexMode) {
                searchRegex = new RegExp(findTerm, caseSensitive ? 'g' : 'gi');
            } else {
                const escapedTerm = findTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
                const pattern = wholeWords ? `\\\\b${escapedTerm}\\\\b` : escapedTerm;
                searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
            }
            
            const matchArray = text.match(searchRegex);
            matches = matchArray ? matchArray.length : 0;
            
            this.showNotification(`Found ${matches} match${matches !== 1 ? 'es' : ''}`, 'info');
            
            // Highlight matches (simplified)
            if (matches > 0 && textArea.setSelectionRange) {
                const firstMatch = searchRegex.exec(text);
                if (firstMatch) {
                    textArea.focus();
                    textArea.setSelectionRange(firstMatch.index, firstMatch.index + firstMatch[0].length);
                }
            }
            
        } catch (error) {
            this.showNotification('Invalid search pattern', 'error');
        }
    }
    
    replaceText() {
        const findInput = this.panel.querySelector('#find-text');
        const replaceInput = this.panel.querySelector('#replace-text');
        const caseSensitive = this.panel.querySelector('#case-sensitive').checked;
        const wholeWords = this.panel.querySelector('#whole-words').checked;
        const regexMode = this.panel.querySelector('#regex-mode').checked;
        
        const findTerm = findInput.value;
        const replaceTerm = replaceInput.value;
        
        if (!findTerm) {
            this.showNotification('Please enter text to find', 'warning');
            return;
        }
        
        const textArea = this.getTextArea();
        const text = this.getText(textArea);
        
        try {
            let searchRegex;
            
            if (regexMode) {
                searchRegex = new RegExp(findTerm, caseSensitive ? 'g' : 'gi');
            } else {
                const escapedTerm = findTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
                const pattern = wholeWords ? `\\\\b${escapedTerm}\\\\b` : escapedTerm;
                searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
            }
            
            const newText = text.replace(searchRegex, replaceTerm);
            const replacements = (text.match(searchRegex) || []).length;
            
            this.setText(textArea, newText);
            this.showNotification(`Made ${replacements} replacement${replacements !== 1 ? 's' : ''}`, 'success');
            
        } catch (error) {
            this.showNotification('Invalid search pattern', 'error');
        }
    }
    
    generateWordCloud(text) {
        const words = this.extractWords(text);
        const wordFreq = this.getWordFrequency(words);
        
        const container = this.panel.querySelector('#word-cloud-container');
        const canvas = this.panel.querySelector('#word-cloud-canvas');
        
        // Simple word cloud visualization
        canvas.innerHTML = '';
        
        const maxFreq = Math.max(...Object.values(wordFreq));
        const minSize = 12;
        const maxSize = 32;
        
        Object.entries(wordFreq)
            .slice(0, 50) // Top 50 words
            .forEach(([word, freq]) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'word-cloud-word';
                
                const size = minSize + (freq / maxFreq) * (maxSize - minSize);
                span.style.fontSize = size + 'px';
                span.style.opacity = 0.5 + (freq / maxFreq) * 0.5;
                
                // Random positioning (simplified)
                span.style.margin = Math.random() * 10 + 'px';
                
                canvas.appendChild(span);
            });
        
        container.style.display = 'block';
    }
    
    showWordFrequency(text) {
        const words = this.extractWords(text);
        const wordFreq = this.getWordFrequency(words);
        
        const freqList = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, freq]) => `${word}: ${freq}`)
            .join('\\n');
        
        this.showModal('Word Frequency (Top 20)', freqList);
    }
    
    showUniqueWords(text) {
        const words = this.extractWords(text);
        const uniqueWords = [...new Set(words)].sort();
        
        this.showModal('Unique Words', uniqueWords.join(', '));
    }
    
    exportWordList(text) {
        const words = this.extractWords(text);
        const uniqueWords = [...new Set(words)].sort();
        
        const blob = new Blob([uniqueWords.join('\\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'word-list.txt';
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Word list exported', 'success');
    }
      extractWords(text) {
        return text.toLowerCase()
                  .replace(/[^\w\s]/g, ' ')
                  .split(/\s+/)
                  .filter(word => word.length > 2);
    }
    
    getWordFrequency(words) {
        const freq = {};
        words.forEach(word => {
            freq[word] = (freq[word] || 0) + 1;
        });
        return freq;
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Text copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy text', 'error');
        });
    }
    
    saveToUndoStack(text) {
        this.undoStack.push(text);
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack
    }
    
    undo() {
        if (this.undoStack.length === 0) {
            this.showNotification('Nothing to undo', 'warning');
            return;
        }
        
        const textArea = this.getTextArea();
        const currentText = this.getText(textArea);
        const previousText = this.undoStack.pop();
        
        this.redoStack.push(currentText);
        this.setText(textArea, previousText);
        this.triggerTextUpdate(textArea);
        
        this.showNotification('Undone', 'info');
    }
    
    redo() {
        if (this.redoStack.length === 0) {
            this.showNotification('Nothing to redo', 'warning');
            return;
        }
        
        const textArea = this.getTextArea();
        const currentText = this.getText(textArea);
        const nextText = this.redoStack.pop();
        
        this.undoStack.push(currentText);
        this.setText(textArea, nextText);
        this.triggerTextUpdate(textArea);
        
        this.showNotification('Redone', 'info');
    }
    
    triggerTextUpdate(textArea) {
        // Trigger input event to update other components
        const event = new Event('input', { bubbles: true });
        textArea.dispatchEvent(event);
    }
    
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'tools-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h4>${title}</h4>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <pre>${content}</pre>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
        
        // Auto-remove after 10 seconds
        setTimeout(() => modal.remove(), 10000);
    }
    
    showNotification(message, type = 'info') {
        // Use existing notification system or create simple one
        if (window.mobileManager && window.mobileManager.showNotification) {
            window.mobileManager.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize and make globally accessible
document.addEventListener('DOMContentLoaded', () => {
    if (!window.writingTools) {
        window.writingTools = new WritingTools();
    }
});
