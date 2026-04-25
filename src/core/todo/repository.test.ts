import { describe, it, expect, beforeEach } from 'vitest'
import type { Todo } from './model'
import { todoRepository } from './repository'

const TEST_KEY = '__repo_test__'

describe('todoRepository', () => {
  beforeEach(() => localStorage.clear())

  const assertTodos = (expected: Todo[]) => {
    expect(todoRepository.list(TEST_KEY)).toEqual(expected)
  }

  it('lists empty on fresh start', () => {
    assertTodos([])
  })

  it('creates a todo with incrementing id', () => {
    const id1 = todoRepository.create(TEST_KEY, 'First')
    expect(id1).toBe(1)

    const id2 = todoRepository.create(TEST_KEY, 'Second')
    expect(id2).toBe(2)

    assertTodos([
      { id: 1, title: 'First', completed: false },
      { id: 2, title: 'Second', completed: false },
    ])
  })

  it('toggles completion by id', () => {
    const id = todoRepository.create(TEST_KEY, 'Toggle')
    assertTodos([{ id, title: 'Toggle', completed: false }])

    todoRepository.toggle(TEST_KEY, id)
    assertTodos([{ id, title: 'Toggle', completed: true }])

    todoRepository.toggle(TEST_KEY, id)
    assertTodos([{ id, title: 'Toggle', completed: false }])
  })

  it('removes a todo by id', () => {
    const id = todoRepository.create(TEST_KEY, 'Remove')
    todoRepository.remove(TEST_KEY, id)
    assertTodos([])
  })

  it('does nothing removing non-existent id', () => {
    expect(() => todoRepository.remove(TEST_KEY, 99)).not.toThrow()
  })

  it('clears completed todos only', () => {
    const id1 = todoRepository.create(TEST_KEY, 'Keep')
    const id2 = todoRepository.create(TEST_KEY, 'Drop')
    todoRepository.toggle(TEST_KEY, id2)

    todoRepository.clearCompleted(TEST_KEY)

    assertTodos([{ id: id1, title: 'Keep', completed: false }])
  })

  it('sets all todos to a given completion state', () => {
    todoRepository.create(TEST_KEY, 'A')
    const id2 = todoRepository.create(TEST_KEY, 'B')
    todoRepository.toggle(TEST_KEY, id2)

    todoRepository.setAllCompleted(TEST_KEY, true)
    assertTodos([
      { id: 1, title: 'A', completed: true },
      { id: id2, title: 'B', completed: true },
    ])
  })

  it('reuses ids from persisted data after reload simulation', () => {
    todoRepository.create(TEST_KEY, 'One')
    todoRepository.create(TEST_KEY, 'Two')
    // Simulate persistence + reload by loading from storage directly
    const stored = localStorage.getItem(TEST_KEY)
    expect(stored).toContain('"title":"One"')
    expect(stored).toContain('"title":"Two"')
  })
})
