# PRIVACY POLICY

**Last updated:** 24 May 2026
**Effective date:** 24 May 2026

## 1. Data Controller Information

The data controller responsible for the processing of personal data under this Privacy Policy:

| Field | Information |
|---|---|
| **Legal name** | "DENİS TOMRİS" Limited Liability Company |
| **Trading name** | DK Agency |
| **Tax ID (VÖEN)** | 1405471681 |
| **Legal address** | AZ 1009, Baku city, Nasimi district, Bashir Safaroglu street, building 213, apartment 31, Republic of Azerbaijan |
| **Privacy contact** | privacy@dkagency.com.tr |
| **KVKK contact (Türkiye)** | kvkk@dkagency.com.tr |
| **General contact** | info@dkagency.com.tr |
| **Phone** | +994 50 256 62 79 |
| **Website** | https://dkagency.com.tr |

## 2. Legal Basis

This Privacy Policy is prepared in accordance with:

- **Republic of Azerbaijan:** Law of the Republic of Azerbaijan "On Personal Data" No. 998-IIIQ dated 11 May 2010;
- **European Union:** Regulation (EU) 2016/679 — General Data Protection Regulation (GDPR);
- **Republic of Türkiye:** Law No. 6698 on the Protection of Personal Data (KVKK) — for users in Türkiye;
- **International:** Council of Europe Convention 108+ for the Protection of Individuals with regard to Automatic Processing of Personal Data.

## 3. General Provisions

This Privacy Policy governs the collection, processing, storage, transfer, and protection of personal data of users (both individual users and B2B partner representatives — hereinafter the **"User"**) of the digital platform (hereinafter the **"System"** or **"Platform"**) operating on the dkagency.com.tr domain and all subdomains.

Each User who visits or registers on the System declares that they have fully read and agreed to the terms of this Privacy Policy.

## 4. Personal Data Collected and Sources

### 4.1. Data Collected Directly from the User

| Category | Specific data | When collected |
|---|---|---|
| **Registration and profile** | First name, last name, corporate or personal email, contact number, company name, password (stored as hash) | During registration |
| **B2B entity data** | Tax ID, business sector, position, legal status | When voluntarily entered |
| **Commercial transactions** | Subscription date, invoice details, payment cycle | At payment |
| **User content** | Listings (transfer, sale, franchise), comments, KAZAN AI conversations | During active use |

### 4.2. Automatically Collected Data

| Category | Detail |
|---|---|
| **Technical data** | IP address, device type, operating system, browser type and version, screen size, language preference |
| **Behavioral data** | Pages visited, session duration, click trajectory, navigation patterns |
| **Analytics** | Anonymized behavioral analytics via Yandex Metrika (including Webvisor) |
| **Cookie data** | Categories detailed in the Cookie Policy |

### 4.3. Special Note on Payment Data

**Bank card details (card number, CVV, expiry date) are not stored by the Controller.** These details are processed directly by PCI DSS-certified payment processors. The Controller receives only the transaction status (success/failure) and transaction identifier.

## 5. Purposes of Processing and Legal Bases

| Purpose | Legal basis | Data processed |
|---|---|---|
| Account creation and management | Performance of contract | Registration, profile |
| Provision of platform services | Performance of contract | Registration, B2B, content |
| Financial accounting and invoicing | Legal obligation | Commercial, B2B |
| System security and fraud prevention | Legitimate interest | Technical, behavioral |
| Personalization of user experience | **Consent** | Behavioral, analytics |
| AI-based recommendation engines (KAZAN AI) | Performance of contract | User content |
| Marketing communications | **Explicit consent** | Email, profile |
| Responding to legal requests | Legal obligation | All categories |

**Special note on marketing communications:** During registration, the User only consents to service provision. Subscription to marketing emails occurs through a separate, explicit consent and can be revoked at any time (via the "unsubscribe" link at the bottom of every email).

## 6. Transfer of Personal Data to Third Parties

Personal data **may not be sold or rented to third parties**. Data transfers occur only in the following cases:

### 6.1. Service Providers (Processors)

