'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
export default function CreateNoticeForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: 'student', 
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/notices', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                alert('Notice created successfully!');
                router.push('/dashboard/admin/notices'); 
            }
        } catch (error) {
            console.error('Error creating notice:', error);
            alert(error.response?.data?.message || 'Failed to create notice');
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-gray-300 mb-2 font-medium">Subject</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter notice subject..."
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2 font-medium">Target Audience</label>
                <div className="grid grid-cols-3 gap-4">
                    {['student', 'staff', 'both'].map((option) => (
                        <label
                            key={option}
                            className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${formData.targetAudience === option
                                    ? 'bg-red-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <input
                                type="radio"
                                name="targetAudience"
                                value={option}
                                checked={formData.targetAudience === option}
                                onChange={handleChange}
                                className="hidden"
                            />
                            <span className="capitalize font-semibold">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Enter detailed notice content..."
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                <span>Publish Notice</span>
            </button>
        </form>
    );
}