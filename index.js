let allPresets = {};
  let allFields = {};
  let filtered = [];

  async function loadData() {
    document.getElementById("detail").innerHTML = "Loading presets...";
    const [presetsRes, fieldsRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/presets.json'),
      fetch('https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/fields.json')
    ]);
    allPresets = await presetsRes.json();
    allFields = await fieldsRes.json();
    filtered = Object.keys(allPresets);
    renderList();
  }

  // Render the left panel list
  function renderList() {
    const list = document.getElementById('list');
    document.getElementById('count').textContent = `${filtered.length} presets`;
    list.innerHTML = filtered.map(key => {
      const p = allPresets[key];
      const initials = p.name ? p.name.slice(0, 2).toUpperCase() : '??';
      return `
        <div class="preset-item" onclick="showDetail('${key}')" id="item-${key.replace(/\//g, '-')}">
          <div class="preset-icon">${initials}</div>
          <div>
            <div class="preset-name">${p.name || key}</div>
            <div class="preset-key">${key}</div>
          </div>
        </div>`;
    }).join('');
  }

  // Filter presets by search query
  function filterPresets() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    filtered = Object.keys(allPresets).filter(key => {
      const p = allPresets[key];
      return key.toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q);
    });
    renderList();
  }


  function showDetail(key) {
    // Highlight active item
    document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
    const itemEl = document.getElementById('item-' + key.replace(/\//g, '-'));
    if (itemEl) itemEl.classList.add('active');

    const p = allPresets[key];
    const detail = document.getElementById('detail');

    // Tags
    const tagsHtml = p.tags
      ? Object.entries(p.tags).map(([k, v]) =>
          `<span class="badge">${k}=${v}</span>`).join(' ')
      : '<span style="color:#aaa">none</span>';

    // Geometry 
    const geomHtml = (p.geometry || [])
      .map(g => `<span class="geom-badge">${g}</span>`).join(' ');

    // Fields
    const fieldsHtml = (p.fields || []).map(fid => {
      const f = allFields[fid];
      return `<div class="field-item">
        <span>${f ? (f.label || fid) : fid}</span>
        ${f ? `<span class="field-type">${f.type || ''}</span>` : ''}
      </div>`;
    }).join('');

    const extendsHtml = p.extends
      ? `<div class="extends-box" onclick="showDetail('${p.extends}')">
           Extends: ${p.extends} →
         </div>`
      : '<span style="color:#aaa;font-size:13px">None</span>';

    // Location 
    const locationHtml = p.locationSet
      ? `<span class="badge orange">${JSON.stringify(p.locationSet)}</span>`
      : '<span style="color:#aaa;font-size:13px">Global</span>';

    detail.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${p.name || key}</div>
        <div class="detail-id">${key}</div>
      </div>

      <div class="section">
        <div class="section-title">OSM Tags</div>
        <div class="tag-row">${tagsHtml}</div>
      </div>

      <div class="section">
        <div class="section-title">Geometry</div>
        <div class="tag-row">${geomHtml}</div>
      </div>

      <div class="section">
        <div class="section-title">Inherits from</div>
        ${extendsHtml}
      </div>

      <div class="section">
        <div class="section-title">Fields (${(p.fields || []).length})</div>
        ${fieldsHtml || '<span style="color:#aaa;font-size:13px">No fields</span>'}
      </div>

      <div class="section">
        <div class="section-title">Regional availability</div>
        ${locationHtml}
      </div>`;
  }

  loadData();