| Provider | Country | Service | Data transferred |
|---|---|---|---|
| **Neon Inc.** | USA | Database (PostgreSQL) | All structured data |
| **Hostinger International Ltd.** | Lithuania (EU) | Cloud hosting and VPS | Application files and session data |
| **Cloudinary Ltd.** | Israel/USA | Image and media storage | User-uploaded images |
| **DeepSeek AI** | China | AI processing (KAZAN AI primary) | KAZAN AI query texts (PII removed) |
| **Anthropic PBC** | USA | AI processing (KAZAN AI fallback) | KAZAN AI query texts (PII removed) |
| **Hostinger SMTP** | Lithuania (EU) | Email delivery | Email address and content |
| **Yandex LLC** | Netherlands (EU) | Web analytics | Anonymized behavioral data |
| **Cloudflare Inc.** | USA | DNS and CDN | IP addresses (technical) |

**Data Processing Agreements (DPA)** and/or **Standard Contractual Clauses (SCC)** have been signed with all providers.

### 6.2. International Data Transfers

As shown in the table above, some service providers are located outside the Republic of Azerbaijan. These transfers are carried out under the following safeguards:

- **EU/EEA transfers** (Hostinger, Yandex): GDPR compliance;
- **Non-EU transfers** (USA, Israel, China): EU Commission Standard Contractual Clauses (SCC) or additional safeguards;
- **For Türkiye KVKK compliance:** Compliance process is ongoing under the new cross-border transfer rules effective from 12 March 2024.

### 6.3. Transfers Based on Legal Obligation

Personal data may be disclosed pursuant to court orders, prosecutorial documents, or other official and reasoned requests from competent state authorities in accordance with the applicable legislation of the Republic of Azerbaijan, Republic of Türkiye, or European Union.

## 7. Retention Period of Personal Data

| Category | Retention period | Legal basis |
|---|---|---|
| Active account data | For the duration of the active account | Performance of contract |
| After account deletion | 90 days (for restoration option) | Legitimate interest |
| Financial and accounting records | 5 years | AR Tax Code |
| Legal dispute materials | 3 years after final resolution | AR Civil Code |
| Marketing consent evidence | 3 years after consent revocation | AR Civil Code |
| Cookies and analytics data | Specified in Cookie Policy | Consent or legitimate interest |

After the retention period expires, data is **automatically deleted or anonymized**.

## 8. Security of Personal Data

### 8.1. Technical Security

- **Encryption:** All data encrypted with SSL/TLS 1.3 in transit and AES-256 at rest;
- **Passwords:** User passwords stored using bcrypt hash algorithm (cost factor 12) — never stored in plaintext;
- **Session security:** JWT tokens, HTTPS-only cookies, CSRF protection;
- **Backup:** Encrypted automatic backups (daily, 30-day retention);
- **Penetration testing:** Annual penetration tests.

### 8.2. Organizational Security

- **Principle of Least Privilege:** Employees have access only to data required for their duties;
- **Audit logs:** All administrative actions logged;
- **Confidentiality agreements:** NDAs signed with all employees and subcontractors;
- **Security training:** Annual mandatory data security training.

### 8.3. Data Breach Notification

In the event of a personal data breach:

- **Within 72 hours**, notification to AR Personal Data Protection authority (AR Law);
- **Within 72 hours**, notification to TR Personal Data Protection Authority (KVKK);
- **Within 72 hours**, notification to relevant EU supervisory authority (GDPR Art. 33);
- **If high risk** — affected Users will be notified directly via email.

## 9. User Rights

In accordance with the AR Law "On Personal Data", GDPR (Art. 15-22), and KVKK (Art. 11), the User has the following rights:

| Right | Description |
|---|---|
| **Right to information** | Learn whether personal data is being processed |
| **Right of access (copy)** | Request a machine-readable copy of personal data |
| **Right to rectification** | Correct inaccurate or outdated data |
| **Right to erasure ("Right to be forgotten")** | Deletion of account and related data (except for legal archival obligations) |
| **Right to restriction of processing** | Stop processing for specific purposes |
| **Right to data portability** | Transfer data to another platform |
| **Right to object** | Object to marketing and profiling |
| **Right to object to automated decisions** | Request human intervention in AI-made decisions |
| **Right to withdraw consent** | Revoke given consent at any time |
| **Right to lodge a complaint** | File a complaint with the relevant supervisory authority |

