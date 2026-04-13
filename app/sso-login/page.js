'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSpinner, FaLock } from 'react-icons/fa';

function SSOLoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');

    useEffect(() => {
        const verifySSO = async () => {
            if (!code) {
                console.error('No SSO code found in URL');
                router.push('/login');
                return;
            }

            try {
                // Task 1: POST request to /api/auth/forensync with the code
                const response = await axios.post('/api/auth/forensync', { code });

                if (response.data.success) {
                    const { token, user } = response.data;

                    // Save token as requested: grievance_token
                    localStorage.setItem('grievance_token', token);
                    
                    // Also save as standard 'token' and 'user' for app compatibility
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Task 1: Redirect to /dashboard
                    // Note: We use dynamic redirect based on role for better UX
                    const role = user.role;
                    if (role === 'student') {
                        router.push('/dashboard/student');
                    } else if (role === 'admin' || role === 'staff') {
                        router.push('/dashboard/admin');
                    } else if (role === 'super-admin') {
                        router.push('/dashboard/super-admin');
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    throw new Error(response.data.error || 'SSO Verification failed');
                }
            } catch (err) {
                console.error('SSO Login Error:', err.message);
                alert('SSO Verification Failed. Please log in manually.');
                router.push('/login');
            }
        };

        verifySSO();
    }, [code, router]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
            >
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full border-t-4 border-red-600 animate-spin absolute inset-0 mb-8" />
                    <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center mb-8">
                        <FaLock className="text-3xl text-red-500" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                        Verifying Your <span className="text-red-600">ForenSync</span> Account
                    </h1>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">
                        Please wait... Establishing Secure Connection
                    </p>
                </div>

                <div className="w-64 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-red-600 shadow-[0_0_15px_rgba(225,29,72,0.8)]"
                    />
                </div>
            </motion.div>
        </div>
    );
}

export default function SSOLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold uppercase tracking-widest">
                Loading...
            </div>
        }>
            <SSOLoginContent />
        </Suspense>
    );
}
