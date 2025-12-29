---
name: Fine Form Accounting Platform Build
overview: Build a modern accounting and tax operations platform following the authoritative system blueprint. Replace existing Vue.js admin and Flutter client with Next.js admin/staff app and React Native (Expo) client app, built on Supabase backend with n8n automation, organized as a monorepo.
todos:
  - id: phase0-repo-structure
    content: "Set up monorepo structure: create apps/admin, apps/client, supabase/ directories"
    status: pending
  - id: phase0-delete-legacy-code
    content: Delete existing Vue.js admin code (admin/ directory) and Flutter client code (client/ directory)
    status: pending
    dependencies:
      - phase0-repo-structure
  - id: phase0-init-nextjs
    content: Initialize Next.js 16 admin app in apps/admin with TypeScript, Tailwind, Supabase client
    status: pending
    dependencies:
      - phase0-repo-structure
  - id: phase0-init-expo
    content: Initialize Expo React Native app (RN 0.83) in apps/client with TypeScript, Supabase client
    status: pending
    dependencies:
      - phase0-repo-structure
  - id: phase0-supabase-setup
    content: Initialize Supabase CLI, link to existing project, configure local development
    status: pending
    dependencies:
      - phase0-repo-structure
  - id: phase1-auth-tables
    content: Create profiles and staff_profiles tables with RLS policies and triggers
    status: pending
    dependencies:
      - phase0-supabase-setup
  - id: phase1-client-entity-model
    content: Create accounts, account_users, client_entities tables with RLS
    status: pending
    dependencies:
      - phase1-auth-tables
  - id: phase1-entity-tax-year
    content: Create entity_tax_year table with all state fields and compute_ready_for_prep function
    status: pending
    dependencies:
      - phase1-client-entity-model
  - id: phase1-permissions-rls
    content: Create client_acl, client_staff_permissions, client_staff_assignments tables with comprehensive RLS policies
    status: pending
    dependencies:
      - phase1-entity-tax-year
  - id: phase1-folder-documents
    content: Create folders, folder_acl, documents tables with system folder creation function and storage bucket setup
    status: pending
    dependencies:
      - phase1-permissions-rls
  - id: phase1-checklist-questionnaire
    content: Create checklist_items, questionnaire_sections, questionnaire_answers, doc_receipt_confirmations, efile_authorizations tables
    status: pending
    dependencies:
      - phase1-folder-documents
  - id: phase1-messaging
    content: Create message_threads, thread_participants, messages tables with auto-thread creation on entity_tax_year
    status: pending
    dependencies:
      - phase1-checklist-questionnaire
  - id: phase1-audit-logs
    content: Create status_audit_log, permission_audit_log, document_events tables with triggers
    status: pending
    dependencies:
      - phase1-messaging
  - id: phase2-auth-routing
    content: Implement Supabase Auth integration and role-based routing in Next.js admin app
    status: pending
    dependencies:
      - phase0-init-nextjs
      - phase1-auth-tables
  - id: phase2-workflow1-invites
    content: "Build Workflow 1: Entity selection, invite queue, send controls, delivery logs"
    status: pending
    dependencies:
      - phase2-auth-routing
  - id: phase2-workflow3-checklist
    content: "Build Workflow 3: Proforma upload, checklist generation trigger, manual editing"
    status: pending
    dependencies:
      - phase2-workflow1-invites
  - id: phase2-workflow6-dashboard
    content: "Build Workflow 6: Internal dashboard with entity list, status filters, blocking indicators, status transitions"
    status: pending
    dependencies:
      - phase2-workflow3-checklist
  - id: phase2-permissions-ui
    content: "Build permissions management UI: restricted client ACL, tax access grants, staff assignments"
    status: pending
    dependencies:
      - phase2-workflow6-dashboard
  - id: phase2-documents-extensions
    content: Build document review interface and extensions/filing operations UI
    status: pending
    dependencies:
      - phase2-permissions-ui
  - id: phase2-messaging-staff
    content: "Build staff-side messaging: thread list, reply interface, unread indicators"
    status: pending
    dependencies:
      - phase2-documents-extensions
  - id: phase3-auth-entity-selection
    content: Implement authentication and entity selection in React Native client app
    status: pending
    dependencies:
      - phase0-init-expo
      - phase1-auth-tables
  - id: phase3-workflow2-engagement
    content: "Build Workflow 2: Engagement letter view, signature capture (single & MFJ), status display"
    status: pending
    dependencies:
      - phase3-auth-entity-selection
  - id: phase3-workflow4-uploads
    content: "Build Workflow 4: Checklist-based uploads, multi-file support, replace flow, upload queue"
    status: pending
    dependencies:
      - phase3-workflow2-engagement
  - id: phase3-questionnaire
    content: Build questionnaire screens with section progress, draft save, submit
    status: pending
    dependencies:
      - phase3-workflow4-uploads
  - id: phase3-confirmations
    content: Build document receipt confirmation and e-file authorization screens
    status: pending
    dependencies:
      - phase3-questionnaire
  - id: phase3-downloads-messaging
    content: Build client downloads interface and client-side messaging with real-time subscriptions
    status: pending
    dependencies:
      - phase3-confirmations
  - id: phase3-workflow7-status
    content: "Build Workflow 7: Client-facing status messaging (non-blocking banners/indicators)"
    status: pending
    dependencies:
      - phase3-downloads-messaging
