// src/components/admin/DataTable.tsx
import React, { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loadingMessage?: string;
  noDataMessage?: string;
  renderMobileItem?: (item: T) => ReactNode;
  mobileBreakpoint?: number;
  tableClassName?: string;
  headerClassName?: string;
  headerCellClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  isLoading?: boolean;
}

// Helper to get nested property, useful if column key is like 'author.name'
const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : undefined, obj);
};

function DataTable<T>({
  data,
  columns,
  loadingMessage = 'Caricamento dati...',
  noDataMessage = 'Nessun elemento trovato',
  renderMobileItem,
  mobileBreakpoint = 768,
  tableClassName = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
  headerClassName = 'bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold text-left',
  headerCellClassName = 'px-6 py-3',
  rowClassName = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors group',
  cellClassName = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300',
  isLoading = false,
}: DataTableProps<T>) {
  // State to track window width for responsive rendering
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileView = windowWidth < mobileBreakpoint;

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const renderTableCell = (item: T, column: Column<T>): ReactNode => {
    if (column.render) {
      return column.render(item);
    }
    
    if (column.key === 'actions') {
      return null;
    }
    
    // Use helper for potentially nested keys
    const value = getNestedProperty(item, column.key as string);
    
    if (typeof value === 'boolean') {
      return value ? 'Sì' : 'No';
    }
    
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {noDataMessage}
        </p>
      </div>
    );
  }

  // If renderMobileItem is provided and it's mobile view, use it directly
  if (isMobileView && renderMobileItem) {
    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={(item as any).id ?? `mobile-item-${data.indexOf(item)}`}>
            {renderMobileItem(item)}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback to default Desktop Table rendering if not mobile or no custom mobile renderer
  return (
    <div className="overflow-x-auto align-middle inline-block min-w-full"> {/* Added container for better shadow/border handling */} 
      <div className="shadow-md overflow-hidden border-b border-gray-200 dark:border-gray-700 rounded-lg"> {/* Apply shadow/border/rounding to container */} 
        <table className={tableClassName}>
          <thead className={headerClassName}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  scope="col"
                  className={`${headerCellClassName} ${getAlignment(column.align)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={(item as any).id ?? `desktop-item-${index}`}
                className={rowClassName}
              >
                {columns.map((column) => (
                  <td
                    key={`${(item as any).id ?? index}-${column.key.toString()}`}
                    className={`${cellClassName} ${
                      column.key === 'actions' 
                        ? 'text-right' 
                        : 'text-gray-700 dark:text-gray-300'
                    } ${getAlignment(column.align)}`}
                  >
                    {renderTableCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
