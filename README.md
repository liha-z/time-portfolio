# Time Portfolio

Time Portfolio is a habit-tracking app where users create habit pots, invest time into them, and monitor whether they are staying on track using daily effort, weekly frequency, and a maturation score model.

## Local developer workflow

Use Supabase migrations as the source of truth for schema changes.

1. Make a schema change in a new SQL migration under `supabase/migrations/`.
2. Run the local migration check and tests before shipping changes.
3. Push the migration using the Supabase CLI.
4. Deploy the application after the database and app are both verified.

Example workflow:

```bash
supabase migration new <name>
supabase db push
npm run verify
```

## Verification commands

```bash
npm run typecheck
npm run lint
npm run test
npm run verify:db
```

The database verification script confirms the repository includes the expected migrations for the core schema, row-level security, and atomic score logging functions.

## Reliability notes

- Keep all schema, RLS, function, and index changes in timestamped migration files.
- Do not use destructive database resets in active environments.
- Preserve existing user data while reconciling any live schema drift.
- Treat the database as the authoritative system for scoring, not the UI layer.
