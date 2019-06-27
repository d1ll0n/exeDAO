import React, { useState, useRef, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import { 
            Paper, Grid, TextField, Select, 
            List, ListItem, ListItemText, 
            IconButton, Button, OutlinedInput, FormControl, 
            InputLabel, ListSubheader, Divider, Typography 
        } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete'

const BuyRequestForm = ({
    classes,
    tokens
}) => {

    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);
    useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);

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
        const stateCopy = [...selectedTokens];
        stateCopy.splice(index, 1);
        setSelectedTokens(stateCopy);
    };

    const addToken = (token, amount) => {
        setSelectedTokens([...selectedTokens, { token: token, amount: amount }]);
        setSelectedToken({});
        setSelectedTokenValue(0);
    };

    return (
        <Paper className = { classes.paper }>
            <Grid container alignItems = "center" direction = "column">
                <Grid item style = {{ marginTop: 10 }}>
                    <Typography variant = "h6">
                        Buy Request
                    </Typography>
                </Grid>
                <Grid item style = {{ marginTop: 10 }}>
                    <TextField
                        label = "Name"
                        required
                        value = { name }
                        onChange = { e => setName(e.target.value) }
                        type = "text"
                        variant = "outlined"
                    />
                </Grid>
                <Grid item style = {{ marginTop: 10 }}>
                    <TextField
                        label = "Description"
                        required
                        value = { description }
                        onChange = { e => setDescription(e.target.value) }
                        type = "text"
                        variant = "outlined"                            
                    />
                </Grid>
                <Grid item style = {{ marginTop: 10 }}> 
                    <TextField
                            label = "Amount of shares requested"
                            required
                            value = { shareAmount }
                            onChange = { e => setShareAmount(e.target.value) }
                            type = "number"
                            variant = "outlined"                                
                            inputProps = {{ min: '0'}}
                        />
                </Grid>                
                <Grid item style = {{ marginTop: 10 }}>
                    <TextField
                            label = "Amount in Wei to send"
                            required
                            value = { weiAmount }
                            onChange = { e => setWeiAmount(e.target.value) }
                            type = "number"
                            variant = "outlined"                                
                            inputProps = {{ min: '0'}}
                        />
                </Grid>
                <Grid container alignItems = "center" direction = "column">
                    <Grid item style = {{ marginTop: 10 }} >
                        <Paper className = { classes.tokenList }>
                            <List subheader={ <ListSubheader inset = { true } disableSticky = { true }> Tokens to send </ListSubheader> } >
                                {selectedTokens && 
                                    selectedTokens.map((t, i) => 
                                        <React.Fragment key = { i }>
                                            <Divider/>
                                            <ListItem button>
                                                <ListItemText>
                                                    {`token: ${t.token.symbol} amount: ${t.amount}`}
                                                </ListItemText>
                                                <IconButton  onClick = { () => removeToken(i) }>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    )
                                }
                            </List>
                        </Paper>    
                    </Grid>
                    <Grid container justify = "center">
                        <Grid item style = {{ marginTop: 10 }} >
                            <FormControl variant = "outlined" className = { classes.FormControl}>
                                <InputLabel ref = { inputLabel } htmlFor = "tokenHolder"> Token </InputLabel>
                                <Select
                                    className = { classes.select }
                                    value = { selectedToken }
                                    onChange = { e => setSelectedToken(e.target.value) }
                                    input = { <OutlinedInput name = "token" labelWidth = { labelWidth } id = "tokenHolder"/> }
                                >
                                    <option value=""/>
                                    {tokens &&
                                        tokens.map((token, i) => <option value = { token } key = { i }> { token.symbol } </option>)
                                    }
                                </Select>
                            </FormControl> 
                        </Grid>         
                        <Grid item style = {{ marginTop: 10 }} >
                            <IconButton size = "small" onClick = { () => addToken(selectedToken, selectedTokenValue) }>
                                <AddIcon/>
                            </IconButton>
                        </Grid>  
                        <Grid container justify = "center">
                            <TextField
                                label = "Amount of tokens to send"
                                value = { selectedTokenValue }
                                onChange = { e => setSelectedTokenValue(e.target.value) }
                                type = "number"
                                variant = "outlined"                                    
                                inputProps = {{ min: '0'}}
                                style = {{ marginTop: 10 }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container justify = "center">
                    <Button 
                        variant = "contained" 
                        color = "primary" 
                        onClick = { () => handleSubmit(name, description, shareAmount, weiAmount, selectedTokens)}
                        style = {{ marginTop: 10 }}
                    >
                        SUBMIT
                    </Button>                    
                </Grid>        
            </Grid> 
        </Paper>
    );
};

export default withStyles(styles)(BuyRequestForm);