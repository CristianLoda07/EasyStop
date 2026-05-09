import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Leaf, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase legge automaticamente i parametri nell'URL (token, type, ecc.)
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          setStatus('success');
          // Redirect alla home dopo 2 secondi
          setTimeout(() => navigate('/'), 2000);
        } else {
          // Prova a fare l'exchange del token dall'URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            setStatus('success');
            setTimeout(() => navigate('/'), 2000);
          } else {
            throw new Error('Link di verifica non valido o scaduto.');
          }
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Si è verificato un errore durante la verifica.');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">EasyStop</h1>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center py-8">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Verifica in corso...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Email verificata!</h2>
                <p className="text-sm text-muted-foreground">
                  Il tuo account è stato attivato. Stai per essere reindirizzato...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold">Verifica fallita</h2>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button
                  className="mt-2 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/login')}
                >
                  Torna al login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
