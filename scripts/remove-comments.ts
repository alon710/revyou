import decomment from "decomment";
import * as fs from "fs";
import { glob } from "glob";

async function removeCommentsFromFile(filePath: string): Promise<void> {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    const ignorePatterns: RegExp[] = [/https?:\/\/[^\s)]+/g];

    const cleaned = decomment(content, {
      ignore: ignorePatterns,
      tolerant: true,
      space: false,
    });

    if (content !== cleaned) {
      const linesBefore = content.split("\n").length;
      const linesAfter = cleaned.split("\n").length;
      const linesRemoved = linesBefore - linesAfter;

      console.log(`✓ ${filePath} (${linesRemoved} lines removed)`);
      fs.writeFileSync(filePath, cleaned, "utf8");
    } else {
      console.log(`- ${filePath} (no comments found)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log("Comment Removal Tool");
  console.log("===================\n");

  console.log("Finding TypeScript files...\n");

  const files = await glob("**/*.{ts,tsx}", {
    ignore: ["node_modules/**", ".next/**", "dist/**", "build/**", "scripts/**"],
    cwd: process.cwd(),
  });

  console.log(`Found ${files.length} TypeScript files\n`);
  console.log("Processing files...\n");

  for (const file of files) {
    await removeCommentsFromFile(file);
  }

  console.log("\n===================");
  console.log("✓ Done!");
}

main().catch(console.error);
