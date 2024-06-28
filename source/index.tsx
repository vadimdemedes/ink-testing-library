import {EventEmitter} from 'node:events';
import {render as inkRender, type Instance as InkInstance} from 'ink';
import React, {useEffect, type ReactElement, act} from 'react';

class Stdout extends EventEmitter {
	get columns() {
		return 100;
	}

	readonly frames: string[] = [];
	private _lastFrame?: string;

	write = (frame: string) => {
		this.frames.push(frame);
		this._lastFrame = frame;
	};

	lastFrame = () => this._lastFrame;
}

class Stderr extends EventEmitter {
	readonly frames: string[] = [];
	private _lastFrame?: string;

	write = (frame: string) => {
		this.frames.push(frame);
		this._lastFrame = frame;
	};

	lastFrame = () => this._lastFrame;
}

class Stdin extends EventEmitter {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	isTTY = true;
	data: string | null = null; // eslint-disable-line @typescript-eslint/ban-types
	constructor(options: {isTTY?: boolean} = {}) {
		super();
		this.isTTY = options.isTTY ?? true;
	}

	write = (data: string) => {
		this.data = data;
		this.emit('readable');
		this.emit('data', data);
	};

	setEncoding() {
		// Do nothing
	}

	setRawMode() {
		// Do nothing
	}

	resume() {
		// Do nothing
	}

	pause() {
		// Do nothing
	}

	ref() {
		// Do nothing
	}

	unref() {
		// Do nothing
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	read: () => string | null = () => {
		const {data} = this;
		this.data = null;
		return data;
	};
}

type Instance = {
	rerender: (tree: ReactElement) => void;
	unmount: () => void;
	cleanup: () => void;
	stdout: Stdout;
	stderr: Stderr;
	stdin: Stdin;
	frames: string[];
	lastFrame: () => string | undefined;
};

const instances: InkInstance[] = [];

export const render = (tree: ReactElement): Instance => {
	const stdout = new Stdout();
	const stderr = new Stderr();
	const stdin = new Stdin();

	const instance = inkRender(tree, {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		stdout: stdout as any,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		stderr: stderr as any,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		stdin: stdin as any,
		debug: true,
		exitOnCtrlC: false,
		patchConsole: false,
	});

	instances.push(instance);

	return {
		rerender: instance.rerender,
		unmount: instance.unmount,
		cleanup: instance.cleanup,
		stdout,
		stderr,
		stdin,
		frames: stdout.frames,
		lastFrame: stdout.lastFrame,
	};
};

export const cleanup = () => {
	for (const instance of instances) {
		instance.unmount();
		instance.cleanup();
	}
};

type Hook<T> = () => T;

type RenderHookOptions = {
	wrapper?: React.ComponentType<any>;
};

function HookWrapper<T>({
	hook,
	setResult,
}: {
	readonly hook: Hook<T>;
	readonly setResult: (result: T) => void;
}) {
	const result = hook();
	useEffect(() => {
		setResult(result);
	}, [result, setResult]);

	return null;
}

export function renderHook<T>(hook: Hook<T>, options: RenderHookOptions = {}) {
	let hookResult: T;
	const setResult = (result: T) => {
		hookResult = result;
	};

	function TestComponent() {
		return <HookWrapper hook={hook} setResult={setResult} />;
	}

	const WrapperComponent = options.wrapper ?? React.Fragment;

	function WrappedComponent() {
		return (
			<WrapperComponent>
				<TestComponent />
			</WrapperComponent>
		);
	}

	const {rerender, unmount} = render(<WrappedComponent />);

	return {
		result: {
			get current() {
				return hookResult;
			},
		},
		rerender() {
			act(() => {
				rerender(<WrappedComponent />);
			});
		},
		unmount() {
			act(() => {
				unmount();
			});
		},
	};
}

export async function waitFor(
	condition: () => void,
	timeout = 5000,
	interval = 50,
): Promise<void> {
	const startTime = Date.now();
	return new Promise((resolve, reject) => {
		const checkCondition = () => {
			try {
				condition();
				resolve();
			} catch (error) {
				if (Date.now() - startTime >= timeout) {
					reject(new Error(`waitFor timed out: ${(error as Error).message}`));
				} else {
					setTimeout(checkCondition, interval);
				}
			}
		};

		checkCondition();
	});
}
