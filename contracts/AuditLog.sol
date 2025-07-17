// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLog {
    struct Log {
        address user;
        string filename;
        string action; // "UPLOAD" or "DOWNLOAD"
        uint timestamp;
    }

    Log[] public logs;

    event LogCreated(address indexed user, string filename, string action, uint timestamp);

    function addLog(string memory filename, string memory action) public {
        logs.push(Log(msg.sender, filename, action, block.timestamp));
        emit LogCreated(msg.sender, filename, action, block.timestamp);
    }

    function getLogsCount() public view returns (uint) {
        return logs.length;
    }

    function getLog(uint index) public view returns (address, string memory, string memory, uint) {
        require(index < logs.length, "Index out of bounds");
        Log memory log = logs[index];
        return (log.user, log.filename, log.action, log.timestamp);
    }
}
