const fs = require("fs");
const path = require("path");

const folderName = process.argv[2];

if (!folderName) {
  console.error("Please provide module name");
  process.exit(1);
}

const filePrefix = folderName.endsWith("s")
  ? folderName.slice(0, -1)
  : folderName;

const basePath = path.join(__dirname, "..", "src", "modules", folderName);

const files = [
  `${filePrefix}.router.ts`,
  `${filePrefix}.controller.ts`,
  `${filePrefix}.service.ts`,
  `${filePrefix}.repository.ts`,
  `${filePrefix}.schema.ts`,
  `${filePrefix}.types.ts`,
  `${filePrefix}.utils.ts`,
];

fs.mkdirSync(basePath, { recursive: true });

files.forEach((file) => {
  fs.writeFileSync(path.join(basePath, file), "", { flag: "w" });
});

console.log(`Generated module: ${folderName}`);