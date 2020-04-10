const DogeMessageLibraryForTests = artifacts.require('DogeMessageLibraryForTests');

contract('DogeMessageLibrary', (accounts) => {

  let dogeMessageLibraryForTests;
  before(async () => {
    dogeMessageLibraryForTests = await DogeMessageLibraryForTests.deployed();
  });
  it("concatenate 2 hashes", async () => {
    const concatenatedHashes = await dogeMessageLibraryForTests.concatHashPublic.call("0x8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87", "0xfff2525b8931402dd09222c50775608f75787bd2b87e56995a7bdd30f79702c4");
    assert.equal(concatenatedHashes, "0xccdafb73d8dcd0173d5d5c3c9a0770d0b3953db889dab99ef05b1907518cb815", "Concatenated hash is not the expected one");
  });
  it("flip32Bytes large number", async () => {
    const flipped = await dogeMessageLibraryForTests.flip32BytesPublic.call("0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20");
    assert.equal(flipped, "0x201f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504030201", "flip32Bytes not the expected one");
  });
  it("flip32Bytes short number", async () => {
    const flipped = await dogeMessageLibraryForTests.flip32BytesPublic.call("0x0000000000000000000000000000000000000000000000000000000000001234");
    assert.equal(flipped, "0x3412000000000000000000000000000000000000000000000000000000000000", "flip32Bytes is not the expected one");
  });
  it("target from bits 1", async () => {
    const target = await dogeMessageLibraryForTests.targetFromBitsPublic.call("0x19015f53");
    assert.equal(target.toString(), "8614444778121073626993210829679478604092861119379437256704", "target is not the expected one");
  });
  it("target from bits 2", async () => {
    const target = await dogeMessageLibraryForTests.targetFromBitsPublic.call("453281356");
    assert.equal(target.toString(16), "4864c000000000000000000000000000000000000000000000000", "target is not the expected one");
  });
  it("target from bits 3", async () => {
    const target = await dogeMessageLibraryForTests.targetFromBitsPublic.call("0x1d00ffff"); // EASIEST_DIFFICULTY_TARGET
    //maxTargetRounded = (Math.pow(2,16) - 1) * Math.pow(2,208);  // http://bitcoin.stackexchange.com/questions/8806/what-is-difficulty-and-how-it-relates-to-target
    maxTargetRounded = "ffff0000000000000000000000000000000000000000000000000000";
    assert.equal(target.toString(16), maxTargetRounded, "target is not the expected one");
  });
  it("bytesToBytes32", async () => {
    const result = await dogeMessageLibraryForTests.bytesToBytes32Public.call("0x0102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f00");
    assert.equal(result, "0x0102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f00", "converted bytes are not the expected ones");
  });
  it("bytesToUint32", async () => {
    const result = await dogeMessageLibraryForTests.bytesToUint32Public.call("0x01020304");
    assert.equal(result.toNumber(), 16909060, "converted bytes are not the expected ones");
  });

});
