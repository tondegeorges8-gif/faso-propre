import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { REPORT_CATEGORIES } from '@/data/burkinaFaso';
import { ArrowRight, Shield, MapPin, Phone, Users } from 'lucide-react';
const logo = '/logo.png';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-card shadow-xl overflow-hidden mb-6">
              <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Faso Propre
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Plateforme citoyenne de signalement pour un Burkina Faso plus propre et mieux géré
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
                onClick={() => navigate('/auth')}
              >
                Commencer maintenant
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="h-16 bg-background" style={{
          clipPath: 'ellipse(70% 100% at 50% 100%)'
        }} />
      </section>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Comment ça marche ?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Localisez</h3>
                <p className="text-muted-foreground text-sm">
                  Identifiez le problème et partagez votre position GPS pour une intervention précise
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Signalez</h3>
                <p className="text-muted-foreground text-sm">
                  Photographiez le problème et envoyez votre signalement à l'organisme compétent
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Suivez</h3>
                <p className="text-muted-foreground text-sm">
                  Suivez l'évolution de votre signalement jusqu'à sa résolution
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Catégories de signalement
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(REPORT_CATEGORIES).map(([key, category], index) => (
              <Card 
                key={key} 
                className="shadow-card animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.subcategories.length} types de problèmes
                      </p>
                      <a 
                        href={`tel:${category.phone.replace(/\s/g, '')}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Phone size={12} />
                        {category.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary">13</div>
              <div className="text-sm text-muted-foreground">Régions couvertes</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary">45</div>
              <div className="text-sm text-muted-foreground">Provinces</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl md:text-4xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Services publics</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 gradient-hero text-primary-foreground">
        <div className="container mx-auto text-center">
          <Users size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Rejoignez la communauté
          </h2>
          <p className="opacity-90 max-w-xl mx-auto mb-6">
            Ensemble, contribuons à un Burkina Faso plus propre et mieux entretenu. Chaque signalement compte !
          </p>
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
            onClick={() => navigate('/auth')}
          >
            Créer mon compte
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold">Faso Propre</span>
          </div>
          <p className="text-sm opacity-70">
            © 2024 Faso Propre - Plateforme citoyenne du Burkina Faso
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs opacity-50">
            <span>🔒 HTTPS</span>
            <span>🛡️ AES-256</span>
            <span>✓ 2FA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
