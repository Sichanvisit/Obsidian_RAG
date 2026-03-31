import {
  App,
  ItemView,
  MarkdownRenderer,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  WorkspaceLeaf,
  normalizePath,
  requestUrl,
} from "obsidian";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import * as http from "node:http";
import * as https from "node:https";

const VIEW_TYPE_LOCAL_AGENT = "local-agent-view";
const MAX_NOTE_CHARS = 12000;
const MAX_CONTEXT_NOTE_CHARS = 4000;
const GENERATOR_SUPPORTED_EXTENSIONS = new Set(["md", "txt", "py"]);
const CONTEXT_READABLE_EXTENSIONS = new Set([
  "md", "txt", "py", "js", "ts", "tsx", "jsx", "json", "yaml", "yml", "toml", "ini",
  "cfg", "conf", "sql", "sh", "bat", "ps1", "css", "scss", "html", "xml", "csv",
  "go", "rs", "java", "kt", "c", "cpp", "h", "hpp", "rb", "php", "env",
]);
type LanguageCode = "en" | "ko";

interface ContextScopeSettings {
  links: boolean;
  folder: boolean;
  tags: boolean;
  backlinks: boolean;
}

interface LocalAgentSettings {
  language: LanguageCode;
  backendUrl: string;
  autoStartBackend: boolean;
  backendPythonPath: string;
  backendScriptPath: string;
  backendWorkingDir: string;
  defaultProject: string;
  saveFolder: string;
  maxContextNotes: number;
  sourceOpenMode: "current" | "split" | "tab";
  splitDirection: "left" | "right" | "down";
  scopes: ContextScopeSettings;
}

interface StoredContextEntry {
  path: string;
  name: string;
  content: string;
  source: ContextSource;
}

interface StoredChatTurn {
  question: string;
  answer: string;
  basis?: string;
  route?: string;
  sources?: StreamSource[];
  recommendations?: RecommendationItem[];
  attachedFilePath?: string;
  contextEntries?: StoredContextEntry[];
  createdAt: string;
}

interface ChatThreadRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: StoredChatTurn[];
}

interface LocalAgentPluginData {
  settings?: Partial<LocalAgentSettings>;
  chatThreads?: ChatThreadRecord[];
  activeChatThreadId?: string;
}

const DEFAULT_SETTINGS: LocalAgentSettings = {
  language: "ko",
  backendUrl: "http://127.0.0.1:8011",
  autoStartBackend: false,
  backendPythonPath: "C:\\Users\\bhs33\\Desktop\\project\\.venv\\Scripts\\python.exe",
  backendScriptPath: "C:\\Users\\bhs33\\Desktop\\project\\Obsidian_RAG\\backend\\main.py",
  backendWorkingDir: "C:\\Users\\bhs33\\Desktop\\project\\Obsidian_RAG",
  defaultProject: "Default",
  saveFolder: "AI Answers",
  maxContextNotes: 6,
  sourceOpenMode: "split",
  splitDirection: "right",
  scopes: {
    links: true,
    folder: false,
    tags: false,
    backlinks: false,
  },
};

type QuickActionKey = "summary" | "organize" | "next-actions";
type TranslationVars = Record<string, string | number>;

const UI_STRINGS = {
  en: {
    panelTitle: "Obsidian Local Agent",
    viewDisplayName: "Local Agent",
    statusIdle: "Idle",
    contextNoNoteSelected: "No note selected.",
    contextCurrentNote: "Current note: {path}",
    contextChatReady: "Question-first mode. Current note is only attached when the question refers to it.",
    questionPlaceholder: "Ask a question. The current note is attached only when the question refers to it.",
    buttonAsk: "Ask",
    buttonBackendStart: "Start Backend",
    buttonBackendStop: "Stop Backend",
    buttonBackendRestart: "Restart Backend",
    buttonBackendControls: "::",
    buttonOpenBackendApi: "API Docs",
    buttonOpenBackendHealth: "Health",
    buttonRefreshNote: "Refresh Note",
    buttonConversationActions: "Conversation Actions",
    buttonClearConversation: "Clear Conversation",
    buttonRenameThread: "Rename Thread",
    buttonDeleteThread: "Delete Thread",
    buttonUseSelection: "Use Selection",
    buttonAppendToNote: "Append To Note",
    buttonSaveNewNote: "Save New Note",
    scopeLinks: "Links",
    scopeFolder: "Folder",
    scopeTags: "Tags",
    scopeBacklinks: "Backlinks",
    contextNoActiveMarkdownNote: "No active markdown note.",
    noticeNoSelection: "No selected text found.",
    noticeEnterQuestion: "Enter a question first.",
    noticeOpenNote: "Open a markdown note first.",
    noticeBackendAlreadyRunning: "Backend is already running.",
    noticeBackendStarted: "Backend start requested.",
    noticeBackendStopped: "Backend stopped.",
    noticeBackendRestarted: "Backend restarted.",
    noticeBackendStartFailed: "Failed to start backend: {message}",
    noticeBackendStopFailed: "Failed to stop backend: {message}",
    noticeBackendPathsMissing: "Set backend Python/script paths first.",
    noticeBackendUnavailable: "Backend is offline. Start it from the toolbar or check the backend settings.",
    statusStreaming: "Streaming from {url}",
    statusDone: "Done",
    statusError: "Error",
    statusBackendStarting: "Starting backend...",
    noticeLocalAgentError: "Local Agent error: {message}",
    statusBackendError: "Backend error: {status}",
    statusBackendReady: "Backend ready: {engine}",
    statusBackendOffline: "Backend offline: {message}",
    statusBackendManual: "Backend manual",
    outputReady: "Ready.",
    outputGenerating: "Generating...",
    panelSentContext: "Sent Context ({count})",
    panelRetrievedSources: "Retrieved Sources ({count})",
    panelFollowUpNotes: "Follow-up Notes ({count})",
    threadNew: "New Thread",
    threadUntitled: "Untitled",
    threadTurns: "{count} turns",
    panelNoSentContext: "No additional context notes were sent.",
    panelNoRetrievedSources: "No structured source list received yet.",
    panelNoFollowUpNotes: "No follow-up notes were suggested yet.",
    debugSelectedBy: "selected by",
    debugReasonPrefix: "why",
    debugRelationType: "relation",
    sourceCurrent: "current note",
    sourceCurrentCandidate: "current note candidate",
    sourceVaultSearch: "vault search",
    sourceLinks: "links",
    sourceRelatedFiles: "related files",
    sourceAutoRelated: "auto related",
    sourceTypedRelation: "typed relation",
    sourceFolder: "folder",
    sourceTags: "tags",
    sourceBacklinks: "backlinks",
    sourceContext: "context",
    basisCurrentNote: "Current note basis",
    basisObsidianSearch: "Obsidian search basis",
    basisGeneralKnowledge: "General knowledge",
    badgeReference: "reference",
    badgeScore: "score {score}",
    badgeConfidence: "confidence {score}",
    sourceLayerSummary: "SUMMARY",
    sourceLayerRaw: "RAW",
    contextSourceLinks: "LINKS",
    contextSourceFolder: "FOLDER",
    contextSourceTags: "TAGS",
    contextSourceBacklinks: "BACKLINKS",
    noticeNoAnswerToSave: "There is no answer to save yet.",
    noticeSavedAnswer: "Saved answer: {path}",
    noticeNoAnswerToAppend: "There is no answer to append yet.",
    noticeAppendedAnswer: "Appended answer to {path}",
    noticeConversationCleared: "Cleared the current conversation.",
    noticeThreadRenamed: "Renamed the thread.",
    noticeThreadDeleted: "Deleted the thread.",
    promptRenameThread: "Enter a new thread name.",
    promptDeleteThread: "Delete this thread?",
    savedTitleNote: "# Local Agent Answer",
    savedTitleAppend: "## Local Agent {now}",
    savedAnswerHeadingNote: "## Answer",
    savedAnswerHeadingAppend: "### Answer",
    savedSourcesHeadingNote: "## Retrieved Sources",
    savedSourcesHeadingAppend: "### Retrieved Sources",
    savedContextHeadingNote: "## Sent Context",
    savedContextHeadingAppend: "### Sent Context",
    savedSourceNote: "Source note",
    savedQuestion: "Question",
    savedSavedAt: "Saved at",
    savedEmptyQuestion: "(empty)",
    settingLanguageName: "Language",
    settingLanguageDesc: "UI language and default response language.",
    settingLanguageEnglish: "English",
    settingLanguageKorean: "Korean",
    settingBackendName: "Backend URL",
    settingBackendDesc: "FastAPI backend address used by the plugin.",
    settingAutoStartBackendName: "Auto-start backend",
    settingAutoStartBackendDesc: "If the backend is offline, try to launch it from this plugin.",
    settingBackendPythonName: "Backend Python path",
    settingBackendPythonDesc: "Python executable used to start the backend from Obsidian.",
    settingBackendScriptName: "Backend script path",
    settingBackendScriptDesc: "Path to backend/main.py.",
    settingBackendWorkingDirName: "Backend working directory",
    settingBackendWorkingDirDesc: "Working directory used when launching the backend process.",
    settingProjectName: "Default project",
    settingProjectDesc: "Project name passed to the backend.",
    settingSaveFolderName: "Save folder",
    settingSaveFolderDesc: "Vault folder where saved answers are created.",
    settingMaxContextName: "Max context notes",
    settingMaxContextDesc: "Upper bound for linked context notes sent with each query.",
    settingOpenModeName: "Source open mode",
    settingOpenModeDesc: "How source cards should open vault files.",
    settingOpenModeCurrent: "Current tab",
    settingOpenModeSplit: "Split pane",
    settingOpenModeTab: "New tab",
    settingSplitDirectionName: "Split direction",
    settingSplitDirectionDesc: "Used when source open mode is set to split pane.",
    settingDirectionLeft: "Left",
    settingDirectionRight: "Right",
    settingDirectionDown: "Down",
    commandOpen: "Open Local Agent",
    commandAskSelection: "Ask Selection With Local Agent",
    commandSummarize: "Summarize Current Note With Local Agent",
    commandOrganize: "Organize Current Note With Local Agent",
    commandNextActions: "Extract Next Actions With Local Agent",
    relationSameTopic: "same topic",
    relationReferences: "references",
    relationSummarizes: "summarizes",
    relationExpands: "expands",
    relationImplements: "implements",
    relationReviewOf: "review of",
    relationNextActionFor: "next action",
    relationDecisionFor: "decision for",
    relationFollowUp: "follow-up"
  },
  ko: {
    panelTitle: "\uC635\uC2DC\uB514\uC5B8 \uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8",
    viewDisplayName: "\uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8",
    statusIdle: "\uB300\uAE30 \uC911",
    contextNoNoteSelected: "\uC120\uD0DD\uB41C \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    contextCurrentNote: "\uD604\uC7AC \uB178\uD2B8: {path}",
    contextChatReady: "\uC9C8\uBB38 \uC911\uC2EC \uBAA8\uB4DC\uC785\uB2C8\uB2E4. \uD604\uC7AC \uB178\uD2B8\uB294 \uC9C8\uBB38\uC774 \uADF8 \uB178\uD2B8\uB97C \uCC38\uC870\uD560 \uB54C\uB9CC \uD568\uAED8 \uC804\uB2EC\uB429\uB2C8\uB2E4.",
    questionPlaceholder: "\uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694. \uD604\uC7AC \uB178\uD2B8\uB294 \uC9C8\uBB38\uC774 \uADF8 \uB178\uD2B8\uB97C \uCC38\uC870\uD560 \uB54C\uB9CC \uD568\uAED8 \uC804\uB2EC\uB429\uB2C8\uB2E4.",
    buttonAsk: "\uC9C8\uBB38\uD558\uAE30",
    buttonBackendStart: "\uBC31\uC5D4\uB4DC \uC2DC\uC791",
    buttonBackendStop: "\uBC31\uC5D4\uB4DC \uC911\uC9C0",
    buttonBackendRestart: "\uBC31\uC5D4\uB4DC \uC7AC\uC2DC\uC791",
    buttonBackendControls: "::",
    buttonOpenBackendApi: "API \uBB38\uC11C",
    buttonOpenBackendHealth: "\uD5EC\uC2A4",
    buttonRefreshNote: "\uB178\uD2B8 \uC0C8\uB85C\uACE0\uCE68",
    buttonConversationActions: "\uB300\uD654 \uC791\uC5C5",
    buttonClearConversation: "\uD604\uC7AC \uB300\uD654 \uC5C6\uC560\uAE30",
    buttonRenameThread: "\uC2A4\uB808\uB4DC \uC774\uB984 \uBCC0\uACBD",
    buttonDeleteThread: "\uC2A4\uB808\uB4DC \uC0AD\uC81C",
    buttonUseSelection: "\uC120\uD0DD \uC601\uC5ED \uC0AC\uC6A9",
    buttonAppendToNote: "\uB178\uD2B8\uC5D0 \uC774\uC5B4\uBD99\uC774\uAE30",
    buttonSaveNewNote: "\uC0C8 \uB178\uD2B8\uB85C \uC800\uC7A5",
    scopeLinks: "\uB9C1\uD06C",
    scopeFolder: "\uD3F4\uB354",
    scopeTags: "\uD0DC\uADF8",
    scopeBacklinks: "\uBC31\uB9C1\uD06C",
    contextNoActiveMarkdownNote: "\uD65C\uC131\uD654\uB41C \uB9C8\uD06C\uB2E4\uC6B4 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noticeNoSelection: "\uC120\uD0DD\uD55C \uD14D\uC2A4\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noticeEnterQuestion: "\uBA3C\uC800 \uC9C8\uBB38\uC744 \uC785\uB825\uD558\uC138\uC694.",
    noticeOpenNote: "\uBA3C\uC800 \uB9C8\uD06C\uB2E4\uC6B4 \uB178\uD2B8\uB97C \uC5EC\uC138\uC694.",
    noticeBackendAlreadyRunning: "\uBC31\uC5D4\uB4DC\uAC00 \uC774\uBBF8 \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4.",
    noticeBackendStarted: "\uBC31\uC5D4\uB4DC \uC2DC\uC791\uC744 \uC694\uCCAD\uD588\uC2B5\uB2C8\uB2E4.",
    noticeBackendStopped: "\uBC31\uC5D4\uB4DC\uB97C \uC911\uC9C0\uD588\uC2B5\uB2C8\uB2E4.",
    noticeBackendRestarted: "\uBC31\uC5D4\uB4DC\uB97C \uC7AC\uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4.",
    noticeBackendStartFailed: "\uBC31\uC5D4\uB4DC \uC2DC\uC791 \uC2E4\uD328: {message}",
    noticeBackendStopFailed: "\uBC31\uC5D4\uB4DC \uC911\uC9C0 \uC2E4\uD328: {message}",
    noticeBackendPathsMissing: "\uBA3C\uC800 \uBC31\uC5D4\uB4DC Python/\uC2A4\uD06C\uB9BD\uD2B8 \uACBD\uB85C\uB97C \uC124\uC815\uD558\uC138\uC694.",
    noticeBackendUnavailable: "\uBC31\uC5D4\uB4DC\uAC00 \uC624\uD504\uB77C\uC778 \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uC0C1\uB2E8 \uD234\uBC14\uC5D0\uC11C \uC2DC\uC791\uD558\uAC70\uB098 \uBC31\uC5D4\uB4DC \uC124\uC815\uC744 \uD655\uC778\uD558\uC138\uC694.",
    statusStreaming: "{url} \uC5D0\uC11C \uC751\uB2F5\uC744 \uAC00\uC838\uC624\uB294 \uC911",
    statusDone: "\uC644\uB8CC",
    statusError: "\uC624\uB958",
    statusBackendStarting: "\uBC31\uC5D4\uB4DC \uC2DC\uC791 \uC911...",
    noticeLocalAgentError: "\uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8 \uC624\uB958: {message}",
    statusBackendError: "\uBC31\uC5D4\uB4DC \uC624\uB958: {status}",
    statusBackendReady: "\uBC31\uC5D4\uB4DC \uC5F0\uACB0\uB428: {engine}",
    statusBackendOffline: "\uBC31\uC5D4\uB4DC \uC5F0\uACB0 \uC2E4\uD328: {message}",
    statusBackendManual: "\uBC31\uC5D4\uB4DC \uC218\uB3D9",
    outputReady: "\uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    outputGenerating: "\uC751\uB2F5 \uC0DD\uC131 \uC911...",
    panelSentContext: "\uC804\uB2EC\uD55C \uCEE8\uD14D\uC2A4\uD2B8 ({count})",
    panelRetrievedSources: "\uAC80\uC0C9\uB41C \uC18C\uC2A4 ({count})",
    panelFollowUpNotes: "\uC774\uC5B4\uBCFC \uB178\uD2B8 ({count})",
    threadNew: "\uC0C8 \uC2A4\uB808\uB4DC",
    threadUntitled: "\uC0C8 \uB300\uD654",
    threadTurns: "\uBB38\uB2F5 {count}",
    panelNoSentContext: "\uCD94\uAC00\uB85C \uC804\uB2EC\uB41C \uCEE8\uD14D\uC2A4\uD2B8 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    panelNoRetrievedSources: "\uAD6C\uC870\uD654\uB41C \uC18C\uC2A4 \uBAA9\uB85D\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.",
    panelNoFollowUpNotes: "\uC544\uC9C1 \uC81C\uC548\uB41C \uC774\uC5B4\uBCFC \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    debugSelectedBy: "\uC120\uC815 \uACBD\uB85C",
    debugReasonPrefix: "\uC120\uC815 \uC774\uC720",
    debugRelationType: "\uAD00\uACC4",
    sourceCurrent: "\uD604\uC7AC \uB178\uD2B8",
    sourceCurrentCandidate: "\uD604\uC7AC \uB178\uD2B8 \uD6C4\uBCF4",
    sourceVaultSearch: "vault \uAC80\uC0C9",
    sourceLinks: "\uB9C1\uD06C",
    sourceRelatedFiles: "related \uD30C\uC77C",
    sourceAutoRelated: "\uC790\uB3D9 \uC5F0\uACB0",
    sourceTypedRelation: "\uAD00\uACC4 \uD655\uC7A5",
    sourceFolder: "\uD3F4\uB354",
    sourceTags: "\uD0DC\uADF8",
    sourceBacklinks: "\uBC31\uB9C1\uD06C",
    sourceContext: "\uCEE8\uD14D\uC2A4\uD2B8",
    basisCurrentNote: "\uD604\uC7AC \uB178\uD2B8 \uAE30\uBC18",
    basisObsidianSearch: "Obsidian \uAC80\uC0C9 \uAE30\uBC18",
    basisGeneralKnowledge: "\uC77C\uBC18 \uC9C0\uC2DD \uAE30\uBC18",
    badgeReference: "\uCC38\uC870",
    badgeScore: "\uC810\uC218 {score}",
    badgeConfidence: "\uC2E0\uB8B0\uB3C4 {score}",
    sourceLayerSummary: "\uC694\uC57D",
    sourceLayerRaw: "\uC6D0\uBB38",
    contextSourceLinks: "\uB9C1\uD06C",
    contextSourceFolder: "\uD3F4\uB354",
    contextSourceTags: "\uD0DC\uADF8",
    contextSourceBacklinks: "\uBC31\uB9C1\uD06C",
    noticeNoAnswerToSave: "\uC800\uC7A5\uD560 \uB2F5\uBCC0\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noticeSavedAnswer: "\uB2F5\uBCC0\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4: {path}",
    noticeNoAnswerToAppend: "\uC774\uC5B4\uBD99\uC77C \uB2F5\uBCC0\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noticeAppendedAnswer: "{path} \uB178\uD2B8 \uD558\uB2E8\uC5D0 \uB2F5\uBCC0\uC744 \uCD94\uAC00\uD588\uC2B5\uB2C8\uB2E4.",
    noticeConversationCleared: "\uD604\uC7AC \uB300\uD654\uB97C \uBE44\uC6E0\uC2B5\uB2C8\uB2E4.",
    noticeThreadRenamed: "\uC2A4\uB808\uB4DC \uC774\uB984\uC744 \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4.",
    noticeThreadDeleted: "\uC2A4\uB808\uB4DC\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.",
    promptRenameThread: "\uC0C8 \uC2A4\uB808\uB4DC \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.",
    promptDeleteThread: "\uC774 \uC2A4\uB808\uB4DC\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694?",
    savedTitleNote: "# \uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8 \uB2F5\uBCC0",
    savedTitleAppend: "## \uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8 {now}",
    savedAnswerHeadingNote: "## \uB2F5\uBCC0",
    savedAnswerHeadingAppend: "### \uB2F5\uBCC0",
    savedSourcesHeadingNote: "## \uAC80\uC0C9\uB41C \uC18C\uC2A4",
    savedSourcesHeadingAppend: "### \uAC80\uC0C9\uB41C \uC18C\uC2A4",
    savedContextHeadingNote: "## \uC804\uB2EC\uD55C \uCEE8\uD14D\uC2A4\uD2B8",
    savedContextHeadingAppend: "### \uC804\uB2EC\uD55C \uCEE8\uD14D\uC2A4\uD2B8",
    savedSourceNote: "\uC6D0\uBCF8 \uB178\uD2B8",
    savedQuestion: "\uC9C8\uBB38",
    savedSavedAt: "\uC800\uC7A5 \uC2DC\uAC01",
    savedEmptyQuestion: "(\uC5C6\uC74C)",
    settingLanguageName: "\uC5B8\uC5B4",
    settingLanguageDesc: "UI \uC5B8\uC5B4\uC640 \uAE30\uBCF8 \uC751\uB2F5 \uC5B8\uC5B4\uB97C \uC124\uC815\uD569\uB2C8\uB2E4.",
    settingLanguageEnglish: "\uC601\uC5B4",
    settingLanguageKorean: "\uD55C\uAD6D\uC5B4",
    settingBackendName: "\uBC31\uC5D4\uB4DC URL",
    settingBackendDesc: "\uD50C\uB7EC\uADF8\uC778\uC774 \uC0AC\uC6A9\uD560 FastAPI \uBC31\uC5D4\uB4DC \uC8FC\uC18C\uC785\uB2C8\uB2E4.",
    settingAutoStartBackendName: "\uBC31\uC5D4\uB4DC \uC790\uB3D9 \uC2DC\uC791",
    settingAutoStartBackendDesc: "\uBC31\uC5D4\uB4DC\uAC00 \uAEBC\uC838 \uC788\uC73C\uBA74 \uC774 \uD50C\uB7EC\uADF8\uC778\uC5D0\uC11C \uC790\uB3D9\uC73C\uB85C \uC2E4\uD589\uC744 \uC2DC\uB3C4\uD569\uB2C8\uB2E4.",
    settingBackendPythonName: "\uBC31\uC5D4\uB4DC Python \uACBD\uB85C",
    settingBackendPythonDesc: "Obsidian\uC5D0\uC11C \uBC31\uC5D4\uB4DC\uB97C \uC2E4\uD589\uD560 Python \uC2E4\uD589 \uD30C\uC77C \uACBD\uB85C\uC785\uB2C8\uB2E4.",
    settingBackendScriptName: "\uBC31\uC5D4\uB4DC \uC2A4\uD06C\uB9BD\uD2B8 \uACBD\uB85C",
    settingBackendScriptDesc: "backend/main.py \uACBD\uB85C\uC785\uB2C8\uB2E4.",
    settingBackendWorkingDirName: "\uBC31\uC5D4\uB4DC \uC791\uC5C5 \uD3F4\uB354",
    settingBackendWorkingDirDesc: "\uBC31\uC5D4\uB4DC \uD504\uB85C\uC138\uC2A4 \uC2E4\uD589 \uC2DC \uC0AC\uC6A9\uD560 working directory \uC785\uB2C8\uB2E4.",
    settingProjectName: "\uAE30\uBCF8 \uD504\uB85C\uC81D\uD2B8",
    settingProjectDesc: "\uBC31\uC5D4\uB4DC\uB85C \uC804\uB2EC\uD560 \uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC785\uB2C8\uB2E4.",
    settingSaveFolderName: "\uC800\uC7A5 \uD3F4\uB354",
    settingSaveFolderDesc: "\uB2F5\uBCC0\uC744 \uC800\uC7A5\uD560 vault \uD3F4\uB354\uC785\uB2C8\uB2E4.",
    settingMaxContextName: "\uCD5C\uB300 \uCEE8\uD14D\uC2A4\uD2B8 \uB178\uD2B8 \uC218",
    settingMaxContextDesc: "\uC9C8\uBB38\uB9C8\uB2E4 \uD568\uAED8 \uBCF4\uB0BC \uC5F0\uACB0 \uB178\uD2B8 \uC218\uC758 \uC0C1\uD55C\uC785\uB2C8\uB2E4.",
    settingOpenModeName: "\uC18C\uC2A4 \uC5F4\uAE30 \uBC29\uC2DD",
    settingOpenModeDesc: "\uC18C\uC2A4 \uCE74\uB4DC\uB97C \uB20C\uB800\uC744 \uB54C \uD30C\uC77C\uC744 \uC5EC\uB294 \uBC29\uC2DD\uC785\uB2C8\uB2E4.",
    settingOpenModeCurrent: "\uD604\uC7AC \uD0ED",
    settingOpenModeSplit: "\uBD84\uD560 \uCC3D",
    settingOpenModeTab: "\uC0C8 \uD0ED",
    settingSplitDirectionName: "\uBD84\uD560 \uBC29\uD5A5",
    settingSplitDirectionDesc: "\uC18C\uC2A4 \uC5F4\uAE30 \uBC29\uC2DD\uC774 \uBD84\uD560 \uCC3D\uC77C \uB54C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
    settingDirectionLeft: "\uC67C\uCABD",
    settingDirectionRight: "\uC624\uB978\uCABD",
    settingDirectionDown: "\uC544\uB798",
    commandOpen: "\uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8 \uC5F4\uAE30",
    commandAskSelection: "\uC120\uD0DD \uC601\uC5ED\uC73C\uB85C \uB85C\uCEEC \uC5D0\uC774\uC804\uD2B8 \uC9C8\uBB38",
    commandSummarize: "\uD604\uC7AC \uB178\uD2B8 \uC694\uC57D\uD558\uAE30",
    commandOrganize: "\uD604\uC7AC \uB178\uD2B8 \uAD6C\uC870\uD654\uD558\uAE30",
    commandNextActions: "\uD604\uC7AC \uB178\uD2B8\uC5D0\uC11C \uB2E4\uC74C \uC561\uC158 \uCD94\uCD9C\uD558\uAE30",
    relationSameTopic: "\uAC19\uC740 \uC8FC\uC81C",
    relationReferences: "\uCC38\uACE0",
    relationSummarizes: "\uC694\uC57D",
    relationExpands: "\uD655\uC7A5",
    relationImplements: "\uAD6C\uD604",
    relationReviewOf: "\uD68C\uACE0",
    relationNextActionFor: "\uB2E4\uC74C \uC561\uC158",
    relationDecisionFor: "\uC758\uC0AC\uACB0\uC815",
    relationFollowUp: "\uD6C4\uC18D"
  }
};

const QUICK_ACTIONS = {
  en: {
    summary: {
      label: "Summarize",
      prompt: "Summarize the current note into concise bullet points. Preserve key claims, decisions, and open questions."
    },
    organize: {
      label: "Organize",
      prompt: "Rewrite the current note into a cleaner structure with headings and short bullets. Preserve meaning and call out any unclear or missing parts."
    },
    "next-actions": {
      label: "Next Actions",
      prompt: "Extract the practical next actions from the current note. Group them into Now, Next, and Later, and state what is missing if the note is ambiguous."
    }
  },
  ko: {
    summary: {
      label: "\uC694\uC57D",
      prompt: "\uD604\uC7AC \uB178\uD2B8\uB97C \uAC04\uACB0\uD55C \uD575\uC2EC bullet\uB85C \uC694\uC57D\uD574\uC918. \uC911\uC694\uD55C \uC8FC\uC7A5, \uACB0\uC815\uC0AC\uD56D, \uC5F4\uB9B0 \uC9C8\uBB38\uC744 \uC720\uC9C0\uD574\uC918."
    },
    organize: {
      label: "\uAD6C\uC870\uD654",
      prompt: "\uD604\uC7AC \uB178\uD2B8\uB97C \uB354 \uC77D\uAE30 \uC26C\uC6B4 \uAD6C\uC870\uB85C \uB2E4\uC2DC \uC815\uB9AC\uD574\uC918. \uC81C\uBAA9\uACFC \uC9E7\uC740 bullet\uC744 \uC0AC\uC6A9\uD558\uACE0, \uC758\uBBF8\uB294 \uC720\uC9C0\uD558\uBA74\uC11C \uBAA8\uD638\uD558\uAC70\uB098 \uBE60\uC9C4 \uBD80\uBD84\uB3C4 \uC9DA\uC5B4\uC918."
    },
    "next-actions": {
      label: "\uB2E4\uC74C \uC561\uC158",
      prompt: "\uD604\uC7AC \uB178\uD2B8\uC5D0\uC11C \uC2E4\uC9C8\uC801\uC778 \uB2E4\uC74C \uC561\uC158\uC744 \uCD94\uCD9C\uD574\uC918. \uC9C0\uAE08, \uB2E4\uC74C, \uB098\uC911\uC73C\uB85C \uB098\uB204\uACE0 \uC815\uBCF4\uAC00 \uBD80\uC871\uD558\uBA74 \uBB34\uC5C7\uC774 \uBE44\uC5B4 \uC788\uB294\uC9C0\uB3C4 \uC801\uC5B4\uC918."
    }
  }
};

