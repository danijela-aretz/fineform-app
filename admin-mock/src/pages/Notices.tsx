import { Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { mockNotices } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function Notices() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_on_you':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IRS and State Tax Notices</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage tax notices received from IRS and state agencies
          </p>
        </div>
        <button className="btn-primary">Create Notice</button>
      </div>

      <div className="grid gap-6">
        {mockNotices.map((notice) => (
          <div key={notice.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`badge ${notice.agency === 'irs' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {notice.agency.toUpperCase()}
                  </span>
                  <Link
                    to={`/clients/${notice.entityId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {notice.entityName}
                  </Link>
                  <span className={`badge ${getStatusColor(notice.status)}`}>
                    {getStatusLabel(notice.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Tax Year {notice.taxYear}
                  {notice.noticeNumber && ` - Notice ${notice.noticeNumber}`}
                </h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Tooltip target=".notice-view-client-link" />
                <Link
                  to={`/clients/${notice.entityId}`}
                  className="notice-view-client-link btn-primary text-sm"
                  data-pr-tooltip="View the client detail page for this entity"
                  data-pr-position="top"
                >
                  View Client
                </Link>
                <button className="btn-secondary text-sm">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

