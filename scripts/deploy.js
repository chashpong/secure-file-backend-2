async function main() {
  const AuditLog = await ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy();

  await auditLog.waitForDeployment();

  console.log("✅ AuditLog deployed to:", await auditLog.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
