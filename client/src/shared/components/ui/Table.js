import React from 'react'; //correct

/**
 * @typedef {object} TableColumn
 * @property {string} key - The key in the data object to display in this column.
 * @property {string} header - The header text for this column.
 * @property {function(object): React.ReactNode} [render] - Optional render function to customize cell content. Receives the row data object as an argument.
 */

/**
 * @typedef {object} TableProps
 * @property {TableColumn[]} columns - Array of column definitions.
 * @property {Array<object>} data - Array of data objects to display in the table rows.
 * @property {function(object): void} [onRowClick] - Optional function to call when a row is clicked. Receives the row data object as an argument.
 */

/**
 * @desc A reusable Table UI component for displaying tabular data.
 * Supports defining columns, providing data, and optional row click handling.
 * @param {TableProps} props - The component props.
 * @returns {JSX.Element} - The rendered Table component.
 */
export const Table = ({ columns, data, onRowClick }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

export default Table;
