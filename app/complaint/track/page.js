'use client';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';
export default function TrackComplaintPage() {
    const [complaintId, setComplaintId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!complaintId.trim()) return;
        setLoading(true);
        setError('');
        setComplaint(null);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`/api/complaints/${complaintId}`, { headers });
            if (response.data.success) {
                setComplaint(response.data.complaint);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Complaint not found. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold dark:text-white mb-8">Track Your Complaint</h1>
                    {}
                    <div className="glass-card-theme p-8 mb-8 border-white/10 shadow-xl relative overflow-hidden">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block dark:text-gray-300 mb-2 font-bold text-sm">
                                    Enter Complaint ID
                                </label>
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={complaintId}
                                        onChange={(e) => setComplaintId(e.target.value)}
                                        placeholder="NFSU-XXXXXXXXX-XXXX"
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-600/50 transition-all disabled:opacity-50 flex items-center"
                                    >
                                        {loading ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <>
                                                <FaSearch className="mr-2" />
                                                Search
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                        {error && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                    {}
                    {complaint && (
                        <div className="space-y-6">
                            {}
                            <div className="glass-card-theme p-6 border-white/10 shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold dark:text-white mb-2">{complaint.title}</h2>
                                        <p className="text-gray-400">ID: {complaint.complaintId}</p>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm">Department</p>
                                        <p className="text-white font-medium">{complaint.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm">Priority</p>
                                        <p className="text-white font-medium">
                                            <span className={`badge badge-${complaint.priority.toLowerCase()}`}>
                                                {complaint.priority}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm">Submitted</p>
                                        <p className="text-white font-medium">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {}
                            <div className="glass-card-theme p-6 border-white/10 shadow-lg">
                                <h3 className="text-xl font-bold dark:text-white mb-4">Description</h3>
                                <p className="dark:text-gray-300 leading-relaxed">{complaint.description}</p>
                                {complaint.attachments && complaint.attachments.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-gray-400 text-sm mb-2">Attachments:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {complaint.attachments.map((file, index) => (
                                                <a
                                                    key={index}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                                                >
                                                    📎 {file.filename}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {}
                            <div className="glass-card-theme p-6 border-white/10 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-6">Timeline</h3>
                                <div className="space-y-6">
                                    {complaint.timeline?.map((entry, index) => (
                                        <div key={index} className="relative pl-8 timeline-item">
                                            <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-r from-red-600 to-rose-800 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-slate-900">
                                                {index + 1}
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <StatusBadge status={entry.status} />
                                                    <span className="text-gray-400 text-sm">
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                {entry.remarks && (
                                                    <p className="text-gray-300 text-sm mt-2">{entry.remarks}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {}
                            {complaint.status === 'Resolved' && complaint.resolutionDetails && (
                                <div className="glass-card-theme p-6 border-white/10 shadow-lg border-2 border-green-500/50">
                                    <h3 className="text-xl font-bold text-green-400 mb-4">✅ Resolution Details</h3>
                                    <p className="text-gray-300 mb-4">{complaint.resolutionDetails.description}</p>
                                    {complaint.resolutionDetails.proof && complaint.resolutionDetails.proof.length > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-sm mb-2">Proof of Resolution:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {complaint.resolutionDetails.proof.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 text-sm transition-colors"
                                                    >
                                                        📄 {file.filename}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-gray-400 text-sm">
                                            Resolved on: {new Date(complaint.resolutionDetails.resolvedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {}
                            <div className="flex justify-center">
                                <Link
                                    href="/dashboard/student"
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                                >
                                    ← Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                    {}
                    {!complaint && !loading && !error && (
                        <div className="glass-card-dark p-12 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl text-white font-semibold mb-2">Enter Your Complaint ID</h3>
                            <p className="text-gray-400">
                                Track your complaint status and view the complete timeline
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}