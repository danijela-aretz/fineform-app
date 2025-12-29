**Workflow 2 — Engagement Letter**

Status: FINAL · CLEAN · IMPLEMENTATION-READY

**Purpose**

Workflow 2 formally engages Fine Form Accounting for a specific client entity and tax year.  
Its purpose is to:

* Present the engagement letter for the selected entity \+ tax year

* Capture all required client signatures

* Unlock tax-season functionality once engagement is initiated

* Generate and store the final signed engagement letter PDF only when fully executed

* Ensure downstream gates rely on a fully signed engagement

This workflow controls engagement only.  
It does not start preparation or reminders.

---

**Scope**

All behavior in this workflow attaches to:

* client\_entity\_id \+ tax\_year

Each entity is engaged independently, even when multiple entities belong to the same account.

---

**Preconditions**

Before Workflow 2 runs:

* Workflow 1 has created the entity \+ tax year container

* The client can authenticate and access the app

* An engagement letter template exists for the entity type and tax year

---

**Signer Requirements (Locked)**

Signature requirements depend on filing type:

* Single filer or business entity: 1 signature required

* Married Filing Joint (MFJ): 2 signatures required

For MFJ:

* Both spouses must sign

* Signatures may occur in any order

* Signatures may occur at different times

---

**Workflow Behavior**

**Step 1 — Engagement Letter Presentation**

When the client opens the app:

* The engagement letter is displayed in full

* The client can review all terms

* Signature capture is enabled

Client-visible status at this stage:

* Action Required — Please Sign Engagement Letter

---

**Step 2 — First Signature Captured (Unlock Point)**

When the first required signature is captured:

System records:

* Signer identity

* Timestamp

System updates engagement status:

* Single filer or business: fully\_signed

* MFJ: partially\_signed

At this moment, the following modules unlock:

* Document checklist creation (Workflow 3\)

* Document uploads (Workflow 4\)

* Questionnaire

* In-app messaging (Workflow 8\)

Client-visible status updates to:

* Action Required — Please Upload Documents / Complete Questionnaire

This unlock allows progress without waiting for all signatures.

---

**Step 3 — Additional Signature(s) for MFJ**

When the second spouse signs:

* Engagement status updates to fully\_signed

* Signer identity and timestamp are recorded

At this point, engagement is fully executed for MFJ entities.

---

**Engagement PDF Generation (Locked)**

The signed engagement letter PDF is generated only when all required signatures are complete:

* Single filer or business entity: generated immediately after signature

* MFJ entity: generated only after the second signature

The generated PDF is immutable and auditable.

---

**Storage Location**

Once generated, the signed engagement letter PDF is stored in:

* Tax Returns folder for the corresponding entity \+ tax year

The document is client-downloadable.

---

**Downstream Dependency (Critical)**

Internal progression to Ready for Prep requires:

* Engagement status \= fully\_signed

Partial signatures unlock workflow access but do not satisfy the preparation gate.

---

**Guardrails**

Workflow 2 must NOT:

* Start reminders

* Trigger document confirmation

* Require questionnaire completion before uploads

* Require ID information

* Start tax preparation

Workflow 2 controls engagement and controlled unlock only.

---

**Success Criteria**

Workflow 2 is complete when:

* Engagement is initiated and modules are unlocked

* All required signatures are captured

* Engagement status accurately reflects signing state

* Final signed engagement PDF is generated correctly

* The document is stored in Tax Returns and accessible to the client

