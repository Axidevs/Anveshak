const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
  process.env.BLOCKCHAIN_PRIVATE_KEY,
  provider
);

const contractAddress =
  process.env.EVIDENCE_REGISTRY_ADDRESS;

const abi = [
  "function anchorEvidence(string evidenceId, string evidenceHash)",
  "function getEvidence(string evidenceId) view returns (string, string, uint256, address)"
];

const contract = new ethers.Contract(
  contractAddress,
  abi,
  wallet
);

const anchorEvidence = async (evidenceId, evidenceHash) => {
  const tx = await contract.anchorEvidence(
    evidenceId,
    evidenceHash
  );

  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
  };
};

const getAnchoredEvidence = async (evidenceId) => {
  const result = await contract.getEvidence(evidenceId);

  return {
    evidenceId: result[0],
    evidenceHash: result[1],
    timestamp: result[2].toString(),
    anchoredBy: result[3],
  };
};

module.exports = {
  anchorEvidence,
  getAnchoredEvidence,
};