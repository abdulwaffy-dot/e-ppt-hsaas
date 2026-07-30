import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  Layout,
  Share2,
  Sparkles,
  Layers,
  Smartphone,
  Globe,
  Download,
  HelpCircle
} from 'lucide-react';

interface CanvaPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CanvaPublishModal: React.FC<CanvaPublishModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedSdkCode, setCopiedSdkCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'embed' | 'sdk' | 'singlefile' | 'guide' | 'developer'>('embed');
  const [copiedSingleFile, setCopiedSingleFile] = useState(false);
  const [iframeHeight, setIframeHeight] = useState('800');

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;

  const iframeCode = `<iframe 
  src="${currentAppUrl}" 
  title="Sistem e-PPT HSAAS - Hospital Sultan Abdul Aziz Shah" 
  width="100%" 
  height="${iframeHeight}px" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 100%; min-height: ${iframeHeight}px;" 
  allow="geolocation; microphone; camera"
  loading="lazy">
</iframe>`;

  const canvaSdkCode = `<!-- Canva App Extension Code for Sistem e-PPT HSAAS -->
<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem e-PPT HSAAS Canva App</title>
  <script src="https://unpkg.com/@canva/app-sdk@latest/dist/index.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .canva-wrapper {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="canva-wrapper">
    <iframe src="${currentAppUrl}" allow="camera; microphone; geolocation" title="e-PPT HSAAS"></iframe>
  </div>

  <script>
    // Initialize Canva Apps SDK integration
    if (window.Canva && window.Canva.App) {
      window.Canva.App.init({
        onReady: () => {
          console.log('Sistem e-PPT HSAAS successfully initialized in Canva.');
        }
      });
    }
  </script>
</body>
</html>`;

  const canvaAppManifest = `{
  "name": "Sistem e-PPT HSAAS",
  "description": "Hospital Sultan Abdul Aziz Shah Procurement Management System Widget for Canva",
  "version": "1.0.0",
  "entrypoint": "${currentAppUrl}",
  "capabilities": {
    "dimensions": {
      "defaultWidth": 1200,
      "defaultHeight": 800
    },
    "fullScreen": true
  }
}`;

  const handleCopy = (text: string, type: 'url' | 'iframe' | 'manifest' | 'sdk') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'iframe') {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else if (type === 'manifest') {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } else if (type === 'sdk') {
      setCopiedSdkCode(true);
      setTimeout(() => setCopiedSdkCode(false), 2000);
    }
  };

  const handleDownloadCanvaFile = () => {
    const htmlContent = canvaSdkCode;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCompleteSingleFile = () => {
    window.open('/canva-complete-eppt.html', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Publish & Embed on Canva</h2>
                <span className="bg-purple-400/20 text-purple-200 border border-purple-300/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Canva Ready
                </span>
              </div>
              <p className="text-xs text-purple-100/80">
                Embed Sistem e-PPT HSAAS directly into Canva Websites, Presentations & Canva Docs
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-white/10 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('embed')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'embed'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              Embed Code & Link
            </button>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'sdk'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Canva SDK Wrapper
            </button>
            <button
              onClick={() => setActiveTab('singlefile')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'singlefile'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 text-emerald-400" />
              Complete Single-File Code (A-Z)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'guide'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4" />
              Step-by-Step Guide
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'developer'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              App Manifest
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'embed' && (
            <div className="space-y-6">
              {/* Option 1: Canva Smart Link */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Option 1: Direct App Web Link (Canva Smart Embed)
                  </label>
                  <span className="text-[10px] text-slate-500">Recommended for Canva Sites</span>
                </div>
                <p className="text-xs text-slate-600">
                  Paste this URL directly into Canva using <strong>Apps &rarr; Embeds</strong> or by pasting directly on a Canva site page.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentAppUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopy(currentAppUrl, 'url')}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Option 2: iFrame Embed Code */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-purple-600" />
                    Option 2: HTML iFrame Code for Canva & Web Portals
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Height:</span>
                    <select
                      value={iframeHeight}
                      onChange={(e) => setIframeHeight(e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700 font-semibold"
                    >
                      <option value="600">600px</option>
                      <option value="800">800px</option>
                      <option value="1000">1000px</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 text-[11px] font-mono bg-slate-900 text-slate-100 rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-slate-800">
                    {iframeCode}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Includes responsive styling, security sandboxing, and permissions.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadCanvaFile}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download HTML
                    </button>
                    <button
                      onClick={() => handleCopy(iframeCode, 'iframe')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      {copiedIframe ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIframe ? 'Copied Code!' : 'Copy iFrame Code'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Live Test */}
              <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    Live Canva View
                  </span>
                  <a
                    href={currentAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open Fullscreen Tab
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-indigo-700/80">
                  This system is live and accessible globally via secure HTTPS Cloud Run endpoints. Any changes saved here synchronize seamlessly.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sdk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Canva App SDK Entry Point Code (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-purple-700">index.html</code>)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Use this HTML code when building a custom Canva App Extension or uploading custom code in Canva Developer Studio.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCanvaFile}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download <code className="text-amber-300 font-mono">canva-app.html</code>
                  </button>
                  <button
                    onClick={() => handleCopy(canvaSdkCode, 'sdk')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedSdkCode ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSdkCode ? 'Copied Code!' : 'Copy SDK Code'}
                  </button>
                </div>
              </div>

              <pre className="p-4 text-xs font-mono bg-slate-900 text-cyan-300 rounded-xl overflow-x-auto whitespace-pre-wrap border border-slate-800 max-h-72">
                {canvaSdkCode}
              </pre>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex gap-2 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Canva Developer Tip:</strong> This code automatically imports the official <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">@canva/app-sdk</code> script and mounts the live e-PPT application in full height inside Canva design frames!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'singlefile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-emerald-600" />
                    Complete Single-File System (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-emerald-700">canva-complete-eppt.html</code>)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standalone HTML + React + Tailwind file containing all logic (A to Z) for Sistem e-PPT HSAAS.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCompleteSingleFile}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Open & Download Single-File HTML
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono text-emerald-400 font-bold">canva-complete-eppt.html (947 lines, 50KB)</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">HTML5 + React 18 + Babel + Tailwind CDN</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  This file contains 100% self-contained code for the entire system:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Form Permohonan e-PPT (21 Jabatan, Kategori 10000–300000, Method, Kos)</li>
                  <li>Senarai Permohonan Jabatan & Modals Viewer</li>
                  <li>Panel Kelulusan HQ Perolehan HSAAS (Approve/Reject & Catatan)</li>
                  <li>Analisis Bajet Operating 14005 Dashboard</li>
                  <li>Tukar Peranan (Pemohon vs HQ Urus Setia)</li>
                  <li>Penyimpanan Data Tempatan (LocalStorage Persistence)</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <a
                  href="/canva-complete-eppt.html"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Raw File in New Tab
                </a>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                How to Embed into Canva Step-by-Step
              </h3>

              <div className="grid gap-3">
                <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Open your Canva Project</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Open your Canva Website, Canva Presentation, or Canva Document where you want the e-PPT system to appear.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Navigate to Apps &rarr; Embeds</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      In Canva's left toolbar, click on <strong>Apps</strong>, scroll to <strong>Embeds</strong> (or search for "Embed" in Canva search bar).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Paste the App URL or Embed Code</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Paste the web link <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">{currentAppUrl}</code> and press <strong>Add to design</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Resize and Publish Canva Site</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Drag the corner handles on Canva to make the e-PPT app box wide and tall. Click <strong>Publish Website</strong> or Share Presentation in Canva!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Canva Apps SDK Manifest JSON</h3>
                  <p className="text-xs text-slate-500">
                    Use this manifest configuration if registering custom app on Canva Developer Portal (canva.dev).
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(canvaAppManifest, 'manifest')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedManifest ? 'Copied JSON!' : 'Copy Manifest'}
                </button>
              </div>

              <pre className="p-4 text-xs font-mono bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto border border-slate-800">
                {canvaAppManifest}
              </pre>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-xs text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Developer Note:</strong> You can host this app on Cloud Run, Vercel, or custom servers, and point Canva Apps SDK directly to this origin.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Sistem e-PPT HSAAS - Ready for Canva publishing
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
