'use client';

interface MasterSwitchProps {
  isReal: boolean;
  onChange: (isReal: boolean) => void;
}

export default function MasterSwitch({ isReal, onChange }: MasterSwitchProps) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          !isReal
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        Nominal
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isReal
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        Real (Poder Adquisitivo)
      </button>
    </div>
  );
}
