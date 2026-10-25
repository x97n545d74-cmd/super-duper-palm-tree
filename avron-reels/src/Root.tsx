import React from "react";
import { Composition } from "remotion";
import { layout } from "./brand/tokens";
import { FuelGapReel } from "./projects/fuel-gap/Reel";
import { DURATION } from "./projects/fuel-gap/config";
import { ShartReel } from "./projects/shart/Reel";
import { DURATION as SHART_DURATION } from "./projects/shart/config";
import { VivianaReel } from "./projects/viviana/Reel";
import { DURATION as VIVIANA_DURATION } from "./projects/viviana/config";
import { Viviana2Reel } from "./projects/viviana2/Reel";
import { DURATION as VIVIANA2_DURATION } from "./projects/viviana2/config";
import { SmartphoneReel } from "./projects/smartphone/Reel";
import { Ep01Reel, DURATION as EP01_DURATION } from "./projects/ep01/Reel";
import { LineUp } from "./projects/series/LineUp";
import { Ep02Reel, EP02_DURATION } from "./projects/series/Ep02";
import { Ep03Reel, EP03_DURATION } from "./projects/series/Ep03";
import { Ep01v2Reel, DURATION_V2 as EP01V2_DURATION } from "./projects/ep01/Reel2";
import { SwiggyStyleFrames } from "./projects/swiggy/StyleFrames";
import { SwiggyFilm } from "./projects/swiggy/film/Film";
import { DURATION as SWIGGY_DURATION } from "./projects/swiggy/film/timeline";
import { DURATION as SMARTPHONE_DURATION } from "./projects/smartphone/config";

export const Root: React.FC = () => (
  <>
    <Composition
      id="FuelGap"
      component={FuelGapReel}
      durationInFrames={Math.ceil(DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition
      id="Shart"
      component={ShartReel}
      durationInFrames={Math.ceil(SHART_DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition
      id="Viviana"
      component={VivianaReel}
      durationInFrames={Math.ceil(VIVIANA_DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition
      id="Viviana2"
      component={Viviana2Reel}
      durationInFrames={Math.ceil(VIVIANA2_DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition
      id="Smartphone"
      component={SmartphoneReel}
      durationInFrames={Math.ceil(SMARTPHONE_DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition id="Ep01" component={Ep01Reel} durationInFrames={Math.ceil(EP01_DURATION * layout.fps)} fps={layout.fps} width={layout.width} height={layout.height} />
    <Composition id="Ep01v2" component={Ep01v2Reel} durationInFrames={Math.ceil(EP01V2_DURATION * layout.fps)} fps={layout.fps} width={layout.width} height={layout.height} />
    <Composition id="Ep02" component={Ep02Reel} durationInFrames={Math.ceil(EP02_DURATION * layout.fps)} fps={layout.fps} width={layout.width} height={layout.height} />
    <Composition id="Ep03" component={Ep03Reel} durationInFrames={Math.ceil(EP03_DURATION * layout.fps)} fps={layout.fps} width={layout.width} height={layout.height} />
    <Composition id="CastLineUp" component={LineUp} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="SwiggyFilm" component={SwiggyFilm} durationInFrames={Math.ceil(SWIGGY_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SwiggyBgB" component={SwiggyFilm} defaultProps={{ plan: { c1: "map", c2: "map", c3: "map", c4: "map", c5: "map", c6: "map", c7: "map" } as const }} durationInFrames={Math.ceil(SWIGGY_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SwiggyBgC" component={SwiggyFilm} defaultProps={{ plan: { c1: "paper", c2: "paper", c3: "paper", c4: "paper", c5: "paper", c6: "paper", c7: "paper" } as const }} durationInFrames={Math.ceil(SWIGGY_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SwiggyBgD" component={SwiggyFilm} defaultProps={{ plan: { c1: "type", c2: "type", c3: "type", c4: "type", c5: "type", c6: "type", c7: "type" } as const }} durationInFrames={Math.ceil(SWIGGY_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SwiggyStyle" component={SwiggyStyleFrames} durationInFrames={21 * 30} fps={30} width={1920} height={1080} />
  </>
);
