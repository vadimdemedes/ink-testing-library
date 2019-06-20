'use strict';
const EventEmitter = require('events');
const {render} = require('ink');

const createStdout = () => {
	const frames = [];
	let _lastFrame;

	const stdout = {
		write(frame) {
			frames.push(frame);
			_lastFrame = frame;
		},
		lastFrame() {
			return _lastFrame;
		},
		frames,
		columns: 100
	};

	return stdout;
};

const createStdin = () => {
	const stdin = new EventEmitter();
	stdin.setEncoding = () => {};
	stdin.setRawMode = () => {};
	stdin.resume = () => {};
	stdin.pause = () => {};
	stdin.write = data => stdin.emit('data', data);
	stdin.isTTY = true;

	return stdin;
};

const instances = [];

exports.render = tree => {
	const stdout = createStdout();
	const stdin = createStdin();

	const instance = render(tree, {
		stdout,
		stdin,
		debug: true,
		exitOnCtrlC: false
	});

	instances.push(instance);

	return {
		rerender: instance.rerender,
		unmount: instance.unmount,
		stdin: {
			write: stdin.write
		},
		frames: stdout.frames,
		lastFrame: stdout.lastFrame
	};
};

exports.cleanup = () => {
	for (const instance of instances) {
		instance.unmount();
		instance.cleanup();
	}
};
