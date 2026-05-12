"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { config } from '../../config';

const apiUrl = config.apiUrl;

const Login = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isEmailUser = (email) => {
        // ইমেইল ভ্যালিডেশন - সাধারণ ইমেইল ফরম্যাট চেক
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(
                `${apiUrl}/login`, 
                formData,
                { headers: { "Content-Type": "application/json" } }
            );
    
            const token = response.data.remember_token;
            const type = response.data.type;
            localStorage.setItem('token', token);
            localStorage.setItem('type', type);
    
            if (type === 'admin') {
                router.push('/dashboard');
            } else if (type === 'moderator') {
                router.push('/dashboard');
            } else if (type === 'user') {
                // চেক করি ইউজার ইমেইল দিয়ে লগইন করছে কিনা
                if (isEmailUser(formData.email)) {
                    alert("Your account is not approved yet. Please wait for admin approval.");
                } else {
                    router.push('/');
                }
            } else {
                alert("Your account is not approved yet. Please wait for admin approval."); 
            }
            
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email or Phone</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p>Don't have an account?</p>
                    <button
                        onClick={() => router.push('/register')}
                        className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;