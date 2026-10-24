import React from "react";
import { Composition } from "remotion";
import { layout } from "./brand/tokens";
import { FuelGapReel } from "./projects/fuel-gap/Reel";
import { DURATION } from "./projects/fuel-gap/config";
import { ShartReel } from "./projects/shart/Reel";
import { DURATION as SHART_DURATION } from "./projects/shart/config";

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
  </>
);
