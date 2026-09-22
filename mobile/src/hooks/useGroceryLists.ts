import { api } from "../api/client";
import { useApiData } from "./useApiData";
import { useApiGate } from "./useApiGate";

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  storeCategory: string;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  title: string;
  createdAt: string;
  items: GroceryItem[];
}

const PLUS_REASON = "Create a free account, then upgrade to Grandma+, to generate grocery lists.";

export function useGroceryLists() {
  const state = useApiData<{ groceryLists: GroceryList[] }>(() => api.get<{ groceryLists: GroceryList[] }>("/grocery-lists"), [], "grocery_lists");
  const gate = useApiGate();

  const createList = async (title: string) => {
    const created = await gate(() => api.post("/grocery-lists", { title }), { account: PLUS_REASON, plus: PLUS_REASON });
    if (created) await state.refresh();
    return Boolean(created);
  };

  const deleteList = async (id: string) => {
    await api.delete(`/grocery-lists/${id}`);
    await state.refresh();
  };

  const mergeLists = async (listIds: string[], title = "Combined Grocery List") => {
    const merged = await gate(() => api.post("/grocery-lists/merge", { listIds, title }), { account: PLUS_REASON, plus: PLUS_REASON });
    if (merged) await state.refresh();
    return Boolean(merged);
  };

  return { ...state, groceryLists: state.data?.groceryLists ?? [], createList, deleteList, mergeLists };
}

export function useGroceryListDetail(listId: string) {
  const state = useApiData<{ groceryLists: GroceryList[] }>(() => api.get<{ groceryLists: GroceryList[] }>("/grocery-lists"), [], "grocery_lists");
  const list = state.data?.groceryLists.find((l) => l.id === listId) ?? null;
  const gate = useApiGate();

  const toggleItem = async (itemId: string, checked: boolean) => {
    await api.patch(`/grocery-lists/items/${itemId}`, { checked });
    await state.refresh();
  };

  const addItem = async (name: string, storeCategory = "other") => {
    const added = await gate(() => api.post(`/grocery-lists/${listId}/items`, { name, storeCategory }), { account: PLUS_REASON, plus: PLUS_REASON });
    if (added) await state.refresh();
    return Boolean(added);
  };

  const removeItem = async (itemId: string) => {
    await api.delete(`/grocery-lists/items/${itemId}`);
    await state.refresh();
  };

  return { list, loading: state.loading, toggleItem, addItem, removeItem, refresh: state.refresh };
}

export const STORE_CATEGORIES = ["produce", "dairy", "meat", "bakery", "pantry", "frozen", "other"];
