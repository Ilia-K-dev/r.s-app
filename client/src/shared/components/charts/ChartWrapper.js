import React from 'react';//correct
import PropTypes from 'prop-types';//correct

const ChartWrapper = ({ title, children }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
};

ChartWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default ChartWrapper;