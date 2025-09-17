import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Simply navigate back to login for testing
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-gray-800">Welcome to the Dashboard!</h1>
                <p className="text-lg text-gray-600">You are successfully logged in.</p>
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;