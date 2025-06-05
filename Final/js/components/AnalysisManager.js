/**
 * Analysis Manager Component
 * Handles grammar analysis, API communication, and results processing
 */

class AnalysisManager {
    constructor(config, uiManager) {
        this.config = config;
        this.uiManager = uiManager;
        this.corrections = new Map();
        this.currentAnalysis = null;
        this.isAnalyzing = false;
    }

    /**
     * Set analyzing state
     */
    setAnalyzingState(isAnalyzing) {
        this.isAnalyzing = isAnalyzing;
        
        const checkBtn = document.getElementById('checkGrammar');
        const loadingIndicator = document.querySelector('.loading-indicator');
        const analyzeIcon = document.querySelector('.analyze-icon');
        
        if (checkBtn) {
            checkBtn.disabled = isAnalyzing;
            checkBtn.textContent = isAnalyzing ? 'Analyzing...' : 'Check Grammar';
        }
        
        if (loadingIndicator) {
            loadingIndicator.style.display = isAnalyzing ? 'block' : 'none';
        }
        
        if (analyzeIcon) {
            analyzeIcon.classList.toggle('fa-spin', isAnalyzing);
        }
    }

    /**
     * Analyze text for grammar and style issues
     */
    async analyzeText() {
        const textEditor = document.getElementById('inputText');
        if (!textEditor) {
            this.uiManager.showToast('error', 'Error', 'Text editor not found');
            return;
        }

        const text = textEditor.value.trim();
        if (!text) {
            this.uiManager.showToast('warning', 'No Text', 'Please enter some text to analyze');
            return;
        }

        if (text.length < 10) {
            this.uiManager.showToast('warning', 'Text Too Short', 'Please enter at least 10 characters for analysis');
            return;
        }

        this.setAnalyzingState(true);        try {
            const response = await fetch(`${this.config.apiBaseUrl}/check_grammar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    goal: document.getElementById('writingGoal')?.value || 'general',
                    tone: document.getElementById('writingTone')?.value || 'neutral',
                    include_metrics: true,
                    include_suggestions: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.currentAnalysis = data;
            this.displayAnalysisResults(data);
            this.uiManager.showToast('success', 'Analysis Complete', 'Your text has been analyzed successfully');

        } catch (error) {
            console.error('Analysis error:', error);
            this.uiManager.showToast('error', 'Analysis Failed', 
                error.message || 'Unable to analyze text. Please try again.');
        } finally {
            this.setAnalyzingState(false);
        }
    }

    /**
     * Display analysis results in the UI
     */
    displayAnalysisResults(data) {
        // Clear previous results
        this.corrections.clear();
        
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
            acceptAllBtn.disabled = this.corrections.size === 0;
        }
    }

    /**
     * Update score displays
     */
    updateScoreDisplays(data) {
        const scoreUpdates = {
            grammarScore: this.calculateGrammarScore(data),
            overallScore: data.meta_analysis?.overall_quality_score || 0
        };

        Object.entries(scoreUpdates).forEach(([id, score]) => {
            const element = document.getElementById(id);
            if (element) {
                const displayScore = Math.round(score);
                element.textContent = `${displayScore}/100`;
                
                // Add color class based on score
                element.className = element.className.replace(/score-\w+/g, '');
                if (displayScore >= 80) element.classList.add('score-good');
                else if (displayScore >= 60) element.classList.add('score-fair');
                else element.classList.add('score-poor');
            }
        });
    }

    /**
     * Calculate grammar score based on corrections
     */
    calculateGrammarScore(data) {
        if (!data.corrections || data.corrections.length === 0) return 100;
        
        const textLength = document.getElementById('inputText')?.value.length || 1;
        const errorRate = data.corrections.length / (textLength / 100);
        return Math.max(0, Math.min(100, 100 - errorRate * 2));
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
        const correctionsContainer = document.getElementById('correctionsContent');
        if (!correctionsContainer) return;

        if (!data.corrections || data.corrections.length === 0) {
            this.showNoCorrectionsMessage(correctionsContainer);
            return;
        }

        const correctionsHtml = data.corrections.map((sentence, index) => 
            this.createCorrectionElement(sentence, index)
        ).join('');

        correctionsContainer.innerHTML = `
            <div class="corrections-summary">
                <p>Found ${data.corrections.length} suggestion${data.corrections.length !== 1 ? 's' : ''} for improvement:</p>
            </div>
            <div class="corrections-list">
                ${correctionsHtml}
            </div>
        `;

        // Store corrections for accept functionality
        data.corrections.forEach((correction, index) => {
            this.corrections.set(`correction-${index}`, correction);
        });
    }

    /**
     * Show message when no corrections are needed
     */
    showNoCorrectionsMessage(container) {
        container.innerHTML = `
            <div class="no-corrections">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Excellent Writing!</h3>
                <p>No grammar or style issues were found in your text.</p>
            </div>
        `;
    }

    /**
     * Create correction element
     */
    createCorrectionElement(sentence, index) {
        const correctionId = `correction-${index}`;
        const escapedOriginal = this.uiManager.escapeHtml(sentence.original || '');
        const escapedSuggestion = this.uiManager.escapeHtml(sentence.suggestion || '');
        const category = sentence.category || 'Grammar';
        const explanation = this.uiManager.escapeHtml(sentence.explanation || 'No explanation provided.');

        return `
            <div class="correction-item" data-id="${correctionId}">
                <div class="correction-header">
                    <span class="correction-category ${category.toLowerCase()}">${category}</span>
                    <button class="correction-accept" onclick="grammarChecker.analysisManager.acceptCorrection('${correctionId}')">
                        <i class="fas fa-check"></i> Accept
                    </button>
                </div>
                <div class="correction-content">
                    <div class="correction-text">
                        <div class="original-text">
                            <strong>Original:</strong> <span class="text-content">${escapedOriginal}</span>
                        </div>
                        <div class="suggested-text">
                            <strong>Suggested:</strong> <span class="text-content">${escapedSuggestion}</span>
                        </div>
                    </div>
                    <div class="correction-explanation">
                        <strong>Explanation:</strong> ${explanation}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Accept a single correction
     */
    acceptCorrection(correctionId) {
        const correction = this.corrections.get(correctionId);
        if (!correction) return;

        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        const currentText = textEditor.value;
        const originalText = correction.original;
        const suggestionText = correction.suggestion;

        if (originalText && suggestionText && currentText.includes(originalText)) {
            const newText = currentText.replace(originalText, suggestionText);
            textEditor.value = newText;
            
            // Remove the correction from the list
            this.corrections.delete(correctionId);
            
            // Remove from UI
            const correctionElement = document.querySelector(`[data-id="${correctionId}"]`);
            if (correctionElement) {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: correctionElement,
                        opacity: [1, 0],
                        height: [correctionElement.offsetHeight, 0],
                        duration: 300,
                        easing: 'easeInCubic',
                        complete: () => correctionElement.remove()
                    });
                } else {
                    correctionElement.remove();
                }
            }
            
            this.uiManager.showToast('success', 'Correction Applied', 'The suggested change has been applied to your text.');
            
            // Update stats
            if (window.grammarChecker && window.grammarChecker.updateTextStats) {
                window.grammarChecker.updateTextStats();
            }
        }
    }

