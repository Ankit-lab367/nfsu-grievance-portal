'use client';

import { FaTimes } from 'react-icons/fa';

const statusColors = {
    Pending: 'badge-pending',
    'In Progress': 'badge-in-progress',
    Resolved: 'badge-resolved',
    Escalated: 'badge-escalated',
    Rejected: 'badge-rejected',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`badge ${statusColors[status] || 'badge-pending'}`}>
            {status}
        </span>
    );
}
