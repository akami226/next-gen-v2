import { lazy, Suspense } from 'react';
import type { CenterCanvasProps } from './CenterCanvas';

const CenterCanvas = lazy(() => import('./CenterCanvas'));

function CanvasPlaceholder({ isMobile }: { isMobile?: boolean }) {
  return (
    <div
      className={`w-full rounded-2xl bg-black/60 border border-white/[0.06] animate-pulse ${
        isMobile ? 'h-[50vh]' : 'h-full min-h-[280px]'
      }`}
      aria-hidden
    />
  );
}

/** Code-split 3D canvas so the main bundle stays smaller until the configurator loads. */
export default function CenterCanvasLazy(props: CenterCanvasProps) {
  return (
    <Suspense fallback={<CanvasPlaceholder isMobile={props.isMobile} />}>
      <CenterCanvas {...props} />
    </Suspense>
  );
}
