# Before

The traveler kinds already carry distinct `moveInterval`s in src/actors.js
(courier 0.3, merchant 0.55, pilgrim 0.45, refugee 0.4, tourist 0.8), but
PLAN.md's traveler table has no speed column.

# After

Document each kind's speed in PLAN.md. No code change unless the interval
spread is revised.
