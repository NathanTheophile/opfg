import {
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  GripVertical,
  History,
  Import,
  LayoutGrid,
  PanelLeftClose,
  PanelRightClose,
  RotateCcw,
  Save,
  Search,
  Shuffle,
  SlidersHorizontal,
  Snowflake,
  Undo2,
  Wrench,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  UI_TUNER_DEFAULT_VALUES,
  UI_TUNER_DEFINITIONS,
  UI_TUNER_QUICK_PRESETS,
  UI_TUNER_SECTIONS,
  type UITunerDefinition,
  type UITunerRangeDefinition,
  type UITunerSectionId,
  type UITunerValues,
} from './uiTunerConfig';
import './ui-tuner.css';

const STORAGE_VALUES = 'opfg.uiTuner.values.v1';
const STORAGE_PRESETS = 'opfg.uiTuner.presets.v1';
const STORAGE_UI = 'opfg.uiTuner.ui.v1';

type PresetSlot = 'A' | 'B' | 'C' | 'D';

type StoredPreset = {
  savedAt: number;
  values: UITunerValues;
};

type Presets = Record<PresetSlot, StoredPreset | null>;

type TunerUiState = {
  dock: 'left' | 'right';
  width: number;
  opacity: number;
};

const EMPTY_PRESETS: Presets = {
  A: null,
  B: null,
  C: null,
  D: null,
};

const DEFAULT_UI_STATE: TunerUiState = {
  dock: 'left',
  width: 390,
  opacity: 0.96,
};

function safeParse<T>(
  key: string,
  fallback: T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizedStoredValues(
  stored: Partial<UITunerValues> | null,
): UITunerValues {
  const next = { ...UI_TUNER_DEFAULT_VALUES };

  if (!stored) return next;

  for (const definition of UI_TUNER_DEFINITIONS) {
    const value = stored[definition.id];

    if (definition.kind === 'range') {
      if (typeof value === 'number' && Number.isFinite(value)) {
        next[definition.id] = Math.max(
          definition.min,
          Math.min(definition.max, value),
        );
      }
    } else if (typeof value === 'string') {
      next[definition.id] = value;
    }
  }

  return next;
}

function serializeValue(
  definition: UITunerDefinition,
  value: number | string,
): string {
  if (definition.kind === 'color') {
    return String(value);
  }

  return `${value}${definition.unit}`;
}

function applyValues(
  values: UITunerValues,
): void {
  const root = document.documentElement;

  for (const definition of UI_TUNER_DEFINITIONS) {
    const value = values[definition.id];

    if (value === undefined) continue;

    root.style.setProperty(
      definition.variable,
      serializeValue(definition, value),
    );
  }
}

function removeRuntimeOverrides(): void {
  const root = document.documentElement;

  for (const definition of UI_TUNER_DEFINITIONS) {
    root.style.removeProperty(definition.variable);
  }
}

function cssExport(
  values: UITunerValues,
): string {
  const lines = UI_TUNER_DEFINITIONS.map((definition) => {
    const value = values[definition.id];

    return `  ${definition.variable}: ${serializeValue(
      definition,
      value,
    )};`;
  });

  return `:root {\n${lines.join('\n')}\n}\n`;
}

function jsonExport(
  values: UITunerValues,
): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      values,
    },
    null,
    2,
  );
}

function downloadText(
  filename: string,
  contents: string,
  type: string,
): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function roundToStep(
  value: number,
  definition: UITunerRangeDefinition,
): number {
  const precision =
    String(definition.step).split('.')[1]?.length ?? 0;
  const rounded =
    Math.round(value / definition.step) * definition.step;

  return Number(rounded.toFixed(precision));
}

function clampRange(
  value: number,
  definition: UITunerRangeDefinition,
): number {
  return roundToStep(
    Math.max(
      definition.min,
      Math.min(definition.max, value),
    ),
    definition,
  );
}

