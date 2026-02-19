# Contribute Similar Thread Feedback — Backend Spec

This document describes what the **backend repo** (Supabase project for contribute) must implement so the www app’s “Similar solved threads” feedback flow works end-to-end. The frontend calls a single Edge Function; the backend owns the table and the function.

## 1. Table: `contribute_similar_thread_feedback`

```sql
CREATE TABLE contribute_similar_thread_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_thread_id text NOT NULL,
  similar_thread_key text,
  reaction text NOT NULL CHECK (reaction IN ('positive', 'negative')),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: allow anon insert and update (no auth required for public feedback)
ALTER TABLE contribute_similar_thread_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON contribute_similar_thread_feedback FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON contribute_similar_thread_feedback FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

Optional: add `updated_at` trigger so it’s set on every UPDATE:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribute_similar_thread_feedback_updated_at
  BEFORE UPDATE ON contribute_similar_thread_feedback
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## 2. Edge Function: `contribute-feedback`

**Name:** `contribute-feedback` (this is what the frontend invokes via `supabase.functions.invoke('contribute-feedback', { body })`).

**Contract:** One function, two actions via JSON body.

### Action: `create`

- **When:** User clicks thumbs up or thumbs down; frontend creates a row immediately and opens the dialog.
- **Request body:**
  - `action`: `"create"`
  - `parent_thread_id`: string (required) — e.g. `"860-66969-5203-dm_1461061779504496673"`
  - `reaction`: `"positive"` | `"negative"`
  - `similar_thread_key`: string | null (optional; section-level feedback when not tied to a single similar thread)
- **Backend:** INSERT one row into `contribute_similar_thread_feedback` with the given fields; `feedback` is null.
- **Response:** `{ "id": "<uuid>" }` (the new row’s `id`). Status 200.

### Action: `update`

- **When:** User submits the dialog (optionally after changing reaction or adding text).
- **Request body:**
  - `action`: `"update"`
  - `id`: string (uuid of the row returned from `create`)
  - `reaction`: `"positive"` | `"negative"`
  - `feedback`: string | null (optional freeform text from the dialog)
- **Backend:** UPDATE the row with the given `id`, set `reaction` and `feedback`, and `updated_at = now()`. Return success even if only one of them is provided.
- **Response:** `{ "success": true }`. Status 200.

### Errors

- On validation failure (e.g. missing required fields, invalid `reaction`): return 400 with a JSON body describing the error.
- On “row not found” for `update`: return 404.
- On server/DB error: return 5xx.

## 3. Flow summary

1. User clicks thumbs up/down → frontend calls Edge Function with `action: "create"` → backend INSERTs → returns `id`.
2. Frontend opens dialog with reaction prefilled; user can change reaction and/or add text.
3. User clicks “Submit feedback” (or closes dialog; frontend may send update on close) → frontend calls Edge Function with `action: "update"`, `id`, `reaction`, `feedback` → backend UPDATEs same row → returns `{ success: true }`.

Result: **one feedback record per session**, with reaction captured immediately and optional text/updated reaction applied in a single update.
