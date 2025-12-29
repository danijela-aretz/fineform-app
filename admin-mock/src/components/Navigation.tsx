import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { mockUser, mockActionsNeeded, mockMessages } from '../data/mockData';
import Notifications from './Notifications';
import GlobalSearch from './GlobalSearch';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface MenuItem {
  label: string;
  icon?: string;
  command?: () => void;
  items?: MenuItem[];
  badge?: number;
  visible?: boolean;
}

export default function Navigation() {
  const navigate = useNavigate();

  const unreadMessages = mockMessages.filter(m => m.unread).length;
  const pendingActions = mockActionsNeeded.filter(a => a.status === 'pending').length;

  const menuItems: MenuItem[] = [
    {
      label: 'Data Management',
      icon: 'pi pi-database',
      items: [
        {
          label: 'Clients',
          icon: 'pi pi-users',
          command: () => navigate('/clients'),
        },
        {
          label: 'Accounts',
          icon: 'pi pi-building',
          command: () => navigate('/accounts'),
          visible: mockUser.role === 'super_admin' || mockUser.role === 'admin',
        },
        {
          label: 'Entities',
          icon: 'pi pi-sitemap',
          command: () => navigate('/entities'),
          visible: mockUser.role === 'super_admin' || mockUser.role === 'admin',
        },
        {
          label: 'Users & Staff',
          icon: 'pi pi-user',
          command: () => navigate('/users'),
          visible: mockUser.role === 'super_admin',
        },
        {
          label: 'Bulk Import',
          icon: 'pi pi-upload',
          command: () => navigate('/bulk-import'),
          visible: mockUser.role === 'super_admin' || mockUser.role === 'admin',
        },
      ],
    },
    {
      label: 'Tax Operations',
      icon: 'pi pi-file',
      items: [
        {
          label: 'Tax Season Start',
          icon: 'pi pi-send',
          command: () => navigate('/invites'),
        },
        {
          label: 'Checklist Control',
          icon: 'pi pi-list-check',
          command: () => navigate('/checklist'),
        },
        {
          label: 'Questionnaire Builder',
          icon: 'pi pi-question-circle',
          command: () => navigate('/questionnaire'),
          visible: mockUser.role === 'super_admin' || mockUser.role === 'admin',
        },
        {
          label: 'Tax Returns',
          icon: 'pi pi-file-pdf',
          command: () => navigate('/tax-returns'),
        },
        {
          label: 'Extensions',
          icon: 'pi pi-calendar',
          command: () => navigate('/extensions'),
        },
      ],
    },
    {
      label: 'Communication',
      icon: 'pi pi-comments',
      badge: unreadMessages + pendingActions,
      items: [
        {
          label: 'Messages',
          icon: 'pi pi-envelope',
          badge: unreadMessages,
          command: () => navigate('/messages'),
        },
        {
          label: 'Action Needed',
          icon: 'pi pi-exclamation-triangle',
          badge: pendingActions,
          command: () => navigate('/action-needed'),
        },
        {
          label: 'Tax Notices',
          icon: 'pi pi-bell',
          command: () => navigate('/notices'),
        },
      ],
    },
    {
      label: 'Documents',
      icon: 'pi pi-folder',
      items: [
        {
          label: 'Document Review',
          icon: 'pi pi-eye',
          command: () => navigate('/document-review'),
        },
        {
          label: 'Folder Management',
          icon: 'pi pi-folder-open',
          command: () => navigate('/folder-management'),
        },
        {
          label: 'Engagement Letters',
          icon: 'pi pi-file-edit',
          command: () => navigate('/engagement-letter'),
        },
        {
          label: 'E-File Authorization',
          icon: 'pi pi-pencil',
          command: () => navigate('/efile-authorization'),
        },
        {
          label: 'Doc Receipt Confirmation',
          icon: 'pi pi-check-circle',
          command: () => navigate('/document-receipt-confirmation'),
        },
      ],
    },
    {
      label: 'System',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Calendar & Deadlines',
          icon: 'pi pi-calendar',
          command: () => navigate('/calendar'),
        },
        {
          label: 'Notifications',
          icon: 'pi pi-bell',
          command: () => navigate('/notifications'),
        },
        {
          label: 'ID Information',
          icon: 'pi pi-id-card',
          command: () => navigate('/id-information'),
        },
        {
          label: 'Permissions',
          icon: 'pi pi-shield',
          command: () => navigate('/permissions'),
          visible: mockUser.role === 'super_admin',
        },
        {
          label: 'Email Delivery Log',
          icon: 'pi pi-send',
          command: () => navigate('/email-delivery-log'),
        },
        {
          label: 'Reminders',
          icon: 'pi pi-clock',
          command: () => navigate('/reminders'),
        },
        {
          label: 'Audit Log',
          icon: 'pi pi-history',
          command: () => navigate('/audit-log'),
          visible: mockUser.role === 'super_admin' || mockUser.role === 'admin',
        },
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          command: () => navigate('/settings'),
        },
      ],
    },
    {
      label: 'Client View',
      icon: 'pi pi-mobile',
      items: [
        {
          label: 'Dashboard Preview',
          icon: 'pi pi-home',
          command: () => navigate('/client-dashboard-preview'),
        },
        {
          label: 'Checklist',
          icon: 'pi pi-list',
          command: () => navigate('/clients/1/checklist'),
        },
        {
          label: 'Questionnaire',
          icon: 'pi pi-question',
          command: () => navigate('/clients/1/questionnaire'),
        },
        {
          label: 'Engagement Letter',
          icon: 'pi pi-file',
          command: () => navigate('/clients/1/engagement-letter'),
        },
        {
          label: 'E-File Authorization',
          icon: 'pi pi-pencil',
          command: () => navigate('/clients/1/efile-authorization'),
        },
        {
          label: 'Doc Receipt Confirmation',
          icon: 'pi pi-check',
          command: () => navigate('/clients/1/document-receipt-confirmation'),
        },
        {
          label: 'Accountant Messages',
          icon: 'pi pi-comments',
          command: () => navigate('/clients/1/accountant-messages'),
        },
        {
          label: 'Status View',
          icon: 'pi pi-info-circle',
          command: () => navigate('/clients/1/status'),
        },
      ],
    },
  ].filter(item => {
    if ('visible' in item && item.visible === false) {
      return false;
    }
    return true;
  }) as MenuItem[];

  // Filter menu items based on role and visibility
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        if (item.visible === false) return false;
        // Filter based on role if needed
        return true;
      })
      .map(item => ({
        ...item,
        items: item.items ? filterMenuItems(item.items.filter(subItem => subItem.visible !== false)) : undefined,
      }));
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  // Add badge counts to labels (PrimeReact Menubar doesn't support JSX in labels easily)
  const menuItemsWithBadges = filteredMenuItems.map(item => {
    const labelWithBadge = item.badge !== undefined && item.badge > 0
      ? `${item.label} (${item.badge})`
      : item.label;
    
    return {
      ...item,
      label: labelWithBadge,
      items: item.items ? item.items.map(subItem => {
        const subLabelWithBadge = subItem.badge !== undefined && subItem.badge > 0
          ? `${subItem.label} (${subItem.badge})`
          : subItem.label;
        return {
          ...subItem,
          label: subLabelWithBadge,
        };
      }) : undefined,
    };
  });

  const start = (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    >
      <i className="pi pi-building text-2xl text-blue-600" />
      <span className="text-xl font-bold text-blue-600">FineForm</span>
    </div>
  );

  const end = (
    <div className="flex items-center gap-4">
      <div className="hidden md:block w-64">
        <GlobalSearch />
      </div>
      <Notifications />
      <div className="flex items-center gap-2">
        <i className="pi pi-user text-gray-600" />
        <span className="text-sm text-gray-700">
          {mockUser.name} ({mockUser.role.replace('_', ' ')})
        </span>
      </div>
      <button
        onClick={() => navigate('/login')}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
        title="Logout"
      >
        <i className="pi pi-sign-out" />
      </button>
    </div>
  );

  return (
    <Menubar
      model={menuItemsWithBadges}
      start={start}
      end={end}
      className="border-b border-gray-200 bg-white"
    />
  );
}
