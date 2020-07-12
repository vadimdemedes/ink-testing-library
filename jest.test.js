'use strict';
const React = require('react');
const {Text} = require('ink');
const {render} = require('.');

test('render a single frame', () => {
	const Test = () => <Text>Hello World</Text>;
	const {frames, lastFrame} = render(<Test/>);

	expect(lastFrame()).toEqual('Hello World');
	expect(frames).toEqual(['Hello World']);
});
