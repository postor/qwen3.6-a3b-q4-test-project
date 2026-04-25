const STORAGE_KEY = 'todos'

export interface Todo {
  id: number
  title: string
  completed: boolean
}

function getStorage(): Todo[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function save(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export const todoStorage = {
  getAll: (): Todo[] => getStorage(),

  getById: (id: number): Todo | undefined => getStorage().find((t) => t.id === id),

  add: (title: string): number => {
    const todos = getStorage()
    const maxId = todos.length ? Math.max(...todos.map((t) => t.id)) : 0
    const newTodo: Todo = { id: maxId + 1, title, completed: false }
    todos.push(newTodo)
    save(todos)
    return newTodo.id
  },

  toggle: (id: number): void => {
    const todos = getStorage()
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      save(todos)
    }
  },

  remove: (id: number): void => {
    const todos = getStorage().filter((t) => t.id !== id)
    save(todos)
  },

  clearCompleted: (): void => {
    const todos = getStorage().filter((t) => !t.completed)
    save(todos)
  },

  setAllCompleted: (completed: boolean): void => {
    const todos = getStorage()
    todos.forEach((t) => (t.completed = completed))
    save(todos)
  },
}
