import React from 'react';

export type LogoVariant = 'emerald' | 'blue' | 'magenta';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: LogoVariant;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'emerald',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8',
      text: 'text-base',
      subtext: 'text-[10px]',
      badge: 'text-[9px] px-1 py-0.2',
    },
    md: {
      box: 'w-10 h-10',
      text: 'text-lg',
      subtext: 'text-[11px]',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      box: 'w-13 h-13',
      text: 'text-xl',
      subtext: 'text-xs',
      badge: 'text-[11px] px-2 py-0.5',
    },
    xl: {
      box: 'w-16 h-16',
      text: 'text-2xl',
      subtext: 'text-sm',
      badge: 'text-xs px-2.5 py-0.5',
    },
  };

  const current = sizeMap[size];

  // Colors based on the user's reference badge image:
  // Emerald (3rd badge in image): Vibrant emerald-to-teal-to-lime gradient with emerald accents
  // Blue (2nd badge in image): Sky blue to cobalt blue gradient with azure accents
  // Magenta (1st badge in image): Rose to fuchsia/magenta gradient with pink accents
  const variantConfig = {
    emerald: {
      gradId: 'badge-grad-emerald',
      gradStops: (
        <linearGradient id="badge-grad-emerald" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      ),
      accent: '#059669',
      starFill: '#059669',
      bubbleText: '#059669',
      pingColor: 'bg-emerald-400',
      dotColor: 'bg-emerald-500',
      textGradient: 'from-emerald-600 via-teal-500 to-sky-500 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-300',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800',
    },
    blue: {
      gradId: 'badge-grad-blue',
      gradStops: (
        <linearGradient id="badge-grad-blue" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      ),
      accent: '#2563eb',
      starFill: '#2563eb',
      bubbleText: '#2563eb',
      pingColor: 'bg-sky-400',
      dotColor: 'bg-sky-500',
      textGradient: 'from-sky-600 via-blue-500 to-indigo-500 dark:from-sky-400 dark:via-blue-300 dark:to-indigo-300',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300/80 dark:border-sky-800',
    },
    magenta: {
      gradId: 'badge-grad-magenta',
      gradStops: (
        <linearGradient id="badge-grad-magenta" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="45%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      ),
      accent: '#db2777',
      starFill: '#db2777',
      bubbleText: '#db2777',
      pingColor: 'bg-pink-400',
      dotColor: 'bg-pink-500',
      textGradient: 'from-rose-600 via-pink-500 to-fuchsia-500 dark:from-rose-400 dark:via-pink-300 dark:to-fuchsia-300',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300/80 dark:border-rose-800',
    },
  };

  const cfg = variantConfig[variant] || variantConfig.emerald;

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Circular Multilingual Badge Insignia directly derived from user reference image */}
      <div className={`relative shrink-0 ${current.box} transition-transform duration-200 group-hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Color Gradient according to variant */}
            {cfg.gradStops}

            {/* Semicircular text arc path along the inner ring (r = 38.75) */}
            <path id="ll-badge-arc" d="M 11.25,50 A 38.75,38.75 0 0,1 88.75,50" />

            {/* 3 Five-Pointed Stars Group for the lateral gaps */}
            <g id="ll-star-trio">
              {/* Star 1 (upper-side, angle -16°) */}
              <polygon points="87.2,37.3 87.8,38.6 89.2,38.7 88.1,39.6 88.4,40.9 87.2,40.2 86.1,40.9 86.4,39.6 85.3,38.7 86.7,38.6" />
              {/* Star 2 (middle-side, angle 0°) */}
              <polygon points="88.8,48.0 89.3,49.3 90.7,49.4 89.6,50.3 89.9,51.6 88.8,50.9 87.6,51.6 87.9,50.3 86.8,49.4 88.2,49.3" />
              {/* Star 3 (lower-side, angle +16°) */}
              <polygon points="87.2,58.7 87.8,60.0 89.2,60.1 88.1,61.0 88.4,62.3 87.2,61.6 86.1,62.3 86.4,61.0 85.3,60.1 86.7,60.0" />
            </g>
          </defs>

          {/* Realistic Badge Sticker Drop Shadow */}
          <ellipse cx="50" cy="95" rx="34" ry="3.5" fill="#0f172a" fillOpacity="0.12" />

          {/* Outer White Circular Badge Border with Delicate Dashed Stitching */}
          <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="46.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2.5 2" />

          {/* Inner Radiant Gradient Medallion */}
          <circle cx="50" cy="50" r="31" fill={`url(#${cfg.gradId})`} />

          {/* Top Arched Text: MULTILINGUAL */}
          <text
            fontSize="6.8"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="0.2em"
            fill="#0f172a"
          >
            <textPath href="#ll-badge-arc" startOffset="50%" textAnchor="middle">
              MULTILINGUAL
            </textPath>
          </text>

          {/* Bottom Arched Text: MULTILINGUAL (Rotated 180° for seal symmetry) */}
          <g transform="rotate(180 50 50)">
            <text
              fontSize="6.8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              letterSpacing="0.2em"
              fill="#0f172a"
            >
              <textPath href="#ll-badge-arc" startOffset="50%" textAnchor="middle">
                MULTILINGUAL
              </textPath>
            </text>
          </g>

          {/* Right Side 3 Stars */}
          <use href="#ll-star-trio" fill={cfg.starFill} />

          {/* Left Side 3 Stars (180° rotated) */}
          <use href="#ll-star-trio" fill={cfg.starFill} transform="rotate(180 50 50)" />

          {/* Speech Bubble 1: Upper-Left Solid White Bubble with CJK Character '文' */}
          <path
            d="M 41,31 A 10,10 0 0,1 51,41 A 10,10 0 0,1 42.5,50.8 L 32,54 L 35.5,47.5 A 10,10 0 0,1 31,41 A 10,10 0 0,1 41,31 Z"
            fill="#ffffff"
          />
          {/* Unicode Character '文' (Language, Literature, Universal Multilingual Symbol) */}
          <text
            x="41"
            y="41.2"
            textAnchor="middle"
            dominantBaseline="central"
            fill={cfg.bubbleText}
            fontSize="11.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
          >
            文
          </text>

          {/* Speech Bubble 2: Lower-Right Overlapping Outlined Bubble with Latin Character 'A' */}
          <path
            d="M 57,41 A 10,10 0 0,1 67,51 A 10,10 0 0,1 64.5,57.5 L 68,64 L 58.5,60.8 A 10,10 0 0,1 47,51 A 10,10 0 0,1 57,41 Z"
            fill={`url(#${cfg.gradId})`}
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bold Latin Character 'A' */}
          <text
            x="57"
            y="51"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize="12.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            A
          </text>
        </svg>

        {/* Live Active Multilingual Status Indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.pingColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.dotColor} border-2 border-white dark:border-slate-900 shadow-xs`} />
        </span>
      </div>

      {/* Brand Typography & Educational CS Mission */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black ${current.text} leading-none tracking-tight text-slate-900 dark:text-white`}>
              Lingua<span className={`bg-gradient-to-r ${cfg.textGradient} bg-clip-text text-transparent`}>Learn</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md font-bold tracking-wider uppercase border ${cfg.badgeBg} ${current.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse inline-block`} />
              MULTILINGUAL
            </span>
          </div>
          <span className={`${current.subtext} text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-0.5`}>
            Multilingual Education &amp; CS AI Tutor
          </span>
        </div>
      )}
    </div>
  );
};
