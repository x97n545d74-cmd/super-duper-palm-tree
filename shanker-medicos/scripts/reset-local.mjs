// Development mode: delete the local data store and Next's caches, so the
// next `npm run dev` (or a fresh `npm run build`) starts from the starter catalogue.
import { rmSync } from "node:fs";
for (const d of ["data", ".next/cache"]) rmSync(d, { recursive: true, force: true });
console.log("Local data reset. Rebuild before `npm start` (production pages keep their last state).");
