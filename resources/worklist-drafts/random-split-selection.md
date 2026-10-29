# Before

`Traveler.step()` in src/actors.js returns the first onward cell (`out[0]`), so
at a split every traveler deterministically follows the same branch.

# After

When `next` holds several onward cells, pick one uniformly at random
(`out[Math.floor(Math.random() * out.length)]`). Single-next cells are
unchanged.
