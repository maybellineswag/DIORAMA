"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Wand2,
  Link2,
  RefreshCw,
  Inbox,
  Move,
  Plus,
  FolderPlus,
  Info,
  Share2,
  Pencil,
  BookOpen,
  Download,
  ChevronRight,
  Trash2,
  FolderInput,
  ExternalLink,
  Play,
  FileText,
  StickyNote,
  Link as LinkIcon,
  ImagePlus,
  Check,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { MoodFreeFolders, FolderGlyph } from "@/components/app/mood-free-folders";
import { MoodConnections } from "@/components/app/mood-connections";
import { MoodAiSortOnboarding } from "@/components/app/mood-ai-sort";
import { MoodSorter } from "@/components/app/mood-sorter";
import { useContextMenu, type CtxItem } from "@/components/app/context-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONNECTIONS, MOOD_IMPORTS, type Connection } from "@/lib/mock/commerce";
import { MOODBOARD_PHOTOS } from "@/lib/mock/data";
import {
  BOARDS,
  BLOCKS,
  rootBoards,
  childBoards,
  boardsContaining,
  boardCount,
  boardPath,
  type Board,
  type Block,
} from "@/lib/mock/moodboard";
import { cn } from "@/lib/utils";

function Initials({ name }: { name: string }) {
  const i = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span className="flex size-6 items-center justify-center rounded-full border bg-surface-2 text-[10px] font-medium">
      {i}
    </span>
  );
}

