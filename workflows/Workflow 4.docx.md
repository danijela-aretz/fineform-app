**Workflow 4 — Document Uploads & Confirmation**

**Status: FINAL · CLEAN · IMPLEMENTATION-READY**

---

**Purpose**

Workflow 4 governs how tax documents are uploaded, tracked, and confirmed for a specific entity and tax year.

Its purpose is to:

• Define safe and structured document upload behavior  
• Attach uploads to checklist items  
• Track document completion deterministically  
• Notify appropriate internal staff of uploads  
• Request and capture client confirmation once all required documents are received

This workflow ends at document confirmation.  
It does not start preparation.

---

**Scope**

All behavior in this workflow attaches to:

client\_entity\_id \+ tax\_year

Uploads, progress, and confirmation are isolated per entity and per tax year.

---

**Preconditions**

Before Workflow 4 runs:

• Workflow 2 has captured at least one engagement signature  
• Workflow 3 has created the document checklist  
• Document uploads are enabled

---

**Upload Paths (Both Supported)**

**Upload via Checklist Item (Preferred)**

Client selects a specific checklist item and uploads a document.

System behavior:

• File is linked to the selected checklist item  
• Checklist item status updates from Missing to Received

This is the primary and recommended upload path.

---

**General Upload (Fallback)**

Client uploads a document without selecting a checklist item.

System behavior:

• Client is prompted to select document type  
• Optional issuer or source may be specified  
• System matches the upload to an existing checklist item, or  
• Creates a new checklist item if none exists

No uploads are ever orphaned.

---

**Multiple Files per Checklist Item (Locked)**

Checklist items may contain multiple files.

Common cases include:

• Multi-page statements  
• Combined PDFs  
• Corrections or supplemental documents

Uploading additional files:

• Adds files without overwriting existing ones  
• Preserves full document history  
• Keeps the checklist item in Received status

---

**Replace Behavior (Explicit Only)**

Replace is used only when intentionally selected.

Valid cases include:

• Incorrect document uploaded  
• Illegible scan  
• Corrected version of the same document

Replace behavior:

• Original file is retained for audit  
• New file becomes the active version  
• Checklist item status updates to Replaced

Replace never occurs automatically.

---

**Checklist Completion Logic (Locked)**

“All Documents Received” is achieved when:

• All required checklist items are either Received or Not Applicable

Rules:

• Items marked Not Applicable count as complete  
• Number of files on an item does not affect completion

This logic is deterministic and absolute.

---

**Notifications**

**Upload Notifications**

Each document upload triggers an internal notification to:

• super\_admin  
• admin  
• Idir

No other staff are notified.

Notifications indicate what was uploaded, not readiness for preparation.

---

**Completion Notification**

When the checklist reaches 100% completion:

• A single internal notification is sent indicating documents are complete  
• Status reflects awaiting client confirmation

---

**Document Receipt Confirmation**

**Trigger**

• Checklist completion reaches 100%

---

**Confirmation Behavior (Locked)**

• Client is asked to sign one Document Receipt Confirmation for the tax year  
• Confirmation is signed once per tax year  
• Confirmation remains valid

Additional uploads after confirmation:

• Are logged and added to the file  
• Do not require re-confirmation

---

**Separation from Preparation**

Document completion and confirmation do not start preparation.

Preparation begins only when internal status moves to Ready for Prep.

---

**Guardrails**

Workflow 4 must NOT:

• Start preparation  
• Require questionnaire completion  
• Require ID validation  
• Start reminders  
• Modify internal preparation status  
• Create messaging threads

Workflow 4 ends at document confirmation.

---

**Success Criteria**

Workflow 4 is complete when:

• All required documents are received or marked Not Applicable  
• Document Receipt Confirmation is signed  
• No files are overwritten or lost  
• Uploads and confirmations are fully auditable

