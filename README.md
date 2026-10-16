# Travelers

"Travelers" is a lightweight browser-based single-player game.  It looks like a
tower defense game, but the goal is to help travelers reach their destination
rather than killing them.

-   The game is continuous, not turn-based.
-   Travelers may be pilgrims, merchants, refugees, postmen, or tourists.
-   The dangers they face include wild animals, bandits, floods, collapsed
    bridges, plagues, and hunger.
-   The map is a grid with a path one cell wide.  There is always one or more
    entry cells where new travelers come onto the map, and one or more exit
    cells where travelers leave the map (earning the player points).  The path
    may split and join, but is always fully connected, and travelers only move
    one way through any particular path cell (unless it is a splitting cell, in
    which case they may take either of the exit paths).
-   Some travelers must spend energy points to move.  As those travelers run out
    of energy points, they slow down, and eventually expire.
-   The player starts with some points.  The player earns more points for each
    traveler who safely exits the board.
-   The player can spend points to build towers at fixed locations along the
    path.  These towers support the travelers in different ways.  For example,
    travelers who use energy points to move can pause at a Hostel tower in order
    to refresh their energy points.  An Engineer tower can send workers out to
    repair collapsed bridges or damaged roads.  A Guard tower can send soldiers
    out to fend off bandits or wild animals.

## Implementation

-   Use KAPLAY (a lightweight JavaScript game engine) loaded from a CDN.
-   Create classes to represent towers, travelers, dangers, the map, and so on.
-   Create a random map generator.
-   We will add sound effects and graphic icons later. For now, use simple
    markers such as circled charactors to show each entity.
-   For now, create a single HTML page that loads all of the JavaScript files.
    We will worry about bundling and packaging for distribution later.

## Running

The game is a static site with no build step. It loads KAPLAY from a CDN and
uses ES modules, so it must be served over HTTP rather than opened directly from
the filesystem.

From the project root, run:

    python3 -m http.server 8000

then open <http://localhost:8000> in a browser. Reload the page to generate a
new map.
