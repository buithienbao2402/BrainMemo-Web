import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7045',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động gắn Access Token vào Header nếu đã đăng nhập
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;