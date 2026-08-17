/**
 * rollout.ts
 *
 * Phase 5.6: Staged Rollout (10% → 50% → 100%). โปรเจกต์นี้ไม่มี feature-flag
 * service (solo dev ไม่คุ้มเพิ่ม dependency ใหม่) — ใช้ deterministic hash
 * แทน: userId + featureKey เดิม ได้ bucket (0-99) เดิมเสมอ ไม่สุ่มใหม่ทุกครั้ง
 * ที่ reload หน้า เพิ่ม % แบบขั้นบันไดได้โดยแก้แค่ตัวเลขเดียว ไม่ต้องเปลี่ยนโค้ด
 * ที่เรียกใช้
 */

/** FNV-1a-style hash ธรรมดา ๆ พอสำหรับกระจาย bucket ให้สม่ำเสมอ ไม่ต้องเป็น cryptographic */
function hashToBucket(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

/**
 * @param userId ต้องเป็น identity ที่คงที่ (เช่น Supabase Auth user.id) —
 *   ถ้าไม่มี (ยังไม่ login) จะถือว่าไม่อยู่ใน rollout เสมอ กันกรณีสุ่มค่าใหม่
 *   ทุกครั้งที่ reload หน้า ซึ่งจะทำให้ฟีเจอร์กระพริบเปิด-ปิดสำหรับคนคนเดียวกัน
 * @param featureKey ชื่อฟีเจอร์ — คนเดิมสามารถอยู่ใน rollout ของฟีเจอร์หนึ่ง
 *   แต่ไม่อยู่ในอีกฟีเจอร์หนึ่งได้ เพราะ hash รวม featureKey เข้าไปด้วย
 * @param percent 0-100 — เปอร์เซ็นต์ของ user ที่ควรเห็นฟีเจอร์นี้
 */
export function isInRollout(
  userId: string | null | undefined,
  featureKey: string,
  percent: number
): boolean {
  if (!userId) return false;
  if (percent >= 100) return true;
  if (percent <= 0) return false;

  return hashToBucket(`${featureKey}:${userId}`) < percent;
}
