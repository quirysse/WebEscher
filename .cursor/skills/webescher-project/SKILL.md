---
name: webescher-project
description: Summarizes the WebEscher repository, tech stack, architecture, and plane tiling (Escher-style wallpaper groups). Use when working on the WebEscher codebase, answering questions about the project, or implementing features related to tiling, symmetry, or the editor.
---

# WebEscher Project

## Repo and deployment

- **Repository**: `git@github.com:quirysse/WebEscher.git`
- **Deployment**: Clever Cloud, **Static** application (not Node.js). Env vars: `CC_WEBROOT=/dist`, `CC_PRE_BUILD_HOOK=npm ci`, `CC_POST_BUILD_HOOK=npm run build`. Custom domain SSL via Clever Cloud domain config + DNS CNAME.
- **Build**: `npm run build` (TypeScript + Vite); output in `dist/`.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | React 19, TypeScript 5.9 |
| Build | Vite 7, @vitejs/plugin-react |
| Styling | Tailwind CSS 4 (@tailwindcss/vite) |
| State | Zustand (single store: `tilingStore`) |
| i18n | i18next + react-i18next (en, fr, it, es, ja) |
| Canvas | **Canvas 2D native** (no Paper.js in use; Paper is in package.json but rendering is 100% Canvas 2D) |
| Tests | Vitest, Testing Library, Playwright (e2e) |

## Conventions

- **Indentation**: Allman style for braces (opening brace on new line); one-liners can stay on one line.
- **Naming**: CamelCase; stay consistent with existing code.
- **Language**: All code, comments, and commit messages in **English**. User-facing chat may be in French.
- **Validation**: Plan validations and intermediate checks when implementing or planning features.

## Project structure (key paths)

```
src/
├── App.tsx                 # Layout: header, sidebar drawer (mobile), main canvas area
├── main.tsx, index.css
├── i18n/
│   ├── index.ts            # i18next init, resources (en, fr, it, es, ja)
│   └── locales/*.json      # Translation keys (app, sidebar, canvas)
├── store/
│   └── tilingStore.ts      # Wallpaper group, base shape, shapePoints, history, roleColors
├── engine/                 # Tiling math and generation
│   ├── types.ts            # Vector2D, AffineTransform, LatticeType, WallpaperGroupDef, TileInstance, Viewport
│   ├── lattice.ts          # getBaseVectors, getTranslationsForViewport (lattice types)
│   ├── wallpaperGroups.ts  # getWallpaperGroupDef(id) → cell symmetries per group
│   ├── tileGenerator.ts    # generateTileInstances(groupId, tileSize, viewport), transformPoint
│   └── constraints.ts      # EdgeConstraint, getEdgeConstraints, applyConstraints (per-group)
├── data/
│   └── wallpaperGroupsData.ts  # WALLPAPER_GROUPS, GROUPS_BY_FAMILY, WallpaperFamily
├── editor/
│   ├── shapeEditor.ts      # updatePointAt, clampToTile, subdivideEdges
│   └── history.ts          # Undo/redo (createHistory, pushHistory, undo, redo)
├── utils/
│   ├── math.ts             # Affine: identity, translation, rotationAround, reflectX/Y, multiply, applyToPoint
│   ├── defaultShape.ts      # getDefaultShapePoints(shapeId, tileSize) — square, triangle, hexagon
│   └── export.ts           # exportCanvasToPNG
└── components/
    ├── Canvas/
    │   └── TilingCanvas.tsx   # Canvas 2D draw, zoom/pan (wheel + touch pinch), handle drag (mouse + touch)
    ├── Sidebar/
    │   ├── GroupSelector.tsx, ShapeSelector.tsx, ColorPanel.tsx, Toolbar.tsx
    │   └── Toolbar.tsx         # Reset, smooth, undo, redo, export (EXPORT_PNG_EVENT)
    └── common/
        └── LanguageSwitcher.tsx  # Select with flags (EN, FR, IT, ES, JA)
```

## Plane tiling and wallpaper groups (Escher context)

- **Goal**: Edit a single **master shape** (prototype) in a **fundamental cell** `[0, tileSize]²`; the app replicates it across the plane using the symmetries of the chosen **wallpaper group**.
- **17 wallpaper groups**: Classify discrete symmetries of the plane (translations + rotations/reflections/glides). Each group has a **lattice type** and **cell symmetries** (transforms that map the cell to itself or to copies in one cell).
- **Lattice types** (from `engine/lattice.ts`): `square`, `rectangular`, `rhombic`, `oblique`, `hexagonal`. Base vectors define the unit cell; `getTranslationsForViewport` returns translation transforms for cells intersecting the viewport.
- **Cell transforms**: For each group, `getWallpaperGroupDef(id).getCellTransforms(tileSize)` returns affine transforms from the prototype (in `[0,tileSize]²`) to each tile in one cell (e.g. p1: 1; p2: 2 (identity + 180° rotation); p4: 4, etc.). Combined with lattice translations, this gives all tile instances.
- **Roles**: Each cell transform has a `roleIndex`; colors are assigned per role (`roleColors` in store, `getRoleColor(index)`).
- **Editing**: User drags **vertices** (handles) of the master polygon. Points are **clamped to the tile** (`clampToTile`) so the shape stays inside the cell. **Constraints** (e.g. paired edges) can be applied per group via `engine/constraints.ts` (currently minimal).
- **Shapes**: Base shapes are polygons (square, triangle, hexagon) with default points in `[0, tileSize]²`; shapes are **polylines** (no Bézier/splines in data; comment in TilingCanvas notes possible spline extension via `quadraticCurveTo`/`bezierCurveTo`).

## Key constants and behavior

- **TILE_SIZE**: 100 in `TilingCanvas.tsx`, 80 in `tilingStore.ts` and `defaultShape` usage from store. Unify if changing.
- **Canvas view**: Center of screen = world origin; view transform is translate(cx,cy) → scale(zoom) → translate(-pan). Initial pan = (TILE_SIZE/2, TILE_SIZE/2) so default shape center is on screen. Zoom on wheel (and touch pinch), min/max zoom 0.2–4.
- **Coordinates**: Mouse/touch converted to “canvas pixel” then to world via `(screen - center) / zoom + pan`. Hit-test and drag use world coordinates.
- **Handles**: Drawn with high contrast (white fill, dark stroke). Radius `HANDLE_RADIUS` (10).

## i18n keys (structure)

- `app.title`, `app.subtitle`
- `sidebar.open`, `sidebar.close`, `sidebar.title`, `sidebar.groupSelector.*`, `sidebar.groups.*`, `sidebar.shapeSelector.*`, `sidebar.colorPanel.title`, `sidebar.toolbar.*`
- `canvas.placeholder`

## Testing and scripts

- Unit: `npm run test` / `npm run test:run` (Vitest).
- E2E: `npm run test:e2e` (Playwright).
- Lint: `npm run lint`.

## Optional reference

- Deeper tiling/Escher math and group list: see [reference.md](reference.md) in this skill folder.
