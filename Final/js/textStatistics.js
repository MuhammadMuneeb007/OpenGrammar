/**
 * Text Statistics Dashboard
 * Provides comprehensive text analytics and statistics
 */
class TextStatistics {
    constructor() {
        this.stats = {
            words: 0,
            characters: 0,
            charactersNoSpaces: 0,
            sentences: 0,
            paragraphs: 0,
            readingTime: 0,
            speakingTime: 0,
            averageWordsPerSentence: 0,
            averageSentencesPerParagraph: 0,
            longestWord: '',
            shortestWord: '',
            mostCommonWords: [],
            readabilityScore: 0,
            gradeLevel: '',
            complexity: 'medium'
        };
        
        this.init();
    }
    
    init() {
        this.createStatsPanel();
        this.setupEventListeners();
        console.log('📊 Text Statistics initialized');
    }
    
    createStatsPanel() {
        const container = document.querySelector('.main') || document.body;
        
        const statsPanel = document.createElement('div');
        statsPanel.className = 'text-stats-panel';
        statsPanel.innerHTML = `
            <div class="stats-header">
                <h3>
                    <i class="fas fa-chart-bar"></i>
                    Text Statistics
                </h3>
                <button class="toggle-stats" aria-label="Toggle statistics">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="stats-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-font"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="word-count">0</div>
                            <div class="stat-label">Words</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-keyboard"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="char-count">0</div>
                            <div class="stat-label">Characters</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-paragraph"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="sentence-count">0</div>
                            <div class="stat-label">Sentences</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-align-left"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="paragraph-count">0</div>
                            <div class="stat-label">Paragraphs</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="reading-time">0m</div>
                            <div class="stat-label">Reading Time</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-microphone"></i></div>
                        <div class="stat-info">
                            <div class="stat-value" id="speaking-time">0m</div>
                            <div class="stat-label">Speaking Time</div>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-stats">
                    <div class="stats-section">
                        <h4>Readability Analysis</h4>
                        <div class="readability-info">
                            <div class="readability-score">
                                <span class="score-value" id="readability-score">0</span>
                                <span class="score-label">Flesch Score</span>
                            </div>
                            <div class="grade-level">
                                <span id="grade-level">-</span>
                                <span class="grade-label">Grade Level</span>
                            </div>
                        </div>
                        <div class="complexity-indicator">
                            <span class="complexity-label">Complexity:</span>
                            <span class="complexity-badge" id="complexity">Medium</span>
                        </div>
                    </div>
                    
                    <div class="stats-section">
                        <h4>Word Analysis</h4>
                        <div class="word-analysis">
                            <div class="word-info">
                                <span class="label">Average words per sentence:</span>
                                <span class="value" id="avg-words-sentence">0</span>
                            </div>
                            <div class="word-info">
                                <span class="label">Longest word:</span>
                                <span class="value" id="longest-word">-</span>
                            </div>
                            <div class="word-info">
                                <span class="label">Shortest word:</span>
                                <span class="value" id="shortest-word">-</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-section">
                        <h4>Most Common Words</h4>
                        <div class="common-words" id="common-words">
                            <div class="no-data">Start typing to see word frequency</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after existing panels or at the beginning
        const existingPanel = container.querySelector('.advanced-analysis-panel');
        if (existingPanel) {
            existingPanel.parentNode.insertBefore(statsPanel, existingPanel.nextSibling);
        } else {
            container.appendChild(statsPanel);
        }
        
        this.panel = statsPanel;
        this.setupStatsToggle();
    }
    
    setupStatsToggle() {
        const toggleBtn = this.panel.querySelector('.toggle-stats');
        const content = this.panel.querySelector('.stats-content');
        const icon = toggleBtn.querySelector('i');
        
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');
            
            if (isCollapsed) {
                content.classList.remove('collapsed');
                icon.className = 'fas fa-chevron-up';
                toggleBtn.setAttribute('aria-label', 'Collapse statistics');
            } else {
                content.classList.add('collapsed');
                icon.className = 'fas fa-chevron-down';
                toggleBtn.setAttribute('aria-label', 'Expand statistics');
            }
        });
    }
      setupEventListeners() {
        // Listen for text changes - Updated to use correct ID
        const textArea = document.querySelector('#inputText') || 
                        document.querySelector('#text-input') || 
                        document.querySelector('textarea') ||
                        document.querySelector('[contenteditable]');
        
        if (textArea) {
            const updateStats = this.debounce(() => {
                this.analyzeText(textArea.value || textArea.textContent || textArea.innerText);
            }, 300);
            
            textArea.addEventListener('input', updateStats);
            textArea.addEventListener('paste', () => {
                setTimeout(updateStats, 100);
            });
            
            // Initialize with current text if any
            const currentText = textArea.value || textArea.textContent || textArea.innerText;
            if (currentText) {
                this.analyzeText(currentText);
            }
        }
        
        // Listen for global text analysis events
        document.addEventListener('text-analyzed', (e) => {
            if (e.detail && e.detail.text) {
                this.analyzeText(e.detail.text);
            }
        });
    }
    
    // Add manual update method
    updateStatsFromMainText() {
        const textArea = document.querySelector('#inputText');
        if (textArea) {
            const currentText = textArea.value || '';
            this.analyzeText(currentText);
        }
    }
    
    // Add method to reset display when no text
    resetDisplay() {
        this.resetStats();
        this.updateStatsDisplay();
    }
    
    analyzeText(text) {
        if (!text || typeof text !== 'string') {
            this.resetStats();
            return;
        }
        
        // Basic counts
        this.stats.characters = text.length;
        this.stats.charactersNoSpaces = text.replace(/\\s/g, '').length;
        
        // Word analysis
        const words = this.extractWords(text);
        this.stats.words = words.length;
        
        // Sentence analysis
        const sentences = this.extractSentences(text);
        this.stats.sentences = sentences.length;
        
        // Paragraph analysis
        const paragraphs = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0);
        this.stats.paragraphs = paragraphs.length;
        
        // Time calculations
        this.stats.readingTime = this.calculateReadingTime(this.stats.words);
        this.stats.speakingTime = this.calculateSpeakingTime(this.stats.words);
        
        // Averages
        this.stats.averageWordsPerSentence = this.stats.sentences > 0 ? 
            Math.round(this.stats.words / this.stats.sentences * 10) / 10 : 0;
        this.stats.averageSentencesPerParagraph = this.stats.paragraphs > 0 ? 
            Math.round(this.stats.sentences / this.stats.paragraphs * 10) / 10 : 0;
        
        // Word analysis
        if (words.length > 0) {
            this.stats.longestWord = words.reduce((a, b) => a.length > b.length ? a : b);
            this.stats.shortestWord = words.reduce((a, b) => a.length < b.length ? a : b);
            this.stats.mostCommonWords = this.getMostCommonWords(words);
        }
        
        // Readability analysis
        this.calculateReadability(text, words, sentences);
        
        // Update display
        this.updateDisplay();
    }
      extractWords(text) {
        return text.toLowerCase()
                  .replace(/[^\w\s]/g, ' ')
                  .split(/\s+/)
                  .filter(word => word.length > 0);
    }
    
    extractSentences(text) {
        return text.split(/[.!?]+/)
                  .map(s => s.trim())
                  .filter(s => s.length > 0);
    }
    
    calculateReadingTime(wordCount) {
        const wordsPerMinute = 200; // Average reading speed
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes;
    }
    
    calculateSpeakingTime(wordCount) {
        const wordsPerMinute = 150; // Average speaking speed
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes;
    }
    
    getMostCommonWords(words) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'around', 'is', 'are', 'was', 'were',
            'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
            'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
        ]);
        
        const wordFreq = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        return Object.entries(wordFreq)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
    }
    
    calculateReadability(text, words, sentences) {
        if (sentences.length === 0 || words.length === 0) {
            this.stats.readabilityScore = 0;
            this.stats.gradeLevel = '-';
            this.stats.complexity = 'unknown';
            return;
        }
        
        // Count syllables (approximation)
        const syllables = words.reduce((count, word) => {
            return count + this.countSyllables(word);
        }, 0);
        
        // Flesch Reading Ease Score
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        this.stats.readabilityScore = Math.max(0, Math.min(100, Math.round(fleschScore)));
        
        // Grade level and complexity
        if (this.stats.readabilityScore >= 90) {
            this.stats.gradeLevel = '5th grade';
            this.stats.complexity = 'very easy';
        } else if (this.stats.readabilityScore >= 80) {
            this.stats.gradeLevel = '6th grade';
            this.stats.complexity = 'easy';
        } else if (this.stats.readabilityScore >= 70) {
            this.stats.gradeLevel = '7th grade';
            this.stats.complexity = 'fairly easy';
        } else if (this.stats.readabilityScore >= 60) {
            this.stats.gradeLevel = '8th-9th grade';
            this.stats.complexity = 'standard';
        } else if (this.stats.readabilityScore >= 50) {
            this.stats.gradeLevel = '10th-12th grade';
            this.stats.complexity = 'fairly difficult';
        } else if (this.stats.readabilityScore >= 30) {
            this.stats.gradeLevel = 'College level';
            this.stats.complexity = 'difficult';
        } else {
            this.stats.gradeLevel = 'Graduate level';
            this.stats.complexity = 'very difficult';
        }
    }
    
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }
    
    updateDisplay() {
        // Update basic stats
        this.updateElement('word-count', this.formatNumber(this.stats.words));
        this.updateElement('char-count', this.formatNumber(this.stats.characters));
        this.updateElement('sentence-count', this.formatNumber(this.stats.sentences));
        this.updateElement('paragraph-count', this.formatNumber(this.stats.paragraphs));
        
        // Update time stats
        this.updateElement('reading-time', this.formatTime(this.stats.readingTime));
        this.updateElement('speaking-time', this.formatTime(this.stats.speakingTime));
        
        // Update readability
        this.updateElement('readability-score', this.stats.readabilityScore);
        this.updateElement('grade-level', this.stats.gradeLevel);
        this.updateElement('complexity', this.stats.complexity);
        
        // Update complexity badge color
        const complexityBadge = document.getElementById('complexity');
        if (complexityBadge) {
            complexityBadge.className = `complexity-badge ${this.getComplexityClass(this.stats.complexity)}`;
        }
        
        // Update word analysis
        this.updateElement('avg-words-sentence', this.stats.averageWordsPerSentence);
        this.updateElement('longest-word', this.stats.longestWord || '-');
        this.updateElement('shortest-word', this.stats.shortestWord || '-');
        
        // Update common words
        this.updateCommonWords();
    }
    
    updateCommonWords() {
        const container = document.getElementById('common-words');
        if (!container) return;
        
        if (this.stats.mostCommonWords.length === 0) {
            container.innerHTML = '<div class=\"no-data\">Start typing to see word frequency</div>';
            return;
        }
        
        const wordsHtml = this.stats.mostCommonWords.map(([word, count]) => 
            `<div class=\"word-freq\">
                <span class=\"word\">${word}</span>
                <span class=\"freq\">${count}</span>
            </div>`
        ).join('');
        
        container.innerHTML = wordsHtml;
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    formatNumber(num) {
        return num.toLocaleString();
    }
    
    formatTime(minutes) {
        if (minutes < 1) return '< 1m';
        if (minutes < 60) return `${minutes}m`;
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    
    getComplexityClass(complexity) {
        const classMap = {
            'very easy': 'very-easy',
            'easy': 'easy',
            'fairly easy': 'fairly-easy',
            'standard': 'standard',
            'fairly difficult': 'fairly-difficult',
            'difficult': 'difficult',
            'very difficult': 'very-difficult',
            'unknown': 'unknown'
        };
        return classMap[complexity] || 'standard';
    }
    
    resetStats() {
        Object.keys(this.stats).forEach(key => {
            if (typeof this.stats[key] === 'number') {
                this.stats[key] = 0;
            } else if (Array.isArray(this.stats[key])) {
                this.stats[key] = [];
            } else {
                this.stats[key] = '';
            }
        });
        
        this.updateDisplay();
    }
    
    exportStats() {
        return {
            timestamp: new Date().toISOString(),
            ...this.stats
        };
    }
    
    // Utility function
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

// Initialize and make globally accessible
document.addEventListener('DOMContentLoaded', () => {
    if (!window.textStatistics) {
        window.textStatistics = new TextStatistics();
    }
});
