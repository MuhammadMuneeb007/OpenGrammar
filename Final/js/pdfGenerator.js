class PDFGenerator {
    constructor() {
        this.isJsPDFLoaded = false;
        this.colors = {
            primary: [41, 98, 255],
            secondary: [16, 185, 129],
            accent: [245, 158, 11],
            danger: [239, 68, 68],
            text: [31, 41, 55],
            textLight: [107, 114, 128],
            background: [249, 250, 251],
            white: [255, 255, 255]
        };
        this.checkJsPDFAvailability();
    }

    checkJsPDFAvailability() {
        if (typeof window.jspdf !== 'undefined') {
            this.isJsPDFLoaded = true;
        } else {
            setTimeout(() => this.checkJsPDFAvailability(), 100);
        }
    }

    async generateReport(analysisData = {}) {
        try {
            if (!this.isJsPDFLoaded) {
                await this.waitForJsPDF();
            }

            const { jsPDF } = window.jspdf;
            if (typeof jsPDF !== 'function') {
                throw new Error('PDF library not available');
            }

            const doc = new jsPDF();
            
            // Collect comprehensive data
            const completeData = Object.keys(analysisData).length > 0 ? 
                { ...this.collectAnalysisData(), ...analysisData } : 
                this.collectAnalysisData();

            // Generate PDF with modern styling
            let currentY = 20;
            currentY = this.addModernHeader(doc, currentY);
            currentY = this.addDocumentInfo(doc, currentY);
            currentY = this.addOverviewSection(doc, completeData, currentY);
            currentY = this.addScoresSection(doc, completeData, currentY);
            currentY = this.addCorrectionsSection(doc, completeData, currentY);
            currentY = this.addAnalysisSection(doc, completeData, currentY);
            currentY = this.addTextSection(doc, completeData.inputText, currentY);
            
            this.addModernFooter(doc);

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `OpenGrammar_Report_${timestamp}.pdf`;

            doc.save(filename);

            return {
                success: true,
                filename: filename,
                message: 'PDF report generated successfully!'
            };

        } catch (error) {
            console.error('PDF generation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }

    addModernHeader(doc, startY) {
        // Header background with gradient effect
        doc.setFillColor(...this.colors.primary);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Add accent line
        doc.setFillColor(...this.colors.secondary);
        doc.rect(0, 32, 210, 3, 'F');
        
        // Main title
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...this.colors.white);
        doc.text('OpenGrammar', 20, 20);
        
        // Subtitle
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('AI-Powered Writing Analysis Report', 20, 28);
        
        // Reset text color
        doc.setTextColor(...this.colors.text);
        
        return startY + 40;
    }

    addDocumentInfo(doc, startY) {
        // Info background
        doc.setFillColor(...this.colors.background);
        doc.rect(15, startY - 3, 180, 20, 'F');
        
        // Border
        doc.setDrawColor(...this.colors.secondary);
        doc.setLineWidth(0.5);
        doc.rect(15, startY - 3, 180, 20);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.colors.textLight);
        
        const date = new Date();
        doc.text(`Generated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`, 20, startY + 5);
        doc.text('OpenGrammar - Professional Writing Assistant', 20, startY + 12);
        
        doc.setTextColor(...this.colors.text);
        return startY + 30;
    }

    addOverviewSection(doc, data, startY) {
        // Section header
        this.addSectionHeader(doc, 'Document Overview', startY, this.colors.secondary);
        
        let yPos = startY + 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');

        const overviewData = [
            ['Word Count', data.wordCount || '0'],
            ['Character Count', data.charCount || '0'],
            ['Complexity Level', data.complexity || 'Basic'],
            ['Writing Goal', data.writingGoal || 'General'],
            ['Writing Tone', data.writingTone || 'Neutral']
        ];

        overviewData.forEach(([label, value], index) => {
            // Alternating background
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(20, yPos - 3, 170, 8, 'F');
            }
            
            doc.setTextColor(...this.colors.text);
            doc.text(label + ':', 25, yPos);
            
            doc.setTextColor(...this.colors.primary);
            doc.setFont(undefined, 'bold');
            doc.text(String(value), 80, yPos);
            doc.setFont(undefined, 'normal');
            
            yPos += 8;
        });

        return yPos + 15;
    }

    addScoresSection(doc, data, startY) {
        this.addSectionHeader(doc, 'Analysis Scores', startY, this.colors.accent);
        
        let yPos = startY + 15;
        
        const scores = [
            ['Grammar Score', data.grammarScore || '-'],
            ['Overall Score', data.overallScore || '-'],
            ['Quality Score', data.qualityScore || '-'],
            ['Reading Level', data.readingLevel || '-'],
            ['Coherence Score', data.coherenceScore || '-']
        ];

        scores.forEach(([label, value], index) => {
            const scoreColor = this.getScoreColor(value);
            
            // Score badge
            doc.setFillColor(...scoreColor);
            doc.roundedRect(170, yPos - 4, 20, 6, 2, 2, 'F');
            
            doc.setTextColor(...this.colors.text);
            doc.text(label + ':', 25, yPos);
            
            doc.setTextColor(...this.colors.white);
            doc.setFont(undefined, 'bold');
            doc.text(String(value), 175, yPos);
            doc.setFont(undefined, 'normal');
            
            yPos += 10;
        });

        return yPos + 15;
    }

    addCorrectionsSection(doc, data, startY) {
        if (!data.corrections || data.corrections.length === 0) {
            return startY;
        }

        // Check page space
        if (startY > 200) {
            doc.addPage();
            startY = 20;
        }

        this.addSectionHeader(doc, 'Grammar & Style Corrections', startY, this.colors.danger);
        
        let yPos = startY + 15;
        
        data.corrections.slice(0, 10).forEach((correction, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Correction box
            doc.setFillColor(...this.colors.background);
            doc.rect(20, yPos - 2, 170, 20, 'F');
            
            // Category indicator
            const categoryColor = this.getCategoryColor(correction.category);
            doc.setFillColor(...categoryColor);
            doc.rect(20, yPos - 2, 4, 20, 'F');
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...this.colors.text);
            doc.text(`${index + 1}. ${(correction.category || 'Issue').toUpperCase()}`, 27, yPos + 3);
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            
            if (correction.original) {
                doc.setTextColor(...this.colors.danger);
                doc.text('Original:', 27, yPos + 8);
                doc.setTextColor(...this.colors.text);
                const originalText = doc.splitTextToSize(correction.original, 120);
                doc.text(originalText[0] || '', 50, yPos + 8);
            }
            
            if (correction.suggestion) {
                doc.setTextColor(...this.colors.secondary);
                doc.text('Suggested:', 27, yPos + 13);
                doc.setTextColor(...this.colors.text);
                const suggestionText = doc.splitTextToSize(correction.suggestion, 120);
                doc.text(suggestionText[0] || '', 55, yPos + 13);
            }
            
            yPos += 25;
        });

        return yPos + 10;
    }

    addAnalysisSection(doc, data, startY) {
        // Check page space
        if (startY > 200) {
            doc.addPage();
            startY = 20;
        }

        this.addSectionHeader(doc, 'Detailed Analysis', startY, this.colors.primary);
        
        let yPos = startY + 15;
        
        // Document metrics
        if (data.documentMetrics && Object.keys(data.documentMetrics).length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...this.colors.text);
            doc.text('Document Metrics', 25, yPos);
            yPos += 8;
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            
            Object.entries(data.documentMetrics).slice(0, 8).forEach(([key, value]) => {
                doc.setTextColor(...this.colors.textLight);
                doc.text(`${key}:`, 30, yPos);
                doc.setTextColor(...this.colors.text);
                doc.text(String(value), 100, yPos);
                yPos += 6;
            });
            
            yPos += 10;
        }

        return yPos;
    }

    addTextSection(doc, inputText, startY) {
        // Check page space
        if (startY > 180) {
            doc.addPage();
            startY = 20;
        }

        this.addSectionHeader(doc, 'Analyzed Text', startY, this.colors.textLight);
        
        let yPos = startY + 15;
        
        // Text background
        doc.setFillColor(...this.colors.background);
        doc.rect(20, yPos - 3, 170, Math.min(80, 200 - yPos), 'F');
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...this.colors.text);

        if (inputText && inputText.trim()) {
            const lines = doc.splitTextToSize(inputText.substring(0, 800), 160);
            
            lines.slice(0, 15).forEach(line => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, 25, yPos);
                yPos += 4;
            });
            
            if (inputText.length > 800) {
                doc.setTextColor(...this.colors.textLight);
                doc.text('... (text truncated for display)', 25, yPos + 5);
            }
        } else {
            doc.setTextColor(...this.colors.textLight);
            doc.text('No text was provided for analysis.', 25, yPos);
        }

        return yPos + 15;
    }

    addSectionHeader(doc, title, yPos, color) {
        // Section background
        doc.setFillColor(...color);
        doc.rect(15, yPos - 2, 180, 10, 'F');
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...this.colors.white);
        doc.text(title, 20, yPos + 5);
    }

    addModernFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer background
            doc.setFillColor(...this.colors.primary);
            doc.rect(0, 285, 210, 10, 'F');
            
            doc.setFontSize(8);
            doc.setTextColor(...this.colors.white);
            doc.text(`Page ${i} of ${pageCount}`, 20, 291);
            doc.text('Generated by OpenGrammar - AI Writing Assistant', 130, 291);
        }
    }

    collectAnalysisData() {
        return {
            inputText: this.safeGetValue('inputText', 'value', ''),
            wordCount: this.safeGetValue('wordCount', 'textContent', '0'),
            charCount: this.safeGetValue('charCount', 'textContent', '0'),
            complexity: this.safeGetValue('complexity', 'textContent', 'Basic'),
            grammarScore: this.safeGetValue('grammarScore', 'textContent', '-'),
            overallScore: this.safeGetValue('overallScore', 'textContent', '-'),
            qualityScore: this.safeGetValue('qualityScore', 'textContent', '-'),
            readingLevel: this.safeGetValue('readingLevel', 'textContent', '-'),
            coherenceScore: this.safeGetValue('coherenceScore', 'textContent', '-'),
            writingGoal: this.safeGetValue('writingGoal', 'value', 'General'),
            writingTone: this.safeGetValue('writingTone', 'value', 'Neutral'),
            corrections: this.collectCorrections(),
            documentMetrics: this.collectDocumentMetrics()
        };
    }

    collectCorrections() {
        const corrections = [];
        
        // Try to get corrections from current analysis
        if (window.grammarChecker && window.grammarChecker.state.corrections) {
            window.grammarChecker.state.corrections.forEach(correction => {
                corrections.push({
                    category: correction.category || 'Grammar',
                    original: correction.original_text || '',
                    suggestion: correction.improved_text || '',
                    reason: correction.explanation || ''
                });
            });
        }
        
        return corrections;
    }

    collectDocumentMetrics() {
        const metrics = {};
        
        // Collect from analysis results if available
        if (window.grammarChecker && window.grammarChecker.state.currentAnalysis) {
            const analysis = window.grammarChecker.state.currentAnalysis;
            if (analysis.meta_analysis && analysis.meta_analysis.document_metrics) {
                return analysis.meta_analysis.document_metrics;
            }
        }
        
        return metrics;
    }

    safeGetValue(elementId, property, fallback) {
        try {
            const element = document.getElementById(elementId);
            return element?.[property] || fallback;
        } catch (error) {
            return fallback;
        }
    }

    getScoreColor(score) {
        if (score === '-') return this.colors.textLight;
        
        const numScore = parseFloat(score);
        if (isNaN(numScore)) return this.colors.textLight;
        
        if (numScore >= 80) return this.colors.secondary;
        if (numScore >= 60) return this.colors.accent;
        return this.colors.danger;
    }

    getCategoryColor(category) {
        const colors = {
            grammar: this.colors.danger,
            spelling: this.colors.accent,
            style: this.colors.primary,
            punctuation: this.colors.secondary
        };
        return colors[category?.toLowerCase()] || this.colors.textLight;
    }

    async waitForJsPDF(maxWait = 5000) {
        const startTime = Date.now();
        while (!this.isJsPDFLoaded && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!this.isJsPDFLoaded) {
            throw new Error('PDF library failed to load');
        }
    }

    generateTextFallback(analysisData = {}) {
        try {
            const data = { ...this.collectAnalysisData(), ...analysisData };
            
            const reportContent = `
OpenGrammar Analysis Report
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

DOCUMENT OVERVIEW
================
Word Count: ${data.wordCount}
Character Count: ${data.charCount}
Complexity Level: ${data.complexity}
Writing Goal: ${data.writingGoal}
Writing Tone: ${data.writingTone}

ANALYSIS SCORES
===============
Grammar Score: ${data.grammarScore}
Overall Score: ${data.overallScore}
Quality Score: ${data.qualityScore}
Reading Level: ${data.readingLevel}
Coherence Score: ${data.coherenceScore}

CORRECTIONS
===========
${data.corrections.length > 0 ? data.corrections.map((correction, i) => 
    `${i + 1}. ${correction.category}: ${correction.original} → ${correction.suggestion}`
).join('\n') : 'No corrections needed.'}

ANALYZED TEXT
=============
${data.inputText || 'No text provided'}

Generated by OpenGrammar - AI Writing Assistant
            `.trim();

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `OpenGrammar_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Report downloaded as text file' };
        } catch (error) {
            return { success: false, message: 'Failed to generate text report' };
        }
    }

    // Initialize clipboard functionality
    initializeClipboardFeatures() {
        const textEditor = document.getElementById('inputText');
        if (textEditor) {
            textEditor.addEventListener('paste', () => {
                setTimeout(() => this.updateTextStats(), 10);
            });
        }
    }

    updateTextStats() {
        const textEditor = document.getElementById('inputText');
        if (textEditor && window.grammarChecker) {
            window.grammarChecker.updateTextStats();
        }
    }
}

window.PDFGenerator = PDFGenerator;