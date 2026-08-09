import { describe, it, expect } from 'vitest';
import { safetyCheck } from '../safety.js';

describe('safetyCheck', () => {
  it('passes through normal text', () => {
    const result = safetyCheck('ควรออมเงินยังไงดีในแต่ละเดือน');
    expect(result.safe).toBe(true);
    expect(result.category).toBeNull();
    expect(result.redirectMessage).toBeNull();
  });

  it('passes through empty/null/undefined text', () => {
    expect(safetyCheck('').safe).toBe(true);
    expect(safetyCheck(null).safe).toBe(true);
    expect(safetyCheck(undefined).safe).toBe(true);
  });

  it('blocks suicide/self-harm keywords', () => {
    const result = safetyCheck('ตอนนี้ฉันไม่อยากมีชีวิตอยู่แล้ว');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('suicide');
    expect(result.redirectMessage).toContain('1323');
  });

  it('blocks English suicide keywords too', () => {
    const result = safetyCheck('I want to kill myself');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('suicide');
  });

  it('blocks explicit medical diagnosis requests', () => {
    const result = safetyCheck('ช่วยวินิจฉัยว่าฉันเป็นมะเร็งไหม');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('medical');
  });

  it('blocks explicit gambling requests', () => {
    const result = safetyCheck('ช่วยแนะนำเลขหวยงวดนี้หน่อย');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('gambling');
  });

  it('blocks explicit stock-picking requests', () => {
    const result = safetyCheck('ตอนนี้ควรซื้อหุ้นไหนดีให้กำไรแน่นอน');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('investment');
  });

  it('does not false-positive on general financial questions', () => {
    // "การเงิน" ทั่วไปต้องผ่านได้ ไม่ใช่แค่พูดถึงเงินแล้วบล็อกหมด
    const result = safetyCheck('ฉันควรวางแผนการเงินยังไงให้มั่นคง');
    expect(result.safe).toBe(true);
  });

  it('is case-insensitive for English keywords', () => {
    const result = safetyCheck('SUICIDE thoughts today');
    expect(result.safe).toBe(false);
    expect(result.category).toBe('suicide');
  });
});
