// src/auth/Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { session, loading: sessionLoading } = useSession();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Inloggen via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const authUser = authData.user;

   // 2. Haal de bijbehorende medewerker op uit je 'medewerkers' tabel op basis van de user_id (UUID)
         const { data: medewerkerData, error: medewerkerError } = await supabase
           .from('medewerkers')
           .select('*')
           .eq('user_id', authUser.id) // <--- Hier 'user_id' gebruiken i.p.v. 'id'
           .maybeSingle();

      if (medewerkerError || !medewerkerData) {
        throw new Error('Ingelogd bij Supabase, maar er is geen gekoppeld medewerkersprofiel gevonden.');
      }

      // 3. Sla op in localStorage voor je andere pagina's
      localStorage.setItem('geoprofs_user', JSON.stringify(medewerkerData));

      // 4. Stuur door naar de verlof-pagina
      navigate('/verlof');

    } catch (err) {
      setError(err.message || 'Onjuist e-mailadres of wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Inloggen bij GeoProfs</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="jij@geoprofs.nl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Wachtwoord</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF7A00] hover:bg-orange-600 transition-colors"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}