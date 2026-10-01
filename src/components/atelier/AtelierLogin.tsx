"use client";

import { useEffect, useId, useState } from "react";
import { BrushIcon } from "@/components/icons";
import {
  type BaseState,
  finishReset,
  login,
  probeBase,
  setup,
  startReset,
} from "@/lib/atelier-api";

const MIN_PASSWORD = 8;
const GITHUB_TOKEN_URL =
  "https://github.com/settings/personal-access-tokens/new?description=Atelier%20David%20Drioton";

type View = "password" | "forgot" | "github";

/** Champ mot de passe avec bouton Afficher / Masquer. */
function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
  hint?: string;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          minLength={autoComplete === "new-password" ? MIN_PASSWORD : undefined}
          className="field min-w-0 flex-1"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="field w-auto shrink-0 border-l-0 px-4 text-sm font-bold"
          aria-pressed={shown}
          aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {shown ? "Masquer" : "Afficher"}
        </button>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="faint small mt-1.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Message({ error, info }: { error?: string; info?: string }) {
  if (error) {
    return (
      <p role="alert" className="border-l-4 border-[var(--magenta)] pl-3 font-semibold">
        {error}
      </p>
    );
  }
  if (info) {
    return (
      <p role="status" className="soft border-l-4 border-[var(--cyan)] pl-3">
        {info}
      </p>
    );
  }
  return null;
}

/**
 * Écran d'entrée de l'espace Atelier.
 * - Sur l'ordinateur de l'atelier : mot de passe (création au premier passage,
 *   récupération par un code affiché dans la fenêtre de la base).
 * - Ailleurs : connexion au dépôt GitHub avec un jeton.
 */
