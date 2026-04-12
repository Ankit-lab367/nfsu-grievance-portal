import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DirectMessage from '@/models/DirectMessage';
import ChatGroup from '@/models/ChatGroup';
import GroupMessage from '@/models/GroupMessage';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(req) {
    try {
        const token = extractToken(req.headers.get('Authorization'));
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
        }

        await dbConnect();

        // Count unread messages where the current user is the receiver
        const totalUnread = await DirectMessage.countDocuments({
            receiver: decoded.id,
            isRead: false,
        });

        // Get list of distinct senders who have unread messages for the current user
        const unreadPublishers = await DirectMessage.distinct('sender', {
            receiver: decoded.id,
            isRead: false,
        });
        
        // --- Group Unread Logic ---
        const userGroups = await ChatGroup.find({ members: decoded.id }).lean();
        const unreadGroupIds = [];
        
        for (const group of userGroups) {
            const memberStatus = group.lastSeen?.find(ls => ls.user.toString() === decoded.id);
            const lastSeenTime = memberStatus ? memberStatus.timestamp : new Date(0);
            
            // Check if there are any messages in this group created after lastSeenTime
            // (Exclude messages sent by the user themselves)
            const hasUnread = await GroupMessage.exists({
                groupId: group._id,
                sender: { $ne: decoded.id },
                createdAt: { $gt: lastSeenTime }
            });
            
            if (hasUnread) {
                unreadGroupIds.push(group._id);
            }
        }

        return NextResponse.json({ 
            success: true, 
            count: totalUnread + unreadGroupIds.length, 
            unreadSenders: unreadPublishers,
            unreadGroups: unreadGroupIds 
        });
    } catch (err) {
        console.error('Fetch unread messages error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch unread count' }, { status: 500 });
    }
}
