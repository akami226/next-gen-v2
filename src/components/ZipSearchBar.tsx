import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { validateZip } from '../lib/zipValidation';

interface ZipSearchBarProps {
  onSearch: (zip: string) => Promise<string | null>;
  onClear: () => void;
  hasFilter: boolean;
  isLoading: boolean;
}

export default function ZipSearchBar({ onSearch, onClear, hasFilter, isLoading }: ZipSearchBarProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    const clientError = validateZip(trimmed);
    if (clientError) {
      setError(clientError);
      return;
    }
    setError('');
    const apiError = await onSearch(trimmed);
    if (apiError) setError(apiError);
  };

  const handleClear = () => {
    setValue('');
    setError('');
    onClear();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5);
    setValue(v);
    if (error) setError('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center gap-2 bg-white/[0.04] border rounded-xl px-3.5 py-2.5 transition-all duration-300 ${
          error
            ? 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.06)]'
            : 'border-white/[0.08] focus-within:border-[#FF4500]/40 focus-within:shadow-[0_0_16px_rgba(255,69,0,0.08)]'
        }`}>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            placeholder="Enter your zip code..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
            maxLength={5}
            disabled={isLoading}
          />

          {hasFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium text-white/35 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200"
            >
              Clear
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="shrink-0 w-8 h-8 rounded-lg bg-[#FF4500] hover:bg-[#FF5722] disabled:opacity-60 flex items-center justify-center transition-all duration-200 shadow-md shadow-[#FF4500]/15"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 pl-1">
          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          <p className="text-[10px] text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
