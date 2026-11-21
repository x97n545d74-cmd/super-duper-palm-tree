import { RepoError } from "./repo";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const SIGNATURES: { ext: string; type: string; test: (b: Uint8Array) => boolean }[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    ext: "webp",
    type: "image/webp",
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  { ext: "avif", type: "image/avif", test: (b) => String.fromCharCode(...b.slice(4, 12)) === "ftypavif" },
];

/** Validates size and real file type (magic bytes, not the browser-supplied type). */
export async function readImage(file: File): Promise<{ bytes: Uint8Array; ext: string; type: string }> {
  if (!file || file.size === 0) throw new RepoError("No image selected.", "invalid");
  if (file.size > MAX_IMAGE_BYTES) throw new RepoError("Image is larger than 4 MB.", "invalid");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sig = SIGNATURES.find((s) => s.test(bytes));
  if (!sig) throw new RepoError("Use a JPG, PNG, WebP or AVIF image.", "invalid");
  return { bytes, ext: sig.ext, type: sig.type };
}
