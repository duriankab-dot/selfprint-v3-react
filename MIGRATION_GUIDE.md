# 🍽️ Bite Me Baby - Supabase Migration Guide

## ⚠️ สำคัญ: ถ้ามีตารางเก่าจาก migration ที่ failed ก่อนหน้า

ต้อง **DROP ตารางเก่าทั้งหมด** ก่อนรัน migration ใหม่:

```sql
-- รัน SQL นี้ก่อน Migration ใหม่ (Line 1-15)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS delivery_rounds CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS preorder_votes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
```

## 📋 ขั้นตอนการรัน Migration

### 1. เปิด Supabase SQL Editor
- ไปที่: https://ivkdfognyiwjcmrhcnwz.supabase.co/editor
- เลือก Database: `bmb` (หรือ project name ของคุณ)

### 2. รัน DROP Tables (ถ้ามีตารางเก่า)
- Copy SQL ด้านบน (lines 1-15)
- กด **Run** (Ctrl+Enter)
- ตรวจสอบว่าไม่มี error

### 3. รัน Migration ใหม่
- Copy **ทั้งหมด** จากไฟล์:
  - `D:\A PROJECT\Bite Me Baby\supabase-migration.sql` (ไฟล์ اصلی)
  - หรือ `D:\selfprint-v3-react\supabase-migration.sql` (ไฟล์ที่ sync แล้ว)
- วางใน SQL Editor
- กด **Run** (Ctrl+Enter)

### 4. ตรวจสอบผลลัพธ์
ถ้าสำเร็จจะเห็น:
```
Success. No rows returned
```

ถ้ามี error จะบอกบรรทัดที่ผิด

## 🗂️ โครงสร้างตาราง (Table Order)

```
1. product_categories    - หมวดหมู่เมนู (ไม่มี FK)
2. delivery_rounds       - รอบส่ง (ไม่มี FK)
3. products              - เมนู (FK → product_categories, delivery_rounds)
4. orders                - คำสั่งซื้อ (FK → delivery_rounds, auth.users)
5. order_items           - รายการในคำสั่งซื้อ (FK → orders, products)
6. inventory             - วัตถุดิบ (ไม่มี FK)
7. preorder_votes        - โหวตเมนู (FK → products, auth.users)
8. profiles              - ข้อมูลผู้ใช้ (FK → auth.users)
```

## 🔧 Components ที่รวมใน Migration

### ✅ Extensions
- `uuid-ossp` - สำหรับ generate UUID
- `pg_trgm` - สำหรับ text search

### ✅ Types (Enums)
- `order_status` - สถานะคำสั่งซื้อ (10 values)
- `payment_status` - สถานะการชำระเงิน (4 values)
- `payment_method` - วิธีชำระเงิน (3 values)
- `delivery_method` - วิธีส่ง (4 values)
- `round_period` - รอบส่ง (morning, midday, evening)
- `ingredient_status` - สถานะวัตถุดิบ (3 values)
- `product_category_slug` - ประเภทเมนู (5 values)

### ✅ Tables (8 tables)
ดูโครงสร้างข้างบน

### ✅ Functions (4 functions)
1. `update_updated_at_column()` - อัปเดต timestamps
2. `increment_delivery_round_count()` - เพิ่ม count เมื่อมี order ใหม่
3. `calculate_item_total()` - คำนวณราคาต่อรายการ
4. `update_inventory_status()` - อัปเดตสถานะ stock

### ✅ Triggers (8 triggers)
- `*_updated_at` - 5 triggers สำหรับ auto-update timestamps
- `trg_order_insert_increment_round` - เพิ่ม delivery round count
- `trg_order_items_calculate_total` - คำนวณ item total
- `trg_inventory_calculate_status` - อัปเดต inventory status

### ✅ RLS Policies
- **Public read**: products, categories, delivery_rounds, preorder_votes
- **Authenticated**: customers สามารถ create/update ของตัวเองได้
- **Admin only**: inventory, orders (update/delete)

