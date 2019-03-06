/* eslint-disable react/prop-types */
import React from 'react';
import test from 'ava';
import {Text, StdinContext} from 'ink';
import {render} from '.';

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

test('write to stdin', t => {
	class Test extends React.Component {
		constructor() {
			super();

			this.state = {
				input: ''
			};
		}

		render() {
			return <Text>{this.state.input}</Text>;
		}

		componentDidMount() {
			this.props.setRawMode(true);
			this.props.stdin.on('data', data => {
				this.setState({
					input: data
				});
			});
		}
	}

	const {stdin, lastFrame} = render((
		<StdinContext.Consumer>
			{({stdin, setRawMode}) => (
				<Test stdin={stdin} setRawMode={setRawMode}/>
			)}
		</StdinContext.Consumer>
	));

	t.is(lastFrame(), '');

	stdin.write('Hello World');

	t.is(lastFrame(), 'Hello World');
});
