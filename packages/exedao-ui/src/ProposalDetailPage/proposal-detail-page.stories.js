import React from "react";
import { storiesOf } from "@storybook/react";
import { text, number, array } from "@storybook/addon-knobs";

import ProposalDetailPage from "./index";

const categoryName = "AssembledComponents/ProposalDetailPage";

storiesOf(categoryName, module).add("Proposalsu Detailsu", () => {
  const defaultProps = {
    title: text("title", "Biggest Job Ever"),
    description: text("description", "Yeet"),
    votesNeeded: number("votesNeeded", 69),
    currentVotes: number("currentVotes", 1),
    functionName: text("functionName", "Shitty function"),
    functionArgs: array("functionArgs", [])
  };

  return <ProposalDetailPage {...defaultProps} />;
});
