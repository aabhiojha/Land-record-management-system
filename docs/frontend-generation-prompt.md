# Frontend Generation Prompt

Use this prompt to generate a polished frontend for the Nepal Land Record Management System.

```text
You are designing and implementing the frontend for "Nepal Land Record Management System", a production-grade digital land administration platform for the Government of Nepal.

Build a visually excellent, trustworthy, accessible government web application for citizens, Malpot officers, and Nepal Sarkar administrators. The design must feel official, modern, and distinctly Nepali without becoming decorative or ceremonial.

Product context:
- The system manages land records, ownership transfers, citizen documents, officer verification, admin approval, Merkle proof verification, hash-chain integrity checks, and audit logs.
- Primary users are Nepali citizens checking their land records, Malpot officers processing records and transfers, and government administrators overseeing trust and compliance.
- The frontend stack is React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zustand, and lucide-react.
- The backend API is already available through existing API modules. Preserve the app's real workflows and role-based navigation.

Visual direction:
- Create a refined civic interface inspired by Nepal's identity: deep crimson, disciplined blue, warm paper neutrals, muted gold accents, and clean official typography.
- Use subtle Nepali visual cues such as a topographic contour texture, cadastral map lines, document seals, coordinate grids, or measured parcel boundaries. Do not use tourist cliches, temple clipart, mountains everywhere, flag spam, or generic stock-government imagery.
- The first screen after login should feel like an operational command center, not a landing page. Prioritize clear data, pending work, verification status, and next actions.
- Make records, transfers, and verification flows feel secure and high-integrity. Use strong hierarchy, clear status language, trustworthy spacing, crisp tables, useful empty states, and precise form layouts.
- Use icons where they improve scanning: land parcels, documents, transfer arrows, shield/check verification, users, audit trail, search, filters, and actions.

Interaction and motion:
- Keep animations low and purposeful. Use only short, subtle transitions for page entry, hover feedback, status changes, drawer/dialog entry, loading skeletons, and verification progress.
- Use transform and opacity animations only. Avoid bouncy motion, parallax, excessive gradients, glowing effects, spinning decorations, or constantly moving backgrounds.
- Respect prefers-reduced-motion.

Required experience:
- Role-aware dashboard for Super Admin, Malpot Officer, and Citizen.
- Land records list with search, filters, status, owner, parcel metadata, and clear row actions.
- Land record detail page with ownership history, documents, transfer status, Merkle proof, hash-chain state, and audit trail.
- Create/edit land record form with grouped official fields, validation, clear required states, and document upload affordances.
- Transfer initiation and approval workflow with visible step status from citizen request to officer verification to admin approval.
- Verification page that explains integrity results visually through a compact proof path, chain status, timestamps, and final trust result.
- User management for administrators.
- Responsive layouts that work well on mobile, tablet, and desktop without hiding critical actions.

Quality bar:
- The interface must look custom-made for Nepal's digital land administration system.
- Avoid generic AI dashboard patterns: no oversized marketing hero, no purple-blue neon gradients, no glassmorphism cards everywhere, no random metric cards, no decorative blobs, no vague placeholder copy.
- Use production-quality empty, loading, error, disabled, focused, hover, and success states.
- Keep copy concise, official, and human. Prefer labels like "Verify record integrity", "Approve transfer", "Pending officer review", and "Hash chain valid".
- Maintain accessibility: semantic structure, keyboard navigation, visible focus states, good contrast, form labels, and screen-reader-friendly status messages.
- Do not break existing API contracts or route behavior.

Implementation guidance:
- Reuse existing shadcn/ui primitives and project components where possible.
- Keep styling consistent through CSS variables and Tailwind utility patterns.
- Use responsive constraints, stable table/card dimensions, and text overflow handling so long Nepali names, parcel IDs, and document numbers do not break the layout.
- If visual assets are needed, create lightweight CSS/canvas/SVG map-line patterns or use local assets; do not rely on remote images.
- Deliver complete, working React/TypeScript code, not a mockup.
```
