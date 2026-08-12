"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "@/lib/store/useAppStore";
import { CARD_LABELS, visibleCards } from "@/lib/store/types";
import { CardChromeProvider } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { LambingChatCard } from "./LambingChatCard";
import { SessionLogCard } from "./SessionLogCard";
import { TaskCard } from "./TaskCard";
import { TimerCard } from "./TimerCard";
import { WeekCard } from "./WeekCard";

/** Grid footprint per card, on the 4-column desktop grid. */
const SPANS: Record<string, string> = {
  timer: "md:col-span-2 xl:col-span-2 xl:row-span-2",
  chat: "md:col-span-2 xl:col-span-2 xl:row-span-2",
  // Tasks and the week split the row evenly. They were 1 and 2 of 4 when the
  // streak card filled the fourth column; without it that row was 3/4 wide
  // with a hole at the end.
  tasks: "md:col-span-1 xl:col-span-2",
  week: "md:col-span-1 xl:col-span-2",
  log: "md:col-span-2 xl:col-span-4",
};

function SortableCard({
  id,
  onHide,
  children,
}: {
  id: string;
  onHide: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(SPANS[id], isDragging && "z-10 opacity-80")}
    >
      {/* The listeners land on the grip *and* the label inside `Card`, so the
          grab target is the width of the label rather than a 20px dot. */}
      <CardChromeProvider
        chrome={{
          dragProps: {
            ...attributes,
            ...listeners,
            "aria-label": `${CARD_LABELS[id] ?? id} card — drag to reorder`,
          },
          onHide,
          hideLabel: `Hide the ${CARD_LABELS[id] ?? id} card`,
        }}
      >
        {children}
      </CardChromeProvider>
    </div>
  );
}

export function BentoGrid({
  now,
  onOpenFlowSettings,
  onEnterFocusMode,
}: {
  now: number;
  onOpenFlowSettings: () => void;
  onEnterFocusMode: () => void;
}) {
  const layout = useAppStore((state) => state.layout);
  const hiddenCards = useAppStore((state) => state.hiddenCards);
  const setLayout = useAppStore((state) => state.setLayout);
  const hideCard = useAppStore((state) => state.hideCard);
  const resetLayout = useAppStore((state) => state.resetLayout);

  const visible = visibleCards(layout, hiddenCards);

  const sensors = useSensors(
    // A small activation distance keeps the handle clickable without
    // every stray click starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const cards: Record<string, ReactNode> = {
    timer: (
      <TimerCard
        now={now}
        onOpenFlowSettings={onOpenFlowSettings}
        onEnterFocusMode={onEnterFocusMode}
      />
    ),
    chat: <LambingChatCard now={now} />,
    tasks: <TaskCard />,
    week: <WeekCard />,
    log: <SessionLogCard />,
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = layout.indexOf(String(active.id));
    const to = layout.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    setLayout(arrayMove(layout, from, to));
  }

  // Hiding every card would otherwise leave a blank page with no way back.
  if (visible.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-ink/30 p-12 text-center">
        <p className="font-display-wide text-2xl">Walang natira.</p>
        <p className="mx-auto mt-2 max-w-sm text-base opacity-70">
          Every card is hidden. Bring them back from{" "}
          <strong>Settings → Cards</strong>, or reset the layout.
        </p>
        <Button variant="outline" size="md" className="mt-5" onClick={resetLayout}>
          Reset layout
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      // Without a fixed id, dnd-kit's generated aria-describedby ids differ
      // between the server and client renders and hydration complains.
      id="bento"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={visible} strategy={rectSortingStrategy}>
        <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visible.map((id) => (
            <SortableCard key={id} id={id} onHide={() => hideCard(id)}>
              {cards[id]}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
