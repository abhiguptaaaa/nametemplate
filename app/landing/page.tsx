import Link from 'next/link';

export default function HomeRedirect() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-6xl font-black text-blue-600 mb-8 italic">Nora</h1>
            <div className="space-x-4">
                <Link href="/gallery" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200">User Dashboard</Link>
                <Link href="/admin" className="bg-white text-gray-600 border px-8 py-3 rounded-2xl font-bold">Admin Panel</Link>
            </div>
        </div>
    );
}
