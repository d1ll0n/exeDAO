import { AbiCoder } from 'web3-eth-abi';
// import {isAddress} from 'web3-utils';
/* import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider'; */
import AbiInput from './AbiInput';
const coder = new AbiCoder();

const parseAbi = (abi) => {
  const functionSignatures = [];
  const functions = {};
  for (let funcAbi of abi) {
    const {name, inputs, type, stateMutability, payable} = funcAbi;
    if (type != 'function' || stateMutability == 'view') continue;
    const signature = coder.encodeFunctionSignature(funcAbi);
    functionSignatures.push(signature)
    functions[signature] = {signature, name, inputs, payable, stateMutability, type}
  }
  return {functions, functionSignatures}
}
