/**
 * Custom Gender Icons - Visually distinguishable male/female silhouettes
 * @feature 025-guest-page-fixes
 */

import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Male Icon - Single figure with straight body/legs
 * Circle head + rectangular/parallel body shape
 */
export function MaleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Head */}
      <circle cx="10" cy="4" r="3" />
      {/* Body - straight rectangular shape with legs */}
      <rect x="7" y="8" width="6" height="5" rx="0.5" />
      {/* Left leg */}
      <rect x="7" y="13" width="2.5" height="6" rx="0.5" />
      {/* Right leg */}
      <rect x="10.5" y="13" width="2.5" height="6" rx="0.5" />
    </svg>
  );
}

/**
 * Female Icon - Single figure with triangular dress/skirt
 * Circle head + A-shaped dress silhouette
 */
export function FemaleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Head */}
      <circle cx="10" cy="4" r="3" />
      {/* Dress/skirt - triangular A-shape */}
      <path d="M10 8 L5 19 L15 19 Z" />
    </svg>
  );
}
