import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:7045', // Cổng HTTPS của backend .NET
                changeOrigin: true,
                secure: false, // Bỏ qua kiểm tra chứng chỉ SSL tự ký
            },
            '/uploads': {
                target: 'https://localhost:7045', // Chuyển tiếp file tĩnh ảnh/video
                changeOrigin: true,
                secure: false,
            },
        },
    },
});