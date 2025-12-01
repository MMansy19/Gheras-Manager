import { useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, STATUS_LABELS, User } from '../types';

interface KanbanBoardProps {
    statuses: TaskStatus[];
    getTasksByStatus: (status: TaskStatus) => Task[];
    onDragEnd: (result: DropResult) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (task: Task) => void;
    onViewTask?: (task: Task) => void;
    isAdminOrSupervisor: boolean;
    role?: string | null;
    currentUserId?: number | null;
    users?: User[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    statuses,
    getTasksByStatus,
    onDragEnd,
    onEditTask,
    onDeleteTask,
    onViewTask,
    isAdminOrSupervisor,
    role,
    currentUserId,
    users,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const statusColors: Record<TaskStatus, string> = {
        new: 'border-blue-500',
        scheduled: 'border-purple-500',
        in_progress: 'border-amber-500',
        issue: 'border-rose-600',
        done: 'border-green-600',
        docs: 'border-gray-500',
    };

    // Auto-scroll on drag
    useEffect(() => {
        let animationFrameId: number | null = null;
        let isDragging = false;
        let mouseX = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                mouseX = e.touches[0].clientX;
            }
        };

        const autoScroll = () => {
            if (!containerRef.current || !isDragging) return;

            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            const threshold = 150;
            const scrollSpeed = 10;

            let scrollAmount = 0;

            // Check if mouse is near edges
            if (mouseX < rect.left + threshold) {
                scrollAmount = -scrollSpeed * Math.min(1, (rect.left + threshold - mouseX) / threshold);
            } else if (mouseX > rect.right - threshold) {
                scrollAmount = scrollSpeed * Math.min(1, (mouseX - (rect.right - threshold)) / threshold);
            }

            if (scrollAmount !== 0) {
                container.scrollLeft += scrollAmount;
            }

            animationFrameId = requestAnimationFrame(autoScroll);
        };

        const handleDragStart = () => {
            isDragging = true;
            autoScroll();
        };

        const handleDragEnd = () => {
            isDragging = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragend', handleDragEnd);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <DragDropContext
            onDragEnd={(result) => {
                onDragEnd(result);
            }}
        >
            <div
                ref={containerRef}
                className="kanban-container overflow-x-auto overflow-y-hidden -mx-2 sm:-mx-4 px-2 sm:px-4 scrollbar-custom"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    overscrollBehaviorX: 'contain',
                }}
            >
                <div className="flex gap-2 sm:gap-3 md:gap-4 pb-4 min-w-full" style={{ width: 'max-content' }}>
                    {statuses.map((status) => {
                        const statusTasks = getTasksByStatus(status);
                        return (
                            <div
                                key={status}
                                className="flex flex-col w-[85vw] xs:w-[75vw] sm:w-72 md:w-80 lg:w-[320px] flex-shrink-0"
                            >
                                <div className={`bg-surface dark:bg-surface-dark rounded-t-lg p-3 border-r-4 ${statusColors[status]}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm">{STATUS_LABELS[status]}</span>
                                        <span className="badge bg-gray-200 dark:bg-gray-700">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`bg-gray-100 dark:bg-gray-900 rounded-b-lg p-2 min-h-[200px] max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-primary' : ''
                                                }`}
                                            style={{
                                                overscrollBehavior: 'contain',
                                            }}
                                        >
                                            {statusTasks.length === 0 ? (
                                                <p className="text-center text-textSecondary dark:text-textSecondary-dark text-sm py-8">
                                                    لا توجد مهام
                                                </p>
                                            ) : (
                                                statusTasks.map((task, index) => (
                                                    <Draggable
                                                        key={task.id}
                                                        draggableId={task.id.toString()}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`card mb-2 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-2xl opacity-90' : ''
                                                                    }`}
                                                                style={provided.draggableProps.style}
                                                            >
                                                                <TaskCard
                                                                    task={task}
                                                                    onView={onViewTask ? () => onViewTask(task) : undefined}
                                                                    onEdit={(onEditTask && (role !== 'volunteer' || task.assignee_id === currentUserId)) ? () => onEditTask(task) : undefined}
                                                                    onDelete={isAdminOrSupervisor && onDeleteTask ? () => onDeleteTask(task) : undefined}
                                                                    users={users}
                                                                    currentUserId={currentUserId}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DragDropContext>
    );
};
