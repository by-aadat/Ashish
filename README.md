# OmNettwear HRMS — v2.0

Attendance + Leave + Payroll portal for OmNettwear LLP, Kamla Nagar, Delhi.
Backend runs on Google Apps Script over one Google Sheet. Frontend is plain
HTML/CSS/JS — no build step, no framework, no npm.

---

## 1. Files in this package

```
Code.gs              backend — paste this into Apps Script
index.html           entry point, redirects to dashboard or login
login.html           sign in
dashboard.html       role-aware home screen
attendance.html      mark attendance          (replaces the old index.html)
history.html         attendance log, list + calendar view
leave.html           apply for leave, see balance
payroll.html         my salary and payslips
payslip.html         printable salary slip
profile.html         personal details, address, bank, password
admin.html           employees, records, approvals, pay run, policy
assets/app.css       the whole design system
assets/app.js        API URL, session, app shell, icons, formatters
```

`assets/` must stay a folder next to the HTML files. Every page loads
`assets/app.css` and `assets/app.js` with that exact relative path.

---

## 2. What to change in Apps Script

Open your Sheet, then **Extensions -> Apps Script**.

1. **Replace the code.** Select everything in the existing `Code.gs` and delete
   it, then paste the new `Code.gs` in full. Do not merge the two files — the
   old functions are replaced, not extended. Save (Ctrl+S).

2. **Run `setupHrms()` once.** Pick `setupHrms` from the function dropdown at the
   top and press **Run**. Google will ask for permission the first time —
   choose your account, click *Advanced* -> *Go to (project name)* -> *Allow*.
   This creates the missing sheets, seeds the policy settings, and creates the
   admin login. It is safe to run again later; it never deletes data.

3. **Deploy.** Two cases:

   * **Keeping your current URL (recommended).** Deploy -> *Manage deployments*
     -> pencil icon on the existing deployment -> **Version: New version** ->
     Deploy. The `/exec` link stays the same, so `assets/app.js` needs no edit
     at all.
   * **Making a fresh deployment.** Deploy -> *New deployment* -> type **Web
     app** -> Execute as **Me** -> Who has access **Anyone** -> Deploy. Copy the
     `/exec` URL and paste it into `assets/app.js` line 12.

   > "Anyone" only means Google will accept the request. The script itself
   > rejects every action that does not carry a valid login token, so this is
   > not an open door.

4. **If your old sheet has plain-text passwords,** run `secureAllPasswords()`
   once from the same dropdown. It converts every password to a salted hash.
   You do not strictly have to — a plain password still works for one last
   login and is upgraded automatically at that moment — but doing it in one go
   is cleaner.

5. **If you are upgrading from an earlier version of this portal,** run these
   two repair functions once each, the same way (function dropdown -> Run):

   * `repairAllSheets()` — re-lays every sheet back into the standard column
     order. Use this if a header row ever got reordered, or a column was
     deleted or dragged by hand. It reads every row by header *name* first, so
     no data is lost; it only re-arranges the layout.
   * `repairSettingsTimes()` — fixes shift times that Sheets silently turned
     into full timestamps (the `1899-12-30T07:08:50.000Z` problem). See section
     10 for why that happens.

6. **Re-authorise Drive access.** Profile photos and documents are stored in
   Google Drive, which is a permission this portal did not previously need. The
   first time you run `setupHrms()` after upgrading, Google will show the
   permission screen again and ask for Drive access — accept it. Without it,
   photo and document uploads fail with an authorisation error. A folder called
   **OmNettwear HRMS Files** is created automatically on the first upload, and
   its id is remembered in the `Settings` sheet under `DRIVE_FOLDER_ID`.

Those functions plus the deployment are the only things you ever touch inside
Apps Script. No triggers to configure.

---

## 3. Loading the 2026 holiday calendar

`Code.gs` now includes `seedHolidays2026()` — the full Indian holiday list for
2026, in English and Hindi, ready to load in one run. Every entry also comes
with a short bilingual write-up of its history and significance — click any
date on the calendar to read it.

1. In the Apps Script editor, pick **seedHolidays2026** from the function
   dropdown and press **Run**.
2. It adds every holiday that is not already in your `Holidays` sheet. Safe to
   re-run — it never creates duplicates.
