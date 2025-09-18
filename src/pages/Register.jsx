import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import HeroImage from '../components/HeroImage';
import { EmailIcon, LockIcon, GoogleIcon, UserIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { register, loginWithGoogle, error: authError, clearError } = useAuth();
    const { handleApiCall, loading } = useApi();

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
            newErrors.name = 'שם נדרש';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'השם חייב להכיל לפחות 2 תווים';
        }
        
        if (!formData.email) {
            newErrors.email = 'כתובת אימייל נדרשת';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'אנא הזן כתובת אימייל תקינה';
        }
        
        if (!formData.password) {
            newErrors.password = 'סיסמה נדרשת';
        } else if (formData.password.length < 6) {
            newErrors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'הסיסמה חייבת להכיל לפחות אות גדולה אחת, אות קטנה אחת וספרה אחת';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'אנא אשר את הסיסמה שלך';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        // Clear previous errors
        setErrors({});
        clearError();
        
        try {
            await handleApiCall(async () => {
                await register(formData.email, formData.password, formData.name);
                navigate('/home');
            });
        } catch (error) {
            // Set specific field errors based on error type
            if (error.message.includes('אימייל')) {
                setErrors({ email: error.message });
            } else if (error.message.includes('סיסמה')) {
                setErrors({ password: error.message });
            } else if (error.message.includes('שם')) {
                setErrors({ name: error.message });
            } else {
                setErrors({ general: error.message });
            }
        }
    };

    const handleGoogleSignup = async () => {
        // Clear previous errors
        setErrors({});
        clearError();
        
        try {
            await handleApiCall(async () => {
                await loginWithGoogle();
                navigate('/home');
            });
        } catch (error) {
            setErrors({ general: error.message });
        }
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
                        <p className="text-gray-600 text-lg font-medium">ארגן את המתכונים שלך, תכנן את הארוחות שלך</p>
                    </div>
                    
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">צור חשבון</h2>
                        <p className="text-gray-600 text-lg">הצטרף ל-CookList והתחל לארגן את המתכונים שלך</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <AuthInput
                            type="text"
                            placeholder="הזן את השם המלא שלך"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            icon={UserIcon}
                            error={errors.name}
                            required
                        />

                        <AuthInput
                            type="email"
                            placeholder="הזן את כתובת האימייל שלך"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            icon={EmailIcon}
                            error={errors.email}
                            required
                        />

                        <AuthInput
                            type="password"
                            placeholder="צור סיסמה"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            icon={LockIcon}
                            error={errors.password}
                            required
                        />

                        <AuthInput
                            type="password"
                            placeholder="אשר את הסיסמה שלך"
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

                        {errors.general && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                                {errors.general}
                            </div>
                        )}

                        <AuthButton 
                            type="submit" 
                            disabled={loading}
                            icon={UserIcon}
                        >
                            {loading ? 'יוצר חשבון...' : 'צור חשבון'}
                        </AuthButton>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 text-gray-500 font-medium">או המשך עם</span>
                            </div>
                        </div>

                        <AuthButton 
                            type="button" 
                            variant="google"
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            icon={GoogleIcon}
                        >
                            הירשם עם Google
                        </AuthButton>

                        {/* Display Firebase auth errors */}
                        {authError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm text-center">{authError}</p>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            כבר יש לך חשבון?{' '}
                            <Link 
                                to="/login" 
                                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200 underline decoration-2 underline-offset-2"
                            >
                                התחבר
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;