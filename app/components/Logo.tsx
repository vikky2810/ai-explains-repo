import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Draws the mark on its solid accent tile, matching the favicon. */
  tile?: boolean;
}

/**
 * The brand mark: a prompt chevron and cursor.
 *
 * Two strokes, no gradients, no fill detail, so it survives being scaled down
 * to a 16px favicon. Drawn in `currentColor` by default so the parent decides
 * the colour; pass `tile` for the lime-tile lockup used as an app icon.
 */
const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', tile = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="AI Explains This Repo"
      >
        {tile && <rect width="32" height="32" rx="7" fill="#A3E635" />}
        <path
          d="M10 10L16 16L10 22"
          stroke={tile ? '#0B0B0C' : 'currentColor'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 22H23"
          stroke={tile ? '#0B0B0C' : 'currentColor'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
