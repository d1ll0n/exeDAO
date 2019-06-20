'use strict';

const easySolc = require('./easy-solc');
const fs = require('fs');
const path = require('path');
const mkdirpCallback = require('mkdirp')
const rimrafCallback = require('rimraf');

const mkdirp = (p) => new Promise((resolve, reject) => mkdirpCallback(p, (err) => err ? reject(err) : resolve()));
const rimraf = (p) => new Promise((resolve, reject) => rimrafCallback(p, (err) => err ? reject(err) : resolve()));

const buildPath = path.join(__dirname, 'build');
let solOutput;
try {
  solOutput = easySolc('exeDAO', fs.readFileSync(path.join(__dirname, 'contracts', `exeDAO.sol`), 'utf8'), true);
} catch (e) {
  if (e.errors) return e.errors.forEach((err) => console.error(err.formattedMessage));
  throw e;
}

const build = (fileName) => {
  let out = solOutput[fileName];
  fs.writeFileSync(path.join(buildPath, `${fileName}.json`), JSON.stringify(out));
  console.log('saved to ' + path.join('build', `${fileName}.json`));
  console.log(`bytecode size: ${out.bytecode.length} bytes`)
}

rimraf(buildPath)
  .then(() => mkdirp(buildPath))
  .then(() => build('Shared'))
  .then(() => build('Permissioned'))
  .then(() => build('Extendable'))
  .then(() => build('exeDAO'))
  .catch((err) => console.error(err.stack || err.message || err));
