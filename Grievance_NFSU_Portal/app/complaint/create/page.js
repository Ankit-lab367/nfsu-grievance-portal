'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaFileUpload, FaTimes, FaSpinner } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function CreateComplaintPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        category: '',
        priority: 'Medium',
        isAnonymous: false,
    });
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const departments = [
        'Academics',
        'Hostel',
        'IT',
        'Library',
        'Admin',
        'Finance',
        'Exam',
        'Security',
        'Others',
    ];

    const categories = {
        Academics: ['Course Content', 'Faculty Issue', 'Exam Related', 'Timetable', 'Other'],
        Hostel: ['Room Facilities', 'Food Quality', 'Maintenance', 'Security', 'Other'],
        IT: ['Internet/Wi-Fi', 'Lab Equipment', 'Software Access', 'Server Issues', 'Other'],
        Library: ['Book Availability', 'Study Space', 'Timings', 'Staff Behavior', 'Other'],
        Admin: ['Documentation', 'General Query', 'Process Delay', 'Other'],
        Finance: ['Fee Payment', 'Scholarship', 'Refund', 'Other'],
        Exam: ['Hall Ticket', 'Results', 'Revaluation', 'Other'],
        Security: ['Lost Items', 'Safety Concern', 'Access Issues', 'Other'],
        Others: ['General Complaint', 'Suggestion', 'Other'],
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
            // Reset category when department changes
            ...(name === 'department' && { category: '' }),
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                return new Promise(resolve => {
                    reader.onloadend = () => resolve({ url: reader.result, type: 'image', name: file.name });
                    reader.readAsDataURL(file);
                });
            }
            return Promise.resolve({ url: null, type: 'file', name: file.name });
        });

        Promise.all(newPreviews).then(resolved => {
            setPreviews(prev => [...prev, ...resolved]);
        });
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.department || !formData.title || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Create FormData for file upload
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('department', formData.department);
            data.append('category', formData.category);
            data.append('priority', formData.priority);
            data.append('isAnonymous', formData.isAnonymous);

            files.forEach((file) => {
                data.append('files', file);
            });

            const response = await axios.post('/api/complaints/create', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert(`Complaint registered successfully! Your Complaint ID is: ${response.data.complaint.complaintId}`);
                router.push('/dashboard/student');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Register New Complaint</h1>

                    <div className="glass-card-theme p-8 border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Department */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">
                                    Department <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="" className="bg-white dark:bg-slate-800">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept} className="bg-white dark:bg-slate-800">
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            {formData.department && (
                                <div>
                                    <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    >
                                        <option value="" className="bg-white dark:bg-slate-800">Select Category</option>
                                        {categories[formData.department]?.map((cat) => (
                                            <option key={cat} value={cat} className="bg-white dark:bg-slate-800">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">
                                    Complaint Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Brief summary of your complaint"
                                    className="w-full px-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    placeholder="Provide detailed information about your complaint..."
                                    className="w-full px-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all font-medium"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="Low" className="bg-white dark:bg-slate-800">Low</option>
                                    <option value="Medium" className="bg-white dark:bg-slate-800">Medium</option>
                                    <option value="High" className="bg-white dark:bg-slate-800">High</option>
                                    <option value="Critical" className="bg-white dark:bg-slate-800">Critical</option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">
                                    Attachments (Optional)
                                </label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all group cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        id="file-upload"
                                    />
                                    <div className="flex flex-col items-center">
                                        <FaFileUpload className="text-4xl text-slate-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform duration-200" />
                                        <p className="text-slate-600 dark:text-gray-300 font-bold uppercase tracking-wider text-sm">Click to upload or drag & drop</p>
                                        <p className="text-slate-400 dark:text-gray-500 text-xs mt-2 font-medium">PNG, JPG, PDF (max 5MB each)</p>
                                    </div>
                                </div>

                                {previews.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-4">
                                        {previews.map((preview, index) => (
                                            <div
                                                key={index}
                                                className="relative group w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center p-2"
                                            >
                                                {preview.type === 'image' ? (
                                                    <img
                                                        src={preview.url}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaFileUpload className="text-2xl text-blue-500 mb-1 mx-auto" />
                                                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold truncate block w-24 px-1">{preview.name}</span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Anonymous Option */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="isAnonymous"
                                    checked={formData.isAnonymous}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 bg-white/10 border-gray-300 rounded focus:ring-blue-500"
                                    id="anonymous"
                                />
                                <label htmlFor="anonymous" className="text-slate-700 dark:text-gray-300 font-medium cursor-pointer">
                                    Submit as anonymous complaint
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Complaint'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-8 py-3 bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-white rounded-lg font-bold hover:bg-slate-900/10 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
