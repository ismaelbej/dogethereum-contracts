pragma solidity 0.5.16;

// Interface contract to be implemented by DogeToken
contract TransactionProcessor {
    function processTransaction(bytes memory txn, bytes32 txHash, bytes20 operatorPublicKeyHash, address superblockSubmitterAddress) public returns (uint);
}
