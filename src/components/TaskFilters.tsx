import { Filter, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { PRIORITY_LABELS } from '../types';

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
    currentTeam,
    onClearFilters,
}) => {
    const hasActiveFilters =
        filterPriority !== 'all' ||
        filterAssignee !== 'all' ||
        filterMinHours ||
        filterMaxHours;

    return (
        <div className="card mb-6">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-right hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">تصفية المهام</h3>
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

            {isOpen && (
                <>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Priority Filter */}
                        <div>
                            <Label>درجة الأهمية</Label>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="الكل" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
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
                                    {users?.filter(u => u.status && currentTeam && u.teams.includes(currentTeam.id)).map((user) => (
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
                                مسح التصفية
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
