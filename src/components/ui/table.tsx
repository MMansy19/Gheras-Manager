import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// Table Root Component
interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
}

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("card overflow-x-auto", className)} {...props}>
                <table className="table" role="table">
                    {children}
                </table>
            </div>
        );
    }
);
Table.displayName = 'Table';

// Table Header Component
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: ReactNode;
    className?: string;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <thead ref={ref} className={className} {...props}>
                {children}
            </thead>
        );
    }
);
TableHeader.displayName = 'TableHeader';

// Table Body Component
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    children: ReactNode;
    className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <tbody ref={ref} className={className} {...props}>
                {children}
            </tbody>
        );
    }
);
TableBody.displayName = 'TableBody';

// Table Row Component
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    clickable?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
    ({ children, className, hoverable = true, clickable = false, ...props }, ref) => {
        return (
            <tr
                ref={ref}
                className={cn(
                    hoverable && "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    clickable && "cursor-pointer",
                    className
                )}
                {...props}
            >
                {children}
            </tr>
        );
    }
);
TableRow.displayName = 'TableRow';

// Table Head Cell Component
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    children: ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ children, className, align, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className={cn(
                    align === 'center' && "text-center",
                    align === 'right' && "text-right",
                    align === 'left' && "text-left",
                    className
                )}
                {...props}
            >
                {children}
            </th>
        );
    }
);
TableHead.displayName = 'TableHead';

// Table Cell Component
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ children, className, align, ...props }, ref) => {
        return (
            <td
                ref={ref}
                className={cn(
                    align === 'center' && "text-center",
                    align === 'right' && "text-right",
                    align === 'left' && "text-left",
                    className
                )}
                {...props}
            >
                {children}
            </td>
        );
    }
);
TableCell.displayName = 'TableCell';

// Table Empty State Component
interface TableEmptyProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    colSpan?: number;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
    icon,
    title = "لا توجد بيانات",
    description = "لم يتم العثور على أي بيانات",
    colSpan = 1,
}) => {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                    {icon && <div className="mb-3">{icon}</div>}
                    <p className="text-lg font-semibold mb-1">{title}</p>
                    <p className="text-sm">{description}</p>
                </div>
            </td>
        </tr>
    );
};

// Table Actions Component (for action buttons in cells)
interface TableActionsProps {
    children: ReactNode;
    className?: string;
}

export const TableActions: React.FC<TableActionsProps> = ({ children, className }) => {
    return (
        <div className={cn("flex gap-2 justify-start items-center", className)}>
            {children}
        </div>
    );
};

// Table Badge Component (for status badges, tags, etc.)
interface TableBadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
    className?: string;
}

export const TableBadge: React.FC<TableBadgeProps> = ({ 
    children, 
    variant = 'default',
    className 
}) => {
    const variantClasses = {
        default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
        warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
        danger: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        primary: 'bg-primary/20 text-primary',
    };

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            variantClasses[variant],
            className
        )}>
            {children}
        </span>
    );
};

// Table Avatar Component (for user avatars in cells)
interface TableAvatarProps {
    name: string;
    className?: string;
    highlight?: boolean;
}

export const TableAvatar: React.FC<TableAvatarProps> = ({ 
    name, 
    className,
    highlight = false
}) => {
    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                highlight 
                    ? "bg-primary/20 text-primary" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
                className
            )}>
                {name.charAt(0)}
            </div>
            <div className="flex flex-col">
                <span className={cn(
                    "text-sm font-semibold",
                    highlight && "text-primary"
                )}>
                    {name}
                </span>
                {highlight && (
                    <span className="text-xs text-primary/70">(أنت)</span>
                )}
            </div>
        </div>
    );
};

// Export all components as a namespace as well
export const TableComponents = {
    Root: Table,
    Header: TableHeader,
    Body: TableBody,
    Row: TableRow,
    Head: TableHead,
    Cell: TableCell,
    Empty: TableEmpty,
    Actions: TableActions,
    Badge: TableBadge,
    Avatar: TableAvatar,
};
