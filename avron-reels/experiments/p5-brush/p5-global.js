// p5.brush only hooks into p5's draw cycle (the end-of-frame flush) when it
// finds a global `p5` at import time. Bundled ES modules don't create one, so
// expose it here and import this file before 'p5.brush'.
import p5 from 'p5';

globalThis.p5 = p5;

// The friendly-error checker scans the whole bundle as if it were sketch code
// and flags p5's own constants, so switch it off.
p5.disableFriendlyErrors = true;

export default p5;
