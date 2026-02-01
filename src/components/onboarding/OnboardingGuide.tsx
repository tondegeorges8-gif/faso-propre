import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  MapPin, 
  Camera, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  tip?: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 1,
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques secondes",
    icon: <UserPlus className="h-12 w-12 text-primary" />,
    details: [
      "Entrez votre nom complet",
      "Ajoutez votre prénom",
      "Renseignez votre numéro de téléphone",
      "Sélectionnez votre ville de résidence"
    ],
    tip: "Votre numéro de téléphone nous permet de vous contacter en cas de besoin d'informations supplémentaires."
  },
  {
    id: 2,
    title: "Localisez précisément le problème",
    description: "Suivez le tunnel de précision",
    icon: <Target className="h-12 w-12 text-primary" />,
    details: [
      "1️⃣ Choisissez votre VILLE (Ouagadougou, Bobo-Dioulasso...)",
      "2️⃣ Sélectionnez l'ARRONDISSEMENT (pour les grandes villes)",
      "3️⃣ Identifiez le SECTEUR concerné",
      "4️⃣ Précisez le QUARTIER",
      "5️⃣ Indiquez le SOUS-QUARTIER exact"
    ],
    tip: "Plus votre localisation est précise, plus l'intervention sera rapide et efficace ! Utilisez la recherche rapide pour trouver directement votre quartier."
  },
  {
    id: 3,
    title: "Documentez le problème",
    description: "Une image vaut mille mots",
    icon: <Camera className="h-12 w-12 text-primary" />,
    details: [
      "📸 Prenez une photo claire du problème",
      "📍 Activez la géolocalisation GPS",
      "📝 Ajoutez une description détaillée",
      "🏷️ Choisissez la bonne catégorie"
    ],
    tip: "La photo est OBLIGATOIRE pour valider votre signalement. Elle permet aux équipes d'évaluer la situation avant intervention."
  },
  {
    id: 4,
    title: "Envoyez et suivez",
    description: "Votre signalement compte !",
    icon: <Send className="h-12 w-12 text-primary" />,
    details: [
      "✅ Vérifiez toutes les informations",
      "📤 Envoyez votre signalement",
      "🔔 Recevez une confirmation",
      "📊 Suivez l'état de traitement"
    ],
    tip: "Chaque signalement est transmis aux services compétents (ONEA, SONABEL, Voirie, etc.) selon la catégorie choisie."
  }
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ 
  open, 
  onOpenChange,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('faso-propre-onboarding-complete', 'true');
    onOpenChange(false);
    onComplete?.();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Guide d'utilisation
            </DialogTitle>
            <Badge variant="secondary">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                idx <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Icon & Title */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-muted-foreground mt-1">{step.description}</p>
          </div>

          {/* Details */}
          <div className="space-y-2 px-2">
            {step.details.map((detail, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{detail}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {step.tip && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <span className="font-semibold text-primary">💡 Conseil : </span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
          >
            {isLastStep ? (
              <>
                Commencer
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip option */}
        <button
          className="text-xs text-muted-foreground hover:text-foreground text-center py-2"
          onClick={handleComplete}
        >
          Passer le guide
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingGuide;
