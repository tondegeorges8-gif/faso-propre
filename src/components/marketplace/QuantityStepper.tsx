import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

const QuantityStepper: React.FC<Props> = ({ value, onChange, min = 1 }) => (
  <div className="inline-flex items-center rounded-md border border-border overflow-hidden">
    <button
      type="button"
      aria-label="Diminuer la quantité"
      className="px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-40"
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
    >
      <Minus size={14} />
    </button>
    <span className="w-9 text-center text-sm font-semibold tabular-nums">{value}</span>
    <button
      type="button"
      aria-label="Augmenter la quantité"
      className="px-2 py-1 text-muted-foreground hover:bg-muted"
      onClick={() => onChange(value + 1)}
    >
      <Plus size={14} />
    </button>
  </div>
);

export default QuantityStepper;
