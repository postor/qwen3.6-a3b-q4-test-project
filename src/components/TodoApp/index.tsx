'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Todo } from '@/core/todo'
import { todoRepository } from '@/core/todo'

const STORAGE_KEY = 'todos'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    setTodos(todoRepository.list(STORAGE_KEY))
  }, [])

  const refresh = useCallback(() => {
    setTodos(todoRepository.list(STORAGE_KEY))
  }, [])

  const addTodo = () => {
    if (!inputValue.trim()) return
    todoRepository.create(STORAGE_KEY, inputValue.trim())
    setInputValue('')
    refresh()
  }

  const toggleTodo = (id: number) => {
    todoRepository.toggle(STORAGE_KEY, id)
    refresh()
  }

  const removeTodo = (id: number) => {
    todoRepository.remove(STORAGE_KEY, id)
    refresh()
  }

  const clearCompleted = () => {
    todoRepository.clearCompleted(STORAGE_KEY)
    refresh()
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length

  return (
    <div className="todo-app" style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Todos</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo()
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          data-testid="todo-input"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" data-testid="add-button" style={{ padding: '8px 16px' }}>
          Add
        </button>
      </form>

      <ul data-testid="todo-list" style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {filteredTodos.map((todo) => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              data-testid={`checkbox-${todo.id}`}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : 'inherit',
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => removeTodo(todo.id)} data-testid={`delete-${todo.id}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {activeCount > 0 && (
        <p data-testid="active-count" style={{ fontSize: 14, color: '#666' }}>
          {activeCount} item{activeCount !== 1 ? 's' : ''} left
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, fontSize: 14 }} data-testid="filters">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontWeight: filter === f ? 'bold' : 'normal',
              textDecoration: filter === f ? 'underline' : 'none',
              cursor: 'pointer',
            }}
            data-testid={`filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={clearCompleted}
        style={{ marginTop: 12, cursor: 'pointer' }}
        data-testid="clear-completed"
      >
        Clear completed
      </button>
    </div>
  )
}
