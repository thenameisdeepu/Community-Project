import React from 'react';

export interface NeighbrlyWordmarkProps {
  className?: string;
  dotColor?: string;
  dotClassName?: string;
  glow?: boolean;
  prefix?: string;
  suffix?: string;
  title?: string;
}

/**
 * NeighbrlyWordmark renders the brand wordmark "Neighbrly" with the iconic green dot on the "i"
 * in a robust, scalable manner using relative font-size em units and dotless-ı typography.
 */
export const NeighbrlyWordmark: React.FC<NeighbrlyWordmarkProps> = ({
  className = '',
  dotColor = '#22c55e',
  dotClassName = '',
  glow = false,
  prefix,
  suffix,
  title = 'Neighbrly',
}) => {
  return (
    <span
      className={`inline-flex items-baseline select-none ${className}`}
      aria-label={`${prefix ? prefix + ' ' : ''}Neighbrly${suffix ? ' ' + suffix : ''}`}
      title={title}
    >
      {prefix && <span>{prefix}&nbsp;</span>}
      <span aria-hidden="true" className="inline-flex items-baseline leading-none">
        <span>Ne</span>
        <span className="relative inline-block leading-none">
          {/* Stem of the letter 'i' rendered using dotless ı matching the font stem */}
          <span>ı</span>
          {/* The signature emerald green dot (tittle) of the letter 'i' */}
          <span
            className={`absolute top-[0.06em] left-1/2 -translate-x-1/2 w-[0.22em] h-[0.22em] rounded-full pointer-events-none ${
              glow
                ? 'shadow-[0_0_12px_#22c55e,0_0_6px_#82f5c1]'
                : 'shadow-[0_0_3px_rgba(34,197,94,0.45)]'
            } ${dotClassName}`}
            style={{ backgroundColor: dotColor }}
          />
        </span>
        <span>ghbrly</span>
      </span>
      {suffix && <span>&nbsp;{suffix}</span>}
    </span>
  );
};
