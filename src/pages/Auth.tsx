import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MAJOR_CITIES } from '@/data/burkinaFaso';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import logo from '@/assets/logo.png';

type AuthMode = 'login' | 'register';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useManualCity, setUseManualCity] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast({
            title: "Erreur",
            description: "Les mots de passe ne correspondent pas",
            variant: "destructive"
          });
          return;
        }

        if (password.length < 6) {
          toast({
            title: "Erreur",
            description: "Le mot de passe doit contenir au moins 6 caractères",
            variant: "destructive"
          });
          return;
        }

        const selectedCity = useManualCity ? manualCity : city;
        
        if (!firstName || !lastName || !email || !phone || !selectedCity || !password) {
          toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs obligatoires",
            variant: "destructive"
          });
          return;
        }

        const success = await register({
          firstName,
          lastName,
          email,
          phone,
          city: selectedCity,
          password
        });

        if (success) {
          toast({
            title: "Inscription réussie",
            description: "Bienvenue sur Faso Propre!"
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Erreur",
            description: "Cette adresse email est déjà utilisée",
            variant: "destructive"
          });
        }
      } else {
        const success = await login(email, password);
        
        if (success) {
          toast({
            title: "Connexion réussie",
            description: "Bon retour sur Faso Propre!"
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Erreur",
            description: "Email ou mot de passe incorrect",
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-card shadow-card overflow-hidden mb-4">
            <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Faso Propre</h1>
          <p className="text-muted-foreground mt-2">Plateforme citoyenne de signalement</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === 'register' ? 'Créer un compte' : 'Se connecter'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'register' 
                ? 'Rejoignez la communauté Faso Propre' 
                : 'Accédez à votre espace citoyen'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Votre prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Votre nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+226 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Ville *</Label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setUseManualCity(!useManualCity)}
                      >
                        {useManualCity ? 'Choisir dans la liste' : 'Saisir manuellement'}
                      </button>
                    </div>
                    {useManualCity ? (
                      <Input
                        placeholder="Entrez votre ville"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        required
                      />
                    ) : (
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Sélectionnez votre ville" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover max-h-60">
                          {MAJOR_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
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
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Chargement...
                    </span>
                  ) : mode === 'register' ? (
                    <span className="flex items-center gap-2">
                      <UserPlus size={18} />
                      S'inscrire
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={18} />
                      Se connecter
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                >
                  {mode === 'register' ? (
                    <span className="flex items-center gap-2">
                      <LogIn size={18} />
                      J'ai déjà un compte
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus size={18} />
                      Créer un compte
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            🔒 HTTPS
          </span>
          <span className="flex items-center gap-1">
            🛡️ AES-256
          </span>
          <span className="flex items-center gap-1">
            ✓ 2FA
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
