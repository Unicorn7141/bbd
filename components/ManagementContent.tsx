// components/ManagementContent.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ChangeEvent,
} from "react";
import { useData } from "./context/DataContext";
import { Search, Plus, Download, Upload, Clock } from "lucide-react";
import { THEME, IconButton, StatusIcon, Modal } from "./UI";
import { Component, HistoryEntry } from "./lib/types";
import ComponentForm from "./ComponentForm";
import { COMPONENT_TYPES } from "./context/DataContext";

const HE_STATUS_MAP: Record<string, string> = {
  usable: "תקין",
  faulty: "תקול",
  "in-process": "בטיפול",
  returned: "פונה לתיקון",
  closed: "סגור",
};

const HE_HISTORY_KEYS: Record<string, string> = {
  status: "סטטוס",
  primaryFault: "תקלה ראשית",
  secondaryFault: "תקלה משנית",
  type: "סוג",
  dateReceived: "תאריך קבלה",
  arrivedFrom: "מקור",
  serialNumber: "מספר סידורי",
  initial: "נוצר",
};

interface ManagementContentProps {
  embeddedFilter?: Record<string, string>;
  showHeader?: boolean;
}

// ✅ Helper: unify how we display values in history
const formatHistoryValue = (key: string, value: any): string => {
  if (value === null || value === undefined || value === "") return "—";

  // Status -> Hebrew text
  if (key === "status") {
    return HE_STATUS_MAP[value as string] || String(value);
  }

  // Date-only field (תאריך קבלה)
  if (key === "dateReceived") {
    if (typeof value === "string") {
      // "2025-11-22" or "2025-11-22T00:00:00.000Z"
      const str = value.length > 10 ? value : value + "T00:00:00";
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("he-IL");
      }
      return value;
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toLocaleDateString("he-IL");
    }
    return String(value);
  }

  // Generic: keep as-is
  return String(value);
};

