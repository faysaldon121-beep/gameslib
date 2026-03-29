import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

async function main() {
  try {
    // Resolve @sparticuz/chromium and locate its bin/ folder
    const chromiumResolved = import.meta.resolve("@sparticuz/chromium");
    const chromiumPath = chromiumResolved.replace(/^file:\/\//, "");
    const chromiumDir = dirname(dirname(dirname(chromiumPath)));
    const binDir = join(chromiumDir, "bin");

    if (!existsSync(binDir)) return;

    const publicDir = join(projectRoot, "public");
    const outputPath = join(publicDir, "chromium-pack.tar");

    // Tar the CONTENTS of bin/ (so the tar root contains chromium.br, fonts.tar.br, etc)
    execSync(`mkdir -p "${publicDir}" && tar -cf "${outputPath}" -C "${binDir}" .`, {
      stdio: "inherit",
      cwd: projectRoot,
    });
  } catch (e) {
    // don’t fail installs locally
    process.exit(0);
  }
}

main();
