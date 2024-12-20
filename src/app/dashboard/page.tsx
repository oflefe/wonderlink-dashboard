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
} from "recharts";

interface RetentionMetrics {
  installDate: string;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
  country: string;
  platform: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<RetentionMetrics[]>([]);
  const [countryMetrics, setCountryMetrics] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState([]);

  const [filters, setFilters] = useState({
    installDate: "",
    country: "",
    platform: "",
  });

  async function fetchMetrics() {
    const installDateRes = await fetch(`/api/dateMetrics`);
    const countryRes = await fetch(`/api/countryMetrics`);
    //const platformRes = await fetch(`/api/platformMetrics`);

    const countryData = await countryRes.json();
    //const platformData = await platformRes.json();
    const installDateData = await installDateRes.json();

    setMetrics(installDateData);
    setCountryMetrics(countryData);
    //setPlatformMetrics(platformData);
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const chartData = metrics.map((metric) => ({
    installDate: metric.installDate,
    d1Retention: metric.d1Retention * 100, // Convert to percentage
    d7Retention: metric.d7Retention * 100, // Convert to percentage
    d30Retention: metric.d30Retention * 100, // Convert to percentage
  }));

  return (
    <div className="dashboard">
      <h1>Retention Metrics</h1>
      <div className="chart-container scrollable">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="installDate" />
            <YAxis />
            <Tooltip />
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
