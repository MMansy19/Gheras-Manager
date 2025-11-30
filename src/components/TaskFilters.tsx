import { Filter, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { PRIORITY_CONFIG, TaskPriority } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TaskFiltersProps {
    isOpen: boolean;
    onToggle: () => void;
    filterPriority: string;
    setFilterPriority: (value: string) => void;
    filterAssignee: string;
    setFilterAssignee: (value: string) => void;
    filterMinHours: string;
    setFilterMinHours: (value: string) => void;
    filterMaxHours: string;
    setFilterMaxHours: (value: string) => void;
    users?: any[];
    currentTeam?: any;
    onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
    isOpen,
    onToggle,
    filterPriority,
    setFilterPriority,
    filterAssignee,
    setFilterAssignee,
    filterMinHours,
    setFilterMinHours,
    filterMaxHours,
    setFilterMaxHours,
    users,
    onClearFilters,
}) => {
    const hasActiveFilters =
        filterPriority !== 'all' ||
        filterAssignee !== 'all' ||
        filterMinHours ||
        filterMaxHours;

    return (
        <div className="card mb-6">
            {/* Mobile Toggle Button */}
            <button
                onClick={onToggle}
                className="lg:hidden w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span className="font-semibold">الفلاتر</span>
                    {hasActiveFilters && (
                        <span className="badge badge-status-done text-xs">
                            نشط
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Filters - Always visible on desktop, toggleable on mobile */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Priority Filter */}
                    <div>
                        <Label>درجة الأهمية</Label>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger>
                                <SelectValue placeholder="الكل">
                                    {filterPriority !== 'all' && (
                                        <PriorityBadge priority={filterPriority as TaskPriority} />
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {Object.entries(PRIORITY_CONFIG).map(([value]) => (
                                    <SelectItem key={value} value={value}>
                                        <PriorityBadge priority={value as TaskPriority} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assignee Filter */}
                    <div>
                        <Label>تعيين إلى</Label>
                        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                            <SelectTrigger>
                                <SelectValue placeholder="الكل" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="unassigned">غير معيّن</SelectItem>
                                {users?.filter(u => u.status && u).map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Work Hours Min Filter */}
                    <div>
                        <Label>ساعات العمل (من)</Label>
                        <Input
                            type="number"
                            step="0.5"
                            placeholder="الحد الأدنى"
                            value={filterMinHours}
                            onChange={(e) => setFilterMinHours(e.target.value)}
                        />
                    </div>

                    {/* Work Hours Max Filter */}
                    <div>
                        <Label>ساعات العمل (إلى)</Label>
                        <Input
                            type="number"
                            step="0.5"
                            placeholder="الحد الأقصى"
                            value={filterMaxHours}
                            onChange={(e) => setFilterMaxHours(e.target.value)}
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="mt-4">
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="w-full sm:w-auto"
                        >
                            مسح الفلاتر
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
