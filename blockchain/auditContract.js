const { ethers } = require("ethers");
require('dotenv').config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = [
  "function addLog(string memory filename, string memory action) public",
  "function getLogsCount() public view returns (uint)",
  "function getLog(uint) public view returns (address, string memory, string memory, uint)",
  "function getAllLogs() public view returns (tuple(address user, string filename, string action, uint timestamp)[])" // ✅
];

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

// ✅ อ่าน log ครั้งเดียว
async function getLogs() {
  const logs = await contract.getAllLogs();
  return logs.map(l => ({
    user: l.user,
    filename: l.filename,
    action: l.action,
    timestamp: new Date(Number(l.timestamp) * 1000).toLocaleString()
  }));
}

module.exports = { writeLog, getLogs };
