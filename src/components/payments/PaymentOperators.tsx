import React from 'react';
import { cn } from '@/lib/utils';
import orangeMoney from '@/assets/pay-orange-money.png';
import moovMoney from '@/assets/pay-moov-money.png';
import wave from '@/assets/pay-wave.png';

export const PAYMENT_OPERATORS = [
  { id: 'ORANGE_MONEY', name: 'Orange Money', logo: orangeMoney, number: '+226 56 00 98 93' },
  { id: 'MOOV_MONEY', name: 'Moov Money', logo: moovMoney, number: '+226 56 00 98 93' },
  { id: 'WAVE', name: 'Wave Burkina', logo: wave, number: '+226 56 00 98 93' },
];

interface Props {
  value: string | null;
  onChange: (id: string) => void;
}

const PaymentOperators: React.FC<Props> = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-3">
    {PAYMENT_OPERATORS.map((op) => (
      <button
        key={op.id}
        type="button"
        onClick={() => onChange(op.id)}
        className={cn(
          'rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all bg-card',
          value === op.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/40',
        )}
      >
        <img src={op.logo} alt={op.name} loading="lazy" width={512} height={512} className="w-12 h-12 object-contain" />
        <span className="text-[11px] font-medium text-center leading-tight">{op.name}</span>
      </button>
    ))}
  </div>
);

export default PaymentOperators;