---

# Fine Form Accounting Platform - Implementation Plan

## Architecture Overview

**Target Stack:**

- **Backend**: Supabase (PostgreSQL, Auth, RLS, Storage)
- **Admin/Staff/Client Web**: Next.js (replaces Vue.js)
- **Client Mobile**: React Native with Expo (replaces Flutter)
- **Automation**: n8n (existing setup)
- **Structure**: Monorepo

**Core Principles:**

- Backend as source of truth (all logic in Supabase, no frontend duplication)
- Deterministic gates (binary, computable states)
- Client-controlled (non-blocking uploads, messaging always available)
- Audit-safe (immutable audit logs)

---

## Phase 0: Foundation & Repo Setup

### 0.1 Monorepo Structure

Create new directory structure:

```javascript
fineform-app/
├── apps/
│   ├── admin/              # Next.js admin/staff app
│   └── client/             # React Native (Expo) client app
├── packages/               # Shared code (optional)
│   └── shared-types/       # TypeScript types shared between apps
├── supabase/               # Supabase migrations, functions, config
│   ├── migrations/
│   ├── functions/
│   └── config.toml
└── docs/                   # Existing documentation (keep)
```



### 0.2 Delete Existing Code

- Delete `admin/` directory entirely (Vue.js admin)
- Delete `client/` directory entirely (Flutter client)

### 0.3 Initialize Next.js Admin App

- Create `apps/admin/` with Next.js 16 (App Router)
- Configure TypeScript, Tailwind CSS
- Set up Supabase client library
- Configure environment variables structure

### 0.4 Initialize React Native Client App

- Create `apps/client/` with Expo (latest SDK compatible with React Native 0.83)
- Configure TypeScript
- Set up Supabase client library
- Configure environment variables

### 0.5 Supabase Project Setup

- Initialize Supabase CLI in `supabase/`
- Link to existing Supabase project
- Configure local development environment
- Set up migration structure

### 0.6 Development Environment

- Configure package.json workspaces (if using npm/yarn/pnpm)
- Set up environment variable templates
- Configure gitignore for all apps
- Document local development setup

---

## Phase 1: Backend Core (Supabase = System of Record)

**Critical**: All logic must live in the backend. No frontend may compute readiness, permissions, or gates.

### 1.1 Auth Mirror & Identity Tables

**Tables:**

- `profiles` (mirrors auth.users)
- `id` (UUID, FK to auth.users)
- `user_type` (enum: staff | client)
- `full_name`, `email`, `active`
- `staff_profiles`
- `user_id` (FK → profiles)
- `staff_role` (enum: super_admin | admin | staff)
- `staff_team_reporting` (fine_form | fin_group - reporting only)
- `job_title`, `active`

