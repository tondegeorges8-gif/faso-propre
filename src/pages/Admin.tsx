import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Search, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface Registration { id: string; nom: string; prenoms: string; telephone: string; email: string; ville: string | null; created_at: string }
interface Directory { total: number; filtered_total: number; months: string[]; users: Registration[] }

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [month, setMonth] = useState('all');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => { setTerm(search.trim()); setPage(0); }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  const directory = useQuery({
    queryKey: ['admin-registrations', user?.id, month, term, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_registrations', { _month: month === 'all' ? undefined : month, _search: term, _page: page });
      if (error) throw error;
      return data as unknown as Directory;
    },
    refetchInterval: 30000,
    retry: false,
  });
  const data = directory.data;
  const pages = Math.max(1, Math.ceil((data?.filtered_total ?? 0) / 50));
  return <div className="min-h-screen bg-background pb-24 text-foreground">
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center gap-3 px-4 py-5">
        <Button variant="ghost" size="icon" aria-label="Retour à l’accueil" onClick={() => navigate('/dashboard')}><ArrowLeft size={20} /></Button>
        <Shield className="text-primary" size={26} />
        <h1 className="text-xl font-bold">Espace Admin</h1>
      </div>
    </header>
    <main className="container mx-auto space-y-6 px-4 py-6">
      <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div><h2 className="text-lg font-semibold">Utilisateurs inscrits</h2><p className="mt-2 flex items-center gap-2"><Users className="text-primary" size={22} /><span className="text-3xl font-bold text-primary">{data?.total ?? '—'}</span><span className="text-muted-foreground">inscrits au total</span></p></div>
        <Button variant="outline" onClick={() => directory.refetch()} disabled={directory.isFetching}><RefreshCw size={16} className={directory.isFetching ? 'mr-2 animate-spin' : 'mr-2'} />Actualiser</Button>
      </section>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-2"><Label htmlFor="registration-search">Recherche rapide</Label><div className="relative"><Search size={18} className="absolute left-3 top-3 text-muted-foreground" /><Input id="registration-search" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, téléphone, email, ville…" /></div></div>
        <div className="space-y-2"><Label htmlFor="registration-month">Mois d’inscription</Label><Select value={month} onValueChange={value => { setMonth(value); setPage(0); }}><SelectTrigger id="registration-month"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les mois</SelectItem>{data?.months.map(value => <SelectItem key={value} value={value}>{new Date(`${value}-01T00:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</SelectItem>)}</SelectContent></Select></div>
      </div>
      {directory.isError ? <div role="alert" className="space-y-3 text-destructive"><p>Impossible de charger les inscriptions.</p><Button variant="outline" onClick={() => directory.refetch()}>Réessayer</Button></div> : directory.isPending ? <p role="status" className="text-muted-foreground">Chargement des inscriptions…</p> : <>
        <p className="text-sm text-muted-foreground">{data?.filtered_total ?? 0} inscription(s) trouvée(s)</p>
        <Table><TableHeader><TableRow>{['Nom', 'Prénoms', 'Numéro de téléphone', 'Email', 'Ville', 'Inscription'].map(label => <TableHead key={label} className="whitespace-nowrap">{label}</TableHead>)}</TableRow></TableHeader><TableBody>{data?.users.map(person => <TableRow key={person.id}><TableCell>{person.nom || 'Non renseigné'}</TableCell><TableCell>{person.prenoms || 'Non renseigné'}</TableCell><TableCell className="whitespace-nowrap">{person.telephone || 'Non renseigné'}</TableCell><TableCell className="break-all">{person.email || 'Non renseigné'}</TableCell><TableCell>{person.ville || 'Non renseignée'}</TableCell><TableCell className="whitespace-nowrap">{new Date(person.created_at).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</TableCell></TableRow>)}{data?.users.length === 0 && <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Aucune inscription pour cette recherche.</TableCell></TableRow>}</TableBody></Table>
        <div className="flex items-center justify-end gap-3"><Button variant="outline" size="icon" aria-label="Page précédente" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={18} /></Button><span className="text-sm">Page {page + 1} / {pages}</span><Button variant="outline" size="icon" aria-label="Page suivante" disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={18} /></Button></div>
      </>}
    </main>
    <BottomNavigation />
  </div>;
}