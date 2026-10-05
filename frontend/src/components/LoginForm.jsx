import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setError('');

    // Zoek gebruiker in de JSON
    const user = usersData.find(u => u.email === email && u.password === password);

    if (user) {
      if (!user.actief) {
        setError("Dit account is inactief. Neem contact op met de beheerder.");
        return;
      }

      // Sla op in localStorage en stuur door
      localStorage.setItem('geoprofs_user', JSON.stringify(user));
      navigate('/');

    } else {
      setError("Ongeldig e-mailadres of wachtwoord. Probeer het opnieuw.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-100">

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">GeoProfs</h2>
          <p className="mt-1 text-sm text-slate-500">Log in op je account</p>
        </div>

        {/* Foutmelding */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Formulier */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              E-mailadres
            </label>
            <input
              type="email"
              placeholder="naam@geoprofs.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Wachtwoord
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-colors"
          >
            Inloggen
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="mt-1 font-mono text-xs text-slate-600">admin@geoprofs.nl / password123</p>
        </div>

      </div>
    </div>
  );
}