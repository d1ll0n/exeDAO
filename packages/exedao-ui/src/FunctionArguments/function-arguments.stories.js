import React from "react";
import { storiesOf } from "@storybook/react";
import { text } from "@storybook/addon-knobs"; // Add prop types here!

import FunctionArguments from "./index";

const categoryName = "ElementalComponents/FunctionArgumentsHandler";

storiesOf(categoryName, module).add("Function Arguments Handler", () => {
  const defaultProps = {};

  return <FunctionArguments {...defaultProps} />;
});
