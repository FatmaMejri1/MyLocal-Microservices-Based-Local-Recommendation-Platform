import api from './axiosConfig';

/**
 * Get all reviews
 */
export const getReviews = () => {
  return api.get('/reviews');
};

/**
 * Get review by ID
 */
export const getReviewById = (id) => {
  return api.get(`/reviews/${id}`);
};

/**
 * Create a new review
 */
export const createReview = (reviewData) => {
  return api.post('/reviews/', reviewData);
};

/**
 * Update review
 */
export const updateReview = (id, reviewData) => {
  return api.put(`/reviews/${id}`, reviewData);
};

/**
 * Delete review
 */
export const deleteReview = (id) => {
  return api.delete(`/reviews/${id}`);
};

/**
 * Get reviews by place ID
 */
export const getReviewsByPlace = (placeId) => {
  return api.get(`/reviews/place/${placeId}`);
};

/**
 * Get reviews by user ID
 */
export const getReviewsByUser = (userId) => {
  return api.get(`/reviews/user/${userId}`);
};

/**
 * Get average rating for a place
 */
export const getAverageRating = (placeId) => {
  return api.get(`/reviews/place/${placeId}/average-rating`);
};

/**
 * Report a review
 */
export const reportReview = (id, reportData) => {
  return api.post(`/reviews/${id}/report`, reportData);
};