**RLS Policies:**

- Users can read their own profile
- Staff can read profiles based on permissions
- Super admins can read all profiles

**Database Functions:**

- Trigger to auto-create profile on auth.users insert
- Function to enforce one profile per auth user

### 1.2 Client & Entity Model

**Tables:**

- `accounts` (households/organizations)
- `id`, `display_name`, `created_at`, `updated_at`
- `account_users` (links users to accounts)
- `account_id`, `user_id`, `client_role` (enum: admin | assistant)
- `client_entities` (tax filing units)
- `id`, `account_id`, `entity_name`, `entity_type`, `is_restricted`, `active`

**RLS Policies:**

- Clients can read their own account and entities
- Staff visibility controlled by permissions (see 1.4)

**Critical Rule**: All tax workflows attach to `client_entity_id + tax_year`, never to account alone.

### 1.3 Entity + Tax Year Container

**Table: `entity_tax_year`** (core container)**Core Identity:**

- `client_entity_id`, `tax_year` (composite unique)

**Invite State:**

- `tax_return_expected` (boolean)
- `invite_status` (enum: queued | sent | failed)
- `invite_sent_at`, `attempt_count`, `last_error`

**Engagement State:**

- `engagement_status` (enum: not_started | partially_signed | fully_signed)
- `engagement_signed_at`, `signer_metadata` (JSONB)

**Document State:**

- `docs_required_count`, `docs_received_count`
- `checklist_complete_at`

**Confirmation State:**

- `doc_confirmation_status` (enum: not_signed | signed)
- `doc_confirmation_signed_at`

**Questionnaire State:**

- `questionnaire_status` (enum: not_started | in_progress | completed)
- `questionnaire_completed_at`

**Identification State:**

- `id_status` (enum: not_provided | valid | expired)
- `id_valid_until`

**Extension State:**

- `extension_requested` (boolean), `extension_filed` (boolean)
- `extended_due_date`

**Internal Status:**

- `internal_status` (enum: see Workflow 6)

**Preparation Gate (Materialized):**

- `ready_for_prep` (boolean) - **MUST be computed in database function**

**Database Function: `compute_ready_for_prep(entity_tax_year_id)`**

- Checks: engagement fully signed, checklist complete, doc confirmation signed, questionnaire submitted, ID valid
- Updates `ready_for_prep` column
- Called via trigger on state changes

### 1.4 Permissions & RLS (Critical)

**Tables:**

- `client_acl` (restricted client access)
- `client_entity_id`, `staff_user_id`
- `client_staff_permissions` (tax visibility)
- `client_entity_id`, `staff_user_id`, `can_see_taxes` (boolean)
- `client_staff_assignments` (operational only)
- `client_entity_id`, `staff_user_id`, `role_on_client`, `active`

**RLS Policies (Enforced Everywhere):**

- Restricted clients: Only super_admin visible by default, unless explicit ACL entry
- Tax visibility: Hidden from staff by default
- super_admin → always allowed
- admin → allowed by default
- staff → only if explicitly granted
- Assignments: Control dashboard visibility, NEVER grant permissions

**Database Functions:**

- `check_staff_can_view_client(staff_user_id, client_entity_id)` → boolean
- `check_staff_can_see_taxes(staff_user_id, client_entity_id)` → boolean

### 1.5 Folder & Document System

**Tables:**

- `folders`
- `id`, `client_entity_id`, `name`, `parent_id`, `is_system`
- Visibility flags: `client_visible`, `staff_only`, `admin_only`, `super_admin_only`, `restricted_acl`
- `folder_acl` (for restricted clients)
- `folder_id`, `staff_user_id`
- `documents`
- `id`, `client_entity_id`, `folder_id`, `storage_path`, `display_name`
- `uploaded_by`, `created_at`, `updated_at`

**Storage:**

