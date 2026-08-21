export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="var(--color-information)" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--color-text-secondary)" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2.4" fill="var(--color-information)" />
    </svg>
  )
}
