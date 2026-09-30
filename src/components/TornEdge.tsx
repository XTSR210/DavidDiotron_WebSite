/**
 * Bord de papier déchiré : la signature du site, reprise des affiches lacérées
 * que David colle sur ses toiles. À poser en premier enfant d'un `.bloc` :
 * il dépasse au-dessus du bloc et prend sa couleur, avec le liseré blanc de la
 * fibre de papier mise à nu.
 *
 * Le tracé est tiré d'un générateur à graine fixe : identique au serveur et
 * dans le navigateur, et différent d'un bord à l'autre (`seed`).
 */

const W = 1200;
const H = 40;

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function tear(seed: number, lift: number): string {
  const rand = rng(seed);
  let x = 0;
  let d = `M0 ${H} L0 ${(H * 0.5).toFixed(1)}`;
  while (x < W) {
    x = Math.min(W, x + 9 + rand() * 30);
    // Un arrachement franc de temps en temps, de petites dents le reste du temps.
    const deep = rand() > 0.82;
    const y = Math.max(1, (deep ? 4 : 14) + rand() * (deep ? 12 : 20) - lift);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

export function TornEdge({ seed = 1 }: { seed?: number }) {
  return (
    <svg className="torn" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="torn-fiber" d={tear(seed, 5)} />
      <path className="torn-sheet" d={tear(seed, 0)} />
    </svg>
  );
}