- Supabase Storage bucket: `client-files`
- Path enforced: `{client_entity_id}/{folder_id}/{filename}`
- RLS policies on bucket

**System Folders (Auto-created per entity):**

- Current Year, Work Folder, Bank Accounts, Credit Cards, Payroll, Reports, Assets, Corporate Docs, Past Years, Share Folder (From Client / To Client), Admin (admin_only), Super Admin (super_admin_only)

**Database Function:**

- `create_system_folders(client_entity_id)` - called on entity creation

### 1.6 Checklist, Questionnaire & Confirmations

**Tables:**

- `checklist_items`
- `id`, `entity_tax_year_id`, `item_name`, `description`, `status` (enum: pending | received | n_a)
- `created_at`, `updated_at`
- `checklist_item_files` (links documents to items)
- `checklist_item_id`, `document_id`
- `questionnaire_sections`
- `id`, `entity_tax_year_id`, `section_name`, `order`, `active`
- `questionnaire_answers`
- `id`, `section_id`, `question_key`, `answer_value` (JSONB), `answered_at`
- `doc_receipt_confirmations`
- `id`, `entity_tax_year_id`, `signed_at`, `signed_by`, `signature_data` (JSONB)
- `efile_authorizations`
- `id`, `entity_tax_year_id`, `signed_at`, `signed_by`, `signature_data` (JSONB)

**Database Functions:**

- `compute_checklist_completeness(entity_tax_year_id)` → updates `docs_required_count`, `docs_received_count`, `checklist_complete_at`
- Trigger on checklist_item status changes

### 1.7 Canonical Gates (Backend-Owned)

**Database Function: `compute_ready_for_prep(entity_tax_year_id)`**Logic:

1. Engagement fully signed? (`engagement_status = 'fully_signed'`)
2. Checklist complete? (`checklist_complete_at IS NOT NULL`)
3. Document receipt confirmation signed? (`doc_confirmation_status = 'signed'`)
4. Questionnaire submitted? (`questionnaire_status = 'completed'`)
5. ID valid? (`id_status = 'valid' AND id_valid_until > NOW()`)

All true → `ready_for_prep = true`**Trigger:** Automatically called on any state change affecting readiness.

### 1.8 Workflow Enums & Status Logic

**Internal Status Enum** (Workflow 6):

- `not_started`, `waiting_on_documents`, `in_preparation`, `in_review`, `ready_to_file`, `filed`

**Client Status Mapping** (Workflow 7):

- Database function: `get_client_status(entity_tax_year_id)` → returns status string
- Logic based on checklist, preparation state, filing state

### 1.9 Messaging Infrastructure

**Tables:**

- `message_threads`
- `id`, `client_entity_id`, `tax_year`, `created_at`
- Unique constraint: `(client_entity_id, tax_year)`
- `thread_participants`
- `thread_id`, `user_id`, `role` (enum: client | staff), `added_at`
- `messages`
- `id`, `thread_id`, `sender_id`, `content`, `created_at`, `deleted_at` (soft delete)

**Rules:**

- One thread per entity + tax year (created automatically on entity_tax_year creation)
- Messaging always available, never gated
- Participants determined by permissions (see Workflow 8)

**RLS Policies:**

- Clients can read/write messages in their entity threads
- Staff can read/write messages in threads where they are participants (based on permissions)

**Database Function:**

- `ensure_message_thread(client_entity_id, tax_year)` - called on entity_tax_year creation

### 1.10 Reminders & Scheduling State

**Table: `reminder_state`**

- `id`, `entity_tax_year_id`, `reminder_type` (enum: checklist | engagement | filing_readiness)
- `last_sent_at`, `next_scheduled_at`, `suppressed_until`
- `sent_count`, `suppression_reason`

**Rules:**

- Deterministic scheduling (no duplicate sends)
- Suppression based on state changes

### 1.11 Audit Logging (Mandatory)

**Tables:**

