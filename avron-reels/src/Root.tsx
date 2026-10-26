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
import { SwiggyStyleFrames } from "./projects/swiggy/StyleFrames";
import { DemoA, DemoB, DemoC, DemoD, DemoE, DemoAll, DEMO_DUR } from "./projects/silver/Demos";
import { SilverScenes, SCENES_DUR } from "./projects/silver/Scenes";
import { SilverFilm, SILVER_DURATION } from "./projects/silver/film/Film";
import { SilverThumbnail } from "./projects/silver/film/Thumbnail";
import { SwiggyFilm } from "./projects/swiggy/film/Film";
import { SwiggyThumbnail } from "./projects/swiggy/film/Thumbnail";
import { DURATION as SWIGGY_DURATION } from "./projects/swiggy/film/timeline";
import { DURATION as SMARTPHONE_DURATION } from "./projects/smartphone/config";
import { ThaliReel } from "./projects/thali/Reel";
import { ThaliBlueprint10, BLUEPRINT10_DUR } from "./projects/thali/Blueprint10";
import { DURATION as THALI_DURATION } from "./projects/thali/config";

export const Root: React.FC = () => (
  <>
    <Composition
      id="ThaliBlueprint10"
      component={ThaliBlueprint10}
      durationInFrames={BLUEPRINT10_DUR * layout.fps}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />
    <Composition
      id="Thali"
      component={ThaliReel}
      durationInFrames={Math.ceil(THALI_DURATION * layout.fps)}
      fps={layout.fps}
      width={layout.width}
      height={layout.height}
    />

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
    <Composition id="SwiggyFilm" component={SwiggyFilm} durationInFrames={Math.ceil(SWIGGY_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SwiggyThumbnail" component={SwiggyThumbnail} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="SwiggyStyle" component={SwiggyStyleFrames} durationInFrames={21 * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoA" component={DemoA} durationInFrames={DEMO_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoB" component={DemoB} durationInFrames={DEMO_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoC" component={DemoC} durationInFrames={DEMO_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoD" component={DemoD} durationInFrames={DEMO_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoE" component={DemoE} durationInFrames={DEMO_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverDemoAll" component={DemoAll} durationInFrames={DEMO_DUR * 5 * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverScenes" component={SilverScenes} durationInFrames={SCENES_DUR * 30} fps={30} width={1920} height={1080} />
    <Composition id="SilverFilm" component={SilverFilm} durationInFrames={Math.ceil(SILVER_DURATION * 30)} fps={30} width={1920} height={1080} />
    <Composition id="SilverThumbA" component={SilverThumbnail} defaultProps={{ v: "A" as const }} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="SilverThumbB" component={SilverThumbnail} defaultProps={{ v: "B" as const }} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="SilverThumbC" component={SilverThumbnail} defaultProps={{ v: "C" as const }} durationInFrames={1} fps={30} width={1280} height={720} />
  </>
);
