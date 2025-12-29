import { useHelp } from '../contexts/HelpContext';

export default function HelpIcon() {
  const { openHelp, isOpen } = useHelp();

  return (
    <button
      onClick={openHelp}
      className="absolute top-4 right-4 z-10 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Page help"
      aria-expanded={isOpen}
      aria-controls={isOpen ? 'help-sidebar' : undefined}
      role="button"
      title="Help"
    >
      <i className="pi pi-question-circle text-2xl" />
    </button>
  );
}

