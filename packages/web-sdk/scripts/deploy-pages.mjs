import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"

const projectName = process.env.CLOUDFLARE_PAGES_PROJECT_NAME ?? "adscrush-web-sdk"
const workingDirectory = resolve(import.meta.dirname, "..")
const outputDirectory = resolve(workingDirectory, "dist")

if (!existsSync(outputDirectory)) {
  console.error("Build output not found at packages/web-sdk/dist. Run the build before deploying.")
  process.exit(1)
}

const args = [
  "pages",
  "deploy",
  outputDirectory,
  "--project-name",
  projectName,
  ...process.argv.slice(2),
]

const result = spawnSync("wrangler", args, {
  cwd: workingDirectory,
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (typeof result.status === "number") {
  process.exit(result.status)
}

console.error(result.error ?? "Failed to start Wrangler.")
process.exit(1)
