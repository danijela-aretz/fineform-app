**Workflow 5 — Reminders & Extensions**

**Status: FINAL · CLEAN · IMPLEMENTATION-READY**

---

**Purpose**

Workflow 5 manages all client reminders and extension handling in a predictable, calm, and deterministic way.

Its purpose is to:

• Remind clients only when action is actually required  
• Separate reminder logic by obligation type  
• Prevent duplicate or conflicting reminders  
• Allow clients to pause pressure by requesting an extension  
• Reset timelines cleanly after an extension is filed

This workflow nudges behavior only.  
It never changes preparation status.

---

**Scope**

All reminder and extension behavior attaches to:

client\_entity\_id \+ tax\_year

Each entity and tax year is handled independently.

---

**Reminder Streams (Independent)**

There are three independent reminder streams:

• Document Checklist  
• Questionnaire  
• ID Validity

Each stream:

• Has its own cadence  
• Tracks its own next reminder timestamp  
• Can be paused independently by an extension

This design prevents reminder overlap and duplication.

---

**Checklist (Document) Reminders**

**When They Apply**

Checklist reminders apply when:

• Checklist is not 100% complete  
• An extension has not been requested

---

**Cadence (Locked)**

• February 15 — first reminder  
• Second Monday of March — second reminder  
• Weekly thereafter until:  
– Checklist is complete, or  
– Client requests an extension

Tone remains informational and calm.

---

**Questionnaire Reminders**

**When They Apply**

Questionnaire reminders apply when:

• Questionnaire is incomplete  
• An extension has not been requested

---

**Cadence**

• Once per month

Questionnaire reminders:

• Do not block uploads  
• Do not block document confirmation  
• Only block Ready for Prep internally

---

**ID Validity Reminders**

**When They Apply**

ID reminders apply when:

• Required identification is expired or missing

---

**Cadence**

• Once per month initially  
• Weekly after March 15

ID reminders reflect compliance requirements.

---

**Document Confirmation Reminders**

**When They Apply**

• Checklist is 100% complete  
• Document Receipt Confirmation has been requested  
• Confirmation has not yet been signed

---

**Behavior**

• Reminder messaging changes to confirmation-specific language  
• All confirmation reminders stop immediately once signed

---

**Extension Request (Client-Controlled)**

**Client Action**

Client selects:

“Please file an extension — I will not have my documents by the filing deadline.”

---

**Immediate System Behavior**

• extension\_requested \= true  
• All reminder streams pause immediately  
• Internal status reflects extension requested

No pressure continues after this action.

---

**Extension Filing (Firm Action)**

When the firm files the extension:

• extension\_filed \= true  
• Extended due date is set automatically:  
– 1040 / 1120 → October 15  
– 1065 / 1120S → September 15

• Extension acceptance PDF is uploaded  
• Extension document is stored in Tax Returns

---

**Post-Extension Reminder Resumption**

After extension filing:

• Reminder streams resume relative to the extended due date  
• Cadence remains deterministic

---

**Deterministic Scheduling (Implementation Rule)**

Each reminder stream must track:

• next\_reminder\_at  
• last\_reminder\_sent\_at

This prevents:

• Duplicate reminders  
• Missed reminders  
• Race conditions

---

**Internal Notifications**

When reminders are active or repeatedly sent, internal visibility is provided to:

• super\_admin  
• admin  
• Idir

No other staff receive reminder notifications.

---

**Guardrails**

Workflow 5 must NOT:

• Send reminders via chat  
• Escalate tone or urgency  
• Override client extension choice  
• Start preparation  
• Modify internal preparation status

Workflow 5 controls reminders and extensions only.

---

**Success Criteria**

Workflow 5 is complete when:

• Clients receive predictable, calm reminders  
• Extensions pause all pressure immediately  
• Due dates reset cleanly after filing  
• No duplicate reminders are sent

