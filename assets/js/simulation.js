// simulation.js — Valthr fleet optimization engine
// Ported from AnimateDroneFleet.m (pure logic, no DOM)
// Exposed as window.SimEngine

window.SimEngine = (function () {

  // Haversine great-circle distance (km) — matches MATLAB exactly
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Build NxN adjacency matrix (Infinity = no direct edge)
  function buildAdjMatrix(stations, edges) {
    const N = stations.length;
    const adj = Array.from({ length: N }, () => new Array(N).fill(Infinity));
    for (let i = 0; i < N; i++) adj[i][i] = 0;
    for (const [a, b] of edges) {
      const d = haversine(stations[a].lat, stations[a].lon, stations[b].lat, stations[b].lon);
      adj[a][b] = d;
      adj[b][a] = d;
    }
    return adj;
  }

  // Floyd-Warshall all-pairs shortest path
  // Returns { dist[N][N], next[N][N] }
  function floydWarshall(adj, N) {
    const dist = adj.map(row => [...row]);
    const next = Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => (adj[i][j] < Infinity && i !== j ? j : -1))
    );
    for (let k = 0; k < N; k++) {
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
    return { dist, next };
  }

  // Reconstruct waypoint list from next[][] table
  function reconstructPath(next, src, dst) {
    if (next[src][dst] === -1) return [];
    const path = [src];
    let cur = src;
    while (cur !== dst) {
      cur = next[cur][dst];
      path.push(cur);
    }
    return path;
  }

  // Hermite smoothstep — matches MATLAB t^2*(3-2t)
  function smoothstep(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  // Pre-compute all animation frames
  // config: { stations, edges, defaultQueue, droneColors, numDrones, deliveries? }
  // deliveries: [[originIdx, destIdx, 'High'|'Low'], ...]
  // Returns frameData object
  function precomputeFrames(config) {
    const { stations, edges } = config;
    const deliveryQueue = config.deliveries || config.defaultQueue;
    const numDrones = config.numDrones || 3;
    const FRAMES_PER_EDGE = 30;
    const N = stations.length;

    const adj = buildAdjMatrix(stations, edges);
    const { dist, next } = floydWarshall(adj, N);

    // Compute average edge distance
    let edgeDistances = [];
    for (const [a, b] of edges) {
      edgeDistances.push(adj[a][b]);
    }
    const avgEdgeDist = edgeDistances.reduce((s, d) => s + d, 0) / edgeDistances.length;

    // Initialise drones — use custom home nodes if provided, otherwise distribute
    const drones = [];
    for (let i = 0; i < numDrones; i++) {
      const homeNode = (config.droneHomeNodes && config.droneHomeNodes[i] != null)
        ? config.droneHomeNodes[i] % N
        : i % N;
      drones.push({
        status: 'Idle',
        homeNode,
        route: [],
        routeStep: 0,
        edgeFrac: 0,
        posLat: stations[homeNode].lat,
        posLon: stations[homeNode].lon,
        deliveryIdx: -1
      });
    }

    // Build deliveries array
    const deliveries = deliveryQueue.map(([origin, dest, priority], idx) => ({
      idx,
      origin,
      dest,
      priority,
      droneId: -1,
      status: 'Pending'
    }));

    // Greedy assignment: assign all pending deliveries to nearest idle drone
    function assignPendingDeliveries() {
      for (const delivery of deliveries) {
        if (delivery.status !== 'Pending') continue;
        const idle = drones
          .map((d, i) => ({ i, d }))
          .filter(({ d }) => d.status === 'Idle' && d.deliveryIdx === -1);
        if (idle.length === 0) break;

        // cost = dist[drone.home → origin] + dist[origin → dest]
        let best = null, bestCost = Infinity;
        for (const { i, d } of idle) {
          const cost = dist[d.homeNode][delivery.origin] + dist[delivery.origin][delivery.dest];
          if (cost < bestCost) { bestCost = cost; best = i; }
        }
        if (best === null) continue;

        // Build composite route: home → origin → dest (deduplicated)
        const leg1 = reconstructPath(next, drones[best].homeNode, delivery.origin);
        const leg2 = reconstructPath(next, delivery.origin, delivery.dest);
        // Merge: avoid duplicate at junction
        const fullRoute = [...leg1, ...leg2.slice(1)];

        drones[best].route = fullRoute;
        drones[best].routeStep = 0;
        drones[best].edgeFrac = 0;
        drones[best].status = fullRoute.length > 1 ? 'Moving' : 'Idle';
        drones[best].deliveryIdx = delivery.idx;
        delivery.droneId = best;
        delivery.status = 'In Transit';
      }
    }

    assignPendingDeliveries();

    // Pre-compute frame history
    // histLat/histLon/histStatus: frames × drones
    // histDelivery: frames × deliveries (status strings)
    const MAX_FRAMES = 3000;
    const histLat = [];
    const histLon = [];
    const histStatus = [];
    const histDelivery = [];
    const histMetrics = [];

    let frameIdx = 0;

    function snapshot() {
      histLat.push(drones.map(d => d.posLat));
      histLon.push(drones.map(d => d.posLon));
      histStatus.push(drones.map(d => d.status));
      histDelivery.push(deliveries.map(d => d.status));
      const moving = drones.filter(d => d.status === 'Moving').length;
      const delivered = deliveries.filter(d => d.status === 'Delivered').length;
      histMetrics.push({ moving, delivered });
    }

    while (frameIdx < MAX_FRAMES) {
      // Check if all deliveries done
      const allDone = deliveries.every(d => d.status === 'Delivered');
      if (allDone) break;

      // Advance each drone one step
      for (let di = 0; di < numDrones; di++) {
        const drone = drones[di];
        if (drone.status === 'Idle') continue;

        const route = drone.route;
        const step = drone.routeStep;

        // Check if at final destination
        if (step >= route.length - 1) {
          drone.status = 'Idle';
          const delIdx = drone.deliveryIdx;
          if (delIdx >= 0 && deliveries[delIdx]) {
            deliveries[delIdx].status = 'Delivered';
          }
          drone.homeNode = route[route.length - 1];
          drone.deliveryIdx = -1;
          drone.route = [];
          drone.routeStep = 0;
          drone.edgeFrac = 0;
          continue;
        }

        const nodeA = route[step];
        const nodeB = route[step + 1];
        const edgeDist = adj[nodeA][nodeB];
        const edgeFrames = Math.max(5, Math.round(FRAMES_PER_EDGE * edgeDist / avgEdgeDist));
        const fracStep = 1 / edgeFrames;

        drone.edgeFrac += fracStep;

        if (drone.edgeFrac >= 1) {
          // Snap to next node
          drone.edgeFrac = 0;
          drone.routeStep += 1;
          drone.posLat = stations[nodeB].lat;
          drone.posLon = stations[nodeB].lon;
        } else {
          const t = smoothstep(drone.edgeFrac);
          drone.posLat = stations[nodeA].lat + t * (stations[nodeB].lat - stations[nodeA].lat);
          drone.posLon = stations[nodeA].lon + t * (stations[nodeB].lon - stations[nodeA].lon);
        }
      }

      snapshot();
      frameIdx++;

      // After any delivery is done, try to assign new ones
      assignPendingDeliveries();
    }

    // Pad one idle frame at end so last state is captured
    if (frameIdx < MAX_FRAMES) snapshot();

    return {
      histLat,
      histLon,
      histStatus,
      histDelivery,
      histMetrics,
      totalFrames: histLat.length,
      deliveries: deliveries.map(d => ({ ...d })),
      stations,
      adj,
      dist,
      next
    };
  }

  // Get interpolated state for a given frame index
  function getFrameState(frameData, f) {
    const fi = Math.max(0, Math.min(frameData.totalFrames - 1, Math.floor(f)));
    return {
      positions: frameData.histLat[fi].map((lat, i) => ({ lat, lon: frameData.histLon[fi][i] })),
      statuses: frameData.histStatus[fi],
      deliveryStatuses: frameData.histDelivery[fi],
      metrics: frameData.histMetrics[fi]
    };
  }

  // Generate a random delivery queue
  function randomQueue(n, numStations) {
    const queue = [];
    for (let i = 0; i < n; i++) {
      let origin, dest;
      do {
        origin = Math.floor(Math.random() * numStations);
        dest = Math.floor(Math.random() * numStations);
      } while (origin === dest);
      const priority = Math.random() > 0.5 ? 'High' : 'Low';
      queue.push([origin, dest, priority]);
    }
    return queue;
  }

  return { haversine, buildAdjMatrix, floydWarshall, reconstructPath, smoothstep, precomputeFrames, getFrameState, randomQueue };
})();
