import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, AlertCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotConfirmed(false);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      await base44.auth.login(email, password);
      navigate('/');
    } catch (err) {
      if (err.code === 'email_not_confirmed') {
        setEmailNotConfirmed(true);
        setError(err.message);
      } else {
        setError(err.message || 'Errore di autenticazione');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await base44.auth.resendConfirmationEmail(email);
      setResendSuccess(true);
    } catch (err) {
      setError('Impossibile rinviare l\'email: ' + err.message);
    } finally {
      setResendLoading(false);
    }
  };

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
              <CardTitle>Accedi al tuo account</CardTitle>
              <CardDescription>Brescia Green Parking</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={emailNotConfirmed ? 'default' : 'destructive'}>
                {emailNotConfirmed ? (
                  <Mail className="h-4 w-4 text-amber-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {error}
                  {emailNotConfirmed && (
                    <div className="mt-2">
                      {resendSuccess ? (
                        <p className="text-sm text-green-600 font-medium">
                          Email inviata! Controlla la tua casella.
                        </p>
                      ) : (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-green-600 hover:text-green-700 text-sm"
                          onClick={handleResendEmail}
                          disabled={resendLoading || !email}
                        >
                          {resendLoading ? 'Invio in corso...' : 'Rinvia email di conferma'}
                        </Button>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mario.rossi@example.com"
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
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Non hai un account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={() => navigate('/register')}
                >
                  Registrati
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
