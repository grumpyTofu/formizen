import { test, expect } from 'bun:test';
import { Form } from './form';
import * as yup from 'yup';

const testForm = `
    <form data-testid="test-form" hx-post="/api/test" data-token="">
      <div class="mb-6">
      <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
      <input
          type="text"
          name="username"
          required
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <p data-error="username" class="text-red-400"></p>
      </div>

      <div class="mb-6">
      <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
      <input
          type="text"
          name="email"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <p data-error="email" class="text-red-400"></p>
      </div>

      <button type="submit">Submit</button>
    </form>
`;

test('Form', async () => {
  const expectedError = 'Field is required';
  document.body.innerHTML = testForm;

  const validationSchema = yup.object({
    username: yup.string().min(3, 'Must be longer than 3 characters').required(expectedError),
    email: yup.string().email('Must be a valid email').required(expectedError),
  });

  const form = new Form(document.querySelector('[data-testid="test-form"]')).addValidationSchema(
    validationSchema
  );

  await form.onSubmit({ preventDefault: () => {} } as any);

  expect(document.querySelector('[data-error="username"]')?.textContent).toEqual(expectedError);
});
