/**
 * prepack: copies ../template into the package (npm only ships files inside the
 * package dir) and renames .gitignore → _gitignore, which npm would drop.
 */
import { cp, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(import.meta.dirname, "../../template");
const target = path.resolve(import.meta.dirname, "../template");
const skip = new Set([".next", ".turbo", "coverage", "dist", "generated", "node_modules", ".env"]);

await rm(target, { force: true, recursive: true });
await cp(source, target, {
  filter: (file) => !skip.has(path.basename(file)) && !file.endsWith(".tsbuildinfo"),
  recursive: true,
});

async function renameGitignores(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await renameGitignores(full);
    else if (entry.name === ".gitignore") await rename(full, path.join(dir, "_gitignore"));
  }
}

await renameGitignores(target);
console.log(`Packed template into ${target}`);
