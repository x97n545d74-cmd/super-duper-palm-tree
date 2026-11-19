// Prints the hero still-life and logo mark as static SVG for the marketing kit renderer.
import { renderToStaticMarkup } from "react-dom/server";
import { HeroArt } from "../src/components/home/HeroArt";
import { ProductArt } from "../src/components/brand/ProductArt";
const out = {
  hero: renderToStaticMarkup(<HeroArt className="art" />),
  strip: renderToStaticMarkup(<ProductArt style="strip" seed="Shelcal" className="art" />),
  bottle: renderToStaticMarkup(<ProductArt style="bottle" seed="Johnson" className="art" />),
  device: renderToStaticMarkup(<ProductArt style="device" seed="Omron" className="art" />),
};
process.stdout.write(JSON.stringify(out));
