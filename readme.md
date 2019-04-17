# ink-testing-library [![Build Status](https://travis-ci.org/vadimdemedes/ink-testing-library.svg?branch=master)](https://travis-ci.org/vadimdemedes/ink-testing-library)

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

Return the last rendered frame (output).

```jsx
const Test = () => <Text>Hello</Text>;

const {lastFrame} = render(<Test/>);
lastFrame(); //=> 'Hello'
```

#### frames

Type: `array`

Array of all rendered frames, where the last frame is also the last item in that array.

```jsx
const Counter = ({count}) => <Text>Count: {count}</Text>;

const {frames, rerender} = render(<Counter count={0}/>);
rerender(<Counter count={1}/>);

console.log(frames); //=> ['Count: 0', 'Count: 1']
```

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

#### stdin

Type: `object`

##### write()

Type: `function`

Write data to current component's stdin stream.

```jsx
import {StdinContext, Text} from 'ink';

class Test extends React.Component {
	render() {
		return <Text>Hello</Text>;
	}

	componentDidMount() {
		this.props.setRawMode(true);
		this.props.stdin.on('data', data => {
			console.log(data); //=> 'hello'
		});
	}
}

const tree = (
	<StdinContext.Consumer>
		{({stdin, setRawMode}) => (
			<Test stdin={stdin} setRawMode={setRawMode}/>
		)}
	</StdinContext.Consumer>
);

const {stdin} = render(tree);
stdin.write('hello');
```

### createRender()

A `createRender` function is also exported to allow you to mock Ink's render function and replace it with the one from this library when using testing libraries such as Jest. This is useful for more integration style tests as it allows you to assert what was rendered without direct access to the return value of `render()`.

e.g. 

When using Jest creating a file named `__mocks__/tin.js` in the same folder containing your `node_modules` will replace Ink's render function for all of your tests.

```jsx
import { createRender } from "ink-testing-library";

const ink = jest.requireActual("ink");

module.exports = {
  ...ink,
  render: jest.fn(createRender(ink.render))
};

```

```jsx
import React from "react";
import { render } from "ink";

import prog from "main"

it("shows the config", () => {
  prog.parse("config show");
  
  render.mock.results[0].value.lastFrame() // Output from the first render call
});
```

This is nessesary because under the hood Ink Testing Library uses Ink's real `render()` function. Attempting to mock `ink.render()` while using ITL will cause ITL's `render()` function to use the newly mocked `ink.render()`.

## License

MIT © [Vadim Demedes](https://github.com/vadimdemedes/ink-testing-library)
