import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Download } from "lucide-react";
import { CornerPanel } from "./components/CornerPanel";
import { Modal } from "./components/Modal";
import {
  buildMarkdown,
  defaultState,
  messages,
  readInitialState,
  STORAGE_KEY,
  type QuadrantKey,
  type SheetState,
} from "./lib/sheet";

const quadrantMeta: Array<{
  key: QuadrantKey;
  panelClassName: string;
}> = [
  {
    key: "doingPros",
    panelClassName: "bg-[#fbfdf8]",
  },
  {
    key: "doingCons",
    panelClassName: "bg-[#fefaf8]",
  },
  {
    key: "notDoingPros",
    panelClassName: "bg-[#f8fcfd]",
  },
  {
    key: "notDoingCons",
    panelClassName: "bg-[#fbf9fd]",
  },
];

function App() {
  const [sheet, setSheet] = useState<SheetState>(readInitialState);
  const [resetMode, setResetMode] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingFocusRef = useRef<{ key: QuadrantKey; index: number } | null>(
    null,
  );
  const copy = messages[sheet.locale];
  const markdown = useMemo(() => buildMarkdown(sheet, copy), [sheet, copy]);
  const canExport = sheet.subject.trim().length > 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
  }, [sheet]);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;

    if (!pendingFocus) {
      return;
    }

    const target =
      inputRefs.current[`${pendingFocus.key}-${pendingFocus.index}`];

    if (target) {
      target.focus();
      target.setSelectionRange(target.value.length, target.value.length);
    }

    pendingFocusRef.current = null;
  }, [sheet]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const updateSubject = (value: string) => {
    setSheet((current) => ({
      ...current,
      subject: value,
    }));
  };

  const updateItem = (key: QuadrantKey, index: number, value: string) => {
    setSheet((current) => ({
      ...current,
      quadrants: {
        ...current.quadrants,
        [key]: current.quadrants[key].map((item, itemIndex) =>
          itemIndex === index ? { ...item, text: value } : item,
        ),
      },
    }));
  };

  const toggleItemBold = (key: QuadrantKey, index: number) => {
    setSheet((current) => ({
      ...current,
      quadrants: {
        ...current.quadrants,
        [key]: current.quadrants[key].map((item, itemIndex) =>
          itemIndex === index ? { ...item, bold: !item.bold } : item,
        ),
      },
    }));
  };

  const insertItemAfter = (key: QuadrantKey, index: number) => {
    pendingFocusRef.current = { key, index: index + 1 };

    setSheet((current) => {
      const nextItems = [...current.quadrants[key]];
      nextItems.splice(index + 1, 0, { text: "", bold: false });

      return {
        ...current,
        quadrants: {
          ...current.quadrants,
          [key]: nextItems,
        },
      };
    });
  };

  const removeItemAt = (key: QuadrantKey, index: number) => {
    setSheet((current) => {
      const items = current.quadrants[key];

      if (items.length === 1) {
        pendingFocusRef.current = { key, index: 0 };

        return {
          ...current,
          quadrants: {
            ...current.quadrants,
            [key]: [{ text: "", bold: false }],
          },
        };
      }

      pendingFocusRef.current = { key, index: Math.max(0, index - 1) };

      return {
        ...current,
        quadrants: {
          ...current.quadrants,
          [key]: items.filter((_, itemIndex) => itemIndex !== index),
        },
      };
    });
  };

  const handleItemKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    key: QuadrantKey,
    index: number,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      insertItemAfter(key, index);
      return;
    }

    if (event.key === "Backspace" && event.currentTarget.value === "") {
      event.preventDefault();
      removeItemAt(key, index);
    }
  };

  const toggleLocale = () => {
    setSheet((current) => ({
      ...current,
      locale: current.locale === "zh" ? "en" : "zh",
    }));
  };

  const handleResetConfirm = () => {
    setSheet((current) => ({
      ...defaultState,
      locale: current.locale,
    }));
    setResetMode(false);
    setSaveOpen(false);
    setInfoOpen(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleCopyMarkdown = async () => {
    if (!canExport) {
      return;
    }

    await navigator.clipboard.writeText(markdown);
    setCopied(true);
  };

  const handleDownloadMarkdown = () => {
    if (!canExport) {
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const subject = sheet.subject.trim() || "proconsheet";

    link.href = url;
    link.download = `${subject.replace(/[\\/:*?"<>|]/g, "-").slice(0, 60)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="grid min-h-screen grid-cols-[6rem_1fr_1fr] grid-rows-[6rem_1fr_1fr] bg-[linear-gradient(135deg,#f7f1e8_0%,#efe4d2_100%)]">
        <CornerPanel
          resetMode={resetMode}
          onBeginReset={() => setResetMode(true)}
          onCancelReset={() => setResetMode(false)}
          onConfirmReset={handleResetConfirm}
          onOpenSave={() => setSaveOpen(true)}
          onToggleLocale={toggleLocale}
          onOpenInfo={() => setInfoOpen(true)}
          copy={copy}
        />

        <header className="flex min-w-0 min-h-0 items-center justify-center border-r border-b border-stone-700/15 bg-[#f9fdf8] px-3 text-center text-[clamp(1rem,0.85rem+0.55vw,1.45rem)] font-semibold uppercase tracking-[0.06em] text-amber-800/90">
          {copy.pros}
        </header>
        <header className="flex min-w-0 min-h-0 items-center justify-center border-r border-b border-stone-700/15 bg-[#fdf9f8] px-3 text-center text-[clamp(1rem,0.85rem+0.55vw,1.45rem)] font-semibold uppercase tracking-[0.06em] text-amber-800/90">
          {copy.cons}
        </header>

        <header className="flex min-w-0 min-h-0 items-center justify-center border-r border-b border-stone-700/15 bg-[#fdfcf8] px-2 py-3 text-center text-[clamp(1rem,0.85rem+0.55vw,1.45rem)] font-semibold uppercase tracking-[0.18em] text-amber-800/90 [text-orientation:upright] [writing-mode:vertical-rl]">
          {copy.doing}
        </header>
        {quadrantMeta.slice(0, 2).map((quadrant) => (
          <section
            key={quadrant.key}
            className={`flex min-w-0 min-h-0 flex-col gap-4 border-r border-b border-stone-700/15 p-6 max-md:p-4 ${quadrant.panelClassName}`}
            aria-label={quadrant.key}
          >
            <ul className="min-h-0 flex-1 overflow-auto pl-6 text-stone-700">
              {sheet.quadrants[quadrant.key].map((item, index) => (
                <li key={`${quadrant.key}-${index}`} className="list-item pb-3">
                  <input
                    ref={(element) => {
                      inputRefs.current[`${quadrant.key}-${index}`] = element;
                    }}
                    className={`w-full border-0 border-b border-transparent bg-transparent py-0.5 text-sm leading-7 text-stone-700 outline-none placeholder:text-stone-500/70 focus:border-stone-700/25 focus:text-stone-900 md:text-base ${item.bold ? "font-bold" : "font-normal"}`}
                    type="text"
                    value={item.text}
                    onChange={(event) =>
                      updateItem(quadrant.key, index, event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleItemKeyDown(event, quadrant.key, index)
                    }
                    onContextMenu={(event) => {
                      event.preventDefault();
                      toggleItemBold(quadrant.key, index);
                    }}
                    placeholder={copy.placeholders[quadrant.key]}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <header className="flex min-w-0 min-h-0 items-center justify-center border-r border-b border-stone-700/15 bg-[#f8fbfd] px-2 py-3 text-center text-[clamp(1rem,0.85rem+0.55vw,1.45rem)] font-semibold uppercase tracking-[0.18em] text-amber-800/90 [text-orientation:upright] [writing-mode:vertical-rl]">
          {copy.notDoing}
        </header>
        {quadrantMeta.slice(2).map((quadrant) => (
          <section
            key={quadrant.key}
            className={`flex min-w-0 min-h-0 flex-col gap-4 border-r border-b border-stone-700/15 p-6 max-md:p-4 ${quadrant.panelClassName}`}
            aria-label={quadrant.key}
          >
            <ul className="min-h-0 flex-1 overflow-auto pl-6 text-stone-700">
              {sheet.quadrants[quadrant.key].map((item, index) => (
                <li key={`${quadrant.key}-${index}`} className="list-item pb-3">
                  <input
                    ref={(element) => {
                      inputRefs.current[`${quadrant.key}-${index}`] = element;
                    }}
                    className={`w-full border-0 border-b border-transparent bg-transparent py-0.5 text-sm leading-7 text-stone-700 outline-none placeholder:text-stone-500/70 focus:border-stone-700/25 focus:text-stone-900 md:text-base ${item.bold ? "font-bold" : "font-normal"}`}
                    type="text"
                    value={item.text}
                    onChange={(event) =>
                      updateItem(quadrant.key, index, event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleItemKeyDown(event, quadrant.key, index)
                    }
                    onContextMenu={(event) => {
                      event.preventDefault();
                      toggleItemBold(quadrant.key, index);
                    }}
                    placeholder={copy.placeholders[quadrant.key]}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {saveOpen ? (
        <Modal
          title={copy.saveTitle}
          description={copy.saveDescription}
          closeLabel={copy.close}
          onClose={() => setSaveOpen(false)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="export-subject"
                className="block text-sm font-medium text-stone-800"
              >
                {copy.exportNameLabel}
              </label>
              <input
                id="export-subject"
                type="text"
                required
                value={sheet.subject}
                onChange={(event) => updateSubject(event.target.value)}
                placeholder={copy.exportNamePlaceholder}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
              />
              {!canExport ? (
                <p className="text-sm text-rose-600">
                  {copy.exportNameRequired}
                </p>
              ) : null}
            </div>
            <textarea
              readOnly
              value={markdown}
              className="min-h-80 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-sm leading-6 text-stone-700 outline-none"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                disabled={!canExport}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {copied ? copy.copied : copy.copy}
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                disabled={!canExport}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
              >
                <Download className="size-4" />
                {copy.download}
              </button>
              <button
                type="button"
                onClick={() => setSaveOpen(false)}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {infoOpen ? (
        <Modal
          title={copy.infoTitle}
          description={copy.infoDescription}
          closeLabel={copy.close}
          onClose={() => setInfoOpen(false)}
        >
          <div className="space-y-4 text-sm leading-7 text-stone-700">
            <div className="space-y-3 rounded-2xl bg-stone-50 p-4 -translate-x-2">
              {copy.infoDetails.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
            <p>{copy.infoBoldTip}</p>
            <p>
              <strong>{copy.infoQuote}</strong>
            </p>
            <a
              href="https://github.com/Minsecrus/ProConSheet"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-stone-300 mt-2 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              {copy.githubLabel}
            </a>
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              className="rounded-full border border-stone-300 px-4 ml-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              {copy.close}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default App;
