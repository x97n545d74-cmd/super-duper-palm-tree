// Minimal p5.brush check: a pencil stroke and an ink stroke on a WEBGL canvas.
// p5 and p5.brush are ES modules here, so the sketch runs in instance mode.
import p5 from './p5-global.js';
import * as brush from 'p5.brush';

new p5((p) => {
  brush.instance(p);

  p.setup = () => {
    p.createCanvas(700, 410, p.WEBGL);
    p.noLoop();
  };

  p.draw = () => {
    p.background('#fffceb');

    brush.set('HB', '#2f2a26', 1.4);
    brush.line(-220, -80, 180, 40);

    brush.set('rotring', '#1f4b99', 0.8);
    brush.line(-200, 100, 220, -60);

    requestAnimationFrame(() => { window.sketchDone = true; });
  };
});
