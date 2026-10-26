import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function AlyatamaLogo({
  className = '',
  variant = 'white',
  size = 'md',
  showSubtitle = false,
}: LogoProps) {
  // Use pure solid white logo on dark backgrounds, solid dark logo on white/light surfaces
  const logoSrc =
    variant === 'dark'
      ? '/images/alyatama-logo-dark.png'
      : '/images/alyatama-logo-white.png';

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
        className={`${sizeClasses[size]} object-contain`}
      />
      {showSubtitle && (
        <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/10 text-[#F6F0E7] border border-white/20">
          Syariah
        </span>
      )}
    </div>
  );
}
