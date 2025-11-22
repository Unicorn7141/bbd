"use client";

import React, { useState } from "react";
import { useData } from "./context/DataContext";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card, CircularProgress, Modal } from "./UI";
import ManagementContent from "./ManagementContent";

const DashboardContent = () => {
  const { kpis, loading } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState<Record<string, string>>({});
  const [modalTitle, setModalTitle] = useState("");

  const handleChartClick = (data: any, title: string, filterKey = "status") => {
    if (!data) return;
    const filterValue = data.rawStatus || data.name || data.type;
    setModalFilter({ [filterKey]: filterValue });
    setModalTitle(`${title}: ${data.name || data.type}`);
    setModalOpen(true);
  };

  if (loading)
    return <div className="p-8 text-center text-white">טוען נתונים...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        {/* <div className="text-[#808191] text-sm">סקירה כללית של מלאי</div> */}
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Bars */}
        <Card className="lg:col-span-2 min-h-[400px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-white">פירוט מעמיק</h2>
            <div className="text-sm text-[#808191]">סטטוס מכלולים</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.typeAggregates} barSize={12}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2F333F"
                  vertical={false}
                />
                <XAxis
                  dataKey="type"
                  stroke="#808191"
                  tick={{ fill: "#808191", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#808191"
                  tick={{ fill: "#808191", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip
                  cursor={{ fill: "#2F333F" }}
                  contentStyle={{
                    backgroundColor: "#242731",
                    borderColor: "#2F333F",
                    borderRadius: "8px",
                    color: "#fff",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Bar
                  dataKey="usable"
                  stackId="a"
                  fill="#0096FF"
                  radius={[4, 4, 0, 0]}
                  name="תקין"
                  onClick={(d) => handleChartClick(d, "Type", "type")}
                />
                <Bar
                  dataKey="inProcess"
                  stackId="a"
                  fill="#6C5DD3"
                  name="בטיפול"
                  onClick={(d) => handleChartClick(d, "Type", "type")}
                />
                <Bar
                  dataKey="faulty"
                  stackId="a"
                  fill="#FF754B"
                  name="תקול"
                  onClick={(d) => handleChartClick(d, "Type", "type")}
                />
                <Bar
                  dataKey="closed"
                  stackId="a"
                  fill="#31a919ff"
                  radius={[0, 0, 4, 4]}
                  name="סגור"
                  onClick={(d) => handleChartClick(d, "Type", "type")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        {/* <Card className="lg:col-span-2 min-h-[400px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">זרימת מכלולים</h2>
              <p className="text-[#808191] text-xs">פילוח לפי סוג</p>
            </div>
            <div className="flex gap-x-4">
              <div className="flex items-center text-xs text-[#808191]">
                <span className="w-2 h-2 rounded-full bg-[#0096FF] ml-1"></span>
                תקין
              </div>

              <div className="flex items-center text-xs text-[#808191]">
                <span className="w-2 h-2 rounded-full bg-[#6C5DD3] ml-1"></span>
                בטיפול
              </div>

              <div className="flex items-center text-xs text-[#808191]">
                <span className="w-2 h-2 rounded-full bg-[#31a919ff] ml-1"></span>
                סגור
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={kpis.typeAggregates}
                margin={{ top: 10, right: 0, left: 30, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0096FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0096FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProcess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#31a919ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#31a919ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2F333F"
                  vertical={false}
                />
                <XAxis
                  dataKey="type"
                  stroke="#808191"
                  tick={{ fill: "#808191", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#808191"
                  tick={{ fill: "#808191", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#242731",
                    borderColor: "#2F333F",
                    borderRadius: "12px",
                    color: "#fff",
                    textAlign: "right",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="usable"
                  name="תקין"
                  stroke="#0096FF"
                  strokeWidth={3}
                  fillOpacity={0.4}
                  fill="#0096FF"
                />

                <Area
                  type="monotone"
                  dataKey="inProcess"
                  name="בטיפול"
                  stroke="#6C5DD3"
                  strokeWidth={3}
                  fillOpacity={0.4}
                  fill="#6C5DD3"
                />

                <Area
                  type="monotone"
                  dataKey="faulty"
                  name="תקול"
                  stroke="#FF754B"
                  strokeWidth={3}
                  fillOpacity={0.4}
                  fill="#FF754B"
                />

                <Area
                  type="monotone"
                  dataKey="returned"
                  name="הוחזר"
                  stroke="#c80e8aff"
                  strokeWidth={3}
                  fillOpacity={0.4}
                  fill="#c80e8aff"
                />

                <Area
                  type="monotone"
                  dataKey="closed"
                  name="סגור"
                  stroke="#31a919ff"
                  strokeWidth={3}
                  fillOpacity={0.4}
                  fill="#31a919ff"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card> */}

        <Card className="flex flex-col items-center justify-center relative">
          <h2 className="absolute top-6 right-6 text-lg font-bold text-white">
            סטטוס כללי
          </h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpis.statusOverview}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                  onClick={(data) => handleChartClick(data, "לפי סטטוס")}
                  stroke="none"
                >
                  {kpis.statusOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 20, 30, 0.95)",
                    borderRadius: "10px",
                    border: "1px solid #6C5DD3",
                    color: "#ffffff",
                    textAlign: "right",
                  }}
                  itemStyle={{ color: "#ffffff", fontSize: 14 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">
                {kpis.totalActive}
              </span>
              <span className="text-sm text-[#808191]">פעילים</span>
            </div>
          </div>

          <div className="w-full mt-4 space-y-3">
            {kpis.statusOverview.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center text-[#808191]">
                  <span
                    className="w-3 h-3 rounded-full ml-2"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.name}
                </div>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Circles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <CircularProgress
          value={kpis.totalComponents}
          label='סה"כ'
          subLabel="התקבלו"
          color="#0096FF"
        />
        <CircularProgress
          value={kpis.totalUsable}
          label="תקין"
          subLabel="מוכן"
          color="#00D9D9"
        />
        <CircularProgress
          value={kpis.totalInProcess}
          label="בטיפול"
          subLabel="בעבודה"
          color="#6C5DD3"
        />
        <CircularProgress
          value={kpis.totalFaulty}
          label="תקול"
          subLabel="פגום"
          color="#FF754B"
        />
        <CircularProgress
          value={kpis.totalClosed}
          label="סגור"
          subLabel="ארכיון"
          color="#31a919ff"
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      >
        <ManagementContent embeddedFilter={modalFilter} showHeader={false} />
      </Modal>
    </div>
  );
};

export default DashboardContent;
