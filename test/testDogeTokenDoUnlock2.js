var DogeToken = artifacts.require("./token/DogeTokenForTests.sol");
var utils = require('./utils');


contract('testDogeTokenDoUnlock2', function(accounts) {
  let dogeToken;
  before(async () => {
      dogeToken = await DogeToken.deployed();
  });
  it('doUnlock whith multiple utxos', async () => {
    const operatorPublicKeyHash = `0x4d905b4b815d483cdfabcd292c6f86509d0fad82`;
    const operatorEthAddress = accounts[3];
    await dogeToken.addOperatorSimple(operatorPublicKeyHash, operatorEthAddress);

    await dogeToken.assign(accounts[0], 5600000000);
    var balance = await dogeToken.balanceOf(accounts[0]);

    await dogeToken.addUtxo(operatorPublicKeyHash, 400000000, web3.utils.toHex(1), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 200000000, web3.utils.toHex(2), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 600000000, web3.utils.toHex(3), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 800000000, web3.utils.toHex(4), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 900000000, web3.utils.toHex(4), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 900000000, web3.utils.toHex(4), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 900000000, web3.utils.toHex(4), 1);
    await dogeToken.addUtxo(operatorPublicKeyHash, 900000000, web3.utils.toHex(4), 1);

    const dogeAddress = utils.base58ToBytes20("DHx8ZyJJuiFM5xAHFypfz1k6bd2X85xNMy");

    // Unlock Request 1
    await dogeToken.doUnlock(dogeAddress, 1000000000, operatorPublicKeyHash).then(function(result) {
      //console.log(result.receipt.logs);
    });
    var unlockPendingInvestorProof = await dogeToken.getUnlockPendingInvestorProof(0);
    //console.log(unlockPendingInvestorProof);
    assert.deepEqual(utils.bigNumberArrayToNumberArray(unlockPendingInvestorProof[5]), [0, 1, 2], `Unlock selectedUtxos are not the expected ones`);
    assert.equal(unlockPendingInvestorProof[3].toNumber(), 10000000, `Unlock operator fee is not the expected one`);
    assert.equal(unlockPendingInvestorProof[6].toNumber(), 350000000, `Unlock dogeTxFee is not the expected one`);
    balance = await dogeToken.balanceOf(accounts[0]);
    assert.equal(balance, 4600000000, `DogeToken's ${accounts[0]} balance after unlock is not the expected one`);
    var operatorTokenBalance = await dogeToken.balanceOf(operatorEthAddress);
    assert.equal(operatorTokenBalance.toNumber(), 10000000, `DogeToken's operator balance after unlock is not the expected one`);
    var unlockIdx = await dogeToken.unlockIdx();
    assert.equal(unlockIdx, 1, 'unlockIdx is not the expected one');
    var operator = await dogeToken.operators(operatorPublicKeyHash);
    assert.equal(operator[1].toString(10), 4400000000, 'operator dogeAvailableBalance is not the expected one');
    assert.equal(operator[2].toString(10),  210000000, 'operator dogePendingBalance is not the expected one');
    assert.equal(operator[3], 3, 'operator nextUnspentUtxoIndex is not the expected one');


    // Unlock Request 2
    await dogeToken.doUnlock(dogeAddress, 1500000000, operatorPublicKeyHash);
    unlockPendingInvestorProof = await dogeToken.getUnlockPendingInvestorProof(1);
    assert.deepEqual(utils.bigNumberArrayToNumberArray(unlockPendingInvestorProof[5]), [3, 4], `Unlock selectedUtxos are not the expected ones`);
    assert.equal(unlockPendingInvestorProof[3].toNumber(), 15000000, `Unlock operator fee is not the expected one`);
    assert.equal(unlockPendingInvestorProof[6].toNumber(), 250000000, `Unlock dogeTxFee is not the expected one`);
    balance = await dogeToken.balanceOf(accounts[0]);
    assert.equal(balance, 3100000000, `DogeToken's ${accounts[0]} balance after unlock is not the expected one`);
    operatorTokenBalance = await dogeToken.balanceOf(operatorEthAddress);
    assert.equal(operatorTokenBalance.toNumber(), 25000000, `DogeToken's operator balance after unlock is not the expected one`);
    unlockIdx = await dogeToken.unlockIdx();
    assert.equal(unlockIdx, 2, 'unlockIdx is not the expected one');
    operator = await dogeToken.operators(operatorPublicKeyHash);
    assert.equal(operator[1].toString(10), 2700000000, 'operator dogeAvailableBalance is not the expected one');
    assert.equal(operator[2].toString(10),  425000000, 'operator dogePendingBalance is not the expected one');
    assert.equal(operator[3], 5, 'operator nextUnspentUtxoIndex is not the expected one');


  });
});