3. Open **Administration -> Holidays & policy** and you will see a full
   colour-coded calendar. Click any highlighted date to see the occasion in
   both languages, with the full description underneath in an English /
   हिंदी tab switch.

**Only `Public Holiday` counts as a paid day off by default.** Everything else
— Restricted Holiday, Observance, Season, Gazetted Holiday, Central Government
Holiday — still shows on the calendar for reference, but stays a normal
working day in payroll unless you tick **Paid day off** on that entry. This
matches how most private retail businesses actually run: national gazetted
days are informational, not automatically closed.

If you would rather treat Gazetted Holidays as paid too, open each one from
the calendar (click the date, then the entry) and edit it — or just add it
fresh with the Paid box ticked; the newer entry is what payroll uses.

### Full details, images, and editing (Administration only)

Click any date on the Holiday calendar and each occasion on it opens as a
card with:

* the English and Hindi name,
* an **English / हिंदी** tab switch showing the full write-up in that
  language,
* a picture, if one has been added,
* (Administration only) an edit icon and a delete icon.

Everyone — Admin, HR, and every employee on their own read-only **Holidays**
page — sees all of this. Only Admin/HR can add, edit, or remove an entry.

Pressing the edit icon loads that holiday into the **Add a holiday** form,
where you can update the English write-up, the Hindi write-up, or paste an
image link, then press **Update holiday**.

**Why the seeded entries ship with no images.** An image hot-linked from an
external site can go down, get blocked, or be replaced at any time — and a
permanently broken image on a calendar 35 people look at daily is worse than
no image at all. Rather than guess at 73 links that might not survive, the
picture field is there and works the moment you add a link yourself: click
a date, press edit, paste a direct image URL (a link that ends in `.jpg`,
`.png` etc., not a webpage), press Update holiday. Wikimedia Commons
(commons.wikimedia.org) is a reliable source for free-to-use festival photos
if you want somewhere to start.

## 4. What to change in the Google Sheet

**Short answer: nothing by hand.** `setupHrms()` does all of it. This section is
only so you know what appeared and why.

### Sheets that already existed

**`Attendance`** — untouched. Same 10 columns, same order. Every existing row
stays readable.

**`Employees`** — the first 9 columns are unchanged and stay in place:

```
Employee ID | Name | Password | Role | Department | Designation | Joining Date | Photo URL | Email
```

29 new columns are appended after them, so nothing shifts and no formula
breaks. The new ones cover:

| Group | Columns |
|---|---|
| Personal | Phone, Date of Birth, Gender, Blood Group, Marital Status, Father/Spouse Name |
| Emergency | Emergency Contact Name, Emergency Contact Phone |
| Address | Address Line 1, Address Line 2, City, State, Pincode |
| Statutory | PAN, Aadhaar, UAN, ESIC Number |
| Bank | Bank Name, Account Number, IFSC |
| Employment | Employment Type, Reporting Manager, Shift In, Shift Out, Weekly Off |
| Leave quota | CL Allotted, SL Allotted, EL Allotted |
| — | Status |

Existing employees will have these blank. Fill them from **Administration ->
Employees -> edit** rather than typing into the sheet, so validation applies.
Two you should fill soon: **Weekly Off** and **Status** (`Active` / `Inactive`).
Blank Weekly Off falls back to the company default (Sunday); blank Status is
treated as Active.

### New sheets created

| Sheet | Holds |
|---|---|
| `Salary Structure` | Per-employee CTC breakup with an effective-from date. Keep old rows — payroll picks the latest one effective on or before the month being run, so past payslips stay correct after a raise. |
| `Payroll` | One row per generated payslip. `Draft` is admin-only; `Published` becomes visible to the employee. |
| `Leaves` | Applications with status, approver and remarks. |
| `Holidays` | Your festival and store-closed calendar — English and Hindi names, a full bilingual description of each, and an optional image link — shown as a colour-coded calendar to every employee. Only entries marked Paid are subtracted from working days in payroll — see section 3. |
| `Settings` | 21 policy rows — shift times, grace minutes, PF/ESI percentages and ceilings, leave quotas, payroll basis, document types, Drive folder id. |
| `Corrections` | Attendance-correction requests: what the record says now, what the employee wants it changed to, the reason, and who approved. |
| `Documents` | Index of uploaded files — employee, document type, file name and the Drive link. The files themselves live in Drive, not in the sheet. |

