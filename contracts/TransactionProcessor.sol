pragma solidity ^0.5.10;

// Interface contract to be implemented by DogeToken
contract TransactionProcessor {
    function processTransaction(bytes memory txn, uint txHash, bytes20 operatorPublicKeyHash, address superblockSubmitterAddress) public returns (uint);
}
