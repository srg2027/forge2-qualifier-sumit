import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Bot,
  Check,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const STATUSES = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

const emptyTask = {
  title: '',
  description: '',
  status: 'todo',
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Request failed with ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function App() {
  const [boards, setBoards] = useState([])
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [boardName, setBoardName] = useState('Forge2 Sprint')
  const [modalTask, setModalTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [agentState, setAgentState] = useState('idle')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const activeBoard = boards.find((board) => board.id === activeBoardId)

  const groupedTasks = useMemo(() => {
    return STATUSES.reduce((groups, status) => {
      groups[status.id] = tasks.filter((task) => task.status === status.id)
      return groups
    }, {})
  }, [tasks])

  useEffect(() => {
    loadBoards()
  }, [])

  async function loadBoards() {
    setIsLoading(true)
    setError('')

    try {
      const data = await api('/boards')

      if (data.length === 0) {
        const board = await api('/boards', {
          method: 'POST',
          body: JSON.stringify({ name: 'Forge2 Sprint' }),
        })
        setBoards([board])
        setActiveBoardId(board.id)
        setTasks(board.tasks || [])
        return
      }

      setBoards(data)
      setActiveBoardId((current) => current || data[0].id)
      setTasks(data[0].tasks || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function selectBoard(boardId) {
    setActiveBoardId(Number(boardId))
    setError('')

    try {
      const board = await api(`/boards/${boardId}`)
      setTasks(board.tasks || [])
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function createBoard(event) {
    event.preventDefault()
    if (!boardName.trim()) return

    try {
      const board = await api('/boards', {
        method: 'POST',
        body: JSON.stringify({ name: boardName.trim() }),
      })
      setBoards((current) => [board, ...current])
      setActiveBoardId(board.id)
      setTasks([])
      setBoardName('')
      notifyAgents('board.created', { board, message: `Board created: ${board.name}` })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function saveTask(event) {
    event.preventDefault()
    if (!activeBoardId || !modalTask?.title.trim()) return

    const payload = {
      board_id: activeBoardId,
      title: modalTask.title.trim(),
      description: modalTask.description?.trim() || null,
      status: modalTask.status,
    }

    try {
      const savedTask = modalTask.id
        ? await api(`/tasks/${modalTask.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await api('/tasks', {
            method: 'POST',
            body: JSON.stringify(payload),
          })

      setTasks((current) => {
        if (modalTask.id) {
          return current.map((task) => (task.id === savedTask.id ? savedTask : task))
        }
        return [savedTask, ...current]
      })
      setModalTask(null)
      notifyAgents(modalTask.id ? 'task.updated' : 'task.created', {
        task: savedTask,
        board: activeBoard,
        message: `${savedTask.title} is ${statusLabel(savedTask.status)}`,
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteTask(task) {
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE' })
      setTasks((current) => current.filter((item) => item.id !== task.id))
      notifyAgents('task.deleted', {
        task,
        board: activeBoard,
        message: `Task deleted: ${task.title}`,
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function moveTask(taskId, status) {
    const task = tasks.find((item) => item.id === Number(taskId))
    if (!task || task.status === status) return

    const previousTasks = tasks
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)))

    try {
      const updatedTask = await api(`/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)))
      notifyAgents('task.moved', {
        task: updatedTask,
        board: activeBoard,
        message: `${updatedTask.title} moved to ${statusLabel(status)}`,
      })
    } catch (requestError) {
      setTasks(previousTasks)
      setError(requestError.message)
    }
  }

  async function notifyAgents(event, payload) {
    setAgentState('syncing')
    try {
      await api('/agent/events', {
        method: 'POST',
        body: JSON.stringify({ event, ...payload }),
      })
      setAgentState('synced')
    } catch {
      setAgentState('offline')
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const nextStatus = over.data.current?.status || over.id
    if (STATUSES.some((status) => status.id === nextStatus)) {
      moveTask(active.id, nextStatus)
    }
  }

  return (
    <main className="app-shell">
      <Navbar agentState={agentState} onRefresh={loadBoards} isLoading={isLoading} />

      <section className="workspace">
        <aside className="sidebar">
          <form className="board-form" onSubmit={createBoard}>
            <input
              value={boardName}
              onChange={(event) => setBoardName(event.target.value)}
              placeholder="Board name"
            />
            <button type="submit" title="Create board" aria-label="Create board">
              <Plus size={18} />
            </button>
          </form>

          <div className="board-list">
            {boards.map((board) => (
              <button
                className={board.id === activeBoardId ? 'active' : ''}
                key={board.id}
                type="button"
                onClick={() => selectBoard(board.id)}
              >
                {board.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="board-surface">
          <div className="board-header">
            <div>
              <p className="eyebrow">Kanban Board</p>
              <h1>{activeBoard?.name || 'Forge2 Sprint'}</h1>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => setModalTask({ ...emptyTask })}
              disabled={!activeBoardId}
            >
              <Plus size={18} />
              New task
            </button>
          </div>

          {error && <div className="error-line">{error}</div>}

          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="columns">
              {STATUSES.map((status) => (
                <Column
                  key={status.id}
                  status={status}
                  tasks={groupedTasks[status.id] || []}
                  onEdit={setModalTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </DndContext>
        </section>
      </section>

      {modalTask && (
        <TaskModal
          task={modalTask}
          setTask={setModalTask}
          onClose={() => setModalTask(null)}
          onSubmit={saveTask}
        />
      )}
    </main>
  )
}

function Navbar({ agentState, isLoading, onRefresh }) {
  return (
    <nav className="navbar">
      <div className="brand">
        <span>F2</span>
        <strong>Forge2 Kanban</strong>
      </div>
      <div className="nav-actions">
        <span className={`agent-pill ${agentState}`}>
          <Bot size={16} />
          {agentCopy(agentState)}
        </span>
        <button type="button" onClick={onRefresh} title="Refresh" aria-label="Refresh">
          {isLoading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
        </button>
      </div>
    </nav>
  )
}

function Column({ status, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { status: status.id },
  })

  return (
    <section ref={setNodeRef} className={`column ${isOver ? 'over' : ''}`}>
      <header>
        <h2>{status.label}</h2>
        <span>{tasks.length}</span>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="task-stack">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && <div className="empty-slot">Drop tasks here</div>}
        </div>
      </SortableContext>
    </section>
  )
}

function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article ref={setNodeRef} style={style} className={`task-card ${isDragging ? 'dragging' : ''}`}>
      <button className="drag-handle" type="button" {...attributes} {...listeners}>
        {task.title}
      </button>
      {task.description && <p>{task.description}</p>}
      <footer>
        <span>{statusLabel(task.status)}</span>
        <div>
          <button type="button" title="Edit task" aria-label="Edit task" onClick={() => onEdit(task)}>
            <Edit3 size={16} />
          </button>
          <button type="button" title="Delete task" aria-label="Delete task" onClick={() => onDelete(task)}>
            <Trash2 size={16} />
          </button>
        </div>
      </footer>
    </article>
  )
}

function TaskModal({ task, setTask, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="task-modal" onSubmit={onSubmit}>
        <header>
          <h2>{task.id ? 'Edit task' : 'New task'}</h2>
          <button type="button" title="Close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <label>
          Title
          <input
            value={task.title}
            onChange={(event) => setTask({ ...task, title: event.target.value })}
            required
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            value={task.description || ''}
            onChange={(event) => setTask({ ...task, description: event.target.value })}
            rows="5"
          />
        </label>
        <label>
          Status
          <select value={task.status} onChange={(event) => setTask({ ...task, status: event.target.value })}>
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <footer>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            <Check size={18} />
            Save
          </button>
        </footer>
      </form>
    </div>
  )
}

function statusLabel(status) {
  return STATUSES.find((item) => item.id === status)?.label || status
}

function agentCopy(state) {
  if (state === 'syncing') return 'Syncing agents'
  if (state === 'synced') return 'Agents synced'
  if (state === 'offline') return 'Agent queue local'
  return 'Agents ready'
}

export default App