### ✅ Seed Data
- 5 product categories (อาหาร main, ข้าว, แกง, เครื่องดื่ม, ของหวาน)
- 3 delivery rounds (เช้า, กลางวัน, เย็น)
- 6 products (4 regular + 2 preorder)
- 4 inventory items (ข้าว, ไก่, ไข่ไก่, น้ำมัน)

## 📦 Storage Bucket (ต้องสร้างใน Dashboard)

SQL migration **ไม่สร้าง** storage bucket ต้องสร้างเอง:

1. ไปที่: https://ivkdfognyiwjcmrhcnwz.supabase.co/storage
2. กด **New bucket**
3. ชื่อ bucket: `bmb-images`
4. Public: **True** (อ่านได้ฟรี)
5. File size limit: 10MB (หรือตามต้องการ)
6. After creation, สร้าง policy:

```sql
-- Policy: Public read, authenticated write
CREATE POLICY "bmb_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'bmb-images'::uuid);

CREATE POLICY "bmb_images_authenticated_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bmb-images'::uuid AND auth.role() = 'authenticated');

CREATE POLICY "bmb_images_authenticated_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'bmb-images'::uuid AND auth.role() = 'authenticated');
```

## 🔑 Environment Variables

ต้องตั้งค่าใน `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ivkdfognyiwjcmrhcnwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_SUPABASE_SECRET_KEY=sb_secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=bmb-images
NEXT_PUBLIC_STORAGE_URL=https://ivkdfognyiwjcmrhcnwz.supabase.co/storage/v1/object/public/bmb-images
```

## ✅ Checklist หลัง Migration สำเร็จ

- [ ] ไม่มี error จาก SQL execution
- [ ] ตาราง 8 ตารางสร้างสำเร็จ (ดูที่ Database > Tables)
- [ ] Seed data มีข้อมูล (ดูที่ product_categories, delivery_rounds, products, inventory)
- [ ] Storage bucket `bmb-images` สร้างสำเร็จ
- [ ] RLS policies ทำงาน (ทดสอบ API)
- [ ] `.env.local` มีค่าครบถ้วน

## 🐛 Troubleshooting

### Error: "relation does not exist"
- ✅ แก้แล้ว: reorder table creation (product_categories → delivery_rounds → products → orders)

### Error: "foreign key constraint cannot be implemented - incompatible types: text and uuid"
- ✅ แก้แล้ว: เปลี่ยน `TEXT` เป็น `UUID` ในตารางที่ reference `auth.users(id)`:
  - ตาราง `orders`: `customer_id UUID` (บรรทัด 111)
  - ตาราง `preorder_votes`: `customer_id UUID` (บรรทัด 183)
  - ตาราง `profiles`: `id UUID` (บรรทัด 193)
- **เหตุผล**: `auth.users.id` เป็น `UUID` ไม่ใช่ `TEXT`
- **⚠️ สำคัญ**: ทุกตารางที่ `REFERENCES auth.users(id)` ต้องใช้ `UUID` ไม่ใช่ `TEXT`

### Error: "type does not exist"
- ✅ แก้แล้ว: create types (enums) ก่อน tables

### Error: "permission denied"
- ✅ แก้แล้ว: ใช้ Supabase service_role หรือ check RLS policies

### Error: "duplicate key value"
- ✅ แก้แล้ว: DROP tables เก่าก่อนรัน migration ใหม่

## 📚 Files

- **Main migration**: `D:\A PROJECT\Bite Me Baby\supabase-migration.sql`
- **Synced copy**: `D:\selfprint-v3-react\supabase-migration.sql`
- **This guide**: `D:\selfprint-v3-react\MIGRATION_GUIDE.md`

## 🆘 ต้องการความช่วยเหลือ?

- Supabase Docs: https://supabase.com/docs
- SQL Editor: https://ivkdfognyiwjcmrhcnwz.supabase.co/editor
- Table Editor: https://ivkdfognyiwjcmrhcnwz.supabase.co/editor/sql

---

**Last Updated**: 2026-09-15  
**Migration Version**: v3.1  
**Status**: ✅ Fixed and Ready to Run