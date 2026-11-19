/**
 * Kinetic headline: per-character blur-to-sharp reveal for Latin text,
 * per-word for Hindi and Punjabi (splitting Indic scripts by character breaks
 * conjuncts and matras). Screen readers get the plain text.
 */
export function Split({ text, perWord = false, delay = 0, start = 0, className = "" }: { text: string; perWord?: boolean; delay?: number; start?: number; className?: string }) {
  // Precompute each unit's index in the sequence (no mutation during render).
  const words = text.split(" ").map((w, wi, all) => {
    const before = all.slice(0, wi).reduce((n, x) => n + (perWord ? 3 : Array.from(x).length), 0);
    return { w, base: start + before };
  });
  return (
    <span className={`split ${className}`} style={{ ["--d0" as string]: `${delay}s` }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map(({ w, base }, wi) => (
          <span key={wi}>
            <span className="w">
              {perWord ? (
                <span className="c" style={{ ["--ci" as string]: base }}>
                  {w}
                </span>
              ) : (
                Array.from(w).map((ch, i) => (
                  <span key={i} className="c" style={{ ["--ci" as string]: base + i }}>
                    {ch}
                  </span>
                ))
              )}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Number of reveal steps a Split uses, so a following Split can continue the sequence. */
export function splitLength(text: string, perWord = false) {
  return perWord ? text.split(" ").length * 3 : text.replace(/ /g, "").length;
}
