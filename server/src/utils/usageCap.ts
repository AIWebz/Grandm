import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { todayKey } from "./dates";

export interface UsageStatus {
  used: number;
  cap: number;
  remaining: number;
  atCap: boolean;
  unlimited: boolean;
}

/**
 * Free-tier daily chat cap (Section 15). Grandma+ subscribers are
 * unlimited. Communicated to the client via GET /chat/usage so the app can
 * show "X of Y Grandma chats today" instead of a surprise mid-chat paywall.
 */
export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const isPlus = subscription?.tier === "PLUS" && (!subscription.expiresAt || subscription.expiresAt > new Date());
  if (isPlus) return { used: 0, cap: Infinity, remaining: Infinity, atCap: false, unlimited: true };

  const day = todayKey();
  const usage = await prisma.aiUsage.findUnique({ where: { userId_day: { userId, day } } });
  const used = usage?.count ?? 0;
  const cap = env.freeDailyChatCap;
  return { used, cap, remaining: Math.max(0, cap - used), atCap: used >= cap, unlimited: false };
}

export async function incrementUsage(userId: string): Promise<void> {
  const day = todayKey();
  await prisma.aiUsage.upsert({
    where: { userId_day: { userId, day } },
    update: { count: { increment: 1 } },
    create: { userId, day, count: 1 },
  });
}
