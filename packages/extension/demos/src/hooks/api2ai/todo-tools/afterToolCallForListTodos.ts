import type { InvokeOptions } from '../../../../generated/api2ai/tools/todo-tools.js';

type TodoListResult = {
    todos: Array<{
        id?: unknown;
        title?: unknown;
        status?: unknown;
        categoryId?: unknown;
        dueDate?: unknown;
    }>;
};

function isTodoListResult(value: unknown): value is TodoListResult {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return Array.isArray((value as TodoListResult).todos);
}

/**
 * afterToolCall for listTodos — optional client-side titleContains filter (hookParams; never sent to HTTP).
 */
export function afterToolCallForListTodos(result: unknown, options: InvokeOptions, credential: string): unknown {
    void credential;
    if (!isTodoListResult(result)) {
        throw new Error('afterToolCallForListTodos expected { todos: [...] } from listTodos');
    }
    const raw = options.hookParams?.titleContains;
    const needle =
        typeof raw === 'string' ? raw.trim().toLowerCase() : raw != null ? String(raw).trim().toLowerCase() : '';
    if (!needle) {
        return result;
    }
    const todos = result.todos.filter((todo) => {
        const title = typeof todo.title === 'string' ? todo.title.toLowerCase() : '';
        return title.includes(needle);
    });
    return { ...result, todos };
}
