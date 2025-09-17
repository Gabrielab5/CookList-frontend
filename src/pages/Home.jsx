import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthButton from '../components/AuthButton';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Simply navigate back to login for testing
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-orange-600">CookList</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, {auth.currentUser?.displayName || auth.currentUser?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Welcome to CookList!
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Your authentication is working perfectly. This is your dashboard where you can start organizing your recipes and meal plans.
                    </p>
                    
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Authentication Success! 🎉
                        </h3>
                        <p className="text-gray-600 mb-6">
                            You have successfully logged in to CookList. The authentication system is working correctly with:
                        </p>
                        <ul className="text-left space-y-2 text-gray-600 mb-6">
                            <li>✅ Email/Password authentication</li>
                            <li>✅ Google OAuth integration</li>
                            <li>✅ Form validation</li>
                            <li>✅ Responsive design</li>
                            <li>✅ Protected routes</li>
                        </ul>
                        
                        <div className="flex gap-4 justify-center">
                            <AuthButton
                                onClick={() => navigate('/dashboard')}
                                variant="secondary"
                            >
                                Go to Dashboard
                            </AuthButton>
                            <AuthButton
                                onClick={handleLogout}
                                variant="primary"
                            >
                                Sign Out
                            </AuthButton>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
