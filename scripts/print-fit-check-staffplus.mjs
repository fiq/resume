import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const cvPath = path.resolve(repoRoot, "cv", "index.html");
const outputDir = path.resolve(repoRoot, ".tmp");
const pdfPath = path.resolve(outputDir, "staffplus-print-check.pdf");

function countPdfPages(pdfBuffer) {
  const matches = pdfBuffer.toString("latin1").match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : 0;
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

async function main() {
  await ensureFileExists(cvPath);
  await fs.mkdir(outputDir, { recursive: true });

  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch({
    headless: true,
    executablePath
  });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(cvPath).href, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
  } finally {
    await browser.close();
  }

  const pdf = await fs.readFile(pdfPath);
  const pageCount = countPdfPages(pdf);

  if (pageCount === 0) {
    throw new Error("Failed to determine PDF page count.");
  }

  console.log(`Printed ${path.relative(repoRoot, cvPath)} to ${pageCount} page(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
