import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  role: null,
  isLoading: true, // Fondamentale per non mostrare schermate bianche durante il check iniziale
  
  // Funzione per aggiornare lo stato quando Supabase emette un cambiamento
  setAuth: (session) => {
    const user = session?.user || null;
    // Estraiamo il ruolo dai metadati (se non c'è, di default è 'user')
    const role = user?.user_metadata?.role || 'user';
    
    set({
      session,
      user,
      role,
      isLoading: false,
    });
  },
  
  // Funzione per il logout
  clearAuth: () => set({ session: null, user: null, role: null, isLoading: false }),
}));