### Important habits

* **Do not rename or reorder header cells.** The code matches columns by header
  name, so renaming `In Time` to `In` will silently blank that field. Adding a
  new column of your own at the far right is fine and will be ignored.
* **Do not reformat the date columns.** `setupHrms()` deliberately sets the
  date, time, phone, pincode and account-number columns to *Plain text*. That is
  what stops Sheets turning `24-07-2026` into a serial number and stops it
  eating the leading zero in an account number.
* Editing rows by hand in the sheet works, but the app is safer — it recomputes
  working hours, overtime and late minutes for you.

---

## 5. First run

1. Open `login.html`.
2. Sign in as **`ADMIN01` / `Admin@123`**.
3. **Change that password immediately** — My profile -> Security.
4. Administration -> **Holidays & policy**: check shift times, grace minutes,
   weekly off, PF/ESI, leave quotas. Add this year's holidays.
5. Administration -> **Employees**: add your staff, or open the ones migrated
   from the old sheet and fill the blank fields.
6. For each employee, use the salary icon on their row to add a **salary
   structure**. Enter monthly CTC and press *Auto split* if you do not want to
   break it up yourself. **Payroll skips anyone without a structure** — the
   dashboard warns you how many are missing.
7. At month end: Administration -> **Run payroll** -> pick the month ->
   *Preview* -> check the numbers -> *Generate & save* -> *Publish all*.
   Payslips only reach employees after Publish.

---

## 6. Where to host the pages

Anywhere that serves static files. Google Drive cannot host HTML any more, so
pick one of:

* **GitHub Pages** — free, a repo plus a toggle in settings.
* **Netlify Drop** — drag the folder onto netlify.com/drop.
* **Any shared hosting / cPanel** — upload the folder as-is.

Keep the folder structure intact. Open `index.html` as the entry point.

---

## 7. How attendance actually works now

There are three ways a day gets marked, and who can use which one matters.

### The employee punches, like a biometric machine

Staff open **Mark attendance** and see a live clock with one big button.

* **First tap of the day** stamps the In time and marks them Present.
* **Second tap** stamps the Out time, works out hours, overtime and late
  minutes, and closes the day. If the hours fall below the half-day threshold
  the status is automatically corrected to Half-Day.
* **Third tap** does nothing — the day is complete.

An employee can only ever punch for **today**. They cannot pick a date, cannot
punch for anyone else, and cannot edit a record once it is saved.

### Corrections go through approval

Because employees cannot edit their own attendance, a wrong or missed entry is
fixed by a request, not an edit. On the same screen there is **Request a
correction**: pick the date, the correct status and times, and give a reason.
The reason is mandatory.

The request lands in **Administration -> Corrections**, where Admin, HR or a
Process Coordinator sees the current record and the proposed one side by side
before deciding. The attendance record changes **only** when someone approves.
Rejections ask for a note, which the employee sees.

This means the audit trail is intact: the `Corrections` sheet keeps a permanent
record of what was changed, by whom, when and why.

### The Process Coordinator marks everyone at once

Set a person's **Access level** to **PC** in the employee dialog and they get a
**Bulk mark** tab: pick a date, pick one status, tick as many employees as you
like (with search, Select all and Clear), and save them all in one go. Optional
in/out times apply to everyone in the batch. Anyone already marked for that date
is skipped unless *Overwrite if already marked* is ticked, and the result tells
you how many were marked and how many were skipped.

A PC can also approve corrections. A PC **cannot** see salary structures,
payroll or the employee master — that stays with Admin and HR.

### Who can do what

| | Employee | PC | Admin / HR |
|---|---|---|---|
| Punch in/out for self (today only) | Yes | Yes | Yes |
| Request a correction | Yes | Yes | Yes |
| Approve corrections | No | Yes | Yes |
| Mark any date for any employee | No | Yes | Yes |
| Bulk mark many employees | No | Yes | Yes |
| Edit or delete a saved record | No | No | Yes |
| Salary, payroll, employee master | No | No | Yes |

