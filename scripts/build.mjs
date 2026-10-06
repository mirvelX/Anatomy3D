import { readFile, writeFile, mkdir, readdir, cp, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
export async function build(out = resolve(root, "dist")) {
  out = resolve(out);
  if (out !== resolve(root, "dist"))
    throw Error("Build output must be the generated project dist directory");
  await rm(out, { recursive: true, force: true });
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(resolve(root, dir), {
      withFileTypes: true,
    })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files.push(file);
    }
  }
  await walk("src");
  await walk("styles");
  await walk("icons");
  await walk("labs");
  files.push("index.html", "sw.js", "manifest.webmanifest");
  files.sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.replaceAll("\\", "/"));
    hash.update(await readFile(resolve(root, file)));
  }
  const release = hash.digest("hex").slice(0, 16),
    prefix = "releases/" + release;
  await mkdir(out, { recursive: true });
  for (const dir of ["src", "styles"])
    await cp(resolve(root, dir), resolve(out, prefix, dir), {
      recursive: true,
    });
  for (const file of [
    "icons",
    "manifest.webmanifest",
    "social-preview.png",
    "instagram-share.png",
  ])
    await cp(resolve(root, file), resolve(out, file), { recursive: true });
  await cp(resolve(root, "labs"), resolve(out, "labs"), { recursive: true });
  const html = (await readFile(resolve(root, "index.html"), "utf8"))
    .replace("./styles/app.css", `./${prefix}/styles/app.css`)
    .replace("./src/main.js", `./${prefix}/src/main.js`);
  await writeFile(resolve(out, "index.html"), html);
  const core = [
    "./index.html",
    "./manifest.webmanifest",
    ...files
      .filter((file) => /^(src|styles)[\\/]/.test(file))
      .map((file) => "./" + prefix + "/" + file.replaceAll("\\", "/")),
    ...files
      .filter((file) => file.startsWith("labs"))
      .map((file) => "./" + file.replaceAll("\\", "/")),
    ...files
      .filter((file) => file.startsWith("icons"))
      .map((file) => "./" + file.replaceAll("\\", "/")),
  ];
  const worker = (await readFile(resolve(root, "sw.js"), "utf8"))
    .replace("__RELEASE__", release)
    .replace("__CORE__", JSON.stringify(core));
  await writeFile(resolve(out, "sw.js"), worker);
  await writeFile(
    resolve(out, "release.json"),
    JSON.stringify({
      version: JSON.parse(await readFile(resolve(root, "package.json"), "utf8"))
        .version,
      release,
    }),
  );
  return { out, release, core };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(await build());
