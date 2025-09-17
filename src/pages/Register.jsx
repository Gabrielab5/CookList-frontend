import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import HeroImage from '../components/HeroImage';
import { EmailIcon, LockIcon, GoogleIcon, UserIcon } from '../components/Icons';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        // Simulate registration delay for testing
        setTimeout(() => {
            setLoading(false);
            navigate('/home');
        }, 1000);
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        
        // Simulate Google signup delay for testing
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
            
            {/* Right side - Register Form */}
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
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Create account</h2>
                        <p className="text-gray-600 text-lg">Join CookList and start organizing your recipes</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <AuthInput
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            icon={UserIcon}
                            error={errors.name}
                            required
                        />

                        <AuthInput
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            icon={EmailIcon}
                            error={errors.email}
                            required
                        />

                        <AuthInput
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            icon={LockIcon}
                            error={errors.password}
                            required
                        />

                        <AuthInput
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            icon={LockIcon}
                            error={errors.confirmPassword}
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
                            icon={UserIcon}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
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
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            icon={GoogleIcon}
                        >
                            Sign up with Google
                        </AuthButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 underline decoration-2 underline-offset-2"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;