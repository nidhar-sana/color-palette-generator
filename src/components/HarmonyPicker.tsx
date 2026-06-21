import React from 'react';
import { type HarmonyMode } from '../utils/colorUtils';

interface HarmonyMode_Option {
  value: HarmonyMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const modes: HarmonyMode_Option[] = [
  {
    value: 'random',
    label: 'Random',
    description: 'Completely random colors',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="16 3 21 3 21 8"/><polyline points="4 20 9 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><polyline points="8 3 3 3 3 8"/>
        <line x1="3" y1="3" x2="10" y2="10"/><polyline points="16 21 21 21 21 16"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
      </svg>
    ),
  },
  {
    value: 'complementary',
    label: 'Complementary',
    description: 'Opposite hues on the wheel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    value: 'analogous',
    label: 'Analogous',
    description: 'Adjacent hues on the wheel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2 A10 10 0 0 1 22 12"/>
      </svg>
    ),
  },
  {
    value: 'triadic',
    label: 'Triadic',
    description: 'Three evenly spaced hues',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 22 20 2 20"/>
      </svg>
    ),
  },
  {
    value: 'tetradic',
    label: 'Tetradic',
    description: 'Four evenly spaced hues',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18"/>
      </svg>
    ),
  },
  {
    value: 'split-complementary',
    label: 'Split-Comp',
    description: 'Base + two adjacent complements',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l5 18H7z"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    value: 'monochromatic',
    label: 'Mono',
    description: 'Single hue, varying lightness',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="8" width="20" height="8" rx="2"/>
        <line x1="6" y1="8" x2="6" y2="16"/>
        <line x1="10" y1="8" x2="10" y2="16"/>
        <line x1="14" y1="8" x2="14" y2="16"/>
        <line x1="18" y1="8" x2="18" y2="16"/>
      </svg>
    ),
  },
];

interface HarmonyPickerProps {
  selected: HarmonyMode;
  onChange: (mode: HarmonyMode) => void;
}

export const HarmonyPicker: React.FC<HarmonyPickerProps> = ({ selected, onChange }) => {
  return (
    <div className="harmony-picker">
      {modes.map((mode) => (
        <button
          key={mode.value}
          className={`harmony-btn ${selected === mode.value ? 'active' : ''}`}
          onClick={() => onChange(mode.value)}
          title={mode.description}
          aria-label={`${mode.label}: ${mode.description}`}
          aria-pressed={selected === mode.value}
        >
          <span className="harmony-icon">{mode.icon}</span>
          <span className="harmony-label">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};
