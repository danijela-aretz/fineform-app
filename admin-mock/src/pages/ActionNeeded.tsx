import { Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { mockActionsNeeded } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function ActionNeeded() {
  const pendingActions = mockActionsNeeded.filter(a => a.status === 'pending');

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'sign_engagement_letter':
        return 'bg-blue-100 text-blue-800';
      case 'sign_efile_authorization':
        return 'bg-green-100 text-green-800';
      case 'checklist_incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'sign_engagement_letter':
        return 'Engagement Letter';
      case 'sign_efile_authorization':
        return 'E-File Authorization';
      case 'checklist_incomplete':
        return 'Missing Documents';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Action Needed</h1>
        <p className="mt-2 text-sm text-gray-600">
          All pending client actions requiring attention
        </p>
      </div>

      <div className="grid gap-6">
        {pendingActions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No pending actions at this time.</p>
          </div>
        ) : (
          pendingActions.map((action) => (
            <div key={action.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${getActionTypeColor(action.actionType)}`}>
                      {getActionTypeLabel(action.actionType)}
                    </span>
                    <Link
                      to={`/clients/${action.entityId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {action.entityName}
                    </Link>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {action.description}
                  </p>
                  {action.dueDate && (
                    <p className="text-xs text-gray-500">
                      Due: {new Date(action.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Tooltip target=".action-view-client-link" />
                  <Link
                    to={`/clients/${action.entityId}`}
                    className="action-view-client-link btn-primary text-sm"
                    data-pr-tooltip="View the client detail page for this entity"
                    data-pr-position="top"
                  >
                    View Client
                  </Link>
                  <button className="btn-secondary text-sm">
                    Mark Complete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

