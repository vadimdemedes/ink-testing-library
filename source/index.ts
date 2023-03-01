import {EventEmitter} from 'node:events';
import {render as inkRender} from 'ink';
import type {Instance as InkInstance} from 'ink';
import type {ReactElement} from 'react';

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

	write = (data: string) => {
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
		// @ts-expect-error - mock stdout
		stdout,
		// @ts-expect-error - mock stderr
		stderr,
		// @ts-expect-error - mock stdin
		stdin,
		debug: true,
		exitOnCtrlC: false,
		patchConsole: false
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
		lastFrame: stdout.lastFrame
	};
};

export const cleanup = () => {
	for (const instance of instances) {
		instance.unmount();
		instance.cleanup();
	}
};