---

## 8. Photos and documents

Both are stored in a Google Drive folder called **OmNettwear HRMS Files**,
created automatically on the first upload. The sheets only hold the links.

**Profile photo.** On **My profile**, the avatar has a small pencil badge —
clicking it opens the phone gallery or file picker. Pick an image and it is
uploaded and set immediately, no link-pasting. Images over about 5 MB are
rejected with a clear message.

**Documents.** **My profile -> Documents** lets a person upload their own PAN,
Aadhaar, bank cheque, photograph, resume, offer letter, or anything else. The
type list comes from the `DOC_TYPES` row in `Settings`, so you can edit the
standard list any time. If what you need is not listed, choose **Other (type a
name)** and name it yourself — so a document type you have never thought of
before can still be filed under a sensible label.

**Admin access.** In **Administration -> Employees**, each row has a document
icon. That opens the same panel for that employee, where Admin can upload on
their behalf, view anything on file, or remove a document. Removing deletes the
Drive file too, so it is behind a confirmation.

Employees see only their own documents. Admin and HR see everyone's.

> **One thing to be deliberate about.** Uploaded files are shared as *anyone
> with the link can view*, which is what lets them open inside the portal.
> Practically, that means anybody who obtains a file link can open that PAN card
> or bank cheque without logging in. The links are long and unguessable, so this
> is not casual exposure, but it is not access-controlled either. If you would
> rather trade convenience for tighter control, say so and the sharing mode can
> be switched to restricted — the cost is that files then only open for people
> already signed in to a Google account you have granted access to.

---

## 9. How payroll actually calculates

For the selected month, per employee:

```
total days      = days in the month
week offs       = that employee's weekly off (falls back to company default)
holidays        = entries in the Holidays sheet, excluding ones on a week off
working days    = total days - week offs - holidays

covered         = present + (half days x 0.5) + approved paid leave
                  (capped at working days)
LOP days        = working days - covered

payable days    = covered + (week offs + holidays) x (covered / working days)
```

That last line is the part worth understanding. Week offs and holidays are paid
**in proportion to the working days you actually covered**. Work the whole month
and you are paid all 31 days. Work half of it and the paid week offs halve too.
Show up for none of it and there is no free Sunday. This matches how most Indian
payroll runs behave and avoids the odd result where a fully absent employee
still draws four days' pay.

Then:

```
gross      = (basic + HRA + conveyance + medical + special + other)
             x payable days / total days
           + overtime pay
PF         = 12% of basic, basic capped at 15,000     (if PF applicable)
ESI        = 0.75% of gross, only while gross <= 21,000
net pay    = gross - PF - ESI - professional tax - TDS - other deductions
```

Every percentage and ceiling above is a row in the `Settings` sheet, editable
from Administration -> Holidays & policy. `PAYROLL_BASIS` switches between
`CALENDAR` (pay divided over calendar days, the default and the Indian norm)
and `WORKING` (divided over working days only).

---

## 10. Security notes, honestly

What was fixed from v1:

* Passwords are stored as `sha256$salt$hash`, never in plain text.
* Login issues a token valid for 6 hours; **every** other action requires it.
  Previously anyone with the script URL could read all attendance by opening it
  in a browser.
* Employees can only read their own records. Salary, PAN, Aadhaar and bank
  details are admin-only. Aadhaar and account numbers are masked on payslips.
* Self-service profile edits cannot change your own role, salary or status.
* Employees cannot alter their own attendance once saved — every change goes
  through an approval and leaves a permanent record of who changed what and why.
* All values are HTML-escaped before display, closing the injection hole in the
  old pages.

What is still true, and you should know it:

**The data lives in a Google Sheet.** Anyone you share that Sheet with can read
everything — salaries, Aadhaar, bank accounts — straight from the sheet,
completely bypassing the portal and its permissions. Keep the Sheet shared with
as few people as possible, ideally only yourself. The portal's access rules
protect the portal, not the spreadsheet underneath it.

Sessions live in `sessionStorage` and expire after 30 minutes of inactivity, so
a shared counter PC does not stay logged in.

---

## 11. Troubleshooting

