import React, { useRef, useState } from 'react';

const s = {
  uploadBox: { border: '2px dashed #c8cdd4', borderRadius: 12, padding: '22px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' },
  uploadBoxDrag: { borderColor: '#1a56db', background: '#ebf0ff' },
  metric: { background: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: '14px 16px' },
  metricLabel: { fontSize: 11, color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 },
  metricValue: { fontSize: 21, fontWeight: 600 },
  metricDelta: { fontSize: 11, color: '#8a92a6', marginTop: 3 },
  chartBox: { background: '#fff', border: '1px solid #e2e6ea', borderRadius: 12, padding: 16 },
  chartTitle: { fontSize: 11, fontWeight: 600, color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 },
  tableWrap: { border: '1px solid #e2e6ea', borderRadius: 12, overflow: 'hidden', marginBottom: 14, overflowX: 'auto', background: '#fff' },
  th: { textAlign: 'left', padding: '8px 10px', background: '#f5f7fa', color: '#8a92a6', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #e2e6ea' },
  td: { padding: '7px 10px', borderBottom: '1px solid #e2e6ea', color: '#1a1d23' },
  info: { background: '#ebf0ff', color: '#1a56db', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14, border: '1px solid #c2d4f8' },
  warn: { background: '#fef3c7', color: '#b45309', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
  ok: { background: '#e6f7ef', color: '#0f9960', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
  sTitle: { fontSize: 12, fontWeight: 600, color: '#5a6072', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 10px' },
  chip: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, margin: 2, cursor: 'pointer', border: '1px solid #c8cdd4', color: '#5a6072', transition: 'all 0.1s' },
  chipSel: { background: '#1a56db', borderColor: '#1a56db', color: '#fff' },
  input: { height: 36, fontSize: 13, padding: '0 10px', borderRadius: 8, border: '1px solid #c8cdd4', background: '#fff', color: '#1a1d23', fontFamily: 'inherit', outline: 'none', flex: 1 },
  select: { height: 36, fontSize: 13, padding: '0 10px', borderRadius: 8, border: '1px solid #c8cdd4', background: '#fff', color: '#1a1d23', fontFamily: 'inherit', outline: 'none', flex: 2 },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
};

export function UploadBox({ label, sub, loaded, onFile }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const read = f => { const r = new FileReader(); r.onload = e => onFile(f.name, e.target.result); r.readAsText(f); };
  return (
    <div style={{ ...s.uploadBox, ...(drag ? s.uploadBoxDrag : {}) }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) read(f); }}
      onClick={() => ref.current.click()}>
      <input type="file" accept=".json" ref={ref} style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) read(f); }} />
      <div style={{ fontSize: 22, marginBottom: 6 }}>{loaded ? '✅' : '📂'}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
      {loaded
        ? <div style={{ fontSize: 12, color: '#0f9960', fontWeight: 600, marginTop: 4 }}>{loaded}</div>
        : <div style={{ fontSize: 12, color: '#8a92a6', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function MetricCard({ label, value, delta }) {
  return (
    <div style={s.metric}>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricValue}>{value}</div>
      {delta && <div style={s.metricDelta}>{delta}</div>}
    </div>
  );
}

export function DataTable({ cols, rows, max = 300 }) {
  return (
    <div style={s.tableWrap}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, max).map((r, i) => (
            <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
              {cols.map(c => (
                <td key={c} style={s.td}>
                  {c === 'Success'
                    ? <span style={{ ...s.badge, ...(r[c] ? { background: '#e6f7ef', color: '#0f9960' } : { background: '#fce8e6', color: '#d93025' }) }}>{r[c] ? 'Yes' : 'No'}</span>
                    : r[c] === null || r[c] === undefined ? '—' : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > max && <div style={{ padding: '6px 10px', fontSize: 11, color: '#8a92a6' }}>Showing {max} of {rows.length.toLocaleString()} rows</div>}
    </div>
  );
}

export function ChartBox({ title, children, style }) {
  return <div style={{ ...s.chartBox, ...style }}><div style={s.chartTitle}>{title}</div>{children}</div>;
}

export function InfoBox({ children }) { return <div style={s.info}>{children}</div>; }
export function WarnBox({ children }) { return <div style={s.warn}>{children}</div>; }
export function OkBox({ children }) { return <div style={s.ok}>{children}</div>; }
export function SectionTitle({ children }) { return <div style={s.sTitle}>{children}</div>; }
export function Divider() { return <hr style={{ border: 'none', borderTop: '1px solid #e2e6ea', margin: '16px 0' }} />; }

export function SearchRow({ children }) {
  return <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>{children}</div>;
}

export function SearchInput({ value, onChange, placeholder }) {
  return <input type="text" style={s.input} value={value} onChange={onChange} placeholder={placeholder} />;
}

export function SelectInput({ value, onChange, options }) {
  return (
    <select style={s.select} value={value} onChange={onChange}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Chip({ label, selected, onClick }) {
  return (
    <span style={{ ...s.chip, ...(selected ? s.chipSel : {}) }} onClick={onClick}>{label}</span>
  );
}

export function ChipsBox({ children }) {
  return <div style={{ border: '1px solid #e2e6ea', borderRadius: 8, padding: 8, maxHeight: 130, overflowY: 'auto', marginBottom: 10, background: '#fff' }}>{children}</div>;
}

export function MetricsGrid({ cols, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginBottom: 18 }}>{children}</div>;
}

export function ChartGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>{children}</div>;
}
