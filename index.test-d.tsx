import * as React from "react";
import { Box } from "ink";
import { render } from ".";
import { expectType } from "tsd";

const helpers = render<{}>(<Box>Rendered!</Box>);

helpers.rerender(<Box>Updated!</Box>);
helpers.stdin.write("Hello");
expectType<Array<string>>(helpers.frames);
expectType<string>(helpers.lastFrame());

helpers.unmount();
