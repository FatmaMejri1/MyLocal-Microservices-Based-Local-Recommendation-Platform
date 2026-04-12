import { Heart, HeartFill, Star, StarFill, ChatDots, Flag } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import './PlaceCard.css';

const PlaceCard = ({ place, isFavorite, onToggleFavorite, onOpenReviews, onOpenReport }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';

    return (
        <div className="place-card">
            <Link to={`/places/${place.id}`} className="place-card-image-wrapper">
                <img
                    src={place.imageUrl || place.image || defaultImage}
                    alt={place.name}
                    className="place-card-image"
                />
                <button
                    className="place-card-favorite-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(place.id);
                    }}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorite ? (
                        <HeartFill size={20} color="#ef4444" />
                    ) : (
                        <Heart size={20} color="#ffffff" />
                    )}
                </button>
            </Link>

            <div className="place-card-content">
                <Link to={`/places/${place.id}`} className="place-card-link">
                    <div className="place-card-header">
                        <h3 className="place-card-title">{place.name}</h3>
                        {place.rating > 0 && (
                            <div className="place-card-rating">
                                <StarFill size={14} color="#fbbf24" />
                                <span>{place.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {place.category && (
                        <p className="place-card-category">{place.category}</p>
                    )}

                    {place.address && (
                        <p className="place-card-address">{place.address}</p>
                    )}

                    {place.description && (
                        <p className="place-card-description">
                            {place.description.length > 100
                                ? `${place.description.substring(0, 100)}...`
                                : place.description}
                        </p>
                    )}
                </Link>

                <div className="place-card-actions">
                    <button
                        className="place-card-action-btn primary"
                        onClick={(e) => {
                            e.preventDefault();
                            onOpenReviews(place);
                        }}
                    >
                        <ChatDots size={16} />
                        <span>Reviews</span>
                    </button>
                    <button
                        className="place-card-action-btn secondary"
                        onClick={() => onOpenReport(place)}
                    >
                        <Flag size={16} />
                        <span>Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceCard;