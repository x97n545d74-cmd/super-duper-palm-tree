# Admin manual (for pharmacy staff)

Open **your-website/admin** and sign in with the email and password you were given. The admin works on a phone, but a computer is easier for bulk work.

## Overview
The first screen shows how many products are on the website, how many categories there are, and how many products **need information checked**. A yellow box appears when business details (address, phone, WhatsApp, hours, map link) are missing. The website hides missing details rather than showing anything wrong.

## Business details (do this first)
**Business details** in the menu.
- **WhatsApp number**: every "Ask on WhatsApp" button uses it. Type it with or without +91.
- **Address, phone, opening hours**: shown on the homepage, contact page and footer, and given to Google.
- **Google Maps link**: open the shop in Google Maps → Share → Copy link → paste.
- Press **Save business details**. The website updates straight away.

## Store offer and Shanker Club
In **Business details**:
- **Store offer**: on/off, discount % (default 12), minimum bill (default ₹1,000) and the code customers reveal (default `SHANKER12`). When a customer shows the code or mentions it on WhatsApp, apply the discount if the bill is above the minimum.
- **Shanker Club**: on/off and the extra member discount %. Leave it at 0 until you decide the number; the website then just says "extra discount".

**Club members** in the menu lists everyone who joined: their member code (e.g. `SM-7KQ2P`), mobile, name, email, language and which ad or page they came from. Search a code to check it at the counter. **Download CSV** exports the list for messaging tools. If someone asks to be removed, **Delete** them. If they reply STOP, stop messaging them.

## Prescriptions on WhatsApp
Customers can send a prescription photo or a typed medicine list to the store's WhatsApp (+91 98155 52404). The pharmacist must check every prescription before dispensing; prescription medicines are given only against a valid prescription. Don't forward prescriptions to anyone else.

## Products
**Products** lists everything, including hidden items. Search by name, brand or generic name. Tick *Only products that need checking* to see the ones still to verify.

**Add a product**: fill in name, brand and pack size (required), then manufacturer, generic name/composition (helps customers who search by salt) and category.
- **Availability**: leave it on *Not confirmed* unless you have checked the shelf. Customers then see "Ask for availability".
- **Prescription**: the pharmacist chooses. *Not checked yet* shows "Ask the pharmacist". *Prescription required* shows a notice that the medicine is sold only against a valid prescription at the store.
- **Description / information**: plain facts only (what it is, pack contents, storage). **Never** add what it treats, dosage or medical claims.
- **Image**: upload a clear photo on a plain background (JPG/PNG/WebP, up to 4 MB). Without a photo, a neutral illustration is shown.
- **Show on website**: untick to hide a product without deleting it. **Feature on the homepage**: up to 8 are shown. **Information needs checking**: untick once verified.

**Edit**: click a product, change it, **Save changes**. **Hide / Publish** buttons in the list switch visibility in one click. **Delete** (on the edit page) is permanent.

The same product (same name + brand + pack size) cannot be added twice.

## Categories
Click a category to edit its name in English, Hindi and Punjabi, its web address, an optional image, and whether it shows as a homepage tile. Use ↑ ↓ to change the order. A category can sit inside another (for example *Prescription Medicines* inside *Medicines*). You can't delete a category that still has products or sub-categories: move them first.

## Bulk import from a spreadsheet
1. **Bulk import** → *Download the CSV template*. Fill one product per row. In Excel save with *File → Save As → CSV UTF-8*.
2. Upload the file. The columns are matched automatically; check the matches.
3. The preview shows which rows are **new**, which are **duplicates** and which have **errors** (with the reason). Choose whether duplicates are skipped (safest) or updated.
4. Press **Import**. The summary shows what was added, updated and skipped. **Download error report** gives a CSV of the rows that failed, so you can fix and re-import just those.

Column values: `availability` = unconfirmed, in_stock, limited, on_order, out_of_stock · `rx_class` = unverified, otc, rx (or yes/no) · `published` = yes/no · `category` = a category name or its web address (see the list under the preview).

## Starter catalogue
The site came with about 40 common products so it could be demonstrated. All are marked *Information needs checking* and *Not confirmed*. Before launch, check each one (pack size, prescription status) and untick *needs checking*, or delete the ones you don't stock.

## Good practice
- Don't invent stock, prices or medical information. Leave a field empty if unsure.
- Customers' WhatsApp messages come to the store's WhatsApp; the website never sends anything by itself.
- Sign out on shared computers (bottom of the menu).
