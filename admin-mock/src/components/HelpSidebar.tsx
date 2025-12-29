import { usePageHelp } from '../hooks/usePageHelp';
import { useHelp } from '../contexts/HelpContext';
import { Sidebar } from 'primereact/sidebar';

export default function HelpSidebar() {
  const help = usePageHelp();
  const { isOpen, closeHelp } = useHelp();

  if (!help) return null;

  return (
    <Sidebar
      id="help-sidebar"
      visible={isOpen}
      position="right"
      onHide={closeHelp}
      style={{ width: '30rem' }}
      className="w-full md:!w-[30rem]"
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-question-circle text-2xl text-blue-600" />
          <h2 id="help-sidebar-title" className="text-2xl font-bold text-gray-900">Help</h2>
        </div>
      }
      role="complementary"
      aria-labelledby="help-sidebar-title"
    >
      {/* Content */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {help.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {help.description}
          </p>
        </div>

        {/* Plan Sections */}
        {help.planSections.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Plan Document References
            </h4>
            <ul className="space-y-2">
              {help.planSections.map((section, index) => (
                <li key={index} className="flex items-start gap-2">
                  <i className="pi pi-book text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {section}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3 italic">
              Refer to the plan document for detailed specifications.
            </p>
          </div>
        )}

        {/* Key Features */}
        {help.keyFeatures.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Key Features
            </h4>
            <ul className="space-y-2">
              {help.keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <i className="pi pi-check-circle text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Sidebar>
  );
}

