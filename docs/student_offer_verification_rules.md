# Offer Verification Rules for Students

This document defines the rules a website can use to verify internship, scholarship, freelance, job, competition, hackathon, and other opportunity offers received by students.

An offer should receive **Verified / Official** status only when it passes all hard disqualifiers and meets the required identity, source, and content checks. Otherwise, it should be marked as **Likely Genuine**, **Needs Review**, **High Risk**, or **Confirmed Scam**.

---

## 1. Verification Status Levels

| Status | Meaning |
|---|---|
| **Verified / Official** | The offer passes all hard disqualifiers and is independently confirmed through an official source. |
| **Likely Genuine** | No scam indicators are found, but the exact listing has not yet been matched to an official page. |
| **Needs Review** | The offer is plausible but has missing details, an unofficial contact channel, or incomplete source verification. |
| **High Risk** | One or more scam indicators are present, such as urgency, payment requests, or unverifiable recruiter identity. |
| **Confirmed Scam** | Any hard disqualifier is triggered, or the sender/domain/account is confirmed fraudulent. |

---

## 2. Hard Disqualifiers

If any of the following conditions are true, mark the offer as **Confirmed Scam** or **High Risk** immediately.

- The sender asks the student to pay a registration fee, training fee, kit fee, deposit, processing fee, documentation fee, or placement fee.
- The sender requires payment through UPI, QR code, gift cards, cryptocurrency, wallet apps, wire transfer, or any “pay first, receive offer later” method.
- The sender asks for Aadhaar, PAN, bank account details, debit/credit card details, passwords, OTPs, passport scans, or other sensitive identity or financial information before a legitimate selection or onboarding process.
- The sender asks the student to deposit a cheque and send part of the money back.
- The offer guarantees selection, a job, a scholarship, or unusually high income with little or no effort.
- The recruiter’s email, phone number, UPI ID, website, bank account, or social-media handle is listed in a cybercrime suspect repository or is publicly reported as fraudulent.
- The website domain is a lookalike of a real organization, for example:
  - `micros0ft-careers.com`
  - `google-india-jobs.net`
  - `amazonhiring-india.org`
  - Any domain with misspellings, extra hyphens, unusual TLDs, or impersonation of a known brand.
- The sender claims to represent a government scheme but uses a non-government domain or asks for payment.
- The offer asks the student to recruit other students, buy a course, or complete paid tasks before receiving the promised opportunity.

---

## 3. Sender Identity Rules

The sender must be independently verifiable.

### 3.1 Email Verification

- The email must come from the organization’s official domain, not from Gmail, Yahoo, Outlook, ProtonMail, or another free personal email provider.
- The email domain must exactly match the organization’s known official domain.
- The display name, email address, and organization name must be consistent.
- The email should pass basic authentication checks where available:
  - SPF
  - DKIM
  - DMARC
- The email should not use misleading subdomains, such as `hr.microsoft.careers@gmail.com` or `careers@google-jobs-india.net`.

### 3.2 Recruiter Verification

- The recruiter’s phone number should match an official business listing, corporate website, or verified professional profile.
- The recruiter should have a verifiable professional presence, such as a LinkedIn profile linked to the actual organization.
- The recruiter’s stated role, company, location, and employment history should be consistent across public sources.
- The recruiter should be reachable through an official company contact channel, not only through a number or email provided in the suspicious message.

---

## 4. Source Authenticity Rules

The offer must be traceable to an official source that the student can find independently.

- The same opportunity must appear on one of the following:
  - The organization’s official careers page
  - The organization’s official scholarship or grants page
  - The university’s official notice board or placement portal
  - An official government portal
  - A verified event or competition platform
  - An official partner organization’s website
- Students must be able to locate the organization by searching its name directly, not by clicking the link in the received message.
- For Indian government schemes, the portal should use an official government domain such as `.gov.in` or `.nic.in`.
- For internships and jobs, the following details must match the official listing:
  - Role title
  - Organization name
  - Location or work mode
  - Eligibility criteria
  - Duration
  - Stipend or salary
  - Application deadline
  - Selection process
- For scholarships, the following details must match the official sponsor or institution:
  - Scholarship name
  - Sponsoring organization
  - Eligibility criteria
  - Deadline
  - Award amount
  - Required documents
  - Official application link
- For competitions and hackathons, the event must exist on the organizer’s official website, a recognized platform, or an official university/industry partner page.

---

## 5. Offer Content Rules

The message must contain enough real, checkable information.

### 5.1 Required Details

The offer should clearly include:

- Organization name
- Role, internship, scholarship, competition, or freelance project name
- Eligibility criteria
- Location or remote/work-from-home arrangement
- Duration or event date
- Stipend, salary, scholarship amount, or prize details
- Selection process
- Application deadline
- Official contact channel
- Official website or application link

