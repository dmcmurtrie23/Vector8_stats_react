import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { fmtD, REGION_COLORS, COLORS, TT } from '../utils';
import { SearchInput, SearchRow, ChipsBox, Chip, InfoBox, ChartBox, SectionTitle, DataTable, MetricCard, MetricsGrid } from './UI';

export default function CompareTab({ rows }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState([]);

  const all = useMemo(() => [...new Set(rows.map(r => r.customer_name))].sort(), [rows]);
  const flt = useMemo(() => q ? all.filter(c => c.toLowerCase().includes(q.toLowerCase())) : all, [all, q]);
  const tog = c => sel.includes(c) ? setSel(sel.filter(x => x !== c)) : sel.length < 15 && setSel([...sel, c]);

  const data = useMemo(() => sel.map(n => {
    const rs = rows.filter(r => r.customer_name === n);
    const u = rs.map(r => r.tag_updated_at).filter(Boolean).sort().reverse();
    return { Customer: n, Tags: rs.length, Region: rs[0]?.region || 'N/A', 'Last Update': u[0] ? fmtD(u[0]) : 'N/A' };
  }).sort((a, b) => b.Tags - a.Tags), [sel, rows]);

  return (
    <div>
      <SearchRow>
        <SearchInput value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..." />
      </SearchRow>
      <div style={{ fontSize: 11, color: '#8a92a6', marginBottom: 5 }}>{sel.length}/15 selected — click names to toggle</div>
      <ChipsBox>
        {flt.length
          ? flt.map(c => <Chip key={c} label={c} selected={sel.includes(c)} onClick={() => tog(c)} />)
          : <div style={{ fontSize: 12, color: '#8a92a6', padding: 6 }}>No matches</div>}
      </ChipsBox>

      {sel.length === 0
        ? <InfoBox>Select customers above to compare tag counts.</InfoBox>
        : <>
          <ChartBox title="Tag count by customer" style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 16, right: 8, bottom: 70, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="Customer" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip {...TT} />
                <Bar dataKey="Tags" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }}>
                  {data.map((d, i) => <Cell key={i} fill={REGION_COLORS[d.Region] || COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
          <SectionTitle>Summary</SectionTitle>
          <DataTable cols={['Customer', 'Tags', 'Region', 'Last Update']} rows={data} />
        </>}
    </div>
  );
}
