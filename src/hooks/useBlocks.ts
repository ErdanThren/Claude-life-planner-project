import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TimeBlock } from '../types';

const STORAGE_KEY = 'life-planner-blocks';

function loadBlocks(): TimeBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: TimeBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

export function useBlocks() {
  const [blocks, setBlocks] = useState<TimeBlock[]>(loadBlocks);

  const persist = useCallback((updated: TimeBlock[]) => {
    setBlocks(updated);
    saveBlocks(updated);
  }, []);

  const addBlock = useCallback(
    (block: Omit<TimeBlock, 'id'>) => {
      const newBlock: TimeBlock = { ...block, id: uuidv4() };
      persist([...blocks, newBlock]);
      return newBlock;
    },
    [blocks, persist]
  );

  const updateBlock = useCallback(
    (id: string, updates: Partial<TimeBlock>) => {
      persist(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    },
    [blocks, persist]
  );

  const removeBlock = useCallback(
    (id: string) => {
      persist(blocks.filter((b) => b.id !== id));
    },
    [blocks, persist]
  );

  const addBlocks = useCallback(
    (newBlocks: TimeBlock[]) => {
      persist([...blocks, ...newBlocks]);
    },
    [blocks, persist]
  );

  const removeAutoScheduled = useCallback(
    (dateStr?: string) => {
      persist(
        blocks.filter(
          (b) => !b.isAutoScheduled || (dateStr && b.date !== dateStr)
        )
      );
    },
    [blocks, persist]
  );

  return { blocks, addBlock, updateBlock, removeBlock, addBlocks, removeAutoScheduled };
}
