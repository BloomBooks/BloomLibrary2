import React, { Component } from "react";
import BookGroup from "./BookGroup";
import { css, cx } from "emotion";
import CategoryGroup from "./CategoryGroup";
import { RouterConsumer } from "../BlorgRouter";
import { observer, Observer } from "mobx-react";

@observer
class Page extends Component {
  render() {
    return (
      //kind of a mess. See https://github.com/mobxjs/mobx-react/issues/471
      // can revisit when we try to use hooks and mobx-react-lite
      <RouterConsumer>
        {browseContext =>
          browseContext && (
            <Observer>
              {() => (
                <div>
                  {/* <h1>{browseContext.name}</h1> */}
                  <ul
                    className={css`
                      list-style: none;
                    `}
                  >
                    <BookGroup title="Featured Shell Books You Can Translate" />
                    <BookGroup title="Local Language &amp; Culture Books" />
                    <CategoryGroup title="Publishers" />
                  </ul>
                </div>
              )}
            </Observer>
          )
        }
      </RouterConsumer>
    );
  }
}

export default Page;
