import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';
export async function POST(request) {
    try {
        await dbConnect();
        const token = extractToken(request.headers.get('authorization'));
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const { complaintId, voteType } = await request.json();
        if (!complaintId || !['up', 'down'].includes(voteType)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }
        if (!complaint.votes) {
            complaint.votes = { upvotes: 0, downvotes: 0, votedBy: [] };
        }
        const existingVoteIndex = complaint.votes.votedBy.findIndex(
            (v) => v.userId.toString() === decoded.id
        );
        if (existingVoteIndex > -1) {
            const existingVote = complaint.votes.votedBy[existingVoteIndex];
            if (existingVote.voteType === voteType) {
                if (voteType === 'up') complaint.votes.upvotes--;
                if (voteType === 'down') complaint.votes.downvotes--;
                complaint.votes.votedBy.splice(existingVoteIndex, 1);
            } else {
                if (voteType === 'up') {
                    complaint.votes.upvotes++;
                    complaint.votes.downvotes--;
                } else {
                    complaint.votes.upvotes--;
                    complaint.votes.downvotes++;
                }
                existingVote.voteType = voteType;
            }
        } else {
            if (voteType === 'up') complaint.votes.upvotes++;
            if (voteType === 'down') complaint.votes.downvotes++;
            complaint.votes.votedBy.push({ userId: decoded.id, voteType });
        }
        await complaint.save();
        return NextResponse.json(
            {
                success: true,
                votes: {
                    upvotes: complaint.votes.upvotes,
                    downvotes: complaint.votes.downvotes,
                    userVote: complaint.votes.votedBy.find(v => v.userId.toString() === decoded.id)?.voteType || null
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Voting error:', error);
        return NextResponse.json(
            { error: 'Failed to record vote' },
            { status: 500 }
        );
    }
}