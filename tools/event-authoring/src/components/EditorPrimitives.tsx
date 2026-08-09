import type { ReactNode } from 'react';

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="inspector-section">
    <div className="section-title">{title}</div>
    {children}
  </section>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);

export const NumberInput = ({ value, onChange, min }: { value: number; onChange: (value: number) => void; min?: number }) => (
  <input type="number" value={value} min={min} onChange={(e) => onChange(Number(e.target.value))} />
);

export const IdSelect = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; name?: string }[];
  onChange: (value: string) => void;
}) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">— select —</option>
    {options.map((option) => <option key={option.id} value={option.id}>{option.name ? `${option.name} (${option.id})` : option.id}</option>)}
  </select>
);

