import React, { useState, useEffect, useCallback } from "react";
import {
  type ColorInfo,
  type HarmonyMode,
  generatePalette,
  hexToHsl,
} from "./utils/colorUtils";
import { ColorSwatch } from "./components/ColorSwatch";
import { HarmonyPicker } from "./components/HarmonyPicker";
import "./App.css";

const MIN_COLORS = 2;
const MAX_COLORS = 8;

function App() {
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("random");
  const [colorCount, setColorCount] = useState(5);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [history, setHistory] = useState<ColorInfo[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const pushHistory = useCallback(
    (newPalette: ColorInfo[]) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, newPalette];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  const generate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      const newPalette = generatePalette(colorCount, harmonyMode, palette);
      setPalette(newPalette);
      pushHistory(newPalette);
      setGenerating(false);
    }, 60);
  }, [colorCount, harmonyMode, palette, pushHistory]);

  // Initial generation
  useEffect(() => {
    const initial = generatePalette(5, "random");
    setPalette(initial);
    setHistory([initial]);
    setHistoryIndex(0);
  }, []);

  // Spacebar to generate
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [generate]);

  const handleToggleLock = (id: string) => {
    setPalette((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)),
    );
  };

  const handleColorChange = (id: string, hex: string) => {
    setPalette((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              hex,
              hsl: hexToHsl(hex),
              rgb: {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16),
              },
            }
          : c,
      ),
    );
  };

  const handleRemove = (id: string) => {
    if (palette.length <= MIN_COLORS) return;
    setPalette((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddColor = () => {
    if (palette.length >= MAX_COLORS) return;
    const [newColor] = generatePalette(1, harmonyMode);
    setPalette((prev) => [...prev, newColor]);
  };

  const handleCountChange = (count: number) => {
    setColorCount(count);
    const newPalette = generatePalette(count, harmonyMode, palette);
    setPalette(newPalette);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setPalette(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setPalette(history[historyIndex + 1]);
    }
  };

  const handleHarmonyChange = (mode: HarmonyMode) => {
    setHarmonyMode(mode);
    const newPalette = generatePalette(palette.length, mode, palette);
    setPalette(newPalette);
    pushHistory(newPalette);
  };

  const getExportText = () => {
    const lines = [
      "/* Color Palette Export */",
      ":root {",
      ...palette.map(
        (c, i) =>
          `  --color-${i + 1}: ${c.hex.toUpperCase()}; /* HSL(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%) */`,
      ),
      "}",
      "",
      "/* HEX values */",
      ...palette.map((c) => c.hex.toUpperCase()),
    ];
    return lines.join("\n");
  };

  const handleExportCopy = async () => {
    await navigator.clipboard.writeText(getExportText());
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const lockedCount = palette.filter((c) => c.locked).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="logo-text">
              <h1>Palette</h1>
              <span className="logo-sub">Studio</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <HarmonyPicker
            selected={harmonyMode}
            onChange={handleHarmonyChange}
          />
        </div>

        <div className="header-right">
          <div className="count-control">
            <button
              className="count-btn"
              onClick={() =>
                handleCountChange(Math.max(MIN_COLORS, palette.length - 1))
              }
              disabled={palette.length <= MIN_COLORS}
              aria-label="Remove color"
            >
              −
            </button>
            <span className="count-display">{palette.length}</span>
            <button
              className="count-btn"
              onClick={() =>
                handleCountChange(Math.min(MAX_COLORS, palette.length + 1))
              }
              disabled={palette.length >= MAX_COLORS}
              aria-label="Add color"
            >
              +
            </button>
          </div>

          <div className="history-controls">
            <button
              className="icon-btn"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo"
              aria-label="Undo"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="9 14 4 9 9 4" />
                <path d="M20 20v-7a4 4 0 00-4-4H4" />
              </svg>
            </button>
            <button
              className="icon-btn"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
              aria-label="Redo"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="15 14 20 9 15 4" />
                <path d="M4 20v-7a4 4 0 014-4h12" />
              </svg>
            </button>
          </div>

          <button
            className="export-btn"
            onClick={() => setExportOpen(true)}
            aria-label="Export palette"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </header>

      {/* Palette */}
      <main className="palette-area">
        <div
          className={`palette-grid count-${palette.length} ${generating ? "generating" : ""}`}
        >
          {palette.map((color) => (
            <ColorSwatch
              key={color.id}
              color={color}
              onToggleLock={handleToggleLock}
              onColorChange={handleColorChange}
              onRemove={handleRemove}
              canRemove={palette.length > MIN_COLORS}
            />
          ))}
          {palette.length < MAX_COLORS && (
            <button
              className="add-swatch-btn"
              onClick={handleAddColor}
              aria-label="Add new color"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </main>

      {/* Generate Button */}
      <div className="generate-bar">
        {lockedCount > 0 && (
          <div className="locked-info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {lockedCount} color{lockedCount > 1 ? "s" : ""} locked
          </div>
        )}
        <button
          className={`generate-btn ${generating ? "spinning" : ""}`}
          onClick={generate}
          id="generate-btn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Generate Palette
        </button>
        <span className="spacebar-hint">
          or press <kbd>Space</kbd>
        </span>
      </div>

      {/* Export Modal */}
      {exportOpen && (
        <div className="modal-overlay" onClick={() => setExportOpen(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Export palette"
          >
            <div className="modal-header">
              <h2>Export Palette</h2>
              <button
                className="modal-close"
                onClick={() => setExportOpen(false)}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="export-swatches">
              {palette.map((c) => (
                <div
                  key={c.id}
                  className="export-swatch"
                  style={{ background: c.hex }}
                  title={c.hex}
                />
              ))}
            </div>

            <pre className="export-code">{getExportText()}</pre>

            <div className="export-formats">
              <div className="format-chips">
                {palette.map((c, i) => (
                  <div key={c.id} className="format-chip">
                    <div className="chip-dot" style={{ background: c.hex }} />
                    <span>{c.hex.toUpperCase()}</span>
                    <span className="chip-hsl">
                      hsl({c.hsl.h}, {c.hsl.s}%, {c.hsl.l}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="copy-export-btn"
              onClick={handleExportCopy}
              id="copy-export-btn"
            >
              {exportCopied ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy CSS Variables
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
