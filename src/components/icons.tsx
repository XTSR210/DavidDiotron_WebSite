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

/** WhatsApp — discussion directe client ↔ atelier. */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.9 7.8c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.9.9-1 2.2-.2 3.9.8 1.7 2.3 3.4 4.4 4.4 1.7.8 3 .7 3.9-.2.2-.2.3-.5.3-.7v-.5c0-.2 0-.4-.5-.6l-1.7-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.4-.6-.6-1-1.3-1.4-2-.1-.2-.1-.4.1-.5l.9-.7c.2-.2.2-.4.1-.6l-.8-1.7Z" />
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

/* ---------- Commercial trust icons ---------- */

/** Ribbon award — prizes, exhibitions, credibility. */
export function AwardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </Svg>
  );
}

/** Shipping box — worldwide delivery, secure packing. */
export function PackageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Svg>
  );
}

/** Chat bubbles — the artist answers directly. */
export function ChatIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </Svg>
  );
}

/** Chevrons inside brackets — format/size flexibility. */
export function ExpandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </Svg>
  );
}

/** Rolled diploma — custom certificate of authenticity. */
export function ScrollIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
    </Svg>
  );
}

/** Handshake between two people — trust & payment on agreement. */
export function HandshakeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </Svg>
  );
}

/** Banknote — payment on delivery/invoice. */
export function WalletIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
      <circle cx="16.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Calendar clock — lead time / planning a visit. */
export function CalendarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </Svg>
  );
}

/** Google-style star (filled) for ratings. */
export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2l2.9 6.26 6.85.79-5.06 4.66 1.35 6.77L12 17.15l-6.04 3.33 1.35-6.77L2.25 9.05l6.85-.79L12 2z" />
    </svg>
  );
}

/** Solid heart — collector love / wishlist. */
export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 21s-7.5-4.7-10-9.3C.4 8.4 2.4 4.5 6.2 4.1c2-.2 4 .7 5.8 3 1.8-2.3 3.8-3.2 5.8-3 3.8.4 5.8 4.3 4.2 7.6C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}
