import { describe, it, expect, beforeEach } from 'vitest'
import { todoStorage } from './todo'

describe('todoStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when no todos stored', () => {
    const todos = todoStorage.getAll()
    expect(todos).toEqual([])
  })

  it('adds a new todo', () => {
    const title = 'Test todo'
    const id = todoStorage.add(title)
    expect(id).toBe(1)

    const todos = todoStorage.getAll()
    expect(todos).toHaveLength(1)
    expect(todos[0]).toEqual({
      id: 1,
      title: 'Test todo',
      completed: false,
    })
  })

  it('increments ids for multiple todos', () => {
    const id1 = todoStorage.add('First')
    const id2 = todoStorage.add('Second')
    expect(id1).toBe(1)
    expect(id2).toBe(2)
  })

  it('toggles a todo by id', () => {
    const id = todoStorage.add('Toggle me')
    const todosBefore = todoStorage.getById(id)
    expect(todosBefore!.completed).toBe(false)

    todoStorage.toggle(id)
    const todosAfter = todoStorage.getById(id)!
    expect(todosAfter.completed).toBe(true)
  })

  it('removes a todo by id', () => {
    const id = todoStorage.add('Remove me')
    todoStorage.remove(id)
    expect(todoStorage.getById(id)).toBeUndefined()
    expect(todoStorage.getAll()).toHaveLength(0)
  })

  it('persists to localStorage on add', () => {
    const title = 'Persisted todo'
    todoStorage.add(title)
    const stored = localStorage.getItem('todos')
    expect(stored).toBeDefined()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toBe('Persisted todo')
  })

  it('loads from localStorage on getAll', () => {
    localStorage.setItem('todos', JSON.stringify([{ id: 1, title: 'Stored', completed: true }]))
    const todos = todoStorage.getAll()
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('Stored')
    expect(todos[0].completed).toBe(true)
  })

  it('deletes incomplete todos', () => {
    todoStorage.add('Keep me')
    const id = todoStorage.add('Delete me')
    todoStorage.toggle(id) // mark complete
    todoStorage.clearCompleted()
    expect(todoStorage.getAll()).toHaveLength(1)
    expect(todoStorage.getById(id)).toBeUndefined()
  })

  it('updates all todos completed flag', () => {
    todoStorage.add('One')
    const id2 = todoStorage.add('Two')
    todoStorage.add('Three')

    todoStorage.toggle(id2) // make second complete only

    todoStorage.setAllCompleted(true)
    const todos = todoStorage.getAll()
    expect(todos.every((t) => t.completed)).toBe(true)
  })
})