const WORKFLOW_UI_STRINGS = {
  en: {
    buttonStop: "Stop",
    workflowsTitle: "Workflows",
    workflowsRefresh: "Reload Config",
    workflowsConfigReady: "Workflow config loaded.",
    workflowsConfigMissing: "Workflow config is not loaded yet.",
    workflowsConfigError: "Workflow config error: {message}",
    workflowsBusy: "{tool} is running...",
    logsTitle: "Workflow Logs ({count})",
    logsEmpty: "No workflow logs yet.",
    logsClear: "Clear Logs",
    toolGenerator: "Generator",
    toolTagger: "Tagger",
    toolIngest: "Ingest",
    toolChat: "Chat",
    toolLogs: "Logs",
    workflowDirectHint: "Runs directly from this plugin. Streamlit is optional.",
    generatorIntro: "Generate structured notes from local files.",
    generatorSectionFiles: "1) Files and Folders",
    generatorSectionSettings: "2) Prompt and Output",
    generatorSectionLogs: "Logs",
    generatorJob: "Job template",
    generatorManualJob: "Direct input",
    generatorRootFolder: "Vault root",
    generatorInputDir: "Input directory",
    generatorOutputDir: "Output directory",
    generatorSubject: "Subject",
    generatorMode: "Mode",
    generatorModeStandard: "Standard",
    generatorModeNoteRebuild: "Note Reconstruction",
    generatorSubjectRebuild: "Rebuilt title",
    generatorRebuildTitle: "Rebuild title",
    generatorRebuildTitleHelp: "Add a title reconstruction note alongside the selected reconstruction patterns.",
    generatorModel: "Model",
    generatorTemperature: "Temperature",
    generatorTargetSet: "Target set",
    generatorManualTargetSet: "Manual pattern selection",
    generatorPatterns: "Patterns",
    generatorFiles: "Files ({count})",
    generatorNoFiles: "No files loaded.",
    generatorLoadFiles: "Load Files",
    generatorRun: "Run Generator",
    generatorSelectedFiles: "Selected files: {count}",
    generatorEstimatedSize: "Estimated size: {size}",
    generatorEstimatedTokens: "Est. tokens: {count}",
    generatorSelectAllFolder: "Select all",
    generatorFolderBack: "Back to folders",
    generatorResolvedInput: "Resolved input path",
    generatorResolvedOutput: "Resolved output path",
    generatorStatusReady: "Ready",
    generatorStatusLoadingFiles: "Loading files...",
    generatorStatusRunning: "Generator running...",
    generatorStatusProgress: "Generator in progress ({progress}%)",
    generatorStatusCompleted: "Generation completed",
    generatorPreview: "Pattern Preview",
    generatorPreviewEmpty: "Select at least one pattern to preview prompts.",
    generatorPatternWorkspace: "Pattern Workspace",
    generatorPatternWorkspaceHelp: "Prompts can be edited from markdown notes inside the vault.",
    generatorOpenPatternFolder: "Open Workspace",
    generatorCreatePatternNote: "New Pattern Note",
    generatorPatternOpenNote: "Open Note",
    generatorPatternSourceYaml: "YAML",
    generatorPatternSourceObsidian: "OBSIDIAN",
    generatorPatternGroupUngrouped: "Ungrouped",
    generatorPatternConfigPath: "Config source",
    generatorPatternVaultPath: "Vault folder",
    generatorPatternOutputSuffix: "suffix {suffix}",
    generatorPatternSubjectPrefix: "subject prefix",
    taggerIntro: "Refresh frontmatter tags for summary/raw notes.",
    taggerIntroIndexed: "Rewrite the selected scope and rebuild vault-wide text, metadata, and link graph indices.",
    taggerSectionSettings: "1) Target Settings",
    taggerSectionRules: "Tag Rules",
    taggerSectionLogs: "Logs",
    workflowUseGeneratorSource: "Use Generator selection",
    workflowVaultWide: "Vault-wide",
    taggerTarget: "Target",
    taggerMode: "Mode",
    taggerRun: "Run Tagger",
    taggerStatusReady: "Ready",
    taggerStatusRunning: "Tagger running...",
    taggerIndexStatus: "Index Status",
    taggerIndexReady: "Vault-wide index ready",
    taggerIndexScope: "Index scope",
    taggerRewriteScope: "Rewrite scope",
    taggerNotes: "Notes",
    taggerGraphEdges: "Edges",
    taggerTokens: "Tokens",
    taggerManifestPath: "Manifest",
    taggerRulesHelp: "Manage canonical tags, synonym mapping, and scoring priorities from markdown notes in the vault.",
    taggerOpenRulesReadme: "Open Rules Guide",
    taggerOpenCanonicalTags: "Canonical Tags",
    taggerOpenSynonymMap: "Synonym Map",
    taggerOpenTaggingPriority: "Tagging Priority",
    taggerCanonicalCount: "{count} canonical tags",
    taggerSynonymCount: "{count} synonym entries",
    taggerSemanticLimit: "top {count}",
    taggerMinScore: "min score {score}",
    ingestIntro: "Rebuild or update indexed data from configured jobs.",
    ingestSectionProject: "1) Project Context",
    ingestSectionSettings: "2) Ingest Settings",
    ingestSectionLogs: "Logs",
    ingestJob: "Project",
    ingestAllJobs: "All",
    ingestResolvedInput: "Source path",
    ingestResolvedOutput: "Target path",
    ingestCollectionRaw: "Raw collection",
    ingestCollectionSummary: "Summary collection",
    ingestLayer: "Layer",
    ingestMode: "Mode",
    ingestPolicy: "Split policy",
    ingestChunkSize: "Chunk size",
    ingestOverlap: "Overlap",
    ingestHeadingLevels: "Heading levels",
    ingestCodeAttach: "Attach nearby code blocks",
    ingestRun: "Run Ingest",
    ingestStatusReady: "Ready",
    ingestStatusRunning: "Ingest running...",
    commonSummary: "Summary",
    commonRaw: "Raw",
    commonBoth: "Both",
    commonIncremental: "Incremental",
    commonReset: "Reset",
    commonCleanup: "Cleanup",
    commonAuto: "Auto",
    commonHeadings: "Headings",
    commonParagraph: "Paragraph",
    commonMinimal: "Minimal",
    noticeWorkflowConfigLoaded: "Workflow config loaded.",
    noticeWorkflowFilesLoaded: "Loaded files from {path}",
    noticeWorkflowConfigFailed: "Failed to load workflow config: {message}",
    noticeWorkflowFilesFailed: "Failed to load files: {message}",
    noticePatternWorkspaceMissing: "Pattern workspace path is not available yet.",
    noticePatternNoteCreated: "Created pattern note: {path}",
    noticeToolBusy: "Another task is already running.",
    noticeNoPatterns: "Select at least one pattern.",
    noticeNoSelectedFiles: "Select at least one file.",
    noticeNoInputDir: "Enter an input directory first.",
    noticeNoOutputDir: "Enter an output directory first.",
    noticeNoToolConfig: "Workflow config is not available yet.",
    noticeChatStopped: "Chat generation stopped.",
    noticeChatStopFailed: "Failed to stop chat: {message}",
    buttonRunInCurrentPanel: "Use in current panel"
  },
  ko: {
    buttonStop: "\uC911\uB2E8",
    workflowsTitle: "\uC6CC\uD06C\uD50C\uB85C\uC6B0",
    workflowsRefresh: "\uC124\uC815 \uB2E4\uC2DC \uBD88\uB7EC\uC624\uAE30",
    workflowsConfigReady: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.",
    workflowsConfigMissing: "\uC544\uC9C1 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    workflowsConfigError: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815 \uC624\uB958: {message}",
    workflowsBusy: "{tool} \uC791\uC5C5\uC774 \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4...",
    logsTitle: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB85C\uADF8 ({count})",
    logsEmpty: "\uC544\uC9C1 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB85C\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    logsClear: "\uB85C\uADF8 \uBE44\uC6B0\uAE30",
    toolGenerator: "Generator",
    toolTagger: "Tagger",
    toolIngest: "Ingest",
    toolChat: "Chat",
    toolLogs: "Logs",
    workflowDirectHint: "\uC774 \uD50C\uB7EC\uADF8\uC778 \uC548\uC5D0\uC11C \uBC14\uB85C \uC2E4\uD589\uB429\uB2C8\uB2E4. Streamlit\uC740 \uC120\uD0DD \uC0AC\uD56D\uC785\uB2C8\uB2E4.",
    generatorIntro: "\uB85C\uCEEC \uD30C\uC77C\uC744 \uAE30\uBC18\uC73C\uB85C \uAD6C\uC870\uD654\uB41C \uB178\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4.",
    generatorSectionFiles: "1) \uD3F4\uB354\uC640 \uD30C\uC77C \uC120\uD0DD",
    generatorSectionSettings: "2) \uD504\uB86C\uD504\uD2B8\uC640 \uCD9C\uB825 \uC124\uC815",
    generatorSectionLogs: "\uB85C\uADF8",
    generatorJob: "\uC791\uC5C5 \uD15C\uD50C\uB9BF",
    generatorManualJob: "\uC9C1\uC811 \uC124\uC815",
    generatorRootFolder: "\uBCFC\uD2B8 \uB8E8\uD2B8",
    generatorInputDir: "\uC785\uB825 \uACBD\uB85C",
    generatorOutputDir: "\uCD9C\uB825 \uACBD\uB85C",
    generatorSubject: "\uC8FC\uC81C",
    generatorMode: "\uBAA8\uB4DC",
    generatorModeStandard: "\uC77C\uBC18 \uC0DD\uC131",
    generatorModeNoteRebuild: "\uB178\uD2B8 \uC7AC\uAD6C\uC131",
    generatorSubjectRebuild: "\uC81C\uBAA9 \uC7AC\uAD6C\uC131",
    generatorRebuildTitle: "\uC81C\uBAA9 \uC7AC\uAD6C\uC131",
    generatorRebuildTitleHelp: "\uC120\uD0DD\uD55C \uC7AC\uAD6C\uC131 \uD328\uD134\uACFC \uD568\uAED8 \uC81C\uBAA9 \uC7AC\uAD6C\uC131 \uB178\uD2B8\uB97C \uCD94\uAC00\uB85C \uC0DD\uC131\uD569\uB2C8\uB2E4.",
    generatorModel: "\uBAA8\uB378",
    generatorTemperature: "\uC628\uB3C4",
    generatorTargetSet: "\uD0C0\uAE43 \uC138\uD2B8",
    generatorManualTargetSet: "\uD328\uD134 \uC9C1\uC811 \uC120\uD0DD",
    generatorPatterns: "\uD328\uD134",
    generatorFiles: "\uD30C\uC77C ({count})",
    generatorNoFiles: "\uBD88\uB7EC\uC628 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    generatorLoadFiles: "\uD30C\uC77C \uBD88\uB7EC\uC624\uAE30",
    generatorRun: "Generator \uC2E4\uD589",
    generatorSelectedFiles: "\uC120\uD0DD \uD30C\uC77C \uC218: {count}",
    generatorEstimatedSize: "\uC608\uC0C1 \uD06C\uAE30: {size}",
    generatorEstimatedTokens: "\uC608\uC0C1 \uD1A0\uD070: {count}",
    generatorSelectAllFolder: "\uC804\uCCB4 \uC120\uD0DD",
    generatorFolderBack: "\uD3F4\uB354 \uBAA9\uB85D\uC73C\uB85C",
    generatorResolvedInput: "\uC2E4\uC81C \uC785\uB825 \uACBD\uB85C",
    generatorResolvedOutput: "\uC2E4\uC81C \uCD9C\uB825 \uACBD\uB85C",
    generatorStatusReady: "\uC900\uBE44\uB428",
    generatorStatusLoadingFiles: "\uD30C\uC77C \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911...",
    generatorStatusRunning: "Generator \uC2E4\uD589 \uC911...",
    generatorStatusProgress: "Generator \uC9C4\uD589 \uC911 ({progress}%)",
    generatorStatusCompleted: "\uC0DD\uC131\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
    generatorPreview: "\uD328\uD134 \uBBF8\uB9AC\uBCF4\uAE30",
    generatorPreviewEmpty: "\uD504\uB86C\uD504\uD2B8 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uBCF4\uB824\uBA74 \uD328\uD134\uC744 \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD558\uC138\uC694.",
    generatorPatternWorkspace: "\uD328\uD134 \uC791\uC5C5\uACF5\uAC04",
    generatorPatternWorkspaceHelp: "Vault \uC548\uC758 Markdown \uB178\uD2B8\uC5D0\uC11C \uD328\uD134 \uD504\uB86C\uD504\uD2B8\uB97C \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    generatorOpenPatternFolder: "\uC791\uC5C5\uACF5\uAC04 \uC5F4\uAE30",
    generatorCreatePatternNote: "\uC0C8 \uD328\uD134 \uB178\uD2B8",
    generatorPatternOpenNote: "\uB178\uD2B8 \uC5F4\uAE30",
    generatorPatternSourceYaml: "YAML",
    generatorPatternSourceObsidian: "OBSIDIAN",
    generatorPatternGroupUngrouped: "\uBBF8\uBD84\uB958",
    generatorPatternConfigPath: "\uC6D0\uBCF8 \uC124\uC815",
    generatorPatternVaultPath: "Vault \uD3F4\uB354",
    generatorPatternOutputSuffix: "suffix {suffix}",
    generatorPatternSubjectPrefix: "subject prefix",
    taggerIntro: "summary/raw \uB178\uD2B8\uC758 frontmatter \uD0DC\uADF8\uB97C \uAC31\uC2E0\uD569\uB2C8\uB2E4.",
    taggerIntroIndexed: "\uC120\uD0DD\uD55C \uBC94\uC704\uC758 frontmatter\uB97C \uAC31\uC2E0\uD558\uACE0, vault \uC804\uCCB4\uC758 \uD14D\uC2A4\uD2B8/\uBA54\uD0C0\uB370\uC774\uD130/\uB9C1\uD06C \uADF8\uB798\uD504 \uC778\uB371\uC2A4\uB97C \uB2E4\uC2DC \uB9CC\uB4ED\uB2C8\uB2E4.",
    taggerSectionSettings: "1) \uB300\uC0C1 \uC124\uC815",
    taggerSectionRules: "\uD0DC\uADF8 \uADDC\uCE59",
    taggerSectionLogs: "\uB85C\uADF8",
    workflowUseGeneratorSource: "Generator \uC120\uD0DD \uC0AC\uC6A9",
    workflowVaultWide: "vault \uC804\uCCB4",
    taggerTarget: "\uB300\uC0C1",
    taggerMode: "\uBAA8\uB4DC",
    taggerRun: "Tagger \uC2E4\uD589",
    taggerStatusReady: "\uC900\uBE44\uB428",
    taggerStatusRunning: "Tagger \uC2E4\uD589 \uC911...",
    taggerIndexStatus: "\uC778\uB371\uC2A4 \uC0C1\uD0DC",
    taggerIndexReady: "vault \uC804\uCCB4 \uC778\uB371\uC2A4 \uC900\uBE44 \uC644\uB8CC",
    taggerIndexScope: "\uC778\uB371\uC2A4 \uBC94\uC704",
    taggerRewriteScope: "\uC7AC\uC791\uC131 \uBC94\uC704",
    taggerNotes: "\uB178\uD2B8",
    taggerGraphEdges: "\uC5E3\uC9C0",
    taggerTokens: "\uD1A0\uD070",
    taggerManifestPath: "\uB9E4\uB2C8\uD398\uC2A4\uD2B8",
    taggerRulesHelp: "Vault \uC548\uC758 Markdown \uB178\uD2B8\uC5D0\uC11C canonical tag, synonym map, tagging priority\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
    taggerOpenRulesReadme: "\uADDC\uCE59 \uAC00\uC774\uB4DC \uC5F4\uAE30",
    taggerOpenCanonicalTags: "Canonical Tags",
    taggerOpenSynonymMap: "Synonym Map",
    taggerOpenTaggingPriority: "Tagging Priority",
    taggerCanonicalCount: "canonical tags {count}\uAC1C",
    taggerSynonymCount: "synonym entries {count}\uAC1C",
    taggerSemanticLimit: "\uC0C1\uC704 {count}\uAC1C",
    taggerMinScore: "\uCD5C\uC18C \uC810\uC218 {score}",
    ingestIntro: "\uC124\uC815\uB41C \uD504\uB85C\uC81D\uD2B8 \uAE30\uC900\uC73C\uB85C \uC778\uB371\uC2A4\uB97C \uAC31\uC2E0\uD558\uAC70\uB098 \uC7AC\uAD6C\uCD95\uD569\uB2C8\uB2E4.",
    ingestSectionProject: "1) \uD504\uB85C\uC81D\uD2B8 \uC815\uBCF4",
    ingestSectionSettings: "2) \uC778\uC81C\uC2A4\uD2B8 \uC124\uC815",
    ingestSectionLogs: "\uB85C\uADF8",
    ingestJob: "\uD504\uB85C\uC81D\uD2B8",
    ingestAllJobs: "\uC804\uCCB4",
    ingestResolvedInput: "\uC6D0\uBCF8 \uACBD\uB85C",
    ingestResolvedOutput: "\uCD9C\uB825 \uACBD\uB85C",
    ingestCollectionRaw: "\uC6D0\uBB38 \uCEEC\uB809\uC158",
    ingestCollectionSummary: "\uC694\uC57D \uCEEC\uB809\uC158",
    ingestLayer: "\uB808\uC774\uC5B4",
    ingestMode: "\uBAA8\uB4DC",
    ingestPolicy: "\uBD84\uD560 \uC815\uCC45",
    ingestChunkSize: "\uCCAD\uD06C \uD06C\uAE30",
    ingestOverlap: "\uC624\uBC84\uB7A9",
    ingestHeadingLevels: "\uD5E4\uB529 \uB808\uBCA8",
    ingestCodeAttach: "\uC8FC\uBCC0 \uCF54\uB4DC \uBE14\uB85D \uD3EC\uD568",
    ingestRun: "Ingest \uC2E4\uD589",
    ingestStatusReady: "\uC900\uBE44\uB428",
    ingestStatusRunning: "Ingest \uC2E4\uD589 \uC911...",
    commonSummary: "\uC694\uC57D",
    commonRaw: "\uC6D0\uBB38",
    commonBoth: "\uC804\uCCB4",
    commonIncremental: "\uC99D\uBD84",
    commonReset: "\uCD08\uAE30\uD654",
    commonCleanup: "\uC815\uB9AC",
    commonAuto: "\uC790\uB3D9",
    commonHeadings: "\uD5E4\uB529",
    commonParagraph: "\uBB38\uB2E8",
    commonMinimal: "\uCD5C\uC18C",
    noticeWorkflowConfigLoaded: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.",
    noticeWorkflowFilesLoaded: "{path} \uACBD\uB85C\uC758 \uD30C\uC77C \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4.",
    noticeWorkflowConfigFailed: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {message}",
    noticeWorkflowFilesFailed: "\uD30C\uC77C \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {message}",
    noticePatternWorkspaceMissing: "\uD328\uD134 \uC791\uC5C5\uACF5\uAC04 \uACBD\uB85C\uB97C \uC544\uC9C1 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    noticePatternNoteCreated: "\uD328\uD134 \uB178\uD2B8\uB97C \uB9CC\uB4E4\uC5C8\uC2B5\uB2C8\uB2E4: {path}",
    noticeToolBusy: "\uB2E4\uB978 \uC791\uC5C5\uC774 \uC774\uBBF8 \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4.",
    noticeNoPatterns: "\uD328\uD134\uC744 \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD558\uC138\uC694.",
    noticeNoSelectedFiles: "\uD30C\uC77C\uC744 \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD558\uC138\uC694.",
    noticeNoInputDir: "\uC785\uB825 \uACBD\uB85C\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
    noticeNoOutputDir: "\uCD9C\uB825 \uACBD\uB85C\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.",
    noticeNoToolConfig: "\uC544\uC9C1 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    noticeChatStopped: "\uCC44\uD305 \uC0DD\uC131\uC744 \uC911\uB2E8\uD588\uC2B5\uB2C8\uB2E4.",
    noticeChatStopFailed: "\uCC44\uD305 \uC911\uB2E8 \uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {message}",
    buttonRunInCurrentPanel: "\uD604\uC7AC \uD328\uB110\uC5D0\uC11C \uC0AC\uC6A9"
  }
};

type ToolName = "chat" | "generator" | "tagger" | "ingest";
type ViewTab = "chat" | "generator" | "tagger" | "ingest" | "logs";

type ToolStreamChunk = {
  step?: string;
  message?: string;
  progress?: number;
};

type ToolConfig = {
  defaults?: {
    model?: string;
    temperature?: number;
  };
  model_options?: string[];
  jobs?: ToolJob[];
  patterns?: string[];
  pattern_previews?: Record<string, PatternPreview>;
  pattern_groups?: Record<string, string[]>;
  pattern_editor?: PatternEditorConfig;
  target_sets?: Record<string, string[]>;
  default_input_dir?: string;
  default_output_dir?: string;
  tagger_index_manifest?: {
    generated_at?: string;
    scope?: string;
    counts?: {
      notes?: number;
      graph_nodes?: number;
      graph_edges?: number;
      tokens?: number;
    };
    manifest_path?: string;
  };
  tagger_rules?: TaggerRulesConfig;
};

type ToolJob = {
  name: string;
  subject?: string;
  input_dir?: string;
  output_dir?: string;
  input_dir_resolved?: string;
  output_dir_resolved?: string;
  model?: string;
  temperature?: number;
  targets?: string[];
  ingest?: {
    enabled?: boolean;
    collection_raw?: string;
    collection_summary?: string;
  };
};

type PatternPreview = {
  system_role?: string;
  prompt_template?: string;
  source?: string;
  source_path?: string;
  editor_note_path?: string;
  groups?: string[];
  output_suffix?: string;
  use_subject_prefix?: boolean;
};

type PatternEditorConfig = {
  vault_dir?: string;
  readme_path?: string;
  config_path?: string;
};

type TaggerRulesConfig = {
  workspace?: {
    root?: string;
    rules_dir?: string;
    readme_path?: string;
    canonical_tags_path?: string;
    synonym_map_path?: string;
    tagging_priority_path?: string;
  };
  canonical_tag_count?: number;
  canonical_groups?: Record<string, number>;
  synonym_entries?: number;
  thresholds?: {
    semantic_tag_limit?: number;
    min_score?: number;
    min_ratio?: number;
  };
};

type WorkflowLogEntry = {
  tool: ToolName;
  message: string;
  timestamp: string;
};

type ToolFileEntry = {
  path: string;
  folder: string;
  folderLabel: string;
  folderParent: string;
  size: number;
};

type GeneratorRootEntry = {
  path: string;
  label: string;
  count: number;
  size: number;
};

type GeneratorMode = "standard" | "note_rebuild";

type GeneratorState = {
  jobName: string;
  mode: GeneratorMode;
  inputDir: string;
  outputDir: string;
  subject: string;
  rebuildTitle: boolean;
  modelName: string;
  temperature: number;
  targetSet: string;
  patternKeys: string[];
  filesPath: string;
  files: string[];
  fileEntries: ToolFileEntry[];
  selectedFiles: string[];
  focusedFolder: string;
  status: string;
  progress: number;
  fileError: string;
};

type TaggerState = {
  inputDir: string;
  target: "summary" | "raw" | "all";
  mode: "incremental" | "reset";
  status: string;
};

type IngestState = {
  job: string;
  inputDir: string;
  outputDir: string;
  layer: "summary" | "raw" | "both";
  mode: "incremental" | "reset" | "cleanup";
  policy: "auto" | "headings" | "paragraph" | "minimal";
  chunkSize: number;
  overlap: number;
  headingLevels: number[];
  codeAttach: boolean;
  status: string;
};

const MANUAL_JOB = "__manual__";
const MANUAL_TARGET_SET = "__manual__";
const GENERATOR_ROOT_SENTINEL = "__vault_root__";
const GENERATOR_MODE_STANDARD: GeneratorMode = "standard";
const GENERATOR_MODE_NOTE_REBUILD: GeneratorMode = "note_rebuild";
const NOTE_REBUILD_TARGET_SET = "노트 재구성";
const TITLE_REBUILD_PATTERN = "Title_Rebuild";

function createDefaultGeneratorState(): GeneratorState {
  return {
    jobName: MANUAL_JOB,
    mode: "standard",
    inputDir: "",
    outputDir: "",
    subject: "New Project",
    rebuildTitle: false,
    modelName: "qwen3.5:4b",
    temperature: 0.1,
    targetSet: MANUAL_TARGET_SET,
    patternKeys: [],
    filesPath: "",
    files: [],
    fileEntries: [],
    selectedFiles: [],
    focusedFolder: "",
    status: "",
    progress: 0,
    fileError: "",
  };
}

function createDefaultTaggerState(): TaggerState {
  return {
    inputDir: "",
    target: "summary",
    mode: "incremental",
    status: "",
  };
}

function createDefaultIngestState(): IngestState {
  return {
    job: "all",
    inputDir: "",
    outputDir: "",
    layer: "both",
    mode: "incremental",
    policy: "auto",
    chunkSize: 800,
    overlap: 100,
    headingLevels: [1, 2, 3],
    codeAttach: false,
    status: "",
  };
}

type StreamChunk = {
  step?: string;
  answer?: string;
  logs?: string[];
  sources?: StreamSource[];
  recommendations?: RecommendationItem[];
  route?: string;
  basis?: string;
  state?: {
    logs?: string[];
  };
};

type StreamSource = {
  path: string;
  name: string;
  layer: "summary" | "raw";
  score: number;
  snippet?: string;
  folder?: string;
  is_main?: boolean;
  source?: string;
  reason?: string;
  section_heading?: string;
  note_type?: string;
  doc_role?: string;
  project_id?: string;
  tags?: string[];
  external_ref_domains?: string[];
  relation_type?: string;
};

type RecommendationItem = {
  path: string;
  name?: string;
  relation_type?: string;
  confidence?: number;
  reason?: string;
  note_type?: string;
  doc_role?: string;
  project_id?: string;
  folder?: string;
  seed_titles?: string[];
};

type ChatTurn = {
  question: string;
  answer: string;
  basis?: string;
  route?: string;
  sources: StreamSource[];
  recommendations: RecommendationItem[];
  attachedFilePath: string;
  contextEntries: StoredContextEntry[];
  createdAt: string;
};

type ContextSource = "links" | "folder" | "tags" | "backlinks";

type ContextEntry = StoredContextEntry;

type SourceCardData = {
  label: string;
  path: string;
  badge: string;
  badgeClass: string;
  snippet?: string;
  reason?: string;
  secondaryBadge?: string;
  secondaryBadgeClass?: string;
  tertiaryBadge?: string;
  tertiaryBadgeClass?: string;
  quaternaryBadge?: string;
  quaternaryBadgeClass?: string;
  hint: string;
};

