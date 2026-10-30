# Project Rules

- Product and variant prices are stored in the database in BGN and converted to/from EUR through the helpers in `src/lib/currency.ts` (fixed rate). All customer-facing display and all admin entry fields use EUR. Keep new price fields on the same helpers rather than hardcoding a rate.
- When an admin edit form re-saves a record, an untouched price field must write back the exact stored amount (no currency round-trip drift), so re-saving a product cannot silently change its price.