- `status_audit_log`
- `id`, `entity_tax_year_id`, `old_status`, `new_status`, `changed_by`, `changed_at`, `reason`
- `permission_audit_log`
- `id`, `client_entity_id`, `staff_user_id`, `action` (enum: granted | revoked), `changed_by`, `changed_at`
- `document_events`
- `id`, `document_id`, `event_type` (enum: uploaded | replaced | deleted | downloaded), `user_id`, `timestamp`, `metadata` (JSONB)

**Rules:**

- All tables immutable (no updates/deletes)
- Triggers on critical state changes

### Phase 1 Exit Criteria

- ✅ All tables created with proper constraints
- ✅ All RLS policies tested and enforced
- ✅ All database functions implemented and tested
- ✅ `ready_for_prep` computed correctly in backend
- ✅ No logic exists in frontend that should be in backend
- ✅ Audit logging captures all critical events

---

## Phase 2: Admin / Staff App (Next.js)

### 2.1 Project Setup

- Initialize Next.js 16 in `apps/admin/`
- Configure App Router, TypeScript, Tailwind CSS
- Set up Supabase client (server and client components)
- Configure authentication middleware

### 2.2 Authentication & Role Routing

- Implement Supabase Auth integration
- Create role-based route protection
- Build login page
- Implement session management
- Handle restricted client visibility

### 2.3 Workflow 1 — Invite Control

**Pages/Components:**

- Entity selection interface
- Invite queue dashboard
- Invite send controls (triggers n8n webhook)
- Delivery logs view

**API Routes:**

- `POST /api/invites/send` - triggers n8n webhook
- `GET /api/invites/status` - checks delivery status

### 2.4 Workflow 3 — Checklist Control (Internal)

**Pages/Components:**

- Proforma upload interface
- Trigger checklist generation (n8n webhook)
- Review generated checklist items
- Manual checklist editing

**API Routes:**

- `POST /api/checklist/generate` - triggers n8n parsing
- `PUT /api/checklist/items/:id` - update checklist item

### 2.5 Workflow 6 — Internal Dashboard

**Pages/Components:**

- Main dashboard: Entity list by tax year
- Status filters (internal_status, ready_for_prep)
- Blocking indicators (shows why not ready)
- Status transition controls (only when `ready_for_prep = true`)
- Audit log visibility

**API Routes:**

- `GET /api/dashboard/entities` - filtered, paginated list
- `PUT /api/entities/:id/status` - update internal_status (with validation)

### 2.6 Permissions Management

**Pages/Components:**

- Restricted client ACL management
- Tax access grants interface
- Staff assignments interface

**API Routes:**

- `POST /api/permissions/grant` - grant tax access
- `POST /api/permissions/assign` - assign staff to client

### 2.7 Document Review

**Pages/Components:**

- Checklist-based document review
- Document version history
- Secure download (via Supabase Storage signed URLs)

**API Routes:**

- `GET /api/documents/:id/download` - generates signed URL

### 2.8 Extensions & Filing Operations

**Pages/Components:**

- Mark extension filed interface
- Upload acceptance PDF
- Due date recalculation display

**API Routes:**

- `PUT /api/entities/:id/extension` - mark extension filed

### 2.9 Messaging (Firm Side)

**Pages/Components:**

- Thread list (filtered by permissions)
- Reply interface
- Unread indicators

**API Routes:**

- `GET /api/messages/threads` - list threads (permission-filtered)
- `POST /api/messages/send` - send message

### Phase 2 Exit Criteria

- ✅ Staff can operate without spreadsheets
- ✅ Internal status reflects reality
- ✅ Permissions fully enforced via RLS
- ✅ All workflows 1, 3, 6 functional

---

## Phase 3: Client App (React Native / Expo)

### 3.1 Project Setup

- Initialize Expo app in `apps/client/`
- Configure TypeScript
- Set up Supabase client
- Configure authentication

### 3.2 Authentication & Entity Selection

**Screens:**

- Login screen
- Entity switcher (if multiple entities)
- Tax year home screen

### 3.3 Workflow 2 — Engagement Signing

**Screens:**

