/**
 * Advanced Text Analysis - Detailed text insights and metrics
 */
class AdvancedTextAnalyzer {
    constructor() {
        this.analysisResults = {};
        this.init();
    }

    init() {
        this.createAnalysisPanel();
        this.bindEvents();
    }

    createAnalysisPanel() {
        const analysisPanel = document.createElement('div');
        analysisPanel.className = 'advanced-analysis-panel';
        analysisPanel.id = 'advancedAnalysis';
        analysisPanel.innerHTML = `
            <div class="analysis-header">
                <h3><i class="fas fa-chart-line"></i> Advanced Text Analysis</h3>
                <button class="analysis-toggle" id="analysisToggle">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="analysis-content" id="analysisContent">
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h4><i class="fas fa-clock"></i> Reading Time</h4>
                        <div class="metric-value" id="readingTime">0 min</div>
                        <div class="metric-detail">Average reading speed</div>
                    </div>
                    <div class="analysis-card">
                        <h4><i class="fas fa-heart"></i> Sentiment</h4>
                        <div class="sentiment-indicator" id="sentimentIndicator">
                            <div class="sentiment-bar">
                                <div class="sentiment-fill"></div>
                            </div>
                            <span class="sentiment-label">Neutral</span>
                        </div>
                    </div>
                    <div class="analysis-card">
                        <h4><i class="fas fa-key"></i> Keyword Density</h4>
                        <div class="keyword-list" id="keywordList">
                            <div class="no-keywords">Analyze text to see keywords</div>
                        </div>
                    </div>
                    <div class="analysis-card">
                        <h4><i class="fas fa-users"></i> Audience Level</h4>
                        <div class="audience-level" id="audienceLevel">
                            <div class="level-indicator"></div>
                            <span class="level-text">General</span>
                        </div>
                    </div>
                    <div class="analysis-card">
                        <h4><i class="fas fa-microphone"></i> Tone Analysis</h4>
                        <div class="tone-indicators" id="toneIndicators">
                            <div class="tone-item">
                                <span class="tone-name">Formal</span>
                                <div class="tone-bar"><div class="tone-fill"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="analysis-card">
                        <h4><i class="fas fa-language"></i> Language Stats</h4>
                        <div class="language-stats" id="languageStats">
                            <div class="stat-item">
                                <span>Unique words:</span>
                                <span id="uniqueWords">0</span>
                            </div>
                            <div class="stat-item">
                                <span>Vocabulary richness:</span>
                                <span id="vocabularyRichness">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after results panel
        const resultsPanel = document.querySelector('.results-panel');
        if (resultsPanel) {
            resultsPanel.parentNode.insertBefore(analysisPanel, resultsPanel.nextSibling);
        }
    }

    bindEvents() {
        // Toggle panel
        const toggleBtn = document.getElementById('analysisToggle');
        const content = document.getElementById('analysisContent');
        
        if (toggleBtn && content) {
            toggleBtn.addEventListener('click', () => {
                const isExpanded = content.classList.contains('expanded');
                content.classList.toggle('expanded');
                toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
                toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
            });
        }

        // Listen for text changes
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('input', this.debounce(() => {
                this.analyzeText(textEditor.value);
            }, 500));
        }
    }

    analyzeText(text) {
        if (!text || text.trim().length < 10) {
            this.clearAnalysis();
            return;
        }

        this.analysisResults = {
            readingTime: this.calculateReadingTime(text),
            sentiment: this.analyzeSentiment(text),
            keywords: this.extractKeywords(text),
            audienceLevel: this.determineAudienceLevel(text),
            tone: this.analyzeTone(text),
            languageStats: this.calculateLanguageStats(text)
        };

        this.updateDisplay();
    }

    calculateReadingTime(text) {
        const wordsPerMinute = 200; // Average reading speed
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return {
            minutes: minutes,
            words: words,
            display: minutes === 1 ? '1 min' : `${minutes} min`
        };
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis based on word patterns
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'love', 'perfect', 'best', 'awesome', 'brilliant', 'outstanding'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'negative', 'sad', 'angry', 'disappointed', 'frustrated', 'poor', 'fail'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (positiveWords.includes(cleanWord)) positiveCount++;
            if (negativeWords.includes(cleanWord)) negativeCount++;
        });

        const total = positiveCount + negativeCount;
        let sentiment = 'Neutral';
        let score = 0.5;

        if (total > 0) {
            score = positiveCount / total;
            if (score > 0.6) sentiment = 'Positive';
            else if (score < 0.4) sentiment = 'Negative';
        }

        return { sentiment, score, positive: positiveCount, negative: negativeCount };
    }

    extractKeywords(text) {
        // Simple keyword extraction
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count, density: (count / words.length * 100).toFixed(1) }));
    }

    determineAudienceLevel(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const words = text.split(/\s+/);
        
        const avgWordsPerSentence = words.length / sentences.length;
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        
        let level = 'General';
        let score = 0.5;

        if (avgWordsPerSentence > 20 && avgWordLength > 6) {
            level = 'Advanced';
            score = 0.8;
        } else if (avgWordsPerSentence > 15 && avgWordLength > 5) {
            level = 'Intermediate';
            score = 0.6;
        } else if (avgWordsPerSentence < 10 && avgWordLength < 4.5) {
            level = 'Elementary';
            score = 0.3;
        }

        return { level, score, avgWordsPerSentence: avgWordsPerSentence.toFixed(1), avgWordLength: avgWordLength.toFixed(1) };
    }

    analyzeTone(text) {
        const toneWords = {
            formal: ['therefore', 'however', 'furthermore', 'moreover', 'consequently', 'nevertheless', 'thus', 'hence'],
            casual: ['really', 'pretty', 'quite', 'kind of', 'sort of', 'like', 'you know', 'gonna'],
            confident: ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'undoubtedly'],
            tentative: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'seems', 'appears']
        };

        const words = text.toLowerCase().split(/\s+/);
        const scores = {};

        Object.entries(toneWords).forEach(([tone, toneWordList]) => {
            const matches = words.filter(word => toneWordList.some(tw => word.includes(tw))).length;
            scores[tone] = Math.min(matches / words.length * 100, 100);
        });

        return scores;
    }

    calculateLanguageStats(text) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);
        const uniqueWords = new Set(words);
        const vocabularyRichness = (uniqueWords.size / words.length * 100);

        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.size,
            vocabularyRichness: vocabularyRichness.toFixed(1)
        };
    }

    updateDisplay() {
        // Update reading time
        document.getElementById('readingTime').textContent = this.analysisResults.readingTime.display;

        // Update sentiment
        const sentimentIndicator = document.getElementById('sentimentIndicator');
        const sentimentFill = sentimentIndicator.querySelector('.sentiment-fill');
        const sentimentLabel = sentimentIndicator.querySelector('.sentiment-label');
        
        sentimentFill.style.width = `${this.analysisResults.sentiment.score * 100}%`;
        sentimentLabel.textContent = this.analysisResults.sentiment.sentiment;
        sentimentIndicator.className = `sentiment-indicator ${this.analysisResults.sentiment.sentiment.toLowerCase()}`;

        // Update keywords
        const keywordList = document.getElementById('keywordList');
        if (this.analysisResults.keywords.length > 0) {
            keywordList.innerHTML = this.analysisResults.keywords.map(kw => 
                `<div class="keyword-item">
                    <span class="keyword-word">${kw.word}</span>
                    <span class="keyword-density">${kw.density}%</span>
                </div>`
            ).join('');
        } else {
            keywordList.innerHTML = '<div class="no-keywords">No significant keywords found</div>';
        }

        // Update audience level
        const audienceLevel = document.getElementById('audienceLevel');
        const levelIndicator = audienceLevel.querySelector('.level-indicator');
        const levelText = audienceLevel.querySelector('.level-text');
        
        levelIndicator.style.width = `${this.analysisResults.audienceLevel.score * 100}%`;
        levelText.textContent = this.analysisResults.audienceLevel.level;
        audienceLevel.className = `audience-level ${this.analysisResults.audienceLevel.level.toLowerCase()}`;

        // Update tone analysis
        const toneIndicators = document.getElementById('toneIndicators');
        toneIndicators.innerHTML = Object.entries(this.analysisResults.tone).map(([tone, score]) =>
            `<div class="tone-item">
                <span class="tone-name">${tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
                <div class="tone-bar">
                    <div class="tone-fill" style="width: ${score}%"></div>
                </div>
                <span class="tone-score">${score.toFixed(1)}%</span>
            </div>`
        ).join('');

        // Update language stats
        document.getElementById('uniqueWords').textContent = this.analysisResults.languageStats.uniqueWords;
        document.getElementById('vocabularyRichness').textContent = this.analysisResults.languageStats.vocabularyRichness + '%';
    }

    clearAnalysis() {
        document.getElementById('readingTime').textContent = '0 min';
        document.getElementById('keywordList').innerHTML = '<div class="no-keywords">Analyze text to see keywords</div>';
        document.getElementById('uniqueWords').textContent = '0';
        document.getElementById('vocabularyRichness').textContent = '0%';
        
        // Reset sentiment
        const sentimentFill = document.querySelector('.sentiment-fill');
        const sentimentLabel = document.querySelector('.sentiment-label');
        if (sentimentFill) sentimentFill.style.width = '50%';
        if (sentimentLabel) sentimentLabel.textContent = 'Neutral';

        // Reset audience level
        const levelIndicator = document.querySelector('.level-indicator');
        const levelText = document.querySelector('.level-text');
        if (levelIndicator) levelIndicator.style.width = '50%';
        if (levelText) levelText.textContent = 'General';
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

    getAnalysisResults() {
        return this.analysisResults;
    }
}

// Initialize and make globally accessible
document.addEventListener('DOMContentLoaded', () => {
    if (!window.advancedAnalysis) {
        window.advancedAnalysis = new AdvancedTextAnalyzer();
    }
});
