"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { config } from '../../config';

const apiUrl = config.apiUrl;

const Register = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        type: 'user' // Add default user type
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear errors when user types
        if (errors[e.target.name]) {
            setErrors({...errors, [e.target.name]: null});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Frontend validation
        if (formData.password !== formData.password_confirmation) {
            setErrors({password_confirmation: 'Passwords do not match'});
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/users`, formData);
            
            if (response.status === 201) {
                alert("Registration successful! Please login.");
                router.push('/login');
            }
        } catch (error) {
            if (error.response) {
                // Backend validation errors
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors || {});
                    alert("Please fix the form errors");
                } else {
                    alert(error.response.data.message || "Registration failed");
                }
            } else {
                alert("Network error. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email*</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Password*</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                            required
                            minLength="6"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Confirm Password*</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${
                                errors.password_confirmation ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p>Already have an account?</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;