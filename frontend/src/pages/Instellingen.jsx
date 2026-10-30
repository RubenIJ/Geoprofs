import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Instellingen() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('geoprofs_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const getInitials = (voornaam) => {
        if (!voornaam) return '';
        return voornaam.trim().charAt(0).toUpperCase();
    };

    async function handleLogout() {
        await supabase.auth.signOut();
        localStorage.removeItem('geoprofs_user');
        navigate('/inloggen');
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Paginatitel */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Instellingen</h1>
                <p className="text-sm text-slate-500">Beheer je accountgegevens en instellingen.</p>
            </div>

            {/* Profiel Sectie */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Profielgegevens</h2>

                <div className="flex items-center gap-4">
                    {/* Avatar cirkel met initiaal */}
                    <div className="w-16 h-16 rounded-full bg-[#FF7A00] text-white font-bold flex items-center justify-center text-2xl shadow-inner">
                        {user ? getInitials(user.voornaam) : '?'}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">
                            {user ? `${user.voornaam} ${user.achternaam}` : 'Niet ingelogd'}
                        </h3>
                        <div className="text-sm text-slate-600 space-y-0.5">
                            <p>
                                <span className="font-medium">E-mailadres: </span> {user ? user.email : '-'}
                            </p>
                            <p>
                                <span className="font-medium">BSN: </span> {user ? user.bsn_nummer : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account / Sessie Beheer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Sessie</h2>
                <p className="text-sm text-slate-500 mb-4">Sluit je huidige sessie af door uit te loggen.</p>

                <div className="max-w-xs">
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-colors"
                    >
                        Uitloggen
                    </button>
                </div>
            </div>
        </div>
    );
}