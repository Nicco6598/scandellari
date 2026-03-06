/// <reference types="vite/client" />

// requestIdleCallback is available in all modern browsers but not in older TypeScript DOM lib versions
interface Window {
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
