import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await base44.auth.register(email, password, fullName);

      if (result.emailConfirmationRequired) {
        // Mostra schermata "controlla email"
        setEmailSent(true);
      } else {
        // Email confirmation disabilitata in Supabase → accesso diretto
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Errore di registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  // Schermata di conferma email inviata
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">EasyStop</h1>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Controlla la tua email!</h2>
                <p className="text-sm text-muted-foreground">
                  Abbiamo inviato un link di conferma a{' '}
                  <span className="font-medium text-foreground">{email}</span>.
                  Clicca il link nell'email per attivare il tuo account.
                </p>
              </div>

              <Alert className="text-left">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Non hai ricevuto l'email? Controlla la cartella spam o{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-green-600 hover:text-green-700"
                    onClick={() => navigate('/login')}
                  >
                    torna al login
                  </Button>
                  {' '}per rinviarla.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/login')}
              >
                Vai al login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">EasyStop</h1>
            </div>
            <div className="text-center">
              <CardTitle>Crea un nuovo account</CardTitle>
              <CardDescription>Brescia Green Parking</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nome Completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Mario Rossi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mario@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Minimo 6 caratteri</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </form>

            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Hai già un account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={() => navigate('/login')}
                >
                  Accedi
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
