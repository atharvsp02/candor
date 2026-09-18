import type { SVGProps } from 'react';

const Frame = ({ children, ...rest }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 260 132" fill="none" className="tile-art" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const Person = ({ x, tone }: { x: number; tone: string }) => (
  <g stroke={tone} strokeWidth="1.6">
    <circle cx={x} cy="16" r="7.5" />
    <path d={`M${x - 13} 36a13 13 0 0 1 26 0`} strokeLinecap="round" />
  </g>
);

const Ballot = ({ x, tone, marked }: { x: number; tone: string; marked?: boolean }) => (
  <g stroke={tone} strokeWidth="1.6">
    <rect x={x - 17} y="82" width="34" height="26" rx="5" />
    {marked ? (
      <path d={`M${x - 7} 95l5 5 9-10`} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d={`M${x - 8} 92h16M${x - 8} 99h10`} strokeLinecap="round" />
    )}
  </g>
);

export function LinkedBallots() {
  const dim = 'rgba(255,255,255,0.28)';
  const lit = '#e0782a';
  return (
    <Frame>
      {[52, 130, 208].map((x, index) => {
        const tone = index === 1 ? lit : dim;
        return (
          <g key={x}>
            <Person x={x} tone={tone} />
            <Ballot x={x} tone={tone} marked={index === 1} />
            <path d={`M${x} 44v30`} stroke={tone} strokeWidth="1.6" strokeDasharray="3 5" strokeLinecap="round" />
          </g>
        );
      })}
      <g stroke={lit} strokeWidth="1.4">
        <rect x="100" y="52" width="60" height="16" rx="8" fill="#151413" />
        <path d="M118 60h24M112 60h.01" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

export function SealedResults() {
  const dim = 'rgba(255,255,255,0.26)';
  const lit = '#b06fa8';
  return (
    <Frame>
      <rect x="28" y="16" width="204" height="100" rx="10" stroke={dim} strokeWidth="1.6" />
      <path d="M28 40h204" stroke={dim} strokeWidth="1.6" />
      <g stroke={dim} strokeWidth="1.4" strokeLinecap="round">
        <path d="M44 28h.01M54 28h.01M64 28h.01" />
      </g>
      <g stroke={dim} strokeWidth="9" strokeLinecap="round" opacity="0.55">
        <path d="M60 100V78M84 100V62M108 100V88M156 100V70M180 100V84M204 100V92" />
      </g>
      <g>
        <rect x="112" y="56" width="40" height="46" rx="8" fill="#151413" stroke={lit} strokeWidth="1.6" />
        <path d="M122 72v-6a10 10 0 0 1 20 0v6" stroke={lit} strokeWidth="1.6" />
        <rect x="118" y="72" width="28" height="22" rx="5" stroke={lit} strokeWidth="1.6" />
        <path d="M132 80v6" stroke={lit} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

export function RepeatBallots() {
  const dim = 'rgba(255,255,255,0.26)';
  const lit = '#dcb461';
  return (
    <Frame>
      <g stroke={lit} strokeWidth="1.6">
        <circle cx="48" cy="46" r="10" />
        <path d="M30 74a18 18 0 0 1 36 0" strokeLinecap="round" />
      </g>
      {[24, 58, 92].map((y, index) => (
        <g key={y}>
          <path
            d={`M74 ${index === 1 ? 58 : 58 + (y - 58) * 0.35}C104 ${58 + (y - 58) * 0.5} 118 ${y + 10} 146 ${y + 10}`}
            stroke={index === 0 ? lit : dim}
            strokeWidth="1.6"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <g stroke={index === 0 ? lit : dim} strokeWidth="1.6">
            <rect x="152" y={y - 2} width="76" height="26" rx="6" fill="#151413" />
            <path d={`M164 ${y + 11}l5 5 9-10`} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M188 ${y + 11}h28`} strokeLinecap="round" opacity="0.7" />
          </g>
        </g>
      ))}
    </Frame>
  );
}
