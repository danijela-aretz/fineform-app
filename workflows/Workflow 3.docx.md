# Workflow 3 — Checklist Creation

## Purpose

Create, maintain, and manage the document checklist for a client entity and tax year, ensuring that all required documents are clearly identified, collected, tracked, and completed in support of accurate tax preparation.

---

## Trigger

This workflow may be initiated by any of the following: \- Engagement agreement for the client entity and tax year is fully signed \- Staff uploads a proforma return or prior-year tax return \- Staff manually initiates checklist creation from the internal dashboard

---

## Preconditions

* A valid client entity exists

* The tax year is open

* An engagement agreement has been fully executed for the client entity and tax year

---

## Workflow Steps

### 1\. Resolve entity and tax year context

* The system resolves the active workspace using client\_entity\_id and tax\_year

* The system checks for any existing checklist associated with this entity and tax year

---

### 2\. Existing checklist evaluation

* If a checklist already exists for the client entity and tax year:

  * The existing checklist remains the authoritative checklist

  * No duplicate checklist is created

  * The workflow may proceed to refinement or update steps if applicable

---

### 3\. Checklist creation (when none exists)

* If no checklist exists for the client entity and tax year:

  * A new checklist is created automatically

  * The checklist includes a complete baseline set of document categories and checklist items appropriate to the entity type (e.g., individual, business, trust)

---

### 4\. Checklist generation from source documents (when available)

* If a proforma return or prior-year return is available:

  * The system parses the source document

  * Detected forms, schedules, and data elements are used to:

    * Generate checklist items

    * Refine or expand existing checklist categories

    * Identify entity-specific document requirements

---

### 5\. Checklist refinement and staff adjustments

* Internal staff may:

  * Add additional checklist items

  * Remove unnecessary items

  * Modify item descriptions or requirements

* Checklist changes are saved immediately and reflected in the client-facing checklist

---

### 6\. Checklist state management

* Each checklist item maintains its own state, including:

  * required / optional

  * not received / received / under review

* Checklist state persists across sessions for both client and staff

---

### 7\. Checklist persistence and association

* The checklist is stored and permanently associated with:

  * client\_entity\_id

  * tax\_year

* The checklist remains available throughout the lifecycle of the tax engagement

---

## Post-Conditions

* A checklist exists for the client entity and tax year

* The checklist accurately reflects required documentation

* The checklist is available for client uploads and internal review

---

## Explicit Non-Actions

This workflow does not: \- Independently unlock document uploads \- Mark the return as ready for preparation \- Trigger client reminders or internal notifications \- Evaluate overall checklist completeness or readiness