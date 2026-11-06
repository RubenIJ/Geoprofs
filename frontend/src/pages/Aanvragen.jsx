import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Aanvragen() {
  const [verlofredenen, setVerlofredenen] = useState([]);
  const [startdatum, setStartdatum] = useState('');
  const [einddatum, setEinddatum] = useState('');
  const [verlofredenId, setVerlofredenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Haal verlofredenen op
  useEffect(() => {
    async function haalVerlofredenen() {
      const { data, error } = await supabase
        .from('verlofredenen')
        .select('*');

      if (error) {
        console.error('Fout bij ophalen redenen:', error.message);
      } else {
        setVerlofredenen(data);
      }
    }

    haalVerlofredenen();
  }, []);
// einde
  // Formulier verzenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // 1. Haal de ingelogde gebruiker op uit localStorage
      const storedUser = localStorage.getItem('geoprofs_user');
      if (!storedUser) {
        throw new Error('Geen ingelogde gebruiker gevonden. Log opnieuw in.');
      }
      const user = JSON.parse(storedUser);

      const start = new Date(startdatum);
      const end = new Date(einddatum);

      if (end < start) {
        throw new Error('De einddatum kan niet voor de startdatum liggen.');
      }

      // 2. Voeg de aanvraag toe aan de Supabase tabel 'verlofaanvragen' (zonder aantal_dagen)
      const { error: insertError } = await supabase
        .from('verlofaanvragen')
        .insert([
          {
            medewerker_id: user.id,
            verlofreden_id: parseInt(verlofredenId),
            startdatum: startdatum,
            einddatum: einddatum,
            status_id: 1 // 1 = In afwachting
          }
        ]);

      if (insertError) throw insertError;

      setMessage('Verlofaanvraag succesvol ingediend!');
      // Reset formulier
      setStartdatum('');
      setEinddatum('');
      setVerlofredenId('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      <h1 className="text-2xl font-bold text-gray-900">Verlof aanvragen</h1>
      <p className="mt-1 text-sm text-gray-600">Vul onderstaand formulier in om een nieuwe verlofaanvraag in te dienen.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Verlofreden</label>
          <select
            value={verlofredenId}
            onChange={(e) => setVerlofredenId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="">-- Selecteer een reden --</option>
            {verlofredenen.map((reden) => (
              <option key={reden.id} value={reden.id}>
                {reden.beschrijving}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Startdatum</label>
            <input
              type="date"
              value={startdatum}
              onChange={(e) => setStartdatum(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Einddatum</label>
            <input
              type="date"
              value={einddatum}
              onChange={(e) => setEinddatum(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF7A00] hover:bg-orange-600 transition-colors"
        >
          {loading ? 'Bezig met versturen...' : 'Aanvraag indienen'}
        </button>
      </form>
    </div>
  );
}