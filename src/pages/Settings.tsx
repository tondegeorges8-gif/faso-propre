import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Save,
  LogOut,
  Shield
} from 'lucide-react';

const logo = '/logo.png';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [telephone, setTelephone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setNom(profile.nom);
      setPrenoms(profile.prenoms);
      setTelephone(profile.telephone);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateProfile({
        nom: nom.trim(),
        prenoms: prenoms.trim(),
        telephone: telephone.trim(),
      });

      if (success) {
        toast({
          title: 'Profil mis à jour',
          description: 'Vos informations ont été enregistrées',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le profil',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-bold">Paramètres</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Profile Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={20} className="text-primary" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Modifiez vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenoms">Prénoms</Label>
              <Input
                id="prenoms"
                value={prenoms}
                onChange={(e) => setPrenoms(e.target.value)}
                placeholder="Vos prénoms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-1">
                <Phone size={14} />
                Téléphone
              </Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+226 XX XX XX XX"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Mail size={14} />
                Email
              </Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Enregistrement...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={18} />
                  Enregistrer les modifications
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Badges */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-lg mb-1">🔒</p>
                <p className="text-xs font-medium">HTTPS</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-lg mb-1">🛡️</p>
                <p className="text-xs font-medium">Chiffré</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-lg mb-1">✓</p>
                <p className="text-xs font-medium">Vérifié</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">À propos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plateforme</span>
              <span>Faso Propre</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pays</span>
              <span>🇧🇫 Burkina Faso</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-card border-destructive/30">
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
