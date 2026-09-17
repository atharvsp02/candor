import type { CSSProperties, ReactNode } from 'react';

export type Tone = 'ember' | 'dusk' | 'sea' | 'gold' | 'ash';

export const Hatch = () => <div className="hatch" aria-hidden="true" />;

type HeadProps = {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
};

export const SectionHead = ({ kicker, title, children }: HeadProps) => (
  <header className="section-head">
    <span className="kicker">{kicker}</span>
    <h2>{title}</h2>
    {children}
  </header>
);

type ArtProps = {
  tone: Tone;
  pos?: string;
  zoom?: string;
  className?: string;
  children?: ReactNode;
};

export const Art = ({ tone, pos, zoom, className, children }: ArtProps) => (
  <div
    className={className ? `art ${className}` : 'art'}
    data-tone={tone}
    style={{ ...(pos && { '--pos': pos }), ...(zoom && { '--zoom': zoom }) } as CSSProperties}
  >
    {children}
  </div>
);

const GLYPHS = {
  unlink:
    '<path d="M28 16h-10a16 16 0 0 0 0 32h10v-9h-10a7 7 0 0 1 0-14h10Z"/><path d="M36 16h10a16 16 0 0 1 0 32h-10v-9h10a7 7 0 0 0 0-14h-10Z"/>',
  eye: '<path d="M32 14c13 0 23 9 28 18-5 9-15 18-28 18S9 41 4 32c5-9 15-18 28-18Z"/><circle fill="#000" cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="4"/>',
  seal: '<path d="M32 4l6 5 8-1 3 7 7 4-1 8 5 6-5 6 1 8-7 4-3 7-8-1-6 5-6-5-8 1-3-7-7-4 1-8-5-6 5-6-1-8 7-4 3-7 8 1 6-5Z"/><path fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M22 33l7 7 13-15"/>',
  wallet:
    '<rect x="6" y="16" width="52" height="38" rx="8"/><path d="M12 16l30-9c3-1 6 1 6 4v5H12Z"/><rect fill="#000" x="38" y="29" width="20" height="12" rx="6"/><circle cx="46" cy="35" r="3"/>',
  key: '<circle cx="22" cy="32" r="14"/><circle fill="#000" cx="18" cy="32" r="5"/><path d="M34 28h24v8h-5v8h-8v-8h-11Z"/>',
  ballot:
    '<path d="M18 6h28v30H18Z"/><path fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M24 20l6 6 10-11"/><path d="M4 34h14v6h28v-6h14v24H4Z"/>',
} as const;

export type GlyphName = keyof typeof GLYPHS;

const glyphUrl = (name: GlyphName) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><mask id="m"><rect width="64" height="64" fill="#000"/><g fill="#fff">${GLYPHS[name]}</g></mask><rect width="64" height="64" fill="#fff" mask="url(#m)"/></svg>`,
  )}")`;

export const Glyph = ({ name, tone }: { name: GlyphName; tone: Tone }) => (
  <span
    className="glyph art"
    data-tone={tone}
    aria-hidden="true"
    style={{ maskImage: glyphUrl(name), WebkitMaskImage: glyphUrl(name) } as CSSProperties}
  />
);
