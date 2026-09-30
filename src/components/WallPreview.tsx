/**
 * Aperçu à l'échelle : la toile aux dimensions choisies, accrochée au-dessus
 * d'un canapé de 2 m, à côté d'une silhouette d'1,72 m. Le cadrage s'élargit
 * quand la toile grandit, pour que tout reste visible.
 * Unité du dessin : 1 = 1 cm.
 */
export function WallPreview({
  widthCm,
  heightCm,
  image,
  className = "",
}: {
  widthCm: number;
  heightCm: number;
  /** Toile affichée dans le cadre (référence choisie) ; aplat magenta sinon. */
  image?: string;
  className?: string;
}) {
  const w = Math.max(1, widthCm);
  const h = Math.max(1, heightCm);

  const sceneW = Math.max(370, w + 170);
  const sceneH = Math.max(250, h + 130);
  const floor = sceneH - 14;
  const cx = sceneW / 2 - 38;

  const sofa = { x: cx - 100, y: floor - 78, w: 200, h: 78 };
  const canvas = { x: cx - w / 2, y: sofa.y - 22 - h, w, h };
  const personX = cx + Math.max(w / 2, 100) + 42;
  const label = sceneW / 27;

  return (
    <svg
      className={`wallprev ${className}`}
      viewBox={`0 0 ${sceneW} ${sceneH}`}
      role="img"
      aria-label={`Aperçu à l'échelle : toile de ${w} par ${h} centimètres au-dessus d'un canapé de 2 mètres`}
    >
      {/* Sol */}
      <rect x="0" y={floor} width={sceneW} height={sceneH - floor} fill="#0b0a0c" />

      {/* Canapé : dossier, assise, accoudoirs, pieds */}
      <g fill="#0b0a0c">
        <rect x={sofa.x + 10} y={sofa.y} width={sofa.w - 20} height="46" rx="9" />
        <rect x={sofa.x} y={sofa.y + 22} width="26" height="48" rx="9" />
        <rect x={sofa.x + sofa.w - 26} y={sofa.y + 22} width="26" height="48" rx="9" />
        <rect x={sofa.x + 6} y={sofa.y + 40} width={sofa.w - 12} height="30" rx="6" />
        <rect x={sofa.x + 14} y={floor - 9} width="5" height="9" />
        <rect x={sofa.x + sofa.w - 19} y={floor - 9} width="5" height="9" />
      </g>

      {/* Silhouette, 1,72 m */}
      <g fill="#0b0a0c">
        <circle cx={personX} cy={floor - 160} r="12" />
        <path
          d={`M${personX - 21} ${floor - 142} q21 -9 42 0 l4 66 h-9 l-3 76 h-10 l-3 -62 l-3 62 h-10 l-3 -76 h-9 z`}
        />
      </g>

      {/* La toile : ombre portée franche, puis l'image */}
      <rect x={canvas.x + 5} y={canvas.y + 5} width={canvas.w} height={canvas.h} fill="#0b0a0c" />
      {image ? (
        <image
          href={image}
          x={canvas.x}
          y={canvas.y}
          width={canvas.w}
          height={canvas.h}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <rect x={canvas.x} y={canvas.y} width={canvas.w} height={canvas.h} fill="#ec008c" />
      )}
      <rect
        x={canvas.x}
        y={canvas.y}
        width={canvas.w}
        height={canvas.h}
        fill="none"
        stroke="#0b0a0c"
        strokeWidth="1.5"
      />

      {/* Cotes */}
      <g fill="#0b0a0c" fontSize={label} fontWeight="700" textAnchor="middle">
        <text x={cx} y={canvas.y - label * 0.55}>
          {w} cm
        </text>
        <text
          x={canvas.x - label * 0.6}
          y={canvas.y + h / 2}
          transform={`rotate(-90 ${canvas.x - label * 0.6} ${canvas.y + h / 2})`}
        >
          {h} cm
        </text>
      </g>
    </svg>
  );
}
