import React, { useCallback, useState } from 'react';
import { FixedSizeList as VirtualizedList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer'; // Correct import for AutoSizer

/**
 * @typedef {object} PerformanceOptimizedListProps
 * @property {Array<object>} [data=[]] - The array of data items to display in the list.
 * @property {function(object, number): React.ReactNode} renderItem - A function that renders a single item in the list. Receives the item data and index as arguments.
 * @property {number} [itemHeight=50] - The fixed height of each item in the list.
 * @property {number} [overscanCount=5] - The number of items to render above and below the visible area.
 */

/**
 * Simple function to generate unique IDs without external dependencies
 */
const generateUniqueId = (prefix = 'list') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * @desc A performance-optimized list component that uses virtualization to efficiently render large lists.
 * It only renders the items that are currently visible in the viewport, plus a few extra (overscan).
 * Requires a fixed item height.
 * @param {PerformanceOptimizedListProps} props - The component props.
 * @returns {JSX.Element} - The rendered PerformanceOptimizedList component.
 */
const PerformanceOptimizedList = ({
  data = [],
  renderItem,
  itemHeight = 50,
  overscanCount = 5,
}) => {
  // Generate a unique ID for this list instance
  const listId = React.useMemo(() => generateUniqueId('virtualized-list'), []);

  /**
   * @desc A memoized component function used by react-window to render individual rows.
   * @param {object} props - Props provided by react-window.
   * @param {number} props.index - The index of the item to render.
   * @param {object} props.style - The style object to apply to the row element (includes position and size).
   * @returns {JSX.Element} - The rendered row element.
   */
  const Row = useCallback(
    ({ index, style }) => {
      const item = data[index];
      // Apply the style prop to the outer element for positioning
      return <div style={style}>{renderItem(item, index)}</div>;
    },
    [data, renderItem] // Dependencies for useCallback
  );

  // Handle empty data array
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-gray-500">
        No items to display
      </div>
    );
  }

  return (
    <div className="performance-optimized-list" style={{ height: '100%', width: '100%' }}>
      {/* AutoSizer makes the list fill its parent container */}
      <AutoSizer>
        {({ height, width }) => (
          <VirtualizedList
            id={listId}
            height={height} // Height of the list container
            itemCount={data.length} // Total number of items in the list
            itemSize={itemHeight} // Height of each individual item
            width={width} // Width of the list container
            overscanCount={overscanCount} // Number of items to render outside the visible area
          >
            {Row} {/* Render function for each row */}
          </VirtualizedList>
        )}
      </AutoSizer>
    </div>
  );
};

export default PerformanceOptimizedList;