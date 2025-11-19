import decomment from "decomment";
import * as fs from "fs";
import { glob } from "glob";

function removeJSXComments(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      let cleaned = line.replace(/\{\s*\/\*.*?\*\/\s*\}/g, "");
      if (cleaned.trim() === "{}" || (cleaned.trim() === "" && (line.includes("{/*") || line.trim() === "{}"))) {
        return "";
      }
      return cleaned;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

async function removeCommentsFromFile(filePath: string): Promise<void> {
  try {
    const originalContent = fs.readFileSync(filePath, "utf8");
    let content = originalContent;

    if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
      content = removeJSXComments(content);
    }

    const ignorePatterns: RegExp[] = [/https?:\/\/[^\s)]+/g];

    const cleaned = decomment(content, {
      ignore: ignorePatterns,
      tolerant: true,
      space: false,
    });

    if (originalContent !== cleaned) {
      const linesBefore = originalContent.split("\n").length;
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
    ignore: ["node_modules/**", ".next/**", "dist/**", "build/**"],
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
