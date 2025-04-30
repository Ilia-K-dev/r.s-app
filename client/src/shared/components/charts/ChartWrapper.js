import PropTypes from 'prop-types'; //correct
import React from 'react'; //correct

/**
 * @typedef {object} ChartWrapperProps
 * @property {string} title - The title of the chart.
 * @property {React.ReactNode} children - The chart component(s) to be wrapped.
 */

/**
 * @desc A reusable wrapper component for charts.
 * Provides a consistent container with a title and basic styling.
 * @param {ChartWrapperProps} props - The component props.
 * @returns {JSX.Element} - The rendered ChartWrapper component.
 */
const ChartWrapper = ({ title, children }) => (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );

ChartWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ChartWrapper;
