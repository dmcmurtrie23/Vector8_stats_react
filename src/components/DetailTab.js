import React, { useState, useMemo } from 'react';
import { fmtD, ago } from '../utils';
import { SearchRow, SearchInput, SelectInput, MetricsGrid, MetricCard, Divider, SectionTitle, DataTable, WarnBox, OkBox, InfoBox } from './UI';

export default function DetailTab({ rows }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');
  const [days, setDays] = useState(7);

  const all = useMemo(() => [...new Set(rows.map(r => r.customer_name))].sort(), [rows]);
  const flt = useMemo(() => q ? all.filter(c => c.toLowerCase().includes(q.toLowerCase())) : all, [all, q]);
  const cust = sel || flt[0] || '';
  const cr = useMemo(() => rows.filter(r => r.customer_name === cust), [rows, cust]);
  const now = Date.now();
  const u = cr.map(r => r.tag_updated_at).filter(Boolean).sort().reverse();
  const t = cr.map(r => r.telemetry_updated_at).filter(Boolean).sort().reverse();
  const stale = cr.filter(r => !r.telemetry_updated_at || (now - new Date(r.telemetry_updated_at).getTime()) / 86400000 > days);

  return (
    <div>
      <SearchRow>
        <SearchInput value={q} onChange={e => { setQ(e.target.value); setSel(''); }} placeholder="Search customers..." />
        <SelectInput value={cust} onChange={e => setSel(e.target.value)} options={flt} />
      </SearchRow>

      {cr.length === 0
        ? <InfoBox>No data for this customer.</InfoBox>
        : <>
          <MetricsGrid cols={4}>
            <MetricCard label="Total tags" value={cr.length} />
            <MetricCard label="Region" value={cr[0]?.region || 'N/A'} />
            <MetricCard label="Last tag update" value={u[0] ? fmtD(u[0]) : 'N/A'} delta={ago(u[0])} />
            <MetricCard label="Last telemetry" value={t[0] ? fmtD(t[0]) : 'N/A'} delta={ago(t[0])} />
          </MetricsGrid>

          <Divider />
          <SectionTitle>Tag details</SectionTitle>
          <DataTable
            cols={['Serial', 'Model', 'Generation', 'FW Version', 'Tag Updated', 'Telemetry Updated', 'Created']}
            rows={cr.map(r => ({
              'Serial': r.serial, 'Model': r.model, 'Generation': r.generation, 'FW Version': r.fw_version,
              'Tag Updated': fmtD(r.tag_updated_at), 'Telemetry Updated': fmtD(r.telemetry_updated_at), 'Created': fmtD(r.tag_created_at),
            }))}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#5a6072', whiteSpace: 'nowrap' }}>Flag stale telemetry older than</label>
            <input type="range" min={1} max={60} value={days} onChange={e => setDays(+e.target.value)} style={{ flex: 1, accentColor: '#1a56db' }} />
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: 50 }}>{days} days</span>
          </div>

          {stale.length > 0
            ? <>
              <WarnBox>⚠️ {stale.length} tag(s) have not sent telemetry in over {days} days.</WarnBox>
              <DataTable
                cols={['Serial', 'Model', 'Telemetry Updated']}
                rows={stale.map(r => ({ 'Serial': r.serial, 'Model': r.model, 'Telemetry Updated': fmtD(r.telemetry_updated_at) || 'Never' }))}
              />
            </>
            : <OkBox>✅ All tags reported telemetry within the last {days} days.</OkBox>}
        </>}
    </div>
  );
}
