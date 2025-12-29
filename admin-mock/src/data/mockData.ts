// Mock data for the admin app

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  active: boolean;
}

export interface Account {
  id: string;
  displayName: string;
  createdAt: string;
  entityCount: number;
}

export interface Entity {
  id: string;
  accountId: string;
  accountName: string;
  entityName: string;
  entityType: string;
  taxYear: number;
  status: string;
  readyForPrep: boolean;
  extensionRequested: boolean;
  extensionFiled: boolean;
  blockingReasons?: string[];
  checklistComplete?: boolean;
  questionnaireSubmitted?: boolean;
  idValid?: boolean;
  isRestricted?: boolean;
  bookkeepingEnabled?: boolean;
}

export interface ActionNeeded {
  id: string;
  entityId: string;
  entityName: string;
  actionType: string;
  title: string;
  description: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'dismissed';
}

export interface Message {
  id: string;
  threadId: string;
  senderName: string;
  senderRole: 'client' | 'staff';
  content: string;
  createdAt: string;
  unread: boolean;
}

export interface Notice {
  id: string;
  entityId: string;
  entityName: string;
  agency: 'irs' | 'state';
  taxYear: number;
  noticeNumber?: string;
  status: 'new' | 'waiting_on_you' | 'in_progress' | 'resolved';
  createdAt: string;
}

// Mock data
export const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@fineform.com',
  role: 'admin',
  active: true,
};

export const mockAccounts: Account[] = [
  { id: '1', displayName: 'Smith Family', createdAt: '2023-01-15', entityCount: 2 },
  { id: '2', displayName: 'Johnson Enterprises', createdAt: '2023-02-20', entityCount: 1 },
  { id: '3', displayName: 'Williams LLC', createdAt: '2023-03-10', entityCount: 3 },
];

export const mockEntities: Entity[] = [
  {
    id: '1',
    accountId: '1',
    accountName: 'Smith Family',
    entityName: 'John & Jane Smith - 1040',
    entityType: 'HOUSEHOLD_1040',
    taxYear: 2023,
    status: 'in_preparation',
    readyForPrep: true,
    extensionRequested: false,
    extensionFiled: false,
    checklistComplete: true,
    questionnaireSubmitted: true,
    idValid: true,
  },
  {
    id: '2',
    accountId: '1',
    accountName: 'Smith Family',
    entityName: 'Smith Business LLC',
    entityType: 'LLC',
    taxYear: 2023,
    status: 'waiting_on_documents',
    readyForPrep: false,
    extensionRequested: true,
    extensionFiled: false,
    blockingReasons: ['Checklist incomplete (3 of 5 documents received)', 'Questionnaire not submitted'],
    checklistComplete: false,
    questionnaireSubmitted: false,
    idValid: true,
  },
  {
    id: '3',
    accountId: '2',
    accountName: 'Johnson Enterprises',
    entityName: 'Johnson Corp',
    entityType: 'C_CORP',
    taxYear: 2023,
    status: 'ready_to_file',
    readyForPrep: true,
    extensionRequested: false,
    extensionFiled: false,
    checklistComplete: true,
    questionnaireSubmitted: true,
    idValid: true,
  },
  {
    id: '4',
    accountId: '3',
    accountName: 'Williams LLC',
    entityName: 'Williams Partnership',
    entityType: 'PARTNERSHIP',
    taxYear: 2023,
    status: 'filed',
    readyForPrep: true,
    extensionRequested: false,
    extensionFiled: true,
    checklistComplete: true,
    questionnaireSubmitted: true,
    idValid: true,
  },
];

export const mockActionsNeeded: ActionNeeded[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    actionType: 'sign_engagement_letter',
    title: 'Sign Engagement Letter',
    description: 'Client needs to sign the engagement letter for 2023 tax year',
    status: 'pending',
  },
  {
    id: '2',
    entityId: '2',
    entityName: 'Smith Business LLC',
    actionType: 'checklist_incomplete',
    title: 'Missing Documents',
    description: 'W-2 and 1099 forms are still pending',
    status: 'pending',
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    actionType: 'sign_efile_authorization',
    title: 'Sign E-File Authorization',
    description: 'Return is ready, awaiting e-file authorization signature',
    status: 'pending',
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    threadId: '1',
    senderName: 'John Smith',
    senderRole: 'client',
    content: 'I have a question about my W-2. Should I upload it again?',
    createdAt: '2024-01-15T10:30:00Z',
    unread: true,
  },
  {
    id: '2',
    threadId: '1',
    senderName: 'Admin User',
    senderRole: 'staff',
    content: 'No need to upload again. We have received your W-2 and are processing it.',
    createdAt: '2024-01-15T11:00:00Z',
    unread: false,
  },
  {
    id: '3',
    threadId: '2',
    senderName: 'Jane Johnson',
    senderRole: 'client',
    content: 'When will my return be ready?',
    createdAt: '2024-01-14T14:20:00Z',
    unread: true,
  },
];

export const mockNotices: Notice[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    agency: 'irs',
    taxYear: 2023,
    noticeNumber: 'CP2000',
    status: 'new',
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: '2',
    entityId: '3',
    entityName: 'Johnson Corp',
    agency: 'state',
    taxYear: 2023,
    status: 'waiting_on_you',
    createdAt: '2024-01-12T10:30:00Z',
  },
];

export const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-800',
  waiting_on_documents: 'bg-yellow-100 text-yellow-800',
  in_preparation: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  ready_to_file: 'bg-green-100 text-green-800',
  filed: 'bg-green-200 text-green-900',
};

export const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  waiting_on_documents: 'Waiting on Documents',
  in_preparation: 'In Preparation',
  in_review: 'In Review',
  ready_to_file: 'Ready to File',
  filed: 'Filed',
};

