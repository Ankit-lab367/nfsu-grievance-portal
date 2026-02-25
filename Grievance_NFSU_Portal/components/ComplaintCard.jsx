import StatusBadge from './StatusBadge';
import Link from 'next/link';
import { FaEye, FaClock } from 'react-icons/fa';

export default function ComplaintCard({ complaint }) {
    const priorityColors = {
        Critical: 'border-l-red-500',
        High: 'border-l-orange-500',
        Medium: 'border-l-yellow-500',
        Low: 'border-l-blue-500',
    };

    const getDaysAgo = (date) => {
        const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <div
            className={`bg-white/5 border-l-4 ${priorityColors[complaint.priority]
                } rounded-lg p-5 hover:bg-white/10 transition-all border border-white/10 hover:border-blue-400/50`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-semibold text-lg hover:text-blue-400 transition-colors">
                            {complaint.title}
                        </h3>
                        <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{complaint.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {getDaysAgo(complaint.createdAt)}
                    </span>
                    <span className={`badge badge-${complaint.priority.toLowerCase()}`}>
                        {complaint.priority}
                    </span>
                    <span>{complaint.department}</span>
                </div>

                <Link
                    href={`/complaint/${complaint.complaintId}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                    <FaEye />
                    <span>View</span>
                </Link>
            </div>
        </div>
    );
}
