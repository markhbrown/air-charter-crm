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
