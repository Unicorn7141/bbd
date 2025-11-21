"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Component } from "./lib/types";
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

interface ComponentFormProps {
  currentComponent?: Component | null;
  onSubmit: (data: Partial<Component>) => Promise<void>;
  componentTypes: string[];
  statuses: string[];
  onClose: () => void;
}

const ComponentForm: React.FC<ComponentFormProps> = ({
  currentComponent,
  onSubmit,
  componentTypes,
  statuses,
  onClose,
}) => {
  const isEditing = !!currentComponent;
  const [formData, setFormData] = useState<Partial<Component>>(
    currentComponent || {
      serialNumber: "",
      type: componentTypes?.[0] || "",
      dateReceived: new Date().toISOString().split("T")[0],
      arrivedFrom: "",
      primaryFault: "",
      secondaryFault: "",
      status: statuses?.[0] || "",
    }
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      await onSubmit({ id: currentComponent!.id, ...formData });
    } else {
      await onSubmit(formData);
    }

    onClose();
  };

  const inputClass =
    "w-full p-3 bg-[#1F2128] border border-[#2F333F] rounded-xl text-white focus:outline-none focus:border-[#6C5DD3] transition";
  const labelClass = "block text-sm font-medium text-[#808191] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>מספר סידורי (מס"ד)</label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>סוג</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {componentTypes?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>תאריך קבלה</label>
          <input
            type="date"
            name="dateReceived"
            value={formData.dateReceived?.split("T")[0]}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>הגיע מ...</label>
          <input
            type="text"
            name="arrivedFrom"
            value={formData.arrivedFrom}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>תקלה ראשונית</label>
          <input
            type="text"
            name="primaryFault"
            value={formData.primaryFault}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>תקלה משנית</label>
          <input
            type="text"
            name="secondaryFault"
            value={formData.secondaryFault}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>
      {isEditing && (
        <div>
          <label className={labelClass}>סטטוס</label>
          <select
            name="status"
            value={formData.status} // ✔ correct value: usable/faulty/etc
            onChange={handleChange}
            className={inputClass}
          >
            {statuses?.map((s) => (
              <option key={s} value={s}>
                {HE_STATUS_MAP[s]}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl font-bold hover:bg-[#5a4cb8] transition"
        >
          {isEditing ? "עדכן" : "הוסף"} רכיב
        </button>
      </div>
    </form>
  );
};

export default ComponentForm;
