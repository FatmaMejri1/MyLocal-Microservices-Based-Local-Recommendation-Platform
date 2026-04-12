// src/components/common/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { HeartFill, Heart } from 'react-bootstrap-icons';
import { toggleFavorite, checkFavorite } from '../../api/favorite.api';
import './FavoriteButton.css';

const FavoriteButton = ({ placeId, size = 24, className = '' }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);

            // Check if already favorited
            if (userData.id) {
                checkIfFavorited(userData.id);
            }
        }
    }, [placeId]);

    const checkIfFavorited = async (userId) => {
        try {
            const response = await checkFavorite(userId, placeId);
            setIsFavorited(response.data.isFavorited);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault(); // Prevent navigation if inside a link
        e.stopPropagation(); // Prevent event bubbling

        if (!user || !user.id) {
            alert('Please login to save favorites');
            return;
        }

        setLoading(true);
        try {
            const result = await toggleFavorite(user.id, placeId);
            setIsFavorited(result.isFavorited);

            // Dispatch custom event to update profile if it's open
            window.dispatchEvent(new CustomEvent('favoritesChanged'));

        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorite. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`favorite-button ${isFavorited ? 'favorited' : ''} ${className}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            {loading ? (
                <span className="favorite-loading">...</span>
            ) : isFavorited ? (
                <HeartFill size={size} className="favorite-icon favorited" />
            ) : (
                <Heart size={size} className="favorite-icon" />
            )}
        </button>
    );
};

export default FavoriteButton;
