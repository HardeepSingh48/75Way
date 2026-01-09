import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/change-password')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome! 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        You have successfully logged in to your account.
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="font-semibold text-indigo-900 mb-2">Protected Content</h3>
                        <p className="text-indigo-700 text-sm">
                            This is a protected page that only authenticated users can access.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
