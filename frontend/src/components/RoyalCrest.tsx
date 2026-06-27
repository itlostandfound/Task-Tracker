export function RoyalCrest() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 select-none pointer-events-none">
      <svg
        className="royal-crest w-44 h-auto"
        viewBox="0 0 200 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="crestGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff4d0" />
            <stop offset="35%" stopColor="#f5c842" />
            <stop offset="70%" stopColor="#e4a820" />
            <stop offset="100%" stopColor="#b8840a" />
          </linearGradient>
          <linearGradient id="crestField" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a4a" />
            <stop offset="100%" stopColor="#0a0a24" />
          </linearGradient>
        </defs>

        {/* Crown */}
        <g stroke="#8a6308" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M 52 58 L 58 26 L 80 47 L 100 18 L 120 47 L 142 26 L 148 58 Z" fill="url(#crestGold)" />
          <rect x="50" y="56" width="100" height="10" rx="2.5" fill="url(#crestGold)" />
          <circle cx="58" cy="23" r="4" fill="#f5c842" />
          <circle cx="100" cy="14" r="5" fill="#f5c842" />
          <circle cx="142" cy="23" r="4" fill="#f5c842" />
          <circle cx="74" cy="61" r="2.6" fill="#7c3aed" stroke="none" />
          <circle cx="100" cy="61" r="2.8" fill="#b91c4a" stroke="none" />
          <circle cx="126" cy="61" r="2.6" fill="#7c3aed" stroke="none" />
        </g>

        {/* Shield */}
        <path
          d="M 45 72 L 155 72 L 155 150 Q 155 212 100 236 Q 45 212 45 150 Z"
          fill="url(#crestField)"
          stroke="url(#crestGold)"
          strokeWidth="4"
        />
        <path
          d="M 53 80 L 147 80 L 147 150 Q 147 205 100 226 Q 53 205 53 150 Z"
          fill="none"
          stroke="#e4a820"
          strokeWidth="1"
          opacity="0.35"
        />

        {/* Crossed swords */}
        <g stroke="url(#crestGold)" strokeLinecap="round">
          <line x1="78" y1="198" x2="132" y2="104" strokeWidth="4" />
          <line x1="122" y1="198" x2="68" y2="104" strokeWidth="4" />
          {/* tips */}
          <path d="M 132 104 l -5 2 l 3 5 Z" fill="url(#crestGold)" stroke="none" />
          <path d="M 68 104 l 5 2 l -3 5 Z" fill="url(#crestGold)" stroke="none" />
          {/* cross guards */}
          <line x1="66" y1="202" x2="90" y2="190" strokeWidth="3" />
          <line x1="134" y1="202" x2="110" y2="190" strokeWidth="3" />
          {/* pommels */}
          <circle cx="74" cy="204" r="3.5" fill="url(#crestGold)" stroke="none" />
          <circle cx="126" cy="204" r="3.5" fill="url(#crestGold)" stroke="none" />
        </g>

        {/* Central gem */}
        <circle cx="100" cy="150" r="9" fill="#b91c4a" stroke="url(#crestGold)" strokeWidth="2.5" />
        <circle cx="97" cy="147" r="2.5" fill="#ff8fa8" opacity="0.8" />

        {/* Twinkling sparkles */}
        <circle className="crest-sparkle" style={{ animationDelay: '0s' }} cx="40" cy="95" r="2" fill="#fff4d0" />
        <circle className="crest-sparkle" style={{ animationDelay: '1s' }} cx="162" cy="120" r="2.5" fill="#fff4d0" />
        <circle className="crest-sparkle" style={{ animationDelay: '2s' }} cx="150" cy="200" r="1.8" fill="#fff4d0" />
        <circle className="crest-sparkle" style={{ animationDelay: '1.6s' }} cx="48" cy="185" r="1.8" fill="#fff4d0" />
      </svg>

      <div className="flourish my-4 w-32"><span>⚜</span></div>
      <p className="text-xs text-royal-gold/60 font-serif italic leading-snug text-center px-2">
        Problem Solved...Problem Staying Solved
      </p>
      <div className="flourish my-3 w-24"><span>·</span></div>
      <p className="text-xs text-royal-gold/50 font-serif italic leading-snug text-center px-2">
        Version 2.0
      </p>
    </div>
  )
}
