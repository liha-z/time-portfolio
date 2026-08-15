import fs from 'node:fs'
import path from 'node:path'

const migrationDir = path.join(process.cwd(), 'supabase', 'migrations')

const requiredPatterns = [
  {
    name: 'pots table',
    patterns: ['ADD COLUMN IF NOT EXISTS difficulty', 'CREATE TABLE pots', 'CREATE TABLE IF NOT EXISTS public.pots'],
    match: 'any',
  },
  {
    name: 'logs table',
    patterns: ['coins_invested', 'invested_at', 'CREATE TABLE logs', 'CREATE TABLE IF NOT EXISTS public.logs'],
    match: 'any',
  },
  {
    name: 'pot_daily_scores table',
    patterns: ['CREATE TABLE IF NOT EXISTS public.pot_daily_scores', 'UNIQUE (pot_id, score_date)'],
    match: 'all',
  },
  {
    name: 'atomic time investment RPC',
    patterns: ['CREATE OR REPLACE FUNCTION public.log_time_investment', 'p_pot_id UUID', 'p_minutes INTEGER'],
    match: 'all',
  },
  {
    name: 'gap day refresh RPC',
    patterns: ['CREATE OR REPLACE FUNCTION public.refresh_current_gap_days', 'current_gap_days'],
    match: 'all',
  },
  {
    name: 'pot ownership RLS',
    patterns: ['CREATE POLICY "Users can manage their own pots"', 'CREATE POLICY "Users can manage their own logs"'],
    match: 'all',
  },
  {
    name: 'daily score ownership RLS',
    patterns: ['CREATE POLICY "Users can manage their own daily pot scores"'],
    match: 'all',
  },
]

function listMigrationFiles() {
  if (!fs.existsSync(migrationDir)) {
    throw new Error(`Migration directory not found: ${migrationDir}`)
  }

  return fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

function readMigrationText(fileName) {
  return fs.readFileSync(path.join(migrationDir, fileName), 'utf8')
}

const files = listMigrationFiles()
if (files.length === 0) {
  throw new Error('No migration files found in supabase/migrations')
}

const combinedSql = files.map(readMigrationText).join('\n')

const missing = requiredPatterns.filter(({ patterns, match }) => {
  const hasMatch = (pattern) => combinedSql.includes(pattern)
  return match === 'all'
    ? !patterns.every(hasMatch)
    : !patterns.some(hasMatch)
})

if (missing.length > 0) {
  const missingList = missing.map((entry) => entry.name).join(', ')
  throw new Error(`Missing required migration coverage for: ${missingList}`)
}

console.log(`Verified migration coverage for ${files.length} SQL files.`)
console.log('Required schema coverage found for pots, logs, pot_daily_scores, RLS, and atomic scoring RPCs.')
