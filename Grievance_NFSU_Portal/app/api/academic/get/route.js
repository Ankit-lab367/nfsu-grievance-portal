import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AcademicResource from '@/models/AcademicResource';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const degree = searchParams.get('degree');
        const semester = searchParams.get('semester');
        const type = searchParams.get('type');

        const query = {};
        if (degree) query.degree = degree;
        if (semester) query.semester = semester;
        if (type) query.type = type;

        const resources = await AcademicResource.find(query)
            .populate('uploadedBy', 'name role')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, resources });

    } catch (error) {
        console.error('Fetch resources error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
