import { useState, useEffect } from 'react';
import { X, Star, StarFill } from 'react-bootstrap-icons';
import { getReviewsByPlace, createReview } from '../../api/review.api';
import './ReviewModal.css';

const ReviewModal = ({ show, onClose, place }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newReview, setNewReview] = useState({ rating: 5, content: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (show && place) {
            loadReviews();
        }
    }, [show, place]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getReviewsByPlace(place.id);
            setReviews(response.data || []);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please log in to submit a review');
            return;
        }

        if (!newReview.content.trim() || newReview.content.length < 10) {
            setError('Review must be at least 10 characters long');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await createReview({
                content: newReview.content,
                rating: newReview.rating,
                userId: user.id,
                placeId: place.id
            });

            setNewReview({ rating: 5, content: '' });
            loadReviews();
            alert('Review submitted successfully!');
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={interactive ? 'star-interactive' : 'star'}
                        onClick={() => interactive && onRate && onRate(star)}
                    >
                        {star <= rating ? <StarFill color="#fbbf24" /> : <Star color="#d1d5db" />}
                    </span>
                ))}
            </div>
        );
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Reviews for {place?.name}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Add Review Form */}
                    {user ? (
                        <div className="review-form-section">
                            <h3>Write a Review</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Your Rating</label>
                                    {renderStars(newReview.rating, true, (rating) =>
                                        setNewReview(prev => ({ ...prev, rating }))
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Your Review</label>
                                    <textarea
                                        value={newReview.content}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Share your experience..."
                                        rows="4"
                                        required
                                        minLength="10"
                                    />
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="login-prompt">
                            <p>Please log in to write a review</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="reviews-list-section">
                        <h3>All Reviews ({reviews.length})</h3>
                        {loading ? (
                            <div className="loading">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        ) : (
                            <div className="reviews-list">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-header">
                                            {renderStars(review.rating)}
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="review-content">{review.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
