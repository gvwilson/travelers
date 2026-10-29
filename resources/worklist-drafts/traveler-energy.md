# Before

`Traveler` stores `usesEnergy` and `pointValue` but has no `energy` field or
spend/slow/expire logic, and the src/main.js loop doesn't handle energy.

# After

Give energy-spending kinds (Merchant, Refugee) an energy budget; spend it per
step in `Traveler.step()`; slow them when low; remove them when depleted.
Tunables live in src/actors.js (the plan's central CONFIG is a later roadmap
item).
