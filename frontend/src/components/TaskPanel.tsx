import { useMemo, useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTasks, useUpdateTask } from '../hooks/useClients'
import { useAppStore } from '../stores/useAppStore'
import { Task } from '../types'

interface TaskPanelProps {
  clientId: string | null
}

function getSeverityColor(severity: number): string {
  const colors = {
    10: 'bg-green-900/60 text-green-300 border-green-800/50',
    9: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/50',
    8: 'bg-teal-900/60 text-teal-300 border-teal-800/50',
    7: 'bg-cyan-900/60 text-cyan-300 border-cyan-800/50',
    6: 'bg-blue-900/60 text-blue-300 border-blue-800/50',
    5: 'bg-yellow-900/60 text-yellow-300 border-yellow-800/50',
    4: 'bg-orange-900/60 text-orange-300 border-orange-800/50',
    3: 'bg-red-900/60 text-red-300 border-red-800/50',
    2: 'bg-red-800/60 text-red-200 border-red-700/50',
    1: 'bg-red-900 text-red-100 border-red-800',
  }
  return colors[severity as keyof typeof colors] || colors[10]
}

function SortableTaskItem({
  task,
  isSelected,
  onSelect,
  onEdit,
  onToggleComplete,
}: {
  task: Task
  isSelected: boolean
  onSelect: (taskId: string) => void
  onEdit: (task: Task, e: React.MouseEvent) => void
  onToggleComplete: (task: Task, e: React.MouseEvent) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(task.id)}
      className={`py-3 px-3 cursor-pointer transition touch-none ${
        isSelected ? 'bg-royal-elevated border-l-2 border-royal-gold' : 'hover:bg-royal-elevated'
      } ${task.is_completed ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl text-white font-normal flex-shrink-0">≣</span>
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={(e) => onToggleComplete(task, e as any)}
          onClick={(e) => e.stopPropagation()}
          className="rounded flex-shrink-0"
        />
        <span className={`flex-1 text-sm ${task.is_completed ? 'line-through text-royal-muted' : 'text-royal-text'}`}>
          {task.title}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getSeverityColor(task.severity)}`}>
          Sev {task.severity}
        </span>
        <button
          onClick={(e) => onEdit(task, e)}
          className="flex-shrink-0 px-2 py-1 rounded text-xs text-royal-gold/60 hover:text-royal-gold hover:bg-royal-gold/10 transition"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export function TaskPanel({ clientId }: TaskPanelProps) {
  const { showCompletedTasks, setShowCompletedTasks, selectedTaskId, setSelectedTaskId, openModal, setEditingTaskId } =
    useAppStore()
  const { data: tasks = [], isLoading } = useTasks(clientId, showCompletedTasks)
  const updateTask = useUpdateTask()
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  useEffect(() => {
    setLocalTasks([])
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const incompleteTasks = useMemo(
    () => (localTasks.length > 0 ? localTasks : tasks.filter((t) => !t.is_completed)),
    [tasks, localTasks]
  )
  const completedTasks = useMemo(() => tasks.filter((t) => t.is_completed), [tasks])
  const displayedTasks = showCompletedTasks ? [...incompleteTasks, ...completedTasks] : incompleteTasks

  const handleToggleComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask.mutate({
      id: task.id,
      payload: { is_completed: !task.is_completed },
    })
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTaskId(task.id)
    openModal('edit_task')
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = incompleteTasks.findIndex((t) => t.id === active.id)
    const newIndex = incompleteTasks.findIndex((t) => t.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedTasks = arrayMove(incompleteTasks, oldIndex, newIndex)
    setLocalTasks(reorderedTasks)

    for (let i = 0; i < reorderedTasks.length; i++) {
      updateTask.mutate({
        id: reorderedTasks[i].id,
        payload: { sort_order: i },
      })
    }
  }

  return (
    <div className="flex flex-col h-full royal-panel rounded-lg">
      <div className="flex-shrink-0 border-b-2 border-royal-gold/40 p-4 bg-gradient-to-b from-royal-gold/5 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-royal-gold/70">⚜</span>
            <button
              onClick={() => openModal('create_task')}
              className="btn-royal text-sm"
            >
              + Create Task
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showCompletedTasks}
              onChange={(e) => setShowCompletedTasks(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs font-medium text-royal-muted">Show Completed</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-royal-muted">Loading tasks...</div>
        ) : displayedTasks.length === 0 ? (
          <div className="p-4 text-royal-muted text-sm">
            {showCompletedTasks ? 'No tasks found' : 'No open tasks'}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="divide-y divide-royal-border">
              {incompleteTasks.length > 0 && (
                <>
                  <SortableContext items={incompleteTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {incompleteTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        isSelected={selectedTaskId === task.id}
                        onSelect={handleSelectTask}
                        onEdit={handleEditTask}
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </SortableContext>
                </>
              )}

              {showCompletedTasks && completedTasks.length > 0 && (
                <>
                  <div className="px-3 py-2 bg-royal-elevated text-xs font-medium text-royal-muted">
                    Completed
                  </div>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleSelectTask(task.id)}
                      className={`p-3 cursor-pointer transition opacity-60 ${
                        selectedTaskId === task.id
                          ? 'bg-royal-elevated border-l-2 border-royal-gold'
                          : 'hover:bg-royal-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={(e) => handleToggleComplete(task, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded flex-shrink-0"
                        />
                        <span className="flex-1 line-through text-royal-muted text-sm">
                          {task.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getSeverityColor(task.severity)}`}>
                          Sev {task.severity}
                        </span>
                        <button
                          onClick={(e) => handleEditTask(task, e)}
                          className="flex-shrink-0 px-2 py-1 rounded text-xs text-royal-gold/60 hover:text-royal-gold hover:bg-royal-gold/10 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  )
}
