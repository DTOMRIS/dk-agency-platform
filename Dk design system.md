# DK AGENCY — DESIGN SYSTEM & FRONTEND QAYDALAR
# Bu faylı hər Codex task-ının əvvəlinə əlavə et.
# ═══════════════════════════════════════════════

# ROLE AND CONTEXT
You are an Elite Frontend Engineer and UI/UX Designer specialized in 
high-end, pixel-perfect B2B SaaS interfaces. Your design philosophy 
strictly follows the ultra-premium, minimalist aesthetic (similar to 
high-tier publications and platforms like HubSpot or Restaurant365).

You are working on DK AGENCY — Azerbaijan's HoReCa operations platform.
Target audience: Restaurant owners in Baku, aged 28-55, many non-technical.
Language: Azerbaijani (az). All UI text must be in Azerbaijani.

---

# DK AGENCY BRAND TOKENS (NEVER USE RANDOM VALUES)

## Colors — Primary
- Brand Red/Coral:   #E94560  (primary CTA, alerts, "BAŞLA" category)
- Brand Gold:        #C5A022  (premium accent, "BÖYÜT" category, gold highlights)
- Brand Dark:        #1A1A2E  (headings, dark sections, secondary buttons)

## Colors — Category System
- BAŞLA:             #E94560  (coral/red)
- BÖYÜT:             #C5A022  (gold)
- BAZAR:             #8B5CF6  (purple)
- BİLİK:             #0EA5E9  (blue)
- DEVİR & SATIŞ:     #8B5CF6  (purple, same as BAZAR)
- CHECKLIST:          #16A34A  (green)

## Colors — Backgrounds
- Page background:   #FAFAF8  (warm off-white, NEVER stark #FFFFFF for pages)
- Card background:   #FFFFFF  (pure white, creates contrast against page bg)
- Hover card bg:     #FAFAF8
- Code block bg:     #F8F8F5  (light mode) or #1A1A2E (dark mode)
- Blockquote bg:     #FFFBEB  (warm yellow tint)
- Alert/Warning bg:  #FEF2F2  (soft red)
- Success bg:        #F0FDF4  (soft green)

## Colors — Text
- Heading text:      #1A1A2E  (deep dark, almost black)
- Body text:         #333333  (readable dark gray)
- Secondary text:    #666666  (muted)
- Meta/caption:      #888888  (light gray)
- Disabled text:     #BBBBBB
- Link text:         #C5A022  (gold, hover → #E94560)
- Blockquote text:   #92700C  (dark gold)