### 5.2 Content Warning Signs

The following are warning signs and should reduce the trust score:

- Artificial urgency, such as:
  - “Pay within 1 hour”
  - “Only 2 seats left”
  - “Confirm immediately or lose the offer”
  - “Limited-time government benefit”
- Major grammar, spelling, or formatting errors.
- Generic greetings such as “Dear Candidate” without personalized application context.
- Requests for confidential documents before an interview, offer letter, or formal onboarding stage.
- Salary, stipend, scholarship, or prize amount that is unrealistic for the role, location, and student level.
- Vague job descriptions with no clear responsibilities, company details, or selection process.
- Pressure to communicate only through WhatsApp, Telegram, or a personal phone number.
- Links that do not match the claimed organization’s official domain.

---

## 6. Payment and Document Rules

### 6.1 Payment Rules

A legitimate offer must not require the student to pay to receive it.

The following payment requests should be treated as major red flags:

- Registration fee
- Security deposit
- Training fee
- Software or laptop fee
- Interview fee
- Offer-letter fee
- Background-verification fee
- Visa, travel, or accommodation advance payment
- “Refundable” deposit
- Cryptocurrency payment
- Gift-card payment
- Payment to a personal UPI ID or bank account

### 6.2 Document Rules

Sensitive documents should not be requested too early.

High-risk document requests include:

- Aadhaar card
- PAN card
- Bank account details
- Debit or credit card photos
- Passwords or OTPs
- Passport scans
- Full address proof before selection
- Academic certificates before an interview or official offer

A legitimate employer may request documents only after a proper selection process and usually through a secure onboarding portal.

---

## 7. Automated Checks for the Website

The platform can perform the following automated checks:

- Extract the sender email domain and compare it with a database of official organization domains.
- Check domain age, WHOIS records, SSL certificate status, and domain reputation.
- Detect lookalike domains using string similarity and brand-impersonation rules.
- Scan message text for scam keywords, such as:
  - “Registration fee”
  - “Security deposit”
  - “Pay now”
  - “Guaranteed job”
  - “Immediate selection”
  - “UPI”
  - “Crypto”
  - “Gift card”
  - “Aadhaar”
  - “OTP”
- Check whether the opportunity appears on the organization’s official careers, scholarship, event, or government portal.
- Compare offer details with the official listing.
- Search the sender’s email, phone number, website, UPI ID, and organization name against user-reported scam records.
- Allow users to submit:
  - Screenshots
  - Email headers
  - Sender address
  - Links
  - Recruiter name
  - Phone number
  - UPI ID
  - Website URL
- Generate an evidence-based verification report instead of only showing a badge.

---

## 8. Example Evidence Report

A good verification result should explain why the offer received its status.

Example:

```text
Offer Verification Result: Verified / Official

Organization: Example Technologies Pvt. Ltd.
Offer Type: Summer Internship
Sender Domain: careers@example.com
Domain Check: Matches official company domain
Official Listing: Found on example.com/careers
Recruiter Check: LinkedIn profile linked to Example Technologies
Payment Request: None detected
Sensitive Data Request: None detected
Urgency Language: None detected
Final Status: Verified / Official
```

Example of a high-risk result:

```text
Offer Verification Result: High Risk

Organization Claimed: Global Tech Solutions
Sender Domain: globaltech-hr@gmail.com
Domain Check: Personal email domain, not official company domain
Official Listing: Not found
Payment Request: ₹1,499 registration fee requested
Sensitive Data Request: Aadhaar and bank details requested before interview
Urgency Language: “Pay within 2 hours to confirm selection”
Final Status: High Risk / Likely Scam
```

---

## 9. Student Safety Rules

Students should always follow these rules:

- Never pay to get an internship, job, scholarship, or competition opportunity.
- Never share Aadhaar, PAN, bank details, card details, passwords, or OTPs through chat, email, or unknown links.
- Do not click links directly from unknown messages.
- Search for the organization and opportunity independently.
- Contact the organization using contact details from its official website.
- Check whether the same opportunity appears on an official careers, scholarship, or event page.
- Be cautious of offers that create urgency or promise guaranteed selection.
- Report suspicious offers to the platform and, where appropriate, to India’s National Cyber Crime Reporting Portal.

---

## 10. Final Verification Rule

An offer should be marked **Verified / Official** only if all of the following are true:

1. It does not trigger any hard disqualifier.
2. The sender uses an official and verifiable identity.
3. The organization and opportunity can be independently found on an official source.
4. The offer details match the official listing.
5. No payment, sensitive-data, urgency, or impersonation red flags are present.
6. The platform can show clear evidence for every verification decision.
