"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
} from "recharts";

interface RetentionMetrics {
  installDate: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
  country: string;
  platform: string;
}

import "../../styles/globals.css";

export default function Dashboard() {
  const [installDateMetrics, setInstallDateMetrics] = useState<
    RetentionMetrics[]
  >([]);
  const [countryMetrics, setCountryMetrics] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState([]);
  const [retentionData, setRetentionData] = useState<{
    d1Retention: number;
    d7Retention: number;
    d30Retention: number;
  } | null>(null);

  const [filters, setFilters] = useState({
    country: "",
    platform: "",
    installDateStart: "",
    installDateEnd: "",
  });

  async function fetchOverall() {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/overallMetrics?${query}`);
    const retentionData = await res.json();
    setRetentionData(retentionData);
  }

  async function fetchMetrics() {
    const installDateRes = await fetch(`/api/dateMetrics`);
    const countryRes = await fetch(`/api/countryMetrics`);
    const retentionRes = await fetch("api/overallMetrics");
    const retentionData = await retentionRes.json();
    const platformRes = await fetch(`/api/platformMetrics`);

    const countryData = await countryRes.json();
    const platformData = await platformRes.json();
    const installDateData = await installDateRes.json();

    setInstallDateMetrics(installDateData);
    setCountryMetrics(countryData);
    setRetentionData(retentionData);
    setPlatformMetrics(platformData);
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (!retentionData) return <p>Loading...</p>;

  const chartData = installDateMetrics.map((metric) => ({
    installDate: metric.installDate,
    d1Retention: metric.d1Retention * 100,
    d7Retention: metric.d7Retention * 100,
    d30Retention: metric.d30Retention * 100,
  }));

  const pieData = [
    { name: "D1 Retention", value: retentionData.d1Retention },
    { name: "D7 Retention", value: retentionData.d7Retention },
    { name: "D30 Retention", value: retentionData.d30Retention },
  ];

  const COLORS = ["#007bff", "#28a745", "#dc3545"];

  return (
    <div className="dashboard">
      <div className="retention-pie-chart">
        <h1>Overall Retention Rates</h1>
        <div className="filters">
          <div>
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              placeholder="e.g., US"
            />
          </div>
          <div>
            <label>Platform</label>
            <input
              type="text"
              name="platform"
              value={filters.platform}
              onChange={handleFilterChange}
              placeholder="e.g., ios"
            />
          </div>
          <div>
            <label>Install Date Start</label>
            <input
              type="date"
              name="installDateStart"
              value={filters.installDateStart}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label>Install Date End</label>
            <input
              type="date"
              name="installDateEnd"
              value={filters.installDateEnd}
              onChange={handleFilterChange}
            />
          </div>
          <button onClick={fetchOverall}>Apply Filters</button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h1>Retention Vs Install Date</h1>
      <div className="chart-container scrollable">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="installDate" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="d1Retention"
              stroke="#007bff"
              name="D1 Retention"
            />
            <Line
              type="monotone"
              dataKey="d7Retention"
              stroke="#28a745"
              name="D7 Retention"
            />
            <Line
              type="monotone"
              dataKey="d30Retention"
              stroke="#dc3545"
              name="D30 Retention"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h1>Retention Metrics by Country</h1>
      <div className="chart-container scrollable">
        <ResponsiveContainer width={countryMetrics.length * 80} height={600}>
          <BarChart data={countryMetrics} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="d1Retention" fill="#007bff" name="D1 Retention" />
            <Bar dataKey="d7Retention" fill="#28a745" name="D7 Retention" />
            <Bar dataKey="d30Retention" fill="#dc3545" name="D15 Retention" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h1>Retention Metrics by Platform</h1>
      <div className="chart-container scrollable">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={platformMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="d1Retention"
              fill="#007bff"
              name="D1 Retention"
              barSize={60}
            />
            <Bar
              dataKey="d7Retention"
              fill="#28a745"
              name="D7 Retention"
              barSize={60}
            />
            <Bar
              dataKey="d30Retention"
              fill="#dc3545"
              name="D30 Retention"
              barSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
