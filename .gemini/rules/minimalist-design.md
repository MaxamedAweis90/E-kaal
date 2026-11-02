# DESIGN SYSTEM & VISUAL FIDELITY RULE: STRICT MINIMALISM & ZERO AI SLOP

This project has strict visual reference designs locked in `plan/screens/` (`appshell.png`, `Dashboard.jpg`, `Deymaha.jpg`, `Vendor.jpg`, `Products.jpg`, `Reseller.jpg`, `DirOgeysis.jpg`, `Reports.jpg`).

## Immutable Design Directives:
1. **Zero Decorative AI Slop:**
   - NEVER introduce unrequested explanatory paragraphs, marketing text, disclaimers, or synthetic badges (e.g. "Settlement Rail: Online", "All debts backed by guarantor", "Merchant Command Center", "Live Ledger", "Operational Summary").
   - NEVER add extra decorative borders, glowing drop shadows, giant `<kbd>` prompts, or synthetic category headers ("Dual Ledgers", "Operations & Tools").
   - Keep labels and headings strictly minimal, exact, and concise (e.g., "Active Ledgers", "Quick Actions", "Largest Balances", "Search anything...").

2. **App Shell & Coordinate System (`1376×741` below removed 27px mock chrome):**
   - **No Desktop Window Banner:** Do NOT render macOS red/yellow/green window dots at the top of the app.
   - **Viewport Scaling:** Scaled proportionally via `useViewportScale` (`1376×741` design space; content width `1099px` inside `24px` padding).
   - **Palette & Fonts:** Shell `#0b120a`, panel `#141b13`, border `#233026`, grid `#0a110a` (`34px` lines), green `#54a376` / `#1faa5a`, red `#e0605f`. Numbers use Poppins (`font-sans`), NOT `font-mono`.
   - **Sidebar (`228px`):**
     - Top logo (`68px` header): `42px` `WalletLogo` + **E-kaal** (`27px` semibold) + `MERCHANT SYSTEM` (`8.5px` uppercase).
     - Single flat list of 8 navigation items (`42px` height, `17px` text, `10px` gap): Dashboard, Deymaha, Vendor, Products, Reseller, Dir Ogeysiis, Reports, Settings.
     - Active item: `rounded-[10px] bg-[#172319] border border-[#2e3e33] text-[#f1f5f2]`.
     - No category headers, no footer cards, no version text.
   - **Top Header (`68px`):**
     - Left: `332×41` rounded box (`bg-[#161a19]`) with `"Search anything..."`.
     - Right: `44×44` `CalcMathIcon` button, `40px` green pill (`bg-[#2c8e5f]`) `1 Month • 28 days left`, `42×42` bell button (red count badge shown ONLY when `unreadCount > 0`), `40×40` circle avatar.
   - **Empty Slot View:**
     - Clean `rounded-[16px]` card on grid background with exact text: `"No content loaded — screen display slot"`.

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

