import { useState } from "react";
import { api } from "../api/client";
import { useApiData } from "./useApiData";

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

export function useGroceryLists() {
  const state = useApiData<{ groceryLists: GroceryList[] }>(() => api.get<{ groceryLists: GroceryList[] }>("/grocery-lists"), [], "grocery_lists");

  const createList = async (title: string) => {
    await api.post("/grocery-lists", { title });
    await state.refresh();
  };

  const deleteList = async (id: string) => {
    await api.delete(`/grocery-lists/${id}`);
    await state.refresh();
  };

  const mergeLists = async (listIds: string[], title = "Combined Grocery List") => {
    await api.post("/grocery-lists/merge", { listIds, title });
    await state.refresh();
  };

  return { ...state, groceryLists: state.data?.groceryLists ?? [], createList, deleteList, mergeLists };
}

export function useGroceryListDetail(listId: string) {
  const state = useApiData<{ groceryLists: GroceryList[] }>(() => api.get<{ groceryLists: GroceryList[] }>("/grocery-lists"), [], "grocery_lists");
  const list = state.data?.groceryLists.find((l) => l.id === listId) ?? null;

  const toggleItem = async (itemId: string, checked: boolean) => {
    await api.patch(`/grocery-lists/items/${itemId}`, { checked });
    await state.refresh();
  };

  const addItem = async (name: string, storeCategory = "other") => {
    await api.post(`/grocery-lists/${listId}/items`, { name, storeCategory });
    await state.refresh();
  };

  const removeItem = async (itemId: string) => {
    await api.delete(`/grocery-lists/items/${itemId}`);
    await state.refresh();
  };

  return { list, loading: state.loading, toggleItem, addItem, removeItem, refresh: state.refresh };
}

export const STORE_CATEGORIES = ["produce", "dairy", "meat", "bakery", "pantry", "frozen", "other"];
