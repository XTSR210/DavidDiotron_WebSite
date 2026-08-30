/** A single artwork by David Drioton. */
export interface Artwork {
  id: string;
  title: string;
  /** Year painted, if known. */
  year?: number;
  /** Technique / medium, e.g. "Technique mixte sur toile". */
  technique?: string;
  /** Painted width in cm. */
  widthCm?: number;
  /** Painted height in cm. */
  heightCm?: number;
  /** Asking price in euros, when the piece is for sale. */
  priceEur?: number;
  /** True when the piece is not priced publicly. */
  priceOnRequest?: boolean;
  /** `/artworks/…` for bundled works, `/uploads/…` for admin uploads, or an absolute URL. */
  image: string;
  /** Where the image came from, e.g. "Instagram @daviddrioton". */
  source?: string;
  /** Free-form note shown under the title. */
  note?: string;
}

/** A commission order placed from the order page. */
export interface Order {
  id: string;
  /** Artwork used as the style reference, when one was picked. */
  referenceId?: string;
  title: string;
  widthCm: number;
  heightCm: number;
  areaCm2: number;
  priceEur: number;
  name: string;
  email: string;
  message?: string;
  createdAt: string;
  /** Payment is simulated while the site runs on localhost. */
  status: "pending-payment" | "paid";
}
