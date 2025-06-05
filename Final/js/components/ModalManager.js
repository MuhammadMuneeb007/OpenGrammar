/**
 * Modal Manager Component
 * Handles all modal-related functionality including show/hide animations and event binding
 */

class ModalManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.bindEvents();
    }

    /**
     * Bind all modal-related events
     */
    bindEvents() {
        // Modal trigger buttons
        this.bindTriggerButtons();
        
        // Modal close buttons
        this.bindCloseButtons();
        
        // Modal backdrop clicks
        this.bindBackdropClicks();
        
        // Form submissions
        this.bindFormSubmissions();
        
        // Share buttons
        this.bindShareButtons();
    }

    /**
     * Bind modal trigger buttons
     */
    bindTriggerButtons() {
        const triggers = [
            { id: 'instructionsBtn', modal: 'instructionsModal' },
            { id: 'aboutBtn', modal: 'aboutModal' },
            { id: 'contactBtn', modal: 'contactModal' },
            { id: 'shareBtn', modal: 'shareModal' }
        ];

        triggers.forEach(({ id, modal }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal(modal);
                });
            }
        });
    }

    /**
     * Bind modal close buttons
     */
    bindCloseButtons() {
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });
    }

    /**
     * Bind modal backdrop clicks
     */
    bindBackdropClicks() {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });
    }

    /**
     * Bind form submissions
     */
    bindFormSubmissions() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmission.bind(this));
        }
    }

    /**
     * Bind share buttons
     */
    bindShareButtons() {
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', this.handleSocialShare.bind(this));
        });

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
        this.uiManager.showToast('success', 'Email Client Opened', 'Your default email client should open with the message.');
    }

    /**
     * Handle social sharing
     */
    handleSocialShare(event) {
        const platform = event.currentTarget.dataset.platform;
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('Check out OpenGrammar - Free AI-powered writing assistant!');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'reddit':
                shareUrl = `https://reddit.com/submit?url=${url}&title=${text}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    /**
     * Copy share URL to clipboard
     */
    async copyShareUrl() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.uiManager.showToast('success', 'Link Copied!', 'The share link has been copied to your clipboard.');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.uiManager.showToast('success', 'Link Copied!', 'The share link has been copied to your clipboard.');
            } catch (fallbackErr) {
                this.uiManager.showToast('error', 'Copy Failed', 'Unable to copy link to clipboard.');
            }
            
            document.body.removeChild(textArea);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}
