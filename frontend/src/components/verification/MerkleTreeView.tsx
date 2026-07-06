import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { MerkleTreeNode, MerkleTreeSnapshot } from '@/types/verification';

// The tree is laid out on a fixed-width design canvas and the SVG stretches to
// the container, so it always spans the full page width.
//
// Two modes:
//  - Full tree: every level gets slot-proportional space; levels with room
//    render labeled boxes, dense levels fall back to small unlabeled squares.
//  - Zoomed (after verifying a record on a large tree): only the 8-leaf branch
//    containing the record is drawn in full detail, and the remaining path up
//    to the Merkle root is drawn as a compact chain with its proof siblings.
const DESIGN_W = 1200;
const PAD = 24;
const ROW_GAP = 46;
const LABELED_MIN_SPAN = 104; // px of horizontal span a node needs for a labeled box
const ZOOM_LEAVES = 8;

const truncate = (h: string) => h.slice(0, 6) + '…' + h.slice(-4);

interface SceneNode {
  key: string;
  x: number; // left edge
  y: number; // top edge
  w: number;
  h: number;
  node: MerkleTreeNode;
  isRoot: boolean;
  leafRow: boolean;
  labeled: boolean;
  hl: boolean; // on the verification path
  sibling: boolean; // proof sibling
}

interface SceneEdge {
  key: string;
  x1: number; y1: number; x2: number; y2: number;
  hl: boolean;
}

interface SceneText {
  key: string;
  x: number; y: number;
  text: string;
}

