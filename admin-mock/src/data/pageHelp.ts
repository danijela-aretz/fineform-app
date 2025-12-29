// Help content mapping for all pages based on plan document sections

export type PageHelp = {
  title: string;
  description: string;
  planSections: string[];
  keyFeatures: string[];
};

export const pageHelpMap: Record<string, PageHelp> = {
  // Dashboard
  '/': {
    title: 'Internal Dashboard',
    description: 'Operational view of all tax returns with status tracking, blocking indicators, and status transitions. Provides KPIs, charts, and comprehensive entity management for tax season operations.',
    planSections: [
      'Section 2.5: Workflow 6 — Internal Dashboard',
      'Section 1.3: Entity + Tax Year Container',
      'Section 1.7: Canonical Gates (Backend-Owned)'
    ],
    keyFeatures: [
      'Entity list filtered by tax year and status',
      'Ready for prep indicators and blocking reasons',
      'Status transition controls with audit logging',
      'KPIs and charts for operational insights',
      'Extension status tracking'
    ]
  },

  // Clients
  '/clients': {
    title: 'Clients List',
    description: 'View and manage all client entities. Filter by status, account, or tax year. Access individual client detail pages for comprehensive management.',
    planSections: [
      'Section 2.5: Workflow 6 — Internal Dashboard',
      'Section 1.2: Client & Entity Model'
    ],
    keyFeatures: [
      'Entity list with status indicators',
      'Filter by status, account, tax year',
      'Quick access to client detail pages',
      'Export functionality'
    ]
  },

  '/clients/:id': {
    title: 'Client Detail',
    description: 'Comprehensive view of a specific client entity including status, documents, messages, and all tax year operations. Central hub for client management.',
    planSections: [
      'Section 2.5: Workflow 6 — Internal Dashboard',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Entity status and blocking indicators',
      'Quick access to all client sub-pages',
      'Status transition controls',
      'Audit log visibility'
    ]
  },

  // Accounts
  '/accounts': {
    title: 'Accounts Management',
    description: 'Create and manage client accounts (households/organizations). Accounts group related entities together for organizational purposes.',
    planSections: [
      'Section 2.1.1: Accounts Management (CRUD)',
      'Section 1.2: Client & Entity Model'
    ],
    keyFeatures: [
      'Create, edit, and delete accounts',
      'View account details and entity count',
      'Account-based organization'
    ]
  },

  '/accounts/:id': {
    title: 'Account Detail',
    description: 'Detailed view of an account including all associated entities, users, and account information.',
    planSections: [
      'Section 2.1.1: Accounts Management (CRUD)',
      'Section 1.2: Client & Entity Model'
    ],
    keyFeatures: [
      'Account information display',
      'Associated entities list',
      'Account users management'
    ]
  },

  // Entities
  '/entities': {
    title: 'Entities Management',
    description: 'Create and manage client entities (tax filing units). Entities represent individual tax returns and are the core unit for all tax operations.',
    planSections: [
      'Section 2.1.2: Entities Management (CRUD)',
      'Section 1.2: Client & Entity Model',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Create, edit, and delete entities',
      'Entity type and filing status management',
      'Address and contact information',
      'Restricted client flags'
    ]
  },

  '/entities/:id': {
    title: 'Entity Detail',
    description: 'Detailed view of an entity including tax years, status, documents, and all associated operations.',
    planSections: [
      'Section 2.1.2: Entities Management (CRUD)',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Entity information and settings',
      'Tax year status overview',
      'Related documents and operations'
    ]
  },

  // Users
  '/users': {
    title: 'Users & Staff Management',
    description: 'Manage staff members and client users. Assign roles, permissions, and account memberships. Control access to restricted clients.',
    planSections: [
      'Section 2.1.3: Users & Staff Management (CRUD)',
      'Section 1.1: Auth Mirror & Identity Tables',
      'Section 1.4: Permissions & RLS (Critical)'
    ],
    keyFeatures: [
      'Create and manage staff profiles',
      'Assign staff roles (super_admin, admin, staff)',
      'Link client users to accounts',
      'Manage account memberships'
    ]
  },

  '/users/:id': {
    title: 'User Detail',
    description: 'Detailed view of a user or staff member including profile information, roles, permissions, and account memberships.',
    planSections: [
      'Section 2.1.3: Users & Staff Management (CRUD)',
      'Section 1.1: Auth Mirror & Identity Tables'
    ],
    keyFeatures: [
      'User profile information',
      'Role and permission display',
      'Account memberships',
      'Activity history'
    ]
  },

  // Invites
  '/invites': {
    title: 'Tax Season Start Email Control',
    description: 'Control the tax season start email workflow. Select entities, queue invites, send email waves, and track delivery status.',
    planSections: [
      'Section 2.3: Workflow 1 — Invite Control',
      'Section 1.3: Entity + Tax Year Container (Invite State)'
    ],
    keyFeatures: [
      'Entity selection interface',
      'Invite queue management',
      'Send controls (triggers n8n webhook)',
      'Delivery logs and status tracking'
    ]
  },

  // Checklist
  '/checklist': {
    title: 'Checklist Control (Internal)',
    description: 'Upload proforma documents, trigger checklist generation via n8n automation, and manually edit checklist items. Review generated checklists before client access.',
    planSections: [
      'Section 2.4: Workflow 3 — Checklist Control (Internal)',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'Proforma upload interface',
      'Trigger checklist generation (n8n webhook)',
      'Review and edit generated checklist items',
      'Manual checklist editing'
    ]
  },

  // Questionnaire Builder
  '/questionnaire': {
    title: 'Questionnaire Builder',
    description: 'Create and manage questionnaire sections and questions for tax years. Build structured questionnaires that clients will complete.',
    planSections: [
      'Section 2.1.4: Questionnaire Builder (CRUD)',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'Create questionnaire sections',
      'Add and edit questions',
      'Preview client-facing questionnaire',
      'Section ordering and organization'
    ]
  },

  // Permissions
  '/permissions': {
    title: 'Permissions Management',
    description: 'Manage staff access to clients and tax information. Control restricted client ACL, grant tax access permissions, and assign staff to clients.',
    planSections: [
      'Section 2.6: Permissions Management',
      'Section 1.4: Permissions & RLS (Critical)'
    ],
    keyFeatures: [
      'Restricted client ACL management',
      'Tax access grants interface',
      'Staff assignments management',
      'Permission audit logging'
    ]
  },

  // Document Review
  '/document-review': {
    title: 'Document Review',
    description: 'Review documents uploaded by clients, match them to checklist items, view version history, and download documents securely.',
    planSections: [
      'Section 2.7: Document Review',
      'Section 1.5: Folder & Document System'
    ],
    keyFeatures: [
      'Checklist-based document review',
      'Document matching and unmatching',
      'Version history viewing',
      'Secure download (signed URLs)'
    ]
  },

  // Extensions
  '/extensions': {
    title: 'Extensions & Filing Operations',
    description: 'Manage tax return extensions, mark extensions as filed, upload acceptance PDFs, and track extended due dates.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 1.3: Entity + Tax Year Container (Extension State)'
    ],
    keyFeatures: [
      'Mark extension filed interface',
      'Upload acceptance PDF',
      'Due date recalculation display',
      'Extension history tracking'
    ]
  },

  // Tax Returns
  '/tax-returns': {
    title: 'Tax Returns (Client Copy)',
    description: 'Manage published tax returns available to clients. Upload client copies, track publication status, and manage return versions.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 3.8: Client Downloads'
    ],
    keyFeatures: [
      'Tax return upload and management',
      'Client copy publication',
      'Return version tracking',
      'Download tracking'
    ]
  },

  // Messages
  '/messages': {
    title: 'Messaging (Firm Side)',
    description: 'Communicate with clients through in-app messaging. View message threads, reply to clients, and track unread messages. Includes internal notes and SLA tracking.',
    planSections: [
      'Section 2.9: Messaging (Firm Side)',
      'Section 1.9: Messaging Infrastructure'
    ],
    keyFeatures: [
      'Thread list (filtered by permissions)',
      'Reply interface',
      'Unread indicators',
      'Internal notes (staff-only)',
      'SLA tracking (48-hour/72-hour escalation)'
    ]
  },

  // Action Needed
  '/action-needed': {
    title: 'Action Needed Management',
    description: 'View and manage items requiring staff attention. Includes engagement letters, e-file authorizations, and manual tasks. Track completion status.',
    planSections: [
      'Section 2.5: Workflow 6 — Internal Dashboard (Blocking Indicators)',
      'Section 1.7: Canonical Gates (Backend-Owned)'
    ],
    keyFeatures: [
      'Action items dashboard',
      'Filter by action type',
      'Status tracking',
      'Completion management'
    ]
  },

  // Notices
  '/notices': {
    title: 'Tax Notices Management',
    description: 'Manage IRS and state tax notices. Track notice status, assign to staff, and document resolution progress.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Notice list and filtering',
      'Status tracking (new, waiting, in progress, resolved)',
      'Agency identification (IRS/State)',
      'Resolution documentation'
    ]
  },

  // Bulk Import
  '/bulk-import': {
    title: 'Bulk Client Import',
    description: 'Import existing clients in bulk via CSV/Excel. Map columns, validate data, preview imports, and handle import results.',
    planSections: [
      'Section 2.1.5: Bulk Client Import (Existing Clients)',
      'Section 1.2: Client & Entity Model'
    ],
    keyFeatures: [
      'CSV/Excel file upload',
      'Column mapping interface',
      'Data validation and preview',
      'Import results and error handling'
    ]
  },

  // Engagement Letter
  '/engagement-letter': {
    title: 'Engagement Letter Management',
    description: 'Manage engagement letters for tax years. Track signature status, request signatures, send reminders, and view signature history. Supports multi-signer (MFJ) scenarios.',
    planSections: [
      'Section 2.3: Workflow 1 — Invite Control (Engagement State)',
      'Section 1.3: Entity + Tax Year Container (Engagement State)',
      'Section 3.3: Workflow 2 — Engagement Signing'
    ],
    keyFeatures: [
      'Multi-signer view (MFJ support)',
      'Signature status tracking',
      'Request and send interface',
      'Version history',
      'Partial signature handling'
    ]
  },

  // E-File Authorization
  '/efile-authorization': {
    title: 'E-File Authorization Management',
    description: 'Manage e-file authorization signatures. Track signature status, request authorizations, and view signature history.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 1.6: Checklist, Questionnaire & Confirmations',
      'Section 3.7: E-File Authorization'
    ],
    keyFeatures: [
      'Request interface',
      'Signature status tracking',
      'Status display',
      'Signature history'
    ]
  },

  // Document Receipt Confirmation
  '/document-receipt-confirmation': {
    title: 'Document Receipt Confirmation Management',
    description: 'View and manage document receipt confirmations. Record confirmations on behalf of clients and view audit trails.',
    planSections: [
      'Section 2.7: Document Review',
      'Section 1.6: Checklist, Questionnaire & Confirmations',
      'Section 3.6: Document Receipt Confirmation'
    ],
    keyFeatures: [
      'View confirmations',
      'Record on behalf of clients',
      'Audit trail viewing',
      'Status tracking'
    ]
  },

  // ID Information
  '/id-information': {
    title: 'ID Information Management',
    description: 'Request and manage client ID information. View ID status, upload ID images, and track ID validity dates.',
    planSections: [
      'Section 2.6: Permissions Management (Client Management)',
      'Section 1.3: Entity + Tax Year Container (Identification State)'
    ],
    keyFeatures: [
      'Request ID updates',
      'View and edit ID info',
      'Status tracking',
      'Image upload and viewing',
      'Audit trails'
    ]
  },

  // Email Delivery Log
  '/email-delivery-log': {
    title: 'Email Delivery Log',
    description: 'Track email delivery status for invites and reminders. View delivery logs, filter by status, and retry failed deliveries.',
    planSections: [
      'Section 2.3: Workflow 1 — Invite Control',
      'Section 1.10: Reminders & Scheduling State'
    ],
    keyFeatures: [
      'Email delivery status tracking',
      'Filter by status (sent, failed, pending)',
      'Retry failed deliveries',
      'Delivery history'
    ]
  },

  // Reminders
  '/reminders': {
    title: 'Reminder Management',
    description: 'View and manage reminder states for clients. Track reminder types (checklist, engagement, filing readiness), status, and history.',
    planSections: [
      'Section 1.10: Reminders & Scheduling State',
      'Section 2.3: Workflow 1 — Invite Control'
    ],
    keyFeatures: [
      'Reminder states per client',
      'Reminder types and status',
      'History tracking',
      'Manual reminder actions'
    ]
  },

  // Folder Management
  '/folder-management': {
    title: 'Folder and Document Management',
    description: 'Manage system folders and documents. Organize documents, control folder visibility, and manage document versions.',
    planSections: [
      'Section 1.5: Folder & Document System',
      'Section 2.7: Document Review'
    ],
    keyFeatures: [
      'Folder browser for system folders',
      'Document organization',
      'Upload functionality',
      'Folder visibility indicators'
    ]
  },

  // Audit Log
  '/audit-log': {
    title: 'Comprehensive Audit Log',
    description: 'View comprehensive audit logs for status changes, permission changes, and document events. Filter by type, entity, and date range.',
    planSections: [
      'Section 1.11: Audit Logging (Mandatory)',
      'Section 2.5: Workflow 6 — Internal Dashboard'
    ],
    keyFeatures: [
      'Centralized audit log viewer',
      'Filter by audit type, entity, date range',
      'Detailed entry views',
      'Immutable audit trail'
    ]
  },

  // Calendar
  '/calendar': {
    title: 'Calendar & Deadlines',
    description: 'View tax deadlines, extensions, and reminders in calendar format. Track filing deadlines, extension dates, and upcoming reminders.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 1.10: Reminders & Scheduling State'
    ],
    keyFeatures: [
      'Month and list calendar views',
      'Deadline tracking',
      'Extension dates',
      'Reminder scheduling'
    ]
  },

  // Notifications
  '/notifications': {
    title: 'Notifications Center',
    description: 'View all system notifications including messages, return publications, reminders, and action needed items. Filter and manage notification preferences.',
    planSections: [
      'Section 2.9: Messaging (Firm Side)',
      'Section 2.5: Workflow 6 — Internal Dashboard'
    ],
    keyFeatures: [
      'Notification list with filters',
      'Mark as read/unread',
      'Delete notifications',
      'Links to related pages'
    ]
  },

  // Settings
  '/settings': {
    title: 'Settings & Preferences',
    description: 'Manage user profile, notification preferences, display settings, and security options including password changes and two-factor authentication.',
    planSections: [
      'Section 2.2: Authentication & Role Routing',
      'System Configuration'
    ],
    keyFeatures: [
      'Profile information management',
      'Notification preferences',
      'Display preferences (theme, date format)',
      'Security settings (password, 2FA)',
      'Active sessions management'
    ]
  },

  // Client Dashboard Preview
  '/client-dashboard-preview': {
    title: 'Client Dashboard Preview',
    description: 'Preview the mobile client dashboard experience. See how clients view their tax return status, documents, and actions needed.',
    planSections: [
      'Section 3.10: Client-Facing Status (Workflow 7)',
      'Section 3.2: Authentication & Entity Selection'
    ],
    keyFeatures: [
      'Mobile dashboard preview',
      'Tile-based navigation',
      'Status indicators',
      'Action tiles'
    ]
  },

  // Client Pages
  '/clients/:id/checklist': {
    title: 'Client Checklist',
    description: 'Client-facing checklist interface for uploading required documents. View checklist items, upload documents, and track completion status.',
    planSections: [
      'Section 3.4: Workflow 4 — Upload Experience (Critical)',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'Checklist-based upload interface',
      'Multi-file per item support',
      'Camera integration',
      'Upload progress indicators'
    ]
  },

  '/clients/:id/questionnaire': {
    title: 'Client Questionnaire',
    description: 'Client-facing questionnaire interface. Complete tax-related questions organized by sections with progress tracking and draft saving.',
    planSections: [
      'Section 3.5: Questionnaire',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'Section-based questionnaire UI',
      'Progress tracking',
      'Draft save (auto-save)',
      'Submit confirmation'
    ]
  },

  '/clients/:id/engagement-letter': {
    title: 'Client Engagement Letter',
    description: 'View and sign engagement letters. Supports single and multi-signer (MFJ) scenarios with signature capture and status tracking.',
    planSections: [
      'Section 3.3: Workflow 2 — Engagement Signing',
      'Section 1.3: Entity + Tax Year Container (Engagement State)'
    ],
    keyFeatures: [
      'Engagement letter viewing',
      'Signature capture',
      'Multi-signer view (MFJ)',
      'Partial signature status',
      'Document viewer'
    ]
  },

  '/clients/:id/efile-authorization': {
    title: 'Client E-File Authorization',
    description: 'View and sign e-file authorization forms. Required before tax returns can be electronically filed.',
    planSections: [
      'Section 3.7: E-File Authorization',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'E-file authorization viewing',
      'Signature capture',
      'Status display',
      'Submission confirmation'
    ]
  },

  '/clients/:id/document-receipt-confirmation': {
    title: 'Client Document Receipt Confirmation',
    description: 'Confirm receipt of all required documents. Optional confirmation that can be signed to acknowledge document receipt.',
    planSections: [
      'Section 3.6: Document Receipt Confirmation',
      'Section 1.6: Checklist, Questionnaire & Confirmations'
    ],
    keyFeatures: [
      'Confirmation prompt',
      'Signature capture',
      'One signature per year enforcement',
      'Status display'
    ]
  },

  '/clients/:id/accountant-messages': {
    title: 'Client Accountant Messages',
    description: 'Combined view of messages and documents for client communication. Single thread per entity and tax year with real-time updates.',
    planSections: [
      'Section 3.9: Messaging (Client Side)',
      'Section 1.9: Messaging Infrastructure'
    ],
    keyFeatures: [
      'Single thread view (per entity + tax year)',
      'Message list',
      'Compose message',
      'Real-time updates'
    ]
  },

  '/clients/:id/status': {
    title: 'Client Status View',
    description: 'Client-facing status view showing current tax return status with clear messaging. Non-blocking status display that never prevents actions.',
    planSections: [
      'Section 3.10: Client-Facing Status (Workflow 7)',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Status banner/indicator',
      'Clear messaging based on state',
      'Non-blocking display',
      'Action guidance'
    ]
  },

  '/clients/:id/documents': {
    title: 'Client Documents',
    description: 'View and manage uploaded documents. Access documents organized by checklist items and general uploads.',
    planSections: [
      'Section 3.4: Workflow 4 — Upload Experience (Critical)',
      'Section 1.5: Folder & Document System'
    ],
    keyFeatures: [
      'Document list view',
      'Organized by checklist items',
      'Document viewing and download',
      'Upload history'
    ]
  },

  '/clients/:id/messages': {
    title: 'Client Messages',
    description: 'View and send messages to your accountant. Single thread per entity and tax year for streamlined communication.',
    planSections: [
      'Section 3.9: Messaging (Client Side)',
      'Section 1.9: Messaging Infrastructure'
    ],
    keyFeatures: [
      'Message thread view',
      'Send messages',
      'Real-time updates',
      'Message history'
    ]
  },

  '/clients/:id/notices': {
    title: 'Client Tax Notices',
    description: 'View IRS and state tax notices related to your tax returns. Track notice status and resolution progress.',
    planSections: [
      'Section 2.8: Extensions & Filing Operations',
      'Section 1.3: Entity + Tax Year Container'
    ],
    keyFeatures: [
      'Notice list view',
      'Status tracking',
      'Agency identification',
      'Resolution updates'
    ]
  },

  '/clients/:id/profile': {
    title: 'Client Profile',
    description: 'View and manage client profile information including entity details, contact information, and account settings.',
    planSections: [
      'Section 3.2: Authentication & Entity Selection',
      'Section 1.2: Client & Entity Model'
    ],
    keyFeatures: [
      'Profile information display',
      'Entity details',
      'Contact information',
      'Account settings'
    ]
  },

  '/clients/:id/id-info': {
    title: 'Client ID Information',
    description: 'View and update ID information. Upload ID documents and track ID validity status.',
    planSections: [
      'Section 3.2: Authentication & Entity Selection',
      'Section 1.3: Entity + Tax Year Container (Identification State)'
    ],
    keyFeatures: [
      'ID information display',
      'ID image upload',
      'Validity status tracking',
      'Update requests'
    ]
  },

  '/clients/:id/action-needed': {
    title: 'Client Action Needed',
    description: 'View items requiring client action such as signing engagement letters, completing checklists, or providing additional information.',
    planSections: [
      'Section 3.10: Client-Facing Status (Workflow 7)',
      'Section 1.7: Canonical Gates (Backend-Owned)'
    ],
    keyFeatures: [
      'Action items list',
      'Status tracking',
      'Direct links to actions',
      'Completion status'
    ]
  },

  '/clients/:id/tax-returns': {
    title: 'Client Tax Returns',
    description: 'View and download published tax returns. Access client copies of filed tax returns securely.',
    planSections: [
      'Section 3.8: Client Downloads',
      'Section 2.8: Extensions & Filing Operations'
    ],
    keyFeatures: [
      'Tax return list',
      'Secure download (signed URLs)',
      'Return version tracking',
      'Publication status'
    ]
  },

  '/clients/:id/permissions': {
    title: 'Client Permissions',
    description: 'View permissions and access settings for the client entity. See which staff members have access and their roles.',
    planSections: [
      'Section 3.2: Authentication & Entity Selection',
      'Section 1.4: Permissions & RLS (Critical)'
    ],
    keyFeatures: [
      'Permission display',
      'Staff access list',
      'Role information',
      'Access history'
    ]
  },

  // Login
  '/login': {
    title: 'Login',
    description: 'Staff and client authentication. Secure login with role-based access control.',
    planSections: [
      'Section 2.2: Authentication & Role Routing',
      'Section 3.2: Authentication & Entity Selection'
    ],
    keyFeatures: [
      'Email/password authentication',
      'Role-based routing',
      'Session management',
      'Password reset'
    ]
  }
};

// Helper function to get help for a route (handles dynamic routes)
export function getPageHelp(pathname: string): PageHelp | null {
  // Try exact match first
  if (pageHelpMap[pathname]) {
    return pageHelpMap[pathname];
  }

  // Try pattern matching for dynamic routes
  const patterns = Object.keys(pageHelpMap).sort((a, b) => b.length - a.length); // Sort by length (longest first)
  
  for (const pattern of patterns) {
    if (pattern.includes(':')) {
      // Convert pattern to regex
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(pathname)) {
        return pageHelpMap[pattern];
      }
    }
  }

  return null;
}

