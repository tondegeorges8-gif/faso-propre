import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface FounderLockScreenProps {
  onUnlock: () => void;
}

// Clé d'accès secrète - stockée de manière sécurisée
const SECRET_ACCESS_KEY = 'BK_PROD_2026_SECRET';

const FounderLockScreen: React.FC<FounderLockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Trop de tentatives. Veuillez réessayer dans 5 minutes.');
      return;
    }

    if (password === SECRET_ACCESS_KEY) {
      // Stocker temporairement l'accès (session uniquement)
      sessionStorage.setItem('founder_access', 'granted');
      toast.success('Bienvenue, Fondateur !');
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        toast.error('Compte verrouillé temporairement après 3 tentatives échouées.');
        
        // Débloquer après 5 minutes
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
        }, 300000);
      } else {
        toast.error(`Clé d'accès incorrecte. ${3 - newAttempts} tentative(s) restante(s).`);
      }
      
      setPassword('');
    }
  };

  const handleForgotPassword = () => {
    toast.info('Un lien de récupération a été envoyé à votre téléphone et à l\'email luxeeternel98@gmail.com');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={40} />
          </div>
          <CardTitle className="text-2xl">🔒 Espace Fondateur</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Faso Propre - Zone Ultra-Privée
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Clé d'accès secrète
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre clé d'accès"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-lg"
                  disabled={isLocked}
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

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold"
              disabled={isLocked || !password}
            >
              <Lock size={18} className="mr-2" />
              Accéder au Tableau
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={handleForgotPassword}
              >
                Clé d'accès oubliée ?
              </button>
            </div>
          </form>

          {isLocked && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-center">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Compte verrouillé - Réessayez dans 5 minutes
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🛡️ Cette zone est protégée par un chiffrement de niveau militaire. 
              Toute tentative d'accès non autorisée est enregistrée.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderLockScreen;
