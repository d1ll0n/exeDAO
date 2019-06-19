require('dotenv').config();
const Temporal = require('./temporal');
const mh = require('multihashing-async');
const path = require('path');
const fs = require('fs');
const {encode, decode} = require('multihashes')
const bs58 = require('bs58')
const bs32 = require('base-x')('0123456789ABCDEFGHJKMNPQRSTVWXYZ')
let {temporaluser, temporalpass} = process.env;
const varint = require('varint')
const filesPath = path.join(__dirname, 'proposals');
if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath);
const filePath = fileHash => path.join(filesPath, fileHash)

async function test() {
  /* const temporal = new Temporal(temporaluser, temporalpass);
  await temporal.login(temporaluser, temporalpass);
  const file = JSON.stringify({a: 'hellothere', b: 'testing123'});
  let fileHash = await mh(file, 'sha3-256');
  fileHash = fileHash.toString('hex')
  const p = filePath(fileHash)
  fs.writeFileSync(p, file);
  const rs = fs.createReadStream(p);
  const newHash = await temporal.uploadPublicFile(rs, 1)
  console.log(`mh hash ${fileHash}`)
  console.log(`temporal hash ${newHash}`) */
  // bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq
  // 1620982e34c62f86883a8fd800c26faa86d01ea163db683154ef63b8cf0d82ced0a4

  /* const buf = Buffer.from('982e34c62f86883a8fd800c26faa86d01ea163db683154ef63b8cf0d82ced0a4', 'hex')
  const e = bs58.encode(buf)
  console.log(e) */
  // const t = decode(bs58.decode('bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq')).toString('hex')
  // console.log(t)
  const file = JSON.stringify({a: 'hellothere', b: 'testing123'});
  let fileHash = await mh(file, 'sha3-256');
  fileHash.slice(3)
  console.log(`mh hash ${fileHash.toString('hex')}`)
  console.log(decode(fileHash).digest.toString('hex'))
  // const buf = Buffer.from(JSON.stringify({a: 'hellothere', b: 'testing123'}))
  // Buffer.from()
  const fn = Buffer.from(varint.encode(0x16))
  const ln = Buffer.from(varint.encode(0x20))
  const a = Buffer.concat([fn, ln])
  const CID = require('cids')
  //'bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq'
  const cid = new CID(1, 'raw', Buffer.from('1620982e34c62f86883a8fd800c26faa86d01ea163db683154ef63b8cf0d82ced0a4', 'hex'), 'base32')
  console.log(cid.multihash.toString('hex'))
  console.log(cid.toBaseEncodedString())
  // console.log(bs32.encode(Buffer.from('982e34c62f86883a8fd800c26faa86d01ea163db683154ef63b8cf0d82ced0a4', 'hex')))
  
  // varint.decode
  // bs32.decode('afkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq'.toUpperCase()).toString('hex')
  // console.log('bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq'.toString('hex'))
  // mh.validate(buf, 'bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq').then(console.log)
  // console.log(decode(bs58.decode('bafkrmieyfy2mml4gra5i7waayjx2vbwqd2qwhw3igfko6y5yz4gyftwquq')).digest.toString('hex'))
}

test()