class LocalAgentView extends ItemView {
  plugin: LocalAgentPlugin;
  statusEl!: HTMLDivElement;
  chatLogEl!: HTMLDivElement;
  questionEl!: HTMLTextAreaElement;
  composeRowEl!: HTMLDivElement;
  chatMetaEl!: HTMLDivElement;
  threadRowEl!: HTMLDivElement;
  chatTabPickerEl!: HTMLDivElement;
  chatTabButtonEl!: HTMLButtonElement;
  chatThreadMenuButtonEl!: HTMLButtonElement;
  quickActionSuggestionsEl!: HTMLDivElement;
  contextEl!: HTMLDivElement;
  tabRowEl!: HTMLDivElement;
  tabContentEl!: HTMLDivElement;
  chatTabEl!: HTMLDivElement;
  generatorTabEl!: HTMLDivElement;
  taggerTabEl!: HTMLDivElement;
  ingestTabEl!: HTMLDivElement;
  logsTabEl!: HTMLDivElement;
  sentContextDetailsEl!: HTMLDetailsElement;
  sourceDetailsEl!: HTMLDetailsElement;
  recommendationDetailsEl!: HTMLDetailsElement;
  chatActionButton!: HTMLButtonElement;
  backendControlsEl!: HTMLDetailsElement;
  backendStartButton!: HTMLButtonElement;
  backendStopButton!: HTMLButtonElement;
  backendRestartButton!: HTMLButtonElement;
  openApiButton!: HTMLButtonElement;
  conversationActionsEl!: HTMLDetailsElement;
  clearConversationButton!: HTMLButtonElement;
  appendButton!: HTMLButtonElement;
  saveButton!: HTMLButtonElement;
  generatorPanelEl!: HTMLDivElement;
  taggerPanelEl!: HTMLDivElement;
  ingestPanelEl!: HTMLDivElement;
  workflowLogsPanelEl!: HTMLDivElement;
  tabButtons = new Map<ViewTab, HTMLButtonElement>();
  quickActionButtons: HTMLButtonElement[] = [];
  abortController: AbortController | null = null;
  activeRequest: http.ClientRequest | null = null;
  activeThreadId = "";
  renderedOutput = "";
  lastQuestion = "";
  activeSessionId = "";
  currentFilePath = "";
  chatSeenLogs = new Set<string>();
  chatTurns: ChatTurn[] = [];
  lastEnterSubmitAt = 0;
  currentContextEntries: ContextEntry[] = [];
  backendSources: StreamSource[] = [];
  backendRecommendations: RecommendationItem[] = [];
  answerBasis = "";
  runningTask: ToolName | null = null;
  activeTab: ViewTab = "chat";
  workflowLogs: WorkflowLogEntry[] = [];
  generatorLogs: string[] = [];
  taggerLogs: string[] = [];
  ingestLogs: string[] = [];
  toolConfig: ToolConfig | null = null;
  toolConfigInitialized = false;
  toolConfigError = "";
  backendReady = false;
  backendPollStarted = false;
  backendLaunchPromise: Promise<boolean> | null = null;
  lastAutoStartAttempt = 0;
  autoStartSuppressed = false;
  generatorState: GeneratorState = createDefaultGeneratorState();
  taggerState: TaggerState = createDefaultTaggerState();
  ingestState: IngestState = createDefaultIngestState();

  constructor(leaf: WorkspaceLeaf, plugin: LocalAgentPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_LOCAL_AGENT;
  }

  getDisplayText(): string {
    return this.plugin.t("viewDisplayName");
  }

  async onOpen(): Promise<void> {
    this.render();
    this.initializeThreadState();
    await this.refreshContext(true);
    this.initializeToolDefaults(true);
    await this.loadGeneratorFiles();
  }

  async onClose(): Promise<void> {
    this.backendPollStarted = false;
    this.abortActiveRequest();
  }

  t(key: string, vars?: TranslationVars): string {
    return this.plugin.t(key, vars);
  }

  initializeThreadState(): void {
    this.plugin.ensureChatThreads();
    this.activeThreadId = this.plugin.activeChatThreadId;
    this.syncThreadStateFromPlugin();
  }

  syncThreadStateFromPlugin(): void {
    const activeThread = this.plugin.getChatThread(this.activeThreadId) ?? this.plugin.chatThreads[0] ?? null;
    if (!activeThread) {
      this.chatTurns = [];
      this.currentContextEntries = [];
      this.backendSources = [];
      this.backendRecommendations = [];
      this.answerBasis = "";
      this.renderedOutput = "";
      this.lastQuestion = "";
      this.renderThreadRow();
      return;
    }

    this.activeThreadId = activeThread.id;
    this.plugin.activeChatThreadId = activeThread.id;
    this.chatTurns = (activeThread.turns ?? []).map((turn) => ({
      question: turn.question ?? "",
      answer: turn.answer ?? "",
      basis: turn.basis ?? "",
      route: turn.route ?? "",
      sources: Array.isArray(turn.sources) ? turn.sources : [],
      recommendations: Array.isArray(turn.recommendations) ? turn.recommendations : [],
      attachedFilePath: turn.attachedFilePath ?? "",
      contextEntries: Array.isArray(turn.contextEntries) ? turn.contextEntries : [],
      createdAt: turn.createdAt ?? new Date().toISOString(),
    }));
    activeThread.turns = this.chatTurns as StoredChatTurn[];
    const latestStateTurn = this.getLatestStateTurn();
    const latestTurn = this.getLatestCompletedTurn();
    this.currentContextEntries = latestStateTurn?.contextEntries ?? [];
    this.backendSources = latestStateTurn?.sources ?? [];
    this.backendRecommendations = latestStateTurn?.recommendations ?? [];
    this.answerBasis = latestTurn?.basis ?? "";
    this.renderedOutput = latestTurn?.answer ?? "";
    this.lastQuestion = latestStateTurn?.question ?? "";
    this.renderThreadRow();
  }

  async setActiveThread(threadId: string): Promise<void> {
    if (threadId === this.activeThreadId) {
      return;
    }
    const thread = this.plugin.getChatThread(threadId);
    if (thread) {
      thread.updatedAt = new Date().toISOString();
      this.plugin.sortChatThreadsByRecent();
    }
    this.activeThreadId = threadId;
    this.plugin.activeChatThreadId = threadId;
    this.syncThreadStateFromPlugin();
    if (this.questionEl) {
      this.questionEl.value = "";
    }
    await this.plugin.saveSettings();
    await this.renderOutput();
    await this.renderContextPanels();
    this.updateChatActionButtonState();
  }

  async persistActiveThreadState(renderThreadRow = true): Promise<void> {
    const threadRecord = this.plugin.getChatThread(this.activeThreadId);
    if (!threadRecord) {
      return;
    }
    threadRecord.turns = this.chatTurns as StoredChatTurn[];
    threadRecord.updatedAt = new Date().toISOString();
    this.plugin.sortChatThreadsByRecent();
    if (renderThreadRow) {
      this.renderThreadRow();
    }
    await this.plugin.saveSettings();
  }

  getThreadTurnCount(thread: ChatThreadRecord): number {
    return (thread.turns ?? []).filter((turn) => {
      return Boolean(turn.question?.trim() || turn.answer?.trim());
    }).length;
  }

  formatThreadTimestamp(iso: string): string {
    const value = new Date(iso);
    if (!Number.isFinite(value.getTime())) {
      return "";
    }
    const now = new Date();
    const sameDay =
      value.getFullYear() === now.getFullYear()
      && value.getMonth() === now.getMonth()
      && value.getDate() === now.getDate();
    const locale = this.plugin.language() === "ko" ? "ko-KR" : "en-US";
    const options: Intl.DateTimeFormatOptions = sameDay
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat(locale, options).format(value);
  }

  getThreadMetaLabel(thread: ChatThreadRecord): string {
    const turns = this.t("threadTurns", { count: this.getThreadTurnCount(thread) });
    const timestamp = this.formatThreadTimestamp(thread.updatedAt || thread.createdAt);
    return timestamp ? `${turns} · ${timestamp}` : turns;
  }

  async createNewThread(): Promise<void> {
    const thread = this.plugin.createChatThread();
    this.plugin.chatThreads.unshift(thread);
    this.plugin.sortChatThreadsByRecent();
    this.activeThreadId = thread.id;
    this.plugin.activeChatThreadId = thread.id;
    this.syncThreadStateFromPlugin();
    if (this.questionEl) {
      this.questionEl.value = "";
    }
    await this.plugin.saveSettings();
    await this.renderOutput();
    await this.renderContextPanels();
    this.updateChatActionButtonState();
  }

  async renameActiveThread(): Promise<void> {
    const thread = this.plugin.getChatThread(this.activeThreadId);
    if (!thread) {
      return;
    }
    const nextTitle = window.prompt(this.t("promptRenameThread"), thread.title || this.t("threadUntitled"))?.trim();
    if (!nextTitle) {
      return;
    }
    thread.title = nextTitle;
    thread.updatedAt = new Date().toISOString();
    this.plugin.sortChatThreadsByRecent();
    this.renderThreadRow();
    await this.plugin.saveSettings();
    new Notice(this.t("noticeThreadRenamed"));
  }

  async deleteActiveThread(): Promise<void> {
    const thread = this.plugin.getChatThread(this.activeThreadId);
    if (!thread) {
      return;
    }
    const ok = window.confirm(this.t("promptDeleteThread"));
    if (!ok) {
      return;
    }

    this.plugin.chatThreads = this.plugin.chatThreads.filter((candidate) => candidate.id !== thread.id);
    this.plugin.ensureChatThreads();
    this.activeThreadId = this.plugin.activeChatThreadId;
    this.syncThreadStateFromPlugin();
    if (this.questionEl) {
      this.questionEl.value = "";
    }
    await this.plugin.saveSettings();
    await this.renderOutput();
    await this.renderContextPanels();
    this.updateChatActionButtonState();
    new Notice(this.t("noticeThreadDeleted"));
  }

  renderThreadRow(): void {
    if (!this.threadRowEl) {
      return;
    }
    this.threadRowEl.empty();

    const sortedThreads = [...this.plugin.chatThreads].sort((a, b) => {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
    const activeThread = sortedThreads.find((thread) => thread.id === this.activeThreadId) ?? sortedThreads[0] ?? null;
    const activeTitle = activeThread?.title || this.t("threadUntitled");
    const activeMeta = activeThread ? this.getThreadMetaLabel(activeThread) : "";
    if (this.chatThreadMenuButtonEl) {
      this.chatThreadMenuButtonEl.setAttribute("title", `${activeTitle}${activeMeta ? `\n${activeMeta}` : ""}`);
    }

    const toolbarEl = this.threadRowEl.createDiv({ cls: "ola-thread-menu-toolbar" });
    const newButton = toolbarEl.createEl("button", {
      cls: "ola-thread-new",
      text: `+ ${this.t("threadNew")}`,
    });
    newButton.addEventListener("click", () => {
      this.closeChatThreadPicker();
      void this.createNewThread();
    });
    const titleEl = toolbarEl.createDiv({ cls: "ola-thread-menu-current" });
    titleEl.createDiv({ cls: "ola-thread-menu-current-title", text: activeTitle });
    if (activeMeta) {
      titleEl.createDiv({ cls: "ola-thread-menu-current-meta", text: activeMeta });
    }

    const listEl = this.threadRowEl.createDiv({ cls: "ola-thread-menu-list" });

    for (const thread of sortedThreads) {
      const title = thread.title || this.t("threadUntitled");
      const meta = this.getThreadMetaLabel(thread);
      const button = listEl.createEl("button", { cls: "ola-thread-menu-item" });
      button.classList.toggle("is-active", thread.id === this.activeThreadId);
      button.setAttribute("title", `${title}${meta ? `\n${meta}` : ""}`);
      button.createDiv({ cls: "ola-thread-menu-item-title", text: title });
      button.createDiv({ cls: "ola-thread-menu-item-meta", text: meta });
      button.addEventListener("click", () => {
        this.closeChatThreadPicker();
        void this.setActiveThread(thread.id);
      });
    }

    if (sortedThreads.length > 0) {
      const toolbarEl = this.threadRowEl.createDiv({ cls: "ola-thread-menu-actions" });
      const renameButton = toolbarEl.createEl("button", { text: this.t("buttonRenameThread") });
      const deleteButton = toolbarEl.createEl("button", { text: this.t("buttonDeleteThread") });
      renameButton.addEventListener("click", () => {
        this.closeChatThreadPicker();
        void this.renameActiveThread();
      });
      deleteButton.addEventListener("click", () => {
        this.closeChatThreadPicker();
        void this.deleteActiveThread();
      });
    }
  }

  closeChatThreadPicker(): void {
    this.chatTabPickerEl?.classList.remove("is-open");
  }

  render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("ola-root");
    this.quickActionButtons = [];
    this.tabButtons.clear();

    const headerShell = contentEl.createDiv({ cls: "ola-header-shell" });
    const headerBar = headerShell.createDiv({ cls: "ola-header-bar" });
    headerBar.createEl("h3", { cls: "ola-panel-title", text: this.t("panelTitle") });
    const headerActions = headerBar.createDiv({ cls: "ola-header-actions" });
    this.statusEl = headerActions.createDiv({
      cls: "ola-status",
      text: this.plugin.settings.autoStartBackend ? this.t("statusIdle") : this.t("statusBackendManual"),
    });
    this.backendControlsEl = headerActions.createEl("details", { cls: "ola-backend-details" });
    this.backendControlsEl.createEl("summary", {
      cls: "ola-backend-summary",
      text: this.t("buttonBackendControls"),
    });
    this.backendControlsEl.setAttribute("title", "Backend");
    const backendToolbar = this.backendControlsEl.createDiv({ cls: "ola-backend-toolbar" });
    this.backendStartButton = backendToolbar.createEl("button", { text: this.t("buttonBackendStart") });
    this.backendRestartButton = backendToolbar.createEl("button", { text: this.t("buttonBackendRestart") });
    this.backendStopButton = backendToolbar.createEl("button", { text: this.t("buttonBackendStop") });
    this.openApiButton = backendToolbar.createEl("button", { text: this.t("buttonOpenBackendApi") });
    this.backendStartButton.addEventListener("click", () => {
      void this.startBackend(true);
    });
    this.backendRestartButton.addEventListener("click", () => {
      void this.restartBackend();
    });
    this.backendStopButton.addEventListener("click", () => {
      void this.stopBackend(true);
    });
    this.openApiButton.addEventListener("click", () => {
      this.openBackendPage("/docs");
    });
    this.tabRowEl = headerShell.createDiv({ cls: "ola-tab-row" });
    this.addChatTabButton(this.t("toolChat"));
    this.addTabButton("generator", this.t("toolGenerator"));
    this.addTabButton("tagger", this.t("toolTagger"));
    this.addTabButton("ingest", this.t("toolIngest"));
    this.addTabButton("logs", this.t("toolLogs"));
    this.registerDomEvent(document, "click", (event) => {
      if (!this.chatTabPickerEl) {
        return;
      }
      if (this.chatTabPickerEl.contains(event.target as Node)) {
        return;
      }
      this.closeChatThreadPicker();
    });

    this.tabContentEl = contentEl.createDiv({ cls: "ola-tab-content" });
    this.chatTabEl = this.tabContentEl.createDiv({ cls: "ola-tab-panel ola-tab-panel--chat" });
    this.generatorTabEl = this.tabContentEl.createDiv({ cls: "ola-tab-panel" });
    this.taggerTabEl = this.tabContentEl.createDiv({ cls: "ola-tab-panel" });
    this.ingestTabEl = this.tabContentEl.createDiv({ cls: "ola-tab-panel" });
    this.logsTabEl = this.tabContentEl.createDiv({ cls: "ola-tab-panel" });

    this.chatMetaEl = this.chatTabEl.createDiv({ cls: "ola-chat-meta" });
    this.contextEl = this.chatMetaEl.createDiv({ cls: "ola-context", text: this.t("contextNoNoteSelected") });
    this.sentContextDetailsEl = this.chatMetaEl.createEl("details", { cls: "ola-meta-panel" });
    this.sentContextDetailsEl.classList.add("ola-meta-panel--slim");
    this.sourceDetailsEl = this.chatMetaEl.createEl("details", { cls: "ola-meta-panel" });
    this.sourceDetailsEl.classList.add("ola-meta-panel--slim");
    this.recommendationDetailsEl = this.chatMetaEl.createEl("details", { cls: "ola-meta-panel" });
    this.recommendationDetailsEl.classList.add("ola-meta-panel--slim");
    this.chatLogEl = this.chatTabEl.createDiv({ cls: "ola-chat-log" });
    const conversationActionWrap = this.chatTabEl.createDiv({ cls: "ola-conversation-actions" });
    this.conversationActionsEl = conversationActionWrap.createEl("details", { cls: "ola-conversation-menu" });
    const conversationSummaryEl = this.conversationActionsEl.createEl("summary", {
      cls: "ola-conversation-summary",
      text: "⋮",
    });
    conversationSummaryEl.setAttribute("title", this.t("buttonConversationActions"));
    const conversationToolbar = this.conversationActionsEl.createDiv({ cls: "ola-conversation-toolbar" });
    this.clearConversationButton = conversationToolbar.createEl("button", { text: this.t("buttonClearConversation") });
    this.appendButton = conversationToolbar.createEl("button", { text: this.t("buttonAppendToNote") });
    this.saveButton = conversationToolbar.createEl("button", { text: this.t("buttonSaveNewNote") });
    this.clearConversationButton.addEventListener("click", () => {
      void this.clearConversation();
    });
    this.appendButton.addEventListener("click", () => {
      void this.appendAnswerToCurrentNote();
    });
    this.saveButton.addEventListener("click", () => {
      void this.saveAnswer();
    });

    const controlsEl = this.chatTabEl.createDiv({ cls: "ola-controls" });
    this.composeRowEl = controlsEl.createDiv({ cls: "ola-compose-row" });
    const composeInputWrap = this.composeRowEl.createDiv({ cls: "ola-compose-input" });
    this.questionEl = composeInputWrap.createEl("textarea", {
      attr: {
        placeholder: this.t("questionPlaceholder"),
      },
    });
    this.questionEl.setAttribute("rows", "4");
    this.quickActionSuggestionsEl = composeInputWrap.createDiv({ cls: "ola-compose-suggestions" });
    this.addQuickActionButton(this.quickActionSuggestionsEl, "summary", "ola-compose-suggestion");
    this.addQuickActionButton(this.quickActionSuggestionsEl, "organize", "ola-compose-suggestion");
    this.addQuickActionButton(this.quickActionSuggestionsEl, "next-actions", "ola-compose-suggestion");
    this.chatActionButton = this.composeRowEl.createEl("button", { cls: "ola-chat-action-button", text: "➤" });
    this.chatActionButton.addEventListener("click", () => {
      if (this.runningTask === "chat") {
        void this.stopChat();
        return;
      }
      void this.runQuery();
    });
    this.questionEl.addEventListener("input", () => {
      this.updateChatActionButtonState();
    });
    this.questionEl.addEventListener("keydown", (event) => {
      this.handleQuestionSubmitKey(event);
    }, true);

    const generatorScrollEl = this.generatorTabEl.createDiv({ cls: "ola-tab-scroll" });
    const taggerScrollEl = this.taggerTabEl.createDiv({ cls: "ola-tab-scroll" });
    const ingestScrollEl = this.ingestTabEl.createDiv({ cls: "ola-tab-scroll" });
    const logsScrollEl = this.logsTabEl.createDiv({ cls: "ola-tab-scroll" });

    this.generatorPanelEl = generatorScrollEl.createDiv({ cls: "ola-meta-panel ola-workflow-panel" });
    this.taggerPanelEl = taggerScrollEl.createDiv({ cls: "ola-meta-panel ola-workflow-panel" });
    this.ingestPanelEl = ingestScrollEl.createDiv({ cls: "ola-meta-panel ola-workflow-panel" });
    this.workflowLogsPanelEl = logsScrollEl.createDiv({ cls: "ola-meta-panel ola-workflow-panel" });

    void this.renderOutput();
    void this.renderContextPanels();
    this.renderThreadRow();
    void this.renderWorkflowPanels();
    this.renderTabState();
    this.applyBusyState();
    this.updateChatActionButtonState();
  }

  addQuickActionButton(containerEl: HTMLElement, key: QuickActionKey, cls = "ola-quick-action"): void {
    const config = this.plugin.getQuickAction(key);
    const button = containerEl.createEl("button", {
      cls,
      text: config.label,
    });
    this.quickActionButtons.push(button);
    button.addEventListener("click", () => {
      void this.runQuickAction(key);
    });
  }

  addChatTabButton(label: string): void {
    this.chatTabPickerEl = this.tabRowEl.createDiv({ cls: "ola-tab-chat-group" });
    const triggerEl = this.chatTabPickerEl.createDiv({ cls: "ola-tab-chat-trigger" });
    this.chatTabButtonEl = triggerEl.createEl("button", {
      cls: "ola-tab-button ola-tab-button--chat-main",
      text: label,
    });
    this.chatTabButtonEl.addEventListener("click", (event) => {
      event.stopPropagation();
      this.setActiveTab("chat");
      this.closeChatThreadPicker();
    });
    this.chatThreadMenuButtonEl = triggerEl.createEl("button", {
      cls: "ola-tab-thread-toggle",
      text: "⋮",
    });
    this.chatThreadMenuButtonEl.setAttribute("aria-label", this.t("buttonConversationActions"));
    this.chatThreadMenuButtonEl.addEventListener("click", (event) => {
      event.stopPropagation();
      this.setActiveTab("chat");
      this.chatTabPickerEl.classList.toggle("is-open", !this.chatTabPickerEl.classList.contains("is-open"));
    });
    this.threadRowEl = this.chatTabPickerEl.createDiv({ cls: "ola-thread-menu" });
    this.tabButtons.set("chat", this.chatTabButtonEl);
  }

  addTabButton(tab: ViewTab, label: string): void {
    const button = this.tabRowEl.createEl("button", {
      cls: "ola-tab-button",
      text: label,
    });
    button.addEventListener("click", () => {
      this.setActiveTab(tab);
    });
    this.tabButtons.set(tab, button);
  }

  setActiveTab(tab: ViewTab): void {
    this.activeTab = tab;
    if (tab !== "chat") {
      this.closeChatThreadPicker();
    }
    this.renderTabState();
  }

  renderTabState(): void {
    const panels: Record<ViewTab, HTMLElement> = {
      chat: this.chatTabEl,
      generator: this.generatorTabEl,
      tagger: this.taggerTabEl,
      ingest: this.ingestTabEl,
      logs: this.logsTabEl,
    };
    for (const [tab, button] of this.tabButtons.entries()) {
      button.classList.toggle("is-active", tab === this.activeTab);
      panels[tab].classList.toggle("is-active", tab === this.activeTab);
    }
    this.chatTabPickerEl?.classList.toggle("is-active", this.activeTab === "chat");
  }

  async getJson<T>(path: string): Promise<T> {
    const response = await requestUrl({
      url: `${this.plugin.settings.backendUrl}${path}`,
      method: "GET",
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json as T;
  }

  async postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const response = await requestUrl({
      url: `${this.plugin.settings.backendUrl}${path}`,
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json as T;
  }

  recordWorkflowLog(tool: ToolName, message: string): void {
    const line = message.trim();
    if (!line) {
      return;
    }
    this.workflowLogs.unshift({
      tool,
      message: line,
      timestamp: new Date().toLocaleTimeString(this.plugin.getLocale()),
    });
    this.workflowLogs = this.workflowLogs.slice(0, 200);
    void this.renderWorkflowLogsPanel();
  }

  getToolLabel(tool: ToolName): string {
    return this.t(this.getToolKey(tool));
  }

  getToolKey(tool: ToolName | ViewTab): string {
    const keyMap: Record<ToolName | ViewTab, string> = {
      chat: "toolChat",
      generator: "toolGenerator",
      tagger: "toolTagger",
      ingest: "toolIngest",
      logs: "toolLogs",
    };
    return keyMap[tool];
  }

  openBackendPage(path: string): void {
    const base = this.plugin.settings.backendUrl.replace(/\/+$/, "");
    const target = `${base}${path}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  async refreshContext(force = false): Promise<void> {
    const file = this.plugin.app.workspace.getActiveFile();
    if (!file) {
      this.currentFilePath = "";
      this.contextEl.setText(this.t("contextChatReady"));
      return;
    }

    if (!force && this.currentFilePath === file.path) {
      return;
    }

    this.currentFilePath = file.path;
    this.contextEl.setText(
      this.t("contextCurrentNote", {
        path: file.name,
      }),
    );
    await this.renderContextPanels();
  }

  async refreshViewState(): Promise<void> {
    await this.refreshContext(true);
    await this.refreshBackendState(true);
  }

  ensureBackendPolling(): void {
    if (this.backendPollStarted) {
      return;
    }
    this.backendPollStarted = true;
    this.registerInterval(
      window.setInterval(() => {
        void this.refreshBackendState();
      }, 10000),
    );
  }

  async refreshBackendState(forceConfigReload = false): Promise<boolean> {
    const wasReady = this.backendReady;
    let isReady = await this.checkBackend();
    if (!isReady && this.shouldAutoStartBackend()) {
      isReady = await this.startBackend(false);
    }
    this.backendReady = isReady;
    if (isReady && (forceConfigReload || !wasReady || !this.toolConfig || Boolean(this.toolConfigError))) {
      await this.loadToolConfig(forceConfigReload);
    }
    if (isReady) {
      this.ensureBackendPolling();
    }
    this.applyBusyState();
    return isReady;
  }

  shouldAutoStartBackend(): boolean {
    if (!this.plugin.settings.autoStartBackend || this.runningTask || this.autoStartSuppressed) {
      return false;
    }
    return Date.now() - this.lastAutoStartAttempt > 30000;
  }

  async isBackendHealthy(): Promise<boolean> {
    try {
      const data = await this.getJson<{ engine?: string; status?: string }>("/health");
      this.statusEl.setText(
        this.t("statusBackendReady", { engine: data.engine ?? data.status ?? "unknown" }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async waitForBackendReady(timeoutMs = 90000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.isBackendHealthy()) {
        return true;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    return false;
  }

  async runShell(command: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
    return await new Promise((resolve) => {
      const child = spawn(command, args, { windowsHide: true });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", (error) => {
        stderr += error.message;
        resolve({ code: 1, stdout, stderr });
      });
      child.on("close", (code) => {
        resolve({ code: code ?? 0, stdout, stderr });
      });
    });
  }

  async findBackendProcessIds(): Promise<number[]> {
    const scriptPath = this.plugin.settings.backendScriptPath.trim();
    if (!scriptPath) {
      return [];
    }

    if (process.platform === "win32") {
      const psCommand = [
        `$script = ${JSON.stringify(scriptPath)};`,
        "Get-CimInstance Win32_Process |",
        "Where-Object { ($_.Name -eq 'python.exe' -or $_.Name -eq 'pythonw.exe') -and ($_.CommandLine -match [regex]::Escape($script) -or $_.CommandLine -match 'backend[\\\\/]main\\.py') } |",
        "ForEach-Object { $_.ProcessId }",
      ].join(" ");
      const result = await this.runShell("powershell.exe", ["-NoProfile", "-Command", psCommand]);
      return result.stdout
        .split(/\r?\n/)
        .map((line) => Number.parseInt(line.trim(), 10))
        .filter((value) => Number.isFinite(value));
    }

    const result = await this.runShell("pgrep", ["-f", scriptPath]);
    return result.stdout
      .split(/\r?\n/)
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter((value) => Number.isFinite(value));
  }

  async stopBackendProcessIds(processIds: number[]): Promise<void> {
    if (processIds.length === 0) {
      return;
    }

    if (process.platform === "win32") {
      const psCommand = processIds
        .map((processId) => `Stop-Process -Id ${processId} -Force -ErrorAction SilentlyContinue`)
        .join("; ");
      await this.runShell("powershell.exe", ["-NoProfile", "-Command", psCommand]);
      return;
    }

    for (const processId of processIds) {
      await this.runShell("kill", ["-9", String(processId)]);
    }
  }

  async startBackend(manual: boolean): Promise<boolean> {
    if (this.backendLaunchPromise) {
      return await this.backendLaunchPromise;
    }

    const configuredPythonPath = this.plugin.settings.backendPythonPath.trim();
    const scriptPath = this.plugin.settings.backendScriptPath.trim();
    const workingDir = this.plugin.settings.backendWorkingDir.trim() || DEFAULT_SETTINGS.backendWorkingDir;
    if (!configuredPythonPath || !scriptPath || !existsSync(configuredPythonPath) || !existsSync(scriptPath)) {
      if (manual) {
        new Notice(this.t("noticeBackendPathsMissing"));
      }
      this.statusEl.setText(this.t("statusBackendOffline", { message: this.t("noticeBackendPathsMissing") }));
      return false;
    }

    let pythonPath = configuredPythonPath;
    if (process.platform === "win32" && configuredPythonPath.toLowerCase().endsWith("\\pythonw.exe")) {
      const pythonExePath = configuredPythonPath.slice(0, -11) + "\\python.exe";
      if (existsSync(pythonExePath)) {
        pythonPath = pythonExePath;
      }
    }

    this.backendLaunchPromise = (async () => {
      try {
        if (await this.isBackendHealthy()) {
          this.autoStartSuppressed = false;
          if (manual) {
            new Notice(this.t("noticeBackendAlreadyRunning"));
          }
          return true;
        }

        const existing = await this.findBackendProcessIds();
        this.lastAutoStartAttempt = Date.now();
        this.statusEl.setText(this.t("statusBackendStarting"));
        if (existing.length > 0) {
          await this.stopBackendProcessIds(existing);
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }

        if (process.platform === "win32") {
          const psCommand = [
            `$python = ${JSON.stringify(pythonPath)};`,
            `$script = ${JSON.stringify(scriptPath)};`,
            `$workdir = ${JSON.stringify(workingDir)};`,
            "Start-Process -FilePath $python -ArgumentList @('-u', $script) -WorkingDirectory $workdir -WindowStyle Hidden | Out-Null",
          ].join(" ");
          const child = spawn("powershell.exe", ["-NoProfile", "-Command", psCommand], {
            cwd: workingDir,
            detached: true,
            stdio: "ignore",
            windowsHide: true,
          });
          child.unref();
        } else {
          const child = spawn(pythonPath, ["-u", scriptPath], {
            cwd: workingDir,
            detached: true,
            stdio: "ignore",
            windowsHide: true,
          });
          child.unref();
        }

        const ready = await this.waitForBackendReady(120000);
        if (!ready) {
          throw new Error("timeout waiting for /health");
        }
        this.backendReady = true;
        this.autoStartSuppressed = false;
        if (manual) {
          new Notice(this.t("noticeBackendStarted"));
        }
        await this.loadToolConfig(true);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.backendReady = false;
        this.statusEl.setText(this.t("statusBackendOffline", { message }));
        if (manual) {
          new Notice(this.t("noticeBackendStartFailed", { message }));
        }
        return false;
      } finally {
        this.backendLaunchPromise = null;
        this.applyBusyState();
      }
    })();

    return await this.backendLaunchPromise;
  }

  async stopBackend(manual: boolean): Promise<boolean> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return false;
    }
    try {
      const scriptPath = this.plugin.settings.backendScriptPath.trim();
      if (!scriptPath) {
        throw new Error(this.t("noticeBackendPathsMissing"));
      }

      if (process.platform === "win32") {
        const psCommand = [
          `$script = ${JSON.stringify(scriptPath)};`,
          "Get-CimInstance Win32_Process |",
          "Where-Object { ($_.Name -eq 'python.exe' -or $_.Name -eq 'pythonw.exe') -and ($_.CommandLine -match [regex]::Escape($script) -or $_.CommandLine -match 'backend[\\\\/]main\\.py') } |",
          "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }",
        ].join(" ");
        await this.runShell("powershell.exe", ["-NoProfile", "-Command", psCommand]);
      } else {
        await this.runShell("pkill", ["-f", scriptPath]);
      }
      this.backendReady = false;
      this.toolConfig = null;
      this.toolConfigError = "";
      this.autoStartSuppressed = manual;
      this.statusEl.setText(this.t("statusBackendOffline", { message: this.t("buttonBackendStop") }));
      await this.renderWorkflowPanels();
      if (manual) {
        new Notice(this.t("noticeBackendStopped"));
      }
      this.applyBusyState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (manual) {
        new Notice(this.t("noticeBackendStopFailed", { message }));
      }
      return false;
    }
  }

  async restartBackend(): Promise<void> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }
    await this.stopBackend(false);
    const started = await this.startBackend(true);
    if (started) {
      new Notice(this.t("noticeBackendRestarted"));
    }
  }

  setQuestion(text: string): void {
    this.questionEl.value = text;
    this.updateChatActionButtonState();
  }

  handleQuestionSubmitKey(event: KeyboardEvent): void {
    const isEnterKey = event.key === "Enter" || event.code === "Enter" || event.code === "NumpadEnter";
    if (!isEnterKey || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    if (now - this.lastEnterSubmitAt < 300) {
      return;
    }
    this.lastEnterSubmitAt = now;

    if (this.runningTask === "chat") {
      return;
    }

    if (!this.questionEl?.value.trim()) {
      return;
    }

    window.setTimeout(() => {
      if (this.runningTask || !this.questionEl?.value.trim()) {
        return;
      }
      void this.runQuery();
    }, 0);
  }

  async useSelection(runAfter = false): Promise<void> {
    const selection = this.plugin.getActiveSelection();
    if (!selection) {
      new Notice(this.t("noticeNoSelection"));
      return;
    }

    this.setQuestion(selection);
    if (runAfter) {
      await this.runQuery();
    }
  }

  async runQuickAction(key: QuickActionKey): Promise<void> {
    this.setQuestion(this.plugin.getQuickAction(key).prompt);
    await this.runQuery();
  }

  shouldAttachCurrentNote(question: string): boolean {
    const normalized = question.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    const noteReferencePatterns = [
      /\bthis note\b/,
      /\bcurrent note\b/,
      /\bopened note\b/,
      /\bopen note\b/,
      /\bselection\b/,
      /\bselected text\b/,
      /\babove\b/,
      /\bhere\b/,
      /이 노트/,
      /현재 노트/,
      /지금 노트/,
      /열어둔 노트/,
      /위 내용/,
      /여기 내용/,
      /본문/,
      /선택 영역/,
      /선택영역/,
      /선택한 부분/,
      /드래그한/,
    ];

    return noteReferencePatterns.some((pattern) => pattern.test(normalized));
  }

  async stopChat(): Promise<void> {
    if (this.runningTask !== "chat" || !this.activeSessionId) {
      return;
    }

    try {
      await this.postJson("/api/chat/stop", { session_id: this.activeSessionId });
      this.abortActiveRequest();
      this.runningTask = null;
      this.activeSessionId = "";
      this.statusEl.setText(this.t("statusDone"));
      this.setBusy(false);
      await this.renderWorkflowLogsPanel();
      new Notice(this.t("noticeChatStopped"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(this.t("noticeChatStopFailed", { message }));
    }
  }

  async runQuery(): Promise<void> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }

    if (!(await this.refreshBackendState())) {
      new Notice(this.t("noticeBackendUnavailable"));
      return;
    }

    const question = this.questionEl.value.trim();
    if (!question) {
      new Notice(this.t("noticeEnterQuestion"));
      return;
    }

    const file = this.plugin.app.workspace.getActiveFile();
    const shouldAttachCurrentNote = Boolean(file) && this.shouldAttachCurrentNote(question);
    const noteContent = shouldAttachCurrentNote && file
      ? await this.plugin.app.vault.cachedRead(file)
      : "";
    const contextEntries = shouldAttachCurrentNote && file
      ? await this.collectContext(file)
      : [];
    const conversationHistory = this.chatTurns
      .filter((turn) => turn.answer.trim())
      .slice(-6)
      .map((turn) => ({
        question: turn.question,
        answer: turn.answer,
      }));
    const activeThread = this.plugin.getChatThread(this.activeThreadId);
    if (!activeThread) {
      await this.createNewThread();
    }

    this.abortActiveRequest();
    this.abortController = new AbortController();
    this.activeSessionId = `${this.activeThreadId || "obsidian-local-agent"}-${Date.now()}`;

    this.lastQuestion = question;
    this.currentFilePath = shouldAttachCurrentNote && file ? file.path : "";
    this.currentContextEntries = contextEntries;
    this.backendSources = [];
    this.backendRecommendations = [];
    this.answerBasis = "";
    this.chatSeenLogs.clear();
    this.chatTurns.push({
      question,
      answer: "",
      basis: "",
      route: "",
      sources: [],
      recommendations: [],
      attachedFilePath: shouldAttachCurrentNote && file ? file.path : "",
      contextEntries,
      createdAt: new Date().toISOString(),
    });
    const threadRecord = this.plugin.getChatThread(this.activeThreadId);
    if (threadRecord) {
      threadRecord.turns = this.chatTurns as StoredChatTurn[];
      threadRecord.updatedAt = new Date().toISOString();
      const untitled = threadRecord.title === this.t("threadUntitled");
      if (untitled) {
        const compactTitle = question.replace(/\s+/g, " ").trim();
        threadRecord.title = compactTitle.length > 24 ? `${compactTitle.slice(0, 24)}...` : compactTitle;
      }
    }
    this.plugin.sortChatThreadsByRecent();
    this.renderThreadRow();
    await this.plugin.saveSettings();
    this.runningTask = "chat";
    this.setActiveTab("chat");
    this.setBusy(true);
    this.renderedOutput = "";
    await this.renderContextPanels();
    await this.renderOutput();
    this.statusEl.setText(this.t("statusStreaming", { url: this.plugin.settings.backendUrl }));

    try {
      await this.streamChat({
        question,
        project_name: this.plugin.settings.defaultProject,
        model_name: "qwen3.5:4b",
        session_id: this.activeSessionId,
        attach_current_note: shouldAttachCurrentNote,
        current_note_path: shouldAttachCurrentNote && file ? file.path : "",
        current_note_content: noteContent.slice(0, MAX_NOTE_CHARS),
        context_entries: contextEntries.map((entry) => ({
          path: entry.path,
          content: entry.content.slice(0, MAX_CONTEXT_NOTE_CHARS),
          source: entry.source,
        })),
        conversation_history: conversationHistory,
        language: this.plugin.language(),
      });
      this.statusEl.setText(this.t("statusDone"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.statusEl.setText(this.t("statusError"));
      await this.setRenderedOutput(`[error] ${message}`);
      new Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.activeSessionId = "";
      this.setBusy(false);
      await this.renderWorkflowLogsPanel();
    }
  }

  buildPrompt(
    question: string,
    file: TFile,
    noteContent: string,
    contextEntries: ContextEntry[],
  ): string {
    const sections = [
      `Current note path: ${file.path}`,
      "Use the current note as the primary context.",
      "",
      "[User Question]",
      question,
      "",
      "[Current Note]",
      noteContent.trim().slice(0, MAX_NOTE_CHARS) || "(empty note)",
    ];

    const groups: ContextSource[] = ["links", "folder", "tags", "backlinks"];
    for (const source of groups) {
      const items = contextEntries.filter((entry) => entry.source === source);
      if (items.length === 0) {
        continue;
      }

      sections.push("", `[Context:${source}]`);
      for (const item of items) {
        sections.push(
          `\n## ${item.file.path}\n${item.content.trim().slice(0, MAX_CONTEXT_NOTE_CHARS) || "(empty note)"}`,
        );
      }
    }

    sections.push(
      "",
      "When you cite related notes, prefer Obsidian wiki link format like [[Note Name]].",
      this.plugin.getResponseLanguageInstruction(),
    );

    return sections.join("\n");
  }

  getLinkedFiles(file: TFile): TFile[] {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const unique = new Map<string, TFile>();
    const references = [
      ...(cache?.links ?? []),
      ...(cache?.embeds ?? []),
      ...(cache?.frontmatterLinks ?? []),
    ];

    for (const reference of references) {
      const target = this.plugin.app.metadataCache.getFirstLinkpathDest(reference.link, file.path);
      if (target && target.path !== file.path) {
        unique.set(target.path, target);
      }
    }

    for (const relatedFile of this.getFrontmatterRelatedFiles(file)) {
      if (relatedFile.path !== file.path) {
        unique.set(relatedFile.path, relatedFile);
      }
    }

    return Array.from(unique.values());
  }

  getFolderFiles(file: TFile): TFile[] {
    const folderPath = file.parent?.path;
    if (!folderPath) {
      return [];
    }

    return this.plugin.app.vault
      .getMarkdownFiles()
      .filter((candidate) => candidate.path !== file.path && candidate.parent?.path === folderPath);
  }

  getTaggedFiles(file: TFile): TFile[] {
    const tagSet = this.getNormalizedTags(file);
    if (tagSet.size === 0) {
      return [];
    }

    return this.plugin.app.vault.getMarkdownFiles().filter((candidate) => {
      if (candidate.path === file.path) {
        return false;
      }
      const candidateTags = this.getNormalizedTags(candidate);
      for (const tag of candidateTags) {
        if (tagSet.has(tag)) {
          return true;
        }
      }
      return false;
    });
  }

  getNormalizedTags(file: TFile): Set<string> {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const tags = new Set<string>();

    for (const tag of cache?.tags ?? []) {
      const normalized = this.normalizeTag(tag.tag);
      if (normalized) {
        tags.add(normalized);
      }
    }

    const frontmatter = cache?.frontmatter as Record<string, unknown> | undefined;
    for (const value of [frontmatter?.tags, frontmatter?.tag]) {
      for (const tag of this.extractFrontmatterTags(value)) {
        tags.add(tag);
      }
    }

    return tags;
  }

  extractFrontmatterTags(value: unknown): string[] {
    if (typeof value === "string") {
      return value
        .split(/[,\n]/)
        .map((item) => this.normalizeTag(item))
        .filter((item): item is string => Boolean(item));
    }

    if (Array.isArray(value)) {
      return value
        .flatMap((item) => this.extractFrontmatterTags(item))
        .filter((item): item is string => Boolean(item));
    }

    return [];
  }

  normalizeTag(value: unknown): string | null {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return null;
    }
    return raw.startsWith("#") ? raw : `#${raw}`;
  }

