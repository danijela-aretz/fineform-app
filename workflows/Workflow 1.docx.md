# Workflow 1 — Tax Season Start Email \+ App Link

## Purpose

Initiate the tax season for a client by notifying them that their tax preparation process has started and directing them into the FineFormApp.

---

## Trigger

* Tax season is opened for a client entity for a given tax year

* May be triggered:

  * In bulk (firm-initiated tax season launch)

  * Individually (client-specific start)

---

## Preconditions

* A valid client entity exists

* The tax year is configured and open

* The client entity has at least one valid contact email

---

## Workflow Steps

1. **Identify eligible client entities**

   * Each entity is identified by client\_entity\_id and tax\_year

2. **Generate Tax Season Start Email** The email includes:

   * Personalized greeting

   * Notification that tax season has started

   * Secure link to access the FineFormApp

   * High-level explanation of the tax preparation process

   * Instruction that engagement steps must be completed in the app before document uploads are allowed

3. **Send email to client**

   * Email is sent to the primary contact email associated with the client entity

   * Delivery attempt is recorded

4. **Log workflow execution** The system records:

   * client\_entity\_id

   * tax\_year

   * Timestamp of send attempt

   * Delivery status (sent / failed)

---

## Post-Conditions

* Client is informed that the tax season has begun

* Client has an entry point into the FineFormApp

---

## Explicit Non-Actions

This workflow does not: \- Create or execute an engagement agreement \- Unlock document uploads \- Create or expose a document checklist \- Grant internal staff access or visibility \- Trigger reminders, readiness checks, or internal workflows