# DK Agency Platform Guidelines

## 🛡 Project Identity
- **Project Name**: `dk-agency-platform`
- **Core Business**: Investment, Holding, and Agency Management.
- **Target Audience**: Business partners, investors, and elite clients.
- **CRITICAL RULE**: This is NOT a Restaurant Management System. Avoid hardcoded "Hospitality", "Restaurant", "Food Cost", or "AQTA" related content on core landing pages unless specifically requested for a sub-module.
- **AQTA SOURCE OF TRUTH**: `AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.`

## 🎨 Design System
- **Tone**: Premium, Sophisticated, High-Tech ("God Mode").
- **Theme**: Premium Light (for Dashboard), Dark Glassmorphism (for Landing).
- **Primary Color**: `brand-red` (`#E11D48`).
- **Typography**: `Inter` (Sans), `Playfair Display` (Display/Serif).

## 🧩 Component Usage
- **Global Header**: ALWAYS use `Header.tsx` (DK Agency specialized). 
- **DO NOT USE**: `HospitalityHeader.tsx` (This is a legacy template component and should be avoided or removed).
- **Footer**: Use project-specific footers that reflect the Agency/Holding identity.

## 🛠 Tech Stack
- Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.

## 🚫 Prohibited Actions
- Do not perform "Haldır huldur" (reckless) changes without analyzing existing components.
- Do not copy-paste templates from other sectors (like Hospitality) without deep customization.
- Do not bypass `Header.tsx` for global navigation.
