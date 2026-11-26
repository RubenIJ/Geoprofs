import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
const STATUS_IDS = {
  AFWACHTEND: 1,
  GOEDGEKEURD: 2,
  AFGEWEZEN: 3,
  GEANNULEERD: 4,
};
export default function Verlof({ onNieuweAanvraag }) {
  const [huidigeGebruiker, setHuidigeGebruiker] = useState(null);
  const [saldo, setSaldo] = useState({
    totaal: 0,
    gebruikt: 0,
    resterend: 0,
  });
  const [aanvragen, setAanvragen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [teAnnulerenAanvraag, setTeAnnulerenAanvraag] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const haalVerlofDataOp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem('geoprofs_user');
      if (!storedUser) {
        setHuidigeGebruiker(null);
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setHuidigeGebruiker(user);

      // 1. Haal saldo van de ingelogde gebruiker op
      const { data: medewerker } = await supabase
        .from('medewerkers')
        .select('*')
        .eq('id', user.id)
        .single();

      // 2. Haal eigen verlofaanvragen op met joins op verlofredenen en status
      const { data, error: fetchError } = await supabase
        .from('verlofaanvragen')
        .select(`
          id,
          startdatum,
          einddatum,
          aangevraagde_dagen,
          status_id,
          medewerker_id,
          verlofredenen ( beschrijving ),
          status ( naam )
        `)
        .eq('medewerker_id', user.id)
        .order('id', { ascending: false });

      if (fetchError) throw fetchError;

      const lijst = data || [];
      setAanvragen(lijst);

      const totaalDagen = Number(
        medewerker?.totale_dagen ??
          medewerker?.verlofdagen ??
          user?.totale_dagen ??
          22
      );

      const berekendGebruikt = lijst
        .filter((item) => item.status_id === STATUS_IDS.GOEDGEKEURD)
        .reduce((som, item) => som + Number(item.aangevraagde_dagen ?? 0), 0);

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
      console.error('Fout bij ophalen persoonlijke verlof data:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    haalVerlofDataOp();
  }, [haalVerlofDataOp]);

  // Opent de dubbelcheck-modal
  const vraagBevestigingAnnuleren = (aanvraag) => {
    if (aanvraag.status_id !== STATUS_IDS.AFWACHTEND) {
      setError('Alleen aanvragen met de status "Afwachtend" kunnen worden geannuleerd.');
      return;
    }
    setError(null);
    setTeAnnulerenAanvraag(aanvraag);
  };

  // Voert de daadwerkelijke annulering uit na bevestiging
  const bevestigAnnuleren = async () => {
    if (!huidigeGebruiker || !teAnnulerenAanvraag) return;

    const aanvraag = teAnnulerenAanvraag;
    setCancellingId(aanvraag.id);
    setFeedback(null);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('verlofaanvragen')
        .update({ status_id: STATUS_IDS.GEANNULEERD })
        .eq('id', aanvraag.id)
        .eq('medewerker_id', huidigeGebruiker.id);

      if (updateError) throw updateError;

      setTeAnnulerenAanvraag(null);
      setFeedback(`Aanvraag #${aanvraag.id} is geannuleerd.`);
      await haalVerlofDataOp();
    } catch (err) {
      console.error('Fout bij annuleren aanvraag:', err.message);
      setError(err.message || 'Kon de aanvraag niet annuleren.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!huidigeGebruiker && !loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="mt-2 text-gray-600">Geen ingelogde gebruiker gevonden.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Paginatitel */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="text-sm text-gray-500">
          Bekijk hier je verlofsaldo en ingediende aanvragen.
        </p>
      </div>

      {/* Saldo blokken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Totaal Verlofdagen</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {loading ? '...' : `${saldo.totaal} dagen`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-gray-500">Gebruikte Dagen</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {loading ? '...' : `${saldo.gebruikt} dagen`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Resterend Saldo</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {loading ? '...' : `${saldo.resterend} dagen`}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          {feedback}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Verlofhistorie Sectie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">Verlofhistorie & Aanvragen</h3>
          <button
            type="button"
            onClick={onNieuweAanvraag}
            className="bg-[#FF7A00] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
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
                <th className="py-3 px-6">Dagen</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Aanvragen laden...
                  </td>
                </tr>
              ) : aanvragen.length > 0 ? (
                aanvragen.map((item) => {
                  const statusLabel =
                    item.status?.naam ||
                    (item.status_id === STATUS_IDS.GOEDGEKEURD
                      ? 'Goedgekeurd'
                      : item.status_id === STATUS_IDS.AFWACHTEND
                        ? 'Afwachtend'
                        : item.status_id === STATUS_IDS.AFGEWEZEN
                          ? 'Afgewezen'
                          : 'Geannuleerd');

                  const kanAnnuleren = item.status_id === STATUS_IDS.AFWACHTEND;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {item.verlofredenen?.beschrijving || 'Verlof'}
                      </td>
                      <td className="py-4 px-6">{item.startdatum}</td>
                      <td className="py-4 px-6">{item.einddatum}</td>
                      <td className="py-4 px-6">{item.aangevraagde_dagen ?? 0} dagen</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status_id === STATUS_IDS.GOEDGEKEURD
                              ? 'bg-green-100 text-green-700'
                              : item.status_id === STATUS_IDS.AFWACHTEND
                                ? 'bg-amber-100 text-amber-700'
                                : item.status_id === STATUS_IDS.GEANNULEERD
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {kanAnnuleren ? (
                          <button
                            type="button"
                            disabled={cancellingId === item.id}
                            onClick={() => vraagBevestigingAnnuleren(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            {cancellingId === item.id ? 'Annuleren...' : 'Annuleren'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Dubbelcheck Modal voor annuleren */}
      {teAnnulerenAanvraag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              Verlofaanvraag annuleren?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Weet je zeker dat je deze aanvraag wilt annuleren? Dit zet de status op{' '}
              <span className="font-semibold text-gray-800">Geannuleerd</span>.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm space-y-1 text-gray-700">
              <div>
                <span className="text-gray-500">Type:</span>{' '}
                <span className="font-medium">
                  {teAnnulerenAanvraag.verlofredenen?.beschrijving || 'Verlof'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Periode:</span>{' '}
                <span className="font-medium">
                  {teAnnulerenAanvraag.startdatum} t/m {teAnnulerenAanvraag.einddatum}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Dagen:</span>{' '}
                <span className="font-medium">
                  {teAnnulerenAanvraag.aangevraagde_dagen ?? 0} dagen
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={cancellingId === teAnnulerenAanvraag.id}
                onClick={() => setTeAnnulerenAanvraag(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Behouden
              </button>
              <button
                type="button"
                disabled={cancellingId === teAnnulerenAanvraag.id}
                onClick={bevestigAnnuleren}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancellingId === teAnnulerenAanvraag.id
                  ? 'Bezig met annuleren...'
                  : 'Ja, annuleer aanvraag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}