import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEntryAccess } from '@/hooks/useAdminEntryAccess';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { ADMIN_EMAIL, hasAdminEmail } from '@/lib/adminAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, login, isLoading: authLoading } = useAuth();
  const entry = useAdminEntryAccess();
  const access = useAdminAccess();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authenticated || !hasAdminEmail(user?.email) || access.isLoading) return;
    setSubmitting(false);
    if (access.isAdmin) navigate('/admin', { replace: true });
    else setError('Accès refusé. Vérifiez votre compte administrateur.');
  }, [authenticated, user?.email, access.isLoading, access.isAdmin, navigate]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (!hasAdminEmail(email)) {
      setError('Identifiants administrateur invalides.');
      return;
    }
    setSubmitting(true);
    setAuthenticated(false);
    try {
      // Never retain approval or private directory results across account switches.
      queryClient.clear();
      const result = await login(email, password);
      setPassword('');
      if (!result.success) {
        setError('Identifiants administrateur invalides.');
        setSubmitting(false);
        return;
      }
      setAuthenticated(true);
    } catch {
      setPassword('');
      setSubmitting(false);
      setError('Connexion impossible. Veuillez réessayer.');
    }
  };

  if (!submitting && (authLoading || entry.isLoading || access.isLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div role="status" aria-label="Vérification" className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }
  if (!submitting && !entry.canEnter && !access.isAdmin) return <Navigate to="/" replace />;

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
        <Button variant="ghost" size="icon" aria-label="Retour aux Paramètres" disabled={submitting} onClick={() => navigate('/settings')}><ArrowLeft size={20} /></Button>
        <h1 className="text-lg font-bold">Vérification administrateur</h1>
      </div>
    </header>
    <main className="mx-auto max-w-lg px-4 py-8">
      <LockKeyhole size={32} className="mb-6 text-primary" />
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="admin-email">Email administrateur</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} disabled={submitting} /></div>
        <div className="space-y-2"><Label htmlFor="admin-password">Mot de passe</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={submitting} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}><LockKeyhole size={18} className="mr-2" />{submitting ? 'Vérification…' : 'Déverrouiller le tableau de bord'}</Button>
      </form>
    </main>
  </div>;
}