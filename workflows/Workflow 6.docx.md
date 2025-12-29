**Workflow 6 — Internal Dashboard & Statuses**

**Status: FINAL · CLEAN · IMPLEMENTATION-READY**

---

**Purpose**

Workflow 6 defines the internal operational truth for each tax return.

Its purpose is to:

• Represent the real state of each entity’s tax return  
• Show what is blocking progress  
• Control when preparation may begin  
• Provide staff with clear, auditable status transitions

Clients never see these statuses directly.

---

**Scope**

All internal status behavior attaches to:

client\_entity\_id \+ tax\_year

Each entity and tax year has exactly one primary internal status at any time.

---

**Primary Internal Statuses (Locked)**

Each return progresses through the following statuses:

1. Invited  
   Tax season email has been sent

2. Engaged  
   First engagement signature captured

3. Collecting Docs  
   Checklist exists and uploads are in progress

4. Awaiting Confirmation  
   Checklist complete and document receipt confirmation pending

5. Ready for Prep  
   All client-controlled requirements satisfied

6. In Prep  
   Firm is actively preparing the return

7. Awaiting E-File Authorization  
   Draft return uploaded and client signature pending

8. Filed  
   Return accepted by IRS and applicable state agencies

Statuses are linear and reflect operational reality.

---

**Extension Handling (Flag-Based)**

Extensions are not a status.

Extension behavior is represented by flags layered on top of the primary status:

• extension\_requested  
• extension\_filed  
• extended\_due\_date

Example display:

Collecting Docs — On Extension (Due October 15\)

This preserves true workflow state while resetting deadlines.

---

**Ready for Prep Gate (Locked)**

Transition to Ready for Prep requires ALL of the following:

• Engagement is fully signed  
• Document checklist is 100% complete  
• Document Receipt Confirmation is signed  
• Questionnaire is fully submitted  
• Required identification is valid

This is the final client-controlled gate before preparation.

---

**Soft Warnings (Not Hard Blocks)**

If staff attempts to:

• Start preparation  
• Upload a draft return  
• Request e-file authorization

Before Ready for Prep:

• A clear warning is shown  
• The action is allowed  
• The action is logged

This accommodates real-world edge cases without losing audit control.

---

**Permissions**

• super\_admin: unrestricted access  
• admin: full access except restricted clients  
• Idir: assigned clients only  
• Restricted clients: super\_admin only unless explicitly assigned

Assignments determine visibility and responsibility.

---

**Audit Trail (Mandatory)**

Every status change records:

• Old status  
• New status  
• Changed by (user)  
• Timestamp  
• Optional reason

Critical events always logged:

• Extension requested  
• Extension filed  
• Preparation started  
• Return filed

Audit logs are immutable.

---

**Guardrails**

Workflow 6 must NOT:

• Send reminders  
• Change client-visible wording  
• Manage messaging  
• Perform document uploads

Workflow 6 controls internal state only.

---

**Success Criteria**

Workflow 6 is complete when:

• Internal status accurately reflects reality  
• Preparation cannot begin accidentally  
• Extensions do not hide incomplete work  
• All transitions are auditable