### 9.1. How to Exercise Your Rights

To exercise the rights listed above:

- **AR and GDPR inquiries:** `privacy@dkagency.com.tr`
- **TR KVKK inquiries:** `kvkk@dkagency.com.tr`
- **Written inquiry:** AZ 1009, Baku city, Nasimi district, Bashir Safaroglu street, building 213, apartment 31

Inquiries will be responded to within **30 days**. Additional information may be requested to verify identity.

## 10. Special Provisions for Türkiye Users (KVKK)

DK Agency does not physically operate in the Republic of Türkiye, but since the Platform offers services in the Turkish language and processes personal data of Turkish citizens, it **commits to KVKK compliance under Law No. 6698**.

### 10.1. Data Controller Representative (KVKK Art. 13)

The appointment of a Data Controller Representative in Türkiye and VERBİS registration are in progress. Upon completion, the full contact details of the representative will be announced in this document. During this period, all KVKK inquiries should be directed to `kvkk@dkagency.com.tr`.

### 10.2. İYS (Commercial Electronic Message Management System)

DK Agency's İYS registration for sending marketing communications to TR users is in progress. During this period, only **transactional emails** (registration confirmation, password reset, invoices, system notifications) are sent to TR users; marketing emails are not sent.

### 10.3. KVKK-Specific Rights (Art. 11)

Under KVKK Art. 11, TR users have the right to:
- Learn whether their personal data is processed;
- Request information if processed;
- Learn the purpose of processing and whether it is used in accordance with the purpose;
- Know third parties to whom data is transferred domestically and abroad;
- Request correction of incomplete or incorrectly processed data;
- Request deletion or destruction under conditions specified in KVKK Art. 7;
- Request notification of third parties of the above operations;
- Object to results arising from analysis exclusively through automated systems;
- Request compensation for damages incurred due to unlawful processing.

## 11. Special Provisions for European Union Users (GDPR)

### 11.1. EU Representative (Art. 27)

As no regular and large-scale processing is currently carried out in the EU territory, the appointment of an EU Representative under GDPR Art. 27 is currently not mandatory. This will be re-evaluated if user numbers or processing scale change.

### 11.2. Right to Lodge a Complaint

EU Users have the right to lodge a complaint with their country's Data Protection Authority (Supervisory Authority).

## 12. Data of Minors

The Platform is **B2B-oriented and not intended for individuals under the age of 18**. We do not knowingly collect personal data of minors (16 years and under — GDPR criterion, 18 years and under — AR criterion).

If it is discovered that personal data of a minor has been collected, this data is immediately deleted. Parents or legal representatives may contact via `privacy@dkagency.com.tr`.

## 13. Cookies and Tracking Technologies

The Platform uses cookies and similar technologies. For details, see the separate **[Cookie Policy](/cookies)** document.

## 14. Automated Decision-Making and Profiling

The Platform uses automated decision-making in the following areas:

- **KAZAN AI recommendations:** AI-based responses to user queries;
- **Listing recommendations:** Prioritization of transfer/sale listings based on user profile;
- **Spam and fraud detection:** Automated detection of suspicious activity.

When these decisions do not have **legal or similarly significant effects** on the User, the right to request human intervention under GDPR Art. 22 and KVKK Art. 11 is preserved.

## 15. Changes to This Policy

The Controller reserves the right to update this Privacy Policy at any time. For significant changes:

- Users will be notified **30 days in advance** via the registered email address;
- A prominent notice will be placed on the Platform;
- The "Last updated" date will be updated.

The User's continued use of the Platform after the changes is considered acceptance of the new terms.

## 16. Contact

For any questions or inquiries regarding this Privacy Policy:

**"DENİS TOMRİS" LLC**
Tax ID: 1405471681
Address: AZ 1009, Baku city, Nasimi district, Bashir Safaroglu street, building 213, apartment 31
Email (privacy): privacy@dkagency.com.tr
Email (KVKK — TR): kvkk@dkagency.com.tr
Email (general): info@dkagency.com.tr
Phone: +994 50 256 62 79

---

*This document is prepared in accordance with the legislation of the Republic of Azerbaijan, EU GDPR, and TR KVKK. In case of dispute, the legislation of the Republic of Azerbaijan shall prevail.*
