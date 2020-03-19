const btcProof = require('bitcoin-proof');
const scryptsy = require('scryptsy');
const sha256 = require('js-sha256').sha256;
const {
  formatHexUint32,
  fromHex,
  remove0x
} = require('./format');


// Calculate the scrypt hash from a buffer
// hash = scryptHash(data, start, length)
function scryptHash(data, start = 0, length = 80) {
  let buff = Buffer.from(data, start, length);
  return scryptsy(buff, buff, 1024, 1, 1, 32)
}

// the inputs to makeMerkleProof can be computed by using pybitcointools:
// header = get_block_header_data(blocknum)
// hashes = get_txs_in_block(blocknum)
function makeMerkleProof(hashes, txIndex) {
    var proofOfFirstTx = btcProof.getProof(hashes, txIndex);
    return proofOfFirstTx.sibling;
}

// Calculates the merkle root from an array of hashes
// The hashes are expected to be 32 bytes in hexadecimal
function makeMerkle(hashes) {
  if (hashes.length == 0) {
    throw new Error('Cannot compute merkle tree of an empty array');
  }

  return `0x${btcProof.getMerkleRoot(
    hashes.map(x => formatHexUint32(remove0x(x)) )
  )}`;
}

// Return true when the block header contains a AuxPoW
function isHeaderAuxPoW(headerBin) {
  return (headerBin[1] & 0x01) != 0;
}

// Calculate PoW hash from dogecoin header
function calcHeaderPoW(header) {
  const headerBin = fromHex(header);
  if (isHeaderAuxPoW(headerBin)) {
    const length = headerBin.length;
    return scryptHash(headerBin.slice(length - 80, length)).toString('hex');
  }
  return scryptHash(headerBin).toString('hex');
}

// Calculates the double sha256 of a block header
// Block header is expected to be in hexadecimal
function calcBlockSha256Hash(blockHeader) {
  const headerBin = fromHex(blockHeader).slice(0, 80);
  return `0x${Buffer.from(sha256.array(sha256.arrayBuffer(headerBin))).reverse().toString('hex')}`;
}

// Get timestamp from dogecoin block header
function getBlockTimestamp(blockHeader) {
  const headerBin = fromHex(blockHeader).slice(0, 80);
  const timestamp = headerBin[68] + 256 * headerBin[69] + 256 * 256 * headerBin[70] + 256 * 256 * 256 * headerBin[71];
  return timestamp;
}

// Get difficulty bits from block header
function getBlockDifficultyBits(blockHeader) {
  const headerBin = fromHex(blockHeader).slice(0, 80);
  const bits = headerBin[72] + 256 * headerBin[73] + 256 * 256 * headerBin[74] + 256 * 256 * 256 * headerBin[75];
  return bits;
}

// Get difficulty from dogecoin block header
function getBlockDifficulty(blockHeader) {
  const headerBin = fromHex(blockHeader).slice(0, 80);
  const exp = web3.utils.toBN(headerBin[75]);
  const mant = web3.utils.toBN(headerBin[72] + 256 * headerBin[73] + 256 * 256 * headerBin[74]);
  const target = mant.mul(web3.utils.toBN(256).pow(exp.sub(web3.utils.toBN(3))));
  const difficulty1 = web3.utils.toBN(0x00FFFFF).mul(web3.utils.toBN(256).pow(web3.utils.toBN(0x1e-3)));
  const difficulty = difficulty1.div(target);
  return difficulty1.div(target);
}

module.exports = {
  calcBlockSha256Hash,
  calcHeaderPoW,
  getBlockDifficulty,
  getBlockDifficultyBits,
  getBlockTimestamp,
  isHeaderAuxPoW,
  makeMerkle,
  makeMerkleProof,
};
