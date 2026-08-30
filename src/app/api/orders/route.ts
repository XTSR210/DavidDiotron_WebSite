import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { quoteCommission } from "@/lib/pricing";
import type { Order } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const str = (key: string): string => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const title = str("title");
  const name = str("name");
  const email = str("email");
  const message = str("message");
  const referenceId = str("referenceId") || undefined;

  const widthCm = Number(body.widthCm);
  const heightCm = Number(body.heightCm);
  if (!title || !name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm < 10 || heightCm < 10 || widthCm > 300 || heightCm > 300) {
    return NextResponse.json({ error: "Dimensions invalides (10–300 cm)." }, { status: 400 });
  }

  const q = quoteCommission(widthCm, heightCm);
  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    referenceId,
    title,
    widthCm: q.widthCm,
    heightCm: q.heightCm,
    areaCm2: q.areaCm2,
    priceEur: q.priceEur,
    name,
    email,
    message: message || undefined,
    createdAt: new Date().toISOString(),
    status: "paid",
  };

  const orders = await readOrders();
  orders.push(order);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, `${JSON.stringify(orders, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true, id: order.id, priceEur: order.priceEur });
}
