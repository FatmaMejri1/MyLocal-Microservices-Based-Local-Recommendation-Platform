// src/api/user.api.js
import axios from 'axios';

const API_BASE_URL = '/api/users'; // Vite proxy will forward to localhost:8001

/**
 * Get all users
 */
export const getUsers = async () => {
    return axios.get(`${API_BASE_URL}`);
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
    return axios.get(`${API_BASE_URL}/${id}`);
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
    return axios.post(`${API_BASE_URL}`, userData);
};

/**
 * Update user
 */
export const updateUser = async (id, userData) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    const url = `${API_BASE_URL}/${id}`;
    console.log('API Call: PUT', url, userData);
    
    try {
        const response = await axios.put(url, userData);
        return response;
    } catch (error) {
        console.error('Update user error:', {
            url,
            id,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
    return axios.delete(`${API_BASE_URL}/${id}`);
};

/**
 * Register a new user (alias for createUser with specific registration data)
 */
export const registerUser = async (userData) => {
    return axios.post(`${API_BASE_URL}`, userData);
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
    return axios.post(`${API_BASE_URL}/login`, { email, password });
};
