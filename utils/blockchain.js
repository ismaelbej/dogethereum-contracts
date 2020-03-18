//

/* function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
} */

function blockchainTimeoutSeconds(web3, s) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [s],
      id: 0,
    }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function mineSingleBlock(web3) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 0,
    }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

async function mineBlocks(web3, n) {
  const startBlock = await getBlockNumber(web3);
  let currentBlock = startBlock;

  while (currentBlock < startBlock + n) {
    await mineSingleBlock(web3);
    currentBlock = await getBlockNumber(web3);
  }
}

function getBlockNumber(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

module.exports = (web3) => ({
  blockchainTimeoutSeconds: (secs) => blockchainTimeoutSeconds(web3, secs),
  getBlockNumber: () => getBlockNumber(web3),
  mineBlocks: (n) => mineBlocks(web3, n)
});
