"use client";

import { useEffect, useId, useState } from "react";
import { BrushIcon } from "@/components/icons";
import { login, reset, setup, status } from "@/lib/atelier-api";

const MIN_PASSWORD = 8;

type View = "loading" | "setup" | "login" | "forgot" | "key";

/** Champ mot de passe avec bouton Afficher / Masquer. */
export function PasswordField({
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

export function Message({ error, info }: { error?: string; info?: string }) {
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
 * Clé de secours affichée une seule fois : à noter avant d'entrer dans l'atelier.
 * Elle remplace un mot de passe oublié.
 */
export function RecoveryKey({ value, onDone }: { value: string; onDone: () => void }) {
  const [kept, setKept] = useState(false);
  const [copied, setCopied] = useState(false);
  const download = () => {
    const text = `Atelier David Drioton — clé de secours\n\n${value}\n\nElle permet de choisir un nouveau mot de passe si vous l'oubliez :\nespace Atelier, « Mot de passe oublié ? ».\nGardez-la en lieu sûr. Une nouvelle clé est créée à chaque changement de mot de passe.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "atelier-cle-de-secours.txt" });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5">
      <p className="soft">
        Si vous oubliez votre mot de passe, cette clé permet d'en choisir un nouveau. Elle ne
        s'affichera plus : notez-la sur papier, ou enregistrez-la.
      </p>
      <p className="select-all border-2 border-[var(--jaune)] p-4 text-center text-2xl font-bold tracking-[0.12em] tabular-nums">
        {value}
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={async () => {
            await navigator.clipboard.writeText(value).catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? "Copiée" : "Copier"}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={download}>
          Enregistrer en fichier
        </button>
      </div>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={kept}
          onChange={(e) => setKept(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[var(--jaune)]"
        />
        <span>J'ai noté ma clé de secours en lieu sûr.</span>
      </label>
      <button type="button" className="btn w-full" disabled={!kept} onClick={onDone}>
        Continuer
      </button>
    </div>
  );
}

/**
 * Écran d'entrée de l'espace Atelier, entièrement en ligne (Vercel).
 * - Première fois : code d'installation + choix du mot de passe.
 * - Ensuite : mot de passe.
 * - Oubli : clé de secours + nouveau mot de passe.
 */
export function AtelierLogin({ onSignedIn, notice }: { onSignedIn: () => Promise<void>; notice?: string }) {
  const [view, setView] = useState<View>("loading");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState("");
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    status()
      .then((s) => (s.signedIn ? onSignedIn() : setView(s.configured ? "login" : "setup")))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "L'atelier ne répond pas.");
        setView("login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (next: View) => {
    setView(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
    setRecovery("");
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

  const passwordHint = `Au moins ${MIN_PASSWORD} caractères. Une phrase courte est plus facile à retenir.`;

  let title: string;
  let body: React.ReactNode;

  if (view === "loading") {
    title = "Ouverture de l'atelier";
    body = <p className="soft">Un instant…</p>;
  } else if (view === "key") {
    title = "Votre clé de secours";
    body = <RecoveryKey value={newKey} onDone={() => void run(onSignedIn)} />;
  } else if (view === "setup") {
    title = "Installation de l'atelier";
    body = (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            newPasswordOk();
            setNewKey(await setup(code, password));
            setView("key");
          });
        }}
      >
        <p className="soft">
          Première ouverture. Saisissez le code d'installation qui vous a été remis, puis
          choisissez votre mot de passe.
        </p>
        <label className="field-label">
          Code d'installation
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            required
            autoFocus
            placeholder="XXXX-XXXX"
            className="field mt-2 font-bold tracking-[0.15em]"
          />
        </label>
        <PasswordField label="Mot de passe" value={password} onChange={setPassword} autoComplete="new-password" hint={passwordHint} />
        <PasswordField label="Confirmez-le" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Installation…" : "Créer mon mot de passe"}
        </button>
      </form>
    );
  } else if (view === "forgot") {
    title = "Mot de passe oublié";
    body = (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            newPasswordOk();
            setNewKey(await reset(recovery, password));
            setView("key");
          });
        }}
      >
        <p className="soft">
          Saisissez la clé de secours notée lors de l'installation (ou du dernier changement de
          mot de passe), puis choisissez un nouveau mot de passe.
        </p>
        <label className="field-label">
          Clé de secours
          <input
            value={recovery}
            onChange={(e) => setRecovery(e.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            required
            autoFocus
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="field mt-2 font-bold tracking-[0.12em]"
          />
        </label>
        <PasswordField label="Nouveau mot de passe" value={password} onChange={setPassword} autoComplete="new-password" hint={passwordHint} />
        <PasswordField label="Confirmez-le" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Enregistrement…" : "Changer le mot de passe"}
        </button>
        <p className="faint small">
          Clé de secours perdue elle aussi ? Demandez un nouveau code d'installation à la personne
          qui gère le site.
        </p>
        <button type="button" className="link small" onClick={() => go("login")}>
          Je me souviens du mot de passe
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
          void run(async () => {
            await login(password);
            await onSignedIn();
          });
        }}
      >
        {/* Champ caché : aide le gestionnaire de mots de passe à reconnaître le compte. */}
        <input type="text" name="username" value="atelier" autoComplete="username" readOnly hidden />
        <PasswordField label="Mot de passe" value={password} onChange={setPassword} autoComplete="current-password" autoFocus />
        <Message error={error} info={info} />
        <button type="submit" className="btn w-full" disabled={busy}>
          {busy ? "Vérification…" : "Entrer"}
        </button>
        <button type="button" className="link small" onClick={() => go("forgot")}>
          Mot de passe oublié ?
        </button>
      </form>
    );
  }

  return (
    <section className="bloc bloc-noir halftone min-h-[calc(100svh-4rem)] py-[clamp(2.5rem,7vw,5rem)]">
      <div className="wrap relative grid grid-cols-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div>
          <BrushIcon className="h-10 w-10 text-[var(--jaune)]" />
          <h1 className="poster t-page mt-5">L'atelier</h1>
          <p className="lead soft mt-6 max-w-md">
            L'espace privé de David : ajouter une toile, fixer un prix, marquer une œuvre vendue.
            Chaque changement apparaît aussitôt sur le site.
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
