# Aishwarya Hospital — Multi-Specialty Healthcare & OPD Online Booking Platform

A high-end, responsive, full-stack hospital website and online outpatient appointment booking system for **Aishwarya Hospital**, situated in Vijayanagar 3rd Stage, Mysuru (Mysore), Karnataka, India.

---

## 1. Verified Business Research (Google Maps Link)

- **Source Link**: `https://maps.app.goo.gl/CVybxwKpQZ2rLeEq8`
- **Destination Place**: **Aishwarya Hospital**
- **Place Coordinates**: `12.3232344, 76.6092656`
- **Full Address**: A-1 Block, 30, 1st Main Rd, Vijayanagar 3rd Stage, Mysuru, Karnataka - 570012, India
- **Phone**: `+91 821 241 0255` (0821-2410255)
- **24/7 Helpline**: `+91 85128 30995`
- **Emergency Hours**: Open 24 Hours / 365 Days
- **OPD Timings**: Monday – Saturday: 08:30 AM – 08:30 PM, Sunday: 09:00 AM – 02:00 PM
- **Verified Doctors**:
  - **Dr. Sushma V. Dev**: Senior Consultant Gynecologist, Obstetrician & Laparoscopic Surgeon (MBBS, DGO, DNB)
  - **Dr. G. N. Sumangala**: Consultant Gynecologist & Women's Health Specialist (MBBS, MS - OBG)
  - **Dr. R. K. Mahesh**: Chief Physician - Internal Medicine, Diabetology & Critical Care (MBBS, MD)
  - **Dr. Pradeep Kumar**: Consultant General & Laparoscopic Surgeon (MBBS, MS)
  - **Dr. Arvind Swamy**: Consultant Cardiologist & Preventive Heart Specialist (MBBS, MD, DM)
  - **Dr. Kavitha Murthy**: Consultant Pediatrician & Neonatologist (MBBS, DCH, DNB)

---

## 2. Key Features & Clinical Infrastructure

### Online Outpatient Department (OPD) Appointment Booking
1. **Department Selection**: Obstetrics & Gynecology, General Medicine, Laparoscopic Surgery, Cardiology, Pediatrics, or Master Health Checkup.
2. **Doctor Selection**: Choose a named specialist doctor or "Any Available Doctor".
3. **Calendar Date Selection**: Daily OPD schedule with automatic holiday/closure handling.
4. **Real-time Slot Generation**: Calculates open slots based on doctor schedules and buffer intervals.
5. **Patient Details**: Full name, telephone (for SMS token), email, and symptoms/notes.
6. **Review & Hospital Policy**: Summary of doctor, date, time, and consultation fee in Indian Rupees (`₹`).
7. **Instant Token & Calendar Pass**: Generates unique Patient Token (e.g., `AH-4921-X`), 1-click **Add to Calendar (`.ics`)** download, and print token option.

### Double-Booking Prevention & Concurrency Safety
- Server-side atomic locks verify real-time slot availability before confirming.
- Prevents concurrent patients from occupying the same doctor consultation slot.

### Patient Self-Service Portal (Lookup / Reschedule / Cancel)
- Patients can lookup their token using reference code + phone number.
- Reschedule to a new slot online without phone calls.
- Cancellation with instant status updating.

### Hospital Staff & Doctor Administration Portal
- **Protected Access**: Login with staff password (`atelier2026`).
- **Live KPIs**: Today's patient visits, upcoming consultations, total OPD appointments.
- **Appointments Management**: Filter by status, search by patient name/token, mark completed or cancelled.
- **Department & Doctor Management**: Add or edit doctors, consultation fees, OPD timings, and active working days.
- **Operating Hours & Closures**: Adjust OPD timings and add special hospital closures.
- **Notification Audit Log**: Real-time trail of dispatched patient confirmation SMS/email records.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Express on Node.js (`server.ts`) with Vite middlewares.
- **Storage**: Transactional file-locked persistent store (`./data/db.json`).
- **SEO & Structured Data**: Schema.org `Hospital` JSON-LD schema, OpenGraph, and Twitter social cards.
