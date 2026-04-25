import type { Todo } from './model'
import { todoStorage } from './storage'

const list = (key: string): Todo[] => todoStorage.get<Todo>(key)

export const todoRepository = {
  list,

  getById(key: string, id: number): Todo | undefined {
    return list(key).find((t) => t.id === id)
  },

  create(key: string, title: string): number {
    const todos = list(key)
    const maxId = todos.length ? Math.max(...todos.map((t) => t.id)) : 0
    const todo: Todo = { id: maxId + 1, title, completed: false }
    todos.push(todo)
    todoStorage.set(key, todos)
    return todo.id
  },

  toggle(key: string, id: number): void {
    const todos = list(key)
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      todoStorage.set(key, todos)
    }
  },

  remove(key: string, id: number): void {
    const todos = list(key).filter((t) => t.id !== id)
    todoStorage.set(key, todos)
  },

  clearCompleted(key: string): void {
    const todos = list(key).filter((t) => !t.completed)
    todoStorage.set(key, todos)
  },

  setAllCompleted(key: string, completed: boolean): void {
    const todos = list(key)
    todos.forEach((t) => (t.completed = completed))
    todoStorage.set(key, todos)
  },
}
