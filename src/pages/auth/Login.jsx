import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Schema di validazione con Zod
const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export default function Login() {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      // Il redirect verrà gestito automaticamente dal listener in App.jsx
      // ma possiamo forzare un re-indirizzamento di sicurezza qui
      navigate('/user/map'); 
      
    } catch (error) {
      setErrorMsg(error.message || "Credenziali non valide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center text-primary mb-2">EasyStop</h2>
          <p className="text-center text-base-content/70 mb-6">Accedi per gestire le tue soste</p>

          {errorMsg && (
            <div className="alert alert-error shadow-lg mb-4">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="es. mario.rossi@email.com" 
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} 
                {...register("email")}
              />
              {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`} 
                {...register("password")}
              />
              {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </div>
          </form>

          <div className="divider">OPPURE</div>
          
          <div className="text-center">
            <p className="text-sm">
              Non hai un account? <a href="/register" className="link link-primary">Registrati</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}