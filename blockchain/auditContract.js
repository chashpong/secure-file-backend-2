const { ethers } = require("ethers");
require('dotenv').config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = [
  "function addLog(string memory filename, string memory action) public",
  "function getLogsCount() public view returns (uint)",
  "function getLog(uint) public view returns (address, string memory, string memory, uint)"
];

// ✅ ใช้ Infura + Sepolia
const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ✅ เขียน log
async function writeLog(filename, action) {
  try {
    const tx = await contract.addLog(filename, action);
    await tx.wait();
    console.log(`✅ Logged to Sepolia: ${filename} - ${action}`);
  } catch (err) {
    console.error("❌ Log failed:", err);
  }
}

// ✅ อ่าน log
async function getLogs() {
  const count = await contract.getLogsCount();
  const logs = [];

  for (let i = 0; i < count; i++) {
    const log = await contract.getLog(i);
    logs.push({
      user: log[0],
      filename: log[1],
      action: log[2],
      timestamp: new Date(Number(log[3]) * 1000).toLocaleString()
    });
  }

  return logs;
}

module.exports = { writeLog, getLogs };
