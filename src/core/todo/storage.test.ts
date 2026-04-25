import { describe, it, expect, beforeEach } from 'vitest'
import { todoStorage } from './storage'

describe('todoStorage', () => {
  const TEST_KEY = '__test_todos__'

  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when no data stored', () => {
    expect(todoStorage.get(TEST_KEY)).toEqual([])
  })

  it('persists an array of items under the given key', () => {
    const items = [{ id: 1, title: 'a', completed: false }]
    todoStorage.set(TEST_KEY, items)
    expect(todoStorage.get(TEST_KEY)).toEqual(items)
  })

  it('overwrites existing data on set', () => {
    todoStorage.set(TEST_KEY, [{ id: 1 } as any])
    todoStorage.set(TEST_KEY, [{ id: 2 }] as any)
    const items = todoStorage.get(TEST_KEY)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(2)
  })

  it('clears data for a key', () => {
    todoStorage.set(TEST_KEY, [{ id: 1 }] as any)
    todoStorage.clear(TEST_KEY)
    expect(todoStorage.get(TEST_KEY)).toEqual([])
  })

  it('handles JSON parse errors gracefully (returns empty array)', () => {
    localStorage.setItem(TEST_KEY, 'not valid json')
    // Should not throw — returns empty array and logs error
    expect(todoStorage.get(TEST_KEY)).toEqual([])
  })
})
