# Reversible retirement

Directory, Faso Yaar and cart are disabled through src/config/retiredFeatures.ts. Their pages, components, assets, database tables and user records were not deleted. Messages remain available as an independent citizen service.

## Restore only on explicit owner request
1. Read mem://features/retired-options and existing feature requirements.
2. Enable the requested FEATURE_AVAILABILITY keys (cart needs Faso Yaar).
3. Restore assistant knowledge from PRESERVED_SYSTEM_PROMPT and deploy ai-assistant.
4. Compare exact original files under originals/ with current files. Restore missing entries without overwriting unrelated later work.
5. Verify signup, merchant shop, product variants, cart, delivery/pickup, payment selectors and seller listings using a signed-in account. Never drop or recreate existing data.
