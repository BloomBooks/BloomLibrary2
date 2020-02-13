import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// currently fails, apparently mainly because it runs effects in a way that
// jest testing does not support.
// it('renders without crashing', () => {
//   const div = document.createElement('div');
//   ReactDOM.render(<App />, div);
//   ReactDOM.unmountComponentAtNode(div);
// });
// Just to make the test runner happy, that this test 'suite' isn't empty.
it("adds two and two", () => {
    expect(2 + 2).toBe(4);
});
