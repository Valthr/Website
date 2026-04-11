// Valthr — Network graph data
// Ported from AnimateDroneFleet.m — BAPCO industrial complex, Bahrain
window.NETWORK = {
  stations: [
    { id: 0, abbr: 'MainBldg',   name: 'Main Building / Cafeteria',      lat: 26.1190750, lon: 50.6015028 },
    { id: 1, abbr: 'NW-Ref',     name: 'North-West Refinery',            lat: 26.1137444, lon: 50.6025500 },
    { id: 2, abbr: 'NE-Ref',     name: 'North-East Refinery',            lat: 26.1159500, lon: 50.6066194 },
    { id: 3, abbr: 'WaterTrt',   name: 'BAPCO Water Treatment Plant',    lat: 26.1178250, lon: 50.6115306 },
    { id: 4, abbr: 'FCC',        name: 'Fluid Catalytic Cracking Unit',  lat: 26.1127639, lon: 50.6067500 },
    { id: 5, abbr: 'ModProg',    name: 'Modernisation Programme Bldg',   lat: 26.1062722, lon: 50.6052472 },
    { id: 6, abbr: 'CentralRef', name: 'Central Refinery',               lat: 26.1098444, lon: 50.6104944 },
    { id: 7, abbr: 'FabShop',    name: 'Fabrication Workshop',           lat: 26.1142889, lon: 50.6217611 },
    { id: 8, abbr: 'S-Ref',      name: 'South Refinery',                 lat: 26.1049611, lon: 50.6120167 }
  ],
  // edges: 0-indexed [a, b] pairs — bidirectional
  edges: [
    [0,1],[0,2],[0,3],[1,2],[1,4],[2,3],[2,4],
    [3,6],[3,7],[4,5],[4,6],[5,6],[5,8],[6,7],[6,8],
    [1,5],[7,8]
  ],
  // defaultQueue: [originIdx, destIdx, 'High'|'Low']
  defaultQueue: [
    [7, 0, 'High'],
    [5, 3, 'Low'],
    [8, 2, 'High'],
    [1, 8, 'Low'],
    [0, 6, 'High']
  ],
  droneColors: ['#e0521a', '#2b8fd4', '#6ab330'],
  numDrones: 3
};