export function MerkleTreeView({ tree, highlightRecordId }: {
  tree: MerkleTreeSnapshot;
  highlightRecordId?: number | null;
}) {
  const [showFull, setShowFull] = useState(false);
  useEffect(() => setShowFull(false), [highlightRecordId]);

  const levels = tree.levels;
  const levelCount = levels.length;
  if (levelCount === 0) return null;

  const leafCount = levels[0].length;
  const top = levelCount - 1;

  // Index of the highlighted leaf, then its ancestor index at every level
  // (parent of node i is node floor(i/2) one level up).
  const highlightLeaf = highlightRecordId != null
    ? levels[0].findIndex((n) => n.recordId === highlightRecordId)
    : -1;
  const pathIndex: number[] = [];
  if (highlightLeaf >= 0) {
    let idx = highlightLeaf;
    for (let l = 0; l < levelCount; l++) {
      pathIndex[l] = idx;
      idx = Math.floor(idx / 2);
    }
  }
  const onPath = (l: number, i: number) => pathIndex.length > 0 && pathIndex[l] === i;
  const isProofSibling = (l: number, i: number) =>
    pathIndex.length > 0 && l < top && (pathIndex[l] ^ 1) === i;

  const zoomable = highlightLeaf >= 0 && leafCount > ZOOM_LEAVES;
  const zoomed = zoomable && !showFull;

  const nodes: SceneNode[] = [];
  const edges: SceneEdge[] = [];
  const texts: SceneText[] = [];
  let svgH: number;
  let showArrowheads: boolean;
  let caption: string | null = null;

  // Keep every box inside the canvas so nothing clips at the edges.
  const clampX = (x: number, w: number) => Math.min(Math.max(x, 2), DESIGN_W - 2 - w);

  if (zoomed) {
    // ---- Zoomed layout: detailed branch + compact path to the root ----
    const z = Math.min(3, top); // branch height: 2^3 = 8 leaves
    const leafStart = pathIndex[z] * ZOOM_LEAVES;
    const leafEnd = Math.min(leafStart + ZOOM_LEAVES - 1, leafCount - 1);
    const windowN = leafEnd - leafStart + 1;
    const slotZ = (DESIGN_W - PAD * 2) / ZOOM_LEAVES;
    const xOffset = ((ZOOM_LEAVES - windowN) * slotZ) / 2; // center partial windows
    showArrowheads = true;

    const boxH = (l: number) => (l === 0 ? 60 : l === top ? 40 : 30);
    const yTop = (l: number) => {
      let y = PAD + 14;
      for (let lvl = top; lvl > l; lvl--) y += boxH(lvl) + ROW_GAP;
      return y;
    };
    svgH = yTop(0) + boxH(0) + PAD;

    const leafCX = (g: number) => PAD + xOffset + (g - leafStart) * slotZ + slotZ / 2;
    // Center of a branch node over the window slice of leaves it covers.
    const branchCX = (l: number, i: number) => {
      const first = Math.max(i * 2 ** l, leafStart);
      const last = Math.min(i * 2 ** l + 2 ** l - 1, leafEnd);
      return (leafCX(first) + leafCX(last)) / 2;
    };
    // x-center of the path node at any level.
    const pathCX = (l: number) => (l <= z ? branchCX(l, pathIndex[l]) : DESIGN_W / 2);

    const pushEdge = (key: string, x1: number, y1: number, l2: number, x2c: number, hl: boolean) => {
      const x2 = x2c + (x1 - x2c) * 0.3; // land toward the child's side of the parent
      edges.push({ key, x1, y1: y1 - 4, x2, y2: yTop(l2) + boxH(l2) + 6, hl });
    };

    // Branch nodes and edges (levels 0..z inside the window)
    for (let l = 0; l <= z; l++) {
      const from = Math.floor(leafStart / 2 ** l);
      const to = Math.floor(leafEnd / 2 ** l);
      for (let i = from; i <= to; i++) {
        const node = levels[l][i];
        const w = l === 0 ? Math.min(120, slotZ - 16) : 96;
        const h = boxH(l);
        nodes.push({
          key: `n-${l}-${i}`,
          x: clampX(branchCX(l, i) - w / 2, w),
          y: yTop(l),
          w, h, node,
          isRoot: l === top,
          leafRow: l === 0,
          labeled: true,
          hl: onPath(l, i),
          sibling: isProofSibling(l, i),
        });
        if (l < z) {
          pushEdge(`e-${l}-${i}`, branchCX(l, i), yTop(l), l + 1,
            branchCX(l + 1, Math.floor(i / 2)), onPath(l, i));
        }
      }
    }

    // Path to the root (levels z+1..top) with the proof sibling of each step
    for (let l = z + 1; l <= top; l++) {
      const isRoot = l === top;
      const w = isRoot ? 224 : 96;
      const h = boxH(l);
      nodes.push({
        key: `n-${l}-${pathIndex[l]}`,
        x: clampX(DESIGN_W / 2 - w / 2, w),
        y: yTop(l),
        w, h,
        node: levels[l][pathIndex[l]],
        isRoot,
        leafRow: false,
        labeled: true,
        hl: true,
        sibling: false,
      });
      edges.push({
        key: `e-path-${l}`,
        x1: pathCX(l - 1), y1: yTop(l - 1) - 4,
        x2: DESIGN_W / 2 - 20, y2: yTop(l) + h + 6,
        hl: true,
      });

      // Proof sibling of the child level, combined into this parent
      const childL = l - 1;
      const sibIdx = pathIndex[childL] ^ 1;
      const sib = levels[childL][sibIdx];
      if (sib) {
        const right = sibIdx > pathIndex[childL];
        const sw = 96;
        const scx = childL === z
          ? (right ? DESIGN_W - PAD - sw / 2 : PAD + sw / 2)
          : DESIGN_W / 2 + (right ? 180 : -180);
        if (childL > z) {
          nodes.push({
            key: `n-${childL}-${sibIdx}`,
            x: clampX(scx - sw / 2, sw),
            y: yTop(childL),
            w: sw, h: boxH(childL),
            node: sib,
            isRoot: false,
            leafRow: false,
            labeled: true,
            hl: false,
            sibling: true,
          });
          edges.push({
            key: `e-sib-${childL}`,
            x1: scx, y1: yTop(childL) - 4,
            x2: DESIGN_W / 2 + 20, y2: yTop(l) + h + 6,
            hl: false,
          });
        } else {
          // Sibling of the branch root: an off-screen subtree; pin it at the edge
          nodes.push({
            key: `n-${childL}-${sibIdx}`,
            x: clampX(scx - sw / 2, sw),
            y: yTop(childL),
            w: sw, h: boxH(childL),
            node: sib,
            isRoot: false,
            leafRow: false,
            labeled: true,
            hl: false,
            sibling: true,
          });
          edges.push({
            key: `e-sib-${childL}`,
            x1: scx, y1: yTop(childL) - 4,
            x2: DESIGN_W / 2 + (right ? 20 : -20), y2: yTop(l) + h + 6,
            hl: false,
          });
        }
      }
    }

    // Hint that the tree continues beyond the window
    if (leafStart > 0) {
      texts.push({ key: 't-left', x: PAD / 2 + 4, y: yTop(0) + 34, text: '⋯' });
    }
    if (leafEnd < leafCount - 1) {
      texts.push({ key: 't-right', x: DESIGN_W - PAD / 2 - 4, y: yTop(0) + 34, text: '⋯' });
    }

    caption = `Zoomed to the branch with records ${leafStart + 1}–${leafEnd + 1} of ${tree.leafCount}`;
  } else {
    // ---- Full-tree layout ----
    const slot = (DESIGN_W - PAD * 2) / leafCount;
    showArrowheads = slot >= 40;

    const span = (l: number) => slot * 2 ** l;
    const labeled = (l: number) => l === top || span(l) >= LABELED_MIN_SPAN;
    const boxW = (l: number) => {
      if (l === top) return Math.min(224, DESIGN_W - PAD * 2);
      if (labeled(l)) return Math.min(96, span(l) - 8);
      return Math.max(6, Math.min(18, span(l) - 4));
    };
    const boxH = (l: number) => {
      if (l === top) return 40;
      if (labeled(l)) return l === 0 ? 60 : 30;
      return Math.max(6, Math.min(14, boxW(l)));
    };
    const yTop = (l: number) => {
      let y = PAD + 14;
      for (let lvl = top; lvl > l; lvl--) y += boxH(lvl) + ROW_GAP;
      return y;
    };
    svgH = yTop(0) + boxH(0) + PAD;

    const leafCenterX = (i: number) => PAD + i * slot + slot / 2;
    const centerX = (l: number, i: number) => {
      // Padding duplicates sit past the last real leaf; clamp so they render
      // at the right edge instead of outside the canvas.
      const first = Math.min(i * 2 ** l, leafCount - 1);
      const last = Math.min(first + 2 ** l - 1, leafCount - 1);
      return Math.min((leafCenterX(first) + leafCenterX(last)) / 2, DESIGN_W - PAD - 12);
    };

    for (let l = 0; l < levelCount; l++) {
      for (let i = 0; i < levels[l].length; i++) {
        const node = levels[l][i];
        const isRoot = l === top;
        const isLeafRow = l === 0;
        // Internal padding copies are algorithm artifacts; render them as
        // small squares so they don't crowd the real node next to them.
        const shrunk = node.duplicate && !isLeafRow && !isRoot;
        const w = shrunk ? 14 : boxW(l);
        const h = shrunk ? 14 : boxH(l);
        nodes.push({
          key: `n-${l}-${i}`,
          x: clampX(centerX(l, i) - w / 2, w),
          y: yTop(l) + (shrunk ? (boxH(l) - 14) / 2 : 0),
          w, h, node,
          isRoot,
          leafRow: isLeafRow,
          labeled: labeled(l) && !shrunk,
          hl: onPath(l, i),
          sibling: isProofSibling(l, i),
        });
        if (l < top) {
          const x1 = centerX(l, i);
          const px = centerX(l + 1, Math.floor(i / 2));
          edges.push({
            key: `e-${l}-${i}`,
            x1,
            y1: yTop(l) - (showArrowheads ? 4 : 1),
            x2: px + (x1 - px) * 0.3,
            y2: yTop(l + 1) + boxH(l + 1) + (showArrowheads ? 6 : 1),
            hl: onPath(l, i),
          });
        }
      }
    }
  }

  return (
    <div>
      <div className="rounded-md border bg-white">
        <svg viewBox={`0 0 ${DESIGN_W} ${svgH}`} className="block h-auto w-full">
          <defs>
            <marker id="mt-arrow" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
            </marker>
            <marker id="mt-arrow-hl" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
            </marker>
          </defs>

          {edges.map((e) => (
            <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={e.hl ? '#059669' : '#cbd5e1'} strokeWidth={e.hl ? 2 : 1.25}
              markerEnd={showArrowheads ? (e.hl ? 'url(#mt-arrow-hl)' : 'url(#mt-arrow)') : undefined} />
          ))}

          {nodes.map((n) => {
            const { node } = n;
            const stroke = n.hl ? '#059669' : n.sibling ? '#f59e0b' : 'none';
            const tooltip = n.leafRow
              ? (node.duplicate ? 'Padding copy' : `Kitta ${node.kittaNumber} (record ${node.recordId})`) + '\n' + node.hash
              : (n.isRoot ? 'Merkle root\n' : node.duplicate ? 'Padding copy\n' : '') + node.hash;
            return (
              <g key={n.key} transform={`translate(${n.x}, ${n.y})`}>
                <title>{tooltip}</title>
                {n.isRoot && (
                  <text x={n.w / 2} y={-6} textAnchor="middle" fontSize={10}
                    fontWeight={600} fill="#6b7280" letterSpacing="0.06em">
                    MERKLE ROOT
                  </text>
                )}
                <rect width={n.w} height={n.h} rx={n.labeled ? 6 : 2}
                  fill={n.leafRow ? (node.duplicate ? '#a7f3d0' : '#34d399') : '#e5e7eb'}
                  stroke={stroke} strokeWidth={2}
                  strokeDasharray={n.sibling ? '4 3' : undefined} />
                {n.leafRow && n.labeled && (
                  <>
                    <text x={n.w / 2} y={24} textAnchor="middle" fontSize={11}
                      fontWeight={600} fill="#064e3b">
                      {node.duplicate ? '(copy)' : node.kittaNumber ?? 'Leaf'}
                    </text>
                    <text x={n.w / 2} y={42} textAnchor="middle" fontSize={9}
                      fontFamily="monospace" fill="#065f46">
                      {truncate(node.hash)}
                    </text>
                  </>
                )}
                {!n.leafRow && n.labeled && (
                  <text x={n.w / 2} y={n.h / 2 + 3.5} textAnchor="middle" fontSize={10}
                    fontFamily="monospace" fill="#374151">
                    {n.isRoot ? node.hash.slice(0, 12) + '…' + node.hash.slice(-8) : truncate(node.hash)}
                  </text>
                )}
              </g>
            );
          })}

          {texts.map((t) => (
            <text key={t.key} x={t.x} y={t.y} textAnchor="middle" fontSize={18}
              fontWeight={700} fill="#9ca3af">
              {t.text}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#34d399]" /> Record leaf (SHA-256)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#e5e7eb]" /> Combined hash
        </span>
        {highlightLeaf >= 0 && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border-2 border-[#059669]" /> Verification path
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-[#f59e0b]" /> Proof sibling
            </span>
          </>
        )}
        <span>
          {caption ?? `${tree.leafCount} record${tree.leafCount === 1 ? '' : 's'} · height ${tree.treeHeight}`}
          {' · hover a node for its full hash'}
        </span>
        {zoomable && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
            onClick={() => setShowFull((v) => !v)}>
            {zoomed ? 'Show full tree' : 'Zoom to verified record'}
          </Button>
        )}
      </div>
    </div>
  );
}
