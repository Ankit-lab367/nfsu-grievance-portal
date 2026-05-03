'use client';
import { motion } from 'framer-motion';
import { FaLock, FaShieldAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export default function VerificationGuard({ children, user }) {
    if (user && user.role === 'student' && !user.isVerifiedID) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-card-theme p-10 text-center border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.1)]"
                >
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center animate-pulse">
                            <FaLock className="text-4xl text-red-500" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border-2 border-red-500/30">
                            <FaShieldAlt className="text-red-400 text-sm" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Need to be Verified</h2>
                    <p className="text-gray-400 mb-8 font-medium">
                        Your account is currently pending administrator verification. Please wait while we review your submitted ID.
                    </p>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center space-x-4 text-left">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FaClock className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Status: Pending Review</p>
                            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Verification Step 2/2</p>
                        </div>
                    </div>

                    <Link 
                        href="/dashboard/student"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-600/30 transition-all active:scale-95"
                    >
                        Back to Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    return children;
}
