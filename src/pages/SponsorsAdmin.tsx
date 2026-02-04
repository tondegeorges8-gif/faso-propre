import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  Mail,
  AlertTriangle
} from 'lucide-react';

interface Sponsor {
  id: string;
  code: string;
  name: string;
  category: string;
  role: string;
  advantage: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contract_start: string | null;
  contract_end: string | null;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'telecoms', label: 'Télécommunications' },
  { value: 'banque', label: 'Banque / Finance' },
  { value: 'industrie', label: 'Industrie' },
  { value: 'energie', label: 'Énergie' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'autre', label: 'Autre' }
];

const logo = '/logo.png';

const SponsorsAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isFounder, isLoading: founderLoading } = useFounderAccess();
  
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'telecoms',
    role: '',
    advantage: '',
    logo_url: '',
    contact_email: '',
    contract_start: '',
    contract_end: '',
    monthly_fee: 0,
    is_active: true
  });

  const isLoading = authLoading || founderLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && user && isFounder) {
      fetchSponsors();
    }
  }, [user, isFounder, isLoading]);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors((data || []) as Sponsor[]);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        code: sponsor.code,
        name: sponsor.name,
        category: sponsor.category,
        role: sponsor.role,
        advantage: sponsor.advantage || '',
        logo_url: sponsor.logo_url || '',
        contact_email: sponsor.contact_email || '',
        contract_start: sponsor.contract_start || '',
        contract_end: sponsor.contract_end || '',
        monthly_fee: sponsor.monthly_fee,
        is_active: sponsor.is_active
      });
    } else {
      setEditingSponsor(null);
      setFormData({
        code: '',
        name: '',
        category: 'telecoms',
        role: '',
        advantage: '',
        logo_url: '',
        contact_email: '',
        contract_start: '',
        contract_end: '',
        monthly_fee: 0,
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.role) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    
    try {
      const sponsorData = {
        code: formData.code.toUpperCase().replace(/\s/g, '_'),
        name: formData.name,
        category: formData.category,
        role: formData.role,
        advantage: formData.advantage || null,
        logo_url: formData.logo_url || null,
        contact_email: formData.contact_email || null,
        contract_start: formData.contract_start || null,
        contract_end: formData.contract_end || null,
        monthly_fee: formData.monthly_fee,
        is_active: formData.is_active
      };

      if (editingSponsor) {
        const { error } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', editingSponsor.id);

        if (error) throw error;
        toast.success('Partenaire mis à jour');
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert(sponsorData);

        if (error) throw error;
        toast.success('Partenaire créé');
      }

      setIsDialogOpen(false);
      fetchSponsors();
    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sponsor: Sponsor) => {
    if (!confirm(`Supprimer le partenaire "${sponsor.name}" ?`)) return;

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsor.id);

      if (error) throw error;
      toast.success('Partenaire supprimé');
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      telecoms: 'bg-orange-100 text-orange-800',
      banque: 'bg-blue-100 text-blue-800',
      industrie: 'bg-green-100 text-green-800',
      energie: 'bg-yellow-100 text-yellow-800',
      assurance: 'bg-purple-100 text-purple-800',
      autre: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.autre;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isFounder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-destructive" size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
          <p className="text-muted-foreground mb-6">
            Cette page est réservée aux administrateurs.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} className="mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/founder')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Gestion Partenaires</h1>
                <p className="text-xs opacity-80">Sponsors & Publicités</p>
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => handleOpenDialog()}
            >
              <Plus size={18} className="mr-2" />
              Nouveau
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">{sponsors.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {sponsors.filter(s => s.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">
                {formatMoney(sponsors.reduce((sum, s) => sum + s.monthly_fee, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Revenus mensuels</p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsors List */}
        <div className="space-y-3">
          {sponsors.map(sponsor => (
            <Card key={sponsor.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 size={24} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{sponsor.name}</h3>
                        <Badge className={getCategoryBadge(sponsor.category)}>
                          {CATEGORIES.find(c => c.value === sponsor.category)?.label}
                        </Badge>
                        {!sponsor.is_active && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{sponsor.role}</p>
                      {sponsor.advantage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ✨ {sponsor.advantage}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {sponsor.monthly_fee > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            {formatMoney(sponsor.monthly_fee)}/mois
                          </span>
                        )}
                        {sponsor.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {sponsor.contact_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(sponsor)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(sponsor)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {sponsors.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun partenaire configuré</p>
                <Button className="mt-4" onClick={() => handleOpenDialog()}>
                  <Plus size={18} className="mr-2" />
                  Ajouter un partenaire
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSponsor ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="Ex: ORANGE_BF"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Orange Money"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Input
                  id="role"
                  placeholder="Ex: Sponsor Connectivité"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advantage">Avantage offert</Label>
              <Textarea
                id="advantage"
                placeholder="Ex: Zero-rating pour l'app"
                value={formData.advantage}
                onChange={(e) => setFormData({ ...formData, advantage: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email contact</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@sponsor.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Frais mensuel (FCFA)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Début contrat</Label>
                <Input
                  id="start"
                  type="date"
                  value={formData.contract_start}
                  onChange={(e) => setFormData({ ...formData, contract_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fin contrat</Label>
                <Input
                  id="end"
                  type="date"
                  value={formData.contract_end}
                  onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">URL Logo</Label>
              <Input
                id="logo"
                placeholder="https://..."
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="active">Partenaire actif</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorsAdmin;
