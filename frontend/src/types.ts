export interface Note {
  id: string
  task_id: string
  title: string | null
  note_date: string
  content: Record<string, unknown>
  content_text: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  tracker_id: string
  title: string
  is_completed: boolean
  completed_at: string | null
  severity: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Tracker {
  id: string
  name: string
  client_type: string
  open_task_count: number
  created_at: string
  updated_at: string
}

export interface TrackerCreate {
  name: string
  client_type: string
}

export interface TrackerUpdate {
  name?: string
  client_type?: string
}

export interface TaskCreate {
  title: string
  severity?: number
}

export interface TaskUpdate {
  title?: string
  is_completed?: boolean
  sort_order?: number
  severity?: number
}

export interface NoteCreate {
  title?: string | null
  note_date?: string
  content: Record<string, unknown>
}

export interface NoteUpdate {
  title?: string | null
  note_date?: string
  content?: Record<string, unknown>
}

export interface ListResponse<T> {
  data: T[]
}
