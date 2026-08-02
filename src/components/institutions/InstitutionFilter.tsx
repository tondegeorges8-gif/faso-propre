import React from 'react';
import { Button } from '@/components/ui/button';
import { INSTITUTIONS } from '@/data/institutions';

interface InstitutionFilterProps {
  value: string;
  onChange: (value: string) => void;
  counts?: Record<string, number>;
  totalCount?: number;
}

const InstitutionFilter: React.FC<InstitutionFilterProps> = ({
  value,
  onChange,
  counts = {},
  totalCount,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={value === 'all' ? 'default' : 'outline'}
        size="sm"
        className="shrink-0"
        onClick={() => onChange('all')}
      >
        Toutes les institutions{typeof totalCount === 'number' ? ` (${totalCount})` : ''}
      </Button>
      {Object.entries(INSTITUTIONS).map(([key, inst]) => (
        <Button
          key={key}
          variant={value === key ? 'default' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => onChange(key)}
        >
          <span className="mr-1">{inst.icon}</span>
          {inst.nom.split(' - ')[0].split(' / ')[0]}
          {counts[key] !== undefined ? ` (${counts[key]})` : ''}
        </Button>
      ))}
    </div>
  );
};

export default InstitutionFilter;
