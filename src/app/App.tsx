import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Search, Bell, ChevronRight, Leaf, Brain, BarChart3,
  Download, Share2, AlertTriangle, CheckCircle2, Zap,
  Activity, FileText, Eye, RefreshCw, Database, Cpu,
  Clock, Target, Microscope, Award, Layers, Info,
  FlaskConical, Shield, X, Sparkles, Scan,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  primary:       "#2C5F2D",
  primaryDark:   "#1d4a1e",
  healthy:       "#74C69D",
  healthyLight:  "#e8f8f1",
  disease:       "#B03A2E",
  diseaseLight:  "#fdf0ef",
  analytics:     "#1A5276",
  analyticsLight:"#eaf2fb",
  bg:            "#F9FAFB",
  text:          "#111827",
  textMuted:     "#6B7280",
  border:        "#E5E7EB",
};

type Page = "landing" | "detection" | "explainability" | "report" | "analytics";

// ─── Static Chart Data ─────────────────────────────────────────────────────────
const datasetDist = [
  { name: "Healthy",          count: 2127 },
  { name: "Downy Mildew",     count: 1500 },
  { name: "Powdery Mildew",   count: 1200 },
  { name: "Bacterial Wilt",   count: 890  },
  { name: "Leaf Miner",       count: 687  },
  { name: "Angular Leaf Spot",count: 760  },
];
const diseaseColors = ["#74C69D","#1A5276","#B03A2E","#8E44AD","#E67E22","#27AE60"];
const pieData = datasetDist.map((d, i) => ({ ...d, value: d.count, fill: diseaseColors[i] }));

const trainingData = [
  { epoch:1,  trainAcc:0.450, valAcc:0.420, trainLoss:1.800, valLoss:1.900 },
  { epoch:2,  trainAcc:0.580, valAcc:0.540, trainLoss:1.520, valLoss:1.620 },
  { epoch:3,  trainAcc:0.650, valAcc:0.610, trainLoss:1.300, valLoss:1.400 },
  { epoch:4,  trainAcc:0.710, valAcc:0.670, trainLoss:1.120, valLoss:1.220 },
  { epoch:5,  trainAcc:0.750, valAcc:0.710, trainLoss:0.970, valLoss:1.070 },
  { epoch:6,  trainAcc:0.790, valAcc:0.750, trainLoss:0.840, valLoss:0.940 },
  { epoch:7,  trainAcc:0.820, valAcc:0.780, trainLoss:0.740, valLoss:0.840 },
  { epoch:8,  trainAcc:0.840, valAcc:0.800, trainLoss:0.660, valLoss:0.760 },
  { epoch:9,  trainAcc:0.860, valAcc:0.820, trainLoss:0.590, valLoss:0.690 },
  { epoch:10, trainAcc:0.870, valAcc:0.830, trainLoss:0.530, valLoss:0.630 },
  { epoch:11, trainAcc:0.880, valAcc:0.845, trainLoss:0.480, valLoss:0.580 },
  { epoch:12, trainAcc:0.890, valAcc:0.856, trainLoss:0.440, valLoss:0.540 },
  { epoch:13, trainAcc:0.900, valAcc:0.862, trainLoss:0.410, valLoss:0.510 },
  { epoch:14, trainAcc:0.910, valAcc:0.868, trainLoss:0.380, valLoss:0.480 },
  { epoch:15, trainAcc:0.915, valAcc:0.875, trainLoss:0.360, valLoss:0.460 },
  { epoch:16, trainAcc:0.922, valAcc:0.879, trainLoss:0.340, valLoss:0.440 },
  { epoch:17, trainAcc:0.928, valAcc:0.882, trainLoss:0.320, valLoss:0.420 },
  { epoch:18, trainAcc:0.932, valAcc:0.885, trainLoss:0.310, valLoss:0.410 },
  { epoch:19, trainAcc:0.936, valAcc:0.887, trainLoss:0.300, valLoss:0.400 },
  { epoch:20, trainAcc:0.941, valAcc:0.889, trainLoss:0.280, valLoss:0.380 },
];

const rocData = [
  { fpr:0.000, tpr:0.000 }, { fpr:0.010, tpr:0.420 }, { fpr:0.030, tpr:0.600 },
  { fpr:0.050, tpr:0.720 }, { fpr:0.080, tpr:0.810 }, { fpr:0.120, tpr:0.870 },
  { fpr:0.180, tpr:0.910 }, { fpr:0.250, tpr:0.930 }, { fpr:0.350, tpr:0.950 },
  { fpr:0.500, tpr:0.970 }, { fpr:0.700, tpr:0.985 }, { fpr:1.000, tpr:1.000 },
];

const prData = [
  { recall:0.00, precision:1.000 }, { recall:0.10, precision:0.970 },
  { recall:0.20, precision:0.950 }, { recall:0.30, precision:0.930 },
  { recall:0.40, precision:0.910 }, { recall:0.50, precision:0.890 },
  { recall:0.60, precision:0.870 }, { recall:0.70, precision:0.840 },
  { recall:0.80, precision:0.810 }, { recall:0.90, precision:0.760 },
  { recall:0.95, precision:0.710 }, { recall:1.00, precision:0.650 },
];

const thresholdData = [
  { threshold:"0.10", precision:0.720, recall:0.980, f1:0.832 },
  { threshold:"0.20", precision:0.780, recall:0.960, f1:0.860 },
  { threshold:"0.30", precision:0.830, recall:0.920, f1:0.873 },
  { threshold:"0.40", precision:0.870, recall:0.870, f1:0.870 },
  { threshold:"0.50", precision:0.910, recall:0.810, f1:0.857 },
  { threshold:"0.60", precision:0.930, recall:0.740, f1:0.824 },
  { threshold:"0.70", precision:0.950, recall:0.650, f1:0.772 },
  { threshold:"0.80", precision:0.970, recall:0.540, f1:0.696 },
  { threshold:"0.90", precision:0.980, recall:0.380, f1:0.548 },
];

