pragma solidity 0.5.16;

import {DogeMessageLibrary} from './DogeMessageLibrary.sol';

// @dev - Manages a battle session between superblock submitter and challenger
contract DogeMessageLibraryForTests {

    function bytesToUint32Public(bytes memory input) public pure returns (uint32 result) {
        return bytesToUint32(input, 0);
    }

    function bytesToUint32FlippedPublic(bytes memory input) public pure returns (uint32 result) {
        return DogeMessageLibrary.bytesToUint32Flipped(input, 0);
    }

    function readBytes32Public(bytes memory data) public pure returns (bytes32) {
        return DogeMessageLibrary.readBytes32(data, 0);
    }

    function readUint32Public(bytes memory data) public pure returns (uint32) {
        return DogeMessageLibrary.readUint32(data, 0);
    }

    function readUint32FlippedPublic(bytes memory data) public pure returns (uint32) {
        return DogeMessageLibrary.readUint32Flipped(data, 0);
    }

    function bytesToBytes32Public(bytes memory b) public pure returns (bytes32) {
        return bytesToBytes32(b, 0);
    }

    function sliceBytes20Public(bytes memory data) public pure returns (bytes20) {
        return  DogeMessageLibrary.sliceBytes20(data, 0);
    }

    function sliceBytes32Public(bytes memory data) public pure returns (bytes32) {
        return  DogeMessageLibrary.sliceBytes32(data, 0);
    }

    function getVersionPublic(bytes memory _blockHeader) public pure returns (uint32) {
        return DogeMessageLibrary.getVersion(_blockHeader, 0);
    }

    function sliceArrayPublic(bytes memory original, uint32 offset, uint32 endIndex) public view returns (bytes memory result) {
        return DogeMessageLibrary.sliceArray(original, offset, endIndex);
    }

    function targetFromBitsPublic(uint32 bits) public pure returns (uint) {
        return DogeMessageLibrary.targetFromBits(bits) ;
    }

    function concatHashPublic(bytes32 tx1, bytes32 tx2) public pure returns (bytes32) {
        return DogeMessageLibrary.concatHash(tx1, tx2);
    }

    function flip32BytesPublic(bytes32 input) public pure returns (bytes32) {
        return DogeMessageLibrary.flip32Bytes(input);
    }

    function checkAuxPoWPublic(bytes32 blockHash, bytes memory auxBytes) public view returns (uint) {
        return checkAuxPoWForTests(blockHash, auxBytes);
    }

    function parseHeaderBytesPublic(bytes memory _rawBytes) public view returns (
        uint32 version,
        uint32 time,
        uint32 bits,
        uint32 nonce,
        bytes32 blockHash,
        bytes32 prevBlock,
        bytes32 merkleRoot
    ) {
        DogeMessageLibrary.BlockHeader memory ap = DogeMessageLibrary.parseHeaderBytes(_rawBytes, 0);
        return (
            ap.version,
            ap.time,
            ap.bits,
            ap.nonce,
            ap.blockHash,
            ap.prevBlock,
            ap.merkleRoot
        );
    }

    function parseAuxPoWPublic(bytes memory rawBytes) public view returns (
        bytes32 scryptHash,
        bytes32 txHash,
        bytes32 coinbaseMerkleRoot,
        //bytes32[] chainMerkleProof,
        uint dogeHashIndex,
        uint coinbaseMerkleRootCode,
        bytes32 parentMerkleRoot,
        //bytes32[] parentMerkleProof,
        uint coinbaseTxIndex,
        uint parentNonce
    ) {
        DogeMessageLibrary.AuxPoW memory ap = DogeMessageLibrary.parseAuxPoW(rawBytes, 0, rawBytes.length);
        return (
            ap.scryptHash,
            ap.txHash,
            ap.coinbaseMerkleRoot,
            ap.dogeHashIndex,
            ap.coinbaseMerkleRootCode,
            ap.parentMerkleRoot,
            ap.coinbaseTxIndex,
            ap.parentNonce
        );
    }

    // doesn't check merge mining to see if other error codes work
    function checkAuxPoWForTests(bytes32 _blockHash, bytes memory _auxBytes) internal view returns (uint) {
        DogeMessageLibrary.AuxPoW memory ap = DogeMessageLibrary.parseAuxPoW(_auxBytes, 0, _auxBytes.length);

        //uint32 version = bytesToUint32Flipped(_auxBytes, 0);

        if (!DogeMessageLibrary.isMergeMined(_auxBytes, 0)) {
            return ERR_NOT_MERGE_MINED;
        }

        if (ap.coinbaseTxIndex != 0) {
            return ERR_COINBASE_INDEX;
        }

        if (ap.coinbaseMerkleRootCode != 1) {
            return ap.coinbaseMerkleRootCode;
        }

        if (DogeMessageLibrary.computeChainMerkle(_blockHash, ap) != ap.coinbaseMerkleRoot) {
            return ERR_CHAIN_MERKLE;
        }

        if (DogeMessageLibrary.computeParentMerkle(ap) != ap.parentMerkleRoot) {
            return ERR_PARENT_MERKLE;
        }

        return 1;
    }

    // @dev - Converts a bytes of size 4 to uint32,
    // e.g. for input [0x01, 0x02, 0x03 0x04] returns 0x01020304
    function bytesToUint32(bytes memory input, uint pos) internal pure returns (uint32 result) {
        result = uint32(uint8(input[pos]))*(2**24)
          + uint32(uint8(input[pos + 1]))*(2**16)
          + uint32(uint8(input[pos + 2]))*(2**8)
          + uint32(uint8(input[pos + 3]));
    }

    // @dev converts bytes of any length to bytes32.
    // If `_rawBytes` is longer than 32 bytes, it truncates to the 32 leftmost bytes.
    // If it is shorter, it pads with 0s on the left.
    // Should be private, made internal for testing
    //
    // @param _rawBytes - arbitrary length bytes
    // @return - leftmost 32 or less bytes of input value; padded if less than 32
    function bytesToBytes32(bytes memory _rawBytes, uint pos) internal pure returns (bytes32) {
        bytes32 out;
        assembly {
            out := mload(add(add(_rawBytes, 0x20), pos))
        }
        return out;
    }

    function parseTransaction(bytes memory txBytes, bytes20 expected_output_public_key_hash) public view
             returns (uint, bytes20, address, uint16) {
        return DogeMessageLibrary.parseTransaction(txBytes, expected_output_public_key_hash);
     }

    //
    // Error / failure codes
    //

    // error codes for storeBlockHeader
    uint constant ERR_DIFFICULTY =  10010;  // difficulty didn't match current difficulty
    uint constant ERR_RETARGET = 10020;  // difficulty didn't match retarget
    uint constant ERR_NO_PREV_BLOCK = 10030;
    uint constant ERR_BLOCK_ALREADY_EXISTS = 10040;
    uint constant ERR_INVALID_HEADER = 10050;
    uint constant ERR_COINBASE_INDEX = 10060; // coinbase tx index within Litecoin merkle isn't 0
    uint constant ERR_NOT_MERGE_MINED = 10070; // trying to check AuxPoW on a block that wasn't merge mined
    uint constant ERR_FOUND_TWICE = 10080; // 0xfabe6d6d found twice
    uint constant ERR_NO_MERGE_HEADER = 10090; // 0xfabe6d6d not found
    uint constant ERR_NOT_IN_FIRST_20 = 10100; // chain Merkle root not within first 20 bytes of coinbase tx
    uint constant ERR_CHAIN_MERKLE = 10110;
    uint constant ERR_PARENT_MERKLE = 10120;
    uint constant ERR_PROOF_OF_WORK = 10130;

    // error codes for verifyTx
    uint constant ERR_BAD_FEE = 20010;
    uint constant ERR_CONFIRMATIONS = 20020;
    uint constant ERR_CHAIN = 20030;
    uint constant ERR_SUPERBLOCK = 20040;
    uint constant ERR_MERKLE_ROOT = 20050;
    uint constant ERR_TX_64BYTE = 20060;

    // error codes for relayTx
    uint constant ERR_RELAY_VERIFY = 30010;
}
