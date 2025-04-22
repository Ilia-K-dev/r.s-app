import React, { useState, useEffect, useCallback, useMemo } from 'react';//correct
import { FixedSizeList as VirtualizedList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';//correct

const PerformanceOptimizedList = ({
  data = [], 
  renderItem, 
  itemHeight = 50, 
  overscanCount = 5
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');

  const memoizedFilteredData = useMemo(() => {
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  useEffect(() => {
    setFilteredData(memoizedFilteredData);
  }, [memoizedFilteredData]);

  const Row = useCallback(({ index, style }) => {
    const item = filteredData[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  }, [filteredData, renderItem]);

  return (
    <div className="performance-optimized-list">
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <AutoSizer>
        {({ height, width }) => (
          <VirtualizedList
            height={height}
            itemCount={filteredData.length}
            itemSize={itemHeight}
            width={width}
            overscanCount={overscanCount}
          >
            {Row}
          </VirtualizedList>
        )}
      </AutoSizer>
    </div>
  );
};

export default PerformanceOptimizedList;