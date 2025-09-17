
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import HeroImage from '../components/HeroImage';
import { EmailIcon, LockIcon, GoogleIcon } from '../components/Icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        // Simulate login delay for testing
        setTimeout(() => {
            setLoading(false);
            navigate('/home');
        }, 1000);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        
        // Simulate Google login delay for testing
        setTimeout(() => {
            setLoading(false);
            navigate('/home');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Left side - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2">
                <HeroImage />
            </div>
            
            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile hero section */}
                    <div className="lg:hidden mb-10 text-center">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
                            CookList
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">Organize your recipes, plan your meals</p>
                    </div>
                    
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back</h2>
                        <p className="text-gray-600 text-lg">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AuthInput
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={EmailIcon}
                            error={errors.email}
                            required
                        />

                        <AuthInput
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={LockIcon}
                            error={errors.password}
                            required
                        />

                        {errors.submit && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                                {errors.submit}
                            </div>
                        )}

                        <AuthButton 
                            type="submit" 
                            disabled={loading}
                            icon={EmailIcon}
                        >
                            {loading ? 'Signing in...' : 'Sign in with Email'}
                        </AuthButton>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 text-gray-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <AuthButton 
                            type="button" 
                            variant="google"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            icon={GoogleIcon}
                        >
                            Sign in with Google
                        </AuthButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 underline decoration-2 underline-offset-2"
                            >
                                Join now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;