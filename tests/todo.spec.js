// @ts-check
import { test, expect } from '@playwright/test';

const TODO_ITEMS = ['buy groceries', 'pay electricity bill', 'book doctor appointment'];

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

async function addTodos(page, items) {
  const newTodo = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
  }
}

test.describe('TodoMVC', () => {
  test('shows empty state on first load', async ({ page }) => {
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    await expect(page.getByTestId('todo-count')).toBeHidden();
  });

  test('adds a single todo', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

  test('adds multiple todos in order', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
  });

  test('clears the input after adding a todo', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await expect(page.getByPlaceholder('What needs to be done?')).toBeEmpty();
  });

  test('does not add an empty todo', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');
    await newTodo.fill('   ');
    await newTodo.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('marks a todo as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();

    await expect(firstTodo).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('marks all todos as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.getByLabel('Mark all as complete').check();

    await expect(page.getByTestId('todo-item')).toHaveClass(['completed', 'completed', 'completed']);
    await expect(page.getByTestId('todo-count')).toHaveText('0 items left');
  });

  test('edits a todo by double-clicking', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    const secondTodo = page.getByTestId('todo-item').nth(1);
    await secondTodo.dblclick();
    const editBox = secondTodo.getByRole('textbox', { name: 'Edit' });
    await editBox.fill('pay water bill');
    await editBox.press('Enter');

    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], 'pay water bill', TODO_ITEMS[2]]);
  });

  test('deletes a todo', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    const secondTodo = page.getByTestId('todo-item').nth(1);
    await secondTodo.hover();
    await secondTodo.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('filters active and completed todos', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();

    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);

    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);

    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
  });

  test('clears completed todos', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1], TODO_ITEMS[2]]);
  });

  test('keeps todos after page reload', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 2));
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox').check();

    await page.reload();

    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS.slice(0, 2));
    await expect(page.getByTestId('todo-item').nth(0)).toHaveClass(/completed/);
  });
});
