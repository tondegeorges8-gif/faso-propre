import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  BookOpen, 
  LogOut,
  Smartphone,
  Key,
  Globe
} from 'lucide-react';
const logo = '/logo.png';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Security settings (simulated)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    // Simulate password change
    setTimeout(() => {
      const savedUsers = JSON.parse(localStorage.getItem('faso_propre_users') || '[]');
      const userIndex = savedUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1 && savedUsers[userIndex].password === currentPassword) {
        savedUsers[userIndex].password = newPassword;
        localStorage.setItem('faso_propre_users', JSON.stringify(savedUsers));
        
        toast({
          title: "Succès",
          description: "Votre mot de passe a été modifié"
        });
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: "Erreur",
          description: "Le mot de passe actuel est incorrect",
          variant: "destructive"
        });
      }
      
      setIsChangingPassword(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showTutorial = () => {
    toast({
      title: "Tutoriel",
      description: "Le tutoriel sera disponible dans une prochaine mise à jour"
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-bold">Paramètres</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Change Password */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={20} />
              Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Modification...' : 'Modifier le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Authentification 2FA</p>
                  <p className="text-xs text-muted-foreground">Double authentification par SMS</p>
                </div>
              </div>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Biométrie</p>
                  <p className="text-xs text-muted-foreground">Connexion par empreinte digitale</p>
                </div>
              </div>
              <Switch 
                checked={biometricEnabled} 
                onCheckedChange={setBiometricEnabled}
              />
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Globe size={24} className="mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">HTTPS</p>
                <p className="text-[10px] text-muted-foreground">Connexion sécurisée</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Shield size={24} className="mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">AES-256</p>
                <p className="text-[10px] text-muted-foreground">Chiffrement</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Lock size={24} className="mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">2FA</p>
                <p className="text-[10px] text-muted-foreground">Double auth.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={showTutorial}
            >
              <BookOpen size={18} className="mr-3" />
              Voir le tutoriel
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-3" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Faso Propre v1.0.0</p>
          <p>© 2024 - Plateforme citoyenne du Burkina Faso</p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
