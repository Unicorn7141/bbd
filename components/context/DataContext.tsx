// components/context/DataContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Component, KPIs, HistoryEntry } from "../lib/types";

export const COMPONENT_TYPES = ["יום", "תרמי", "גימבל", "FCB"];
const STATUSES = ["usable", "faulty", "in-process", "returned", "closed"];

interface DataContextType {
  components: Component[];
  kpis: KPIs;
  loading: boolean;
  componentTypes: string[];
  statuses: string[];
  refreshData: () => void;
  addComponent: (data: Partial<Component>) => Promise<boolean>;
  updateComponent: (id: string, data: Partial<Component>) => Promise<boolean>;

  // ✅ async: history comes from the DB
  getComponentHistory: (id?: string) => Promise<HistoryEntry[]>;

  generateCsv: (data: any[]) => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<boolean>;
}

const initialKPIs: KPIs = {
  totalComponents: 0,
  totalActive: 0,
  totalUsable: 0,
  totalFaulty: 0,
  totalInProcess: 0,
  totalClosed: 0,
  statusOverview: [],
  typeAggregates: [],
};

const DataContext = createContext<DataContextType>({
  components: [],
  kpis: initialKPIs,
  loading: true,
  componentTypes: COMPONENT_TYPES,
  statuses: STATUSES,
  refreshData: () => {},
  addComponent: async () => false,
  updateComponent: async () => false,
  generateCsv: () => {},
  exportDatabase: () => {},
  importDatabase: async () => false,
  getComponentHistory: async () => [],
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [kpis, setKPIs] = useState<KPIs>(initialKPIs);
  const [loading, setLoading] = useState<boolean>(true);

  const computeKPIs = (list: Component[]) => {
    const totalUsable = list.filter((c) => c.status === "usable").length;
    const totalFaulty = list.filter((c) => c.status === "faulty").length;
    const totalInProcess = list.filter((c) => c.status === "in-process").length;
    const totalReturned = list.filter((c) => c.status === "returned").length;
    const totalClosed = list.filter((c) => c.status === "closed").length;

    const statusOverview = [
      {
        name: "תקין",
        rawStatus: "usable",
        value: totalUsable,
        color: "#0096FF",
      },
      {
        name: "תקול",
        rawStatus: "faulty",
        value: totalFaulty,
        color: "#FF754B",
      },
      {
        name: "בטיפול",
        rawStatus: "in-process",
        value: totalInProcess,
        color: "#CF86FF",
      },
      {
        name: "הוחזר",
        rawStatus: "returned",
        value: totalReturned,
        color: "#7F8392",
      },
      {
        name: "סגור",
        rawStatus: "closed",
        value: totalClosed,
        color: "#2D303E",
      },
    ];

    const typeAggregates = COMPONENT_TYPES.map((type) => {
      const group = list.filter((c) => c.type === type);
      return {
        type,
        usable: group.filter((c) => c.status === "usable").length,
        faulty: group.filter((c) => c.status === "faulty").length,
        inProcess: group.filter((c) => c.status === "in-process").length,
        returned: group.filter((c) => c.status === "returned").length,
        closed: group.filter((c) => c.status === "closed").length,
      };
    });

    setKPIs({
      totalComponents: list.length,
      totalActive: list.length - totalClosed - totalReturned,
      totalUsable,
      totalFaulty,
      totalInProcess,
      totalClosed,
      statusOverview,
      typeAggregates,
    });
  };

  const refreshData = () => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/components");
        if (!res.ok) throw new Error("Failed to fetch components");
        const data: Component[] = await res.json();
        setComponents(data);
        computeKPIs(data);
      } catch (err) {
        console.error("Failed to load components", err);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addComponent = async (data: Partial<Component>) => {
    try {
      const res = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) return false;
      const created: Component = await res.json();
      const newList = [created, ...components];
      setComponents(newList);
      computeKPIs(newList);
      return true;
    } catch (err) {
      console.error("addComponent error", err);
      return false;
    }
  };

  const updateComponent = async (
    id: string,
    updatedFields: Partial<Component>
  ) => {
    try {
      const res = await fetch(`/api/components/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedFields }),
      });
      if (!res.ok) return false;

      const updated: Component = await res.json();
      const newList = components.map((c) => (c.id === id ? updated : c));
      setComponents(newList);
      computeKPIs(newList);
      return true;
    } catch (err) {
      console.error("updateComponent error", err);
      return false;
    }
  };

  // ✅ History from /api/components/:id
  const getComponentHistory = async (id?: string): Promise<HistoryEntry[]> => {
    if (!id) return [];
    try {
      const res = await fetch(`/api/components/${id}`);
      if (!res.ok) {
        console.error("getComponentHistory failed", res.status);
        return [];
      }
      const data = await res.json();
      return (data.history as HistoryEntry[]) || [];
    } catch (err) {
      console.error("getComponentHistory error", err);
      return [];
    }
  };

  const generateCsv = (data: any[]) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).filter((k) => k !== "history");
    const rows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) =>
            typeof row[h] === "string"
              ? `"${row[h].replace(/"/g, '""')}"`
              : row[h]
          )
          .join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "components.csv";
    a.click();
  };

  const exportDatabase = () => {
    const blob = new Blob([JSON.stringify(components, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "components-backup.json";
    a.click();
  };

  const importDatabase = async (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") return resolve(false);
          const parsed: Component[] = JSON.parse(result);
          setComponents(parsed);
          computeKPIs(parsed);
          resolve(true);
        } catch (err) {
          console.error("importDatabase error", err);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <DataContext.Provider
      value={{
        components,
        kpis,
        loading,
        componentTypes: COMPONENT_TYPES,
        statuses: STATUSES,
        refreshData,
        addComponent,
        updateComponent,
        getComponentHistory,
        generateCsv,
        exportDatabase,
        importDatabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
