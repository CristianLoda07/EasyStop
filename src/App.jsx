import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

// Pagine
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

export default function App() {
  const { setAuth, isLoading, session } = useAuthStore();

  useEffect(() => {
    // 1. Controlla la sessione all'avvio
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session);
    });

    // 2. Ascolta i cambiamenti (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-base-100 text-base-content">
        <Routes>
          {/* Rotta di ingresso: se loggato va alla mappa, altrimenti al login */}
          <Route path="/" element={session ? <Navigate to="/user/map" /> : <Navigate to="/login" />} />
          
          {/* Rotte pubbliche */}
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/user/map" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/user/map" />} />
          
          {/* Rotte protette (placeholder temporanei) */}
          <Route 
            path="/user/map" 
            element={session ? (
              <div className="p-10">
                <h1 className="text-3xl font-bold">Mappa Parcheggi (Prossimamente)</h1>
                <button className="btn btn-error mt-4" onClick={() => supabase.auth.signOut()}>Logout</button>
              </div>
            ) : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}