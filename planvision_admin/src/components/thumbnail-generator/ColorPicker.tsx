interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  placeholder?: string;
}

export function ColorPicker({ label, value, onChange, placeholder = '#000000' }: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow partial input while typing
    if (val === '' || /^#?[0-9A-Fa-f]{0,6}$/.test(val)) {
      // Add # if missing
      const hex = val.startsWith('#') ? val : `#${val}`;
      onChange(hex);
    }
  };

  const displayColor = value || placeholder;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400">{label}</label>
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
        {/* Color input (native picker) */}
        <input
          type="color"
          value={displayColor}
          onChange={handleColorChange}
          className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
        />

        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 hover:bg-white/10 rounded transition"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface ColorPaletteSectionProps {
  primary: string;
  secondary: string;
  neutral: string;
  onPrimaryChange: (hex: string) => void;
  onSecondaryChange: (hex: string) => void;
  onNeutralChange: (hex: string) => void;
}

export function ColorPaletteSection({
  primary,
  secondary,
  neutral,
  onPrimaryChange,
  onSecondaryChange,
  onNeutralChange,
}: ColorPaletteSectionProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">Color Palette (Optional)</label>
      <div className="grid grid-cols-3 gap-3">
        <ColorPicker
          label="Primary"
          value={primary}
          onChange={onPrimaryChange}
          placeholder="#3B82F6"
        />
        <ColorPicker
          label="Secondary"
          value={secondary}
          onChange={onSecondaryChange}
          placeholder="#10B981"
        />
        <ColorPicker
          label="Neutral"
          value={neutral}
          onChange={onNeutralChange}
          placeholder="#6B7280"
        />
      </div>
      <p className="text-xs text-slate-500">
        Define colors to influence the generated design palette
      </p>
    </div>
  );
}
