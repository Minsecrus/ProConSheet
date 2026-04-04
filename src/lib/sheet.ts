export type QuadrantKey =
  | "doingPros"
  | "doingCons"
  | "notDoingPros"
  | "notDoingCons";

export type Locale = "zh" | "en";

export type SheetItem = {
  text: string;
  bold: boolean;
};

export type SheetState = {
  subject: string;
  locale: Locale;
  quadrants: Record<QuadrantKey, SheetItem[]>;
};

export const STORAGE_KEY = "proconsheet-state";

export const messages = {
  zh: {
    decision: "决策事件",
    decisionPlaceholder: "请输入你要决策的事件名称",
    pros: "利",
    cons: "弊",
    doing: "做",
    notDoing: "不做",
    resetConfirm: "确定重置？",
    saveTitle: "导出 Markdown",
    saveDescription: "填写决策事件名称后，才能复制或下载 Markdown。",
    infoTitle: "关于 ProConSheet",
    infoDescription:
      "本项目为利弊分析法工具，旨在帮助分析和权衡决策事件的各个方面，从而做出更明智的选择。",
    infoDetails: [
      "你可以把一个决策拆成四个象限：做这件事的利、做这件事的弊、不做这件事的利、不做这件事的弊。",
      "这种方式适合用于职业选择、产品决策、项目取舍、合作判断，以及任何需要平衡短期成本与长期价值的场景。",
      "当四个象限被写满后，你通常能更快发现真正影响决定的关键因素，而不是被单一情绪带着走。",
    ],
    infoBoldTip:
      "如果你觉得某个理由重要，可以右键将其加粗。再次右键取消加粗。",
    infoQuote: "忍受你必须忍受的，歌唱你必须歌唱的。",
    githubLabel: "GitHub 仓库",
    close: "关闭",
    copy: "复制",
    copied: "已复制",
    download: "下载 .md",
    exportNameLabel: "决策事件名称",
    exportNamePlaceholder: "例如：是否接受这份工作",
    exportNameRequired: "请先输入决策事件名称",
    languageLabel: "切换语言",
    infoLabel: "查看说明",
    saveLabel: "导出 Markdown",
    resetLabel: "重置",
    cancelReset: "取消重置",
    confirmReset: "确认重置",
    placeholders: {
      doingPros: "添加执行这件事的好处",
      doingCons: "添加执行这件事的坏处",
      notDoingPros: "添加不做这件事的好处",
      notDoingCons: "添加不做这件事的坏处",
    },
  },
  en: {
    decision: "Decision",
    decisionPlaceholder: "What are you deciding?",
    pros: "Pros",
    cons: "Cons",
    doing: "Doing",
    notDoing: "Not Doing",
    resetConfirm: "Reset everything?",
    saveTitle: "Save Markdown",
    saveDescription:
      "Enter a decision name before copying or downloading the Markdown.",
    infoTitle: "About ProConSheet",
    infoDescription:
      "This project is a cost-benefit analysis tool designed to help analyze and weigh various aspects of decision-making events, thereby making more informed choices.",
    infoDetails: [
      "This grid separates a decision into four quadrants: pros of doing it, cons of doing it, pros of not doing it, and cons of not doing it.",
      "It works well for career choices, product decisions, project tradeoffs, partnership evaluation, and any situation where short-term cost and long-term value need to be weighed together.",
      "Once the four quadrants are filled, it becomes easier to spot which factors actually drive the decision instead of reacting to a single emotion or bias.",
    ],
    infoBoldTip:
      "If a reason matters more, right-click it to make it bold. Right-click again to remove the emphasis.",
    infoQuote: "Endure what must be endured, sing what must be sung.",
    githubLabel: "GitHub repository",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    download: "Download .md",
    exportNameLabel: "Decision name",
    exportNamePlaceholder: "For example: whether to accept this job",
    exportNameRequired: "Enter a decision name before exporting",
    languageLabel: "Toggle language",
    infoLabel: "Show info",
    saveLabel: "Save Markdown",
    resetLabel: "Reset",
    cancelReset: "Cancel reset",
    confirmReset: "Confirm reset",
    placeholders: {
      doingPros: "Add a benefit of doing this",
      doingCons: "Add a drawback of doing this",
      notDoingPros: "Add a benefit of not doing this",
      notDoingCons: "Add a drawback of not doing this",
    },
  },
} as const;

export const defaultState: SheetState = {
  subject: "",
  locale: "zh",
  quadrants: {
    doingPros: [{ text: "", bold: false }],
    doingCons: [{ text: "", bold: false }],
    notDoingPros: [{ text: "", bold: false }],
    notDoingCons: [{ text: "", bold: false }],
  },
};

function normalizeStoredItems(items: unknown): SheetItem[] {
  if (!Array.isArray(items) || !items.length) {
    return [{ text: "", bold: false }];
  }

  const normalized = items.map((item) => {
    if (typeof item === "string") {
      return { text: item, bold: false };
    }

    if (
      item &&
      typeof item === "object" &&
      "text" in item &&
      typeof item.text === "string"
    ) {
      return {
        text: item.text,
        bold: "bold" in item ? Boolean(item.bold) : false,
      };
    }

    return { text: "", bold: false };
  });

  return normalized.length ? normalized : [{ text: "", bold: false }];
}

export function readInitialState(): SheetState {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SheetState>;

    return {
      subject: parsed.subject ?? "",
      locale: parsed.locale === "en" ? "en" : "zh",
      quadrants: {
        doingPros: normalizeStoredItems(parsed.quadrants?.doingPros),
        doingCons: normalizeStoredItems(parsed.quadrants?.doingCons),
        notDoingPros: normalizeStoredItems(parsed.quadrants?.notDoingPros),
        notDoingCons: normalizeStoredItems(parsed.quadrants?.notDoingCons),
      },
    };
  } catch {
    return defaultState;
  }
}

function normalizeItems(items: SheetItem[]) {
  return items
    .map((item) => ({ ...item, text: item.text.trim() }))
    .filter((item) => item.text);
}

export function buildMarkdown(
  sheet: SheetState,
  copy: (typeof messages)[Locale],
) {
  const subject = sheet.subject.trim() || copy.decision;
  const doingPros = normalizeItems(sheet.quadrants.doingPros);
  const doingCons = normalizeItems(sheet.quadrants.doingCons);
  const notDoingPros = normalizeItems(sheet.quadrants.notDoingPros);
  const notDoingCons = normalizeItems(sheet.quadrants.notDoingCons);

  return [
    `# ${subject}`,
    "",
    `## ${copy.doing} / ${copy.pros}`,
    ...(doingPros.length
      ? doingPros.map(
          (item) => `- ${item.bold ? `**${item.text}**` : item.text}`,
        )
      : ["-"]),
    "",
    `## ${copy.doing} / ${copy.cons}`,
    ...(doingCons.length
      ? doingCons.map(
          (item) => `- ${item.bold ? `**${item.text}**` : item.text}`,
        )
      : ["-"]),
    "",
    `## ${copy.notDoing} / ${copy.pros}`,
    ...(notDoingPros.length
      ? notDoingPros.map(
          (item) => `- ${item.bold ? `**${item.text}**` : item.text}`,
        )
      : ["-"]),
    "",
    `## ${copy.notDoing} / ${copy.cons}`,
    ...(notDoingCons.length
      ? notDoingCons.map(
          (item) => `- ${item.bold ? `**${item.text}**` : item.text}`,
        )
      : ["-"]),
  ].join("\n");
}
