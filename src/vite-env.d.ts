/// <reference types="vite/client" />

interface LenisInstance {
  raf: (time: number) => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: {
      immediate?: boolean;
    }
  ) => void;
  destroy: () => void;
}

// requestIdleCallback is available in all modern browsers but not in older TypeScript DOM lib versions
interface Window {
  lenis?: LenisInstance;
  requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback: (handle: number) => void;
}
interface IdleRequestCallback {
  (deadline: IdleDeadline): void;
}
interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}
interface IdleRequestOptions {
  timeout?: number;
}
