import React, { useState, useCallback } from 'react';
import { parseTags, parseUploads } from './utils';
import { UploadBox } from './components/UI';
import CompareTab from './components/CompareTab';
import DetailTab from './components/DetailTab';
import ActivityTab from './components/ActivityTab';
import TrendsTab from './components/TrendsTab';

const TABS = [
  { key: 'compare', label: '📊 Compare tags', needs: 'tags' },
  { key: 'detail', label: '🔍 Customer detail', needs: 'tags' },
  { key: 'activity', label: '📤 Upload activity', needs: 'uploads' },
  { key: 'trends', label: '📈 Upload trends', needs: 'uploads' },
];

export default function App() {
  const [tagsName, setTagsName] = useState('');
  const [uploadsName, setUploadsName] = useState('');
  const [tagData, setTagData] = useState(null);
  const [uploadRows, setUploadRows] = useState(null);
  const [activeTab, setActiveTab] = useState('compare');

  const onTags = useCallback((name, text) => {
    try { setTagData(parseTags(text)); setTagsName(name); setActiveTab('compare'); }
    catch (e) { alert('Tags file error: ' + e.message); }
  }, []);

  const onUploads = useCallback((name, text) => {
    try { setUploadRows(parseUploads(text)); setUploadsName(name); setActiveTab(tagData ? activeTab : 'activity'); }
    catch (e) { alert('Uploads file error: ' + e.message); }
  }, [tagData, activeTab]);

  const visibleTabs = TABS.filter(t => t.needs === 'tags' ? !!tagData : !!uploadRows);
  const tagRows = tagData?.rows || [];
  const dates = uploadRows ? [...new Set(uploadRows.map(r => r.date))].filter(Boolean).sort() : [];
  const safeTab = visibleTabs.find(t => t.key === activeTab) ? activeTab : visibleTabs[0]?.key;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #e2e6ea' }}>
        <div style={{ fontSize: 20 }}>📡</div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Vector8 Tags Reporter</div>
        {(tagData || uploadRows) && (
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#8a92a6', textAlign: 'right', lineHeight: 1.8 }}>
            {tagData && <div>Tags: {tagData.generatedAt} · {tagData.accounts.length} accounts · {tagRows.length} tags</div>}
            {uploadRows && <div>Uploads: {dates[0] || '?'} → {dates[dates.length - 1] || '?'} · {uploadRows.length.toLocaleString()} sessions</div>}
          </div>
        )}
      </div>

      {/* File uploaders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <UploadBox label="Tags JSON" sub="Daily snapshot — drag or click" loaded={tagsName} onFile={onTags} />
        <UploadBox label="Uploads JSON" sub="Weekly activity — drag or click" loaded={uploadsName} onFile={onUploads} />
      </div>

      {/* Content */}
      {visibleTabs.length === 0
        ? <div style={{ background: '#ebf0ff', color: '#1a56db', borderRadius: 8, padding: '10px 14px', fontSize: 13, border: '1px solid #c2d4f8' }}>
            Upload one or both JSON files above to get started.
          </div>
        : <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, background: '#fff', borderRadius: 12, padding: 4, marginBottom: 18, border: '1px solid #e2e6ea', width: 'fit-content' }}>
            {visibleTabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '7px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 8, border: 'none',
                background: safeTab === t.key ? '#1a56db' : 'transparent',
                color: safeTab === t.key ? '#fff' : '#5a6072',
                fontFamily: 'inherit', transition: 'all 0.12s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {safeTab === 'compare' && tagData && <CompareTab rows={tagRows} />}
          {safeTab === 'detail' && tagData && <DetailTab rows={tagRows} />}
          {safeTab === 'activity' && uploadRows && <ActivityTab rows={uploadRows} />}
          {safeTab === 'trends' && uploadRows && <TrendsTab rows={uploadRows} />}
        </>}
    </div>
  );
}
