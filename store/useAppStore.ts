import { create } from "zustand";
import type { Task, DailyCheckin, ChatMessage, EnergyLevel, MoodLevel } from "@/types";

interface AppStore {
  // Check-in state
  todayCheckin: DailyCheckin | null;
  setTodayCheckin: (checkin: DailyCheckin | null) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;

  // Chat
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;

  // UI state
  currentEnergy: EnergyLevel | null;
  currentMood: MoodLevel | null;
  setCurrentEnergy: (energy: EnergyLevel | null) => void;
  setCurrentMood: (mood: MoodLevel | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  todayCheckin: null,
  setTodayCheckin: (checkin) => set({ todayCheckin: checkin }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  currentEnergy: null,
  currentMood: null,
  setCurrentEnergy: (energy) => set({ currentEnergy: energy }),
  setCurrentMood: (mood) => set({ currentMood: mood }),
}));
