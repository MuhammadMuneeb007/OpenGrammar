/**
 * Feature Manager Component
 * Handles additional features like view counter, location detection, and review system
 */

class FeatureManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.initializeFeatures();
    }

    /**
     * Initialize all additional features
     */
    initializeFeatures() {
        this.initializeViewCounter();
        this.initializeLocationWelcome();
        this.initializeReviewSystem();
    }

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
            this.uiManager.animateCounter(visitorCountElement, 0, viewCount, 1500);
        }
        
        // Also update any other view counter displays
        this.updateViewCountDisplay(viewCount);
    }

    /**
     * Update view count display across the site
     */
    updateViewCountDisplay(count) {
        const viewCountElements = document.querySelectorAll('.view-count, .visitor-count');
        viewCountElements.forEach(element => {
            element.textContent = count.toLocaleString();
        });
    }

    /**
     * Initialize location-based welcome message
     */
    async initializeLocationWelcome() {
        try {
            let locationData = null;

            // Try to get location using browser geolocation first
            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: false
                        });
                    });

                    const { latitude, longitude } = position.coords;
                    locationData = await this.reverseGeocode(latitude, longitude);
                } catch (geoError) {
                    console.log('Geolocation failed, trying IP-based location');
                }
            }

            // Fallback to IP-based location
            if (!locationData) {
                locationData = await this.getLocationByIP();
            }

            if (locationData) {
                this.displayLocationWelcome(locationData);
            }
        } catch (error) {
            console.log('Location detection failed:', error);
            // Use default welcome message
            this.displayLocationWelcome(null);
        }
    }

    /**
     * Get location using IP-based service
     */
    async getLocationByIP() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('IP location service failed');
            
            const data = await response.json();
            return {
                city: data.city,
                country: data.country_name,
                region: data.region
            };
        } catch (error) {
            console.log('IP geolocation failed:', error);
            return null;
        }
    }

    /**
     * Reverse geocode coordinates to location name
     */
    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY&limit=1`
            );
            
            if (!response.ok) throw new Error('Geocoding service failed');
            
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const components = data.results[0].components;
                return {
                    city: components.city || components.town || components.village,
                    country: components.country,
                    region: components.state || components.region
                };
            }
        } catch (error) {
            console.log('Reverse geocoding failed:', error);
        }
        return null;
    }

    /**
     * Display location-based welcome message
     */
    displayLocationWelcome(locationData) {
        const welcomeElements = document.querySelectorAll('#locationWelcome, .location-welcome');
        
        let welcomeMessage = 'Welcome to OpenGrammar';
        
        if (locationData && locationData.city) {
            welcomeMessage = `Welcome from ${locationData.city}!`;
        } else if (locationData && locationData.country) {
            welcomeMessage = `Welcome from ${locationData.country}!`;
        }
        
        welcomeElements.forEach(element => {
            element.textContent = welcomeMessage;
            
            // Add a gentle animation
            if (typeof anime !== 'undefined') {
                anime({
                    targets: element,
                    opacity: [0, 1],
                    scale: [0.95, 1],
                    duration: 800,                    easing: 'easeOutCubic',
                    delay: 500
                });
            }
        });
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
        const starContainers = document.querySelectorAll('.star-rating');
        
        starContainers.forEach(container => {
            const stars = container.querySelectorAll('.star');
            let currentRating = 0;
            
            stars.forEach((star, index) => {
                const rating = index + 1;
                
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, rating);
                });
                
                star.addEventListener('mouseleave', () => {
                    this.highlightStars(stars, currentRating);
                });
                
                star.addEventListener('click', () => {
                    currentRating = rating;
                    this.setStarRating(stars, rating);
                    container.dataset.rating = rating;
                });
            });
        });
    }

    /**
     * Highlight stars up to the given rating
     */
    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    /**
     * Set star rating permanently
     */
    setStarRating(stars, rating) {
        this.highlightStars(stars, rating);
        
        // Add animation
        if (typeof anime !== 'undefined') {
            anime({
                targets: Array.from(stars).slice(0, rating),
                scale: [1, 1.2, 1],
                duration: 400,
                delay: anime.stagger(50),
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }

    /**
     * Setup review form submission
     */
    setupReviewForm() {
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', this.handleReviewSubmission.bind(this));
        }
    }

    /**
     * Handle review form submission
     */
    handleReviewSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const starRating = document.querySelector('.star-rating')?.dataset.rating;
        
        if (!starRating) {
            this.uiManager.showToast('warning', 'Rating Required', 'Please select a star rating before submitting your review.');
            return;
        }
        
        const reviewData = {
            rating: parseInt(starRating),
            name: formData.get('reviewerName') || 'Anonymous',
            feedback: formData.get('reviewFeedback') || '',
            timestamp: new Date().toISOString()
        };
        
        // Save review
        this.saveReview(reviewData);
        
        // Reset form
        event.target.reset();
        
        // Reset star rating
        const stars = document.querySelectorAll('.star-rating .star');
        this.highlightStars(stars, 0);
        document.querySelector('.star-rating').dataset.rating = '0';
        
        // Update stats
        this.loadReviewStats();
        
        // Show success message
        this.uiManager.showToast('success', 'Review Submitted!', 'Thank you for your feedback. It helps us improve OpenGrammar.');
        
        // Add celebration animation
        this.celebrateReviewSubmission();
    }

    /**
     * Save review to localStorage
     */
    saveReview(reviewData) {
        try {
            const existingReviews = this.getStoredReviews();
            existingReviews.push(reviewData);
            
            // Keep only the last 100 reviews to prevent storage bloat
            if (existingReviews.length > 100) {
                existingReviews.splice(0, existingReviews.length - 100);
            }
            
            localStorage.setItem('opengrammar_reviews', JSON.stringify(existingReviews));
        } catch (error) {
            console.error('Failed to save review:', error);
        }
    }

    /**
     * Get stored reviews from localStorage
     */
    getStoredReviews() {
        try {
            const reviews = localStorage.getItem('opengrammar_reviews');
            return reviews ? JSON.parse(reviews) : [];
        } catch (error) {
            console.error('Failed to load reviews:', error);
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
            : '0.0';
        
        // Update stats in UI
        const totalReviewsElement = document.getElementById('totalReviews');
        const averageRatingElement = document.getElementById('averageRating');
        
        if (totalReviewsElement) {
            totalReviewsElement.textContent = totalReviews.toLocaleString();
        }
        
        if (averageRatingElement) {
            averageRatingElement.textContent = averageRating;
        }
        
        // Update rating distribution if element exists
        this.updateRatingDistribution(reviews);
    }

    /**
     * Update rating distribution chart
     */
    updateRatingDistribution(reviews) {
        const distributionElement = document.getElementById('ratingDistribution');
        if (!distributionElement) return;
        
        const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                distribution[review.rating - 1]++;
            }
        });
        
        const total = reviews.length || 1;
        const distributionHtml = distribution.map((count, index) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
                <div class="rating-bar">
                    <span class="rating-label">${index + 1} star</span>
                    <div class="rating-progress">
                        <div class="rating-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="rating-count">${count}</span>
                </div>
            `;
        }).join('');
        
        distributionElement.innerHTML = distributionHtml;
    }

    /**
     * Display recent reviews (placeholder for future expansion)
     */
    displayRecentReviews() {
        // This could be expanded to show recent reviews in a dedicated section
        const recentReviewsElement = document.getElementById('recentReviews');
        if (!recentReviewsElement) return;
        
        const reviews = this.getStoredReviews().slice(-5).reverse(); // Last 5 reviews
        
        if (reviews.length === 0) {
            recentReviewsElement.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your feedback!</p>';
            return;
        }
        
        const reviewsHtml = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer-name">${this.uiManager.escapeHtml(review.name)}</span>
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <div class="review-feedback">
                    ${this.uiManager.escapeHtml(review.feedback)}
                </div>
                <div class="review-date">
                    ${new Date(review.timestamp).toLocaleDateString()}
                </div>
            </div>
        `).join('');
        
        recentReviewsElement.innerHTML = reviewsHtml;
    }

    /**
     * Add celebration animation after review submission
     */
    celebrateReviewSubmission() {
        // Create confetti effect
        if (typeof anime !== 'undefined') {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
            
            for (let i = 0; i < 20; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: 20%;
                    left: 50%;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                `;
                
                document.body.appendChild(confetti);
                
                anime({
                    targets: confetti,
                    translateX: () => anime.random(-200, 200),
                    translateY: () => anime.random(-100, 300),
                    rotate: () => anime.random(0, 360),
                    scale: [1, 0],
                    opacity: [1, 0],
                    duration: 2000,
                    easing: 'easeOutCubic',
                    complete: () => confetti.remove()
                });
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureManager;
}
