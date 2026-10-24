import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, string, number][] = [
  ["AVRON Deva", "fonts/NotoSansDeva-400.woff2", 400],
  ["AVRON Deva", "fonts/NotoSansDeva-600.woff2", 600],
  ["AVRON Deva", "fonts/NotoSansDeva-800.woff2", 800],
  ["AVRON Deva Serif", "fonts/NotoSerifDeva-600.woff2", 600],
  ["AVRON Deva Serif", "fonts/NotoSerifDeva-800.woff2", 800],
];

/** Loads the vendored Devanagari faces (SIL OFL) and blocks rendering until they are ready. */
export const DevanagariFonts: React.FC = () => {
  const [handle] = useState(() => delayRender("devanagari fonts"));
  useEffect(() => {
    Promise.all(
      FACES.map(([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight: String(weight), unicodeRange: "U+0900-097F, U+200C-200D, U+20B9, U+25CC, U+A8E0-A8FF" });
        (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
        return f.load();
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
  return null;
};
