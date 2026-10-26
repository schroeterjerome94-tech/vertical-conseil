const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function wrap(fnName) {
  const original = fs[fnName];
  fs[fnName] = function (target, dest, type, callback) {
    const useCopy = process.platform === "win32";
    if (!useCopy) return original.apply(this, arguments);
    try {
      const resolved = path.resolve(path.dirname(dest), String(target));
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
      copyDir(resolved, dest);
      if (typeof type === "function") type(null);
      else if (typeof callback === "function") callback(null);
      return undefined;
    } catch (error) {
      if (typeof type === "function") type(error);
      else if (typeof callback === "function") callback(error);
      else throw error;
    }
  };
}

wrap("symlink");
wrap("symlinkSync");

if (fs.promises?.symlink) {
  const original = fs.promises.symlink.bind(fs.promises);
  fs.promises.symlink = async function (target, dest) {
    try {
      return await original(target, dest);
    } catch {
      const resolved = path.resolve(path.dirname(dest), String(target));
      if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
      copyDir(resolved, dest);
    }
  };
}
