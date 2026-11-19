"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { importAction } from "@/app/admin/actions";
import { IMPORT_FIELDS, importRowSchema, MAX_IMPORT_ROWS, firstError } from "@/lib/validation";
import { productKey } from "@/lib/data/repo";
import type { ImportResult } from "@/lib/types";

type FieldKey = (typeof IMPORT_FIELDS)[number]["key"];
type Mapping = Record<FieldKey, string>;
type RowStatus = { row: number; values: Record<string, string>; status: "new" | "duplicate" | "file-duplicate" | "error"; message?: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function guessMapping(headers: string[]): Mapping {
  const m = {} as Mapping;
  for (const f of IMPORT_FIELDS) {
    const candidates = [f.key, f.label, ...f.aliases].map(norm);
    m[f.key] = headers.find((h) => candidates.includes(norm(h))) ?? "";
  }
  return m;
}

export function ImportWizard({ existingKeys, categories }: { existingKeys: string[]; categories: { slug: string; name: string }[] }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Mapping>({} as Mapping);
  const [mode, setMode] = useState<"skip" | "update">("skip");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();
  const existing = useMemo(() => new Set(existingKeys), [existingKeys]);
  const catSet = useMemo(() => new Set(categories.flatMap((c) => [c.slug, c.name.toLowerCase()])), [categories]);

  const onFile = (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("The file is larger than 5 MB. Split it into smaller files.");
    if (!/\.(csv|txt)$/i.test(file.name)) return setError("Choose a .csv file. In Excel: File → Save As → CSV UTF-8.");
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const hs = (res.meta.fields ?? []).filter(Boolean);
        if (!hs.length || !res.data.length) return setError("No rows found. The first line must contain column names.");
        if (res.data.length > MAX_IMPORT_ROWS) return setError(`This file has ${res.data.length} rows. Import at most ${MAX_IMPORT_ROWS} at a time.`);
        setFileName(file.name);
        setHeaders(hs);
        setRows(res.data);
        setMapping(guessMapping(hs));
        setStep(2);
      },
      error: (err) => setError(`Could not read the file: ${err.message}`),
    });
  };

  const mapped = useMemo(
    () =>
      rows.map((r) => {
        const o: Record<string, string> = {};
        for (const f of IMPORT_FIELDS) o[f.key] = mapping[f.key] ? (r[mapping[f.key]] ?? "").toString() : "";
        return o;
      }),
    [rows, mapping],
  );

  const checked: RowStatus[] = useMemo(() => {
    const seen = new Set<string>();
    return mapped.map((values, i) => {
      const row = i + 2;
      const parsed = importRowSchema.safeParse(values);
      if (!parsed.success) return { row, values, status: "error", message: firstError(parsed.error) };
      const cat = parsed.data.category;
      if (cat && !catSet.has(cat.toLowerCase().trim()) && !catSet.has(cat.toLowerCase().trim().replace(/\s+/g, "-")))
        return { row, values, status: "error", message: `Unknown category “${cat}”. Use a category name or slug from the list below.` };
      const key = productKey(parsed.data);
      if (seen.has(key)) return { row, values, status: "file-duplicate", message: "Same product appears earlier in this file." };
      seen.add(key);
      if (existing.has(key)) return { row, values, status: "duplicate", message: "Already in the catalogue." };
      return { row, values, status: "new" };
    });
  }, [mapped, existing, catSet]);

  const counts = {
    new: checked.filter((r) => r.status === "new").length,
    dup: checked.filter((r) => r.status === "duplicate" || r.status === "file-duplicate").length,
    err: checked.filter((r) => r.status === "error").length,
  };
  const missingRequired = IMPORT_FIELDS.filter((f) => f.required && !mapping[f.key]);

  const runImport = () =>
    start(async () => {
      setError("");
      // Send every row (not only valid ones) so the server's row numbers match the file.
      const res = await importAction(mapped, mode);
      if ("error" in res) setError(res.error);
      else {
        setResult(res);
        setStep(4);
      }
    });

  const downloadReport = () => {
    const errs = result?.errors ?? [];
    const csv = Papa.unparse(errs.map((e) => ({ row: e.row, error: e.message, ...(rows[e.row - 2] ?? {}) })));
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-errors-${fileName.replace(/\.csv$/i, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="Import steps">
        {["Upload file", "Match columns", "Check and import", "Summary"].map((label, i) => (
          <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={`rounded-full px-3 py-1.5 ${step === i + 1 ? "bg-forest text-ivory" : step > i + 1 ? "bg-mint text-forest" : "bg-white text-ink-2 ring-1 ring-line"}`}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="rounded-control bg-[#FDECEC] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {step === 1 && (
        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="text-h3">Upload a CSV file</h2>
          <p className="mt-2 text-sm text-ink-2">
            Start from the template so the columns match. Required columns: product name, brand and pack size. You can save an Excel sheet as CSV (File → Save As → CSV UTF-8).
          </p>
          <a href="/templates/shanker-products-template.csv" download className="btn btn-ghost mt-5 h-10 min-h-0 text-sm">
            Download the CSV template
          </a>
          <label htmlFor="csv" className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-line px-6 py-12 text-center hover:border-emerald">
            <span className="font-medium">Choose a CSV file</span>
            <span className="mt-1 text-sm text-ink-2">Up to {MAX_IMPORT_ROWS} rows, 5 MB</span>
            <input id="csv" type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="text-h3">Match your columns</h2>
          <p className="mt-2 text-sm text-ink-2">
            {fileName}: {rows.length} rows. We guessed the matches; check them and change any that are wrong.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {IMPORT_FIELDS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`map-${f.key}`} className="label">
                  {f.label}
                  {f.required && " *"}
                </label>
                <select id={`map-${f.key}`} value={mapping[f.key]} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })} className="field">
                  <option value="">— Not in my file —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {missingRequired.length > 0 && <p className="mt-5 text-sm text-danger">Match these required columns: {missingRequired.map((f) => f.label).join(", ")}.</p>}
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" disabled={missingRequired.length > 0} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat n={counts.new} label="new products will be added" tone="ok" />
            <Stat n={counts.dup} label={mode === "update" ? "existing products will be updated" : "duplicates will be skipped"} tone="mid" />
            <Stat n={counts.err} label="rows have errors and will not be imported" tone={counts.err ? "bad" : "ok"} />
          </div>
          <fieldset className="rounded-card border border-line bg-white p-5">
            <legend className="px-1 font-semibold">When a product already exists (same name, brand and pack size)</legend>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="radio" name="mode" checked={mode === "skip"} onChange={() => setMode("skip")} className="accent-forest" /> Skip it (safest)
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="radio" name="mode" checked={mode === "update"} onChange={() => setMode("update")} className="accent-forest" /> Update it with the details from the file
            </label>
          </fieldset>

          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-ink-2">
                <tr>
                  <th className="px-3 py-2.5">Row</th>
                  <th className="px-3 py-2.5">Product</th>
                  <th className="px-3 py-2.5">Brand</th>
                  <th className="px-3 py-2.5">Pack</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {checked.slice(0, 200).map((r) => (
                  <tr key={r.row} className={r.status === "error" ? "bg-[#FDECEC]/50" : ""}>
                    <td className="px-3 py-2 text-ink-2">{r.row}</td>
                    <td className="px-3 py-2">{r.values.name}</td>
                    <td className="px-3 py-2">{r.values.brand}</td>
                    <td className="px-3 py-2">{r.values.pack_size}</td>
                    <td className="px-3 py-2">{r.values.category}</td>
                    <td className="px-3 py-2">
                      {r.status === "new" && <span className="text-forest">New</span>}
                      {(r.status === "duplicate" || r.status === "file-duplicate") && <span className="text-warn">{mode === "update" && r.status === "duplicate" ? "Will update" : "Duplicate"}: {r.message}</span>}
                      {r.status === "error" && <span className="text-danger">{r.message}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {checked.length > 200 && <p className="border-t border-line px-3 py-2 text-xs text-ink-2">Showing the first 200 of {checked.length} rows.</p>}
          </div>
          <details className="text-sm text-ink-2">
            <summary className="cursor-pointer">Category names you can use</summary>
            <p className="mt-2">{categories.map((c) => `${c.name} (${c.slug})`).join(", ")}</p>
          </details>
          <div className="flex gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" disabled={pending || counts.new + (mode === "update" ? counts.dup : 0) === 0} onClick={runImport}>
              {pending ? "Importing…" : `Import ${counts.new + (mode === "update" ? checked.filter((r) => r.status === "duplicate").length : 0)} products`}
            </button>
          </div>
        </section>
      )}

      {step === 4 && result && (
        <section className="rounded-card border border-line bg-white p-6" aria-live="polite">
          <h2 className="text-h3">Import finished</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <Stat n={result.created} label="added" tone="ok" />
            <Stat n={result.updated} label="updated" tone="ok" />
            <Stat n={result.skipped} label="skipped (duplicates)" tone="mid" />
            <Stat n={result.errors.length} label="errors" tone={result.errors.length ? "bad" : "ok"} />
          </div>
          {result.errors.length > 0 && (
            <>
              <ul className="mt-6 max-h-64 space-y-1 overflow-y-auto text-sm">
                {result.errors.slice(0, 100).map((e) => (
                  <li key={`${e.row}-${e.message}`}>
                    <span className="text-ink-2">Row {e.row}:</span> <span className="text-danger">{e.message}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={downloadReport} className="btn btn-ghost mt-4">
                Download error report (CSV)
              </button>
            </>
          )}
          <div className="mt-6 flex gap-3">
            <Link href="/admin/products" className="btn btn-primary">
              Go to products
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStep(1);
                setResult(null);
                setRows([]);
              }}
            >
              Import another file
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: "ok" | "mid" | "bad" }) {
  const c = tone === "ok" ? "text-forest" : tone === "mid" ? "text-warn" : "text-danger";
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <p className={`font-display text-3xl font-semibold ${c}`}>{n}</p>
      <p className="mt-1 text-sm text-ink-2">{label}</p>
    </div>
  );
}
