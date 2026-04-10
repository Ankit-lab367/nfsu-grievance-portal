'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import MatrixParticleBackground from '@/components/GodMode/MatrixParticleBackground';
import DataStream from '@/components/GodMode/DataStream';
export default function AcademicManager() {
    const router = useRouter();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [showIntro, setShowIntro] = useState(true);
    useEffect(() => {
        fetchResources();
        setTimeout(() => setShowIntro(false), 2000);
    }, []);
    const fetchResources = async () => {
        try {
            const response = await axios.get('/api/academic/get');
            if (response.data.success) {
                setResources(response.data.resources);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('EXECUTE DELETION PROTOCOL? This action is irreversible.')) return;
        setDeletingId(id);
        try {
            const response = await axios.delete(`/api/academic/delete?id=${id}`);
            if (response.data.success) {
                setResources(resources.filter(r => r._id !== id));
            } else {
                alert('Deletion failed.');
            }
        } catch (error) {
            console.error('Deletion error:', error);
            alert('Deletion failed.');
        } finally {
            setDeletingId(null);
        }
    };
    return (
        <div className="min-h-screen bg-black font-mono text-[#00ff00] p-6 relative overflow-hidden">
            {}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MatrixParticleBackground color="168, 85, 247" />
            </div>
            {}
            <div className="fixed top-0 left-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={2} color="#a855f7" />
            </div>
            <div className="fixed top-0 right-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={3} reverse color="#a855f7" />
            </div>
            <style jsx global>{`
                body {
                    background-color: black !important;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #001100;
                }
                ::-webkit-scrollbar-thumb {
                    background: #00ff00;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #00cc00;
                }
            `}</style>
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    >
                        <div className="text-2xl font-black tracking-[0.5em] animate-pulse">
                            RETRIEVING ACADEMIC RECORDS...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
            >
                {}
                <div className="flex items-center justify-between mb-8 border-b border-[#00ff00]/30 pb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/god-mode')}
                            className="p-2 hover:bg-[#00ff00]/20 rounded transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-[0.2em] text-[#00ff00]">ACADEMIC REPOSITORY</h1>
                            <p className="text-xs text-[#00ff00]/60 tracking-widest">GOD MODE ACCESS</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{resources.length}</p>
                        <p className="text-xs text-[#00ff00]/60">TOTAL FILES</p>
                    </div>
                </div>
                {}
                <div className="space-y-2">
                    {}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#00ff00]/50 tracking-wider uppercase border-b border-[#00ff00]/20">
                        <div className="col-span-1">Format</div>
                        <div className="col-span-4">Title / Subject</div>
                        <div className="col-span-2">Context</div>
                        <div className="col-span-2">Uploader</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>
                    {loading ? (
                        <div className="py-12 text-center text-[#00ff00]/50 animate-pulse">
                            SCANNING SECTORS...
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="py-12 text-center text-[#00ff00]/50">
                            NO ARTIFACTS FOUND IN DATABASE.
                        </div>
                    ) : (
                        resources.map((resource, i) => (
                            <motion.div
                                key={resource._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-[#00ff00]/5 hover:bg-[#00ff00]/10 border-l-2 border-transparent hover:border-[#00ff00] transition-all group"
                            >
                                <div className="col-span-1 text-2xl opacity-70">
                                    <FaFileAlt />
                                </div>
                                <div className="col-span-4">
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold hover:underline truncate block"
                                        title={resource.title}
                                    >
                                        {resource.title}
                                    </a>
                                </div>
                                <div className="col-span-2 text-sm opacity-80">
                                    <span className="bg-[#00ff00]/10 px-1 rounded mr-1">{resource.degree.toUpperCase()}</span>
                                    <span className="bg-[#00ff00]/10 px-1 rounded">S{resource.semester}</span>
                                    <div className="text-xs opacity-50 mt-1 uppercase">{resource.type}</div>
                                </div>
                                <div className="col-span-2 text-sm truncate" title={resource.uploadedBy?.name}>
                                    {resource.uploadedBy?.name || 'UNKNOWN'}
                                </div>
                                <div className="col-span-2 text-xs opacity-70">
                                    {new Date(resource.createdAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 text-right">
                                    <button
                                        onClick={() => handleDelete(resource._id)}
                                        disabled={deletingId === resource._id}
                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/20 p-2 rounded transition-colors disabled:opacity-50"
                                        title="DELETE PERMANENTLY"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}