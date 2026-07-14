"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { WidgetChrome } from "./widget-chrome";
import { useBoardDispatch } from "@/components/board/board-store";
import {
  createTodoItem,
  deleteTodoItem,
  deleteTodoList,
  renameTodoList,
  reorderTodoItems,
  setTodoListColor,
  toggleTodoItem,
} from "@/lib/actions/todos";
import type { TodoItemDTO, TodoListDTO, WidgetColor } from "@/lib/types";

export function TodoCard({
  list,
  handleProps,
  isDragging,
}: {
  list: TodoListDTO;
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}) {
  const dispatch = useBoardDispatch();
  const [newTitle, setNewTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addItem = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    const item = await createTodoItem(list.id, title);
    dispatch({ type: "todo/item-add", listId: list.id, item });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = list.items.findIndex((i) => i.id === active.id);
    const newIndex = list.items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const orderedIds = arrayMove(list.items, oldIndex, newIndex).map(
      (i) => i.id,
    );
    dispatch({ type: "todo/item-reorder", listId: list.id, orderedIds });
    void reorderTodoItems(list.id, orderedIds);
  };

  return (
    <WidgetChrome
      title={list.title || "Todo"}
      currentTitle={list.title}
      color={list.color}
      handleProps={handleProps}
      isDragging={isDragging}
      onRename={(title) => {
        dispatch({ type: "todo/update", id: list.id, patch: { title } });
        void renameTodoList(list.id, title);
      }}
      onColorChange={(color: WidgetColor) => {
        dispatch({ type: "todo/update", id: list.id, patch: { color } });
        void setTodoListColor(list.id, color);
      }}
      onRemove={() => {
        dispatch({ type: "todo/remove", id: list.id });
        void deleteTodoList(list.id);
      }}
      removeLabel="Remove list"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={list.items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col">
            {list.items.map((item) => (
              <SortableTodoItem key={item.id} listId={list.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void addItem();
        }}
        className="mt-2 flex gap-2"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add an item…"
          aria-label="New todo item"
          className="w-full rounded-md bg-white/40 px-2 py-1 text-sm outline-none placeholder:opacity-50 dark:bg-black/20"
        />
        <button
          type="submit"
          className="rounded-md px-2 text-sm opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Add item"
        >
          +
        </button>
      </form>
    </WidgetChrome>
  );
}

function SortableTodoItem({
  listId,
  item,
}: {
  listId: number;
  item: TodoItemDTO;
}) {
  const dispatch = useBoardDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const done = item.completedAt !== null;

  const toggle = () => {
    dispatch({
      type: "todo/item-update",
      listId,
      itemId: item.id,
      patch: { completedAt: done ? null : new Date().toISOString() },
    });
    void toggleTodoItem(item.id, !done);
  };

  const remove = () => {
    dispatch({ type: "todo/item-remove", listId, itemId: item.id });
    void deleteTodoItem(item.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`group/item flex items-center gap-2 rounded-md px-1 py-1 ${
        isDragging ? "z-10 bg-white/50 shadow dark:bg-black/40" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={toggle}
        className="size-4 shrink-0 accent-current"
        aria-label={`${done ? "Uncheck" : "Check"} ${item.title}`}
      />
      <span
        className={`flex-1 text-sm leading-5 transition-opacity ${
          done ? "line-through opacity-45" : ""
        }`}
      >
        {item.title}
      </span>
      <button
        type="button"
        onClick={remove}
        className="rounded px-1 text-xs opacity-0 transition-opacity hover:bg-black/10 group-hover/item:opacity-60 focus-visible:opacity-60 dark:hover:bg-white/10"
        aria-label={`Delete ${item.title}`}
      >
        ✕
      </button>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded px-1 text-xs opacity-0 transition-opacity group-hover/item:opacity-40 focus-visible:opacity-60 active:cursor-grabbing"
        aria-label={`Reorder ${item.title}`}
      >
        ⋮⋮
      </button>
    </li>
  );
}
