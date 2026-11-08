export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`logo ${inverted ? "logo--inverted" : ""}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="logo__mark" />
        <path d="M9 22V10h3.2l4.3 7.1V10H20v12h-3.1l-4.4-7.2V22z" className="logo__glyph" />
        <circle cx="23.5" cy="10.5" r="2.2" className="logo__dot" />
      </svg>
      <span className="logo__word">Noema</span>
    </span>
  );
}
