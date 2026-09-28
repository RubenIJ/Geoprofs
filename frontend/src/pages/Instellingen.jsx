import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Instellingen() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('geoprofs_user');
        navigate('/inloggen');
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Instellingen</h1>
            <p className="text-gray-600 mb-6">Beheer je instellingen.</p>
            
            <div className="max-w-xs">
                <button 
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-colors"
                >
                    Uitloggen
                </button>
            </div>
        </div>
    );
}