export function AtelierLogin({
  onSession,
  onGithub,
  savedGithubToken,
  notice,
}: {
  onSession: (token: string) => Promise<void>;
  onGithub: (token: string) => Promise<void>;
  savedGithubToken: string | null;
  notice?: string;
}) {
  const [base, setBase] = useState<BaseState>({ kind: "checking" });
  const [view, setView] = useState<View>("password");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice ?? "");
  const [busy, setBusy] = useState(false);

  const check = async () => {
    setBase({ kind: "checking" });
    const state = await probeBase();
    setBase(state);
    if (state.kind === "off") setView((v) => (v === "password" || v === "forgot" ? "github" : v));
    if (state.kind === "on") setView((v) => (v === "github" ? "password" : v));
  };

  useEffect(() => {
    void check();
  }, []);

  const go = (next: View) => {
    setView(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
    setCode("");
  };

  async function run(action: () => Promise<void>) {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opération impossible.");
    } finally {
      setBusy(false);
    }
  }

  const newPasswordOk = () => {
    if (password.length < MIN_PASSWORD) throw new Error(`Au moins ${MIN_PASSWORD} caractères.`);
    if (password !== confirm) throw new Error("Les deux mots de passe sont différents.");
  };

  const configured = base.kind === "on" && base.configured;
  const onLocalSite =
    typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  /* ------------------------------------------------ contenu ---- */

  let title: string;
  let body: React.ReactNode;

  if (base.kind === "checking") {
    title = "Ouverture de l'atelier";
    body = <p className="soft">Recherche de la base de l'atelier sur cet ordinateur…</p>;
  } else if (view === "github") {
    title = "Depuis un autre appareil";
    body = (
      <>
        {base.kind === "off" ? (
          <div className="soft space-y-3">
            <p>
              La base de l'atelier ne répond pas sur cet appareil. Sur l'ordinateur de l'atelier,
              lancez-la d'un double-clic sur <strong className="text-[var(--fg)]">atelier.command</strong>{" "}
              (Mac) ou <strong className="text-[var(--fg)]">atelier.bat</strong> (Windows), puis :
            </p>
            <button type="button" className="btn btn-sm" onClick={() => void check()}>
              Réessayer
            </button>
            {!onLocalSite ? (
              <p className="small">
                Sur Safari, la base n'est joignable que depuis la version locale du site :{" "}
                <a className="link" href="http://localhost:3210/admin/">
                  localhost:3210/admin
                </a>
                .
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 border-t-2 border-[var(--fg)] pt-6">
          <p className="soft">
            Sans la base, vous pouvez modifier la galerie directement sur GitHub, avec une clé
            d'accès (« jeton »). Aucun mot de passe n'est nécessaire.
          </p>
          {savedGithubToken ? (
            <button
              type="button"
              className="btn mt-5 w-full"
              disabled={busy}
              onClick={() => run(() => onGithub(savedGithubToken))}
            >
              {busy ? "Connexion…" : "Continuer avec la clé enregistrée"}
            </button>
          ) : null}
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => onGithub(token.trim()));
            }}
          >
            <label className="field-label">
              {savedGithubToken ? "Ou une nouvelle clé GitHub" : "Clé GitHub"}
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="github_pat_…"
                className="field mt-2 font-normal"
                required
              />
            </label>
            <Message error={error} info={info} />
            <button type="submit" className="btn btn-ghost w-full" disabled={busy || !token.trim()}>
              Se connecter avec cette clé
            </button>
          </form>
          <details className="faq-item mt-6 !border-t-0">
            <summary className="!py-3 !text-base">
              Créer une clé GitHub
              <span className="faq-plus" aria-hidden="true" />
            </summary>
            <ol className="soft small list-decimal space-y-1.5 pb-4 pl-5">
              <li>
                Ouvrez{" "}
                <a className="link" href={GITHUB_TOKEN_URL} target="_blank" rel="noopener noreferrer">
                  la page de création de clé
                </a>{" "}
                (connecté au compte GitHub du site).
              </li>
              <li>Dépôt : choisissez seulement « DavidDiotron_WebSite ».</li>
              <li>Autorisation « Contents » : « Read and write ».</li>
              <li>Créez la clé, copiez-la et collez-la ci-dessus. Elle reste sur cet appareil.</li>
            </ol>
          </details>
        </div>
        {base.kind === "on" ? (
          <button type="button" className="link small mt-6" onClick={() => go("password")}>
            Revenir au mot de passe de l'atelier
          </button>
        ) : null}
      </>
    );
  } else if (view === "forgot") {
    title = "Mot de passe oublié";
    body = !codeSent ? (
      <div className="space-y-5">
        <p className="soft">
          Un code à 6 chiffres va s'afficher dans la fenêtre de la base de l'atelier (la fenêtre
          noire « Atelier – Base de données », ou le Terminal sur Mac), sur cet ordinateur. Personne
          d'autre ne peut le voir.
        </p>
        <Message error={error} info={info} />
        <button
          type="button"
          className="btn w-full"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await startReset();
              setCodeSent(true);
            })
          }
        >
          {busy ? "Envoi…" : "Afficher un code sur l'ordinateur"}
        </button>
        <button type="button" className="link small" onClick={() => go("password")}>
          Je me souviens du mot de passe
        </button>
      </div>
    ) : (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            newPasswordOk();
            await onSession(await finishReset(code.trim(), password));
          });
        }}
      >
        <p className="soft">
          Recopiez le code affiché dans la fenêtre de la base (valable 10 minutes), puis choisissez
          votre nouveau mot de passe.
        </p>
        <label className="field-label">
          Code à 6 chiffres
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            required
            autoFocus
            className="field mt-2 text-center text-2xl font-bold tracking-[0.4em] tabular-nums"
          />
        </label>
        <PasswordField
          label="Nouveau mot de passe"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={`Au moins ${MIN_PASSWORD} caractères. Une phrase courte est plus facile à retenir.`}
        />
        <PasswordField
          label="Confirmez-le"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Enregistrement…" : "Changer le mot de passe et entrer"}
        </button>
        <button
          type="button"
          className="link small"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await startReset();
              setInfo("Nouveau code affiché sur l'ordinateur.");
            })
          }
        >
          Afficher un autre code
        </button>
      </form>
    );
  } else if (!configured) {
    title = "Créez votre mot de passe";
    body = (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            newPasswordOk();
            await onSession(await setup(password));
          });
        }}
      >
        <p className="soft">
          Première ouverture de l'atelier sur cet ordinateur. Ce mot de passe protège la galerie ;
          il est enregistré chiffré, uniquement ici. En cas d'oubli, vous pourrez le remplacer
          depuis cet ordinateur.
        </p>
        <PasswordField
          label="Mot de passe"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          autoFocus
          hint={`Au moins ${MIN_PASSWORD} caractères. Une phrase courte est plus facile à retenir.`}
        />
        <PasswordField label="Confirmez-le" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Création…" : "Créer et entrer dans l'atelier"}
        </button>
      </form>
    );
  } else {
    title = "Entrer dans l'atelier";
    body = (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => onSession(await login(password)));
        }}
      >
        {/* Champ caché : aide le gestionnaire de mots de passe à reconnaître le compte. */}
        <input type="text" name="username" value="atelier" autoComplete="username" readOnly hidden />
        <PasswordField
          label="Mot de passe"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          autoFocus
        />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Vérification…" : "Entrer"}
        </button>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-3">
          <button type="button" className="link small" onClick={() => go("forgot")}>
            Mot de passe oublié ?
          </button>
          <button type="button" className="link small" onClick={() => go("github")}>
            Passer par GitHub
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="bloc bloc-noir halftone min-h-[calc(100svh-var(--header-h))] py-[clamp(2.5rem,7vw,5rem)]">
      <div className="wrap relative grid grid-cols-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div>
          <BrushIcon className="h-10 w-10 text-[var(--jaune)]" />
          <h1 className="poster t-page mt-5">L'atelier</h1>
          <p className="lead soft mt-6 max-w-md">
            L'espace privé de David : ajouter une toile, fixer un prix, marquer une œuvre vendue,
            puis publier la galerie.
          </p>
          <p className="small faint mt-6 flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                base.kind === "on" ? "bg-[#25d366]" : base.kind === "off" ? "bg-[var(--magenta)]" : "bg-[var(--fg-faint)]"
              }`}
            />
            {base.kind === "on"
              ? "Base de l'atelier : connectée sur cet ordinateur"
              : base.kind === "off"
                ? "Base de l'atelier : introuvable sur cet appareil"
                : "Recherche de la base…"}
          </p>
        </div>

        <div className="panel bg-[var(--noir)]">
          <h2 className="poster t-md">{title}</h2>
          <div className="mt-6">{body}</div>
        </div>
      </div>
    </section>
  );
}
