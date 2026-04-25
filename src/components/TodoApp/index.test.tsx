import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from './index'

describe('TodoApp', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders input and add button', () => {
    render(<TodoApp />)
    expect(screen.getByTestId('todo-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  it('adds a todo when clicking Add button', async () => {
    render(<TodoApp />)
    await user.type(screen.getByTestId('todo-input'), 'Buy groceries')
    await user.click(screen.getByTestId('add-button'))

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('adds a todo on Enter key', async () => {
    render(<TodoApp />)
    const input = screen.getByTestId('todo-input')
    await user.type(input, 'Read a book{Enter}')

    expect(screen.getByText('Read a book')).toBeInTheDocument()
  })

  it('does not add empty todo', async () => {
    render(<TodoApp />)
    await user.click(screen.getByTestId('add-button'))

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('toggles todo completion on checkbox click', async () => {
    render(<TodoApp />)
    await user.type(screen.getByTestId('todo-input'), 'Toggle this')
    await user.click(screen.getByTestId('add-button'))

    const checkbox = screen.getByTestId('checkbox-1')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    const todoSpan = screen.getByText('Toggle this')
    expect(todoSpan).toHaveStyle({ textDecoration: 'line-through' })
  })

  it('removes a todo on delete button click', async () => {
    render(<TodoApp />)
    await user.type(screen.getByTestId('todo-input'), 'Delete me')
    await user.click(screen.getByTestId('add-button'))

    await user.click(screen.getByTestId('delete-1'))
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('shows active count', async () => {
    render(<TodoApp />)
    await user.type(screen.getByTestId('todo-input'), 'Task one')
    await user.click(screen.getByTestId('add-button'))

    expect(screen.getByTestId('active-count')).toHaveTextContent(/1 item left/)
  })

  it('filters todos by status', async () => {
    render(<TodoApp />)
    const input = screen.getByTestId('todo-input')

    await user.type(input, 'Active task')
    await user.click(screen.getByTestId('add-button'))

    // Mark first as complete before adding second
    await user.click(screen.getByTestId('checkbox-1'))

    await user.clear(input)
    await user.type(input, 'Done task')
    await user.click(screen.getByTestId('add-button'))

    // Filter to completed — shows only the completed "Active task"
    await user.click(screen.getByTestId('filter-completed'))
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.queryByText('Done task')).not.toBeInTheDocument()

    // Show all
    await user.click(screen.getByTestId('filter-all'))
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })

  it('clears completed todos', async () => {
    render(<TodoApp />)
    const input = screen.getByTestId('todo-input')

    await user.type(input, 'Keep me')
    await user.click(screen.getByTestId('add-button'))
    await user.clear(input)
    await user.type(input, 'Remove me')
    await user.click(screen.getByTestId('add-button'))

    // Mark second complete
    await user.click(screen.getByTestId('checkbox-2'))

    await user.click(screen.getByTestId('clear-completed'))
    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
  })
})