  getBacklinkFiles(file: TFile): TFile[] {
    const resolved = this.plugin.app.metadataCache.resolvedLinks;
    const result: TFile[] = [];

    for (const [sourcePath, targets] of Object.entries(resolved)) {
      if (!targets[file.path] || sourcePath === file.path) {
        continue;
      }
      const source = this.plugin.app.vault.getAbstractFileByPath(sourcePath);
      if (source instanceof TFile) {
        result.push(source);
      }
    }

    return result;
  }

  getFrontmatterRelatedFiles(file: TFile): TFile[] {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter as Record<string, unknown> | undefined;
    if (!frontmatter) {
      return [];
    }

    const rawValues = [
      frontmatter.related_files,
      frontmatter.relatedFiles,
      frontmatter.related_notes,
      frontmatter.relatedNotes,
      frontmatter.related,
      frontmatter.references,
      frontmatter.reference_files,
      frontmatter.referenceFiles,
    ];

    const unique = new Map<string, TFile>();
    for (const rawValue of rawValues) {
      for (const rawCandidate of this.extractRelatedCandidates(rawValue)) {
        const resolved = this.resolveRelatedFileCandidate(file, frontmatter, rawCandidate);
        if (resolved && resolved.path !== file.path) {
          unique.set(resolved.path, resolved);
        }
      }
    }

    return Array.from(unique.values());
  }

