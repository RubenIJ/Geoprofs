import React, { useEffect, useState } from 'react';
import usersData from '../data/users.json';

export default function Verlof() {
  const [huidigeGebruiker, setHuidigeGebruiker] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('geoprofs_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const volledigeData = usersData.find(u => u.id === parsedUser.id) || parsedUser;
      setHuidigeGebruiker(volledigeData);
    }
  }, []);

  if (!huidigeGebruiker) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="mt-2 text-gray-600">Laden:)</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Paginatitel */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mijn Verlof</h1>
        <p className="text-sm text-gray-500">Bekijk hier je verlofsaldo en ingediende aanvragen.</p>
      </div>

      {/* Saldo ding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Totaal Verlofuren</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.verlofSaldo?.totaalUren || 0} uur</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-gray-500">Gebruikte Uren</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.verlofSaldo?.gebruikteUren || 0} uur</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Resterend Saldo</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{huidigeGebruiker.verlofSaldo?.resterendeUren || 0} uur</p>
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
              {huidigeGebruiker.verlofHistorie && huidigeGebruiker.verlofHistorie.length > 0 ? (
                huidigeGebruiker.verlofHistorie.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{item.type}</td>
                    <td className="py-4 px-6">{item.startDatum}</td>
                    <td className="py-4 px-6">{item.eindDatum}</td>
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
}