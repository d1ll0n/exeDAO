'use strict';

const {compile} = require('./easy-solc');
const fs = require('fs');
const path = require('path');
const rimrafCallback = require('rimraf');

const mkdir = (p) => fs.existsSync(p) || fs.mkdirSync(p);
const rimraf = (p) => new Promise((resolve, reject) => rimrafCallback(p, (err) => err ? reject(err) : resolve()));

const buildPath = path.join(__dirname, 'build');

const partialPaths = (filePath) => filePath.match(/\w+(?=\/)/g)
const mkdirMany = (partials) => {
  if (!partials) return;
  let curPath = buildPath;
  for (let partial of partials) {
    curPath = path.join(curPath, partial);
    mkdir(curPath)
  }
}

const build = () => {
  try {
    const compiled = compile('ExeDAO', fs.readFileSync(path.join(__dirname, 'contracts', `ExeDAO.sol`), 'utf8'), true);
    for (const filePath of Object.keys(compiled)) {
      mkdirMany(partialPaths(filePath));
      const jsonPath = filePath.replace('.sol', '.json')
      fs.writeFileSync(path.join(buildPath, jsonPath), JSON.stringify(compiled[filePath], null, 2));
      console.log(`saved ${filePath} to ${jsonPath}`)
    }
  } catch (e) {
    if (e.errors) return e.errors.forEach((err) => console.error(err.formattedMessage));
    throw e;
  }
}

rimraf(buildPath)
  .then(() => mkdir(buildPath))
  .then(() => build())
  .catch((err) => console.error(err.stack || err.message || err));