    /**
     * Accept all corrections
     */
    acceptAllCorrections() {
        if (this.corrections.size === 0) return;

        const textEditor = document.getElementById('inputText');
        if (!textEditor) return;

        let currentText = textEditor.value;
        let changesCount = 0;

        // Apply all corrections
        for (const [id, correction] of this.corrections) {
            const originalText = correction.original;
            const suggestionText = correction.suggestion;

            if (originalText && suggestionText && currentText.includes(originalText)) {
                currentText = currentText.replace(originalText, suggestionText);
                changesCount++;
            }
        }

        if (changesCount > 0) {
            textEditor.value = currentText;
            this.corrections.clear();
            
            // Clear corrections display
            const correctionsContainer = document.getElementById('correctionsContent');
            if (correctionsContainer) {
                this.showNoCorrectionsMessage(correctionsContainer);
            }
            
            this.uiManager.showToast('success', 'All Corrections Applied', 
                `${changesCount} suggestion${changesCount !== 1 ? 's' : ''} applied to your text.`);
            
            // Update stats
            if (window.grammarChecker && window.grammarChecker.updateTextStats) {
                window.grammarChecker.updateTextStats();
            }
        }
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
                        <span class="paragraph-score">${Math.round((para.overall_score || 0) * 100)}%</span>
                    </div>
                    <div class="paragraph-metrics">
                        <div class="metric-row">
                            <span class="metric-label">Coherence:</span>
                            <span class="metric-value">${Math.round((structure.coherence_score || 0) * 100)}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Clarity:</span>
                            <span class="metric-value">${Math.round((structure.clarity_score || 0) * 100)}%</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">Transition Effectiveness:</span>
                            <span class="metric-value">${Math.round((structure.transition_effectiveness || 0) * 100)}%</span>
                        </div>
                    </div>
                    ${para.improvement_suggestions ? `
                        <div class="paragraph-suggestions">
                            <strong>Suggestions:</strong> ${this.uiManager.escapeHtml(para.improvement_suggestions)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        paragraphContainer.innerHTML = paragraphsHtml;
    }

    /**
     * Get current analysis data
     */
    getCurrentAnalysis() {
        return this.currentAnalysis;
    }

    /**
     * Get current corrections
     */
    getCurrentCorrections() {
        return this.corrections;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisManager;
}
