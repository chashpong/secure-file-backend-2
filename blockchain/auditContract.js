const { ethers } = require("ethers");
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = [
  "function addLog(string memory userId, string memory filename, string memory action) public",
  "function getLogsCount() public view returns (uint)",
  "function getLog(uint) public view returns (string memory, string memory, string memory, uint)",
  "function getAllLogs() public view returns (tuple(string userId, string filename, string action, uint timestamp)[])",
  "function getAllLogsByUser(string memory userId) public view returns (tuple(string userId, string filename, string action, uint timestamp)[])" // ✅
];

const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ✅ เขียน log
async function writeLog(userId, filename, action) {
  try {
    const tx = await contract.addLog(userId, filename, action);
    await tx.wait();
    console.log(`✅ Logged: ${userId} - ${filename} - ${action}`);
  } catch (err) {
    console.error("❌ Log failed:", err);
  }
}

// ✅ อ่าน log ทั้งหมด
async function getAllLogs() {
  const logs = await contract.getAllLogs();
  return logs.map((l) => ({
    user: l.userId,
    filename: l.filename,
    action: l.action,
    timestamp: new Date(Number(l.timestamp) * 1000).toLocaleString(),
  }));
}

// ✅ อ่าน log ของ user เดียว
async function getLogsByUser(userId) {
  const logs = await contract.getAllLogsByUser(userId);
  return logs.map((l) => ({
    user: l.userId,
    filename: l.filename,
    action: l.action,
    timestamp: new Date(Number(l.timestamp) * 1000).toLocaleString(),
  }));
}

module.exports = { writeLog, getAllLogs, getLogsByUser };
