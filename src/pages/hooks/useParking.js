import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useParkings() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchParkings() {
      try {
        setLoading(true);
        // Scarichiamo tutti i parcheggi dal database
        const { data, error } = await supabase
          .from('parcheggi')
          .select('*');

        if (error) throw error;
        
        setParkings(data);
      } catch (err) {
        console.error("Errore nel caricamento parcheggi:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParkings();
  }, []);

  return { parkings, loading, error };
}