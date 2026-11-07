type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo-image${compact ? ' brand-logo-compact' : ''}${className ? ` ${className}` : ''}`}
      src="/sarguardian-logo.png"
      alt="SARGuardian"
      decoding="async"
    />
  );
}