export default function MoodboardPage() {
  const { openMenu, contextMenu } = useContextMenu();
  const [boards, setBoards] = React.useState<Board[]>(BOARDS);
  const [blocks, setBlocks] = React.useState<Block[]>(BLOCKS);
  const [view, setView] = React.useState<"folders" | "imports">("folders");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = React.useState(false);

  const [imports, setImports] = React.useState(MOOD_IMPORTS);
  const [connections, setConnections] = React.useState<Connection[]>(CONNECTIONS);
  const synced = connections.find((c) => c.connected);

  const [connOpen, setConnOpen] = React.useState(false);
  const [onboardOpen, setOnboardOpen] = React.useState(false);
  const [sorterOpen, setSorterOpen] = React.useState(false);
  const [sorterSeed, setSorterSeed] = React.useState<{ id: string; src: string }[] | null>(null);
  const [sortingImports, setSortingImports] = React.useState(false);
  const [infoBoard, setInfoBoard] = React.useState<Board | null>(null);
  const [shareBoard, setShareBoard] = React.useState<Board | null>(null);
  const [bookBoard, setBookBoard] = React.useState<Board | null>(null);
  const [preview, setPreview] = React.useState<Block | null>(null);
  const [connectBlock, setConnectBlock] = React.useState<Block | null>(null);
  const [boardDialog, setBoardDialog] = React.useState<
    { mode: "new" | "rename"; value: string; parentId: string | null; id?: string } | null
  >(null);
  const [addBlock, setAddBlock] = React.useState<
    { boardId: string; kind: "link" | "note"; value: string; title: string } | null
  >(null);

  const bById = (id: string) => blocks.find((b) => b.id === id);
  const openBoard = openId ? boards.find((b) => b.id === openId) ?? null : null;

  React.useEffect(() => { setSelected(new Set()); setSelectMode(false); }, [openId, view]);

  // ── mutations ──
  const addBoard = (name: string, parentId: string | null) => {
    const id = `bd-${Date.now().toString(36)}`;
    const today = new Date().toISOString().slice(0, 10);
    setBoards((bs) => [
      ...bs,
      {
        id,
        name,
        parentId,
        blockIds: [],
        createdAt: today,
        updatedAt: today,
        contributors: ["Grisha Obolenskiy"],
        visibility: "Team",
      },
    ]);
    return id;
  };
  const renameBoard = (id: string, name: string) =>
    setBoards((bs) => bs.map((b) => (b.id === id ? { ...b, name } : b)));
  const deleteBoard = (id: string) => {
    setBoards((bs) => bs.filter((b) => b.id !== id && b.parentId !== id));
    if (openId === id) setOpenId(null);
    toast.success("Folder moved to Trash");
  };
  const setVisibility = (id: string, v: Board["visibility"]) =>
    setBoards((bs) => bs.map((b) => (b.id === id ? { ...b, visibility: v } : b)));
  const addToBoard = (boardId: string, blockId: string) =>
    setBoards((bs) =>
      bs.map((b) =>
        b.id === boardId && !b.blockIds.includes(blockId)
          ? { ...b, blockIds: [blockId, ...b.blockIds] }
          : b,
      ),
    );
  const removeFromBoard = (boardId: string, blockId: string) =>
    setBoards((bs) =>
      bs.map((b) => (b.id === boardId ? { ...b, blockIds: b.blockIds.filter((x) => x !== blockId) } : b)),
    );

  const createBlockInBoard = (boardId: string, b: Omit<Block, "id" | "addedAt" | "ratio"> & { ratio?: number }) => {
    const id = `bk-${Date.now().toString(36)}`;
    const block: Block = { id, addedAt: new Date().toISOString().slice(0, 10), ratio: b.ratio ?? 1, ...b };
    setBlocks((bl) => [...bl, block]);
    addToBoard(boardId, id);
  };

  const submitBoardDialog = () => {
    if (!boardDialog) return;
    const name = boardDialog.value.trim();
    if (!name) return;
    if (boardDialog.mode === "new") {
      const id = addBoard(name, boardDialog.parentId);
      toast.success(`Created folder “${name}”`);
      if (boardDialog.parentId) setOpenId((o) => o); // stay
      else setOpenId(id);
    } else if (boardDialog.id) {
      renameBoard(boardDialog.id, name);
      toast.success("Folder renamed");
    }
    setBoardDialog(null);
  };

  const submitAddBlock = () => {
    if (!addBlock) return;
    if (addBlock.kind === "note") {
      if (!addBlock.value.trim()) return;
      createBlockInBoard(addBlock.boardId, { kind: "note", note: addBlock.value.trim(), ratio: 0.7 });
    } else {
      if (!addBlock.value.trim()) return;
      createBlockInBoard(addBlock.boardId, {
        kind: "link",
        url: addBlock.value.trim(),
        title: addBlock.title.trim() || addBlock.value.trim(),
        ratio: 0.8,
      });
    }
    toast.success("Block added");
    setAddBlock(null);
  };

  // AI Sort: onboard once (rules), then the sorter handles ingest/modes/batches.
  const openSorter = () => {
    const onboarded = typeof window !== "undefined" && localStorage.getItem("diorama.mood.aiOnboarded");
    if (onboarded) setSorterOpen(true);
    else setOnboardOpen(true);
  };
  const launchAiSort = () => {
    setSorterSeed(null);
    setSortingImports(false);
    openSorter();
  };
  const sortImports = () => {
    setSorterSeed(imports.map((im) => ({ id: im.id, src: im.src })));
    setSortingImports(true);
    openSorter();
  };
  const completeOnboarding = (rules: Record<string, string>) => {
    setBoards((bs) => bs.map((b) => (rules[b.id] !== undefined ? { ...b, rule: rules[b.id] } : b)));
    try { localStorage.setItem("diorama.mood.aiOnboarded", "1"); } catch { /* ignore */ }
    setOnboardOpen(false);
    setSorterOpen(true);
  };
  const fileFromSorter = (items: { src: string; boardId: string }[]) => {
    items.forEach((it) =>
      createBlockInBoard(it.boardId, { kind: "image", src: it.src, ratio: [0.75, 1, 1.25][Math.floor(Math.random() * 3)] }),
    );
    if (sortingImports) setImports([]);
  };

  // Manual import filing.
  const moveImport = (importId: string, boardId: string) => {
    const im = imports.find((x) => x.id === importId);
    if (!im) return;
    createBlockInBoard(boardId, { kind: "image", src: im.src, ratio: [0.75, 1, 1.25][Math.floor(Math.random() * 3)] });
    setImports((xs) => xs.filter((x) => x.id !== importId));
    toast.success("Moved to folder");
  };

  // ── derived ──
  const roots = rootBoards(boards);
  const countForName = (name: string) => {
    const b = roots.find((x) => x.name === name);
    return b ? boardCount(boards, b) : 0;
  };
  const searching = query.trim().length > 0;
  const searchResults = searching
    ? blocks.filter((b) =>
        `${b.title ?? ""} ${b.note ?? ""} ${b.kind}`.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  // ── context menus ──
  const boardMenu = (b: Board): CtxItem[] => [
    { label: "Open", icon: FolderInput, onClick: () => setOpenId(b.id) },
    { label: "Get Info", icon: Info, onClick: () => setInfoBoard(b) },
    { label: "Share", icon: Share2, onClick: () => setShareBoard(b) },
    { label: "Make book", icon: BookOpen, onClick: () => setBookBoard(b) },
    { label: "Rename…", icon: Pencil, onClick: () => setBoardDialog({ mode: "rename", value: b.name, parentId: b.parentId, id: b.id }) },
    { type: "sep" },
    { label: "Move to Trash", icon: Trash2, destructive: true, onClick: () => deleteBoard(b.id) },
  ];
  const blockMenu = (b: Block): CtxItem[] => [
    { label: b.kind === "link" || b.kind === "video" ? "Open link" : "Open", icon: ExternalLink, onClick: () => (b.url ? window.open(b.url, "_blank") : setPreview(b)) },
    { label: "Add to folder…", icon: FolderInput, onClick: () => setConnectBlock(b) },
    { label: "Download", icon: Download, onClick: () => toast.success("Download is simulated in this prototype.") },
    ...(openBoard
      ? ([{ type: "sep" }, { label: "Remove from board", icon: Trash2, destructive: true, onClick: () => removeFromBoard(openBoard.id, b.id) }] as CtxItem[])
      : []),
  ];

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title={
          <span className="flex items-baseline gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/olivine-logo.svg"
              alt="Olivine"
              className="h-5 w-auto select-none dark:[filter:invert(0.92)_sepia(0.08)_saturate(0.6)_brightness(1.05)]"
              draggable={false}
            />
            <span>Moodboard</span>
          </span>
        }
        description="Collect references into boards — images, video, links, notes — and let AI keep them filed."
        actions={
          <div className="flex items-center gap-2">
            {!openBoard && !searching && (
              <ViewSwitcher
                value={view}
                onChange={setView}
                options={[
                  { id: "folders", label: "Folders", icon: Move },
                  { id: "imports", label: "Imports", icon: Inbox },
                ]}
              />
            )}
            {synced && (
              <span className="hidden h-8 items-center gap-1.5 rounded-md border bg-surface-2/60 px-3 text-xs text-ink-soft lg:flex">
                <RefreshCw className="size-3 text-good" /> Synced {synced.lastSynced}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={() => setConnOpen(true)}>
              <Link2 className="size-4" /> Sources
            </Button>
            <Button size="sm" onClick={launchAiSort}>
              <Wand2 className="size-4" /> AI Sort
            </Button>
          </div>
        }
      />

      {sorterOpen ? (
        <MoodSorter
          boards={roots}
          sampleImages={MOODBOARD_PHOTOS}
          initialQueue={sorterSeed ?? undefined}
          onClose={() => { setSorterOpen(false); setSorterSeed(null); setSortingImports(false); }}
          onFile={fileFromSorter}
          onEditRules={() => { setSorterOpen(false); setOnboardOpen(true); }}
        />
      ) : (
      <>
      {/* Search */}
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-ink" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search references — titles, notes, links…"
          className="h-11 pl-10"
        />
      </div>

      {searching ? (
        <>
          <p className="text-xs text-ink-faint">{searchResults.length} references match “{query}”</p>
          <Gallery
            blocks={searchResults}
            selected={selected}
            selectMode={false}
            onToggle={toggleSel}
            onOpen={(b) => (b.url ? window.open(b.url, "_blank") : setPreview(b))}
            onContext={(b, e) => openMenu(e, blockMenu(b))}
          />
        </>
      ) : openBoard ? (
        <BoardDetail
          board={openBoard}
          boards={boards}
          bById={bById}
          selected={selected}
          selectMode={selectMode}
          onToggleSelectMode={() => { setSelectMode((m) => !m); setSelected(new Set()); }}
          onToggle={toggleSel}
          onClearSel={() => { setSelected(new Set()); setSelectMode(false); }}
          onOpenBoard={setOpenId}
          onOpenBlock={(b) => (b.url ? window.open(b.url, "_blank") : setPreview(b))}
          onBlockContext={(b, e) => openMenu(e, blockMenu(b))}
          onBoardContext={(b, e) => openMenu(e, boardMenu(b))}
          onInfo={() => setInfoBoard(openBoard)}
          onShare={() => setShareBoard(openBoard)}
          onBook={() => setBookBoard(openBoard)}
          onRename={() => setBoardDialog({ mode: "rename", value: openBoard.name, parentId: openBoard.parentId, id: openBoard.id })}
          onNewSub={() => setBoardDialog({ mode: "new", value: "", parentId: openBoard.id })}
          onAddLink={() => setAddBlock({ boardId: openBoard.id, kind: "link", value: "", title: "" })}
          onAddNote={() => setAddBlock({ boardId: openBoard.id, kind: "note", value: "", title: "" })}
          onUpload={() => toast.success("Upload is simulated in this prototype.")}
        />
      ) : view === "imports" ? (
        <ImportsView
          imports={imports}
          boards={roots}
          onSort={sortImports}
          onConnections={() => setConnOpen(true)}
          onMove={moveImport}
        />
      ) : (
        /* Folders — free draggable boards, consistent with Asset Library */
        <div
          onContextMenu={(e) =>
            openMenu(e, [
              { label: "New folder", icon: FolderPlus, onClick: () => setBoardDialog({ mode: "new", value: "", parentId: null }) },
            ])
          }
        >
          <MoodFreeFolders
            categories={roots.map((b) => b.name)}
            countFor={countForName}
            onOpen={(name) => {
              const b = roots.find((x) => x.name === name);
              if (b) setOpenId(b.id);
            }}
            onAdd={() => setBoardDialog({ mode: "new", value: "", parentId: null })}
            onContext={(name, e) => {
              const b = roots.find((x) => x.name === name);
              if (b) openMenu(e, boardMenu(b));
            }}
            onNest={(childName, parentName) => {
              const child = roots.find((x) => x.name === childName);
              const parent = roots.find((x) => x.name === parentName);
              if (child && parent && child.id !== parent.id) {
                setBoards((bs) => bs.map((b) => (b.id === child.id ? { ...b, parentId: parent.id } : b)));
                toast.success(`Moved “${childName}” into “${parentName}”`);
              }
            }}
            storageKey="diorama.mood.boards.v1"
            addLabel="New folder"
            scatter
            toolbar
          />
        </div>
      )}
      </>
      )}

      {/* ── dialogs ── */}
      <MoodConnections open={connOpen} onOpenChange={setConnOpen} connections={connections} setConnections={setConnections} />
      <MoodAiSortOnboarding open={onboardOpen} onOpenChange={setOnboardOpen} boards={roots} onComplete={completeOnboarding} />

      <InfoDialog board={infoBoard} boards={boards} onClose={() => setInfoBoard(null)} />
      <ShareDialog board={shareBoard} onClose={() => setShareBoard(null)} onVisibility={(v) => shareBoard && setVisibility(shareBoard.id, v)} />
      <BookDialog board={bookBoard} bById={bById} onClose={() => setBookBoard(null)} />
      <BlockPreview block={preview} boards={boards} onClose={() => setPreview(null)} onConnect={(b) => { setPreview(null); setConnectBlock(b); }} onOpenBoard={(id) => { setPreview(null); setOpenId(id); }} />
      <ConnectDialog block={connectBlock} boards={boards} onClose={() => setConnectBlock(null)} onAdd={(boardId) => { if (connectBlock) { addToBoard(boardId, connectBlock.id); toast.success("Added to folder"); } setConnectBlock(null); }} />

      {/* New / rename board */}
      <Dialog open={!!boardDialog} onOpenChange={(v) => !v && setBoardDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{boardDialog?.mode === "rename" ? "Rename folder" : boardDialog?.parentId ? "New sub-folder" : "New folder"}</DialogTitle>
            <DialogDescription>{boardDialog?.mode === "rename" ? "Give this folder a new name." : "Folders hold images, video, links, files, and notes."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="board-name">Name</Label>
            <Input id="board-name" value={boardDialog?.value ?? ""} autoFocus onKeyDown={(e) => e.key === "Enter" && submitBoardDialog()} onChange={(e) => setBoardDialog((d) => (d ? { ...d, value: e.target.value } : d))} placeholder="e.g. Washes & Dye" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBoardDialog(null)}>Cancel</Button>
            <Button onClick={submitBoardDialog}>{boardDialog?.mode === "rename" ? "Rename" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add link / note */}
      <Dialog open={!!addBlock} onOpenChange={(v) => !v && setAddBlock(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{addBlock?.kind === "note" ? "Add note" : "Add link"}</DialogTitle>
          </DialogHeader>
          {addBlock?.kind === "note" ? (
            <Textarea autoFocus value={addBlock?.value ?? ""} onChange={(e) => setAddBlock((a) => (a ? { ...a, value: e.target.value } : a))} placeholder="Type a note…" className="min-h-[100px]" />
          ) : (
            <div className="space-y-2">
              <Input autoFocus value={addBlock?.value ?? ""} onChange={(e) => setAddBlock((a) => (a ? { ...a, value: e.target.value } : a))} placeholder="https://…" />
              <Input value={addBlock?.title ?? ""} onChange={(e) => setAddBlock((a) => (a ? { ...a, title: e.target.value } : a))} placeholder="Title (optional)" />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddBlock(null)}>Cancel</Button>
            <Button onClick={submitAddBlock}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {contextMenu}
    </div>
  );
}

// ── Clean square gallery (iPhone-Photos style) ───────────────
function Gallery({
  blocks,
  selected,
  selectMode,
  onToggle,
  onOpen,
  onContext,
}: {
  blocks: Block[];
  selected: Set<string>;
  selectMode: boolean;
  onToggle: (id: string) => void;
  onOpen: (b: Block) => void;
  onContext: (b: Block, e: React.MouseEvent) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 lg:grid-cols-5">
      {blocks.map((b) => (
        <GalleryCard
          key={b.id}
          block={b}
          selected={selected.has(b.id)}
          selectMode={selectMode}
          onClick={() => (selectMode ? onToggle(b.id) : onOpen(b))}
          onToggle={() => onToggle(b.id)}
          onContext={(e) => onContext(b, e)}
        />
      ))}
    </div>
  );
}

function GalleryCard({
  block,
  selected,
  selectMode,
  onClick,
  onToggle,
  onContext,
}: {
  block: Block;
  selected: boolean;
  selectMode: boolean;
  onClick: () => void;
  onToggle: () => void;
  onContext: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContext}
      className={cn(
        "group relative aspect-square cursor-pointer overflow-hidden bg-surface-2",
        selected && "ring-2 ring-inset ring-accent",
      )}
    >
      {/* select dot — only in select mode */}
      {selectMode && (
        <span
          className={cn(
            "absolute left-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full border",
            selected ? "border-accent bg-accent text-accent-foreground" : "border-white/80 bg-black/25 text-transparent backdrop-blur",
          )}
        >
          <Check className="size-3" />
        </span>
      )}

      {block.kind === "note" ? (
        <div className="flex size-full items-center bg-accent-soft/40 p-3">
          <p className="line-clamp-6 text-xs leading-relaxed text-ink-soft">{block.note}</p>
        </div>
      ) : block.kind === "file" ? (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 p-3 text-ink-faint">
          <FileText className="size-7" />
          <span className="line-clamp-2 text-center text-[10px]">{block.title}</span>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt="" className="size-full object-cover" />
          {block.kind === "video" && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex size-9 items-center justify-center rounded-full bg-paper/70 backdrop-blur">
                <Play className="size-4" />
              </span>
            </span>
          )}
          {block.kind === "link" && (
            <span className="absolute bottom-1.5 left-1.5 flex size-5 items-center justify-center rounded bg-paper/80 text-ink-soft backdrop-blur">
              <LinkIcon className="size-3" />
            </span>
          )}
        </>
      )}
    </div>
  );
}

// ── Board detail ─────────────────────────────────────────────
function BoardDetail(props: {
  board: Board;
  boards: Board[];
  bById: (id: string) => Block | undefined;
  selected: Set<string>;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  onToggle: (id: string) => void;
  onClearSel: () => void;
  onOpenBoard: (id: string | null) => void;
  onOpenBlock: (b: Block) => void;
  onBlockContext: (b: Block, e: React.MouseEvent) => void;
  onBoardContext: (b: Board, e: React.MouseEvent) => void;
  onInfo: () => void;
  onShare: () => void;
  onBook: () => void;
  onRename: () => void;
  onNewSub: () => void;
  onAddLink: () => void;
  onAddNote: () => void;
  onUpload: () => void;
}) {
  const { board, boards, bById, selected, selectMode } = props;
  const path = boardPath(boards, board.id);
  const subs = childBoards(boards, board.id);
  const boardBlocks = board.blockIds.map(bById).filter(Boolean) as Block[];
  const selCount = boardBlocks.filter((b) => selected.has(b.id)).length;
  const empty = boardBlocks.length === 0 && subs.length === 0;

  return (
    <div className="space-y-5">
      {/* breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button onClick={() => props.onOpenBoard(null)} className="rounded px-1.5 py-0.5 text-ink-faint hover:bg-elevated cursor-pointer">Moodboard</button>
        {path.map((b, i) => (
          <React.Fragment key={b.id}>
            <ChevronRight className="size-3.5 text-ink-faint" />
            <button
              onClick={() => props.onOpenBoard(b.id)}
              className={cn("rounded px-1.5 py-0.5 hover:bg-elevated cursor-pointer", i === path.length - 1 ? "font-medium" : "text-ink-faint")}
            >
              {b.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="display text-2xl tracking-tight">{board.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
            <span>{boardCount(boards, board)} items</span>
            <span>·</span>
            <span>Updated {board.updatedAt}</span>
            <span>·</span>
            <Badge variant="outline">{board.visibility}</Badge>
            {board.linkedCollection && (
              <>
                <span>·</span>
                <Link href="/collections" className="text-accent-ink hover:underline">{board.linkedCollection}</Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm"><Plus className="size-4" /> Add</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={props.onUpload}><ImagePlus className="size-4" /> Upload images</DropdownMenuItem>
              <DropdownMenuItem onClick={props.onAddLink}><LinkIcon className="size-4" /> Add link</DropdownMenuItem>
              <DropdownMenuItem onClick={props.onAddNote}><StickyNote className="size-4" /> Add note</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={props.onNewSub}><FolderPlus className="size-4" /> New sub-folder</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={selectMode ? "default" : "secondary"} size="sm" onClick={props.onToggleSelectMode}>
            <Check className="size-4" /> {selectMode ? "Done" : "Select"}
          </Button>
          <Button variant="secondary" size="icon-sm" onClick={props.onInfo} title="Info"><Info className="size-4" /></Button>
          <Button variant="secondary" size="icon-sm" onClick={props.onShare} title="Share"><Share2 className="size-4" /></Button>
          <Button variant="secondary" size="icon-sm" onClick={props.onRename} title="Rename"><Pencil className="size-4" /></Button>
          <Button variant="secondary" size="sm" onClick={props.onBook}><BookOpen className="size-4" /> Make book</Button>
        </div>
      </div>

      {/* floating selection toolbar — doesn't shift the grid */}
      {selCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-popover px-4 py-2 shadow-xl">
          <span className="text-sm font-medium">{selCount} selected</span>
          <Button size="sm" onClick={() => toast.success(`Downloading ${selCount} references (simulated)`)}>
            <Download className="size-4" /> Download
          </Button>
          <button onClick={props.onClearSel} className="text-sm text-ink-faint transition-colors hover:text-foreground cursor-pointer">
            Clear
          </button>
        </div>
      )}

      {/* folders + blocks in one grid — folders behave like any other tile */}
      {empty ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center text-ink-faint">
          <ImagePlus className="size-6" />
          <p className="text-sm">This folder is empty — add references with the Add button.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 lg:grid-cols-5">
          {subs.map((s) => (
            <button
              key={s.id}
              onClick={() => props.onOpenBoard(s.id)}
              onContextMenu={(e) => props.onBoardContext(s, e)}
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 bg-surface-2/40 p-2 transition-colors hover:bg-elevated/50"
            >
              <FolderGlyph className="w-24 transition-transform duration-150 group-hover:-translate-y-0.5" />
              <span className="line-clamp-1 max-w-full px-1 text-sm font-medium">{s.name}</span>
              <span className="text-[10px] text-ink-faint">{boardCount(boards, s)} items</span>
            </button>
          ))}
          {boardBlocks.map((b) => (
            <GalleryCard
              key={b.id}
              block={b}
              selected={selected.has(b.id)}
              selectMode={selectMode}
              onClick={() => (selectMode ? props.onToggle(b.id) : props.onOpenBlock(b))}
              onToggle={() => props.onToggle(b.id)}
              onContext={(e) => props.onBlockContext(b, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Imports ──────────────────────────────────────────────────
function ImportsView({
  imports,
  boards,
  onSort,
  onConnections,
  onMove,
}: {
  imports: typeof MOOD_IMPORTS;
  boards: Board[];
  onSort: () => void;
  onConnections: () => void;
  onMove: (importId: string, boardId: string) => void;
}) {
  if (imports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <Inbox className="size-7 text-ink-faint" />
        <p className="text-sm text-ink-soft">Inbox is empty — everything's filed.</p>
        <Button variant="secondary" size="sm" onClick={onConnections}><Link2 className="size-4" /> Manage sources</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-surface-2/40 p-3">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-foreground">{imports.length} new references</span> waiting to be filed — sort them with AI, or file each one by hand.
        </p>
        <Button size="sm" onClick={onSort}><Wand2 className="size-4" /> Sort with AI</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {imports.map((im) => (
          <div key={im.id} className="group overflow-hidden rounded-xl border">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt="" className="size-full object-cover" />
              <Badge variant="default" className="absolute left-2 top-2 bg-paper/80 backdrop-blur">{im.source}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-accent-ink transition-colors hover:bg-elevated cursor-pointer">
                  <FolderInput className="size-3.5" /> Move to folder
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {boards.map((b) => (
                  <DropdownMenuItem key={b.id} onClick={() => onMove(im.id, b.id)}>
                    <FolderInput className="size-4" /> {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Info dialog ──────────────────────────────────────────────
function InfoDialog({ board, boards, onClose }: { board: Board | null; boards: Board[]; onClose: () => void }) {
  return (
    <Dialog open={!!board} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{board?.name}</DialogTitle>
          <DialogDescription>Folder info</DialogDescription>
        </DialogHeader>
        {board && (
          <div className="space-y-3 text-sm">
            <Row label="Items" value={`${boardCount(boards, board)}`} />
            <Row label="Created" value={board.createdAt} />
            <Row label="Last updated" value={board.updatedAt} />
            <Row label="Visibility" value={board.visibility} />
            {board.linkedCollection && <Row label="Collection" value={board.linkedCollection} />}
            <Separator />
            <div>
              <p className="mb-2 text-xs text-ink-faint">Contributors</p>
              <div className="flex flex-wrap gap-2">
                {board.contributors.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 rounded-full border bg-surface-2/40 py-0.5 pl-0.5 pr-2 text-xs">
                    <Initials name={c} /> {c}
                  </span>
                ))}
              </div>
            </div>
            {board.rule && (
              <>
                <Separator />
                <div>
                  <p className="mb-1 text-xs text-ink-faint">AI filing rule</p>
                  <p className="text-sm text-ink-soft">{board.rule}</p>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-faint">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ── Share dialog (visibility + people) ───────────────────────
function ShareDialog({ board, onClose, onVisibility }: { board: Board | null; onClose: () => void; onVisibility: (v: Board["visibility"]) => void }) {
  const [invite, setInvite] = React.useState("");
  return (
    <Dialog open={!!board} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share “{board?.name}”</DialogTitle>
          <DialogDescription>Control who can see and add to this board.</DialogDescription>
        </DialogHeader>
        {board && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-ink-faint">Access</Label>
              <div className="mt-1.5 flex gap-2">
                {(["Private", "Team", "Public"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => onVisibility(v)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer",
                      board.visibility === v ? "border-accent/50 bg-accent-soft text-accent-ink" : "hover:bg-elevated",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-ink-faint">People</Label>
              <div className="mt-1.5 space-y-1.5">
                {board.contributors.map((c, i) => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <Initials name={c} />
                    <span className="flex-1">{c}</span>
                    <span className="text-xs text-ink-faint">{i === 0 ? "Owner" : "Editor"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="Invite by email…" />
              <Button variant="secondary" onClick={() => { if (invite.trim()) { toast.success(`Invited ${invite.trim()}`); setInvite(""); } }}><Users className="size-4" /> Invite</Button>
            </div>
            <Button className="w-full" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Share link copied"); }}>
              <Share2 className="size-4" /> Copy share link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Make book dialog ─────────────────────────────────────────
function BookDialog({ board, bById, onClose }: { board: Board | null; bById: (id: string) => Block | undefined; onClose: () => void }) {
  const images = board ? (board.blockIds.map(bById).filter((b): b is Block => !!b && b.kind === "image")) : [];
  return (
    <Dialog open={!!board} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make book — {board?.name}</DialogTitle>
          <DialogDescription>A print-ready PDF lookbook from this board’s images.</DialogDescription>
        </DialogHeader>
        {/* cover + spread preview */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex aspect-[3/4] flex-col justify-end rounded-lg border bg-gradient-to-b from-surface-2 to-elevated p-4">
            <p className="text-xs text-ink-faint">Olivine · Moodboard</p>
            <p className="display text-xl tracking-tight">{board?.name}</p>
            <p className="mt-1 text-xs text-ink-faint">{images.length} plates</p>
          </div>
          <div className="grid aspect-[3/4] grid-cols-2 grid-rows-3 gap-1.5 overflow-hidden rounded-lg border p-1.5">
            {images.slice(0, 6).map((b) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.id} src={b.src} alt="" className="size-full rounded object-cover" />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { toast.success("Lookbook PDF exported (simulated)"); onClose(); }}>
            <Download className="size-4" /> Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Block preview (lightbox) ─────────────────────────────────
function BlockPreview({ block, boards, onClose, onConnect, onOpenBoard }: { block: Block | null; boards: Board[]; onClose: () => void; onConnect: (b: Block) => void; onOpenBoard: (id: string) => void }) {
  const links = block ? boardsContaining(boards, block.id) : [];
  return (
    <Dialog open={!!block} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogTitle className="sr-only">{block?.title ?? block?.kind}</DialogTitle>
        {block && (
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="flex items-center justify-center bg-surface-2">
              {block.kind === "note" ? (
                <p className="p-8 text-sm leading-relaxed text-ink-soft">{block.note}</p>
              ) : block.kind === "file" ? (
                <div className="flex flex-col items-center gap-2 py-16 text-ink-faint"><FileText className="size-9" /><span className="text-sm">{block.title}</span></div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.src} alt="" className="max-h-[70vh] w-full object-contain" />
              )}
            </div>
            <div className="flex flex-col p-5">
              <Badge variant="accent" className="w-fit capitalize">{block.kind}</Badge>
              {block.title && <p className="mt-2 text-sm font-medium">{block.title}</p>}
              {block.url && <a href={block.url} target="_blank" rel="noreferrer" className="mt-1 truncate text-xs text-accent-ink hover:underline">{block.url}</a>}
              <p className="mt-3 text-xs text-ink-faint">Added {block.addedAt}</p>
              <Separator className="my-4" />
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">In {links.length} folder{links.length === 1 ? "" : "s"}</p>
              <div className="grid grid-cols-3 gap-2">
                {links.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onOpenBoard(b.id)}
                    className="group flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-elevated cursor-pointer"
                  >
                    <FolderGlyph className="w-14 transition-transform duration-150 group-hover:-translate-y-0.5" />
                    <span className="line-clamp-1 max-w-full text-[11px]">{b.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-auto flex gap-2 pt-5">
                <Button variant="secondary" className="flex-1" onClick={() => onConnect(block)}><FolderInput className="size-4" /> Add to folder</Button>
                <Button className="flex-1" onClick={() => toast.success("Download is simulated in this prototype.")}><Download className="size-4" /> Download</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Connect-to-board dialog ──────────────────────────────────
function ConnectDialog({ block, boards, onClose, onAdd }: { block: Block | null; boards: Board[]; onClose: () => void; onAdd: (boardId: string) => void }) {
  return (
    <Dialog open={!!block} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to folder</DialogTitle>
          <DialogDescription>The same reference can live in several folders.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-1 overflow-y-auto">
          {boards.map((b) => {
            const has = block ? b.blockIds.includes(block.id) : false;
            return (
              <button
                key={b.id}
                disabled={has}
                onClick={() => onAdd(b.id)}
                className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors", has ? "opacity-50" : "hover:bg-elevated cursor-pointer")}
              >
                <FolderInput className="size-4 text-ink-faint" />
                <span className="flex-1">{b.name}</span>
                {has && <Check className="size-4 text-good" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
