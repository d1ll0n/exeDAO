import React from "react";
import { Typography, List, ListSubheader, ListItem } from "@material-ui/core";

const renderArray = (name, value) => {
    return (
        <List subheader = { <ListSubheader> { name } </ListSubheader> }>
            {
                value.map((v, i) =>
                    <ListItem key = { i }>
                        <FunctionArguments
                            name = { i }
                            value = { v.value }
                        /> 
                    </ListItem>
                )
            }
        </List>
    );
};

const FunctionArguments = ({
    name,
    value
}) => {
    if (Array.isArray(value)) return renderArray(name, value);
    else {
        return(
            <Typography>
                {`${name}: ${value}`}
            </Typography>
        );
    }
};

export default FunctionArguments;