  extractRelatedCandidates(value: unknown): string[] {
    if (typeof value === "string") {
      return [value];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.extractRelatedCandidates(item));
    }
    if (value && typeof value === "object") {
      const candidateObject = value as Record<string, unknown>;
      return [
        candidateObject.path,
        candidateObject.file,
        candidateObject.link,
        candidateObject.name,
        candidateObject.source,
      ].flatMap((item) => this.extractRelatedCandidates(item));
    }
    return [];
  }

  resolveRelatedFileCandidate(
    sourceFile: TFile,
    frontmatter: Record<string, unknown>,
    rawCandidate: string,
  ): TFile | null {
    const candidate = this.normalizeRelatedCandidate(rawCandidate);
    if (!candidate) {
      return null;
    }

    const direct = this.plugin.app.metadataCache.getFirstLinkpathDest(candidate, sourceFile.path);
    if (direct && this.isReadableContextFile(direct)) {
      return direct;
    }

    const resolved = this.plugin.resolveVaultFile(candidate);
    if (resolved && this.isReadableContextFile(resolved)) {
      return resolved;
    }

    const baseName = candidate.split("/").pop() ?? candidate;
    const baseNameNoExt = baseName.replace(/\.[^/.]+$/, "");
    const collection = String(frontmatter.collection ?? "").trim();
    const domain = String(frontmatter.domain ?? "").trim();
    const sourcePath = sourceFile.path.replace(/\\/g, "/");
    const ranked = this.plugin.app.vault
      .getFiles()
      .filter((file) => this.isReadableContextFile(file))
      .map((file) => ({ file, score: this.scoreRelatedCandidate(file, candidate, baseName, baseNameNoExt, collection, domain, sourcePath) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return ranked[0]?.file ?? null;
  }

  normalizeRelatedCandidate(rawCandidate: string): string {
    let candidate = rawCandidate.trim();
    if (!candidate) {
      return "";
    }

    candidate = candidate.replace(/^!?\[\[/, "").replace(/\]\]$/, "");
    if (candidate.includes("|")) {
      candidate = candidate.split("|")[0].trim();
    }

    const markdownLink = candidate.match(/\[[^\]]+\]\(([^)]+)\)/);
    if (markdownLink?.[1]) {
      candidate = markdownLink[1].trim();
    }

    return candidate.replace(/^["']|["']$/g, "").trim();
  }

  scoreRelatedCandidate(
    file: TFile,
    candidate: string,
    baseName: string,
    baseNameNoExt: string,
    collection: string,
    domain: string,
    sourcePath: string,
  ): number {
    const filePath = file.path.replace(/\\/g, "/");
    const fileName = file.name;
    const fileBaseName = file.basename;
    let score = 0;

    if (filePath === candidate || filePath.endsWith(`/${candidate}`)) {
      score += 100;
    }
    if (fileName === baseName) {
      score += 80;
    }
    if (fileBaseName === baseNameNoExt) {
      score += 70;
    }
    if (collection && filePath.includes(`/${collection}/`)) {
      score += 30;
    }
    if (domain && filePath.includes(`/${domain}/`)) {
      score += 16;
    }
    if (sourcePath.includes("/11_RAG_Knowledge_Base/") && filePath.includes("/10_AI_Engineering/")) {
      score += 12;
    }
    if (filePath.includes(candidate) || fileBaseName.includes(baseNameNoExt)) {
      score += 8;
    }

    return score;
  }

  isReadableContextFile(file: TFile): boolean {
    const ext = file.extension?.toLowerCase?.() ?? "";
    if (!ext) {
      return true;
    }
    return CONTEXT_READABLE_EXTENSIONS.has(ext);
  }

  async collectContext(file: TFile): Promise<ContextEntry[]> {
    const groups: Array<{ source: ContextSource; files: TFile[] }> = [
      { source: "links", files: this.getLinkedFiles(file) },
      { source: "folder", files: this.getFolderFiles(file) },
      { source: "tags", files: this.getTaggedFiles(file) },
      { source: "backlinks", files: this.getBacklinkFiles(file) },
    ];
    const entries: ContextEntry[] = [];
    const seen = new Set<string>([file.path]);
    const cursors = new Map<ContextSource, number>([
      ["links", 0],
      ["folder", 0],
      ["tags", 0],
      ["backlinks", 0],
    ]);

    while (entries.length < this.plugin.settings.maxContextNotes) {
      let added = false;
      for (const group of groups) {
        let cursor = cursors.get(group.source) ?? 0;
        while (cursor < group.files.length) {
          const candidate = group.files[cursor];
          cursor += 1;
          cursors.set(group.source, cursor);
          if (seen.has(candidate.path)) {
            continue;
          }
          seen.add(candidate.path);
          const content = await this.plugin.app.vault.cachedRead(candidate);
          entries.push({
            path: candidate.path,
            name: candidate.basename,
            content,
            source: group.source,
          });
          added = true;
          break;
        }
        if (entries.length >= this.plugin.settings.maxContextNotes) {
          break;
        }
      }
      if (!added) {
        break;
      }
    }

    return entries;
  }

  async checkBackend(): Promise<boolean> {
    try {
      const data = await this.getJson<{ engine?: string; status?: string }>("/health");
      this.statusEl.setText(
        this.t("statusBackendReady", { engine: data.engine ?? data.status ?? "unknown" }),
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.statusEl.setText(this.t("statusBackendOffline", { message }));
      return false;
    }
  }

  async streamNdjson(
    path: string,
    payload: Record<string, unknown>,
    onChunk: (chunk: Record<string, unknown>) => Promise<void> | void,
  ): Promise<void> {
    const url = new URL(`${this.plugin.settings.backendUrl}${path}`);
    const body = JSON.stringify(payload);
    const transport = url.protocol === "https:" ? https : http;

    await new Promise<void>((resolve, reject) => {
      const request = transport.request(
        {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
          path: `${url.pathname}${url.search}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (response) => {
          void (async () => {
            let buffer = "";
            try {
              const statusCode = response.statusCode ?? 0;
              if (statusCode < 200 || statusCode >= 300) {
                let errorBody = "";
                for await (const chunk of response) {
                  errorBody += typeof chunk === "string" ? chunk : chunk.toString("utf8");
                }
                throw new Error(
                  `Backend request failed: ${statusCode}${errorBody ? ` ${errorBody}` : ""}`,
                );
              }

              for await (const chunk of response) {
                const textChunk = typeof chunk === "string" ? chunk : chunk.toString("utf8");
                buffer += textChunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    continue;
                  }
                  await onChunk(JSON.parse(trimmed) as Record<string, unknown>);
                }
              }

              if (buffer.trim()) {
                await onChunk(JSON.parse(buffer.trim()) as Record<string, unknown>);
              }
              resolve();
            } catch (error) {
              reject(error);
            } finally {
              this.clearActiveRequest(request, onAbort);
            }
          })();
        },
      );

      const onAbort = () => {
        request.destroy(new Error("Request aborted"));
      };

      this.activeRequest = request;
      this.abortController?.signal.addEventListener("abort", onAbort, { once: true });
      request.on("error", (error) => {
        this.clearActiveRequest(request, onAbort);
        if (this.abortController?.signal.aborted) {
          resolve();
          return;
        }
        reject(error);
      });
      request.write(body);
      request.end();
    });
  }

  async streamChat(payload: Record<string, unknown>): Promise<void> {
    await this.streamNdjson("/api/chat/obsidian/stream", payload, async (chunk) => {
      await this.handleChunk(chunk as StreamChunk);
    });
  }

  abortActiveRequest(): void {
    this.abortController?.abort();
    this.activeRequest?.destroy(new Error("Request aborted"));
    this.activeRequest = null;
  }

  clearActiveRequest(request: http.ClientRequest, onAbort: () => void): void {
    if (this.activeRequest === request) {
      this.activeRequest = null;
    }
    this.abortController?.signal.removeEventListener("abort", onAbort);
  }

  getLatestChatTurn(): ChatTurn | null {
    return this.chatTurns.length > 0 ? this.chatTurns[this.chatTurns.length - 1] : null;
  }

  getLatestCompletedTurn(): ChatTurn | null {
    for (let index = this.chatTurns.length - 1; index >= 0; index -= 1) {
      const turn = this.chatTurns[index];
      if (turn.answer.trim()) {
        return turn;
      }
    }
    return null;
  }

  getLatestStateTurn(): ChatTurn | null {
    for (let index = this.chatTurns.length - 1; index >= 0; index -= 1) {
      const turn = this.chatTurns[index];
      if (
        turn.answer.trim()
        || turn.question.trim()
        || (turn.sources?.length ?? 0) > 0
        || (turn.recommendations?.length ?? 0) > 0
        || (turn.contextEntries?.length ?? 0) > 0
      ) {
        return turn;
      }
    }
    return null;
  }

  updateLatestChatTurn(patch: Partial<ChatTurn>): void {
    const turn = this.getLatestChatTurn();
    if (!turn) {
      return;
    }
    Object.assign(turn, patch);
  }

  async handleChunk(chunk: StreamChunk): Promise<void> {
    let shouldRenderPanels = false;
    let shouldPersistThread = false;
    if (Array.isArray(chunk.sources)) {
      const nextSources = JSON.stringify(chunk.sources);
      const currentSources = JSON.stringify(this.backendSources);
      if (nextSources !== currentSources) {
        this.backendSources = chunk.sources;
        this.updateLatestChatTurn({ sources: chunk.sources });
        shouldRenderPanels = true;
        shouldPersistThread = true;
      }
    }

    if (Array.isArray(chunk.recommendations)) {
      const nextRecommendations = JSON.stringify(chunk.recommendations);
      const currentRecommendations = JSON.stringify(this.backendRecommendations);
      if (nextRecommendations !== currentRecommendations) {
        this.backendRecommendations = chunk.recommendations;
        this.updateLatestChatTurn({ recommendations: chunk.recommendations });
        shouldRenderPanels = true;
        shouldPersistThread = true;
      }
    }

    if (shouldRenderPanels) {
      await this.renderContextPanels();
      await this.persistActiveThreadState();
    }

    if (typeof chunk.basis === "string" && chunk.basis !== this.answerBasis) {
      this.answerBasis = chunk.basis;
      this.updateLatestChatTurn({ basis: chunk.basis });
    }

    if (chunk.step === "init" && typeof chunk.route === "string") {
      this.updateLatestChatTurn({ route: chunk.route });
      this.recordChatLogs([`[route] ${chunk.route}`]);
      shouldPersistThread = true;
    } else if (typeof chunk.route === "string" && chunk.route) {
      this.updateLatestChatTurn({ route: chunk.route });
      shouldPersistThread = true;
    }

    this.recordChatLogs(chunk.logs);
    this.recordChatLogs(chunk.state?.logs);

    if (typeof chunk.answer === "string") {
      if (chunk.step === "error") {
        await this.setRenderedOutput(`[error] ${chunk.answer}`);
        await this.persistActiveThreadState();
        return;
      }
      await this.setRenderedOutput(chunk.answer);
      if (chunk.step === "done" || chunk.step === "stopped") {
        await this.persistActiveThreadState();
      }
    } else if (shouldPersistThread) {
      await this.persistActiveThreadState();
    }
  }

  recordChatLogs(logs?: string[]): void {
    if (!Array.isArray(logs)) {
      return;
    }
    for (const line of logs) {
      const normalized = line.trim();
      if (!normalized || this.chatSeenLogs.has(normalized)) {
        continue;
      }
      this.chatSeenLogs.add(normalized);
      this.recordWorkflowLog("chat", normalized);
    }
  }

  async setRenderedOutput(text: string): Promise<void> {
    if (text === this.renderedOutput) {
      return;
    }
    this.renderedOutput = text;
    this.updateLatestChatTurn({ answer: text, basis: this.answerBasis });
    await this.renderOutput();
  }

  async renderOutput(): Promise<void> {
    this.chatLogEl.empty();
    this.conversationActionsEl?.parentElement?.classList.toggle("is-hidden", !this.getLatestCompletedTurn());
    if (this.chatTurns.length === 0) {
      const emptyEl = this.chatLogEl.createDiv({ cls: "ola-chat-empty" });
      await MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(this.t("outputReady")),
        emptyEl,
        "",
        this,
      );
      this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
      return;
    }

    for (const turn of this.chatTurns) {
      const turnEl = this.chatLogEl.createDiv({ cls: "ola-chat-turn" });

      const questionWrap = turnEl.createDiv({ cls: "ola-chat-turn-question-wrap" });
      questionWrap.createDiv({ cls: "ola-chat-turn-label", text: "You" });
      const questionEl = questionWrap.createDiv({ cls: "ola-chat-turn-question" });
      await MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(turn.question),
        questionEl,
        turn.attachedFilePath || "",
        this,
      );

      const answerWrap = turnEl.createDiv({ cls: "ola-chat-turn-answer-wrap" });
      answerWrap.createDiv({ cls: "ola-chat-turn-label", text: "Agent" });
      const basisLabel = this.getAnswerBasisLabel(turn.basis);
      if (basisLabel && turn.answer.trim()) {
        answerWrap.createDiv({
          cls: "ola-answer-basis",
          text: basisLabel,
        });
      }
      const answerEl = answerWrap.createDiv({ cls: "ola-chat-turn-answer" });
      const answerText = turn.answer || (turn === this.getLatestChatTurn() && this.runningTask === "chat"
        ? this.t("outputGenerating")
        : this.t("outputReady"));
      await MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(answerText),
        answerEl,
        turn.attachedFilePath || "",
        this,
      );
    }
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
  }

  getAnswerBasisLabel(basis = this.answerBasis): string {
    if (basis === "current_note") {
      return this.t("basisCurrentNote");
    }
    if (basis === "obsidian_search") {
      return this.t("basisObsidianSearch");
    }
    if (basis === "general_knowledge") {
      return this.t("basisGeneralKnowledge");
    }
    return "";
  }

  async renderContextPanels(): Promise<void> {
    await this.renderSentContextPanel();
    await this.renderSourcePanel();
    await this.renderRecommendationPanel();
  }

  createField(containerEl: HTMLElement, label: string): HTMLDivElement {
    const wrapper = containerEl.createDiv({ cls: "ola-field" });
    wrapper.createEl("label", { cls: "ola-field-label", text: label });
    return wrapper;
  }

  createSectionDetails(
    containerEl: HTMLElement,
    title: string,
    open = false,
    buildSummaryActions?: (actionsEl: HTMLDivElement) => void,
  ): HTMLDivElement {
    const detailsEl = containerEl.createEl("details", { cls: "ola-stage-section" });
    if (open) {
      detailsEl.open = true;
    }
    const summaryEl = detailsEl.createEl("summary", { cls: "ola-stage-summary" });
    summaryEl.createSpan({ cls: "ola-stage-summary-title", text: title });
    if (buildSummaryActions) {
      const summaryActionsEl = summaryEl.createDiv({ cls: "ola-stage-summary-actions" });
      buildSummaryActions(summaryActionsEl);
    }
    return detailsEl.createDiv({ cls: "ola-stage-body" });
  }

  captureOpenDetails(containerEl: HTMLElement): Set<string> {
    const openKeys = new Set<string>();
    const details = Array.from(containerEl.querySelectorAll("details"));
    details.forEach((detailEl, index) => {
      if (!(detailEl instanceof HTMLDetailsElement) || !detailEl.open) {
        return;
      }
      const summaryText = detailEl.querySelector(".ola-stage-summary-title")?.textContent?.trim()
        ?? detailEl.querySelector("summary")?.textContent?.trim()
        ?? "";
      openKeys.add(`${index}:${summaryText}`);
    });
    return openKeys;
  }

  restoreOpenDetails(containerEl: HTMLElement, openKeys: Set<string>): void {
    const details = Array.from(containerEl.querySelectorAll("details"));
    details.forEach((detailEl, index) => {
      if (!(detailEl instanceof HTMLDetailsElement)) {
        return;
      }
      const summaryText = detailEl.querySelector(".ola-stage-summary-title")?.textContent?.trim()
        ?? detailEl.querySelector("summary")?.textContent?.trim()
        ?? "";
      detailEl.open = openKeys.has(`${index}:${summaryText}`);
    });
  }

  renderToolSummary(panelEl: HTMLDivElement, title: string, status: string): HTMLDivElement {
    panelEl.empty();
    const summaryEl = panelEl.createDiv({ cls: "ola-meta-summary" });
    const titleEl = summaryEl.createSpan({ text: title });
    titleEl.addClass("ola-workflow-summary-title");
    const statusEl = summaryEl.createSpan({ text: status });
    statusEl.addClass("ola-workflow-summary-status");
    return panelEl.createDiv({ cls: "ola-meta-body" });
  }

  getJobList(): ToolJob[] {
    return Array.isArray(this.toolConfig?.jobs) ? this.toolConfig?.jobs ?? [] : [];
  }

  isGeneratorSupportedFile(file: TFile): boolean {
    return GENERATOR_SUPPORTED_EXTENSIONS.has(file.extension.toLowerCase())
      && !file.path.split("/").some((part) => part.startsWith("."));
  }

  getGeneratorRootKey(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const slashIndex = normalized.indexOf("/");
    return slashIndex === -1 ? GENERATOR_ROOT_SENTINEL : normalized.slice(0, slashIndex);
  }

  getGeneratorRootLabel(rootPath: string): string {
    return rootPath === GENERATOR_ROOT_SENTINEL ? this.t("generatorRootFolder") : rootPath;
  }

  getGeneratorRootEntries(): GeneratorRootEntry[] {
    const groups = new Map<string, GeneratorRootEntry>();
    for (const file of this.plugin.app.vault.getFiles()) {
      if (!this.isGeneratorSupportedFile(file)) {
        continue;
      }
      const rootPath = this.getGeneratorRootKey(file.path);
      const current = groups.get(rootPath) ?? {
        path: rootPath,
        label: this.getGeneratorRootLabel(rootPath),
        count: 0,
        size: 0,
      };
      current.count += 1;
      current.size += file.stat.size;
      groups.set(rootPath, current);
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.path === GENERATOR_ROOT_SENTINEL) {
        return -1;
      }
      if (b.path === GENERATOR_ROOT_SENTINEL) {
        return 1;
      }
      return new Intl.Collator(this.plugin.getLocale(), {
        numeric: true,
        sensitivity: "base",
      }).compare(a.label, b.label);
    });
  }

  getPreferredGeneratorInputDir(): string {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (activeFile && this.isGeneratorSupportedFile(activeFile)) {
      return this.getGeneratorRootKey(activeFile.path);
    }
    return this.getGeneratorRootEntries()[0]?.path ?? GENERATOR_ROOT_SENTINEL;
  }

  shouldFlattenGeneratorProjectFolder(folderName: string): boolean {
    return /^99(?:_|-)/.test(folderName);
  }

  getGeneratorFolderMeta(relativePath: string): Pick<ToolFileEntry, "folder" | "folderLabel" | "folderParent"> {
    const normalized = relativePath.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);
    if (segments.length <= 1) {
      return {
        folder: "(root)",
        folderLabel: this.t("generatorRootFolder"),
        folderParent: "",
      };
    }

    const first = segments[0];
    if (segments.length >= 3 && this.shouldFlattenGeneratorProjectFolder(first)) {
      return {
        folder: `${first}/${segments[1]}`,
        folderLabel: segments[1],
        folderParent: first,
      };
    }

    return {
      folder: first,
      folderLabel: first,
      folderParent: "",
    };
  }

  isFileInsideGeneratorRoot(file: TFile, rootPath: string): boolean {
    if (rootPath === GENERATOR_ROOT_SENTINEL) {
      return !file.path.includes("/");
    }
    return file.path.startsWith(`${rootPath}/`);
  }

  getVaultFolderOptions(): string[] {
    const folders = new Set<string>([""]);
    for (const file of this.plugin.app.vault.getFiles()) {
      if (!this.isGeneratorSupportedFile(file)) {
        continue;
      }
      let current = file.parent?.path ?? "";
      while (true) {
        folders.add(current);
        if (!current) {
          break;
        }
        const slashIndex = current.lastIndexOf("/");
        current = slashIndex >= 0 ? current.slice(0, slashIndex) : "";
      }
    }
    return Array.from(folders).sort((a, b) => a.localeCompare(b));
  }

  getAllVaultFolderOptions(): string[] {
    const folders = new Set<string>([""]);
    for (const item of this.plugin.app.vault.getAllLoadedFiles()) {
      if (item instanceof TFolder) {
        folders.add(item.path);
      }
    }
    return Array.from(folders).sort((a, b) => this.compareGeneratorLabels(a, b));
  }

  getWorkflowFolderOptions(extraPaths: string[] = []): string[] {
    return Array.from(
      new Set(
        ["", ...this.getAllVaultFolderOptions(), ...extraPaths]
          .map((value) => normalizePath(value || "")),
      ),
    ).sort((a, b) => this.compareGeneratorLabels(a, b));
  }

  getEffectiveTaggerInputDir(): string {
    return this.taggerState.inputDir;
  }

  getEffectiveIngestInputDir(): string {
    if (this.ingestState.inputDir) {
      return this.ingestState.inputDir;
    }
    return this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir;
  }

  getEffectiveIngestOutputDir(): string {
    return this.ingestState.outputDir || this.generatorState.outputDir;
  }

  getPreferredGeneratorOutputRoot(): string {
    const allFolders = this.getAllVaultFolderOptions();
    return allFolders.find((folder) => /^11(?:_|-)/.test(folder)) ?? "11_RAG_Knowledge_Base";
  }

  getGeneratorMirroredOutputDir(inputDir = this.generatorState.inputDir, focusedFolder = this.generatorState.focusedFolder): string {
    const outputRoot = this.getPreferredGeneratorOutputRoot();
    if (!outputRoot) {
      return "";
    }
    if (inputDir === GENERATOR_ROOT_SENTINEL || !focusedFolder) {
      return outputRoot;
    }
    return normalizePath(`${outputRoot}/${focusedFolder}`);
  }

  syncGeneratorOutputDir(): void {
    const mirrored = this.getGeneratorMirroredOutputDir();
    if (mirrored) {
      this.generatorState.outputDir = mirrored;
    }
  }

  getPreferredVaultFolder(): string {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (activeFile?.parent?.path) {
      return activeFile.parent.path;
    }
    return this.getVaultFolderOptions()[0] ?? "";
  }

  getLocalPatternPreviewIndex(): Record<string, PatternPreview> {
    const editorConfig = this.getPatternEditorConfig();
    const patternDir = normalizePath(editorConfig.vault_dir?.trim() || "generator/patterns");
    const previews: Record<string, PatternPreview> = {};
    for (const file of this.plugin.app.vault.getFiles()) {
      if (file.extension.toLowerCase() !== "md") {
        continue;
      }
      if (!(file.path === patternDir || file.path.startsWith(`${patternDir}/`))) {
        continue;
      }
      const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter as Record<string, unknown> | undefined;
      const patternKey = typeof frontmatter?.pattern === "string" && frontmatter.pattern.trim()
        ? frontmatter.pattern.trim()
        : file.basename;
      const groupsRaw = frontmatter?.groups;
      const groups = Array.isArray(groupsRaw)
        ? groupsRaw.map((value) => String(value))
        : typeof groupsRaw === "string" && groupsRaw.trim()
          ? [groupsRaw.trim()]
          : [];
      previews[patternKey] = {
        ...(previews[patternKey] ?? {}),
        source: "obsidian",
        editor_note_path: file.path,
        groups,
        output_suffix: typeof frontmatter?.output_suffix === "string" ? frontmatter.output_suffix : "",
        use_subject_prefix: Boolean(frontmatter?.use_subject_prefix),
      };
    }
    return previews;
  }

  getModelOptions(): string[] {
    const configured = Array.isArray(this.toolConfig?.model_options) ? this.toolConfig?.model_options ?? [] : [];
    const unique = new Set<string>(configured.filter((value) => Boolean(value)));
    unique.add("qwen3.5:4b");
    return Array.from(unique);
  }

  getPatternKeys(): string[] {
    const configured = Array.isArray(this.toolConfig?.patterns) ? this.toolConfig?.patterns ?? [] : [];
    if (configured.length > 0) {
      return configured;
    }
    return Object.keys(this.getLocalPatternPreviewIndex()).sort((a, b) => a.localeCompare(b));
  }

  getPatternEditorConfig(): PatternEditorConfig {
    return this.toolConfig?.pattern_editor ?? {
      vault_dir: "generator/patterns",
      readme_path: "generator/README.md",
      config_path: "",
    };
  }

  getTaggerRulesConfig(): TaggerRulesConfig {
    return this.toolConfig?.tagger_rules ?? {
      workspace: {
        root: "tagger",
        rules_dir: "tagger/rules",
        readme_path: "tagger/README.md",
        canonical_tags_path: "tagger/rules/canonical_tags.md",
        synonym_map_path: "tagger/rules/synonym_map.md",
        tagging_priority_path: "tagger/rules/tagging_priority.md",
      },
      canonical_tag_count: 0,
      canonical_groups: {},
      synonym_entries: 0,
      thresholds: {},
    };
  }

  getPatternPreview(patternKey: string): PatternPreview {
    return this.toolConfig?.pattern_previews?.[patternKey]
      ?? this.getLocalPatternPreviewIndex()[patternKey]
      ?? {};
  }

  getPatternGroupEntries(): Array<[string, string[]]> {
    const patternKeys = this.getPatternKeys();
    const localPreviews = this.getLocalPatternPreviewIndex();
    const configuredGroups = this.toolConfig?.pattern_groups
      ?? this.getTargetSets()
      ?? {};
    const entries: Array<[string, string[]]> = [];
    const seen = new Set<string>();

    for (const [groupName, rawPatterns] of Object.entries(configuredGroups)) {
      const filtered = (Array.isArray(rawPatterns) ? rawPatterns : []).filter((pattern) => patternKeys.includes(pattern));
      if (filtered.length === 0) {
        continue;
      }
      filtered.forEach((pattern) => seen.add(pattern));
      entries.push([groupName, filtered]);
    }

    if (entries.length === 0) {
      const localGroups = new Map<string, string[]>();
      for (const patternKey of patternKeys) {
        const groups = localPreviews[patternKey]?.groups ?? [];
        for (const groupName of groups) {
          const current = localGroups.get(groupName) ?? [];
          current.push(patternKey);
          localGroups.set(groupName, current);
          seen.add(patternKey);
        }
      }
      for (const [groupName, groupedPatterns] of localGroups.entries()) {
        entries.push([groupName, groupedPatterns]);
      }
    }

    const ungrouped = patternKeys.filter((pattern) => !seen.has(pattern));
    if (ungrouped.length > 0) {
      entries.push([this.t("generatorPatternGroupUngrouped"), ungrouped]);
    }

    return entries;
  }

  getTargetSets(): Record<string, string[]> {
    if (this.toolConfig?.target_sets) {
      return this.toolConfig.target_sets;
    }
    const grouped: Record<string, string[]> = {};
    for (const [patternKey, preview] of Object.entries(this.getLocalPatternPreviewIndex())) {
      for (const groupName of preview.groups ?? []) {
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(patternKey);
      }
    }
    return grouped;
  }

  getCurrentGeneratorJob(): ToolJob | null {
    if (this.generatorState.jobName === MANUAL_JOB) {
      return null;
    }
    return this.getJobList().find((candidate) => candidate.name === this.generatorState.jobName) ?? null;
  }

  formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
  }

  sanitizePatternFileName(patternKey: string): string {
    const sanitized = patternKey.trim().replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");
    return sanitized || "pattern";
  }

  buildPatternNotePath(patternKey: string): string {
    const editorConfig = this.getPatternEditorConfig();
    const configured = this.getPatternPreview(patternKey).editor_note_path?.trim();
    if (configured) {
      return normalizePath(configured);
    }

    const baseDir = normalizePath(editorConfig.vault_dir?.trim() || "generator/patterns");
    return normalizePath(`${baseDir}/${this.sanitizePatternFileName(patternKey)}.md`);
  }

  buildPatternNoteTemplate(patternKey: string): string {
    const preview = this.getPatternPreview(patternKey);
    const groups = Array.isArray(preview.groups) ? preview.groups.filter(Boolean) : [];
    const frontmatterLines = [
      "---",
      `pattern: ${JSON.stringify(patternKey)}`,
      groups.length > 0 ? "groups:" : "groups: []",
      ...groups.map((group) => `  - ${JSON.stringify(group)}`),
      `output_suffix: ${JSON.stringify(preview.output_suffix ?? "")}`,
      `use_subject_prefix: ${preview.use_subject_prefix ? "true" : "false"}`,
      "---",
      "",
      `# ${patternKey}`,
      "",
      "## System Role",
      preview.system_role?.trim() || "Describe the model role for this pattern.",
      "",
      "## Prompt Template",
      preview.prompt_template?.trim() || "[Context Data]\n{context}",
      "",
    ];
    return frontmatterLines.join("\n");
  }

  async openPatternWorkspaceNote(): Promise<void> {
    const editorConfig = this.getPatternEditorConfig();
    const readmePath = editorConfig.readme_path?.trim();
    if (!readmePath) {
      new Notice(this.t("noticePatternWorkspaceMissing"));
      return;
    }

    const normalized = normalizePath(readmePath);
    const folderPath = normalized.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(normalized);
    let file: TFile;
    if (existing instanceof TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(
        normalized,
        "# Generator Pattern Workspace\n\n- Edit notes in this folder to manage generator prompts.\n",
      );
    }

    await this.plugin.openFileFromSource(file);
  }

  async openPatternNote(patternKey: string): Promise<void> {
    const notePath = this.buildPatternNotePath(patternKey);
    const folderPath = notePath.includes("/") ? notePath.slice(0, notePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(notePath);
    let file: TFile;
    if (existing instanceof TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(notePath, this.buildPatternNoteTemplate(patternKey));
      new Notice(this.t("noticePatternNoteCreated", { path: notePath }));
    }

    await this.plugin.openFileFromSource(file);
  }

  async createPatternNote(): Promise<void> {
    const editorConfig = this.getPatternEditorConfig();
    const baseDir = normalizePath(editorConfig.vault_dir?.trim() || "generator/patterns");
    await this.plugin.ensureFolder(baseDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const patternKey = `custom_pattern_${timestamp}`;
    const notePath = normalizePath(`${baseDir}/${patternKey}.md`);
    const file = await this.plugin.app.vault.create(notePath, this.buildPatternNoteTemplate(patternKey));
    new Notice(this.t("noticePatternNoteCreated", { path: notePath }));
    await this.plugin.openFileFromSource(file);
  }

  async openTaggerWorkspaceNote(): Promise<void> {
    const rulesConfig = this.getTaggerRulesConfig();
    const readmePath = normalizePath(rulesConfig.workspace?.readme_path?.trim() || "tagger/README.md");
    const folderPath = readmePath.includes("/") ? readmePath.slice(0, readmePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(readmePath);
    let file: TFile;
    if (existing instanceof TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(
        readmePath,
        "# Tagger Rule Workspace\n\n- Edit markdown rule notes in this folder.\n",
      );
    }
    await this.plugin.openFileFromSource(file);
  }

  async openTaggerRuleNote(kind: "canonical" | "synonym" | "priority"): Promise<void> {
    const rulesConfig = this.getTaggerRulesConfig();
    const workspace = rulesConfig.workspace ?? {};
    const notePath = normalizePath(
      kind === "canonical"
        ? workspace.canonical_tags_path?.trim() || "tagger/rules/canonical_tags.md"
        : kind === "synonym"
          ? workspace.synonym_map_path?.trim() || "tagger/rules/synonym_map.md"
          : workspace.tagging_priority_path?.trim() || "tagger/rules/tagging_priority.md",
    );
    const folderPath = notePath.includes("/") ? notePath.slice(0, notePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(notePath);
    let file: TFile;
    if (existing instanceof TFile) {
      file = existing;
    } else {
      const fallbackTitle = kind === "canonical"
        ? "# Canonical Tags\n"
        : kind === "synonym"
          ? "# Synonym Map\n"
          : "# Tagging Priority\n";
      file = await this.plugin.app.vault.create(notePath, `${fallbackTitle}\n`);
    }
    await this.plugin.openFileFromSource(file);
  }

  initializeToolDefaults(force = false): void {
    if (this.toolConfigInitialized && !force) {
      return;
    }

    const defaults = this.toolConfig?.defaults ?? {};
    const firstTargetSet = Object.keys(this.getTargetSets())[0] ?? MANUAL_TARGET_SET;
    const defaultInputDir = this.getPreferredGeneratorInputDir();
    const defaultOutputDir = this.getGeneratorMirroredOutputDir(defaultInputDir, "");
    const fallbackPattern = this.getPatternKeys()[0] ?? "";

    this.generatorState = {
      ...this.generatorState,
      jobName: MANUAL_JOB,
      inputDir: force || !this.generatorState.inputDir ? defaultInputDir : this.generatorState.inputDir,
      outputDir: force || !this.generatorState.outputDir ? defaultOutputDir : this.generatorState.outputDir,
      subject: this.generatorState.subject || "New Project",
      modelName: this.generatorState.modelName || "qwen3.5:4b",
      temperature: typeof defaults.temperature === "number" ? defaults.temperature : this.generatorState.temperature,
      targetSet: this.generatorState.targetSet || firstTargetSet,
      patternKeys: this.generatorState.patternKeys.length > 0
        ? [...this.generatorState.patternKeys]
        : firstTargetSet !== MANUAL_TARGET_SET
          ? [...(this.getTargetSets()[firstTargetSet] ?? [])]
          : fallbackPattern
            ? [fallbackPattern]
            : [],
      status: this.generatorState.status || this.t("generatorStatusReady"),
    };
    this.taggerState.status = this.taggerState.status || this.t("taggerStatusReady");
    this.ingestState = {
      ...this.ingestState,
      status: this.ingestState.status || this.t("ingestStatusReady"),
    };
    this.toolConfigInitialized = true;
  }

  async loadToolConfig(force = false): Promise<void> {
    if (this.runningTask && !force) {
      return;
    }

    try {
      this.toolConfigError = "";
      this.toolConfig = await this.getJson<ToolConfig>("/api/tools/config");
      this.initializeToolDefaults(force);
      await this.renderWorkflowPanels();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.toolConfigError = message;
      await this.renderWorkflowPanels();
    }
  }

  async loadGeneratorFiles(): Promise<void> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }

    this.generatorState.status = this.t("generatorStatusLoadingFiles");
    this.generatorState.fileError = "";
    await this.renderGeneratorPanel();

    try {
      const rootEntries = this.getGeneratorRootEntries();
      const availableRoots = new Set(rootEntries.map((entry) => entry.path));
      if (!availableRoots.has(this.generatorState.inputDir)) {
        this.generatorState.inputDir = rootEntries[0]?.path ?? GENERATOR_ROOT_SENTINEL;
      }
      const selectedRoot = this.generatorState.inputDir || GENERATOR_ROOT_SENTINEL;
      const prefix = selectedRoot !== GENERATOR_ROOT_SENTINEL ? `${selectedRoot}/` : "";
      const entries = this.plugin.app.vault.getFiles()
        .filter((file) => this.isGeneratorSupportedFile(file))
        .filter((file) => this.isFileInsideGeneratorRoot(file, selectedRoot))
        .map<ToolFileEntry>((file) => {
          const relativePath = selectedRoot !== GENERATOR_ROOT_SENTINEL
            ? file.path.slice(prefix.length)
            : file.path;
          const normalizedRelative = relativePath.replace(/\\/g, "/");
          const folderMeta = this.getGeneratorFolderMeta(normalizedRelative);
          return {
            path: normalizedRelative,
            folder: folderMeta.folder,
            folderLabel: folderMeta.folderLabel,
            folderParent: folderMeta.folderParent,
            size: file.stat.size,
          };
        })
        .sort((a, b) => this.compareGeneratorLabels(a.path, b.path));

      this.generatorState.filesPath = selectedRoot;
      this.generatorState.fileEntries = entries;
      this.generatorState.files = entries.map((entry) => entry.path);
      this.generatorState.selectedFiles = this.generatorState.selectedFiles.filter((file) =>
        this.generatorState.files.includes(file),
      );
      if (
        this.generatorState.focusedFolder &&
        !entries.some((entry) => entry.folder === this.generatorState.focusedFolder)
      ) {
        this.generatorState.focusedFolder = "";
      }
      this.syncGeneratorOutputDir();
      this.generatorState.status = this.t("generatorStatusReady");
      this.recordWorkflowLog(
        "generator",
        `Loaded ${this.generatorState.files.length} files from ${this.getGeneratorRootLabel(selectedRoot)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.generatorState.fileError = message;
      this.generatorState.status = this.t("statusError");
    } finally {
      await this.renderGeneratorPanel();
    }
  }

  applyGeneratorJob(jobName: string): void {
    this.generatorState.jobName = jobName;
    if (jobName === MANUAL_JOB) {
      return;
    }

    const job = this.getJobList().find((candidate) => candidate.name === jobName);
    if (!job) {
      return;
    }

    this.generatorState.inputDir = job.input_dir || this.generatorState.inputDir;
    this.generatorState.outputDir = job.output_dir || this.generatorState.outputDir;
    this.generatorState.subject = job.subject || this.generatorState.subject;
    this.generatorState.modelName = job.model || this.generatorState.modelName;
    this.generatorState.selectedFiles = [];
    this.generatorState.focusedFolder = "";
    this.generatorState.files = [];
    this.generatorState.fileEntries = [];
    this.generatorState.filesPath = "";
    if (typeof job.temperature === "number") {
      this.generatorState.temperature = job.temperature;
    }
    if (Array.isArray(job.targets) && job.targets.length > 0) {
      this.generatorState.targetSet = MANUAL_TARGET_SET;
      this.generatorState.patternKeys = [...job.targets];
    } else {
      const fallbackTargetSet = this.generatorState.targetSet !== MANUAL_TARGET_SET
        ? this.generatorState.targetSet
        : Object.keys(this.getTargetSets())[0] ?? MANUAL_TARGET_SET;
      this.applyGeneratorTargetSet(fallbackTargetSet);
    }
  }

  applyGeneratorTargetSet(targetSet: string): void {
    this.generatorState.targetSet = targetSet;
    if (targetSet === MANUAL_TARGET_SET) {
      return;
    }
    this.generatorState.patternKeys = [...(this.getTargetSets()[targetSet] ?? [])];
  }

  getNoteRebuildTargetSetName(): string {
    const targetSets = this.getTargetSets();
    const candidates = [NOTE_REBUILD_TARGET_SET, "Note_Rebuild", "Note Rebuild"];
    return candidates.find((candidate) => Array.isArray(targetSets[candidate])) ?? "";
  }

  hasGeneratorPattern(patternKey: string): boolean {
    return this.getPatternKeys().includes(patternKey);
  }

  isNoteRebuildActive(): boolean {
    return this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD;
  }

  getEffectiveGeneratorPatternKeys(): string[] {
    const base = [...this.generatorState.patternKeys];
    if (
      this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD
      && this.generatorState.rebuildTitle
      && this.hasGeneratorPattern(TITLE_REBUILD_PATTERN)
      && !base.includes(TITLE_REBUILD_PATTERN)
    ) {
      base.unshift(TITLE_REBUILD_PATTERN);
    }
    return [...new Set(base)];
  }

  async primeGeneratorSelectionFromActiveFile(): Promise<void> {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!activeFile || !this.isGeneratorSupportedFile(activeFile)) {
      return;
    }
    const inputDir = this.getGeneratorRootKey(activeFile.path);
    const relativePath = inputDir === GENERATOR_ROOT_SENTINEL
      ? activeFile.path
      : activeFile.path.startsWith(`${inputDir}/`)
        ? activeFile.path.slice(inputDir.length + 1)
        : activeFile.name;
    const focusedFolder = relativePath.includes("/") ? relativePath.slice(0, relativePath.lastIndexOf("/")) : "";
    const shouldReload = this.generatorState.inputDir !== inputDir || this.generatorState.filesPath !== inputDir;
    this.generatorState.inputDir = inputDir;
    this.generatorState.focusedFolder = focusedFolder;
    this.syncGeneratorOutputDir();
    if (shouldReload) {
      await this.loadGeneratorFiles();
    }
    this.generatorState.selectedFiles = [relativePath];
    if (!this.generatorState.subject || this.generatorState.subject === "New Project") {
      this.generatorState.subject = activeFile.basename;
    }
  }

  async switchGeneratorMode(mode: GeneratorMode): Promise<void> {
    this.generatorState.mode = mode;
    if (mode === GENERATOR_MODE_NOTE_REBUILD) {
      const rebuildTargetSet = this.getNoteRebuildTargetSetName();
      if (rebuildTargetSet) {
        this.applyGeneratorTargetSet(rebuildTargetSet);
      }
      await this.primeGeneratorSelectionFromActiveFile();
      return;
    }

    if (this.generatorState.targetSet === this.getNoteRebuildTargetSetName()) {
      const fallbackTargetSet = Object.keys(this.getTargetSets()).find((key) => key !== this.getNoteRebuildTargetSetName()) ?? MANUAL_TARGET_SET;
      this.applyGeneratorTargetSet(fallbackTargetSet);
    }
  }

  createLogBlock(containerEl: HTMLElement, lines: string[], emptyMessage: string): void {
    const preEl = containerEl.createEl("pre", { cls: "ola-log-block" });
    preEl.setText(lines.length > 0 ? lines.join("\n") : emptyMessage);
  }

  groupFilesByFolder(files: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const file of files) {
      const normalized = file.replace(/\\/g, "/");
      const folder = normalized.includes("/") ? normalized.split("/")[0] : "(root)";
      const current = groups.get(folder) ?? [];
      current.push(file);
      groups.set(folder, current);
    }
    return groups;
  }

  groupFileEntriesByFolder(entries: ToolFileEntry[]): Map<string, ToolFileEntry[]> {
    const groups = new Map<string, ToolFileEntry[]>();
    for (const entry of entries) {
      const folder = entry.folder || "(root)";
      const current = groups.get(folder) ?? [];
      current.push(entry);
      groups.set(folder, current);
    }
    return groups;
  }

  compareGeneratorLabels(left: string, right: string): number {
    return new Intl.Collator(this.plugin.getLocale(), {
      numeric: true,
      sensitivity: "base",
    }).compare(left, right);
  }

  getSortedGeneratorGroups(): Array<[string, ToolFileEntry[]]> {
    return Array.from(this.groupFileEntriesByFolder(this.generatorState.fileEntries).entries()).sort((left, right) => {
      const leftEntry = left[1][0];
      const rightEntry = right[1][0];
      const leftLabel = leftEntry?.folder ?? left[0];
      const rightLabel = rightEntry?.folder ?? right[0];
      return this.compareGeneratorLabels(leftLabel, rightLabel);
    });
  }

  getGeneratorEntryDisplayPath(entry: ToolFileEntry): string {
    if (entry.folder === "(root)") {
      return entry.path;
    }
    const prefix = `${entry.folder}/`;
    return entry.path.startsWith(prefix) ? entry.path.slice(prefix.length) : entry.path;
  }

  getGeneratorFolderKeys(): Set<string> {
    return new Set(
      this.generatorState.fileEntries
        .map((entry) => entry.folder)
        .filter((folder) => Boolean(folder) && folder !== "(root)"),
    );
  }

  getGeneratorFolderParentKey(folderKey: string): string {
    if (!folderKey || folderKey === "(root)") {
      return "";
    }
    const knownFolders = this.getGeneratorFolderKeys();
    let current = folderKey;
    while (current.includes("/")) {
      current = current.slice(0, current.lastIndexOf("/"));
      if (knownFolders.has(current)) {
        return current;
      }
    }
    return "";
  }

  getGeneratorFocusedEntries(folderKey: string): ToolFileEntry[] {
    if (!folderKey || folderKey === "(root)") {
      return this.generatorState.fileEntries.filter((entry) => !entry.path.includes("/"));
    }
    const prefix = `${folderKey}/`;
    return this.generatorState.fileEntries.filter((entry) => entry.path.startsWith(prefix));
  }

  getGeneratorFocusedView(folderKey: string): {
    currentFiles: ToolFileEntry[];
    subfolders: Array<{ key: string; label: string; count: number; selectedCount: number }>;
  } {
    const entries = this.getGeneratorFocusedEntries(folderKey);
    const prefix = folderKey ? `${folderKey}/` : "";
    const currentFiles: ToolFileEntry[] = [];
    const subfolders = new Map<string, { key: string; label: string; count: number; selectedCount: number }>();

    for (const entry of entries) {
      const relative = prefix && entry.path.startsWith(prefix)
        ? entry.path.slice(prefix.length)
        : entry.path;
      const normalized = relative.replace(/\\/g, "/");
      if (!normalized.includes("/")) {
        currentFiles.push(entry);
        continue;
      }
      const [child] = normalized.split("/");
      const childKey = folderKey ? `${folderKey}/${child}` : child;
      const current = subfolders.get(childKey) ?? {
        key: childKey,
        label: child,
        count: 0,
        selectedCount: 0,
      };
      current.count += 1;
      if (this.generatorState.selectedFiles.includes(entry.path)) {
        current.selectedCount += 1;
      }
      subfolders.set(childKey, current);
    }

    currentFiles.sort((left, right) => this.compareGeneratorLabels(left.path, right.path));
    return {
      currentFiles,
      subfolders: Array.from(subfolders.values()).sort((left, right) => this.compareGeneratorLabels(left.key, right.key)),
    };
  }

  getSelectedGeneratorBytes(): number {
    const selected = new Set(this.generatorState.selectedFiles);
    return this.generatorState.fileEntries
      .filter((entry) => selected.has(entry.path))
      .reduce((total, entry) => total + (entry.size || 0), 0);
  }

  toggleGeneratorFolder(folder: string, checked: boolean): void {
    const matching = this.generatorState.fileEntries
      .filter((entry) => entry.folder === folder || entry.path.startsWith(`${folder}/`))
      .map((entry) => entry.path);
    if (checked) {
      this.generatorState.selectedFiles = [...new Set([...this.generatorState.selectedFiles, ...matching])];
      return;
    }
    const removed = new Set(matching);
    this.generatorState.selectedFiles = this.generatorState.selectedFiles.filter((path) => !removed.has(path));
  }

  async renderWorkflowPanels(): Promise<void> {
    await this.renderGeneratorPanel();
    await this.renderTaggerPanel();
    await this.renderIngestPanel();
    await this.renderWorkflowLogsPanel();
  }

  async renderGeneratorPanel(): Promise<void> {
    const hadDetails = this.generatorPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.generatorPanelEl);
    const generatorScrollHost = this.generatorPanelEl.parentElement instanceof HTMLElement
      ? this.generatorPanelEl.parentElement
      : this.generatorTabEl;
    const previousScrollTop = generatorScrollHost?.scrollTop ?? 0;
    const status = this.generatorState.status || this.t("generatorStatusReady");
    const bodyEl = this.renderToolSummary(this.generatorPanelEl, this.t("toolGenerator"), status);
    bodyEl.createEl("p", { cls: "ola-workflow-intro", text: this.t("generatorIntro") });
    const isBusy = Boolean(this.runningTask);
    const progressValue = Math.max(0, Math.min(this.generatorState.progress, 100));
    const inputRoots = this.getGeneratorRootEntries();
    if (!inputRoots.some((entry) => entry.path === this.generatorState.inputDir)) {
      this.generatorState.inputDir = inputRoots[0]?.path ?? GENERATOR_ROOT_SENTINEL;
    }
    const folderSeed = ["", ...this.getAllVaultFolderOptions(), this.generatorState.outputDir];
    if (this.generatorState.inputDir && this.generatorState.inputDir !== GENERATOR_ROOT_SENTINEL) {
      folderSeed.push(this.generatorState.inputDir);
    }
    const folderOptions = Array.from(
      new Set(
        folderSeed
          .map((value) => normalizePath(value || "")),
      ),
    ).sort((a, b) => a.localeCompare(b));

    const filesStageEl = this.createSectionDetails(bodyEl, this.t("generatorSectionFiles"), true);
    const filesHeaderGrid = filesStageEl.createDiv({
      cls: this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD
        ? "ola-generator-files-row ola-generator-files-row--rebuild"
        : "ola-generator-files-row ola-generator-files-row--standard",
    });

    const modeField = this.createField(filesHeaderGrid, this.t("generatorMode"));
    modeField.addClass("ola-field--mode");
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: GENERATOR_MODE_STANDARD, text: this.t("generatorModeStandard") });
    modeSelect.createEl("option", { value: GENERATOR_MODE_NOTE_REBUILD, text: this.t("generatorModeNoteRebuild") });
    modeSelect.value = this.generatorState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", async () => {
      await this.switchGeneratorMode(modeSelect.value as GeneratorMode);
      await this.renderGeneratorPanel();
    });

    const inputField = this.createField(filesHeaderGrid, this.t("generatorInputDir"));
    inputField.addClass("ola-field--input-root");
    const inputSelect = inputField.createEl("select");
    for (const root of inputRoots) {
      inputSelect.createEl("option", {
        value: root.path,
        text: `${root.label} (${root.count})`,
      });
    }
    inputSelect.value = this.generatorState.inputDir;
    inputSelect.disabled = isBusy;
    inputSelect.addEventListener("change", async () => {
      this.generatorState.inputDir = inputSelect.value;
      this.generatorState.selectedFiles = [];
      this.generatorState.focusedFolder = "";
      this.syncGeneratorOutputDir();
      await this.loadGeneratorFiles();
    });

    let subjectInput: HTMLInputElement;
    if (this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD) {
      const subjectField = filesHeaderGrid.createDiv({ cls: "ola-field" });
      subjectField.addClass("ola-field--title-rebuild");
      const subjectHeader = subjectField.createDiv({ cls: "ola-field-label-row ola-field-label-row--compact" });
      const rebuildToggle = subjectHeader.createEl("label", { cls: "ola-check-option ola-check-option--compact ola-check-option--field" });
      const rebuildCheckbox = rebuildToggle.createEl("input", { attr: { type: "checkbox", "aria-label": this.t("generatorRebuildTitle") } });
      rebuildCheckbox.checked = this.generatorState.rebuildTitle;
      rebuildCheckbox.disabled = isBusy || !this.hasGeneratorPattern(TITLE_REBUILD_PATTERN);
      rebuildCheckbox.addEventListener("change", () => {
        this.generatorState.rebuildTitle = rebuildCheckbox.checked;
        void this.renderGeneratorPanel();
      });
      rebuildToggle.createSpan({ text: this.t("generatorSubjectRebuild") });
      subjectInput = subjectField.createEl("input", { attr: { type: "text" } });
      subjectInput.value = this.generatorState.subject;
      subjectInput.placeholder = this.plugin.app.workspace.getActiveFile()?.basename ?? "";
      subjectInput.disabled = isBusy || !this.generatorState.rebuildTitle;
      subjectInput.addEventListener("change", () => {
        this.generatorState.subject = subjectInput.value;
      });
    } else {
      const subjectField = this.createField(filesHeaderGrid, this.t("generatorSubject"));
      subjectField.addClass("ola-field--subject");
      subjectInput = subjectField.createEl("input", { attr: { type: "text" } });
      subjectInput.value = this.generatorState.subject;
      subjectInput.disabled = isBusy;
      subjectInput.addEventListener("change", () => {
        this.generatorState.subject = subjectInput.value;
      });
    }

    const selectedBytes = this.getSelectedGeneratorBytes();
    const estimatedTokens = Math.floor(selectedBytes / 3);
    const singleFileRebuild = this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD;
    const fileSummary = filesStageEl.createDiv({ cls: "ola-generator-summary-inline" });
    const activeRootLabel = this.getGeneratorRootLabel(this.generatorState.inputDir);
    const summaryParts = [
      `파일 ${this.generatorState.selectedFiles.length}`,
      this.formatBytes(selectedBytes),
      `${estimatedTokens.toLocaleString(this.plugin.getLocale())} tok`,
      activeRootLabel,
    ];
    fileSummary.setText(summaryParts.join(" / "));
    if (this.generatorState.fileError) {
      filesStageEl.createDiv({ cls: "ola-tool-status ola-tool-status--error", text: this.generatorState.fileError });
    }
    if (this.generatorState.files.length === 0) {
      filesStageEl.createDiv({ cls: "ola-field-help", text: this.t("generatorNoFiles") });
    } else {
      const grouped = this.getSortedGeneratorGroups();
      const groupsEl = filesStageEl.createDiv({ cls: "ola-file-groups" });
      if (this.generatorState.focusedFolder) {
        const focusedGroup = grouped.find(([folder]) => folder === this.generatorState.focusedFolder)
          ?? grouped.find(([folder]) => this.generatorState.focusedFolder.startsWith(`${folder}/`))
          ?? null;
        if (focusedGroup) {
          const [folder, entries] = focusedGroup;
          const rootFolderMeta = entries[0];
          const focusedView = this.getGeneratorFocusedView(this.generatorState.focusedFolder);
          const focusedCard = groupsEl.createDiv({ cls: "ola-file-group ola-file-group--focused" });
          const focusRow = focusedCard.createDiv({ cls: "ola-folder-focus-row" });
          const backButton = focusRow.createEl("button", {
            cls: "ola-folder-back-button",
            text: this.t("generatorFolderBack"),
          });
          backButton.disabled = isBusy;
          backButton.addEventListener("click", () => {
            this.generatorState.focusedFolder = this.getGeneratorFolderParentKey(this.generatorState.focusedFolder);
            this.syncGeneratorOutputDir();
            void this.renderGeneratorPanel();
          });
          const titleBlock = focusRow.createDiv({ cls: "ola-folder-focus-title" });
          const titleLabel = this.generatorState.focusedFolder.slice(folder.length).replace(/^\/+/, "") || rootFolderMeta.folderLabel;
          titleBlock.createEl("strong", {
            text: `${titleLabel} (${focusedView.currentFiles.length + focusedView.subfolders.reduce((total, item) => total + item.count, 0)})`,
          });
          if (this.generatorState.focusedFolder !== folder) {
            titleBlock.createDiv({ cls: "ola-field-help", text: `${rootFolderMeta.folderLabel} / ${titleLabel}` });
          } else if (rootFolderMeta.folderParent) {
            titleBlock.createDiv({ cls: "ola-field-help", text: rootFolderMeta.folderParent });
          }

          const folderBody = focusedCard.createDiv({ cls: "ola-file-group-body" });
          const focusedEntries = this.getGeneratorFocusedEntries(this.generatorState.focusedFolder);
          const selectedCount = focusedEntries.filter((entry) => this.generatorState.selectedFiles.includes(entry.path)).length;
          const folderSelectRow = folderBody.createDiv({ cls: "ola-folder-select-row" });
          folderSelectRow.createSpan({
            cls: "ola-badge ola-badge--score",
            text: `${selectedCount}/${focusedEntries.length}`,
          });
          const folderSelectLabel = folderSelectRow.createEl("label", { cls: "ola-check-option ola-check-option--compact ola-folder-inline-check" });
          const folderCheckbox = folderSelectLabel.createEl("input", { attr: { type: "checkbox" } });
          folderCheckbox.checked = focusedEntries.length > 0 && selectedCount === focusedEntries.length;
          folderCheckbox.indeterminate = selectedCount > 0 && selectedCount < focusedEntries.length;
          folderCheckbox.disabled = isBusy || singleFileRebuild;
          folderCheckbox.addEventListener("change", () => {
            this.toggleGeneratorFolder(this.generatorState.focusedFolder, folderCheckbox.checked);
            void this.renderGeneratorPanel();
          });
          folderSelectLabel.createSpan({ text: this.t("generatorSelectAllFolder") });

          if (focusedView.subfolders.length > 0) {
            const subfolderList = folderBody.createDiv({ cls: "ola-file-groups ola-file-groups--nested" });
            for (const subfolder of focusedView.subfolders) {
              const subfolderRow = subfolderList.createDiv({ cls: "ola-file-group-listing ola-file-group-listing--row" });
              const subfolderMain = subfolderRow.createDiv({ cls: "ola-folder-line-main" });
              const openSubfolderButton = subfolderMain.createEl("button", {
                cls: "ola-folder-open-button",
                text: `${subfolder.label} (${subfolder.count})`,
              });
              openSubfolderButton.disabled = isBusy;
              openSubfolderButton.addEventListener("click", () => {
                this.generatorState.focusedFolder = subfolder.key;
                this.syncGeneratorOutputDir();
                void this.renderGeneratorPanel();
              });
              subfolderMain.createSpan({
                cls: "ola-badge ola-badge--score",
                text: `${subfolder.selectedCount}/${subfolder.count}`,
              });
              const subfolderActions = subfolderRow.createDiv({ cls: "ola-folder-line-actions" });
              const subfolderSelectLabel = subfolderActions.createEl("label", { cls: "ola-check-option ola-check-option--compact ola-folder-inline-check" });
              const subfolderCheckbox = subfolderSelectLabel.createEl("input", { attr: { type: "checkbox" } });
              subfolderCheckbox.checked = subfolder.selectedCount === subfolder.count;
              subfolderCheckbox.indeterminate = subfolder.selectedCount > 0 && subfolder.selectedCount < subfolder.count;
              subfolderCheckbox.disabled = isBusy || singleFileRebuild;
              subfolderCheckbox.addEventListener("change", () => {
                this.toggleGeneratorFolder(subfolder.key, subfolderCheckbox.checked);
                void this.renderGeneratorPanel();
              });
              subfolderSelectLabel.createSpan({ text: this.t("generatorSelectAllFolder") });
            }
          }

          for (const entry of focusedView.currentFiles) {
            const optionEl = folderBody.createEl("label", { cls: "ola-check-option ola-file-option" });
            const checkbox = optionEl.createEl("input", { attr: { type: "checkbox" } });
            checkbox.checked = this.generatorState.selectedFiles.includes(entry.path);
            checkbox.disabled = isBusy;
            checkbox.addEventListener("change", () => {
              if (checkbox.checked) {
                this.generatorState.selectedFiles = singleFileRebuild
                  ? [entry.path]
                  : [...new Set([...this.generatorState.selectedFiles, entry.path])];
              } else {
                this.generatorState.selectedFiles = this.generatorState.selectedFiles.filter((value) => value !== entry.path);
              }
              void this.renderGeneratorPanel();
            });
            optionEl.createSpan({ text: `${this.getGeneratorEntryDisplayPath(entry)} (${this.formatBytes(entry.size)})` });
          }
        }
      } else {
        for (const [folder, entries] of grouped) {
          const folderMeta = entries[0];
          const selectedCount = entries.filter((entry) => this.generatorState.selectedFiles.includes(entry.path)).length;
          const groupButton = groupsEl.createEl("button", { cls: "ola-file-group-listing ola-file-group-listing--main ola-file-group-listing--button" });
          groupButton.disabled = isBusy;
          groupButton.addEventListener("click", () => {
            this.generatorState.focusedFolder = folder;
            this.syncGeneratorOutputDir();
            void this.renderGeneratorPanel();
          });
          const topRow = groupButton.createDiv({ cls: "ola-folder-line-main" });
          const titleRow = topRow.createDiv({ cls: "ola-folder-line-title" });
          titleRow.createEl("strong", { text: `${folderMeta.folderLabel} (${entries.length})` });
          if (folderMeta.folderParent) {
            titleRow.createSpan({ cls: "ola-folder-line-path", text: folderMeta.folderParent });
          }
          topRow.createSpan({
            cls: "ola-badge ola-badge--score",
            text: `${selectedCount}/${entries.length}`,
          });
        }
      }
    }

    const settingsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("generatorSectionSettings"),
      true,
      (summaryActionsEl) => {
        const reloadButton = summaryActionsEl.createEl("button", {
          cls: "ola-generator-settings-reload",
          text: this.t("workflowsRefresh"),
        });
        reloadButton.disabled = isBusy;
        reloadButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toolConfigInitialized = false;
          this.initializeToolDefaults(true);
          void this.loadToolConfig(true);
          void this.loadGeneratorFiles();
        });
      },
    );
    const allPatterns = this.getPatternKeys();
    const effectivePatternKeys = this.getEffectiveGeneratorPatternKeys();
    const visiblePatternGroups = this.getPatternGroupEntries()
      .map(([groupName, groupedPatterns]) => [groupName, groupedPatterns.filter((pattern) => pattern !== TITLE_REBUILD_PATTERN)] as [string, string[]])
      .filter(([, groupedPatterns]) => groupedPatterns.length > 0);
    const showRebuildTitleOption = false;
    const outputField = this.createField(settingsStageEl, this.t("generatorOutputDir"));
    const outputDir = outputField.createEl("select");
    for (const folderPath of folderOptions) {
      outputDir.createEl("option", {
        value: folderPath,
        text: folderPath || "/",
      });
    }
    outputDir.value = this.generatorState.outputDir;
    outputDir.disabled = isBusy || this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD;
    outputDir.addEventListener("change", () => {
      this.generatorState.outputDir = outputDir.value;
    });
    if (this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD) {
      outputField.createDiv({ cls: "ola-field-help", text: "노트 재구성은 현재 선택 파일을 직접 덮어씁니다." });
    }

    const settingsGrid = settingsStageEl.createDiv({ cls: "ola-tool-grid ola-tool-grid--3" });

    const modelField = this.createField(settingsGrid, this.t("generatorModel"));
    const modelSelect = modelField.createEl("select");
    for (const model of this.getModelOptions()) {
      modelSelect.createEl("option", { value: model, text: model });
    }
    modelSelect.value = this.generatorState.modelName;
    modelSelect.disabled = isBusy;
    modelSelect.addEventListener("change", () => {
      this.generatorState.modelName = modelSelect.value;
    });

    const tempField = this.createField(settingsGrid, this.t("generatorTemperature"));
    const tempInput = tempField.createEl("input", {
      attr: { type: "number", min: "0", max: "1", step: "0.1" },
    });
    tempInput.value = String(this.generatorState.temperature);
    tempInput.disabled = isBusy;
    tempInput.addEventListener("change", () => {
      const next = Number.parseFloat(tempInput.value);
      this.generatorState.temperature = Number.isFinite(next) ? next : 0.1;
    });

    const targetSetField = this.createField(settingsGrid, this.t("generatorTargetSet"));
    const targetSetSelect = targetSetField.createEl("select");
    targetSetSelect.createEl("option", {
      value: MANUAL_TARGET_SET,
      text: this.t("generatorManualTargetSet"),
    });
    for (const targetSetName of Object.keys(this.getTargetSets())) {
      targetSetSelect.createEl("option", { value: targetSetName, text: targetSetName });
    }
    targetSetSelect.value = this.generatorState.targetSet;
    targetSetSelect.disabled = isBusy;
    targetSetSelect.addEventListener("change", async () => {
      this.applyGeneratorTargetSet(targetSetSelect.value);
      await this.renderGeneratorPanel();
    });

    const patternSection = settingsStageEl.createDiv({ cls: "ola-subsection-card ola-subsection-card--nested" });
    const patternHeader = patternSection.createDiv({ cls: "ola-pattern-header" });
    const patternHeaderMeta = patternHeader.createDiv({ cls: "ola-pattern-header-meta" });
    patternHeaderMeta.createEl("strong", { text: this.t("generatorPatterns") });
    patternHeaderMeta.createSpan({
      cls: "ola-field-help",
      text: `${effectivePatternKeys.length}/${allPatterns.length}`,
    });
    const patternHeaderActions = patternHeader.createDiv({ cls: "ola-pattern-header-actions" });
    const createPatternButton = patternHeaderActions.createEl("button", {
      text: this.t("generatorCreatePatternNote"),
    });
    createPatternButton.disabled = isBusy;
    createPatternButton.addEventListener("click", () => {
      void this.createPatternNote();
    });
    const patternHelp = patternSection.createDiv({ cls: "ola-field-help" });
    patternHelp.setText(this.generatorState.targetSet === MANUAL_TARGET_SET
      ? this.t("generatorManualTargetSet")
      : `${this.t("generatorTargetSet")}: ${this.generatorState.targetSet}`);

    const patternGroupList = patternSection.createDiv({ cls: "ola-pattern-groups" });
    for (const [groupName, groupedPatterns] of visiblePatternGroups) {
      const groupDetails = patternGroupList.createEl("details", { cls: "ola-pattern-group" });
      if (groupName === this.generatorState.targetSet || visiblePatternGroups.length === 1) {
        groupDetails.open = true;
      }
      groupDetails.createEl("summary", {
        cls: "ola-pattern-group-summary",
        text: `${groupName} (${groupedPatterns.length})`,
      });
      const groupBody = groupDetails.createDiv({ cls: "ola-pattern-group-body" });
      for (const pattern of groupedPatterns) {
        const preview = this.getPatternPreview(pattern);
        const cardEl = groupBody.createDiv({ cls: "ola-pattern-card" });
        const topRow = cardEl.createDiv({ cls: "ola-pattern-card-main" });
        const selectLabel = topRow.createEl("label", { cls: "ola-pattern-select" });
        const checkbox = selectLabel.createEl("input", { attr: { type: "checkbox" } });
        checkbox.checked = effectivePatternKeys.includes(pattern);
        checkbox.disabled = isBusy;
        checkbox.addEventListener("change", () => {
          this.generatorState.targetSet = MANUAL_TARGET_SET;
          if (checkbox.checked) {
            this.generatorState.patternKeys = [...new Set([...this.generatorState.patternKeys, pattern])];
          } else {
            this.generatorState.patternKeys = this.generatorState.patternKeys.filter((value) => value !== pattern);
          }
          void this.renderGeneratorPanel();
        });
        const textEl = selectLabel.createSpan({ cls: "ola-pattern-card-text" });
        textEl.createEl("strong", { text: pattern });
        if (preview.editor_note_path) {
          textEl.createEl("div", { cls: "ola-field-help", text: preview.editor_note_path });
        }

        const cardActions = topRow.createDiv({ cls: "ola-pattern-card-actions" });
        const openNoteButton = cardActions.createEl("button", {
          cls: "ola-pattern-open-button",
          text: this.t("generatorPatternOpenNote"),
        });
        openNoteButton.disabled = isBusy;
        openNoteButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          void this.openPatternNote(pattern);
        });

        const badgeRow = cardEl.createDiv({ cls: "ola-badge-row" });
        badgeRow.createSpan({
          cls: `ola-badge ${preview.source === "obsidian" ? "ola-badge--context" : "ola-badge--raw"}`,
          text: preview.source === "obsidian"
            ? this.t("generatorPatternSourceObsidian")
            : this.t("generatorPatternSourceYaml"),
        });
        if (preview.output_suffix) {
          badgeRow.createSpan({
            cls: "ola-badge ola-badge--score",
            text: this.t("generatorPatternOutputSuffix", { suffix: preview.output_suffix }),
          });
        }
        if (preview.use_subject_prefix) {
          badgeRow.createSpan({
            cls: "ola-badge ola-badge--summary",
            text: this.t("generatorPatternSubjectPrefix"),
          });
        }
      }
    }

    const runButton = bodyEl.createEl("button", {
      cls: "mod-cta ola-run-button",
      text: this.runningTask === "generator"
        ? this.t("generatorStatusProgress", { progress: progressValue })
        : this.t("generatorRun"),
    });
    runButton.disabled = isBusy;
    runButton.addEventListener("click", () => {
      void this.runGenerator();
    });

    const logsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("generatorSectionLogs"),
      this.generatorLogs.length > 0 || this.runningTask === "generator",
    );
    this.createLogBlock(logsStageEl, this.generatorLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.generatorPanelEl, openKeys);
    }
    generatorScrollHost.scrollTop = previousScrollTop;
  }

  async renderTaggerPanel(): Promise<void> {
    const hadDetails = this.taggerPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.taggerPanelEl);
    const taggerScrollHost = this.taggerPanelEl.parentElement instanceof HTMLElement
      ? this.taggerPanelEl.parentElement
      : this.taggerTabEl;
    const previousScrollTop = taggerScrollHost?.scrollTop ?? 0;
    const status = this.taggerState.status || this.t("taggerStatusReady");
    const bodyEl = this.renderToolSummary(this.taggerPanelEl, this.t("toolTagger"), status);
    bodyEl.createEl("p", { cls: "ola-workflow-intro", text: this.t("taggerIntroIndexed") });
    const isBusy = Boolean(this.runningTask);
    const folderOptions = this.getWorkflowFolderOptions([this.taggerState.inputDir]);
    const effectiveInputDir = this.getEffectiveTaggerInputDir();
    const manifest = this.toolConfig?.tagger_index_manifest;
    const manifestCounts = manifest?.counts ?? {};
    const taggerRules = this.getTaggerRulesConfig();
    const taggerThresholds = taggerRules.thresholds ?? {};
    const summaryBar = bodyEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      `${this.t("taggerTarget")}: ${this.t(this.taggerState.target === "summary"
        ? "commonSummary"
        : this.taggerState.target === "raw"
          ? "commonRaw"
          : "commonBoth")}`,
      `${this.t("taggerMode")}: ${this.t(this.taggerState.mode === "reset" ? "commonReset" : "commonIncremental")}`,
      `${this.t("taggerRewriteScope")}: ${effectiveInputDir || this.t("workflowVaultWide")}`,
      manifest ? this.t("taggerIndexReady") : this.t("workflowsConfigMissing"),
      `Logs: ${this.taggerLogs.length}`,
    ].forEach((text) => {
      summaryBar.createSpan({ cls: "ola-generator-summary-chip", text });
    });

    if (manifest) {
      const indexStageEl = this.createSectionDetails(bodyEl, this.t("taggerIndexStatus"), false);
      const infoGrid = indexStageEl.createDiv({ cls: "ola-info-grid" });
      const indexScopeCard = infoGrid.createDiv({ cls: "ola-info-card" });
      indexScopeCard.createEl("div", { cls: "ola-info-card-label", text: this.t("taggerIndexScope") });
      indexScopeCard.createEl("div", { cls: "ola-info-card-value", text: manifest.scope || "obsidian_vault" });

      const notesCard = infoGrid.createDiv({ cls: "ola-info-card" });
      notesCard.createEl("div", { cls: "ola-info-card-label", text: this.t("taggerNotes") });
      notesCard.createEl("div", { cls: "ola-info-card-value", text: String(manifestCounts.notes ?? "-") });

      const edgesCard = infoGrid.createDiv({ cls: "ola-info-card" });
      edgesCard.createEl("div", { cls: "ola-info-card-label", text: this.t("taggerGraphEdges") });
      edgesCard.createEl("div", { cls: "ola-info-card-value", text: String(manifestCounts.graph_edges ?? "-") });

      const tokensCard = infoGrid.createDiv({ cls: "ola-info-card" });
      tokensCard.createEl("div", { cls: "ola-info-card-label", text: this.t("taggerTokens") });
      tokensCard.createEl("div", { cls: "ola-info-card-value", text: String(manifestCounts.tokens ?? "-") });

      if (manifest.manifest_path) {
        const manifestCard = infoGrid.createDiv({ cls: "ola-info-card" });
        manifestCard.addClass("ola-info-card--full");
        manifestCard.createEl("div", { cls: "ola-info-card-label", text: this.t("taggerManifestPath") });
        manifestCard.createEl("div", { cls: "ola-info-card-value", text: manifest.manifest_path });
      }
    }

    const rulesStageEl = this.createSectionDetails(bodyEl, this.t("taggerSectionRules"), false);
    rulesStageEl.createEl("p", { cls: "ola-workflow-intro", text: this.t("taggerRulesHelp") });
    const rulesSummaryBar = rulesStageEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      this.t("taggerCanonicalCount", { count: taggerRules.canonical_tag_count ?? 0 }),
      this.t("taggerSynonymCount", { count: taggerRules.synonym_entries ?? 0 }),
      this.t("taggerSemanticLimit", { count: taggerThresholds.semantic_tag_limit ?? "-" }),
      this.t("taggerMinScore", { score: taggerThresholds.min_score ?? "-" }),
    ].forEach((text) => {
      rulesSummaryBar.createSpan({ cls: "ola-generator-summary-chip", text });
    });

    const rulesActionRow = rulesStageEl.createDiv({ cls: "ola-inline-actions" });
    const openGuideButton = rulesActionRow.createEl("button", { text: this.t("taggerOpenRulesReadme") });
    openGuideButton.disabled = isBusy;
    openGuideButton.addEventListener("click", () => {
      void this.openTaggerWorkspaceNote();
    });
    const openCanonicalButton = rulesActionRow.createEl("button", { text: this.t("taggerOpenCanonicalTags") });
    openCanonicalButton.disabled = isBusy;
    openCanonicalButton.addEventListener("click", () => {
      void this.openTaggerRuleNote("canonical");
    });
    const openSynonymButton = rulesActionRow.createEl("button", { text: this.t("taggerOpenSynonymMap") });
    openSynonymButton.disabled = isBusy;
    openSynonymButton.addEventListener("click", () => {
      void this.openTaggerRuleNote("synonym");
    });
    const openPriorityButton = rulesActionRow.createEl("button", { text: this.t("taggerOpenTaggingPriority") });
    openPriorityButton.disabled = isBusy;
    openPriorityButton.addEventListener("click", () => {
      void this.openTaggerRuleNote("priority");
    });

    const settingsStageEl = this.createSectionDetails(bodyEl, this.t("taggerSectionSettings"), true);
    const gridEl = settingsStageEl.createDiv({ cls: "ola-tool-grid ola-tool-grid--2" });
    const inputField = this.createField(gridEl, this.t("generatorInputDir"));
    inputField.addClass("ola-field--full");
    const inputSelect = inputField.createEl("select");
    inputSelect.createEl("option", { value: "", text: this.t("workflowVaultWide") });
    for (const folderPath of folderOptions.filter(Boolean)) {
      inputSelect.createEl("option", { value: folderPath, text: folderPath || "/" });
    }
    inputSelect.value = this.taggerState.inputDir;
    inputSelect.disabled = isBusy;
    inputSelect.addEventListener("change", () => {
      this.taggerState.inputDir = inputSelect.value;
      void this.renderTaggerPanel();
    });

    const targetField = this.createField(gridEl, this.t("taggerTarget"));
    const targetSelect = targetField.createEl("select");
    targetSelect.createEl("option", { value: "summary", text: this.t("commonSummary") });
    targetSelect.createEl("option", { value: "raw", text: this.t("commonRaw") });
    targetSelect.createEl("option", { value: "all", text: this.t("commonBoth") });
    targetSelect.value = this.taggerState.target;
    targetSelect.disabled = isBusy;
    targetSelect.addEventListener("change", () => {
      this.taggerState.target = targetSelect.value as TaggerState["target"];
    });

    const modeField = this.createField(gridEl, this.t("taggerMode"));
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: "incremental", text: this.t("commonIncremental") });
    modeSelect.createEl("option", { value: "reset", text: this.t("commonReset") });
    modeSelect.value = this.taggerState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", () => {
      this.taggerState.mode = modeSelect.value as TaggerState["mode"];
    });

    const actionRow = bodyEl.createDiv({ cls: "ola-inline-actions ola-inline-actions--primary" });
    const runButton = actionRow.createEl("button", { text: this.t("taggerRun") });
    runButton.addClass("mod-cta");
    runButton.disabled = isBusy;
    runButton.addEventListener("click", () => {
      void this.runTagger();
    });

    const logsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("taggerSectionLogs"),
      this.taggerLogs.length > 0 || this.runningTask === "tagger",
    );
    this.createLogBlock(logsStageEl, this.taggerLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.taggerPanelEl, openKeys);
    }
    taggerScrollHost.scrollTop = previousScrollTop;
  }

  async renderIngestPanel(): Promise<void> {
    const hadDetails = this.ingestPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.ingestPanelEl);
    const ingestScrollHost = this.ingestPanelEl.parentElement instanceof HTMLElement
      ? this.ingestPanelEl.parentElement
      : this.ingestTabEl;
    const previousScrollTop = ingestScrollHost?.scrollTop ?? 0;
    const status = this.ingestState.status || this.t("ingestStatusReady");
    const bodyEl = this.renderToolSummary(this.ingestPanelEl, this.t("toolIngest"), status);
    bodyEl.createEl("p", { cls: "ola-workflow-intro", text: this.t("ingestIntro") });
    const isBusy = Boolean(this.runningTask);
    const folderOptions = this.getWorkflowFolderOptions([
      this.ingestState.inputDir,
      this.ingestState.outputDir,
      this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir,
      this.generatorState.outputDir,
    ]);

    const selectedJob = this.ingestState.job === "all"
      ? null
      : this.getJobList().find((job) => job.name === this.ingestState.job) ?? null;
    const effectiveInputDir = this.getEffectiveIngestInputDir();
    const effectiveOutputDir = this.getEffectiveIngestOutputDir();

    const summaryBar = bodyEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      `${this.t("ingestJob")}: ${selectedJob?.name || this.t("ingestAllJobs")}`,
      `${this.t("ingestLayer")}: ${this.t(this.ingestState.layer === "summary"
        ? "commonSummary"
        : this.ingestState.layer === "raw"
          ? "commonRaw"
          : "commonBoth")}`,
      `${this.t("ingestMode")}: ${this.t(
        this.ingestState.mode === "reset"
          ? "commonReset"
          : this.ingestState.mode === "cleanup"
            ? "commonCleanup"
            : "commonIncremental",
      )}`,
      `${this.t("ingestPolicy")}: ${this.t(
        this.ingestState.policy === "headings"
          ? "commonHeadings"
          : this.ingestState.policy === "paragraph"
            ? "commonParagraph"
            : this.ingestState.policy === "minimal"
              ? "commonMinimal"
              : "commonAuto",
      )}`,
      `${this.t("generatorInputDir")}: ${effectiveInputDir || this.t("workflowUseGeneratorSource")}`,
      `${this.t("generatorOutputDir")}: ${effectiveOutputDir || this.t("workflowUseGeneratorSource")}`,
      this.t("generatorSelectedFiles", {
        count: this.ingestState.inputDir ? 0 : this.generatorState.selectedFiles.length,
      }),
    ].forEach((text) => {
      summaryBar.createSpan({ cls: "ola-generator-summary-chip", text });
    });

    const projectStageEl = this.createSectionDetails(bodyEl, this.t("ingestSectionProject"), true);
    const projectGrid = projectStageEl.createDiv({ cls: "ola-tool-grid ola-tool-grid--2" });
    const jobField = this.createField(projectGrid, this.t("ingestJob"));
    const jobSelect = jobField.createEl("select");
    jobSelect.createEl("option", { value: "all", text: this.t("ingestAllJobs") });
    for (const job of this.getJobList()) {
      jobSelect.createEl("option", { value: job.name, text: job.name });
    }
    jobSelect.value = this.ingestState.job;
    jobSelect.disabled = isBusy;
    jobSelect.addEventListener("change", () => {
      this.ingestState.job = jobSelect.value;
      void this.renderIngestPanel();
    });

    const inputField = this.createField(projectGrid, this.t("generatorInputDir"));
    const inputSelect = inputField.createEl("select");
    inputSelect.createEl("option", { value: "", text: this.t("workflowUseGeneratorSource") });
    for (const folderPath of folderOptions.filter(Boolean)) {
      inputSelect.createEl("option", { value: folderPath, text: folderPath || "/" });
    }
    inputSelect.value = this.ingestState.inputDir;
    inputSelect.disabled = isBusy;
    inputSelect.addEventListener("change", () => {
      this.ingestState.inputDir = inputSelect.value;
      void this.renderIngestPanel();
    });

    const outputField = this.createField(projectGrid, this.t("generatorOutputDir"));
    const outputSelect = outputField.createEl("select");
    outputSelect.createEl("option", { value: "", text: this.t("workflowUseGeneratorSource") });
    for (const folderPath of folderOptions.filter(Boolean)) {
      outputSelect.createEl("option", { value: folderPath, text: folderPath || "/" });
    }
    outputSelect.value = this.ingestState.outputDir;
    outputSelect.disabled = isBusy;
    outputSelect.addEventListener("change", () => {
      this.ingestState.outputDir = outputSelect.value;
      void this.renderIngestPanel();
    });

    const infoGrid = projectStageEl.createDiv({ cls: "ola-info-grid" });
    const sourceInfo = infoGrid.createDiv({ cls: "ola-info-card" });
    sourceInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestResolvedInput") });
    sourceInfo.createEl("div", {
      cls: "ola-info-card-value",
      text: selectedJob?.input_dir_resolved || selectedJob?.input_dir || this.toolConfig?.default_input_dir || "-",
    });
    const targetInfo = infoGrid.createDiv({ cls: "ola-info-card" });
    targetInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestResolvedOutput") });
    targetInfo.createEl("div", {
      cls: "ola-info-card-value",
      text: selectedJob?.output_dir_resolved || selectedJob?.output_dir || this.toolConfig?.default_output_dir || "-",
    });
    if (selectedJob?.ingest?.collection_raw || selectedJob?.ingest?.collection_summary) {
      const collectionInfo = infoGrid.createDiv({ cls: "ola-info-card" });
      collectionInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestCollectionRaw") });
      collectionInfo.createEl("div", {
        cls: "ola-info-card-value",
        text: selectedJob.ingest?.collection_raw || "-",
      });
      const collectionSummaryInfo = infoGrid.createDiv({ cls: "ola-info-card" });
      collectionSummaryInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestCollectionSummary") });
      collectionSummaryInfo.createEl("div", {
        cls: "ola-info-card-value",
        text: selectedJob.ingest?.collection_summary || "-",
      });
    }

    const settingsStageEl = this.createSectionDetails(bodyEl, this.t("ingestSectionSettings"), true);
    const gridEl = settingsStageEl.createDiv({ cls: "ola-tool-grid ola-tool-grid--2" });
    const layerField = this.createField(gridEl, this.t("ingestLayer"));
    const layerSelect = layerField.createEl("select");
    layerSelect.createEl("option", { value: "summary", text: this.t("commonSummary") });
    layerSelect.createEl("option", { value: "raw", text: this.t("commonRaw") });
    layerSelect.createEl("option", { value: "both", text: this.t("commonBoth") });
    layerSelect.value = this.ingestState.layer;
    layerSelect.disabled = isBusy;
    layerSelect.addEventListener("change", () => {
      this.ingestState.layer = layerSelect.value as IngestState["layer"];
    });

    const modeField = this.createField(gridEl, this.t("ingestMode"));
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: "incremental", text: this.t("commonIncremental") });
    modeSelect.createEl("option", { value: "reset", text: this.t("commonReset") });
    modeSelect.createEl("option", { value: "cleanup", text: this.t("commonCleanup") });
    modeSelect.value = this.ingestState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", () => {
      this.ingestState.mode = modeSelect.value as IngestState["mode"];
    });

    const policyField = this.createField(gridEl, this.t("ingestPolicy"));
    const policySelect = policyField.createEl("select");
    policySelect.createEl("option", { value: "auto", text: this.t("commonAuto") });
    policySelect.createEl("option", { value: "headings", text: this.t("commonHeadings") });
    policySelect.createEl("option", { value: "paragraph", text: this.t("commonParagraph") });
    policySelect.createEl("option", { value: "minimal", text: this.t("commonMinimal") });
    policySelect.value = this.ingestState.policy;
    policySelect.disabled = isBusy;
    policySelect.addEventListener("change", () => {
      this.ingestState.policy = policySelect.value as IngestState["policy"];
    });

    const chunkField = this.createField(gridEl, this.t("ingestChunkSize"));
    const chunkInput = chunkField.createEl("input", {
      attr: { type: "number", min: "500", max: "4000", step: "50" },
    });
    chunkInput.value = String(this.ingestState.chunkSize);
    chunkInput.disabled = isBusy;
    chunkInput.addEventListener("change", () => {
      const next = Number.parseInt(chunkInput.value, 10);
      this.ingestState.chunkSize = Number.isFinite(next) ? next : 800;
    });

    const overlapField = this.createField(gridEl, this.t("ingestOverlap"));
    const overlapInput = overlapField.createEl("input", {
      attr: { type: "number", min: "0", max: "500", step: "50" },
    });
    overlapInput.value = String(this.ingestState.overlap);
    overlapInput.disabled = isBusy;
    overlapInput.addEventListener("change", () => {
      const next = Number.parseInt(overlapInput.value, 10);
      this.ingestState.overlap = Number.isFinite(next) ? next : 100;
    });

    const headingField = this.createField(settingsStageEl, this.t("ingestHeadingLevels"));
    const headingGrid = headingField.createDiv({ cls: "ola-check-grid" });
    for (const level of [1, 2, 3, 4]) {
      const optionEl = headingGrid.createEl("label", { cls: "ola-check-option" });
      const checkbox = optionEl.createEl("input", { attr: { type: "checkbox" } });
      checkbox.checked = this.ingestState.headingLevels.includes(level);
      checkbox.disabled = isBusy;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          this.ingestState.headingLevels = [...new Set([...this.ingestState.headingLevels, level])].sort();
        } else {
          this.ingestState.headingLevels = this.ingestState.headingLevels.filter((value) => value !== level);
        }
      });
      optionEl.createSpan({ text: `H${level}` });
    }

    const codeAttachLabel = settingsStageEl.createEl("label", { cls: "ola-check-option" });
    const codeAttach = codeAttachLabel.createEl("input", { attr: { type: "checkbox" } });
    codeAttach.checked = this.ingestState.codeAttach;
    codeAttach.disabled = isBusy;
    codeAttach.addEventListener("change", () => {
      this.ingestState.codeAttach = codeAttach.checked;
    });
    codeAttachLabel.createSpan({ text: this.t("ingestCodeAttach") });

    const actionRow = bodyEl.createDiv({ cls: "ola-inline-actions ola-inline-actions--primary" });
    const runButton = actionRow.createEl("button", { text: this.t("ingestRun") });
    runButton.addClass("mod-cta");
    runButton.disabled = isBusy;
    runButton.addEventListener("click", () => {
      void this.runIngest();
    });

    const logsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("ingestSectionLogs"),
      this.ingestLogs.length > 0 || this.runningTask === "ingest",
    );
    this.createLogBlock(logsStageEl, this.ingestLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.ingestPanelEl, openKeys);
    }
    ingestScrollHost.scrollTop = previousScrollTop;
  }

  async renderWorkflowLogsPanel(): Promise<void> {
    const hadDetails = this.workflowLogsPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.workflowLogsPanelEl);
    const bodyEl = this.renderToolSummary(
      this.workflowLogsPanelEl,
      this.t("logsTitle", { count: this.workflowLogs.length }),
      this.runningTask ? this.t("workflowsBusy", { tool: this.getToolLabel(this.runningTask) }) : this.t("statusIdle"),
    );
    const summaryBar = bodyEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      `Total: ${this.workflowLogs.length}`,
      `Generator: ${this.workflowLogs.filter((entry) => entry.tool === "generator").length}`,
      `Tagger: ${this.workflowLogs.filter((entry) => entry.tool === "tagger").length}`,
      `Ingest: ${this.workflowLogs.filter((entry) => entry.tool === "ingest").length}`,
    ].forEach((text) => {
      summaryBar.createSpan({ cls: "ola-generator-summary-chip", text });
    });

    const logsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("toolLogs"),
      true,
      (summaryActionsEl) => {
        const clearButton = summaryActionsEl.createEl("button", {
          cls: "ola-generator-settings-reload",
          text: this.t("logsClear"),
        });
        clearButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.workflowLogs = [];
          void this.renderWorkflowLogsPanel();
        });
      },
    );

    if (this.workflowLogs.length === 0) {
      logsStageEl.createDiv({ cls: "ola-field-help", text: this.t("logsEmpty") });
      if (hadDetails) {
        this.restoreOpenDetails(this.workflowLogsPanelEl, openKeys);
      }
      return;
    }

    const listEl = logsStageEl.createDiv({ cls: "ola-workflow-log-list" });
    for (const entry of this.workflowLogs.slice(0, 60)) {
      const itemEl = listEl.createDiv({ cls: "ola-workflow-log-item" });
      itemEl.createSpan({
        cls: "ola-badge ola-badge--score",
        text: `${entry.timestamp} ${this.getToolLabel(entry.tool)}`,
      });
      itemEl.createDiv({ cls: "ola-workflow-log-text", text: entry.message });
    }
    if (hadDetails) {
      this.restoreOpenDetails(this.workflowLogsPanelEl, openKeys);
    }
  }

  async runGenerator(): Promise<void> {
    const effectivePatternKeys = this.getEffectiveGeneratorPatternKeys();
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }
    if (this.generatorState.inputDir == null) {
      new Notice(this.t("noticeNoInputDir"));
      return;
    }
    if (this.generatorState.outputDir == null) {
      new Notice(this.t("noticeNoOutputDir"));
      return;
    }
    if (this.generatorState.jobName === MANUAL_JOB && effectivePatternKeys.length === 0) {
      new Notice(this.t("noticeNoPatterns"));
      return;
    }
    if (this.generatorState.selectedFiles.length === 0) {
      new Notice(this.t("noticeNoSelectedFiles"));
      return;
    }
    if (!(await this.refreshBackendState())) {
      new Notice(this.t("noticeBackendUnavailable"));
      return;
    }

    await this.plugin.ensureFolder(this.generatorState.outputDir);
    const absoluteInputDir = this.plugin.resolveVaultFolderPath(
      this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir,
    );
    const absoluteOutputDir = this.plugin.resolveVaultFolderPath(this.generatorState.outputDir);

    this.abortActiveRequest();
    this.abortController = new AbortController();
    this.runningTask = "generator";
    this.setActiveTab("generator");
    this.generatorState.status = this.t("generatorStatusRunning");
    this.generatorState.progress = 0;
    this.generatorLogs = [];
    this.applyBusyState();
    await this.renderWorkflowPanels();

    try {
      await this.streamNdjson(
        "/api/tools/generator/stream",
        {
          job_name: this.generatorState.jobName === MANUAL_JOB ? "" : this.generatorState.jobName,
          input_dir: absoluteInputDir,
          output_dir: absoluteOutputDir,
          subject: this.generatorState.subject,
          pattern_keys: effectivePatternKeys,
          model_name: this.generatorState.modelName,
          temp: this.generatorState.temperature,
          selected_files: this.generatorState.selectedFiles,
          generation_mode: this.generatorState.mode,
          rebuild_title: this.generatorState.rebuildTitle,
        },
        async (chunk) => {
          const data = chunk as ToolStreamChunk;
          if (typeof data.progress === "number") {
            this.generatorState.progress = Math.max(0, Math.min(100, data.progress));
          }
          if (typeof data.message === "string" && data.message.trim()) {
            this.generatorLogs.push(data.message);
            this.generatorLogs = this.generatorLogs.slice(-80);
            this.recordWorkflowLog("generator", data.message);
            await this.renderGeneratorPanel();
          }
        },
      );
      this.generatorState.status = this.t("statusDone");
      this.generatorState.progress = 100;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.generatorState.status = this.t("statusError");
      this.generatorLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("generator", `[error] ${message}`);
      new Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }

  async runTagger(): Promise<void> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }

    this.abortActiveRequest();
    this.abortController = new AbortController();
    this.runningTask = "tagger";
    this.setActiveTab("tagger");
    this.taggerState.status = this.t("taggerStatusRunning");
    this.taggerLogs = [];
    this.applyBusyState();
    await this.renderWorkflowPanels();

    try {
      const effectiveInputDir = this.getEffectiveTaggerInputDir();
      const absoluteInputDir = effectiveInputDir
        ? this.plugin.resolveVaultFolderPath(effectiveInputDir)
        : "";
      await this.streamNdjson(
        "/api/tools/tagger/stream",
        {
          target: this.taggerState.target,
          mode: this.taggerState.mode,
          input_dir: absoluteInputDir,
          selected_files: [],
        },
        async (chunk) => {
          const data = chunk as ToolStreamChunk;
          if (typeof data.message === "string" && data.message.trim()) {
            this.taggerLogs.push(data.message);
            this.taggerLogs = this.taggerLogs.slice(-80);
            this.recordWorkflowLog("tagger", data.message);
            await this.renderTaggerPanel();
          }
        },
      );
      this.taggerState.status = this.t("statusDone");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.taggerState.status = this.t("statusError");
      this.taggerLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("tagger", `[error] ${message}`);
      new Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }

  async runIngest(): Promise<void> {
    if (this.runningTask) {
      new Notice(this.t("noticeToolBusy"));
      return;
    }

    this.abortActiveRequest();
    this.abortController = new AbortController();
    this.runningTask = "ingest";
    this.setActiveTab("ingest");
    this.ingestState.status = this.t("ingestStatusRunning");
    this.ingestLogs = [];
    this.applyBusyState();
    await this.renderWorkflowPanels();

    try {
      const effectiveInputDir = this.getEffectiveIngestInputDir();
      const effectiveOutputDir = this.getEffectiveIngestOutputDir();
      const absoluteInputDir = effectiveInputDir
        ? this.plugin.resolveVaultFolderPath(effectiveInputDir)
        : "";
      const absoluteOutputDir = effectiveOutputDir
        ? this.plugin.resolveVaultFolderPath(effectiveOutputDir)
        : "";
      await this.streamNdjson(
        "/api/tools/ingest/stream",
        {
          job: this.ingestState.job,
          layer: this.ingestState.layer,
          mode: this.ingestState.mode,
          policy: this.ingestState.policy,
          chunk_size: this.ingestState.chunkSize,
          overlap: this.ingestState.overlap,
          heading_levels: this.ingestState.headingLevels,
          code_attach: this.ingestState.codeAttach,
          input_dir: absoluteInputDir,
          output_dir: absoluteOutputDir,
          selected_files: this.ingestState.inputDir ? [] : this.generatorState.selectedFiles,
        },
        async (chunk) => {
          const data = chunk as ToolStreamChunk;
          if (typeof data.message === "string" && data.message.trim()) {
            this.ingestLogs.push(data.message);
            this.ingestLogs = this.ingestLogs.slice(-80);
            this.recordWorkflowLog("ingest", data.message);
            await this.renderIngestPanel();
          }
        },
      );
      this.ingestState.status = this.t("statusDone");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.ingestState.status = this.t("statusError");
      this.ingestLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("ingest", `[error] ${message}`);
      new Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }

  async renderSentContextPanel(): Promise<void> {
    this.sentContextDetailsEl.empty();
    this.sentContextDetailsEl.open = false;
    const summaryEl = this.sentContextDetailsEl.createEl("summary", {
      text: this.t("panelSentContext", { count: this.currentContextEntries.length }),
    });
    summaryEl.addClass("ola-meta-summary");

    const bodyEl = this.sentContextDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.currentContextEntries.length === 0) {
      bodyEl.setText(this.t("panelNoSentContext"));
      return;
    }

    const cards = this.currentContextEntries.map<SourceCardData>((entry) => ({
      label: entry.name,
      path: entry.path,
      badge: this.plugin.getContextSourceLabel(entry.source),
      badgeClass: "ola-badge--context",
      snippet: this.buildSnippetPreview(entry.content),
      reason: `${this.t("debugSelectedBy")}: ${this.plugin.getContextSourceLabel(entry.source)}`,
      hint: entry.path,
    }));
    this.renderSourceCards(bodyEl, cards);
  }

  async renderSourcePanel(): Promise<void> {
    this.sourceDetailsEl.empty();
    this.sourceDetailsEl.open = false;
    const summaryEl = this.sourceDetailsEl.createEl("summary", {
      text: this.t("panelRetrievedSources", { count: this.backendSources.length }),
    });
    summaryEl.addClass("ola-meta-summary");

    const bodyEl = this.sourceDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.backendSources.length === 0) {
      bodyEl.setText(this.t("panelNoRetrievedSources"));
      return;
    }

    const cards = this.backendSources.map<SourceCardData>((source) => ({
      label: this.plugin.resolveVaultFile(source.path)?.basename || source.name || source.path,
      path: source.path,
      badge: this.plugin.getLayerLabel(source.layer),
      badgeClass: `ola-badge--${source.layer}`,
      snippet: this.buildSnippetPreview(source.snippet),
      reason: this.buildSourceReason(source),
      secondaryBadge: this.t("badgeScore", {
        score: typeof source.score === "number" ? source.score.toFixed(3) : "0.000",
      }),
      secondaryBadgeClass: "ola-badge--score",
      tertiaryBadge: source.relation_type ? this.getRelationTypeLabel(source.relation_type) : undefined,
      tertiaryBadgeClass: source.relation_type ? "ola-badge--relation" : undefined,
      quaternaryBadge: source.is_main === false ? this.t("badgeReference") : undefined,
      quaternaryBadgeClass: source.is_main === false ? "ola-badge--ref" : undefined,
      hint: [
        source.project_id ? `[${source.project_id}]` : "",
        source.doc_role || "",
        source.note_type || "",
        source.section_heading ? `# ${source.section_heading}` : "",
        source.folder || source.path,
      ].filter(Boolean).join(" · "),
    }));
    this.renderSourceCards(bodyEl, cards);
  }

  async renderRecommendationPanel(): Promise<void> {
    this.recommendationDetailsEl.empty();
    this.recommendationDetailsEl.open = false;
    const summaryEl = this.recommendationDetailsEl.createEl("summary", {
      text: this.t("panelFollowUpNotes", { count: this.backendRecommendations.length }),
    });
    summaryEl.addClass("ola-meta-summary");

    const bodyEl = this.recommendationDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.backendRecommendations.length === 0) {
      bodyEl.setText(this.t("panelNoFollowUpNotes"));
      return;
    }

    const cards = this.backendRecommendations.map<SourceCardData>((item) => ({
      label: this.plugin.resolveVaultFile(item.path)?.basename || item.name || item.path,
      path: item.path,
      badge: this.getRelationTypeLabel(item.relation_type),
      badgeClass: "ola-badge--relation",
      reason: this.buildRecommendationReason(item),
      secondaryBadge: typeof item.confidence === "number"
        ? this.t("badgeConfidence", { score: item.confidence.toFixed(3) })
        : undefined,
      secondaryBadgeClass: typeof item.confidence === "number" ? "ola-badge--score" : undefined,
      hint: [
        item.project_id ? `[${item.project_id}]` : "",
        item.doc_role || "",
        item.note_type || "",
        item.folder || item.path,
      ].filter(Boolean).join(" · "),
    }));
    this.renderSourceCards(bodyEl, cards);
  }

  renderSourceCards(containerEl: HTMLElement, cards: SourceCardData[]): void {
    const listEl = containerEl.createDiv({ cls: "ola-source-list" });
    for (const card of cards) {
      const cardEl = listEl.createDiv({ cls: "ola-source-card" });
      const headerEl = cardEl.createDiv({ cls: "ola-source-header" });

      const resolved = this.plugin.resolveVaultFile(card.path);
      if (resolved) {
        const linkEl = headerEl.createEl("button", {
          cls: "ola-source-link",
          text: card.label,
        });
        linkEl.addEventListener("click", async () => {
          await this.plugin.openFileFromSource(resolved);
        });
      } else {
        headerEl.createEl("div", {
          cls: "ola-source-link ola-source-link--disabled",
          text: card.label,
        });
      }

      const badgeRowEl = cardEl.createDiv({ cls: "ola-badge-row" });
      badgeRowEl.createSpan({
        cls: `ola-badge ${card.badgeClass}`,
        text: card.badge,
      });

      if (card.secondaryBadge && card.secondaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.secondaryBadgeClass}`,
          text: card.secondaryBadge,
        });
      }

      if (card.tertiaryBadge && card.tertiaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.tertiaryBadgeClass}`,
          text: card.tertiaryBadge,
        });
      }

      if (card.quaternaryBadge && card.quaternaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.quaternaryBadgeClass}`,
          text: card.quaternaryBadge,
        });
      }

      if (card.snippet) {
        cardEl.createDiv({
          cls: "ola-source-snippet",
          text: card.snippet,
        });
      }

      if (card.reason) {
        cardEl.createDiv({
          cls: "ola-source-reason",
          text: card.reason,
        });
      }

      cardEl.createDiv({
        cls: "ola-source-path",
        text: card.hint,
      });
    }
  }

  buildSourceReason(source: StreamSource): string {
    const parts: string[] = [];
    const sourceLabel = this.getSourceLabel(source.source);
    if (sourceLabel) {
      parts.push(`${this.t("debugSelectedBy")}: ${sourceLabel}`);
    }
    if (source.relation_type) {
      parts.push(`${this.t("debugRelationType")}: ${this.getRelationTypeLabel(source.relation_type)}`);
    }
    if (source.reason) {
      parts.push(`${this.t("debugReasonPrefix")}: ${source.reason}`);
    }
    return parts.join(" | ");
  }

  buildRecommendationReason(item: RecommendationItem): string {
    const parts: string[] = [];
    if (item.relation_type) {
      parts.push(`${this.t("debugRelationType")}: ${this.getRelationTypeLabel(item.relation_type)}`);
    }
    if (Array.isArray(item.seed_titles) && item.seed_titles.length > 0) {
      parts.push(`${this.t("debugSelectedBy")}: ${item.seed_titles.join(", ")}`);
    }
    if (item.reason) {
      parts.push(`${this.t("debugReasonPrefix")}: ${item.reason}`);
    }
    return parts.join(" | ");
  }

  getSourceLabel(source: string | undefined): string {
    switch (source) {
      case "current":
        return this.t("sourceCurrent");
      case "current_candidate":
        return this.t("sourceCurrentCandidate");
      case "vault_search":
      case "vault":
      case "summary":
      case "raw":
        return this.t("sourceVaultSearch");
      case "links":
        return this.t("sourceLinks");
      case "related_files":
        return this.t("sourceRelatedFiles");
      case "auto_related":
        return this.t("sourceAutoRelated");
      case "typed_relation":
        return this.t("sourceTypedRelation");
      case "folder":
        return this.t("sourceFolder");
      case "tags":
        return this.t("sourceTags");
      case "backlinks":
        return this.t("sourceBacklinks");
      case "context":
        return this.t("sourceContext");
      default:
        return source ?? "";
    }
  }

  getRelationTypeLabel(relationType: string | undefined): string {
    switch ((relationType ?? "").trim()) {
      case "same_topic":
        return this.t("relationSameTopic");
      case "references":
        return this.t("relationReferences");
      case "summarizes":
        return this.t("relationSummarizes");
      case "expands":
        return this.t("relationExpands");
      case "implements":
        return this.t("relationImplements");
      case "review_of":
        return this.t("relationReviewOf");
      case "next_action_for":
        return this.t("relationNextActionFor");
      case "decision_for":
        return this.t("relationDecisionFor");
      case "follow_up":
        return this.t("relationFollowUp");
      default:
        return relationType?.trim() || "";
    }
  }

  buildSnippetPreview(text: string | undefined, maxChars = 220): string {
    if (!text) {
      return "";
    }

    const compact = text
      .replace(/^---[\s\S]*?---/, "")
      .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    if (!compact) {
      return "";
    }
    return compact.length > maxChars ? `${compact.slice(0, maxChars).trim()}...` : compact;
  }

  linkifyVaultPaths(content: string): string {
    const pathPattern = /([A-Za-z]:[\\/][^\s<>"']+\.[A-Za-z0-9]+|(?:[\w\-. ]+\/)+[\w\-. ]+\.[A-Za-z0-9]+)/g;
    return content.replace(pathPattern, (match) => {
      const resolved = this.plugin.resolveVaultFile(match);
      if (!resolved) {
        return match;
      }
      const display = resolved.name;
      return `[[${resolved.path}|${display}]]`;
    });
  }

  async clearConversation(): Promise<void> {
    this.abortActiveRequest();
    this.runningTask = null;
    this.activeSessionId = "";
    this.renderedOutput = "";
    this.lastQuestion = "";
    this.currentContextEntries = [];
    this.backendSources = [];
    this.backendRecommendations = [];
    this.answerBasis = "";
    this.chatTurns = [];
    const threadRecord = this.plugin.getChatThread(this.activeThreadId);
    if (threadRecord) {
      threadRecord.turns = [];
      threadRecord.title = this.t("threadUntitled");
      threadRecord.updatedAt = new Date().toISOString();
      this.plugin.sortChatThreadsByRecent();
      await this.plugin.saveSettings();
    }
    if (this.conversationActionsEl) {
      this.conversationActionsEl.open = false;
    }
    this.renderThreadRow();
    this.setBusy(false);
    await this.renderContextPanels();
    await this.renderOutput();
    new Notice(this.t("noticeConversationCleared"));
  }

  async saveAnswer(): Promise<void> {
    const turn = this.getLatestCompletedTurn();
    const file = this.getAnswerTargetFile(turn);
    if (!file) {
      new Notice(this.t("noticeOpenNote"));
      return;
    }

    if (!turn?.answer.trim()) {
      new Notice(this.t("noticeNoAnswerToSave"));
      return;
    }

    const folderPath = normalizePath(this.plugin.settings.saveFolder);
    await this.plugin.ensureFolder(folderPath);

    const titleBase = file.basename.replace(/[\\/:*?"<>|]/g, "-");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = normalizePath(`${folderPath}/${titleBase}-${timestamp}.md`);
    const markdown = this.buildSavedAnswerMarkdown(file, turn, "note");

    await this.plugin.app.vault.create(outputPath, markdown);
    if (this.conversationActionsEl) {
      this.conversationActionsEl.open = false;
    }
    new Notice(this.t("noticeSavedAnswer", { path: outputPath }));
  }

  async appendAnswerToCurrentNote(): Promise<void> {
    const turn = this.getLatestCompletedTurn();
    const file = this.getAnswerTargetFile(turn);
    if (!file) {
      new Notice(this.t("noticeOpenNote"));
      return;
    }

    if (!turn?.answer.trim()) {
      new Notice(this.t("noticeNoAnswerToAppend"));
      return;
    }

    const markdown = this.buildSavedAnswerMarkdown(file, turn, "append");
    await this.plugin.app.vault.append(file, `\n\n${markdown}\n`);
    if (this.conversationActionsEl) {
      this.conversationActionsEl.open = false;
    }
    new Notice(this.t("noticeAppendedAnswer", { path: file.path }));
  }

  getAnswerTargetFile(turn?: ChatTurn | null): TFile | null {
    const targetPath = turn?.attachedFilePath || this.currentFilePath;
    if (targetPath) {
      const current = this.plugin.app.vault.getAbstractFileByPath(targetPath);
      if (current instanceof TFile) {
        return current;
      }
    }
    return this.plugin.app.workspace.getActiveFile();
  }

  buildSavedAnswerMarkdown(file: TFile, turn: ChatTurn, mode: "note" | "append"): string {
    const now = new Date().toLocaleString(this.plugin.getLocale());
    const title = mode === "note"
      ? this.t("savedTitleNote")
      : this.t("savedTitleAppend", { now });
    const answerHeading = mode === "note" ? this.t("savedAnswerHeadingNote") : this.t("savedAnswerHeadingAppend");
    const sourceHeading = mode === "note" ? this.t("savedSourcesHeadingNote") : this.t("savedSourcesHeadingAppend");
    const contextHeading = mode === "note" ? this.t("savedContextHeadingNote") : this.t("savedContextHeadingAppend");
    const sections = [
      title,
      "",
      `- ${this.t("savedSourceNote")}: ${this.plugin.makeWikiLink(file, file.basename)}`,
      `- ${this.t("savedQuestion")}: ${turn.question || this.t("savedEmptyQuestion")}`,
      `- ${this.t("savedSavedAt")}: ${now}`,
      "",
      answerHeading,
      "",
      this.linkifyVaultPaths(turn.answer).trim(),
    ];

    const sourceLines = turn.sources
      .map((source) => {
        const label = this.plugin.resolveVaultFile(source.path)?.basename || source.name || source.path;
        const parts = [
          this.plugin.makeVaultLinkOrCode(source.path, label),
          this.plugin.getLayerLabel(source.layer).toLowerCase(),
          this.t("badgeScore", {
            score: typeof source.score === "number" ? source.score.toFixed(3) : "0.000",
          }),
        ];
        if (source.is_main === false) {
          parts.push(this.t("badgeReference"));
        }
        return `- ${parts.join(" | ")}`;
      });
    if (sourceLines.length > 0) {
      sections.push("", sourceHeading, "", ...sourceLines);
    }

    const contextLines = turn.contextEntries.map((entry) => {
      const resolved = this.plugin.resolveVaultFile(entry.path);
      const label = `${entry.name} - ${this.plugin.getContextSourceLabel(entry.source).toLowerCase()}`;
      return `- ${resolved ? this.plugin.makeWikiLink(resolved, label) : `\`${entry.path}\``}`;
    });
    if (contextLines.length > 0) {
      sections.push("", contextHeading, "", ...contextLines);
    }

    return sections.join("\n");
  }

  updateChatActionButtonState(): void {
    if (!this.chatActionButton) {
      return;
    }

    const isChatRunning = this.runningTask === "chat";
    const hasQuestion = this.questionEl?.value.trim().length > 0;
    if (this.quickActionSuggestionsEl) {
      this.quickActionSuggestionsEl.classList.toggle("is-hidden", hasQuestion || Boolean(this.runningTask));
    }
    this.composeRowEl?.classList.toggle("is-suggesting", !hasQuestion && !this.runningTask);
    this.chatActionButton.textContent = isChatRunning ? "■" : "➤";
    this.chatActionButton.setAttribute("aria-label", isChatRunning ? this.t("buttonStop") : this.t("buttonAsk"));
    this.chatActionButton.setAttribute("title", isChatRunning ? this.t("buttonStop") : this.t("buttonAsk"));
    this.chatActionButton.classList.toggle("is-stop", isChatRunning);
    this.chatActionButton.disabled = isChatRunning ? false : Boolean(this.runningTask) || !hasQuestion;
  }

  applyBusyState(): void {
    const isBusy = Boolean(this.runningTask);
    if (this.backendStartButton) {
      this.backendStartButton.disabled = isBusy || this.backendLaunchPromise !== null;
    }
    if (this.backendRestartButton) {
      this.backendRestartButton.disabled = isBusy || this.backendLaunchPromise !== null;
    }
    if (this.backendStopButton) {
      this.backendStopButton.disabled = isBusy;
    }
    if (this.clearConversationButton) {
      this.clearConversationButton.disabled = isBusy || this.chatTurns.length === 0;
    }
    const latestTurn = this.getLatestCompletedTurn();
    if (this.appendButton) {
      this.appendButton.disabled = isBusy || !latestTurn?.answer.trim();
    }
    if (this.saveButton) {
      this.saveButton.disabled = isBusy || !latestTurn?.answer.trim();
    }
    if (this.questionEl) {
      this.questionEl.disabled = isBusy;
    }
    for (const button of this.quickActionButtons) {
      button.disabled = isBusy;
    }
    this.updateChatActionButtonState();
  }

  setBusy(isBusy: boolean): void {
    this.applyBusyState();
  }
}

class LocalAgentSettingTab extends PluginSettingTab {
  plugin: LocalAgentPlugin;

  constructor(app: App, plugin: LocalAgentPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(this.plugin.t("settingLanguageName"))
      .setDesc(this.plugin.t("settingLanguageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("ko", this.plugin.t("settingLanguageKorean"))
          .addOption("en", this.plugin.t("settingLanguageEnglish"))
          .setValue(this.plugin.settings.language)
          .onChange(async (value: LanguageCode) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.display();
            await this.plugin.refreshOpenViews();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingBackendName"))
      .setDesc(this.plugin.t("settingBackendDesc"))
      .addText((text) =>
        text
          .setPlaceholder("http://127.0.0.1:8011")
          .setValue(this.plugin.settings.backendUrl)
          .onChange(async (value) => {
            this.plugin.settings.backendUrl = value.trim() || DEFAULT_SETTINGS.backendUrl;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingAutoStartBackendName"))
      .setDesc(this.plugin.t("settingAutoStartBackendDesc"))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoStartBackend)
          .onChange(async (value) => {
            this.plugin.settings.autoStartBackend = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingBackendPythonName"))
      .setDesc(this.plugin.t("settingBackendPythonDesc"))
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.backendPythonPath)
          .setValue(this.plugin.settings.backendPythonPath)
          .onChange(async (value) => {
            this.plugin.settings.backendPythonPath = value.trim() || DEFAULT_SETTINGS.backendPythonPath;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingBackendScriptName"))
      .setDesc(this.plugin.t("settingBackendScriptDesc"))
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.backendScriptPath)
          .setValue(this.plugin.settings.backendScriptPath)
          .onChange(async (value) => {
            this.plugin.settings.backendScriptPath = value.trim() || DEFAULT_SETTINGS.backendScriptPath;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingBackendWorkingDirName"))
      .setDesc(this.plugin.t("settingBackendWorkingDirDesc"))
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.backendWorkingDir)
          .setValue(this.plugin.settings.backendWorkingDir)
          .onChange(async (value) => {
            this.plugin.settings.backendWorkingDir = value.trim() || DEFAULT_SETTINGS.backendWorkingDir;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingProjectName"))
      .setDesc(this.plugin.t("settingProjectDesc"))
      .addText((text) =>
        text
          .setPlaceholder("Default")
          .setValue(this.plugin.settings.defaultProject)
          .onChange(async (value) => {
            this.plugin.settings.defaultProject = value.trim() || DEFAULT_SETTINGS.defaultProject;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingSaveFolderName"))
      .setDesc(this.plugin.t("settingSaveFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder("AI Answers")
          .setValue(this.plugin.settings.saveFolder)
          .onChange(async (value) => {
            this.plugin.settings.saveFolder = value.trim() || DEFAULT_SETTINGS.saveFolder;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingMaxContextName"))
      .setDesc(this.plugin.t("settingMaxContextDesc"))
      .addText((text) =>
        text
          .setPlaceholder("6")
          .setValue(String(this.plugin.settings.maxContextNotes))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            this.plugin.settings.maxContextNotes = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SETTINGS.maxContextNotes;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingOpenModeName"))
      .setDesc(this.plugin.t("settingOpenModeDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("current", this.plugin.t("settingOpenModeCurrent"))
          .addOption("split", this.plugin.t("settingOpenModeSplit"))
          .addOption("tab", this.plugin.t("settingOpenModeTab"))
          .setValue(this.plugin.settings.sourceOpenMode)
          .onChange(async (value: "current" | "split" | "tab") => {
            this.plugin.settings.sourceOpenMode = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(this.plugin.t("settingSplitDirectionName"))
      .setDesc(this.plugin.t("settingSplitDirectionDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("left", this.plugin.t("settingDirectionLeft"))
          .addOption("right", this.plugin.t("settingDirectionRight"))
          .addOption("down", this.plugin.t("settingDirectionDown"))
          .setValue(this.plugin.settings.splitDirection)
          .onChange(async (value: "left" | "right" | "down") => {
            this.plugin.settings.splitDirection = value;
            await this.plugin.saveSettings();
          }),
      );

  }
}

export default class LocalAgentPlugin extends Plugin {
  settings: LocalAgentSettings = DEFAULT_SETTINGS;
  chatThreads: ChatThreadRecord[] = [];
  activeChatThreadId = "";
  lastMarkdownLeaf: WorkspaceLeaf | null = null;
  lastEditorSelection = "";
  lastEditorSelectionPath = "";

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_LOCAL_AGENT,
      (leaf) => new LocalAgentView(leaf, this),
    );

    this.addRibbonIcon("bot", this.t("commandOpen"), async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-local-agent",
      name: this.t("commandOpen"),
      callback: async () => {
        await this.activateView();
      },
    });

    this.addCommand({
      id: "ask-selection-with-local-agent",
      name: this.t("commandAskSelection"),
      callback: async () => {
        const view = await this.activateView();
        if (!view) {
          return;
        }
        await view.useSelection(true);
      },
    });

    this.addCommand({
      id: "summarize-current-note-with-local-agent",
      name: this.t("commandSummarize"),
      callback: async () => {
        const view = await this.activateView();
        if (!view) {
          return;
        }
        await view.runQuickAction("summary");
      },
    });

    this.addCommand({
      id: "organize-current-note-with-local-agent",
      name: this.t("commandOrganize"),
      callback: async () => {
        const view = await this.activateView();
        if (!view) {
          return;
        }
        await view.runQuickAction("organize");
      },
    });

    this.addCommand({
      id: "extract-next-actions-with-local-agent",
      name: this.t("commandNextActions"),
      callback: async () => {
        const view = await this.activateView();
        if (!view) {
          return;
        }
        await view.runQuickAction("next-actions");
      },
    });

    this.rememberMarkdownLeaf(this.app.workspace.getMostRecentLeaf());
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.rememberMarkdownLeaf(leaf);
        this.rememberActiveSelection();
      }),
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.rememberActiveSelection();
        void this.refreshLiveViews();
      }),
    );

    this.addSettingTab(new LocalAgentSettingTab(this.app, this));
  }

  language(): LanguageCode {
    return this.settings.language ?? DEFAULT_SETTINGS.language;
  }

  getLocale(): string {
    return this.language() === "ko" ? "ko-KR" : "en-US";
  }

  t(key: string, vars: TranslationVars = {}): string {
    const templateMap = {
      ...WORKFLOW_UI_STRINGS.en,
      ...UI_STRINGS.en,
      ...(WORKFLOW_UI_STRINGS[this.language()] ?? {}),
      ...(UI_STRINGS[this.language()] ?? {}),
    };
    const template = templateMap[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_match, name) => String(vars[name] ?? ""));
  }

  getQuickAction(key: QuickActionKey): { label: string; prompt: string } {
    return QUICK_ACTIONS[this.language()][key];
  }

  getLayerLabel(layer: "summary" | "raw"): string {
    return layer === "summary" ? this.t("sourceLayerSummary") : this.t("sourceLayerRaw");
  }

  getContextSourceLabel(source: ContextSource): string {
    const map: Record<ContextSource, string> = {
      links: "contextSourceLinks",
      folder: "contextSourceFolder",
      tags: "contextSourceTags",
      backlinks: "contextSourceBacklinks",
    };
    return this.t(map[source]);
  }

  getResponseLanguageInstruction(): string {
    return this.language() === "ko"
      ? "Answer in Korean unless the user's request explicitly asks for another language."
      : "Answer in English unless the user's request explicitly asks for another language.";
  }

  async refreshOpenViews(): Promise<void> {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT)) {
      const view = leaf.view;
      if (view instanceof LocalAgentView) {
        view.render();
        await view.refreshViewState();
      }
    }
  }

  async refreshLiveViews(): Promise<void> {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT)) {
      const view = leaf.view;
      if (view instanceof LocalAgentView) {
        await view.refreshContext();
      }
    }
  }

  async onunload(): Promise<void> {
    await this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT).reduce(
      async (prev, leaf) => {
        await prev;
        await leaf.setViewState({ type: "empty" });
      },
      Promise.resolve(),
    );
  }

  getMarkdownViewFromLeaf(leaf: WorkspaceLeaf | null): MarkdownView | null {
    return leaf?.view instanceof MarkdownView ? leaf.view : null;
  }

  rememberSelection(selection: string, filePath = ""): void {
    const trimmed = selection.trim();
    if (!trimmed) {
      return;
    }
    this.lastEditorSelection = trimmed;
    this.lastEditorSelectionPath = filePath;
  }

  rememberActiveSelection(): string {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const preferredView = this.getMarkdownViewFromLeaf(this.getPreferredMarkdownLeaf());
    const activeSelection = activeView?.editor?.getSelection().trim() ?? "";
    if (activeSelection) {
      this.rememberSelection(activeSelection, activeView?.file?.path ?? "");
      return activeSelection;
    }

    const preferredSelection = preferredView?.editor?.getSelection().trim() ?? "";
    if (preferredSelection) {
      this.rememberSelection(preferredSelection, preferredView?.file?.path ?? "");
      return preferredSelection;
    }

    return "";
  }

  getActiveSelection(): string {
    const currentSelection = this.rememberActiveSelection();
    if (currentSelection) {
      return currentSelection;
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const preferredView = this.getMarkdownViewFromLeaf(this.getPreferredMarkdownLeaf());
    const candidatePath = activeView?.file?.path ?? preferredView?.file?.path ?? "";
    if (candidatePath && this.lastEditorSelectionPath && candidatePath === this.lastEditorSelectionPath) {
      return this.lastEditorSelection;
    }
    return "";
  }

  async activateView(): Promise<LocalAgentView | null> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT)[0];

    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_LOCAL_AGENT, active: true });
    }

    workspace.revealLeaf(leaf);
    const view = leaf.view;
    return view instanceof LocalAgentView ? view : null;
  }

  async openFileFromSource(file: TFile): Promise<void> {
    if (this.settings.sourceOpenMode === "current") {
      const leaf = this.getPreferredMarkdownLeaf();
      await leaf.openFile(file, { active: true });
      this.rememberMarkdownLeaf(leaf);
      this.app.workspace.revealLeaf(leaf);
      return;
    }

    if (this.settings.sourceOpenMode === "tab") {
      const anchorLeaf = this.getPreferredMarkdownLeaf();
      this.app.workspace.setActiveLeaf(anchorLeaf, { focus: false });
      const leaf = this.app.workspace.getLeaf(true);
      await leaf.openFile(file, { active: true });
      this.rememberMarkdownLeaf(leaf);
      this.app.workspace.revealLeaf(leaf);
      return;
    }

    await this.openFileInSplit(file);
  }

  async openFileInSplit(file: TFile): Promise<void> {
    const anchorLeaf = this.getPreferredMarkdownLeaf();
    const direction = this.settings.splitDirection;
    const split = direction === "down" ? "horizontal" : "vertical";
    const leaf = this.app.workspace.createLeafBySplit(anchorLeaf, split, direction === "left");
    await leaf.openFile(file, { active: true });
    this.rememberMarkdownLeaf(leaf);
    this.app.workspace.revealLeaf(leaf);
  }

  rememberMarkdownLeaf(leaf: WorkspaceLeaf | null): void {
    if (leaf?.view instanceof MarkdownView) {
      this.lastMarkdownLeaf = leaf;
    }
  }

  getPreferredMarkdownLeaf(): WorkspaceLeaf {
    const activeMarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeMarkdownView?.leaf) {
      this.lastMarkdownLeaf = activeMarkdownView.leaf;
      return activeMarkdownView.leaf;
    }

    if (this.lastMarkdownLeaf?.view instanceof MarkdownView) {
      return this.lastMarkdownLeaf;
    }

    const firstMarkdownLeaf = this.app.workspace.getLeavesOfType("markdown")[0];
    if (firstMarkdownLeaf) {
      this.lastMarkdownLeaf = firstMarkdownLeaf;
      return firstMarkdownLeaf;
    }

    return this.app.workspace.getLeaf(false);
  }

  resolveVaultFile(rawPath: string): TFile | null {
    const normalized = rawPath.replace(/\\/g, "/").trim();
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof TFile) {
      return direct;
    }

    const basePath = this.getVaultBasePath();
    if (basePath) {
      const baseNormalized = basePath.replace(/\\/g, "/");
      if (normalized.startsWith(baseNormalized)) {
        const relative = normalized.slice(baseNormalized.length).replace(/^\/+/, "");
        const relativeFile = this.app.vault.getAbstractFileByPath(relative);
        if (relativeFile instanceof TFile) {
          return relativeFile;
        }
      }
    }

    return null;
  }

  getVaultBasePath(): string | null {
    const adapter = this.app.vault.adapter as { getBasePath?: () => string };
    if (typeof adapter.getBasePath === "function") {
      return normalizePath(adapter.getBasePath());
    }
    return null;
  }

  resolveVaultFolderPath(rawPath: string): string {
    const normalized = normalizePath((rawPath || "").trim());
    if (/^[A-Za-z]:[\\/]/.test(normalized) || normalized.startsWith("/")) {
      return normalized;
    }
    const basePath = this.getVaultBasePath();
    if (!basePath) {
      return normalized;
    }
    return normalized ? normalizePath(`${basePath}/${normalized}`) : basePath;
  }

  makeWikiLink(file: TFile, label?: string): string {
    const target = file.path.replace(/\.md$/i, "");
    return `[[${target}${label ? `|${label}` : ""}]]`;
  }

  makeVaultLinkOrCode(rawPath: string, label?: string): string {
    const resolved = this.resolveVaultFile(rawPath);
    if (!resolved) {
      return `\`${rawPath}\``;
    }
    return this.makeWikiLink(resolved, label ?? resolved.basename);
  }

  async ensureFolder(folderPath: string): Promise<void> {
    const parts = folderPath.split("/").filter(Boolean);
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      const existing = this.app.vault.getAbstractFileByPath(current);
      if (!existing) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  async loadSettings(): Promise<void> {
    const loaded = (await this.loadData()) as LocalAgentPluginData | null;
    const rawSettings = (loaded?.settings ?? loaded ?? {}) as Partial<LocalAgentSettings>;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      scopes: {
        ...DEFAULT_SETTINGS.scopes,
        ...(rawSettings?.scopes ?? {}),
      },
    };
    this.chatThreads = Array.isArray(loaded?.chatThreads) ? loaded.chatThreads : [];
    this.activeChatThreadId = typeof loaded?.activeChatThreadId === "string" ? loaded.activeChatThreadId : "";
    this.ensureChatThreads();
  }

  async saveSettings(): Promise<void> {
    await this.saveData({
      settings: this.settings,
      chatThreads: this.chatThreads,
      activeChatThreadId: this.activeChatThreadId,
    } satisfies LocalAgentPluginData);
  }

  createChatThread(title?: string): ChatThreadRecord {
    const now = new Date().toISOString();
    return {
      id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: (title || this.t("threadUntitled")).trim(),
      createdAt: now,
      updatedAt: now,
      turns: [],
    };
  }

  ensureChatThreads(): void {
    if (this.chatThreads.length === 0) {
      const initial = this.createChatThread();
      this.chatThreads = [initial];
      this.activeChatThreadId = initial.id;
      return;
    }
    this.sortChatThreadsByRecent();
    if (!this.chatThreads.some((thread) => thread.id === this.activeChatThreadId)) {
      this.activeChatThreadId = this.chatThreads[0].id;
    }
  }

  getChatThread(threadId: string): ChatThreadRecord | null {
    return this.chatThreads.find((thread) => thread.id === threadId) ?? null;
  }

  sortChatThreadsByRecent(): void {
    this.chatThreads.sort((a, b) => {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }
}



