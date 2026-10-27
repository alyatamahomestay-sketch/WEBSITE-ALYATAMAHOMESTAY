import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'lightbrown' | 'forest' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function AlyatamaLogo({
  className = '',
  variant = 'white',
  size = 'md',
  showSubtitle = false,
}: LogoProps) {
  // Three canonical V3.1 transparent variants + dark espresso print variant
  const getLogoSrc = () => {
    switch (variant) {
      case 'forest':
        return '/images/alyatama-logo-forest.png';
      case 'lightbrown':
        return '/images/alyatama-logo-lightbrown.png';
      case 'dark':
        return '/images/alyatama-logo-dark.png';
      case 'white':
      case 'light':
      default:
        return '/images/alyatama-logo-white.png';
    }
  };

  const logoSrc = getLogoSrc();

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
