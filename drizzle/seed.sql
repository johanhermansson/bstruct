-- Seed the recurrence levels (legacy struct_levels).
-- Intervals in seconds, matching the original app:
--   Monthly  = average Gregorian month (30.44 days)
--   Quarterly ≈ quarter tropical year, Yearly ≈ tropical year
-- Idempotent: safe to re-run.
INSERT INTO struct_levels (title, level_seconds, level_order)
SELECT v.title, v.level_seconds, v.level_order
FROM (
  VALUES
    ('Daily',            86400::bigint, 1),
    ('Weekly',          604800::bigint, 2),
    ('Every two weeks',1209600::bigint, 3),
    ('Monthly',        2629744::bigint, 4),
    ('Quarterly',      7889231::bigint, 5),
    ('Yearly',        31556926::bigint, 6)
) AS v(title, level_seconds, level_order)
WHERE NOT EXISTS (SELECT 1 FROM struct_levels WHERE struct_levels.title = v.title);
