"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { finishLogoUploadAction, uploadLogoAction } from "@/app/admin/actions";

type Result = { ok: boolean; file: string; company?: string; message?: string };

/** Pick many logo files at once; each is matched to a company by file name and uploaded one by one. */
export function LogoUploader() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const run = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setResults([]);
    const list = [...files].filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f.name));
    setProgress({ done: 0, total: list.length });
    const out: Result[] = [];
    for (const f of list) {
      const fd = new FormData();
      fd.set("logo", f);
      const r = await uploadLogoAction(fd);
      out.push(r);
      setResults([...out]);
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    await finishLogoUploadAction();
    setBusy(false);
    router.refresh();
  };

  const ok = results.filter((r) => r.ok).length;
  return (
    <section className="rounded-card border border-line bg-white p-6">
      <h2 className="text-h3">Upload logos in bulk</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-2">
        Select many logo files at once (PNG, JPG or WebP, up to 4 MB each; a transparent or white background works best). Name each file after the company, for example
        <code className="mx-1 rounded bg-ivory px-1">sun-pharma.png</code>,<code className="mx-1 rounded bg-ivory px-1">cipla.png</code> or
        <code className="mx-1 rounded bg-ivory px-1">Mankind Pharma.webp</code>. Use only logo files you have permission to use (for example from the company or your distributor).
      </p>
      <label htmlFor="logos" className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-line px-6 py-10 text-center hover:border-emerald ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <span className="font-medium">{busy ? `Uploading ${progress.done} of ${progress.total}…` : "Choose logo files"}</span>
        <span className="mt-1 text-sm text-ink-2">You can select a whole folder&rsquo;s files</span>
        <input id="logos" type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" onChange={(e) => run(e.target.files)} disabled={busy} />
      </label>
      {results.length > 0 && (
        <div className="mt-5" aria-live="polite">
          <p className="text-sm font-semibold">
            {ok} of {results.length} logos uploaded{busy ? "…" : "."}
          </p>
          <ul className="mt-2 max-h-60 space-y-1 overflow-y-auto text-sm">
            {results.map((r) => (
              <li key={r.file}>
                {r.ok ? <span className="text-forest">✓ {r.file} → {r.company}</span> : <span className="text-danger">✗ {r.file}: {r.message}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
