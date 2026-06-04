/**
 * Return shape for form Server Actions used with React's `useActionState`.
 * - `ok`          -> the mutation succeeded (the dialog closes on this).
 * - `error`       -> a form-level error message (e.g. a database error).
 * - `fieldErrors` -> per-field validation messages, keyed by input name.
 */
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

/**
 * Wraps a form Server Action so that an unexpected rejection — an uncaught
 * server exception, or the browser being offline so the request never reaches
 * the server — becomes an in-form `FormState` error instead of bubbling to the
 * nearest `error.tsx` boundary (a full-page crash).
 *
 * The returned reducer runs on the client (it's the `useActionState` reducer),
 * so its try/catch catches both the rejected server-action promise and a failed
 * fetch. The form fields are controlled, so they keep what the user typed.
 */
export function withSubmitErrorHandling(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
) {
  return async (prev: FormState, formData: FormData): Promise<FormState> => {
    try {
      return await action(prev, formData);
    } catch {
      return {
        error: "Couldn't reach the server — check your connection and try again.",
      };
    }
  };
}
