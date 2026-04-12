import axios from 'axios';
import api from './axiosConfig';

/**
 * Get all photos
 */
export const getPhotos = () => {
  return axios.get('http://localhost:8003/api/photos');
};

/**
 * Get photo by ID
 */
export const getPhotoById = (id) => {
  return api.get(`/photos/${id}`);
};

/**
 * Get photos by place ID
 */
export const getPhotosByPlace = (placeId) => {
  return api.get(`/photos/place/${placeId}`);
};

/*
 * Create/Upload a new photo
 * Handles both JSON data (for URL-based) and FormData (for file uploads)
 */
export const uploadPhoto = (photoData) => {
  const isFormData = photoData instanceof FormData;

  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  } else {
    // Explicitly unset Content-Type so Axios lets the browser set it with the boundary
    // This overrides the 'application/json' default from axiosConfig.js
    headers['Content-Type'] = undefined;
  }

  return axios.post('http://localhost:8003/api/photos', photoData, {
    headers
  });
};

/**
 * Update photo
 */
export const updatePhoto = (id, photoData) => {
  return axios.put(`http://localhost:8003/api/photos/${id}`, photoData);
};

/**
 * Delete photo
 */
export const deletePhoto = (id) => {
  return axios.delete(`http://localhost:8003/api/photos/${id}`);
};

// Alias for backward compatibility
export const uploadMedia = uploadPhoto;
