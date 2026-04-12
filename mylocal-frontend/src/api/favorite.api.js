import api from './axiosConfig';

export const getUserFavorites = async (userId) => {
    return api.get(`/favorites/user/${userId}`);
};

export const addFavorite = async (userId, placeId) => {
    return api.post('/favorites/', { userId, placeId });
};

export const removeFavorite = async (userId, placeId) => {
    return api.delete(`/favorites/user/${userId}/place/${placeId}`);
};

export const checkFavorite = async (userId, placeId) => {
    return api.get(`/favorites/user/${userId}/place/${placeId}/check`);
};

export const toggleFavorite = async (userId, placeId) => {
    try {
        const checkResult = await checkFavorite(userId, placeId);
        const isFavorited = checkResult.data.isFavorited;
        if (isFavorited) {
            await removeFavorite(userId, placeId);
            return { isFavorited: false };
        } else {
            await addFavorite(userId, placeId);
            return { isFavorited: true };
        }
    } catch (error) {
        throw error;
    }
};
