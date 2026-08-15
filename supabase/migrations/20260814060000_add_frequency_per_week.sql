-- Add frequency_per_week column to pots table
-- This tracks how many times per week the user plans to invest in this habit
-- Used for streak calculation (e.g., 7 = daily, 3 = 3 times/week, 1 = once/week)
ALTER TABLE pots
ADD COLUMN frequency_per_week INTEGER NOT NULL DEFAULT 7;
