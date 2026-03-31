import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { avg, grp, TT } from '../utils';
import { SearchRow, SearchInput, SelectInput, MetricsGrid, MetricCard, Divider, ChartGrid, ChartBox, SectionTitle, DataTable, InfoBox } from './UI';

export default function ActivityTab({ rows }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');

  const all = useMemo(() => [...new Set(rows.map(r => r.customer_name))].sort(), [rows]);
  const flt = useMemo(() => q ? all.filter(c => c.toLowerCase().includes(q.toLowerCase())) : all, [all, q]);
  const cust = sel || flt[0] || '';
  const cr = useMemo(() => rows.filter(r => r.customer_name === cust), [rows, cust]);

  const ok = cr.filter(r => r.success);
  const err = cr.filter(r => !r.success);
  const gbT = cr.reduce((s, r) => s + r.file_size_mb, 0) / 1024;
  const sR = cr.filter(r => r.upload_rate_mbps > 0);
  const tR = cr.filter(r => r.time_to_cloud_ms > 0);

  const byDay = useMemo(() => {
    const g = grp(cr, 'date');
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([d, rs]) => ({ date: d, Sessions: rs.length, Errors: rs.filter(r => !r.success).length }));
  }, [cr]);

  const sDay = useMemo(() => {
    const g = grp(sR, 'date');
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([d, rs]) => ({ date: d, Speed: +avg(rs.map(r => r.upload_rate_mbps)).toFixed(2) }));
  }, [sR]);

  const tDay = useMemo(() => {
    const g = grp(tR, 'date');
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([d, rs]) => ({ date: d, Minutes: +avg(rs.map(r => r.time_to_cloud_min)).toFixed(2) }));
  }, [tR]);

  const bins = useMemo(() => {
    if (!sR.length) return [];
    const v = sR.map(r => r.upload_rate_mbps);
    const mn = Math.min(...v), mx = Math.max(...v), n = 15, w = (mx - mn) / n || 1;
    const c = Array(n).fill(0);
    v.forEach(x => { c[Math.min(Math.floor((x - mn) / w), n - 1)]++; });
    return c.map((ct, i) => ({ range: `${(mn + i * w).toFixed(1)}-${(mn + (i + 1) * w).toFixed(1)}`, Count: ct }));
  }, [sR]);

  return (
    <div>
      <SearchRow>
        <SearchInput value={q} onChange={e => { setQ(e.target.value); setSel(''); }} placeholder="Search customers..." />
        <SelectInput value={cust} onChange={e => setSel(e.target.value)} options={flt} />
      </SearchRow>

      {cr.length === 0
        ? <InfoBox>No data for this customer.</InfoBox>
        : <>
          <MetricsGrid cols={6}>
            <MetricCard label="Total sessions" value={cr.length.toLocaleString()} />
            <MetricCard label="Successful" value={ok.length.toLocaleString()} />
            <MetricCard label="Errors" value={err.length.toLocaleString()} />
            <MetricCard label="Data uploaded" value={gbT.toFixed(2) + ' GB'} />
            <MetricCard label="Avg upload speed" value={sR.length ? avg(sR.map(r => r.upload_rate_mbps)).toFixed(1) + ' MB/s' : 'N/A'} />
            <MetricCard label="Avg upload time" value={tR.length ? avg(tR.map(r => r.time_to_cloud_min)).toFixed(1) + ' min' : 'N/A'} />
          </MetricsGrid>

          <Divider />

          <ChartGrid>
            <ChartBox title="Sessions per day">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={byDay} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip {...TT} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Sessions" stackId="a" fill="#1D9E75" />
                  <Bar dataKey="Errors" stackId="a" fill="#E24B4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Speed distribution (MB/s)">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={bins} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip {...TT} />
                  <Bar dataKey="Count" fill="#378ADD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Avg upload speed per day (MB/s)">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={sDay} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip {...TT} />
                  <Line type="monotone" dataKey="Speed" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Avg upload time per day (min)">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={tDay} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip {...TT} />
                  <Line type="monotone" dataKey="Minutes" stroke="#9C27B0" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>
          </ChartGrid>

          {err.length > 0 && <>
            <SectionTitle>Error details</SectionTitle>
            <DataTable cols={['Serial', 'Date', 'File', 'Error']} rows={err.map(r => ({ 'Serial': r.serial, 'Date': r.date, 'File': r.filename, 'Error': r.error }))} />
          </>}

          <details style={{ marginTop: 12 }}>
            <summary style={{ fontSize: 13, cursor: 'pointer', color: '#5a6072', padding: '6px 0', fontWeight: 500 }}>
              All sessions ({cr.length.toLocaleString()})
            </summary>
            <div style={{ marginTop: 8 }}>
              <DataTable
                cols={['Serial', 'Date', 'File Size (MB)', 'Upload Rate (MB/s)', 'Time to Cloud (min)', 'Session #', 'Success']}
                rows={cr.map(r => ({
                  'Serial': r.serial, 'Date': r.date, 'File Size (MB)': r.file_size_mb.toFixed(1),
                  'Upload Rate (MB/s)': r.upload_rate_mbps.toFixed(2), 'Time to Cloud (min)': r.time_to_cloud_min.toFixed(1),
                  'Session #': r.session_index, 'Success': r.success,
                }))}
              />
            </div>
          </details>
        </>}
    </div>
  );
}