const confLabels = ["Healthy", "Downy M.", "Powdery M.", "Bact. Wilt", "Ang. LS"];
const confMatrix = [
  [418, 12,  4,  2,  3],
  [  8,292, 15,  5,  5],
  [  5, 14,228,  4,  9],
  [  3,  4,  5,172, 10],
  [  4,  6,  8,  7,147],
];

// ─── Injected CSS ─────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes scan-line {
        0%   { top: -2px; opacity: 0; }
        5%   { opacity: 1; }
        95%  { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      @keyframes spin-ring {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.5; transform: scale(0.7); }
      }
      @keyframes float-leaf {
        0%, 100% { transform: translateY(0px) rotate(-3deg); }
        50%      { transform: translateY(-12px) rotate(3deg); }
      }
      .animate-scan    { animation: scan-line 2.2s ease-in-out infinite; position: absolute; }
      .animate-spin-ring { animation: spin-ring 1.4s linear infinite; }
      .animate-fade-up { animation: fade-up 0.5s ease-out forwards; }
      .animate-pulse-dot { animation: pulse-dot 1.6s ease-in-out infinite; }
      .animate-float   { animation: float-leaf 5s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
    `}</style>
  );
}

// ─── Cucumber Leaf SVG ────────────────────────────────────────────────────────
function CucumberLeaf({ hasDisease = false, size = 260 }: { hasDisease?: boolean; size?: number }) {
  const uid = hasDisease ? "d" : "h";
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`lg${uid}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor={hasDisease ? "#5a9c44" : "#52b85e"} />
          <stop offset="100%" stopColor={hasDisease ? "#2a5620" : "#2C5F2D"} />
        </radialGradient>
        {hasDisease && (
          <>
            <radialGradient id="m1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ede0b8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c8b058" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="m2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0e8cc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d4a858" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="n1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7a3810" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b86040" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>
      <path d="M130 22 C154 20,218 56,235 105 C252 154,232 210,198 237 C164 264,100 265,68 242 C36 219,14 163,18 111 C22 59,106 24,130 22 Z"
        fill={`url(#lg${uid})`} />
      <path d="M130 22 C148 24,182 52,198 85 C212 114,212 148,204 176" stroke="#fff" strokeWidth="0.8" opacity="0.12" fill="none" />
      <path d="M130 38 L121 240" stroke="#1a3d1b" strokeWidth="2.2" opacity="0.45" />
      <path d="M127 76 Q92 96, 63 110"  stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M125 108 Q87 132, 48 148" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M124 142 Q82 166, 56 185" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M123 178 Q88 200, 73 218" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M129 72 Q163 88, 192 96"  stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M127 106 Q168 126, 204 132" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M126 142 Q164 162, 198 168" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M125 178 Q158 198, 182 210" stroke="#1a3d1b" strokeWidth="1.4" opacity="0.38" fill="none" />
      <path d="M121 240 C118 250, 115 258, 112 264" stroke="#5d3a1a" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {hasDisease && (
        <>
          <ellipse cx="95"  cy="100" rx="26" ry="19" fill="url(#m1)" transform="rotate(-18 95 100)"  />
          <ellipse cx="180" cy="145" rx="22" ry="16" fill="url(#m2)" transform="rotate(12 180 145)"  />
          <ellipse cx="148" cy="188" rx="18" ry="13" fill="url(#m1)" transform="rotate(-5 148 188)"  />
          <circle  cx="118" cy="155" r="10"           fill="url(#n1)"  />
          <circle  cx="165" cy="106" r="7"            fill="url(#n1)" opacity="0.65" />
          <ellipse cx="95"  cy="99"  rx="20" ry="14"  fill="#fff" opacity="0.38" transform="rotate(-18 95 99)"  />
          <ellipse cx="180" cy="144" rx="16" ry="11"  fill="#fff" opacity="0.32" transform="rotate(12 180 144)" />
          <ellipse cx="148" cy="187" rx="13" ry="9"   fill="#fff" opacity="0.35" transform="rotate(-5 148 187)" />
        </>
      )}
    </svg>
  );
}

// ─── Grad-CAM Heatmap SVG ─────────────────────────────────────────────────────
function GradCAMOverlay({ size = 260 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="lc">
          <path d="M130 22 C154 20,218 56,235 105 C252 154,232 210,198 237 C164 264,100 265,68 242 C36 219,14 163,18 111 C22 59,106 24,130 22 Z" />
        </clipPath>
        <radialGradient id="h1" cx="36%" cy="38%" r="28%">
          <stop offset="0%"   stopColor="#ff1200" stopOpacity="0.93" />
          <stop offset="35%"  stopColor="#ff5500" stopOpacity="0.65" />
          <stop offset="70%"  stopColor="#ffaa00" stopOpacity="0.3"  />
          <stop offset="100%" stopColor="#ffff00" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="h2" cx="69%" cy="55%" r="25%">
          <stop offset="0%"   stopColor="#ff2200" stopOpacity="0.84" />
          <stop offset="45%"  stopColor="#ff7700" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#ffdd00" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="h3" cx="57%" cy="72%" r="20%">
          <stop offset="0%"   stopColor="#ff8800" stopOpacity="0.74" />
          <stop offset="60%"  stopColor="#ffcc00" stopOpacity="0.33" />
          <stop offset="100%" stopColor="#ffff88" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="h4" cx="44%" cy="59%" r="13%">
          <stop offset="0%"   stopColor="#cc0000" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#ff6600" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="cool" cx="50%" cy="50%" r="70%">
          <stop offset="60%"  stopColor="#0055ff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#0033cc" stopOpacity="0.14" />
        </radialGradient>
      </defs>
      <path d="M130 22 C154 20,218 56,235 105 C252 154,232 210,198 237 C164 264,100 265,68 242 C36 219,14 163,18 111 C22 59,106 24,130 22 Z"
        fill="#162a17" />
      <rect width="260" height="260" fill="url(#cool)" clipPath="url(#lc)" />
      <rect width="260" height="260" fill="url(#h3)"   clipPath="url(#lc)" />
      <rect width="260" height="260" fill="url(#h2)"   clipPath="url(#lc)" />
      <rect width="260" height="260" fill="url(#h4)"   clipPath="url(#lc)" />
      <rect width="260" height="260" fill="url(#h1)"   clipPath="url(#lc)" />
      <g clipPath="url(#lc)" opacity="0.18">
        <path d="M130 38 L121 240" stroke="#fff" strokeWidth="1.2" />
        <path d="M127 76 Q92 96, 63 110"  stroke="#fff" strokeWidth="0.8" fill="none" />
        <path d="M129 72 Q163 88, 192 96"  stroke="#fff" strokeWidth="0.8" fill="none" />
      </g>
    </svg>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navigation({ current, set }: { current: Page; set: (p: Page) => void }) {
  const items: { id: Page; label: string }[] = [
    { id: "landing",        label: "Home"           },
    { id: "detection",      label: "Detect Disease" },
    { id: "explainability", label: "Explainability" },
    { id: "report",         label: "Reports"        },
    { id: "analytics",      label: "Analytics"      },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b" style={{ borderColor: C.border, boxShadow: "0 1px 16px rgba(0,0,0,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button className="flex items-center gap-2.5 cursor-pointer" onClick={() => set("landing")}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.primary }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-base leading-tight" style={{ color: C.primary }}>AgriVision</div>
              <div className="text-[10px] leading-tight" style={{ color: C.textMuted }}>AI Disease Detection</div>
            </div>
          </button>

          {/* Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => set(item.id)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
                style={current === item.id
                  ? { backgroundColor: C.primary, color: "#fff" }
                  : { color: C.textMuted }}
                onMouseEnter={e => { if (current !== item.id) (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6"; }}
                onMouseLeave={e => { if (current !== item.id) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => set("analytics")}
              className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: C.textMuted }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              Deployment
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100" style={{ color: C.textMuted }}>
              <Search className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-colors hover:bg-gray-100" style={{ color: C.textMuted }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: C.disease }}></span>
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.primary }}>
              AR
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── PAGE 1: Landing ──────────────────────────────────────────────────────────
function LandingPage({ set, onUpload }: { set: (p: Page) => void; onUpload: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
  }, [onUpload]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
  }, [onUpload]);

  const pipeline = [
    { label: "Dataset",           icon: Database,  bg: C.analyticsLight, ic: C.analytics },
    { label: "Vision Transformer",icon: Brain,      bg: "#f3e8ff",        ic: "#7c3aed"  },
    { label: "Disease Detection", icon: Scan,       bg: C.healthyLight,   ic: C.primary  },
    { label: "Grad-CAM",          icon: Layers,     bg: "#fff7ed",        ic: "#c2410c"  },
    { label: "Recommendation",    icon: FileText,   bg: "#fef9c3",        ic: "#a16207"  },
    { label: "Deployment",        icon: Cpu,        bg: "#f0fdf4",        ic: "#15803d"  },
  ];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: C.bg }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(155deg, #ecfdf5 0%, #f9fafb 45%, #eff6ff 100%)" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, ${C.primary}22 1px, transparent 1px)`,
          backgroundSize: "36px 36px", opacity: 0.6,
        }} />
        {/* Decorative leaf */}
        <div className="absolute -right-16 top-8 opacity-[0.06] pointer-events-none animate-float">
          <CucumberLeaf size={480} />
        </div>
        <div className="absolute -left-24 bottom-0 opacity-[0.04] pointer-events-none" style={{ transform: "rotate(160deg)" }}>
          <CucumberLeaf size={380} hasDisease />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-7 border" style={{
            backgroundColor: C.healthyLight, color: C.primary, borderColor: `${C.healthy}60`,
          }}>
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Vision Transformers · ViT Base Patch16 224
          </div>

          <h1 className="text-5xl sm:text-[3.5rem] font-extrabold mb-5 leading-[1.12] tracking-tight" style={{ color: C.text }}>
            AI-powered{" "}
            <span style={{ color: C.primary }}>Cucumber Disease</span>
            <br />Detection Platform
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: C.textMuted }}>
            Detect cucumber diseases instantly using Vision Transformers and Explainable AI.
            Upload a leaf image and receive a diagnosis in seconds.
          </p>

          {/* Upload zone */}
          <div
            className="max-w-xl mx-auto rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: dragging ? `${C.healthy}12` : "rgba(255,255,255,0.92)",
              borderColor: dragging ? C.healthy : `${C.primary}45`,
              boxShadow: dragging ? `0 0 0 4px ${C.healthy}22, 0 8px 32px rgba(0,0,0,0.08)` : "0 4px 24px rgba(0,0,0,0.06)",
              transform: dragging ? "scale(1.015)" : "scale(1)",
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleFile} />
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${C.primary}12` }}>
              <Upload className="w-6 h-6" style={{ color: C.primary }} />
            </div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: C.text }}>Drag & Drop your cucumber leaf image</h3>
            <p className="text-sm mb-5" style={{ color: C.textMuted }}>or click anywhere to browse files</p>
            <div className="flex justify-center gap-2 mb-4">
              {["PNG", "JPG", "JPEG"].map(fmt => (
                <span key={fmt} className="px-3 py-1 rounded-full text-xs font-bold border" style={{
                  backgroundColor: C.healthyLight, color: C.primary, borderColor: `${C.healthy}50`,
                }}>{fmt}</span>
              ))}
            </div>
            <p className="text-xs" style={{ color: C.textMuted }}>Maximum file size: 10 MB</p>
          </div>

          {/* CTAs */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              className="px-7 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: C.primary, boxShadow: `0 4px 16px ${C.primary}45` }}
              onClick={() => fileRef.current?.click()}
            >
              Analyze Leaf
            </button>
            <button
              className="px-7 py-3 rounded-xl text-sm font-semibold border-2 bg-white transition-all hover:scale-105 active:scale-95"
              style={{ color: C.primary, borderColor: C.primary }}
              onClick={() => set("detection")}
            >
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>What AgriVision Offers</h2>
          <p className="text-sm" style={{ color: C.textMuted }}>State-of-the-art tools for precision agriculture disease management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Brain, title: "AI Detection", tag: "ViT-B/16",
              desc: "Vision Transformer fine-tuned on 7,164 cucumber disease images. 94.1% training accuracy across 6 disease classes.",
              bg: C.analyticsLight, ic: C.analytics,
            },
            {
              icon: Eye, title: "Grad-CAM Explainability", tag: "XAI",
              desc: "Visualize exactly which leaf regions activated the model's prediction with class-discriminative heatmap overlays.",
              bg: "#fff0f0", ic: C.disease,
            },
            {
              icon: BarChart3, title: "Disease Analytics", tag: "Research",
              desc: "Confusion matrices, ROC curves, precision-recall analysis, and threshold optimization for deployment readiness.",
              bg: C.healthyLight, ic: C.primary,
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ borderColor: C.border }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: f.bg }}>
                  <f.icon className="w-5 h-5" style={{ color: f.ic }} />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: f.bg, color: f.ic }}>{f.tag}</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: C.text }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Detection Pipeline</h2>
          <p className="text-sm" style={{ color: C.textMuted }}>End-to-end AI workflow from raw image to actionable field insight</p>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-2">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 border" style={{
                  backgroundColor: step.bg, borderColor: `${step.ic}20`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  <step.icon className="w-5 h-5" style={{ color: step.ic }} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight max-w-[68px]" style={{ color: C.textMuted }}>
                  {step.label}
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <ChevronRight className="w-4 h-4 mb-5 flex-shrink-0" style={{ color: C.border }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 2: Detection ────────────────────────────────────────────────────────
function DetectionPage({ set, analyzing, image }: { set: (p: Page) => void; analyzing: boolean; image: string | null }) {
  const [progress, setProgress] = useState(analyzing ? 0 : 100);

  useEffect(() => {
    if (analyzing) {
      setProgress(0);
      const id = setInterval(() => {
        setProgress(prev => {
          if (prev >= 91) { clearInterval(id); return 91; }
          return prev + 6 + Math.floor(Math.random() * 8);
        });
      }, 220);
      return () => clearInterval(id);
    } else {
      setProgress(100);
    }
  }, [analyzing]);

  const result = {
    disease: "Powdery Mildew",
    scientific: "Podosphaera xanthii",
    confidence: 87.3,
    severity: 65,
    timeTaken: "1.42s",
    model: "ViT Base Patch16 224",
    probs: [
      { label: "Powdery Mildew", v: 0.873, color: C.disease    },
      { label: "Downy Mildew",   v: 0.074, color: C.analytics  },
      { label: "Healthy",        v: 0.028, color: C.healthy     },
      { label: "Bacterial Wilt", v: 0.018, color: "#8E44AD"     },
      { label: "Angular LS",     v: 0.007, color: "#E67E22"     },
    ],
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: C.bg }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.text }}>AI Disease Detection</h1>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Analysis results for the uploaded cucumber leaf image</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border transition-all hover:bg-gray-50"
            style={{ borderColor: C.border, color: C.text }}
            onClick={() => set("landing")}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Another
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image panel */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot"></span>
                <span className="text-sm font-semibold" style={{ color: C.text }}>Uploaded Image</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: C.healthyLight, color: C.primary }}>
                cucumber_leaf_01.jpg
              </span>
            </div>

            <div className="relative flex items-center justify-center p-10" style={{ backgroundColor: "#f4fdf6", minHeight: "320px" }}>
              {image
                ? <img src={image} alt="Uploaded leaf" className="max-h-64 max-w-full rounded-xl object-contain" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                : <CucumberLeaf hasDisease size={230} />
              }

              {/* Scanning overlay */}
              {analyzing && (
                <div className="absolute inset-0">
                  {/* Corner markers */}
                  {[["top-6 left-6","border-t-2 border-l-2"],["top-6 right-6","border-t-2 border-r-2"],["bottom-6 left-6","border-b-2 border-l-2"],["bottom-6 right-6","border-b-2 border-r-2"]].map(([pos, border], i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 rounded-sm ${border}`} style={{ borderColor: C.healthy }}></div>
                  ))}
                  <div className="absolute inset-6 overflow-hidden rounded-lg">
                    <div className="animate-scan left-0 right-0 h-0.5" style={{
                      background: `linear-gradient(90deg, transparent 0%, ${C.healthy} 50%, transparent 100%)`,
                      boxShadow: `0 0 8px ${C.healthy}`,
                    }} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
              {[["Format","JPEG"],["File Size","2.1 MB"],["Resolution","1024×768"]].map(([k,v]) => (
                <div key={k} className="text-center p-2.5 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <div className="text-[11px] mb-0.5" style={{ color: C.textMuted }}>{k}</div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col gap-4">
            {analyzing ? (
              <div className="bg-white rounded-2xl border flex flex-col items-center justify-center p-10" style={{ borderColor: C.border, minHeight: "220px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full animate-spin" style={{ border: "4px solid #e5e7eb", borderTopColor: C.primary }} />
                  <Brain className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: C.primary }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: C.text }}>Analyzing Image…</h3>
                <p className="text-sm mb-5" style={{ color: C.textMuted }}>Vision Transformer is processing the leaf</p>
                <div className="w-full max-w-[280px] h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 91)}%`, backgroundColor: C.primary }} />
                </div>
                <p className="text-xs mt-2" style={{ color: C.textMuted }}>{Math.round(Math.min(progress, 91))}% complete</p>
              </div>
            ) : (
              <>
                {/* Prediction card */}
                <div className="bg-white rounded-2xl border p-6 animate-fade-up" style={{ borderColor: C.border, boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Detected Disease</p>
                      <h2 className="text-2xl font-extrabold" style={{ color: C.disease }}>{result.disease}</h2>
                      <p className="text-sm italic mt-0.5" style={{ color: C.textMuted }}>{result.scientific}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: C.disease }}>
                        Disease Detected
                      </span>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" style={{ color: "#d97706" }} />
                        <span className="text-xs font-semibold" style={{ color: "#d97706" }}>Moderate Severity</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: C.textMuted }}>Confidence Score</span>
                      <span className="text-sm font-bold" style={{ color: C.disease }}>{result.confidence}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${result.confidence}%`,
                        background: `linear-gradient(90deg, #e06050, ${C.disease})`,
                      }} />
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: C.textMuted }}>Disease Severity</span>
                      <span className="text-sm font-bold" style={{ color: "#d97706" }}>{result.severity}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#fef3c7" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${result.severity}%`,
                        background: "linear-gradient(90deg, #fbbf24, #d97706)",
                      }} />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Clock, label: "Time Taken",  val: result.timeTaken },
                      { icon: Cpu,   label: "Model",       val: "ViT-B/16"       },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                        <m.icon className="w-4 h-4 flex-shrink-0" style={{ color: C.textMuted }} />
                        <div>
                          <div className="text-[11px]" style={{ color: C.textMuted }}>{m.label}</div>
                          <div className="text-xs font-semibold" style={{ color: C.text }}>{m.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Probabilities */}
                <div className="bg-white rounded-2xl border p-5 animate-fade-up" style={{ borderColor: C.border, animationDelay: "80ms", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Probability Distribution</h3>
                  <div className="space-y-3">
                    {result.probs.map(p => (
                      <div key={p.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: C.text }}>{p.label}</span>
                          <span className="text-xs font-bold" style={{ color: p.color }}>{(p.v * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.v * 100}%`, backgroundColor: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: C.primary }}
                    onClick={() => set("report")}
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border bg-white transition-all hover:bg-gray-50"
                    style={{ borderColor: C.border, color: C.text }}
                    onClick={() => set("explainability")}
                  >
                    <Eye className="w-4 h-4" />
                    View Explainability
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 3: Explainability ───────────────────────────────────────────────────
function ExplainabilityPage({ set }: { set: (p: Page) => void }) {
  const [tab, setTab] = useState<"compare" | "timeline">("compare");

  const confTimeline = [
    { step:"Input",      v:0.000 }, { step:"Embed",       v:0.180 },
    { step:"Block 1",    v:0.310 }, { step:"Block 3",     v:0.450 },
    { step:"Block 6",    v:0.620 }, { step:"Block 9",     v:0.740 },
    { step:"Block 12",   v:0.830 }, { step:"MLP Head",    v:0.873 },
  ];

  const coverage = [
    { region: "Upper Left",   pct: 78, color: C.disease   },
    { region: "Upper Right",  pct: 62, color: "#f97316"   },
    { region: "Center",       pct: 45, color: "#f59e0b"   },
    { region: "Lower Center", pct: 30, color: "#84cc16"   },
    { region: "Stem Area",    pct: 12, color: C.healthy    },
  ];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: C.bg }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: C.analyticsLight, color: C.analytics }}>XAI</span>
            <span className="text-xs" style={{ color: C.textMuted }}>Explainable Artificial Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: C.text }}>Explainable AI</h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>See where the model focused before making its prediction.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-7" style={{ backgroundColor: "#eaeaef" }}>
          {([["compare","Image Comparison"],["timeline","Confidence Timeline"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === id ? { backgroundColor: "#fff", color: C.text, boxShadow: "0 1px 4px rgba(0,0,0,0.09)" } : { color: C.textMuted }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "compare" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Images */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="text-xs font-semibold" style={{ color: C.text }}>Original Image</span>
                </div>
                <div className="flex items-center justify-center p-8" style={{ backgroundColor: "#f4fdf6", minHeight: "270px" }}>
                  <CucumberLeaf hasDisease size={200} />
                </div>
                <div className="p-3 text-center">
                  <span className="text-xs" style={{ color: C.textMuted }}>Raw ViT input · 224×224</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-xs font-semibold" style={{ color: C.text }}>Grad-CAM Overlay</span>
                </div>
                <div className="flex items-center justify-center p-8" style={{ backgroundColor: "#0d1b0e", minHeight: "270px" }}>
                  <GradCAMOverlay size={200} />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-20 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #0033cc, #00aaff, #00ff88, #ffff00, #ff6600, #ff0000)" }}></div>
                    <div className="flex justify-between w-10">
                      <span className="text-[9px]" style={{ color: C.textMuted }}>Low</span>
                      <span className="text-[9px]" style={{ color: C.textMuted }}>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.diseaseLight }}>
                    <Microscope className="w-4 h-4" style={{ color: C.disease }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.text }}>Model Focus Analysis</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>Powdery Mildew — Detected</p>
                  </div>
                </div>

                {[
                  { dot: "#ff1500", label: "High Activation (Red)",    bg: `${C.disease}08`,   border: `${C.disease}22`, tc: C.disease,
                    text: "Highlights white powdery mildew patches, lesion boundaries, and areas of necrotic tissue." },
                  { dot: "#f97316", label: "Medium Activation (Orange)", bg: "#fff7ed",          border: "#fed7aa",        tc: "#c2410c",
                    text: "Surrounding diseased tissue and early-stage mildew regions show secondary attention." },
                  { dot: C.healthy, label: "Low Activation (Green)",   bg: C.healthyLight,    border: `${C.healthy}40`, tc: C.primary,
                    text: "Healthy tissue, veins, and stem show minimal activation, confirming localized disease." },
                ].map(a => (
                  <div key={a.label} className="p-3 rounded-xl mb-2.5 border" style={{ backgroundColor: a.bg, borderColor: a.border }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: a.dot }}></div>
                      <span className="text-xs font-semibold" style={{ color: a.tc }}>{a.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{a.text}</p>
                  </div>
                ))}

                <div className="p-3 rounded-xl mt-1" style={{ backgroundColor: C.analyticsLight }}>
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.analytics }} />
                    <p className="text-xs leading-relaxed" style={{ color: C.analytics }}>
                      Grad-CAM uses gradient flow through the final attention layer of the Vision Transformer to produce class-discriminative localization maps.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Heatmap Coverage by Region</h3>
                <div className="space-y-2.5">
                  {coverage.map(c => (
                    <div key={c.region}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: C.text }}>{c.region}</span>
                        <span className="text-xs font-bold" style={{ color: c.color }}>{c.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
              <h3 className="text-sm font-semibold" style={{ color: C.text }}>Confidence Build-up Through ViT Blocks</h3>
              <p className="text-xs mt-0.5 mb-5" style={{ color: C.textMuted }}>Prediction probability as data flows through transformer layers</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={confTimeline}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.primary} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="step" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis domain={[0,1]} tick={{ fontSize: 10, fill: C.textMuted }} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                  <Tooltip formatter={(v: number) => [`${(v*100).toFixed(1)}%`, "Confidence"]} />
                  <Area type="monotone" dataKey="v" stroke={C.primary} fill="url(#cg)" strokeWidth={2.5}
                    dot={{ fill: C.primary, r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
              <h3 className="text-sm font-semibold" style={{ color: C.text }}>Final Softmax Prediction Distribution</h3>
              <p className="text-xs mt-0.5 mb-5" style={{ color: C.textMuted }}>Output probabilities across all disease classes</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart barSize={34} data={[
                  { name:"Powdery M.", v:87.3 }, { name:"Downy M.",  v:7.4  },
                  { name:"Healthy",   v:2.8  }, { name:"Bact.Wilt", v:1.8  },
                  { name:"Ang. LS",   v:0.7  },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Probability"]} />
                  <Bar dataKey="v" radius={[4,4,0,0]}>
                    {[C.disease, C.analytics, C.healthy, "#8E44AD", "#E67E22"].map((c, i) => <Cell key={i} fill={c} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => set("detection")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border transition-all hover:bg-gray-50" style={{ borderColor: C.border, color: C.text }}>
            ← Back to Detection
          </button>
          <button onClick={() => set("report")} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: C.primary }}>
            View Full Report →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 4: Disease Report ───────────────────────────────────────────────────
function ReportPage({ set }: { set: (p: Page) => void }) {
  const R = {
    id: "RPT-2024-0847",
    date: "July 8, 2024",
    disease: "Powdery Mildew",
    sci: "Podosphaera xanthii (Sphaerotheca fuliginea)",
    severity: "Moderate",
    severityPct: 65,
    confidence: 87.3,
    areas: ["Upper leaf surface","Young shoots","Leaf margins","Stem nodes"],
    symptoms: [
      "White to grayish powdery spots on upper leaf surface",
      "Yellowing and chlorosis around mildew patches",
      "Distorted and curled leaf growth at infection sites",
      "Premature leaf drop in advanced stages",
      "Stunted plant growth and reduced fruit yield",
    ],
    treatment: [
      "Apply sulfur-based fungicide (Wettable Sulfur 80 WP) every 7–10 days",
      "Use potassium bicarbonate spray (2.5 g/L) as organic alternative",
      "Remove and destroy heavily infected leaves immediately",
      "Apply neem oil solution (5 mL/L water) at early disease onset",
      "Ensure good canopy airflow to reduce humidity around leaves",
    ],
    prevention: [
      "Use mildew-resistant cucumber varieties (Dasher II, Spacemaster)",
      "Maintain 45–60 cm spacing between plants for airflow",
      "Avoid overhead irrigation; use drip or furrow systems",
      "Apply preventive fungicides before disease pressure begins",
      "Monitor plants weekly for early powdery mildew detection",
    ],
    recovery: "2–3 weeks with consistent treatment under favorable conditions",
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: C.bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report card header */}
        <div className="bg-white rounded-2xl border overflow-hidden mb-6" style={{ borderColor: C.border, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <div className="px-8 py-7" style={{ background: `linear-gradient(140deg, ${C.primary} 0%, ${C.primaryDark} 100%)` }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/75 text-sm">AgriVision — Disease Analysis Report</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-1">{R.disease}</h1>
                <p className="text-white/65 text-sm italic">{R.sci}</p>
              </div>
              <div className="text-right">
                <p className="text-white/55 text-xs mb-0.5">Report ID</p>
                <p className="text-white font-mono text-sm font-bold">{R.id}</p>
                <p className="text-white/55 text-xs mt-1">{R.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label:"Confidence", val:`${R.confidence}%`,  icon: Target        },
                { label:"Severity",   val: R.severity,         icon: AlertTriangle },
                { label:"Model",      val:"ViT-B/16",          icon: Brain         },
                { label:"Analysis",   val:"1.42s",             icon: Clock         },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-3 bg-white/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/60 text-xs">{m.label}</span>
                  </div>
                  <p className="text-white font-bold text-sm">{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Severity bar */}
          <div className="px-8 py-4 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: C.text }}>Disease Severity Index</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#fffbeb", color: "#92400e" }}>
                {R.severity} — {R.severityPct}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${R.severityPct}%`,
                background: `linear-gradient(90deg, ${C.healthy}, #f59e0b 50%, ${C.disease})`,
              }} />
            </div>
            <div className="flex justify-between mt-1">
              {["Low","Moderate","Severe"].map(l => (
                <span key={l} className="text-[11px]" style={{ color: C.textMuted }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Four columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Symptoms */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.diseaseLight }}>
                <Microscope className="w-4 h-4" style={{ color: C.disease }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: C.text }}>Observed Symptoms</h3>
            </div>
            <ul className="space-y-2.5">
              {R.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: C.diseaseLight }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.disease }}></div>
                  </div>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Affected areas + recovery */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.analyticsLight }}>
                <Target className="w-4 h-4" style={{ color: C.analytics }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: C.text }}>Affected Plant Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {R.areas.map(a => (
                <span key={a} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: C.analyticsLight, color: C.analytics }}>{a}</span>
              ))}
            </div>
            <div className="pt-4 border-t" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <span className="text-xs font-semibold" style={{ color: C.text }}>Expected Recovery</span>
              </div>
              <p className="text-sm" style={{ color: C.textMuted }}>{R.recovery}</p>
            </div>
          </div>

          {/* Treatment */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.healthyLight }}>
                <FlaskConical className="w-4 h-4" style={{ color: C.primary }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: C.text }}>Recommended Treatment</h3>
            </div>
            <ul className="space-y-2.5">
              {R.treatment.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.primary }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
                <Shield className="w-4 h-4" style={{ color: "#16a34a" }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: C.text }}>Preventive Measures</h3>
            </div>
            <ul className="space-y-2.5">
              {R.prevention.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  <div className="w-4 h-4 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Warning banner */}
        <div className="rounded-2xl p-5 mb-6 flex items-start gap-3 border" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Immediate Action Required</p>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              Powdery mildew spreads rapidly under warm, humid conditions (20–27 °C, RH 40–70%). Begin treatment within 48 hours to prevent spread to neighbouring plants. Isolate severely infected specimens.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: C.primary }}>
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white border transition-all hover:bg-gray-50" style={{ borderColor: C.border, color: C.text }}>
            <Share2 className="w-4 h-4" />
            Share Report
          </button>
          <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white border transition-all hover:bg-gray-50" style={{ borderColor: C.border, color: C.text }} onClick={() => set("landing")}>
            <RefreshCw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 5: Analytics ────────────────────────────────────────────────────────
