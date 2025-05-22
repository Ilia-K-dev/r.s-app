import React, { useState } from 'react';

/**
 * @typedef {object} Tab
 * @property {string} label - The label text for the tab.
 * @property {React.ReactNode} content - The content to display when this tab is active.
 */

/**
 * @typedef {object} TabsProps
 * @property {Tab[]} tabs - An array of tab objects defining the tabs and their content.
 * @property {function(number): void} [onTabChange] - Optional callback function to be called when the active tab changes. Receives the index of the new active tab.
 * @property {number} [initialTab=0] - The index of the tab to be active initially.
 */

/**
 * @desc A reusable Tabs UI component for displaying content in tabbed sections.
 * Allows switching between different content panels by clicking on tab headers.
 * @param {TabsProps} props - The component props.
 * @returns {JSX.Element} - The rendered Tabs component.
 */
export const Tabs = ({ tabs, onTabChange, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  /**
   * @desc Handles the click event on a tab header.
   * Sets the active tab state and calls the optional `onTabChange` callback.
   * @param {number} index - The index of the clicked tab.
   * @returns {void}
   */
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => handleTabClick(index)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {/* Render the content of the active tab */}
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
