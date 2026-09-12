// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EvidenceRegistry {

    struct EvidenceRecord {
        string evidenceId;
        string evidenceHash;
        uint256 timestamp;
        address anchoredBy;
    }

    mapping(string => EvidenceRecord) private records;

    event EvidenceAnchored(
        string indexed evidenceId,
        string evidenceHash,
        uint256 timestamp,
        address indexed anchoredBy
    );

    function anchorEvidence(
        string calldata evidenceId,
        string calldata evidenceHash
    ) external {

        require(
            bytes(records[evidenceId].evidenceId).length == 0,
            "Evidence already anchored"
        );

        records[evidenceId] = EvidenceRecord({
            evidenceId: evidenceId,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            anchoredBy: msg.sender
        });

        emit EvidenceAnchored(
            evidenceId,
            evidenceHash,
            block.timestamp,
            msg.sender
        );
    }

    function getEvidence(
        string calldata evidenceId
    )
        external
        view
        returns (
            string memory,
            string memory,
            uint256,
            address
        )
    {
        EvidenceRecord memory record = records[evidenceId];

        require(
            bytes(record.evidenceId).length != 0,
            "Evidence not found"
        );

        return (
            record.evidenceId,
            record.evidenceHash,
            record.timestamp,
            record.anchoredBy
        );
    }
}