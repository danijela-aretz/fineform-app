import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockEntities, statusColors, statusLabels, mockActionsNeeded, mockMessages } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const currentYear = 2023;
  const entities = mockEntities.filter(e => e.taxYear === currentYear);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [readyFilter, setReadyFilter] = useState<string>('all');

  // Calculate KPIs
  const totalEntities = entities.length;
  const readyForPrep = entities.filter(e => e.readyForPrep).length;
  const notReadyForPrep = totalEntities - readyForPrep;
  const inPreparation = entities.filter(e => e.status === 'in_preparation').length;
  const inReview = entities.filter(e => e.status === 'in_review').length;
  const readyToFile = entities.filter(e => e.status === 'ready_to_file').length;
  const filed = entities.filter(e => e.status === 'filed').length;
  const waitingOnDocs = entities.filter(e => e.status === 'waiting_on_documents').length;
  const notStarted = entities.filter(e => e.status === 'not_started').length;
  
  const pendingActions = mockActionsNeeded.filter(a => a.status === 'pending').length;
  const unreadMessages = mockMessages.filter(m => m.unread).length;
  const extensionsRequested = entities.filter(e => e.extensionRequested).length;
  const extensionsFiled = entities.filter(e => e.extensionFiled).length;

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Not Started', value: notStarted, color: '#9CA3AF' },
    { name: 'Waiting on Docs', value: waitingOnDocs, color: '#F59E0B' },
    { name: 'In Preparation', value: inPreparation, color: '#3B82F6' },
    { name: 'In Review', value: inReview, color: '#8B5CF6' },
    { name: 'Ready to File', value: readyToFile, color: '#10B981' },
    { name: 'Filed', value: filed, color: '#059669' },
  ].filter(item => item.value > 0);

  // Status trend over time (mock data for last 7 days)
  const statusTrend = [
    { date: 'Jan 8', notStarted: 5, waitingOnDocs: 3, inPreparation: 2, inReview: 1, readyToFile: 0, filed: 0 },
    { date: 'Jan 9', notStarted: 4, waitingOnDocs: 4, inPreparation: 2, inReview: 1, readyToFile: 0, filed: 0 },
    { date: 'Jan 10', notStarted: 3, waitingOnDocs: 5, inPreparation: 2, inReview: 1, readyToFile: 0, filed: 0 },
    { date: 'Jan 11', notStarted: 2, waitingOnDocs: 5, inPreparation: 3, inReview: 1, readyToFile: 0, filed: 0 },
    { date: 'Jan 12', notStarted: 2, waitingOnDocs: 4, inPreparation: 4, inReview: 1, readyToFile: 0, filed: 0 },
    { date: 'Jan 13', notStarted: 2, waitingOnDocs: 3, inPreparation: 4, inReview: 2, readyToFile: 0, filed: 0 },
    { date: 'Jan 14', notStarted: 1, waitingOnDocs: 3, inPreparation: 4, inReview: 2, readyToFile: 1, filed: 0 },
    { date: 'Jan 15', notStarted: notStarted, waitingOnDocs: waitingOnDocs, inPreparation: inPreparation, inReview: inReview, readyToFile: readyToFile, filed: filed },
  ];

  // Ready for prep breakdown
  const readyForPrepData = [
    { name: 'Ready', value: readyForPrep, color: '#10B981' },
    { name: 'Not Ready', value: notReadyForPrep, color: '#EF4444' },
  ];

  // Filtered entities
  const filteredEntities = entities.filter(entity => {
    if (statusFilter !== 'all' && entity.status !== statusFilter) return false;
    if (readyFilter === 'ready' && !entity.readyForPrep) return false;
    if (readyFilter === 'not_ready' && entity.readyForPrep) return false;
    return true;
  });

  // Gaps Analysis Data
  const gapsAnalysis = [
    {
      category: "Plan Structure Mismatch",
      issues: [
        {
          title: "Help references mention detailed subsections not in main plan",
          description: "Help content references 'Section 2.1.4: Questionnaire Builder (CRUD)' but main plan file doesn't have 2.1.x subsections",
          impact: "May indicate missing detailed plan document or logical groupings not explicitly numbered",
          recommendation: "Verify if detailed plan document exists or clarify plan structure",
          planReference: "Plan file: fine_form_accounting_platform_build_c0b5a3ec.plan.md"
        }
      ]
    },
    {
      category: "Missing Explicit Plan Sections",
      issues: [
        {
          title: "Some pages implemented but not explicitly in Phase 2",
          description: "Pages like Bulk Import, Engagement Letter Management, ID Information Management are implemented but may be implied rather than explicitly listed",
          impact: "Unclear if these are required features or nice-to-haves",
          recommendation: "Verify against detailed plan or confirm with stakeholders",
          planReference: "Phase 2: Admin/Staff App sections"
        }
      ]
    },
    {
      category: "Workflow Completeness",
      issues: [
        {
          title: "Workflow 5 not mentioned",
          description: "Plan mentions 8 workflows total, but only Workflows 1, 2, 3, 4, 6, 7, and 8 are clearly defined. Workflow 5 is missing.",
          impact: "Unclear if Workflow 5 exists, was skipped, or is documented elsewhere",
          recommendation: "Clarify Workflow 5 status or confirm it doesn't exist",
          planReference: "Plan mentions 'all 8 workflows' but only 7 are defined"
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Internal operational view of all tax returns for {currentYear}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Entities</p>
              <p className="text-3xl font-bold mt-2">{totalEntities}</p>
              <p className="text-blue-100 text-xs mt-1">Tax Year {currentYear}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ready for Prep</p>
              <p className="text-3xl font-bold mt-2">{readyForPrep}</p>
              <p className="text-green-100 text-xs mt-1">
                {totalEntities > 0 ? Math.round((readyForPrep / totalEntities) * 100) : 0}% of total
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Action Needed</p>
              <p className="text-3xl font-bold mt-2">{pendingActions}</p>
              <p className="text-yellow-100 text-xs mt-1">Pending items</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Unread Messages</p>
              <p className="text-3xl font-bold mt-2">{unreadMessages}</p>
              <p className="text-purple-100 text-xs mt-1">Require attention</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Gaps Analysis Section */}
      <div className="mb-8">
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <i className="pi pi-info-circle text-2xl text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Mockup Completeness Analysis & Potential Gaps</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The following gaps and questions were identified during our mockup completeness analysis. These items should be clarified before final implementation.
            </p>
            <Accordion>
              {gapsAnalysis.map((category, categoryIndex) => (
                <AccordionTab
                  key={categoryIndex}
                  header={
                    <div className="flex items-center gap-2">
                      <i className="pi pi-exclamation-triangle text-yellow-600" />
                      <span className="font-semibold">{category.category}</span>
                      <span className="text-sm text-gray-500">({category.issues.length} issue{category.issues.length !== 1 ? 's' : ''})</span>
                    </div>
                  }
                >
                  <div className="space-y-4 pt-2">
                    {category.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="border-l-4 border-yellow-400 pl-4 py-2">
                        <h4 className="font-semibold text-gray-900 mb-2">{issue.title}</h4>
                        <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">Impact: </span>
                            <span className="text-gray-700">{issue.impact}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Recommendation: </span>
                            <span className="text-gray-700">{issue.recommendation}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Plan Reference: </span>
                            <span className="text-gray-600 italic">{issue.planReference}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionTab>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ready for Prep Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready for Prep Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={readyForPrepData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {readyForPrepData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Trend Chart */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statusTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="notStarted" stroke="#9CA3AF" name="Not Started" />
            <Line type="monotone" dataKey="waitingOnDocs" stroke="#F59E0B" name="Waiting on Docs" />
            <Line type="monotone" dataKey="inPreparation" stroke="#3B82F6" name="In Preparation" />
            <Line type="monotone" dataKey="inReview" stroke="#8B5CF6" name="In Review" />
            <Line type="monotone" dataKey="readyToFile" stroke="#10B981" name="Ready to File" />
            <Line type="monotone" dataKey="filed" stroke="#059669" name="Filed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Extensions Requested</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{extensionsRequested}</p>
            </div>
            <div className="text-blue-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Extensions Filed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{extensionsFiled}</p>
            </div>
            <div className="text-green-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalEntities > 0 ? Math.round((filed / totalEntities) * 100) : 0}%
              </p>
            </div>
            <div className="text-purple-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Year
            </label>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="not_started">Not Started</option>
              <option value="waiting_on_documents">Waiting on Documents</option>
              <option value="in_preparation">In Preparation</option>
              <option value="in_review">In Review</option>
              <option value="ready_to_file">Ready to File</option>
              <option value="filed">Filed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ready for Prep
            </label>
            <select 
              value={readyFilter}
              onChange={(e) => setReadyFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="ready">Ready</option>
              <option value="not_ready">Not Ready</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entity List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Entities ({filteredEntities.length})
          </h3>
          <Link to="/clients" className="text-sm text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ready for Prep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Extension
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/clients/${entity.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {entity.entityName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.entityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[entity.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[entity.status] || entity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {entity.readyForPrep ? (
                      <span className="badge badge-success">Ready</span>
                    ) : (
                      <div>
                        <span className="badge badge-warning">Not Ready</span>
                        {entity.blockingReasons && entity.blockingReasons.length > 0 && (
                          <div className="text-xs text-red-600 mt-1 break-words max-w-xs">
                            {entity.blockingReasons[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.extensionFiled ? (
                      <span className="badge badge-info">Filed</span>
                    ) : entity.extensionRequested ? (
                      <span className="badge badge-warning">Requested</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/clients/${entity.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedEntity(entity.id);
                        setShowAuditLog(true);
                      }}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      Audit Log
                    </button>
                    {entity.readyForPrep && (
                      <button
                        onClick={() => {
                          setSelectedEntity(entity.id);
                          setShowStatusModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Transition Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      {showStatusModal && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transition Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>in_preparation</option>
                <option>in_review</option>
                <option>ready_to_file</option>
                <option>filed</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Add a reason for this status change..."
              />
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                This change will be logged in the audit trail.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedEntity(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Status transitioned successfully!');
                  setShowStatusModal(false);
                  setSelectedEntity(null);
                }}
                className="btn-primary"
              >
                Transition Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Status History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Old Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      New Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Changed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Jan 15, 2024 10:00 AM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      waiting_on_documents
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      in_preparation
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Admin User
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      All documents received
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Jan 10, 2024 09:00 AM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      not_started
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      waiting_on_documents
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      System
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Checklist created
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowAuditLog(false);
                  setSelectedEntity(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
