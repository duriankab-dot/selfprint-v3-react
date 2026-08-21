/**
 * hubs.ts
 * Hub configuration and constants
 */

import type { Hub } from '@/context/HubContext';

export const HUB_OPTIONS: Array<{ id: Hub; label: string; description: string; icon: string }> = [
  {
    id: 'identity',
    label: 'ตัวตน',
    description: 'สำรวจใครที่ฉัน',
    icon: '🪞',
  },
  {
    id: 'decision',
    label: 'การตัดสินใจ',
    description: 'ช่วยในการเลือก',
    icon: '🧭',
  },
  {
    id: 'relationship',
    label: 'ความสัมพันธ์',
    description: 'เข้าใจกับคนอื่น',
    icon: '🌉',
  },
  {
    id: 'career',
    label: 'อาชีพ',
    description: 'พัฒนาความสำเร็จ',
    icon: '💼',
  },
  {
    id: 'finance',
    label: 'การเงิน',
    description: 'บริหารการเงิน',
    icon: '💰',
  },
  {
    id: 'health',
    label: 'สุขภาพ',
    description: 'ดูแลสุขภาพ',
    icon: '🏃',
  },
  {
    id: 'learning',
    label: 'การเรียนรู้',
    description: 'เพิ่มทักษะ',
    icon: '📚',
  },
  {
    id: 'creativity',
    label: 'สร้างสรรค์',
    description: 'พัฒนาศิลป์',
    icon: '🎨',
  },
  {
    id: 'spirituality',
    label: 'จิตสำนึก',
    description: 'หาความหมาย',
    icon: '🧘',
  },
  {
    id: 'adventure',
    label: 'การผจญภัย',
    description: 'สำรวจโลก',
    icon: '🌍',
  },
  {
    id: 'community',
    label: 'ชุมชน',
    description: 'เชื่อมต่อผู้คน',
    icon: '🤝',
  },
  {
    id: 'activities',
    label: 'กิจกรรม',
    description: 'ติดตามการกระทำ',
    icon: '📊',
  },
];
