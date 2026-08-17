# P0-D Phase 4: Local SEO Setup (GEO Optimization)

**สถานะ:** READY FOR IMPLEMENTATION
**วันที่:** 2026-08-17
**ลำดับ:** Phase 4 / 5

---

## 🗺️ **Google Business Profile Setup**

### **Step 1: Claim Your Business**
```
URL: https://www.google.com/business/
Business Name: Selfprint
Category: Software Company / Technology Consulting
Service Area: Thailand (Bangkok primary)
```

### **Step 2: Complete Your Profile**
- ✅ Business Name: Selfprint
- ✅ Address: Bangkok, Thailand (fill exact address)
- ✅ Phone: +66-XX-XXXX-XXXX (update with real phone)
- ✅ Website: https://selfprint.one
- ✅ Business Hours: 9:00 AM - 6:00 PM (Mon-Fri)
- ✅ Description: Personal intelligence platform powered by AI Twin
- ✅ Service Area: Bangkok, Thailand
- ✅ Logo: Upload Selfprint logo (200x200px+)
- ✅ Cover Photo: Upload hero image (4:3 aspect ratio)

### **Step 3: Verification**
```
Method: Postcard
- Google will send verification code to address
- Enter code in GBP dashboard
Timeline: 1-2 weeks for verification
```

---

## 📍 **NAP Consistency Audit**

### **Current NAP Information**
```
Name: Selfprint
Address: [TO BE FILLED] - Bangkok, Thailand
Phone: [TO BE FILLED]
```

### **Consistency Checklist**

**Where to verify NAP consistency:**
- [ ] Google Business Profile (primary)
- [ ] Website footer (add: Address + Phone)
- [ ] Privacy/Contact page
- [ ] Schema markup (LocalBusiness)
- [ ] Apple Maps listing
- [ ] Bing Places

### **Implementation in Code**

Add to `/src/constants/businessInfo.ts`:
```typescript
export const BUSINESS_INFO = {
  name: 'Selfprint',
  address: 'Bangkok, Thailand', // Update with full address
  phone: '+66-XX-XXXX-XXXX', // Update with real phone
  email: 'hello@selfprint.app',
  website: 'https://selfprint.one',
  serviceArea: ['Bangkok', 'Thailand'],
  businessHours: {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: 'CLOSED',
    sunday: 'CLOSED',
  },
};
```

Update Footer component:
```jsx
<footer>
  <div>
    <p>{BUSINESS_INFO.name}</p>
    <p>{BUSINESS_INFO.address}</p>
    <p><a href={`tel:${BUSINESS_INFO.phone}`}>{BUSINESS_INFO.phone}</a></p>
    <p><a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a></p>
  </div>
</footer>
```

---

## 🏙️ **Local Citations & Directories**

### **Top 50+ Local Directories for Thailand**

**Priority Tier 1 (Must-Have):**
1. Google Maps (via GBP) ⭐⭐⭐⭐⭐
2. Apple Maps
3. Bing Places
4. Facebook Business
5. Instagram Business Profile

**Priority Tier 2 (High-Value):**
6. ThailandBusiness.co.th
7. SoftwareThailand.com
8. Tech Bangkok Directory
9. StartupThailand.co
10. E-ThaiGov.go.th (business registry)
11. Wongnai (local review site)
12. ThailandLists.com
13. BusinessThailand.co.th
14. DirectoryThailand.com
15. LocalBusinessThailand.com

**Priority Tier 3 (General):**
16-50. (Add additional Thai + international directories)

### **Citation Management**

**For each directory:**
- [ ] Claim business listing (if exists) or create
- [ ] Verify ownership (email confirmation)
- [ ] Complete profile 100% (description, hours, phone, website)
- [ ] Use identical NAP info
- [ ] Add logo + business photo
- [ ] Keep contact info current

**Timeline:** Submit 10 citations/week (5 weeks = 50 citations)

