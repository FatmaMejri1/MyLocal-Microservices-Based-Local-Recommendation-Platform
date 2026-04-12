import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    GeoAltFill,
    TelephoneFill,
    StarFill,
    Star,
    Heart,
    HeartFill,
    Eye,
    BookmarkFill,
    ChatDots,
    Flag,
    Camera
} from 'react-bootstrap-icons';
import ReviewModal from '../../components/places/ReviewModal';
import ReportModal from '../../components/places/ReportModal';
import { getPlaceById } from '../../api/place.api';
import { getReviewsByPlace } from '../../api/review.api';
import { getPhotosByPlace } from '../../api/media.api';
import { addFavorite, removeFavorite, checkFavorite } from '../../api/favorite.api';
import './PlaceDetails.css';

const PlaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [user, setUser] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Static stats (as requested)
    const [stats] = useState({
        views: Math.floor(Math.random() * 500) + 50,
        saves: Math.floor(Math.random() * 100) + 10
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadPlaceDetails();
            loadReviews();
            loadPhotos();
        }
    }, [id]);

    useEffect(() => {
        if (user?.id && id) {
            checkIfFavorited();
        }
    }, [user, id]);

    const loadPlaceDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getPlaceById(id);
            setPlace(response.data);
        } catch (err) {
            console.error('Error loading place:', err);
            setError('Failed to load place details');
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            console.log('Loading reviews for place ID:', id);
            const response = await getReviewsByPlace(id);
            console.log('Reviews response:', response);
            const reviewsData = response.data || [];
            console.log('Reviews data:', reviewsData);
            setReviews(reviewsData);
        } catch (err) {
            console.error('Error loading reviews:', err);
            console.error('Error details:', err.response?.data);
            // Don't fail the whole page if reviews fail to load
            setReviews([]);
        }
    };

    const loadPhotos = async () => {
        try {
            console.log('Loading photos for place ID:', id);
            const response = await getPhotosByPlace(id);
            setPhotos(response.data || []);
        } catch (err) {
            console.error('Error loading photos:', err);
            setPhotos([]);
        }
    };

    const checkIfFavorited = async () => {
        try {
            const response = await checkFavorite(user.id, parseInt(id));
            setIsFavorite(response.data.isFavorited);
        } catch (err) {
            console.error('Error checking favorite:', err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('Please log in to save favorites');
            return;
        }

        const previousState = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            if (isFavorite) {
                await removeFavorite(user.id, parseInt(id));
            } else {
                await addFavorite(user.id, parseInt(id));
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            setIsFavorite(previousState);
            alert('Failed to update favorite');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="stars-display">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                        {star <= rating ? (
                            <StarFill size={18} color="#fbbf24" />
                        ) : (
                            <Star size={18} color="#d1d5db" />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="place-details-loading">
                <div className="spinner"></div>
                <p>Loading place details...</p>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="place-details-error">
                <p>{error || 'Place not found'}</p>
                <button onClick={() => navigate('/places')} className="btn-back">
                    Back to Places
                </button>
            </div>
        );
    }

    const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop';

    return (
        <div className="place-details-container">
            {/* Hero Section with Image */}
            <div className="place-hero">
                <button className="back-button" onClick={() => navigate('/places')}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <img
                    src={photos[0]?.url || place.imageUrl || place.image || defaultImage}
                    alt={place.name}
                    className="place-hero-image"
                />
                <div className="place-hero-overlay">
                    <div className="container">
                        <div className="hero-content">
                            <h1 className="place-title">{place.name}</h1>
                            <div className="hero-badges">
                                {place.category && (
                                    <span className="place-category-badge">{place.category}</span>
                                )}
                                {photos.length > 1 && (
                                    <span className="photo-count-badge">
                                        <Camera size={16} /> {photos.length} Photos
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="place-content">
                <div className="container">
                    <div className="place-grid">
                        {/* Left Column - Main Info */}
                        <div className="place-main">
                            {/* Stats Bar */}
                            <div className="stats-bar">
                                <div className="stat-item">
                                    <Eye size={20} />
                                    <span>{stats.views} views</span>
                                </div>
                                <div className="stat-item">
                                    <BookmarkFill size={20} />
                                    <span>{stats.saves} saves</span>
                                </div>
                                <div className="stat-item">
                                    <ChatDots size={20} />
                                    <span>{reviews.length} reviews</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="place-section">
                                <h2>About This Place</h2>
                                <p className="place-description">
                                    {place.description || 'No description available for this place.'}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="place-section">
                                <h2>Location</h2>
                                <div className="location-info">
                                    <GeoAltFill size={20} color="#3b82f6" />
                                    <div>
                                        <p className="location-address">
                                            {place.address || 'Address not available'}
                                        </p>
                                        {(place.latitude && place.longitude) && (
                                            <p className="location-coords">
                                                Coordinates: {place.latitude}, {place.longitude}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            {place.phone && (
                                <div className="place-section">
                                    <h2>Contact</h2>
                                    <div className="contact-info">
                                        <TelephoneFill size={18} color="#10b981" />
                                        <a href={`tel:${place.phone}`}>{place.phone}</a>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div className="place-section">
                                <div className="section-header">
                                    <h2>Reviews ({reviews.length})</h2>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setReviewModalOpen(true)}
                                    >
                                        Write a Review
                                    </button>
                                </div>

                                {reviews.length > 0 ? (
                                    <div className="reviews-preview">
                                        {reviews.slice(0, 3).map(review => (
                                            <div key={review.id} className="review-card">
                                                <div className="review-header">
                                                    {renderStars(review.rating)}
                                                    <span className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="review-text">{review.content}</p>
                                            </div>
                                        ))}
                                        {reviews.length > 3 && (
                                            <button
                                                className="btn-view-all"
                                                onClick={() => setReviewModalOpen(true)}
                                            >
                                                View All {reviews.length} Reviews
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="no-reviews">
                                        No reviews yet. Be the first to review this place!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Actions Sidebar */}
                        <div className="place-sidebar">
                            <div className="sidebar-card">
                                <h3>Actions</h3>

                                <button
                                    className={`action-button ${isFavorite ? 'favorited' : ''}`}
                                    onClick={handleToggleFavorite}
                                >
                                    {isFavorite ? (
                                        <>
                                            <HeartFill size={20} />
                                            <span>Saved</span>
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={20} />
                                            <span>Save Place</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    className="action-button"
                                    onClick={() => setReviewModalOpen(true)}
                                >
                                    <ChatDots size={20} />
                                    <span>Write Review</span>
                                </button>

                                <button
                                    className="action-button danger"
                                    onClick={() => setReportModalOpen(true)}
                                >
                                    <Flag size={20} />
                                    <span>Report Issue</span>
                                </button>
                            </div>

                            {/* Rating Summary */}
                            {place.averageRating && parseFloat(place.averageRating) > 0 && (
                                <div className="sidebar-card rating-summary">
                                    <h3>Rating</h3>
                                    <div className="rating-display">
                                        <span className="rating-number">
                                            {parseFloat(place.averageRating).toFixed(1)}
                                        </span>
                                        {renderStars(Math.round(parseFloat(place.averageRating)))}
                                    </div>
                                    <p className="rating-text">
                                        Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReviewModal
                show={reviewModalOpen}
                onClose={() => {
                    setReviewModalOpen(false);
                    loadReviews();
                }}
                place={place}
            />
            <ReportModal
                show={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                place={place}
            />
        </div>
    );
};

export default PlaceDetails;
