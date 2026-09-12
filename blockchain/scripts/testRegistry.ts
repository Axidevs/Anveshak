import { network } from "hardhat";

const { ethers } = await network.connect();

const contractAddress =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function anchorEvidence(string evidenceId, string evidenceHash)",
  "function getEvidence(string evidenceId) view returns (string, string, uint256, address)"
];

const [signer] = await ethers.getSigners();

const contract = new ethers.Contract(
  contractAddress,
  abi,
  signer
);

const evidenceId = "EV-2026-240730";

const evidenceHash =
  "f652375b086822cd91525129065099906456a0cf688ee67204707037538f705c";

console.log("Anchoring evidence...");

const tx = await contract.anchorEvidence(
  evidenceId,
  evidenceHash
);

await tx.wait();

console.log("Evidence anchored successfully!");
console.log("Transaction hash:", tx.hash);

const result = await contract.getEvidence(evidenceId);

console.log("Evidence ID:", result[0]);
console.log("Evidence Hash:", result[1]);
console.log("Timestamp:", result[2].toString());
console.log("Anchored By:", result[3]);