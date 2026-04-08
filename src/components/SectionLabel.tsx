interface SectionLabelProps {
  label: string;
}

export default function SectionLabel({ label }: SectionLabelProps) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-3">
      {label}
    </h3>
  );
}
