import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

const SearchableSelect = SelectPrimitive.Root

const SearchableSelectGroup = SelectPrimitive.Group

const SearchableSelectValue = SelectPrimitive.Value

const SearchableSelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary dark:placeholder:text-textSecondary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SearchableSelectTrigger.displayName = "SearchableSelectTrigger"

interface SearchableSelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    showSearch?: boolean;
}

const SearchableSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    SearchableSelectContentProps
>(({ className, children, position = "popper", onSearchChange, searchPlaceholder = "بحث...", showSearch = true, ...props }, ref) => {
    const [search, setSearch] = React.useState("")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        onSearchChange?.(value)
    }

    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                side="bottom"
                className={cn(
                    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-textPrimary dark:text-textPrimary-dark shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    position === "popper" &&
                    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                    className
                )}
                position={position}
                {...props}
            >
                {showSearch && (
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={handleSearchChange}
                                className="h-8 pr-8 text-sm"
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
                <SelectPrimitive.Viewport
                    className={cn(
                        "p-1",
                        position === "popper" &&
                        "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
})
SearchableSelectContent.displayName = "SearchableSelectContent"

const SearchableSelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-textPrimary dark:focus:text-textPrimary-dark data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}
    >
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SearchableSelectItem.displayName = "SearchableSelectItem"

const SearchableSelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
        {...props}
    />
))
SearchableSelectSeparator.displayName = "SearchableSelectSeparator"

export {
    SearchableSelect,
    SearchableSelectGroup,
    SearchableSelectValue,
    SearchableSelectTrigger,
    SearchableSelectContent,
    SearchableSelectItem,
    SearchableSelectSeparator,
}