- Engagement letter view
- Signature capture (single & MFJ)
- Partial signature handling
- Status display

**API Integration:**

- `GET /api/engagement/letter` - fetch letter
- `POST /api/engagement/sign` - submit signature

### 3.4 Workflow 4 — Upload Experience (Critical)

**Screens:**

- Checklist-based upload interface
- General upload fallback
- Multi-file per item support
- Replace flow (with confirmation)
- Upload queue & retry logic

**Features:**

- Camera integration for mobile
- File picker
- Progress indicators
- Offline queue (if needed)

**API Integration:**

- Direct Supabase Storage uploads (with RLS)
- `POST /api/documents/match` - attempt checklist matching

### 3.5 Questionnaire

**Screens:**

- Section-based questionnaire UI
- Progress tracking
- Draft save (auto-save)
- Submit confirmation

**API Integration:**

- `GET /api/questionnaire/sections` - fetch sections
- `PUT /api/questionnaire/answers` - save draft
- `POST /api/questionnaire/submit` - final submit

### 3.6 Document Receipt Confirmation

**Screens:**

- Prompt at checklist completion
- Signature capture
- One signature per year enforcement

**API Integration:**

- `POST /api/confirmations/doc-receipt` - submit confirmation

### 3.7 E-File Authorization

**Screens:**

- Prompt after draft upload
- Signature capture

**API Integration:**

- `POST /api/authorizations/efile` - submit authorization

### 3.8 Client Downloads

**Screens:**

- Tax Returns access list
- Secure download (via signed URLs)

### 3.9 Messaging (Client Side)

**Screens:**

- Single thread view (per entity + tax year)
- Message list
- Compose message
- Notifications integration

**API Integration:**

- Real-time subscriptions via Supabase Realtime
- `POST /api/messages/send` - send message

### 3.10 Client-Facing Status (Workflow 7)

**Screens:**

- Status banner/indicator
- Clear messaging based on state
- Non-blocking (never prevents actions)

**API Integration:**

- `GET /api/status/client` - fetch computed client status

### Phase 3 Exit Criteria

- ✅ Mobile uploads reliable
- ✅ Client status always clear
- ✅ No blocked clients without explanation
- ✅ All workflows 2, 4, 7, 8 functional

---

## Phase 4: Hardening & Launch

### 4.1 End-to-End Testing

- Test all 8 workflows end-to-end
- Test RLS policies (penetration testing)
- Test reminder duplication prevention
- Test upload stress scenarios
- Validate audit logs

### 4.2 Performance Optimization

- Database query optimization
- Frontend bundle optimization
- Image/document optimization
- Caching strategies

### 4.3 Security Audit

- RLS policy review
- Authentication flow review
- API endpoint security
- Storage bucket security

### 4.4 Documentation

- API documentation
- Deployment guides
- User guides (staff and client)
- Troubleshooting guides

---

## Implementation Notes

### Technology Choices

- **Next.js**: App Router, Server Components for admin efficiency
- **React Native/Expo**: Managed workflow, easy deployment
- **Supabase**: PostgreSQL with RLS, Auth, Storage, Realtime
- **n8n**: Webhook-based integration for automation

### Key Constraints

1. **No frontend logic duplication** - All gates computed in database
2. **RLS everywhere** - Never trust frontend for permissions
3. **Non-blocking** - Clients can always upload and message
4. **Audit-safe** - Every critical action logged

### Migration Strategy

- Delete existing Vue.js admin code (`admin/` directory)
- Delete existing Flutter client code (`client/` directory)
- Build new apps from scratch following blueprint

### Environment Variables

```javascript
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# n8n
N8N_WEBHOOK_URL=

# App URLs
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_CLIENT_WEB_URL=
```

---

## Next Steps

1. **Confirm Supabase credentials** - Need project URL and keys
2. **Confirm n8n webhook endpoints** - For invite sending, checklist generation
3. **Review and approve plan** - Any adjustments needed?
4. **Begin Phase 0** - Set up monorepo structure