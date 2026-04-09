import { lazy, Suspense } from 'react';

type LightboxSlide = {
  src: string;
};

type DeferredLightboxProps = {
  close: () => void;
  index: number;
  open: boolean;
  slides: LightboxSlide[];
};

const LightboxRenderer = lazy(() => import('./LightboxRenderer'));

function DeferredLightbox({
  close,
  index,
  open,
  slides,
}: DeferredLightboxProps) {
  if (!open || slides.length === 0) return null;

  return (
    <Suspense fallback={null}>
      <LightboxRenderer
        close={close}
        index={index}
        open={open}
        slides={slides}
      />
    </Suspense>
  );
}

export default DeferredLightbox;
