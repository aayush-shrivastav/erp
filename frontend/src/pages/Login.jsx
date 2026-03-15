import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            // Store token and user data
            localStorage.setItem('token', response.data.token);
            login(response.data.user);

            setLoading(false);
            const userRole = response.data.user.role;
            // Navigate based on backend role enum values
            if (userRole === 'STUDENT') {
                navigate('/student/dashboard');
            } else if (userRole === 'FACULTY') {
                navigate('/faculty/dashboard');
            } else if (userRole === 'ACCOUNTS_ADMIN' || userRole === 'ACCOUNTANT') {
                navigate('/accountant/dashboard');
            } else if (
                userRole === 'ADMIN' ||
                userRole === 'SUPER_ADMIN' ||
                userRole === 'ACADEMIC_ADMIN'
            ) {
                navigate('/admin/dashboard');
            } else {
                // Fallback: let DashboardRedirect handle unknown roles
                navigate('/');
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Abstract Background Design */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-400/20 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-3xl" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary-600">
                    < Landmark className="w-16 h-16 drop-shadow-md" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to EduERP
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Sign in to access your administrative dashboard
                </p>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/40">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl px-4 py-3 bg-white/50 border transition-all"
                                    placeholder="admin@eduerp.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl px-4 py-3 bg-white/50 border transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm text-center font-medium text-slate-600 mb-4">Quick Access Credentials</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <button type="button" onClick={() => { setEmail('admin@eduerp.com'); setPassword('admin123'); }} className="p-2 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors flex flex-col items-center text-center">
                                <span className="font-bold text-slate-800">Admin</span>
                                <span className="text-slate-500">admin@eduerp.com</span>
                            </button>
                            <button type="button" onClick={() => { setEmail('accountant@test.com'); setPassword('pass123'); }} className="p-2 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors flex flex-col items-center text-center">
                                <span className="font-bold text-slate-800">Accountant</span>
                                <span className="text-slate-500">accountant@test.com</span>
                            </button>
                            <button type="button" onClick={() => { setEmail('teacher@test.com'); setPassword('pass123'); }} className="p-2 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors flex flex-col items-center text-center">
                                <span className="font-bold text-slate-800">Teacher</span>
                                <span className="text-slate-500">teacher@test.com</span>
                            </button>
                            <button type="button" onClick={() => { setEmail('student@test.com'); setPassword('pass123'); }} className="p-2 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors flex flex-col items-center text-center">
                                <span className="font-bold text-slate-800">Student</span>
                                <span className="text-slate-500">student@test.com</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
