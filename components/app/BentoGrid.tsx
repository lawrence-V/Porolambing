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
import { DragHandleProvider } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { LambingChatCard } from "./LambingChatCard";
import { SessionLogCard } from "./SessionLogCard";
import { StreakCard } from "./StreakCard";
import { TaskCard } from "./TaskCard";
import { TimerCard } from "./TimerCard";
import { WeekCard } from "./WeekCard";

/** Grid footprint per card, on the 4-column desktop grid. */
const SPANS: Record<string, string> = {
  timer: "md:col-span-2 xl:col-span-2 xl:row-span-2",
  chat: "md:col-span-2 xl:col-span-2 xl:row-span-2",
  streak: "md:col-span-1",
  tasks: "md:col-span-1",
  week: "md:col-span-2",
  log: "md:col-span-2 xl:col-span-4",
};

type SortableHandleProps = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners"
>;

function DragHandle({ attributes, listeners }: SortableHandleProps) {
  return (
    <button
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder card"
      className="grid h-5 w-5 cursor-grab place-items-center rounded text-ink/25 transition-colors hover:text-ink active:cursor-grabbing"
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
        <g fill="currentColor">
          <circle cx="3.5" cy="2.5" r="1.1" />
          <circle cx="8.5" cy="2.5" r="1.1" />
          <circle cx="3.5" cy="6" r="1.1" />
          <circle cx="8.5" cy="6" r="1.1" />
          <circle cx="3.5" cy="9.5" r="1.1" />
          <circle cx="8.5" cy="9.5" r="1.1" />
        </g>
      </svg>
    </button>
  );
}

function SortableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(SPANS[id], isDragging && "z-10 opacity-80")}
    >
      <DragHandleProvider
        handle={<DragHandle attributes={attributes} listeners={listeners} />}
      >
        {children}
      </DragHandleProvider>
    </div>
  );
}

export function BentoGrid({
  now,
  onOpenFlowSettings,
}: {
  now: number;
  onOpenFlowSettings: () => void;
}) {
  const layout = useAppStore((state) => state.layout);
  const setLayout = useAppStore((state) => state.setLayout);

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
      <TimerCard now={now} onOpenFlowSettings={onOpenFlowSettings} />
    ),
    chat: <LambingChatCard now={now} />,
    streak: <StreakCard />,
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

  return (
    <DndContext
      // Without a fixed id, dnd-kit's generated aria-describedby ids differ
      // between the server and client renders and hydration complains.
      id="bento"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout} strategy={rectSortingStrategy}>
        <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {layout.map((id) => (
            <SortableCard key={id} id={id}>
              {cards[id]}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
