import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { Paper, Grid, FormControl, TextField, Select, List, ListItem, ListItemText, IconButton, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete'

const BuyRequestForm = ({
    classes,
    tokens
}) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [shareAmount, setShareAmount] = useState(0);
    const [weiAmount, setWeiAmount] = useState(0);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState({});
    const [selectedTokenValue, setSelectedTokenValue] = useState(0);
    const [submission, setSubmission] = useState({});

    const handleSubmit = (name, description, shares, wei, tokens) => {
        console.log("SUBMITTED YAYYYYYYYYY !!!")
    };

    const removeToken = (index) => {
        console.log("r00d!");
    };

    const addToken = (token, amount) => {
        setSelectedTokens([...selectedTokens, { token: token, amount: amount }]);
        setSelectedToken({});
        setSelectedTokenValue(0);
    };

    return (
        <Paper className = { classes.paper }>
            <FormControl>
                <Grid container direction = "column" alignItems = "flex-start">
                    <Grid item>
                        <TextField
                            label = "Name"
                            required
                            value = { name }
                            onChange = { e => setName(e.target.value) }
                            type = "text"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label = "Description"
                            required
                            value = { description }
                            onChange = { e => setDescription(e.target.value) }
                            type = "text"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                                label = "Amount of shares requested"
                                required
                                value = { shareAmount }
                                onChange = { e => setShareAmount(e.target.value) }
                                type = "number"
                                inputProps = {{ min: '0'}}
                            />
                    </Grid>                
                    <Grid item>
                        <TextField
                                label = "Amount in Wei to send"
                                required
                                value = { weiAmount }
                                onChange = { e => setWeiAmount(e.target.value) }
                                type = "number"
                                inputProps = {{ min: '0'}}
                            />
                    </Grid>
                    <Grid container>
                        <Grid item className = { classes.tokenList }>
                            <List>
                                {selectedTokens && 
                                    selectedTokens.map((t, i) => 
                                        <ListItem key = { i }>
                                            <ListItemText>
                                                {`token: ${t.token.symbol} amount: ${t.amount}`}
                                            </ListItemText>
                                            <IconButton onClick = { () => removeToken(i) }>
                                                <DeleteIcon/>
                                            </IconButton>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </Grid>
                        <Grid container direction = "column" alignItems = "flex-start">
                            <Grid item>
                                <Select
                                    value = { selectedToken }
                                    onChange = { e => setSelectedToken(e.target.value) }
                                >
                                    <option value="" key='default'> Select a token </option>
                                    {tokens &&
                                        tokens.map((token, i) => <option value = { token } key = { i }> { token.symbol } </option>)
                                    }
                                </Select>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label = "Amount of tokens to send"
                                    required
                                    value = { selectedTokenValue }
                                    onChange = { e => setSelectedTokenValue(e.target.value) }
                                    type = "number"
                                    inputProps = {{ min: '0'}}
                                />
                                <IconButton onClick = { () => addToken(selectedToken, selectedTokenValue) }>
                                    <AddIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container justify = "center">
                        <Button 
                            variant = "contained" 
                            color = "primary" 
                            onClick = { () => handleSubmit(name, description, shareAmount, weiAmount, selectedTokens)}
                        >
                            SUBMIT
                        </Button>                    
                    </Grid>        
                </Grid>
            </FormControl>
        </Paper>
    );
};

export default withStyles(styles)(BuyRequestForm);