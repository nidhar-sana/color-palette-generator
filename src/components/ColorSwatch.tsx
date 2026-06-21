import React, { useState, useRef } from "react";
import {
  // ColorInfo,
  getContrastColor,
  // hslToHex,
  // hexToHsl,
  isValidHex,
  type ColorInfo,
} from "../utils/colorUtils";

interface ColorSwatchProps {
  color: ColorInfo;
  onToggleLock: (id: string) => void;
  onColorChange: (id: string, hex: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  onToggleLock,
  onColorChange,
  onRemove,
  canRemove,
}) => {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(color.hex);
  const inputRef = useRef<HTMLInputElement>(null);
  const contrastColor = getContrastColor(color.hex);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(color.hex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleHexClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditValue(color.hex);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    setEditValue(val);
    if (isValidHex(val)) {
      onColorChange(color.id, val);
    }
  };

  const handleHexBlur = () => {
    setEditing(false);
    if (!isValidHex(editValue)) {
      setEditValue(color.hex);
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setEditing(false);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(color.id, e.target.value);
    setEditValue(e.target.value);
  };

  const { h, s, l } = color.hsl;

  return (
    <div
      className="color-swatch"
      style={{ backgroundColor: color.hex }}
      role="group"
      aria-label={`Color swatch ${color.hex}`}
    >
      <div className="swatch-actions" style={{ color: contrastColor }}>
        {canRemove && (
          <button
            className="swatch-btn remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(color.id);
            }}
            title="Remove color"
            aria-label="Remove color"
            style={{ color: contrastColor, borderColor: `${contrastColor}40` }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          className={`swatch-btn lock-btn ${color.locked ? "locked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(color.id);
          }}
          title={color.locked ? "Unlock color" : "Lock color"}
          aria-label={color.locked ? "Unlock color" : "Lock color"}
          style={{ color: contrastColor, borderColor: `${contrastColor}40` }}
        >
          {color.locked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 019.9-1" />
            </svg>
          )}
        </button>
      </div>

      <div className="swatch-center">
        <label className="color-picker-label" title="Pick color">
          <input
            type="color"
            value={color.hex}
            onChange={handleColorPickerChange}
            className="color-picker-native"
            aria-label="Color picker"
          />
          <div
            className="color-picker-icon"
            style={{ color: contrastColor, borderColor: `${contrastColor}30` }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
            </svg>
          </div>
        </label>
      </div>

      <div className="swatch-info" style={{ color: contrastColor }}>
        <div className="swatch-hex-row">
          {editing ? (
            <input
              ref={inputRef}
              className="hex-edit-input"
              value={editValue}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              onKeyDown={handleHexKeyDown}
              maxLength={7}
              style={{
                color: contrastColor,
                borderColor: `${contrastColor}50`,
                background: `${contrastColor}15`,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="swatch-hex"
              onClick={handleHexClick}
              title="Click to edit hex"
            >
              {color.hex.toUpperCase()}
            </span>
          )}
          <button
            className="copy-btn"
            onClick={handleCopy}
            title="Copy hex code"
            aria-label="Copy hex code"
            style={{ color: contrastColor }}
          >
            {copied ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
        <div className="swatch-hsl" style={{ color: `${contrastColor}90` }}>
          {h}° {s}% {l}%
        </div>
        <div className="swatch-rgb" style={{ color: `${contrastColor}70` }}>
          {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
        </div>
      </div>

      {color.locked && (
        <div
          className="lock-indicator"
          style={{ background: `${contrastColor}20` }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill={contrastColor}>
            <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
            <path
              d="M7 11V7a5 5 0 0110 0v4"
              fill="none"
              stroke={contrastColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ color: contrastColor }}>Locked</span>
        </div>
      )}
    </div>
  );
};
