// src/hooks/useSession.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSession() {
  const [session, setSession] = useState(null); // null = niet ingelogd
  const [loading, setLoading] = useState(true); // true zolang we de auth status ophalen

  useEffect(() => {
    // 1. Controleer of er een actieve sessie is wanneer de app laadt
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Luister naar auth-wijzigingen (inloggen, uitloggen)
    // De sessie wordt hier direct meegegeven door Supabase!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // 3. Verwijder de listener wanneer het component unmount
    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}