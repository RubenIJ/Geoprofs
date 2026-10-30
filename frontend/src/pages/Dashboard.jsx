import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Dashboard() {
    const [afdelingen, setAfdelingen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function testSupabaseVerbinding() {
            try {
                // Haal data op uit de 'afdelingen' tabel
                const { data, error } = await supabase
                    .from('afdelingen')
                    .select('*');

                if (error) {
                    throw error;
                }

                setAfdelingen(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        testSupabaseVerbinding();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard - Supabase Verbindingstest</h1>

            {loading && <p className="text-gray-500">Verbinding maken met Supabase...</p>}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <p className="font-semibold">Verbinding mislukt:</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Verbinding met Supabase is gelukt! 🎉</p>
                    <p className="text-sm mb-2">Gevonden afdelingen uit database:</p>
                    <ul className="list-disc list-inside">
                        {afdelingen.map((afdeling) => (
                            <li key={afdeling.id}>
                                {afdeling.naam} (ID: {afdeling.id})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}