// from https://github.com/johot/storybook4-cra2-typescript-react-docgen-typescript-demo/blob/master/.storybook/config.ts

import { configure, addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";

// automatically import all files ending in *.stories.tsx
const req = require.context("../src", true, /.stories.tsx$/);

function loadStories() {
    addDecorator(withInfo);
    req.keys().forEach(req);
}

configure(loadStories, module);
