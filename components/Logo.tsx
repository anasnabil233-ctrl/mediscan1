import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Shape (Soft Square) */}
      <rect x="5" y="5" width="90" height="90" rx="20" className="fill-teal-600" />
      
      {/* Medical Cross (Negative Space/White) */}
      <path 
        d="M50 20V80M20 50H80" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* AI/Tech Nodes (Pulse) */}
      <circle cx="50" cy="50" r="8" className="fill-teal-200" />
      <circle cx="50" cy="20" r="4" className="fill-white" />
      <circle cx="80" cy="50" r="4" className="fill-white" />
      <circle cx="50" cy="80" r="4" className="fill-white" />
      <circle cx="20" cy="50" r="4" className="fill-white" />
      
      {/* Connecting Lines (Circuitry effect) */}
      <path d="M50 35V42" stroke="white" strokeWidth="2" />
      <path d="M65 50H58" stroke="white" strokeWidth="2" />
      <path d="M50 65V58" stroke="white" strokeWidth="2" />
      <path d="M35 50H42" stroke="white" strokeWidth="2" />
      
      {/* Scan Line Effect */}
      <path d="M25 65L35 75L75 25" stroke="white" strokeWidth="0" className="opacity-0" />
    </svg>
  );
};

export default Logo;