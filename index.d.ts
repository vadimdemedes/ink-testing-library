import * as React from 'react';

export interface MockStdIn {
  write(str: string): void;
}

export interface Helpers<P> {
  rerender<P>(tree: React.ReactElement<P>): void;
  unmount(): void;
  stdin: MockStdIn;
  frames: Array<string>
  lastFrame(): string;
}

export function render<P>(node: React.ReactElement<P>): Helpers<P>;

export function cleanup(): void;
