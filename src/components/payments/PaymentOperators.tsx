import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import orangeMoneyAsset from '@/assets/payment-orange-money.png.asset.json';
import moovAfricaAsset from '@/assets/payment-moov-africa.png.asset.json';
import waveAsset from '@/assets/payment-wave.png.asset.json';

export const PAYMENT_OPERATORS = [
  { id: 'ORANGE_MONEY', name: 'Orange Money', logo: orangeMoneyAsset.url, number: '+226 56 00 98 93' },
  { id: 'MOOV_MONEY', name: 'Moov Africa', logo: moovAfricaAsset.url, number: '+226 56 00 98 93' },
  { id: 'WAVE', name: 'Wave', logo: waveAsset.url, number: '+226 56 00 98 93' },
];

interface Props {
  value: string | null;
  onChange: (id: string) => void;
}

const PaymentOperators: React.FC<Props> = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Moyen de paiement">
    {PAYMENT_OPERATORS.map((op) => (
      <button
        key={op.id}
        type="button"
        role="radio"
        aria-checked={value === op.id}
        aria-label={`Payer avec ${op.name}`}
        onClick={() => onChange(op.id)}
        className={cn(
          'relative min-w-0 rounded-lg border-2 p-2 flex flex-col items-center gap-2 transition-all bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          value === op.id ? 'border-primary shadow-card' : 'border-border hover:border-primary/40',
        )}
      >
        {value === op.id && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
            <Check size={13} strokeWidth={3} />
          </span>
        )}
        <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-background p-1.5">
          <img src={op.logo} alt="" loading="lazy" width={512} height={512} className="h-full w-full object-contain" />
        </span>
        <span className="min-h-7 text-[11px] font-semibold text-center leading-tight flex items-center justify-center">{op.name}</span>
      </button>
    ))}
  </div>
);

export default PaymentOperators;
