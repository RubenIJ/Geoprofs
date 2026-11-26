import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';

// Telt werkdagen (ma-vr) tussen start- en einddatum (inclusief)
function berekenWerkdagen(startStr, endStr) {
  if (!startStr || !endStr) return 0;

  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let dagen = 0;
  const current = new Date(start);

  while (current <= end) {
    const dagVanDeWeek = current.getDay();
    if (dagVanDeWeek !== 0 && dagVanDeWeek !== 6) {
      dagen += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  return dagen;
}

export default function Aanvragen() {
  const [verlofredenen, setVerlofredenen] = useState([]);
  const [startdatum, setStartdatum] = useState('');
  const [einddatum, setEinddatum] = useState('');
  const [verlofredenId, setVerlofredenId] = useState('');
  const [saldo, setSaldo] = useState({
    totaal: 0,
    gebruikt: 0,
    resterend: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function laadSaldoEnRedenen() {
    setLoadingSaldo(true);

    const { data: redenenData, error: redenenError } = await supabase
      .from('verlofredenen')
      .select('*');

    if (redenenError) {
      console.error('Fout bij ophalen redenen:', redenenError.message);
    } else {
      setVerlofredenen(redenenData || []);
    }

    const storedUser = localStorage.getItem('geoprofs_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Pas 'medewerkers' en kolomnamen aan indien jouw tabel/kolommen anders heten
        const { data: medewerker } = await supabase
          .from('medewerkers')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: eigenAanvragen } = await supabase
          .from('verlofaanvragen')
          .select('startdatum, einddatum, aangevraagde_dagen, status_id')
          .eq('medewerker_id', user.id);

        const totaalDagen = Number(
          medewerker?.totale_dagen ??
          medewerker?.verlofdagen ??
          user?.totale_dagen ??
          22
        );

        const berekendGebruikt = (eigenAanvragen || [])
          .filter((item) => item.status_id === 2) // 2 = Goedgekeurd
          .reduce(
            (som, item) =>
              som + Number(item.aangevraagde_dagen ?? berekenWerkdagen(item.startdatum, item.einddatum)),
            0
          );

        const gebruikteDagen = Number(
          medewerker?.gebruikte_dagen ?? berekendGebruikt ?? 0
        );

        const resterendeDagen =
          medewerker?.resterende_dagen !== undefined && medewerker?.resterende_dagen !== null
            ? Number(medewerker.resterende_dagen)
            : Math.max(totaalDagen - gebruikteDagen, 0);

        setSaldo({
          totaal: totaalDagen,
          gebruikt: gebruikteDagen,
          resterend: resterendeDagen,
        });
      } catch (err) {
        console.error('Fout bij laden van saldo:', err);
      }
    }

    setLoadingSaldo(false);
  }

  useEffect(() => {
    laadSaldoEnRedenen();
  }, []);

  const aangevraagdeDagen = useMemo(
    () => berekenWerkdagen(startdatum, einddatum),
    [startdatum, einddatum]
  );

  const onvoldoendeDagen = !loadingSaldo && aangevraagdeDagen > saldo.resterend;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const storedUser = localStorage.getItem('geoprofs_user');
      if (!storedUser) {
        throw new Error('Geen ingelogde gebruiker gevonden. Log opnieuw in.');
      }
      const user = JSON.parse(storedUser);

      if (!startdatum || !einddatum) {
        throw new Error('Vul zowel een start- als einddatum in.');
      }

      const start = new Date(startdatum);
      const end = new Date(einddatum);

      if (end < start) {
        throw new Error('De einddatum kan niet voor de startdatum liggen.');
      }

      const benodigdeDagen = berekenWerkdagen(startdatum, einddatum);
      if (benodigdeDagen <= 0) {
        throw new Error('De geselecteerde periode bevat geen werkdagen.');
      }

      // Check actueel saldo uit de database vlak voor het opslaan
      const { data: actueleMedewerker, error: checkError } = await supabase
        .from('medewerkers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError) {
        throw new Error('Kon je verlofsaldo niet controleren.');
      }

      const actueelResterend =
        actueleMedewerker?.resterende_dagen !== undefined &&
        actueleMedewerker?.resterende_dagen !== null
          ? Number(actueleMedewerker.resterende_dagen)
          : Math.max(
              Number(actueleMedewerker?.totale_dagen ?? 22) -
                Number(actueleMedewerker?.gebruikte_dagen ?? 0),
              0
            );

      if (benodigdeDagen > actueelResterend) {
        throw new Error(
          `Je hebt niet genoeg verlofdagen. Nodig: ${benodigdeDagen} dag(en), resterend: ${actueelResterend} dag(en).`
        );
      }

      // aangevraagde_dagen wordt door de database zelf berekend bij het inserten
      const { error: insertError } = await supabase
        .from('verlofaanvragen')
        .insert([
          {
            medewerker_id: user.id,
            verlofreden_id: parseInt(verlofredenId, 10),
            startdatum: startdatum,
            einddatum: einddatum,
            status_id: 1 // 1 = In afwachting
          }
        ]);

      if (insertError) throw insertError;

      setMessage(`Verlofaanvraag (${benodigdeDagen} werkdag(en)) succesvol ingediend!`);
      setStartdatum('');
      setEinddatum('');
      setVerlofredenId('');
      await laadSaldoEnRedenen();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Titel */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verlof aanvragen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bekijk je verlofsaldo en vul onderstaand formulier in om een aanvraag in te dienen.
        </p>
      </div>

      {/* 3 Saldo-blokjes bovenaan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white px-7 py-6 rounded-2xl shadow-sm border border-gray-100 border-l-[5px] border-l-[#FF7A00]">
          <p className="text-sm font-medium text-gray-400">Totaal Verlofdagen</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loadingSaldo ? '...' : `${saldo.totaal} dagen`}
          </p>
        </div>

        <div className="bg-white px-7 py-6 rounded-2xl shadow-sm border border-gray-100 border-l-[5px] border-l-amber-500">
          <p className="text-sm font-medium text-gray-400">Gebruikte Dagen</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loadingSaldo ? '...' : `${saldo.gebruikt} dagen`}
          </p>
        </div>

        <div className="bg-white px-7 py-6 rounded-2xl shadow-sm border border-gray-100 border-l-[5px] border-l-emerald-500">
          <p className="text-sm font-medium text-gray-400">Resterend Saldo</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loadingSaldo ? '...' : `${saldo.resterend} dagen`}
          </p>
        </div>
      </div>

      {/* Invulformulier */}
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Nieuwe verlofaanvraag</h2>

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

          {(startdatum || einddatum) && (
            <div
              className={`p-3 rounded-md text-sm border ${
                onvoldoendeDagen
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              Geselecteerde duur: <strong>{aangevraagdeDagen} werkdag(en)</strong>
              {onvoldoendeDagen && (
                <span className="block mt-1 font-medium">
                  Je hebt niet genoeg resterende verlofdagen ({saldo.resterend} beschikbaar).
                </span>
              )}
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading || onvoldoendeDagen}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF7A00] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Bezig met versturen...' : 'Aanvraag indienen'}
          </button>
        </form>
      </div>
    </div>
  );
}