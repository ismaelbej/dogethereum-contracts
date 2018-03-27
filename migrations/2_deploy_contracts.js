const DogeRelay = artifacts.require('DogeRelay');
const DogeRelayForTests = artifacts.require('DogeRelayForTests');
const DogeProcessor = artifacts.require('DogeProcessor');
const Set = artifacts.require('token/Set');
const DogeToken = artifacts.require('token/DogeToken');
const DogeTokenForTests = artifacts.require('token/DogeTokenForTests');
const DogeTx = artifacts.require('DogeTx');
const ScryptCheckerDummy = artifacts.require('ScryptCheckerDummy');

const scryptCheckerAddress = '0xfeedbeeffeedbeeffeedbeeffeedbeeffeedbeef';
const dogethereumRecipientUnitTest = '0x4d905b4b815d483cdfabcd292c6f86509d0fad82';
const dogethereumRecipientIntegrationDogeMain = '0x0000000000000000000000000000000000000003';
const dogethereumRecipientIntegrationDogeRegtest = '0x03cd041b0139d3240607b9fd1b2d1b691e22b5d6';
const trustedDogeEthPriceOracleRopsten = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const DOGE_MAINNET = 0;
const DOGE_REGTEST = 2;

async function deployDevelopment(deployer, network, accounts, networkId, trustedDogeEthPriceOracle, dogethereumRecipient) {
  await deployer.deploy(Set);
  await deployer.deploy(DogeTx);

  await deployer.link(Set, DogeTokenForTests);
  await deployer.link(DogeTx, DogeTokenForTests);

  await deployer.deploy(DogeRelayForTests, networkId);
  await deployer.deploy(ScryptCheckerDummy, DogeRelayForTests.address, true)
  await deployer.deploy(DogeProcessor, DogeRelayForTests.address);
  await deployer.deploy(DogeTokenForTests, DogeRelayForTests.address, trustedDogeEthPriceOracle, dogethereumRecipient);

  const dogeRelay = DogeRelayForTests.at(DogeRelayForTests.address);
  await dogeRelay.setScryptChecker(ScryptCheckerDummy.address);
}

async function deployProduction(deployer, network, accounts, networkId, trustedDogeEthPriceOracle, dogethereumRecipient) {
  await deployer.deploy(Set);
  await deployer.deploy(DogeTx);

  await deployer.link(Set, DogeToken);
  await deployer.link(DogeTx, DogeToken);

  await deployer.deploy(DogeRelay, networkId);
  await deployer.deploy(DogeToken, DogeRelay.address, trustedDogeEthPriceOracle, dogethereumRecipient);

  await deployer.deploy(ScryptCheckerDummy, DogeRelay.address, true)

  const dogeRelay = DogeRelay.at(DogeRelay.address);
  await dogeRelay.setScryptChecker(ScryptCheckerDummy.address);
}

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    var trustedDogeEthPriceOracle;
    if (network === 'development' || network === 'integrationDogeRegtest' || network === 'integrationDogeMain') {
      trustedDogeEthPriceOracle = accounts[3]
    } else {
      trustedDogeEthPriceOracle = trustedDogeEthPriceOracleRopsten;
    }

    if (network === 'development' || network === 'ropsten') {
      await deployDevelopment(deployer, network, accounts, DOGE_MAINNET, trustedDogeEthPriceOracle, dogethereumRecipientUnitTest);
    } else if (network === 'integrationDogeMain') {
      await deployProduction(deployer, network, accounts, DOGE_MAINNET, trustedDogeEthPriceOracle, dogethereumRecipientIntegrationDogeMain);
    } else if (network === 'integrationDogeRegtest') {
      await deployProduction(deployer, network, accounts, DOGE_REGTEST, trustedDogeEthPriceOracle, dogethereumRecipientIntegrationDogeRegtest);
    }
  });
};