import axios from 'axios';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // API expects token in query string for most GET requests, 
        // but checks for it in Form Data or Query for POST. 
        // Safest is to append to params.
        config.params = { ...config.params, token };
    }
    return config;
});

// Response interceptor to handle session expiry
apiClient.interceptors.response.use(
    (response) => {
        // The legacy API might return 200 OK even for errors, with a "status" field in JSON.
        // We need to check response.data.status or specific fields.
        if (response.data?.status === 'invalid-token') {
            localStorage.removeItem('token');
            window.location.href = '/console/login';
            return Promise.reject(new Error('Session expired'));
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/console/login';
        }
        return Promise.reject(error);
    }
);

export interface ApiResponse<T> {
    status: 'ok' | 'error' | 'invalid-token' | '2fa-required';
    response: T;
    token?: string;
    errorMessage?: string;
    stackTrace?: string;
}
