import { useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, STATUS_LABELS } from '../types';

interface KanbanBoardProps {
    statuses: TaskStatus[];
    getTasksByStatus: (status: TaskStatus) => Task[];
    onDragEnd: (result: DropResult) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (task: Task) => void;
    isAdminOrSupervisor: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    statuses,
    getTasksByStatus,
    onDragEnd,
    onEditTask,
    onDeleteTask,
    isAdminOrSupervisor,
}) => {
    const isDraggingRef = useRef(false);
    const scrollIntervalRef = useRef<number | null>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });

    const statusColors: Record<TaskStatus, string> = {
        new: 'border-blue-500',
        scheduled: 'border-purple-500',
        in_progress: 'border-amber-500',
        issue: 'border-rose-600',
        done: 'border-green-600',
        docs: 'border-gray-500',
    };

    return (
        <DragDropContext
            onDragEnd={(result) => {
                onDragEnd(result);
                isDraggingRef.current = false;
                if (scrollIntervalRef.current) {
                    cancelAnimationFrame(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                }
            }}
            onDragStart={() => {
                isDraggingRef.current = true;

                // Start auto-scroll loop
                const autoScroll = () => {
                    const container = document.querySelector('.kanban-container') as HTMLElement;
                    if (container && isDraggingRef.current) {
                        const rect = container.getBoundingClientRect();
                        // Smaller threshold for mobile, larger for desktop
                        const isMobile = window.innerWidth < 768;
                        const threshold = isMobile ? 120 : 150;
                        const maxScrollSpeed = isMobile ? 30 : 25;

                        const currentX = mousePositionRef.current.x;

                        // Calculate horizontal scroll speed based on distance from edge
                        let scrollSpeedX = 0;

                        if (currentX > 0 && currentX < rect.left + threshold) {
                            // Near left edge - scroll left (RTL: scroll to show more columns on the right)
                            const distance = (rect.left + threshold) - currentX;
                            const normalizedDistance = Math.min(1, distance / threshold);
                            scrollSpeedX = -maxScrollSpeed * normalizedDistance;
                        } else if (currentX > rect.right - threshold && currentX < window.innerWidth) {
                            // Near right edge - scroll right (RTL: scroll to show more columns on the left)
                            const distance = currentX - (rect.right - threshold);
                            const normalizedDistance = Math.min(1, distance / threshold);
                            scrollSpeedX = maxScrollSpeed * normalizedDistance;
                        }

                        // Apply horizontal scroll
                        if (scrollSpeedX !== 0) {
                            container.scrollBy({
                                left: scrollSpeedX,
                                behavior: 'auto'
                            });
                        }
                    }

                    if (isDraggingRef.current) {
                        scrollIntervalRef.current = requestAnimationFrame(autoScroll);
                    }
                };
                scrollIntervalRef.current = requestAnimationFrame(autoScroll);
            }}
            onDragUpdate={() => {
                // Keep the scroll loop running
            }}
        >
            <div
                className="kanban-container overflow-x-auto overflow-y-hidden -mx-2 sm:-mx-4 px-2 sm:px-4 scrollbar-custom"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    overscrollBehaviorX: 'contain',
                }}
                onMouseMove={(e) => {
                    mousePositionRef.current = { x: e.clientX, y: e.clientY };
                }}
                onTouchStart={(e) => {
                    if (e.touches[0]) {
                        mousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    }
                }}
                onTouchMove={(e) => {
                    if (e.touches[0]) {
                        mousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    }
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
                                            className={`bg-gray-50 dark:bg-gray-900 rounded-b-lg p-2 min-h-[200px] max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-primary' : ''
                                                }`}
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
                                                                className={`card mb-2 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 opacity-90' : ''
                                                                    }`}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    touchAction: 'none'
                                                                }}
                                                            >
                                                                <TaskCard
                                                                    task={task}
                                                                    onEdit={isAdminOrSupervisor && onEditTask ? () => onEditTask(task) : undefined}
                                                                    onDelete={isAdminOrSupervisor && onDeleteTask ? () => onDeleteTask(task) : undefined}
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
