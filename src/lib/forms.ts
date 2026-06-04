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
  // The submitted values, echoed back on validation failure so the form can
  // repopulate them. React 19 resets a `<form action>` after submit, which
  // would otherwise clear what the user typed.
  values?: Record<string, string>;
} | null;

/**
 * Wraps a form Server Action so that an unexpected rejection — an uncaught
 * server exception, or the browser being offline so the request never reaches
 * the server — becomes an in-form `FormState` error instead of bubbling to the
 * nearest `error.tsx` boundary (a full-page crash).
 *
 * The returned reducer runs on the client (it's the `useActionState` reducer),
 * so its try/catch catches both the rejected server-action promise and a failed
 * fetch. Submitted values are re-derived from the FormData so the form keeps
 * what the user typed.
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
        values: Object.fromEntries(
          [...formData.entries()].filter(
            ([key, value]) => typeof value === "string" && key !== "id",
          ),
        ) as Record<string, string>,
      };
    }
  };
}
