const DataHomeLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 150 35" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Icône Triangle (Toit/Data) */}
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    {/* Texte "data home" stylisé */}
    <text 
      x="10" 
      y="28" 
      fontFamily="sans-serif" 
      fontSize="22" 
      fontWeight="300" 
      fill="currentColor" 
      letterSpacing="-0.02em"
    >
      data home
    </text>
  </svg>
);