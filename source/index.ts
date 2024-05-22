import {EventEmitter} from 'node:events';
import {render as inkRender, type Instance as InkInstance} from 'ink';
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
