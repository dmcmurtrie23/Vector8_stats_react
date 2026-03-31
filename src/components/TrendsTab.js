import React, { useMemo } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { avg, med, grp, REGION_COLORS, COLORS, TT } from '../utils';
import { MetricsGrid, MetricCard, ChartGrid, ChartBox, SectionTitle, DataTable, OkBox, Divider } from './UI';

export default function TrendsTab({ rows }) {
  const regions = useMemo(() => [...new Set(rows.map(r => r.region))], [rows]);

  const byDR = useMemo(() => {
    const dates = [...new Set(rows.map(r => r.date))].sort();
    return dates.map(d => {
      const o = { date: d };
      regions.forEach(rg => { o[rg] = rows.filter(r => r.date === d && r.region === rg).length; });
      return o;
    });
  }, [rows, regions]);

  const gbDay = useMemo(() => {
    const g = grp(rows, 'date');
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([d, rs]) => ({ date: d, GB: +(rs.reduce((s, r) => s + r.file_size_mb, 0) / 1024).toFixed(2) }));
  }, [rows]);

  const topC = useMemo(() => {
    const g = grp(rows, 'customer_name');
    return Object.entries(g).map(([n, rs]) => ({ name: n, GB: +(rs.reduce((s, r) => s + r.file_size_mb, 0) / 1024).toFixed(2) })).sort((a, b) => b.GB - a.GB).slice(0, 15);
  }, [rows]);

  const rTime = useMemo(() => {
    const g = grp(rows.filter(r => r.time_to_cloud_ms > 0), 'region');
    return Object.entries(g).map(([region, rs]) => {
      const m = rs.map(r => r.time_to_cloud_min);
      return { region, Avg: +avg(m).toFixed(2), Median: +med(m).toFixed(2), Min: +Math.min(...m).toFixed(2), Max: +Math.max(...m).toFixed(2), Sessions: rs.length };
    });
  }, [rows]);

  const errS = useMemo(() => {
    const g = grp(rows, 'customer_name');
    return Object.entries(g)
      .map(([n, rs]) => ({ n, t: rs.length, e: rs.filter(r => !r.success).length }))
      .filter(r => r.e > 0)
      .map(r => ({ Customer: r.n, 'Error Rate %': +(r.e / r.t * 100).toFixed(1), Errors: r.e, Sessions: r.t }))
      .sort((a, b) => b['Error Rate %'] - a['Error Rate %']);
  }, [rows]);

  return (
    <div>
      <ChartBox title="Daily upload sessions by region" style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byDR} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {regions.map(rg => <Bar key={rg} dataKey={rg} stackId="a" fill={REGION_COLORS[rg] || COLORS[0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <ChartGrid>
        <ChartBox title="Daily data volume (GB)">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={gbDay} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="GB" stroke="#378ADD" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Top 15 customers by data uploaded (GB)">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={topC} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10 }} unit=" GB" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} />
              <Tooltip {...TT} />
              <Bar dataKey="GB" fill="#378ADD" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </ChartGrid>

      <SectionTitle>Average upload time by region</SectionTitle>
      <MetricsGrid cols={Math.max(rTime.length, 1)}>
        {rTime.map(r => <MetricCard key={r.region} label={r.region} value={r.Avg.toFixed(1) + ' min avg'} delta={'median ' + r.Median.toFixed(1) + ' min'} />)}
      </MetricsGrid>

      <ChartGrid>
        <ChartBox title="Avg time to cloud by region (min)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rTime} margin={{ top: 16, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...TT} />
              <Bar dataKey="Avg" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, formatter: v => v.toFixed(1) + ' min' }}>
                {rTime.map((r, i) => <Cell key={i} fill={REGION_COLORS[r.region] || COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Region summary">
          <DataTable cols={['region', 'Avg', 'Median', 'Min', 'Max', 'Sessions']} rows={rTime} />
        </ChartBox>
      </ChartGrid>

      <Divider />
      <SectionTitle>Error rate by customer</SectionTitle>
      {errS.length === 0
        ? <OkBox>✅ No upload errors found across all customers.</OkBox>
        : <>
          <ChartBox title="Upload error rate — customers with errors only" style={{ marginBottom: 12 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={errS} margin={{ top: 16, right: 8, bottom: 70, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="Customer" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip {...TT} />
                <Bar dataKey="Error Rate %" fill="#E24B4A" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 9, formatter: v => v + '%' }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <DataTable cols={['Customer', 'Error Rate %', 'Errors', 'Sessions']} rows={errS} />
        </>}
    </div>
  );
}
