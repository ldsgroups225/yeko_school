/**
 * Compares two objects and returns an object containing only the fields that have changed.
 *
 * @template T - The type of the objects being compared. Must extend Record<string, unknown>.
 * @param {T} formValue - The current form values.
 * @param {T | undefined} initialForm - The initial form values to compare against. If undefined, the function returns the formValue as is.
 * @returns {Partial<T>} An object containing only the fields that have changed.
 *
 * @example
 * const initialForm = { name: 'John', age: 30, city: 'New York' };
 * const updatedForm = { name: 'John', age: 31, city: 'Boston' };
 * const changedFields = getChangedFields(updatedForm, initialForm);
 * // Result: { age: 31, city: 'Boston' }
 *
 * @example
 * const initialForm = undefined;
 * const currentForm = { name: 'Alice', age: 25 };
 * const changedFields = getChangedFields(currentForm, initialForm);
 * // Result: { name: 'Alice', age: 25 }
 */
export function getChangedFields<T extends Record<string, unknown>>(
  formValue: T,
  initialForm: T | undefined,
): Partial<T> {
  if (!initialForm) {
    return formValue
  }
  return Object.entries(formValue).reduce((acc, [key, currentValue]) => {
    const typedKey = key as keyof T
    if (currentValue !== initialForm[typedKey]) {
      acc[typedKey] = currentValue as T[keyof T]
    }
    return acc
  }, {} as Partial<T>)
}
