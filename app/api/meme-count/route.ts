import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const COUNTER_FILE = join(process.cwd(), ".meme-count");

async function getCount(): Promise<number> {
  try {
    const data = await readFile(COUNTER_FILE, "utf-8");
    return parseInt(data, 10) || 0;
  } catch {
    return 0;
  }
}

async function setCount(count: number): Promise<void> {
  await writeFile(COUNTER_FILE, String(count), "utf-8");
}

export async function GET() {
  const count = await getCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await getCount();
  const newCount = count + 1;
  await setCount(newCount);
  return NextResponse.json({ count: newCount });
}
