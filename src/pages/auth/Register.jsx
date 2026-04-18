import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

// Schema di validazione Zod
const registerSchema = z.object({
  nome: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  cognome: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  telefono: z.string().min(8, "Inserisci un numero di telefono valido").optional(),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  confermaPassword: z.string()
}).refine((data) => data.password === data.confermaPassword, {
  message: "Le password non coincidono",
  path: ["confermaPassword"],
});

export default function Register() {
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            cognome: data.cognome,
            telefono: data.telefono,
            role: 'user', // Ruolo di default
          }
        }
      });

      if (error) throw error;
      
      setSuccessMsg("Registrazione completata! Ora puoi fare il login.");
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error) {
      setErrorMsg(error.message || "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center text-primary mb-2">Nuovo Account</h2>
          <p className="text-center text-base-content/70 mb-6">Unisciti a EasyStop e parcheggia smart</p>

          {errorMsg && (
            <div className="alert alert-error shadow-lg mb-4 text-sm">
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success shadow-lg mb-4 text-sm">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Nome</span></label>
                <input type="text" className={`input input-bordered w-full ${errors.nome ? 'input-error' : ''}`} {...register("nome")} />
                {errors.nome && <span className="text-error text-xs mt-1">{errors.nome.message}</span>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Cognome</span></label>
                <input type="text" className={`input input-bordered w-full ${errors.cognome ? 'input-error' : ''}`} {...register("cognome")} />
                {errors.cognome && <span className="text-error text-xs mt-1">{errors.cognome.message}</span>}
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} {...register("email")} />
              {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Telefono (opzionale)</span></label>
              <input type="tel" className={`input input-bordered w-full ${errors.telefono ? 'input-error' : ''}`} {...register("telefono")} />
              {errors.telefono && <span className="text-error text-xs mt-1">{errors.telefono.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Password</span></label>
                <input type="password" className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`} {...register("password")} />
                {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Conferma Password</span></label>
                <input type="password" className={`input input-bordered w-full ${errors.confermaPassword ? 'input-error' : ''}`} {...register("confermaPassword")} />
                {errors.confermaPassword && <span className="text-error text-xs mt-1">{errors.confermaPassword.message}</span>}
              </div>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? 'Registrazione in corso...' : 'Registrati'}
              </button>
            </div>
          </form>

          <div className="divider">OPPURE</div>
          <div className="text-center">
            <p className="text-sm">
              Hai già un account? <Link to="/login" className="link link-primary">Accedi</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}