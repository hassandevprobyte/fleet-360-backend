const fs = require("fs/promises");

const collectPaths = (input, depth = 0) => {
  if (!input || depth > 4) return [];
  if (Array.isArray(input)) return input.flatMap((i) => collectPaths(i, depth + 1));
  if (typeof input !== "object") return [];
  if (typeof input.path === "string" && input.path) return [input.path];
  return Object.values(input).flatMap((v) => collectPaths(v, depth + 1));
};

const removeUploadedFiles = async (options) => {
  try {
    const paths = [...new Set(collectPaths(options?.files))];
    const results = await Promise.allSettled(paths.map((p) => fs.unlink(p)));

    results.forEach((r, i) => {
      if (r.status === "rejected" && r.reason?.code !== "ENOENT") {
        console.error(`Failed to delete ${paths[i]}:`, r.reason?.message);
      }
    });
  } catch (err) {
    console.error("removeUploadedFiles failed:", err.message);
  }
};

module.exports = removeUploadedFiles;
