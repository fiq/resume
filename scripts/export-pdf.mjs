import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const desktopViewport = { width: 1400, height: 1800 };

function usage() {
  throw new Error("Usage: node scripts/export-pdf.mjs <input-html> <output-pdf>");
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

async function main() {
  const [inputArg, outputArg] = process.argv.slice(2);
  if (!inputArg || !outputArg) {
    usage();
  }

  const inputPath = path.resolve(repoRoot, inputArg);
  const outputPath = path.resolve(repoRoot, outputArg);

  await ensureFileExists(inputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch({
    headless: true,
    executablePath
  });

  try {
    const page = await browser.newPage({
      viewport: desktopViewport
    });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
  } finally {
    await browser.close();
  }

  console.log(
    `Exported ${path.relative(repoRoot, inputPath)} to ${path.relative(repoRoot, outputPath)}.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
