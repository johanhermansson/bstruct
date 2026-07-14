"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
} from "react";

import { positionBuffer } from "./position-buffer";
import { denseZ, liftKey } from "./z-order";
import type {
  BoardData,
  NoteDTO,
  StructDTO,
  StructItemDTO,
  TodoItemDTO,
  TodoListDTO,
  WidgetKind,
} from "@/lib/types";

export type WidgetKey = `${WidgetKind}:${number}`;

export function widgetKey(kind: WidgetKind, id: number): WidgetKey {
  return `${kind}:${id}`;
}

export type BoardState = {
  boardId: number;
  notes: NoteDTO[];
  todoLists: TodoListDTO[];
  structs: StructDTO[];
  /** Widget keys bottom → top; index+1 is the persisted dense z. */
  zOrder: WidgetKey[];
};

export type BoardAction =
  | { type: "lift"; key: WidgetKey }
  | { type: "move"; key: WidgetKey; x: number; y: number }
  | { type: "note/add"; note: NoteDTO }
  | { type: "note/update"; id: number; patch: Partial<NoteDTO> }
  | { type: "note/remove"; id: number }
  | { type: "todo/add"; list: TodoListDTO }
  | { type: "todo/update"; id: number; patch: Partial<TodoListDTO> }
  | { type: "todo/remove"; id: number }
  | { type: "todo/item-add"; listId: number; item: TodoItemDTO }
  | {
      type: "todo/item-update";
      listId: number;
      itemId: number;
      patch: Partial<TodoItemDTO>;
    }
  | { type: "todo/item-remove"; listId: number; itemId: number }
  | { type: "todo/item-reorder"; listId: number; orderedIds: number[] }
  | { type: "struct/add"; struct: StructDTO }
  | { type: "struct/update"; id: number; patch: Partial<StructDTO> }
  | { type: "struct/remove"; id: number }
  | { type: "struct/item-add"; structId: number; item: StructItemDTO }
  | {
      type: "struct/item-update";
      structId: number;
      itemId: number;
      patch: Partial<StructItemDTO>;
    }
  | { type: "struct/item-remove"; structId: number; itemId: number };

function initialState(data: BoardData): BoardState {
  const widgets: { key: WidgetKey; z: number }[] = [
    ...data.notes.map((n) => ({ key: widgetKey("note", n.id), z: n.z })),
    ...data.todoLists.map((t) => ({ key: widgetKey("todo", t.id), z: t.z })),
    ...data.structs.map((s) => ({ key: widgetKey("struct", s.id), z: s.z })),
  ];
  widgets.sort((a, b) => a.z - b.z);

  return {
    boardId: data.board.id,
    notes: data.notes,
    todoLists: data.todoLists,
    structs: data.structs,
    zOrder: widgets.map((w) => w.key),
  };
}

/** z is derived from zOrder — dense 1..N, never creeps upward (the legacy
 * board's z values grew forever). */
export function zOf(state: BoardState, key: WidgetKey): number {
  return denseZ(state.zOrder, key);
}

function findPosition(state: BoardState, key: WidgetKey) {
  const [kind, idStr] = key.split(":") as [WidgetKind, string];
  const id = Number(idStr);
  const widget =
    kind === "note"
      ? state.notes.find((n) => n.id === id)
      : kind === "todo"
        ? state.todoLists.find((t) => t.id === id)
        : state.structs.find((s) => s.id === id);
  return widget ? { kind, id, x: widget.x, y: widget.y } : null;
}

/** Push every widget whose derived z changed into the persistence buffer. */
function persistZChanges(prev: BoardState, next: BoardState) {
  next.zOrder.forEach((key, index) => {
    const prevZ = prev.zOrder.indexOf(key) + 1;
    const nextZ = index + 1;
    if (prevZ === nextZ) return;
    const widget = findPosition(next, key);
    if (widget) {
      positionBuffer.push(widget.kind, widget.id, widget.x, widget.y, nextZ);
    }
  });
}

function reducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "lift": {
      if (state.zOrder[state.zOrder.length - 1] === action.key) return state;
      const zOrder = liftKey(state.zOrder, action.key);
      const next = { ...state, zOrder };
      persistZChanges(state, next);
      return next;
    }

    case "move": {
      const [kind, idStr] = action.key.split(":") as [WidgetKind, string];
      const id = Number(idStr);
      const next = { ...state };
      if (kind === "note") {
        next.notes = state.notes.map((n) =>
          n.id === id ? { ...n, x: action.x, y: action.y } : n,
        );
      } else if (kind === "todo") {
        next.todoLists = state.todoLists.map((t) =>
          t.id === id ? { ...t, x: action.x, y: action.y } : t,
        );
      } else {
        next.structs = state.structs.map((s) =>
          s.id === id ? { ...s, x: action.x, y: action.y } : s,
        );
      }
      positionBuffer.push(kind, id, action.x, action.y, zOf(next, action.key));
      return next;
    }

    case "note/add":
      return {
        ...state,
        notes: [...state.notes, action.note],
        zOrder: [...state.zOrder, widgetKey("note", action.note.id)],
      };
    case "note/update":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, ...action.patch } : n,
        ),
      };
    case "note/remove":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.id),
        zOrder: state.zOrder.filter((k) => k !== widgetKey("note", action.id)),
      };

    case "todo/add":
      return {
        ...state,
        todoLists: [...state.todoLists, action.list],
        zOrder: [...state.zOrder, widgetKey("todo", action.list.id)],
      };
    case "todo/update":
      return {
        ...state,
        todoLists: state.todoLists.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        ),
      };
    case "todo/remove":
      return {
        ...state,
        todoLists: state.todoLists.filter((t) => t.id !== action.id),
        zOrder: state.zOrder.filter((k) => k !== widgetKey("todo", action.id)),
      };
    case "todo/item-add":
      return {
        ...state,
        todoLists: state.todoLists.map((t) =>
          t.id === action.listId ? { ...t, items: [...t.items, action.item] } : t,
        ),
      };
    case "todo/item-update":
      return {
        ...state,
        todoLists: state.todoLists.map((t) =>
          t.id === action.listId
            ? {
                ...t,
                items: t.items.map((i) =>
                  i.id === action.itemId ? { ...i, ...action.patch } : i,
                ),
              }
            : t,
        ),
      };
    case "todo/item-remove":
      return {
        ...state,
        todoLists: state.todoLists.map((t) =>
          t.id === action.listId
            ? { ...t, items: t.items.filter((i) => i.id !== action.itemId) }
            : t,
        ),
      };
    case "todo/item-reorder":
      return {
        ...state,
        todoLists: state.todoLists.map((t) => {
          if (t.id !== action.listId) return t;
          const byId = new Map(t.items.map((i) => [i.id, i]));
          const items = action.orderedIds
            .map((id) => byId.get(id))
            .filter((i): i is TodoItemDTO => i !== undefined)
            .map((item, index) => ({ ...item, listOrder: index + 1 }));
          return { ...t, items };
        }),
      };

    case "struct/add":
      return {
        ...state,
        structs: [...state.structs, action.struct],
        zOrder: [...state.zOrder, widgetKey("struct", action.struct.id)],
      };
    case "struct/update":
      return {
        ...state,
        structs: state.structs.map((s) =>
          s.id === action.id ? { ...s, ...action.patch } : s,
        ),
      };
    case "struct/remove":
      return {
        ...state,
        structs: state.structs.filter((s) => s.id !== action.id),
        zOrder: state.zOrder.filter(
          (k) => k !== widgetKey("struct", action.id),
        ),
      };
    case "struct/item-add":
      return {
        ...state,
        structs: state.structs.map((s) =>
          s.id === action.structId
            ? { ...s, items: [...s.items, action.item] }
            : s,
        ),
      };
    case "struct/item-update":
      return {
        ...state,
        structs: state.structs.map((s) =>
          s.id === action.structId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.id === action.itemId ? { ...i, ...action.patch } : i,
                ),
              }
            : s,
        ),
      };
    case "struct/item-remove":
      return {
        ...state,
        structs: state.structs.map((s) =>
          s.id === action.structId
            ? { ...s, items: s.items.filter((i) => i.id !== action.itemId) }
            : s,
        ),
      };

    default:
      return state;
  }
}

const BoardStateContext = createContext<BoardState | null>(null);
const BoardDispatchContext = createContext<Dispatch<BoardAction> | null>(null);

export function BoardStoreProvider({
  data,
  children,
}: {
  data: BoardData;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, data, initialState);

  const value = useMemo(() => state, [state]);

  return (
    <BoardStateContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardStateContext.Provider>
  );
}

export function useBoardState(): BoardState {
  const state = useContext(BoardStateContext);
  if (!state) throw new Error("useBoardState outside BoardStoreProvider");
  return state;
}

export function useBoardDispatch(): Dispatch<BoardAction> {
  const dispatch = useContext(BoardDispatchContext);
  if (!dispatch) throw new Error("useBoardDispatch outside BoardStoreProvider");
  return dispatch;
}
