# Dashboard — Claude Instructions

## UI

- Always use **shadcn/ui** components. Add new ones: `npx shadcn@latest add <component>`
- Components at `@/components/ui/`. Config in `components.json` (style: `base-nova`, lucide icons)
- Icons: **lucide-react** only
- Styling: Tailwind utilities + CSS variables from `src/index.css`. No inline styles, no new CSS files
- Never use raw `<button>`, `<input>`, `<select>` — use shadcn primitives
- Never install other UI libraries
