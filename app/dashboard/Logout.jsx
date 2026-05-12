"use client";

import React from 'react';
import axios from 'axios';
import { config } from '../../config';

const apiUrl = config.apiUrl;

const Logout = () => {
    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('type');
            window.location.href = '/login';
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.message) {
                localStorage.removeItem('token');
                localStorage.removeItem('type');
                alert('Logged out successfully');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;