function AnalyticsPage({ set }: { set: (p: Page) => void }) {
  const [trainTab, setTrainTab] = useState<"accuracy" | "loss">("accuracy");

  const stats = [
    { label:"Total Images",      val:"7,164", icon: Database,    bg: C.analyticsLight, ic: C.analytics, badge: "4 Sources" },
    { label:"Healthy Samples",   val:"2,127", icon: CheckCircle2,bg: C.healthyLight,   ic: C.primary,   badge: "29.7%"    },
    { label:"Diseased Samples",  val:"5,037", icon: AlertTriangle,bg:C.diseaseLight,   ic: C.disease,   badge: "70.3%"    },
    { label:"Combined Datasets", val:"4",     icon: Layers,       bg: "#f3e8ff",        ic: "#7c3aed",   badge: "Merged"   },
  ];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: C.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: C.analyticsLight, color: C.analytics }}>Research Mode</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.text }}>Research &amp; Model Analytics</h1>
            <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Comprehensive performance metrics for ViT Base Patch16 224</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: C.primary, boxShadow: `0 4px 14px ${C.primary}40` }}>
            <Cpu className="w-4 h-4" />
            Deploy ViT Model
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <s.icon className="w-4 h-4" style={{ color: s.ic }} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.ic }}>{s.badge}</span>
              </div>
              <p className="text-2xl font-extrabold mb-0.5" style={{ color: C.text }}>{s.val}</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Dataset Distribution + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <div className="lg:col-span-3 bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Dataset Distribution</h3>
            <p className="text-xs mt-0.5 mb-4" style={{ color: C.textMuted }}>Sample count per disease class across all merged datasets</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datasetDist} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: C.textMuted }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {datasetDist.map((_, i) => <Cell key={i} fill={diseaseColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Disease Distribution</h3>
            <p className="text-xs mt-0.5 mb-4" style={{ color: C.textMuted }}>Percentage breakdown of disease classes</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={72} innerRadius={38}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training curves */}
        <div className="bg-white rounded-2xl border p-6 mb-5" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: C.text }}>Training Performance</h3>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>20 epochs on ViT Base Patch16 224 — ImageNet pretrained</p>
            </div>
            <div className="flex gap-0.5 p-1 rounded-lg bg-gray-100">
              {(["accuracy","loss"] as const).map(t => (
                <button key={t} onClick={() => setTrainTab(t)}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
                  style={trainTab === t ? { backgroundColor:"#fff", color: C.text, boxShadow:"0 1px 3px rgba(0,0,0,0.1)" } : { color: C.textMuted }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }}
                domain={trainTab === "accuracy" ? [0.4, 1] : [0.2, 2]}
                tickFormatter={v => trainTab === "accuracy" ? `${(v*100).toFixed(0)}%` : v.toFixed(2)} />
              <Tooltip formatter={(v: number, name: string) => [
                trainTab === "accuracy" ? `${(v*100).toFixed(1)}%` : v.toFixed(3),
                name.includes("train") ? "Training" : "Validation",
              ]} />
              <Legend formatter={v => v.includes("train") ? "Training" : "Validation"} iconType="plainline" wrapperStyle={{ fontSize:"11px" }} />
              {trainTab === "accuracy" ? (
                <>
                  <Line type="monotone" dataKey="trainAcc" stroke={C.primary} strokeWidth={2.5} dot={false} name="trainAcc" />
                  <Line type="monotone" dataKey="valAcc"   stroke={C.healthy} strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="valAcc" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="trainLoss" stroke={C.disease}  strokeWidth={2.5} dot={false} name="trainLoss" />
                  <Line type="monotone" dataKey="valLoss"   stroke="#f59e0b" strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="valLoss" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t" style={{ borderColor: C.border }}>
            {[
              { label:"Train Accuracy", val:"94.1%", color: C.primary  },
              { label:"Val Accuracy",   val:"88.9%", color: C.healthy  },
              { label:"Train Loss",     val:"0.280", color: C.disease  },
              { label:"Val Loss",       val:"0.380", color: "#f59e0b"  },
            ].map(m => (
              <div key={m.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.val}</p>
                <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix + ROC */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <div className="lg:col-span-3 bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Confusion Matrix</h3>
            <p className="text-xs mt-0.5 mb-5" style={{ color: C.textMuted }}>Validation set — deeper colour = higher count</p>
            <div className="overflow-auto">
              <div className="min-w-[380px]">
                <div className="grid gap-[3px]" style={{ gridTemplateColumns: "72px repeat(5, 1fr)" }}>
                  <div />
                  {confLabels.map(l => (
                    <div key={l} className="text-center text-[10px] font-semibold px-0.5 pb-1" style={{ color: C.textMuted }}>{l}</div>
                  ))}
                  {confMatrix.map((row, i) => (
                    <div key={i} className="contents">
                      <div className="text-[10px] font-semibold text-right pr-2 flex items-center justify-end" style={{ color: C.textMuted, minHeight: "38px" }}>
                        {confLabels[i]}
                      </div>
                      {row.map((val, j) => {
                        const isDiag = i === j;
                        const intensity = val / 418;
                        const bg = isDiag
                          ? `rgba(44,95,45,${0.12 + intensity * 0.72})`
                          : val > 8 ? `rgba(176,58,46,${0.08 + intensity * 0.85})` : `rgba(209,213,219,${0.3 + intensity * 1.2})`;
                        const textCol = (isDiag && intensity > 0.38) || (!isDiag && val > 8) ? "#fff" : C.text;
                        return (
                          <div key={j} className="flex items-center justify-center rounded-lg text-xs font-bold transition-transform hover:scale-105 cursor-default"
                            style={{ backgroundColor: bg, color: textCol, height: "38px" }}>
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div />
                  <div className="col-span-5 text-center text-[10px] pt-2 font-medium" style={{ color: C.textMuted }}>Predicted Labels →</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>ROC Curve</h3>
            <p className="text-xs mt-0.5 mb-1" style={{ color: C.textMuted }}>Macro-average · <span className="font-bold text-[#1A5276]">AUC = 0.974</span></p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={rocData}>
                <defs>
                  <linearGradient id="rocg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.analytics} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.analytics} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fpr" tick={{ fontSize:10, fill:C.textMuted }} tickFormatter={v => v.toFixed(1)} label={{ value:"FPR", position:"insideBottom", offset:-2, style:{ fontSize:10, fill:C.textMuted } }} />
                <YAxis tick={{ fontSize:10, fill:C.textMuted }} tickFormatter={v => v.toFixed(1)} />
                <Tooltip formatter={(v: number) => v.toFixed(3)} />
                <Area type="monotone" dataKey="tpr" stroke={C.analytics} fill="url(#rocg)" strokeWidth={2.5} name="TPR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threshold + PR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Threshold Analysis</h3>
            <p className="text-xs mt-0.5 mb-5" style={{ color: C.textMuted }}>Precision, Recall, F1 across decision thresholds</p>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={thresholdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="threshold" tick={{ fontSize:10, fill:C.textMuted }} />
                <YAxis tick={{ fontSize:10, fill:C.textMuted }} domain={[0.4,1]} tickFormatter={v => v.toFixed(1)} />
                <Tooltip formatter={(v: number) => v.toFixed(3)} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize:"11px" }} />
                <Line type="monotone" dataKey="precision" stroke={C.analytics} strokeWidth={2}   dot={false} name="Precision" />
                <Line type="monotone" dataKey="recall"    stroke={C.disease}   strokeWidth={2}   dot={false} name="Recall"    />
                <Line type="monotone" dataKey="f1"        stroke={C.primary}   strokeWidth={2.5} dot={false} name="F1 Score"  />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Precision-Recall Curve</h3>
            <p className="text-xs mt-0.5 mb-5" style={{ color: C.textMuted }}>Macro-average · <span className="font-bold" style={{ color: C.primary }}>AUC-PR = 0.891</span></p>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={prData}>
                <defs>
                  <linearGradient id="prg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.primary} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="recall" tick={{ fontSize:10, fill:C.textMuted }} label={{ value:"Recall", position:"insideBottom", offset:-2, style:{ fontSize:10, fill:C.textMuted } }} />
                <YAxis tick={{ fontSize:10, fill:C.textMuted }} domain={[0.6,1]} tickFormatter={v => v.toFixed(1)} />
                <Tooltip formatter={(v: number) => v.toFixed(3)} />
                <Area type="monotone" dataKey="precision" stroke={C.primary} fill="url(#prg)" strokeWidth={2.5} name="Precision" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation + Deployment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: C.analyticsLight, borderColor: `${C.analytics}28` }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                <Target className="w-4 h-4" style={{ color: C.analytics }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: C.analytics }}>Recommendation Card</h3>
            </div>
            <div className="flex items-end justify-between mb-3">
              <p className="text-sm" style={{ color: C.analytics }}>Recommended Threshold</p>
              <p className="text-4xl font-black" style={{ color: C.analytics }}>0.30</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60">
              <p className="text-xs leading-relaxed" style={{ color: C.analytics }}>
                <span className="font-bold">Reason:</span> Reducing False Negatives is critical for early disease detection. A threshold of 0.30 ensures potentially diseased plants are not misclassified as healthy, enabling timely agricultural intervention.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-6 border" style={{ backgroundColor: C.healthyLight, borderColor: `${C.healthy}45` }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                <Cpu className="w-4 h-4" style={{ color: C.primary }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: C.primary }}>Deployment Card</h3>
            </div>
            <div className="space-y-2.5 mb-5">
              {[
                ["Model",              "Vision Transformer (ViT)"],
                ["Architecture",       "ViT Base Patch16 224"    ],
                ["Status",             "Production Ready"        ],
                ["Best Val Accuracy",  "88.9%"                   ],
                ["Inference Time",     "~1.4 s / image"          ],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: C.primary }}>{k}</span>
                  {v === "Production Ready" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.primary }}>
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse-dot"></span>
                      {v}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: C.text }}>{v}</span>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: C.primary, boxShadow: `0 4px 14px ${C.primary}40` }}>
              <Cpu className="w-4 h-4" />
              Deploy ViT Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState<Page>("landing");
  const [image, setImage]     = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url);
    setAnalyzing(true);
    setPage("detection");
    setTimeout(() => setAnalyzing(false), 3400);
  }, []);

  const handleSetPage = useCallback((p: Page) => {
    if (p === "detection") {
      // Direct nav to detection — show completed demo state
      setAnalyzing(false);
    }
    setPage(p);
  }, []);

  const handleLandingSet = useCallback((p: Page) => {
    if (p === "detection") {
      // "View Demo" button — run demo animation
      setImage(null);
      setAnalyzing(true);
      setPage("detection");
      setTimeout(() => setAnalyzing(false), 3400);
    } else {
      setPage(p);
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: C.bg }}>
      <GlobalStyles />
      <Navigation current={page} set={handleSetPage} />
      {page === "landing"        && <LandingPage         set={handleLandingSet} onUpload={handleUpload} />}
      {page === "detection"      && <DetectionPage        set={handleSetPage}   analyzing={analyzing}   image={image} />}
      {page === "explainability" && <ExplainabilityPage  set={handleSetPage} />}
      {page === "report"         && <ReportPage          set={handleSetPage} />}
      {page === "analytics"      && <AnalyticsPage       set={handleSetPage} />}
    </div>
  );
}
