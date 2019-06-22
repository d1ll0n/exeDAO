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
    functionArgs: array("functionArgs", 
      [ {name: "arg1", value: "one"},
        {name: "arg2", value: "two"}, 
        {name: "arg3", value: 
          [ 
            {name: "", value: "three"}, 
            {name: "", value: "four"} 
          ]
        } 
      ]
    )
  };

  return <ProposalDetailPage {...defaultProps} />;
});
