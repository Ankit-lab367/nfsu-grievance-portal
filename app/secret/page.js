'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
export default function SecretPage() {
    const [code, setCode] = useState('');
    const router = useRouter();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/god-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: code })
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/dashboard/super-admin');
            } else {
                alert('Invalid secret code');
                setCode('');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to verify identity');
        }
    };
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-2xl border border-white/20 bg-zinc-900/50 backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
                    <p className="text-gray-400 text-sm">Enter the secret code to proceed</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter secret code..."
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-center tracking-widest"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Verify Identity
                    </button>
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
                        >
                            Return to safety
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}