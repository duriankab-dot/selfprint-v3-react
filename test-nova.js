#!/usr/bin/env node

/**
 * test-nova.js
 *
 * ไฟล์ทดสอบ /api/nova เพื่อตรวจสอบว่า backend ทำงานได้ไหม
 *
 * วิธีใช้:
 *   node test-nova.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ตรวจสอบ API Key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ผิดพลาด: ANTHROPIC_API_KEY หาย');
  console.error('   ตรวจสอบ .env.local ว่ามี API key ไหม');
  process.exit(1);
}

console.log('✅ API Key พบ');

// ตั้ง request
const testRequest = {
  messages: [
    {
      role: 'user',
      content: 'สวัสดี Nova ฉันรู้สึกเครียด',
    },
  ],
  hub: 'identity',
  mood: 'stressed',
  autonomy: 50,
  userProfile: {
    name: 'ผู้ใช้ทดสอบ',
  },
};

console.log('\n📤 ส่ง request ไป /api/nova...');
console.log('   Hub: identity');
console.log('   Mood: stressed');
console.log('   Message: สวัสดี Nova ฉันรู้สึกเครียด\n');

// เรียก /api/nova
axios
  .post('http://localhost:3001/api/nova', testRequest, {
    timeout: 10000,
  })
  .then((response) => {
    console.log('✅ ได้ response!');
    console.log('\n📥 Nova ตอบ:');
    console.log('---');
    console.log(response.data.content);
    console.log('---');
    console.log(`\nℹ️  Tokens used: ${response.data.tokensUsed}`);
    console.log(`⏱️  Timestamp: ${response.data.timestamp}`);
  })
  .catch((error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ ไม่สามารถเชื่อมต่อ http://localhost:3001');
      console.error('   ตรวจสอบว่า:');
      console.error('   1. Backend รัน `npm run dev` ไหม?');
      console.error('   2. Port 3001 ว่าง ไหม?');
    } else if (error.response) {
      console.error('❌ Backend ส่ง error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.error || error.response.data.message}`);
    } else {
      console.error('❌ ข้อผิดพลาด:', error.message);
    }
    process.exit(1);
  });
