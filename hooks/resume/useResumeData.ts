"use client";

import { useEffect, useState } from "react";
import type { ResumeData, ArrayKeys, ItemOf, Id } from "@/lib/resume/types";
import { STORAGE_KEY, emptyData } from "@/lib/resume/constants";
import { safeParseJSON, normalizeData, uid } from "@/lib/resume/utils";

export function useResumeData() {
  const [data, setData] = useState<ResumeData>(emptyData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = safeParseJSON<Partial<ResumeData>>(saved);
    if (!parsed) return;
    setData(normalizeData(parsed));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const onField =
    (name: keyof ResumeData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData((prev) => ({ ...prev, [name]: e.target.value }));
    };

  const updateArrayItem = <K extends ArrayKeys<ResumeData>>(
    section: K,
    id: Id,
    patch: Partial<ItemOf<ResumeData[K]>>
  ) => {
    setData((prev) => {
      const list = prev[section] as unknown as Array<{ id: Id }>;
      const next = list.map((it) => (it.id === id ? { ...it, ...patch } : it));
      return { ...prev, [section]: next } as ResumeData;
    });
  };

  const removeArrayItem = <K extends ArrayKeys<ResumeData>>(section: K, id: Id) => {
    setData((prev) => {
      const list = prev[section] as unknown as Array<{ id: Id }>;
      const next = list.filter((it) => it.id !== id);
      return { ...prev, [section]: next } as ResumeData;
    });
  };

  const addArrayItem = <K extends ArrayKeys<ResumeData>>(
    section: K,
    item: ItemOf<ResumeData[K]>
  ) => {
    setData((prev) => {
      const list = prev[section] as unknown as Array<ItemOf<ResumeData[K]>>;
      return { ...prev, [section]: [...list, item] } as ResumeData;
    });
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(emptyData);
  };

  return {
    data,
    setData,
    hydrated,
    onField,
    updateArrayItem,
    removeArrayItem,
    addArrayItem,
    resetAll,
    uid,
  };
}
