import React, { useState } from 'react';
import { base44 } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Users, Shield, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);

  const { data: utenti = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-utenti'],
    queryFn: () => base44.entities.User.list(),
  });

  const filtered = utenti.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Mutation per eliminare utente
  const deleteUserMutation = useMutation({
    mutationFn: () => base44.entities.User.delete(deleteUser.id),
    onSuccess: () => {
      toast.success('Utente eliminato con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-utenti'] });
      setDeleteUser(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile eliminare l\'utente'}`);
    },
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold">Gestione Utenti</h1>
        <Badge variant="secondary" className="text-sm">
          <Users className="w-4 h-4 mr-1" /> {utenti.length} utenti
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isError && (
            <div className="p-4 text-sm text-destructive">
              Errore caricamento utenti: {error?.message || 'permessi insufficienti (RLS) o query non valida'}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nessun utente trovato.
                  </TableCell>
                </TableRow>
              ) : filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{u.full_name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.telefono || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role === 'admin' ? 'Admin' : 'Utente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteUser(u)}
                      disabled={u.role === 'admin'}
                      title={u.role === 'admin' ? 'Non puoi eliminare un admin' : 'Elimina utente'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Utente</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi eliminare l'utente "{deleteUser?.full_name || deleteUser?.email}"? L'operazione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUserMutation.mutate()} 
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteUserMutation.isPending ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}