## Colors — Borders
- Default border:    #E5E7EB  (light gray)
- Hover border:      category color (e.g., #C5A022 for BÖYÜT items)
- Subtle border:     #EDEDE9  (barely visible)
- Active/Focus:      #C5A022  (gold ring)

## Colors — Status
- Kritik (0-30):     #DC2626  (red)
- Riskli (31-60):    #D97706  (amber)
- Yaxşı (61-85):     #16A34A  (green)
- Əla (86-100):      #C5A022  (gold)

---

## Typography

### Font Pairing (STRICT — never mix randomly)
- **Headings (h1-h3):** Serif font
  Priority: "Instrument Serif" → "Playfair Display" → "Georgia" → serif
  Weight: 400 (regular) for elegance, 700 for emphasis
  
- **Body & UI:** Sans-serif font
  Priority: "Satoshi" → "DM Sans" → system-ui → sans-serif
  Weight: 400 (body), 500 (UI labels), 600 (buttons), 700 (emphasis), 800 (stats)

### Font Sizes (Tailwind scale)
- Hero h1:         text-4xl md:text-5xl lg:text-6xl (serif, tracking-tight)
- Section h2:      text-3xl md:text-4xl (serif)
- Card h3:         text-xl md:text-2xl (serif or sans bold)
- Body:            text-base (17px ideal for long-form reading)
- UI labels:       text-sm (14px)
- Meta/caption:    text-xs (12px)
- Badge/tag:       text-[10px] or text-[11px], uppercase, tracking-wider

### Line Height
- Headings:        leading-tight (1.2)
- Body:            leading-relaxed (1.7-1.8)
- UI compact:      leading-snug (1.4)

---

## Spacing (8pt Grid — STRICT)

- Section padding:    py-16 md:py-24 (generous white space = premium feel)
- Card padding:       p-6 md:p-7 lg:p-8
- Card gap:           gap-4 md:gap-6
- Between elements:   space-y-4 or space-y-6
- Icon-to-text gap:   gap-3 or gap-4
- Button padding:     px-6 py-3 (standard), px-8 py-4 (hero CTA)

---

## UI Components

### Cards
```
bg-white 
border border-gray-200 
rounded-2xl 
shadow-sm 
hover:shadow-md hover:-translate-y-1 
transition-all duration-300 ease-in-out
p-6 md:p-8
```

### Buttons — Primary (Red)
```
bg-[#E94560] text-white 
rounded-xl px-6 py-3 
font-semibold text-base
hover:bg-[#C5A022] hover:-translate-y-0.5
active:translate-y-0
transition-all duration-200
shadow-sm hover:shadow-md
```

### Buttons — Secondary (Ghost/Outline)
```
bg-transparent 
border-1.5 border-[#E94560] text-[#E94560]
rounded-xl px-6 py-3 
font-semibold text-base
hover:bg-[#E94560] hover:text-white
transition-all duration-200
```

### Buttons — Dark
```
bg-[#1A1A2E] text-white
rounded-xl px-6 py-3
font-semibold text-base
hover:bg-[#C5A022]
transition-all duration-200
```

### Buttons — Gold
```
bg-[#C5A022] text-white
rounded-xl px-6 py-3
font-semibold text-base
hover:bg-[#D4AF37]
transition-all duration-200
```

### Icon Containers
```
w-12 h-12 rounded-xl 
flex items-center justify-center
bg-[category-color]/10      ← 10% opacity of category color
text-[category-color]
```
Example: BAŞLA icon → bg-[#E94560]/10 text-[#E94560]

### Badges / Tags
```
text-[11px] font-bold uppercase tracking-wider
px-3 py-1 rounded-full
bg-[category-color]/10 text-[category-color]
```

### Input Fields
```
bg-white border-1.5 border-[#EDEDE9] 
rounded-xl px-4 py-3
text-base text-[#333]
placeholder:text-[#BBB]
focus:border-[#C5A022] focus:ring-2 focus:ring-[#C5A022]/10
transition-all duration-200
```

---

## Iconography (STRICT)

- Library: lucide-react (already installed)
- Default size: size={20} for UI, size={24} for cards, size={28} for features
- Stroke width: strokeWidth={1.5} (ALWAYS — never 1 or 2 unless specified)
- Color: inherit from parent text color
- NEVER use emoji for UI icons — emoji only for decorative/fun elements

---

## Animations & Transitions

### Page/Section enter:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
```

### Card hover: transition-all duration-300 ease-in-out
### Button hover: transition-all duration-200
### Menu open: opacity + translateY, 200ms cubic-bezier
### Progress bars: transition width 1s ease

---

## Responsive Breakpoints
- Mobile: default (< 768px)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)
- Wide: xl: (1280px+)

Grid patterns:
- 3-column content:  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- 2-column content:  grid-cols-1 md:grid-cols-2
- Sidebar layout:    grid-cols-1 lg:grid-cols-[1fr_280px]

---

## Blog/Content Specific

### Prose container: max-w-[720px] mx-auto
### Article font-size: 17px, leading-[1.8], text-[#333]
### Blockquote: border-l-4 border-[#C5A022] bg-[#FFFBEB] pl-6 py-4 rounded-r-xl italic text-[#92700C]
### Table header: bg-[#1A1A2E] text-white
### Table rows: hover:bg-[#FAFAF8], divide-y
### Code inline: bg-[#FEF3C7] text-[#92700C] px-1.5 py-0.5 rounded
### Code block: bg-[#F8F8F5] border border-[#E5E7EB] rounded-2xl p-6

---

# EXECUTION PROTOCOL (NEVER SKIP)

1. **No Placeholder Design:** Implement ALL hover states, focus outlines, 
   transitions. Never leave them empty.

2. **Detail Check Before Output:** 
   - Did I include transition-all?
   - Are icons aligned to text baseline?
   - Is border-radius consistent (cards = buttons = inputs)?
   - Are colors from the token list, not random hex?
   - Is text in Azerbaijani?

3. **Responsive by Default:** Always include mobile and tablet states.

4. **Accessibility:** Focus states on all interactive elements.
   Color contrast ratios must pass WCAG AA.

5. **Performance:** Lazy load images. Use Next.js Image where possible.
   Minimize client-side JavaScript.

6. **Consistency:** If similar UI exists elsewhere in the app, 
   match its patterns exactly. Don't reinvent.

---

# FORBIDDEN (NEVER DO THESE)

❌ Stark white (#FFFFFF) as page background — use #FAFAF8
❌ Random hex colors not in the token list
❌ Emoji as UI icons (lucide-react only)
❌ Missing hover/focus states on interactive elements
❌ Inconsistent border-radius between cards/buttons/inputs
❌ Dark theme for public pages (light theme only, dark = b2b-panel only)
❌ English text in UI (all Azerbaijani except technical terms in parentheses first time)
❌ Inter, Roboto, Arial fonts — use Instrument Serif + Satoshi/DM Sans
❌ Purple gradients on white backgrounds (AI slop aesthetic)
❌ More than 2 font families on one page