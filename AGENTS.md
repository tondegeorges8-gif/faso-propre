# Project Architecture Rules

- Reuse `PaymentOperators` for every Orange Money, Moov Africa, or Wave selector so payment choices stay consistent across transactional screens.
- Product cards open variant selection through the product detail query parameter and send ordering to the shared cart, keeping purchase actions consistent across shop and marketplace grids.