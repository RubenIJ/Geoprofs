<<<<<<< Updated upstream
export default function Verlof() {
    return (
        <div className="p-8">

            <p className="mt-2 text-gray-600">
          verlof  </p>
        </div>
    );
=======
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Verlof() {
  const [huidigeGebruiker, setHuidigeGebruiker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laadGebruikerData() {
      try {
        const storedUser = localStorage.getItem('geoprofs_user');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id) {
          setLoading(false);
          return;
        }

        // 1. Haal de medewerker op uit de database
        const { data: userData, error: userError } = await supabase
          .from('medewerkers')
          .select('*')
          .eq('id', parsedUser.id)
          .maybeSingle();

        if (userError || !userData) {
          console.error('Fout bij ophalen medewerker:', userError?.message);
          setLoading(false);
          return;
        }

        // 2. Haal de verlofaanvragen op voor deze medewerker
        const { data: verlofData, error: verlofError } = await supabase
          .from('verlof_aanvragen')
          .select('*')
          .eq('medewerker_id', parsedUser.id);

        if (verlofError) {
          console.error('Fout bij ophalen verlofaanvragen:', verlofError.message);
        }

        // 3. Zet alles in de state (inclusief de verlofaanvragen als array)
        setHuidigeGebruiker({
          ...userData,
          verlof_aanvragen: verlofData || []
        });

      } catch (err) {
        console.error('Onverwachte fout:', err);
      } finally {
        setLoading(false);
      }
    }

    laadGebruikerData();
  }, []);

  if (loading || !huidigeGebruiker) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="mt-2 text-gray-600">Laden...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Paginatitel */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="text-sm text-gray-500">Welkom {huidigeGebruiker.voornaam}! Bekijk hier je verlofsaldo en ingediende aanvragen.</p>
      </div>

      {/* Saldo blokken gekoppeld aan de database kolommen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Totaal Verlofuren</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.totaal_uren || 0} uur</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-gray-500">Gebruikte Uren</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.gebruikte_uren || 0} uur</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Resterend Saldo</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.resterende_uren || 0} uur</p>
        </div>
      </div>

      {/* Verlofhistorie Sectie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">Verlofhistorie & Aanvragen</h3>
          <button className="bg-[#FF7A00] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Nieuw verlof aanvragen
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Van</th>
                <th className="py-3 px-6">Tot</th>
                <th className="py-3 px-6">Uren</th>
                <th className="py-3 px-6">Opmerking</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {huidigeGebruiker.verlof_aanvragen && huidigeGebruiker.verlof_aanvragen.length > 0 ? (
                huidigeGebruiker.verlof_aanvragen.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{item.type}</td>
                    <td className="py-4 px-6">{item.start_datum}</td>
                    <td className="py-4 px-6">{item.eind_datum}</td>
                    <td className="py-4 px-6">{item.uren} uur</td>
                    <td className="py-4 px-6 text-gray-500">{item.opmerking}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Goedgekeurd'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'In afwachting'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Geen verlofaanvragen gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
>>>>>>> Stashed changes
}