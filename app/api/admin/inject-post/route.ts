import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { resolvePostDirectory } from "@/lib/post-folder";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };
    const { sshTarget, remotePostDir } = getSyncConfig(id);
    const localPostDir = resolvePostDirectory(id);

    if (!fs.existsSync(localPostDir) || !fs.statSync(localPostDir).isDirectory()) {
      return NextResponse.json({ error: "동기화할 글 폴더를 찾을 수 없습니다." }, { status: 404 });
    }

    await execFileAsync("ssh", [sshTarget, "mkdir", "-p", remotePostDir]);

    const rsyncArgs = [
      "-az",
      "--delete",
      `${localPostDir}/`,
      `${sshTarget}:${remotePostDir}/`,
    ];

    await execFileAsync("rsync", rsyncArgs);

    const fileCount = countFiles(localPostDir);

    return NextResponse.json({
      success: true,
      id,
      fileCount,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };
    const { sshTarget, remotePostDir } = getSyncConfig(id);

    await execFileAsync("ssh", [sshTarget, "rm", "-rf", "--", remotePostDir]);

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function getSyncConfig(id?: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("이 동기화 API는 로컬 실행 환경에서만 사용할 수 있습니다.");
  }

  if (!id) {
    throw new Error("id가 필요합니다.");
  }

  const sshTarget = process.env.POST_SYNC_SSH_TARGET || "allreview";
  const remotePostsDir =
    process.env.POST_SYNC_REMOTE_POSTS_DIR || "/root/WebServices/mma-blog/content/posts";
  const remotePostDir = path.posix.join(remotePostsDir.replace(/\/+$/, ""), id);

  return {
    sshTarget,
    remotePostsDir,
    remotePostDir,
  };
}

function countFiles(directory: string) {
  let total = 0;
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      total += countFiles(fullPath);
    } else {
      total += 1;
    }
  }

  return total;
}
