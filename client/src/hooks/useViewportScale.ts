import { useEffect, useState } from "react";

/** Reference canvas measured from plan/screens/Dashboard.jpg (window minus the 27px banner). */
export const DESIGN_WIDTH = 1376;
export const DESIGN_HEIGHT = 741;

export interface ViewportScale {
  zoom: number;
  width: number;
  height: number;
}

const compute = (): ViewportScale => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const zoom = Math.max(0.7, Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT));
  return { zoom, width: vw / zoom, height: vh / zoom };
};

/**
 * Scales the whole UI so the layout keeps the proportions of the reference
 * design on any screen (e.g. 1366x768 and 1920x1080 laptops look the same).
 */
export function useViewportScale(): ViewportScale {
  const [scale, setScale] = useState<ViewportScale>(compute);

  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}

