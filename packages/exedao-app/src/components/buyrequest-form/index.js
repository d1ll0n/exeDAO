import React, { Component } from 'react';
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

class BuyRequestForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
            shareAmount: 0,
            weiAmount: 0,
            selectedTokens: [],
            selectedToken: {},
            selectedTokenValue: 0,
        }
    }

    handleSubmit = (name, description, shares, wei, tokens) => {
        console.log("SUBMITTED YAYYYYYYYYY !!!")
    };

    removeToken = (index) => {
        const stateCopy = this.state.selectedTokens;
        stateCopy.splice(index, 1);
        this.setState({
            selectedTokens: stateCopy
        });
    };

    addToken = () => {
        const { selectedTokens, selectedToken, selectedTokenValue } = this.state;

        this.setState({
            selectedTokens: [...selectedTokens, { token: selectedToken, amount: selectedTokenValue }],
            selectedToken: {},
            selectedTokenValue: 0
        });
    };

    renderSendTokenList = () => {
        const { classes } = this.props;
        const { selectedTokens } = this.state;
        return (
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
                                    <IconButton  onClick = { () => this.removeToken(i) }>
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        )
                    }
                </List>
            </Paper>  
        );
    };

    renderTokenSelect = () => {
        const { classes, tokens } = this.props;
        const { selectedToken } = this.state;
        return (
            <FormControl variant = "outlined" className = { classes.FormControl}>
                <InputLabel> Token </InputLabel>
                <Select
                    className = { classes.select }
                    value = { selectedToken }
                    onChange = { e => this.setState({ selectedToken: e.target.value }) }
                    input = { <OutlinedInput name = "token"/> }
                >
                    <option value=""/>
                    {tokens &&
                        tokens.map((token, i) => <option value = { token } key = { i }> { token.symbol } </option>)
                    }
                </Select>
            </FormControl> 
        );
    };

    render () {
        const { classes} = this.props;
        const { name, description, shareAmount, weiAmount, selectedTokenValue } = this.state;
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
                            onChange = { e => this.setState({ name: e.target.value }) }
                            type = "text"
                            variant = "outlined"
                        />
                    </Grid>
                    <Grid item style = {{ marginTop: 10 }}>
                        <TextField
                            label = "Description"
                            required
                            value = { description }
                            onChange = { e => this.setState({ description: e.target.value }) }
                            type = "text"
                            variant = "outlined"                            
                        />
                    </Grid>
                    <Grid item style = {{ marginTop: 10 }}> 
                        <TextField
                                label = "Amount of shares requested"
                                required
                                value = { shareAmount }
                                onChange = { e => this.setState({ shareAmount: e.target.value }) }
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
                                onChange = { e => this.setState({ weiAmount: e.target.value }) }
                                type = "number"
                                variant = "outlined"                                
                                inputProps = {{ min: '0'}}
                            />
                    </Grid>
                    <Grid container alignItems = "center" direction = "column">
                        <Grid item style = {{ marginTop: 10 }} >  
                            { this.renderSendTokenList() }
                        </Grid>
                        <Grid container justify = "center">
                            <Grid item style = {{ marginTop: 10 }} >
                                { this.renderTokenSelect() }
                            </Grid>         
                            <Grid item style = {{ marginTop: 10 }} >
                                <IconButton size = "small" onClick = { () => this.addToken() }>
                                    <AddIcon/>
                                </IconButton>
                            </Grid>  
                            <Grid container justify = "center">
                                <TextField
                                    label = "Amount of tokens to send"
                                    value = { selectedTokenValue }
                                    onChange = { e => this.setState({ selectedTokenValue: e.target.value }) }
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
                            onClick = { () => this.handleSubmit() }
                            style = {{ marginTop: 10 }}
                        >
                            SUBMIT
                        </Button>                    
                    </Grid>        
                </Grid> 
            </Paper>
        );
    }
}

export default withStyles(styles)(BuyRequestForm);