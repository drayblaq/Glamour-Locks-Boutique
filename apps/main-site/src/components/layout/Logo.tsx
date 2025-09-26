import Link from 'next/link';

const Logo = () => {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-2 text-2xl font-black text-white hover:text-gray-200 transition-all duration-300 group drop-shadow-lg" 
      aria-label="Glamour Locks Boutique Home"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="h-10 w-10 transition-transform duration-300 ease-in-out group-hover:rotate-12 group-hover:scale-110 text-white group-hover:text-gray-200 drop-shadow-xl"
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
        <path d="M20,20 Q24,12 32,18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M18,24 Q10,28 16,32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M44,44 Q40,52 32,46" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M46,40 Q54,36 50,32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="20"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fill="currentColor"
          stroke="none"
          dy=".1em"
        >
          gSL
        </text>
      </svg>
      <span className="font-black tracking-tight drop-shadow-lg text-white">Glamour Locks</span>
    </Link>
  );
};

export default Logo;