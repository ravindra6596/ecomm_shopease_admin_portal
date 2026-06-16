'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TextEditor({ value, onChange, className, placeholder }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync external value into editor when it changes from outside
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el !== document.activeElement && el.innerHTML !== value) {
      el.innerHTML = value;
      setLocalValue(value);
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    setLocalValue(html);
    onChange(html);
  }, [onChange]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const execCommand = useCallback((command: string, value?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('insertParagraph', false);
      handleInput();
    }
  }, [handleInput]);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const linesToHtml = (lines: string[]) => {
    const trimmedLines = lines.map((line) => line.trim());
    const unordered = trimmedLines.every((line) => /^([-*+])\s+/.test(line));
    const ordered = trimmedLines.every((line) => /^\d+\.\s+/.test(line));

    if (unordered || ordered) {
      const tag = unordered ? 'ul' : 'ol';
      const items = trimmedLines
        .map((line) => line.replace(/^([-*+]|\d+\.)\s+/, ''))
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('');
      return `<${tag}>${items}</${tag}>`;
    }

    return trimmedLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const segments: string[][] = [];
    let currentSegment: string[] = [];

    text.split(/\r?\n/).forEach((line) => {
      if (line.trim() === '') {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = [];
        }
      } else {
        currentSegment.push(line);
      }
    });

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    const html = segments.map(linesToHtml).join('');
    document.execCommand('insertHTML', false, html);
    handleInput();
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    execCommand('createLink', url);
  }, [execCommand]);

  const applyTextAlign = useCallback((alignment: string) => {
    execCommand('justify' + alignment);
  }, [execCommand]);

  const btnClass = (active: boolean) => cn(
    'inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
    active
      ? 'bg-sky-500/20 text-sky-400'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
  );

  const iconSx = { width: '14px', height: '14px' };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1 rounded-t-xl border border-white/10 bg-slate-900/60 p-1.5',
          isFocused && 'border-sky-500/30'
        )}
      >
        <button type="button" onClick={() => execCommand('undo')} className={btnClass(false)} title="Undo">
          ↺
        </button>
        <button type="button" onClick={() => execCommand('redo')} className={btnClass(false)} title="Redo">
          ↻
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button type="button" onClick={() => execCommand('bold')} className={btnClass(false)} title="Bold">
          <b style={iconSx}>B</b>
        </button>
        <button type="button" onClick={() => execCommand('italic')} className={btnClass(false)} title="Italic">
          <i style={iconSx}>I</i>
        </button>
        <button type="button" onClick={() => execCommand('underline')} className={btnClass(false)} title="Underline">
          <u style={iconSx}>U</u>
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} className={btnClass(false)} title="Strikethrough">
          <s style={iconSx}>S</s>
        </button>
        <button type="button" onClick={() => execCommand('removeFormat')} className={btnClass(false)} title="Clear formatting">
          ✕
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className={btnClass(false)} title="Bullet List">
          •≡
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className={btnClass(false)} title="Numbered List">
          1≡
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')} className={btnClass(false)} title="Block quote">
          “
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'PRE')} className={btnClass(false)} title="Code block">
          {'</>'}
        </button>
        <button type="button" onClick={insertLink} className={btnClass(false)} title="Insert link">
          🔗
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button type="button" onClick={() => applyTextAlign('Left')} className={btnClass(false)} title="Align left">
          L
        </button>
        <button type="button" onClick={() => applyTextAlign('Center')} className={btnClass(false)} title="Align center">
          C
        </button>
        <button type="button" onClick={() => applyTextAlign('Right')} className={btnClass(false)} title="Align right">
          R
        </button>
        <button type="button" onClick={() => applyTextAlign('Full')} className={btnClass(false)} title="Justify">
          J
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <select
          onChange={(e) => {
            if (e.target.value) {
              document.execCommand('formatBlock', false, e.target.value);
              handleInput();
              e.target.value = '';
            }
          }}
          className="h-8 rounded-md border border-slate-600/50 bg-slate-900/80 px-2 text-xs text-slate-300 outline-none focus:border-sky-500/50"
          defaultValue=""
        >
          <option value="" disabled>Heading</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
          <option value="P">Paragraph</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Rich text editor"
        className={cn(
          'min-h-[160px] w-full rounded-b-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition-colors',
          isFocused ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'hover:border-white/20'
        )}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        spellCheck
      />
    </div>
  );
}