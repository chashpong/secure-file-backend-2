// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLog {
    struct Log {
        string userId;    // 👈 เก็บ userId จาก backend (Mongo ObjectId)
        string filename;
        string action;
        uint timestamp;
    }

    Log[] private logs;

    function addLog(string memory userId, string memory filename, string memory action) public {
        logs.push(Log(userId, filename, action, block.timestamp));
    }

    function getLogsCount() public view returns (uint) {
        return logs.length;
    }

    function getLog(uint index) public view returns (string memory, string memory, string memory, uint) {
        require(index < logs.length, "Invalid index");
        Log memory l = logs[index];
        return (l.userId, l.filename, l.action, l.timestamp);
    }

    // ✅ ดึงทั้งหมด
    function getAllLogs() public view returns (Log[] memory) {
        return logs;
    }

    // ✅ ดึงเฉพาะของ userId ที่ระบุ
    function getAllLogsByUser(string memory userId) public view returns (Log[] memory) {
        uint count = 0;
        for (uint i = 0; i < logs.length; i++) {
            if (keccak256(bytes(logs[i].userId)) == keccak256(bytes(userId))) {
                count++;
            }
        }

        Log[] memory result = new Log[](count);
        uint j = 0;
        for (uint i = 0; i < logs.length; i++) {
            if (keccak256(bytes(logs[i].userId)) == keccak256(bytes(userId))) {
                result[j] = logs[i];
                j++;
            }
        }
        return result;
    }
}
