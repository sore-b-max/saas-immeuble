const fs = require('fs');
const path = require('path');

const animDir = path.join(__dirname, 'public', 'assets', 'animations');
if (!fs.existsSync(animDir)) {
  fs.mkdirSync(animDir, { recursive: true });
}

// 1. HERO BUILDING ANIMATION (Modern Real Estate SaaS Hero)
const heroBuilding = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 180,
  w: 600,
  h: 600,
  nm: "SaaS Real Estate Hero",
  ddd: 0,
  assets: [],
  layers: [
    // Outer glowing ring pulse
    {
      ddd: 0, ind: 1, ty: 4, nm: "Glowing Pulse",
      sr: 1, ks: {
        o: { k: [{ t: 0, s: [40], h: 1 }, { t: 90, s: [100], h: 1 }, { t: 180, s: [40] }] },
        r: { k: [{ t: 0, s: [0] }, { t: 180, s: [360] }] },
        p: { k: [300, 300, 0] },
        a: { k: [0, 0, 0] },
        s: { k: [{ t: 0, s: [90, 90] }, { t: 90, s: [110, 110] }, { t: 180, s: [90, 90] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", p: { k: [0, 0] }, s: { k: [420, 420] } },
            { ty: "st", c: { k: [0.25, 0.45, 0.95, 1] }, w: { k: 3 }, d: [{ n: "d", v: { k: 10 } }, { n: "g", v: { k: 10 } }] },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    // Main Building Base 1
    {
      ddd: 0, ind: 2, ty: 4, nm: "Tower Center",
      sr: 1, ks: {
        o: { k: 100 },
        r: { k: 0 },
        p: { k: [300, 320, 0] },
        a: { k: [0, 0, 0] },
        s: { k: [{ t: 0, s: [100, 100] }, { t: 90, s: [102, 102] }, { t: 180, s: [100, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, 0] }, s: { k: [140, 260] }, r: { k: 16 } },
            { ty: "fl", c: { k: [0.12, 0.23, 0.54, 1] } },
            { ty: "st", c: { k: [0.3, 0.5, 1, 1] }, w: { k: 4 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    // Windows Grid (Animated Lights)
    {
      ddd: 0, ind: 3, ty: 4, nm: "Windows Lights",
      sr: 1, ks: {
        o: { k: [{ t: 0, s: [70] }, { t: 60, s: [100] }, { t: 120, s: [60] }, { t: 180, s: [70] }] },
        r: { k: 0 }, p: { k: [300, 310, 0] }, a: { k: [0, 0, 0] }, s: { k: [100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [-35, -70] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "rc", p: { k: [35, -70] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "rc", p: { k: [-35, -10] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "rc", p: { k: [35, -10] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "rc", p: { k: [-35, 50] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "rc", p: { k: [35, 50] }, s: { k: [24, 24] }, r: { k: 4 } },
            { ty: "fl", c: { k: [0.22, 0.75, 0.98, 1] } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    // Left Building Tower
    {
      ddd: 0, ind: 4, ty: 4, nm: "Tower Left",
      sr: 1, ks: {
        o: { k: 100 }, r: { k: 0 },
        p: { k: [195, 360, 0] }, a: { k: [0, 0, 0] },
        s: { k: [100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, 0] }, s: { k: [110, 180] }, r: { k: 12 } },
            { ty: "fl", c: { k: [0.18, 0.35, 0.75, 1] } },
            { ty: "st", c: { k: [0.4, 0.6, 1, 1] }, w: { k: 3 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    // Right Building Tower
    {
      ddd: 0, ind: 5, ty: 4, nm: "Tower Right",
      sr: 1, ks: {
        o: { k: 100 }, r: { k: 0 },
        p: { k: [405, 375, 0] }, a: { k: [0, 0, 0] },
        s: { k: [100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, 0] }, s: { k: [110, 150] }, r: { k: 12 } },
            { ty: "fl", c: { k: [0.15, 0.28, 0.65, 1] } },
            { ty: "st", c: { k: [0.35, 0.55, 0.95, 1] }, w: { k: 3 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    // Floating Key & Security Badge
    {
      ddd: 0, ind: 6, ty: 4, nm: "Floating Key Badge",
      sr: 1, ks: {
        o: { k: 100 },
        r: { k: 0 },
        p: { k: [{ t: 0, s: [300, 160, 0] }, { t: 90, s: [300, 140, 0] }, { t: 180, s: [300, 160, 0] }] },
        a: { k: [0, 0, 0] },
        s: { k: [100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", p: { k: [0, 0] }, s: { k: [76, 76] } },
            { ty: "fl", c: { k: [0.98, 0.75, 0.15, 1] } },
            { ty: "st", c: { k: [1, 1, 1, 1] }, w: { k: 4 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    }
  ]
};

// 2. EMPTY STATE ANIMATION
const emptyState = {
  v: "5.7.4", fr: 60, ip: 0, op: 120, w: 400, h: 400, nm: "Empty State Folder", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Floating Box", sr: 1,
      ks: {
        o: { k: 100 },
        p: { k: [{ t: 0, s: [200, 200, 0] }, { t: 60, s: [200, 185, 0] }, { t: 120, s: [200, 200, 0] }] },
        a: { k: [0, 0, 0] }, s: { k: [100, 100] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, 10] }, s: { k: [160, 120] }, r: { k: 16 } },
            { ty: "fl", c: { k: [0.93, 0.95, 0.98, 1] } },
            { ty: "st", c: { k: [0.8, 0.85, 0.92, 1] }, w: { k: 4 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Magnifying Glass", sr: 1,
      ks: {
        o: { k: 100 },
        p: { k: [{ t: 0, s: [240, 170, 0] }, { t: 60, s: [250, 160, 0] }, { t: 120, s: [240, 170, 0] }] },
        a: { k: [0, 0, 0] }, s: { k: [100, 100] }, r: { k: [{ t: 0, s: [-15] }, { t: 60, s: [10] }, { t: 120, s: [-15] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", p: { k: [0, 0] }, s: { k: [60, 60] } },
            { ty: "st", c: { k: [0.25, 0.45, 0.95, 1] }, w: { k: 6 } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    }
  ]
};

// 3. LOADING SPINNER ANIMATION
const loadingSpinner = {
  v: "5.7.4", fr: 60, ip: 0, op: 60, w: 200, h: 200, nm: "SaaS Spinner", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Spinner Ring", sr: 1,
      ks: {
        o: { k: 100 },
        p: { k: [100, 100, 0] },
        a: { k: [0, 0, 0] },
        s: { k: [100, 100] },
        r: { k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", p: { k: [0, 0] }, s: { k: [120, 120] } },
            { ty: "st", c: { k: [0.25, 0.45, 0.95, 1] }, w: { k: 10 }, d: [{ n: "d", v: { k: 120 } }, { n: "g", v: { k: 80 } }] },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    }
  ]
};

// 4. SUCCESS CHECK ANIMATION
const successCheck = {
  v: "5.7.4", fr: 60, ip: 0, op: 90, w: 300, h: 300, nm: "Success Checkmark", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Circle Background", sr: 1,
      ks: {
        o: { k: 100 }, p: { k: [150, 150, 0] }, a: { k: [0, 0, 0] },
        s: { k: [{ t: 0, s: [0, 0] }, { t: 30, s: [110, 110] }, { t: 45, s: [100, 100] }] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", p: { k: [0, 0] }, s: { k: [180, 180] } },
            { ty: "fl", c: { k: [0.1, 0.75, 0.45, 1] } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Checkmark Path", sr: 1,
      ks: {
        o: { k: 100 }, p: { k: [150, 150, 0] }, a: { k: [0, 0, 0] },
        s: { k: [{ t: 25, s: [0, 0] }, { t: 50, s: [100, 100] }] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                k: {
                  i: [[0,0],[0,0],[0,0]],
                  o: [[0,0],[0,0],[0,0]],
                  v: [[-30, 0], [-10, 25], [35, -25]],
                  c: false
                }
              }
            },
            { ty: "st", c: { k: [1, 1, 1, 1] }, w: { k: 14 }, lc: 2, lj: 2 },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    }
  ]
};

// 5. FINANCE CHART ANIMATION
const financeChart = {
  v: "5.7.4", fr: 60, ip: 0, op: 150, w: 400, h: 400, nm: "Financial Growth", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Bar 1", sr: 1,
      ks: {
        o: { k: 100 }, p: { k: [120, 260, 0] }, a: { k: [0, 0, 0] },
        s: { k: [{ t: 0, s: [100, 0] }, { t: 40, s: [100, 100] }] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, -40] }, s: { k: [40, 80] }, r: { k: 8 } },
            { ty: "fl", c: { k: [0.3, 0.5, 0.95, 1] } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Bar 2", sr: 1,
      ks: {
        o: { k: 100 }, p: { k: [200, 260, 0] }, a: { k: [0, 0, 0] },
        s: { k: [{ t: 15, s: [100, 0] }, { t: 55, s: [100, 100] }] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, -75] }, s: { k: [40, 150] }, r: { k: 8 } },
            { ty: "fl", c: { k: [0.2, 0.7, 0.9, 1] } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0, ind: 3, ty: 4, nm: "Bar 3", sr: 1,
      ks: {
        o: { k: 100 }, p: { k: [280, 260, 0] }, a: { k: [0, 0, 0] },
        s: { k: [{ t: 30, s: [100, 0] }, { t: 70, s: [100, 100] }] }, r: { k: 0 }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", p: { k: [0, -110] }, s: { k: [40, 220] }, r: { k: 8 } },
            { ty: "fl", c: { k: [0.1, 0.8, 0.45, 1] } },
            { ty: "tr", p: { k: [0, 0] }, a: { k: [0, 0] }, s: { k: [100, 100] }, r: { k: 0 }, o: { k: 100 } }
          ]
        }
      ]
    }
  ]
};

fs.writeFileSync(path.join(animDir, 'hero-building.json'), JSON.stringify(heroBuilding, null, 2));
fs.writeFileSync(path.join(animDir, 'empty-state.json'), JSON.stringify(emptyState, null, 2));
fs.writeFileSync(path.join(animDir, 'loading-spinner.json'), JSON.stringify(loadingSpinner, null, 2));
fs.writeFileSync(path.join(animDir, 'success-check.json'), JSON.stringify(successCheck, null, 2));
fs.writeFileSync(path.join(animDir, 'finance-chart.json'), JSON.stringify(financeChart, null, 2));

console.log('✅ 5 Lottie animation files successfully generated in public/assets/animations/');
