# Project Architecture Rules

- Admin navigation and routes use a shared server-validated access hook and guard; the registration directory uses an authenticated security-definer RPC checked against the current Auth identity, never editable profile data. This keeps presentation restrictions backed by server authorization.
- The registration directory pages over Auth users with a left join to profiles so accounts without profiles are included; city comes from the latest report or existing signup metadata and stays unknown when unavailable.

- Reuse `PaymentOperators` for every Orange Money, Moov Africa, or Wave selector so payment choices stay consistent across transactional screens.
- Product cards open variant selection through the product detail query parameter and send ordering to the shared cart, keeping purchase actions consistent across shop and marketplace grids.
- Gate retired directory, marketplace and cart entries through `FEATURE_AVAILABILITY`; preserve source, assets and backend data so restoration never requires rebuilding them.
- Before changing files to retire options, preserve exact originals under `.lovable/retired-options/originals`; use these as the restoration baseline without overwriting later unrelated changes.
