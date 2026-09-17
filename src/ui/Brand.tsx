type BrandProps = {
  href?: string;
  size?: number;
};

export const BrandMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
    <rect width="28" height="28" rx="8" fill="#fff" />
    <path d="M19.4 9.2a7 7 0 1 0 0 9.6" fill="none" stroke="#111" strokeWidth="3.2" strokeLinecap="round" />
    <circle cx="14" cy="14" r="2.2" fill="#111" />
  </svg>
);

export function Brand({ href = '/', size = 28 }: BrandProps) {
  return (
    <a className="brand" href={href} aria-label="Candor home">
      <BrandMark size={size} />
      <span>Candor</span>
    </a>
  );
}
