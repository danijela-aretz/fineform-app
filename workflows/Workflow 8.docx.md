**Workflow 8 — In-App Messaging**

**Status: FINAL · CLEAN · IMPLEMENTATION-READY**

---

**Purpose**

Workflow 8 defines how clients and the firm communicate during and after tax season.

Its purpose is to:

• Provide a single, reliable communication channel inside the app  
• Reduce reliance on scattered email threads  
• Ensure no client messages are missed  
• Preserve a complete, auditable communication history

Messaging supports workflows.  
It never drives or enforces workflow state.

---

**Scope**

All messaging behavior attaches to:

client\_entity\_id \+ tax\_year

Each entity and tax year has its own dedicated message thread.

---

**Messaging Thread Model (Locked)**

• One messaging thread exists per entity per tax year  
• The thread is created when the first engagement signature is captured  
• The thread remains active throughout the tax year

At year end:

• The thread is archived  
• Archived threads are read-only  
• Prior-year threads remain accessible for reference

This preserves history while keeping the current year focused.

---

**Participants (Year 1\)**

Clients:

• Taxpayer  
• Spouse (for MFJ returns)

Firm users:

• super\_admin  
• admin  
• Idir

The system supports adding additional staff in the future without redesign.

---

**Who Can Send Messages**

• Clients may send messages to the firm at any time  
• super\_admin, admin, and Idir may send messages to clients at any time

Messaging permissions are explicit and auditable.

---

**What Messaging Is Used For**

Messaging is used for:

• Client questions  
• Clarifications  
• Firm responses  
• Ongoing communication during and after tax season

---

**What Messaging Is NOT Used For**

Messaging is not used for:

• Document uploads  
• Status changes  
• Reminder delivery  
• Workflow enforcement  
• Internal-only notes

Those functions belong to other workflows.

---

**System Events & Messaging Separation**

System-generated events do not appear in chat threads.

Examples include:

• Documents received  
• Extension filed  
• Return filed

System events appear in dashboards and notifications, not in chat.

---

**Message Notifications**

**In-App Notifications**

• Unread message badge  
• Clear visual indicators for new messages

---

**Email Notifications**

• Every new message triggers an email notification  
• Email includes a short preview and a link to the app  
• Emails are sent from a dedicated messaging address

This ensures messages are not missed.

---

**Response Monitoring**

If a client sends a message and no firm response occurs within a configured time window:

• Internal notification is sent to admin and Idir

Clients never see response timers or escalations.

---

**Messaging During Extensions**

When an entity is on extension:

• Messaging continues normally  
• Extension banner remains visible  
• No messaging restrictions apply

---

**Post-Filing Messaging**

After status \= Filed:

• Messaging remains open year-round  
• Clients may ask questions or receive notices  
• Communication history is preserved

---

**Audit & Data Integrity**

• All messages are timestamped  
• Sender identity is recorded  
• Messages support soft delete only  
• Full message history is retained

---

**Guardrails**

Workflow 8 must NOT:

• Replace reminders  
• Trigger status changes  
• Enforce workflow gates  
• Serve as internal notes

Workflow 8 controls communication only.

---

**Success Criteria**

Workflow 8 is complete when:

• Clients communicate reliably in-app  
• Firm users are notified immediately  
• No messages are lost in email  
• Communication history is preserved year over year

