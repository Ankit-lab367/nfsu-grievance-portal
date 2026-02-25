import { NextResponse } from 'next/server';

const FACE_SERVER = 'http://127.0.0.1:5001';

// GET /api/admin/face-dataset → list all persons
export async function GET() {
    try {
        const res = await fetch(`${FACE_SERVER}/dataset/list`, {
            signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Face server offline. Start the Python server.' }, { status: 503 });
    }
}

// POST /api/admin/face-dataset → add person + photo (multipart)
export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const image = formData.get('image');

        if (!name || !image) {
            return NextResponse.json({ error: 'name and image are required' }, { status: 400 });
        }

        // Forward multipart directly to Python server
        const fd = new FormData();
        fd.append('name', name);
        fd.append('image', image);

        const res = await fetch(`${FACE_SERVER}/dataset/add`, {
            method: 'POST',
            body: fd,
            signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.ok ? 200 : 400 });
    } catch (e) {
        return NextResponse.json({ error: e.message || 'Failed to add to dataset' }, { status: 500 });
    }
}

// DELETE /api/admin/face-dataset?name=XYZ → remove person
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        if (!name) return NextResponse.json({ error: 'name query param required' }, { status: 400 });

        const res = await fetch(`${FACE_SERVER}/dataset/delete/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.ok ? 200 : 400 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