export function UITuner() {
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState<
    Set<UITunerSectionId>
  >(
    () =>
      new Set<UITunerSectionId>([
        'foundation',
        'hud',
      ]),
  );

  const [values, setValues] = useState<UITunerValues>(() =>
    normalizedStoredValues(
      safeParse<Partial<UITunerValues> | null>(
        STORAGE_VALUES,
        null,
      ),
    ),
  );

  const [presets, setPresets] = useState<Presets>(() =>
    safeParse<Presets>(STORAGE_PRESETS, EMPTY_PRESETS),
  );

  const [ui, setUi] = useState<TunerUiState>(() =>
    safeParse<TunerUiState>(
      STORAGE_UI,
      DEFAULT_UI_STATE,
    ),
  );

  const [debugLayout, setDebugLayout] = useState(false);
  const [debugHitboxes, setDebugHitboxes] = useState(false);
  const [freezeMotion, setFreezeMotion] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const undoRef = useRef<UITunerValues[]>([]);
  const redoRef = useRef<UITunerValues[]>([]);
  const dragStartValuesRef = useRef<UITunerValues | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = useCallback((text: string) => {
    setNotice(text);

    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 1500);
  }, []);

  const remember = useCallback(
    (previous: UITunerValues) => {
      undoRef.current = [
        ...undoRef.current.slice(-59),
        previous,
      ];
      redoRef.current = [];
    },
    [],
  );

  const replaceValues = useCallback(
    (
      next: UITunerValues,
      options?: {
        remember?: boolean;
        notice?: string;
      },
    ) => {
      setValues((current) => {
        if (options?.remember !== false) {
          remember(current);
        }

        return normalizedStoredValues(next);
      });

      if (options?.notice) {
        showNotice(options.notice);
      }
    },
    [remember, showNotice],
  );

  const patchValues = useCallback(
    (
      patch: Partial<UITunerValues>,
      noticeText?: string,
    ) => {
      setValues((current) => {
        remember(current);

        return normalizedStoredValues({
          ...current,
          ...patch,
        });
      });

      if (noticeText) {
        showNotice(noticeText);
      }
    },
    [remember, showNotice],
  );

  useEffect(() => {
    applyValues(values);
    window.localStorage.setItem(
      STORAGE_VALUES,
      JSON.stringify(values),
    );
  }, [values]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_PRESETS,
      JSON.stringify(presets),
    );
  }, [presets]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_UI,
      JSON.stringify(ui),
    );
  }, [ui]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle(
      'opfg-ui-debug-layout',
      debugLayout,
    );
    root.classList.toggle(
      'opfg-ui-debug-hitboxes',
      debugHitboxes,
    );
    root.classList.toggle(
      'opfg-ui-freeze-motion',
      freezeMotion,
    );

    return () => {
      root.classList.remove(
        'opfg-ui-debug-layout',
        'opfg-ui-debug-hitboxes',
        'opfg-ui-freeze-motion',
      );
    };
  }, [debugHitboxes, debugLayout, freezeMotion]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.code === 'KeyU'
      ) {
        event.preventDefault();
        setVisible((current) => !current);
        return;
      }

      if (!visible) return;

      const target = event.target;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (event.key === 'Escape' && !editing) {
        setCollapsed(true);
        return;
      }

      if (
        event.ctrlKey &&
        !event.shiftKey &&
        event.code === 'KeyZ' &&
        !editing
      ) {
        event.preventDefault();

        setValues((current) => {
          const previous = undoRef.current.pop();
          if (!previous) return current;

          redoRef.current.push(current);
          return previous;
        });
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.code === 'KeyZ' &&
        !editing
      ) {
        event.preventDefault();

        setValues((current) => {
          const next = redoRef.current.pop();
          if (!next) return current;

          undoRef.current.push(current);
          return next;
        });
      }
    };

    window.addEventListener('keydown', keydown);

    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, [visible]);

  useEffect(
    () => () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    },
    [],
  );

  const filteredBySection = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return Object.fromEntries(
      UI_TUNER_SECTIONS.map((section) => [
        section.id,
        UI_TUNER_DEFINITIONS.filter(
          (definition) =>
            definition.section === section.id &&
            (!normalizedSearch ||
              definition.label
                .toLowerCase()
                .includes(normalizedSearch) ||
              definition.id
                .toLowerCase()
                .includes(normalizedSearch) ||
              definition.variable
                .toLowerCase()
                .includes(normalizedSearch)),
        ),
      ]),
    ) as Record<UITunerSectionId, UITunerDefinition[]>;
  }, [search]);

  const dirtyCount = useMemo(
    () =>
      UI_TUNER_DEFINITIONS.filter(
        (definition) =>
          values[definition.id] !==
          definition.defaultValue,
      ).length,
    [values],
  );

  const resetAll = () => {
    replaceValues(
      { ...UI_TUNER_DEFAULT_VALUES },
      {
        notice: 'Valeurs par défaut restaurées',
      },
    );
  };

  const resetSection = (
    sectionId: UITunerSectionId,
  ) => {
    const patch: Partial<UITunerValues> = {};

    for (const definition of UI_TUNER_DEFINITIONS) {
      if (definition.section === sectionId) {
        patch[definition.id] = definition.defaultValue;
      }
    }

    patchValues(
      patch,
      `${UI_TUNER_SECTIONS.find(
        ({ id }) => id === sectionId,
      )?.label ?? sectionId} reset`,
    );
  };

  const randomizeSection = (
    sectionId: UITunerSectionId,
  ) => {
    const patch: Partial<UITunerValues> = {};

    for (const definition of UI_TUNER_DEFINITIONS) {
      if (
        definition.section !== sectionId ||
        definition.kind !== 'range'
      ) {
        continue;
      }

      const current = Number(values[definition.id]);
      const span = definition.max - definition.min;
      const jitter = span * 0.075;
      const random =
        current + (Math.random() * 2 - 1) * jitter;

      patch[definition.id] = clampRange(
        random,
        definition,
      );
    }

    patchValues(
      patch,
      `Variation ${UI_TUNER_SECTIONS.find(
        ({ id }) => id === sectionId,
      )?.label ?? sectionId}`,
    );
  };

  const undo = () => {
    setValues((current) => {
      const previous = undoRef.current.pop();
      if (!previous) {
        showNotice('Rien à annuler');
        return current;
      }

      redoRef.current.push(current);
      return previous;
    });
  };

  const redo = () => {
    setValues((current) => {
      const next = redoRef.current.pop();
      if (!next) {
        showNotice('Rien à rétablir');
        return current;
      }

      undoRef.current.push(current);
      return next;
    });
  };

  const savePreset = (slot: PresetSlot) => {
    setPresets((current) => ({
      ...current,
      [slot]: {
        savedAt: Date.now(),
        values: { ...values },
      },
    }));

    showNotice(`Preset ${slot} sauvegardé`);
  };

  const loadPreset = (slot: PresetSlot) => {
    const preset = presets[slot];

    if (!preset) {
      showNotice(`Preset ${slot} vide`);
      return;
    }

    replaceValues(preset.values, {
      notice: `Preset ${slot} chargé`,
    });
  };

  const previewDefaults = () => {
    applyValues(UI_TUNER_DEFAULT_VALUES);
  };

  const restoreCurrentPreview = () => {
    applyValues(values);
  };

  const copyCss = async () => {
    await navigator.clipboard.writeText(
      cssExport(values),
    );
    showNotice('CSS copié');
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(
      jsonExport(values),
    );
    showNotice('JSON copié');
  };

  const importJsonFile = async (
    file: File | undefined,
  ) => {
    if (!file) return;

    try {
      const parsed = JSON.parse(
        await file.text(),
      ) as {
        values?: Partial<UITunerValues>;
      };

      if (!parsed.values) {
        throw new Error('No values');
      }

      replaceValues(
        normalizedStoredValues(parsed.values),
        {
          notice: 'Preset importé',
        },
      );
    } catch {
      showNotice('JSON invalide');
    }
  };

  const clearRuntimeOverrides = () => {
    remember(values);
    removeRuntimeOverrides();
    setValues({ ...UI_TUNER_DEFAULT_VALUES });
    showNotice('Overrides runtime supprimés');
  };

  if (!visible) {
    return (
      <button
        type="button"
        data-opfg-ui-tuner
        className="opfg-ui-tuner-launcher"
        onClick={() => setVisible(true)}
        title="UI Tuner — Ctrl+Shift+U"
      >
        <Wrench className="size-4" />
      </button>
    );
  }

  if (collapsed) {
    return (
      <div
        data-opfg-ui-tuner
        className={`opfg-ui-tuner-mini is-${ui.dock}`}
      >
        <button
          type="button"
          className="opfg-ui-tuner-mini__button"
          onClick={() => setCollapsed(false)}
        >
          <SlidersHorizontal className="size-4" />
          UI Tuner
          {dirtyCount > 0 && (
            <span>{dirtyCount}</span>
          )}
        </button>

        <button
          type="button"
          className="opfg-ui-tuner-mini__close"
          onClick={() => setVisible(false)}
          aria-label="Masquer le tuner"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      data-opfg-ui-tuner
      className={`opfg-ui-tuner is-${ui.dock}`}
      style={{
        width: `${ui.width}px`,
        opacity: ui.opacity,
      }}
    >
      <header className="opfg-ui-tuner__header">
        <div className="opfg-ui-tuner__title">
          <GripVertical
            className="size-4 opacity-40"
            aria-hidden="true"
          />
          <div>
            <strong>OPFG UI Tuner</strong>
            <small>
              {dirtyCount} override
              {dirtyCount === 1 ? '' : 's'}
            </small>
          </div>
        </div>

        <div className="opfg-ui-tuner__header-actions">
          <button
            type="button"
            onClick={() =>
              setUi((current) => ({
                ...current,
                dock:
                  current.dock === 'left'
                    ? 'right'
                    : 'left',
              }))
            }
            title="Changer de côté"
          >
            {ui.dock === 'left' ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Réduire"
          >
            <ChevronDown className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setVisible(false)}
            title="Masquer — Ctrl+Shift+U"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="opfg-ui-tuner__toolbar">
        <button
          type="button"
          onClick={undo}
          title="Undo — Ctrl+Z"
        >
          <Undo2 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={redo}
          title="Redo — Ctrl+Shift+Z"
        >
          <History className="size-3.5" />
        </button>

        <button
          type="button"
          onPointerDown={previewDefaults}
          onPointerUp={restoreCurrentPreview}
          onPointerCancel={restoreCurrentPreview}
          onPointerLeave={restoreCurrentPreview}
          title="Maintenir pour comparer aux valeurs par défaut"
        >
          <Eye className="size-3.5" />
          Compare
        </button>

        <button
          type="button"
          onClick={resetAll}
          title="Reset global"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <div className="opfg-ui-tuner__quick-presets">
        {UI_TUNER_QUICK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() =>
              patchValues(
                preset.values,
                preset.label,
              )
            }
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="opfg-ui-tuner__preset-slots">
        {(Object.keys(EMPTY_PRESETS) as PresetSlot[]).map(
          (slot) => (
            <div
              key={slot}
              className={
                presets[slot]
                  ? 'is-saved'
                  : undefined
              }
            >
              <button
                type="button"
                className="opfg-ui-tuner__preset-load"
                onClick={() => loadPreset(slot)}
                title={`Charger ${slot}`}
              >
                {slot}
              </button>

              <button
                type="button"
                className="opfg-ui-tuner__preset-save"
                onClick={() => savePreset(slot)}
                title={`Sauvegarder dans ${slot}`}
              >
                <Save className="size-3" />
              </button>
            </div>
          ),
        )}
      </div>

      <label className="opfg-ui-tuner__search">
        <Search className="size-3.5" />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Rechercher une variable…"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Effacer"
          >
            <X className="size-3" />
          </button>
        )}
      </label>

      <div className="opfg-ui-tuner__debug">
        <button
          type="button"
          className={debugLayout ? 'is-active' : undefined}
          onClick={() =>
            setDebugLayout((current) => !current)
          }
        >
          <LayoutGrid className="size-3.5" />
          Layout
        </button>

        <button
          type="button"
          className={debugHitboxes ? 'is-active' : undefined}
          onClick={() =>
            setDebugHitboxes((current) => !current)
          }
        >
          <EyeOff className="size-3.5" />
          Hitboxes
        </button>

        <button
          type="button"
          className={freezeMotion ? 'is-active' : undefined}
          onClick={() =>
            setFreezeMotion((current) => !current)
          }
        >
          <Snowflake className="size-3.5" />
          Freeze
        </button>
      </div>

      <div className="opfg-ui-tuner__scroll">
        {UI_TUNER_SECTIONS.map((section) => {
          const definitions =
            filteredBySection[section.id];

          if (definitions.length === 0) {
            return null;
          }

          const open =
            openSections.has(section.id) || Boolean(search);

          return (
            <section
              key={section.id}
              className="opfg-ui-tuner__section"
            >
              <div className="opfg-ui-tuner__section-header">
                <button
                  type="button"
                  className="opfg-ui-tuner__section-toggle"
                  onClick={() => {
                    setOpenSections((current) => {
                      const next = new Set(current);

                      if (next.has(section.id)) {
                        next.delete(section.id);
                      } else {
                        next.add(section.id);
                      }

                      return next;
                    });
                  }}
                >
                  {open ? (
                    <ChevronDown className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                  {section.label}
                  <small>
                    {definitions.length}
                  </small>
                </button>

                <div className="opfg-ui-tuner__section-actions">
                  <button
                    type="button"
                    onClick={() =>
                      randomizeSection(section.id)
                    }
                    title="Variation contrôlée ±7,5%"
                  >
                    <Shuffle className="size-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      resetSection(section.id)
                    }
                    title="Reset section"
                  >
                    <RotateCcw className="size-3" />
                  </button>
                </div>
              </div>

              {open && (
                <div className="opfg-ui-tuner__controls">
                  {definitions.map((definition) => {
                    const value =
                      values[definition.id];

                    if (definition.kind === 'color') {
                      return (
                        <label
                          key={definition.id}
                          className="opfg-ui-tuner__color-control"
                          title={definition.variable}
                        >
                          <span>
                            {definition.label}
                          </span>

                          <input
                            type="color"
                            value={String(value)}
                            onChange={(event) => {
                              setValues((current) => ({
                                ...current,
                                [definition.id]:
                                  event.target.value,
                              }));
                            }}
                            onFocus={() => {
                              dragStartValuesRef.current = {
                                ...values,
                              };
                            }}
                            onBlur={() => {
                              if (
                                dragStartValuesRef.current
                              ) {
                                remember(
                                  dragStartValuesRef.current,
                                );
                                dragStartValuesRef.current =
                                  null;
                              }
                            }}
                          />

                          <code>
                            {String(value)}
                          </code>
                        </label>
                      );
                    }

                    return (
                      <div
                        key={definition.id}
                        className="opfg-ui-tuner__control"
                        title={
                          definition.description ??
                          definition.variable
                        }
                      >
                        <div className="opfg-ui-tuner__control-heading">
                          <span>{definition.label}</span>
                          <code>
                            {definition.variable}
                          </code>
                        </div>

                        <div className="opfg-ui-tuner__control-row">
                          <input
                            type="range"
                            min={definition.min}
                            max={definition.max}
                            step={definition.step}
                            value={Number(value)}
                            onPointerDown={() => {
                              dragStartValuesRef.current = {
                                ...values,
                              };
                            }}
                            onPointerUp={() => {
                              if (
                                dragStartValuesRef.current
                              ) {
                                remember(
                                  dragStartValuesRef.current,
                                );
                                dragStartValuesRef.current =
                                  null;
                              }
                            }}
                            onChange={(event) => {
                              const next = clampRange(
                                Number(event.target.value),
                                definition,
                              );

                              setValues((current) => ({
                                ...current,
                                [definition.id]: next,
                              }));
                            }}
                          />

                          <input
                            type="number"
                            min={definition.min}
                            max={definition.max}
                            step={definition.step}
                            value={Number(value)}
                            onFocus={() => {
                              dragStartValuesRef.current = {
                                ...values,
                              };
                            }}
                            onBlur={() => {
                              if (
                                dragStartValuesRef.current
                              ) {
                                remember(
                                  dragStartValuesRef.current,
                                );
                                dragStartValuesRef.current =
                                  null;
                              }
                            }}
                            onChange={(event) => {
                              const next = clampRange(
                                Number(event.target.value),
                                definition,
                              );

                              setValues((current) => ({
                                ...current,
                                [definition.id]: next,
                              }));
                            }}
                          />

                          <span className="opfg-ui-tuner__unit">
                            {definition.unit || '×'}
                          </span>

                          <button
                            type="button"
                            className="opfg-ui-tuner__control-reset"
                            onClick={() =>
                              patchValues({
                                [definition.id]:
                                  definition.defaultValue,
                              })
                            }
                            title="Reset valeur"
                          >
                            <RotateCcw className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="opfg-ui-tuner__footer">
        <div className="opfg-ui-tuner__export-row">
          <button
            type="button"
            onClick={copyCss}
          >
            <Copy className="size-3.5" />
            CSS
          </button>

          <button
            type="button"
            onClick={copyJson}
          >
            <Clipboard className="size-3.5" />
            JSON
          </button>

          <button
            type="button"
            onClick={() =>
              downloadText(
                'opfg-ui-tuning.json',
                jsonExport(values),
                'application/json',
              )
            }
          >
            <Download className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              importRef.current?.click()
            }
          >
            <Import className="size-3.5" />
          </button>

          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              void importJsonFile(
                event.target.files?.[0],
              );
              event.currentTarget.value = '';
            }}
          />
        </div>

        <div className="opfg-ui-tuner__panel-options">
          <label>
            Width
            <input
              type="range"
              min="320"
              max="560"
              step="10"
              value={ui.width}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  width: Number(event.target.value),
                }))
              }
            />
          </label>

          <label>
            Alpha
            <input
              type="range"
              min="0.55"
              max="1"
              step="0.01"
              value={ui.opacity}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  opacity: Number(
                    event.target.value,
                  ),
                }))
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="opfg-ui-tuner__clear"
          onClick={clearRuntimeOverrides}
        >
          <FileJson className="size-3.5" />
          Nettoyer les overrides
        </button>

        <div className="opfg-ui-tuner__shortcut">
          Ctrl+Shift+U · Undo Ctrl+Z
        </div>
      </footer>

      {notice && (
        <div
          className="opfg-ui-tuner__notice"
          role="status"
        >
          <Check className="size-3.5" />
          {notice}
        </div>
      )}
    </aside>
  );
}