| Symptom | Cause |
|---|---|
| Every page says "setup needed" | `API_URL` in `assets/app.js` is still a placeholder, or the deployment was never made. |
| Login works, everything else says session expired | You deployed with *Execute as: User accessing the web app*. It must be **Me**. |
| Changes to `Code.gs` have no effect | You saved but did not deploy a **new version**. Manage deployments -> pencil -> Version: New version. |
| Dates show as numbers in the sheet | A date column got reformatted away from Plain text. Re-run `setupHrms()`. |
| Shift time shows as `1899-12-30T07:08:50.000Z` | Sheets turned a typed time into a real date. Run `repairSettingsTimes()` once. Explained just below. |
| Photo or document upload fails with an authorisation error | Drive permission was never granted. Run `setupHrms()` from the editor and accept the Drive prompt. |
| Columns are in the wrong order, or a header is missing | Run `repairAllSheets()`. It reads by header name first, so nothing is lost. |
| Employee says they cannot edit their attendance | That is intended. They send a correction request; you approve it under Administration -> Corrections. |
| "No salary structure" on payroll | That employee has no row in `Salary Structure` with an effective-from date on or before the month end. |
| Icons or menu text look like garbage | Only possible if a file was re-saved in a non-UTF-8 encoding. Save as UTF-8. |

### About that `1899-12-30T07:08:50.000Z`

This one confused things for a while, so here is what is actually happening.

Shift times are stored as plain text — `09:30 AM`. But if a cell in the
`Settings` sheet is formatted as *Automatic* rather than *Plain text*, and
someone types a time into it, Sheets helpfully decides it is a real time value
and converts it. Internally Sheets stores times as a fraction of a day counted
from **30 December 1899**, its zero date. So `07:08 AM` becomes
"1899-12-30, 7:08 in the morning", and when the script reads that cell it gets a
full timestamp instead of the text it expected.

The date part is meaningless — only the time inside it was ever real.

Three things now prevent it:

* The Value column is re-asserted as Plain text every time settings are read.
* Any cell that has already been converted is read back correctly, taking the
  time out of the timestamp.
* Saving a time from **Holidays & policy** validates the format first and
  refuses anything that is not like `09:30 AM`.

So you should not see it again. If an old value is still sitting in the sheet,
`repairSettingsTimes()` cleans it up in one run. And when typing a time by hand
into the sheet, always use the `09:30 AM` form — hour, colon, two-digit minute,
space, AM or PM.

---

## 12. Version

v2.5 — Every holiday now carries a full bilingual (English/Hindi) description
and an optional picture. Clicking a date opens the occasion with an
English/हिंदी tab switch and the write-up underneath; Administration gets
edit and delete icons there too, feeding straight into the existing Add a
holiday form. All 73 seeded 2026 holidays ship with real bilingual history —
images are left for you to add per holiday (see section 3) so nothing ever
shows a broken picture.

v2.4 — Both calendars (Attendance log and Holiday calendar) are fully
solid-filled by status/type now, with black text, instead of pale tints —
and every one of those colours is editable from a single admin-only
Calendar colors panel (Administration -> Holidays & policy). Attendance
log's Calendar view is now the default, ahead of List. Calendar width
reverted to fill the card, matching how it looked originally.

v2.3 — Holiday calendar is now visible to every employee (My workspace ->
Holidays, read-only); Administration keeps the same calendar plus the add
form and policy settings. Fixed profile photos not displaying (Drive's old
`uc?export=view` link is no longer reliable for `<img>` tags; switched to
the `/thumbnail` endpoint) and added a Remove photo option. Also added the
missing Corrections link to the sidebar.

v2.2 — Holidays sheet redesigned to allow more than one occasion per date,
Hindi names, and a Paid flag; the admin Holidays & policy screen is now a
clickable colour calendar instead of a list. Includes a one-run
`seedHolidays2026()` loader for the full 2026 India calendar.

v2.1 — adds punch-clock attendance, the correction-approval workflow, the
Process Coordinator role with bulk marking, profile photo upload and document
management. Two new sheets (`Corrections`, `Documents`) and a Drive folder.

v2.0 — replaced the two-sheet attendance app. `index.html` is now a redirect;
the attendance form it used to hold lives at `attendance.html`.
