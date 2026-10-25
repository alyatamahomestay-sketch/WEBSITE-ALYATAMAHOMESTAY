import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg';
}

export default function AlyatamaLogo({
  className = '',
  iconOnly = false,
  variant = 'brand',
  size = 'md',
}: LogoProps) {
  // Brand colors: Primary Brown #806044, Dark Espresso #392B21, Cream #F6F0E7
  const textColor =
    variant === 'light' ? 'text-stone-50' : variant === 'dark' ? 'text-[#392B21]' : 'text-[#806044]';
  const subTextColor =
    variant === 'light' ? 'text-stone-400' : 'text-[#756A5F]';
  const iconBg =
    variant === 'light'
      ? 'bg-[#806044]/20 border-[#806044]/40 text-[#E7D8C5]'
      : 'bg-[#806044]/10 border-[#806044]/30 text-[#806044]';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Geometric 'A' Brand Icon matching the flyer */}
      <div
        className={`${iconSizes[size]} rounded-xl border flex items-center justify-center shrink-0 ${iconBg} shadow-xs`}
        title="ALYATAMA HOMESTAY - Penginapan Syariah"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-6 h-6 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized Modern Islamic Geometric 'A' */}
          <path d="M 50 12 L 18 84 L 36 84 L 50 48 L 64 84 L 82 84 Z" />
          {/* Subtle Crescent / Inner arch */}
          <path
            d="M 50 32 C 55 42, 60 55, 66 70 L 34 70 C 40 55, 45 42, 50 32 Z"
            fill="#F6F0E7"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`font-serif tracking-widest font-bold uppercase leading-none ${textSizes[size]} ${textColor}`}>
            ALYATAMA
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[9px] tracking-widest uppercase font-semibold ${subTextColor}`}>
              HOMESTAY
            </span>
            <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#65715A]/15 text-[#65715A] font-semibold tracking-wider uppercase">
              Syariah
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
