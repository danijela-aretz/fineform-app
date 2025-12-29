**Workflow 7 — Client-Facing UX & Statuses**

**Status: FINAL · CLEAN · IMPLEMENTATION-READY**

---

**Purpose**

Workflow 7 defines exactly what clients see, when they see it, and which actions are available at each stage of the tax season.

Its purpose is to:

• Provide clear, calm, and accurate client guidance  
• Reflect progress without exposing internal mechanics  
• Ensure clients always know the next required step  
• Reduce confusion, pressure, and unnecessary communication

Client-facing UX is intentionally simpler than internal operations.

---

**Scope**

All client-facing behavior attaches to:

client\_entity\_id \+ tax\_year

Each entity and tax year has a single, consistent client experience.

---

**Client-Visible Statuses (Locked)**

Clients see only the following statuses:

1. Action Required — Please Sign Engagement Letter

2. Action Required — Please Upload Documents / Complete Questionnaire

3. Action Required — Please Confirm Documents Received

4. We’re Reviewing Your Documents and Tax Return Preparation Is in Progress

5. Action Required — Please Sign E-File Authorization

6. Filed

No other statuses are ever shown to clients.

---

**Extension Display (Not a Status)**

Extensions are displayed independently as a banner.

Possible banner states:

• Extension Requested  
• On Extension — New Due Date \[date\]

The banner does not change the client-visible status.

---

**Client Home Page Behavior**

**Engagement Pending**

• Status: Sign Engagement Letter  
• Checklist hidden  
• Uploads disabled  
• Messaging disabled

---

**After First Engagement Signature**

• Checklist visible  
• Questionnaire visible with progress indicators  
• ID module visible (low priority)  
• Messaging enabled

Status displayed:

Action Required — Please Upload Documents / Complete Questionnaire

---

**During Document Collection**

• Real-time progress indicators for documents and questionnaire  
• Calm, non-urgent language  
• “Need help?” access always visible

---

**After Checklist Completion**

• Status updates to: Confirm Documents Received  
• Client signs Document Receipt Confirmation once

Additional uploads after confirmation:

• Are accepted normally  
• Do not trigger additional confirmation

---

**Preparation Phase**

• Status updates to: We’re Reviewing Your Documents and Tax Return Preparation Is in Progress  
• No client tasks are shown  
• Messaging remains available

---

**E-File Authorization**

• Status updates to: Sign E-File Authorization  
• Client signs electronically

---

**Filed**

• Status updates to: Filed  
• Messaging remains open year-round  
• Client can download all tax documents

---

**ID Module UX**

• ID status always visible  
• Green indicator when valid  
• Warning indicator 30 days before expiration  
• ID required before filing, not before uploads

---

**“Need Help?” Behavior**

• Always visible throughout the client experience  
• Opens in-app messaging  
• Optional email notification to firm contacts

---

**Client Document Access**

All client-downloadable tax documents are stored in:

Tax Returns folder

This includes:

• Signed engagement letter  
• Extension acceptance PDF  
• Filed tax returns and notices

---

**Guardrails**

Workflow 7 must NOT:

• Display internal statuses  
• Display reminder mechanics  
• Pressure or threaten clients  
• Close messaging after filing  
• Hide client-accessible tax documents

Workflow 7 controls presentation only.

---

**Success Criteria**

Workflow 7 is complete when:

• Clients always know the next required action  
• Language remains calm and reassuring  
• Extensions reduce stress rather than add confusion  
• Client UX never contradicts internal logic

