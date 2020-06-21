/* eslint-disable react/prop-types */
const React = require('react');
const test = require('ava');
const {Text, useStdin, useStderr} = require('ink');
const delay = require('delay');
const {render} = require('.');

test('render a single frame', t => {
	const Test = () => <Text>Hello World</Text>;
	const {frames, lastFrame} = render(<Test/>);

	t.is(lastFrame(), 'Hello World');
	t.deepEqual(frames, ['Hello World']);
});

test('render multiple frames', t => {
	const Counter = ({count}) => <Text>Count: {count}</Text>;
	const {frames, lastFrame, rerender} = render(<Counter count={0}/>);

	t.is(lastFrame(), 'Count: 0');
	t.deepEqual(frames, ['Count: 0']);

	rerender(<Counter count={1}/>);

	t.is(lastFrame(), 'Count: 1');
	t.deepEqual(frames, ['Count: 0', 'Count: 1']);
});

test('unmount', t => {
	let didMount = false;
	let didUnmount = false;

	class Test extends React.Component {
		render() {
			return <Text>Hello World</Text>;
		}

		componentDidMount() {
			didMount = true;
		}

		componentWillUnmount() {
			didUnmount = true;
		}
	}

	const {lastFrame, unmount} = render(<Test/>);

	t.is(lastFrame(), 'Hello World');
	t.true(didMount);
	t.false(didUnmount);

	unmount();

	t.true(didUnmount);
});

test('write to stdin', async t => {
	const Test = () => {
		const [input, setInput] = React.useState('');
		const {stdin, setRawMode} = useStdin();

		React.useEffect(() => {
			const handleData = data => {
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
	};

	const {stdin, lastFrame} = render(<Test/>);
	t.is(lastFrame(), '');
	await delay(100);
	stdin.write('Hello World');
	await delay(100);
	t.is(lastFrame(), 'Hello World');
});

test('write to stderr', async t => {
	const Test = () => {
		const {write} = useStderr();

		React.useEffect(() => {
			write('Hello World');
		}, [write]);

		return <Text>Output</Text>;
	};

	const {stderr, lastFrame} = render(<Test/>);
	t.is(lastFrame(), 'Output');
	await delay(100);
	t.is(stderr.lastFrame(), 'Hello World');
});
