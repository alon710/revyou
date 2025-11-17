import decomment from "decomment";
import * as fs from "fs";
import { glob } from "glob";

interface Options {
  dryRun: boolean;
  preserveDirectives: boolean;
  verbose: boolean;
}

const options: Options = {
  dryRun: process.argv.includes("--dry-run"),
  preserveDirectives: process.argv.includes("--preserve-directives"),
  verbose: process.argv.includes("--verbose"),
};

async function removeCommentsFromFile(filePath: string): Promise<void> {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    const ignorePatterns: RegExp[] = [/https?:\/\/[^\s)]+/g];

    if (options.preserveDirectives) {
      ignorePatterns.push(/\/\/\s*@ts-/, /\/\/\s*eslint-/, /\/\*\s*eslint-[\s\S]*?\*\//);
    }

    const cleaned = decomment(content, {
      ignore: ignorePatterns,
      tolerant: true,
      space: false,
    });

    if (content !== cleaned) {
      const linesBefore = content.split("\n").length;
      const linesAfter = cleaned.split("\n").length;
      const linesRemoved = linesBefore - linesAfter;

      if (options.verbose) {
        console.log(`✓ ${filePath} (${linesRemoved} lines removed)`);
      } else {
        console.log(`✓ ${filePath}`);
      }

      if (!options.dryRun) {
        fs.writeFileSync(filePath, cleaned, "utf8");
      }
    } else if (options.verbose) {
      console.log(`- ${filePath} (no comments found)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log("Comment Removal Tool");
  console.log("===================\n");

  if (options.dryRun) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  }

  if (options.preserveDirectives) {
    console.log("📌 Preserving TypeScript and ESLint directives\n");
  }

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

  if (options.dryRun) {
    console.log("\n💡 Run without --dry-run to actually modify files");
  }
}

main().catch(console.error);
