/**
 * Hand-drawn inline SVG icons replacing emojis across the site.
 * Stroke-based, inherits currentColor so each usage can pick its own
 * pop-art accent (magenta / amber / teal).
 */

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

/** Paintbrush — the artist's tool (atelier entrance, manifesto). */
export function BrushIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m14.622 17.897-10.68-2.913" />
      <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.943a2.41 2.41 0 0 1 0 3.41l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.41 0l.944.944a.5.5 0 0 0 .707 0z" />
      <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.518.518 0 0 0-.302.819l7.535 7.535a.518.518 0 0 0 .819-.302c.488-2.612 1.238-4.779 3.948-6.583" />
    </Svg>
  );
}

/** Artist palette — the colourful universe of the painter. */
export function PaletteIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      <circle cx="13.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Scissors — cutting and reassembling torn posters. */
export function ScissorsIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </Svg>
  );
}

/** Open hand — every piece is painted by hand, only once. */
export function HandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </Svg>
  );
}

/** Canvas with a check — an order confirmed. */
export function CanvasCheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </Svg>
  );
}

/* ---------- Contact & social icons ---------- */

/** Instagram camera. */
export function InstagramIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Landline / mobile handset. */
export function PhoneIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

/** Envelope for email. */
export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </Svg>
  );
}

/** Map pin for the workshop address. */
export function MapPinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}