---

## ⭐ **Review Management Strategy**

### **Goal:** Build social proof + engagement signals

### **Ethical Review Solicitation**
```
1. Send post-purchase email asking for review
2. Include direct link to Google review page
3. Remind: "Share your genuine experience"
4. Follow-up: Weekly for new customers
```

### **Review Response Template (Thai)**
```
ขอบคุณสำหรับการรีวิว! 🙏
ที่มีเวลามาประเมิน Selfprint

เรายินดีรับฟังข้อคิดเห็น และจะพัฒนาให้ดีขึ้นตามคำแนะนำของคุณ

หากมีคำถามเพิ่มเติม สามารถติดต่อเราได้ที่ [email]

ขอบคุณที่เลือก Selfprint 😊
```

### **Review Response Template (English)**
```
Thank you for taking the time to review Selfprint! 🙏

We appreciate your feedback and will continue improving 
based on your suggestions.

Feel free to reach out if you have any questions: [email]

Thank you for choosing Selfprint! 😊
```

### **Target:** 20+ reviews in 3 months

---

## 🔗 **Local Link Building**

### **Outreach Targets (Local)**
1. Thai tech blogs + news sites
2. Bangkok startup communities
3. AI/Tech associations in Thailand
4. Business development centers (Bangkok)
5. University tech programs
6. Local business councils

### **Link Building Content**
- Blog post: "How Selfprint Helps Thai Entrepreneurs Make Decisions"
- Webinar: "AI Twin for Personal Growth in Thai Culture"
- Case study: "From 100 Decisions/Day to 100 Confident Decisions"

### **Template Email**
```
Subject: Partnership Opportunity - Selfprint (Thai AI Platform)

Hi [Name],

We're launching Selfprint, a personal intelligence platform 
made for Thai users. We think your audience might benefit from:

[Value proposition]

Would you be interested in:
- Co-authored article
- Webinar / Interview
- Product review

Let me know if this interests you!

Best,
[Name]
Selfprint
```

---

## 📍 **Local Schema Markup (Already Implemented)**

### **LocalBusiness Schema** ✅
In `structuredData.ts` - generateLocalBusinessSchema()

```json
{
  "@type": "LocalBusiness",
  "name": "Selfprint",
  "url": "https://selfprint.one",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TH"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Thailand"
  }
}
```

### **Opening Hours Schema** ✅
```json
{
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}
```

---

## 📊 **Local SEO Metrics to Track**

### **Google Business Profile**
- [ ] Reviews count (target: 20+)
- [ ] Average rating (target: 4.5+)
- [ ] Profile completeness (target: 100%)
- [ ] Monthly views (target: 1000+)
- [ ] Click-to-website rate (target: 5%+)

### **Local Search Visibility**
- [ ] "Selfprint Bangkok" ranking
- [ ] "AI Twin Thailand" ranking
- [ ] "Digital Twin chatbot" ranking
- [ ] Map pack visibility (top 3 results)

### **Citation Audit**
- [ ] NAP consistency score (target: 95%+)
- [ ] Number of citations (target: 50+)
- [ ] Citation quality score (via Moz/Semrush)

---

## ✅ **Phase 4 Completion Checklist**

- [ ] Google Business Profile claimed + verified
- [ ] NAP info added to website footer
- [ ] LocalBusiness schema deployed
- [ ] 50+ local citations submitted
- [ ] Review management process established
- [ ] Local link building outreach started
- [ ] Metrics dashboard setup

---

## 🚀 **Phase 4 to Phase 5 Handoff**

**Ready for Phase 5 when:**
1. ✅ GBP fully optimized
2. ✅ 10+ citations active
3. ✅ 5+ reviews collected
4. ✅ Local keywords tracking

---

**Status:** Documentation complete, ready for implementation  
**Owner:** Marketing/Ops team  
**Timeline:** 2-3 weeks for GBP verification
