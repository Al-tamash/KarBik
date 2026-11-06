declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open(): void;
      on(event: string, callback: (response: Record<string, unknown> | unknown) => void): void;
    };
  }
}

export {};
