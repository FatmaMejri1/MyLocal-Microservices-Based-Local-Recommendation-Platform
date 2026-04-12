import api from './axiosConfig';

// Get all places
export const getPlaces = () => {
  return api.get('/places');
};

// Get place by ID
export const getPlaceById = (id) => {
  return api.get(`/places/${id}`);
};

// Create a new place
export const createPlace = (placeData) => {
  return api.post('/places', placeData);
};

// Update place
export const updatePlace = (id, placeData) => {
  return api.put(`/places/${id}`, placeData);
};

// Delete place
export const deletePlace = (id) => {
  return api.delete(`/places/${id}`);
};

// Search places
export const searchPlaces = (keyword) => {
  return api.get(`/places/search?q=${encodeURIComponent(keyword)}`);
};

export const getPlacesByCategory = (categoryId) => {
  return api.get(`/places/category/${categoryId}`);
};

// Get places by user
export const getPlacesByUser = (userId) => {
  return api.get(`/places/user/${userId}`);
};