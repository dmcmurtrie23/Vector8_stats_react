export function sint(v) {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : Math.floor(n);
}

export function fmtD(ts) {
  if (!ts) return 'N/A';
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 'N/A' : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

export function ago(iso) {
  if (!iso || iso === 'N/A') return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

export function fmtMS(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export function avg(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

export function med(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function grp(a, k) {
  return a.reduce((acc, r) => {
    (acc[r[k]] = acc[r[k]] || []).push(r);
    return acc;
  }, {});
}

export function parseTags(raw) {
  const d = JSON.parse(raw);
  const rows = [];
  for (const acc of d.accounts || []) {
    const name = acc.customer_name || (acc.customer_id ? `(No Name) ID:${acc.customer_id}` : 'Unknown');
    for (const tag of acc.tags || []) {
      const tel = tag.latest_telemetry || {};
      rows.push({
        customer_name: name, customer_id: acc.customer_id, region: acc.region || 'Unknown',
        serial: tag.serial, model: tag.model, generation: tag.generation,
        tag_created_at: tag.created_at, tag_updated_at: tag.updated_at,
        fw_version: tel.fw_version, telemetry_updated_at: tel.updated_at,
      });
    }
  }
  return { generatedAt: d.generated_at || 'N/A', accounts: d.accounts || [], rows };
}

export function parseUploads(raw) {
  const d = JSON.parse(raw);
  const rows = (d.data || []).map(r => ({
    customer_id: String(r.customer_id || ''),
    customer_name: (r.customer_name || '').trim(),
    region: r.region || 'Unknown',
    serial: r.serial,
    filename: r.filename || '',
    file_size_mb: sint(r.file_size) / (1024 * 1024),
    upload_rate_mbps: sint(r.upload_rate) / (1024 * 1024),
    time_to_cloud_ms: sint(r.time_to_cloud),
    time_to_cloud_min: sint(r.time_to_cloud) / 1000 / 60,
    session_index: r.session_index,
    error: r.upload_error_message || '',
    success: !r.upload_error_message,
    date: fmtMS(sint(r.created_at)),
  }));
  rows.forEach(r => {
    if (!r.customer_name) r.customer_name = r.customer_id ? `ID:${r.customer_id}` : 'Unknown';
  });
  return rows;
}

export const REGION_COLORS = { AU: '#1D9E75', EU: '#378ADD', US_2: '#D85A30', Unknown: '#888780' };
export const COLORS = ['#1D9E75', '#378ADD', '#D85A30', '#7F77DD', '#BA7517', '#D4537E'];
export const TT = { contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e6ea' } };