const ManagementContent: React.FC<ManagementContentProps> = ({
  embeddedFilter = {},
  showHeader = true,
}) => {
  const {
    components,
    loading,
    statuses,
    addComponent,
    updateComponent,
    getComponentHistory,
    generateCsv,
    exportDatabase,
    importDatabase,
    refreshData,
  } = useData();

  const [search, setSearch] = useState("");
  const [filters, setFilters] =
    useState<Record<string, string>>(embeddedFilter);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ REAL history data from DB
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // ✅ Load history only when modal opens
  useEffect(() => {
    if (isHistoryModalOpen && selectedComponent?.id) {
      (async () => {
        const entries = await getComponentHistory(selectedComponent.id);
        setHistoryEntries(entries || []);
      })();
    } else if (!isHistoryModalOpen) {
      setHistoryEntries([]);
    }
  }, [isHistoryModalOpen, selectedComponent, getComponentHistory]);

  // Apply embedded filter only once on mount
  useEffect(() => {
    if (Object.keys(embeddedFilter).length > 0) {
      setFilters(embeddedFilter);
    }
  }, [embeddedFilter]);

  const filteredComponents = useMemo(() => {
    let result = components;
    if (search)
      result = result.filter(
        (c) =>
          c.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase()) ||
          c.status.toLowerCase().includes(search.toLowerCase())
      );
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "All") {
        result = result.filter((c) => (c as any)[key] === value);
      }
    });
    return result;
  }, [components, search, filters]);

  const handleFormSubmit = async (formData: Partial<Component>) => {
    if (isEditing && selectedComponent)
      await updateComponent(selectedComponent.id, formData);
    else await addComponent(formData);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files[0] &&
      confirm("האם לשחזר נתונים? הפעולה תדרוס את המידע הקיים.")
    ) {
      if (await importDatabase(e.target.files[0])) {
        alert("שוחזר בהצלחה!");
        refreshData();
      } else {
        alert("נכשל.");
      }
    }
    e.target.value = "";
  };

  if (loading) return <div>טוען...</div>;

  // ✅ Different container for full page vs. embedded modal
  const containerClass = showHeader
    ? "w-full max-w-full p-4 sm:p-6 md:p-10 min-h-screen"
    : "w-full max-w-full p-3 sm:p-4 md:p-6";

  return (
    <div className={`${containerClass} ${THEME.textMain}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">ניהול מכלולים</h1>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={exportDatabase}
              className="px-3 sm:px-4 py-2 bg-[#242731] border border-[#2F333F] rounded-xl text-xs sm:text-sm hover:bg-[#2F333F] transition flex items-center"
            >
              <Download className="w-4 h-4 ml-2" /> גיבוי
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 sm:px-4 py-2 bg-[#242731] border border-[#2F333F] rounded-xl text-xs sm:text-sm hover:bg-[#2F333F] transition flex items-center"
            >
              <Upload className="w-4 h-4 ml-2" /> שחזור
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative flex-grow">
          <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#808191]" />
          <input
            type="text"
            placeholder="חיפוש מספר סידורי, סוג, סטטוס..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-11 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3 bg-[#242731] border border-[#2F333F] rounded-xl text-white focus:outline-none focus:border-[#6C5DD3] transition placeholder-[#808191] text-sm"
          />
        </div>
        {showHeader && (
          <>
            <IconButton
              onClick={() => generateCsv(filteredComponents)}
              className="bg-[#242731] border border-[#2F333F] !text-white !shadow-none hover:!bg-[#2F333F]"
            >
              <Download className="w-5 h-5" />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsEditing(false);
                setSelectedComponent(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="w-5 h-5 ml-2" /> הוסף חדש
            </IconButton>
          </>
        )}
      </div>

      <div className="bg-[#242731] rounded-3xl overflow-hidden border border-[#2F333F]">
        <div className="overflow-x-auto">
          <table className="w-full text-right table-auto text-xs sm:text-sm">
            <thead className="bg-[#1F2128] border-b border-[#2F333F]">
              <tr>
                {[
                  'מס"ד',
                  "סוג",
                  "התקבל",
                  "מקור",
                  "תקלה",
                  "עודכן",
                  "סטטוס",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-[0.65rem] sm:text-xs font-semibold text-[#808191] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F333F]">
              {filteredComponents.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#2F333F] transition cursor-pointer group"
                  onClick={() => {
                    setSelectedComponent(c);
                    setIsEditing(true);
                    setIsFormModalOpen(true);
                  }}
                >
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-bold text-white">
                    {c.serialNumber}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-[#808191]">
                    {c.type}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-[#808191]">
                    {c.dateReceived}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-[#808191]">
                    {c.arrivedFrom}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-[#808191] truncate max-w-[120px] sm:max-w-xs">
                    {c.primaryFault}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm text-[#808191]">
                    {new Date(c.updateDate).toLocaleDateString("he-IL")}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm flex items-center">
                    <StatusIcon status={c.status} />{" "}
                    <span className="mr-2 sm:mr-3 capitalize text-white">
                      {HE_STATUS_MAP[c.status] || c.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponent(c);
                        setIsHistoryModalOpen(true);
                      }}
                      className="text-[#6C5DD3] hover:text-white transition p-2 rounded-full hover:bg-[#6C5DD3]"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredComponents.length === 0 && (
          <div className="p-6 sm:p-8 text-center text-[#808191]">
            לא נמצאו רכיבים.
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? "ערוך רכיב" : "רכיב חדש"}
      >
        <ComponentForm
          currentComponent={isEditing ? selectedComponent : null}
          onSubmit={handleFormSubmit}
          statuses={statuses}
          componentTypes={COMPONENT_TYPES}
          onClose={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="היסטוריה"
      >
        <div className="space-y-6 relative pr-4 border-r border-[#2F333F] max-h-[70vh] overflow-y-auto">
          {historyEntries
            .slice()
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .map((entry, i) => (
              <div key={i} className="relative">
                <div className="absolute -right-[21px] top-1 w-3 h-3 rounded-full bg-[#6C5DD3] ring-4 ring-[#1F2128]"></div>
                <div className="bg-[#1F2128] p-4 rounded-xl border border-[#2F333F] mr-4">
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="font-bold text-white">
                      עדכון {entry.version}
                    </span>
                    <span className="text-[#808191]">
                      {new Date(entry.timestamp).toLocaleString("he-IL")}
                    </span>
                  </div>

                  {Object.entries(entry.changes).map(([key, change]) => {
                    const label = HE_HISTORY_KEYS[key] || key;

                    if (key === "initial") {
                      return (
                        <div
                          key={key}
                          className="text-xs sm:text-sm text-white flex gap-2"
                        >
                          <strong>{label}</strong>
                        </div>
                      );
                    }

                    const c =
                      typeof change === "string"
                        ? { new: change }
                        : (change as any);

                    const oldValue = formatHistoryValue(key, c.old);
                    const newValue = formatHistoryValue(key, c.new);

                    // ✨ If formatted values are identical, don't show this row
                    if (oldValue === newValue) return null;

                    return (
                      <div
                        key={key}
                        className="text-xs sm:text-sm text-[#808191] flex gap-2"
                      >
                        <span className="text-xs font-bold text-[#6C5DD3] w-24 sm:w-28">
                          {label}:
                        </span>
                        <span>
                          <span className="text-white">{newValue}</span> ➔{" "}
                          {oldValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
};

export default ManagementContent;
