/**
 * Modern Grammar Checker - JavaScript
 * A comprehensive grammar and writing analysis tool
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
        };        // Initialize the application
        this.init();
        
        // Initialize new features
        this.initializeViewCounter();
        this.initializeLocationWelcome();
        this.initializeReviewSystem();
        
        // Initialize loading screen
        this.initializeLoadingScreen();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.setupUI();
        this.loadSampleText();
        this.updateTextStats();
        this.setupAnimations();
    }    /**
     * Setup animations and interactions
     */
    setupAnimations() {
        // Wait for Anime.js to load but don't animate page load yet
        // Page load animation will be triggered after loading screen is hidden
        if (typeof anime === 'undefined') {
            console.warn('Anime.js not loaded, using fallback animations');
        }
        
        // Setup button animations immediately
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
     * Bind all event listeners
     */
    bindEvents() {
        // Text editor events
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('input', this.debounce(() => {
                this.updateTextStats();
                this.saveToLocalStorage();
            }, 300));
            
            textEditor.addEventListener('dblclick', this.handleWordDoubleClick.bind(this));
            textEditor.addEventListener('paste', this.handlePaste.bind(this));
        }

        // Button events - Fixed to ensure proper binding
        const checkGrammarBtn = document.getElementById('checkGrammar');
        if (checkGrammarBtn) {
            checkGrammarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.analyzeText();
            });
        }

        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.acceptAllCorrections();
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
                this.copyText();
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
            fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        }

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', this.switchTab.bind(this));
        });

        // Modal events
        this.bindModalEvents();

        // Synonym tooltip events
        this.bindSynonymEvents();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Setup button hover animations
        this.setupButtonAnimations();
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
     * Setup UI components
     */
    setupUI() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Setup responsive behavior
        this.setupResponsiveLayout();
        
        // Initialize theme
        this.initializeTheme();

        // Load saved text
        this.loadFromLocalStorage();
    }

    /**
     * Load sample text for demonstration
     */
    loadSampleText() {
        const textEditor = document.getElementById('inputText');
        if (textEditor && !textEditor.value.trim()) {
            const sampleText = `Welcome to OpenGrammar, your AI-powered writing assistant! This tool help you improve your writing by checking grammar, analyzing style, and providing detailed feedback. 

Their are many features available including real-time grammar checking, readability analysis, and comprehensive document metrics. The system can detect various types of errors such as spelling mistakes, grammatical inconsistencies, and style issues.

You can upload documents in multiple formats, get synonym suggestions, and export detailed reports. Weather you're writing academic papers, business emails, or creative content, OpenGrammar provides the insights you need to enhance your writing quality.`;
            
            textEditor.value = sampleText;
            this.updateTextStats();
        }
    }

    /**
     * Update text statistics
     */
    updateTextStats() {
        const text = document.getElementById('inputText')?.value || '';
        
        // Calculate basic metrics
        const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0) : [];
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);

        // Calculate complexity
        const avgWordLength = words.length > 0 ? words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
        const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
        
        let complexity = 'Basic';
        if (avgWordLength > 6 && avgSentenceLength > 20) {
            complexity = 'Advanced';
        } else if (avgWordLength > 5 || avgSentenceLength > 15) {
            complexity = 'Intermediate';
        }

        // Update state
        this.state.textStats = {
            words: words.length,
            characters,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            complexity
        };

        // Update UI
        this.updateStatsDisplay();
    }

    /**
     * Update statistics display in UI
     */
    updateStatsDisplay() {
        const elements = {
            wordCount: this.state.textStats.words,
            charCount: this.state.textStats.characters,
            complexity: this.state.textStats.complexity
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

    /**
     * Set analyzing state
     */
    setAnalyzingState(isAnalyzing) {
        this.state.isAnalyzing = isAnalyzing;
        const button = document.getElementById('checkGrammar');
        const buttonText = document.getElementById('buttonText');
        const loadingIcon = document.getElementById('loadingIcon');

        if (button && buttonText && loadingIcon) {
            if (isAnalyzing) {
                button.disabled = true;
                button.style.pointerEvents = 'none';
                buttonText.textContent = 'Analyzing...';
                loadingIcon.classList.remove('hidden');
            } else {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                buttonText.textContent = 'Analyze Text';
                loadingIcon.classList.add('hidden');
            }
        }
    }

    /**
     * Analyze text for grammar and style issues
     */
    async analyzeText() {
        console.log('Analyze button clicked'); // Debug log
        
        const textEditor = document.getElementById('inputText');
        const text = textEditor?.value.trim();

        if (!text) {
            this.showToast('error', 'No Text', 'Please enter some text to analyze.');
            return;
        }

        if (text.length < 10) {
            this.showToast('warning', 'Text Too Short', 'Please enter at least 10 characters for meaningful analysis.');
            return;
        }

        this.setAnalyzingState(true);

        try {
            const writingGoal = document.getElementById('writingGoal')?.value || 'none';
            const writingTone = document.getElementById('writingTone')?.value || 'none';

            const response = await fetch(`${this.config.apiBaseUrl}/check_grammar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    goal: writingGoal,
                    tone: writingTone,
                    include_metrics: true,
                    include_suggestions: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to analyze text`);
            }

            const analysisData = await response.json();
            
            if (analysisData.error) {
                throw new Error(analysisData.error);
            }

            this.state.currentAnalysis = analysisData;
            this.displayAnalysisResults(analysisData);
            this.showToast('success', 'Analysis Complete', 'Your text has been analyzed successfully.');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showToast('error', 'Analysis Failed', error.message || 'Unable to analyze text. Please try again.');
        } finally {
            this.setAnalyzingState(false);
        }
    }

    /**
     * Display analysis results in the UI
     */
    displayAnalysisResults(data) {
        // Clear previous results
        this.state.corrections.clear();
        
        // Hide empty state
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Update scores
        this.updateScoreDisplays(data);
        
        // Update metrics dashboard
        this.updateMetricsDashboard(data);
        
        // Display corrections
        this.displayCorrections(data);
        
        // Update document analysis
        this.updateDocumentAnalysis(data);
        
        // Update paragraph analysis
        this.updateParagraphAnalysis(data);
        
        // Enable/disable accept all button
        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.disabled = this.state.corrections.size === 0;
        }
    }

    /**
     * Update score displays
     */
    updateScoreDisplays(data) {
        const overallScore = data.meta_analysis?.overall_quality_score || 0;
        const scoreElements = ['grammarScore', 'overallScore'];
        
        scoreElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = overallScore > 0 ? Math.round(overallScore) : '-';
                
                // Update score badge class
                element.className = 'score-badge';
                if (overallScore > 0) {
                    if (overallScore < 60) {
                        element.classList.add('low');
                    } else if (overallScore < 80) {
                        element.classList.add('medium');
                    }
                }
            }
        });
    }

    /**
     * Update metrics dashboard
     */
    updateMetricsDashboard(data) {
        const metrics = data.meta_analysis?.document_metrics || {};
        const readability = metrics.readability_scores || {};
        
        const updates = {
            qualityScore: `${Math.round(readability.flesch_reading_ease || 0)}/100`,
            readingLevel: `Grade ${(readability.flesch_kincaid_grade || 0).toFixed(1)}`,
            coherenceScore: `${Math.round((data.document_coherence?.logical_flow_rating || 0) * 100)}%`
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Display corrections in the corrections tab
     */
    displayCorrections(data) {
        const correctionsContainer = document.getElementById('corrections');
        if (!correctionsContainer) return;

        correctionsContainer.innerHTML = '';

        if (!data.sentence_analysis || data.sentence_analysis.length === 0) {
            this.showNoCorrectionsMessage(correctionsContainer);
            return;
        }

        let hasCorrections = false;
        
        data.sentence_analysis.forEach((sentence, index) => {
            if (sentence.improvement_status === 'perfect' || 
                sentence.improved_text === 'NO_REVISION_NEEDED' ||
                sentence.original_text === sentence.improved_text) {
                return;
            }

            hasCorrections = true;
            const correctionElement = this.createCorrectionElement(sentence, index);
            correctionsContainer.appendChild(correctionElement);
            
            // Store correction data
            this.state.corrections.set(index, sentence);
        });

        if (!hasCorrections) {
            this.showNoCorrectionsMessage(correctionsContainer);
        }
    }

    /**
     * Show message when no corrections are needed
     */
    showNoCorrectionsMessage(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="empty-title">Excellent Writing!</h3>
                <p class="empty-text">No grammar or style issues detected. Your text looks great!</p>
            </div>
        `;
    }

    /**
     * Create correction element
     */
    createCorrectionElement(sentence, index) {
        const div = document.createElement('div');
        div.className = 'correction-item';
        div.dataset.correctionId = index;

        const issues = sentence.identified_issues || [];
        const issuesHtml = issues.map(issue => `
            <li>
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${this.escapeHtml(issue.category || 'Issue')}:</strong>
                    ${this.escapeHtml(issue.explanation || 'No explanation provided')}
                </div>
            </li>
        `).join('');

        div.innerHTML = `
            <div class="correction-section">
                <div class="correction-label">
                    <i class="fas fa-times-circle"></i>
                    Original
                </div>
                <div class="original-text">${this.escapeHtml(sentence.original_text)}</div>
            </div>
            
            <div class="correction-section">
                <div class="correction-label">
                    <i class="fas fa-check-circle"></i>
                    Suggested
                </div>
                <div class="corrected-text">${this.escapeHtml(sentence.improved_text)}</div>
            </div>
            
            ${issues.length > 0 ? `
                <div class="correction-section">
                    <div class="correction-label">
                        <i class="fas fa-list"></i>
                        Issues Identified
                    </div>
                    <ul class="issues-list">${issuesHtml}</ul>
                </div>
            ` : ''}
            
            <div class="correction-actions">
                <button class="btn btn-primary accept-correction">
                    <i class="fas fa-check"></i>
                    Accept
                </button>
                <button class="btn btn-outline dismiss-correction">
                    <i class="fas fa-times"></i>
                    Dismiss
                </button>
            </div>
        `;

        // Bind action events
        div.querySelector('.accept-correction')?.addEventListener('click', () => {
            this.acceptCorrection(index);
        });

        div.querySelector('.dismiss-correction')?.addEventListener('click', () => {
            this.dismissCorrection(index);
        });

        return div;
    }    /**
     * Accept a single correction
     */    acceptCorrection(correctionId) {
        const sentence = this.state.corrections.get(correctionId);
        if (!sentence) return;

        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        const currentText = textEditor.value;
        const originalText = sentence.original_text;
        const correctedText = sentence.improved_text;

        // Simple and reliable text replacement approach
        let newText;        
        // First try: Use position data if available and valid
        if (sentence.position && 
            sentence.position.start_char !== undefined && 
            sentence.position.end_char !== undefined) {
            
            const start = sentence.position.start_char;
            const end = sentence.position.end_char;
            
            // Validate position data by checking if the text matches
            const textAtPosition = currentText.substring(start, end);
            
            if (textAtPosition === originalText || textAtPosition.trim() === originalText.trim()) {
                // Position data is valid, use it
                newText = currentText.substring(0, start) + correctedText + currentText.substring(end);
                textEditor.value = newText;
                this.updateTextStats();
                
                // Calculate length difference for updating other corrections
                const lengthDifference = correctedText.length - originalText.length;
                this.updateCorrectionPositions(end, lengthDifference, correctionId);
                
                this.finishCorrection(correctionId);
                return;
            }
        }
        
        // Second try: Find exact match in text
        const exactIndex = currentText.indexOf(originalText);
        if (exactIndex !== -1) {
            newText = currentText.substring(0, exactIndex) + 
                      correctedText + 
                      currentText.substring(exactIndex + originalText.length);
            textEditor.value = newText;
            this.updateTextStats();
            
            const lengthDifference = correctedText.length - originalText.length;
            this.updateCorrectionPositions(exactIndex + originalText.length, lengthDifference, correctionId);
            
            this.finishCorrection(correctionId);
            return;
        }
        
        // Third try: Find trimmed match (handles spacing differences)
        const trimmedOriginal = originalText.trim();
        const trimmedIndex = currentText.indexOf(trimmedOriginal);
        if (trimmedIndex !== -1) {
            newText = currentText.substring(0, trimmedIndex) + 
                      correctedText + 
                      currentText.substring(trimmedIndex + trimmedOriginal.length);
            textEditor.value = newText;
            this.updateTextStats();
            
            const lengthDifference = correctedText.length - trimmedOriginal.length;
            this.updateCorrectionPositions(trimmedIndex + trimmedOriginal.length, lengthDifference, correctionId);
            
            this.finishCorrection(correctionId);
            return;
        }
        
        // If all attempts fail, show error
        this.showToast('error', 'Correction Failed', 'Could not locate the original text. The text may have been modified.');
    }

    /**
     * Complete the correction process by updating UI and state
     */
    finishCorrection(correctionId) {
        // Remove the correction from UI and state
        this.removeCorrectionElement(correctionId);
        this.state.corrections.delete(correctionId);

        // Update accept all button state
        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.disabled = this.state.corrections.size === 0;
        }

        this.showToast('success', 'Correction Applied', 'The correction has been applied successfully.');
    }

    /**
     * Update positions of remaining corrections after a correction is applied
     * @param {number} changedPosition - The position where text was changed
     * @param {number} lengthDifference - The difference in text length (positive for additions, negative for deletions)
     * @param {string} appliedCorrectionId - The ID of the correction that was just applied
     */
    updateCorrectionPositions(changedPosition, lengthDifference, appliedCorrectionId) {
        if (lengthDifference === 0) return; // No position adjustment needed

        // Update positions of all remaining corrections that come after the changed position
        this.state.corrections.forEach((correction, correctionId) => {
            // Skip the correction that was just applied
            if (correctionId === appliedCorrectionId) return;

            // Only update corrections that come after the changed position
            if (correction.position && 
                correction.position.start_char !== undefined && 
                correction.position.start_char >= changedPosition) {
                
                correction.position.start_char += lengthDifference;
                
                if (correction.position.end_char !== undefined) {
                    correction.position.end_char += lengthDifference;
                }
            }
        });
    }

    /**
     * Dismiss a single correction
     */
    dismissCorrection(correctionId) {
        this.removeCorrectionElement(correctionId);
        this.state.corrections.delete(correctionId);

        // Update accept all button state
        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.disabled = this.state.corrections.size === 0;
        }

        // Show empty state if no corrections left
        if (this.state.corrections.size === 0) {
            const correctionsContainer = document.getElementById('corrections');
            if (correctionsContainer) {
                this.showNoCorrectionsMessage(correctionsContainer);
            }
        }
    }

    /**
     * Remove correction element from DOM
     */
    removeCorrectionElement(correctionId) {
        const element = document.querySelector(`[data-correction-id="${correctionId}"]`);
        if (element) {
            element.style.transform = 'translateX(-100%)';
            element.style.opacity = '0';
            setTimeout(() => element.remove(), this.config.animationDuration);
        }
    }

    /**
     * Accept all corrections
     */
    acceptAllCorrections() {
        if (this.state.corrections.size === 0) return;

        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        let currentText = textEditor.value;
        const sortedCorrections = Array.from(this.state.corrections.entries())
            .sort(([, a], [, b]) => {
                // Sort by position (descending) to avoid offset issues
                if (a.position && b.position) {
                    return b.position.start_char - a.position.start_char;
                }
                return 0;
            });

        // Apply all corrections
        sortedCorrections.forEach(([correctionId, sentence]) => {
            if (sentence.position && sentence.position.start_char !== undefined && sentence.position.end_char !== undefined) {
                const start = sentence.position.start_char;
                const end = sentence.position.end_char;
                currentText = currentText.substring(0, start) + sentence.improved_text + currentText.substring(end);
            } else {
                currentText = currentText.replace(sentence.original_text, sentence.improved_text);
            }
        });

        textEditor.value = currentText;
        this.updateTextStats();

        // Clear all corrections
        this.state.corrections.clear();
        
        // Update UI
        const correctionsContainer = document.getElementById('corrections');
        if (correctionsContainer) {
            this.showNoCorrectionsMessage(correctionsContainer);
        }

        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.disabled = true;
        }

        this.showToast('success', 'All Applied', 'All suggestions have been applied to your text.');
    }

    /**
     * Update document analysis tab
     */
    updateDocumentAnalysis(data) {
        const metrics = data.meta_analysis?.document_metrics || {};
        const readability = metrics.readability_scores || {};

        // Document metrics
        const documentMetricsContainer = document.getElementById('documentMetrics');
        if (documentMetricsContainer) {
            const metricsData = [
                { label: 'Word Count', value: metrics.word_count || '-' },
                { label: 'Character Count', value: metrics.character_count || '-' },
                { label: 'Sentence Count', value: metrics.sentence_count || '-' },
                { label: 'Paragraph Count', value: metrics.paragraph_count || '-' },
                { label: 'Avg. Words per Sentence', value: (metrics.average_words_per_sentence || 0).toFixed(1) },
                { label: 'Lexical Diversity', value: (metrics.lexical_diversity || 0).toFixed(2) },
                { label: 'Passive Voice %', value: `${(metrics.passive_voice_percentage || 0).toFixed(1)}%` }
            ];

            documentMetricsContainer.innerHTML = metricsData.map(metric => `
                <div class="analysis-item">
                    <span class="analysis-label">${metric.label}:</span>
                    <span class="analysis-value">${metric.value}</span>
                </div>
            `).join('');
        }

        // Readability scores
        const readabilityContainer = document.getElementById('readabilityScores');
        if (readabilityContainer) {
            const readabilityData = [
                { label: 'Flesch Reading Ease', value: `${(readability.flesch_reading_ease || 0).toFixed(1)}/100` },
                { label: 'Flesch-Kincaid Grade', value: `Grade ${(readability.flesch_kincaid_grade || 0).toFixed(1)}` },
                { label: 'Gunning Fog Index', value: (readability.gunning_fog || 0).toFixed(1) }
            ];

            readabilityContainer.innerHTML = readabilityData.map(metric => `
                <div class="analysis-item">
                    <span class="analysis-label">${metric.label}:</span>
                    <span class="analysis-value">${metric.value}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Update paragraph analysis tab
     */
    updateParagraphAnalysis(data) {
        const paragraphContainer = document.getElementById('paragraphContent');
        if (!paragraphContainer) return;

        if (!data.paragraph_analysis || data.paragraph_analysis.length === 0) {
            paragraphContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-paragraph"></i>
                    </div>
                    <h3 class="empty-title">No Paragraph Analysis</h3>
                    <p class="empty-text">Paragraph analysis data is not available for this text.</p>
                </div>
            `;
            return;
        }

        const paragraphsHtml = data.paragraph_analysis.map((para, index) => {
            const structure = para.structure_assessment || {};
            return `
                <div class="paragraph-analysis">
                    <div class="paragraph-header">
                        <h5>Paragraph ${index + 1}</h5>
                        <span class="paragraph-position">Characters ${para.position?.start_char || 0}-${para.position?.end_char || 0}</span>
                    </div>
                    <div class="paragraph-metrics">
                        <div class="metric-row">
                            <span class="metric-label">Topic Sentence Strength:</span>
                            <span class="metric-value">${Math.round((structure.topic_sentence_strength || 0) * 100)}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Development Quality:</span>
                            <span class="metric-value">${Math.round((structure.development_quality || 0) * 100)}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Unity Score:</span>
                            <span class="metric-value">${Math.round((structure.unity_score || 0) * 100)}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Transition Effectiveness:</span>
                            <span class="metric-value">${Math.round((structure.transition_effectiveness || 0) * 100)}%</span>
                        </div>
                    </div>
                    ${para.improvement_suggestions ? `
                        <div class="paragraph-suggestions">
                            <strong>Suggestions:</strong> ${this.escapeHtml(para.improvement_suggestions)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        paragraphContainer.innerHTML = paragraphsHtml;
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > this.config.maxFileSize) {
            this.showToast('error', 'File Too Large', `File size must be less than ${this.config.maxFileSize / 1024 / 1024}MB`);
            return;
        }

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFileTypes.includes(fileExtension)) {
            this.showToast('error', 'Unsupported File Type', `Supported formats: ${this.config.supportedFileTypes.join(', ')}`);
            return;
        }

        const uploadBtn = document.getElementById('uploadFileBtn');
        const originalText = uploadBtn?.innerHTML;
        
        try {
            // Show loading state
            if (uploadBtn) {
                uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Uploading...</span>';
                uploadBtn.disabled = true;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.config.apiBaseUrl}/upload_file`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Update text editor with extracted text
            const textEditor = document.getElementById('inputText');
            if (textEditor && data.text) {
                textEditor.value = data.text;
                this.updateTextStats();
                this.showToast('success', 'File Uploaded', `Successfully extracted text from ${file.name}`);
            }

        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('error', 'Upload Failed', error.message || 'Could not process the file');
        } finally {
            // Reset button state
            if (uploadBtn && originalText) {
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
            }
            
            // Clear file input
            event.target.value = '';
        }
    }

    /**
     * Copy text to clipboard
     */
    async copyText() {
        const textEditor = document.getElementById('inputText');
        const text = textEditor?.value;

        if (!text) {
            this.showToast('error', 'Nothing to Copy', 'No text available to copy.');
            return;
        }

        const copyBtn = document.getElementById('copyText');
        const originalText = copyBtn?.innerHTML;

        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            if (copyBtn) {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
                setTimeout(() => {
                    if (originalText) copyBtn.innerHTML = originalText;
                }, 2000);
            }
            
            this.showToast('success', 'Text Copied', 'Text has been copied to clipboard.');
            
        } catch (error) {
            // Fallback for older browsers
            try {
                textEditor.select();
                document.execCommand('copy');
                window.getSelection()?.removeAllRanges();
                this.showToast('success', 'Text Copied', 'Text has been copied to clipboard.');
            } catch (fallbackError) {
                console.error('Copy failed:', fallbackError);
                this.showToast('error', 'Copy Failed', 'Could not copy text to clipboard.');
            }
        }
    }

    /**
     * Export analysis to PDF
     */
    async exportToPDF() {
        if (!this.state.currentAnalysis) {
            this.showToast('error', 'No Analysis', 'Please analyze your text first before exporting.');
            return;
        }

        const exportBtn = document.getElementById('downloadPDF');
        const originalText = exportBtn?.innerHTML;

        try {
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Generating...</span>';
                exportBtn.disabled = true;
            }

            // Use client-side PDF generation instead of server endpoint
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                throw new Error('PDF library not loaded');
            }

            const doc = new jsPDF();
            const textEditor = document.getElementById('inputText');
            const originalText = textEditor?.value || '';
            
            // Set up document
            doc.setFontSize(20);
            doc.text('OpenGrammar Analysis Report', 20, 30);
            
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
            
            let yPosition = 60;
            
            // Add original text section
            doc.setFontSize(14);
            doc.text('Original Text:', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(originalText.substring(0, 1000) + (originalText.length > 1000 ? '...' : ''), 170);
            doc.text(splitText, 20, yPosition);
            yPosition += (splitText.length * 5) + 15;
            
            // Add analysis summary
            if (this.state.currentAnalysis.meta_analysis) {
                const meta = this.state.currentAnalysis.meta_analysis;
                
                doc.setFontSize(14);
                doc.text('Analysis Summary:', 20, yPosition);
                yPosition += 15;
                
                doc.setFontSize(10);
                doc.text(`Overall Quality Score: ${Math.round(meta.overall_quality_score || 0)}/100`, 20, yPosition);
                yPosition += 8;
                
                if (meta.document_metrics) {
                    const metrics = meta.document_metrics;
                    doc.text(`Word Count: ${metrics.word_count || 0}`, 20, yPosition);
                    yPosition += 6;
                    doc.text(`Character Count: ${metrics.character_count || 0}`, 20, yPosition);
                    yPosition += 6;
                    doc.text(`Sentence Count: ${metrics.sentence_count || 0}`, 20, yPosition);
                    yPosition += 6;
                    doc.text(`Paragraph Count: ${metrics.paragraph_count || 0}`, 20, yPosition);
                    yPosition += 10;
                }
            }
            
            // Add corrections summary
            if (this.state.corrections.size > 0) {
                doc.setFontSize(14);
                doc.text('Grammar & Style Issues Found:', 20, yPosition);
                yPosition += 15;
                
                doc.setFontSize(10);
                doc.text(`Total Issues: ${this.state.corrections.size}`, 20, yPosition);
                yPosition += 10;
                
                // Add first few corrections
                let correctionCount = 0;
                for (const [id, correction] of this.state.corrections) {
                    if (correctionCount >= 5 || yPosition > 250) break; // Limit to prevent overflow
                    
                    doc.text(`${correctionCount + 1}. Original: "${correction.original_text.substring(0, 80)}..."`, 20, yPosition);
                    yPosition += 6;
                    doc.text(`   Suggested: "${correction.improved_text.substring(0, 80)}..."`, 20, yPosition);
                    yPosition += 10;
                    correctionCount++;
                }
                
                if (this.state.corrections.size > 5) {
                    doc.text(`... and ${this.state.corrections.size - 5} more issues`, 20, yPosition);
                }
            }
            
            // Save the PDF
            const fileName = `grammar_analysis_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            this.showToast('success', 'PDF Downloaded', 'Analysis report has been downloaded successfully.');

        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('error', 'Export Failed', 'Could not generate PDF report. Please try again.');
        } finally {
            if (exportBtn && originalText) {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }
        }
    }    /**
     * Handle word double-click for synonyms
     */
    async handleWordDoubleClick(event) {
        // Delegate to the new synonym manager if available
        if (window.synonymManager && typeof window.synonymManager.handleTextSelection === 'function') {
            window.synonymManager.handleTextSelection(event);
        } else {
            console.warn('Synonym manager not available');
        }
    }

    /**
     * Show synonym tooltip
     */
    async showSynonymTooltip(word, position) {
        const tooltip = document.getElementById('synonymTooltip');
        const content = document.getElementById('synonymContent');
        
        if (!tooltip || !content) return;

        // Position tooltip
        tooltip.style.left = `${position.x}px`;
        tooltip.style.top = `${position.y}px`;
        
        // Show loading state
        content.innerHTML = '<div class="loading-text">Finding synonyms...</div>';
        tooltip.classList.add('active');

        try {
            // Try multiple synonym APIs
            let synonyms = [];
            
            // First try: Datamuse API
            try {
                const dataumuseResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=8`);
                if (dataumuseResponse.ok) {
                    const dataumuseData = await dataumuseResponse.json();
                    synonyms = dataumuseData.map(item => item.word).slice(0, 6);
                }
            } catch (error) {
                console.warn('Datamuse API failed:', error);
            }

            // Fallback: Use a local synonym database for common words
            if (synonyms.length === 0) {
                synonyms = this.getLocalSynonyms(word.toLowerCase());
            }

            if (synonyms.length > 0) {
                content.innerHTML = `
                    <ul class="synonym-list">
                        ${synonyms.map(synonym => `
                            <li data-synonym="${synonym}">${synonym}</li>
                        `).join('')}
                    </ul>
                `;                // Bind click events
                content.querySelectorAll('li').forEach(item => {
                    item.addEventListener('click', () => {
                        // Use the new synonym manager if available
                        if (window.synonymManager && typeof window.synonymManager.replaceSynonym === 'function') {
                            window.synonymManager.replaceSynonym(word, item.dataset.synonym);
                            window.synonymManager.hideSynonymTooltip();
                        } else {
                            console.warn('Synonym manager not available');
                        }
                    });
                });
            } else {
                content.innerHTML = '<div class="no-synonyms">No synonyms found</div>';
            }

        } catch (error) {
            console.error('Synonym lookup error:', error);
            content.innerHTML = '<div class="error-text">Unable to load synonyms</div>';
        }
    }

    /**
     * Get local synonyms for common words (fallback)
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
            'use': ['utilize', 'employ', 'apply', 'operate', 'implement', 'exercise']
        };

        return synonymDatabase[word] || [];
    }

    /**
     * Switch between analysis tabs
     */
    switchTab(event) {
        const clickedTab = event.currentTarget;
        const tabName = clickedTab.dataset.tab;

        if (!tabName) return;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        clickedTab.classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(tabName);
        if (targetPanel) {
            targetPanel.classList.add('active');
            
            // Animate tab content with Anime.js
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

        this.state.activeTab = tabName;
    }

    /**
     * Show toast notification with animation
     */
    showToast(type, title, message) {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
            return;
        }

        const iconMap = {
            success: { icon: 'check-circle', color: 'from-green-400 to-green-600' },
            error: { icon: 'exclamation-circle', color: 'from-red-400 to-red-600' },
            warning: { icon: 'exclamation-triangle', color: 'from-yellow-400 to-yellow-600' },
            info: { icon: 'info-circle', color: 'from-blue-400 to-blue-600' }
        };

        const toast = document.createElement('div');
        toast.className = 'toast-modern mb-3';
        toast.innerHTML = `
            <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-xl border-l-4 border-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500">
                <div class="w-8 h-8 bg-gradient-to-r ${iconMap[type].color} rounded-full flex items-center justify-center">
                    <i class="fas fa-${iconMap[type].icon} text-white text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-gray-800 font-medium text-sm">${this.escapeHtml(title)}</p>
                    <p class="text-gray-600 text-xs mt-1">${this.escapeHtml(message)}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Animate toast appearance
        if (typeof anime !== 'undefined') {
            anime({
                targets: toast,
                translateX: [300, 0],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutCubic'
            });

            // Auto remove with animation
            setTimeout(() => {
                anime({
                    targets: toast,
                    translateX: 300,
                    opacity: 0,
                    duration: 400,
                    easing: 'easeInCubic',
                    complete: () => {
                        if (toast.parentNode) {
                            toast.remove();
                        }
                    }
                });
            }, 5000);
        } else {
            // Fallback without animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 5000);
        }
    }

    /**
     * Bind modal events
     */    bindModalEvents() {
        // Modal trigger buttons - Fixed binding
        const instructionsBtn = document.getElementById('instructionsBtn');
        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('instructionsModal');
            });
        }

        const aboutBtn = document.getElementById('aboutBtn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('aboutModal');
            });
        }

        const contactBtn = document.getElementById('contactBtn');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('contactModal');
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('shareModal');
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmission.bind(this));
        }

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', this.handleSocialShare.bind(this));
        });

        // Copy URL button
        const copyUrlBtn = document.getElementById('copyUrl');
        if (copyUrlBtn) {
            copyUrlBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.copyShareUrl();
            });
        }
    }

    /**
     * Show modal with animation
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'flex';
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: modal.querySelector('.modal-content'),
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutCubic'
            });
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide modal with animation
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (typeof anime !== 'undefined') {
            anime({
                targets: modal.querySelector('.modal-content'),
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInCubic',
                complete: () => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        } else {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle contact form submission
     */
    handleContactSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        // Create mailto link
        const subject = encodeURIComponent(data.contactSubject || 'OpenGrammar Contact');
        const body = encodeURIComponent(`Name: ${data.contactName}\nEmail: ${data.contactEmail}\n\nMessage:\n${data.contactMessage}`);
        const mailtoUrl = `mailto:muneebsiddique007@gmail.com?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoUrl;
        
        // Reset form and close modal
        event.target.reset();
        this.hideModal('contactModal');
        this.showToast('success', 'Email Client Opened', 'Your default email client should open with the message.');
    }

    /**
     * Handle social sharing
     */
    handleSocialShare(event) {
        event.preventDefault();
        
        const platform = event.currentTarget.dataset.platform;
        const url = 'https://edtechtools.me';
        const text = 'Check out OpenGrammar - AI-powered grammar and writing assistant!';
        
        const shareUrls = {
            twitter: `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    /**
     * Copy share URL
     */
    async copyShareUrl() {
        const urlInput = document.getElementById('shareUrl');
        if (!urlInput) return;

        try {
            await navigator.clipboard.writeText(urlInput.value);
            this.showToast('success', 'URL Copied', 'Share URL has been copied to clipboard.');
        } catch (error) {
            // Fallback
            urlInput.select();
            document.execCommand('copy');
            this.showToast('success', 'URL Copied', 'Share URL has been copied to clipboard.');
        }
    }    /**
     * Bind synonym tooltip events
     */
    bindSynonymEvents() {
        // The new synonym manager handles its own events
        // This method is kept for backward compatibility
        console.log('Synonym events are now handled by SynonymManager');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter: Analyze text
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.analyzeText();
        }
        
        // Escape: Close modals and tooltips
        if (event.key === 'Escape') {
            // Close active modal
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                this.hideModal(activeModal.id);
                return;
            }
              // Close synonym tooltip
            if (window.synonymManager && typeof window.synonymManager.hideSynonymTooltip === 'function') {
                window.synonymManager.hideSynonymTooltip();
            }
        }
        
        // Ctrl/Cmd + S: Save to localStorage
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveToLocalStorage();
            this.showToast('info', 'Text Saved', 'Your text has been saved locally.');
        }
    }

    /**
     * Handle paste events
     */
    handlePaste(event) {
        // Allow default paste behavior
        setTimeout(() => {
            this.updateTextStats();
        }, 10);
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        const text = document.getElementById('inputText')?.value;
        if (text && text.trim().length > 100) {
            event.preventDefault();
            event.returnValue = 'You have unsaved text. Are you sure you want to leave?';
        }
    }

    /**
     * Handle window resize
     */    handleResize() {
        // Adjust tooltip positions if visible
        const tooltip = document.getElementById('synonymTooltip');
        if (tooltip && tooltip.classList.contains('active')) {
            if (window.synonymManager && typeof window.synonymManager.hideSynonymTooltip === 'function') {
                window.synonymManager.hideSynonymTooltip();
            }
        }
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        // Add tooltips to buttons and elements
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.setAttribute('title', element.dataset.tooltip);
        });
    }

    /**
     * Setup responsive layout
     */
    setupResponsiveLayout() {
        // Handle responsive behavior
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
    initializeTheme() {
        // Detect system theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
    }

    /**
     * Save text to localStorage
     */
    saveToLocalStorage() {
        try {
            const text = document.getElementById('inputText')?.value;
            if (text) {
                localStorage.setItem('opengrammar_text', text);
                localStorage.setItem('opengrammar_timestamp', Date.now().toString());
            }
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load text from localStorage
     */
    loadFromLocalStorage() {
        try {
            const savedText = localStorage.getItem('opengrammar_text');
            const timestamp = localStorage.getItem('opengrammar_timestamp');
            
            if (savedText && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (age < maxAge) {
                    const textEditor = document.getElementById('inputText');
                    if (textEditor && !textEditor.value.trim()) {
                        textEditor.value = savedText;
                        this.updateTextStats();
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }    }

    /**
     * Initialize view counter functionality
     */
    initializeViewCounter() {
        // Get current view count from localStorage
        let viewCount = parseInt(localStorage.getItem('opengrammar_view_count') || '0');
        
        // Increment view count
        viewCount++;
        localStorage.setItem('opengrammar_view_count', viewCount.toString());
        
        // Update visitor stats display with animation
        const visitorCountElement = document.getElementById('visitorCount');
        if (visitorCountElement) {
            this.animateCounter(visitorCountElement, 0, viewCount, 1500);
        }
        
        // Also update any other view counter displays
        this.updateViewCountDisplay(viewCount);
    }

    /**
     * Animate counter with smooth counting effect
     */
    animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60 FPS
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    /**
     * Update view count display across the site
     */
    updateViewCountDisplay(count) {
        // Update visitor stats in navigation
        const viewElements = document.querySelectorAll('.view-count, #visitorCount');
        viewElements.forEach(element => {
            if (element) {
                element.textContent = count.toLocaleString();
            }
        });
    }

    /**
     * Initialize location-based welcome message
     */
    async initializeLocationWelcome() {
        const welcomeElement = document.getElementById('locationWelcome');
        if (!welcomeElement) return;
        
        try {
            // First try browser geolocation API
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const locationData = await this.reverseGeocode(latitude, longitude);
                        this.displayLocationWelcome(locationData);
                    },
                    // Fallback to IP-based location
                    () => this.getLocationByIP(),
                    { timeout: 5000, maximumAge: 300000 } // 5 min cache
                );
            } else {
                // Browser doesn't support geolocation, use IP
                await this.getLocationByIP();
            }
        } catch (error) {
            console.log('Location detection failed:', error);
            this.displayLocationWelcome({ city: 'Visitor', country: 'Unknown' });
        }
    }

    /**
     * Get location using IP-based service
     */
    async getLocationByIP() {
        try {
            // Using a free IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                this.displayLocationWelcome({
                    city: data.city || 'Unknown',
                    region: data.region || '',
                    country: data.country_name || 'Unknown'
                });
            } else {
                throw new Error('IP geolocation service unavailable');
            }
        } catch (error) {
            console.log('IP geolocation failed:', error);
            this.displayLocationWelcome({ city: 'Visitor', country: 'Unknown' });
        }
    }

    /**
     * Reverse geocode coordinates to location name
     */
    async reverseGeocode(lat, lon) {
        try {
            // Using OpenStreetMap Nominatim API (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
            );
            
            if (response.ok) {
                const data = await response.json();
                const address = data.address || {};
                return {
                    city: address.city || address.town || address.village || 'Unknown',
                    region: address.state || address.region || '',
                    country: address.country || 'Unknown'
                };
            }
        } catch (error) {
            console.log('Reverse geocoding failed:', error);
        }
        
        // Fallback to IP-based location
        return this.getLocationByIP();
    }    /**
     * Display location-based welcome message
     */
    displayLocationWelcome(locationData) {
        const welcomeElement = document.getElementById('locationWelcome');
        if (!welcomeElement) return;
        
        const { city, region, country } = locationData;
        let welcomeMessage = '';
        
        if (city && city !== 'Unknown') {
            welcomeMessage = `Welcome from ${city}`;
            if (region && region !== city) {
                welcomeMessage += `, ${region}`;
            }
            if (country && country !== 'Unknown') {
                welcomeMessage += ` 🌍`;
            }
        } else {
            welcomeMessage = 'Welcome to OpenGrammar! 🌍';
        }
        
        // Update the loading screen message
        this.updateLoadingMessage(welcomeMessage);
        
        // Mark location detection as complete
        if (this.loadingState) {
            this.loadingState.locationDetected = true;
        }
        
        // Also update the main welcome element for later use
        welcomeElement.textContent = welcomeMessage;
        
        // Add fade-in animation
        welcomeElement.style.opacity = '0';
        welcomeElement.style.transition = 'opacity 0.8s ease-in-out';
        setTimeout(() => {
            welcomeElement.style.opacity = '1';
        }, 500);
    }

    /**
     * Initialize review system
     */
    initializeReviewSystem() {
        this.setupStarRating();
        this.setupReviewForm();
        this.loadReviewStats();
        this.displayRecentReviews();
    }

    /**
     * Setup interactive star rating system
     */
    setupStarRating() {
        const starRating = document.getElementById('starRating');
        if (!starRating) return;
        
        const stars = starRating.querySelectorAll('i');
        const ratingInput = document.getElementById('reviewRating');
        let currentRating = 5; // Default to 5 stars
        
        stars.forEach((star, index) => {
            const rating = index + 1;
            
            // Hover effects
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, rating);
            });
            
            // Click to set rating
            star.addEventListener('click', () => {
                currentRating = rating;
                if (ratingInput) {
                    ratingInput.value = rating;
                }
                this.setStarRating(stars, rating);
                
                // Add animation feedback
                star.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    star.style.transform = 'scale(1)';
                }, 200);
            });
        });
        
        // Reset on mouse leave
        starRating.addEventListener('mouseleave', () => {
            this.setStarRating(stars, currentRating);
        });
        
        // Initialize with 5 stars
        this.setStarRating(stars, 5);
    }

    /**
     * Highlight stars up to the given rating
     */
    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.style.color = '#fbbf24'; // Golden color
            } else {
                star.classList.remove('active');
                star.style.color = '#d1d5db'; // Gray color
            }
        });
    }

    /**
     * Set star rating permanently
     */
    setStarRating(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.style.color = '#fbbf24';
            } else {
                star.classList.remove('active');
                star.style.color = '#d1d5db';
            }
        });
    }

    /**
     * Setup review form submission
     */
    setupReviewForm() {
        const reviewForm = document.getElementById('reviewForm');
        if (!reviewForm) return;
        
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReviewSubmission(e);
        });
    }

    /**
     * Handle review form submission
     */
    handleReviewSubmission(event) {
        const formData = new FormData(event.target);
        const reviewData = {
            name: formData.get('reviewName') || 'Anonymous',
            rating: parseInt(formData.get('reviewRating') || '5'),
            message: formData.get('reviewMessage'),
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        // Validate required fields
        if (!reviewData.message || reviewData.message.trim().length < 10) {
            this.showToast('error', 'Review Required', 'Please write at least 10 characters for your review.');
            return;
        }
        
        // Save review to localStorage
        this.saveReview(reviewData);
        
        // Update UI
        this.updateReviewStats();
        this.displayRecentReviews();
        
        // Reset form
        event.target.reset();
        const stars = document.querySelectorAll('#starRating i');
        this.setStarRating(stars, 5);
        document.getElementById('reviewRating').value = '5';
        
        // Show success message
        this.showToast('success', 'Review Submitted', 'Thank you for your feedback!');
        
        // Add celebration animation
        this.celebrateReviewSubmission();
    }

    /**
     * Save review to localStorage
     */
    saveReview(reviewData) {
        let reviews = this.getStoredReviews();
        reviews.unshift(reviewData); // Add to beginning
        
        // Keep only last 50 reviews to prevent storage overflow
        if (reviews.length > 50) {
            reviews = reviews.slice(0, 50);
        }
        
        localStorage.setItem('opengrammar_reviews', JSON.stringify(reviews));
    }

    /**
     * Get stored reviews from localStorage
     */
    getStoredReviews() {
        try {
            const stored = localStorage.getItem('opengrammar_reviews');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.log('Error loading reviews:', error);
            return [];
        }
    }

    /**
     * Load and display review statistics
     */
    loadReviewStats() {
        const reviews = this.getStoredReviews();
        this.updateReviewStats(reviews);
    }

    /**
     * Update review statistics display
     */
    updateReviewStats(reviews = null) {
        if (!reviews) {
            reviews = this.getStoredReviews();
        }
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
            : '5.0';
        
        // Update displays
        const totalElement = document.getElementById('totalReviews');
        const averageElement = document.getElementById('averageRating');
        
        if (totalElement) {
            this.animateCounter(totalElement, 0, totalReviews, 1000);
        }
        
        if (averageElement) {
            setTimeout(() => {
                averageElement.textContent = averageRating;
            }, 500);
        }
    }

    /**
     * Display recent reviews (if needed for future expansion)
     */
    displayRecentReviews() {
        // This method can be expanded to show recent reviews
        // For now, it just updates the stats
        const reviews = this.getStoredReviews();
        console.log(`Total reviews: ${reviews.length}`);
    }

    /**
     * Add celebration animation after review submission
     */
    celebrateReviewSubmission() {
        // Create floating thank you message
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #3b82f6);
            color: white;
            padding: 1rem 2rem;
            border-radius: 1rem;
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        `;
        celebration.innerHTML = '🎉 Thank you for your review! 🎉';
        document.body.appendChild(celebration);
        
        // Animate celebration
        if (typeof anime !== 'undefined') {
            anime({
                targets: celebration,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .8)',
                complete: () => {
                    setTimeout(() => {
                        anime({
                            targets: celebration,
                            scale: 0,
                            opacity: 0,
                            duration: 300,
                            easing: 'easeInCubic',
                            complete: () => {
                                celebration.remove();
                            }
                        });
                    }, 2000);
                }
            });
        } else {
            // Fallback without anime.js
            setTimeout(() => {
                celebration.remove();
            }, 3000);
        }    }    /**
     * Initialize and manage the iPhone-style loading screen
     */
    initializeLoadingScreen() {
        // Initialize loading state
        this.loadingState = {
            startTime: Date.now(),
            minDisplayTime: 2500, // Minimum 2.5 seconds for nice loading experience
            locationDetected: false,
            componentsReady: false
        };
        
        // Hide main content initially
        this.hideMainContentForLoading();
        
        // Show loading screen immediately
        this.showLoadingScreen();
        
        // Start loading progress animation
        this.animateLoadingProgress();
        
        // Preload critical resources
        this.preloadResources();
        
        // Mark components as ready after a short delay
        setTimeout(() => {
            this.loadingState.componentsReady = true;
            this.checkLoadingComplete();
        }, 2000);
    }

    /**
     * Preload critical resources for better performance
     */
    preloadResources() {
        // Preload any critical images or resources
        const criticalImages = [
            './static/logo.PNG'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        // Warm up localStorage access
        try {
            localStorage.getItem('opengrammar_view_count');
            localStorage.getItem('opengrammar_reviews');
        } catch (e) {
            console.log('localStorage not available');
        }
    }

    /**
     * Check if loading is complete and hide screen if ready
     */
    checkLoadingComplete() {
        const elapsed = Date.now() - this.loadingState.startTime;
        const minTimeReached = elapsed >= this.loadingState.minDisplayTime;
        
        if (minTimeReached && this.loadingState.componentsReady) {
            // Add a small delay for smoother experience
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 500);
        }
    }

    /**
     * Hide main content while loading screen is visible
     */
    hideMainContentForLoading() {
        const mainElements = [
            '.header',
            '.main',
            '.review-section'
        ];
        
        mainElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.visibility = 'hidden';
            });
        });
    }

    /**
     * Show main content after loading screen is hidden
     */
    showMainContent() {
        const mainElements = [
            '.header',
            '.main',
            '.review-section'
        ];
        
        mainElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            });
        });
    }    /**
     * Show the loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.remove('hidden');
            
            // Ensure it's visible and on top
            loadingScreen.style.opacity = '1';
            loadingScreen.style.visibility = 'visible';
            loadingScreen.style.zIndex = '9999';
            
            // Prevent body scroll while loading
            document.body.style.overflow = 'hidden';
            
            // Add keyboard shortcut to skip loading (press 'S' key)
            this.addLoadingScreenKeyHandler();
        }
    }

    /**
     * Add keyboard handler for loading screen skip
     */
    addLoadingScreenKeyHandler() {
        const skipHandler = (event) => {
            if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                document.removeEventListener('keydown', skipHandler);
                this.hideLoadingScreen();
            }
        };
        
        document.addEventListener('keydown', skipHandler);
        
        // Auto-remove handler after loading completes
        setTimeout(() => {
            document.removeEventListener('keydown', skipHandler);
        }, 5000);
    }/**
     * Hide the loading screen with smooth animation
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        if (typeof anime !== 'undefined') {
            // Animate loading screen fade out
            anime({
                targets: loadingScreen,
                opacity: [1, 0],
                scale: [1, 1.1],
                duration: 800,
                easing: 'easeInCubic',
                complete: () => {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                    document.body.style.overflow = '';
                    
                    // Show main content and trigger animations
                    this.showMainContent();
                    this.animatePageLoad();
                }
            });
        } else {
            // Fallback without anime.js
            loadingScreen.style.transition = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
                this.showMainContent();
                this.animatePageLoad();
            }, 800);
        }
    }    /**
     * Animate the loading progress bar
     */
    animateLoadingProgress() {
        const progressBar = document.querySelector('.iphone-loading-progress');
        if (!progressBar) return;

        // Add dynamic loading tips
        this.showRandomLoadingTips();

        if (typeof anime !== 'undefined') {
            // Animate progress bar from 0 to 100%
            anime({
                targets: progressBar,
                width: ['0%', '100%'],
                duration: 2800,
                easing: 'easeInOutQuart'
            });
        } else {
            // Fallback CSS animation
            progressBar.style.transition = 'width 2.8s ease-in-out';
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        }
    }

    /**
     * Show random loading tips to engage users
     */
    showRandomLoadingTips() {
        const tips = [
            'Preparing your writing assistant...',
            'Loading grammar intelligence...',
            'Initializing writing analysis...',
            'Setting up smart corrections...',
            'Optimizing for your writing style...',
            'Configuring language models...',
            'Loading writing insights...',
            'Preparing style suggestions...'
        ];
        
        const tipElement = document.querySelector('.loading-tip');
        if (!tipElement) return;
        
        let currentTipIndex = 0;
        const tipInterval = setInterval(() => {
            currentTipIndex = (currentTipIndex + 1) % tips.length;
            tipElement.style.opacity = '0.3';
            
            setTimeout(() => {
                tipElement.textContent = tips[currentTipIndex];
                tipElement.style.opacity = '0.7';
            }, 200);
        }, 800);
        
        // Clear interval after 3 seconds
        setTimeout(() => {
            clearInterval(tipInterval);
        }, 3000);
    }

    /**
     * Update loading screen with location-based welcome message
     */
    updateLoadingMessage(message) {
        const locationWelcome = document.getElementById('locationWelcome');
        if (locationWelcome && message) {
            locationWelcome.textContent = message;
            
            // Add a subtle animation to draw attention to the personalized message
            if (typeof anime !== 'undefined') {
                anime({
                    targets: locationWelcome,
                    scale: [1, 1.05, 1],
                    duration: 600,
                    easing: 'easeInOutSine'
                });
            }
        }
    }

    /**
     * Utility: Debounce function
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
     * Utility: Escape HTML
     */    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for HTML onclick handlers
window.closeModal = function(modalId) {
    if (window.grammarChecker) {
        window.grammarChecker.hideModal(modalId);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing GrammarChecker');
    window.grammarChecker = new GrammarChecker();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarChecker;
}