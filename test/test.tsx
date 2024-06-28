import React from 'react';
import test from 'ava';
import {Text, useStdin, useStderr} from 'ink';
import delay from 'delay';
import {render, renderHook, waitFor} from '../source/index.js';

test('render a single frame', t => {
	function Test() {
		return <Text>Hello World</Text>;
	}

	const {frames, lastFrame} = render(<Test />);

	t.is(lastFrame(), 'Hello World');
	t.deepEqual(frames, ['Hello World']);
});

test('render multiple frames', t => {
	function Counter({count}: {readonly count: number}) {
		return <Text>Count: {count}</Text>;
	}

	const {frames, lastFrame, rerender} = render(<Counter count={0} />);

	t.is(lastFrame(), 'Count: 0');
	t.deepEqual(frames, ['Count: 0']);

	rerender(<Counter count={1} />);

	t.is(lastFrame(), 'Count: 1');
	t.deepEqual(frames, ['Count: 0', 'Count: 1']);
});

test('unmount class component', t => {
	let didMount = false;
	let didUnmount = false;

	class Test extends React.Component {
		override render() {
			return <Text>Hello World</Text>;
		}

		override componentDidMount() {
			didMount = true;
		}

		override componentWillUnmount() {
			didUnmount = true;
		}
	}

	const {lastFrame, unmount} = render(<Test />);

	t.is(lastFrame(), 'Hello World');
	t.true(didMount);
	t.false(didUnmount);

	unmount();

	t.true(didUnmount);
});

test('unmount function component', t => {
	let didMount = false;
	let didUnmount = false;

	function Test() {
		React.useLayoutEffect(() => {
			didMount = true;

			return () => {
				didUnmount = true;
			};
		}, []);

		return <Text>Hello World</Text>;
	}

	const {lastFrame, unmount} = render(<Test />);

	t.is(lastFrame(), 'Hello World');
	t.true(didMount);
	t.false(didUnmount);

	unmount();
	t.true(didUnmount);
});

test('write to stdin', async t => {
	function Test() {
		const [input, setInput] = React.useState('');
		const {stdin, setRawMode} = useStdin();

		React.useEffect(() => {
			const handleData = (data: string) => {
				setInput(data);
			};

			setRawMode(true);
			stdin.on('data', handleData);

			return () => {
				setRawMode(false);
				stdin.off('data', handleData);
			};
		}, [stdin, setRawMode]);

		return <Text>{input}</Text>;
	}

	const {stdin, lastFrame} = render(<Test />);
	t.is(lastFrame(), '');
	await delay(100);
	stdin.write('Hello World');
	await delay(100);
	t.is(lastFrame(), 'Hello World');
});

test('write to stderr', async t => {
	function Test() {
		const {write} = useStderr();

		React.useEffect(() => {
			write('Hello World');
		}, [write]);

		return <Text>Output</Text>;
	}

	const {stderr, lastFrame} = render(<Test />);
	t.is(lastFrame(), 'Output');
	await delay(100);
	t.is(stderr.lastFrame(), 'Hello World');
});

test('render a hook', async t => {
	const useCount = () => {
		const [count, setCount] = React.useState(0);

		return {
			count,
			increment() {
				setCount(previousCount => previousCount + 1);
			},
		};
	};

	const {result} = renderHook(() => useCount());
	await waitFor(() => {
		if(result.current === undefined) {
			throw new Error('Result is still undefined');
		}
	});

	result.current.increment();

	await waitFor(() => {
		if(result.current.count !== 1) {
			throw new Error('Count is not 1');
		}
	});

	t.pass();
});
