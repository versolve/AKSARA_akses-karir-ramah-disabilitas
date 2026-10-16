import { ChevronDown } from 'lucide-react';
import { useState, type ReactElement } from 'react';

type ScaleValue = 80 | 90 | 100 | 110 | 125;

interface TextScaleSelectorProps {
  currentScale: ScaleValue;
  onUpdate: (scale: ScaleValue) => void;
}

const SCALES: { value: ScaleValue; label: string }[] = [
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
  { value: 100, label: '100%' },
  { value: 110, label: '110%' },
  { value: 125, label: '125%' },
];

export function TextScaleSelector({ currentScale, onUpdate }: TextScaleSelectorProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: ScaleValue): void => {
    onUpdate(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Ubah ukuran teks"
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        style={{ minWidth: '44px' }}
      >
        <span className="text-sm font-medium">{currentScale}%</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Pilih ukuran teks"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {SCALES.map((option) => (
            <button
              key={option.value}
              role="option"
              aria-selected={currentScale === option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex w-full px-4 py-3 text-left hover:bg-slate-50 ${currentScale === option.value ? 'bg-emerald-50' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <span className={`${currentScale === option.value ? 'text-emerald-800 font-bold' : 'text-slate-700'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
