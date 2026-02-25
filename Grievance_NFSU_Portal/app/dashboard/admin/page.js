'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaUserShield,
    FaTools,
    FaArrowLeft,
    FaChartPie,
    FaClipboardList,
    FaUsers,
    FaBell,
    FaComments,
    FaHistory,
    FaPlus,
    FaChartLine,
    FaCheckCircle,
    FaExclamationCircle,
    FaClock,
    FaCamera,
    FaTrash,
    FaDatabase,
    FaSpinner,
    FaUser,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';

export default function StaffDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [complaints, setComplaints] = useState([]);
    const [hasNotices, setHasNotices] = useState(false);
    const [loading, setLoading] = useState(true);

    // ── Face Dataset Management ──────────────────────────────────────────
    const [dataset, setDataset] = useState([]);
    const [dsLoading, setDsLoading] = useState(false);
    const [dsUploading, setDsUploading] = useState(false);
    const [dsMsg, setDsMsg] = useState({ type: '', text: '' });
    const [faceForm, setFaceForm] = useState({ name: '', image: null, preview: null });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin' && parsedUser.role !== 'super-admin' && parsedUser.role !== 'staff') {
            router.push('/dashboard/student');
            return;
        }

        setUser(parsedUser);
        fetchComplaints(token);
        checkNotices(token);
        fetchDataset();
    }, [router]);

    const checkNotices = async (token) => {
        try {
            const response = await axios.get('/api/notices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success && response.data.notices.length > 0) {
                setHasNotices(true);
            }
        } catch (error) {
            console.error('Error checking notices:', error);
        }
    };

    const fetchComplaints = async (token) => {
        try {
            const response = await axios.get('/api/complaints/get', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                // Filter out non-student (demo/staff) complaints
                const data = response.data.complaints.filter(c => c.userId?.role === 'student');
                setComplaints(data);

                // Calculate stats based on students complaints only
                setStats({
                    total: data.length,
                    pending: data.filter((c) => c.status === 'Pending').length,
                    inProgress: data.filter((c) => c.status === 'In Progress').length,
                    resolved: data.filter((c) => c.status === 'Resolved').length,
                });
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataset = async () => {
        setDsLoading(true);
        try {
            const res = await axios.get('/api/admin/face-dataset');
            setDataset(res.data.dataset || []);
        } catch {
            setDataset([]);
        } finally {
            setDsLoading(false);
        }
    };

    const handleFaceImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFaceForm(f => ({ ...f, image: file, preview: URL.createObjectURL(file) }));
    };

    const handleFaceUpload = async (e) => {
        e.preventDefault();
        if (!faceForm.name.trim() || !faceForm.image) {
            setDsMsg({ type: 'error', text: 'Name and photo are required.' });
            return;
        }
        setDsUploading(true);
        setDsMsg({ type: '', text: '' });
        try {
            const fd = new FormData();
            fd.append('name', faceForm.name.trim());
            fd.append('image', faceForm.image);
            const res = await axios.post('/api/admin/face-dataset', fd);
            if (res.data.success) {
                setDsMsg({ type: 'success', text: res.data.message });
                setFaceForm({ name: '', image: null, preview: null });
                fetchDataset();
            } else {
                setDsMsg({ type: 'error', text: res.data.error || 'Upload failed.' });
            }
        } catch (err) {
            setDsMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed. Check face server.' });
        } finally {
            setDsUploading(false);
        }
    };

    const handleDeletePerson = async (name) => {
        if (!confirm(`Remove "${name}" from the face dataset?`)) return;
        try {
            await axios.delete(`/api/admin/face-dataset?name=${encodeURIComponent(name)}`);
            setDsMsg({ type: 'success', text: `"${name}" removed from dataset.` });
            fetchDataset();
        } catch (err) {
            setDsMsg({ type: 'error', text: err.response?.data?.error || 'Delete failed.' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/background.jpeg)' }}
                />
                <div className="fixed inset-0 bg-black/50" />
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />
            <Navbar />

            <div className="container mx-auto px-6 py-8 relative z-10">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-500/20">
                                <FaUserShield className="text-xl" />
                            </div>
                            <span className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest text-xs">
                                Staff Portal
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Welcome back, {user?.name}! 👋
                        </h1>
                        <p className="text-slate-600 dark:text-gray-400 font-medium">
                            Role: {user?.role?.toUpperCase() === 'ADMIN' ? 'STAFF' : user?.role?.toUpperCase()}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/admin/notices"
                            className="relative flex items-center space-x-2 px-6 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95"
                        >
                            <FaClipboardList className="text-blue-500" />
                            <span>Notices</span>
                            {hasNotices && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/dashboard/admin/notices/create"
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                        >
                            <FaBell />
                            <span>Upload Notice</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Complaints', value: stats.total, icon: <FaClipboardList className="text-3xl" />, color: 'from-blue-500 to-blue-600' },
                        { title: 'Pending', value: stats.pending, icon: <FaClock className="text-3xl" />, color: 'from-yellow-500 to-yellow-600' },
                        { title: 'In Progress', value: stats.inProgress, icon: <FaExclamationCircle className="text-3xl" />, color: 'from-orange-500 to-orange-600' },
                        { title: 'Resolved', value: stats.resolved, icon: <FaCheckCircle className="text-3xl" />, color: 'from-green-500 to-green-600' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card-theme p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-lg text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/complaint/solve"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group border-slate-200 dark:border-white/10 shadow-lg text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaPlus className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Upload Solved Complaint</h3>
                                <p className="text-gray-400 text-sm">Post a resolution document</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/complaint/track"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaChartLine className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Track Complaint</h3>
                                <p className="text-gray-400 text-sm">Monitor system response</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/complaint/history"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group cursor-pointer border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaHistory className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-semibold text-lg">History</h3>
                                <p className="text-gray-400 text-sm">Review all records</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* ── Face ID Dataset Management ───────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card-theme p-6 mb-8 border border-slate-200 dark:border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg text-white shadow-lg">
                            <FaDatabase className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Face ID Dataset</h2>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">Add or remove persons used for face verification at login</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Upload Form */}
                        <form onSubmit={handleFaceUpload} className="space-y-4">
                            <h3 className="font-bold text-slate-700 dark:text-gray-200 flex items-center gap-2">
                                <FaCamera className="text-purple-500" /> Add Person to Dataset
                            </h3>

                            {dsMsg.text && (
                                <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${dsMsg.type === 'success'
                                        ? 'bg-green-500/10 border-green-500/40 text-green-500'
                                        : 'bg-red-500/10 border-red-500/40 text-red-400'
                                    }`}>
                                    {dsMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-600 dark:text-gray-300 text-sm font-semibold mb-1">Full Name *</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="text"
                                        value={faceForm.name}
                                        onChange={e => setFaceForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Hariom Singh (must match registration name)"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-600 dark:text-gray-300 text-sm font-semibold mb-1">Photo *</label>
                                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl cursor-pointer hover:border-purple-500 transition-all bg-slate-900/5 dark:bg-white/5 overflow-hidden relative">
                                    {faceForm.preview ? (
                                        <img src={faceForm.preview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <FaCamera className="text-3xl text-purple-400" />
                                            <span className="text-sm">Click to upload photo</span>
                                            <span className="text-xs">JPG, PNG, WEBP — clear face photo</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFaceImageChange} />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={dsUploading}
                                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {dsUploading ? <><FaSpinner className="animate-spin" /> Adding...</> : <><FaCamera /> Add to Dataset</>}
                            </button>
                        </form>

                        {/* Dataset List */}
                        <div>
                            <h3 className="font-bold text-slate-700 dark:text-gray-200 flex items-center gap-2 mb-4">
                                <FaUsers className="text-blue-500" /> Enrolled Persons ({dataset.length})
                            </h3>
                            {dsLoading ? (
                                <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-2xl text-purple-400" /></div>
                            ) : dataset.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 dark:text-gray-500">
                                    <FaDatabase className="text-4xl mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No persons in dataset yet.</p>
                                    <p className="text-xs mt-1">Add a person using the form.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {dataset.map((person) => (
                                        <div key={person.name}
                                            className="flex items-center justify-between px-4 py-3 bg-slate-900/5 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-purple-400/50 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {person.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-semibold text-sm">{person.name}</p>
                                                    <p className="text-slate-400 dark:text-gray-500 text-xs">{person.photos} photo{person.photos !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePerson(person.name)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove from dataset"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Recent Complaints */}
                <div className="glass-card-theme p-6 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Active Complaints</h2>

                    {complaints.filter(c => c.status !== 'Resolved').length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No complaints logged in the system yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.filter(c => c.status !== 'Resolved').slice(0, 5).map((complaint) => (
                                <div
                                    key={complaint._id}
                                    onClick={() => router.push(`/complaint/${complaint.complaintId}`)}
                                    className="block bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded-lg p-4 transition-all border border-slate-200 dark:border-white/10 hover:border-blue-400/50 cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-slate-900 dark:text-white font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg block mb-1">
                                                {complaint.title}
                                            </span>
                                            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-gray-400">
                                                <span>ID: {complaint.complaintId}</span>
                                                <span>•</span>
                                                <StatusBadge status={complaint.status} />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-400/10 text-green-500 rounded text-sm">
                                                <FaCheckCircle />
                                                <span className="font-bold">{complaint.votes?.upvotes || 0}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-2 py-1 bg-red-400/10 text-red-500 rounded text-sm">
                                                <FaExclamationCircle />
                                                <span className="font-bold">{complaint.votes?.downvotes || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <ChatbotWidget />
        </div>
    );
}
