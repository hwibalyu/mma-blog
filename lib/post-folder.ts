import path from "path";

export const postsDirectory = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "content/posts",
);

export function resolvePostDirectory(id: string) {
  const postDir = path.join(postsDirectory, id);
  const relative = path.relative(postsDirectory, postDir);

  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("유효하지 않은 글 ID입니다.");
  }

  return postDir;
}
