import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { z } from 'zod';

const logo = '/logo.png';

type AuthMode = 'login' | 'register';

// Validation schemas
const registerSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  prenoms: z.string().trim().min(2, 'Les prénoms doivent contenir au moins 2 caractères').max(100),
  telephone: z.string().trim().regex(/^\+226\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, 'Format: +226 XX XX XX XX'),
  email: z.string().trim().email('Email invalide').max(255),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().trim().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+226 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const formatPhoneNumber = (value: string) => {
    // Keep +226 prefix and format as +226 XX XX XX XX
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+226')) {
      cleaned = '+226' + cleaned.replace(/^\+?226?/, '');
    }
    
    const digits = cleaned.slice(4).slice(0, 8);
    let formatted = '+226';
    for (let i = 0; i < digits.length; i += 2) {
      formatted += ' ' + digits.slice(i, i + 2);
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setTelephone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const validation = registerSchema.safeParse({
          nom,
          prenoms,
          telephone,
          email,
          password,
          confirmPassword,
        });

        if (!validation.success) {
          const firstError = validation.error.errors[0];
          toast({
            title: 'Erreur de validation',
            description: firstError.message,
            variant: 'destructive',
          });
          return;
        }

        const result = await register({
          nom: nom.trim(),
          prenoms: prenoms.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          password,
        });

        if (result.success) {
          toast({
            title: 'Inscription réussie',
            description: 'Vérifiez votre email pour confirmer votre compte.',
          });
          setMode('login');
        } else {
          let errorMessage = result.error || 'Erreur lors de l\'inscription';
          if (result.error?.includes('already registered')) {
            errorMessage = 'Cette adresse email est déjà utilisée';
          }
          toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        
        if (!validation.success) {
          const firstError = validation.error.errors[0];
          toast({
            title: 'Erreur de validation',
            description: firstError.message,
            variant: 'destructive',
          });
          return;
        }

        const result = await login(email.trim(), password);
        
        if (result.success) {
          toast({
            title: 'Connexion réussie',
            description: 'Bon retour sur Faso Propre!',
          });
          navigate('/dashboard');
        } else {
          let errorMessage = result.error || 'Email ou mot de passe incorrect';
          if (result.error?.includes('Invalid login')) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (result.error?.includes('Email not confirmed')) {
            errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
          }
          toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      placeholder="Votre nom de famille"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenoms">Prénoms *</Label>
                    <Input
                      id="prenoms"
                      placeholder="Vos prénoms"
                      value={prenoms}
                      onChange={(e) => setPrenoms(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Numéro de téléphone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+226 XX XX XX XX"
                      value={telephone}
                      onChange={handlePhoneChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Format: +226 XX XX XX XX</p>
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
                  maxLength={255}
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
                {mode === 'register' && (
                  <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                )}
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
            🛡️ Sécurisé
          </span>
          <span className="flex items-center gap-1">
            ✓ Burkina Faso
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
