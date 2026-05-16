const fs = require("fs");
const path = require("path");

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide module name");
  console.log("Usage: npm run remove:module workflows");
  process.exit(1);
}

const basePath = path.join(__dirname, "..", "src", "modules", moduleName);

if (!fs.existsSync(basePath)) {
  console.log(`Module '${moduleName}' does not exist.`);
  process.exit(0);
}

fs.rmSync(basePath, { recursive: true, force: true });

console.log(`Module '${moduleName}' removed successfully.`);