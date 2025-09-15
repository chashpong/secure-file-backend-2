// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLog {
    struct Log {
        address user;
        string filename;
        string action;
        uint timestamp;
    }

    Log[] private logs;

    function addLog(string memory filename, string memory action) public {
        logs.push(Log(msg.sender, filename, action, block.timestamp));
    }

    function getLogsCount() public view returns (uint) {
        return logs.length;
    }

    function getLog(uint index) public view returns (address, string memory, string memory, uint) {
        require(index < logs.length, "Invalid index");
        Log memory l = logs[index];
        return (l.user, l.filename, l.action, l.timestamp);
    }

    // ✅ ดึงทั้งหมดครั้งเดียว
    function getAllLogs() public view returns (Log[] memory) {
        return logs;
    }
}
