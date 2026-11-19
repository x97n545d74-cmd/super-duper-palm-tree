import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shanker Medicos",
    short_name: "Shanker",
    description: "Neighbourhood pharmacy in Batala, Punjab.",
    start_url: "/en",
    display: "standalone",
    background_color: "#FAFBF8",
    theme_color: "#123F2B",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
