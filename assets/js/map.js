// map.js — Valthr Leaflet map + simulation playback
// Called lazily via window.registerLazy('simulation', ...)
// Depends on: simulation.js (window.SimEngine), network.js (window.NETWORK)

window.ValthrMap = (function () {
  let map = null;
  let edgeLines = [];
  let nodeMarkers = [];
  let droneMarkers = [];
  let frameData = null;
  let frameIndex = 0;
  let isPlaying = false;
  let speedMultiplier = 0.35;
  let rafId = null;
  let pendingOrigin = null;
  let userQueue = [];
  let queueDirty = false;
  let dragSrcIndex = null;
  let droneHomeNodes = [0, 1, 2]; // custom initial positions (station indices)


  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  function init() {
    const placeholder = document.getElementById('sim-placeholder');
    const container = document.getElementById('sim-container');

    loadLeaflet(function () {
      if (placeholder) placeholder.style.display = 'none';
      if (container) container.style.display = 'flex';

      // Force a synchronous layout pass so #sim-layout / #map-wrapper have real
      // dimensions before Leaflet measures the container (otherwise it inits 0×0).
      if (container) void container.offsetHeight;
      const mapEl = document.getElementById('leaflet-map');
      if (mapEl) void mapEl.offsetHeight;

      requestAnimationFrame(function () {
        map = L.map('leaflet-map', {
          center: [26.113, 50.610],
          zoom: 15,
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true
        });

        // Fit all stations with extra right padding so the floating card
        // doesn't overlap the node-edge graph.
        const stationLatLngs = window.NETWORK.stations.map(s => [s.lat, s.lon]);
        const bounds = L.latLngBounds(stationLatLngs);
        map.fitBounds(bounds, {
          paddingTopLeft:     [30, 30],
          paddingBottomRight: [320, 40],
          animate: false
        });

        const esriLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
            maxZoom: 19
          }
        );

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        });

        esriLayer.addTo(map);
        esriLayer.on('tileerror', function () {
          map.removeLayer(esriLayer);
          osmLayer.addTo(map);
        });

        drawNetwork();
        addBapcoLabel();

        map.invalidateSize();
        setTimeout(function () { map.invalidateSize(); }, 0);

        // Initialise drone home nodes to default positions
        droneHomeNodes = window.NETWORK.stations
          .slice(0, window.NETWORK.numDrones)
          .map((_, i) => i);

        // Populate station dropdowns
        populateStationDropdowns();

        userQueue = window.NETWORK.defaultQueue.slice();
        buildFrameData(userQueue);
        showQueuePreview();
        wireControls();
      });
    });
  }

  function populateStationDropdowns() {
    const stations = window.NETWORK.stations;
    const fromSel = document.getElementById('sim-from-select');
    const toSel   = document.getElementById('sim-to-select');
    if (!fromSel || !toSel) return;

    stations.forEach((s, i) => {
      const o1 = document.createElement('option');
      o1.value = i;
      o1.textContent = `${s.abbr} — ${s.name}`;
      fromSel.appendChild(o1);

      const o2 = document.createElement('option');
      o2.value = i;
      o2.textContent = `${s.abbr} — ${s.name}`;
      toSel.appendChild(o2);
    });
  }

  function drawNetwork() {
    const { stations, edges } = window.NETWORK;

    edgeLines = edges.map(([a, b]) => {
      return L.polyline(
        [[stations[a].lat, stations[a].lon], [stations[b].lat, stations[b].lon]],
        { color: 'rgba(255,255,255,0.75)', weight: 2, opacity: 1 }
      ).addTo(map);
    });

    nodeMarkers = stations.map((s, i) => {
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 9,
        fillColor: '#d97706',
        color: '#fff',
        weight: 2.5,
        fillOpacity: 1
      }).addTo(map);

      marker.bindTooltip(
        `<span style="font-family:monospace;font-size:11px;line-height:1.4;font-weight:600">${s.abbr}<br><small style="color:#9ca3af;font-weight:400">${s.name}</small></span>`,
        { permanent: true, direction: 'top', className: 'station-label', offset: [0, -4] }
      );

      return marker;
    });
  }

  function updateHint(text) {
    const hint = document.getElementById('sim-hint-text');
    if (hint) hint.textContent = text;
  }

  // ── Editable queue (preview / edit mode) ──────────────────────────────────
  function showQueuePreview() {
    const list = document.getElementById('queue-list');
    if (!list) return;

    // Update count badge
    const badge = document.getElementById('queue-count');
    if (badge) {
      if (userQueue.length > 0) {
        badge.textContent = userQueue.length;
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    }

    if (userQueue.length === 0) {
      list.innerHTML = '<li class="queue-empty">No deliveries queued — use the form above</li>';
      return;
    }

    list.innerHTML = '';
    userQueue.forEach(([origin, dest, priority], i) => {
      const st = window.NETWORK.stations;
      const origAbbr = st[origin] ? st[origin].abbr : '?';
      const destAbbr  = st[dest]   ? st[dest].abbr   : '?';

      const li = document.createElement('li');
      li.className = 'queue-item queue-item-editable';
      li.draggable = true;
      li.dataset.index = i;
      li.id = `queue-edit-${i}`;

      li.innerHTML = `
        <span class="queue-drag-handle" aria-hidden="true" title="Drag to reorder">⠿</span>
        <button class="queue-priority ${priority === 'High' ? 'priority-high' : 'priority-low'} queue-priority-btn"
                data-index="${i}" title="Toggle priority">${priority === 'High' ? 'H' : 'L'}</button>
        <span class="queue-route">${origAbbr} → ${destAbbr}</span>
        <button class="queue-remove-btn" data-index="${i}" aria-label="Remove delivery" title="Remove">×</button>
      `;

      list.appendChild(li);
    });

    _wireQueueDrag(list);

    list.querySelectorAll('.queue-priority-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        userQueue[idx][2] = userQueue[idx][2] === 'High' ? 'Low' : 'High';
        queueDirty = true;
        showQueuePreview();
      });
    });

    list.querySelectorAll('.queue-remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        userQueue.splice(idx, 1);
        queueDirty = true;
        showQueuePreview();
        setRunButton('run');
        if (userQueue.length === 0) updateHint('Queue cleared. Use the form above to add a delivery.');
      });
    });
  }

  function _wireQueueDrag(list) {
    const items = list.querySelectorAll('.queue-item-editable');
    items.forEach(item => {
      item.addEventListener('dragstart', e => {
        dragSrcIndex = parseInt(item.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        item.classList.add('drag-over');
      });
      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
      item.addEventListener('drop', e => {
        e.preventDefault();
        const targetIdx = parseInt(item.dataset.index);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIdx) {
          const [moved] = userQueue.splice(dragSrcIndex, 1);
          userQueue.splice(targetIdx, 0, moved);
          queueDirty = true;
          showQueuePreview();
        }
        dragSrcIndex = null;
      });
    });
  }

  // ── Read-only queue (during / after playback) ─────────────────────────────
  function updateQueuePanel(deliveries) {
    const list = document.getElementById('queue-list');
    if (!list || !deliveries) return;
    if (deliveries.length === 0) {
      list.innerHTML = '<li class="queue-empty">No deliveries queued</li>';
      return;
    }
    list.innerHTML = deliveries.map((d, i) => {
      const st = window.NETWORK.stations;
      const origin = st[d.origin] ? st[d.origin].abbr : '?';
      const dest   = st[d.dest]   ? st[d.dest].abbr   : '?';
      return `<li class="queue-item" id="queue-item-${i}" data-status="${d.status}">
        <span class="queue-priority ${d.priority === 'High' ? 'priority-high' : 'priority-low'}">${d.priority === 'High' ? 'H' : 'L'}</span>
        <span class="queue-route">${origin} → ${dest}</span>
        <span class="queue-status">${statusIcon(d.status)} ${d.status}</span>
      </li>`;
    }).join('');
  }

  function updateQueueStatuses(statuses) {
    if (!statuses) return;
    statuses.forEach((s, i) => {
      const item = document.getElementById(`queue-item-${i}`);
      if (item) {
        item.dataset.status = s;
        const statusEl = item.querySelector('.queue-status');
        if (statusEl) statusEl.innerHTML = `${statusIcon(s)} ${s}`;
      }
    });
  }

  function statusIcon(s) {
    if (s === 'Delivered')  return '<span class="status-icon delivered">✓</span>';
    if (s === 'In Transit') return '<span class="status-icon transit">▶</span>';
    return '<span class="status-icon pending">●</span>';
  }

  // ── Frame data ─────────────────────────────────────────────────────────────
  function buildFrameData(queue) {
    const q = (queue && queue.length > 0) ? queue : window.NETWORK.defaultQueue.slice();
    stopPlayback();
    frameIndex = 0;

    frameData = SimEngine.precomputeFrames({
      stations: window.NETWORK.stations,
      edges: window.NETWORK.edges,
      defaultQueue: q,
      deliveries: q,
      numDrones: window.NETWORK.numDrones,
      droneHomeNodes: droneHomeNodes.slice()
    });

    queueDirty = false;
    renderFrame(0);
    updateFleetStatus(frameData.histStatus[0]);
    createDroneMarkers();

    // Show playback slider and set range
    const slider = document.getElementById('sim-playback-slider');
    const playbackPanel = document.getElementById('sim-playback');
    if (slider && playbackPanel) {
      slider.max = frameData.totalFrames - 1;
      slider.value = 0;
      playbackPanel.style.display = 'block';
      updatePlaybackLabel(0);
    }
  }

  function createDroneMarkers() {
    droneMarkers.forEach(m => map.removeLayer(m));
    droneMarkers = [];

    const colors = window.NETWORK.droneColors;

    for (let i = 0; i < window.NETWORK.numDrones; i++) {
      const color = colors[i % colors.length];
      // Quadcopter icon with white disc background for high visibility
      const icon = L.divIcon({
        className: '',
        html: `<div class="drone-marker drone-idle" id="drone-marker-${i}" style="--drone-color:${color}">
          <svg viewBox="0 0 38 38" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- White disc background for contrast on satellite map -->
            <circle cx="19" cy="19" r="17" fill="rgba(255,255,255,0.92)" />
            <!-- Arms -->
            <line x1="13" y1="13" x2="7" y2="7" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="25" y1="13" x2="31" y2="7" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="13" y1="25" x2="7" y2="31" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="25" y1="25" x2="31" y2="31" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
            <!-- Body -->
            <rect x="12" y="12" width="14" height="14" rx="2.5" fill="${color}"/>
            <!-- Rotors -->
            <circle cx="6" cy="6" r="5" stroke="${color}" stroke-width="2" fill="rgba(255,255,255,0.5)"/>
            <circle cx="32" cy="6" r="5" stroke="${color}" stroke-width="2" fill="rgba(255,255,255,0.5)"/>
            <circle cx="6" cy="32" r="5" stroke="${color}" stroke-width="2" fill="rgba(255,255,255,0.5)"/>
            <circle cx="32" cy="32" r="5" stroke="${color}" stroke-width="2" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const pos = frameData && frameData.histLat[0]
        ? [frameData.histLat[0][i], frameData.histLon[0][i]]
        : [window.NETWORK.stations[i % window.NETWORK.stations.length].lat,
           window.NETWORK.stations[i % window.NETWORK.stations.length].lon];

      const m = L.marker(pos, { icon, zIndexOffset: 1000, draggable: true }).addTo(map);

      // Drag-to-reposition: snap to nearest station on dragend
      (function(markerRef, droneIdx) {
        markerRef.on('dragend', function() {
          if (isPlaying) { markerRef.setLatLng(markerRef.getLatLng()); return; }
          const latlng = markerRef.getLatLng();
          const nearest = findNearestStation(latlng.lat, latlng.lng);
          markerRef.setLatLng([nearest.lat, nearest.lon]);
          droneHomeNodes[droneIdx] = nearest.id;
          queueDirty = true;
          setRunButton('run');
          showQueuePreview();
          showToast(`Drone ${droneIdx + 1} repositioned to ${nearest.abbr}`);
        });
      })(m, i);

      droneMarkers.push(m);
    }
  }

  function findNearestStation(lat, lon) {
    const stations = window.NETWORK.stations;
    let nearest = stations[0], nearestDist = Infinity;
    stations.forEach(s => {
      const d = SimEngine.haversine(lat, lon, s.lat, s.lon);
      if (d < nearestDist) { nearestDist = d; nearest = s; }
    });
    return nearest;
  }

  function addBapcoLabel() {
    const label = L.control({ position: 'bottomleft' });
    label.onAdd = function () {
      const div = L.DomUtil.create('div', 'bapco-map-label');
      div.innerHTML = `
        <span class="bapco-label-title">
          <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="flex-shrink:0;margin-top:1px">
            <path d="M6.5 0C3.46 0 1 2.46 1 5.5c0 4.14 5.5 10.5 5.5 10.5S12 9.64 12 5.5C12 2.46 9.54 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="rgba(255,255,255,0.9)"/>
          </svg>
          Bapco Refinery
        </span>
        <span>Bahrain &nbsp;&middot;&nbsp; 26.11&deg;N 50.61&deg;E</span>`;
      return div;
    };
    label.addTo(map);
  }

  function setRunButton(state) {
    const btn = document.getElementById('sim-run');
    if (!btn) return;
    if (state === 'run') {
      btn.innerHTML = 'Run <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true" style="margin-left:4px"><path d="M2 1.5l7 4-7 4z"/></svg>';
    }
    if (state === 'replay') {
      btn.innerHTML = 'Replay <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" style="margin-left:4px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.32"/></svg>';
    }
  }

  // ── Playback ───────────────────────────────────────────────────────────────
  function startPlayback() {
    if (!frameData) return;
    isPlaying = true;
    setDraggingEnabled(false);
    loop();
  }

  function stopPlayback() {
    isPlaying = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    setDraggingEnabled(true);
  }

  function loop() {
    if (!isPlaying || !frameData) return;
    frameIndex += speedMultiplier;
    if (frameIndex >= frameData.totalFrames) {
      frameIndex = frameData.totalFrames - 1;
      renderFrame(Math.floor(frameIndex));
      syncPlaybackSlider(Math.floor(frameIndex));
      stopPlayback();
      setRunButton('replay');
      updateHint('Simulation complete — press Replay to run again or modify the queue');
      return;
    }
    renderFrame(Math.floor(frameIndex));
    syncPlaybackSlider(Math.floor(frameIndex));
    rafId = requestAnimationFrame(loop);
  }

  function syncPlaybackSlider(fi) {
    const slider = document.getElementById('sim-playback-slider');
    if (slider) slider.value = fi;
    updatePlaybackLabel(fi);
  }

  function updatePlaybackLabel(fi) {
    const lbl = document.getElementById('sim-playback-label');
    if (lbl && frameData) lbl.textContent = `${fi} / ${frameData.totalFrames - 1}`;
  }

  function renderFrame(fi) {
    if (!frameData) return;
    const state = SimEngine.getFrameState(frameData, fi);

    for (let i = 0; i < droneMarkers.length; i++) {
      const pos = state.positions[i];
      droneMarkers[i].setLatLng([pos.lat, pos.lon]);
      const el = document.getElementById(`drone-marker-${i}`);
      if (el) {
        el.className = 'drone-marker ' + (state.statuses[i] === 'Moving' ? 'drone-moving' : 'drone-idle');
      }
    }

    updateQueueStatuses(state.deliveryStatuses);
    updateMetricsPanel(state);
    updateFleetStatus(state.statuses);
  }

  function updateMetricsPanel(state) {
    const delivered = state.metrics ? state.metrics.delivered : 0;
    const total = frameData ? frameData.deliveries.length : 0;
    const moving = state.metrics ? state.metrics.moving : 0;
    const numDrones = window.NETWORK.numDrones;
    const util = numDrones > 0 ? Math.round((moving / numDrones) * 100) : 0;

    const el = (id) => document.getElementById(id);
    if (el('metric-delivered')) el('metric-delivered').textContent = `${delivered}/${total}`;
    if (el('metric-util'))      el('metric-util').textContent      = `${util}%`;

    const elapsed = Math.floor(frameIndex) / 30;
    if (el('metric-time')) {
      el('metric-time').textContent = delivered > 0
        ? `${(elapsed / delivered).toFixed(1)}s`
        : '—';
    }
  }

  function updateFleetStatus(statuses) {
    const panel = document.getElementById('fleet-status-list');
    if (!panel) return;
    const colors = window.NETWORK.droneColors;
    panel.innerHTML = statuses.map((s, i) =>
      `<div class="fleet-drone-item">
        <span class="fleet-drone-dot" style="background:${colors[i % colors.length]}"></span>
        <span class="fleet-drone-label">Drone ${i + 1}</span>
        <span class="fleet-drone-status ${s === 'Moving' ? 'status-moving' : 'status-idle'}">${s}</span>
      </div>`
    ).join('');
  }

  function showToast(msg) {
    const toast = document.getElementById('sim-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  function setDraggingEnabled(enabled) {
    droneMarkers.forEach(m => {
      if (m.dragging) {
        if (enabled) m.dragging.enable(); else m.dragging.disable();
      }
    });
  }

  // ── Controls ───────────────────────────────────────────────────────────────
  function wireControls() {
    const runBtn   = document.getElementById('sim-run');
    const randBtn  = document.getElementById('sim-randomize');
    const clearBtn = document.getElementById('sim-clear-queue');
    const addBtn   = document.getElementById('sim-add-delivery');
    const slider   = document.getElementById('sim-playback-slider');

    // ── Add Delivery ──
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (isPlaying) return;
        const fromSel = document.getElementById('sim-from-select');
        const toSel   = document.getElementById('sim-to-select');
        const pSwitch = document.getElementById('sim-priority-switch');
        if (!fromSel || !toSel) return;

        const fromVal = parseInt(fromSel.value);
        const toVal   = parseInt(toSel.value);
        if (isNaN(fromVal) || isNaN(toVal)) {
          updateHint('Please select both a dispatch point and a destination');
          return;
        }
        if (fromVal === toVal) {
          updateHint('Dispatch and destination must be different stations');
          return;
        }
        const priority = (pSwitch && pSwitch.checked) ? 'High' : 'Low';
        userQueue.push([fromVal, toVal, priority]);
        queueDirty = true;
        showQueuePreview();
        setRunButton('run');
        const st = window.NETWORK.stations;
        showToast(`Queued: ${st[fromVal].abbr} → ${st[toVal].abbr} (${priority})`);
        updateHint('Delivery added — add more or press Run to execute');
        // Reset node highlights
        nodeMarkers.forEach(m => m.setStyle({ fillColor: '#d97706', color: '#fff', weight: 2.5 }));
      });
    }

    // ── Playback slider ──
    if (slider) {
      slider.addEventListener('input', function() {
        if (isPlaying) stopPlayback();
        frameIndex = parseInt(slider.value);
        if (frameData) renderFrame(Math.floor(frameIndex));
        updatePlaybackLabel(Math.floor(frameIndex));
      });
    }

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        if (isPlaying) return;
        if (queueDirty || !frameData) {
          buildFrameData(userQueue.length > 0 ? userQueue : window.NETWORK.defaultQueue.slice());
        } else {
          frameIndex = 0;
          renderFrame(0);
          syncPlaybackSlider(0);
        }
        updateQueuePanel(frameData.deliveries);
        setDraggingEnabled(false);
        startPlayback();
        updateHint('Simulation running — drones are en route');
      });
    }

    if (randBtn) {
      randBtn.addEventListener('click', () => {
        stopPlayback();
        userQueue = SimEngine.randomQueue(5, window.NETWORK.stations.length);
        queueDirty = true;
        showQueuePreview();
        setRunButton('run');
        showToast('5 deliveries randomized — press Run to execute');
        updateHint('Queue ready — press Run to watch the fleet operate');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        stopPlayback();
        userQueue = [];
        queueDirty = true;
        showQueuePreview();
        setRunButton('run');
        updateHint('Queue cleared — use the form above to add deliveries');
      });
    }
  }

  return { init };
})();

// Register lazy init
document.addEventListener('DOMContentLoaded', function () {
  if (window.registerLazy) {
    window.registerLazy('simulation', () => window.ValthrMap.init());
  }
});
