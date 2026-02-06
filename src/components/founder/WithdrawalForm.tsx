import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalFormProps {
  currentBalance: number;
  onWithdraw: (amount: number, phone: string, network: string) => Promise<boolean>;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ currentBalance, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('orange_money');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseInt(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }
    
    if (withdrawAmount > currentBalance) {
      toast.error('Solde insuffisant pour ce retrait');
      return;
    }
    
    if (withdrawAmount < 1000) {
      toast.error('Le montant minimum de retrait est de 1 000 FCFA');
      return;
    }
    
    if (phone.length < 8) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    setIsProcessing(true);
    
    try {
      const success = await onWithdraw(withdrawAmount, phone, network);
      
      if (success) {
        toast.success('Demande de retrait envoyée avec succès!');
        setAmount('');
        setPhone('');
      } else {
        toast.error('Erreur lors du retrait');
      }
    } catch (error) {
      toast.error('Erreur lors du retrait');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone size={20} />
          Retrait Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Network Selection */}
          <div className="space-y-2">
            <Label>Réseau de paiement</Label>
            <RadioGroup 
              value={network} 
              onValueChange={setNetwork}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="orange_money" id="orange" />
                <Label htmlFor="orange" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    OM
                  </div>
                  <span className="text-sm">Orange Money</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moov_money" id="moov" />
                <Label htmlFor="moov" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    MM
                  </div>
                  <span className="text-sm">Moov Money</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="telecel_faso" id="telecel" />
                <Label htmlFor="telecel" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    TF
                  </div>
                  <span className="text-sm">Telecel Faso</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wave_burkina" id="wave" />
                <Label htmlFor="wave" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    WV
                  </div>
                  <span className="text-sm">Wave Burkina</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <RadioGroupItem value="coris_bank" id="coris" />
                <Label htmlFor="coris" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    CB
                  </div>
                  <span className="text-sm">Coris Bank International</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ex: 70123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="text-lg"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à retirer (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1000}
              max={currentBalance}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Disponible: {formatMoney(currentBalance)} | Min: 1 000 FCFA
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || currentBalance < 1000}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Traitement en cours...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Valider le retrait
              </>
            )}
          </Button>

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Les retraits sont traités dans un délai de 24h ouvrées. 
              Assurez-vous que le numéro correspond au réseau sélectionné.
              Pour Coris Bank, entrez votre numéro de compte.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawalForm;
