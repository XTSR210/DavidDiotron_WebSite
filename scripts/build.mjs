/**
 * Build du site.
 *
 * - Sur Vercel et en local : `next build` (export statique dans out/).
 * - Dans le workflow GitHub Pages (variable GITHUB_PAGES=true) : le site
 *   n'est plus hébergé là-bas. On publie seulement la page de redirection
 *   (.github/redirect/) vers david-drioton.vercel.app, qui garde la page
 *   demandée. Le workflow lui-même n'a pas à changer.
 */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";

if (process.env.GITHUB_PAGES === "true") {
  rmSync("out", { recursive: true, force: true });
  mkdirSync("out");
  cpSync(".github/redirect", "out", { recursive: true });
  console.log("GitHub Pages : page de redirection vers Vercel publiée dans out/.");
  process.exit(0);
}

const r = spawnSync("npx", ["next", "build"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
