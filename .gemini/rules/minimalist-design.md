# DESIGN SYSTEM & VISUAL FIDELITY RULE: STRICT MINIMALISM & ZERO AI SLOP

This project has strict visual reference designs locked in `plan/screens/` (`appshell.png`, `Dashboard.jpg`, `Deymaha.jpg`, `Vendor.jpg`, `Products.jpg`, `Reseller.jpg`, `DirOgeysis.jpg`, `Reports.jpg`).

## Immutable Design Directives:
1. **Zero Decorative AI Slop:**
   - NEVER introduce unrequested explanatory paragraphs, marketing text, disclaimers, or synthetic badges (e.g. "Settlement Rail: Online", "All debts backed by guarantor", "Merchant Command Center", "Live Ledger", "Operational Summary").
   - NEVER add extra decorative borders, glowing drop shadows, giant `<kbd>` prompts, or synthetic category headers ("Dual Ledgers", "Operations & Tools").
   - Keep labels and headings strictly minimal, exact, and concise (e.g., "Active Ledgers", "Quick Actions", "Largest Balances", "Search anything...").

2. **App Shell Exact Match (`appshell.png`):**
   - **Window Controls:** macOS-style top-left window dots (red `#ff5f56`, yellow `#ffbd2e`, green `#27c93f`).
   - **Background:** Technical dark green grid pattern (`#060e08` with subtle grid lines `rgba(27, 48, 33, 0.45)`).
   - **Sidebar:**
     - Top logo: Green minimalist wallet icon glyph + **E-kaal** (bold white) + `MERCHANT SYSTEM` (small uppercase grey).
     - Single flat list of 8 navigation items:
       1. Dashboard
       2. Deymaha
       3. Vendor
       4. Products
       5. Reseller
       6. Dir Ogeysiis
       7. Reports
       8. Settings
     - Active item: Clean rounded container `rounded-xl bg-[#142319] border border-[#23422e] text-[#f0f6f2]`.
     - Inactive item: Clean transparent hover `text-[#8da294] hover:text-[#f0f6f2] hover:bg-[#0f1d13]`.
     - No category headers, no footer cards, no version text.
   - **Top Header:**
     - Left: Magnifying glass icon + input with exact placeholder `"Search anything..."` in dark rounded box.
     - Right:
       - Calculator icon button: Square button with `+ - / x =` math symbols (`w-9 h-9 rounded-lg bg-[#0e1b13] border border-[#1b3122]`).
       - Subscription pill: Solid green pill `1 Month • 28 days left` (`bg-[#1a8754] text-white text-xs font-semibold px-4 py-1.5 rounded-full`).
       - Notification bell: Bell icon with red badge dot containing `1`.
       - User profile avatar: Clean circle avatar without noisy text.
   - **Empty Slot View:**
     - Clean rounded-2xl card on grid background with exact text: `"No content loaded — screen display slot"` (no icons, no kbd tags, no extra paragraphs).

3. **Dashboard Exact Match (`Dashboard.jpg`):**
   - **Top 4 KPI Cards:**
     - `↗ Total Debt` -> Value (White), subtitle: `X customers`
     - `✓ Total Recovered` -> Value (Green)
     - `🕒 Remaining Balance` -> Value (Red)
     - `🏪 Vendor Payables` -> Value (White), subtitle: `What you owe`
   - **Active Ledgers:**
     - `Deymaha` card with green document icon, value, `X records`
     - `Vendor` card with red store icon, value, `What you owe`
   - **Quick Actions (4 tiles in a row):**
     - Reminders (Bell icon with orange badge dot)
     - Dir Ogeysiis (Green broadcast icon)
     - Invoices (Blue invoice icon)
     - Products (Purple box icon)
   - **Largest Balances:**
     - Number rank badge (1, 2, 3...)
     - Customer name + balance in red
     - Phone • paid $X.XX
     - Clean horizontal green progress bar + percentage

