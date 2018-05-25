pragma solidity ^0.4.19;

// Interface contract to be implemented by DogeRelay. This is all
contract TransactionProcessor {
    function processTransaction(bytes txn, uint txHash, bytes20 operatorPublicKeyHash) public returns (uint);
}
