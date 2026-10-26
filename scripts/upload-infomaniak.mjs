import { Client } from "ssh2";
import { createReadStream, readdirSync, statSync, readFileSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const host = process.env.IK_HOST;
const username = process.env.IK_USER;
const password = process.env.IK_PASS;
const port = Number(process.env.IK_PORT || 22);
const localRoot = process.env.IK_LOCAL;
const extraEnv = process.env.IK_ENV_FILE;

const skip = new Set([
  "node_modules",
  ".next",
  ".git",
  "data",
  "_maquette",
  "_assets",
  ".env.local",
]);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    if (name.endsWith(".zip")) continue;
    if (name.endsWith(".db") || name.endsWith(".db-shm") || name.endsWith(".db-wal")) {
      continue;
    }
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function remotePath(file) {
  return posix.join(
    ".",
    relative(localRoot, file).split(sep).join("/"),
  );
}

function mkdirp(sftp, dir) {
  return new Promise((resolve, reject) => {
    if (!dir || dir === "." || dir === "/") return resolve();
    sftp.stat(dir, (err) => {
      if (!err) return resolve();
      const parent = posix.dirname(dir);
      mkdirp(sftp, parent === dir ? "" : parent).then(() => {
        sftp.mkdir(dir, (mkErr) => {
          if (mkErr && mkErr.code !== 4) reject(mkErr);
          else resolve();
        });
      }, reject);
    });
  });
}

function put(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => (err ? reject(err) : resolve()));
  });
}

const conn = new Client();
conn
  .on("ready", () => {
    conn.sftp(async (err, sftp) => {
      if (err) {
        console.error(err);
        conn.end();
        process.exit(1);
      }
      try {
        const files = walk(localRoot);
        console.log(`fichiers: ${files.length}`);
        for (const file of files) {
          const remote = remotePath(file);
          await mkdirp(sftp, posix.dirname(remote));
          await put(sftp, file, remote);
          console.log(remote);
        }
        if (extraEnv) {
          await put(sftp, extraEnv, ".env");
          console.log(".env");
        }
        console.log("OK");
        conn.end();
      } catch (e) {
        console.error(e);
        conn.end();
        process.exit(1);
      }
    });
  })
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  })
  .on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
    finish(prompts.map(() => password));
  })
  .connect({
    host,
    port,
    username,
    password,
    tryKeyboard: true,
    readyTimeout: 30000,
  });
