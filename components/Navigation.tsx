
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Section } from '../types';

interface NavigationProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="bg-bg-secondary-light dark:bg-bg-secondary-dark border-b border-border-light dark:border-border-dark py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5
                ${activeSection === item.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-card-bg-light dark:bg-card-bg-dark text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
