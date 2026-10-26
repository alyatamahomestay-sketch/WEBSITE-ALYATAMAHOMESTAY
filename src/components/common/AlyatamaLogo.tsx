import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function AlyatamaLogo({
  className = '',
  variant = 'brand',
  size = 'md',
  showSubtitle = false,
}: LogoProps) {
  // Use light logo on dark backgrounds, standard logo on light backgrounds
  const logoSrc =
    variant === 'light'
      ? '/images/alyatama-logo-light.png'
      : '/images/alyatama-logo.png';

  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-14 sm:h-16 w-auto',
    xl: 'h-20 sm:h-24 w-auto',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="ALYATAMA HOMESTAY"
        className={`${sizeClasses[size]} object-contain drop-shadow-xs`}
      />
      {showSubtitle && (
        <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-[#806044]/15 text-[#C9A84C] border border-[#806044]/30">
          Syariah
        </span>
      )}
    </div>
  );
}
