# ink-testing-library ![test](https://github.com/vadimdemedes/ink-testing-library/workflows/test/badge.svg)

> Utilities for testing [Ink](https://github.com/vadimdemedes/ink) apps

## Install

```
$ npm install --save-dev ink-testing-library
```

## Usage

```jsx
import React from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';

const Counter = ({count}) => <Text>Count: {count}</Text>;

const {lastFrame, rerender} = render(<Counter count={0}/>);
lastFrame() === 'Count: 0'; //=> true

rerender(<Counter count={1}/>);
lastFrame() === 'Count: 1'; //=> true
```

## API

### render(tree)

#### tree

Type: `ReactElement`

React component to render.

```jsx
render(<MyApp/>);
```

This function returns an object, which contains the following methods and properties.

#### lastFrame()

Type: `function`

Shortcut to [`stdout.lastFrame`](#lastframe-1).

#### frames

Type: `array`

Shortcut to [`stdout.frames`](#frames-1).

#### rerender(tree)

Type: `function`

##### tree

Type: `ReactElement`

Rerender root component with different props or replace with another component.

```jsx
const {rerender} = render(<OldApp/>);
rerender(<NewApp/>);
```

#### unmount()

Type: `function`

Unmount current component.

```jsx
const {unmount} = render(<Test/>);
unmount();
```

#### renderHook(hook, options)

Type: `function`

Arguments:
- `hook` (`function`): Hook to render.
- `options` (`object`): Options object with the following properties:
	- `wrapper` (`function`): Wrapper component to wrap the hook with.

Render a hook with an optional wrapper, and return the hook's return value. Works like react-testing-library's `renderHook`.

```jsx
const useCounter = () => {
	const [count, setCount] = React.useState(0);
	return {count, increment: () => setCount(count + 1)};
};

const {result} = renderHook(() => useCounter());
```

#### waitFor(condition, timeout, interval)

Type: `function`
Arguments:
- `condition` (`function`): Function that throws an error if the condition is not met.
- `timeout` (`number`): Timeout in milliseconds.
- `interval` (`number`): Interval in milliseconds.

Wait for a condition to be met. Useful for waiting for side effects. The condition can be jest's `expect` assertion. Works like react-testing-library's `waitFor`.

```jsx
await waitFor(() => expect(result.current.count).toBe(1));
```

#### stdin

Type: `object`

##### write()

Type: `function`

Write data to current component's stdin stream.

```jsx
import {useInput, Text} from 'ink';

const Test = () => {
	useInput(input => {
		console.log(input);
		//=> 'hello'
	});

	return …;
};

const {stdin} = render(<Test/>);
stdin.write('hello');
```

#### stdout

Type: `object`

##### lastFrame()

Type: `function`

Return the last rendered frame (output) from stdout stream.

```jsx
const Test = () => <Text>Hello</Text>;

const {stdout} = render(<Test/>);
stdout.lastFrame(); //=> 'Hello'
```

##### frames

Type: `array`

Array of all rendered frames, where the last frame is also the last item in that array.

```jsx
const Counter = ({count}) => <Text>Count: {count}</Text>;

const {stdout, rerender} = render(<Counter count={0}/>);
rerender(<Counter count={1}/>);

console.log(stdout.frames); //=> ['Count: 0', 'Count: 1']
```

#### stderr

Type: `object`

##### lastFrame()

Type: `function`

Same as [`lastFrame`](#lastframe-1) in [`stdout`](#stdout), but for stderr stream.

##### frames

Type: `array`

Same as [`frames`](#frames-1) in [`stdout`](#stdout), but for stderr stream.
