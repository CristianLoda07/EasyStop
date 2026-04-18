import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function Vehicles() {
  const { user } = useAuthStore();
  const [veicoli, setVeicoli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Carica i veicoli dell'utente al caricamento della pagina
  const fetchVeicoli = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('veicoli')
      .select('*')
      .eq('id_user', user.id)
      .order('datainserimento', { ascending: false });

    if (!error && data) {
      setVeicoli(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVeicoli();
  }, [user]);

  // Aggiungi un nuovo veicolo
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('veicoli').insert([
      {
        id_user: user.id,
        targa: data.targa.toUpperCase(),
        marca: data.marca,
        type_vcl: data.type_vcl,
        alimentazione: data.alimentazione,
      }
    ]);

    setIsSubmitting(false);
    if (error) {
      alert("Errore nell'inserimento: " + error.message);
    } else {
      reset(); // Svuota il form
      fetchVeicoli(); // Ricarica la lista
    }
  };

  // Elimina un veicolo
  const deleteVeicolo = async (id_vcl) => {
    if (!window.confirm("Sicuro di voler eliminare questo veicolo?")) return;
    const { error } = await supabase.from('veicoli').delete().eq('id_vcl', id_vcl);
    if (!error) fetchVeicoli();
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">I Miei Veicoli</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Colonna di Sinistra: Form Inserimento */}
          <div className="card bg-base-100 shadow-xl h-fit">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Aggiungi Veicolo</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Targa</span></label>
                  <input type="text" className="input input-bordered w-full uppercase" required {...register("targa")} />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Marca e Modello</span></label>
                  <input type="text" className="input input-bordered w-full" required placeholder="es. Fiat Panda" {...register("marca")} />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Tipo</span></label>
                  <select className="select select-bordered w-full" {...register("type_vcl")}>
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van/Furgone</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Alimentazione (Green Scenario)</span></label>
                  <select className="select select-bordered w-full" {...register("alimentazione")}>
                    <option value="benzina">Benzina</option>
                    <option value="diesel">Diesel</option>
                    <option value="ibrida">Ibrida</option>
                    <option value="elettrica">Elettrica</option>
                    <option value="gpl">GPL</option>
                    <option value="metano">Metano</option>
                  </select>
                </div>

                <button type="submit" className={`btn btn-primary w-full mt-4 ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                  Salva Veicolo
                </button>
              </form>
            </div>
          </div>

          {/* Colonna di Destra: Lista Veicoli */}
          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <span className="loading loading-spinner text-primary"></span>
            ) : veicoli.length === 0 ? (
              <div className="alert alert-info">Nessun veicolo registrato. Aggiungine uno per poter parcheggiare!</div>
            ) : (
              veicoli.map(v => (
                <div key={v.id_vcl} className="card bg-base-100 shadow-md border-l-4 border-primary">
                  <div className="card-body flex-row justify-between items-center py-4">
                    <div>
                      <h3 className="font-bold text-xl">{v.targa}</h3>
                      <p className="text-sm text-base-content/70">{v.marca} • {v.type_vcl} ({v.alimentazione})</p>
                    </div>
                    <button className="btn btn-error btn-sm btn-outline" onClick={() => deleteVeicolo(v.id_vcl)}>
                      Rimuovi
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}