"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LocalAgentPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");
var http = __toESM(require("node:http"));
var https = __toESM(require("node:https"));
var VIEW_TYPE_LOCAL_AGENT = "local-agent-view";
var MAX_NOTE_CHARS = 12e3;
var MAX_CONTEXT_NOTE_CHARS = 4e3;
var GENERATOR_SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set(["md", "txt", "py"]);
var CONTEXT_READABLE_EXTENSIONS = /* @__PURE__ */ new Set([
  "md",
  "txt",
  "py",
  "js",
  "ts",
  "tsx",
  "jsx",
  "json",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "sql",
  "sh",
  "bat",
  "ps1",
  "css",
  "scss",
  "html",
  "xml",
  "csv",
  "go",
  "rs",
  "java",
  "kt",
  "c",
  "cpp",
  "h",
  "hpp",
  "rb",
  "php",
  "env"
]);
var DEFAULT_SETTINGS = {
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
    backlinks: false
  }
};
var UI_STRINGS = {
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
var QUICK_ACTIONS = {
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
var WORKFLOW_UI_STRINGS = {
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
var MANUAL_JOB = "__manual__";
var MANUAL_TARGET_SET = "__manual__";
var GENERATOR_ROOT_SENTINEL = "__vault_root__";
var GENERATOR_MODE_STANDARD = "standard";
var GENERATOR_MODE_NOTE_REBUILD = "note_rebuild";
var NOTE_REBUILD_TARGET_SET = "\uB178\uD2B8 \uC7AC\uAD6C\uC131";
var TITLE_REBUILD_PATTERN = "Title_Rebuild";
function createDefaultGeneratorState() {
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
    fileError: ""
  };
}
function createDefaultTaggerState() {
  return {
    inputDir: "",
    target: "summary",
    mode: "incremental",
    status: ""
  };
}
function createDefaultIngestState() {
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
    status: ""
  };
}
var LocalAgentView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.tabButtons = /* @__PURE__ */ new Map();
    this.quickActionButtons = [];
    this.abortController = null;
    this.activeRequest = null;
    this.activeThreadId = "";
    this.renderedOutput = "";
    this.lastQuestion = "";
    this.activeSessionId = "";
    this.currentFilePath = "";
    this.chatSeenLogs = /* @__PURE__ */ new Set();
    this.chatTurns = [];
    this.lastEnterSubmitAt = 0;
    this.currentContextEntries = [];
    this.backendSources = [];
    this.backendRecommendations = [];
    this.answerBasis = "";
    this.runningTask = null;
    this.activeTab = "chat";
    this.workflowLogs = [];
    this.generatorLogs = [];
    this.taggerLogs = [];
    this.ingestLogs = [];
    this.toolConfig = null;
    this.toolConfigInitialized = false;
    this.toolConfigError = "";
    this.backendReady = false;
    this.backendPollStarted = false;
    this.backendLaunchPromise = null;
    this.lastAutoStartAttempt = 0;
    this.autoStartSuppressed = false;
    this.generatorState = createDefaultGeneratorState();
    this.taggerState = createDefaultTaggerState();
    this.ingestState = createDefaultIngestState();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_LOCAL_AGENT;
  }
  getDisplayText() {
    return this.plugin.t("viewDisplayName");
  }
  async onOpen() {
    this.render();
    this.initializeThreadState();
    await this.refreshContext(true);
    this.initializeToolDefaults(true);
    await this.loadGeneratorFiles();
  }
  async onClose() {
    this.backendPollStarted = false;
    this.abortActiveRequest();
  }
  t(key, vars) {
    return this.plugin.t(key, vars);
  }
  initializeThreadState() {
    this.plugin.ensureChatThreads();
    this.activeThreadId = this.plugin.activeChatThreadId;
    this.syncThreadStateFromPlugin();
  }
  syncThreadStateFromPlugin() {
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
      createdAt: turn.createdAt ?? (/* @__PURE__ */ new Date()).toISOString()
    }));
    activeThread.turns = this.chatTurns;
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
  async setActiveThread(threadId) {
    if (threadId === this.activeThreadId) {
      return;
    }
    const thread = this.plugin.getChatThread(threadId);
    if (thread) {
      thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
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
  async persistActiveThreadState(renderThreadRow = true) {
    const threadRecord = this.plugin.getChatThread(this.activeThreadId);
    if (!threadRecord) {
      return;
    }
    threadRecord.turns = this.chatTurns;
    threadRecord.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.plugin.sortChatThreadsByRecent();
    if (renderThreadRow) {
      this.renderThreadRow();
    }
    await this.plugin.saveSettings();
  }
  getThreadTurnCount(thread) {
    return (thread.turns ?? []).filter((turn) => {
      return Boolean(turn.question?.trim() || turn.answer?.trim());
    }).length;
  }
  formatThreadTimestamp(iso) {
    const value = new Date(iso);
    if (!Number.isFinite(value.getTime())) {
      return "";
    }
    const now = /* @__PURE__ */ new Date();
    const sameDay = value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate();
    const locale = this.plugin.language() === "ko" ? "ko-KR" : "en-US";
    const options = sameDay ? { hour: "2-digit", minute: "2-digit", hour12: false } : { month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat(locale, options).format(value);
  }
  getThreadMetaLabel(thread) {
    const turns = this.t("threadTurns", { count: this.getThreadTurnCount(thread) });
    const timestamp = this.formatThreadTimestamp(thread.updatedAt || thread.createdAt);
    return timestamp ? `${turns} \xB7 ${timestamp}` : turns;
  }
  async createNewThread() {
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
  async renameActiveThread() {
    const thread = this.plugin.getChatThread(this.activeThreadId);
    if (!thread) {
      return;
    }
    const nextTitle = window.prompt(this.t("promptRenameThread"), thread.title || this.t("threadUntitled"))?.trim();
    if (!nextTitle) {
      return;
    }
    thread.title = nextTitle;
    thread.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.plugin.sortChatThreadsByRecent();
    this.renderThreadRow();
    await this.plugin.saveSettings();
    new import_obsidian.Notice(this.t("noticeThreadRenamed"));
  }
  async deleteActiveThread() {
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
    new import_obsidian.Notice(this.t("noticeThreadDeleted"));
  }
  renderThreadRow() {
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
      this.chatThreadMenuButtonEl.setAttribute("title", `${activeTitle}${activeMeta ? `
${activeMeta}` : ""}`);
    }
    const toolbarEl = this.threadRowEl.createDiv({ cls: "ola-thread-menu-toolbar" });
    const newButton = toolbarEl.createEl("button", {
      cls: "ola-thread-new",
      text: `+ ${this.t("threadNew")}`
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
      button.setAttribute("title", `${title}${meta ? `
${meta}` : ""}`);
      button.createDiv({ cls: "ola-thread-menu-item-title", text: title });
      button.createDiv({ cls: "ola-thread-menu-item-meta", text: meta });
      button.addEventListener("click", () => {
        this.closeChatThreadPicker();
        void this.setActiveThread(thread.id);
      });
    }
    if (sortedThreads.length > 0) {
      const toolbarEl2 = this.threadRowEl.createDiv({ cls: "ola-thread-menu-actions" });
      const renameButton = toolbarEl2.createEl("button", { text: this.t("buttonRenameThread") });
      const deleteButton = toolbarEl2.createEl("button", { text: this.t("buttonDeleteThread") });
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
  closeChatThreadPicker() {
    this.chatTabPickerEl?.classList.remove("is-open");
  }
  render() {
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
      text: this.plugin.settings.autoStartBackend ? this.t("statusIdle") : this.t("statusBackendManual")
    });
    this.backendControlsEl = headerActions.createEl("details", { cls: "ola-backend-details" });
    this.backendControlsEl.createEl("summary", {
      cls: "ola-backend-summary",
      text: this.t("buttonBackendControls")
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
      if (this.chatTabPickerEl.contains(event.target)) {
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
      text: "\u22EE"
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
        placeholder: this.t("questionPlaceholder")
      }
    });
    this.questionEl.setAttribute("rows", "4");
    this.quickActionSuggestionsEl = composeInputWrap.createDiv({ cls: "ola-compose-suggestions" });
    this.addQuickActionButton(this.quickActionSuggestionsEl, "summary", "ola-compose-suggestion");
    this.addQuickActionButton(this.quickActionSuggestionsEl, "organize", "ola-compose-suggestion");
    this.addQuickActionButton(this.quickActionSuggestionsEl, "next-actions", "ola-compose-suggestion");
    this.chatActionButton = this.composeRowEl.createEl("button", { cls: "ola-chat-action-button", text: "\u27A4" });
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
  addQuickActionButton(containerEl, key, cls = "ola-quick-action") {
    const config = this.plugin.getQuickAction(key);
    const button = containerEl.createEl("button", {
      cls,
      text: config.label
    });
    this.quickActionButtons.push(button);
    button.addEventListener("click", () => {
      void this.runQuickAction(key);
    });
  }
  addChatTabButton(label) {
    this.chatTabPickerEl = this.tabRowEl.createDiv({ cls: "ola-tab-chat-group" });
    const triggerEl = this.chatTabPickerEl.createDiv({ cls: "ola-tab-chat-trigger" });
    this.chatTabButtonEl = triggerEl.createEl("button", {
      cls: "ola-tab-button ola-tab-button--chat-main",
      text: label
    });
    this.chatTabButtonEl.addEventListener("click", (event) => {
      event.stopPropagation();
      this.setActiveTab("chat");
      this.closeChatThreadPicker();
    });
    this.chatThreadMenuButtonEl = triggerEl.createEl("button", {
      cls: "ola-tab-thread-toggle",
      text: "\u22EE"
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
  addTabButton(tab, label) {
    const button = this.tabRowEl.createEl("button", {
      cls: "ola-tab-button",
      text: label
    });
    button.addEventListener("click", () => {
      this.setActiveTab(tab);
    });
    this.tabButtons.set(tab, button);
  }
  setActiveTab(tab) {
    this.activeTab = tab;
    if (tab !== "chat") {
      this.closeChatThreadPicker();
    }
    this.renderTabState();
  }
  renderTabState() {
    const panels = {
      chat: this.chatTabEl,
      generator: this.generatorTabEl,
      tagger: this.taggerTabEl,
      ingest: this.ingestTabEl,
      logs: this.logsTabEl
    };
    for (const [tab, button] of this.tabButtons.entries()) {
      button.classList.toggle("is-active", tab === this.activeTab);
      panels[tab].classList.toggle("is-active", tab === this.activeTab);
    }
    this.chatTabPickerEl?.classList.toggle("is-active", this.activeTab === "chat");
  }
  async getJson(path) {
    const response = await (0, import_obsidian.requestUrl)({
      url: `${this.plugin.settings.backendUrl}${path}`,
      method: "GET"
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json;
  }
  async postJson(path, payload) {
    const response = await (0, import_obsidian.requestUrl)({
      url: `${this.plugin.settings.backendUrl}${path}`,
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify(payload)
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json;
  }
  recordWorkflowLog(tool, message) {
    const line = message.trim();
    if (!line) {
      return;
    }
    this.workflowLogs.unshift({
      tool,
      message: line,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(this.plugin.getLocale())
    });
    this.workflowLogs = this.workflowLogs.slice(0, 200);
    void this.renderWorkflowLogsPanel();
  }
  getToolLabel(tool) {
    return this.t(this.getToolKey(tool));
  }
  getToolKey(tool) {
    const keyMap = {
      chat: "toolChat",
      generator: "toolGenerator",
      tagger: "toolTagger",
      ingest: "toolIngest",
      logs: "toolLogs"
    };
    return keyMap[tool];
  }
  openBackendPage(path) {
    const base = this.plugin.settings.backendUrl.replace(/\/+$/, "");
    const target = `${base}${path}`;
    window.open(target, "_blank", "noopener,noreferrer");
  }
  async refreshContext(force = false) {
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
        path: file.name
      })
    );
    await this.renderContextPanels();
  }
  async refreshViewState() {
    await this.refreshContext(true);
    await this.refreshBackendState(true);
  }
  ensureBackendPolling() {
    if (this.backendPollStarted) {
      return;
    }
    this.backendPollStarted = true;
    this.registerInterval(
      window.setInterval(() => {
        void this.refreshBackendState();
      }, 1e4)
    );
  }
  async refreshBackendState(forceConfigReload = false) {
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
  shouldAutoStartBackend() {
    if (!this.plugin.settings.autoStartBackend || this.runningTask || this.autoStartSuppressed) {
      return false;
    }
    return Date.now() - this.lastAutoStartAttempt > 3e4;
  }
  async isBackendHealthy() {
    try {
      const data = await this.getJson("/health");
      this.statusEl.setText(
        this.t("statusBackendReady", { engine: data.engine ?? data.status ?? "unknown" })
      );
      return true;
    } catch {
      return false;
    }
  }
  async waitForBackendReady(timeoutMs = 9e4) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.isBackendHealthy()) {
        return true;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2e3));
    }
    return false;
  }
  async runShell(command, args) {
    return await new Promise((resolve) => {
      const child = (0, import_node_child_process.spawn)(command, args, { windowsHide: true });
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
  async findBackendProcessIds() {
    const scriptPath = this.plugin.settings.backendScriptPath.trim();
    if (!scriptPath) {
      return [];
    }
    if (process.platform === "win32") {
      const psCommand = [
        `$script = ${JSON.stringify(scriptPath)};`,
        "Get-CimInstance Win32_Process |",
        "Where-Object { ($_.Name -eq 'python.exe' -or $_.Name -eq 'pythonw.exe') -and ($_.CommandLine -match [regex]::Escape($script) -or $_.CommandLine -match 'backend[\\\\/]main\\.py') } |",
        "ForEach-Object { $_.ProcessId }"
      ].join(" ");
      const result2 = await this.runShell("powershell.exe", ["-NoProfile", "-Command", psCommand]);
      return result2.stdout.split(/\r?\n/).map((line) => Number.parseInt(line.trim(), 10)).filter((value) => Number.isFinite(value));
    }
    const result = await this.runShell("pgrep", ["-f", scriptPath]);
    return result.stdout.split(/\r?\n/).map((line) => Number.parseInt(line.trim(), 10)).filter((value) => Number.isFinite(value));
  }
  async stopBackendProcessIds(processIds) {
    if (processIds.length === 0) {
      return;
    }
    if (process.platform === "win32") {
      const psCommand = processIds.map((processId) => `Stop-Process -Id ${processId} -Force -ErrorAction SilentlyContinue`).join("; ");
      await this.runShell("powershell.exe", ["-NoProfile", "-Command", psCommand]);
      return;
    }
    for (const processId of processIds) {
      await this.runShell("kill", ["-9", String(processId)]);
    }
  }
  async startBackend(manual) {
    if (this.backendLaunchPromise) {
      return await this.backendLaunchPromise;
    }
    const configuredPythonPath = this.plugin.settings.backendPythonPath.trim();
    const scriptPath = this.plugin.settings.backendScriptPath.trim();
    const workingDir = this.plugin.settings.backendWorkingDir.trim() || DEFAULT_SETTINGS.backendWorkingDir;
    if (!configuredPythonPath || !scriptPath || !(0, import_node_fs.existsSync)(configuredPythonPath) || !(0, import_node_fs.existsSync)(scriptPath)) {
      if (manual) {
        new import_obsidian.Notice(this.t("noticeBackendPathsMissing"));
      }
      this.statusEl.setText(this.t("statusBackendOffline", { message: this.t("noticeBackendPathsMissing") }));
      return false;
    }
    let pythonPath = configuredPythonPath;
    if (process.platform === "win32" && configuredPythonPath.toLowerCase().endsWith("\\pythonw.exe")) {
      const pythonExePath = configuredPythonPath.slice(0, -11) + "\\python.exe";
      if ((0, import_node_fs.existsSync)(pythonExePath)) {
        pythonPath = pythonExePath;
      }
    }
    this.backendLaunchPromise = (async () => {
      try {
        if (await this.isBackendHealthy()) {
          this.autoStartSuppressed = false;
          if (manual) {
            new import_obsidian.Notice(this.t("noticeBackendAlreadyRunning"));
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
            "Start-Process -FilePath $python -ArgumentList @('-u', $script) -WorkingDirectory $workdir -WindowStyle Hidden | Out-Null"
          ].join(" ");
          const child = (0, import_node_child_process.spawn)("powershell.exe", ["-NoProfile", "-Command", psCommand], {
            cwd: workingDir,
            detached: true,
            stdio: "ignore",
            windowsHide: true
          });
          child.unref();
        } else {
          const child = (0, import_node_child_process.spawn)(pythonPath, ["-u", scriptPath], {
            cwd: workingDir,
            detached: true,
            stdio: "ignore",
            windowsHide: true
          });
          child.unref();
        }
        const ready = await this.waitForBackendReady(12e4);
        if (!ready) {
          throw new Error("timeout waiting for /health");
        }
        this.backendReady = true;
        this.autoStartSuppressed = false;
        if (manual) {
          new import_obsidian.Notice(this.t("noticeBackendStarted"));
        }
        await this.loadToolConfig(true);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.backendReady = false;
        this.statusEl.setText(this.t("statusBackendOffline", { message }));
        if (manual) {
          new import_obsidian.Notice(this.t("noticeBackendStartFailed", { message }));
        }
        return false;
      } finally {
        this.backendLaunchPromise = null;
        this.applyBusyState();
      }
    })();
    return await this.backendLaunchPromise;
  }
  async stopBackend(manual) {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
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
          "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }"
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
        new import_obsidian.Notice(this.t("noticeBackendStopped"));
      }
      this.applyBusyState();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (manual) {
        new import_obsidian.Notice(this.t("noticeBackendStopFailed", { message }));
      }
      return false;
    }
  }
  async restartBackend() {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
      return;
    }
    await this.stopBackend(false);
    const started = await this.startBackend(true);
    if (started) {
      new import_obsidian.Notice(this.t("noticeBackendRestarted"));
    }
  }
  setQuestion(text) {
    this.questionEl.value = text;
    this.updateChatActionButtonState();
  }
  handleQuestionSubmitKey(event) {
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
  async useSelection(runAfter = false) {
    const selection = this.plugin.getActiveSelection();
    if (!selection) {
      new import_obsidian.Notice(this.t("noticeNoSelection"));
      return;
    }
    this.setQuestion(selection);
    if (runAfter) {
      await this.runQuery();
    }
  }
  async runQuickAction(key) {
    this.setQuestion(this.plugin.getQuickAction(key).prompt);
    await this.runQuery();
  }
  shouldAttachCurrentNote(question) {
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
      /드래그한/
    ];
    return noteReferencePatterns.some((pattern) => pattern.test(normalized));
  }
  async stopChat() {
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
      new import_obsidian.Notice(this.t("noticeChatStopped"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new import_obsidian.Notice(this.t("noticeChatStopFailed", { message }));
    }
  }
  async runQuery() {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
      return;
    }
    if (!await this.refreshBackendState()) {
      new import_obsidian.Notice(this.t("noticeBackendUnavailable"));
      return;
    }
    const question = this.questionEl.value.trim();
    if (!question) {
      new import_obsidian.Notice(this.t("noticeEnterQuestion"));
      return;
    }
    const file = this.plugin.app.workspace.getActiveFile();
    const shouldAttachCurrentNote = Boolean(file) && this.shouldAttachCurrentNote(question);
    const noteContent = shouldAttachCurrentNote && file ? await this.plugin.app.vault.cachedRead(file) : "";
    const contextEntries = shouldAttachCurrentNote && file ? await this.collectContext(file) : [];
    const conversationHistory = this.chatTurns.filter((turn) => turn.answer.trim()).slice(-6).map((turn) => ({
      question: turn.question,
      answer: turn.answer
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const threadRecord = this.plugin.getChatThread(this.activeThreadId);
    if (threadRecord) {
      threadRecord.turns = this.chatTurns;
      threadRecord.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
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
          source: entry.source
        })),
        conversation_history: conversationHistory,
        language: this.plugin.language()
      });
      this.statusEl.setText(this.t("statusDone"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.statusEl.setText(this.t("statusError"));
      await this.setRenderedOutput(`[error] ${message}`);
      new import_obsidian.Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.activeSessionId = "";
      this.setBusy(false);
      await this.renderWorkflowLogsPanel();
    }
  }
  buildPrompt(question, file, noteContent, contextEntries) {
    const sections = [
      `Current note path: ${file.path}`,
      "Use the current note as the primary context.",
      "",
      "[User Question]",
      question,
      "",
      "[Current Note]",
      noteContent.trim().slice(0, MAX_NOTE_CHARS) || "(empty note)"
    ];
    const groups = ["links", "folder", "tags", "backlinks"];
    for (const source of groups) {
      const items = contextEntries.filter((entry) => entry.source === source);
      if (items.length === 0) {
        continue;
      }
      sections.push("", `[Context:${source}]`);
      for (const item of items) {
        sections.push(
          `
## ${item.file.path}
${item.content.trim().slice(0, MAX_CONTEXT_NOTE_CHARS) || "(empty note)"}`
        );
      }
    }
    sections.push(
      "",
      "When you cite related notes, prefer Obsidian wiki link format like [[Note Name]].",
      this.plugin.getResponseLanguageInstruction()
    );
    return sections.join("\n");
  }
  getLinkedFiles(file) {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const unique = /* @__PURE__ */ new Map();
    const references = [
      ...cache?.links ?? [],
      ...cache?.embeds ?? [],
      ...cache?.frontmatterLinks ?? []
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
  getFolderFiles(file) {
    const folderPath = file.parent?.path;
    if (!folderPath) {
      return [];
    }
    return this.plugin.app.vault.getMarkdownFiles().filter((candidate) => candidate.path !== file.path && candidate.parent?.path === folderPath);
  }
  getTaggedFiles(file) {
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
  getNormalizedTags(file) {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const tags = /* @__PURE__ */ new Set();
    for (const tag of cache?.tags ?? []) {
      const normalized = this.normalizeTag(tag.tag);
      if (normalized) {
        tags.add(normalized);
      }
    }
    const frontmatter = cache?.frontmatter;
    for (const value of [frontmatter?.tags, frontmatter?.tag]) {
      for (const tag of this.extractFrontmatterTags(value)) {
        tags.add(tag);
      }
    }
    return tags;
  }
  extractFrontmatterTags(value) {
    if (typeof value === "string") {
      return value.split(/[,\n]/).map((item) => this.normalizeTag(item)).filter((item) => Boolean(item));
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.extractFrontmatterTags(item)).filter((item) => Boolean(item));
    }
    return [];
  }
  normalizeTag(value) {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return null;
    }
    return raw.startsWith("#") ? raw : `#${raw}`;
  }
  getBacklinkFiles(file) {
    const resolved = this.plugin.app.metadataCache.resolvedLinks;
    const result = [];
    for (const [sourcePath, targets] of Object.entries(resolved)) {
      if (!targets[file.path] || sourcePath === file.path) {
        continue;
      }
      const source = this.plugin.app.vault.getAbstractFileByPath(sourcePath);
      if (source instanceof import_obsidian.TFile) {
        result.push(source);
      }
    }
    return result;
  }
  getFrontmatterRelatedFiles(file) {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
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
      frontmatter.referenceFiles
    ];
    const unique = /* @__PURE__ */ new Map();
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
  extractRelatedCandidates(value) {
    if (typeof value === "string") {
      return [value];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.extractRelatedCandidates(item));
    }
    if (value && typeof value === "object") {
      const candidateObject = value;
      return [
        candidateObject.path,
        candidateObject.file,
        candidateObject.link,
        candidateObject.name,
        candidateObject.source
      ].flatMap((item) => this.extractRelatedCandidates(item));
    }
    return [];
  }
  resolveRelatedFileCandidate(sourceFile, frontmatter, rawCandidate) {
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
    const ranked = this.plugin.app.vault.getFiles().filter((file) => this.isReadableContextFile(file)).map((file) => ({ file, score: this.scoreRelatedCandidate(file, candidate, baseName, baseNameNoExt, collection, domain, sourcePath) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    return ranked[0]?.file ?? null;
  }
  normalizeRelatedCandidate(rawCandidate) {
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
  scoreRelatedCandidate(file, candidate, baseName, baseNameNoExt, collection, domain, sourcePath) {
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
  isReadableContextFile(file) {
    const ext = file.extension?.toLowerCase?.() ?? "";
    if (!ext) {
      return true;
    }
    return CONTEXT_READABLE_EXTENSIONS.has(ext);
  }
  async collectContext(file) {
    const groups = [
      { source: "links", files: this.getLinkedFiles(file) },
      { source: "folder", files: this.getFolderFiles(file) },
      { source: "tags", files: this.getTaggedFiles(file) },
      { source: "backlinks", files: this.getBacklinkFiles(file) }
    ];
    const entries = [];
    const seen = /* @__PURE__ */ new Set([file.path]);
    const cursors = /* @__PURE__ */ new Map([
      ["links", 0],
      ["folder", 0],
      ["tags", 0],
      ["backlinks", 0]
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
            source: group.source
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
  async checkBackend() {
    try {
      const data = await this.getJson("/health");
      this.statusEl.setText(
        this.t("statusBackendReady", { engine: data.engine ?? data.status ?? "unknown" })
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.statusEl.setText(this.t("statusBackendOffline", { message }));
      return false;
    }
  }
  async streamNdjson(path, payload, onChunk) {
    const url = new URL(`${this.plugin.settings.backendUrl}${path}`);
    const body = JSON.stringify(payload);
    const transport = url.protocol === "https:" ? https : http;
    await new Promise((resolve, reject) => {
      const request = transport.request(
        {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
          path: `${url.pathname}${url.search}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
          }
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
                  `Backend request failed: ${statusCode}${errorBody ? ` ${errorBody}` : ""}`
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
                  await onChunk(JSON.parse(trimmed));
                }
              }
              if (buffer.trim()) {
                await onChunk(JSON.parse(buffer.trim()));
              }
              resolve();
            } catch (error) {
              reject(error);
            } finally {
              this.clearActiveRequest(request, onAbort);
            }
          })();
        }
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
  async streamChat(payload) {
    await this.streamNdjson("/api/chat/obsidian/stream", payload, async (chunk) => {
      await this.handleChunk(chunk);
    });
  }
  abortActiveRequest() {
    this.abortController?.abort();
    this.activeRequest?.destroy(new Error("Request aborted"));
    this.activeRequest = null;
  }
  clearActiveRequest(request, onAbort) {
    if (this.activeRequest === request) {
      this.activeRequest = null;
    }
    this.abortController?.signal.removeEventListener("abort", onAbort);
  }
  getLatestChatTurn() {
    return this.chatTurns.length > 0 ? this.chatTurns[this.chatTurns.length - 1] : null;
  }
  getLatestCompletedTurn() {
    for (let index = this.chatTurns.length - 1; index >= 0; index -= 1) {
      const turn = this.chatTurns[index];
      if (turn.answer.trim()) {
        return turn;
      }
    }
    return null;
  }
  getLatestStateTurn() {
    for (let index = this.chatTurns.length - 1; index >= 0; index -= 1) {
      const turn = this.chatTurns[index];
      if (turn.answer.trim() || turn.question.trim() || (turn.sources?.length ?? 0) > 0 || (turn.recommendations?.length ?? 0) > 0 || (turn.contextEntries?.length ?? 0) > 0) {
        return turn;
      }
    }
    return null;
  }
  updateLatestChatTurn(patch) {
    const turn = this.getLatestChatTurn();
    if (!turn) {
      return;
    }
    Object.assign(turn, patch);
  }
  async handleChunk(chunk) {
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
  recordChatLogs(logs) {
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
  async setRenderedOutput(text) {
    if (text === this.renderedOutput) {
      return;
    }
    this.renderedOutput = text;
    this.updateLatestChatTurn({ answer: text, basis: this.answerBasis });
    await this.renderOutput();
  }
  async renderOutput() {
    this.chatLogEl.empty();
    this.conversationActionsEl?.parentElement?.classList.toggle("is-hidden", !this.getLatestCompletedTurn());
    if (this.chatTurns.length === 0) {
      const emptyEl = this.chatLogEl.createDiv({ cls: "ola-chat-empty" });
      await import_obsidian.MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(this.t("outputReady")),
        emptyEl,
        "",
        this
      );
      this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
      return;
    }
    for (const turn of this.chatTurns) {
      const turnEl = this.chatLogEl.createDiv({ cls: "ola-chat-turn" });
      const questionWrap = turnEl.createDiv({ cls: "ola-chat-turn-question-wrap" });
      questionWrap.createDiv({ cls: "ola-chat-turn-label", text: "You" });
      const questionEl = questionWrap.createDiv({ cls: "ola-chat-turn-question" });
      await import_obsidian.MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(turn.question),
        questionEl,
        turn.attachedFilePath || "",
        this
      );
      const answerWrap = turnEl.createDiv({ cls: "ola-chat-turn-answer-wrap" });
      answerWrap.createDiv({ cls: "ola-chat-turn-label", text: "Agent" });
      const basisLabel = this.getAnswerBasisLabel(turn.basis);
      if (basisLabel && turn.answer.trim()) {
        answerWrap.createDiv({
          cls: "ola-answer-basis",
          text: basisLabel
        });
      }
      const answerEl = answerWrap.createDiv({ cls: "ola-chat-turn-answer" });
      const answerText = turn.answer || (turn === this.getLatestChatTurn() && this.runningTask === "chat" ? this.t("outputGenerating") : this.t("outputReady"));
      await import_obsidian.MarkdownRenderer.render(
        this.app,
        this.linkifyVaultPaths(answerText),
        answerEl,
        turn.attachedFilePath || "",
        this
      );
    }
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
  }
  getAnswerBasisLabel(basis = this.answerBasis) {
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
  async renderContextPanels() {
    await this.renderSentContextPanel();
    await this.renderSourcePanel();
    await this.renderRecommendationPanel();
  }
  createField(containerEl, label) {
    const wrapper = containerEl.createDiv({ cls: "ola-field" });
    wrapper.createEl("label", { cls: "ola-field-label", text: label });
    return wrapper;
  }
  createSectionDetails(containerEl, title, open = false, buildSummaryActions) {
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
  captureOpenDetails(containerEl) {
    const openKeys = /* @__PURE__ */ new Set();
    const details = Array.from(containerEl.querySelectorAll("details"));
    details.forEach((detailEl, index) => {
      if (!(detailEl instanceof HTMLDetailsElement) || !detailEl.open) {
        return;
      }
      const summaryText = detailEl.querySelector(".ola-stage-summary-title")?.textContent?.trim() ?? detailEl.querySelector("summary")?.textContent?.trim() ?? "";
      openKeys.add(`${index}:${summaryText}`);
    });
    return openKeys;
  }
  restoreOpenDetails(containerEl, openKeys) {
    const details = Array.from(containerEl.querySelectorAll("details"));
    details.forEach((detailEl, index) => {
      if (!(detailEl instanceof HTMLDetailsElement)) {
        return;
      }
      const summaryText = detailEl.querySelector(".ola-stage-summary-title")?.textContent?.trim() ?? detailEl.querySelector("summary")?.textContent?.trim() ?? "";
      detailEl.open = openKeys.has(`${index}:${summaryText}`);
    });
  }
  renderToolSummary(panelEl, title, status) {
    panelEl.empty();
    const summaryEl = panelEl.createDiv({ cls: "ola-meta-summary" });
    const titleEl = summaryEl.createSpan({ text: title });
    titleEl.addClass("ola-workflow-summary-title");
    const statusEl = summaryEl.createSpan({ text: status });
    statusEl.addClass("ola-workflow-summary-status");
    return panelEl.createDiv({ cls: "ola-meta-body" });
  }
  getJobList() {
    return Array.isArray(this.toolConfig?.jobs) ? this.toolConfig?.jobs ?? [] : [];
  }
  isGeneratorSupportedFile(file) {
    return GENERATOR_SUPPORTED_EXTENSIONS.has(file.extension.toLowerCase()) && !file.path.split("/").some((part) => part.startsWith("."));
  }
  getGeneratorRootKey(filePath) {
    const normalized = filePath.replace(/\\/g, "/");
    const slashIndex = normalized.indexOf("/");
    return slashIndex === -1 ? GENERATOR_ROOT_SENTINEL : normalized.slice(0, slashIndex);
  }
  getGeneratorRootLabel(rootPath) {
    return rootPath === GENERATOR_ROOT_SENTINEL ? this.t("generatorRootFolder") : rootPath;
  }
  getGeneratorRootEntries() {
    const groups = /* @__PURE__ */ new Map();
    for (const file of this.plugin.app.vault.getFiles()) {
      if (!this.isGeneratorSupportedFile(file)) {
        continue;
      }
      const rootPath = this.getGeneratorRootKey(file.path);
      const current = groups.get(rootPath) ?? {
        path: rootPath,
        label: this.getGeneratorRootLabel(rootPath),
        count: 0,
        size: 0
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
        sensitivity: "base"
      }).compare(a.label, b.label);
    });
  }
  getPreferredGeneratorInputDir() {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (activeFile && this.isGeneratorSupportedFile(activeFile)) {
      return this.getGeneratorRootKey(activeFile.path);
    }
    return this.getGeneratorRootEntries()[0]?.path ?? GENERATOR_ROOT_SENTINEL;
  }
  shouldFlattenGeneratorProjectFolder(folderName) {
    return /^99(?:_|-)/.test(folderName);
  }
  getGeneratorFolderMeta(relativePath) {
    const normalized = relativePath.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);
    if (segments.length <= 1) {
      return {
        folder: "(root)",
        folderLabel: this.t("generatorRootFolder"),
        folderParent: ""
      };
    }
    const first = segments[0];
    if (segments.length >= 3 && this.shouldFlattenGeneratorProjectFolder(first)) {
      return {
        folder: `${first}/${segments[1]}`,
        folderLabel: segments[1],
        folderParent: first
      };
    }
    return {
      folder: first,
      folderLabel: first,
      folderParent: ""
    };
  }
  isFileInsideGeneratorRoot(file, rootPath) {
    if (rootPath === GENERATOR_ROOT_SENTINEL) {
      return !file.path.includes("/");
    }
    return file.path.startsWith(`${rootPath}/`);
  }
  getVaultFolderOptions() {
    const folders = /* @__PURE__ */ new Set([""]);
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
  getAllVaultFolderOptions() {
    const folders = /* @__PURE__ */ new Set([""]);
    for (const item of this.plugin.app.vault.getAllLoadedFiles()) {
      if (item instanceof import_obsidian.TFolder) {
        folders.add(item.path);
      }
    }
    return Array.from(folders).sort((a, b) => this.compareGeneratorLabels(a, b));
  }
  getWorkflowFolderOptions(extraPaths = []) {
    return Array.from(
      new Set(
        ["", ...this.getAllVaultFolderOptions(), ...extraPaths].map((value) => (0, import_obsidian.normalizePath)(value || ""))
      )
    ).sort((a, b) => this.compareGeneratorLabels(a, b));
  }
  getEffectiveTaggerInputDir() {
    return this.taggerState.inputDir;
  }
  getEffectiveIngestInputDir() {
    if (this.ingestState.inputDir) {
      return this.ingestState.inputDir;
    }
    return this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir;
  }
  getEffectiveIngestOutputDir() {
    return this.ingestState.outputDir || this.generatorState.outputDir;
  }
  getPreferredGeneratorOutputRoot() {
    const allFolders = this.getAllVaultFolderOptions();
    return allFolders.find((folder) => /^11(?:_|-)/.test(folder)) ?? "11_RAG_Knowledge_Base";
  }
  getGeneratorMirroredOutputDir(inputDir = this.generatorState.inputDir, focusedFolder = this.generatorState.focusedFolder) {
    const outputRoot = this.getPreferredGeneratorOutputRoot();
    if (!outputRoot) {
      return "";
    }
    if (inputDir === GENERATOR_ROOT_SENTINEL || !focusedFolder) {
      return outputRoot;
    }
    return (0, import_obsidian.normalizePath)(`${outputRoot}/${focusedFolder}`);
  }
  syncGeneratorOutputDir() {
    const mirrored = this.getGeneratorMirroredOutputDir();
    if (mirrored) {
      this.generatorState.outputDir = mirrored;
    }
  }
  getPreferredVaultFolder() {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (activeFile?.parent?.path) {
      return activeFile.parent.path;
    }
    return this.getVaultFolderOptions()[0] ?? "";
  }
  getLocalPatternPreviewIndex() {
    const editorConfig = this.getPatternEditorConfig();
    const patternDir = (0, import_obsidian.normalizePath)(editorConfig.vault_dir?.trim() || "generator/patterns");
    const previews = {};
    for (const file of this.plugin.app.vault.getFiles()) {
      if (file.extension.toLowerCase() !== "md") {
        continue;
      }
      if (!(file.path === patternDir || file.path.startsWith(`${patternDir}/`))) {
        continue;
      }
      const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
      const patternKey = typeof frontmatter?.pattern === "string" && frontmatter.pattern.trim() ? frontmatter.pattern.trim() : file.basename;
      const groupsRaw = frontmatter?.groups;
      const groups = Array.isArray(groupsRaw) ? groupsRaw.map((value) => String(value)) : typeof groupsRaw === "string" && groupsRaw.trim() ? [groupsRaw.trim()] : [];
      previews[patternKey] = {
        ...previews[patternKey] ?? {},
        source: "obsidian",
        editor_note_path: file.path,
        groups,
        output_suffix: typeof frontmatter?.output_suffix === "string" ? frontmatter.output_suffix : "",
        use_subject_prefix: Boolean(frontmatter?.use_subject_prefix)
      };
    }
    return previews;
  }
  getModelOptions() {
    const configured = Array.isArray(this.toolConfig?.model_options) ? this.toolConfig?.model_options ?? [] : [];
    const unique = new Set(configured.filter((value) => Boolean(value)));
    unique.add("qwen3.5:4b");
    return Array.from(unique);
  }
  getPatternKeys() {
    const configured = Array.isArray(this.toolConfig?.patterns) ? this.toolConfig?.patterns ?? [] : [];
    if (configured.length > 0) {
      return configured;
    }
    return Object.keys(this.getLocalPatternPreviewIndex()).sort((a, b) => a.localeCompare(b));
  }
  getPatternEditorConfig() {
    return this.toolConfig?.pattern_editor ?? {
      vault_dir: "generator/patterns",
      readme_path: "generator/README.md",
      config_path: ""
    };
  }
  getTaggerRulesConfig() {
    return this.toolConfig?.tagger_rules ?? {
      workspace: {
        root: "tagger",
        rules_dir: "tagger/rules",
        readme_path: "tagger/README.md",
        canonical_tags_path: "tagger/rules/canonical_tags.md",
        synonym_map_path: "tagger/rules/synonym_map.md",
        tagging_priority_path: "tagger/rules/tagging_priority.md"
      },
      canonical_tag_count: 0,
      canonical_groups: {},
      synonym_entries: 0,
      thresholds: {}
    };
  }
  getPatternPreview(patternKey) {
    return this.toolConfig?.pattern_previews?.[patternKey] ?? this.getLocalPatternPreviewIndex()[patternKey] ?? {};
  }
  getPatternGroupEntries() {
    const patternKeys = this.getPatternKeys();
    const localPreviews = this.getLocalPatternPreviewIndex();
    const configuredGroups = this.toolConfig?.pattern_groups ?? this.getTargetSets() ?? {};
    const entries = [];
    const seen = /* @__PURE__ */ new Set();
    for (const [groupName, rawPatterns] of Object.entries(configuredGroups)) {
      const filtered = (Array.isArray(rawPatterns) ? rawPatterns : []).filter((pattern) => patternKeys.includes(pattern));
      if (filtered.length === 0) {
        continue;
      }
      filtered.forEach((pattern) => seen.add(pattern));
      entries.push([groupName, filtered]);
    }
    if (entries.length === 0) {
      const localGroups = /* @__PURE__ */ new Map();
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
  getTargetSets() {
    if (this.toolConfig?.target_sets) {
      return this.toolConfig.target_sets;
    }
    const grouped = {};
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
  getCurrentGeneratorJob() {
    if (this.generatorState.jobName === MANUAL_JOB) {
      return null;
    }
    return this.getJobList().find((candidate) => candidate.name === this.generatorState.jobName) ?? null;
  }
  formatBytes(bytes) {
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
  sanitizePatternFileName(patternKey) {
    const sanitized = patternKey.trim().replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");
    return sanitized || "pattern";
  }
  buildPatternNotePath(patternKey) {
    const editorConfig = this.getPatternEditorConfig();
    const configured = this.getPatternPreview(patternKey).editor_note_path?.trim();
    if (configured) {
      return (0, import_obsidian.normalizePath)(configured);
    }
    const baseDir = (0, import_obsidian.normalizePath)(editorConfig.vault_dir?.trim() || "generator/patterns");
    return (0, import_obsidian.normalizePath)(`${baseDir}/${this.sanitizePatternFileName(patternKey)}.md`);
  }
  buildPatternNoteTemplate(patternKey) {
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
      ""
    ];
    return frontmatterLines.join("\n");
  }
  async openPatternWorkspaceNote() {
    const editorConfig = this.getPatternEditorConfig();
    const readmePath = editorConfig.readme_path?.trim();
    if (!readmePath) {
      new import_obsidian.Notice(this.t("noticePatternWorkspaceMissing"));
      return;
    }
    const normalized = (0, import_obsidian.normalizePath)(readmePath);
    const folderPath = normalized.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }
    const existing = this.plugin.app.vault.getAbstractFileByPath(normalized);
    let file;
    if (existing instanceof import_obsidian.TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(
        normalized,
        "# Generator Pattern Workspace\n\n- Edit notes in this folder to manage generator prompts.\n"
      );
    }
    await this.plugin.openFileFromSource(file);
  }
  async openPatternNote(patternKey) {
    const notePath = this.buildPatternNotePath(patternKey);
    const folderPath = notePath.includes("/") ? notePath.slice(0, notePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }
    const existing = this.plugin.app.vault.getAbstractFileByPath(notePath);
    let file;
    if (existing instanceof import_obsidian.TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(notePath, this.buildPatternNoteTemplate(patternKey));
      new import_obsidian.Notice(this.t("noticePatternNoteCreated", { path: notePath }));
    }
    await this.plugin.openFileFromSource(file);
  }
  async createPatternNote() {
    const editorConfig = this.getPatternEditorConfig();
    const baseDir = (0, import_obsidian.normalizePath)(editorConfig.vault_dir?.trim() || "generator/patterns");
    await this.plugin.ensureFolder(baseDir);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const patternKey = `custom_pattern_${timestamp}`;
    const notePath = (0, import_obsidian.normalizePath)(`${baseDir}/${patternKey}.md`);
    const file = await this.plugin.app.vault.create(notePath, this.buildPatternNoteTemplate(patternKey));
    new import_obsidian.Notice(this.t("noticePatternNoteCreated", { path: notePath }));
    await this.plugin.openFileFromSource(file);
  }
  async openTaggerWorkspaceNote() {
    const rulesConfig = this.getTaggerRulesConfig();
    const readmePath = (0, import_obsidian.normalizePath)(rulesConfig.workspace?.readme_path?.trim() || "tagger/README.md");
    const folderPath = readmePath.includes("/") ? readmePath.slice(0, readmePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }
    const existing = this.plugin.app.vault.getAbstractFileByPath(readmePath);
    let file;
    if (existing instanceof import_obsidian.TFile) {
      file = existing;
    } else {
      file = await this.plugin.app.vault.create(
        readmePath,
        "# Tagger Rule Workspace\n\n- Edit markdown rule notes in this folder.\n"
      );
    }
    await this.plugin.openFileFromSource(file);
  }
  async openTaggerRuleNote(kind) {
    const rulesConfig = this.getTaggerRulesConfig();
    const workspace = rulesConfig.workspace ?? {};
    const notePath = (0, import_obsidian.normalizePath)(
      kind === "canonical" ? workspace.canonical_tags_path?.trim() || "tagger/rules/canonical_tags.md" : kind === "synonym" ? workspace.synonym_map_path?.trim() || "tagger/rules/synonym_map.md" : workspace.tagging_priority_path?.trim() || "tagger/rules/tagging_priority.md"
    );
    const folderPath = notePath.includes("/") ? notePath.slice(0, notePath.lastIndexOf("/")) : "";
    if (folderPath) {
      await this.plugin.ensureFolder(folderPath);
    }
    const existing = this.plugin.app.vault.getAbstractFileByPath(notePath);
    let file;
    if (existing instanceof import_obsidian.TFile) {
      file = existing;
    } else {
      const fallbackTitle = kind === "canonical" ? "# Canonical Tags\n" : kind === "synonym" ? "# Synonym Map\n" : "# Tagging Priority\n";
      file = await this.plugin.app.vault.create(notePath, `${fallbackTitle}
`);
    }
    await this.plugin.openFileFromSource(file);
  }
  initializeToolDefaults(force = false) {
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
      patternKeys: this.generatorState.patternKeys.length > 0 ? [...this.generatorState.patternKeys] : firstTargetSet !== MANUAL_TARGET_SET ? [...this.getTargetSets()[firstTargetSet] ?? []] : fallbackPattern ? [fallbackPattern] : [],
      status: this.generatorState.status || this.t("generatorStatusReady")
    };
    this.taggerState.status = this.taggerState.status || this.t("taggerStatusReady");
    this.ingestState = {
      ...this.ingestState,
      status: this.ingestState.status || this.t("ingestStatusReady")
    };
    this.toolConfigInitialized = true;
  }
  async loadToolConfig(force = false) {
    if (this.runningTask && !force) {
      return;
    }
    try {
      this.toolConfigError = "";
      this.toolConfig = await this.getJson("/api/tools/config");
      this.initializeToolDefaults(force);
      await this.renderWorkflowPanels();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.toolConfigError = message;
      await this.renderWorkflowPanels();
    }
  }
  async loadGeneratorFiles() {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
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
      const entries = this.plugin.app.vault.getFiles().filter((file) => this.isGeneratorSupportedFile(file)).filter((file) => this.isFileInsideGeneratorRoot(file, selectedRoot)).map((file) => {
        const relativePath = selectedRoot !== GENERATOR_ROOT_SENTINEL ? file.path.slice(prefix.length) : file.path;
        const normalizedRelative = relativePath.replace(/\\/g, "/");
        const folderMeta = this.getGeneratorFolderMeta(normalizedRelative);
        return {
          path: normalizedRelative,
          folder: folderMeta.folder,
          folderLabel: folderMeta.folderLabel,
          folderParent: folderMeta.folderParent,
          size: file.stat.size
        };
      }).sort((a, b) => this.compareGeneratorLabels(a.path, b.path));
      this.generatorState.filesPath = selectedRoot;
      this.generatorState.fileEntries = entries;
      this.generatorState.files = entries.map((entry) => entry.path);
      this.generatorState.selectedFiles = this.generatorState.selectedFiles.filter(
        (file) => this.generatorState.files.includes(file)
      );
      if (this.generatorState.focusedFolder && !entries.some((entry) => entry.folder === this.generatorState.focusedFolder)) {
        this.generatorState.focusedFolder = "";
      }
      this.syncGeneratorOutputDir();
      this.generatorState.status = this.t("generatorStatusReady");
      this.recordWorkflowLog(
        "generator",
        `Loaded ${this.generatorState.files.length} files from ${this.getGeneratorRootLabel(selectedRoot)}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.generatorState.fileError = message;
      this.generatorState.status = this.t("statusError");
    } finally {
      await this.renderGeneratorPanel();
    }
  }
  applyGeneratorJob(jobName) {
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
      const fallbackTargetSet = this.generatorState.targetSet !== MANUAL_TARGET_SET ? this.generatorState.targetSet : Object.keys(this.getTargetSets())[0] ?? MANUAL_TARGET_SET;
      this.applyGeneratorTargetSet(fallbackTargetSet);
    }
  }
  applyGeneratorTargetSet(targetSet) {
    this.generatorState.targetSet = targetSet;
    if (targetSet === MANUAL_TARGET_SET) {
      return;
    }
    this.generatorState.patternKeys = [...this.getTargetSets()[targetSet] ?? []];
  }
  getNoteRebuildTargetSetName() {
    const targetSets = this.getTargetSets();
    const candidates = [NOTE_REBUILD_TARGET_SET, "Note_Rebuild", "Note Rebuild"];
    return candidates.find((candidate) => Array.isArray(targetSets[candidate])) ?? "";
  }
  hasGeneratorPattern(patternKey) {
    return this.getPatternKeys().includes(patternKey);
  }
  isNoteRebuildActive() {
    return this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD;
  }
  getEffectiveGeneratorPatternKeys() {
    const base = [...this.generatorState.patternKeys];
    if (this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD && this.generatorState.rebuildTitle && this.hasGeneratorPattern(TITLE_REBUILD_PATTERN) && !base.includes(TITLE_REBUILD_PATTERN)) {
      base.unshift(TITLE_REBUILD_PATTERN);
    }
    return [...new Set(base)];
  }
  async primeGeneratorSelectionFromActiveFile() {
    const activeFile = this.plugin.app.workspace.getActiveFile();
    if (!activeFile || !this.isGeneratorSupportedFile(activeFile)) {
      return;
    }
    const inputDir = this.getGeneratorRootKey(activeFile.path);
    const relativePath = inputDir === GENERATOR_ROOT_SENTINEL ? activeFile.path : activeFile.path.startsWith(`${inputDir}/`) ? activeFile.path.slice(inputDir.length + 1) : activeFile.name;
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
  async switchGeneratorMode(mode) {
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
  createLogBlock(containerEl, lines, emptyMessage) {
    const preEl = containerEl.createEl("pre", { cls: "ola-log-block" });
    preEl.setText(lines.length > 0 ? lines.join("\n") : emptyMessage);
  }
  groupFilesByFolder(files) {
    const groups = /* @__PURE__ */ new Map();
    for (const file of files) {
      const normalized = file.replace(/\\/g, "/");
      const folder = normalized.includes("/") ? normalized.split("/")[0] : "(root)";
      const current = groups.get(folder) ?? [];
      current.push(file);
      groups.set(folder, current);
    }
    return groups;
  }
  groupFileEntriesByFolder(entries) {
    const groups = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const folder = entry.folder || "(root)";
      const current = groups.get(folder) ?? [];
      current.push(entry);
      groups.set(folder, current);
    }
    return groups;
  }
  compareGeneratorLabels(left, right) {
    return new Intl.Collator(this.plugin.getLocale(), {
      numeric: true,
      sensitivity: "base"
    }).compare(left, right);
  }
  getSortedGeneratorGroups() {
    return Array.from(this.groupFileEntriesByFolder(this.generatorState.fileEntries).entries()).sort((left, right) => {
      const leftEntry = left[1][0];
      const rightEntry = right[1][0];
      const leftLabel = leftEntry?.folder ?? left[0];
      const rightLabel = rightEntry?.folder ?? right[0];
      return this.compareGeneratorLabels(leftLabel, rightLabel);
    });
  }
  getGeneratorEntryDisplayPath(entry) {
    if (entry.folder === "(root)") {
      return entry.path;
    }
    const prefix = `${entry.folder}/`;
    return entry.path.startsWith(prefix) ? entry.path.slice(prefix.length) : entry.path;
  }
  getGeneratorFolderKeys() {
    return new Set(
      this.generatorState.fileEntries.map((entry) => entry.folder).filter((folder) => Boolean(folder) && folder !== "(root)")
    );
  }
  getGeneratorFolderParentKey(folderKey) {
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
  getGeneratorFocusedEntries(folderKey) {
    if (!folderKey || folderKey === "(root)") {
      return this.generatorState.fileEntries.filter((entry) => !entry.path.includes("/"));
    }
    const prefix = `${folderKey}/`;
    return this.generatorState.fileEntries.filter((entry) => entry.path.startsWith(prefix));
  }
  getGeneratorFocusedView(folderKey) {
    const entries = this.getGeneratorFocusedEntries(folderKey);
    const prefix = folderKey ? `${folderKey}/` : "";
    const currentFiles = [];
    const subfolders = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const relative = prefix && entry.path.startsWith(prefix) ? entry.path.slice(prefix.length) : entry.path;
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
        selectedCount: 0
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
      subfolders: Array.from(subfolders.values()).sort((left, right) => this.compareGeneratorLabels(left.key, right.key))
    };
  }
  getSelectedGeneratorBytes() {
    const selected = new Set(this.generatorState.selectedFiles);
    return this.generatorState.fileEntries.filter((entry) => selected.has(entry.path)).reduce((total, entry) => total + (entry.size || 0), 0);
  }
  toggleGeneratorFolder(folder, checked) {
    const matching = this.generatorState.fileEntries.filter((entry) => entry.folder === folder || entry.path.startsWith(`${folder}/`)).map((entry) => entry.path);
    if (checked) {
      this.generatorState.selectedFiles = [.../* @__PURE__ */ new Set([...this.generatorState.selectedFiles, ...matching])];
      return;
    }
    const removed = new Set(matching);
    this.generatorState.selectedFiles = this.generatorState.selectedFiles.filter((path) => !removed.has(path));
  }
  async renderWorkflowPanels() {
    await this.renderGeneratorPanel();
    await this.renderTaggerPanel();
    await this.renderIngestPanel();
    await this.renderWorkflowLogsPanel();
  }
  async renderGeneratorPanel() {
    const hadDetails = this.generatorPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.generatorPanelEl);
    const generatorScrollHost = this.generatorPanelEl.parentElement instanceof HTMLElement ? this.generatorPanelEl.parentElement : this.generatorTabEl;
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
        folderSeed.map((value) => (0, import_obsidian.normalizePath)(value || ""))
      )
    ).sort((a, b) => a.localeCompare(b));
    const filesStageEl = this.createSectionDetails(bodyEl, this.t("generatorSectionFiles"), true);
    const filesHeaderGrid = filesStageEl.createDiv({
      cls: this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD ? "ola-generator-files-row ola-generator-files-row--rebuild" : "ola-generator-files-row ola-generator-files-row--standard"
    });
    const modeField = this.createField(filesHeaderGrid, this.t("generatorMode"));
    modeField.addClass("ola-field--mode");
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: GENERATOR_MODE_STANDARD, text: this.t("generatorModeStandard") });
    modeSelect.createEl("option", { value: GENERATOR_MODE_NOTE_REBUILD, text: this.t("generatorModeNoteRebuild") });
    modeSelect.value = this.generatorState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", async () => {
      await this.switchGeneratorMode(modeSelect.value);
      await this.renderGeneratorPanel();
    });
    const inputField = this.createField(filesHeaderGrid, this.t("generatorInputDir"));
    inputField.addClass("ola-field--input-root");
    const inputSelect = inputField.createEl("select");
    for (const root of inputRoots) {
      inputSelect.createEl("option", {
        value: root.path,
        text: `${root.label} (${root.count})`
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
    let subjectInput;
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
      `\uD30C\uC77C ${this.generatorState.selectedFiles.length}`,
      this.formatBytes(selectedBytes),
      `${estimatedTokens.toLocaleString(this.plugin.getLocale())} tok`,
      activeRootLabel
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
        const focusedGroup = grouped.find(([folder]) => folder === this.generatorState.focusedFolder) ?? grouped.find(([folder]) => this.generatorState.focusedFolder.startsWith(`${folder}/`)) ?? null;
        if (focusedGroup) {
          const [folder, entries] = focusedGroup;
          const rootFolderMeta = entries[0];
          const focusedView = this.getGeneratorFocusedView(this.generatorState.focusedFolder);
          const focusedCard = groupsEl.createDiv({ cls: "ola-file-group ola-file-group--focused" });
          const focusRow = focusedCard.createDiv({ cls: "ola-folder-focus-row" });
          const backButton = focusRow.createEl("button", {
            cls: "ola-folder-back-button",
            text: this.t("generatorFolderBack")
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
            text: `${titleLabel} (${focusedView.currentFiles.length + focusedView.subfolders.reduce((total, item) => total + item.count, 0)})`
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
            text: `${selectedCount}/${focusedEntries.length}`
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
                text: `${subfolder.label} (${subfolder.count})`
              });
              openSubfolderButton.disabled = isBusy;
              openSubfolderButton.addEventListener("click", () => {
                this.generatorState.focusedFolder = subfolder.key;
                this.syncGeneratorOutputDir();
                void this.renderGeneratorPanel();
              });
              subfolderMain.createSpan({
                cls: "ola-badge ola-badge--score",
                text: `${subfolder.selectedCount}/${subfolder.count}`
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
                this.generatorState.selectedFiles = singleFileRebuild ? [entry.path] : [.../* @__PURE__ */ new Set([...this.generatorState.selectedFiles, entry.path])];
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
            text: `${selectedCount}/${entries.length}`
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
          text: this.t("workflowsRefresh")
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
      }
    );
    const allPatterns = this.getPatternKeys();
    const effectivePatternKeys = this.getEffectiveGeneratorPatternKeys();
    const visiblePatternGroups = this.getPatternGroupEntries().map(([groupName, groupedPatterns]) => [groupName, groupedPatterns.filter((pattern) => pattern !== TITLE_REBUILD_PATTERN)]).filter(([, groupedPatterns]) => groupedPatterns.length > 0);
    const showRebuildTitleOption = false;
    const outputField = this.createField(settingsStageEl, this.t("generatorOutputDir"));
    const outputDir = outputField.createEl("select");
    for (const folderPath of folderOptions) {
      outputDir.createEl("option", {
        value: folderPath,
        text: folderPath || "/"
      });
    }
    outputDir.value = this.generatorState.outputDir;
    outputDir.disabled = isBusy || this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD;
    outputDir.addEventListener("change", () => {
      this.generatorState.outputDir = outputDir.value;
    });
    if (this.generatorState.mode === GENERATOR_MODE_NOTE_REBUILD) {
      outputField.createDiv({ cls: "ola-field-help", text: "\uB178\uD2B8 \uC7AC\uAD6C\uC131\uC740 \uD604\uC7AC \uC120\uD0DD \uD30C\uC77C\uC744 \uC9C1\uC811 \uB36E\uC5B4\uC501\uB2C8\uB2E4." });
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
      attr: { type: "number", min: "0", max: "1", step: "0.1" }
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
      text: this.t("generatorManualTargetSet")
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
      text: `${effectivePatternKeys.length}/${allPatterns.length}`
    });
    const patternHeaderActions = patternHeader.createDiv({ cls: "ola-pattern-header-actions" });
    const createPatternButton = patternHeaderActions.createEl("button", {
      text: this.t("generatorCreatePatternNote")
    });
    createPatternButton.disabled = isBusy;
    createPatternButton.addEventListener("click", () => {
      void this.createPatternNote();
    });
    const patternHelp = patternSection.createDiv({ cls: "ola-field-help" });
    patternHelp.setText(this.generatorState.targetSet === MANUAL_TARGET_SET ? this.t("generatorManualTargetSet") : `${this.t("generatorTargetSet")}: ${this.generatorState.targetSet}`);
    const patternGroupList = patternSection.createDiv({ cls: "ola-pattern-groups" });
    for (const [groupName, groupedPatterns] of visiblePatternGroups) {
      const groupDetails = patternGroupList.createEl("details", { cls: "ola-pattern-group" });
      if (groupName === this.generatorState.targetSet || visiblePatternGroups.length === 1) {
        groupDetails.open = true;
      }
      groupDetails.createEl("summary", {
        cls: "ola-pattern-group-summary",
        text: `${groupName} (${groupedPatterns.length})`
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
            this.generatorState.patternKeys = [.../* @__PURE__ */ new Set([...this.generatorState.patternKeys, pattern])];
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
          text: this.t("generatorPatternOpenNote")
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
          text: preview.source === "obsidian" ? this.t("generatorPatternSourceObsidian") : this.t("generatorPatternSourceYaml")
        });
        if (preview.output_suffix) {
          badgeRow.createSpan({
            cls: "ola-badge ola-badge--score",
            text: this.t("generatorPatternOutputSuffix", { suffix: preview.output_suffix })
          });
        }
        if (preview.use_subject_prefix) {
          badgeRow.createSpan({
            cls: "ola-badge ola-badge--summary",
            text: this.t("generatorPatternSubjectPrefix")
          });
        }
      }
    }
    const runButton = bodyEl.createEl("button", {
      cls: "mod-cta ola-run-button",
      text: this.runningTask === "generator" ? this.t("generatorStatusProgress", { progress: progressValue }) : this.t("generatorRun")
    });
    runButton.disabled = isBusy;
    runButton.addEventListener("click", () => {
      void this.runGenerator();
    });
    const logsStageEl = this.createSectionDetails(
      bodyEl,
      this.t("generatorSectionLogs"),
      this.generatorLogs.length > 0 || this.runningTask === "generator"
    );
    this.createLogBlock(logsStageEl, this.generatorLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.generatorPanelEl, openKeys);
    }
    generatorScrollHost.scrollTop = previousScrollTop;
  }
  async renderTaggerPanel() {
    const hadDetails = this.taggerPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.taggerPanelEl);
    const taggerScrollHost = this.taggerPanelEl.parentElement instanceof HTMLElement ? this.taggerPanelEl.parentElement : this.taggerTabEl;
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
      `${this.t("taggerTarget")}: ${this.t(this.taggerState.target === "summary" ? "commonSummary" : this.taggerState.target === "raw" ? "commonRaw" : "commonBoth")}`,
      `${this.t("taggerMode")}: ${this.t(this.taggerState.mode === "reset" ? "commonReset" : "commonIncremental")}`,
      `${this.t("taggerRewriteScope")}: ${effectiveInputDir || this.t("workflowVaultWide")}`,
      manifest ? this.t("taggerIndexReady") : this.t("workflowsConfigMissing"),
      `Logs: ${this.taggerLogs.length}`
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
      this.t("taggerMinScore", { score: taggerThresholds.min_score ?? "-" })
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
      this.taggerState.target = targetSelect.value;
    });
    const modeField = this.createField(gridEl, this.t("taggerMode"));
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: "incremental", text: this.t("commonIncremental") });
    modeSelect.createEl("option", { value: "reset", text: this.t("commonReset") });
    modeSelect.value = this.taggerState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", () => {
      this.taggerState.mode = modeSelect.value;
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
      this.taggerLogs.length > 0 || this.runningTask === "tagger"
    );
    this.createLogBlock(logsStageEl, this.taggerLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.taggerPanelEl, openKeys);
    }
    taggerScrollHost.scrollTop = previousScrollTop;
  }
  async renderIngestPanel() {
    const hadDetails = this.ingestPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.ingestPanelEl);
    const ingestScrollHost = this.ingestPanelEl.parentElement instanceof HTMLElement ? this.ingestPanelEl.parentElement : this.ingestTabEl;
    const previousScrollTop = ingestScrollHost?.scrollTop ?? 0;
    const status = this.ingestState.status || this.t("ingestStatusReady");
    const bodyEl = this.renderToolSummary(this.ingestPanelEl, this.t("toolIngest"), status);
    bodyEl.createEl("p", { cls: "ola-workflow-intro", text: this.t("ingestIntro") });
    const isBusy = Boolean(this.runningTask);
    const folderOptions = this.getWorkflowFolderOptions([
      this.ingestState.inputDir,
      this.ingestState.outputDir,
      this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir,
      this.generatorState.outputDir
    ]);
    const selectedJob = this.ingestState.job === "all" ? null : this.getJobList().find((job) => job.name === this.ingestState.job) ?? null;
    const effectiveInputDir = this.getEffectiveIngestInputDir();
    const effectiveOutputDir = this.getEffectiveIngestOutputDir();
    const summaryBar = bodyEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      `${this.t("ingestJob")}: ${selectedJob?.name || this.t("ingestAllJobs")}`,
      `${this.t("ingestLayer")}: ${this.t(this.ingestState.layer === "summary" ? "commonSummary" : this.ingestState.layer === "raw" ? "commonRaw" : "commonBoth")}`,
      `${this.t("ingestMode")}: ${this.t(
        this.ingestState.mode === "reset" ? "commonReset" : this.ingestState.mode === "cleanup" ? "commonCleanup" : "commonIncremental"
      )}`,
      `${this.t("ingestPolicy")}: ${this.t(
        this.ingestState.policy === "headings" ? "commonHeadings" : this.ingestState.policy === "paragraph" ? "commonParagraph" : this.ingestState.policy === "minimal" ? "commonMinimal" : "commonAuto"
      )}`,
      `${this.t("generatorInputDir")}: ${effectiveInputDir || this.t("workflowUseGeneratorSource")}`,
      `${this.t("generatorOutputDir")}: ${effectiveOutputDir || this.t("workflowUseGeneratorSource")}`,
      this.t("generatorSelectedFiles", {
        count: this.ingestState.inputDir ? 0 : this.generatorState.selectedFiles.length
      })
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
      text: selectedJob?.input_dir_resolved || selectedJob?.input_dir || this.toolConfig?.default_input_dir || "-"
    });
    const targetInfo = infoGrid.createDiv({ cls: "ola-info-card" });
    targetInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestResolvedOutput") });
    targetInfo.createEl("div", {
      cls: "ola-info-card-value",
      text: selectedJob?.output_dir_resolved || selectedJob?.output_dir || this.toolConfig?.default_output_dir || "-"
    });
    if (selectedJob?.ingest?.collection_raw || selectedJob?.ingest?.collection_summary) {
      const collectionInfo = infoGrid.createDiv({ cls: "ola-info-card" });
      collectionInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestCollectionRaw") });
      collectionInfo.createEl("div", {
        cls: "ola-info-card-value",
        text: selectedJob.ingest?.collection_raw || "-"
      });
      const collectionSummaryInfo = infoGrid.createDiv({ cls: "ola-info-card" });
      collectionSummaryInfo.createEl("div", { cls: "ola-info-card-label", text: this.t("ingestCollectionSummary") });
      collectionSummaryInfo.createEl("div", {
        cls: "ola-info-card-value",
        text: selectedJob.ingest?.collection_summary || "-"
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
      this.ingestState.layer = layerSelect.value;
    });
    const modeField = this.createField(gridEl, this.t("ingestMode"));
    const modeSelect = modeField.createEl("select");
    modeSelect.createEl("option", { value: "incremental", text: this.t("commonIncremental") });
    modeSelect.createEl("option", { value: "reset", text: this.t("commonReset") });
    modeSelect.createEl("option", { value: "cleanup", text: this.t("commonCleanup") });
    modeSelect.value = this.ingestState.mode;
    modeSelect.disabled = isBusy;
    modeSelect.addEventListener("change", () => {
      this.ingestState.mode = modeSelect.value;
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
      this.ingestState.policy = policySelect.value;
    });
    const chunkField = this.createField(gridEl, this.t("ingestChunkSize"));
    const chunkInput = chunkField.createEl("input", {
      attr: { type: "number", min: "500", max: "4000", step: "50" }
    });
    chunkInput.value = String(this.ingestState.chunkSize);
    chunkInput.disabled = isBusy;
    chunkInput.addEventListener("change", () => {
      const next = Number.parseInt(chunkInput.value, 10);
      this.ingestState.chunkSize = Number.isFinite(next) ? next : 800;
    });
    const overlapField = this.createField(gridEl, this.t("ingestOverlap"));
    const overlapInput = overlapField.createEl("input", {
      attr: { type: "number", min: "0", max: "500", step: "50" }
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
          this.ingestState.headingLevels = [.../* @__PURE__ */ new Set([...this.ingestState.headingLevels, level])].sort();
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
      this.ingestLogs.length > 0 || this.runningTask === "ingest"
    );
    this.createLogBlock(logsStageEl, this.ingestLogs.slice(-30), this.t("logsEmpty"));
    if (hadDetails) {
      this.restoreOpenDetails(this.ingestPanelEl, openKeys);
    }
    ingestScrollHost.scrollTop = previousScrollTop;
  }
  async renderWorkflowLogsPanel() {
    const hadDetails = this.workflowLogsPanelEl.querySelectorAll("details").length > 0;
    const openKeys = this.captureOpenDetails(this.workflowLogsPanelEl);
    const bodyEl = this.renderToolSummary(
      this.workflowLogsPanelEl,
      this.t("logsTitle", { count: this.workflowLogs.length }),
      this.runningTask ? this.t("workflowsBusy", { tool: this.getToolLabel(this.runningTask) }) : this.t("statusIdle")
    );
    const summaryBar = bodyEl.createDiv({ cls: "ola-generator-summary-bar" });
    [
      `Total: ${this.workflowLogs.length}`,
      `Generator: ${this.workflowLogs.filter((entry) => entry.tool === "generator").length}`,
      `Tagger: ${this.workflowLogs.filter((entry) => entry.tool === "tagger").length}`,
      `Ingest: ${this.workflowLogs.filter((entry) => entry.tool === "ingest").length}`
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
          text: this.t("logsClear")
        });
        clearButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.workflowLogs = [];
          void this.renderWorkflowLogsPanel();
        });
      }
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
        text: `${entry.timestamp} ${this.getToolLabel(entry.tool)}`
      });
      itemEl.createDiv({ cls: "ola-workflow-log-text", text: entry.message });
    }
    if (hadDetails) {
      this.restoreOpenDetails(this.workflowLogsPanelEl, openKeys);
    }
  }
  async runGenerator() {
    const effectivePatternKeys = this.getEffectiveGeneratorPatternKeys();
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
      return;
    }
    if (this.generatorState.inputDir == null) {
      new import_obsidian.Notice(this.t("noticeNoInputDir"));
      return;
    }
    if (this.generatorState.outputDir == null) {
      new import_obsidian.Notice(this.t("noticeNoOutputDir"));
      return;
    }
    if (this.generatorState.jobName === MANUAL_JOB && effectivePatternKeys.length === 0) {
      new import_obsidian.Notice(this.t("noticeNoPatterns"));
      return;
    }
    if (this.generatorState.selectedFiles.length === 0) {
      new import_obsidian.Notice(this.t("noticeNoSelectedFiles"));
      return;
    }
    if (!await this.refreshBackendState()) {
      new import_obsidian.Notice(this.t("noticeBackendUnavailable"));
      return;
    }
    await this.plugin.ensureFolder(this.generatorState.outputDir);
    const absoluteInputDir = this.plugin.resolveVaultFolderPath(
      this.generatorState.inputDir === GENERATOR_ROOT_SENTINEL ? "" : this.generatorState.inputDir
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
          rebuild_title: this.generatorState.rebuildTitle
        },
        async (chunk) => {
          const data = chunk;
          if (typeof data.progress === "number") {
            this.generatorState.progress = Math.max(0, Math.min(100, data.progress));
          }
          if (typeof data.message === "string" && data.message.trim()) {
            this.generatorLogs.push(data.message);
            this.generatorLogs = this.generatorLogs.slice(-80);
            this.recordWorkflowLog("generator", data.message);
            await this.renderGeneratorPanel();
          }
        }
      );
      this.generatorState.status = this.t("statusDone");
      this.generatorState.progress = 100;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.generatorState.status = this.t("statusError");
      this.generatorLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("generator", `[error] ${message}`);
      new import_obsidian.Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }
  async runTagger() {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
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
      const absoluteInputDir = effectiveInputDir ? this.plugin.resolveVaultFolderPath(effectiveInputDir) : "";
      await this.streamNdjson(
        "/api/tools/tagger/stream",
        {
          target: this.taggerState.target,
          mode: this.taggerState.mode,
          input_dir: absoluteInputDir,
          selected_files: []
        },
        async (chunk) => {
          const data = chunk;
          if (typeof data.message === "string" && data.message.trim()) {
            this.taggerLogs.push(data.message);
            this.taggerLogs = this.taggerLogs.slice(-80);
            this.recordWorkflowLog("tagger", data.message);
            await this.renderTaggerPanel();
          }
        }
      );
      this.taggerState.status = this.t("statusDone");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.taggerState.status = this.t("statusError");
      this.taggerLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("tagger", `[error] ${message}`);
      new import_obsidian.Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }
  async runIngest() {
    if (this.runningTask) {
      new import_obsidian.Notice(this.t("noticeToolBusy"));
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
      const absoluteInputDir = effectiveInputDir ? this.plugin.resolveVaultFolderPath(effectiveInputDir) : "";
      const absoluteOutputDir = effectiveOutputDir ? this.plugin.resolveVaultFolderPath(effectiveOutputDir) : "";
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
          selected_files: this.ingestState.inputDir ? [] : this.generatorState.selectedFiles
        },
        async (chunk) => {
          const data = chunk;
          if (typeof data.message === "string" && data.message.trim()) {
            this.ingestLogs.push(data.message);
            this.ingestLogs = this.ingestLogs.slice(-80);
            this.recordWorkflowLog("ingest", data.message);
            await this.renderIngestPanel();
          }
        }
      );
      this.ingestState.status = this.t("statusDone");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.ingestState.status = this.t("statusError");
      this.ingestLogs.push(`[error] ${message}`);
      this.recordWorkflowLog("ingest", `[error] ${message}`);
      new import_obsidian.Notice(this.t("noticeLocalAgentError", { message }));
    } finally {
      this.runningTask = null;
      this.applyBusyState();
      await this.renderWorkflowPanels();
    }
  }
  async renderSentContextPanel() {
    this.sentContextDetailsEl.empty();
    this.sentContextDetailsEl.open = false;
    const summaryEl = this.sentContextDetailsEl.createEl("summary", {
      text: this.t("panelSentContext", { count: this.currentContextEntries.length })
    });
    summaryEl.addClass("ola-meta-summary");
    const bodyEl = this.sentContextDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.currentContextEntries.length === 0) {
      bodyEl.setText(this.t("panelNoSentContext"));
      return;
    }
    const cards = this.currentContextEntries.map((entry) => ({
      label: entry.name,
      path: entry.path,
      badge: this.plugin.getContextSourceLabel(entry.source),
      badgeClass: "ola-badge--context",
      snippet: this.buildSnippetPreview(entry.content),
      reason: `${this.t("debugSelectedBy")}: ${this.plugin.getContextSourceLabel(entry.source)}`,
      hint: entry.path
    }));
    this.renderSourceCards(bodyEl, cards);
  }
  async renderSourcePanel() {
    this.sourceDetailsEl.empty();
    this.sourceDetailsEl.open = false;
    const summaryEl = this.sourceDetailsEl.createEl("summary", {
      text: this.t("panelRetrievedSources", { count: this.backendSources.length })
    });
    summaryEl.addClass("ola-meta-summary");
    const bodyEl = this.sourceDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.backendSources.length === 0) {
      bodyEl.setText(this.t("panelNoRetrievedSources"));
      return;
    }
    const cards = this.backendSources.map((source) => ({
      label: this.plugin.resolveVaultFile(source.path)?.basename || source.name || source.path,
      path: source.path,
      badge: this.plugin.getLayerLabel(source.layer),
      badgeClass: `ola-badge--${source.layer}`,
      snippet: this.buildSnippetPreview(source.snippet),
      reason: this.buildSourceReason(source),
      secondaryBadge: this.t("badgeScore", {
        score: typeof source.score === "number" ? source.score.toFixed(3) : "0.000"
      }),
      secondaryBadgeClass: "ola-badge--score",
      tertiaryBadge: source.relation_type ? this.getRelationTypeLabel(source.relation_type) : void 0,
      tertiaryBadgeClass: source.relation_type ? "ola-badge--relation" : void 0,
      quaternaryBadge: source.is_main === false ? this.t("badgeReference") : void 0,
      quaternaryBadgeClass: source.is_main === false ? "ola-badge--ref" : void 0,
      hint: [
        source.project_id ? `[${source.project_id}]` : "",
        source.doc_role || "",
        source.note_type || "",
        source.section_heading ? `# ${source.section_heading}` : "",
        source.folder || source.path
      ].filter(Boolean).join(" \xB7 ")
    }));
    this.renderSourceCards(bodyEl, cards);
  }
  async renderRecommendationPanel() {
    this.recommendationDetailsEl.empty();
    this.recommendationDetailsEl.open = false;
    const summaryEl = this.recommendationDetailsEl.createEl("summary", {
      text: this.t("panelFollowUpNotes", { count: this.backendRecommendations.length })
    });
    summaryEl.addClass("ola-meta-summary");
    const bodyEl = this.recommendationDetailsEl.createDiv({ cls: "ola-meta-body" });
    if (this.backendRecommendations.length === 0) {
      bodyEl.setText(this.t("panelNoFollowUpNotes"));
      return;
    }
    const cards = this.backendRecommendations.map((item) => ({
      label: this.plugin.resolveVaultFile(item.path)?.basename || item.name || item.path,
      path: item.path,
      badge: this.getRelationTypeLabel(item.relation_type),
      badgeClass: "ola-badge--relation",
      reason: this.buildRecommendationReason(item),
      secondaryBadge: typeof item.confidence === "number" ? this.t("badgeConfidence", { score: item.confidence.toFixed(3) }) : void 0,
      secondaryBadgeClass: typeof item.confidence === "number" ? "ola-badge--score" : void 0,
      hint: [
        item.project_id ? `[${item.project_id}]` : "",
        item.doc_role || "",
        item.note_type || "",
        item.folder || item.path
      ].filter(Boolean).join(" \xB7 ")
    }));
    this.renderSourceCards(bodyEl, cards);
  }
  renderSourceCards(containerEl, cards) {
    const listEl = containerEl.createDiv({ cls: "ola-source-list" });
    for (const card of cards) {
      const cardEl = listEl.createDiv({ cls: "ola-source-card" });
      const headerEl = cardEl.createDiv({ cls: "ola-source-header" });
      const resolved = this.plugin.resolveVaultFile(card.path);
      if (resolved) {
        const linkEl = headerEl.createEl("button", {
          cls: "ola-source-link",
          text: card.label
        });
        linkEl.addEventListener("click", async () => {
          await this.plugin.openFileFromSource(resolved);
        });
      } else {
        headerEl.createEl("div", {
          cls: "ola-source-link ola-source-link--disabled",
          text: card.label
        });
      }
      const badgeRowEl = cardEl.createDiv({ cls: "ola-badge-row" });
      badgeRowEl.createSpan({
        cls: `ola-badge ${card.badgeClass}`,
        text: card.badge
      });
      if (card.secondaryBadge && card.secondaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.secondaryBadgeClass}`,
          text: card.secondaryBadge
        });
      }
      if (card.tertiaryBadge && card.tertiaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.tertiaryBadgeClass}`,
          text: card.tertiaryBadge
        });
      }
      if (card.quaternaryBadge && card.quaternaryBadgeClass) {
        badgeRowEl.createSpan({
          cls: `ola-badge ${card.quaternaryBadgeClass}`,
          text: card.quaternaryBadge
        });
      }
      if (card.snippet) {
        cardEl.createDiv({
          cls: "ola-source-snippet",
          text: card.snippet
        });
      }
      if (card.reason) {
        cardEl.createDiv({
          cls: "ola-source-reason",
          text: card.reason
        });
      }
      cardEl.createDiv({
        cls: "ola-source-path",
        text: card.hint
      });
    }
  }
  buildSourceReason(source) {
    const parts = [];
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
  buildRecommendationReason(item) {
    const parts = [];
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
  getSourceLabel(source) {
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
  getRelationTypeLabel(relationType) {
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
  buildSnippetPreview(text, maxChars = 220) {
    if (!text) {
      return "";
    }
    const compact = text.replace(/^---[\s\S]*?---/, "").replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1").replace(/\s+/g, " ").trim();
    if (!compact) {
      return "";
    }
    return compact.length > maxChars ? `${compact.slice(0, maxChars).trim()}...` : compact;
  }
  linkifyVaultPaths(content) {
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
  async clearConversation() {
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
      threadRecord.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
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
    new import_obsidian.Notice(this.t("noticeConversationCleared"));
  }
  async saveAnswer() {
    const turn = this.getLatestCompletedTurn();
    const file = this.getAnswerTargetFile(turn);
    if (!file) {
      new import_obsidian.Notice(this.t("noticeOpenNote"));
      return;
    }
    if (!turn?.answer.trim()) {
      new import_obsidian.Notice(this.t("noticeNoAnswerToSave"));
      return;
    }
    const folderPath = (0, import_obsidian.normalizePath)(this.plugin.settings.saveFolder);
    await this.plugin.ensureFolder(folderPath);
    const titleBase = file.basename.replace(/[\\/:*?"<>|]/g, "-");
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const outputPath = (0, import_obsidian.normalizePath)(`${folderPath}/${titleBase}-${timestamp}.md`);
    const markdown = this.buildSavedAnswerMarkdown(file, turn, "note");
    await this.plugin.app.vault.create(outputPath, markdown);
    if (this.conversationActionsEl) {
      this.conversationActionsEl.open = false;
    }
    new import_obsidian.Notice(this.t("noticeSavedAnswer", { path: outputPath }));
  }
  async appendAnswerToCurrentNote() {
    const turn = this.getLatestCompletedTurn();
    const file = this.getAnswerTargetFile(turn);
    if (!file) {
      new import_obsidian.Notice(this.t("noticeOpenNote"));
      return;
    }
    if (!turn?.answer.trim()) {
      new import_obsidian.Notice(this.t("noticeNoAnswerToAppend"));
      return;
    }
    const markdown = this.buildSavedAnswerMarkdown(file, turn, "append");
    await this.plugin.app.vault.append(file, `

${markdown}
`);
    if (this.conversationActionsEl) {
      this.conversationActionsEl.open = false;
    }
    new import_obsidian.Notice(this.t("noticeAppendedAnswer", { path: file.path }));
  }
  getAnswerTargetFile(turn) {
    const targetPath = turn?.attachedFilePath || this.currentFilePath;
    if (targetPath) {
      const current = this.plugin.app.vault.getAbstractFileByPath(targetPath);
      if (current instanceof import_obsidian.TFile) {
        return current;
      }
    }
    return this.plugin.app.workspace.getActiveFile();
  }
  buildSavedAnswerMarkdown(file, turn, mode) {
    const now = (/* @__PURE__ */ new Date()).toLocaleString(this.plugin.getLocale());
    const title = mode === "note" ? this.t("savedTitleNote") : this.t("savedTitleAppend", { now });
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
      this.linkifyVaultPaths(turn.answer).trim()
    ];
    const sourceLines = turn.sources.map((source) => {
      const label = this.plugin.resolveVaultFile(source.path)?.basename || source.name || source.path;
      const parts = [
        this.plugin.makeVaultLinkOrCode(source.path, label),
        this.plugin.getLayerLabel(source.layer).toLowerCase(),
        this.t("badgeScore", {
          score: typeof source.score === "number" ? source.score.toFixed(3) : "0.000"
        })
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
  updateChatActionButtonState() {
    if (!this.chatActionButton) {
      return;
    }
    const isChatRunning = this.runningTask === "chat";
    const hasQuestion = this.questionEl?.value.trim().length > 0;
    if (this.quickActionSuggestionsEl) {
      this.quickActionSuggestionsEl.classList.toggle("is-hidden", hasQuestion || Boolean(this.runningTask));
    }
    this.composeRowEl?.classList.toggle("is-suggesting", !hasQuestion && !this.runningTask);
    this.chatActionButton.textContent = isChatRunning ? "\u25A0" : "\u27A4";
    this.chatActionButton.setAttribute("aria-label", isChatRunning ? this.t("buttonStop") : this.t("buttonAsk"));
    this.chatActionButton.setAttribute("title", isChatRunning ? this.t("buttonStop") : this.t("buttonAsk"));
    this.chatActionButton.classList.toggle("is-stop", isChatRunning);
    this.chatActionButton.disabled = isChatRunning ? false : Boolean(this.runningTask) || !hasQuestion;
  }
  applyBusyState() {
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
  setBusy(isBusy) {
    this.applyBusyState();
  }
};
var LocalAgentSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingLanguageName")).setDesc(this.plugin.t("settingLanguageDesc")).addDropdown(
      (dropdown) => dropdown.addOption("ko", this.plugin.t("settingLanguageKorean")).addOption("en", this.plugin.t("settingLanguageEnglish")).setValue(this.plugin.settings.language).onChange(async (value) => {
        this.plugin.settings.language = value;
        await this.plugin.saveSettings();
        this.display();
        await this.plugin.refreshOpenViews();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingBackendName")).setDesc(this.plugin.t("settingBackendDesc")).addText(
      (text) => text.setPlaceholder("http://127.0.0.1:8011").setValue(this.plugin.settings.backendUrl).onChange(async (value) => {
        this.plugin.settings.backendUrl = value.trim() || DEFAULT_SETTINGS.backendUrl;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingAutoStartBackendName")).setDesc(this.plugin.t("settingAutoStartBackendDesc")).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoStartBackend).onChange(async (value) => {
        this.plugin.settings.autoStartBackend = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingBackendPythonName")).setDesc(this.plugin.t("settingBackendPythonDesc")).addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.backendPythonPath).setValue(this.plugin.settings.backendPythonPath).onChange(async (value) => {
        this.plugin.settings.backendPythonPath = value.trim() || DEFAULT_SETTINGS.backendPythonPath;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingBackendScriptName")).setDesc(this.plugin.t("settingBackendScriptDesc")).addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.backendScriptPath).setValue(this.plugin.settings.backendScriptPath).onChange(async (value) => {
        this.plugin.settings.backendScriptPath = value.trim() || DEFAULT_SETTINGS.backendScriptPath;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingBackendWorkingDirName")).setDesc(this.plugin.t("settingBackendWorkingDirDesc")).addText(
      (text) => text.setPlaceholder(DEFAULT_SETTINGS.backendWorkingDir).setValue(this.plugin.settings.backendWorkingDir).onChange(async (value) => {
        this.plugin.settings.backendWorkingDir = value.trim() || DEFAULT_SETTINGS.backendWorkingDir;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingProjectName")).setDesc(this.plugin.t("settingProjectDesc")).addText(
      (text) => text.setPlaceholder("Default").setValue(this.plugin.settings.defaultProject).onChange(async (value) => {
        this.plugin.settings.defaultProject = value.trim() || DEFAULT_SETTINGS.defaultProject;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingSaveFolderName")).setDesc(this.plugin.t("settingSaveFolderDesc")).addText(
      (text) => text.setPlaceholder("AI Answers").setValue(this.plugin.settings.saveFolder).onChange(async (value) => {
        this.plugin.settings.saveFolder = value.trim() || DEFAULT_SETTINGS.saveFolder;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingMaxContextName")).setDesc(this.plugin.t("settingMaxContextDesc")).addText(
      (text) => text.setPlaceholder("6").setValue(String(this.plugin.settings.maxContextNotes)).onChange(async (value) => {
        const parsed = Number.parseInt(value, 10);
        this.plugin.settings.maxContextNotes = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SETTINGS.maxContextNotes;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingOpenModeName")).setDesc(this.plugin.t("settingOpenModeDesc")).addDropdown(
      (dropdown) => dropdown.addOption("current", this.plugin.t("settingOpenModeCurrent")).addOption("split", this.plugin.t("settingOpenModeSplit")).addOption("tab", this.plugin.t("settingOpenModeTab")).setValue(this.plugin.settings.sourceOpenMode).onChange(async (value) => {
        this.plugin.settings.sourceOpenMode = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(this.plugin.t("settingSplitDirectionName")).setDesc(this.plugin.t("settingSplitDirectionDesc")).addDropdown(
      (dropdown) => dropdown.addOption("left", this.plugin.t("settingDirectionLeft")).addOption("right", this.plugin.t("settingDirectionRight")).addOption("down", this.plugin.t("settingDirectionDown")).setValue(this.plugin.settings.splitDirection).onChange(async (value) => {
        this.plugin.settings.splitDirection = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
var LocalAgentPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.chatThreads = [];
    this.activeChatThreadId = "";
    this.lastMarkdownLeaf = null;
    this.lastEditorSelection = "";
    this.lastEditorSelectionPath = "";
  }
  async onload() {
    await this.loadSettings();
    this.registerView(
      VIEW_TYPE_LOCAL_AGENT,
      (leaf) => new LocalAgentView(leaf, this)
    );
    this.addRibbonIcon("bot", this.t("commandOpen"), async () => {
      await this.activateView();
    });
    this.addCommand({
      id: "open-local-agent",
      name: this.t("commandOpen"),
      callback: async () => {
        await this.activateView();
      }
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
      }
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
      }
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
      }
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
      }
    });
    this.rememberMarkdownLeaf(this.app.workspace.getMostRecentLeaf());
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.rememberMarkdownLeaf(leaf);
        this.rememberActiveSelection();
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.rememberActiveSelection();
        void this.refreshLiveViews();
      })
    );
    this.addSettingTab(new LocalAgentSettingTab(this.app, this));
  }
  language() {
    return this.settings.language ?? DEFAULT_SETTINGS.language;
  }
  getLocale() {
    return this.language() === "ko" ? "ko-KR" : "en-US";
  }
  t(key, vars = {}) {
    const templateMap = {
      ...WORKFLOW_UI_STRINGS.en,
      ...UI_STRINGS.en,
      ...WORKFLOW_UI_STRINGS[this.language()] ?? {},
      ...UI_STRINGS[this.language()] ?? {}
    };
    const template = templateMap[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_match, name) => String(vars[name] ?? ""));
  }
  getQuickAction(key) {
    return QUICK_ACTIONS[this.language()][key];
  }
  getLayerLabel(layer) {
    return layer === "summary" ? this.t("sourceLayerSummary") : this.t("sourceLayerRaw");
  }
  getContextSourceLabel(source) {
    const map = {
      links: "contextSourceLinks",
      folder: "contextSourceFolder",
      tags: "contextSourceTags",
      backlinks: "contextSourceBacklinks"
    };
    return this.t(map[source]);
  }
  getResponseLanguageInstruction() {
    return this.language() === "ko" ? "Answer in Korean unless the user's request explicitly asks for another language." : "Answer in English unless the user's request explicitly asks for another language.";
  }
  async refreshOpenViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT)) {
      const view = leaf.view;
      if (view instanceof LocalAgentView) {
        view.render();
        await view.refreshViewState();
      }
    }
  }
  async refreshLiveViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT)) {
      const view = leaf.view;
      if (view instanceof LocalAgentView) {
        await view.refreshContext();
      }
    }
  }
  async onunload() {
    await this.app.workspace.getLeavesOfType(VIEW_TYPE_LOCAL_AGENT).reduce(
      async (prev, leaf) => {
        await prev;
        await leaf.setViewState({ type: "empty" });
      },
      Promise.resolve()
    );
  }
  getMarkdownViewFromLeaf(leaf) {
    return leaf?.view instanceof import_obsidian.MarkdownView ? leaf.view : null;
  }
  rememberSelection(selection, filePath = "") {
    const trimmed = selection.trim();
    if (!trimmed) {
      return;
    }
    this.lastEditorSelection = trimmed;
    this.lastEditorSelectionPath = filePath;
  }
  rememberActiveSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
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
  getActiveSelection() {
    const currentSelection = this.rememberActiveSelection();
    if (currentSelection) {
      return currentSelection;
    }
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const preferredView = this.getMarkdownViewFromLeaf(this.getPreferredMarkdownLeaf());
    const candidatePath = activeView?.file?.path ?? preferredView?.file?.path ?? "";
    if (candidatePath && this.lastEditorSelectionPath && candidatePath === this.lastEditorSelectionPath) {
      return this.lastEditorSelection;
    }
    return "";
  }
  async activateView() {
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
  async openFileFromSource(file) {
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
  async openFileInSplit(file) {
    const anchorLeaf = this.getPreferredMarkdownLeaf();
    const direction = this.settings.splitDirection;
    const split = direction === "down" ? "horizontal" : "vertical";
    const leaf = this.app.workspace.createLeafBySplit(anchorLeaf, split, direction === "left");
    await leaf.openFile(file, { active: true });
    this.rememberMarkdownLeaf(leaf);
    this.app.workspace.revealLeaf(leaf);
  }
  rememberMarkdownLeaf(leaf) {
    if (leaf?.view instanceof import_obsidian.MarkdownView) {
      this.lastMarkdownLeaf = leaf;
    }
  }
  getPreferredMarkdownLeaf() {
    const activeMarkdownView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (activeMarkdownView?.leaf) {
      this.lastMarkdownLeaf = activeMarkdownView.leaf;
      return activeMarkdownView.leaf;
    }
    if (this.lastMarkdownLeaf?.view instanceof import_obsidian.MarkdownView) {
      return this.lastMarkdownLeaf;
    }
    const firstMarkdownLeaf = this.app.workspace.getLeavesOfType("markdown")[0];
    if (firstMarkdownLeaf) {
      this.lastMarkdownLeaf = firstMarkdownLeaf;
      return firstMarkdownLeaf;
    }
    return this.app.workspace.getLeaf(false);
  }
  resolveVaultFile(rawPath) {
    const normalized = rawPath.replace(/\\/g, "/").trim();
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof import_obsidian.TFile) {
      return direct;
    }
    const basePath = this.getVaultBasePath();
    if (basePath) {
      const baseNormalized = basePath.replace(/\\/g, "/");
      if (normalized.startsWith(baseNormalized)) {
        const relative = normalized.slice(baseNormalized.length).replace(/^\/+/, "");
        const relativeFile = this.app.vault.getAbstractFileByPath(relative);
        if (relativeFile instanceof import_obsidian.TFile) {
          return relativeFile;
        }
      }
    }
    return null;
  }
  getVaultBasePath() {
    const adapter = this.app.vault.adapter;
    if (typeof adapter.getBasePath === "function") {
      return (0, import_obsidian.normalizePath)(adapter.getBasePath());
    }
    return null;
  }
  resolveVaultFolderPath(rawPath) {
    const normalized = (0, import_obsidian.normalizePath)((rawPath || "").trim());
    if (/^[A-Za-z]:[\\/]/.test(normalized) || normalized.startsWith("/")) {
      return normalized;
    }
    const basePath = this.getVaultBasePath();
    if (!basePath) {
      return normalized;
    }
    return normalized ? (0, import_obsidian.normalizePath)(`${basePath}/${normalized}`) : basePath;
  }
  makeWikiLink(file, label) {
    const target = file.path.replace(/\.md$/i, "");
    return `[[${target}${label ? `|${label}` : ""}]]`;
  }
  makeVaultLinkOrCode(rawPath, label) {
    const resolved = this.resolveVaultFile(rawPath);
    if (!resolved) {
      return `\`${rawPath}\``;
    }
    return this.makeWikiLink(resolved, label ?? resolved.basename);
  }
  async ensureFolder(folderPath) {
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
  async loadSettings() {
    const loaded = await this.loadData();
    const rawSettings = loaded?.settings ?? loaded ?? {};
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      scopes: {
        ...DEFAULT_SETTINGS.scopes,
        ...rawSettings?.scopes ?? {}
      }
    };
    this.chatThreads = Array.isArray(loaded?.chatThreads) ? loaded.chatThreads : [];
    this.activeChatThreadId = typeof loaded?.activeChatThreadId === "string" ? loaded.activeChatThreadId : "";
    this.ensureChatThreads();
  }
  async saveSettings() {
    await this.saveData({
      settings: this.settings,
      chatThreads: this.chatThreads,
      activeChatThreadId: this.activeChatThreadId
    });
  }
  createChatThread(title) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: (title || this.t("threadUntitled")).trim(),
      createdAt: now,
      updatedAt: now,
      turns: []
    };
  }
  ensureChatThreads() {
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
  getChatThread(threadId) {
    return this.chatThreads.find((thread) => thread.id === threadId) ?? null;
  }
  sortChatThreadsByRecent() {
    this.chatThreads.sort((a, b) => {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiXHVGRUZGaW1wb3J0IHtcclxuICBBcHAsXHJcbiAgSXRlbVZpZXcsXHJcbiAgTWFya2Rvd25SZW5kZXJlcixcclxuICBNYXJrZG93blZpZXcsXHJcbiAgTm90aWNlLFxyXG4gIFBsdWdpbixcclxuICBQbHVnaW5TZXR0aW5nVGFiLFxyXG4gIFNldHRpbmcsXHJcbiAgVEZpbGUsXHJcbiAgVEZvbGRlcixcclxuICBXb3Jrc3BhY2VMZWFmLFxyXG4gIG5vcm1hbGl6ZVBhdGgsXHJcbiAgcmVxdWVzdFVybCxcclxufSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHsgc3Bhd24gfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xyXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gXCJub2RlOmh0dHBcIjtcclxuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSBcIm5vZGU6aHR0cHNcIjtcclxuXHJcbmNvbnN0IFZJRVdfVFlQRV9MT0NBTF9BR0VOVCA9IFwibG9jYWwtYWdlbnQtdmlld1wiO1xyXG5jb25zdCBNQVhfTk9URV9DSEFSUyA9IDEyMDAwO1xyXG5jb25zdCBNQVhfQ09OVEVYVF9OT1RFX0NIQVJTID0gNDAwMDtcclxuY29uc3QgR0VORVJBVE9SX1NVUFBPUlRFRF9FWFRFTlNJT05TID0gbmV3IFNldChbXCJtZFwiLCBcInR4dFwiLCBcInB5XCJdKTtcclxuY29uc3QgQ09OVEVYVF9SRUFEQUJMRV9FWFRFTlNJT05TID0gbmV3IFNldChbXHJcbiAgXCJtZFwiLCBcInR4dFwiLCBcInB5XCIsIFwianNcIiwgXCJ0c1wiLCBcInRzeFwiLCBcImpzeFwiLCBcImpzb25cIiwgXCJ5YW1sXCIsIFwieW1sXCIsIFwidG9tbFwiLCBcImluaVwiLFxyXG4gIFwiY2ZnXCIsIFwiY29uZlwiLCBcInNxbFwiLCBcInNoXCIsIFwiYmF0XCIsIFwicHMxXCIsIFwiY3NzXCIsIFwic2Nzc1wiLCBcImh0bWxcIiwgXCJ4bWxcIiwgXCJjc3ZcIixcclxuICBcImdvXCIsIFwicnNcIiwgXCJqYXZhXCIsIFwia3RcIiwgXCJjXCIsIFwiY3BwXCIsIFwiaFwiLCBcImhwcFwiLCBcInJiXCIsIFwicGhwXCIsIFwiZW52XCIsXHJcbl0pO1xyXG50eXBlIExhbmd1YWdlQ29kZSA9IFwiZW5cIiB8IFwia29cIjtcclxuXHJcbmludGVyZmFjZSBDb250ZXh0U2NvcGVTZXR0aW5ncyB7XHJcbiAgbGlua3M6IGJvb2xlYW47XHJcbiAgZm9sZGVyOiBib29sZWFuO1xyXG4gIHRhZ3M6IGJvb2xlYW47XHJcbiAgYmFja2xpbmtzOiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgTG9jYWxBZ2VudFNldHRpbmdzIHtcbiAgbGFuZ3VhZ2U6IExhbmd1YWdlQ29kZTtcclxuICBiYWNrZW5kVXJsOiBzdHJpbmc7XHJcbiAgYXV0b1N0YXJ0QmFja2VuZDogYm9vbGVhbjtcclxuICBiYWNrZW5kUHl0aG9uUGF0aDogc3RyaW5nO1xyXG4gIGJhY2tlbmRTY3JpcHRQYXRoOiBzdHJpbmc7XHJcbiAgYmFja2VuZFdvcmtpbmdEaXI6IHN0cmluZztcclxuICBkZWZhdWx0UHJvamVjdDogc3RyaW5nO1xyXG4gIHNhdmVGb2xkZXI6IHN0cmluZztcclxuICBtYXhDb250ZXh0Tm90ZXM6IG51bWJlcjtcclxuICBzb3VyY2VPcGVuTW9kZTogXCJjdXJyZW50XCIgfCBcInNwbGl0XCIgfCBcInRhYlwiO1xyXG4gIHNwbGl0RGlyZWN0aW9uOiBcImxlZnRcIiB8IFwicmlnaHRcIiB8IFwiZG93blwiO1xuICBzY29wZXM6IENvbnRleHRTY29wZVNldHRpbmdzO1xufVxuXG5pbnRlcmZhY2UgU3RvcmVkQ29udGV4dEVudHJ5IHtcbiAgcGF0aDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgc291cmNlOiBDb250ZXh0U291cmNlO1xufVxuXG5pbnRlcmZhY2UgU3RvcmVkQ2hhdFR1cm4ge1xuICBxdWVzdGlvbjogc3RyaW5nO1xuICBhbnN3ZXI6IHN0cmluZztcbiAgYmFzaXM/OiBzdHJpbmc7XG4gIHJvdXRlPzogc3RyaW5nO1xuICBzb3VyY2VzPzogU3RyZWFtU291cmNlW107XG4gIHJlY29tbWVuZGF0aW9ucz86IFJlY29tbWVuZGF0aW9uSXRlbVtdO1xuICBhdHRhY2hlZEZpbGVQYXRoPzogc3RyaW5nO1xuICBjb250ZXh0RW50cmllcz86IFN0b3JlZENvbnRleHRFbnRyeVtdO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIENoYXRUaHJlYWRSZWNvcmQge1xuICBpZDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgdXBkYXRlZEF0OiBzdHJpbmc7XG4gIHR1cm5zOiBTdG9yZWRDaGF0VHVybltdO1xufVxuXG5pbnRlcmZhY2UgTG9jYWxBZ2VudFBsdWdpbkRhdGEge1xuICBzZXR0aW5ncz86IFBhcnRpYWw8TG9jYWxBZ2VudFNldHRpbmdzPjtcbiAgY2hhdFRocmVhZHM/OiBDaGF0VGhyZWFkUmVjb3JkW107XG4gIGFjdGl2ZUNoYXRUaHJlYWRJZD86IHN0cmluZztcbn1cblxyXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBMb2NhbEFnZW50U2V0dGluZ3MgPSB7XHJcbiAgbGFuZ3VhZ2U6IFwia29cIixcclxuICBiYWNrZW5kVXJsOiBcImh0dHA6Ly8xMjcuMC4wLjE6ODAxMVwiLFxyXG4gIGF1dG9TdGFydEJhY2tlbmQ6IGZhbHNlLFxyXG4gIGJhY2tlbmRQeXRob25QYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGJoczMzXFxcXERlc2t0b3BcXFxccHJvamVjdFxcXFwudmVudlxcXFxTY3JpcHRzXFxcXHB5dGhvbi5leGVcIixcclxuICBiYWNrZW5kU2NyaXB0UGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxiaHMzM1xcXFxEZXNrdG9wXFxcXHByb2plY3RcXFxcT2JzaWRpYW5fUkFHXFxcXGJhY2tlbmRcXFxcbWFpbi5weVwiLFxyXG4gIGJhY2tlbmRXb3JraW5nRGlyOiBcIkM6XFxcXFVzZXJzXFxcXGJoczMzXFxcXERlc2t0b3BcXFxccHJvamVjdFxcXFxPYnNpZGlhbl9SQUdcIixcclxuICBkZWZhdWx0UHJvamVjdDogXCJEZWZhdWx0XCIsXHJcbiAgc2F2ZUZvbGRlcjogXCJBSSBBbnN3ZXJzXCIsXHJcbiAgbWF4Q29udGV4dE5vdGVzOiA2LFxyXG4gIHNvdXJjZU9wZW5Nb2RlOiBcInNwbGl0XCIsXHJcbiAgc3BsaXREaXJlY3Rpb246IFwicmlnaHRcIixcclxuICBzY29wZXM6IHtcclxuICAgIGxpbmtzOiB0cnVlLFxyXG4gICAgZm9sZGVyOiBmYWxzZSxcclxuICAgIHRhZ3M6IGZhbHNlLFxyXG4gICAgYmFja2xpbmtzOiBmYWxzZSxcclxuICB9LFxyXG59O1xyXG5cclxudHlwZSBRdWlja0FjdGlvbktleSA9IFwic3VtbWFyeVwiIHwgXCJvcmdhbml6ZVwiIHwgXCJuZXh0LWFjdGlvbnNcIjtcclxudHlwZSBUcmFuc2xhdGlvblZhcnMgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXI+O1xyXG5cclxuY29uc3QgVUlfU1RSSU5HUyA9IHtcclxuICBlbjoge1xyXG4gICAgcGFuZWxUaXRsZTogXCJPYnNpZGlhbiBMb2NhbCBBZ2VudFwiLFxyXG4gICAgdmlld0Rpc3BsYXlOYW1lOiBcIkxvY2FsIEFnZW50XCIsXHJcbiAgICBzdGF0dXNJZGxlOiBcIklkbGVcIixcclxuICAgIGNvbnRleHROb05vdGVTZWxlY3RlZDogXCJObyBub3RlIHNlbGVjdGVkLlwiLFxyXG4gICAgY29udGV4dEN1cnJlbnROb3RlOiBcIkN1cnJlbnQgbm90ZToge3BhdGh9XCIsXHJcbiAgICBjb250ZXh0Q2hhdFJlYWR5OiBcIlF1ZXN0aW9uLWZpcnN0IG1vZGUuIEN1cnJlbnQgbm90ZSBpcyBvbmx5IGF0dGFjaGVkIHdoZW4gdGhlIHF1ZXN0aW9uIHJlZmVycyB0byBpdC5cIixcclxuICAgIHF1ZXN0aW9uUGxhY2Vob2xkZXI6IFwiQXNrIGEgcXVlc3Rpb24uIFRoZSBjdXJyZW50IG5vdGUgaXMgYXR0YWNoZWQgb25seSB3aGVuIHRoZSBxdWVzdGlvbiByZWZlcnMgdG8gaXQuXCIsXHJcbiAgICBidXR0b25Bc2s6IFwiQXNrXCIsXHJcbiAgICBidXR0b25CYWNrZW5kU3RhcnQ6IFwiU3RhcnQgQmFja2VuZFwiLFxyXG4gICAgYnV0dG9uQmFja2VuZFN0b3A6IFwiU3RvcCBCYWNrZW5kXCIsXHJcbiAgICBidXR0b25CYWNrZW5kUmVzdGFydDogXCJSZXN0YXJ0IEJhY2tlbmRcIixcclxuICAgIGJ1dHRvbkJhY2tlbmRDb250cm9sczogXCI6OlwiLFxyXG4gICAgYnV0dG9uT3BlbkJhY2tlbmRBcGk6IFwiQVBJIERvY3NcIixcclxuICAgIGJ1dHRvbk9wZW5CYWNrZW5kSGVhbHRoOiBcIkhlYWx0aFwiLFxyXG4gICAgYnV0dG9uUmVmcmVzaE5vdGU6IFwiUmVmcmVzaCBOb3RlXCIsXG4gICAgYnV0dG9uQ29udmVyc2F0aW9uQWN0aW9uczogXCJDb252ZXJzYXRpb24gQWN0aW9uc1wiLFxuICAgIGJ1dHRvbkNsZWFyQ29udmVyc2F0aW9uOiBcIkNsZWFyIENvbnZlcnNhdGlvblwiLFxuICAgIGJ1dHRvblJlbmFtZVRocmVhZDogXCJSZW5hbWUgVGhyZWFkXCIsXG4gICAgYnV0dG9uRGVsZXRlVGhyZWFkOiBcIkRlbGV0ZSBUaHJlYWRcIixcbiAgICBidXR0b25Vc2VTZWxlY3Rpb246IFwiVXNlIFNlbGVjdGlvblwiLFxuICAgIGJ1dHRvbkFwcGVuZFRvTm90ZTogXCJBcHBlbmQgVG8gTm90ZVwiLFxuICAgIGJ1dHRvblNhdmVOZXdOb3RlOiBcIlNhdmUgTmV3IE5vdGVcIixcbiAgICBzY29wZUxpbmtzOiBcIkxpbmtzXCIsXHJcbiAgICBzY29wZUZvbGRlcjogXCJGb2xkZXJcIixcclxuICAgIHNjb3BlVGFnczogXCJUYWdzXCIsXHJcbiAgICBzY29wZUJhY2tsaW5rczogXCJCYWNrbGlua3NcIixcclxuICAgIGNvbnRleHROb0FjdGl2ZU1hcmtkb3duTm90ZTogXCJObyBhY3RpdmUgbWFya2Rvd24gbm90ZS5cIixcclxuICAgIG5vdGljZU5vU2VsZWN0aW9uOiBcIk5vIHNlbGVjdGVkIHRleHQgZm91bmQuXCIsXHJcbiAgICBub3RpY2VFbnRlclF1ZXN0aW9uOiBcIkVudGVyIGEgcXVlc3Rpb24gZmlyc3QuXCIsXHJcbiAgICBub3RpY2VPcGVuTm90ZTogXCJPcGVuIGEgbWFya2Rvd24gbm90ZSBmaXJzdC5cIixcclxuICAgIG5vdGljZUJhY2tlbmRBbHJlYWR5UnVubmluZzogXCJCYWNrZW5kIGlzIGFscmVhZHkgcnVubmluZy5cIixcclxuICAgIG5vdGljZUJhY2tlbmRTdGFydGVkOiBcIkJhY2tlbmQgc3RhcnQgcmVxdWVzdGVkLlwiLFxyXG4gICAgbm90aWNlQmFja2VuZFN0b3BwZWQ6IFwiQmFja2VuZCBzdG9wcGVkLlwiLFxyXG4gICAgbm90aWNlQmFja2VuZFJlc3RhcnRlZDogXCJCYWNrZW5kIHJlc3RhcnRlZC5cIixcclxuICAgIG5vdGljZUJhY2tlbmRTdGFydEZhaWxlZDogXCJGYWlsZWQgdG8gc3RhcnQgYmFja2VuZDoge21lc3NhZ2V9XCIsXHJcbiAgICBub3RpY2VCYWNrZW5kU3RvcEZhaWxlZDogXCJGYWlsZWQgdG8gc3RvcCBiYWNrZW5kOiB7bWVzc2FnZX1cIixcclxuICAgIG5vdGljZUJhY2tlbmRQYXRoc01pc3Npbmc6IFwiU2V0IGJhY2tlbmQgUHl0aG9uL3NjcmlwdCBwYXRocyBmaXJzdC5cIixcclxuICAgIG5vdGljZUJhY2tlbmRVbmF2YWlsYWJsZTogXCJCYWNrZW5kIGlzIG9mZmxpbmUuIFN0YXJ0IGl0IGZyb20gdGhlIHRvb2xiYXIgb3IgY2hlY2sgdGhlIGJhY2tlbmQgc2V0dGluZ3MuXCIsXHJcbiAgICBzdGF0dXNTdHJlYW1pbmc6IFwiU3RyZWFtaW5nIGZyb20ge3VybH1cIixcclxuICAgIHN0YXR1c0RvbmU6IFwiRG9uZVwiLFxyXG4gICAgc3RhdHVzRXJyb3I6IFwiRXJyb3JcIixcclxuICAgIHN0YXR1c0JhY2tlbmRTdGFydGluZzogXCJTdGFydGluZyBiYWNrZW5kLi4uXCIsXHJcbiAgICBub3RpY2VMb2NhbEFnZW50RXJyb3I6IFwiTG9jYWwgQWdlbnQgZXJyb3I6IHttZXNzYWdlfVwiLFxyXG4gICAgc3RhdHVzQmFja2VuZEVycm9yOiBcIkJhY2tlbmQgZXJyb3I6IHtzdGF0dXN9XCIsXHJcbiAgICBzdGF0dXNCYWNrZW5kUmVhZHk6IFwiQmFja2VuZCByZWFkeToge2VuZ2luZX1cIixcclxuICAgIHN0YXR1c0JhY2tlbmRPZmZsaW5lOiBcIkJhY2tlbmQgb2ZmbGluZToge21lc3NhZ2V9XCIsXHJcbiAgICBzdGF0dXNCYWNrZW5kTWFudWFsOiBcIkJhY2tlbmQgbWFudWFsXCIsXHJcbiAgICBvdXRwdXRSZWFkeTogXCJSZWFkeS5cIixcbiAgICBvdXRwdXRHZW5lcmF0aW5nOiBcIkdlbmVyYXRpbmcuLi5cIixcbiAgICBwYW5lbFNlbnRDb250ZXh0OiBcIlNlbnQgQ29udGV4dCAoe2NvdW50fSlcIixcbiAgICBwYW5lbFJldHJpZXZlZFNvdXJjZXM6IFwiUmV0cmlldmVkIFNvdXJjZXMgKHtjb3VudH0pXCIsXG4gICAgcGFuZWxGb2xsb3dVcE5vdGVzOiBcIkZvbGxvdy11cCBOb3RlcyAoe2NvdW50fSlcIixcbiAgICB0aHJlYWROZXc6IFwiTmV3IFRocmVhZFwiLFxuICAgIHRocmVhZFVudGl0bGVkOiBcIlVudGl0bGVkXCIsXG4gICAgdGhyZWFkVHVybnM6IFwie2NvdW50fSB0dXJuc1wiLFxuICAgIHBhbmVsTm9TZW50Q29udGV4dDogXCJObyBhZGRpdGlvbmFsIGNvbnRleHQgbm90ZXMgd2VyZSBzZW50LlwiLFxuICAgIHBhbmVsTm9SZXRyaWV2ZWRTb3VyY2VzOiBcIk5vIHN0cnVjdHVyZWQgc291cmNlIGxpc3QgcmVjZWl2ZWQgeWV0LlwiLFxuICAgIHBhbmVsTm9Gb2xsb3dVcE5vdGVzOiBcIk5vIGZvbGxvdy11cCBub3RlcyB3ZXJlIHN1Z2dlc3RlZCB5ZXQuXCIsXG4gICAgZGVidWdTZWxlY3RlZEJ5OiBcInNlbGVjdGVkIGJ5XCIsXG4gICAgZGVidWdSZWFzb25QcmVmaXg6IFwid2h5XCIsXG4gICAgZGVidWdSZWxhdGlvblR5cGU6IFwicmVsYXRpb25cIixcbiAgICBzb3VyY2VDdXJyZW50OiBcImN1cnJlbnQgbm90ZVwiLFxuICAgIHNvdXJjZUN1cnJlbnRDYW5kaWRhdGU6IFwiY3VycmVudCBub3RlIGNhbmRpZGF0ZVwiLFxyXG4gICAgc291cmNlVmF1bHRTZWFyY2g6IFwidmF1bHQgc2VhcmNoXCIsXHJcbiAgICBzb3VyY2VMaW5rczogXCJsaW5rc1wiLFxyXG4gICAgc291cmNlUmVsYXRlZEZpbGVzOiBcInJlbGF0ZWQgZmlsZXNcIixcbiAgICBzb3VyY2VBdXRvUmVsYXRlZDogXCJhdXRvIHJlbGF0ZWRcIixcbiAgICBzb3VyY2VUeXBlZFJlbGF0aW9uOiBcInR5cGVkIHJlbGF0aW9uXCIsXG4gICAgc291cmNlRm9sZGVyOiBcImZvbGRlclwiLFxuICAgIHNvdXJjZVRhZ3M6IFwidGFnc1wiLFxyXG4gICAgc291cmNlQmFja2xpbmtzOiBcImJhY2tsaW5rc1wiLFxyXG4gICAgc291cmNlQ29udGV4dDogXCJjb250ZXh0XCIsXHJcbiAgICBiYXNpc0N1cnJlbnROb3RlOiBcIkN1cnJlbnQgbm90ZSBiYXNpc1wiLFxyXG4gICAgYmFzaXNPYnNpZGlhblNlYXJjaDogXCJPYnNpZGlhbiBzZWFyY2ggYmFzaXNcIixcclxuICAgIGJhc2lzR2VuZXJhbEtub3dsZWRnZTogXCJHZW5lcmFsIGtub3dsZWRnZVwiLFxyXG4gICAgYmFkZ2VSZWZlcmVuY2U6IFwicmVmZXJlbmNlXCIsXG4gICAgYmFkZ2VTY29yZTogXCJzY29yZSB7c2NvcmV9XCIsXG4gICAgYmFkZ2VDb25maWRlbmNlOiBcImNvbmZpZGVuY2Uge3Njb3JlfVwiLFxuICAgIHNvdXJjZUxheWVyU3VtbWFyeTogXCJTVU1NQVJZXCIsXHJcbiAgICBzb3VyY2VMYXllclJhdzogXCJSQVdcIixcclxuICAgIGNvbnRleHRTb3VyY2VMaW5rczogXCJMSU5LU1wiLFxyXG4gICAgY29udGV4dFNvdXJjZUZvbGRlcjogXCJGT0xERVJcIixcclxuICAgIGNvbnRleHRTb3VyY2VUYWdzOiBcIlRBR1NcIixcclxuICAgIGNvbnRleHRTb3VyY2VCYWNrbGlua3M6IFwiQkFDS0xJTktTXCIsXHJcbiAgICBub3RpY2VOb0Fuc3dlclRvU2F2ZTogXCJUaGVyZSBpcyBubyBhbnN3ZXIgdG8gc2F2ZSB5ZXQuXCIsXG4gICAgbm90aWNlU2F2ZWRBbnN3ZXI6IFwiU2F2ZWQgYW5zd2VyOiB7cGF0aH1cIixcbiAgICBub3RpY2VOb0Fuc3dlclRvQXBwZW5kOiBcIlRoZXJlIGlzIG5vIGFuc3dlciB0byBhcHBlbmQgeWV0LlwiLFxuICAgIG5vdGljZUFwcGVuZGVkQW5zd2VyOiBcIkFwcGVuZGVkIGFuc3dlciB0byB7cGF0aH1cIixcbiAgICBub3RpY2VDb252ZXJzYXRpb25DbGVhcmVkOiBcIkNsZWFyZWQgdGhlIGN1cnJlbnQgY29udmVyc2F0aW9uLlwiLFxuICAgIG5vdGljZVRocmVhZFJlbmFtZWQ6IFwiUmVuYW1lZCB0aGUgdGhyZWFkLlwiLFxuICAgIG5vdGljZVRocmVhZERlbGV0ZWQ6IFwiRGVsZXRlZCB0aGUgdGhyZWFkLlwiLFxuICAgIHByb21wdFJlbmFtZVRocmVhZDogXCJFbnRlciBhIG5ldyB0aHJlYWQgbmFtZS5cIixcbiAgICBwcm9tcHREZWxldGVUaHJlYWQ6IFwiRGVsZXRlIHRoaXMgdGhyZWFkP1wiLFxuICAgIHNhdmVkVGl0bGVOb3RlOiBcIiMgTG9jYWwgQWdlbnQgQW5zd2VyXCIsXHJcbiAgICBzYXZlZFRpdGxlQXBwZW5kOiBcIiMjIExvY2FsIEFnZW50IHtub3d9XCIsXHJcbiAgICBzYXZlZEFuc3dlckhlYWRpbmdOb3RlOiBcIiMjIEFuc3dlclwiLFxyXG4gICAgc2F2ZWRBbnN3ZXJIZWFkaW5nQXBwZW5kOiBcIiMjIyBBbnN3ZXJcIixcclxuICAgIHNhdmVkU291cmNlc0hlYWRpbmdOb3RlOiBcIiMjIFJldHJpZXZlZCBTb3VyY2VzXCIsXHJcbiAgICBzYXZlZFNvdXJjZXNIZWFkaW5nQXBwZW5kOiBcIiMjIyBSZXRyaWV2ZWQgU291cmNlc1wiLFxyXG4gICAgc2F2ZWRDb250ZXh0SGVhZGluZ05vdGU6IFwiIyMgU2VudCBDb250ZXh0XCIsXHJcbiAgICBzYXZlZENvbnRleHRIZWFkaW5nQXBwZW5kOiBcIiMjIyBTZW50IENvbnRleHRcIixcclxuICAgIHNhdmVkU291cmNlTm90ZTogXCJTb3VyY2Ugbm90ZVwiLFxyXG4gICAgc2F2ZWRRdWVzdGlvbjogXCJRdWVzdGlvblwiLFxyXG4gICAgc2F2ZWRTYXZlZEF0OiBcIlNhdmVkIGF0XCIsXHJcbiAgICBzYXZlZEVtcHR5UXVlc3Rpb246IFwiKGVtcHR5KVwiLFxyXG4gICAgc2V0dGluZ0xhbmd1YWdlTmFtZTogXCJMYW5ndWFnZVwiLFxyXG4gICAgc2V0dGluZ0xhbmd1YWdlRGVzYzogXCJVSSBsYW5ndWFnZSBhbmQgZGVmYXVsdCByZXNwb25zZSBsYW5ndWFnZS5cIixcclxuICAgIHNldHRpbmdMYW5ndWFnZUVuZ2xpc2g6IFwiRW5nbGlzaFwiLFxyXG4gICAgc2V0dGluZ0xhbmd1YWdlS29yZWFuOiBcIktvcmVhblwiLFxyXG4gICAgc2V0dGluZ0JhY2tlbmROYW1lOiBcIkJhY2tlbmQgVVJMXCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZERlc2M6IFwiRmFzdEFQSSBiYWNrZW5kIGFkZHJlc3MgdXNlZCBieSB0aGUgcGx1Z2luLlwiLFxyXG4gICAgc2V0dGluZ0F1dG9TdGFydEJhY2tlbmROYW1lOiBcIkF1dG8tc3RhcnQgYmFja2VuZFwiLFxyXG4gICAgc2V0dGluZ0F1dG9TdGFydEJhY2tlbmREZXNjOiBcIklmIHRoZSBiYWNrZW5kIGlzIG9mZmxpbmUsIHRyeSB0byBsYXVuY2ggaXQgZnJvbSB0aGlzIHBsdWdpbi5cIixcclxuICAgIHNldHRpbmdCYWNrZW5kUHl0aG9uTmFtZTogXCJCYWNrZW5kIFB5dGhvbiBwYXRoXCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZFB5dGhvbkRlc2M6IFwiUHl0aG9uIGV4ZWN1dGFibGUgdXNlZCB0byBzdGFydCB0aGUgYmFja2VuZCBmcm9tIE9ic2lkaWFuLlwiLFxyXG4gICAgc2V0dGluZ0JhY2tlbmRTY3JpcHROYW1lOiBcIkJhY2tlbmQgc2NyaXB0IHBhdGhcIixcclxuICAgIHNldHRpbmdCYWNrZW5kU2NyaXB0RGVzYzogXCJQYXRoIHRvIGJhY2tlbmQvbWFpbi5weS5cIixcclxuICAgIHNldHRpbmdCYWNrZW5kV29ya2luZ0Rpck5hbWU6IFwiQmFja2VuZCB3b3JraW5nIGRpcmVjdG9yeVwiLFxyXG4gICAgc2V0dGluZ0JhY2tlbmRXb3JraW5nRGlyRGVzYzogXCJXb3JraW5nIGRpcmVjdG9yeSB1c2VkIHdoZW4gbGF1bmNoaW5nIHRoZSBiYWNrZW5kIHByb2Nlc3MuXCIsXHJcbiAgICBzZXR0aW5nUHJvamVjdE5hbWU6IFwiRGVmYXVsdCBwcm9qZWN0XCIsXHJcbiAgICBzZXR0aW5nUHJvamVjdERlc2M6IFwiUHJvamVjdCBuYW1lIHBhc3NlZCB0byB0aGUgYmFja2VuZC5cIixcclxuICAgIHNldHRpbmdTYXZlRm9sZGVyTmFtZTogXCJTYXZlIGZvbGRlclwiLFxyXG4gICAgc2V0dGluZ1NhdmVGb2xkZXJEZXNjOiBcIlZhdWx0IGZvbGRlciB3aGVyZSBzYXZlZCBhbnN3ZXJzIGFyZSBjcmVhdGVkLlwiLFxyXG4gICAgc2V0dGluZ01heENvbnRleHROYW1lOiBcIk1heCBjb250ZXh0IG5vdGVzXCIsXHJcbiAgICBzZXR0aW5nTWF4Q29udGV4dERlc2M6IFwiVXBwZXIgYm91bmQgZm9yIGxpbmtlZCBjb250ZXh0IG5vdGVzIHNlbnQgd2l0aCBlYWNoIHF1ZXJ5LlwiLFxyXG4gICAgc2V0dGluZ09wZW5Nb2RlTmFtZTogXCJTb3VyY2Ugb3BlbiBtb2RlXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVEZXNjOiBcIkhvdyBzb3VyY2UgY2FyZHMgc2hvdWxkIG9wZW4gdmF1bHQgZmlsZXMuXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVDdXJyZW50OiBcIkN1cnJlbnQgdGFiXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVTcGxpdDogXCJTcGxpdCBwYW5lXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVUYWI6IFwiTmV3IHRhYlwiLFxyXG4gICAgc2V0dGluZ1NwbGl0RGlyZWN0aW9uTmFtZTogXCJTcGxpdCBkaXJlY3Rpb25cIixcclxuICAgIHNldHRpbmdTcGxpdERpcmVjdGlvbkRlc2M6IFwiVXNlZCB3aGVuIHNvdXJjZSBvcGVuIG1vZGUgaXMgc2V0IHRvIHNwbGl0IHBhbmUuXCIsXHJcbiAgICBzZXR0aW5nRGlyZWN0aW9uTGVmdDogXCJMZWZ0XCIsXHJcbiAgICBzZXR0aW5nRGlyZWN0aW9uUmlnaHQ6IFwiUmlnaHRcIixcclxuICAgIHNldHRpbmdEaXJlY3Rpb25Eb3duOiBcIkRvd25cIixcclxuICAgIGNvbW1hbmRPcGVuOiBcIk9wZW4gTG9jYWwgQWdlbnRcIixcclxuICAgIGNvbW1hbmRBc2tTZWxlY3Rpb246IFwiQXNrIFNlbGVjdGlvbiBXaXRoIExvY2FsIEFnZW50XCIsXHJcbiAgICBjb21tYW5kU3VtbWFyaXplOiBcIlN1bW1hcml6ZSBDdXJyZW50IE5vdGUgV2l0aCBMb2NhbCBBZ2VudFwiLFxuICAgIGNvbW1hbmRPcmdhbml6ZTogXCJPcmdhbml6ZSBDdXJyZW50IE5vdGUgV2l0aCBMb2NhbCBBZ2VudFwiLFxuICAgIGNvbW1hbmROZXh0QWN0aW9uczogXCJFeHRyYWN0IE5leHQgQWN0aW9ucyBXaXRoIExvY2FsIEFnZW50XCIsXG4gICAgcmVsYXRpb25TYW1lVG9waWM6IFwic2FtZSB0b3BpY1wiLFxuICAgIHJlbGF0aW9uUmVmZXJlbmNlczogXCJyZWZlcmVuY2VzXCIsXG4gICAgcmVsYXRpb25TdW1tYXJpemVzOiBcInN1bW1hcml6ZXNcIixcbiAgICByZWxhdGlvbkV4cGFuZHM6IFwiZXhwYW5kc1wiLFxuICAgIHJlbGF0aW9uSW1wbGVtZW50czogXCJpbXBsZW1lbnRzXCIsXG4gICAgcmVsYXRpb25SZXZpZXdPZjogXCJyZXZpZXcgb2ZcIixcbiAgICByZWxhdGlvbk5leHRBY3Rpb25Gb3I6IFwibmV4dCBhY3Rpb25cIixcbiAgICByZWxhdGlvbkRlY2lzaW9uRm9yOiBcImRlY2lzaW9uIGZvclwiLFxuICAgIHJlbGF0aW9uRm9sbG93VXA6IFwiZm9sbG93LXVwXCJcbiAgfSxcbiAga286IHtcbiAgICBwYW5lbFRpdGxlOiBcIlxcdUM2MzVcXHVDMkRDXFx1QjUxNFxcdUM1QjggXFx1Qjg1Q1xcdUNFRUMgXFx1QzVEMFxcdUM3NzRcXHVDODA0XFx1RDJCOFwiLFxyXG4gICAgdmlld0Rpc3BsYXlOYW1lOiBcIlxcdUI4NUNcXHVDRUVDIFxcdUM1RDBcXHVDNzc0XFx1QzgwNFxcdUQyQjhcIixcclxuICAgIHN0YXR1c0lkbGU6IFwiXFx1QjMwMFxcdUFFMzAgXFx1QzkxMVwiLFxyXG4gICAgY29udGV4dE5vTm90ZVNlbGVjdGVkOiBcIlxcdUMxMjBcXHVEMEREXFx1QjQxQyBcXHVCMTc4XFx1RDJCOFxcdUFDMDAgXFx1QzVDNlxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGNvbnRleHRDdXJyZW50Tm90ZTogXCJcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCODoge3BhdGh9XCIsXHJcbiAgICBjb250ZXh0Q2hhdFJlYWR5OiBcIlxcdUM5QzhcXHVCQjM4IFxcdUM5MTFcXHVDMkVDIFxcdUJBQThcXHVCNERDXFx1Qzc4NVxcdUIyQzhcXHVCMkU0LiBcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOFxcdUIyOTQgXFx1QzlDOFxcdUJCMzhcXHVDNzc0IFxcdUFERjggXFx1QjE3OFxcdUQyQjhcXHVCOTdDIFxcdUNDMzhcXHVDODcwXFx1RDU2MCBcXHVCNTRDXFx1QjlDQyBcXHVENTY4XFx1QUVEOCBcXHVDODA0XFx1QjJFQ1xcdUI0MjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHF1ZXN0aW9uUGxhY2Vob2xkZXI6IFwiXFx1QzlDOFxcdUJCMzhcXHVDNzQ0IFxcdUM3ODVcXHVCODI1XFx1RDU1OFxcdUMxMzhcXHVDNjk0LiBcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOFxcdUIyOTQgXFx1QzlDOFxcdUJCMzhcXHVDNzc0IFxcdUFERjggXFx1QjE3OFxcdUQyQjhcXHVCOTdDIFxcdUNDMzhcXHVDODcwXFx1RDU2MCBcXHVCNTRDXFx1QjlDQyBcXHVENTY4XFx1QUVEOCBcXHVDODA0XFx1QjJFQ1xcdUI0MjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGJ1dHRvbkFzazogXCJcXHVDOUM4XFx1QkIzOFxcdUQ1NThcXHVBRTMwXCIsXHJcbiAgICBidXR0b25CYWNrZW5kU3RhcnQ6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFxcdUMyRENcXHVDNzkxXCIsXHJcbiAgICBidXR0b25CYWNrZW5kU3RvcDogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1QzkxMVxcdUM5QzBcIixcclxuICAgIGJ1dHRvbkJhY2tlbmRSZXN0YXJ0OiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDN0FDXFx1QzJEQ1xcdUM3OTFcIixcclxuICAgIGJ1dHRvbkJhY2tlbmRDb250cm9sczogXCI6OlwiLFxyXG4gICAgYnV0dG9uT3BlbkJhY2tlbmRBcGk6IFwiQVBJIFxcdUJCMzhcXHVDMTFDXCIsXHJcbiAgICBidXR0b25PcGVuQmFja2VuZEhlYWx0aDogXCJcXHVENUVDXFx1QzJBNFwiLFxyXG4gICAgYnV0dG9uUmVmcmVzaE5vdGU6IFwiXFx1QjE3OFxcdUQyQjggXFx1QzBDOFxcdUI4NUNcXHVBQ0UwXFx1Q0U2OFwiLFxuICAgIGJ1dHRvbkNvbnZlcnNhdGlvbkFjdGlvbnM6IFwiXFx1QjMwMFxcdUQ2NTQgXFx1Qzc5MVxcdUM1QzVcIixcbiAgICBidXR0b25DbGVhckNvbnZlcnNhdGlvbjogXCJcXHVENjA0XFx1QzdBQyBcXHVCMzAwXFx1RDY1NCBcXHVDNUM2XFx1QzU2MFxcdUFFMzBcIixcbiAgICBidXR0b25SZW5hbWVUaHJlYWQ6IFwiXFx1QzJBNFxcdUI4MDhcXHVCNERDIFxcdUM3NzRcXHVCOTg0IFxcdUJDQzBcXHVBQ0JEXCIsXG4gICAgYnV0dG9uRGVsZXRlVGhyZWFkOiBcIlxcdUMyQTRcXHVCODA4XFx1QjREQyBcXHVDMEFEXFx1QzgxQ1wiLFxuICAgIGJ1dHRvblVzZVNlbGVjdGlvbjogXCJcXHVDMTIwXFx1RDBERCBcXHVDNjAxXFx1QzVFRCBcXHVDMEFDXFx1QzZBOVwiLFxuICAgIGJ1dHRvbkFwcGVuZFRvTm90ZTogXCJcXHVCMTc4XFx1RDJCOFxcdUM1RDAgXFx1Qzc3NFxcdUM1QjRcXHVCRDk5XFx1Qzc3NFxcdUFFMzBcIixcbiAgICBidXR0b25TYXZlTmV3Tm90ZTogXCJcXHVDMEM4IFxcdUIxNzhcXHVEMkI4XFx1Qjg1QyBcXHVDODAwXFx1QzdBNVwiLFxuICAgIHNjb3BlTGlua3M6IFwiXFx1QjlDMVxcdUQwNkNcIixcclxuICAgIHNjb3BlRm9sZGVyOiBcIlxcdUQzRjRcXHVCMzU0XCIsXHJcbiAgICBzY29wZVRhZ3M6IFwiXFx1RDBEQ1xcdUFERjhcIixcclxuICAgIHNjb3BlQmFja2xpbmtzOiBcIlxcdUJDMzFcXHVCOUMxXFx1RDA2Q1wiLFxyXG4gICAgY29udGV4dE5vQWN0aXZlTWFya2Rvd25Ob3RlOiBcIlxcdUQ2NUNcXHVDMTMxXFx1RDY1NFxcdUI0MUMgXFx1QjlDOFxcdUQwNkNcXHVCMkU0XFx1QzZCNCBcXHVCMTc4XFx1RDJCOFxcdUFDMDAgXFx1QzVDNlxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIG5vdGljZU5vU2VsZWN0aW9uOiBcIlxcdUMxMjBcXHVEMEREXFx1RDU1QyBcXHVEMTREXFx1QzJBNFxcdUQyQjhcXHVBQzAwIFxcdUM1QzZcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBub3RpY2VFbnRlclF1ZXN0aW9uOiBcIlxcdUJBM0NcXHVDODAwIFxcdUM5QzhcXHVCQjM4XFx1Qzc0NCBcXHVDNzg1XFx1QjgyNVxcdUQ1NThcXHVDMTM4XFx1QzY5NC5cIixcclxuICAgIG5vdGljZU9wZW5Ob3RlOiBcIlxcdUJBM0NcXHVDODAwIFxcdUI5QzhcXHVEMDZDXFx1QjJFNFxcdUM2QjQgXFx1QjE3OFxcdUQyQjhcXHVCOTdDIFxcdUM1RUNcXHVDMTM4XFx1QzY5NC5cIixcclxuICAgIG5vdGljZUJhY2tlbmRBbHJlYWR5UnVubmluZzogXCJcXHVCQzMxXFx1QzVENFxcdUI0RENcXHVBQzAwIFxcdUM3NzRcXHVCQkY4IFxcdUMyRTRcXHVENTg5IFxcdUM5MTFcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBub3RpY2VCYWNrZW5kU3RhcnRlZDogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1QzJEQ1xcdUM3OTFcXHVDNzQ0IFxcdUM2OTRcXHVDQ0FEXFx1RDU4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIG5vdGljZUJhY2tlbmRTdG9wcGVkOiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQ1xcdUI5N0MgXFx1QzkxMVxcdUM5QzBcXHVENTg4XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgbm90aWNlQmFja2VuZFJlc3RhcnRlZDogXCJcXHVCQzMxXFx1QzVENFxcdUI0RENcXHVCOTdDIFxcdUM3QUNcXHVDMkRDXFx1Qzc5MVxcdUQ1ODhcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBub3RpY2VCYWNrZW5kU3RhcnRGYWlsZWQ6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFxcdUMyRENcXHVDNzkxIFxcdUMyRTRcXHVEMzI4OiB7bWVzc2FnZX1cIixcclxuICAgIG5vdGljZUJhY2tlbmRTdG9wRmFpbGVkOiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDOTExXFx1QzlDMCBcXHVDMkU0XFx1RDMyODoge21lc3NhZ2V9XCIsXHJcbiAgICBub3RpY2VCYWNrZW5kUGF0aHNNaXNzaW5nOiBcIlxcdUJBM0NcXHVDODAwIFxcdUJDMzFcXHVDNUQ0XFx1QjREQyBQeXRob24vXFx1QzJBNFxcdUQwNkNcXHVCOUJEXFx1RDJCOCBcXHVBQ0JEXFx1Qjg1Q1xcdUI5N0MgXFx1QzEyNFxcdUM4MTVcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBub3RpY2VCYWNrZW5kVW5hdmFpbGFibGU6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDXFx1QUMwMCBcXHVDNjI0XFx1RDUwNFxcdUI3N0NcXHVDNzc4IFxcdUMwQzFcXHVEMERDXFx1Qzc4NVxcdUIyQzhcXHVCMkU0LiBcXHVDMEMxXFx1QjJFOCBcXHVEMjM0XFx1QkMxNFxcdUM1RDBcXHVDMTFDIFxcdUMyRENcXHVDNzkxXFx1RDU1OFxcdUFDNzBcXHVCMDk4IFxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDMTI0XFx1QzgxNVxcdUM3NDQgXFx1RDY1NVxcdUM3NzhcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBzdGF0dXNTdHJlYW1pbmc6IFwie3VybH0gXFx1QzVEMFxcdUMxMUMgXFx1Qzc1MVxcdUIyRjVcXHVDNzQ0IFxcdUFDMDBcXHVDODM4XFx1QzYyNFxcdUIyOTQgXFx1QzkxMVwiLFxyXG4gICAgc3RhdHVzRG9uZTogXCJcXHVDNjQ0XFx1QjhDQ1wiLFxyXG4gICAgc3RhdHVzRXJyb3I6IFwiXFx1QzYyNFxcdUI5NThcIixcclxuICAgIHN0YXR1c0JhY2tlbmRTdGFydGluZzogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1QzJEQ1xcdUM3OTEgXFx1QzkxMS4uLlwiLFxyXG4gICAgbm90aWNlTG9jYWxBZ2VudEVycm9yOiBcIlxcdUI4NUNcXHVDRUVDIFxcdUM1RDBcXHVDNzc0XFx1QzgwNFxcdUQyQjggXFx1QzYyNFxcdUI5NTg6IHttZXNzYWdlfVwiLFxyXG4gICAgc3RhdHVzQmFja2VuZEVycm9yOiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDNjI0XFx1Qjk1ODoge3N0YXR1c31cIixcclxuICAgIHN0YXR1c0JhY2tlbmRSZWFkeTogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1QzVGMFxcdUFDQjBcXHVCNDI4OiB7ZW5naW5lfVwiLFxyXG4gICAgc3RhdHVzQmFja2VuZE9mZmxpbmU6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFxcdUM1RjBcXHVBQ0IwIFxcdUMyRTRcXHVEMzI4OiB7bWVzc2FnZX1cIixcclxuICAgIHN0YXR1c0JhY2tlbmRNYW51YWw6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFxcdUMyMThcXHVCM0Q5XCIsXHJcbiAgICBvdXRwdXRSZWFkeTogXCJcXHVDOTAwXFx1QkU0NFxcdUI0MThcXHVDNUM4XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxuICAgIG91dHB1dEdlbmVyYXRpbmc6IFwiXFx1Qzc1MVxcdUIyRjUgXFx1QzBERFxcdUMxMzEgXFx1QzkxMS4uLlwiLFxuICAgIHBhbmVsU2VudENvbnRleHQ6IFwiXFx1QzgwNFxcdUIyRUNcXHVENTVDIFxcdUNFRThcXHVEMTREXFx1QzJBNFxcdUQyQjggKHtjb3VudH0pXCIsXG4gICAgcGFuZWxSZXRyaWV2ZWRTb3VyY2VzOiBcIlxcdUFDODBcXHVDMEM5XFx1QjQxQyBcXHVDMThDXFx1QzJBNCAoe2NvdW50fSlcIixcbiAgICBwYW5lbEZvbGxvd1VwTm90ZXM6IFwiXFx1Qzc3NFxcdUM1QjRcXHVCQ0ZDIFxcdUIxNzhcXHVEMkI4ICh7Y291bnR9KVwiLFxuICAgIHRocmVhZE5ldzogXCJcXHVDMEM4IFxcdUMyQTRcXHVCODA4XFx1QjREQ1wiLFxuICAgIHRocmVhZFVudGl0bGVkOiBcIlxcdUMwQzggXFx1QjMwMFxcdUQ2NTRcIixcbiAgICB0aHJlYWRUdXJuczogXCJcXHVCQjM4XFx1QjJGNSB7Y291bnR9XCIsXG4gICAgcGFuZWxOb1NlbnRDb250ZXh0OiBcIlxcdUNEOTRcXHVBQzAwXFx1Qjg1QyBcXHVDODA0XFx1QjJFQ1xcdUI0MUMgXFx1Q0VFOFxcdUQxNERcXHVDMkE0XFx1RDJCOCBcXHVCMTc4XFx1RDJCOFxcdUFDMDAgXFx1QzVDNlxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcbiAgICBwYW5lbE5vUmV0cmlldmVkU291cmNlczogXCJcXHVBRDZDXFx1Qzg3MFxcdUQ2NTRcXHVCNDFDIFxcdUMxOENcXHVDMkE0IFxcdUJBQTlcXHVCODVEXFx1Qzc3NCBcXHVDNTQ0XFx1QzlDMSBcXHVDNUM2XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxuICAgIHBhbmVsTm9Gb2xsb3dVcE5vdGVzOiBcIlxcdUM1NDRcXHVDOUMxIFxcdUM4MUNcXHVDNTQ4XFx1QjQxQyBcXHVDNzc0XFx1QzVCNFxcdUJDRkMgXFx1QjE3OFxcdUQyQjhcXHVBQzAwIFxcdUM1QzZcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXG4gICAgZGVidWdTZWxlY3RlZEJ5OiBcIlxcdUMxMjBcXHVDODE1IFxcdUFDQkRcXHVCODVDXCIsXG4gICAgZGVidWdSZWFzb25QcmVmaXg6IFwiXFx1QzEyMFxcdUM4MTUgXFx1Qzc3NFxcdUM3MjBcIixcbiAgICBkZWJ1Z1JlbGF0aW9uVHlwZTogXCJcXHVBRDAwXFx1QUNDNFwiLFxuICAgIHNvdXJjZUN1cnJlbnQ6IFwiXFx1RDYwNFxcdUM3QUMgXFx1QjE3OFxcdUQyQjhcIixcclxuICAgIHNvdXJjZUN1cnJlbnRDYW5kaWRhdGU6IFwiXFx1RDYwNFxcdUM3QUMgXFx1QjE3OFxcdUQyQjggXFx1RDZDNFxcdUJDRjRcIixcclxuICAgIHNvdXJjZVZhdWx0U2VhcmNoOiBcInZhdWx0IFxcdUFDODBcXHVDMEM5XCIsXHJcbiAgICBzb3VyY2VMaW5rczogXCJcXHVCOUMxXFx1RDA2Q1wiLFxyXG4gICAgc291cmNlUmVsYXRlZEZpbGVzOiBcInJlbGF0ZWQgXFx1RDMwQ1xcdUM3N0NcIixcbiAgICBzb3VyY2VBdXRvUmVsYXRlZDogXCJcXHVDNzkwXFx1QjNEOSBcXHVDNUYwXFx1QUNCMFwiLFxuICAgIHNvdXJjZVR5cGVkUmVsYXRpb246IFwiXFx1QUQwMFxcdUFDQzQgXFx1RDY1NVxcdUM3QTVcIixcbiAgICBzb3VyY2VGb2xkZXI6IFwiXFx1RDNGNFxcdUIzNTRcIixcbiAgICBzb3VyY2VUYWdzOiBcIlxcdUQwRENcXHVBREY4XCIsXHJcbiAgICBzb3VyY2VCYWNrbGlua3M6IFwiXFx1QkMzMVxcdUI5QzFcXHVEMDZDXCIsXHJcbiAgICBzb3VyY2VDb250ZXh0OiBcIlxcdUNFRThcXHVEMTREXFx1QzJBNFxcdUQyQjhcIixcclxuICAgIGJhc2lzQ3VycmVudE5vdGU6IFwiXFx1RDYwNFxcdUM3QUMgXFx1QjE3OFxcdUQyQjggXFx1QUUzMFxcdUJDMThcIixcclxuICAgIGJhc2lzT2JzaWRpYW5TZWFyY2g6IFwiT2JzaWRpYW4gXFx1QUM4MFxcdUMwQzkgXFx1QUUzMFxcdUJDMThcIixcclxuICAgIGJhc2lzR2VuZXJhbEtub3dsZWRnZTogXCJcXHVDNzdDXFx1QkMxOCBcXHVDOUMwXFx1QzJERCBcXHVBRTMwXFx1QkMxOFwiLFxyXG4gICAgYmFkZ2VSZWZlcmVuY2U6IFwiXFx1Q0MzOFxcdUM4NzBcIixcbiAgICBiYWRnZVNjb3JlOiBcIlxcdUM4MTBcXHVDMjE4IHtzY29yZX1cIixcbiAgICBiYWRnZUNvbmZpZGVuY2U6IFwiXFx1QzJFMFxcdUI4QjBcXHVCM0M0IHtzY29yZX1cIixcbiAgICBzb3VyY2VMYXllclN1bW1hcnk6IFwiXFx1QzY5NFxcdUM1N0RcIixcclxuICAgIHNvdXJjZUxheWVyUmF3OiBcIlxcdUM2RDBcXHVCQjM4XCIsXHJcbiAgICBjb250ZXh0U291cmNlTGlua3M6IFwiXFx1QjlDMVxcdUQwNkNcIixcclxuICAgIGNvbnRleHRTb3VyY2VGb2xkZXI6IFwiXFx1RDNGNFxcdUIzNTRcIixcclxuICAgIGNvbnRleHRTb3VyY2VUYWdzOiBcIlxcdUQwRENcXHVBREY4XCIsXHJcbiAgICBjb250ZXh0U291cmNlQmFja2xpbmtzOiBcIlxcdUJDMzFcXHVCOUMxXFx1RDA2Q1wiLFxyXG4gICAgbm90aWNlTm9BbnN3ZXJUb1NhdmU6IFwiXFx1QzgwMFxcdUM3QTVcXHVENTYwIFxcdUIyRjVcXHVCQ0MwXFx1Qzc3NCBcXHVDNTQ0XFx1QzlDMSBcXHVDNUM2XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxuICAgIG5vdGljZVNhdmVkQW5zd2VyOiBcIlxcdUIyRjVcXHVCQ0MwXFx1Qzc0NCBcXHVDODAwXFx1QzdBNVxcdUQ1ODhcXHVDMkI1XFx1QjJDOFxcdUIyRTQ6IHtwYXRofVwiLFxuICAgIG5vdGljZU5vQW5zd2VyVG9BcHBlbmQ6IFwiXFx1Qzc3NFxcdUM1QjRcXHVCRDk5XFx1Qzc3QyBcXHVCMkY1XFx1QkNDMFxcdUM3NzQgXFx1QzU0NFxcdUM5QzEgXFx1QzVDNlxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcbiAgICBub3RpY2VBcHBlbmRlZEFuc3dlcjogXCJ7cGF0aH0gXFx1QjE3OFxcdUQyQjggXFx1RDU1OFxcdUIyRThcXHVDNUQwIFxcdUIyRjVcXHVCQ0MwXFx1Qzc0NCBcXHVDRDk0XFx1QUMwMFxcdUQ1ODhcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXG4gICAgbm90aWNlQ29udmVyc2F0aW9uQ2xlYXJlZDogXCJcXHVENjA0XFx1QzdBQyBcXHVCMzAwXFx1RDY1NFxcdUI5N0MgXFx1QkU0NFxcdUM2RTBcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXG4gICAgbm90aWNlVGhyZWFkUmVuYW1lZDogXCJcXHVDMkE0XFx1QjgwOFxcdUI0REMgXFx1Qzc3NFxcdUI5ODRcXHVDNzQ0IFxcdUJDQzBcXHVBQ0JEXFx1RDU4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcbiAgICBub3RpY2VUaHJlYWREZWxldGVkOiBcIlxcdUMyQTRcXHVCODA4XFx1QjREQ1xcdUI5N0MgXFx1QzBBRFxcdUM4MUNcXHVENTg4XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxuICAgIHByb21wdFJlbmFtZVRocmVhZDogXCJcXHVDMEM4IFxcdUMyQTRcXHVCODA4XFx1QjREQyBcXHVDNzc0XFx1Qjk4NFxcdUM3NDQgXFx1Qzc4NVxcdUI4MjVcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXG4gICAgcHJvbXB0RGVsZXRlVGhyZWFkOiBcIlxcdUM3NzQgXFx1QzJBNFxcdUI4MDhcXHVCNERDXFx1Qjk3QyBcXHVDMEFEXFx1QzgxQ1xcdUQ1NjBcXHVBRTRDXFx1QzY5ND9cIixcbiAgICBzYXZlZFRpdGxlTm90ZTogXCIjIFxcdUI4NUNcXHVDRUVDIFxcdUM1RDBcXHVDNzc0XFx1QzgwNFxcdUQyQjggXFx1QjJGNVxcdUJDQzBcIixcclxuICAgIHNhdmVkVGl0bGVBcHBlbmQ6IFwiIyMgXFx1Qjg1Q1xcdUNFRUMgXFx1QzVEMFxcdUM3NzRcXHVDODA0XFx1RDJCOCB7bm93fVwiLFxyXG4gICAgc2F2ZWRBbnN3ZXJIZWFkaW5nTm90ZTogXCIjIyBcXHVCMkY1XFx1QkNDMFwiLFxyXG4gICAgc2F2ZWRBbnN3ZXJIZWFkaW5nQXBwZW5kOiBcIiMjIyBcXHVCMkY1XFx1QkNDMFwiLFxyXG4gICAgc2F2ZWRTb3VyY2VzSGVhZGluZ05vdGU6IFwiIyMgXFx1QUM4MFxcdUMwQzlcXHVCNDFDIFxcdUMxOENcXHVDMkE0XCIsXHJcbiAgICBzYXZlZFNvdXJjZXNIZWFkaW5nQXBwZW5kOiBcIiMjIyBcXHVBQzgwXFx1QzBDOVxcdUI0MUMgXFx1QzE4Q1xcdUMyQTRcIixcclxuICAgIHNhdmVkQ29udGV4dEhlYWRpbmdOb3RlOiBcIiMjIFxcdUM4MDRcXHVCMkVDXFx1RDU1QyBcXHVDRUU4XFx1RDE0RFxcdUMyQTRcXHVEMkI4XCIsXHJcbiAgICBzYXZlZENvbnRleHRIZWFkaW5nQXBwZW5kOiBcIiMjIyBcXHVDODA0XFx1QjJFQ1xcdUQ1NUMgXFx1Q0VFOFxcdUQxNERcXHVDMkE0XFx1RDJCOFwiLFxyXG4gICAgc2F2ZWRTb3VyY2VOb3RlOiBcIlxcdUM2RDBcXHVCQ0Y4IFxcdUIxNzhcXHVEMkI4XCIsXHJcbiAgICBzYXZlZFF1ZXN0aW9uOiBcIlxcdUM5QzhcXHVCQjM4XCIsXHJcbiAgICBzYXZlZFNhdmVkQXQ6IFwiXFx1QzgwMFxcdUM3QTUgXFx1QzJEQ1xcdUFDMDFcIixcclxuICAgIHNhdmVkRW1wdHlRdWVzdGlvbjogXCIoXFx1QzVDNlxcdUM3NEMpXCIsXHJcbiAgICBzZXR0aW5nTGFuZ3VhZ2VOYW1lOiBcIlxcdUM1QjhcXHVDNUI0XCIsXHJcbiAgICBzZXR0aW5nTGFuZ3VhZ2VEZXNjOiBcIlVJIFxcdUM1QjhcXHVDNUI0XFx1QzY0MCBcXHVBRTMwXFx1QkNGOCBcXHVDNzUxXFx1QjJGNSBcXHVDNUI4XFx1QzVCNFxcdUI5N0MgXFx1QzEyNFxcdUM4MTVcXHVENTY5XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nTGFuZ3VhZ2VFbmdsaXNoOiBcIlxcdUM2MDFcXHVDNUI0XCIsXHJcbiAgICBzZXR0aW5nTGFuZ3VhZ2VLb3JlYW46IFwiXFx1RDU1Q1xcdUFENkRcXHVDNUI0XCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZE5hbWU6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFVSTFwiLFxyXG4gICAgc2V0dGluZ0JhY2tlbmREZXNjOiBcIlxcdUQ1MENcXHVCN0VDXFx1QURGOFxcdUM3NzhcXHVDNzc0IFxcdUMwQUNcXHVDNkE5XFx1RDU2MCBGYXN0QVBJIFxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDOEZDXFx1QzE4Q1xcdUM3ODVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHNldHRpbmdBdXRvU3RhcnRCYWNrZW5kTmFtZTogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1Qzc5MFxcdUIzRDkgXFx1QzJEQ1xcdUM3OTFcIixcclxuICAgIHNldHRpbmdBdXRvU3RhcnRCYWNrZW5kRGVzYzogXCJcXHVCQzMxXFx1QzVENFxcdUI0RENcXHVBQzAwIFxcdUFFQkNcXHVDODM4IFxcdUM3ODhcXHVDNzNDXFx1QkE3NCBcXHVDNzc0IFxcdUQ1MENcXHVCN0VDXFx1QURGOFxcdUM3NzhcXHVDNUQwXFx1QzExQyBcXHVDNzkwXFx1QjNEOVxcdUM3M0NcXHVCODVDIFxcdUMyRTRcXHVENTg5XFx1Qzc0NCBcXHVDMkRDXFx1QjNDNFxcdUQ1NjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHNldHRpbmdCYWNrZW5kUHl0aG9uTmFtZTogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgUHl0aG9uIFxcdUFDQkRcXHVCODVDXCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZFB5dGhvbkRlc2M6IFwiT2JzaWRpYW5cXHVDNUQwXFx1QzExQyBcXHVCQzMxXFx1QzVENFxcdUI0RENcXHVCOTdDIFxcdUMyRTRcXHVENTg5XFx1RDU2MCBQeXRob24gXFx1QzJFNFxcdUQ1ODkgXFx1RDMwQ1xcdUM3N0MgXFx1QUNCRFxcdUI4NUNcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZFNjcmlwdE5hbWU6IFwiXFx1QkMzMVxcdUM1RDRcXHVCNERDIFxcdUMyQTRcXHVEMDZDXFx1QjlCRFxcdUQyQjggXFx1QUNCRFxcdUI4NUNcIixcclxuICAgIHNldHRpbmdCYWNrZW5kU2NyaXB0RGVzYzogXCJiYWNrZW5kL21haW4ucHkgXFx1QUNCRFxcdUI4NUNcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nQmFja2VuZFdvcmtpbmdEaXJOYW1lOiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQyBcXHVDNzkxXFx1QzVDNSBcXHVEM0Y0XFx1QjM1NFwiLFxyXG4gICAgc2V0dGluZ0JhY2tlbmRXb3JraW5nRGlyRGVzYzogXCJcXHVCQzMxXFx1QzVENFxcdUI0REMgXFx1RDUwNFxcdUI4NUNcXHVDMTM4XFx1QzJBNCBcXHVDMkU0XFx1RDU4OSBcXHVDMkRDIFxcdUMwQUNcXHVDNkE5XFx1RDU2MCB3b3JraW5nIGRpcmVjdG9yeSBcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nUHJvamVjdE5hbWU6IFwiXFx1QUUzMFxcdUJDRjggXFx1RDUwNFxcdUI4NUNcXHVDODFEXFx1RDJCOFwiLFxyXG4gICAgc2V0dGluZ1Byb2plY3REZXNjOiBcIlxcdUJDMzFcXHVDNUQ0XFx1QjREQ1xcdUI4NUMgXFx1QzgwNFxcdUIyRUNcXHVENTYwIFxcdUQ1MDRcXHVCODVDXFx1QzgxRFxcdUQyQjggXFx1Qzc3NFxcdUI5ODRcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nU2F2ZUZvbGRlck5hbWU6IFwiXFx1QzgwMFxcdUM3QTUgXFx1RDNGNFxcdUIzNTRcIixcclxuICAgIHNldHRpbmdTYXZlRm9sZGVyRGVzYzogXCJcXHVCMkY1XFx1QkNDMFxcdUM3NDQgXFx1QzgwMFxcdUM3QTVcXHVENTYwIHZhdWx0IFxcdUQzRjRcXHVCMzU0XFx1Qzc4NVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgc2V0dGluZ01heENvbnRleHROYW1lOiBcIlxcdUNENUNcXHVCMzAwIFxcdUNFRThcXHVEMTREXFx1QzJBNFxcdUQyQjggXFx1QjE3OFxcdUQyQjggXFx1QzIxOFwiLFxyXG4gICAgc2V0dGluZ01heENvbnRleHREZXNjOiBcIlxcdUM5QzhcXHVCQjM4XFx1QjlDOFxcdUIyRTQgXFx1RDU2OFxcdUFFRDggXFx1QkNGNFxcdUIwQkMgXFx1QzVGMFxcdUFDQjAgXFx1QjE3OFxcdUQyQjggXFx1QzIxOFxcdUM3NTggXFx1QzBDMVxcdUQ1NUNcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVOYW1lOiBcIlxcdUMxOENcXHVDMkE0IFxcdUM1RjRcXHVBRTMwIFxcdUJDMjlcXHVDMkREXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVEZXNjOiBcIlxcdUMxOENcXHVDMkE0IFxcdUNFNzRcXHVCNERDXFx1Qjk3QyBcXHVCMjBDXFx1QjgwMFxcdUM3NDQgXFx1QjU0QyBcXHVEMzBDXFx1Qzc3Q1xcdUM3NDQgXFx1QzVFQ1xcdUIyOTQgXFx1QkMyOVxcdUMyRERcXHVDNzg1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nT3Blbk1vZGVDdXJyZW50OiBcIlxcdUQ2MDRcXHVDN0FDIFxcdUQwRURcIixcclxuICAgIHNldHRpbmdPcGVuTW9kZVNwbGl0OiBcIlxcdUJEODRcXHVENTYwIFxcdUNDM0RcIixcclxuICAgIHNldHRpbmdPcGVuTW9kZVRhYjogXCJcXHVDMEM4IFxcdUQwRURcIixcclxuICAgIHNldHRpbmdTcGxpdERpcmVjdGlvbk5hbWU6IFwiXFx1QkQ4NFxcdUQ1NjAgXFx1QkMyOVxcdUQ1QTVcIixcclxuICAgIHNldHRpbmdTcGxpdERpcmVjdGlvbkRlc2M6IFwiXFx1QzE4Q1xcdUMyQTQgXFx1QzVGNFxcdUFFMzAgXFx1QkMyOVxcdUMyRERcXHVDNzc0IFxcdUJEODRcXHVENTYwIFxcdUNDM0RcXHVDNzdDIFxcdUI1NEMgXFx1QzBBQ1xcdUM2QTlcXHVENTY5XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBzZXR0aW5nRGlyZWN0aW9uTGVmdDogXCJcXHVDNjdDXFx1Q0FCRFwiLFxyXG4gICAgc2V0dGluZ0RpcmVjdGlvblJpZ2h0OiBcIlxcdUM2MjRcXHVCOTc4XFx1Q0FCRFwiLFxyXG4gICAgc2V0dGluZ0RpcmVjdGlvbkRvd246IFwiXFx1QzU0NFxcdUI3OThcIixcclxuICAgIGNvbW1hbmRPcGVuOiBcIlxcdUI4NUNcXHVDRUVDIFxcdUM1RDBcXHVDNzc0XFx1QzgwNFxcdUQyQjggXFx1QzVGNFxcdUFFMzBcIixcbiAgICBjb21tYW5kQXNrU2VsZWN0aW9uOiBcIlxcdUMxMjBcXHVEMEREIFxcdUM2MDFcXHVDNUVEXFx1QzczQ1xcdUI4NUMgXFx1Qjg1Q1xcdUNFRUMgXFx1QzVEMFxcdUM3NzRcXHVDODA0XFx1RDJCOCBcXHVDOUM4XFx1QkIzOFwiLFxuICAgIGNvbW1hbmRTdW1tYXJpemU6IFwiXFx1RDYwNFxcdUM3QUMgXFx1QjE3OFxcdUQyQjggXFx1QzY5NFxcdUM1N0RcXHVENTU4XFx1QUUzMFwiLFxuICAgIGNvbW1hbmRPcmdhbml6ZTogXCJcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOCBcXHVBRDZDXFx1Qzg3MFxcdUQ2NTRcXHVENTU4XFx1QUUzMFwiLFxuICAgIGNvbW1hbmROZXh0QWN0aW9uczogXCJcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOFxcdUM1RDBcXHVDMTFDIFxcdUIyRTRcXHVDNzRDIFxcdUM1NjFcXHVDMTU4IFxcdUNEOTRcXHVDRDlDXFx1RDU1OFxcdUFFMzBcIixcbiAgICByZWxhdGlvblNhbWVUb3BpYzogXCJcXHVBQzE5XFx1Qzc0MCBcXHVDOEZDXFx1QzgxQ1wiLFxuICAgIHJlbGF0aW9uUmVmZXJlbmNlczogXCJcXHVDQzM4XFx1QUNFMFwiLFxuICAgIHJlbGF0aW9uU3VtbWFyaXplczogXCJcXHVDNjk0XFx1QzU3RFwiLFxuICAgIHJlbGF0aW9uRXhwYW5kczogXCJcXHVENjU1XFx1QzdBNVwiLFxuICAgIHJlbGF0aW9uSW1wbGVtZW50czogXCJcXHVBRDZDXFx1RDYwNFwiLFxuICAgIHJlbGF0aW9uUmV2aWV3T2Y6IFwiXFx1RDY4Q1xcdUFDRTBcIixcbiAgICByZWxhdGlvbk5leHRBY3Rpb25Gb3I6IFwiXFx1QjJFNFxcdUM3NEMgXFx1QzU2MVxcdUMxNThcIixcbiAgICByZWxhdGlvbkRlY2lzaW9uRm9yOiBcIlxcdUM3NThcXHVDMEFDXFx1QUNCMFxcdUM4MTVcIixcbiAgICByZWxhdGlvbkZvbGxvd1VwOiBcIlxcdUQ2QzRcXHVDMThEXCJcbiAgfVxufTtcblxyXG5jb25zdCBRVUlDS19BQ1RJT05TID0ge1xyXG4gIGVuOiB7XHJcbiAgICBzdW1tYXJ5OiB7XHJcbiAgICAgIGxhYmVsOiBcIlN1bW1hcml6ZVwiLFxyXG4gICAgICBwcm9tcHQ6IFwiU3VtbWFyaXplIHRoZSBjdXJyZW50IG5vdGUgaW50byBjb25jaXNlIGJ1bGxldCBwb2ludHMuIFByZXNlcnZlIGtleSBjbGFpbXMsIGRlY2lzaW9ucywgYW5kIG9wZW4gcXVlc3Rpb25zLlwiXHJcbiAgICB9LFxyXG4gICAgb3JnYW5pemU6IHtcclxuICAgICAgbGFiZWw6IFwiT3JnYW5pemVcIixcclxuICAgICAgcHJvbXB0OiBcIlJld3JpdGUgdGhlIGN1cnJlbnQgbm90ZSBpbnRvIGEgY2xlYW5lciBzdHJ1Y3R1cmUgd2l0aCBoZWFkaW5ncyBhbmQgc2hvcnQgYnVsbGV0cy4gUHJlc2VydmUgbWVhbmluZyBhbmQgY2FsbCBvdXQgYW55IHVuY2xlYXIgb3IgbWlzc2luZyBwYXJ0cy5cIlxyXG4gICAgfSxcclxuICAgIFwibmV4dC1hY3Rpb25zXCI6IHtcclxuICAgICAgbGFiZWw6IFwiTmV4dCBBY3Rpb25zXCIsXHJcbiAgICAgIHByb21wdDogXCJFeHRyYWN0IHRoZSBwcmFjdGljYWwgbmV4dCBhY3Rpb25zIGZyb20gdGhlIGN1cnJlbnQgbm90ZS4gR3JvdXAgdGhlbSBpbnRvIE5vdywgTmV4dCwgYW5kIExhdGVyLCBhbmQgc3RhdGUgd2hhdCBpcyBtaXNzaW5nIGlmIHRoZSBub3RlIGlzIGFtYmlndW91cy5cIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAga286IHtcclxuICAgIHN1bW1hcnk6IHtcclxuICAgICAgbGFiZWw6IFwiXFx1QzY5NFxcdUM1N0RcIixcclxuICAgICAgcHJvbXB0OiBcIlxcdUQ2MDRcXHVDN0FDIFxcdUIxNzhcXHVEMkI4XFx1Qjk3QyBcXHVBQzA0XFx1QUNCMFxcdUQ1NUMgXFx1RDU3NVxcdUMyRUMgYnVsbGV0XFx1Qjg1QyBcXHVDNjk0XFx1QzU3RFxcdUQ1NzRcXHVDOTE4LiBcXHVDOTExXFx1QzY5NFxcdUQ1NUMgXFx1QzhGQ1xcdUM3QTUsIFxcdUFDQjBcXHVDODE1XFx1QzBBQ1xcdUQ1NkQsIFxcdUM1RjRcXHVCOUIwIFxcdUM5QzhcXHVCQjM4XFx1Qzc0NCBcXHVDNzIwXFx1QzlDMFxcdUQ1NzRcXHVDOTE4LlwiXHJcbiAgICB9LFxyXG4gICAgb3JnYW5pemU6IHtcclxuICAgICAgbGFiZWw6IFwiXFx1QUQ2Q1xcdUM4NzBcXHVENjU0XCIsXHJcbiAgICAgIHByb21wdDogXCJcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOFxcdUI5N0MgXFx1QjM1NCBcXHVDNzdEXFx1QUUzMCBcXHVDMjZDXFx1QzZCNCBcXHVBRDZDXFx1Qzg3MFxcdUI4NUMgXFx1QjJFNFxcdUMyREMgXFx1QzgxNVxcdUI5QUNcXHVENTc0XFx1QzkxOC4gXFx1QzgxQ1xcdUJBQTlcXHVBQ0ZDIFxcdUM5RTdcXHVDNzQwIGJ1bGxldFxcdUM3NDQgXFx1QzBBQ1xcdUM2QTlcXHVENTU4XFx1QUNFMCwgXFx1Qzc1OFxcdUJCRjhcXHVCMjk0IFxcdUM3MjBcXHVDOUMwXFx1RDU1OFxcdUJBNzRcXHVDMTFDIFxcdUJBQThcXHVENjM4XFx1RDU1OFxcdUFDNzBcXHVCMDk4IFxcdUJFNjBcXHVDOUM0IFxcdUJEODBcXHVCRDg0XFx1QjNDNCBcXHVDOURBXFx1QzVCNFxcdUM5MTguXCJcclxuICAgIH0sXHJcbiAgICBcIm5leHQtYWN0aW9uc1wiOiB7XHJcbiAgICAgIGxhYmVsOiBcIlxcdUIyRTRcXHVDNzRDIFxcdUM1NjFcXHVDMTU4XCIsXHJcbiAgICAgIHByb21wdDogXCJcXHVENjA0XFx1QzdBQyBcXHVCMTc4XFx1RDJCOFxcdUM1RDBcXHVDMTFDIFxcdUMyRTRcXHVDOUM4XFx1QzgwMVxcdUM3NzggXFx1QjJFNFxcdUM3NEMgXFx1QzU2MVxcdUMxNThcXHVDNzQ0IFxcdUNEOTRcXHVDRDlDXFx1RDU3NFxcdUM5MTguIFxcdUM5QzBcXHVBRTA4LCBcXHVCMkU0XFx1Qzc0QywgXFx1QjA5OFxcdUM5MTFcXHVDNzNDXFx1Qjg1QyBcXHVCMDk4XFx1QjIwNFxcdUFDRTAgXFx1QzgxNVxcdUJDRjRcXHVBQzAwIFxcdUJEODBcXHVDODcxXFx1RDU1OFxcdUJBNzQgXFx1QkIzNFxcdUM1QzdcXHVDNzc0IFxcdUJFNDRcXHVDNUI0IFxcdUM3ODhcXHVCMjk0XFx1QzlDMFxcdUIzQzQgXFx1QzgwMVxcdUM1QjRcXHVDOTE4LlwiXHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgV09SS0ZMT1dfVUlfU1RSSU5HUyA9IHtcclxuICBlbjoge1xyXG4gICAgYnV0dG9uU3RvcDogXCJTdG9wXCIsXHJcbiAgICB3b3JrZmxvd3NUaXRsZTogXCJXb3JrZmxvd3NcIixcclxuICAgIHdvcmtmbG93c1JlZnJlc2g6IFwiUmVsb2FkIENvbmZpZ1wiLFxyXG4gICAgd29ya2Zsb3dzQ29uZmlnUmVhZHk6IFwiV29ya2Zsb3cgY29uZmlnIGxvYWRlZC5cIixcclxuICAgIHdvcmtmbG93c0NvbmZpZ01pc3Npbmc6IFwiV29ya2Zsb3cgY29uZmlnIGlzIG5vdCBsb2FkZWQgeWV0LlwiLFxyXG4gICAgd29ya2Zsb3dzQ29uZmlnRXJyb3I6IFwiV29ya2Zsb3cgY29uZmlnIGVycm9yOiB7bWVzc2FnZX1cIixcclxuICAgIHdvcmtmbG93c0J1c3k6IFwie3Rvb2x9IGlzIHJ1bm5pbmcuLi5cIixcclxuICAgIGxvZ3NUaXRsZTogXCJXb3JrZmxvdyBMb2dzICh7Y291bnR9KVwiLFxyXG4gICAgbG9nc0VtcHR5OiBcIk5vIHdvcmtmbG93IGxvZ3MgeWV0LlwiLFxyXG4gICAgbG9nc0NsZWFyOiBcIkNsZWFyIExvZ3NcIixcclxuICAgIHRvb2xHZW5lcmF0b3I6IFwiR2VuZXJhdG9yXCIsXHJcbiAgICB0b29sVGFnZ2VyOiBcIlRhZ2dlclwiLFxyXG4gICAgdG9vbEluZ2VzdDogXCJJbmdlc3RcIixcclxuICAgIHRvb2xDaGF0OiBcIkNoYXRcIixcclxuICAgIHRvb2xMb2dzOiBcIkxvZ3NcIixcclxuICAgIHdvcmtmbG93RGlyZWN0SGludDogXCJSdW5zIGRpcmVjdGx5IGZyb20gdGhpcyBwbHVnaW4uIFN0cmVhbWxpdCBpcyBvcHRpb25hbC5cIixcclxuICAgIGdlbmVyYXRvckludHJvOiBcIkdlbmVyYXRlIHN0cnVjdHVyZWQgbm90ZXMgZnJvbSBsb2NhbCBmaWxlcy5cIixcclxuICAgIGdlbmVyYXRvclNlY3Rpb25GaWxlczogXCIxKSBGaWxlcyBhbmQgRm9sZGVyc1wiLFxyXG4gICAgZ2VuZXJhdG9yU2VjdGlvblNldHRpbmdzOiBcIjIpIFByb21wdCBhbmQgT3V0cHV0XCIsXHJcbiAgICBnZW5lcmF0b3JTZWN0aW9uTG9nczogXCJMb2dzXCIsXHJcbiAgICBnZW5lcmF0b3JKb2I6IFwiSm9iIHRlbXBsYXRlXCIsXHJcbiAgICBnZW5lcmF0b3JNYW51YWxKb2I6IFwiRGlyZWN0IGlucHV0XCIsXHJcbiAgICBnZW5lcmF0b3JSb290Rm9sZGVyOiBcIlZhdWx0IHJvb3RcIixcclxuICAgIGdlbmVyYXRvcklucHV0RGlyOiBcIklucHV0IGRpcmVjdG9yeVwiLFxyXG4gICAgZ2VuZXJhdG9yT3V0cHV0RGlyOiBcIk91dHB1dCBkaXJlY3RvcnlcIixcclxuICAgIGdlbmVyYXRvclN1YmplY3Q6IFwiU3ViamVjdFwiLFxyXG4gICAgZ2VuZXJhdG9yTW9kZTogXCJNb2RlXCIsXHJcbiAgICBnZW5lcmF0b3JNb2RlU3RhbmRhcmQ6IFwiU3RhbmRhcmRcIixcclxuICAgIGdlbmVyYXRvck1vZGVOb3RlUmVidWlsZDogXCJOb3RlIFJlY29uc3RydWN0aW9uXCIsXHJcbiAgICBnZW5lcmF0b3JTdWJqZWN0UmVidWlsZDogXCJSZWJ1aWx0IHRpdGxlXCIsXHJcbiAgICBnZW5lcmF0b3JSZWJ1aWxkVGl0bGU6IFwiUmVidWlsZCB0aXRsZVwiLFxyXG4gICAgZ2VuZXJhdG9yUmVidWlsZFRpdGxlSGVscDogXCJBZGQgYSB0aXRsZSByZWNvbnN0cnVjdGlvbiBub3RlIGFsb25nc2lkZSB0aGUgc2VsZWN0ZWQgcmVjb25zdHJ1Y3Rpb24gcGF0dGVybnMuXCIsXHJcbiAgICBnZW5lcmF0b3JNb2RlbDogXCJNb2RlbFwiLFxyXG4gICAgZ2VuZXJhdG9yVGVtcGVyYXR1cmU6IFwiVGVtcGVyYXR1cmVcIixcclxuICAgIGdlbmVyYXRvclRhcmdldFNldDogXCJUYXJnZXQgc2V0XCIsXHJcbiAgICBnZW5lcmF0b3JNYW51YWxUYXJnZXRTZXQ6IFwiTWFudWFsIHBhdHRlcm4gc2VsZWN0aW9uXCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuczogXCJQYXR0ZXJuc1wiLFxyXG4gICAgZ2VuZXJhdG9yRmlsZXM6IFwiRmlsZXMgKHtjb3VudH0pXCIsXHJcbiAgICBnZW5lcmF0b3JOb0ZpbGVzOiBcIk5vIGZpbGVzIGxvYWRlZC5cIixcclxuICAgIGdlbmVyYXRvckxvYWRGaWxlczogXCJMb2FkIEZpbGVzXCIsXHJcbiAgICBnZW5lcmF0b3JSdW46IFwiUnVuIEdlbmVyYXRvclwiLFxyXG4gICAgZ2VuZXJhdG9yU2VsZWN0ZWRGaWxlczogXCJTZWxlY3RlZCBmaWxlczoge2NvdW50fVwiLFxyXG4gICAgZ2VuZXJhdG9yRXN0aW1hdGVkU2l6ZTogXCJFc3RpbWF0ZWQgc2l6ZToge3NpemV9XCIsXHJcbiAgICBnZW5lcmF0b3JFc3RpbWF0ZWRUb2tlbnM6IFwiRXN0LiB0b2tlbnM6IHtjb3VudH1cIixcclxuICAgIGdlbmVyYXRvclNlbGVjdEFsbEZvbGRlcjogXCJTZWxlY3QgYWxsXCIsXHJcbiAgICBnZW5lcmF0b3JGb2xkZXJCYWNrOiBcIkJhY2sgdG8gZm9sZGVyc1wiLFxyXG4gICAgZ2VuZXJhdG9yUmVzb2x2ZWRJbnB1dDogXCJSZXNvbHZlZCBpbnB1dCBwYXRoXCIsXHJcbiAgICBnZW5lcmF0b3JSZXNvbHZlZE91dHB1dDogXCJSZXNvbHZlZCBvdXRwdXQgcGF0aFwiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzUmVhZHk6IFwiUmVhZHlcIixcclxuICAgIGdlbmVyYXRvclN0YXR1c0xvYWRpbmdGaWxlczogXCJMb2FkaW5nIGZpbGVzLi4uXCIsXHJcbiAgICBnZW5lcmF0b3JTdGF0dXNSdW5uaW5nOiBcIkdlbmVyYXRvciBydW5uaW5nLi4uXCIsXHJcbiAgICBnZW5lcmF0b3JTdGF0dXNQcm9ncmVzczogXCJHZW5lcmF0b3IgaW4gcHJvZ3Jlc3MgKHtwcm9ncmVzc30lKVwiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzQ29tcGxldGVkOiBcIkdlbmVyYXRpb24gY29tcGxldGVkXCIsXHJcbiAgICBnZW5lcmF0b3JQcmV2aWV3OiBcIlBhdHRlcm4gUHJldmlld1wiLFxyXG4gICAgZ2VuZXJhdG9yUHJldmlld0VtcHR5OiBcIlNlbGVjdCBhdCBsZWFzdCBvbmUgcGF0dGVybiB0byBwcmV2aWV3IHByb21wdHMuXCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuV29ya3NwYWNlOiBcIlBhdHRlcm4gV29ya3NwYWNlXCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuV29ya3NwYWNlSGVscDogXCJQcm9tcHRzIGNhbiBiZSBlZGl0ZWQgZnJvbSBtYXJrZG93biBub3RlcyBpbnNpZGUgdGhlIHZhdWx0LlwiLFxyXG4gICAgZ2VuZXJhdG9yT3BlblBhdHRlcm5Gb2xkZXI6IFwiT3BlbiBXb3Jrc3BhY2VcIixcclxuICAgIGdlbmVyYXRvckNyZWF0ZVBhdHRlcm5Ob3RlOiBcIk5ldyBQYXR0ZXJuIE5vdGVcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5PcGVuTm90ZTogXCJPcGVuIE5vdGVcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5Tb3VyY2VZYW1sOiBcIllBTUxcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5Tb3VyY2VPYnNpZGlhbjogXCJPQlNJRElBTlwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVybkdyb3VwVW5ncm91cGVkOiBcIlVuZ3JvdXBlZFwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVybkNvbmZpZ1BhdGg6IFwiQ29uZmlnIHNvdXJjZVwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVyblZhdWx0UGF0aDogXCJWYXVsdCBmb2xkZXJcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5PdXRwdXRTdWZmaXg6IFwic3VmZml4IHtzdWZmaXh9XCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuU3ViamVjdFByZWZpeDogXCJzdWJqZWN0IHByZWZpeFwiLFxyXG4gICAgdGFnZ2VySW50cm86IFwiUmVmcmVzaCBmcm9udG1hdHRlciB0YWdzIGZvciBzdW1tYXJ5L3JhdyBub3Rlcy5cIixcclxuICAgIHRhZ2dlckludHJvSW5kZXhlZDogXCJSZXdyaXRlIHRoZSBzZWxlY3RlZCBzY29wZSBhbmQgcmVidWlsZCB2YXVsdC13aWRlIHRleHQsIG1ldGFkYXRhLCBhbmQgbGluayBncmFwaCBpbmRpY2VzLlwiLFxyXG4gICAgdGFnZ2VyU2VjdGlvblNldHRpbmdzOiBcIjEpIFRhcmdldCBTZXR0aW5nc1wiLFxyXG4gICAgdGFnZ2VyU2VjdGlvblJ1bGVzOiBcIlRhZyBSdWxlc1wiLFxyXG4gICAgdGFnZ2VyU2VjdGlvbkxvZ3M6IFwiTG9nc1wiLFxyXG4gICAgd29ya2Zsb3dVc2VHZW5lcmF0b3JTb3VyY2U6IFwiVXNlIEdlbmVyYXRvciBzZWxlY3Rpb25cIixcclxuICAgIHdvcmtmbG93VmF1bHRXaWRlOiBcIlZhdWx0LXdpZGVcIixcclxuICAgIHRhZ2dlclRhcmdldDogXCJUYXJnZXRcIixcclxuICAgIHRhZ2dlck1vZGU6IFwiTW9kZVwiLFxyXG4gICAgdGFnZ2VyUnVuOiBcIlJ1biBUYWdnZXJcIixcclxuICAgIHRhZ2dlclN0YXR1c1JlYWR5OiBcIlJlYWR5XCIsXHJcbiAgICB0YWdnZXJTdGF0dXNSdW5uaW5nOiBcIlRhZ2dlciBydW5uaW5nLi4uXCIsXHJcbiAgICB0YWdnZXJJbmRleFN0YXR1czogXCJJbmRleCBTdGF0dXNcIixcclxuICAgIHRhZ2dlckluZGV4UmVhZHk6IFwiVmF1bHQtd2lkZSBpbmRleCByZWFkeVwiLFxyXG4gICAgdGFnZ2VySW5kZXhTY29wZTogXCJJbmRleCBzY29wZVwiLFxyXG4gICAgdGFnZ2VyUmV3cml0ZVNjb3BlOiBcIlJld3JpdGUgc2NvcGVcIixcclxuICAgIHRhZ2dlck5vdGVzOiBcIk5vdGVzXCIsXHJcbiAgICB0YWdnZXJHcmFwaEVkZ2VzOiBcIkVkZ2VzXCIsXHJcbiAgICB0YWdnZXJUb2tlbnM6IFwiVG9rZW5zXCIsXHJcbiAgICB0YWdnZXJNYW5pZmVzdFBhdGg6IFwiTWFuaWZlc3RcIixcclxuICAgIHRhZ2dlclJ1bGVzSGVscDogXCJNYW5hZ2UgY2Fub25pY2FsIHRhZ3MsIHN5bm9ueW0gbWFwcGluZywgYW5kIHNjb3JpbmcgcHJpb3JpdGllcyBmcm9tIG1hcmtkb3duIG5vdGVzIGluIHRoZSB2YXVsdC5cIixcclxuICAgIHRhZ2dlck9wZW5SdWxlc1JlYWRtZTogXCJPcGVuIFJ1bGVzIEd1aWRlXCIsXHJcbiAgICB0YWdnZXJPcGVuQ2Fub25pY2FsVGFnczogXCJDYW5vbmljYWwgVGFnc1wiLFxyXG4gICAgdGFnZ2VyT3BlblN5bm9ueW1NYXA6IFwiU3lub255bSBNYXBcIixcclxuICAgIHRhZ2dlck9wZW5UYWdnaW5nUHJpb3JpdHk6IFwiVGFnZ2luZyBQcmlvcml0eVwiLFxyXG4gICAgdGFnZ2VyQ2Fub25pY2FsQ291bnQ6IFwie2NvdW50fSBjYW5vbmljYWwgdGFnc1wiLFxyXG4gICAgdGFnZ2VyU3lub255bUNvdW50OiBcIntjb3VudH0gc3lub255bSBlbnRyaWVzXCIsXHJcbiAgICB0YWdnZXJTZW1hbnRpY0xpbWl0OiBcInRvcCB7Y291bnR9XCIsXHJcbiAgICB0YWdnZXJNaW5TY29yZTogXCJtaW4gc2NvcmUge3Njb3JlfVwiLFxyXG4gICAgaW5nZXN0SW50cm86IFwiUmVidWlsZCBvciB1cGRhdGUgaW5kZXhlZCBkYXRhIGZyb20gY29uZmlndXJlZCBqb2JzLlwiLFxyXG4gICAgaW5nZXN0U2VjdGlvblByb2plY3Q6IFwiMSkgUHJvamVjdCBDb250ZXh0XCIsXHJcbiAgICBpbmdlc3RTZWN0aW9uU2V0dGluZ3M6IFwiMikgSW5nZXN0IFNldHRpbmdzXCIsXHJcbiAgICBpbmdlc3RTZWN0aW9uTG9nczogXCJMb2dzXCIsXHJcbiAgICBpbmdlc3RKb2I6IFwiUHJvamVjdFwiLFxyXG4gICAgaW5nZXN0QWxsSm9iczogXCJBbGxcIixcclxuICAgIGluZ2VzdFJlc29sdmVkSW5wdXQ6IFwiU291cmNlIHBhdGhcIixcclxuICAgIGluZ2VzdFJlc29sdmVkT3V0cHV0OiBcIlRhcmdldCBwYXRoXCIsXHJcbiAgICBpbmdlc3RDb2xsZWN0aW9uUmF3OiBcIlJhdyBjb2xsZWN0aW9uXCIsXHJcbiAgICBpbmdlc3RDb2xsZWN0aW9uU3VtbWFyeTogXCJTdW1tYXJ5IGNvbGxlY3Rpb25cIixcclxuICAgIGluZ2VzdExheWVyOiBcIkxheWVyXCIsXHJcbiAgICBpbmdlc3RNb2RlOiBcIk1vZGVcIixcclxuICAgIGluZ2VzdFBvbGljeTogXCJTcGxpdCBwb2xpY3lcIixcclxuICAgIGluZ2VzdENodW5rU2l6ZTogXCJDaHVuayBzaXplXCIsXHJcbiAgICBpbmdlc3RPdmVybGFwOiBcIk92ZXJsYXBcIixcclxuICAgIGluZ2VzdEhlYWRpbmdMZXZlbHM6IFwiSGVhZGluZyBsZXZlbHNcIixcclxuICAgIGluZ2VzdENvZGVBdHRhY2g6IFwiQXR0YWNoIG5lYXJieSBjb2RlIGJsb2Nrc1wiLFxyXG4gICAgaW5nZXN0UnVuOiBcIlJ1biBJbmdlc3RcIixcclxuICAgIGluZ2VzdFN0YXR1c1JlYWR5OiBcIlJlYWR5XCIsXHJcbiAgICBpbmdlc3RTdGF0dXNSdW5uaW5nOiBcIkluZ2VzdCBydW5uaW5nLi4uXCIsXHJcbiAgICBjb21tb25TdW1tYXJ5OiBcIlN1bW1hcnlcIixcclxuICAgIGNvbW1vblJhdzogXCJSYXdcIixcclxuICAgIGNvbW1vbkJvdGg6IFwiQm90aFwiLFxyXG4gICAgY29tbW9uSW5jcmVtZW50YWw6IFwiSW5jcmVtZW50YWxcIixcclxuICAgIGNvbW1vblJlc2V0OiBcIlJlc2V0XCIsXHJcbiAgICBjb21tb25DbGVhbnVwOiBcIkNsZWFudXBcIixcclxuICAgIGNvbW1vbkF1dG86IFwiQXV0b1wiLFxyXG4gICAgY29tbW9uSGVhZGluZ3M6IFwiSGVhZGluZ3NcIixcclxuICAgIGNvbW1vblBhcmFncmFwaDogXCJQYXJhZ3JhcGhcIixcclxuICAgIGNvbW1vbk1pbmltYWw6IFwiTWluaW1hbFwiLFxyXG4gICAgbm90aWNlV29ya2Zsb3dDb25maWdMb2FkZWQ6IFwiV29ya2Zsb3cgY29uZmlnIGxvYWRlZC5cIixcclxuICAgIG5vdGljZVdvcmtmbG93RmlsZXNMb2FkZWQ6IFwiTG9hZGVkIGZpbGVzIGZyb20ge3BhdGh9XCIsXHJcbiAgICBub3RpY2VXb3JrZmxvd0NvbmZpZ0ZhaWxlZDogXCJGYWlsZWQgdG8gbG9hZCB3b3JrZmxvdyBjb25maWc6IHttZXNzYWdlfVwiLFxyXG4gICAgbm90aWNlV29ya2Zsb3dGaWxlc0ZhaWxlZDogXCJGYWlsZWQgdG8gbG9hZCBmaWxlczoge21lc3NhZ2V9XCIsXHJcbiAgICBub3RpY2VQYXR0ZXJuV29ya3NwYWNlTWlzc2luZzogXCJQYXR0ZXJuIHdvcmtzcGFjZSBwYXRoIGlzIG5vdCBhdmFpbGFibGUgeWV0LlwiLFxyXG4gICAgbm90aWNlUGF0dGVybk5vdGVDcmVhdGVkOiBcIkNyZWF0ZWQgcGF0dGVybiBub3RlOiB7cGF0aH1cIixcclxuICAgIG5vdGljZVRvb2xCdXN5OiBcIkFub3RoZXIgdGFzayBpcyBhbHJlYWR5IHJ1bm5pbmcuXCIsXHJcbiAgICBub3RpY2VOb1BhdHRlcm5zOiBcIlNlbGVjdCBhdCBsZWFzdCBvbmUgcGF0dGVybi5cIixcclxuICAgIG5vdGljZU5vU2VsZWN0ZWRGaWxlczogXCJTZWxlY3QgYXQgbGVhc3Qgb25lIGZpbGUuXCIsXHJcbiAgICBub3RpY2VOb0lucHV0RGlyOiBcIkVudGVyIGFuIGlucHV0IGRpcmVjdG9yeSBmaXJzdC5cIixcclxuICAgIG5vdGljZU5vT3V0cHV0RGlyOiBcIkVudGVyIGFuIG91dHB1dCBkaXJlY3RvcnkgZmlyc3QuXCIsXHJcbiAgICBub3RpY2VOb1Rvb2xDb25maWc6IFwiV29ya2Zsb3cgY29uZmlnIGlzIG5vdCBhdmFpbGFibGUgeWV0LlwiLFxyXG4gICAgbm90aWNlQ2hhdFN0b3BwZWQ6IFwiQ2hhdCBnZW5lcmF0aW9uIHN0b3BwZWQuXCIsXHJcbiAgICBub3RpY2VDaGF0U3RvcEZhaWxlZDogXCJGYWlsZWQgdG8gc3RvcCBjaGF0OiB7bWVzc2FnZX1cIixcclxuICAgIGJ1dHRvblJ1bkluQ3VycmVudFBhbmVsOiBcIlVzZSBpbiBjdXJyZW50IHBhbmVsXCJcclxuICB9LFxyXG4gIGtvOiB7XHJcbiAgICBidXR0b25TdG9wOiBcIlxcdUM5MTFcXHVCMkU4XCIsXHJcbiAgICB3b3JrZmxvd3NUaXRsZTogXCJcXHVDNkNDXFx1RDA2Q1xcdUQ1MENcXHVCODVDXFx1QzZCMFwiLFxyXG4gICAgd29ya2Zsb3dzUmVmcmVzaDogXCJcXHVDMTI0XFx1QzgxNSBcXHVCMkU0XFx1QzJEQyBcXHVCRDg4XFx1QjdFQ1xcdUM2MjRcXHVBRTMwXCIsXHJcbiAgICB3b3JrZmxvd3NDb25maWdSZWFkeTogXCJcXHVDNkNDXFx1RDA2Q1xcdUQ1MENcXHVCODVDXFx1QzZCMCBcXHVDMTI0XFx1QzgxNVxcdUM3NDQgXFx1QkQ4OFxcdUI3RUNcXHVDNjU0XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgd29ya2Zsb3dzQ29uZmlnTWlzc2luZzogXCJcXHVDNTQ0XFx1QzlDMSBcXHVDNkNDXFx1RDA2Q1xcdUQ1MENcXHVCODVDXFx1QzZCMCBcXHVDMTI0XFx1QzgxNVxcdUM3NDQgXFx1QkQ4OFxcdUI3RUNcXHVDNjI0XFx1QzlDMCBcXHVCQUJCXFx1RDU4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHdvcmtmbG93c0NvbmZpZ0Vycm9yOiBcIlxcdUM2Q0NcXHVEMDZDXFx1RDUwQ1xcdUI4NUNcXHVDNkIwIFxcdUMxMjRcXHVDODE1IFxcdUM2MjRcXHVCOTU4OiB7bWVzc2FnZX1cIixcclxuICAgIHdvcmtmbG93c0J1c3k6IFwie3Rvb2x9IFxcdUM3OTFcXHVDNUM1XFx1Qzc3NCBcXHVDMkU0XFx1RDU4OSBcXHVDOTExXFx1Qzc4NVxcdUIyQzhcXHVCMkU0Li4uXCIsXHJcbiAgICBsb2dzVGl0bGU6IFwiXFx1QzZDQ1xcdUQwNkNcXHVENTBDXFx1Qjg1Q1xcdUM2QjAgXFx1Qjg1Q1xcdUFERjggKHtjb3VudH0pXCIsXHJcbiAgICBsb2dzRW1wdHk6IFwiXFx1QzU0NFxcdUM5QzEgXFx1QzZDQ1xcdUQwNkNcXHVENTBDXFx1Qjg1Q1xcdUM2QjAgXFx1Qjg1Q1xcdUFERjhcXHVBQzAwIFxcdUM1QzZcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBsb2dzQ2xlYXI6IFwiXFx1Qjg1Q1xcdUFERjggXFx1QkU0NFxcdUM2QjBcXHVBRTMwXCIsXHJcbiAgICB0b29sR2VuZXJhdG9yOiBcIkdlbmVyYXRvclwiLFxyXG4gICAgdG9vbFRhZ2dlcjogXCJUYWdnZXJcIixcclxuICAgIHRvb2xJbmdlc3Q6IFwiSW5nZXN0XCIsXHJcbiAgICB0b29sQ2hhdDogXCJDaGF0XCIsXHJcbiAgICB0b29sTG9nczogXCJMb2dzXCIsXHJcbiAgICB3b3JrZmxvd0RpcmVjdEhpbnQ6IFwiXFx1Qzc3NCBcXHVENTBDXFx1QjdFQ1xcdUFERjhcXHVDNzc4IFxcdUM1NDhcXHVDNUQwXFx1QzExQyBcXHVCQzE0XFx1Qjg1QyBcXHVDMkU0XFx1RDU4OVxcdUI0MjlcXHVCMkM4XFx1QjJFNC4gU3RyZWFtbGl0XFx1Qzc0MCBcXHVDMTIwXFx1RDBERCBcXHVDMEFDXFx1RDU2RFxcdUM3ODVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGdlbmVyYXRvckludHJvOiBcIlxcdUI4NUNcXHVDRUVDIFxcdUQzMENcXHVDNzdDXFx1Qzc0NCBcXHVBRTMwXFx1QkMxOFxcdUM3M0NcXHVCODVDIFxcdUFENkNcXHVDODcwXFx1RDY1NFxcdUI0MUMgXFx1QjE3OFxcdUQyQjhcXHVCOTdDIFxcdUMwRERcXHVDMTMxXFx1RDU2OVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgZ2VuZXJhdG9yU2VjdGlvbkZpbGVzOiBcIjEpIFxcdUQzRjRcXHVCMzU0XFx1QzY0MCBcXHVEMzBDXFx1Qzc3QyBcXHVDMTIwXFx1RDBERFwiLFxyXG4gICAgZ2VuZXJhdG9yU2VjdGlvblNldHRpbmdzOiBcIjIpIFxcdUQ1MDRcXHVCODZDXFx1RDUwNFxcdUQyQjhcXHVDNjQwIFxcdUNEOUNcXHVCODI1IFxcdUMxMjRcXHVDODE1XCIsXHJcbiAgICBnZW5lcmF0b3JTZWN0aW9uTG9nczogXCJcXHVCODVDXFx1QURGOFwiLFxyXG4gICAgZ2VuZXJhdG9ySm9iOiBcIlxcdUM3OTFcXHVDNUM1IFxcdUQxNUNcXHVENTBDXFx1QjlCRlwiLFxyXG4gICAgZ2VuZXJhdG9yTWFudWFsSm9iOiBcIlxcdUM5QzFcXHVDODExIFxcdUMxMjRcXHVDODE1XCIsXHJcbiAgICBnZW5lcmF0b3JSb290Rm9sZGVyOiBcIlxcdUJDRkNcXHVEMkI4IFxcdUI4RThcXHVEMkI4XCIsXHJcbiAgICBnZW5lcmF0b3JJbnB1dERpcjogXCJcXHVDNzg1XFx1QjgyNSBcXHVBQ0JEXFx1Qjg1Q1wiLFxyXG4gICAgZ2VuZXJhdG9yT3V0cHV0RGlyOiBcIlxcdUNEOUNcXHVCODI1IFxcdUFDQkRcXHVCODVDXCIsXHJcbiAgICBnZW5lcmF0b3JTdWJqZWN0OiBcIlxcdUM4RkNcXHVDODFDXCIsXHJcbiAgICBnZW5lcmF0b3JNb2RlOiBcIlxcdUJBQThcXHVCNERDXCIsXHJcbiAgICBnZW5lcmF0b3JNb2RlU3RhbmRhcmQ6IFwiXFx1Qzc3Q1xcdUJDMTggXFx1QzBERFxcdUMxMzFcIixcclxuICAgIGdlbmVyYXRvck1vZGVOb3RlUmVidWlsZDogXCJcXHVCMTc4XFx1RDJCOCBcXHVDN0FDXFx1QUQ2Q1xcdUMxMzFcIixcclxuICAgIGdlbmVyYXRvclN1YmplY3RSZWJ1aWxkOiBcIlxcdUM4MUNcXHVCQUE5IFxcdUM3QUNcXHVBRDZDXFx1QzEzMVwiLFxyXG4gICAgZ2VuZXJhdG9yUmVidWlsZFRpdGxlOiBcIlxcdUM4MUNcXHVCQUE5IFxcdUM3QUNcXHVBRDZDXFx1QzEzMVwiLFxyXG4gICAgZ2VuZXJhdG9yUmVidWlsZFRpdGxlSGVscDogXCJcXHVDMTIwXFx1RDBERFxcdUQ1NUMgXFx1QzdBQ1xcdUFENkNcXHVDMTMxIFxcdUQzMjhcXHVEMTM0XFx1QUNGQyBcXHVENTY4XFx1QUVEOCBcXHVDODFDXFx1QkFBOSBcXHVDN0FDXFx1QUQ2Q1xcdUMxMzEgXFx1QjE3OFxcdUQyQjhcXHVCOTdDIFxcdUNEOTRcXHVBQzAwXFx1Qjg1QyBcXHVDMEREXFx1QzEzMVxcdUQ1NjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGdlbmVyYXRvck1vZGVsOiBcIlxcdUJBQThcXHVCMzc4XCIsXHJcbiAgICBnZW5lcmF0b3JUZW1wZXJhdHVyZTogXCJcXHVDNjI4XFx1QjNDNFwiLFxyXG4gICAgZ2VuZXJhdG9yVGFyZ2V0U2V0OiBcIlxcdUQwQzBcXHVBRTQzIFxcdUMxMzhcXHVEMkI4XCIsXHJcbiAgICBnZW5lcmF0b3JNYW51YWxUYXJnZXRTZXQ6IFwiXFx1RDMyOFxcdUQxMzQgXFx1QzlDMVxcdUM4MTEgXFx1QzEyMFxcdUQwRERcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5zOiBcIlxcdUQzMjhcXHVEMTM0XCIsXHJcbiAgICBnZW5lcmF0b3JGaWxlczogXCJcXHVEMzBDXFx1Qzc3QyAoe2NvdW50fSlcIixcclxuICAgIGdlbmVyYXRvck5vRmlsZXM6IFwiXFx1QkQ4OFxcdUI3RUNcXHVDNjI4IFxcdUQzMENcXHVDNzdDXFx1Qzc3NCBcXHVDNUM2XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgZ2VuZXJhdG9yTG9hZEZpbGVzOiBcIlxcdUQzMENcXHVDNzdDIFxcdUJEODhcXHVCN0VDXFx1QzYyNFxcdUFFMzBcIixcclxuICAgIGdlbmVyYXRvclJ1bjogXCJHZW5lcmF0b3IgXFx1QzJFNFxcdUQ1ODlcIixcclxuICAgIGdlbmVyYXRvclNlbGVjdGVkRmlsZXM6IFwiXFx1QzEyMFxcdUQwREQgXFx1RDMwQ1xcdUM3N0MgXFx1QzIxODoge2NvdW50fVwiLFxyXG4gICAgZ2VuZXJhdG9yRXN0aW1hdGVkU2l6ZTogXCJcXHVDNjA4XFx1QzBDMSBcXHVEMDZDXFx1QUUzMDoge3NpemV9XCIsXHJcbiAgICBnZW5lcmF0b3JFc3RpbWF0ZWRUb2tlbnM6IFwiXFx1QzYwOFxcdUMwQzEgXFx1RDFBMFxcdUQwNzA6IHtjb3VudH1cIixcclxuICAgIGdlbmVyYXRvclNlbGVjdEFsbEZvbGRlcjogXCJcXHVDODA0XFx1Q0NCNCBcXHVDMTIwXFx1RDBERFwiLFxyXG4gICAgZ2VuZXJhdG9yRm9sZGVyQmFjazogXCJcXHVEM0Y0XFx1QjM1NCBcXHVCQUE5XFx1Qjg1RFxcdUM3M0NcXHVCODVDXCIsXHJcbiAgICBnZW5lcmF0b3JSZXNvbHZlZElucHV0OiBcIlxcdUMyRTRcXHVDODFDIFxcdUM3ODVcXHVCODI1IFxcdUFDQkRcXHVCODVDXCIsXHJcbiAgICBnZW5lcmF0b3JSZXNvbHZlZE91dHB1dDogXCJcXHVDMkU0XFx1QzgxQyBcXHVDRDlDXFx1QjgyNSBcXHVBQ0JEXFx1Qjg1Q1wiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzUmVhZHk6IFwiXFx1QzkwMFxcdUJFNDRcXHVCNDI4XCIsXHJcbiAgICBnZW5lcmF0b3JTdGF0dXNMb2FkaW5nRmlsZXM6IFwiXFx1RDMwQ1xcdUM3N0MgXFx1QkFBOVxcdUI4NURcXHVDNzQ0IFxcdUJEODhcXHVCN0VDXFx1QzYyNFxcdUIyOTQgXFx1QzkxMS4uLlwiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzUnVubmluZzogXCJHZW5lcmF0b3IgXFx1QzJFNFxcdUQ1ODkgXFx1QzkxMS4uLlwiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzUHJvZ3Jlc3M6IFwiR2VuZXJhdG9yIFxcdUM5QzRcXHVENTg5IFxcdUM5MTEgKHtwcm9ncmVzc30lKVwiLFxyXG4gICAgZ2VuZXJhdG9yU3RhdHVzQ29tcGxldGVkOiBcIlxcdUMwRERcXHVDMTMxXFx1Qzc3NCBcXHVDNjQ0XFx1QjhDQ1xcdUI0MThcXHVDNUM4XFx1QzJCNVxcdUIyQzhcXHVCMkU0XCIsXHJcbiAgICBnZW5lcmF0b3JQcmV2aWV3OiBcIlxcdUQzMjhcXHVEMTM0IFxcdUJCRjhcXHVCOUFDXFx1QkNGNFxcdUFFMzBcIixcclxuICAgIGdlbmVyYXRvclByZXZpZXdFbXB0eTogXCJcXHVENTA0XFx1Qjg2Q1xcdUQ1MDRcXHVEMkI4IFxcdUJCRjhcXHVCOUFDXFx1QkNGNFxcdUFFMzBcXHVCOTdDIFxcdUJDRjRcXHVCODI0XFx1QkE3NCBcXHVEMzI4XFx1RDEzNFxcdUM3NDQgXFx1RDU1OFxcdUIwOTggXFx1Qzc3NFxcdUMwQzEgXFx1QzEyMFxcdUQwRERcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuV29ya3NwYWNlOiBcIlxcdUQzMjhcXHVEMTM0IFxcdUM3OTFcXHVDNUM1XFx1QUNGNVxcdUFDMDRcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5Xb3Jrc3BhY2VIZWxwOiBcIlZhdWx0IFxcdUM1NDhcXHVDNzU4IE1hcmtkb3duIFxcdUIxNzhcXHVEMkI4XFx1QzVEMFxcdUMxMUMgXFx1RDMyOFxcdUQxMzQgXFx1RDUwNFxcdUI4NkNcXHVENTA0XFx1RDJCOFxcdUI5N0MgXFx1QzIxOFxcdUM4MTVcXHVENTYwIFxcdUMyMTggXFx1Qzc4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGdlbmVyYXRvck9wZW5QYXR0ZXJuRm9sZGVyOiBcIlxcdUM3OTFcXHVDNUM1XFx1QUNGNVxcdUFDMDQgXFx1QzVGNFxcdUFFMzBcIixcclxuICAgIGdlbmVyYXRvckNyZWF0ZVBhdHRlcm5Ob3RlOiBcIlxcdUMwQzggXFx1RDMyOFxcdUQxMzQgXFx1QjE3OFxcdUQyQjhcIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5PcGVuTm90ZTogXCJcXHVCMTc4XFx1RDJCOCBcXHVDNUY0XFx1QUUzMFwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVyblNvdXJjZVlhbWw6IFwiWUFNTFwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVyblNvdXJjZU9ic2lkaWFuOiBcIk9CU0lESUFOXCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuR3JvdXBVbmdyb3VwZWQ6IFwiXFx1QkJGOFxcdUJEODRcXHVCOTU4XCIsXHJcbiAgICBnZW5lcmF0b3JQYXR0ZXJuQ29uZmlnUGF0aDogXCJcXHVDNkQwXFx1QkNGOCBcXHVDMTI0XFx1QzgxNVwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVyblZhdWx0UGF0aDogXCJWYXVsdCBcXHVEM0Y0XFx1QjM1NFwiLFxyXG4gICAgZ2VuZXJhdG9yUGF0dGVybk91dHB1dFN1ZmZpeDogXCJzdWZmaXgge3N1ZmZpeH1cIixcclxuICAgIGdlbmVyYXRvclBhdHRlcm5TdWJqZWN0UHJlZml4OiBcInN1YmplY3QgcHJlZml4XCIsXHJcbiAgICB0YWdnZXJJbnRybzogXCJzdW1tYXJ5L3JhdyBcXHVCMTc4XFx1RDJCOFxcdUM3NTggZnJvbnRtYXR0ZXIgXFx1RDBEQ1xcdUFERjhcXHVCOTdDIFxcdUFDMzFcXHVDMkUwXFx1RDU2OVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgdGFnZ2VySW50cm9JbmRleGVkOiBcIlxcdUMxMjBcXHVEMEREXFx1RDU1QyBcXHVCQzk0XFx1QzcwNFxcdUM3NTggZnJvbnRtYXR0ZXJcXHVCOTdDIFxcdUFDMzFcXHVDMkUwXFx1RDU1OFxcdUFDRTAsIHZhdWx0IFxcdUM4MDRcXHVDQ0I0XFx1Qzc1OCBcXHVEMTREXFx1QzJBNFxcdUQyQjgvXFx1QkE1NFxcdUQwQzBcXHVCMzcwXFx1Qzc3NFxcdUQxMzAvXFx1QjlDMVxcdUQwNkMgXFx1QURGOFxcdUI3OThcXHVENTA0IFxcdUM3NzhcXHVCMzcxXFx1QzJBNFxcdUI5N0MgXFx1QjJFNFxcdUMyREMgXFx1QjlDQ1xcdUI0RURcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHRhZ2dlclNlY3Rpb25TZXR0aW5nczogXCIxKSBcXHVCMzAwXFx1QzBDMSBcXHVDMTI0XFx1QzgxNVwiLFxyXG4gICAgdGFnZ2VyU2VjdGlvblJ1bGVzOiBcIlxcdUQwRENcXHVBREY4IFxcdUFERENcXHVDRTU5XCIsXHJcbiAgICB0YWdnZXJTZWN0aW9uTG9nczogXCJcXHVCODVDXFx1QURGOFwiLFxyXG4gICAgd29ya2Zsb3dVc2VHZW5lcmF0b3JTb3VyY2U6IFwiR2VuZXJhdG9yIFxcdUMxMjBcXHVEMEREIFxcdUMwQUNcXHVDNkE5XCIsXHJcbiAgICB3b3JrZmxvd1ZhdWx0V2lkZTogXCJ2YXVsdCBcXHVDODA0XFx1Q0NCNFwiLFxyXG4gICAgdGFnZ2VyVGFyZ2V0OiBcIlxcdUIzMDBcXHVDMEMxXCIsXHJcbiAgICB0YWdnZXJNb2RlOiBcIlxcdUJBQThcXHVCNERDXCIsXHJcbiAgICB0YWdnZXJSdW46IFwiVGFnZ2VyIFxcdUMyRTRcXHVENTg5XCIsXHJcbiAgICB0YWdnZXJTdGF0dXNSZWFkeTogXCJcXHVDOTAwXFx1QkU0NFxcdUI0MjhcIixcclxuICAgIHRhZ2dlclN0YXR1c1J1bm5pbmc6IFwiVGFnZ2VyIFxcdUMyRTRcXHVENTg5IFxcdUM5MTEuLi5cIixcclxuICAgIHRhZ2dlckluZGV4U3RhdHVzOiBcIlxcdUM3NzhcXHVCMzcxXFx1QzJBNCBcXHVDMEMxXFx1RDBEQ1wiLFxyXG4gICAgdGFnZ2VySW5kZXhSZWFkeTogXCJ2YXVsdCBcXHVDODA0XFx1Q0NCNCBcXHVDNzc4XFx1QjM3MVxcdUMyQTQgXFx1QzkwMFxcdUJFNDQgXFx1QzY0NFxcdUI4Q0NcIixcclxuICAgIHRhZ2dlckluZGV4U2NvcGU6IFwiXFx1Qzc3OFxcdUIzNzFcXHVDMkE0IFxcdUJDOTRcXHVDNzA0XCIsXHJcbiAgICB0YWdnZXJSZXdyaXRlU2NvcGU6IFwiXFx1QzdBQ1xcdUM3OTFcXHVDMTMxIFxcdUJDOTRcXHVDNzA0XCIsXHJcbiAgICB0YWdnZXJOb3RlczogXCJcXHVCMTc4XFx1RDJCOFwiLFxyXG4gICAgdGFnZ2VyR3JhcGhFZGdlczogXCJcXHVDNUUzXFx1QzlDMFwiLFxyXG4gICAgdGFnZ2VyVG9rZW5zOiBcIlxcdUQxQTBcXHVEMDcwXCIsXHJcbiAgICB0YWdnZXJNYW5pZmVzdFBhdGg6IFwiXFx1QjlFNFxcdUIyQzhcXHVEMzk4XFx1QzJBNFxcdUQyQjhcIixcclxuICAgIHRhZ2dlclJ1bGVzSGVscDogXCJWYXVsdCBcXHVDNTQ4XFx1Qzc1OCBNYXJrZG93biBcXHVCMTc4XFx1RDJCOFxcdUM1RDBcXHVDMTFDIGNhbm9uaWNhbCB0YWcsIHN5bm9ueW0gbWFwLCB0YWdnaW5nIHByaW9yaXR5XFx1Qjk3QyBcXHVBRDAwXFx1QjlBQ1xcdUQ1NjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIHRhZ2dlck9wZW5SdWxlc1JlYWRtZTogXCJcXHVBRERDXFx1Q0U1OSBcXHVBQzAwXFx1Qzc3NFxcdUI0REMgXFx1QzVGNFxcdUFFMzBcIixcclxuICAgIHRhZ2dlck9wZW5DYW5vbmljYWxUYWdzOiBcIkNhbm9uaWNhbCBUYWdzXCIsXHJcbiAgICB0YWdnZXJPcGVuU3lub255bU1hcDogXCJTeW5vbnltIE1hcFwiLFxyXG4gICAgdGFnZ2VyT3BlblRhZ2dpbmdQcmlvcml0eTogXCJUYWdnaW5nIFByaW9yaXR5XCIsXHJcbiAgICB0YWdnZXJDYW5vbmljYWxDb3VudDogXCJjYW5vbmljYWwgdGFncyB7Y291bnR9XFx1QUMxQ1wiLFxyXG4gICAgdGFnZ2VyU3lub255bUNvdW50OiBcInN5bm9ueW0gZW50cmllcyB7Y291bnR9XFx1QUMxQ1wiLFxyXG4gICAgdGFnZ2VyU2VtYW50aWNMaW1pdDogXCJcXHVDMEMxXFx1QzcwNCB7Y291bnR9XFx1QUMxQ1wiLFxyXG4gICAgdGFnZ2VyTWluU2NvcmU6IFwiXFx1Q0Q1Q1xcdUMxOEMgXFx1QzgxMFxcdUMyMTgge3Njb3JlfVwiLFxyXG4gICAgaW5nZXN0SW50cm86IFwiXFx1QzEyNFxcdUM4MTVcXHVCNDFDIFxcdUQ1MDRcXHVCODVDXFx1QzgxRFxcdUQyQjggXFx1QUUzMFxcdUM5MDBcXHVDNzNDXFx1Qjg1QyBcXHVDNzc4XFx1QjM3MVxcdUMyQTRcXHVCOTdDIFxcdUFDMzFcXHVDMkUwXFx1RDU1OFxcdUFDNzBcXHVCMDk4IFxcdUM3QUNcXHVBRDZDXFx1Q0Q5NVxcdUQ1NjlcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIGluZ2VzdFNlY3Rpb25Qcm9qZWN0OiBcIjEpIFxcdUQ1MDRcXHVCODVDXFx1QzgxRFxcdUQyQjggXFx1QzgxNVxcdUJDRjRcIixcclxuICAgIGluZ2VzdFNlY3Rpb25TZXR0aW5nczogXCIyKSBcXHVDNzc4XFx1QzgxQ1xcdUMyQTRcXHVEMkI4IFxcdUMxMjRcXHVDODE1XCIsXHJcbiAgICBpbmdlc3RTZWN0aW9uTG9nczogXCJcXHVCODVDXFx1QURGOFwiLFxyXG4gICAgaW5nZXN0Sm9iOiBcIlxcdUQ1MDRcXHVCODVDXFx1QzgxRFxcdUQyQjhcIixcclxuICAgIGluZ2VzdEFsbEpvYnM6IFwiXFx1QzgwNFxcdUNDQjRcIixcclxuICAgIGluZ2VzdFJlc29sdmVkSW5wdXQ6IFwiXFx1QzZEMFxcdUJDRjggXFx1QUNCRFxcdUI4NUNcIixcclxuICAgIGluZ2VzdFJlc29sdmVkT3V0cHV0OiBcIlxcdUNEOUNcXHVCODI1IFxcdUFDQkRcXHVCODVDXCIsXHJcbiAgICBpbmdlc3RDb2xsZWN0aW9uUmF3OiBcIlxcdUM2RDBcXHVCQjM4IFxcdUNFRUNcXHVCODA5XFx1QzE1OFwiLFxyXG4gICAgaW5nZXN0Q29sbGVjdGlvblN1bW1hcnk6IFwiXFx1QzY5NFxcdUM1N0QgXFx1Q0VFQ1xcdUI4MDlcXHVDMTU4XCIsXHJcbiAgICBpbmdlc3RMYXllcjogXCJcXHVCODA4XFx1Qzc3NFxcdUM1QjRcIixcclxuICAgIGluZ2VzdE1vZGU6IFwiXFx1QkFBOFxcdUI0RENcIixcclxuICAgIGluZ2VzdFBvbGljeTogXCJcXHVCRDg0XFx1RDU2MCBcXHVDODE1XFx1Q0M0NVwiLFxyXG4gICAgaW5nZXN0Q2h1bmtTaXplOiBcIlxcdUNDQURcXHVEMDZDIFxcdUQwNkNcXHVBRTMwXCIsXHJcbiAgICBpbmdlc3RPdmVybGFwOiBcIlxcdUM2MjRcXHVCQzg0XFx1QjdBOVwiLFxyXG4gICAgaW5nZXN0SGVhZGluZ0xldmVsczogXCJcXHVENUU0XFx1QjUyOSBcXHVCODA4XFx1QkNBOFwiLFxyXG4gICAgaW5nZXN0Q29kZUF0dGFjaDogXCJcXHVDOEZDXFx1QkNDMCBcXHVDRjU0XFx1QjREQyBcXHVCRTE0XFx1Qjg1RCBcXHVEM0VDXFx1RDU2OFwiLFxyXG4gICAgaW5nZXN0UnVuOiBcIkluZ2VzdCBcXHVDMkU0XFx1RDU4OVwiLFxyXG4gICAgaW5nZXN0U3RhdHVzUmVhZHk6IFwiXFx1QzkwMFxcdUJFNDRcXHVCNDI4XCIsXHJcbiAgICBpbmdlc3RTdGF0dXNSdW5uaW5nOiBcIkluZ2VzdCBcXHVDMkU0XFx1RDU4OSBcXHVDOTExLi4uXCIsXHJcbiAgICBjb21tb25TdW1tYXJ5OiBcIlxcdUM2OTRcXHVDNTdEXCIsXHJcbiAgICBjb21tb25SYXc6IFwiXFx1QzZEMFxcdUJCMzhcIixcclxuICAgIGNvbW1vbkJvdGg6IFwiXFx1QzgwNFxcdUNDQjRcIixcclxuICAgIGNvbW1vbkluY3JlbWVudGFsOiBcIlxcdUM5OURcXHVCRDg0XCIsXHJcbiAgICBjb21tb25SZXNldDogXCJcXHVDRDA4XFx1QUUzMFxcdUQ2NTRcIixcclxuICAgIGNvbW1vbkNsZWFudXA6IFwiXFx1QzgxNVxcdUI5QUNcIixcclxuICAgIGNvbW1vbkF1dG86IFwiXFx1Qzc5MFxcdUIzRDlcIixcclxuICAgIGNvbW1vbkhlYWRpbmdzOiBcIlxcdUQ1RTRcXHVCNTI5XCIsXHJcbiAgICBjb21tb25QYXJhZ3JhcGg6IFwiXFx1QkIzOFxcdUIyRThcIixcclxuICAgIGNvbW1vbk1pbmltYWw6IFwiXFx1Q0Q1Q1xcdUMxOENcIixcclxuICAgIG5vdGljZVdvcmtmbG93Q29uZmlnTG9hZGVkOiBcIlxcdUM2Q0NcXHVEMDZDXFx1RDUwQ1xcdUI4NUNcXHVDNkIwIFxcdUMxMjRcXHVDODE1XFx1Qzc0NCBcXHVCRDg4XFx1QjdFQ1xcdUM2NTRcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBub3RpY2VXb3JrZmxvd0ZpbGVzTG9hZGVkOiBcIntwYXRofSBcXHVBQ0JEXFx1Qjg1Q1xcdUM3NTggXFx1RDMwQ1xcdUM3N0MgXFx1QkFBOVxcdUI4NURcXHVDNzQ0IFxcdUJEODhcXHVCN0VDXFx1QzY1NFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIG5vdGljZVdvcmtmbG93Q29uZmlnRmFpbGVkOiBcIlxcdUM2Q0NcXHVEMDZDXFx1RDUwQ1xcdUI4NUNcXHVDNkIwIFxcdUMxMjRcXHVDODE1XFx1Qzc0NCBcXHVCRDg4XFx1QjdFQ1xcdUM2MjRcXHVDOUMwIFxcdUJBQkJcXHVENTg4XFx1QzJCNVxcdUIyQzhcXHVCMkU0OiB7bWVzc2FnZX1cIixcclxuICAgIG5vdGljZVdvcmtmbG93RmlsZXNGYWlsZWQ6IFwiXFx1RDMwQ1xcdUM3N0MgXFx1QkFBOVxcdUI4NURcXHVDNzQ0IFxcdUJEODhcXHVCN0VDXFx1QzYyNFxcdUM5QzAgXFx1QkFCQlxcdUQ1ODhcXHVDMkI1XFx1QjJDOFxcdUIyRTQ6IHttZXNzYWdlfVwiLFxyXG4gICAgbm90aWNlUGF0dGVybldvcmtzcGFjZU1pc3Npbmc6IFwiXFx1RDMyOFxcdUQxMzQgXFx1Qzc5MVxcdUM1QzVcXHVBQ0Y1XFx1QUMwNCBcXHVBQ0JEXFx1Qjg1Q1xcdUI5N0MgXFx1QzU0NFxcdUM5QzEgXFx1RDY1NVxcdUM3NzhcXHVENTU4XFx1QzlDMCBcXHVCQUJCXFx1RDU4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNC5cIixcclxuICAgIG5vdGljZVBhdHRlcm5Ob3RlQ3JlYXRlZDogXCJcXHVEMzI4XFx1RDEzNCBcXHVCMTc4XFx1RDJCOFxcdUI5N0MgXFx1QjlDQ1xcdUI0RTRcXHVDNUM4XFx1QzJCNVxcdUIyQzhcXHVCMkU0OiB7cGF0aH1cIixcclxuICAgIG5vdGljZVRvb2xCdXN5OiBcIlxcdUIyRTRcXHVCOTc4IFxcdUM3OTFcXHVDNUM1XFx1Qzc3NCBcXHVDNzc0XFx1QkJGOCBcXHVDMkU0XFx1RDU4OSBcXHVDOTExXFx1Qzc4NVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgbm90aWNlTm9QYXR0ZXJuczogXCJcXHVEMzI4XFx1RDEzNFxcdUM3NDQgXFx1RDU1OFxcdUIwOTggXFx1Qzc3NFxcdUMwQzEgXFx1QzEyMFxcdUQwRERcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBub3RpY2VOb1NlbGVjdGVkRmlsZXM6IFwiXFx1RDMwQ1xcdUM3N0NcXHVDNzQ0IFxcdUQ1NThcXHVCMDk4IFxcdUM3NzRcXHVDMEMxIFxcdUMxMjBcXHVEMEREXFx1RDU1OFxcdUMxMzhcXHVDNjk0LlwiLFxyXG4gICAgbm90aWNlTm9JbnB1dERpcjogXCJcXHVDNzg1XFx1QjgyNSBcXHVBQ0JEXFx1Qjg1Q1xcdUI5N0MgXFx1QkEzQ1xcdUM4MDAgXFx1Qzc4NVxcdUI4MjVcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBub3RpY2VOb091dHB1dERpcjogXCJcXHVDRDlDXFx1QjgyNSBcXHVBQ0JEXFx1Qjg1Q1xcdUI5N0MgXFx1QkEzQ1xcdUM4MDAgXFx1Qzc4NVxcdUI4MjVcXHVENTU4XFx1QzEzOFxcdUM2OTQuXCIsXHJcbiAgICBub3RpY2VOb1Rvb2xDb25maWc6IFwiXFx1QzU0NFxcdUM5QzEgXFx1QzZDQ1xcdUQwNkNcXHVENTBDXFx1Qjg1Q1xcdUM2QjAgXFx1QzEyNFxcdUM4MTVcXHVDNzQ0IFxcdUJEODhcXHVCN0VDXFx1QzYyNFxcdUM5QzAgXFx1QkFCQlxcdUQ1ODhcXHVDMkI1XFx1QjJDOFxcdUIyRTQuXCIsXHJcbiAgICBub3RpY2VDaGF0U3RvcHBlZDogXCJcXHVDQzQ0XFx1RDMwNSBcXHVDMEREXFx1QzEzMVxcdUM3NDQgXFx1QzkxMVxcdUIyRThcXHVENTg4XFx1QzJCNVxcdUIyQzhcXHVCMkU0LlwiLFxyXG4gICAgbm90aWNlQ2hhdFN0b3BGYWlsZWQ6IFwiXFx1Q0M0NFxcdUQzMDUgXFx1QzkxMVxcdUIyRTggXFx1QzY5NFxcdUNDQURcXHVDNUQwIFxcdUMyRTRcXHVEMzI4XFx1RDU4OFxcdUMyQjVcXHVCMkM4XFx1QjJFNDoge21lc3NhZ2V9XCIsXHJcbiAgICBidXR0b25SdW5JbkN1cnJlbnRQYW5lbDogXCJcXHVENjA0XFx1QzdBQyBcXHVEMzI4XFx1QjExMFxcdUM1RDBcXHVDMTFDIFxcdUMwQUNcXHVDNkE5XCJcclxuICB9XHJcbn07XHJcblxyXG50eXBlIFRvb2xOYW1lID0gXCJjaGF0XCIgfCBcImdlbmVyYXRvclwiIHwgXCJ0YWdnZXJcIiB8IFwiaW5nZXN0XCI7XHJcbnR5cGUgVmlld1RhYiA9IFwiY2hhdFwiIHwgXCJnZW5lcmF0b3JcIiB8IFwidGFnZ2VyXCIgfCBcImluZ2VzdFwiIHwgXCJsb2dzXCI7XHJcblxyXG50eXBlIFRvb2xTdHJlYW1DaHVuayA9IHtcclxuICBzdGVwPzogc3RyaW5nO1xyXG4gIG1lc3NhZ2U/OiBzdHJpbmc7XHJcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIFRvb2xDb25maWcgPSB7XHJcbiAgZGVmYXVsdHM/OiB7XHJcbiAgICBtb2RlbD86IHN0cmluZztcclxuICAgIHRlbXBlcmF0dXJlPzogbnVtYmVyO1xyXG4gIH07XHJcbiAgbW9kZWxfb3B0aW9ucz86IHN0cmluZ1tdO1xyXG4gIGpvYnM/OiBUb29sSm9iW107XHJcbiAgcGF0dGVybnM/OiBzdHJpbmdbXTtcclxuICBwYXR0ZXJuX3ByZXZpZXdzPzogUmVjb3JkPHN0cmluZywgUGF0dGVyblByZXZpZXc+O1xyXG4gIHBhdHRlcm5fZ3JvdXBzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xyXG4gIHBhdHRlcm5fZWRpdG9yPzogUGF0dGVybkVkaXRvckNvbmZpZztcclxuICB0YXJnZXRfc2V0cz86IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcclxuICBkZWZhdWx0X2lucHV0X2Rpcj86IHN0cmluZztcclxuICBkZWZhdWx0X291dHB1dF9kaXI/OiBzdHJpbmc7XHJcbiAgdGFnZ2VyX2luZGV4X21hbmlmZXN0Pzoge1xyXG4gICAgZ2VuZXJhdGVkX2F0Pzogc3RyaW5nO1xyXG4gICAgc2NvcGU/OiBzdHJpbmc7XHJcbiAgICBjb3VudHM/OiB7XHJcbiAgICAgIG5vdGVzPzogbnVtYmVyO1xyXG4gICAgICBncmFwaF9ub2Rlcz86IG51bWJlcjtcclxuICAgICAgZ3JhcGhfZWRnZXM/OiBudW1iZXI7XHJcbiAgICAgIHRva2Vucz86IG51bWJlcjtcclxuICAgIH07XHJcbiAgICBtYW5pZmVzdF9wYXRoPzogc3RyaW5nO1xyXG4gIH07XHJcbiAgdGFnZ2VyX3J1bGVzPzogVGFnZ2VyUnVsZXNDb25maWc7XHJcbn07XHJcblxyXG50eXBlIFRvb2xKb2IgPSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHN1YmplY3Q/OiBzdHJpbmc7XHJcbiAgaW5wdXRfZGlyPzogc3RyaW5nO1xyXG4gIG91dHB1dF9kaXI/OiBzdHJpbmc7XHJcbiAgaW5wdXRfZGlyX3Jlc29sdmVkPzogc3RyaW5nO1xyXG4gIG91dHB1dF9kaXJfcmVzb2x2ZWQ/OiBzdHJpbmc7XHJcbiAgbW9kZWw/OiBzdHJpbmc7XHJcbiAgdGVtcGVyYXR1cmU/OiBudW1iZXI7XHJcbiAgdGFyZ2V0cz86IHN0cmluZ1tdO1xyXG4gIGluZ2VzdD86IHtcclxuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xyXG4gICAgY29sbGVjdGlvbl9yYXc/OiBzdHJpbmc7XHJcbiAgICBjb2xsZWN0aW9uX3N1bW1hcnk/OiBzdHJpbmc7XHJcbiAgfTtcclxufTtcclxuXHJcbnR5cGUgUGF0dGVyblByZXZpZXcgPSB7XHJcbiAgc3lzdGVtX3JvbGU/OiBzdHJpbmc7XHJcbiAgcHJvbXB0X3RlbXBsYXRlPzogc3RyaW5nO1xyXG4gIHNvdXJjZT86IHN0cmluZztcclxuICBzb3VyY2VfcGF0aD86IHN0cmluZztcclxuICBlZGl0b3Jfbm90ZV9wYXRoPzogc3RyaW5nO1xyXG4gIGdyb3Vwcz86IHN0cmluZ1tdO1xyXG4gIG91dHB1dF9zdWZmaXg/OiBzdHJpbmc7XHJcbiAgdXNlX3N1YmplY3RfcHJlZml4PzogYm9vbGVhbjtcclxufTtcclxuXHJcbnR5cGUgUGF0dGVybkVkaXRvckNvbmZpZyA9IHtcclxuICB2YXVsdF9kaXI/OiBzdHJpbmc7XHJcbiAgcmVhZG1lX3BhdGg/OiBzdHJpbmc7XHJcbiAgY29uZmlnX3BhdGg/OiBzdHJpbmc7XHJcbn07XHJcblxyXG50eXBlIFRhZ2dlclJ1bGVzQ29uZmlnID0ge1xyXG4gIHdvcmtzcGFjZT86IHtcclxuICAgIHJvb3Q/OiBzdHJpbmc7XHJcbiAgICBydWxlc19kaXI/OiBzdHJpbmc7XHJcbiAgICByZWFkbWVfcGF0aD86IHN0cmluZztcclxuICAgIGNhbm9uaWNhbF90YWdzX3BhdGg/OiBzdHJpbmc7XHJcbiAgICBzeW5vbnltX21hcF9wYXRoPzogc3RyaW5nO1xyXG4gICAgdGFnZ2luZ19wcmlvcml0eV9wYXRoPzogc3RyaW5nO1xyXG4gIH07XHJcbiAgY2Fub25pY2FsX3RhZ19jb3VudD86IG51bWJlcjtcclxuICBjYW5vbmljYWxfZ3JvdXBzPzogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcclxuICBzeW5vbnltX2VudHJpZXM/OiBudW1iZXI7XHJcbiAgdGhyZXNob2xkcz86IHtcclxuICAgIHNlbWFudGljX3RhZ19saW1pdD86IG51bWJlcjtcclxuICAgIG1pbl9zY29yZT86IG51bWJlcjtcclxuICAgIG1pbl9yYXRpbz86IG51bWJlcjtcclxuICB9O1xyXG59O1xyXG5cclxudHlwZSBXb3JrZmxvd0xvZ0VudHJ5ID0ge1xyXG4gIHRvb2w6IFRvb2xOYW1lO1xyXG4gIG1lc3NhZ2U6IHN0cmluZztcclxuICB0aW1lc3RhbXA6IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgVG9vbEZpbGVFbnRyeSA9IHtcclxuICBwYXRoOiBzdHJpbmc7XHJcbiAgZm9sZGVyOiBzdHJpbmc7XHJcbiAgZm9sZGVyTGFiZWw6IHN0cmluZztcclxuICBmb2xkZXJQYXJlbnQ6IHN0cmluZztcclxuICBzaXplOiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIEdlbmVyYXRvclJvb3RFbnRyeSA9IHtcclxuICBwYXRoOiBzdHJpbmc7XHJcbiAgbGFiZWw6IHN0cmluZztcclxuICBjb3VudDogbnVtYmVyO1xyXG4gIHNpemU6IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgR2VuZXJhdG9yTW9kZSA9IFwic3RhbmRhcmRcIiB8IFwibm90ZV9yZWJ1aWxkXCI7XHJcblxyXG50eXBlIEdlbmVyYXRvclN0YXRlID0ge1xyXG4gIGpvYk5hbWU6IHN0cmluZztcclxuICBtb2RlOiBHZW5lcmF0b3JNb2RlO1xyXG4gIGlucHV0RGlyOiBzdHJpbmc7XHJcbiAgb3V0cHV0RGlyOiBzdHJpbmc7XHJcbiAgc3ViamVjdDogc3RyaW5nO1xyXG4gIHJlYnVpbGRUaXRsZTogYm9vbGVhbjtcclxuICBtb2RlbE5hbWU6IHN0cmluZztcclxuICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xyXG4gIHRhcmdldFNldDogc3RyaW5nO1xyXG4gIHBhdHRlcm5LZXlzOiBzdHJpbmdbXTtcclxuICBmaWxlc1BhdGg6IHN0cmluZztcclxuICBmaWxlczogc3RyaW5nW107XHJcbiAgZmlsZUVudHJpZXM6IFRvb2xGaWxlRW50cnlbXTtcclxuICBzZWxlY3RlZEZpbGVzOiBzdHJpbmdbXTtcclxuICBmb2N1c2VkRm9sZGVyOiBzdHJpbmc7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgcHJvZ3Jlc3M6IG51bWJlcjtcclxuICBmaWxlRXJyb3I6IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgVGFnZ2VyU3RhdGUgPSB7XHJcbiAgaW5wdXREaXI6IHN0cmluZztcclxuICB0YXJnZXQ6IFwic3VtbWFyeVwiIHwgXCJyYXdcIiB8IFwiYWxsXCI7XHJcbiAgbW9kZTogXCJpbmNyZW1lbnRhbFwiIHwgXCJyZXNldFwiO1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG59O1xyXG5cclxudHlwZSBJbmdlc3RTdGF0ZSA9IHtcclxuICBqb2I6IHN0cmluZztcclxuICBpbnB1dERpcjogc3RyaW5nO1xyXG4gIG91dHB1dERpcjogc3RyaW5nO1xyXG4gIGxheWVyOiBcInN1bW1hcnlcIiB8IFwicmF3XCIgfCBcImJvdGhcIjtcclxuICBtb2RlOiBcImluY3JlbWVudGFsXCIgfCBcInJlc2V0XCIgfCBcImNsZWFudXBcIjtcclxuICBwb2xpY3k6IFwiYXV0b1wiIHwgXCJoZWFkaW5nc1wiIHwgXCJwYXJhZ3JhcGhcIiB8IFwibWluaW1hbFwiO1xyXG4gIGNodW5rU2l6ZTogbnVtYmVyO1xyXG4gIG92ZXJsYXA6IG51bWJlcjtcclxuICBoZWFkaW5nTGV2ZWxzOiBudW1iZXJbXTtcclxuICBjb2RlQXR0YWNoOiBib29sZWFuO1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG59O1xyXG5cclxuY29uc3QgTUFOVUFMX0pPQiA9IFwiX19tYW51YWxfX1wiO1xyXG5jb25zdCBNQU5VQUxfVEFSR0VUX1NFVCA9IFwiX19tYW51YWxfX1wiO1xyXG5jb25zdCBHRU5FUkFUT1JfUk9PVF9TRU5USU5FTCA9IFwiX192YXVsdF9yb290X19cIjtcclxuY29uc3QgR0VORVJBVE9SX01PREVfU1RBTkRBUkQ6IEdlbmVyYXRvck1vZGUgPSBcInN0YW5kYXJkXCI7XHJcbmNvbnN0IEdFTkVSQVRPUl9NT0RFX05PVEVfUkVCVUlMRDogR2VuZXJhdG9yTW9kZSA9IFwibm90ZV9yZWJ1aWxkXCI7XHJcbmNvbnN0IE5PVEVfUkVCVUlMRF9UQVJHRVRfU0VUID0gXCJcdUIxNzhcdUQyQjggXHVDN0FDXHVBRDZDXHVDMTMxXCI7XG5jb25zdCBUSVRMRV9SRUJVSUxEX1BBVFRFUk4gPSBcIlRpdGxlX1JlYnVpbGRcIjtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRHZW5lcmF0b3JTdGF0ZSgpOiBHZW5lcmF0b3JTdGF0ZSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGpvYk5hbWU6IE1BTlVBTF9KT0IsXHJcbiAgICBtb2RlOiBcInN0YW5kYXJkXCIsXHJcbiAgICBpbnB1dERpcjogXCJcIixcclxuICAgIG91dHB1dERpcjogXCJcIixcclxuICAgIHN1YmplY3Q6IFwiTmV3IFByb2plY3RcIixcclxuICAgIHJlYnVpbGRUaXRsZTogZmFsc2UsXHJcbiAgICBtb2RlbE5hbWU6IFwicXdlbjMuNTo0YlwiLFxyXG4gICAgdGVtcGVyYXR1cmU6IDAuMSxcclxuICAgIHRhcmdldFNldDogTUFOVUFMX1RBUkdFVF9TRVQsXHJcbiAgICBwYXR0ZXJuS2V5czogW10sXHJcbiAgICBmaWxlc1BhdGg6IFwiXCIsXHJcbiAgICBmaWxlczogW10sXHJcbiAgICBmaWxlRW50cmllczogW10sXHJcbiAgICBzZWxlY3RlZEZpbGVzOiBbXSxcclxuICAgIGZvY3VzZWRGb2xkZXI6IFwiXCIsXHJcbiAgICBzdGF0dXM6IFwiXCIsXHJcbiAgICBwcm9ncmVzczogMCxcclxuICAgIGZpbGVFcnJvcjogXCJcIixcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVEZWZhdWx0VGFnZ2VyU3RhdGUoKTogVGFnZ2VyU3RhdGUge1xyXG4gIHJldHVybiB7XHJcbiAgICBpbnB1dERpcjogXCJcIixcclxuICAgIHRhcmdldDogXCJzdW1tYXJ5XCIsXHJcbiAgICBtb2RlOiBcImluY3JlbWVudGFsXCIsXHJcbiAgICBzdGF0dXM6IFwiXCIsXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEluZ2VzdFN0YXRlKCk6IEluZ2VzdFN0YXRlIHtcclxuICByZXR1cm4ge1xyXG4gICAgam9iOiBcImFsbFwiLFxyXG4gICAgaW5wdXREaXI6IFwiXCIsXHJcbiAgICBvdXRwdXREaXI6IFwiXCIsXHJcbiAgICBsYXllcjogXCJib3RoXCIsXHJcbiAgICBtb2RlOiBcImluY3JlbWVudGFsXCIsXHJcbiAgICBwb2xpY3k6IFwiYXV0b1wiLFxyXG4gICAgY2h1bmtTaXplOiA4MDAsXHJcbiAgICBvdmVybGFwOiAxMDAsXHJcbiAgICBoZWFkaW5nTGV2ZWxzOiBbMSwgMiwgM10sXHJcbiAgICBjb2RlQXR0YWNoOiBmYWxzZSxcclxuICAgIHN0YXR1czogXCJcIixcclxuICB9O1xyXG59XHJcblxyXG50eXBlIFN0cmVhbUNodW5rID0ge1xuICBzdGVwPzogc3RyaW5nO1xuICBhbnN3ZXI/OiBzdHJpbmc7XG4gIGxvZ3M/OiBzdHJpbmdbXTtcbiAgc291cmNlcz86IFN0cmVhbVNvdXJjZVtdO1xuICByZWNvbW1lbmRhdGlvbnM/OiBSZWNvbW1lbmRhdGlvbkl0ZW1bXTtcbiAgcm91dGU/OiBzdHJpbmc7XG4gIGJhc2lzPzogc3RyaW5nO1xuICBzdGF0ZT86IHtcbiAgICBsb2dzPzogc3RyaW5nW107XG4gIH07XG59O1xyXG5cclxudHlwZSBTdHJlYW1Tb3VyY2UgPSB7XG4gIHBhdGg6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBsYXllcjogXCJzdW1tYXJ5XCIgfCBcInJhd1wiO1xuICBzY29yZTogbnVtYmVyO1xuICBzbmlwcGV0Pzogc3RyaW5nO1xyXG4gIGZvbGRlcj86IHN0cmluZztcclxuICBpc19tYWluPzogYm9vbGVhbjtcclxuICBzb3VyY2U/OiBzdHJpbmc7XHJcbiAgcmVhc29uPzogc3RyaW5nO1xuICBzZWN0aW9uX2hlYWRpbmc/OiBzdHJpbmc7XG4gIG5vdGVfdHlwZT86IHN0cmluZztcbiAgZG9jX3JvbGU/OiBzdHJpbmc7XG4gIHByb2plY3RfaWQ/OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgZXh0ZXJuYWxfcmVmX2RvbWFpbnM/OiBzdHJpbmdbXTtcbiAgcmVsYXRpb25fdHlwZT86IHN0cmluZztcbn07XG5cbnR5cGUgUmVjb21tZW5kYXRpb25JdGVtID0ge1xuICBwYXRoOiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHJlbGF0aW9uX3R5cGU/OiBzdHJpbmc7XG4gIGNvbmZpZGVuY2U/OiBudW1iZXI7XG4gIHJlYXNvbj86IHN0cmluZztcbiAgbm90ZV90eXBlPzogc3RyaW5nO1xuICBkb2Nfcm9sZT86IHN0cmluZztcbiAgcHJvamVjdF9pZD86IHN0cmluZztcbiAgZm9sZGVyPzogc3RyaW5nO1xuICBzZWVkX3RpdGxlcz86IHN0cmluZ1tdO1xufTtcblxudHlwZSBDaGF0VHVybiA9IHtcbiAgcXVlc3Rpb246IHN0cmluZztcbiAgYW5zd2VyOiBzdHJpbmc7XG4gIGJhc2lzPzogc3RyaW5nO1xuICByb3V0ZT86IHN0cmluZztcbiAgc291cmNlczogU3RyZWFtU291cmNlW107XG4gIHJlY29tbWVuZGF0aW9uczogUmVjb21tZW5kYXRpb25JdGVtW107XG4gIGF0dGFjaGVkRmlsZVBhdGg6IHN0cmluZztcbiAgY29udGV4dEVudHJpZXM6IFN0b3JlZENvbnRleHRFbnRyeVtdO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbn07XG5cbnR5cGUgQ29udGV4dFNvdXJjZSA9IFwibGlua3NcIiB8IFwiZm9sZGVyXCIgfCBcInRhZ3NcIiB8IFwiYmFja2xpbmtzXCI7XG5cbnR5cGUgQ29udGV4dEVudHJ5ID0gU3RvcmVkQ29udGV4dEVudHJ5O1xuXHJcbnR5cGUgU291cmNlQ2FyZERhdGEgPSB7XHJcbiAgbGFiZWw6IHN0cmluZztcclxuICBwYXRoOiBzdHJpbmc7XHJcbiAgYmFkZ2U6IHN0cmluZztcclxuICBiYWRnZUNsYXNzOiBzdHJpbmc7XHJcbiAgc25pcHBldD86IHN0cmluZztcclxuICByZWFzb24/OiBzdHJpbmc7XHJcbiAgc2Vjb25kYXJ5QmFkZ2U/OiBzdHJpbmc7XG4gIHNlY29uZGFyeUJhZGdlQ2xhc3M/OiBzdHJpbmc7XG4gIHRlcnRpYXJ5QmFkZ2U/OiBzdHJpbmc7XG4gIHRlcnRpYXJ5QmFkZ2VDbGFzcz86IHN0cmluZztcbiAgcXVhdGVybmFyeUJhZGdlPzogc3RyaW5nO1xuICBxdWF0ZXJuYXJ5QmFkZ2VDbGFzcz86IHN0cmluZztcbiAgaGludDogc3RyaW5nO1xufTtcblxyXG5jbGFzcyBMb2NhbEFnZW50VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcclxuICBwbHVnaW46IExvY2FsQWdlbnRQbHVnaW47XHJcbiAgc3RhdHVzRWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBjaGF0TG9nRWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBxdWVzdGlvbkVsITogSFRNTFRleHRBcmVhRWxlbWVudDtcclxuICBjb21wb3NlUm93RWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBjaGF0TWV0YUVsITogSFRNTERpdkVsZW1lbnQ7XG4gIHRocmVhZFJvd0VsITogSFRNTERpdkVsZW1lbnQ7XG4gIGNoYXRUYWJQaWNrZXJFbCE6IEhUTUxEaXZFbGVtZW50O1xuICBjaGF0VGFiQnV0dG9uRWwhOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgY2hhdFRocmVhZE1lbnVCdXR0b25FbCE6IEhUTUxCdXR0b25FbGVtZW50O1xuICBxdWlja0FjdGlvblN1Z2dlc3Rpb25zRWwhOiBIVE1MRGl2RWxlbWVudDtcbiAgY29udGV4dEVsITogSFRNTERpdkVsZW1lbnQ7XHJcbiAgdGFiUm93RWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICB0YWJDb250ZW50RWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBjaGF0VGFiRWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBnZW5lcmF0b3JUYWJFbCE6IEhUTUxEaXZFbGVtZW50O1xyXG4gIHRhZ2dlclRhYkVsITogSFRNTERpdkVsZW1lbnQ7XHJcbiAgaW5nZXN0VGFiRWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBsb2dzVGFiRWwhOiBIVE1MRGl2RWxlbWVudDtcbiAgc2VudENvbnRleHREZXRhaWxzRWwhOiBIVE1MRGV0YWlsc0VsZW1lbnQ7XG4gIHNvdXJjZURldGFpbHNFbCE6IEhUTUxEZXRhaWxzRWxlbWVudDtcbiAgcmVjb21tZW5kYXRpb25EZXRhaWxzRWwhOiBIVE1MRGV0YWlsc0VsZW1lbnQ7XG4gIGNoYXRBY3Rpb25CdXR0b24hOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgYmFja2VuZENvbnRyb2xzRWwhOiBIVE1MRGV0YWlsc0VsZW1lbnQ7XHJcbiAgYmFja2VuZFN0YXJ0QnV0dG9uITogSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgYmFja2VuZFN0b3BCdXR0b24hOiBIVE1MQnV0dG9uRWxlbWVudDtcclxuICBiYWNrZW5kUmVzdGFydEJ1dHRvbiE6IEhUTUxCdXR0b25FbGVtZW50O1xuICBvcGVuQXBpQnV0dG9uITogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIGNvbnZlcnNhdGlvbkFjdGlvbnNFbCE6IEhUTUxEZXRhaWxzRWxlbWVudDtcbiAgY2xlYXJDb252ZXJzYXRpb25CdXR0b24hOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgYXBwZW5kQnV0dG9uITogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHNhdmVCdXR0b24hOiBIVE1MQnV0dG9uRWxlbWVudDtcbiAgZ2VuZXJhdG9yUGFuZWxFbCE6IEhUTUxEaXZFbGVtZW50O1xyXG4gIHRhZ2dlclBhbmVsRWwhOiBIVE1MRGl2RWxlbWVudDtcclxuICBpbmdlc3RQYW5lbEVsITogSFRNTERpdkVsZW1lbnQ7XHJcbiAgd29ya2Zsb3dMb2dzUGFuZWxFbCE6IEhUTUxEaXZFbGVtZW50O1xyXG4gIHRhYkJ1dHRvbnMgPSBuZXcgTWFwPFZpZXdUYWIsIEhUTUxCdXR0b25FbGVtZW50PigpO1xyXG4gIHF1aWNrQWN0aW9uQnV0dG9uczogSFRNTEJ1dHRvbkVsZW1lbnRbXSA9IFtdO1xyXG4gIGFib3J0Q29udHJvbGxlcjogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XHJcbiAgYWN0aXZlUmVxdWVzdDogaHR0cC5DbGllbnRSZXF1ZXN0IHwgbnVsbCA9IG51bGw7XG4gIGFjdGl2ZVRocmVhZElkID0gXCJcIjtcbiAgcmVuZGVyZWRPdXRwdXQgPSBcIlwiO1xuICBsYXN0UXVlc3Rpb24gPSBcIlwiO1xyXG4gIGFjdGl2ZVNlc3Npb25JZCA9IFwiXCI7XHJcbiAgY3VycmVudEZpbGVQYXRoID0gXCJcIjtcclxuICBjaGF0U2VlbkxvZ3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY2hhdFR1cm5zOiBDaGF0VHVybltdID0gW107XG4gIGxhc3RFbnRlclN1Ym1pdEF0ID0gMDtcbiAgY3VycmVudENvbnRleHRFbnRyaWVzOiBDb250ZXh0RW50cnlbXSA9IFtdO1xuICBiYWNrZW5kU291cmNlczogU3RyZWFtU291cmNlW10gPSBbXTtcbiAgYmFja2VuZFJlY29tbWVuZGF0aW9uczogUmVjb21tZW5kYXRpb25JdGVtW10gPSBbXTtcbiAgYW5zd2VyQmFzaXMgPSBcIlwiO1xuICBydW5uaW5nVGFzazogVG9vbE5hbWUgfCBudWxsID0gbnVsbDtcclxuICBhY3RpdmVUYWI6IFZpZXdUYWIgPSBcImNoYXRcIjtcclxuICB3b3JrZmxvd0xvZ3M6IFdvcmtmbG93TG9nRW50cnlbXSA9IFtdO1xyXG4gIGdlbmVyYXRvckxvZ3M6IHN0cmluZ1tdID0gW107XHJcbiAgdGFnZ2VyTG9nczogc3RyaW5nW10gPSBbXTtcclxuICBpbmdlc3RMb2dzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIHRvb2xDb25maWc6IFRvb2xDb25maWcgfCBudWxsID0gbnVsbDtcclxuICB0b29sQ29uZmlnSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICB0b29sQ29uZmlnRXJyb3IgPSBcIlwiO1xyXG4gIGJhY2tlbmRSZWFkeSA9IGZhbHNlO1xyXG4gIGJhY2tlbmRQb2xsU3RhcnRlZCA9IGZhbHNlO1xyXG4gIGJhY2tlbmRMYXVuY2hQcm9taXNlOiBQcm9taXNlPGJvb2xlYW4+IHwgbnVsbCA9IG51bGw7XHJcbiAgbGFzdEF1dG9TdGFydEF0dGVtcHQgPSAwO1xyXG4gIGF1dG9TdGFydFN1cHByZXNzZWQgPSBmYWxzZTtcclxuICBnZW5lcmF0b3JTdGF0ZTogR2VuZXJhdG9yU3RhdGUgPSBjcmVhdGVEZWZhdWx0R2VuZXJhdG9yU3RhdGUoKTtcclxuICB0YWdnZXJTdGF0ZTogVGFnZ2VyU3RhdGUgPSBjcmVhdGVEZWZhdWx0VGFnZ2VyU3RhdGUoKTtcclxuICBpbmdlc3RTdGF0ZTogSW5nZXN0U3RhdGUgPSBjcmVhdGVEZWZhdWx0SW5nZXN0U3RhdGUoKTtcclxuXHJcbiAgY29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgcGx1Z2luOiBMb2NhbEFnZW50UGx1Z2luKSB7XHJcbiAgICBzdXBlcihsZWFmKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBWSUVXX1RZUEVfTE9DQUxfQUdFTlQ7XHJcbiAgfVxyXG5cclxuICBnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMucGx1Z2luLnQoXCJ2aWV3RGlzcGxheU5hbWVcIik7XHJcbiAgfVxyXG5cclxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLmluaXRpYWxpemVUaHJlYWRTdGF0ZSgpO1xuICAgIGF3YWl0IHRoaXMucmVmcmVzaENvbnRleHQodHJ1ZSk7XG4gICAgdGhpcy5pbml0aWFsaXplVG9vbERlZmF1bHRzKHRydWUpO1xuICAgIGF3YWl0IHRoaXMubG9hZEdlbmVyYXRvckZpbGVzKCk7XG4gIH1cblxyXG4gIGFzeW5jIG9uQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0aGlzLmJhY2tlbmRQb2xsU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5hYm9ydEFjdGl2ZVJlcXVlc3QoKTtcclxuICB9XHJcblxyXG4gIHQoa2V5OiBzdHJpbmcsIHZhcnM/OiBUcmFuc2xhdGlvblZhcnMpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBsdWdpbi50KGtleSwgdmFycyk7XG4gIH1cblxuICBpbml0aWFsaXplVGhyZWFkU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5wbHVnaW4uZW5zdXJlQ2hhdFRocmVhZHMoKTtcbiAgICB0aGlzLmFjdGl2ZVRocmVhZElkID0gdGhpcy5wbHVnaW4uYWN0aXZlQ2hhdFRocmVhZElkO1xuICAgIHRoaXMuc3luY1RocmVhZFN0YXRlRnJvbVBsdWdpbigpO1xuICB9XG5cbiAgc3luY1RocmVhZFN0YXRlRnJvbVBsdWdpbigpOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVUaHJlYWQgPSB0aGlzLnBsdWdpbi5nZXRDaGF0VGhyZWFkKHRoaXMuYWN0aXZlVGhyZWFkSWQpID8/IHRoaXMucGx1Z2luLmNoYXRUaHJlYWRzWzBdID8/IG51bGw7XG4gICAgaWYgKCFhY3RpdmVUaHJlYWQpIHtcbiAgICAgIHRoaXMuY2hhdFR1cm5zID0gW107XG4gICAgICB0aGlzLmN1cnJlbnRDb250ZXh0RW50cmllcyA9IFtdO1xuICAgICAgdGhpcy5iYWNrZW5kU291cmNlcyA9IFtdO1xuICAgICAgdGhpcy5iYWNrZW5kUmVjb21tZW5kYXRpb25zID0gW107XG4gICAgICB0aGlzLmFuc3dlckJhc2lzID0gXCJcIjtcbiAgICAgIHRoaXMucmVuZGVyZWRPdXRwdXQgPSBcIlwiO1xuICAgICAgdGhpcy5sYXN0UXVlc3Rpb24gPSBcIlwiO1xuICAgICAgdGhpcy5yZW5kZXJUaHJlYWRSb3coKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZVRocmVhZElkID0gYWN0aXZlVGhyZWFkLmlkO1xuICAgIHRoaXMucGx1Z2luLmFjdGl2ZUNoYXRUaHJlYWRJZCA9IGFjdGl2ZVRocmVhZC5pZDtcbiAgICB0aGlzLmNoYXRUdXJucyA9IChhY3RpdmVUaHJlYWQudHVybnMgPz8gW10pLm1hcCgodHVybikgPT4gKHtcbiAgICAgIHF1ZXN0aW9uOiB0dXJuLnF1ZXN0aW9uID8/IFwiXCIsXG4gICAgICBhbnN3ZXI6IHR1cm4uYW5zd2VyID8/IFwiXCIsXG4gICAgICBiYXNpczogdHVybi5iYXNpcyA/PyBcIlwiLFxuICAgICAgcm91dGU6IHR1cm4ucm91dGUgPz8gXCJcIixcbiAgICAgIHNvdXJjZXM6IEFycmF5LmlzQXJyYXkodHVybi5zb3VyY2VzKSA/IHR1cm4uc291cmNlcyA6IFtdLFxuICAgICAgcmVjb21tZW5kYXRpb25zOiBBcnJheS5pc0FycmF5KHR1cm4ucmVjb21tZW5kYXRpb25zKSA/IHR1cm4ucmVjb21tZW5kYXRpb25zIDogW10sXG4gICAgICBhdHRhY2hlZEZpbGVQYXRoOiB0dXJuLmF0dGFjaGVkRmlsZVBhdGggPz8gXCJcIixcbiAgICAgIGNvbnRleHRFbnRyaWVzOiBBcnJheS5pc0FycmF5KHR1cm4uY29udGV4dEVudHJpZXMpID8gdHVybi5jb250ZXh0RW50cmllcyA6IFtdLFxuICAgICAgY3JlYXRlZEF0OiB0dXJuLmNyZWF0ZWRBdCA/PyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSkpO1xuICAgIGFjdGl2ZVRocmVhZC50dXJucyA9IHRoaXMuY2hhdFR1cm5zIGFzIFN0b3JlZENoYXRUdXJuW107XG4gICAgY29uc3QgbGF0ZXN0U3RhdGVUdXJuID0gdGhpcy5nZXRMYXRlc3RTdGF0ZVR1cm4oKTtcbiAgICBjb25zdCBsYXRlc3RUdXJuID0gdGhpcy5nZXRMYXRlc3RDb21wbGV0ZWRUdXJuKCk7XG4gICAgdGhpcy5jdXJyZW50Q29udGV4dEVudHJpZXMgPSBsYXRlc3RTdGF0ZVR1cm4/LmNvbnRleHRFbnRyaWVzID8/IFtdO1xuICAgIHRoaXMuYmFja2VuZFNvdXJjZXMgPSBsYXRlc3RTdGF0ZVR1cm4/LnNvdXJjZXMgPz8gW107XG4gICAgdGhpcy5iYWNrZW5kUmVjb21tZW5kYXRpb25zID0gbGF0ZXN0U3RhdGVUdXJuPy5yZWNvbW1lbmRhdGlvbnMgPz8gW107XG4gICAgdGhpcy5hbnN3ZXJCYXNpcyA9IGxhdGVzdFR1cm4/LmJhc2lzID8/IFwiXCI7XG4gICAgdGhpcy5yZW5kZXJlZE91dHB1dCA9IGxhdGVzdFR1cm4/LmFuc3dlciA/PyBcIlwiO1xuICAgIHRoaXMubGFzdFF1ZXN0aW9uID0gbGF0ZXN0U3RhdGVUdXJuPy5xdWVzdGlvbiA/PyBcIlwiO1xuICAgIHRoaXMucmVuZGVyVGhyZWFkUm93KCk7XG4gIH1cblxuICBhc3luYyBzZXRBY3RpdmVUaHJlYWQodGhyZWFkSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aHJlYWRJZCA9PT0gdGhpcy5hY3RpdmVUaHJlYWRJZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0aHJlYWQgPSB0aGlzLnBsdWdpbi5nZXRDaGF0VGhyZWFkKHRocmVhZElkKTtcbiAgICBpZiAodGhyZWFkKSB7XG4gICAgICB0aHJlYWQudXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgdGhpcy5wbHVnaW4uc29ydENoYXRUaHJlYWRzQnlSZWNlbnQoKTtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVUaHJlYWRJZCA9IHRocmVhZElkO1xuICAgIHRoaXMucGx1Z2luLmFjdGl2ZUNoYXRUaHJlYWRJZCA9IHRocmVhZElkO1xuICAgIHRoaXMuc3luY1RocmVhZFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIGlmICh0aGlzLnF1ZXN0aW9uRWwpIHtcbiAgICAgIHRoaXMucXVlc3Rpb25FbC52YWx1ZSA9IFwiXCI7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgIGF3YWl0IHRoaXMucmVuZGVyT3V0cHV0KCk7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJDb250ZXh0UGFuZWxzKCk7XG4gICAgdGhpcy51cGRhdGVDaGF0QWN0aW9uQnV0dG9uU3RhdGUoKTtcbiAgfVxuXG4gIGFzeW5jIHBlcnNpc3RBY3RpdmVUaHJlYWRTdGF0ZShyZW5kZXJUaHJlYWRSb3cgPSB0cnVlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdGhyZWFkUmVjb3JkID0gdGhpcy5wbHVnaW4uZ2V0Q2hhdFRocmVhZCh0aGlzLmFjdGl2ZVRocmVhZElkKTtcbiAgICBpZiAoIXRocmVhZFJlY29yZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJlYWRSZWNvcmQudHVybnMgPSB0aGlzLmNoYXRUdXJucyBhcyBTdG9yZWRDaGF0VHVybltdO1xuICAgIHRocmVhZFJlY29yZC51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdGhpcy5wbHVnaW4uc29ydENoYXRUaHJlYWRzQnlSZWNlbnQoKTtcbiAgICBpZiAocmVuZGVyVGhyZWFkUm93KSB7XG4gICAgICB0aGlzLnJlbmRlclRocmVhZFJvdygpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgfVxuXG4gIGdldFRocmVhZFR1cm5Db3VudCh0aHJlYWQ6IENoYXRUaHJlYWRSZWNvcmQpOiBudW1iZXIge1xuICAgIHJldHVybiAodGhyZWFkLnR1cm5zID8/IFtdKS5maWx0ZXIoKHR1cm4pID0+IHtcbiAgICAgIHJldHVybiBCb29sZWFuKHR1cm4ucXVlc3Rpb24/LnRyaW0oKSB8fCB0dXJuLmFuc3dlcj8udHJpbSgpKTtcbiAgICB9KS5sZW5ndGg7XG4gIH1cblxuICBmb3JtYXRUaHJlYWRUaW1lc3RhbXAoaXNvOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IERhdGUoaXNvKTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZS5nZXRUaW1lKCkpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBzYW1lRGF5ID1cbiAgICAgIHZhbHVlLmdldEZ1bGxZZWFyKCkgPT09IG5vdy5nZXRGdWxsWWVhcigpXG4gICAgICAmJiB2YWx1ZS5nZXRNb250aCgpID09PSBub3cuZ2V0TW9udGgoKVxuICAgICAgJiYgdmFsdWUuZ2V0RGF0ZSgpID09PSBub3cuZ2V0RGF0ZSgpO1xuICAgIGNvbnN0IGxvY2FsZSA9IHRoaXMucGx1Z2luLmxhbmd1YWdlKCkgPT09IFwia29cIiA/IFwia28tS1JcIiA6IFwiZW4tVVNcIjtcbiAgICBjb25zdCBvcHRpb25zOiBJbnRsLkRhdGVUaW1lRm9ybWF0T3B0aW9ucyA9IHNhbWVEYXlcbiAgICAgID8geyBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIiwgaG91cjEyOiBmYWxzZSB9XG4gICAgICA6IHsgbW9udGg6IFwiMi1kaWdpdFwiLCBkYXk6IFwiMi1kaWdpdFwiIH07XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KGxvY2FsZSwgb3B0aW9ucykuZm9ybWF0KHZhbHVlKTtcbiAgfVxuXG4gIGdldFRocmVhZE1ldGFMYWJlbCh0aHJlYWQ6IENoYXRUaHJlYWRSZWNvcmQpOiBzdHJpbmcge1xuICAgIGNvbnN0IHR1cm5zID0gdGhpcy50KFwidGhyZWFkVHVybnNcIiwgeyBjb3VudDogdGhpcy5nZXRUaHJlYWRUdXJuQ291bnQodGhyZWFkKSB9KTtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSB0aGlzLmZvcm1hdFRocmVhZFRpbWVzdGFtcCh0aHJlYWQudXBkYXRlZEF0IHx8IHRocmVhZC5jcmVhdGVkQXQpO1xuICAgIHJldHVybiB0aW1lc3RhbXAgPyBgJHt0dXJuc30gXHUwMEI3ICR7dGltZXN0YW1wfWAgOiB0dXJucztcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZU5ld1RocmVhZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0aHJlYWQgPSB0aGlzLnBsdWdpbi5jcmVhdGVDaGF0VGhyZWFkKCk7XG4gICAgdGhpcy5wbHVnaW4uY2hhdFRocmVhZHMudW5zaGlmdCh0aHJlYWQpO1xuICAgIHRoaXMucGx1Z2luLnNvcnRDaGF0VGhyZWFkc0J5UmVjZW50KCk7XG4gICAgdGhpcy5hY3RpdmVUaHJlYWRJZCA9IHRocmVhZC5pZDtcbiAgICB0aGlzLnBsdWdpbi5hY3RpdmVDaGF0VGhyZWFkSWQgPSB0aHJlYWQuaWQ7XG4gICAgdGhpcy5zeW5jVGhyZWFkU3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgaWYgKHRoaXMucXVlc3Rpb25FbCkge1xuICAgICAgdGhpcy5xdWVzdGlvbkVsLnZhbHVlID0gXCJcIjtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJPdXRwdXQoKTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlckNvbnRleHRQYW5lbHMoKTtcbiAgICB0aGlzLnVwZGF0ZUNoYXRBY3Rpb25CdXR0b25TdGF0ZSgpO1xuICB9XG5cbiAgYXN5bmMgcmVuYW1lQWN0aXZlVGhyZWFkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHRocmVhZCA9IHRoaXMucGx1Z2luLmdldENoYXRUaHJlYWQodGhpcy5hY3RpdmVUaHJlYWRJZCk7XG4gICAgaWYgKCF0aHJlYWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV4dFRpdGxlID0gd2luZG93LnByb21wdCh0aGlzLnQoXCJwcm9tcHRSZW5hbWVUaHJlYWRcIiksIHRocmVhZC50aXRsZSB8fCB0aGlzLnQoXCJ0aHJlYWRVbnRpdGxlZFwiKSk/LnRyaW0oKTtcbiAgICBpZiAoIW5leHRUaXRsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJlYWQudGl0bGUgPSBuZXh0VGl0bGU7XG4gICAgdGhyZWFkLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnBsdWdpbi5zb3J0Q2hhdFRocmVhZHNCeVJlY2VudCgpO1xuICAgIHRoaXMucmVuZGVyVGhyZWFkUm93KCk7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUaHJlYWRSZW5hbWVkXCIpKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZUFjdGl2ZVRocmVhZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0aHJlYWQgPSB0aGlzLnBsdWdpbi5nZXRDaGF0VGhyZWFkKHRoaXMuYWN0aXZlVGhyZWFkSWQpO1xuICAgIGlmICghdGhyZWFkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9rID0gd2luZG93LmNvbmZpcm0odGhpcy50KFwicHJvbXB0RGVsZXRlVGhyZWFkXCIpKTtcbiAgICBpZiAoIW9rKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wbHVnaW4uY2hhdFRocmVhZHMgPSB0aGlzLnBsdWdpbi5jaGF0VGhyZWFkcy5maWx0ZXIoKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLmlkICE9PSB0aHJlYWQuaWQpO1xuICAgIHRoaXMucGx1Z2luLmVuc3VyZUNoYXRUaHJlYWRzKCk7XG4gICAgdGhpcy5hY3RpdmVUaHJlYWRJZCA9IHRoaXMucGx1Z2luLmFjdGl2ZUNoYXRUaHJlYWRJZDtcbiAgICB0aGlzLnN5bmNUaHJlYWRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICBpZiAodGhpcy5xdWVzdGlvbkVsKSB7XG4gICAgICB0aGlzLnF1ZXN0aW9uRWwudmFsdWUgPSBcIlwiO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlck91dHB1dCgpO1xuICAgIGF3YWl0IHRoaXMucmVuZGVyQ29udGV4dFBhbmVscygpO1xuICAgIHRoaXMudXBkYXRlQ2hhdEFjdGlvbkJ1dHRvblN0YXRlKCk7XG4gICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUaHJlYWREZWxldGVkXCIpKTtcbiAgfVxuXG4gIHJlbmRlclRocmVhZFJvdygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudGhyZWFkUm93RWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy50aHJlYWRSb3dFbC5lbXB0eSgpO1xuXG4gICAgY29uc3Qgc29ydGVkVGhyZWFkcyA9IFsuLi50aGlzLnBsdWdpbi5jaGF0VGhyZWFkc10uc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKGIudXBkYXRlZEF0IHx8IGIuY3JlYXRlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShhLnVwZGF0ZWRBdCB8fCBhLmNyZWF0ZWRBdCkuZ2V0VGltZSgpO1xuICAgIH0pO1xuICAgIGNvbnN0IGFjdGl2ZVRocmVhZCA9IHNvcnRlZFRocmVhZHMuZmluZCgodGhyZWFkKSA9PiB0aHJlYWQuaWQgPT09IHRoaXMuYWN0aXZlVGhyZWFkSWQpID8/IHNvcnRlZFRocmVhZHNbMF0gPz8gbnVsbDtcbiAgICBjb25zdCBhY3RpdmVUaXRsZSA9IGFjdGl2ZVRocmVhZD8udGl0bGUgfHwgdGhpcy50KFwidGhyZWFkVW50aXRsZWRcIik7XG4gICAgY29uc3QgYWN0aXZlTWV0YSA9IGFjdGl2ZVRocmVhZCA/IHRoaXMuZ2V0VGhyZWFkTWV0YUxhYmVsKGFjdGl2ZVRocmVhZCkgOiBcIlwiO1xuICAgIGlmICh0aGlzLmNoYXRUaHJlYWRNZW51QnV0dG9uRWwpIHtcbiAgICAgIHRoaXMuY2hhdFRocmVhZE1lbnVCdXR0b25FbC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBgJHthY3RpdmVUaXRsZX0ke2FjdGl2ZU1ldGEgPyBgXFxuJHthY3RpdmVNZXRhfWAgOiBcIlwifWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRvb2xiYXJFbCA9IHRoaXMudGhyZWFkUm93RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10aHJlYWQtbWVudS10b29sYmFyXCIgfSk7XG4gICAgY29uc3QgbmV3QnV0dG9uID0gdG9vbGJhckVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgIGNsczogXCJvbGEtdGhyZWFkLW5ld1wiLFxuICAgICAgdGV4dDogYCsgJHt0aGlzLnQoXCJ0aHJlYWROZXdcIil9YCxcbiAgICB9KTtcbiAgICBuZXdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMuY2xvc2VDaGF0VGhyZWFkUGlja2VyKCk7XG4gICAgICB2b2lkIHRoaXMuY3JlYXRlTmV3VGhyZWFkKCk7XG4gICAgfSk7XG4gICAgY29uc3QgdGl0bGVFbCA9IHRvb2xiYXJFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRocmVhZC1tZW51LWN1cnJlbnRcIiB9KTtcbiAgICB0aXRsZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtdGhyZWFkLW1lbnUtY3VycmVudC10aXRsZVwiLCB0ZXh0OiBhY3RpdmVUaXRsZSB9KTtcbiAgICBpZiAoYWN0aXZlTWV0YSkge1xuICAgICAgdGl0bGVFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRocmVhZC1tZW51LWN1cnJlbnQtbWV0YVwiLCB0ZXh0OiBhY3RpdmVNZXRhIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RFbCA9IHRoaXMudGhyZWFkUm93RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10aHJlYWQtbWVudS1saXN0XCIgfSk7XG5cbiAgICBmb3IgKGNvbnN0IHRocmVhZCBvZiBzb3J0ZWRUaHJlYWRzKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IHRocmVhZC50aXRsZSB8fCB0aGlzLnQoXCJ0aHJlYWRVbnRpdGxlZFwiKTtcbiAgICAgIGNvbnN0IG1ldGEgPSB0aGlzLmdldFRocmVhZE1ldGFMYWJlbCh0aHJlYWQpO1xuICAgICAgY29uc3QgYnV0dG9uID0gbGlzdEVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgY2xzOiBcIm9sYS10aHJlYWQtbWVudS1pdGVtXCIgfSk7XG4gICAgICBidXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcImlzLWFjdGl2ZVwiLCB0aHJlYWQuaWQgPT09IHRoaXMuYWN0aXZlVGhyZWFkSWQpO1xuICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIGAke3RpdGxlfSR7bWV0YSA/IGBcXG4ke21ldGF9YCA6IFwiXCJ9YCk7XG4gICAgICBidXR0b24uY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10aHJlYWQtbWVudS1pdGVtLXRpdGxlXCIsIHRleHQ6IHRpdGxlIH0pO1xuICAgICAgYnV0dG9uLmNyZWF0ZURpdih7IGNsczogXCJvbGEtdGhyZWFkLW1lbnUtaXRlbS1tZXRhXCIsIHRleHQ6IG1ldGEgfSk7XG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZUNoYXRUaHJlYWRQaWNrZXIoKTtcbiAgICAgICAgdm9pZCB0aGlzLnNldEFjdGl2ZVRocmVhZCh0aHJlYWQuaWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHNvcnRlZFRocmVhZHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgdG9vbGJhckVsID0gdGhpcy50aHJlYWRSb3dFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRocmVhZC1tZW51LWFjdGlvbnNcIiB9KTtcbiAgICAgIGNvbnN0IHJlbmFtZUJ1dHRvbiA9IHRvb2xiYXJFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvblJlbmFtZVRocmVhZFwiKSB9KTtcbiAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IHRvb2xiYXJFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbkRlbGV0ZVRocmVhZFwiKSB9KTtcbiAgICAgIHJlbmFtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlQ2hhdFRocmVhZFBpY2tlcigpO1xuICAgICAgICB2b2lkIHRoaXMucmVuYW1lQWN0aXZlVGhyZWFkKCk7XG4gICAgICB9KTtcbiAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlQ2hhdFRocmVhZFBpY2tlcigpO1xuICAgICAgICB2b2lkIHRoaXMuZGVsZXRlQWN0aXZlVGhyZWFkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjbG9zZUNoYXRUaHJlYWRQaWNrZXIoKTogdm9pZCB7XG4gICAgdGhpcy5jaGF0VGFiUGlja2VyRWw/LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1vcGVuXCIpO1xuICB9XG5cclxuICByZW5kZXIoKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xyXG4gICAgY29udGVudEVsLmFkZENsYXNzKFwib2xhLXJvb3RcIik7XHJcbiAgICB0aGlzLnF1aWNrQWN0aW9uQnV0dG9ucyA9IFtdO1xyXG4gICAgdGhpcy50YWJCdXR0b25zLmNsZWFyKCk7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyU2hlbGwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1oZWFkZXItc2hlbGxcIiB9KTtcclxuICAgIGNvbnN0IGhlYWRlckJhciA9IGhlYWRlclNoZWxsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaGVhZGVyLWJhclwiIH0pO1xyXG4gICAgaGVhZGVyQmFyLmNyZWF0ZUVsKFwiaDNcIiwgeyBjbHM6IFwib2xhLXBhbmVsLXRpdGxlXCIsIHRleHQ6IHRoaXMudChcInBhbmVsVGl0bGVcIikgfSk7XHJcbiAgICBjb25zdCBoZWFkZXJBY3Rpb25zID0gaGVhZGVyQmFyLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaGVhZGVyLWFjdGlvbnNcIiB9KTtcclxuICAgIHRoaXMuc3RhdHVzRWwgPSBoZWFkZXJBY3Rpb25zLmNyZWF0ZURpdih7XHJcbiAgICAgIGNsczogXCJvbGEtc3RhdHVzXCIsXHJcbiAgICAgIHRleHQ6IHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9TdGFydEJhY2tlbmQgPyB0aGlzLnQoXCJzdGF0dXNJZGxlXCIpIDogdGhpcy50KFwic3RhdHVzQmFja2VuZE1hbnVhbFwiKSxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kQ29udHJvbHNFbCA9IGhlYWRlckFjdGlvbnMuY3JlYXRlRWwoXCJkZXRhaWxzXCIsIHsgY2xzOiBcIm9sYS1iYWNrZW5kLWRldGFpbHNcIiB9KTtcclxuICAgIHRoaXMuYmFja2VuZENvbnRyb2xzRWwuY3JlYXRlRWwoXCJzdW1tYXJ5XCIsIHtcclxuICAgICAgY2xzOiBcIm9sYS1iYWNrZW5kLXN1bW1hcnlcIixcclxuICAgICAgdGV4dDogdGhpcy50KFwiYnV0dG9uQmFja2VuZENvbnRyb2xzXCIpLFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmJhY2tlbmRDb250cm9sc0VsLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiQmFja2VuZFwiKTtcclxuICAgIGNvbnN0IGJhY2tlbmRUb29sYmFyID0gdGhpcy5iYWNrZW5kQ29udHJvbHNFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWJhY2tlbmQtdG9vbGJhclwiIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kU3RhcnRCdXR0b24gPSBiYWNrZW5kVG9vbGJhci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbkJhY2tlbmRTdGFydFwiKSB9KTtcclxuICAgIHRoaXMuYmFja2VuZFJlc3RhcnRCdXR0b24gPSBiYWNrZW5kVG9vbGJhci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbkJhY2tlbmRSZXN0YXJ0XCIpIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kU3RvcEJ1dHRvbiA9IGJhY2tlbmRUb29sYmFyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogdGhpcy50KFwiYnV0dG9uQmFja2VuZFN0b3BcIikgfSk7XHJcbiAgICB0aGlzLm9wZW5BcGlCdXR0b24gPSBiYWNrZW5kVG9vbGJhci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbk9wZW5CYWNrZW5kQXBpXCIpIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kU3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgdm9pZCB0aGlzLnN0YXJ0QmFja2VuZCh0cnVlKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kUmVzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMucmVzdGFydEJhY2tlbmQoKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5iYWNrZW5kU3RvcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMuc3RvcEJhY2tlbmQodHJ1ZSk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMub3BlbkFwaUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9wZW5CYWNrZW5kUGFnZShcIi9kb2NzXCIpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnRhYlJvd0VsID0gaGVhZGVyU2hlbGwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItcm93XCIgfSk7XG4gICAgdGhpcy5hZGRDaGF0VGFiQnV0dG9uKHRoaXMudChcInRvb2xDaGF0XCIpKTtcbiAgICB0aGlzLmFkZFRhYkJ1dHRvbihcImdlbmVyYXRvclwiLCB0aGlzLnQoXCJ0b29sR2VuZXJhdG9yXCIpKTtcbiAgICB0aGlzLmFkZFRhYkJ1dHRvbihcInRhZ2dlclwiLCB0aGlzLnQoXCJ0b29sVGFnZ2VyXCIpKTtcbiAgICB0aGlzLmFkZFRhYkJ1dHRvbihcImluZ2VzdFwiLCB0aGlzLnQoXCJ0b29sSW5nZXN0XCIpKTtcbiAgICB0aGlzLmFkZFRhYkJ1dHRvbihcImxvZ3NcIiwgdGhpcy50KFwidG9vbExvZ3NcIikpO1xuICAgIHRoaXMucmVnaXN0ZXJEb21FdmVudChkb2N1bWVudCwgXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghdGhpcy5jaGF0VGFiUGlja2VyRWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY2hhdFRhYlBpY2tlckVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmNsb3NlQ2hhdFRocmVhZFBpY2tlcigpO1xuICAgIH0pO1xuXHJcbiAgICB0aGlzLnRhYkNvbnRlbnRFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRhYi1jb250ZW50XCIgfSk7XG4gICAgdGhpcy5jaGF0VGFiRWwgPSB0aGlzLnRhYkNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRhYi1wYW5lbCBvbGEtdGFiLXBhbmVsLS1jaGF0XCIgfSk7XG4gICAgdGhpcy5nZW5lcmF0b3JUYWJFbCA9IHRoaXMudGFiQ29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtdGFiLXBhbmVsXCIgfSk7XHJcbiAgICB0aGlzLnRhZ2dlclRhYkVsID0gdGhpcy50YWJDb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItcGFuZWxcIiB9KTtcclxuICAgIHRoaXMuaW5nZXN0VGFiRWwgPSB0aGlzLnRhYkNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRhYi1wYW5lbFwiIH0pO1xyXG4gICAgdGhpcy5sb2dzVGFiRWwgPSB0aGlzLnRhYkNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRhYi1wYW5lbFwiIH0pO1xyXG5cclxuICAgIHRoaXMuY2hhdE1ldGFFbCA9IHRoaXMuY2hhdFRhYkVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY2hhdC1tZXRhXCIgfSk7XG4gICAgdGhpcy5jb250ZXh0RWwgPSB0aGlzLmNoYXRNZXRhRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1jb250ZXh0XCIsIHRleHQ6IHRoaXMudChcImNvbnRleHROb05vdGVTZWxlY3RlZFwiKSB9KTtcbiAgICB0aGlzLnNlbnRDb250ZXh0RGV0YWlsc0VsID0gdGhpcy5jaGF0TWV0YUVsLmNyZWF0ZUVsKFwiZGV0YWlsc1wiLCB7IGNsczogXCJvbGEtbWV0YS1wYW5lbFwiIH0pO1xuICAgIHRoaXMuc2VudENvbnRleHREZXRhaWxzRWwuY2xhc3NMaXN0LmFkZChcIm9sYS1tZXRhLXBhbmVsLS1zbGltXCIpO1xuICAgIHRoaXMuc291cmNlRGV0YWlsc0VsID0gdGhpcy5jaGF0TWV0YUVsLmNyZWF0ZUVsKFwiZGV0YWlsc1wiLCB7IGNsczogXCJvbGEtbWV0YS1wYW5lbFwiIH0pO1xuICAgIHRoaXMuc291cmNlRGV0YWlsc0VsLmNsYXNzTGlzdC5hZGQoXCJvbGEtbWV0YS1wYW5lbC0tc2xpbVwiKTtcbiAgICB0aGlzLnJlY29tbWVuZGF0aW9uRGV0YWlsc0VsID0gdGhpcy5jaGF0TWV0YUVsLmNyZWF0ZUVsKFwiZGV0YWlsc1wiLCB7IGNsczogXCJvbGEtbWV0YS1wYW5lbFwiIH0pO1xuICAgIHRoaXMucmVjb21tZW5kYXRpb25EZXRhaWxzRWwuY2xhc3NMaXN0LmFkZChcIm9sYS1tZXRhLXBhbmVsLS1zbGltXCIpO1xuICAgIHRoaXMuY2hhdExvZ0VsID0gdGhpcy5jaGF0VGFiRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1jaGF0LWxvZ1wiIH0pO1xuICAgIGNvbnN0IGNvbnZlcnNhdGlvbkFjdGlvbldyYXAgPSB0aGlzLmNoYXRUYWJFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNvbnZlcnNhdGlvbi1hY3Rpb25zXCIgfSk7XG4gICAgdGhpcy5jb252ZXJzYXRpb25BY3Rpb25zRWwgPSBjb252ZXJzYXRpb25BY3Rpb25XcmFwLmNyZWF0ZUVsKFwiZGV0YWlsc1wiLCB7IGNsczogXCJvbGEtY29udmVyc2F0aW9uLW1lbnVcIiB9KTtcbiAgICBjb25zdCBjb252ZXJzYXRpb25TdW1tYXJ5RWwgPSB0aGlzLmNvbnZlcnNhdGlvbkFjdGlvbnNFbC5jcmVhdGVFbChcInN1bW1hcnlcIiwge1xuICAgICAgY2xzOiBcIm9sYS1jb252ZXJzYXRpb24tc3VtbWFyeVwiLFxuICAgICAgdGV4dDogXCJcdTIyRUVcIixcbiAgICB9KTtcbiAgICBjb252ZXJzYXRpb25TdW1tYXJ5RWwuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgdGhpcy50KFwiYnV0dG9uQ29udmVyc2F0aW9uQWN0aW9uc1wiKSk7XG4gICAgY29uc3QgY29udmVyc2F0aW9uVG9vbGJhciA9IHRoaXMuY29udmVyc2F0aW9uQWN0aW9uc0VsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY29udmVyc2F0aW9uLXRvb2xiYXJcIiB9KTtcbiAgICB0aGlzLmNsZWFyQ29udmVyc2F0aW9uQnV0dG9uID0gY29udmVyc2F0aW9uVG9vbGJhci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbkNsZWFyQ29udmVyc2F0aW9uXCIpIH0pO1xuICAgIHRoaXMuYXBwZW5kQnV0dG9uID0gY29udmVyc2F0aW9uVG9vbGJhci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcImJ1dHRvbkFwcGVuZFRvTm90ZVwiKSB9KTtcbiAgICB0aGlzLnNhdmVCdXR0b24gPSBjb252ZXJzYXRpb25Ub29sYmFyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogdGhpcy50KFwiYnV0dG9uU2F2ZU5ld05vdGVcIikgfSk7XG4gICAgdGhpcy5jbGVhckNvbnZlcnNhdGlvbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLmNsZWFyQ29udmVyc2F0aW9uKCk7XG4gICAgfSk7XG4gICAgdGhpcy5hcHBlbmRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHZvaWQgdGhpcy5hcHBlbmRBbnN3ZXJUb0N1cnJlbnROb3RlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB2b2lkIHRoaXMuc2F2ZUFuc3dlcigpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgY29udHJvbHNFbCA9IHRoaXMuY2hhdFRhYkVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY29udHJvbHNcIiB9KTtcbiAgICB0aGlzLmNvbXBvc2VSb3dFbCA9IGNvbnRyb2xzRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1jb21wb3NlLXJvd1wiIH0pO1xuICAgIGNvbnN0IGNvbXBvc2VJbnB1dFdyYXAgPSB0aGlzLmNvbXBvc2VSb3dFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNvbXBvc2UtaW5wdXRcIiB9KTtcclxuICAgIHRoaXMucXVlc3Rpb25FbCA9IGNvbXBvc2VJbnB1dFdyYXAuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiLCB7XHJcbiAgICAgIGF0dHI6IHtcclxuICAgICAgICBwbGFjZWhvbGRlcjogdGhpcy50KFwicXVlc3Rpb25QbGFjZWhvbGRlclwiKSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgdGhpcy5xdWVzdGlvbkVsLnNldEF0dHJpYnV0ZShcInJvd3NcIiwgXCI0XCIpO1xyXG4gICAgdGhpcy5xdWlja0FjdGlvblN1Z2dlc3Rpb25zRWwgPSBjb21wb3NlSW5wdXRXcmFwLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY29tcG9zZS1zdWdnZXN0aW9uc1wiIH0pO1xyXG4gICAgdGhpcy5hZGRRdWlja0FjdGlvbkJ1dHRvbih0aGlzLnF1aWNrQWN0aW9uU3VnZ2VzdGlvbnNFbCwgXCJzdW1tYXJ5XCIsIFwib2xhLWNvbXBvc2Utc3VnZ2VzdGlvblwiKTtcclxuICAgIHRoaXMuYWRkUXVpY2tBY3Rpb25CdXR0b24odGhpcy5xdWlja0FjdGlvblN1Z2dlc3Rpb25zRWwsIFwib3JnYW5pemVcIiwgXCJvbGEtY29tcG9zZS1zdWdnZXN0aW9uXCIpO1xyXG4gICAgdGhpcy5hZGRRdWlja0FjdGlvbkJ1dHRvbih0aGlzLnF1aWNrQWN0aW9uU3VnZ2VzdGlvbnNFbCwgXCJuZXh0LWFjdGlvbnNcIiwgXCJvbGEtY29tcG9zZS1zdWdnZXN0aW9uXCIpO1xyXG4gICAgdGhpcy5jaGF0QWN0aW9uQnV0dG9uID0gdGhpcy5jb21wb3NlUm93RWwuY3JlYXRlRWwoXCJidXR0b25cIiwgeyBjbHM6IFwib2xhLWNoYXQtYWN0aW9uLWJ1dHRvblwiLCB0ZXh0OiBcIlx1MjdBNFwiIH0pO1xyXG4gICAgdGhpcy5jaGF0QWN0aW9uQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrID09PSBcImNoYXRcIikge1xyXG4gICAgICAgIHZvaWQgdGhpcy5zdG9wQ2hhdCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB2b2lkIHRoaXMucnVuUXVlcnkoKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5xdWVzdGlvbkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlQ2hhdEFjdGlvbkJ1dHRvblN0YXRlKCk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMucXVlc3Rpb25FbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlUXVlc3Rpb25TdWJtaXRLZXkoZXZlbnQpO1xuICAgIH0sIHRydWUpO1xuXHJcbiAgICBjb25zdCBnZW5lcmF0b3JTY3JvbGxFbCA9IHRoaXMuZ2VuZXJhdG9yVGFiRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItc2Nyb2xsXCIgfSk7XHJcbiAgICBjb25zdCB0YWdnZXJTY3JvbGxFbCA9IHRoaXMudGFnZ2VyVGFiRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItc2Nyb2xsXCIgfSk7XHJcbiAgICBjb25zdCBpbmdlc3RTY3JvbGxFbCA9IHRoaXMuaW5nZXN0VGFiRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItc2Nyb2xsXCIgfSk7XHJcbiAgICBjb25zdCBsb2dzU2Nyb2xsRWwgPSB0aGlzLmxvZ3NUYWJFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRhYi1zY3JvbGxcIiB9KTtcclxuXHJcbiAgICB0aGlzLmdlbmVyYXRvclBhbmVsRWwgPSBnZW5lcmF0b3JTY3JvbGxFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLW1ldGEtcGFuZWwgb2xhLXdvcmtmbG93LXBhbmVsXCIgfSk7XG4gICAgdGhpcy50YWdnZXJQYW5lbEVsID0gdGFnZ2VyU2Nyb2xsRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLXBhbmVsIG9sYS13b3JrZmxvdy1wYW5lbFwiIH0pO1xyXG4gICAgdGhpcy5pbmdlc3RQYW5lbEVsID0gaW5nZXN0U2Nyb2xsRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLXBhbmVsIG9sYS13b3JrZmxvdy1wYW5lbFwiIH0pO1xyXG4gICAgdGhpcy53b3JrZmxvd0xvZ3NQYW5lbEVsID0gbG9nc1Njcm9sbEVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtbWV0YS1wYW5lbCBvbGEtd29ya2Zsb3ctcGFuZWxcIiB9KTtcclxuXHJcbiAgICB2b2lkIHRoaXMucmVuZGVyT3V0cHV0KCk7XG4gICAgdm9pZCB0aGlzLnJlbmRlckNvbnRleHRQYW5lbHMoKTtcbiAgICB0aGlzLnJlbmRlclRocmVhZFJvdygpO1xuICAgIHZvaWQgdGhpcy5yZW5kZXJXb3JrZmxvd1BhbmVscygpO1xuICAgIHRoaXMucmVuZGVyVGFiU3RhdGUoKTtcclxuICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICAgIHRoaXMudXBkYXRlQ2hhdEFjdGlvbkJ1dHRvblN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBhZGRRdWlja0FjdGlvbkJ1dHRvbihjb250YWluZXJFbDogSFRNTEVsZW1lbnQsIGtleTogUXVpY2tBY3Rpb25LZXksIGNscyA9IFwib2xhLXF1aWNrLWFjdGlvblwiKTogdm9pZCB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5wbHVnaW4uZ2V0UXVpY2tBY3Rpb24oa2V5KTtcclxuICAgIGNvbnN0IGJ1dHRvbiA9IGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgY2xzLFxyXG4gICAgICB0ZXh0OiBjb25maWcubGFiZWwsXHJcbiAgICB9KTtcclxuICAgIHRoaXMucXVpY2tBY3Rpb25CdXR0b25zLnB1c2goYnV0dG9uKTtcclxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMucnVuUXVpY2tBY3Rpb24oa2V5KTtcclxuICAgIH0pO1xyXG4gIH1cblxuICBhZGRDaGF0VGFiQnV0dG9uKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNoYXRUYWJQaWNrZXJFbCA9IHRoaXMudGFiUm93RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10YWItY2hhdC1ncm91cFwiIH0pO1xuICAgIGNvbnN0IHRyaWdnZXJFbCA9IHRoaXMuY2hhdFRhYlBpY2tlckVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtdGFiLWNoYXQtdHJpZ2dlclwiIH0pO1xuICAgIHRoaXMuY2hhdFRhYkJ1dHRvbkVsID0gdHJpZ2dlckVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgIGNsczogXCJvbGEtdGFiLWJ1dHRvbiBvbGEtdGFiLWJ1dHRvbi0tY2hhdC1tYWluXCIsXG4gICAgICB0ZXh0OiBsYWJlbCxcbiAgICB9KTtcbiAgICB0aGlzLmNoYXRUYWJCdXR0b25FbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMuc2V0QWN0aXZlVGFiKFwiY2hhdFwiKTtcbiAgICAgIHRoaXMuY2xvc2VDaGF0VGhyZWFkUGlja2VyKCk7XG4gICAgfSk7XG4gICAgdGhpcy5jaGF0VGhyZWFkTWVudUJ1dHRvbkVsID0gdHJpZ2dlckVsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgIGNsczogXCJvbGEtdGFiLXRocmVhZC10b2dnbGVcIixcbiAgICAgIHRleHQ6IFwiXHUyMkVFXCIsXG4gICAgfSk7XG4gICAgdGhpcy5jaGF0VGhyZWFkTWVudUJ1dHRvbkVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgdGhpcy50KFwiYnV0dG9uQ29udmVyc2F0aW9uQWN0aW9uc1wiKSk7XG4gICAgdGhpcy5jaGF0VGhyZWFkTWVudUJ1dHRvbkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5zZXRBY3RpdmVUYWIoXCJjaGF0XCIpO1xuICAgICAgdGhpcy5jaGF0VGFiUGlja2VyRWwuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIiwgIXRoaXMuY2hhdFRhYlBpY2tlckVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpO1xuICAgIH0pO1xuICAgIHRoaXMudGhyZWFkUm93RWwgPSB0aGlzLmNoYXRUYWJQaWNrZXJFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRocmVhZC1tZW51XCIgfSk7XG4gICAgdGhpcy50YWJCdXR0b25zLnNldChcImNoYXRcIiwgdGhpcy5jaGF0VGFiQnV0dG9uRWwpO1xuICB9XG5cbiAgYWRkVGFiQnV0dG9uKHRhYjogVmlld1RhYiwgbGFiZWw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMudGFiUm93RWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgY2xzOiBcIm9sYS10YWItYnV0dG9uXCIsXG4gICAgICB0ZXh0OiBsYWJlbCxcbiAgICB9KTtcclxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnNldEFjdGl2ZVRhYih0YWIpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnRhYkJ1dHRvbnMuc2V0KHRhYiwgYnV0dG9uKTtcclxuICB9XHJcblxyXG4gIHNldEFjdGl2ZVRhYih0YWI6IFZpZXdUYWIpOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcbiAgICBpZiAodGFiICE9PSBcImNoYXRcIikge1xuICAgICAgdGhpcy5jbG9zZUNoYXRUaHJlYWRQaWNrZXIoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJUYWJTdGF0ZSgpO1xuICB9XG5cclxuICByZW5kZXJUYWJTdGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lbHM6IFJlY29yZDxWaWV3VGFiLCBIVE1MRWxlbWVudD4gPSB7XHJcbiAgICAgIGNoYXQ6IHRoaXMuY2hhdFRhYkVsLFxyXG4gICAgICBnZW5lcmF0b3I6IHRoaXMuZ2VuZXJhdG9yVGFiRWwsXHJcbiAgICAgIHRhZ2dlcjogdGhpcy50YWdnZXJUYWJFbCxcclxuICAgICAgaW5nZXN0OiB0aGlzLmluZ2VzdFRhYkVsLFxyXG4gICAgICBsb2dzOiB0aGlzLmxvZ3NUYWJFbCxcclxuICAgIH07XHJcbiAgICBmb3IgKGNvbnN0IFt0YWIsIGJ1dHRvbl0gb2YgdGhpcy50YWJCdXR0b25zLmVudHJpZXMoKSkge1xuICAgICAgYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1hY3RpdmVcIiwgdGFiID09PSB0aGlzLmFjdGl2ZVRhYik7XG4gICAgICBwYW5lbHNbdGFiXS5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtYWN0aXZlXCIsIHRhYiA9PT0gdGhpcy5hY3RpdmVUYWIpO1xuICAgIH1cbiAgICB0aGlzLmNoYXRUYWJQaWNrZXJFbD8uY2xhc3NMaXN0LnRvZ2dsZShcImlzLWFjdGl2ZVwiLCB0aGlzLmFjdGl2ZVRhYiA9PT0gXCJjaGF0XCIpO1xuICB9XG5cclxuICBhc3luYyBnZXRKc29uPFQ+KHBhdGg6IHN0cmluZyk6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcclxuICAgICAgdXJsOiBgJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kVXJsfSR7cGF0aH1gLFxyXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICB9KTtcclxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS5qc29uIGFzIFQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBwb3N0SnNvbjxUPihwYXRoOiBzdHJpbmcsIHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTxUPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3RVcmwoe1xyXG4gICAgICB1cmw6IGAke3RoaXMucGx1Z2luLnNldHRpbmdzLmJhY2tlbmRVcmx9JHtwYXRofWAsXHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXHJcbiAgICB9KTtcclxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS5qc29uIGFzIFQ7XHJcbiAgfVxyXG5cclxuICByZWNvcmRXb3JrZmxvd0xvZyh0b29sOiBUb29sTmFtZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBsaW5lID0gbWVzc2FnZS50cmltKCk7XHJcbiAgICBpZiAoIWxpbmUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy53b3JrZmxvd0xvZ3MudW5zaGlmdCh7XHJcbiAgICAgIHRvb2wsXHJcbiAgICAgIG1lc3NhZ2U6IGxpbmUsXHJcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcodGhpcy5wbHVnaW4uZ2V0TG9jYWxlKCkpLFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLndvcmtmbG93TG9ncyA9IHRoaXMud29ya2Zsb3dMb2dzLnNsaWNlKDAsIDIwMCk7XHJcbiAgICB2b2lkIHRoaXMucmVuZGVyV29ya2Zsb3dMb2dzUGFuZWwoKTtcclxuICB9XHJcblxyXG4gIGdldFRvb2xMYWJlbCh0b29sOiBUb29sTmFtZSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy50KHRoaXMuZ2V0VG9vbEtleSh0b29sKSk7XHJcbiAgfVxyXG5cclxuICBnZXRUb29sS2V5KHRvb2w6IFRvb2xOYW1lIHwgVmlld1RhYik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBrZXlNYXA6IFJlY29yZDxUb29sTmFtZSB8IFZpZXdUYWIsIHN0cmluZz4gPSB7XHJcbiAgICAgIGNoYXQ6IFwidG9vbENoYXRcIixcclxuICAgICAgZ2VuZXJhdG9yOiBcInRvb2xHZW5lcmF0b3JcIixcclxuICAgICAgdGFnZ2VyOiBcInRvb2xUYWdnZXJcIixcclxuICAgICAgaW5nZXN0OiBcInRvb2xJbmdlc3RcIixcclxuICAgICAgbG9nczogXCJ0b29sTG9nc1wiLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBrZXlNYXBbdG9vbF07XHJcbiAgfVxyXG5cclxuICBvcGVuQmFja2VuZFBhZ2UocGF0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBiYXNlID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuYmFja2VuZFVybC5yZXBsYWNlKC9cXC8rJC8sIFwiXCIpO1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gYCR7YmFzZX0ke3BhdGh9YDtcclxuICAgIHdpbmRvdy5vcGVuKHRhcmdldCwgXCJfYmxhbmtcIiwgXCJub29wZW5lcixub3JlZmVycmVyXCIpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVmcmVzaENvbnRleHQoZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZmlsZSA9IHRoaXMucGx1Z2luLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xyXG4gICAgaWYgKCFmaWxlKSB7XHJcbiAgICAgIHRoaXMuY3VycmVudEZpbGVQYXRoID0gXCJcIjtcclxuICAgICAgdGhpcy5jb250ZXh0RWwuc2V0VGV4dCh0aGlzLnQoXCJjb250ZXh0Q2hhdFJlYWR5XCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZm9yY2UgJiYgdGhpcy5jdXJyZW50RmlsZVBhdGggPT09IGZpbGUucGF0aCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJyZW50RmlsZVBhdGggPSBmaWxlLnBhdGg7XHJcbiAgICB0aGlzLmNvbnRleHRFbC5zZXRUZXh0KFxyXG4gICAgICB0aGlzLnQoXCJjb250ZXh0Q3VycmVudE5vdGVcIiwge1xyXG4gICAgICAgIHBhdGg6IGZpbGUubmFtZSxcclxuICAgICAgfSksXHJcbiAgICApO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJDb250ZXh0UGFuZWxzKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyByZWZyZXNoVmlld1N0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5yZWZyZXNoQ29udGV4dCh0cnVlKTtcclxuICAgIGF3YWl0IHRoaXMucmVmcmVzaEJhY2tlbmRTdGF0ZSh0cnVlKTtcclxuICB9XHJcblxyXG4gIGVuc3VyZUJhY2tlbmRQb2xsaW5nKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuYmFja2VuZFBvbGxTdGFydGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuYmFja2VuZFBvbGxTdGFydGVkID0gdHJ1ZTtcclxuICAgIHRoaXMucmVnaXN0ZXJJbnRlcnZhbChcclxuICAgICAgd2luZG93LnNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICB2b2lkIHRoaXMucmVmcmVzaEJhY2tlbmRTdGF0ZSgpO1xyXG4gICAgICB9LCAxMDAwMCksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVmcmVzaEJhY2tlbmRTdGF0ZShmb3JjZUNvbmZpZ1JlbG9hZCA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCB3YXNSZWFkeSA9IHRoaXMuYmFja2VuZFJlYWR5O1xyXG4gICAgbGV0IGlzUmVhZHkgPSBhd2FpdCB0aGlzLmNoZWNrQmFja2VuZCgpO1xyXG4gICAgaWYgKCFpc1JlYWR5ICYmIHRoaXMuc2hvdWxkQXV0b1N0YXJ0QmFja2VuZCgpKSB7XHJcbiAgICAgIGlzUmVhZHkgPSBhd2FpdCB0aGlzLnN0YXJ0QmFja2VuZChmYWxzZSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmJhY2tlbmRSZWFkeSA9IGlzUmVhZHk7XHJcbiAgICBpZiAoaXNSZWFkeSAmJiAoZm9yY2VDb25maWdSZWxvYWQgfHwgIXdhc1JlYWR5IHx8ICF0aGlzLnRvb2xDb25maWcgfHwgQm9vbGVhbih0aGlzLnRvb2xDb25maWdFcnJvcikpKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMubG9hZFRvb2xDb25maWcoZm9yY2VDb25maWdSZWxvYWQpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzUmVhZHkpIHtcclxuICAgICAgdGhpcy5lbnN1cmVCYWNrZW5kUG9sbGluZygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcHBseUJ1c3lTdGF0ZSgpO1xyXG4gICAgcmV0dXJuIGlzUmVhZHk7XHJcbiAgfVxyXG5cclxuICBzaG91bGRBdXRvU3RhcnRCYWNrZW5kKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvU3RhcnRCYWNrZW5kIHx8IHRoaXMucnVubmluZ1Rhc2sgfHwgdGhpcy5hdXRvU3RhcnRTdXBwcmVzc2VkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5sYXN0QXV0b1N0YXJ0QXR0ZW1wdCA+IDMwMDAwO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgaXNCYWNrZW5kSGVhbHRoeSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldEpzb248eyBlbmdpbmU/OiBzdHJpbmc7IHN0YXR1cz86IHN0cmluZyB9PihcIi9oZWFsdGhcIik7XHJcbiAgICAgIHRoaXMuc3RhdHVzRWwuc2V0VGV4dChcclxuICAgICAgICB0aGlzLnQoXCJzdGF0dXNCYWNrZW5kUmVhZHlcIiwgeyBlbmdpbmU6IGRhdGEuZW5naW5lID8/IGRhdGEuc3RhdHVzID8/IFwidW5rbm93blwiIH0pLFxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyB3YWl0Rm9yQmFja2VuZFJlYWR5KHRpbWVvdXRNcyA9IDkwMDAwKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCBkZWFkbGluZSA9IERhdGUubm93KCkgKyB0aW1lb3V0TXM7XHJcbiAgICB3aGlsZSAoRGF0ZS5ub3coKSA8IGRlYWRsaW5lKSB7XHJcbiAgICAgIGlmIChhd2FpdCB0aGlzLmlzQmFja2VuZEhlYWx0aHkoKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB3aW5kb3cuc2V0VGltZW91dChyZXNvbHZlLCAyMDAwKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBhc3luYyBydW5TaGVsbChjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTx7IGNvZGU6IG51bWJlcjsgc3Rkb3V0OiBzdHJpbmc7IHN0ZGVycjogc3RyaW5nIH0+IHtcclxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHsgd2luZG93c0hpZGU6IHRydWUgfSk7XHJcbiAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xyXG4gICAgICBsZXQgc3RkZXJyID0gXCJcIjtcclxuICAgICAgY2hpbGQuc3Rkb3V0Py5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XHJcbiAgICAgICAgc3Rkb3V0ICs9IGNodW5rLnRvU3RyaW5nKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjaGlsZC5zdGRlcnI/Lm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcclxuICAgICAgICBzdGRlcnIgKz0gY2h1bmsudG9TdHJpbmcoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGNoaWxkLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgc3RkZXJyICs9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgcmVzb2x2ZSh7IGNvZGU6IDEsIHN0ZG91dCwgc3RkZXJyIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgY2hpbGQub24oXCJjbG9zZVwiLCAoY29kZSkgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoeyBjb2RlOiBjb2RlID8/IDAsIHN0ZG91dCwgc3RkZXJyIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZmluZEJhY2tlbmRQcm9jZXNzSWRzKCk6IFByb21pc2U8bnVtYmVyW10+IHtcbiAgICBjb25zdCBzY3JpcHRQYXRoID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuYmFja2VuZFNjcmlwdFBhdGgudHJpbSgpO1xyXG4gICAgaWYgKCFzY3JpcHRQYXRoKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgIGNvbnN0IHBzQ29tbWFuZCA9IFtcclxuICAgICAgICBgJHNjcmlwdCA9ICR7SlNPTi5zdHJpbmdpZnkoc2NyaXB0UGF0aCl9O2AsXHJcbiAgICAgICAgXCJHZXQtQ2ltSW5zdGFuY2UgV2luMzJfUHJvY2VzcyB8XCIsXHJcbiAgICAgICAgXCJXaGVyZS1PYmplY3QgeyAoJF8uTmFtZSAtZXEgJ3B5dGhvbi5leGUnIC1vciAkXy5OYW1lIC1lcSAncHl0aG9udy5leGUnKSAtYW5kICgkXy5Db21tYW5kTGluZSAtbWF0Y2ggW3JlZ2V4XTo6RXNjYXBlKCRzY3JpcHQpIC1vciAkXy5Db21tYW5kTGluZSAtbWF0Y2ggJ2JhY2tlbmRbXFxcXFxcXFwvXW1haW5cXFxcLnB5JykgfSB8XCIsXHJcbiAgICAgICAgXCJGb3JFYWNoLU9iamVjdCB7ICRfLlByb2Nlc3NJZCB9XCIsXHJcbiAgICAgIF0uam9pbihcIiBcIik7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuU2hlbGwoXCJwb3dlcnNoZWxsLmV4ZVwiLCBbXCItTm9Qcm9maWxlXCIsIFwiLUNvbW1hbmRcIiwgcHNDb21tYW5kXSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQuc3Rkb3V0XG4gICAgICAgIC5zcGxpdCgvXFxyP1xcbi8pXG4gICAgICAgIC5tYXAoKGxpbmUpID0+IE51bWJlci5wYXJzZUludChsaW5lLnRyaW0oKSwgMTApKVxuICAgICAgICAuZmlsdGVyKCh2YWx1ZSkgPT4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSk7XG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuU2hlbGwoXCJwZ3JlcFwiLCBbXCItZlwiLCBzY3JpcHRQYXRoXSk7XHJcbiAgICByZXR1cm4gcmVzdWx0LnN0ZG91dFxyXG4gICAgICAuc3BsaXQoL1xccj9cXG4vKVxyXG4gICAgICAubWFwKChsaW5lKSA9PiBOdW1iZXIucGFyc2VJbnQobGluZS50cmltKCksIDEwKSlcclxuICAgICAgLmZpbHRlcigodmFsdWUpID0+IE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpO1xuICB9XG5cbiAgYXN5bmMgc3RvcEJhY2tlbmRQcm9jZXNzSWRzKHByb2Nlc3NJZHM6IG51bWJlcltdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHByb2Nlc3NJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgICAgY29uc3QgcHNDb21tYW5kID0gcHJvY2Vzc0lkc1xuICAgICAgICAubWFwKChwcm9jZXNzSWQpID0+IGBTdG9wLVByb2Nlc3MgLUlkICR7cHJvY2Vzc0lkfSAtRm9yY2UgLUVycm9yQWN0aW9uIFNpbGVudGx5Q29udGludWVgKVxuICAgICAgICAuam9pbihcIjsgXCIpO1xuICAgICAgYXdhaXQgdGhpcy5ydW5TaGVsbChcInBvd2Vyc2hlbGwuZXhlXCIsIFtcIi1Ob1Byb2ZpbGVcIiwgXCItQ29tbWFuZFwiLCBwc0NvbW1hbmRdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHByb2Nlc3NJZCBvZiBwcm9jZXNzSWRzKSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1blNoZWxsKFwia2lsbFwiLCBbXCItOVwiLCBTdHJpbmcocHJvY2Vzc0lkKV0pO1xuICAgIH1cbiAgfVxuXHJcbiAgYXN5bmMgc3RhcnRCYWNrZW5kKG1hbnVhbDogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKHRoaXMuYmFja2VuZExhdW5jaFByb21pc2UpIHtcclxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmFja2VuZExhdW5jaFByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29uZmlndXJlZFB5dGhvblBhdGggPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kUHl0aG9uUGF0aC50cmltKCk7XHJcbiAgICBjb25zdCBzY3JpcHRQYXRoID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuYmFja2VuZFNjcmlwdFBhdGgudHJpbSgpO1xyXG4gICAgY29uc3Qgd29ya2luZ0RpciA9IHRoaXMucGx1Z2luLnNldHRpbmdzLmJhY2tlbmRXb3JraW5nRGlyLnRyaW0oKSB8fCBERUZBVUxUX1NFVFRJTkdTLmJhY2tlbmRXb3JraW5nRGlyO1xyXG4gICAgaWYgKCFjb25maWd1cmVkUHl0aG9uUGF0aCB8fCAhc2NyaXB0UGF0aCB8fCAhZXhpc3RzU3luYyhjb25maWd1cmVkUHl0aG9uUGF0aCkgfHwgIWV4aXN0c1N5bmMoc2NyaXB0UGF0aCkpIHtcclxuICAgICAgaWYgKG1hbnVhbCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQmFja2VuZFBhdGhzTWlzc2luZ1wiKSk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGF0dXNFbC5zZXRUZXh0KHRoaXMudChcInN0YXR1c0JhY2tlbmRPZmZsaW5lXCIsIHsgbWVzc2FnZTogdGhpcy50KFwibm90aWNlQmFja2VuZFBhdGhzTWlzc2luZ1wiKSB9KSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcHl0aG9uUGF0aCA9IGNvbmZpZ3VyZWRQeXRob25QYXRoO1xyXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiAmJiBjb25maWd1cmVkUHl0aG9uUGF0aC50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKFwiXFxcXHB5dGhvbncuZXhlXCIpKSB7XHJcbiAgICAgIGNvbnN0IHB5dGhvbkV4ZVBhdGggPSBjb25maWd1cmVkUHl0aG9uUGF0aC5zbGljZSgwLCAtMTEpICsgXCJcXFxccHl0aG9uLmV4ZVwiO1xyXG4gICAgICBpZiAoZXhpc3RzU3luYyhweXRob25FeGVQYXRoKSkge1xyXG4gICAgICAgIHB5dGhvblBhdGggPSBweXRob25FeGVQYXRoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYWNrZW5kTGF1bmNoUHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuaXNCYWNrZW5kSGVhbHRoeSgpKSB7XHJcbiAgICAgICAgICB0aGlzLmF1dG9TdGFydFN1cHByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGlmIChtYW51YWwpIHtcclxuICAgICAgICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VCYWNrZW5kQWxyZWFkeVJ1bm5pbmdcIikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHRoaXMuZmluZEJhY2tlbmRQcm9jZXNzSWRzKCk7XG4gICAgICAgIHRoaXMubGFzdEF1dG9TdGFydEF0dGVtcHQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnN0YXR1c0VsLnNldFRleHQodGhpcy50KFwic3RhdHVzQmFja2VuZFN0YXJ0aW5nXCIpKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnN0b3BCYWNrZW5kUHJvY2Vzc0lkcyhleGlzdGluZyk7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHdpbmRvdy5zZXRUaW1lb3V0KHJlc29sdmUsIDE1MDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgICAgICBjb25zdCBwc0NvbW1hbmQgPSBbXG4gICAgICAgICAgICBgJHB5dGhvbiA9ICR7SlNPTi5zdHJpbmdpZnkocHl0aG9uUGF0aCl9O2AsXG4gICAgICAgICAgICBgJHNjcmlwdCA9ICR7SlNPTi5zdHJpbmdpZnkoc2NyaXB0UGF0aCl9O2AsXG4gICAgICAgICAgICBgJHdvcmtkaXIgPSAke0pTT04uc3RyaW5naWZ5KHdvcmtpbmdEaXIpfTtgLFxuICAgICAgICAgICAgXCJTdGFydC1Qcm9jZXNzIC1GaWxlUGF0aCAkcHl0aG9uIC1Bcmd1bWVudExpc3QgQCgnLXUnLCAkc2NyaXB0KSAtV29ya2luZ0RpcmVjdG9yeSAkd29ya2RpciAtV2luZG93U3R5bGUgSGlkZGVuIHwgT3V0LU51bGxcIixcbiAgICAgICAgICBdLmpvaW4oXCIgXCIpO1xuICAgICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oXCJwb3dlcnNoZWxsLmV4ZVwiLCBbXCItTm9Qcm9maWxlXCIsIFwiLUNvbW1hbmRcIiwgcHNDb21tYW5kXSwge1xuICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICAgICAgICBzdGRpbzogXCJpZ25vcmVcIixcbiAgICAgICAgICAgIHdpbmRvd3NIaWRlOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNoaWxkLnVucmVmKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihweXRob25QYXRoLCBbXCItdVwiLCBzY3JpcHRQYXRoXSwge1xuICAgICAgICAgICAgY3dkOiB3b3JraW5nRGlyLFxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICAgICAgICBzdGRpbzogXCJpZ25vcmVcIixcbiAgICAgICAgICAgIHdpbmRvd3NIaWRlOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNoaWxkLnVucmVmKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZWFkeSA9IGF3YWl0IHRoaXMud2FpdEZvckJhY2tlbmRSZWFkeSgxMjAwMDApO1xuICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aW1lb3V0IHdhaXRpbmcgZm9yIC9oZWFsdGhcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYmFja2VuZFJlYWR5ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmF1dG9TdGFydFN1cHByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAobWFudWFsKSB7XHJcbiAgICAgICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZUJhY2tlbmRTdGFydGVkXCIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkVG9vbENvbmZpZyh0cnVlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xyXG4gICAgICAgIHRoaXMuYmFja2VuZFJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNFbC5zZXRUZXh0KHRoaXMudChcInN0YXR1c0JhY2tlbmRPZmZsaW5lXCIsIHsgbWVzc2FnZSB9KSk7XHJcbiAgICAgICAgaWYgKG1hbnVhbCkge1xyXG4gICAgICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VCYWNrZW5kU3RhcnRGYWlsZWRcIiwgeyBtZXNzYWdlIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHRoaXMuYmFja2VuZExhdW5jaFByb21pc2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfSkoKTtcclxuXHJcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5iYWNrZW5kTGF1bmNoUHJvbWlzZTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHN0b3BCYWNrZW5kKG1hbnVhbDogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2spIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUb29sQnVzeVwiKSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNjcmlwdFBhdGggPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kU2NyaXB0UGF0aC50cmltKCk7XHJcbiAgICAgIGlmICghc2NyaXB0UGF0aCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnQoXCJub3RpY2VCYWNrZW5kUGF0aHNNaXNzaW5nXCIpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xyXG4gICAgICAgIGNvbnN0IHBzQ29tbWFuZCA9IFtcclxuICAgICAgICAgIGAkc2NyaXB0ID0gJHtKU09OLnN0cmluZ2lmeShzY3JpcHRQYXRoKX07YCxcclxuICAgICAgICAgIFwiR2V0LUNpbUluc3RhbmNlIFdpbjMyX1Byb2Nlc3MgfFwiLFxyXG4gICAgICAgICAgXCJXaGVyZS1PYmplY3QgeyAoJF8uTmFtZSAtZXEgJ3B5dGhvbi5leGUnIC1vciAkXy5OYW1lIC1lcSAncHl0aG9udy5leGUnKSAtYW5kICgkXy5Db21tYW5kTGluZSAtbWF0Y2ggW3JlZ2V4XTo6RXNjYXBlKCRzY3JpcHQpIC1vciAkXy5Db21tYW5kTGluZSAtbWF0Y2ggJ2JhY2tlbmRbXFxcXFxcXFwvXW1haW5cXFxcLnB5JykgfSB8XCIsXHJcbiAgICAgICAgICBcIkZvckVhY2gtT2JqZWN0IHsgU3RvcC1Qcm9jZXNzIC1JZCAkXy5Qcm9jZXNzSWQgLUZvcmNlIC1FcnJvckFjdGlvbiBTaWxlbnRseUNvbnRpbnVlOyAkXy5Qcm9jZXNzSWQgfVwiLFxyXG4gICAgICAgIF0uam9pbihcIiBcIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5TaGVsbChcInBvd2Vyc2hlbGwuZXhlXCIsIFtcIi1Ob1Byb2ZpbGVcIiwgXCItQ29tbWFuZFwiLCBwc0NvbW1hbmRdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnJ1blNoZWxsKFwicGtpbGxcIiwgW1wiLWZcIiwgc2NyaXB0UGF0aF0pO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYmFja2VuZFJlYWR5ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudG9vbENvbmZpZyA9IG51bGw7XHJcbiAgICAgIHRoaXMudG9vbENvbmZpZ0Vycm9yID0gXCJcIjtcclxuICAgICAgdGhpcy5hdXRvU3RhcnRTdXBwcmVzc2VkID0gbWFudWFsO1xyXG4gICAgICB0aGlzLnN0YXR1c0VsLnNldFRleHQodGhpcy50KFwic3RhdHVzQmFja2VuZE9mZmxpbmVcIiwgeyBtZXNzYWdlOiB0aGlzLnQoXCJidXR0b25CYWNrZW5kU3RvcFwiKSB9KSk7XHJcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyV29ya2Zsb3dQYW5lbHMoKTtcclxuICAgICAgaWYgKG1hbnVhbCkge1xyXG4gICAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQmFja2VuZFN0b3BwZWRcIikpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xyXG4gICAgICBpZiAobWFudWFsKSB7XHJcbiAgICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VCYWNrZW5kU3RvcEZhaWxlZFwiLCB7IG1lc3NhZ2UgfSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlc3RhcnRCYWNrZW5kKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2spIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUb29sQnVzeVwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGF3YWl0IHRoaXMuc3RvcEJhY2tlbmQoZmFsc2UpO1xyXG4gICAgY29uc3Qgc3RhcnRlZCA9IGF3YWl0IHRoaXMuc3RhcnRCYWNrZW5kKHRydWUpO1xyXG4gICAgaWYgKHN0YXJ0ZWQpIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VCYWNrZW5kUmVzdGFydGVkXCIpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldFF1ZXN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5xdWVzdGlvbkVsLnZhbHVlID0gdGV4dDtcclxuICAgIHRoaXMudXBkYXRlQ2hhdEFjdGlvbkJ1dHRvblN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVRdWVzdGlvblN1Ym1pdEtleShldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaXNFbnRlcktleSA9IGV2ZW50LmtleSA9PT0gXCJFbnRlclwiIHx8IGV2ZW50LmNvZGUgPT09IFwiRW50ZXJcIiB8fCBldmVudC5jb2RlID09PSBcIk51bXBhZEVudGVyXCI7XHJcbiAgICBpZiAoIWlzRW50ZXJLZXkgfHwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQuYWx0S2V5IHx8IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5pc0NvbXBvc2luZykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGlmIChub3cgLSB0aGlzLmxhc3RFbnRlclN1Ym1pdEF0IDwgMzAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMubGFzdEVudGVyU3VibWl0QXQgPSBub3c7XHJcblxyXG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2sgPT09IFwiY2hhdFwiKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMucXVlc3Rpb25FbD8udmFsdWUudHJpbSgpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrIHx8ICF0aGlzLnF1ZXN0aW9uRWw/LnZhbHVlLnRyaW0oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB2b2lkIHRoaXMucnVuUXVlcnkoKTtcclxuICAgIH0sIDApO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgdXNlU2VsZWN0aW9uKHJ1bkFmdGVyID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHRoaXMucGx1Z2luLmdldEFjdGl2ZVNlbGVjdGlvbigpO1xyXG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VOb1NlbGVjdGlvblwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldFF1ZXN0aW9uKHNlbGVjdGlvbik7XHJcbiAgICBpZiAocnVuQWZ0ZXIpIHtcclxuICAgICAgYXdhaXQgdGhpcy5ydW5RdWVyeSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcnVuUXVpY2tBY3Rpb24oa2V5OiBRdWlja0FjdGlvbktleSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdGhpcy5zZXRRdWVzdGlvbih0aGlzLnBsdWdpbi5nZXRRdWlja0FjdGlvbihrZXkpLnByb21wdCk7XHJcbiAgICBhd2FpdCB0aGlzLnJ1blF1ZXJ5KCk7XHJcbiAgfVxyXG5cclxuICBzaG91bGRBdHRhY2hDdXJyZW50Tm90ZShxdWVzdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gcXVlc3Rpb24udHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5vdGVSZWZlcmVuY2VQYXR0ZXJucyA9IFtcclxuICAgICAgL1xcYnRoaXMgbm90ZVxcYi8sXHJcbiAgICAgIC9cXGJjdXJyZW50IG5vdGVcXGIvLFxyXG4gICAgICAvXFxib3BlbmVkIG5vdGVcXGIvLFxyXG4gICAgICAvXFxib3BlbiBub3RlXFxiLyxcclxuICAgICAgL1xcYnNlbGVjdGlvblxcYi8sXHJcbiAgICAgIC9cXGJzZWxlY3RlZCB0ZXh0XFxiLyxcclxuICAgICAgL1xcYmFib3ZlXFxiLyxcclxuICAgICAgL1xcYmhlcmVcXGIvLFxyXG4gICAgICAvXHVDNzc0IFx1QjE3OFx1RDJCOC8sXHJcbiAgICAgIC9cdUQ2MDRcdUM3QUMgXHVCMTc4XHVEMkI4LyxcclxuICAgICAgL1x1QzlDMFx1QUUwOCBcdUIxNzhcdUQyQjgvLFxyXG4gICAgICAvXHVDNUY0XHVDNUI0XHVCNDU0IFx1QjE3OFx1RDJCOC8sXHJcbiAgICAgIC9cdUM3MDQgXHVCMEI0XHVDNkE5LyxcclxuICAgICAgL1x1QzVFQ1x1QUUzMCBcdUIwQjRcdUM2QTkvLFxyXG4gICAgICAvXHVCQ0Y4XHVCQjM4LyxcclxuICAgICAgL1x1QzEyMFx1RDBERCBcdUM2MDFcdUM1RUQvLFxyXG4gICAgICAvXHVDMTIwXHVEMEREXHVDNjAxXHVDNUVELyxcclxuICAgICAgL1x1QzEyMFx1RDBERFx1RDU1QyBcdUJEODBcdUJEODQvLFxyXG4gICAgICAvXHVCNERDXHVCNzk4XHVBREY4XHVENTVDLyxcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIG5vdGVSZWZlcmVuY2VQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PiBwYXR0ZXJuLnRlc3Qobm9ybWFsaXplZCkpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RvcENoYXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAodGhpcy5ydW5uaW5nVGFzayAhPT0gXCJjaGF0XCIgfHwgIXRoaXMuYWN0aXZlU2Vzc2lvbklkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCB0aGlzLnBvc3RKc29uKFwiL2FwaS9jaGF0L3N0b3BcIiwgeyBzZXNzaW9uX2lkOiB0aGlzLmFjdGl2ZVNlc3Npb25JZCB9KTtcclxuICAgICAgdGhpcy5hYm9ydEFjdGl2ZVJlcXVlc3QoKTtcclxuICAgICAgdGhpcy5ydW5uaW5nVGFzayA9IG51bGw7XHJcbiAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbklkID0gXCJcIjtcclxuICAgICAgdGhpcy5zdGF0dXNFbC5zZXRUZXh0KHRoaXMudChcInN0YXR1c0RvbmVcIikpO1xyXG4gICAgICB0aGlzLnNldEJ1c3koZmFsc2UpO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcldvcmtmbG93TG9nc1BhbmVsKCk7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQ2hhdFN0b3BwZWRcIikpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VDaGF0U3RvcEZhaWxlZFwiLCB7IG1lc3NhZ2UgfSkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcnVuUXVlcnkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2spIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUb29sQnVzeVwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIShhd2FpdCB0aGlzLnJlZnJlc2hCYWNrZW5kU3RhdGUoKSkpIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VCYWNrZW5kVW5hdmFpbGFibGVcIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uRWwudmFsdWUudHJpbSgpO1xyXG4gICAgaWYgKCFxdWVzdGlvbikge1xyXG4gICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZUVudGVyUXVlc3Rpb25cIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZSA9IHRoaXMucGx1Z2luLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xyXG4gICAgY29uc3Qgc2hvdWxkQXR0YWNoQ3VycmVudE5vdGUgPSBCb29sZWFuKGZpbGUpICYmIHRoaXMuc2hvdWxkQXR0YWNoQ3VycmVudE5vdGUocXVlc3Rpb24pO1xyXG4gICAgY29uc3Qgbm90ZUNvbnRlbnQgPSBzaG91bGRBdHRhY2hDdXJyZW50Tm90ZSAmJiBmaWxlXHJcbiAgICAgID8gYXdhaXQgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSlcclxuICAgICAgOiBcIlwiO1xyXG4gICAgY29uc3QgY29udGV4dEVudHJpZXMgPSBzaG91bGRBdHRhY2hDdXJyZW50Tm90ZSAmJiBmaWxlXG4gICAgICA/IGF3YWl0IHRoaXMuY29sbGVjdENvbnRleHQoZmlsZSlcbiAgICAgIDogW107XG4gICAgY29uc3QgY29udmVyc2F0aW9uSGlzdG9yeSA9IHRoaXMuY2hhdFR1cm5zXG4gICAgICAuZmlsdGVyKCh0dXJuKSA9PiB0dXJuLmFuc3dlci50cmltKCkpXG4gICAgICAuc2xpY2UoLTYpXG4gICAgICAubWFwKCh0dXJuKSA9PiAoe1xuICAgICAgICBxdWVzdGlvbjogdHVybi5xdWVzdGlvbixcbiAgICAgICAgYW5zd2VyOiB0dXJuLmFuc3dlcixcbiAgICAgIH0pKTtcbiAgICBjb25zdCBhY3RpdmVUaHJlYWQgPSB0aGlzLnBsdWdpbi5nZXRDaGF0VGhyZWFkKHRoaXMuYWN0aXZlVGhyZWFkSWQpO1xuICAgIGlmICghYWN0aXZlVGhyZWFkKSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZU5ld1RocmVhZCgpO1xuICAgIH1cblxuICAgIHRoaXMuYWJvcnRBY3RpdmVSZXF1ZXN0KCk7XG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgdGhpcy5hY3RpdmVTZXNzaW9uSWQgPSBgJHt0aGlzLmFjdGl2ZVRocmVhZElkIHx8IFwib2JzaWRpYW4tbG9jYWwtYWdlbnRcIn0tJHtEYXRlLm5vdygpfWA7XG5cbiAgICB0aGlzLmxhc3RRdWVzdGlvbiA9IHF1ZXN0aW9uO1xuICAgIHRoaXMuY3VycmVudEZpbGVQYXRoID0gc2hvdWxkQXR0YWNoQ3VycmVudE5vdGUgJiYgZmlsZSA/IGZpbGUucGF0aCA6IFwiXCI7XG4gICAgdGhpcy5jdXJyZW50Q29udGV4dEVudHJpZXMgPSBjb250ZXh0RW50cmllcztcbiAgICB0aGlzLmJhY2tlbmRTb3VyY2VzID0gW107XG4gICAgdGhpcy5iYWNrZW5kUmVjb21tZW5kYXRpb25zID0gW107XG4gICAgdGhpcy5hbnN3ZXJCYXNpcyA9IFwiXCI7XG4gICAgdGhpcy5jaGF0U2VlbkxvZ3MuY2xlYXIoKTtcbiAgICB0aGlzLmNoYXRUdXJucy5wdXNoKHtcbiAgICAgIHF1ZXN0aW9uLFxuICAgICAgYW5zd2VyOiBcIlwiLFxuICAgICAgYmFzaXM6IFwiXCIsXG4gICAgICByb3V0ZTogXCJcIixcbiAgICAgIHNvdXJjZXM6IFtdLFxuICAgICAgcmVjb21tZW5kYXRpb25zOiBbXSxcbiAgICAgIGF0dGFjaGVkRmlsZVBhdGg6IHNob3VsZEF0dGFjaEN1cnJlbnROb3RlICYmIGZpbGUgPyBmaWxlLnBhdGggOiBcIlwiLFxuICAgICAgY29udGV4dEVudHJpZXMsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbiAgICBjb25zdCB0aHJlYWRSZWNvcmQgPSB0aGlzLnBsdWdpbi5nZXRDaGF0VGhyZWFkKHRoaXMuYWN0aXZlVGhyZWFkSWQpO1xuICAgIGlmICh0aHJlYWRSZWNvcmQpIHtcbiAgICAgIHRocmVhZFJlY29yZC50dXJucyA9IHRoaXMuY2hhdFR1cm5zIGFzIFN0b3JlZENoYXRUdXJuW107XG4gICAgICB0aHJlYWRSZWNvcmQudXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgY29uc3QgdW50aXRsZWQgPSB0aHJlYWRSZWNvcmQudGl0bGUgPT09IHRoaXMudChcInRocmVhZFVudGl0bGVkXCIpO1xuICAgICAgaWYgKHVudGl0bGVkKSB7XG4gICAgICAgIGNvbnN0IGNvbXBhY3RUaXRsZSA9IHF1ZXN0aW9uLnJlcGxhY2UoL1xccysvZywgXCIgXCIpLnRyaW0oKTtcbiAgICAgICAgdGhyZWFkUmVjb3JkLnRpdGxlID0gY29tcGFjdFRpdGxlLmxlbmd0aCA+IDI0ID8gYCR7Y29tcGFjdFRpdGxlLnNsaWNlKDAsIDI0KX0uLi5gIDogY29tcGFjdFRpdGxlO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnBsdWdpbi5zb3J0Q2hhdFRocmVhZHNCeVJlY2VudCgpO1xuICAgIHRoaXMucmVuZGVyVGhyZWFkUm93KCk7XG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgdGhpcy5ydW5uaW5nVGFzayA9IFwiY2hhdFwiO1xuICAgIHRoaXMuc2V0QWN0aXZlVGFiKFwiY2hhdFwiKTtcbiAgICB0aGlzLnNldEJ1c3kodHJ1ZSk7XG4gICAgdGhpcy5yZW5kZXJlZE91dHB1dCA9IFwiXCI7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJDb250ZXh0UGFuZWxzKCk7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJPdXRwdXQoKTtcbiAgICB0aGlzLnN0YXR1c0VsLnNldFRleHQodGhpcy50KFwic3RhdHVzU3RyZWFtaW5nXCIsIHsgdXJsOiB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kVXJsIH0pKTtcblxyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgdGhpcy5zdHJlYW1DaGF0KHtcclxuICAgICAgICBxdWVzdGlvbixcclxuICAgICAgICBwcm9qZWN0X25hbWU6IHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRQcm9qZWN0LFxyXG4gICAgICAgIG1vZGVsX25hbWU6IFwicXdlbjMuNTo0YlwiLFxyXG4gICAgICAgIHNlc3Npb25faWQ6IHRoaXMuYWN0aXZlU2Vzc2lvbklkLFxyXG4gICAgICAgIGF0dGFjaF9jdXJyZW50X25vdGU6IHNob3VsZEF0dGFjaEN1cnJlbnROb3RlLFxyXG4gICAgICAgIGN1cnJlbnRfbm90ZV9wYXRoOiBzaG91bGRBdHRhY2hDdXJyZW50Tm90ZSAmJiBmaWxlID8gZmlsZS5wYXRoIDogXCJcIixcbiAgICAgICAgY3VycmVudF9ub3RlX2NvbnRlbnQ6IG5vdGVDb250ZW50LnNsaWNlKDAsIE1BWF9OT1RFX0NIQVJTKSxcbiAgICAgICAgY29udGV4dF9lbnRyaWVzOiBjb250ZXh0RW50cmllcy5tYXAoKGVudHJ5KSA9PiAoe1xuICAgICAgICAgIHBhdGg6IGVudHJ5LnBhdGgsXG4gICAgICAgICAgY29udGVudDogZW50cnkuY29udGVudC5zbGljZSgwLCBNQVhfQ09OVEVYVF9OT1RFX0NIQVJTKSxcbiAgICAgICAgICBzb3VyY2U6IGVudHJ5LnNvdXJjZSxcbiAgICAgICAgfSkpLFxuICAgICAgICBjb252ZXJzYXRpb25faGlzdG9yeTogY29udmVyc2F0aW9uSGlzdG9yeSxcbiAgICAgICAgbGFuZ3VhZ2U6IHRoaXMucGx1Z2luLmxhbmd1YWdlKCksXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3RhdHVzRWwuc2V0VGV4dCh0aGlzLnQoXCJzdGF0dXNEb25lXCIpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIHRoaXMuc3RhdHVzRWwuc2V0VGV4dCh0aGlzLnQoXCJzdGF0dXNFcnJvclwiKSk7XG4gICAgICBhd2FpdCB0aGlzLnNldFJlbmRlcmVkT3V0cHV0KGBbZXJyb3JdICR7bWVzc2FnZX1gKTtcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlTG9jYWxBZ2VudEVycm9yXCIsIHsgbWVzc2FnZSB9KSk7XG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5ydW5uaW5nVGFzayA9IG51bGw7XHJcbiAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbklkID0gXCJcIjtcclxuICAgICAgdGhpcy5zZXRCdXN5KGZhbHNlKTtcclxuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJXb3JrZmxvd0xvZ3NQYW5lbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYnVpbGRQcm9tcHQoXHJcbiAgICBxdWVzdGlvbjogc3RyaW5nLFxyXG4gICAgZmlsZTogVEZpbGUsXHJcbiAgICBub3RlQ29udGVudDogc3RyaW5nLFxyXG4gICAgY29udGV4dEVudHJpZXM6IENvbnRleHRFbnRyeVtdLFxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtcclxuICAgICAgYEN1cnJlbnQgbm90ZSBwYXRoOiAke2ZpbGUucGF0aH1gLFxyXG4gICAgICBcIlVzZSB0aGUgY3VycmVudCBub3RlIGFzIHRoZSBwcmltYXJ5IGNvbnRleHQuXCIsXHJcbiAgICAgIFwiXCIsXHJcbiAgICAgIFwiW1VzZXIgUXVlc3Rpb25dXCIsXHJcbiAgICAgIHF1ZXN0aW9uLFxyXG4gICAgICBcIlwiLFxyXG4gICAgICBcIltDdXJyZW50IE5vdGVdXCIsXHJcbiAgICAgIG5vdGVDb250ZW50LnRyaW0oKS5zbGljZSgwLCBNQVhfTk9URV9DSEFSUykgfHwgXCIoZW1wdHkgbm90ZSlcIixcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgZ3JvdXBzOiBDb250ZXh0U291cmNlW10gPSBbXCJsaW5rc1wiLCBcImZvbGRlclwiLCBcInRhZ3NcIiwgXCJiYWNrbGlua3NcIl07XHJcbiAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBncm91cHMpIHtcclxuICAgICAgY29uc3QgaXRlbXMgPSBjb250ZXh0RW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5zb3VyY2UgPT09IHNvdXJjZSk7XHJcbiAgICAgIGlmIChpdGVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VjdGlvbnMucHVzaChcIlwiLCBgW0NvbnRleHQ6JHtzb3VyY2V9XWApO1xyXG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICBzZWN0aW9ucy5wdXNoKFxyXG4gICAgICAgICAgYFxcbiMjICR7aXRlbS5maWxlLnBhdGh9XFxuJHtpdGVtLmNvbnRlbnQudHJpbSgpLnNsaWNlKDAsIE1BWF9DT05URVhUX05PVEVfQ0hBUlMpIHx8IFwiKGVtcHR5IG5vdGUpXCJ9YCxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2VjdGlvbnMucHVzaChcclxuICAgICAgXCJcIixcclxuICAgICAgXCJXaGVuIHlvdSBjaXRlIHJlbGF0ZWQgbm90ZXMsIHByZWZlciBPYnNpZGlhbiB3aWtpIGxpbmsgZm9ybWF0IGxpa2UgW1tOb3RlIE5hbWVdXS5cIixcclxuICAgICAgdGhpcy5wbHVnaW4uZ2V0UmVzcG9uc2VMYW5ndWFnZUluc3RydWN0aW9uKCksXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBzZWN0aW9ucy5qb2luKFwiXFxuXCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TGlua2VkRmlsZXMoZmlsZTogVEZpbGUpOiBURmlsZVtdIHtcclxuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xyXG4gICAgY29uc3QgdW5pcXVlID0gbmV3IE1hcDxzdHJpbmcsIFRGaWxlPigpO1xyXG4gICAgY29uc3QgcmVmZXJlbmNlcyA9IFtcclxuICAgICAgLi4uKGNhY2hlPy5saW5rcyA/PyBbXSksXHJcbiAgICAgIC4uLihjYWNoZT8uZW1iZWRzID8/IFtdKSxcclxuICAgICAgLi4uKGNhY2hlPy5mcm9udG1hdHRlckxpbmtzID8/IFtdKSxcclxuICAgIF07XHJcblxyXG4gICAgZm9yIChjb25zdCByZWZlcmVuY2Ugb2YgcmVmZXJlbmNlcykge1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdChyZWZlcmVuY2UubGluaywgZmlsZS5wYXRoKTtcclxuICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQucGF0aCAhPT0gZmlsZS5wYXRoKSB7XHJcbiAgICAgICAgdW5pcXVlLnNldCh0YXJnZXQucGF0aCwgdGFyZ2V0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgcmVsYXRlZEZpbGUgb2YgdGhpcy5nZXRGcm9udG1hdHRlclJlbGF0ZWRGaWxlcyhmaWxlKSkge1xyXG4gICAgICBpZiAocmVsYXRlZEZpbGUucGF0aCAhPT0gZmlsZS5wYXRoKSB7XHJcbiAgICAgICAgdW5pcXVlLnNldChyZWxhdGVkRmlsZS5wYXRoLCByZWxhdGVkRmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWUudmFsdWVzKCkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Rm9sZGVyRmlsZXMoZmlsZTogVEZpbGUpOiBURmlsZVtdIHtcclxuICAgIGNvbnN0IGZvbGRlclBhdGggPSBmaWxlLnBhcmVudD8ucGF0aDtcclxuICAgIGlmICghZm9sZGVyUGF0aCkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucGx1Z2luLmFwcC52YXVsdFxyXG4gICAgICAuZ2V0TWFya2Rvd25GaWxlcygpXHJcbiAgICAgIC5maWx0ZXIoKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLnBhdGggIT09IGZpbGUucGF0aCAmJiBjYW5kaWRhdGUucGFyZW50Py5wYXRoID09PSBmb2xkZXJQYXRoKTtcclxuICB9XHJcblxyXG4gIGdldFRhZ2dlZEZpbGVzKGZpbGU6IFRGaWxlKTogVEZpbGVbXSB7XHJcbiAgICBjb25zdCB0YWdTZXQgPSB0aGlzLmdldE5vcm1hbGl6ZWRUYWdzKGZpbGUpO1xyXG4gICAgaWYgKHRhZ1NldC5zaXplID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maWx0ZXIoKGNhbmRpZGF0ZSkgPT4ge1xyXG4gICAgICBpZiAoY2FuZGlkYXRlLnBhdGggPT09IGZpbGUucGF0aCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBjYW5kaWRhdGVUYWdzID0gdGhpcy5nZXROb3JtYWxpemVkVGFncyhjYW5kaWRhdGUpO1xyXG4gICAgICBmb3IgKGNvbnN0IHRhZyBvZiBjYW5kaWRhdGVUYWdzKSB7XHJcbiAgICAgICAgaWYgKHRhZ1NldC5oYXModGFnKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0Tm9ybWFsaXplZFRhZ3MoZmlsZTogVEZpbGUpOiBTZXQ8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcclxuICAgIGNvbnN0IHRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBjYWNoZT8udGFncyA/PyBbXSkge1xyXG4gICAgICBjb25zdCBub3JtYWxpemVkID0gdGhpcy5ub3JtYWxpemVUYWcodGFnLnRhZyk7XHJcbiAgICAgIGlmIChub3JtYWxpemVkKSB7XHJcbiAgICAgICAgdGFncy5hZGQobm9ybWFsaXplZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmcm9udG1hdHRlciA9IGNhY2hlPy5mcm9udG1hdHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcclxuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgW2Zyb250bWF0dGVyPy50YWdzLCBmcm9udG1hdHRlcj8udGFnXSkge1xyXG4gICAgICBmb3IgKGNvbnN0IHRhZyBvZiB0aGlzLmV4dHJhY3RGcm9udG1hdHRlclRhZ3ModmFsdWUpKSB7XHJcbiAgICAgICAgdGFncy5hZGQodGFnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YWdzO1xyXG4gIH1cclxuXHJcbiAgZXh0cmFjdEZyb250bWF0dGVyVGFncyh2YWx1ZTogdW5rbm93bik6IHN0cmluZ1tdIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICAgICAgLnNwbGl0KC9bLFxcbl0vKVxyXG4gICAgICAgIC5tYXAoKGl0ZW0pID0+IHRoaXMubm9ybWFsaXplVGFnKGl0ZW0pKVxyXG4gICAgICAgIC5maWx0ZXIoKGl0ZW0pOiBpdGVtIGlzIHN0cmluZyA9PiBCb29sZWFuKGl0ZW0pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlXHJcbiAgICAgICAgLmZsYXRNYXAoKGl0ZW0pID0+IHRoaXMuZXh0cmFjdEZyb250bWF0dGVyVGFncyhpdGVtKSlcclxuICAgICAgICAuZmlsdGVyKChpdGVtKTogaXRlbSBpcyBzdHJpbmcgPT4gQm9vbGVhbihpdGVtKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplVGFnKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBjb25zdCByYXcgPSBTdHJpbmcodmFsdWUgPz8gXCJcIikudHJpbSgpO1xyXG4gICAgaWYgKCFyYXcpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmF3LnN0YXJ0c1dpdGgoXCIjXCIpID8gcmF3IDogYCMke3Jhd31gO1xyXG4gIH1cclxuXHJcbiAgZ2V0QmFja2xpbmtGaWxlcyhmaWxlOiBURmlsZSk6IFRGaWxlW10ge1xyXG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5yZXNvbHZlZExpbmtzO1xyXG4gICAgY29uc3QgcmVzdWx0OiBURmlsZVtdID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCBbc291cmNlUGF0aCwgdGFyZ2V0c10gb2YgT2JqZWN0LmVudHJpZXMocmVzb2x2ZWQpKSB7XHJcbiAgICAgIGlmICghdGFyZ2V0c1tmaWxlLnBhdGhdIHx8IHNvdXJjZVBhdGggPT09IGZpbGUucGF0aCkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoc291cmNlUGF0aCk7XHJcbiAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBURmlsZSkge1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHNvdXJjZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgZ2V0RnJvbnRtYXR0ZXJSZWxhdGVkRmlsZXMoZmlsZTogVEZpbGUpOiBURmlsZVtdIHtcclxuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xyXG4gICAgY29uc3QgZnJvbnRtYXR0ZXIgPSBjYWNoZT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICBpZiAoIWZyb250bWF0dGVyKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByYXdWYWx1ZXMgPSBbXHJcbiAgICAgIGZyb250bWF0dGVyLnJlbGF0ZWRfZmlsZXMsXHJcbiAgICAgIGZyb250bWF0dGVyLnJlbGF0ZWRGaWxlcyxcclxuICAgICAgZnJvbnRtYXR0ZXIucmVsYXRlZF9ub3RlcyxcclxuICAgICAgZnJvbnRtYXR0ZXIucmVsYXRlZE5vdGVzLFxyXG4gICAgICBmcm9udG1hdHRlci5yZWxhdGVkLFxyXG4gICAgICBmcm9udG1hdHRlci5yZWZlcmVuY2VzLFxyXG4gICAgICBmcm9udG1hdHRlci5yZWZlcmVuY2VfZmlsZXMsXHJcbiAgICAgIGZyb250bWF0dGVyLnJlZmVyZW5jZUZpbGVzLFxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCB1bmlxdWUgPSBuZXcgTWFwPHN0cmluZywgVEZpbGU+KCk7XHJcbiAgICBmb3IgKGNvbnN0IHJhd1ZhbHVlIG9mIHJhd1ZhbHVlcykge1xyXG4gICAgICBmb3IgKGNvbnN0IHJhd0NhbmRpZGF0ZSBvZiB0aGlzLmV4dHJhY3RSZWxhdGVkQ2FuZGlkYXRlcyhyYXdWYWx1ZSkpIHtcclxuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZVJlbGF0ZWRGaWxlQ2FuZGlkYXRlKGZpbGUsIGZyb250bWF0dGVyLCByYXdDYW5kaWRhdGUpO1xyXG4gICAgICAgIGlmIChyZXNvbHZlZCAmJiByZXNvbHZlZC5wYXRoICE9PSBmaWxlLnBhdGgpIHtcclxuICAgICAgICAgIHVuaXF1ZS5zZXQocmVzb2x2ZWQucGF0aCwgcmVzb2x2ZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBBcnJheS5mcm9tKHVuaXF1ZS52YWx1ZXMoKSk7XHJcbiAgfVxyXG5cclxuICBleHRyYWN0UmVsYXRlZENhbmRpZGF0ZXModmFsdWU6IHVua25vd24pOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHJldHVybiBbdmFsdWVdO1xyXG4gICAgfVxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiB2YWx1ZS5mbGF0TWFwKChpdGVtKSA9PiB0aGlzLmV4dHJhY3RSZWxhdGVkQ2FuZGlkYXRlcyhpdGVtKSk7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZU9iamVjdCA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIGNhbmRpZGF0ZU9iamVjdC5wYXRoLFxyXG4gICAgICAgIGNhbmRpZGF0ZU9iamVjdC5maWxlLFxyXG4gICAgICAgIGNhbmRpZGF0ZU9iamVjdC5saW5rLFxyXG4gICAgICAgIGNhbmRpZGF0ZU9iamVjdC5uYW1lLFxyXG4gICAgICAgIGNhbmRpZGF0ZU9iamVjdC5zb3VyY2UsXHJcbiAgICAgIF0uZmxhdE1hcCgoaXRlbSkgPT4gdGhpcy5leHRyYWN0UmVsYXRlZENhbmRpZGF0ZXMoaXRlbSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgcmVzb2x2ZVJlbGF0ZWRGaWxlQ2FuZGlkYXRlKFxyXG4gICAgc291cmNlRmlsZTogVEZpbGUsXHJcbiAgICBmcm9udG1hdHRlcjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXHJcbiAgICByYXdDYW5kaWRhdGU6IHN0cmluZyxcclxuICApOiBURmlsZSB8IG51bGwge1xyXG4gICAgY29uc3QgY2FuZGlkYXRlID0gdGhpcy5ub3JtYWxpemVSZWxhdGVkQ2FuZGlkYXRlKHJhd0NhbmRpZGF0ZSk7XHJcbiAgICBpZiAoIWNhbmRpZGF0ZSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkaXJlY3QgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdChjYW5kaWRhdGUsIHNvdXJjZUZpbGUucGF0aCk7XHJcbiAgICBpZiAoZGlyZWN0ICYmIHRoaXMuaXNSZWFkYWJsZUNvbnRleHRGaWxlKGRpcmVjdCkpIHtcclxuICAgICAgcmV0dXJuIGRpcmVjdDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucGx1Z2luLnJlc29sdmVWYXVsdEZpbGUoY2FuZGlkYXRlKTtcclxuICAgIGlmIChyZXNvbHZlZCAmJiB0aGlzLmlzUmVhZGFibGVDb250ZXh0RmlsZShyZXNvbHZlZCkpIHtcclxuICAgICAgcmV0dXJuIHJlc29sdmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJhc2VOYW1lID0gY2FuZGlkYXRlLnNwbGl0KFwiL1wiKS5wb3AoKSA/PyBjYW5kaWRhdGU7XHJcbiAgICBjb25zdCBiYXNlTmFtZU5vRXh0ID0gYmFzZU5hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sIFwiXCIpO1xyXG4gICAgY29uc3QgY29sbGVjdGlvbiA9IFN0cmluZyhmcm9udG1hdHRlci5jb2xsZWN0aW9uID8/IFwiXCIpLnRyaW0oKTtcclxuICAgIGNvbnN0IGRvbWFpbiA9IFN0cmluZyhmcm9udG1hdHRlci5kb21haW4gPz8gXCJcIikudHJpbSgpO1xyXG4gICAgY29uc3Qgc291cmNlUGF0aCA9IHNvdXJjZUZpbGUucGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgIGNvbnN0IHJhbmtlZCA9IHRoaXMucGx1Z2luLmFwcC52YXVsdFxyXG4gICAgICAuZ2V0RmlsZXMoKVxyXG4gICAgICAuZmlsdGVyKChmaWxlKSA9PiB0aGlzLmlzUmVhZGFibGVDb250ZXh0RmlsZShmaWxlKSlcclxuICAgICAgLm1hcCgoZmlsZSkgPT4gKHsgZmlsZSwgc2NvcmU6IHRoaXMuc2NvcmVSZWxhdGVkQ2FuZGlkYXRlKGZpbGUsIGNhbmRpZGF0ZSwgYmFzZU5hbWUsIGJhc2VOYW1lTm9FeHQsIGNvbGxlY3Rpb24sIGRvbWFpbiwgc291cmNlUGF0aCkgfSkpXHJcbiAgICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uc2NvcmUgPiAwKVxyXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xyXG5cclxuICAgIHJldHVybiByYW5rZWRbMF0/LmZpbGUgPz8gbnVsbDtcclxuICB9XHJcblxyXG4gIG5vcm1hbGl6ZVJlbGF0ZWRDYW5kaWRhdGUocmF3Q2FuZGlkYXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgbGV0IGNhbmRpZGF0ZSA9IHJhd0NhbmRpZGF0ZS50cmltKCk7XHJcbiAgICBpZiAoIWNhbmRpZGF0ZSkge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICBjYW5kaWRhdGUgPSBjYW5kaWRhdGUucmVwbGFjZSgvXiE/XFxbXFxbLywgXCJcIikucmVwbGFjZSgvXFxdXFxdJC8sIFwiXCIpO1xyXG4gICAgaWYgKGNhbmRpZGF0ZS5pbmNsdWRlcyhcInxcIikpIHtcclxuICAgICAgY2FuZGlkYXRlID0gY2FuZGlkYXRlLnNwbGl0KFwifFwiKVswXS50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWFya2Rvd25MaW5rID0gY2FuZGlkYXRlLm1hdGNoKC9cXFtbXlxcXV0rXFxdXFwoKFteKV0rKVxcKS8pO1xyXG4gICAgaWYgKG1hcmtkb3duTGluaz8uWzFdKSB7XHJcbiAgICAgIGNhbmRpZGF0ZSA9IG1hcmtkb3duTGlua1sxXS50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZS5yZXBsYWNlKC9eW1wiJ118W1wiJ10kL2csIFwiXCIpLnRyaW0oKTtcclxuICB9XHJcblxyXG4gIHNjb3JlUmVsYXRlZENhbmRpZGF0ZShcclxuICAgIGZpbGU6IFRGaWxlLFxyXG4gICAgY2FuZGlkYXRlOiBzdHJpbmcsXHJcbiAgICBiYXNlTmFtZTogc3RyaW5nLFxyXG4gICAgYmFzZU5hbWVOb0V4dDogc3RyaW5nLFxyXG4gICAgY29sbGVjdGlvbjogc3RyaW5nLFxyXG4gICAgZG9tYWluOiBzdHJpbmcsXHJcbiAgICBzb3VyY2VQYXRoOiBzdHJpbmcsXHJcbiAgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGZpbGVQYXRoID0gZmlsZS5wYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xyXG4gICAgY29uc3QgZmlsZU5hbWUgPSBmaWxlLm5hbWU7XHJcbiAgICBjb25zdCBmaWxlQmFzZU5hbWUgPSBmaWxlLmJhc2VuYW1lO1xyXG4gICAgbGV0IHNjb3JlID0gMDtcclxuXHJcbiAgICBpZiAoZmlsZVBhdGggPT09IGNhbmRpZGF0ZSB8fCBmaWxlUGF0aC5lbmRzV2l0aChgLyR7Y2FuZGlkYXRlfWApKSB7XHJcbiAgICAgIHNjb3JlICs9IDEwMDtcclxuICAgIH1cclxuICAgIGlmIChmaWxlTmFtZSA9PT0gYmFzZU5hbWUpIHtcclxuICAgICAgc2NvcmUgKz0gODA7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsZUJhc2VOYW1lID09PSBiYXNlTmFtZU5vRXh0KSB7XHJcbiAgICAgIHNjb3JlICs9IDcwO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbGxlY3Rpb24gJiYgZmlsZVBhdGguaW5jbHVkZXMoYC8ke2NvbGxlY3Rpb259L2ApKSB7XHJcbiAgICAgIHNjb3JlICs9IDMwO1xyXG4gICAgfVxyXG4gICAgaWYgKGRvbWFpbiAmJiBmaWxlUGF0aC5pbmNsdWRlcyhgLyR7ZG9tYWlufS9gKSkge1xyXG4gICAgICBzY29yZSArPSAxNjtcclxuICAgIH1cclxuICAgIGlmIChzb3VyY2VQYXRoLmluY2x1ZGVzKFwiLzExX1JBR19Lbm93bGVkZ2VfQmFzZS9cIikgJiYgZmlsZVBhdGguaW5jbHVkZXMoXCIvMTBfQUlfRW5naW5lZXJpbmcvXCIpKSB7XHJcbiAgICAgIHNjb3JlICs9IDEyO1xyXG4gICAgfVxyXG4gICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKGNhbmRpZGF0ZSkgfHwgZmlsZUJhc2VOYW1lLmluY2x1ZGVzKGJhc2VOYW1lTm9FeHQpKSB7XHJcbiAgICAgIHNjb3JlICs9IDg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNjb3JlO1xyXG4gIH1cclxuXHJcbiAgaXNSZWFkYWJsZUNvbnRleHRGaWxlKGZpbGU6IFRGaWxlKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBleHQgPSBmaWxlLmV4dGVuc2lvbj8udG9Mb3dlckNhc2U/LigpID8/IFwiXCI7XHJcbiAgICBpZiAoIWV4dCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBDT05URVhUX1JFQURBQkxFX0VYVEVOU0lPTlMuaGFzKGV4dCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb2xsZWN0Q29udGV4dChmaWxlOiBURmlsZSk6IFByb21pc2U8Q29udGV4dEVudHJ5W10+IHtcbiAgICBjb25zdCBncm91cHM6IEFycmF5PHsgc291cmNlOiBDb250ZXh0U291cmNlOyBmaWxlczogVEZpbGVbXSB9PiA9IFtcclxuICAgICAgeyBzb3VyY2U6IFwibGlua3NcIiwgZmlsZXM6IHRoaXMuZ2V0TGlua2VkRmlsZXMoZmlsZSkgfSxcclxuICAgICAgeyBzb3VyY2U6IFwiZm9sZGVyXCIsIGZpbGVzOiB0aGlzLmdldEZvbGRlckZpbGVzKGZpbGUpIH0sXHJcbiAgICAgIHsgc291cmNlOiBcInRhZ3NcIiwgZmlsZXM6IHRoaXMuZ2V0VGFnZ2VkRmlsZXMoZmlsZSkgfSxcclxuICAgICAgeyBzb3VyY2U6IFwiYmFja2xpbmtzXCIsIGZpbGVzOiB0aGlzLmdldEJhY2tsaW5rRmlsZXMoZmlsZSkgfSxcclxuICAgIF07XHJcbiAgICBjb25zdCBlbnRyaWVzOiBDb250ZXh0RW50cnlbXSA9IFtdO1xyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPihbZmlsZS5wYXRoXSk7XHJcbiAgICBjb25zdCBjdXJzb3JzID0gbmV3IE1hcDxDb250ZXh0U291cmNlLCBudW1iZXI+KFtcclxuICAgICAgW1wibGlua3NcIiwgMF0sXHJcbiAgICAgIFtcImZvbGRlclwiLCAwXSxcclxuICAgICAgW1widGFnc1wiLCAwXSxcclxuICAgICAgW1wiYmFja2xpbmtzXCIsIDBdLFxyXG4gICAgXSk7XHJcblxyXG4gICAgd2hpbGUgKGVudHJpZXMubGVuZ3RoIDwgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4Q29udGV4dE5vdGVzKSB7XHJcbiAgICAgIGxldCBhZGRlZCA9IGZhbHNlO1xyXG4gICAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGdyb3Vwcykge1xyXG4gICAgICAgIGxldCBjdXJzb3IgPSBjdXJzb3JzLmdldChncm91cC5zb3VyY2UpID8/IDA7XHJcbiAgICAgICAgd2hpbGUgKGN1cnNvciA8IGdyb3VwLmZpbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29uc3QgY2FuZGlkYXRlID0gZ3JvdXAuZmlsZXNbY3Vyc29yXTtcclxuICAgICAgICAgIGN1cnNvciArPSAxO1xyXG4gICAgICAgICAgY3Vyc29ycy5zZXQoZ3JvdXAuc291cmNlLCBjdXJzb3IpO1xyXG4gICAgICAgICAgaWYgKHNlZW4uaGFzKGNhbmRpZGF0ZS5wYXRoKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlZW4uYWRkKGNhbmRpZGF0ZS5wYXRoKTtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmNhY2hlZFJlYWQoY2FuZGlkYXRlKTtcbiAgICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgICAgcGF0aDogY2FuZGlkYXRlLnBhdGgsXG4gICAgICAgICAgICBuYW1lOiBjYW5kaWRhdGUuYmFzZW5hbWUsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgc291cmNlOiBncm91cC5zb3VyY2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYWRkZWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA+PSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tYXhDb250ZXh0Tm90ZXMpIHtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIWFkZGVkKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZW50cmllcztcclxuICB9XHJcblxyXG4gIGFzeW5jIGNoZWNrQmFja2VuZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdldEpzb248eyBlbmdpbmU/OiBzdHJpbmc7IHN0YXR1cz86IHN0cmluZyB9PihcIi9oZWFsdGhcIik7XHJcbiAgICAgIHRoaXMuc3RhdHVzRWwuc2V0VGV4dChcclxuICAgICAgICB0aGlzLnQoXCJzdGF0dXNCYWNrZW5kUmVhZHlcIiwgeyBlbmdpbmU6IGRhdGEuZW5naW5lID8/IGRhdGEuc3RhdHVzID8/IFwidW5rbm93blwiIH0pLFxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgIHRoaXMuc3RhdHVzRWwuc2V0VGV4dCh0aGlzLnQoXCJzdGF0dXNCYWNrZW5kT2ZmbGluZVwiLCB7IG1lc3NhZ2UgfSkpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdHJlYW1OZGpzb24oXHJcbiAgICBwYXRoOiBzdHJpbmcsXHJcbiAgICBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcclxuICAgIG9uQ2h1bms6IChjaHVuazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkLFxyXG4gICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChgJHt0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kVXJsfSR7cGF0aH1gKTtcclxuICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcclxuICAgIGNvbnN0IHRyYW5zcG9ydCA9IHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IGh0dHBzIDogaHR0cDtcclxuXHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSB0cmFuc3BvcnQucmVxdWVzdChcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwcm90b2NvbDogdXJsLnByb3RvY29sLFxyXG4gICAgICAgICAgaG9zdG5hbWU6IHVybC5ob3N0bmFtZSxcclxuICAgICAgICAgIHBvcnQ6IHVybC5wb3J0ID8gTnVtYmVyKHVybC5wb3J0KSA6IHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiA/IDQ0MyA6IDgwLFxyXG4gICAgICAgICAgcGF0aDogYCR7dXJsLnBhdGhuYW1lfSR7dXJsLnNlYXJjaH1gLFxyXG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgIFwiQ29udGVudC1MZW5ndGhcIjogQnVmZmVyLmJ5dGVMZW5ndGgoYm9keSksXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICB2b2lkIChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBidWZmZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXNDb2RlID8/IDA7XHJcbiAgICAgICAgICAgICAgaWYgKHN0YXR1c0NvZGUgPCAyMDAgfHwgc3RhdHVzQ29kZSA+PSAzMDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnJvckJvZHkgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICBlcnJvckJvZHkgKz0gdHlwZW9mIGNodW5rID09PSBcInN0cmluZ1wiID8gY2h1bmsgOiBjaHVuay50b1N0cmluZyhcInV0ZjhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgIGBCYWNrZW5kIHJlcXVlc3QgZmFpbGVkOiAke3N0YXR1c0NvZGV9JHtlcnJvckJvZHkgPyBgICR7ZXJyb3JCb2R5fWAgOiBcIlwifWAsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dENodW5rID0gdHlwZW9mIGNodW5rID09PSBcInN0cmluZ1wiID8gY2h1bmsgOiBjaHVuay50b1N0cmluZyhcInV0ZjhcIik7XHJcbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gdGV4dENodW5rO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBidWZmZXIuc3BsaXQoXCJcXG5cIik7XHJcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBsaW5lcy5wb3AoKSA/PyBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmICghdHJpbW1lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGF3YWl0IG9uQ2h1bmsoSlNPTi5wYXJzZSh0cmltbWVkKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoYnVmZmVyLnRyaW0oKSkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgb25DaHVuayhKU09OLnBhcnNlKGJ1ZmZlci50cmltKCkpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jbGVhckFjdGl2ZVJlcXVlc3QocmVxdWVzdCwgb25BYm9ydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiB7XHJcbiAgICAgICAgcmVxdWVzdC5kZXN0cm95KG5ldyBFcnJvcihcIlJlcXVlc3QgYWJvcnRlZFwiKSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmFjdGl2ZVJlcXVlc3QgPSByZXF1ZXN0O1xyXG4gICAgICB0aGlzLmFib3J0Q29udHJvbGxlcj8uc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0LCB7IG9uY2U6IHRydWUgfSk7XHJcbiAgICAgIHJlcXVlc3Qub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcclxuICAgICAgICB0aGlzLmNsZWFyQWN0aXZlUmVxdWVzdChyZXF1ZXN0LCBvbkFib3J0KTtcclxuICAgICAgICBpZiAodGhpcy5hYm9ydENvbnRyb2xsZXI/LnNpZ25hbC5hYm9ydGVkKSB7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXF1ZXN0LndyaXRlKGJvZHkpO1xyXG4gICAgICByZXF1ZXN0LmVuZCgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdHJlYW1DaGF0KHBheWxvYWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBhd2FpdCB0aGlzLnN0cmVhbU5kanNvbihcIi9hcGkvY2hhdC9vYnNpZGlhbi9zdHJlYW1cIiwgcGF5bG9hZCwgYXN5bmMgKGNodW5rKSA9PiB7XHJcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlQ2h1bmsoY2h1bmsgYXMgU3RyZWFtQ2h1bmspO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhYm9ydEFjdGl2ZVJlcXVlc3QoKTogdm9pZCB7XHJcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlcj8uYWJvcnQoKTtcclxuICAgIHRoaXMuYWN0aXZlUmVxdWVzdD8uZGVzdHJveShuZXcgRXJyb3IoXCJSZXF1ZXN0IGFib3J0ZWRcIikpO1xyXG4gICAgdGhpcy5hY3RpdmVSZXF1ZXN0ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGNsZWFyQWN0aXZlUmVxdWVzdChyZXF1ZXN0OiBodHRwLkNsaWVudFJlcXVlc3QsIG9uQWJvcnQ6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmVSZXF1ZXN0ID09PSByZXF1ZXN0KSB7XG4gICAgICB0aGlzLmFjdGl2ZVJlcXVlc3QgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmFib3J0Q29udHJvbGxlcj8uc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0KTtcbiAgfVxuXG4gIGdldExhdGVzdENoYXRUdXJuKCk6IENoYXRUdXJuIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY2hhdFR1cm5zLmxlbmd0aCA+IDAgPyB0aGlzLmNoYXRUdXJuc1t0aGlzLmNoYXRUdXJucy5sZW5ndGggLSAxXSA6IG51bGw7XG4gIH1cblxuICBnZXRMYXRlc3RDb21wbGV0ZWRUdXJuKCk6IENoYXRUdXJuIHwgbnVsbCB7XG4gICAgZm9yIChsZXQgaW5kZXggPSB0aGlzLmNoYXRUdXJucy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleCAtPSAxKSB7XG4gICAgICBjb25zdCB0dXJuID0gdGhpcy5jaGF0VHVybnNbaW5kZXhdO1xuICAgICAgaWYgKHR1cm4uYW5zd2VyLnRyaW0oKSkge1xuICAgICAgICByZXR1cm4gdHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRMYXRlc3RTdGF0ZVR1cm4oKTogQ2hhdFR1cm4gfCBudWxsIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IHRoaXMuY2hhdFR1cm5zLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4IC09IDEpIHtcbiAgICAgIGNvbnN0IHR1cm4gPSB0aGlzLmNoYXRUdXJuc1tpbmRleF07XG4gICAgICBpZiAoXG4gICAgICAgIHR1cm4uYW5zd2VyLnRyaW0oKVxuICAgICAgICB8fCB0dXJuLnF1ZXN0aW9uLnRyaW0oKVxuICAgICAgICB8fCAodHVybi5zb3VyY2VzPy5sZW5ndGggPz8gMCkgPiAwXG4gICAgICAgIHx8ICh0dXJuLnJlY29tbWVuZGF0aW9ucz8ubGVuZ3RoID8/IDApID4gMFxuICAgICAgICB8fCAodHVybi5jb250ZXh0RW50cmllcz8ubGVuZ3RoID8/IDApID4gMFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHVwZGF0ZUxhdGVzdENoYXRUdXJuKHBhdGNoOiBQYXJ0aWFsPENoYXRUdXJuPik6IHZvaWQge1xuICAgIGNvbnN0IHR1cm4gPSB0aGlzLmdldExhdGVzdENoYXRUdXJuKCk7XG4gICAgaWYgKCF0dXJuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5hc3NpZ24odHVybiwgcGF0Y2gpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlQ2h1bmsoY2h1bms6IFN0cmVhbUNodW5rKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHNob3VsZFJlbmRlclBhbmVscyA9IGZhbHNlO1xuICAgIGxldCBzaG91bGRQZXJzaXN0VGhyZWFkID0gZmFsc2U7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2h1bmsuc291cmNlcykpIHtcbiAgICAgIGNvbnN0IG5leHRTb3VyY2VzID0gSlNPTi5zdHJpbmdpZnkoY2h1bmsuc291cmNlcyk7XG4gICAgICBjb25zdCBjdXJyZW50U291cmNlcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuYmFja2VuZFNvdXJjZXMpO1xuICAgICAgaWYgKG5leHRTb3VyY2VzICE9PSBjdXJyZW50U291cmNlcykge1xuICAgICAgICB0aGlzLmJhY2tlbmRTb3VyY2VzID0gY2h1bmsuc291cmNlcztcbiAgICAgICAgdGhpcy51cGRhdGVMYXRlc3RDaGF0VHVybih7IHNvdXJjZXM6IGNodW5rLnNvdXJjZXMgfSk7XG4gICAgICAgIHNob3VsZFJlbmRlclBhbmVscyA9IHRydWU7XG4gICAgICAgIHNob3VsZFBlcnNpc3RUaHJlYWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGNodW5rLnJlY29tbWVuZGF0aW9ucykpIHtcbiAgICAgIGNvbnN0IG5leHRSZWNvbW1lbmRhdGlvbnMgPSBKU09OLnN0cmluZ2lmeShjaHVuay5yZWNvbW1lbmRhdGlvbnMpO1xuICAgICAgY29uc3QgY3VycmVudFJlY29tbWVuZGF0aW9ucyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuYmFja2VuZFJlY29tbWVuZGF0aW9ucyk7XG4gICAgICBpZiAobmV4dFJlY29tbWVuZGF0aW9ucyAhPT0gY3VycmVudFJlY29tbWVuZGF0aW9ucykge1xuICAgICAgICB0aGlzLmJhY2tlbmRSZWNvbW1lbmRhdGlvbnMgPSBjaHVuay5yZWNvbW1lbmRhdGlvbnM7XG4gICAgICAgIHRoaXMudXBkYXRlTGF0ZXN0Q2hhdFR1cm4oeyByZWNvbW1lbmRhdGlvbnM6IGNodW5rLnJlY29tbWVuZGF0aW9ucyB9KTtcbiAgICAgICAgc2hvdWxkUmVuZGVyUGFuZWxzID0gdHJ1ZTtcbiAgICAgICAgc2hvdWxkUGVyc2lzdFRocmVhZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNob3VsZFJlbmRlclBhbmVscykge1xuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJDb250ZXh0UGFuZWxzKCk7XG4gICAgICBhd2FpdCB0aGlzLnBlcnNpc3RBY3RpdmVUaHJlYWRTdGF0ZSgpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2h1bmsuYmFzaXMgPT09IFwic3RyaW5nXCIgJiYgY2h1bmsuYmFzaXMgIT09IHRoaXMuYW5zd2VyQmFzaXMpIHtcbiAgICAgIHRoaXMuYW5zd2VyQmFzaXMgPSBjaHVuay5iYXNpcztcbiAgICAgIHRoaXMudXBkYXRlTGF0ZXN0Q2hhdFR1cm4oeyBiYXNpczogY2h1bmsuYmFzaXMgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNodW5rLnN0ZXAgPT09IFwiaW5pdFwiICYmIHR5cGVvZiBjaHVuay5yb3V0ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy51cGRhdGVMYXRlc3RDaGF0VHVybih7IHJvdXRlOiBjaHVuay5yb3V0ZSB9KTtcbiAgICAgIHRoaXMucmVjb3JkQ2hhdExvZ3MoW2Bbcm91dGVdICR7Y2h1bmsucm91dGV9YF0pO1xuICAgICAgc2hvdWxkUGVyc2lzdFRocmVhZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY2h1bmsucm91dGUgPT09IFwic3RyaW5nXCIgJiYgY2h1bmsucm91dGUpIHtcbiAgICAgIHRoaXMudXBkYXRlTGF0ZXN0Q2hhdFR1cm4oeyByb3V0ZTogY2h1bmsucm91dGUgfSk7XG4gICAgICBzaG91bGRQZXJzaXN0VGhyZWFkID0gdHJ1ZTtcbiAgICB9XG5cclxuICAgIHRoaXMucmVjb3JkQ2hhdExvZ3MoY2h1bmsubG9ncyk7XHJcbiAgICB0aGlzLnJlY29yZENoYXRMb2dzKGNodW5rLnN0YXRlPy5sb2dzKTtcclxuXHJcbiAgICBpZiAodHlwZW9mIGNodW5rLmFuc3dlciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKGNodW5rLnN0ZXAgPT09IFwiZXJyb3JcIikge1xuICAgICAgICBhd2FpdCB0aGlzLnNldFJlbmRlcmVkT3V0cHV0KGBbZXJyb3JdICR7Y2h1bmsuYW5zd2VyfWApO1xuICAgICAgICBhd2FpdCB0aGlzLnBlcnNpc3RBY3RpdmVUaHJlYWRTdGF0ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnNldFJlbmRlcmVkT3V0cHV0KGNodW5rLmFuc3dlcik7XG4gICAgICBpZiAoY2h1bmsuc3RlcCA9PT0gXCJkb25lXCIgfHwgY2h1bmsuc3RlcCA9PT0gXCJzdG9wcGVkXCIpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wZXJzaXN0QWN0aXZlVGhyZWFkU3RhdGUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNob3VsZFBlcnNpc3RUaHJlYWQpIHtcbiAgICAgIGF3YWl0IHRoaXMucGVyc2lzdEFjdGl2ZVRocmVhZFN0YXRlKCk7XG4gICAgfVxuICB9XG5cclxuICByZWNvcmRDaGF0TG9ncyhsb2dzPzogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShsb2dzKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbG9ncykge1xyXG4gICAgICBjb25zdCBub3JtYWxpemVkID0gbGluZS50cmltKCk7XHJcbiAgICAgIGlmICghbm9ybWFsaXplZCB8fCB0aGlzLmNoYXRTZWVuTG9ncy5oYXMobm9ybWFsaXplZCkpIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNoYXRTZWVuTG9ncy5hZGQobm9ybWFsaXplZCk7XHJcbiAgICAgIHRoaXMucmVjb3JkV29ya2Zsb3dMb2coXCJjaGF0XCIsIG5vcm1hbGl6ZWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2V0UmVuZGVyZWRPdXRwdXQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRleHQgPT09IHRoaXMucmVuZGVyZWRPdXRwdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJlZE91dHB1dCA9IHRleHQ7XG4gICAgdGhpcy51cGRhdGVMYXRlc3RDaGF0VHVybih7IGFuc3dlcjogdGV4dCwgYmFzaXM6IHRoaXMuYW5zd2VyQmFzaXMgfSk7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJPdXRwdXQoKTtcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck91dHB1dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNoYXRMb2dFbC5lbXB0eSgpO1xuICAgIHRoaXMuY29udmVyc2F0aW9uQWN0aW9uc0VsPy5wYXJlbnRFbGVtZW50Py5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtaGlkZGVuXCIsICF0aGlzLmdldExhdGVzdENvbXBsZXRlZFR1cm4oKSk7XG4gICAgaWYgKHRoaXMuY2hhdFR1cm5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgZW1wdHlFbCA9IHRoaXMuY2hhdExvZ0VsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY2hhdC1lbXB0eVwiIH0pO1xuICAgICAgYXdhaXQgTWFya2Rvd25SZW5kZXJlci5yZW5kZXIoXG4gICAgICAgIHRoaXMuYXBwLFxuICAgICAgICB0aGlzLmxpbmtpZnlWYXVsdFBhdGhzKHRoaXMudChcIm91dHB1dFJlYWR5XCIpKSxcbiAgICAgICAgZW1wdHlFbCxcbiAgICAgICAgXCJcIixcbiAgICAgICAgdGhpcyxcbiAgICAgICk7XG4gICAgICB0aGlzLmNoYXRMb2dFbC5zY3JvbGxUb3AgPSB0aGlzLmNoYXRMb2dFbC5zY3JvbGxIZWlnaHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB0dXJuIG9mIHRoaXMuY2hhdFR1cm5zKSB7XG4gICAgICBjb25zdCB0dXJuRWwgPSB0aGlzLmNoYXRMb2dFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNoYXQtdHVyblwiIH0pO1xuXG4gICAgICBjb25zdCBxdWVzdGlvbldyYXAgPSB0dXJuRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1jaGF0LXR1cm4tcXVlc3Rpb24td3JhcFwiIH0pO1xuICAgICAgcXVlc3Rpb25XcmFwLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY2hhdC10dXJuLWxhYmVsXCIsIHRleHQ6IFwiWW91XCIgfSk7XG4gICAgICBjb25zdCBxdWVzdGlvbkVsID0gcXVlc3Rpb25XcmFwLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY2hhdC10dXJuLXF1ZXN0aW9uXCIgfSk7XG4gICAgICBhd2FpdCBNYXJrZG93blJlbmRlcmVyLnJlbmRlcihcbiAgICAgICAgdGhpcy5hcHAsXG4gICAgICAgIHRoaXMubGlua2lmeVZhdWx0UGF0aHModHVybi5xdWVzdGlvbiksXG4gICAgICAgIHF1ZXN0aW9uRWwsXG4gICAgICAgIHR1cm4uYXR0YWNoZWRGaWxlUGF0aCB8fCBcIlwiLFxuICAgICAgICB0aGlzLFxuICAgICAgKTtcblxuICAgICAgY29uc3QgYW5zd2VyV3JhcCA9IHR1cm5FbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNoYXQtdHVybi1hbnN3ZXItd3JhcFwiIH0pO1xuICAgICAgYW5zd2VyV3JhcC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNoYXQtdHVybi1sYWJlbFwiLCB0ZXh0OiBcIkFnZW50XCIgfSk7XG4gICAgICBjb25zdCBiYXNpc0xhYmVsID0gdGhpcy5nZXRBbnN3ZXJCYXNpc0xhYmVsKHR1cm4uYmFzaXMpO1xuICAgICAgaWYgKGJhc2lzTGFiZWwgJiYgdHVybi5hbnN3ZXIudHJpbSgpKSB7XG4gICAgICAgIGFuc3dlcldyYXAuY3JlYXRlRGl2KHtcbiAgICAgICAgICBjbHM6IFwib2xhLWFuc3dlci1iYXNpc1wiLFxuICAgICAgICAgIHRleHQ6IGJhc2lzTGFiZWwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgY29uc3QgYW5zd2VyRWwgPSBhbnN3ZXJXcmFwLmNyZWF0ZURpdih7IGNsczogXCJvbGEtY2hhdC10dXJuLWFuc3dlclwiIH0pO1xuICAgICAgY29uc3QgYW5zd2VyVGV4dCA9IHR1cm4uYW5zd2VyIHx8ICh0dXJuID09PSB0aGlzLmdldExhdGVzdENoYXRUdXJuKCkgJiYgdGhpcy5ydW5uaW5nVGFzayA9PT0gXCJjaGF0XCJcbiAgICAgICAgPyB0aGlzLnQoXCJvdXRwdXRHZW5lcmF0aW5nXCIpXG4gICAgICAgIDogdGhpcy50KFwib3V0cHV0UmVhZHlcIikpO1xuICAgICAgYXdhaXQgTWFya2Rvd25SZW5kZXJlci5yZW5kZXIoXG4gICAgICAgIHRoaXMuYXBwLFxuICAgICAgICB0aGlzLmxpbmtpZnlWYXVsdFBhdGhzKGFuc3dlclRleHQpLFxuICAgICAgICBhbnN3ZXJFbCxcbiAgICAgICAgdHVybi5hdHRhY2hlZEZpbGVQYXRoIHx8IFwiXCIsXG4gICAgICAgIHRoaXMsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLmNoYXRMb2dFbC5zY3JvbGxUb3AgPSB0aGlzLmNoYXRMb2dFbC5zY3JvbGxIZWlnaHQ7XG4gIH1cblxuICBnZXRBbnN3ZXJCYXNpc0xhYmVsKGJhc2lzID0gdGhpcy5hbnN3ZXJCYXNpcyk6IHN0cmluZyB7XG4gICAgaWYgKGJhc2lzID09PSBcImN1cnJlbnRfbm90ZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy50KFwiYmFzaXNDdXJyZW50Tm90ZVwiKTtcbiAgICB9XG4gICAgaWYgKGJhc2lzID09PSBcIm9ic2lkaWFuX3NlYXJjaFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy50KFwiYmFzaXNPYnNpZGlhblNlYXJjaFwiKTtcbiAgICB9XG4gICAgaWYgKGJhc2lzID09PSBcImdlbmVyYWxfa25vd2xlZGdlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnQoXCJiYXNpc0dlbmVyYWxLbm93bGVkZ2VcIik7XG4gICAgfVxuICAgIHJldHVybiBcIlwiO1xuICB9XG5cclxuICBhc3luYyByZW5kZXJDb250ZXh0UGFuZWxzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMucmVuZGVyU2VudENvbnRleHRQYW5lbCgpO1xuICAgIGF3YWl0IHRoaXMucmVuZGVyU291cmNlUGFuZWwoKTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlclJlY29tbWVuZGF0aW9uUGFuZWwoKTtcbiAgfVxuXHJcbiAgY3JlYXRlRmllbGQoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBsYWJlbDogc3RyaW5nKTogSFRNTERpdkVsZW1lbnQge1xyXG4gICAgY29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmllbGRcIiB9KTtcclxuICAgIHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IGNsczogXCJvbGEtZmllbGQtbGFiZWxcIiwgdGV4dDogbGFiZWwgfSk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxuICB9XHJcblxyXG4gIGNyZWF0ZVNlY3Rpb25EZXRhaWxzKFxyXG4gICAgY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LFxyXG4gICAgdGl0bGU6IHN0cmluZyxcclxuICAgIG9wZW4gPSBmYWxzZSxcclxuICAgIGJ1aWxkU3VtbWFyeUFjdGlvbnM/OiAoYWN0aW9uc0VsOiBIVE1MRGl2RWxlbWVudCkgPT4gdm9pZCxcclxuICApOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICBjb25zdCBkZXRhaWxzRWwgPSBjb250YWluZXJFbC5jcmVhdGVFbChcImRldGFpbHNcIiwgeyBjbHM6IFwib2xhLXN0YWdlLXNlY3Rpb25cIiB9KTtcclxuICAgIGlmIChvcGVuKSB7XHJcbiAgICAgIGRldGFpbHNFbC5vcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHN1bW1hcnlFbCA9IGRldGFpbHNFbC5jcmVhdGVFbChcInN1bW1hcnlcIiwgeyBjbHM6IFwib2xhLXN0YWdlLXN1bW1hcnlcIiB9KTtcclxuICAgIHN1bW1hcnlFbC5jcmVhdGVTcGFuKHsgY2xzOiBcIm9sYS1zdGFnZS1zdW1tYXJ5LXRpdGxlXCIsIHRleHQ6IHRpdGxlIH0pO1xyXG4gICAgaWYgKGJ1aWxkU3VtbWFyeUFjdGlvbnMpIHtcclxuICAgICAgY29uc3Qgc3VtbWFyeUFjdGlvbnNFbCA9IHN1bW1hcnlFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXN0YWdlLXN1bW1hcnktYWN0aW9uc1wiIH0pO1xyXG4gICAgICBidWlsZFN1bW1hcnlBY3Rpb25zKHN1bW1hcnlBY3Rpb25zRWwpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRldGFpbHNFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXN0YWdlLWJvZHlcIiB9KTtcclxuICB9XHJcblxyXG4gIGNhcHR1cmVPcGVuRGV0YWlscyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiBTZXQ8c3RyaW5nPiB7XHJcbiAgICBjb25zdCBvcGVuS2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgY29uc3QgZGV0YWlscyA9IEFycmF5LmZyb20oY29udGFpbmVyRWwucXVlcnlTZWxlY3RvckFsbChcImRldGFpbHNcIikpO1xyXG4gICAgZGV0YWlscy5mb3JFYWNoKChkZXRhaWxFbCwgaW5kZXgpID0+IHtcclxuICAgICAgaWYgKCEoZGV0YWlsRWwgaW5zdGFuY2VvZiBIVE1MRGV0YWlsc0VsZW1lbnQpIHx8ICFkZXRhaWxFbC5vcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHN1bW1hcnlUZXh0ID0gZGV0YWlsRWwucXVlcnlTZWxlY3RvcihcIi5vbGEtc3RhZ2Utc3VtbWFyeS10aXRsZVwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKVxyXG4gICAgICAgID8/IGRldGFpbEVsLnF1ZXJ5U2VsZWN0b3IoXCJzdW1tYXJ5XCIpPy50ZXh0Q29udGVudD8udHJpbSgpXHJcbiAgICAgICAgPz8gXCJcIjtcclxuICAgICAgb3BlbktleXMuYWRkKGAke2luZGV4fToke3N1bW1hcnlUZXh0fWApO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gb3BlbktleXM7XHJcbiAgfVxyXG5cclxuICByZXN0b3JlT3BlbkRldGFpbHMoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBvcGVuS2V5czogU2V0PHN0cmluZz4pOiB2b2lkIHtcclxuICAgIGNvbnN0IGRldGFpbHMgPSBBcnJheS5mcm9tKGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJkZXRhaWxzXCIpKTtcclxuICAgIGRldGFpbHMuZm9yRWFjaCgoZGV0YWlsRWwsIGluZGV4KSA9PiB7XHJcbiAgICAgIGlmICghKGRldGFpbEVsIGluc3RhbmNlb2YgSFRNTERldGFpbHNFbGVtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzdW1tYXJ5VGV4dCA9IGRldGFpbEVsLnF1ZXJ5U2VsZWN0b3IoXCIub2xhLXN0YWdlLXN1bW1hcnktdGl0bGVcIik/LnRleHRDb250ZW50Py50cmltKClcclxuICAgICAgICA/PyBkZXRhaWxFbC5xdWVyeVNlbGVjdG9yKFwic3VtbWFyeVwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKVxyXG4gICAgICAgID8/IFwiXCI7XHJcbiAgICAgIGRldGFpbEVsLm9wZW4gPSBvcGVuS2V5cy5oYXMoYCR7aW5kZXh9OiR7c3VtbWFyeVRleHR9YCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJlbmRlclRvb2xTdW1tYXJ5KHBhbmVsRWw6IEhUTUxEaXZFbGVtZW50LCB0aXRsZTogc3RyaW5nLCBzdGF0dXM6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgIHBhbmVsRWwuZW1wdHkoKTtcclxuICAgIGNvbnN0IHN1bW1hcnlFbCA9IHBhbmVsRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLXN1bW1hcnlcIiB9KTtcclxuICAgIGNvbnN0IHRpdGxlRWwgPSBzdW1tYXJ5RWwuY3JlYXRlU3Bhbih7IHRleHQ6IHRpdGxlIH0pO1xyXG4gICAgdGl0bGVFbC5hZGRDbGFzcyhcIm9sYS13b3JrZmxvdy1zdW1tYXJ5LXRpdGxlXCIpO1xyXG4gICAgY29uc3Qgc3RhdHVzRWwgPSBzdW1tYXJ5RWwuY3JlYXRlU3Bhbih7IHRleHQ6IHN0YXR1cyB9KTtcclxuICAgIHN0YXR1c0VsLmFkZENsYXNzKFwib2xhLXdvcmtmbG93LXN1bW1hcnktc3RhdHVzXCIpO1xyXG4gICAgcmV0dXJuIHBhbmVsRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLWJvZHlcIiB9KTtcclxuICB9XHJcblxyXG4gIGdldEpvYkxpc3QoKTogVG9vbEpvYltdIHtcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMudG9vbENvbmZpZz8uam9icykgPyB0aGlzLnRvb2xDb25maWc/LmpvYnMgPz8gW10gOiBbXTtcclxuICB9XHJcblxyXG4gIGlzR2VuZXJhdG9yU3VwcG9ydGVkRmlsZShmaWxlOiBURmlsZSk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIEdFTkVSQVRPUl9TVVBQT1JURURfRVhURU5TSU9OUy5oYXMoZmlsZS5leHRlbnNpb24udG9Mb3dlckNhc2UoKSlcclxuICAgICAgJiYgIWZpbGUucGF0aC5zcGxpdChcIi9cIikuc29tZSgocGFydCkgPT4gcGFydC5zdGFydHNXaXRoKFwiLlwiKSk7XHJcbiAgfVxyXG5cclxuICBnZXRHZW5lcmF0b3JSb290S2V5KGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGZpbGVQYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xyXG4gICAgY29uc3Qgc2xhc2hJbmRleCA9IG5vcm1hbGl6ZWQuaW5kZXhPZihcIi9cIik7XHJcbiAgICByZXR1cm4gc2xhc2hJbmRleCA9PT0gLTEgPyBHRU5FUkFUT1JfUk9PVF9TRU5USU5FTCA6IG5vcm1hbGl6ZWQuc2xpY2UoMCwgc2xhc2hJbmRleCk7XHJcbiAgfVxyXG5cclxuICBnZXRHZW5lcmF0b3JSb290TGFiZWwocm9vdFBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gcm9vdFBhdGggPT09IEdFTkVSQVRPUl9ST09UX1NFTlRJTkVMID8gdGhpcy50KFwiZ2VuZXJhdG9yUm9vdEZvbGRlclwiKSA6IHJvb3RQYXRoO1xyXG4gIH1cclxuXHJcbiAgZ2V0R2VuZXJhdG9yUm9vdEVudHJpZXMoKTogR2VuZXJhdG9yUm9vdEVudHJ5W10ge1xyXG4gICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIEdlbmVyYXRvclJvb3RFbnRyeT4oKTtcclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0RmlsZXMoKSkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNHZW5lcmF0b3JTdXBwb3J0ZWRGaWxlKGZpbGUpKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgcm9vdFBhdGggPSB0aGlzLmdldEdlbmVyYXRvclJvb3RLZXkoZmlsZS5wYXRoKTtcclxuICAgICAgY29uc3QgY3VycmVudCA9IGdyb3Vwcy5nZXQocm9vdFBhdGgpID8/IHtcclxuICAgICAgICBwYXRoOiByb290UGF0aCxcclxuICAgICAgICBsYWJlbDogdGhpcy5nZXRHZW5lcmF0b3JSb290TGFiZWwocm9vdFBhdGgpLFxyXG4gICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgIHNpemU6IDAsXHJcbiAgICAgIH07XHJcbiAgICAgIGN1cnJlbnQuY291bnQgKz0gMTtcclxuICAgICAgY3VycmVudC5zaXplICs9IGZpbGUuc3RhdC5zaXplO1xyXG4gICAgICBncm91cHMuc2V0KHJvb3RQYXRoLCBjdXJyZW50KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShncm91cHMudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgaWYgKGEucGF0aCA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUwpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGIucGF0aCA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUwpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IEludGwuQ29sbGF0b3IodGhpcy5wbHVnaW4uZ2V0TG9jYWxlKCksIHtcclxuICAgICAgICBudW1lcmljOiB0cnVlLFxyXG4gICAgICAgIHNlbnNpdGl2aXR5OiBcImJhc2VcIixcclxuICAgICAgfSkuY29tcGFyZShhLmxhYmVsLCBiLmxhYmVsKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0UHJlZmVycmVkR2VuZXJhdG9ySW5wdXREaXIoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGFjdGl2ZUZpbGUgPSB0aGlzLnBsdWdpbi5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcclxuICAgIGlmIChhY3RpdmVGaWxlICYmIHRoaXMuaXNHZW5lcmF0b3JTdXBwb3J0ZWRGaWxlKGFjdGl2ZUZpbGUpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEdlbmVyYXRvclJvb3RLZXkoYWN0aXZlRmlsZS5wYXRoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmdldEdlbmVyYXRvclJvb3RFbnRyaWVzKClbMF0/LnBhdGggPz8gR0VORVJBVE9SX1JPT1RfU0VOVElORUw7XHJcbiAgfVxyXG5cclxuICBzaG91bGRGbGF0dGVuR2VuZXJhdG9yUHJvamVjdEZvbGRlcihmb2xkZXJOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAvXjk5KD86X3wtKS8udGVzdChmb2xkZXJOYW1lKTtcclxuICB9XHJcblxyXG4gIGdldEdlbmVyYXRvckZvbGRlck1ldGEocmVsYXRpdmVQYXRoOiBzdHJpbmcpOiBQaWNrPFRvb2xGaWxlRW50cnksIFwiZm9sZGVyXCIgfCBcImZvbGRlckxhYmVsXCIgfCBcImZvbGRlclBhcmVudFwiPiB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gcmVsYXRpdmVQYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBub3JtYWxpemVkLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmb2xkZXI6IFwiKHJvb3QpXCIsXHJcbiAgICAgICAgZm9sZGVyTGFiZWw6IHRoaXMudChcImdlbmVyYXRvclJvb3RGb2xkZXJcIiksXHJcbiAgICAgICAgZm9sZGVyUGFyZW50OiBcIlwiLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpcnN0ID0gc2VnbWVudHNbMF07XHJcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoID49IDMgJiYgdGhpcy5zaG91bGRGbGF0dGVuR2VuZXJhdG9yUHJvamVjdEZvbGRlcihmaXJzdCkpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmb2xkZXI6IGAke2ZpcnN0fS8ke3NlZ21lbnRzWzFdfWAsXHJcbiAgICAgICAgZm9sZGVyTGFiZWw6IHNlZ21lbnRzWzFdLFxyXG4gICAgICAgIGZvbGRlclBhcmVudDogZmlyc3QsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZm9sZGVyOiBmaXJzdCxcclxuICAgICAgZm9sZGVyTGFiZWw6IGZpcnN0LFxyXG4gICAgICBmb2xkZXJQYXJlbnQ6IFwiXCIsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaXNGaWxlSW5zaWRlR2VuZXJhdG9yUm9vdChmaWxlOiBURmlsZSwgcm9vdFBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHJvb3RQYXRoID09PSBHRU5FUkFUT1JfUk9PVF9TRU5USU5FTCkge1xyXG4gICAgICByZXR1cm4gIWZpbGUucGF0aC5pbmNsdWRlcyhcIi9cIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmlsZS5wYXRoLnN0YXJ0c1dpdGgoYCR7cm9vdFBhdGh9L2ApO1xyXG4gIH1cclxuXHJcbiAgZ2V0VmF1bHRGb2xkZXJPcHRpb25zKCk6IHN0cmluZ1tdIHtcclxuICAgIGNvbnN0IGZvbGRlcnMgPSBuZXcgU2V0PHN0cmluZz4oW1wiXCJdKTtcclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0RmlsZXMoKSkge1xyXG4gICAgICBpZiAoIXRoaXMuaXNHZW5lcmF0b3JTdXBwb3J0ZWRGaWxlKGZpbGUpKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGN1cnJlbnQgPSBmaWxlLnBhcmVudD8ucGF0aCA/PyBcIlwiO1xyXG4gICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgIGZvbGRlcnMuYWRkKGN1cnJlbnQpO1xyXG4gICAgICAgIGlmICghY3VycmVudCkge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNsYXNoSW5kZXggPSBjdXJyZW50Lmxhc3RJbmRleE9mKFwiL1wiKTtcclxuICAgICAgICBjdXJyZW50ID0gc2xhc2hJbmRleCA+PSAwID8gY3VycmVudC5zbGljZSgwLCBzbGFzaEluZGV4KSA6IFwiXCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKGZvbGRlcnMpLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSk7XHJcbiAgfVxyXG5cclxuICBnZXRBbGxWYXVsdEZvbGRlck9wdGlvbnMoKTogc3RyaW5nW10ge1xyXG4gICAgY29uc3QgZm9sZGVycyA9IG5ldyBTZXQ8c3RyaW5nPihbXCJcIl0pO1xyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBbGxMb2FkZWRGaWxlcygpKSB7XHJcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgVEZvbGRlcikge1xyXG4gICAgICAgIGZvbGRlcnMuYWRkKGl0ZW0ucGF0aCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKGZvbGRlcnMpLnNvcnQoKGEsIGIpID0+IHRoaXMuY29tcGFyZUdlbmVyYXRvckxhYmVscyhhLCBiKSk7XHJcbiAgfVxyXG5cclxuICBnZXRXb3JrZmxvd0ZvbGRlck9wdGlvbnMoZXh0cmFQYXRoczogc3RyaW5nW10gPSBbXSk6IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKFxyXG4gICAgICBuZXcgU2V0KFxyXG4gICAgICAgIFtcIlwiLCAuLi50aGlzLmdldEFsbFZhdWx0Rm9sZGVyT3B0aW9ucygpLCAuLi5leHRyYVBhdGhzXVxyXG4gICAgICAgICAgLm1hcCgodmFsdWUpID0+IG5vcm1hbGl6ZVBhdGgodmFsdWUgfHwgXCJcIikpLFxyXG4gICAgICApLFxyXG4gICAgKS5zb3J0KChhLCBiKSA9PiB0aGlzLmNvbXBhcmVHZW5lcmF0b3JMYWJlbHMoYSwgYikpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RWZmZWN0aXZlVGFnZ2VySW5wdXREaXIoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnRhZ2dlclN0YXRlLmlucHV0RGlyO1xyXG4gIH1cclxuXHJcbiAgZ2V0RWZmZWN0aXZlSW5nZXN0SW5wdXREaXIoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLmluZ2VzdFN0YXRlLmlucHV0RGlyKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmluZ2VzdFN0YXRlLmlucHV0RGlyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXIgPT09IEdFTkVSQVRPUl9ST09UX1NFTlRJTkVMID8gXCJcIiA6IHRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXI7XHJcbiAgfVxyXG5cclxuICBnZXRFZmZlY3RpdmVJbmdlc3RPdXRwdXREaXIoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmluZ2VzdFN0YXRlLm91dHB1dERpciB8fCB0aGlzLmdlbmVyYXRvclN0YXRlLm91dHB1dERpcjtcclxuICB9XHJcblxyXG4gIGdldFByZWZlcnJlZEdlbmVyYXRvck91dHB1dFJvb3QoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGFsbEZvbGRlcnMgPSB0aGlzLmdldEFsbFZhdWx0Rm9sZGVyT3B0aW9ucygpO1xyXG4gICAgcmV0dXJuIGFsbEZvbGRlcnMuZmluZCgoZm9sZGVyKSA9PiAvXjExKD86X3wtKS8udGVzdChmb2xkZXIpKSA/PyBcIjExX1JBR19Lbm93bGVkZ2VfQmFzZVwiO1xyXG4gIH1cclxuXHJcbiAgZ2V0R2VuZXJhdG9yTWlycm9yZWRPdXRwdXREaXIoaW5wdXREaXIgPSB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyLCBmb2N1c2VkRm9sZGVyID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IG91dHB1dFJvb3QgPSB0aGlzLmdldFByZWZlcnJlZEdlbmVyYXRvck91dHB1dFJvb3QoKTtcclxuICAgIGlmICghb3V0cHV0Um9vdCkge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICAgIGlmIChpbnB1dERpciA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUwgfHwgIWZvY3VzZWRGb2xkZXIpIHtcclxuICAgICAgcmV0dXJuIG91dHB1dFJvb3Q7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHtvdXRwdXRSb290fS8ke2ZvY3VzZWRGb2xkZXJ9YCk7XHJcbiAgfVxyXG5cclxuICBzeW5jR2VuZXJhdG9yT3V0cHV0RGlyKCk6IHZvaWQge1xyXG4gICAgY29uc3QgbWlycm9yZWQgPSB0aGlzLmdldEdlbmVyYXRvck1pcnJvcmVkT3V0cHV0RGlyKCk7XHJcbiAgICBpZiAobWlycm9yZWQpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5vdXRwdXREaXIgPSBtaXJyb3JlZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldFByZWZlcnJlZFZhdWx0Rm9sZGVyKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5wbHVnaW4uYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcbiAgICBpZiAoYWN0aXZlRmlsZT8ucGFyZW50Py5wYXRoKSB7XHJcbiAgICAgIHJldHVybiBhY3RpdmVGaWxlLnBhcmVudC5wYXRoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VmF1bHRGb2xkZXJPcHRpb25zKClbMF0gPz8gXCJcIjtcclxuICB9XHJcblxyXG4gIGdldExvY2FsUGF0dGVyblByZXZpZXdJbmRleCgpOiBSZWNvcmQ8c3RyaW5nLCBQYXR0ZXJuUHJldmlldz4ge1xyXG4gICAgY29uc3QgZWRpdG9yQ29uZmlnID0gdGhpcy5nZXRQYXR0ZXJuRWRpdG9yQ29uZmlnKCk7XHJcbiAgICBjb25zdCBwYXR0ZXJuRGlyID0gbm9ybWFsaXplUGF0aChlZGl0b3JDb25maWcudmF1bHRfZGlyPy50cmltKCkgfHwgXCJnZW5lcmF0b3IvcGF0dGVybnNcIik7XHJcbiAgICBjb25zdCBwcmV2aWV3czogUmVjb3JkPHN0cmluZywgUGF0dGVyblByZXZpZXc+ID0ge307XHJcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldEZpbGVzKCkpIHtcclxuICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgIT09IFwibWRcIikge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghKGZpbGUucGF0aCA9PT0gcGF0dGVybkRpciB8fCBmaWxlLnBhdGguc3RhcnRzV2l0aChgJHtwYXR0ZXJuRGlyfS9gKSkpIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBmcm9udG1hdHRlciA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKT8uZnJvbnRtYXR0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcbiAgICAgIGNvbnN0IHBhdHRlcm5LZXkgPSB0eXBlb2YgZnJvbnRtYXR0ZXI/LnBhdHRlcm4gPT09IFwic3RyaW5nXCIgJiYgZnJvbnRtYXR0ZXIucGF0dGVybi50cmltKClcclxuICAgICAgICA/IGZyb250bWF0dGVyLnBhdHRlcm4udHJpbSgpXHJcbiAgICAgICAgOiBmaWxlLmJhc2VuYW1lO1xyXG4gICAgICBjb25zdCBncm91cHNSYXcgPSBmcm9udG1hdHRlcj8uZ3JvdXBzO1xyXG4gICAgICBjb25zdCBncm91cHMgPSBBcnJheS5pc0FycmF5KGdyb3Vwc1JhdylcclxuICAgICAgICA/IGdyb3Vwc1Jhdy5tYXAoKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUpKVxyXG4gICAgICAgIDogdHlwZW9mIGdyb3Vwc1JhdyA9PT0gXCJzdHJpbmdcIiAmJiBncm91cHNSYXcudHJpbSgpXHJcbiAgICAgICAgICA/IFtncm91cHNSYXcudHJpbSgpXVxyXG4gICAgICAgICAgOiBbXTtcclxuICAgICAgcHJldmlld3NbcGF0dGVybktleV0gPSB7XHJcbiAgICAgICAgLi4uKHByZXZpZXdzW3BhdHRlcm5LZXldID8/IHt9KSxcclxuICAgICAgICBzb3VyY2U6IFwib2JzaWRpYW5cIixcclxuICAgICAgICBlZGl0b3Jfbm90ZV9wYXRoOiBmaWxlLnBhdGgsXHJcbiAgICAgICAgZ3JvdXBzLFxyXG4gICAgICAgIG91dHB1dF9zdWZmaXg6IHR5cGVvZiBmcm9udG1hdHRlcj8ub3V0cHV0X3N1ZmZpeCA9PT0gXCJzdHJpbmdcIiA/IGZyb250bWF0dGVyLm91dHB1dF9zdWZmaXggOiBcIlwiLFxyXG4gICAgICAgIHVzZV9zdWJqZWN0X3ByZWZpeDogQm9vbGVhbihmcm9udG1hdHRlcj8udXNlX3N1YmplY3RfcHJlZml4KSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcmV2aWV3cztcclxuICB9XHJcblxyXG4gIGdldE1vZGVsT3B0aW9ucygpOiBzdHJpbmdbXSB7XHJcbiAgICBjb25zdCBjb25maWd1cmVkID0gQXJyYXkuaXNBcnJheSh0aGlzLnRvb2xDb25maWc/Lm1vZGVsX29wdGlvbnMpID8gdGhpcy50b29sQ29uZmlnPy5tb2RlbF9vcHRpb25zID8/IFtdIDogW107XHJcbiAgICBjb25zdCB1bmlxdWUgPSBuZXcgU2V0PHN0cmluZz4oY29uZmlndXJlZC5maWx0ZXIoKHZhbHVlKSA9PiBCb29sZWFuKHZhbHVlKSkpO1xyXG4gICAgdW5pcXVlLmFkZChcInF3ZW4zLjU6NGJcIik7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWUpO1xyXG4gIH1cclxuXHJcbiAgZ2V0UGF0dGVybktleXMoKTogc3RyaW5nW10ge1xyXG4gICAgY29uc3QgY29uZmlndXJlZCA9IEFycmF5LmlzQXJyYXkodGhpcy50b29sQ29uZmlnPy5wYXR0ZXJucykgPyB0aGlzLnRvb2xDb25maWc/LnBhdHRlcm5zID8/IFtdIDogW107XHJcbiAgICBpZiAoY29uZmlndXJlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHJldHVybiBjb25maWd1cmVkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZ2V0TG9jYWxQYXR0ZXJuUHJldmlld0luZGV4KCkpLnNvcnQoKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKSk7XHJcbiAgfVxyXG5cclxuICBnZXRQYXR0ZXJuRWRpdG9yQ29uZmlnKCk6IFBhdHRlcm5FZGl0b3JDb25maWcge1xyXG4gICAgcmV0dXJuIHRoaXMudG9vbENvbmZpZz8ucGF0dGVybl9lZGl0b3IgPz8ge1xyXG4gICAgICB2YXVsdF9kaXI6IFwiZ2VuZXJhdG9yL3BhdHRlcm5zXCIsXHJcbiAgICAgIHJlYWRtZV9wYXRoOiBcImdlbmVyYXRvci9SRUFETUUubWRcIixcclxuICAgICAgY29uZmlnX3BhdGg6IFwiXCIsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0VGFnZ2VyUnVsZXNDb25maWcoKTogVGFnZ2VyUnVsZXNDb25maWcge1xyXG4gICAgcmV0dXJuIHRoaXMudG9vbENvbmZpZz8udGFnZ2VyX3J1bGVzID8/IHtcclxuICAgICAgd29ya3NwYWNlOiB7XHJcbiAgICAgICAgcm9vdDogXCJ0YWdnZXJcIixcclxuICAgICAgICBydWxlc19kaXI6IFwidGFnZ2VyL3J1bGVzXCIsXHJcbiAgICAgICAgcmVhZG1lX3BhdGg6IFwidGFnZ2VyL1JFQURNRS5tZFwiLFxyXG4gICAgICAgIGNhbm9uaWNhbF90YWdzX3BhdGg6IFwidGFnZ2VyL3J1bGVzL2Nhbm9uaWNhbF90YWdzLm1kXCIsXHJcbiAgICAgICAgc3lub255bV9tYXBfcGF0aDogXCJ0YWdnZXIvcnVsZXMvc3lub255bV9tYXAubWRcIixcclxuICAgICAgICB0YWdnaW5nX3ByaW9yaXR5X3BhdGg6IFwidGFnZ2VyL3J1bGVzL3RhZ2dpbmdfcHJpb3JpdHkubWRcIixcclxuICAgICAgfSxcclxuICAgICAgY2Fub25pY2FsX3RhZ19jb3VudDogMCxcclxuICAgICAgY2Fub25pY2FsX2dyb3Vwczoge30sXHJcbiAgICAgIHN5bm9ueW1fZW50cmllczogMCxcclxuICAgICAgdGhyZXNob2xkczoge30sXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0UGF0dGVyblByZXZpZXcocGF0dGVybktleTogc3RyaW5nKTogUGF0dGVyblByZXZpZXcge1xyXG4gICAgcmV0dXJuIHRoaXMudG9vbENvbmZpZz8ucGF0dGVybl9wcmV2aWV3cz8uW3BhdHRlcm5LZXldXHJcbiAgICAgID8/IHRoaXMuZ2V0TG9jYWxQYXR0ZXJuUHJldmlld0luZGV4KClbcGF0dGVybktleV1cclxuICAgICAgPz8ge307XHJcbiAgfVxyXG5cclxuICBnZXRQYXR0ZXJuR3JvdXBFbnRyaWVzKCk6IEFycmF5PFtzdHJpbmcsIHN0cmluZ1tdXT4ge1xyXG4gICAgY29uc3QgcGF0dGVybktleXMgPSB0aGlzLmdldFBhdHRlcm5LZXlzKCk7XHJcbiAgICBjb25zdCBsb2NhbFByZXZpZXdzID0gdGhpcy5nZXRMb2NhbFBhdHRlcm5QcmV2aWV3SW5kZXgoKTtcclxuICAgIGNvbnN0IGNvbmZpZ3VyZWRHcm91cHMgPSB0aGlzLnRvb2xDb25maWc/LnBhdHRlcm5fZ3JvdXBzXHJcbiAgICAgID8/IHRoaXMuZ2V0VGFyZ2V0U2V0cygpXHJcbiAgICAgID8/IHt9O1xyXG4gICAgY29uc3QgZW50cmllczogQXJyYXk8W3N0cmluZywgc3RyaW5nW11dPiA9IFtdO1xyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgIGZvciAoY29uc3QgW2dyb3VwTmFtZSwgcmF3UGF0dGVybnNdIG9mIE9iamVjdC5lbnRyaWVzKGNvbmZpZ3VyZWRHcm91cHMpKSB7XHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gKEFycmF5LmlzQXJyYXkocmF3UGF0dGVybnMpID8gcmF3UGF0dGVybnMgOiBbXSkuZmlsdGVyKChwYXR0ZXJuKSA9PiBwYXR0ZXJuS2V5cy5pbmNsdWRlcyhwYXR0ZXJuKSk7XHJcbiAgICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBmaWx0ZXJlZC5mb3JFYWNoKChwYXR0ZXJuKSA9PiBzZWVuLmFkZChwYXR0ZXJuKSk7XHJcbiAgICAgIGVudHJpZXMucHVzaChbZ3JvdXBOYW1lLCBmaWx0ZXJlZF0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjb25zdCBsb2NhbEdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcclxuICAgICAgZm9yIChjb25zdCBwYXR0ZXJuS2V5IG9mIHBhdHRlcm5LZXlzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gbG9jYWxQcmV2aWV3c1twYXR0ZXJuS2V5XT8uZ3JvdXBzID8/IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXBOYW1lIG9mIGdyb3Vwcykge1xyXG4gICAgICAgICAgY29uc3QgY3VycmVudCA9IGxvY2FsR3JvdXBzLmdldChncm91cE5hbWUpID8/IFtdO1xyXG4gICAgICAgICAgY3VycmVudC5wdXNoKHBhdHRlcm5LZXkpO1xyXG4gICAgICAgICAgbG9jYWxHcm91cHMuc2V0KGdyb3VwTmFtZSwgY3VycmVudCk7XHJcbiAgICAgICAgICBzZWVuLmFkZChwYXR0ZXJuS2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChjb25zdCBbZ3JvdXBOYW1lLCBncm91cGVkUGF0dGVybnNdIG9mIGxvY2FsR3JvdXBzLmVudHJpZXMoKSkge1xyXG4gICAgICAgIGVudHJpZXMucHVzaChbZ3JvdXBOYW1lLCBncm91cGVkUGF0dGVybnNdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVuZ3JvdXBlZCA9IHBhdHRlcm5LZXlzLmZpbHRlcigocGF0dGVybikgPT4gIXNlZW4uaGFzKHBhdHRlcm4pKTtcclxuICAgIGlmICh1bmdyb3VwZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICBlbnRyaWVzLnB1c2goW3RoaXMudChcImdlbmVyYXRvclBhdHRlcm5Hcm91cFVuZ3JvdXBlZFwiKSwgdW5ncm91cGVkXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVudHJpZXM7XHJcbiAgfVxyXG5cclxuICBnZXRUYXJnZXRTZXRzKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiB7XHJcbiAgICBpZiAodGhpcy50b29sQ29uZmlnPy50YXJnZXRfc2V0cykge1xyXG4gICAgICByZXR1cm4gdGhpcy50b29sQ29uZmlnLnRhcmdldF9zZXRzO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZ3JvdXBlZDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XHJcbiAgICBmb3IgKGNvbnN0IFtwYXR0ZXJuS2V5LCBwcmV2aWV3XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLmdldExvY2FsUGF0dGVyblByZXZpZXdJbmRleCgpKSkge1xyXG4gICAgICBmb3IgKGNvbnN0IGdyb3VwTmFtZSBvZiBwcmV2aWV3Lmdyb3VwcyA/PyBbXSkge1xyXG4gICAgICAgIGlmICghZ3JvdXBlZFtncm91cE5hbWVdKSB7XHJcbiAgICAgICAgICBncm91cGVkW2dyb3VwTmFtZV0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ3JvdXBlZFtncm91cE5hbWVdLnB1c2gocGF0dGVybktleSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncm91cGVkO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q3VycmVudEdlbmVyYXRvckpvYigpOiBUb29sSm9iIHwgbnVsbCB7XHJcbiAgICBpZiAodGhpcy5nZW5lcmF0b3JTdGF0ZS5qb2JOYW1lID09PSBNQU5VQUxfSk9CKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Sm9iTGlzdCgpLmZpbmQoKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLm5hbWUgPT09IHRoaXMuZ2VuZXJhdG9yU3RhdGUuam9iTmFtZSkgPz8gbnVsbDtcclxuICB9XHJcblxyXG4gIGZvcm1hdEJ5dGVzKGJ5dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoYnl0ZXMpIHx8IGJ5dGVzIDw9IDApIHtcclxuICAgICAgcmV0dXJuIFwiMCBCXCI7XHJcbiAgICB9XHJcbiAgICBjb25zdCB1bml0cyA9IFtcIkJcIiwgXCJLQlwiLCBcIk1CXCIsIFwiR0JcIl07XHJcbiAgICBsZXQgdmFsdWUgPSBieXRlcztcclxuICAgIGxldCB1bml0SW5kZXggPSAwO1xyXG4gICAgd2hpbGUgKHZhbHVlID49IDEwMjQgJiYgdW5pdEluZGV4IDwgdW5pdHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICB2YWx1ZSAvPSAxMDI0O1xyXG4gICAgICB1bml0SW5kZXggKz0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBgJHt2YWx1ZSA+PSAxMCB8fCB1bml0SW5kZXggPT09IDAgPyB2YWx1ZS50b0ZpeGVkKDApIDogdmFsdWUudG9GaXhlZCgxKX0gJHt1bml0c1t1bml0SW5kZXhdfWA7XHJcbiAgfVxyXG5cclxuICBzYW5pdGl6ZVBhdHRlcm5GaWxlTmFtZShwYXR0ZXJuS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc2FuaXRpemVkID0gcGF0dGVybktleS50cmltKCkucmVwbGFjZSgvW1xcXFwvOio/XCI8PnxdL2csIFwiX1wiKS5yZXBsYWNlKC9cXHMrL2csIFwiX1wiKTtcclxuICAgIHJldHVybiBzYW5pdGl6ZWQgfHwgXCJwYXR0ZXJuXCI7XHJcbiAgfVxyXG5cclxuICBidWlsZFBhdHRlcm5Ob3RlUGF0aChwYXR0ZXJuS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZWRpdG9yQ29uZmlnID0gdGhpcy5nZXRQYXR0ZXJuRWRpdG9yQ29uZmlnKCk7XHJcbiAgICBjb25zdCBjb25maWd1cmVkID0gdGhpcy5nZXRQYXR0ZXJuUHJldmlldyhwYXR0ZXJuS2V5KS5lZGl0b3Jfbm90ZV9wYXRoPy50cmltKCk7XHJcbiAgICBpZiAoY29uZmlndXJlZCkge1xyXG4gICAgICByZXR1cm4gbm9ybWFsaXplUGF0aChjb25maWd1cmVkKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiYXNlRGlyID0gbm9ybWFsaXplUGF0aChlZGl0b3JDb25maWcudmF1bHRfZGlyPy50cmltKCkgfHwgXCJnZW5lcmF0b3IvcGF0dGVybnNcIik7XHJcbiAgICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHtiYXNlRGlyfS8ke3RoaXMuc2FuaXRpemVQYXR0ZXJuRmlsZU5hbWUocGF0dGVybktleSl9Lm1kYCk7XHJcbiAgfVxyXG5cclxuICBidWlsZFBhdHRlcm5Ob3RlVGVtcGxhdGUocGF0dGVybktleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHByZXZpZXcgPSB0aGlzLmdldFBhdHRlcm5QcmV2aWV3KHBhdHRlcm5LZXkpO1xyXG4gICAgY29uc3QgZ3JvdXBzID0gQXJyYXkuaXNBcnJheShwcmV2aWV3Lmdyb3VwcykgPyBwcmV2aWV3Lmdyb3Vwcy5maWx0ZXIoQm9vbGVhbikgOiBbXTtcclxuICAgIGNvbnN0IGZyb250bWF0dGVyTGluZXMgPSBbXHJcbiAgICAgIFwiLS0tXCIsXHJcbiAgICAgIGBwYXR0ZXJuOiAke0pTT04uc3RyaW5naWZ5KHBhdHRlcm5LZXkpfWAsXHJcbiAgICAgIGdyb3Vwcy5sZW5ndGggPiAwID8gXCJncm91cHM6XCIgOiBcImdyb3VwczogW11cIixcclxuICAgICAgLi4uZ3JvdXBzLm1hcCgoZ3JvdXApID0+IGAgIC0gJHtKU09OLnN0cmluZ2lmeShncm91cCl9YCksXHJcbiAgICAgIGBvdXRwdXRfc3VmZml4OiAke0pTT04uc3RyaW5naWZ5KHByZXZpZXcub3V0cHV0X3N1ZmZpeCA/PyBcIlwiKX1gLFxyXG4gICAgICBgdXNlX3N1YmplY3RfcHJlZml4OiAke3ByZXZpZXcudXNlX3N1YmplY3RfcHJlZml4ID8gXCJ0cnVlXCIgOiBcImZhbHNlXCJ9YCxcclxuICAgICAgXCItLS1cIixcclxuICAgICAgXCJcIixcclxuICAgICAgYCMgJHtwYXR0ZXJuS2V5fWAsXHJcbiAgICAgIFwiXCIsXHJcbiAgICAgIFwiIyMgU3lzdGVtIFJvbGVcIixcclxuICAgICAgcHJldmlldy5zeXN0ZW1fcm9sZT8udHJpbSgpIHx8IFwiRGVzY3JpYmUgdGhlIG1vZGVsIHJvbGUgZm9yIHRoaXMgcGF0dGVybi5cIixcclxuICAgICAgXCJcIixcclxuICAgICAgXCIjIyBQcm9tcHQgVGVtcGxhdGVcIixcclxuICAgICAgcHJldmlldy5wcm9tcHRfdGVtcGxhdGU/LnRyaW0oKSB8fCBcIltDb250ZXh0IERhdGFdXFxue2NvbnRleHR9XCIsXHJcbiAgICAgIFwiXCIsXHJcbiAgICBdO1xyXG4gICAgcmV0dXJuIGZyb250bWF0dGVyTGluZXMuam9pbihcIlxcblwiKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIG9wZW5QYXR0ZXJuV29ya3NwYWNlTm90ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGVkaXRvckNvbmZpZyA9IHRoaXMuZ2V0UGF0dGVybkVkaXRvckNvbmZpZygpO1xyXG4gICAgY29uc3QgcmVhZG1lUGF0aCA9IGVkaXRvckNvbmZpZy5yZWFkbWVfcGF0aD8udHJpbSgpO1xyXG4gICAgaWYgKCFyZWFkbWVQYXRoKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlUGF0dGVybldvcmtzcGFjZU1pc3NpbmdcIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgocmVhZG1lUGF0aCk7XHJcbiAgICBjb25zdCBmb2xkZXJQYXRoID0gbm9ybWFsaXplZC5pbmNsdWRlcyhcIi9cIikgPyBub3JtYWxpemVkLnNsaWNlKDAsIG5vcm1hbGl6ZWQubGFzdEluZGV4T2YoXCIvXCIpKSA6IFwiXCI7XHJcbiAgICBpZiAoZm9sZGVyUGF0aCkge1xyXG4gICAgICBhd2FpdCB0aGlzLnBsdWdpbi5lbnN1cmVGb2xkZXIoZm9sZGVyUGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vcm1hbGl6ZWQpO1xyXG4gICAgbGV0IGZpbGU6IFRGaWxlO1xyXG4gICAgaWYgKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZpbGUpIHtcclxuICAgICAgZmlsZSA9IGV4aXN0aW5nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZmlsZSA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5jcmVhdGUoXHJcbiAgICAgICAgbm9ybWFsaXplZCxcclxuICAgICAgICBcIiMgR2VuZXJhdG9yIFBhdHRlcm4gV29ya3NwYWNlXFxuXFxuLSBFZGl0IG5vdGVzIGluIHRoaXMgZm9sZGVyIHRvIG1hbmFnZSBnZW5lcmF0b3IgcHJvbXB0cy5cXG5cIixcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5vcGVuRmlsZUZyb21Tb3VyY2UoZmlsZSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBvcGVuUGF0dGVybk5vdGUocGF0dGVybktleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBub3RlUGF0aCA9IHRoaXMuYnVpbGRQYXR0ZXJuTm90ZVBhdGgocGF0dGVybktleSk7XHJcbiAgICBjb25zdCBmb2xkZXJQYXRoID0gbm90ZVBhdGguaW5jbHVkZXMoXCIvXCIpID8gbm90ZVBhdGguc2xpY2UoMCwgbm90ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKSA6IFwiXCI7XHJcbiAgICBpZiAoZm9sZGVyUGF0aCkge1xyXG4gICAgICBhd2FpdCB0aGlzLnBsdWdpbi5lbnN1cmVGb2xkZXIoZm9sZGVyUGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG5vdGVQYXRoKTtcclxuICAgIGxldCBmaWxlOiBURmlsZTtcclxuICAgIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XHJcbiAgICAgIGZpbGUgPSBleGlzdGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZpbGUgPSBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQuY3JlYXRlKG5vdGVQYXRoLCB0aGlzLmJ1aWxkUGF0dGVybk5vdGVUZW1wbGF0ZShwYXR0ZXJuS2V5KSk7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlUGF0dGVybk5vdGVDcmVhdGVkXCIsIHsgcGF0aDogbm90ZVBhdGggfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHRoaXMucGx1Z2luLm9wZW5GaWxlRnJvbVNvdXJjZShmaWxlKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNyZWF0ZVBhdHRlcm5Ob3RlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZWRpdG9yQ29uZmlnID0gdGhpcy5nZXRQYXR0ZXJuRWRpdG9yQ29uZmlnKCk7XHJcbiAgICBjb25zdCBiYXNlRGlyID0gbm9ybWFsaXplUGF0aChlZGl0b3JDb25maWcudmF1bHRfZGlyPy50cmltKCkgfHwgXCJnZW5lcmF0b3IvcGF0dGVybnNcIik7XHJcbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5lbnN1cmVGb2xkZXIoYmFzZURpcik7XHJcblxyXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgXCItXCIpO1xyXG4gICAgY29uc3QgcGF0dGVybktleSA9IGBjdXN0b21fcGF0dGVybl8ke3RpbWVzdGFtcH1gO1xyXG4gICAgY29uc3Qgbm90ZVBhdGggPSBub3JtYWxpemVQYXRoKGAke2Jhc2VEaXJ9LyR7cGF0dGVybktleX0ubWRgKTtcclxuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQuY3JlYXRlKG5vdGVQYXRoLCB0aGlzLmJ1aWxkUGF0dGVybk5vdGVUZW1wbGF0ZShwYXR0ZXJuS2V5KSk7XHJcbiAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZVBhdHRlcm5Ob3RlQ3JlYXRlZFwiLCB7IHBhdGg6IG5vdGVQYXRoIH0pKTtcclxuICAgIGF3YWl0IHRoaXMucGx1Z2luLm9wZW5GaWxlRnJvbVNvdXJjZShmaWxlKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIG9wZW5UYWdnZXJXb3Jrc3BhY2VOb3RlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgcnVsZXNDb25maWcgPSB0aGlzLmdldFRhZ2dlclJ1bGVzQ29uZmlnKCk7XHJcbiAgICBjb25zdCByZWFkbWVQYXRoID0gbm9ybWFsaXplUGF0aChydWxlc0NvbmZpZy53b3Jrc3BhY2U/LnJlYWRtZV9wYXRoPy50cmltKCkgfHwgXCJ0YWdnZXIvUkVBRE1FLm1kXCIpO1xyXG4gICAgY29uc3QgZm9sZGVyUGF0aCA9IHJlYWRtZVBhdGguaW5jbHVkZXMoXCIvXCIpID8gcmVhZG1lUGF0aC5zbGljZSgwLCByZWFkbWVQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSkgOiBcIlwiO1xyXG4gICAgaWYgKGZvbGRlclBhdGgpIHtcclxuICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uZW5zdXJlRm9sZGVyKGZvbGRlclBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZWFkbWVQYXRoKTtcclxuICAgIGxldCBmaWxlOiBURmlsZTtcclxuICAgIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGaWxlKSB7XHJcbiAgICAgIGZpbGUgPSBleGlzdGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZpbGUgPSBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQuY3JlYXRlKFxyXG4gICAgICAgIHJlYWRtZVBhdGgsXHJcbiAgICAgICAgXCIjIFRhZ2dlciBSdWxlIFdvcmtzcGFjZVxcblxcbi0gRWRpdCBtYXJrZG93biBydWxlIG5vdGVzIGluIHRoaXMgZm9sZGVyLlxcblwiLFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgdGhpcy5wbHVnaW4ub3BlbkZpbGVGcm9tU291cmNlKGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgb3BlblRhZ2dlclJ1bGVOb3RlKGtpbmQ6IFwiY2Fub25pY2FsXCIgfCBcInN5bm9ueW1cIiB8IFwicHJpb3JpdHlcIik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgcnVsZXNDb25maWcgPSB0aGlzLmdldFRhZ2dlclJ1bGVzQ29uZmlnKCk7XHJcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBydWxlc0NvbmZpZy53b3Jrc3BhY2UgPz8ge307XHJcbiAgICBjb25zdCBub3RlUGF0aCA9IG5vcm1hbGl6ZVBhdGgoXHJcbiAgICAgIGtpbmQgPT09IFwiY2Fub25pY2FsXCJcclxuICAgICAgICA/IHdvcmtzcGFjZS5jYW5vbmljYWxfdGFnc19wYXRoPy50cmltKCkgfHwgXCJ0YWdnZXIvcnVsZXMvY2Fub25pY2FsX3RhZ3MubWRcIlxyXG4gICAgICAgIDoga2luZCA9PT0gXCJzeW5vbnltXCJcclxuICAgICAgICAgID8gd29ya3NwYWNlLnN5bm9ueW1fbWFwX3BhdGg/LnRyaW0oKSB8fCBcInRhZ2dlci9ydWxlcy9zeW5vbnltX21hcC5tZFwiXHJcbiAgICAgICAgICA6IHdvcmtzcGFjZS50YWdnaW5nX3ByaW9yaXR5X3BhdGg/LnRyaW0oKSB8fCBcInRhZ2dlci9ydWxlcy90YWdnaW5nX3ByaW9yaXR5Lm1kXCIsXHJcbiAgICApO1xyXG4gICAgY29uc3QgZm9sZGVyUGF0aCA9IG5vdGVQYXRoLmluY2x1ZGVzKFwiL1wiKSA/IG5vdGVQYXRoLnNsaWNlKDAsIG5vdGVQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSkgOiBcIlwiO1xyXG4gICAgaWYgKGZvbGRlclBhdGgpIHtcclxuICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uZW5zdXJlRm9sZGVyKGZvbGRlclBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcbiAgICBsZXQgZmlsZTogVEZpbGU7XHJcbiAgICBpZiAoZXhpc3RpbmcgaW5zdGFuY2VvZiBURmlsZSkge1xyXG4gICAgICBmaWxlID0gZXhpc3Rpbmc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmYWxsYmFja1RpdGxlID0ga2luZCA9PT0gXCJjYW5vbmljYWxcIlxyXG4gICAgICAgID8gXCIjIENhbm9uaWNhbCBUYWdzXFxuXCJcclxuICAgICAgICA6IGtpbmQgPT09IFwic3lub255bVwiXHJcbiAgICAgICAgICA/IFwiIyBTeW5vbnltIE1hcFxcblwiXHJcbiAgICAgICAgICA6IFwiIyBUYWdnaW5nIFByaW9yaXR5XFxuXCI7XHJcbiAgICAgIGZpbGUgPSBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQuY3JlYXRlKG5vdGVQYXRoLCBgJHtmYWxsYmFja1RpdGxlfVxcbmApO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgdGhpcy5wbHVnaW4ub3BlbkZpbGVGcm9tU291cmNlKGZpbGUpO1xyXG4gIH1cclxuXHJcbiAgaW5pdGlhbGl6ZVRvb2xEZWZhdWx0cyhmb3JjZSA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy50b29sQ29uZmlnSW5pdGlhbGl6ZWQgJiYgIWZvcmNlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkZWZhdWx0cyA9IHRoaXMudG9vbENvbmZpZz8uZGVmYXVsdHMgPz8ge307XHJcbiAgICBjb25zdCBmaXJzdFRhcmdldFNldCA9IE9iamVjdC5rZXlzKHRoaXMuZ2V0VGFyZ2V0U2V0cygpKVswXSA/PyBNQU5VQUxfVEFSR0VUX1NFVDtcclxuICAgIGNvbnN0IGRlZmF1bHRJbnB1dERpciA9IHRoaXMuZ2V0UHJlZmVycmVkR2VuZXJhdG9ySW5wdXREaXIoKTtcclxuICAgIGNvbnN0IGRlZmF1bHRPdXRwdXREaXIgPSB0aGlzLmdldEdlbmVyYXRvck1pcnJvcmVkT3V0cHV0RGlyKGRlZmF1bHRJbnB1dERpciwgXCJcIik7XHJcbiAgICBjb25zdCBmYWxsYmFja1BhdHRlcm4gPSB0aGlzLmdldFBhdHRlcm5LZXlzKClbMF0gPz8gXCJcIjtcclxuXHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlID0ge1xyXG4gICAgICAuLi50aGlzLmdlbmVyYXRvclN0YXRlLFxyXG4gICAgICBqb2JOYW1lOiBNQU5VQUxfSk9CLFxyXG4gICAgICBpbnB1dERpcjogZm9yY2UgfHwgIXRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXIgPyBkZWZhdWx0SW5wdXREaXIgOiB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyLFxyXG4gICAgICBvdXRwdXREaXI6IGZvcmNlIHx8ICF0aGlzLmdlbmVyYXRvclN0YXRlLm91dHB1dERpciA/IGRlZmF1bHRPdXRwdXREaXIgOiB0aGlzLmdlbmVyYXRvclN0YXRlLm91dHB1dERpcixcclxuICAgICAgc3ViamVjdDogdGhpcy5nZW5lcmF0b3JTdGF0ZS5zdWJqZWN0IHx8IFwiTmV3IFByb2plY3RcIixcclxuICAgICAgbW9kZWxOYW1lOiB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGVsTmFtZSB8fCBcInF3ZW4zLjU6NGJcIixcclxuICAgICAgdGVtcGVyYXR1cmU6IHR5cGVvZiBkZWZhdWx0cy50ZW1wZXJhdHVyZSA9PT0gXCJudW1iZXJcIiA/IGRlZmF1bHRzLnRlbXBlcmF0dXJlIDogdGhpcy5nZW5lcmF0b3JTdGF0ZS50ZW1wZXJhdHVyZSxcclxuICAgICAgdGFyZ2V0U2V0OiB0aGlzLmdlbmVyYXRvclN0YXRlLnRhcmdldFNldCB8fCBmaXJzdFRhcmdldFNldCxcclxuICAgICAgcGF0dGVybktleXM6IHRoaXMuZ2VuZXJhdG9yU3RhdGUucGF0dGVybktleXMubGVuZ3RoID4gMFxyXG4gICAgICAgID8gWy4uLnRoaXMuZ2VuZXJhdG9yU3RhdGUucGF0dGVybktleXNdXHJcbiAgICAgICAgOiBmaXJzdFRhcmdldFNldCAhPT0gTUFOVUFMX1RBUkdFVF9TRVRcclxuICAgICAgICAgID8gWy4uLih0aGlzLmdldFRhcmdldFNldHMoKVtmaXJzdFRhcmdldFNldF0gPz8gW10pXVxyXG4gICAgICAgICAgOiBmYWxsYmFja1BhdHRlcm5cclxuICAgICAgICAgICAgPyBbZmFsbGJhY2tQYXR0ZXJuXVxyXG4gICAgICAgICAgICA6IFtdLFxyXG4gICAgICBzdGF0dXM6IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3RhdHVzIHx8IHRoaXMudChcImdlbmVyYXRvclN0YXR1c1JlYWR5XCIpLFxyXG4gICAgfTtcclxuICAgIHRoaXMudGFnZ2VyU3RhdGUuc3RhdHVzID0gdGhpcy50YWdnZXJTdGF0ZS5zdGF0dXMgfHwgdGhpcy50KFwidGFnZ2VyU3RhdHVzUmVhZHlcIik7XHJcbiAgICB0aGlzLmluZ2VzdFN0YXRlID0ge1xyXG4gICAgICAuLi50aGlzLmluZ2VzdFN0YXRlLFxyXG4gICAgICBzdGF0dXM6IHRoaXMuaW5nZXN0U3RhdGUuc3RhdHVzIHx8IHRoaXMudChcImluZ2VzdFN0YXR1c1JlYWR5XCIpLFxyXG4gICAgfTtcclxuICAgIHRoaXMudG9vbENvbmZpZ0luaXRpYWxpemVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRUb29sQ29uZmlnKGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrICYmICFmb3JjZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy50b29sQ29uZmlnRXJyb3IgPSBcIlwiO1xyXG4gICAgICB0aGlzLnRvb2xDb25maWcgPSBhd2FpdCB0aGlzLmdldEpzb248VG9vbENvbmZpZz4oXCIvYXBpL3Rvb2xzL2NvbmZpZ1wiKTtcclxuICAgICAgdGhpcy5pbml0aWFsaXplVG9vbERlZmF1bHRzKGZvcmNlKTtcclxuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJXb3JrZmxvd1BhbmVscygpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcclxuICAgICAgdGhpcy50b29sQ29uZmlnRXJyb3IgPSBtZXNzYWdlO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcldvcmtmbG93UGFuZWxzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBsb2FkR2VuZXJhdG9yRmlsZXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAodGhpcy5ydW5uaW5nVGFzaykge1xyXG4gICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZVRvb2xCdXN5XCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3RhdHVzID0gdGhpcy50KFwiZ2VuZXJhdG9yU3RhdHVzTG9hZGluZ0ZpbGVzXCIpO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlRXJyb3IgPSBcIlwiO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJvb3RFbnRyaWVzID0gdGhpcy5nZXRHZW5lcmF0b3JSb290RW50cmllcygpO1xyXG4gICAgICBjb25zdCBhdmFpbGFibGVSb290cyA9IG5ldyBTZXQocm9vdEVudHJpZXMubWFwKChlbnRyeSkgPT4gZW50cnkucGF0aCkpO1xyXG4gICAgICBpZiAoIWF2YWlsYWJsZVJvb3RzLmhhcyh0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyKSkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXIgPSByb290RW50cmllc1swXT8ucGF0aCA/PyBHRU5FUkFUT1JfUk9PVF9TRU5USU5FTDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzZWxlY3RlZFJvb3QgPSB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyIHx8IEdFTkVSQVRPUl9ST09UX1NFTlRJTkVMO1xyXG4gICAgICBjb25zdCBwcmVmaXggPSBzZWxlY3RlZFJvb3QgIT09IEdFTkVSQVRPUl9ST09UX1NFTlRJTkVMID8gYCR7c2VsZWN0ZWRSb290fS9gIDogXCJcIjtcclxuICAgICAgY29uc3QgZW50cmllcyA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRGaWxlcygpXHJcbiAgICAgICAgLmZpbHRlcigoZmlsZSkgPT4gdGhpcy5pc0dlbmVyYXRvclN1cHBvcnRlZEZpbGUoZmlsZSkpXHJcbiAgICAgICAgLmZpbHRlcigoZmlsZSkgPT4gdGhpcy5pc0ZpbGVJbnNpZGVHZW5lcmF0b3JSb290KGZpbGUsIHNlbGVjdGVkUm9vdCkpXHJcbiAgICAgICAgLm1hcDxUb29sRmlsZUVudHJ5PigoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gc2VsZWN0ZWRSb290ICE9PSBHRU5FUkFUT1JfUk9PVF9TRU5USU5FTFxyXG4gICAgICAgICAgICA/IGZpbGUucGF0aC5zbGljZShwcmVmaXgubGVuZ3RoKVxyXG4gICAgICAgICAgICA6IGZpbGUucGF0aDtcclxuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRSZWxhdGl2ZSA9IHJlbGF0aXZlUGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgICAgICAgIGNvbnN0IGZvbGRlck1ldGEgPSB0aGlzLmdldEdlbmVyYXRvckZvbGRlck1ldGEobm9ybWFsaXplZFJlbGF0aXZlKTtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBhdGg6IG5vcm1hbGl6ZWRSZWxhdGl2ZSxcclxuICAgICAgICAgICAgZm9sZGVyOiBmb2xkZXJNZXRhLmZvbGRlcixcclxuICAgICAgICAgICAgZm9sZGVyTGFiZWw6IGZvbGRlck1ldGEuZm9sZGVyTGFiZWwsXHJcbiAgICAgICAgICAgIGZvbGRlclBhcmVudDogZm9sZGVyTWV0YS5mb2xkZXJQYXJlbnQsXHJcbiAgICAgICAgICAgIHNpemU6IGZpbGUuc3RhdC5zaXplLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiB0aGlzLmNvbXBhcmVHZW5lcmF0b3JMYWJlbHMoYS5wYXRoLCBiLnBhdGgpKTtcclxuXHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuZmlsZXNQYXRoID0gc2VsZWN0ZWRSb290O1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmZpbGVFbnRyaWVzID0gZW50cmllcztcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlcyA9IGVudHJpZXMubWFwKChlbnRyeSkgPT4gZW50cnkucGF0aCk7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcyA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcy5maWx0ZXIoKGZpbGUpID0+XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlcy5pbmNsdWRlcyhmaWxlKSxcclxuICAgICAgKTtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuZm9jdXNlZEZvbGRlciAmJlxyXG4gICAgICAgICFlbnRyaWVzLnNvbWUoKGVudHJ5KSA9PiBlbnRyeS5mb2xkZXIgPT09IHRoaXMuZ2VuZXJhdG9yU3RhdGUuZm9jdXNlZEZvbGRlcilcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyID0gXCJcIjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN5bmNHZW5lcmF0b3JPdXRwdXREaXIoKTtcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zdGF0dXMgPSB0aGlzLnQoXCJnZW5lcmF0b3JTdGF0dXNSZWFkeVwiKTtcclxuICAgICAgdGhpcy5yZWNvcmRXb3JrZmxvd0xvZyhcclxuICAgICAgICBcImdlbmVyYXRvclwiLFxyXG4gICAgICAgIGBMb2FkZWQgJHt0aGlzLmdlbmVyYXRvclN0YXRlLmZpbGVzLmxlbmd0aH0gZmlsZXMgZnJvbSAke3RoaXMuZ2V0R2VuZXJhdG9yUm9vdExhYmVsKHNlbGVjdGVkUm9vdCl9YCxcclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuZmlsZUVycm9yID0gbWVzc2FnZTtcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zdGF0dXMgPSB0aGlzLnQoXCJzdGF0dXNFcnJvclwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyR2VuZXJhdG9yUGFuZWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFwcGx5R2VuZXJhdG9ySm9iKGpvYk5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5qb2JOYW1lID0gam9iTmFtZTtcclxuICAgIGlmIChqb2JOYW1lID09PSBNQU5VQUxfSk9CKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqb2IgPSB0aGlzLmdldEpvYkxpc3QoKS5maW5kKChjYW5kaWRhdGUpID0+IGNhbmRpZGF0ZS5uYW1lID09PSBqb2JOYW1lKTtcclxuICAgIGlmICgham9iKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyID0gam9iLmlucHV0X2RpciB8fCB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5vdXRwdXREaXIgPSBqb2Iub3V0cHV0X2RpciB8fCB0aGlzLmdlbmVyYXRvclN0YXRlLm91dHB1dERpcjtcclxuICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3ViamVjdCA9IGpvYi5zdWJqZWN0IHx8IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3ViamVjdDtcclxuICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUubW9kZWxOYW1lID0gam9iLm1vZGVsIHx8IHRoaXMuZ2VuZXJhdG9yU3RhdGUubW9kZWxOYW1lO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzID0gW107XHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmZvY3VzZWRGb2xkZXIgPSBcIlwiO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlcyA9IFtdO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlRW50cmllcyA9IFtdO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlc1BhdGggPSBcIlwiO1xyXG4gICAgaWYgKHR5cGVvZiBqb2IudGVtcGVyYXR1cmUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS50ZW1wZXJhdHVyZSA9IGpvYi50ZW1wZXJhdHVyZTtcclxuICAgIH1cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGpvYi50YXJnZXRzKSAmJiBqb2IudGFyZ2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUudGFyZ2V0U2V0ID0gTUFOVUFMX1RBUkdFVF9TRVQ7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUucGF0dGVybktleXMgPSBbLi4uam9iLnRhcmdldHNdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZmFsbGJhY2tUYXJnZXRTZXQgPSB0aGlzLmdlbmVyYXRvclN0YXRlLnRhcmdldFNldCAhPT0gTUFOVUFMX1RBUkdFVF9TRVRcclxuICAgICAgICA/IHRoaXMuZ2VuZXJhdG9yU3RhdGUudGFyZ2V0U2V0XHJcbiAgICAgICAgOiBPYmplY3Qua2V5cyh0aGlzLmdldFRhcmdldFNldHMoKSlbMF0gPz8gTUFOVUFMX1RBUkdFVF9TRVQ7XHJcbiAgICAgIHRoaXMuYXBwbHlHZW5lcmF0b3JUYXJnZXRTZXQoZmFsbGJhY2tUYXJnZXRTZXQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXBwbHlHZW5lcmF0b3JUYXJnZXRTZXQodGFyZ2V0U2V0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUudGFyZ2V0U2V0ID0gdGFyZ2V0U2V0O1xyXG4gICAgaWYgKHRhcmdldFNldCA9PT0gTUFOVUFMX1RBUkdFVF9TRVQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5wYXR0ZXJuS2V5cyA9IFsuLi4odGhpcy5nZXRUYXJnZXRTZXRzKClbdGFyZ2V0U2V0XSA/PyBbXSldO1xyXG4gIH1cclxuXHJcbiAgZ2V0Tm90ZVJlYnVpbGRUYXJnZXRTZXROYW1lKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCB0YXJnZXRTZXRzID0gdGhpcy5nZXRUYXJnZXRTZXRzKCk7XHJcbiAgICBjb25zdCBjYW5kaWRhdGVzID0gW05PVEVfUkVCVUlMRF9UQVJHRVRfU0VULCBcIk5vdGVfUmVidWlsZFwiLCBcIk5vdGUgUmVidWlsZFwiXTtcclxuICAgIHJldHVybiBjYW5kaWRhdGVzLmZpbmQoKGNhbmRpZGF0ZSkgPT4gQXJyYXkuaXNBcnJheSh0YXJnZXRTZXRzW2NhbmRpZGF0ZV0pKSA/PyBcIlwiO1xyXG4gIH1cclxuXHJcbiAgaGFzR2VuZXJhdG9yUGF0dGVybihwYXR0ZXJuS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmdldFBhdHRlcm5LZXlzKCkuaW5jbHVkZXMocGF0dGVybktleSk7XHJcbiAgfVxyXG5cclxuICBpc05vdGVSZWJ1aWxkQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdG9yU3RhdGUubW9kZSA9PT0gR0VORVJBVE9SX01PREVfTk9URV9SRUJVSUxEO1xyXG4gIH1cclxuXHJcbiAgZ2V0RWZmZWN0aXZlR2VuZXJhdG9yUGF0dGVybktleXMoKTogc3RyaW5nW10ge1xyXG4gICAgY29uc3QgYmFzZSA9IFsuLi50aGlzLmdlbmVyYXRvclN0YXRlLnBhdHRlcm5LZXlzXTtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlID09PSBHRU5FUkFUT1JfTU9ERV9OT1RFX1JFQlVJTERcclxuICAgICAgJiYgdGhpcy5nZW5lcmF0b3JTdGF0ZS5yZWJ1aWxkVGl0bGVcclxuICAgICAgJiYgdGhpcy5oYXNHZW5lcmF0b3JQYXR0ZXJuKFRJVExFX1JFQlVJTERfUEFUVEVSTilcclxuICAgICAgJiYgIWJhc2UuaW5jbHVkZXMoVElUTEVfUkVCVUlMRF9QQVRURVJOKVxyXG4gICAgKSB7XHJcbiAgICAgIGJhc2UudW5zaGlmdChUSVRMRV9SRUJVSUxEX1BBVFRFUk4pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGJhc2UpXTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHByaW1lR2VuZXJhdG9yU2VsZWN0aW9uRnJvbUFjdGl2ZUZpbGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5wbHVnaW4uYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcbiAgICBpZiAoIWFjdGl2ZUZpbGUgfHwgIXRoaXMuaXNHZW5lcmF0b3JTdXBwb3J0ZWRGaWxlKGFjdGl2ZUZpbGUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGlucHV0RGlyID0gdGhpcy5nZXRHZW5lcmF0b3JSb290S2V5KGFjdGl2ZUZpbGUucGF0aCk7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBpbnB1dERpciA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUxcclxuICAgICAgPyBhY3RpdmVGaWxlLnBhdGhcclxuICAgICAgOiBhY3RpdmVGaWxlLnBhdGguc3RhcnRzV2l0aChgJHtpbnB1dERpcn0vYClcclxuICAgICAgICA/IGFjdGl2ZUZpbGUucGF0aC5zbGljZShpbnB1dERpci5sZW5ndGggKyAxKVxyXG4gICAgICAgIDogYWN0aXZlRmlsZS5uYW1lO1xyXG4gICAgY29uc3QgZm9jdXNlZEZvbGRlciA9IHJlbGF0aXZlUGF0aC5pbmNsdWRlcyhcIi9cIikgPyByZWxhdGl2ZVBhdGguc2xpY2UoMCwgcmVsYXRpdmVQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSkgOiBcIlwiO1xyXG4gICAgY29uc3Qgc2hvdWxkUmVsb2FkID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpciAhPT0gaW5wdXREaXIgfHwgdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlc1BhdGggIT09IGlucHV0RGlyO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpciA9IGlucHV0RGlyO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyID0gZm9jdXNlZEZvbGRlcjtcclxuICAgIHRoaXMuc3luY0dlbmVyYXRvck91dHB1dERpcigpO1xyXG4gICAgaWYgKHNob3VsZFJlbG9hZCkge1xyXG4gICAgICBhd2FpdCB0aGlzLmxvYWRHZW5lcmF0b3JGaWxlcygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzID0gW3JlbGF0aXZlUGF0aF07XHJcbiAgICBpZiAoIXRoaXMuZ2VuZXJhdG9yU3RhdGUuc3ViamVjdCB8fCB0aGlzLmdlbmVyYXRvclN0YXRlLnN1YmplY3QgPT09IFwiTmV3IFByb2plY3RcIikge1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnN1YmplY3QgPSBhY3RpdmVGaWxlLmJhc2VuYW1lO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3dpdGNoR2VuZXJhdG9yTW9kZShtb2RlOiBHZW5lcmF0b3JNb2RlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGUgPSBtb2RlO1xyXG4gICAgaWYgKG1vZGUgPT09IEdFTkVSQVRPUl9NT0RFX05PVEVfUkVCVUlMRCkge1xyXG4gICAgICBjb25zdCByZWJ1aWxkVGFyZ2V0U2V0ID0gdGhpcy5nZXROb3RlUmVidWlsZFRhcmdldFNldE5hbWUoKTtcclxuICAgICAgaWYgKHJlYnVpbGRUYXJnZXRTZXQpIHtcclxuICAgICAgICB0aGlzLmFwcGx5R2VuZXJhdG9yVGFyZ2V0U2V0KHJlYnVpbGRUYXJnZXRTZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IHRoaXMucHJpbWVHZW5lcmF0b3JTZWxlY3Rpb25Gcm9tQWN0aXZlRmlsZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ2VuZXJhdG9yU3RhdGUudGFyZ2V0U2V0ID09PSB0aGlzLmdldE5vdGVSZWJ1aWxkVGFyZ2V0U2V0TmFtZSgpKSB7XHJcbiAgICAgIGNvbnN0IGZhbGxiYWNrVGFyZ2V0U2V0ID0gT2JqZWN0LmtleXModGhpcy5nZXRUYXJnZXRTZXRzKCkpLmZpbmQoKGtleSkgPT4ga2V5ICE9PSB0aGlzLmdldE5vdGVSZWJ1aWxkVGFyZ2V0U2V0TmFtZSgpKSA/PyBNQU5VQUxfVEFSR0VUX1NFVDtcclxuICAgICAgdGhpcy5hcHBseUdlbmVyYXRvclRhcmdldFNldChmYWxsYmFja1RhcmdldFNldCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVMb2dCbG9jayhjb250YWluZXJFbDogSFRNTEVsZW1lbnQsIGxpbmVzOiBzdHJpbmdbXSwgZW1wdHlNZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByZUVsID0gY29udGFpbmVyRWwuY3JlYXRlRWwoXCJwcmVcIiwgeyBjbHM6IFwib2xhLWxvZy1ibG9ja1wiIH0pO1xyXG4gICAgcHJlRWwuc2V0VGV4dChsaW5lcy5sZW5ndGggPiAwID8gbGluZXMuam9pbihcIlxcblwiKSA6IGVtcHR5TWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICBncm91cEZpbGVzQnlGb2xkZXIoZmlsZXM6IHN0cmluZ1tdKTogTWFwPHN0cmluZywgc3RyaW5nW10+IHtcclxuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICBjb25zdCBub3JtYWxpemVkID0gZmlsZS5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgICAgY29uc3QgZm9sZGVyID0gbm9ybWFsaXplZC5pbmNsdWRlcyhcIi9cIikgPyBub3JtYWxpemVkLnNwbGl0KFwiL1wiKVswXSA6IFwiKHJvb3QpXCI7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBncm91cHMuZ2V0KGZvbGRlcikgPz8gW107XHJcbiAgICAgIGN1cnJlbnQucHVzaChmaWxlKTtcclxuICAgICAgZ3JvdXBzLnNldChmb2xkZXIsIGN1cnJlbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdyb3VwcztcclxuICB9XHJcblxyXG4gIGdyb3VwRmlsZUVudHJpZXNCeUZvbGRlcihlbnRyaWVzOiBUb29sRmlsZUVudHJ5W10pOiBNYXA8c3RyaW5nLCBUb29sRmlsZUVudHJ5W10+IHtcclxuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBUb29sRmlsZUVudHJ5W10+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcclxuICAgICAgY29uc3QgZm9sZGVyID0gZW50cnkuZm9sZGVyIHx8IFwiKHJvb3QpXCI7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBncm91cHMuZ2V0KGZvbGRlcikgPz8gW107XHJcbiAgICAgIGN1cnJlbnQucHVzaChlbnRyeSk7XHJcbiAgICAgIGdyb3Vwcy5zZXQoZm9sZGVyLCBjdXJyZW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiBncm91cHM7XHJcbiAgfVxyXG5cclxuICBjb21wYXJlR2VuZXJhdG9yTGFiZWxzKGxlZnQ6IHN0cmluZywgcmlnaHQ6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gbmV3IEludGwuQ29sbGF0b3IodGhpcy5wbHVnaW4uZ2V0TG9jYWxlKCksIHtcclxuICAgICAgbnVtZXJpYzogdHJ1ZSxcclxuICAgICAgc2Vuc2l0aXZpdHk6IFwiYmFzZVwiLFxyXG4gICAgfSkuY29tcGFyZShsZWZ0LCByaWdodCk7XHJcbiAgfVxyXG5cclxuICBnZXRTb3J0ZWRHZW5lcmF0b3JHcm91cHMoKTogQXJyYXk8W3N0cmluZywgVG9vbEZpbGVFbnRyeVtdXT4ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5ncm91cEZpbGVFbnRyaWVzQnlGb2xkZXIodGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlRW50cmllcykuZW50cmllcygpKS5zb3J0KChsZWZ0LCByaWdodCkgPT4ge1xyXG4gICAgICBjb25zdCBsZWZ0RW50cnkgPSBsZWZ0WzFdWzBdO1xyXG4gICAgICBjb25zdCByaWdodEVudHJ5ID0gcmlnaHRbMV1bMF07XHJcbiAgICAgIGNvbnN0IGxlZnRMYWJlbCA9IGxlZnRFbnRyeT8uZm9sZGVyID8/IGxlZnRbMF07XHJcbiAgICAgIGNvbnN0IHJpZ2h0TGFiZWwgPSByaWdodEVudHJ5Py5mb2xkZXIgPz8gcmlnaHRbMF07XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVHZW5lcmF0b3JMYWJlbHMobGVmdExhYmVsLCByaWdodExhYmVsKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0R2VuZXJhdG9yRW50cnlEaXNwbGF5UGF0aChlbnRyeTogVG9vbEZpbGVFbnRyeSk6IHN0cmluZyB7XHJcbiAgICBpZiAoZW50cnkuZm9sZGVyID09PSBcIihyb290KVwiKSB7XHJcbiAgICAgIHJldHVybiBlbnRyeS5wYXRoO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcHJlZml4ID0gYCR7ZW50cnkuZm9sZGVyfS9gO1xyXG4gICAgcmV0dXJuIGVudHJ5LnBhdGguc3RhcnRzV2l0aChwcmVmaXgpID8gZW50cnkucGF0aC5zbGljZShwcmVmaXgubGVuZ3RoKSA6IGVudHJ5LnBhdGg7XHJcbiAgfVxyXG5cclxuICBnZXRHZW5lcmF0b3JGb2xkZXJLZXlzKCk6IFNldDxzdHJpbmc+IHtcclxuICAgIHJldHVybiBuZXcgU2V0KFxyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmZpbGVFbnRyaWVzXHJcbiAgICAgICAgLm1hcCgoZW50cnkpID0+IGVudHJ5LmZvbGRlcilcclxuICAgICAgICAuZmlsdGVyKChmb2xkZXIpID0+IEJvb2xlYW4oZm9sZGVyKSAmJiBmb2xkZXIgIT09IFwiKHJvb3QpXCIpLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldEdlbmVyYXRvckZvbGRlclBhcmVudEtleShmb2xkZXJLZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIWZvbGRlcktleSB8fCBmb2xkZXJLZXkgPT09IFwiKHJvb3QpXCIpIHtcclxuICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBrbm93bkZvbGRlcnMgPSB0aGlzLmdldEdlbmVyYXRvckZvbGRlcktleXMoKTtcclxuICAgIGxldCBjdXJyZW50ID0gZm9sZGVyS2V5O1xyXG4gICAgd2hpbGUgKGN1cnJlbnQuaW5jbHVkZXMoXCIvXCIpKSB7XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnNsaWNlKDAsIGN1cnJlbnQubGFzdEluZGV4T2YoXCIvXCIpKTtcclxuICAgICAgaWYgKGtub3duRm9sZGVycy5oYXMoY3VycmVudCkpIHtcclxuICAgICAgICByZXR1cm4gY3VycmVudDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG5cclxuICBnZXRHZW5lcmF0b3JGb2N1c2VkRW50cmllcyhmb2xkZXJLZXk6IHN0cmluZyk6IFRvb2xGaWxlRW50cnlbXSB7XHJcbiAgICBpZiAoIWZvbGRlcktleSB8fCBmb2xkZXJLZXkgPT09IFwiKHJvb3QpXCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdG9yU3RhdGUuZmlsZUVudHJpZXMuZmlsdGVyKChlbnRyeSkgPT4gIWVudHJ5LnBhdGguaW5jbHVkZXMoXCIvXCIpKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHByZWZpeCA9IGAke2ZvbGRlcktleX0vYDtcclxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRvclN0YXRlLmZpbGVFbnRyaWVzLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LnBhdGguc3RhcnRzV2l0aChwcmVmaXgpKTtcclxuICB9XHJcblxyXG4gIGdldEdlbmVyYXRvckZvY3VzZWRWaWV3KGZvbGRlcktleTogc3RyaW5nKToge1xyXG4gICAgY3VycmVudEZpbGVzOiBUb29sRmlsZUVudHJ5W107XHJcbiAgICBzdWJmb2xkZXJzOiBBcnJheTx7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBjb3VudDogbnVtYmVyOyBzZWxlY3RlZENvdW50OiBudW1iZXIgfT47XHJcbiAgfSB7XHJcbiAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5nZXRHZW5lcmF0b3JGb2N1c2VkRW50cmllcyhmb2xkZXJLZXkpO1xyXG4gICAgY29uc3QgcHJlZml4ID0gZm9sZGVyS2V5ID8gYCR7Zm9sZGVyS2V5fS9gIDogXCJcIjtcclxuICAgIGNvbnN0IGN1cnJlbnRGaWxlczogVG9vbEZpbGVFbnRyeVtdID0gW107XHJcbiAgICBjb25zdCBzdWJmb2xkZXJzID0gbmV3IE1hcDxzdHJpbmcsIHsga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNvdW50OiBudW1iZXI7IHNlbGVjdGVkQ291bnQ6IG51bWJlciB9PigpO1xyXG5cclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICBjb25zdCByZWxhdGl2ZSA9IHByZWZpeCAmJiBlbnRyeS5wYXRoLnN0YXJ0c1dpdGgocHJlZml4KVxyXG4gICAgICAgID8gZW50cnkucGF0aC5zbGljZShwcmVmaXgubGVuZ3RoKVxyXG4gICAgICAgIDogZW50cnkucGF0aDtcclxuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHJlbGF0aXZlLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xyXG4gICAgICBpZiAoIW5vcm1hbGl6ZWQuaW5jbHVkZXMoXCIvXCIpKSB7XHJcbiAgICAgICAgY3VycmVudEZpbGVzLnB1c2goZW50cnkpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IFtjaGlsZF0gPSBub3JtYWxpemVkLnNwbGl0KFwiL1wiKTtcclxuICAgICAgY29uc3QgY2hpbGRLZXkgPSBmb2xkZXJLZXkgPyBgJHtmb2xkZXJLZXl9LyR7Y2hpbGR9YCA6IGNoaWxkO1xyXG4gICAgICBjb25zdCBjdXJyZW50ID0gc3ViZm9sZGVycy5nZXQoY2hpbGRLZXkpID8/IHtcclxuICAgICAgICBrZXk6IGNoaWxkS2V5LFxyXG4gICAgICAgIGxhYmVsOiBjaGlsZCxcclxuICAgICAgICBjb3VudDogMCxcclxuICAgICAgICBzZWxlY3RlZENvdW50OiAwLFxyXG4gICAgICB9O1xyXG4gICAgICBjdXJyZW50LmNvdW50ICs9IDE7XHJcbiAgICAgIGlmICh0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMuaW5jbHVkZXMoZW50cnkucGF0aCkpIHtcclxuICAgICAgICBjdXJyZW50LnNlbGVjdGVkQ291bnQgKz0gMTtcclxuICAgICAgfVxyXG4gICAgICBzdWJmb2xkZXJzLnNldChjaGlsZEtleSwgY3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudEZpbGVzLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiB0aGlzLmNvbXBhcmVHZW5lcmF0b3JMYWJlbHMobGVmdC5wYXRoLCByaWdodC5wYXRoKSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjdXJyZW50RmlsZXMsXHJcbiAgICAgIHN1YmZvbGRlcnM6IEFycmF5LmZyb20oc3ViZm9sZGVycy52YWx1ZXMoKSkuc29ydCgobGVmdCwgcmlnaHQpID0+IHRoaXMuY29tcGFyZUdlbmVyYXRvckxhYmVscyhsZWZ0LmtleSwgcmlnaHQua2V5KSksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0U2VsZWN0ZWRHZW5lcmF0b3JCeXRlcygpOiBudW1iZXIge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBuZXcgU2V0KHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcyk7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlRW50cmllc1xyXG4gICAgICAuZmlsdGVyKChlbnRyeSkgPT4gc2VsZWN0ZWQuaGFzKGVudHJ5LnBhdGgpKVxyXG4gICAgICAucmVkdWNlKCh0b3RhbCwgZW50cnkpID0+IHRvdGFsICsgKGVudHJ5LnNpemUgfHwgMCksIDApO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlR2VuZXJhdG9yRm9sZGVyKGZvbGRlcjogc3RyaW5nLCBjaGVja2VkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBjb25zdCBtYXRjaGluZyA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuZmlsZUVudHJpZXNcclxuICAgICAgLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmZvbGRlciA9PT0gZm9sZGVyIHx8IGVudHJ5LnBhdGguc3RhcnRzV2l0aChgJHtmb2xkZXJ9L2ApKVxyXG4gICAgICAubWFwKChlbnRyeSkgPT4gZW50cnkucGF0aCk7XHJcbiAgICBpZiAoY2hlY2tlZCkge1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMgPSBbLi4ubmV3IFNldChbLi4udGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzLCAuLi5tYXRjaGluZ10pXTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcmVtb3ZlZCA9IG5ldyBTZXQobWF0Y2hpbmcpO1xyXG4gICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzLmZpbHRlcigocGF0aCkgPT4gIXJlbW92ZWQuaGFzKHBhdGgpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlbmRlcldvcmtmbG93UGFuZWxzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJUYWdnZXJQYW5lbCgpO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJJbmdlc3RQYW5lbCgpO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJXb3JrZmxvd0xvZ3NQYW5lbCgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVuZGVyR2VuZXJhdG9yUGFuZWwoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBoYWREZXRhaWxzID0gdGhpcy5nZW5lcmF0b3JQYW5lbEVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJkZXRhaWxzXCIpLmxlbmd0aCA+IDA7XHJcbiAgICBjb25zdCBvcGVuS2V5cyA9IHRoaXMuY2FwdHVyZU9wZW5EZXRhaWxzKHRoaXMuZ2VuZXJhdG9yUGFuZWxFbCk7XHJcbiAgICBjb25zdCBnZW5lcmF0b3JTY3JvbGxIb3N0ID0gdGhpcy5nZW5lcmF0b3JQYW5lbEVsLnBhcmVudEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudFxyXG4gICAgICA/IHRoaXMuZ2VuZXJhdG9yUGFuZWxFbC5wYXJlbnRFbGVtZW50XHJcbiAgICAgIDogdGhpcy5nZW5lcmF0b3JUYWJFbDtcclxuICAgIGNvbnN0IHByZXZpb3VzU2Nyb2xsVG9wID0gZ2VuZXJhdG9yU2Nyb2xsSG9zdD8uc2Nyb2xsVG9wID8/IDA7XHJcbiAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdlbmVyYXRvclN0YXRlLnN0YXR1cyB8fCB0aGlzLnQoXCJnZW5lcmF0b3JTdGF0dXNSZWFkeVwiKTtcclxuICAgIGNvbnN0IGJvZHlFbCA9IHRoaXMucmVuZGVyVG9vbFN1bW1hcnkodGhpcy5nZW5lcmF0b3JQYW5lbEVsLCB0aGlzLnQoXCJ0b29sR2VuZXJhdG9yXCIpLCBzdGF0dXMpO1xyXG4gICAgYm9keUVsLmNyZWF0ZUVsKFwicFwiLCB7IGNsczogXCJvbGEtd29ya2Zsb3ctaW50cm9cIiwgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9ySW50cm9cIikgfSk7XHJcbiAgICBjb25zdCBpc0J1c3kgPSBCb29sZWFuKHRoaXMucnVubmluZ1Rhc2spO1xyXG4gICAgY29uc3QgcHJvZ3Jlc3NWYWx1ZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKHRoaXMuZ2VuZXJhdG9yU3RhdGUucHJvZ3Jlc3MsIDEwMCkpO1xyXG4gICAgY29uc3QgaW5wdXRSb290cyA9IHRoaXMuZ2V0R2VuZXJhdG9yUm9vdEVudHJpZXMoKTtcclxuICAgIGlmICghaW5wdXRSb290cy5zb21lKChlbnRyeSkgPT4gZW50cnkucGF0aCA9PT0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpcikpIHtcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpciA9IGlucHV0Um9vdHNbMF0/LnBhdGggPz8gR0VORVJBVE9SX1JPT1RfU0VOVElORUw7XHJcbiAgICB9XHJcbiAgICBjb25zdCBmb2xkZXJTZWVkID0gW1wiXCIsIC4uLnRoaXMuZ2V0QWxsVmF1bHRGb2xkZXJPcHRpb25zKCksIHRoaXMuZ2VuZXJhdG9yU3RhdGUub3V0cHV0RGlyXTtcclxuICAgIGlmICh0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyICYmIHRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXIgIT09IEdFTkVSQVRPUl9ST09UX1NFTlRJTkVMKSB7XHJcbiAgICAgIGZvbGRlclNlZWQucHVzaCh0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZvbGRlck9wdGlvbnMgPSBBcnJheS5mcm9tKFxyXG4gICAgICBuZXcgU2V0KFxyXG4gICAgICAgIGZvbGRlclNlZWRcclxuICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiBub3JtYWxpemVQYXRoKHZhbHVlIHx8IFwiXCIpKSxcclxuICAgICAgKSxcclxuICAgICkuc29ydCgoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpKTtcclxuXHJcbiAgICBjb25zdCBmaWxlc1N0YWdlRWwgPSB0aGlzLmNyZWF0ZVNlY3Rpb25EZXRhaWxzKGJvZHlFbCwgdGhpcy50KFwiZ2VuZXJhdG9yU2VjdGlvbkZpbGVzXCIpLCB0cnVlKTtcbiAgICBjb25zdCBmaWxlc0hlYWRlckdyaWQgPSBmaWxlc1N0YWdlRWwuY3JlYXRlRGl2KHtcbiAgICAgIGNsczogdGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlID09PSBHRU5FUkFUT1JfTU9ERV9OT1RFX1JFQlVJTERcbiAgICAgICAgPyBcIm9sYS1nZW5lcmF0b3ItZmlsZXMtcm93IG9sYS1nZW5lcmF0b3ItZmlsZXMtcm93LS1yZWJ1aWxkXCJcbiAgICAgICAgOiBcIm9sYS1nZW5lcmF0b3ItZmlsZXMtcm93IG9sYS1nZW5lcmF0b3ItZmlsZXMtcm93LS1zdGFuZGFyZFwiLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbW9kZUZpZWxkID0gdGhpcy5jcmVhdGVGaWVsZChmaWxlc0hlYWRlckdyaWQsIHRoaXMudChcImdlbmVyYXRvck1vZGVcIikpO1xuICAgIG1vZGVGaWVsZC5hZGRDbGFzcyhcIm9sYS1maWVsZC0tbW9kZVwiKTtcbiAgICBjb25zdCBtb2RlU2VsZWN0ID0gbW9kZUZpZWxkLmNyZWF0ZUVsKFwic2VsZWN0XCIpO1xuICAgIG1vZGVTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogR0VORVJBVE9SX01PREVfU1RBTkRBUkQsIHRleHQ6IHRoaXMudChcImdlbmVyYXRvck1vZGVTdGFuZGFyZFwiKSB9KTtcclxuICAgIG1vZGVTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogR0VORVJBVE9SX01PREVfTk9URV9SRUJVSUxELCB0ZXh0OiB0aGlzLnQoXCJnZW5lcmF0b3JNb2RlTm90ZVJlYnVpbGRcIikgfSk7XHJcbiAgICBtb2RlU2VsZWN0LnZhbHVlID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlO1xyXG4gICAgbW9kZVNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIG1vZGVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3dpdGNoR2VuZXJhdG9yTW9kZShtb2RlU2VsZWN0LnZhbHVlIGFzIEdlbmVyYXRvck1vZGUpO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlckdlbmVyYXRvclBhbmVsKCk7XHJcbiAgICB9KTtcclxuXG4gICAgY29uc3QgaW5wdXRGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoZmlsZXNIZWFkZXJHcmlkLCB0aGlzLnQoXCJnZW5lcmF0b3JJbnB1dERpclwiKSk7XG4gICAgaW5wdXRGaWVsZC5hZGRDbGFzcyhcIm9sYS1maWVsZC0taW5wdXQtcm9vdFwiKTtcbiAgICBjb25zdCBpbnB1dFNlbGVjdCA9IGlucHV0RmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XG4gICAgZm9yIChjb25zdCByb290IG9mIGlucHV0Um9vdHMpIHtcclxuICAgICAgaW5wdXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwge1xyXG4gICAgICAgIHZhbHVlOiByb290LnBhdGgsXHJcbiAgICAgICAgdGV4dDogYCR7cm9vdC5sYWJlbH0gKCR7cm9vdC5jb3VudH0pYCxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpbnB1dFNlbGVjdC52YWx1ZSA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuaW5wdXREaXI7XHJcbiAgICBpbnB1dFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIGlucHV0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyID0gaW5wdXRTZWxlY3QudmFsdWU7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcyA9IFtdO1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmZvY3VzZWRGb2xkZXIgPSBcIlwiO1xyXG4gICAgICB0aGlzLnN5bmNHZW5lcmF0b3JPdXRwdXREaXIoKTtcclxuICAgICAgYXdhaXQgdGhpcy5sb2FkR2VuZXJhdG9yRmlsZXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBzdWJqZWN0SW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgaWYgKHRoaXMuZ2VuZXJhdG9yU3RhdGUubW9kZSA9PT0gR0VORVJBVE9SX01PREVfTk9URV9SRUJVSUxEKSB7XG4gICAgICBjb25zdCBzdWJqZWN0RmllbGQgPSBmaWxlc0hlYWRlckdyaWQuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1maWVsZFwiIH0pO1xuICAgICAgc3ViamVjdEZpZWxkLmFkZENsYXNzKFwib2xhLWZpZWxkLS10aXRsZS1yZWJ1aWxkXCIpO1xuICAgICAgY29uc3Qgc3ViamVjdEhlYWRlciA9IHN1YmplY3RGaWVsZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWZpZWxkLWxhYmVsLXJvdyBvbGEtZmllbGQtbGFiZWwtcm93LS1jb21wYWN0XCIgfSk7XG4gICAgICBjb25zdCByZWJ1aWxkVG9nZ2xlID0gc3ViamVjdEhlYWRlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgY2xzOiBcIm9sYS1jaGVjay1vcHRpb24gb2xhLWNoZWNrLW9wdGlvbi0tY29tcGFjdCBvbGEtY2hlY2stb3B0aW9uLS1maWVsZFwiIH0pO1xuICAgICAgY29uc3QgcmVidWlsZENoZWNrYm94ID0gcmVidWlsZFRvZ2dsZS5jcmVhdGVFbChcImlucHV0XCIsIHsgYXR0cjogeyB0eXBlOiBcImNoZWNrYm94XCIsIFwiYXJpYS1sYWJlbFwiOiB0aGlzLnQoXCJnZW5lcmF0b3JSZWJ1aWxkVGl0bGVcIikgfSB9KTtcbiAgICAgIHJlYnVpbGRDaGVja2JveC5jaGVja2VkID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5yZWJ1aWxkVGl0bGU7XG4gICAgICByZWJ1aWxkQ2hlY2tib3guZGlzYWJsZWQgPSBpc0J1c3kgfHwgIXRoaXMuaGFzR2VuZXJhdG9yUGF0dGVybihUSVRMRV9SRUJVSUxEX1BBVFRFUk4pO1xuICAgICAgcmVidWlsZENoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnJlYnVpbGRUaXRsZSA9IHJlYnVpbGRDaGVja2JveC5jaGVja2VkO1xuICAgICAgICB2b2lkIHRoaXMucmVuZGVyR2VuZXJhdG9yUGFuZWwoKTtcbiAgICAgIH0pO1xuICAgICAgcmVidWlsZFRvZ2dsZS5jcmVhdGVTcGFuKHsgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9yU3ViamVjdFJlYnVpbGRcIikgfSk7XG4gICAgICBzdWJqZWN0SW5wdXQgPSBzdWJqZWN0RmllbGQuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IGF0dHI6IHsgdHlwZTogXCJ0ZXh0XCIgfSB9KTtcbiAgICAgIHN1YmplY3RJbnB1dC52YWx1ZSA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3ViamVjdDtcbiAgICAgIHN1YmplY3RJbnB1dC5wbGFjZWhvbGRlciA9IHRoaXMucGx1Z2luLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpPy5iYXNlbmFtZSA/PyBcIlwiO1xuICAgICAgc3ViamVjdElucHV0LmRpc2FibGVkID0gaXNCdXN5IHx8ICF0aGlzLmdlbmVyYXRvclN0YXRlLnJlYnVpbGRUaXRsZTtcbiAgICAgIHN1YmplY3RJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5zdWJqZWN0ID0gc3ViamVjdElucHV0LnZhbHVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN1YmplY3RGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoZmlsZXNIZWFkZXJHcmlkLCB0aGlzLnQoXCJnZW5lcmF0b3JTdWJqZWN0XCIpKTtcbiAgICAgIHN1YmplY3RGaWVsZC5hZGRDbGFzcyhcIm9sYS1maWVsZC0tc3ViamVjdFwiKTtcbiAgICAgIHN1YmplY3RJbnB1dCA9IHN1YmplY3RGaWVsZC5jcmVhdGVFbChcImlucHV0XCIsIHsgYXR0cjogeyB0eXBlOiBcInRleHRcIiB9IH0pO1xuICAgICAgc3ViamVjdElucHV0LnZhbHVlID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5zdWJqZWN0O1xuICAgICAgc3ViamVjdElucHV0LmRpc2FibGVkID0gaXNCdXN5O1xuICAgICAgc3ViamVjdElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnN1YmplY3QgPSBzdWJqZWN0SW5wdXQudmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cclxuICAgIGNvbnN0IHNlbGVjdGVkQnl0ZXMgPSB0aGlzLmdldFNlbGVjdGVkR2VuZXJhdG9yQnl0ZXMoKTtcclxuICAgIGNvbnN0IGVzdGltYXRlZFRva2VucyA9IE1hdGguZmxvb3Ioc2VsZWN0ZWRCeXRlcyAvIDMpO1xyXG4gICAgY29uc3Qgc2luZ2xlRmlsZVJlYnVpbGQgPSB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGUgPT09IEdFTkVSQVRPUl9NT0RFX05PVEVfUkVCVUlMRDtcclxuICAgIGNvbnN0IGZpbGVTdW1tYXJ5ID0gZmlsZXNTdGFnZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZ2VuZXJhdG9yLXN1bW1hcnktaW5saW5lXCIgfSk7XG4gICAgY29uc3QgYWN0aXZlUm9vdExhYmVsID0gdGhpcy5nZXRHZW5lcmF0b3JSb290TGFiZWwodGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpcik7XG4gICAgY29uc3Qgc3VtbWFyeVBhcnRzID0gW1xuICAgICAgYFx1RDMwQ1x1Qzc3QyAke3RoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcy5sZW5ndGh9YCxcbiAgICAgIHRoaXMuZm9ybWF0Qnl0ZXMoc2VsZWN0ZWRCeXRlcyksXG4gICAgICBgJHtlc3RpbWF0ZWRUb2tlbnMudG9Mb2NhbGVTdHJpbmcodGhpcy5wbHVnaW4uZ2V0TG9jYWxlKCkpfSB0b2tgLFxuICAgICAgYWN0aXZlUm9vdExhYmVsLFxuICAgIF07XG4gICAgZmlsZVN1bW1hcnkuc2V0VGV4dChzdW1tYXJ5UGFydHMuam9pbihcIiAvIFwiKSk7XG4gICAgaWYgKHRoaXMuZ2VuZXJhdG9yU3RhdGUuZmlsZUVycm9yKSB7XHJcbiAgICAgIGZpbGVzU3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRvb2wtc3RhdHVzIG9sYS10b29sLXN0YXR1cy0tZXJyb3JcIiwgdGV4dDogdGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlRXJyb3IgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5nZW5lcmF0b3JTdGF0ZS5maWxlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZmlsZXNTdGFnZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmllbGQtaGVscFwiLCB0ZXh0OiB0aGlzLnQoXCJnZW5lcmF0b3JOb0ZpbGVzXCIpIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZ3JvdXBlZCA9IHRoaXMuZ2V0U29ydGVkR2VuZXJhdG9yR3JvdXBzKCk7XHJcbiAgICAgIGNvbnN0IGdyb3Vwc0VsID0gZmlsZXNTdGFnZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmlsZS1ncm91cHNcIiB9KTtcclxuICAgICAgaWYgKHRoaXMuZ2VuZXJhdG9yU3RhdGUuZm9jdXNlZEZvbGRlcikge1xyXG4gICAgICAgIGNvbnN0IGZvY3VzZWRHcm91cCA9IGdyb3VwZWQuZmluZCgoW2ZvbGRlcl0pID0+IGZvbGRlciA9PT0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyKVxyXG4gICAgICAgICAgPz8gZ3JvdXBlZC5maW5kKChbZm9sZGVyXSkgPT4gdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyLnN0YXJ0c1dpdGgoYCR7Zm9sZGVyfS9gKSlcclxuICAgICAgICAgID8/IG51bGw7XHJcbiAgICAgICAgaWYgKGZvY3VzZWRHcm91cCkge1xyXG4gICAgICAgICAgY29uc3QgW2ZvbGRlciwgZW50cmllc10gPSBmb2N1c2VkR3JvdXA7XHJcbiAgICAgICAgICBjb25zdCByb290Rm9sZGVyTWV0YSA9IGVudHJpZXNbMF07XHJcbiAgICAgICAgICBjb25zdCBmb2N1c2VkVmlldyA9IHRoaXMuZ2V0R2VuZXJhdG9yRm9jdXNlZFZpZXcodGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyKTtcclxuICAgICAgICAgIGNvbnN0IGZvY3VzZWRDYXJkID0gZ3JvdXBzRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1maWxlLWdyb3VwIG9sYS1maWxlLWdyb3VwLS1mb2N1c2VkXCIgfSk7XHJcbiAgICAgICAgICBjb25zdCBmb2N1c1JvdyA9IGZvY3VzZWRDYXJkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZm9sZGVyLWZvY3VzLXJvd1wiIH0pO1xyXG4gICAgICAgICAgY29uc3QgYmFja0J1dHRvbiA9IGZvY3VzUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgICAgY2xzOiBcIm9sYS1mb2xkZXItYmFjay1idXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9yRm9sZGVyQmFja1wiKSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYmFja0J1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgICAgICAgIGJhY2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyID0gdGhpcy5nZXRHZW5lcmF0b3JGb2xkZXJQYXJlbnRLZXkodGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyKTtcclxuICAgICAgICAgICAgdGhpcy5zeW5jR2VuZXJhdG9yT3V0cHV0RGlyKCk7XHJcbiAgICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb25zdCB0aXRsZUJsb2NrID0gZm9jdXNSb3cuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1mb2xkZXItZm9jdXMtdGl0bGVcIiB9KTtcclxuICAgICAgICAgIGNvbnN0IHRpdGxlTGFiZWwgPSB0aGlzLmdlbmVyYXRvclN0YXRlLmZvY3VzZWRGb2xkZXIuc2xpY2UoZm9sZGVyLmxlbmd0aCkucmVwbGFjZSgvXlxcLysvLCBcIlwiKSB8fCByb290Rm9sZGVyTWV0YS5mb2xkZXJMYWJlbDtcclxuICAgICAgICAgIHRpdGxlQmxvY2suY3JlYXRlRWwoXCJzdHJvbmdcIiwge1xyXG4gICAgICAgICAgICB0ZXh0OiBgJHt0aXRsZUxhYmVsfSAoJHtmb2N1c2VkVmlldy5jdXJyZW50RmlsZXMubGVuZ3RoICsgZm9jdXNlZFZpZXcuc3ViZm9sZGVycy5yZWR1Y2UoKHRvdGFsLCBpdGVtKSA9PiB0b3RhbCArIGl0ZW0uY291bnQsIDApfSlgLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAodGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyICE9PSBmb2xkZXIpIHtcclxuICAgICAgICAgICAgdGl0bGVCbG9jay5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWZpZWxkLWhlbHBcIiwgdGV4dDogYCR7cm9vdEZvbGRlck1ldGEuZm9sZGVyTGFiZWx9IC8gJHt0aXRsZUxhYmVsfWAgfSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHJvb3RGb2xkZXJNZXRhLmZvbGRlclBhcmVudCkge1xyXG4gICAgICAgICAgICB0aXRsZUJsb2NrLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmllbGQtaGVscFwiLCB0ZXh0OiByb290Rm9sZGVyTWV0YS5mb2xkZXJQYXJlbnQgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZm9sZGVyQm9keSA9IGZvY3VzZWRDYXJkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmlsZS1ncm91cC1ib2R5XCIgfSk7XHJcbiAgICAgICAgICBjb25zdCBmb2N1c2VkRW50cmllcyA9IHRoaXMuZ2V0R2VuZXJhdG9yRm9jdXNlZEVudHJpZXModGhpcy5nZW5lcmF0b3JTdGF0ZS5mb2N1c2VkRm9sZGVyKTtcclxuICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQ291bnQgPSBmb2N1c2VkRW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiB0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMuaW5jbHVkZXMoZW50cnkucGF0aCkpLmxlbmd0aDtcclxuICAgICAgICAgIGNvbnN0IGZvbGRlclNlbGVjdFJvdyA9IGZvbGRlckJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1mb2xkZXItc2VsZWN0LXJvd1wiIH0pO1xyXG4gICAgICAgICAgZm9sZGVyU2VsZWN0Um93LmNyZWF0ZVNwYW4oe1xyXG4gICAgICAgICAgICBjbHM6IFwib2xhLWJhZGdlIG9sYS1iYWRnZS0tc2NvcmVcIixcclxuICAgICAgICAgICAgdGV4dDogYCR7c2VsZWN0ZWRDb3VudH0vJHtmb2N1c2VkRW50cmllcy5sZW5ndGh9YCxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY29uc3QgZm9sZGVyU2VsZWN0TGFiZWwgPSBmb2xkZXJTZWxlY3RSb3cuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IGNsczogXCJvbGEtY2hlY2stb3B0aW9uIG9sYS1jaGVjay1vcHRpb24tLWNvbXBhY3Qgb2xhLWZvbGRlci1pbmxpbmUtY2hlY2tcIiB9KTtcclxuICAgICAgICAgIGNvbnN0IGZvbGRlckNoZWNrYm94ID0gZm9sZGVyU2VsZWN0TGFiZWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IGF0dHI6IHsgdHlwZTogXCJjaGVja2JveFwiIH0gfSk7XHJcbiAgICAgICAgICBmb2xkZXJDaGVja2JveC5jaGVja2VkID0gZm9jdXNlZEVudHJpZXMubGVuZ3RoID4gMCAmJiBzZWxlY3RlZENvdW50ID09PSBmb2N1c2VkRW50cmllcy5sZW5ndGg7XHJcbiAgICAgICAgICBmb2xkZXJDaGVja2JveC5pbmRldGVybWluYXRlID0gc2VsZWN0ZWRDb3VudCA+IDAgJiYgc2VsZWN0ZWRDb3VudCA8IGZvY3VzZWRFbnRyaWVzLmxlbmd0aDtcclxuICAgICAgICAgIGZvbGRlckNoZWNrYm94LmRpc2FibGVkID0gaXNCdXN5IHx8IHNpbmdsZUZpbGVSZWJ1aWxkO1xyXG4gICAgICAgICAgZm9sZGVyQ2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlR2VuZXJhdG9yRm9sZGVyKHRoaXMuZ2VuZXJhdG9yU3RhdGUuZm9jdXNlZEZvbGRlciwgZm9sZGVyQ2hlY2tib3guY2hlY2tlZCk7XHJcbiAgICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBmb2xkZXJTZWxlY3RMYWJlbC5jcmVhdGVTcGFuKHsgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9yU2VsZWN0QWxsRm9sZGVyXCIpIH0pO1xyXG5cclxuICAgICAgICAgIGlmIChmb2N1c2VkVmlldy5zdWJmb2xkZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViZm9sZGVyTGlzdCA9IGZvbGRlckJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1maWxlLWdyb3VwcyBvbGEtZmlsZS1ncm91cHMtLW5lc3RlZFwiIH0pO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN1YmZvbGRlciBvZiBmb2N1c2VkVmlldy5zdWJmb2xkZXJzKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc3ViZm9sZGVyUm93ID0gc3ViZm9sZGVyTGlzdC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWZpbGUtZ3JvdXAtbGlzdGluZyBvbGEtZmlsZS1ncm91cC1saXN0aW5nLS1yb3dcIiB9KTtcclxuICAgICAgICAgICAgICBjb25zdCBzdWJmb2xkZXJNYWluID0gc3ViZm9sZGVyUm93LmNyZWF0ZURpdih7IGNsczogXCJvbGEtZm9sZGVyLWxpbmUtbWFpblwiIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9wZW5TdWJmb2xkZXJCdXR0b24gPSBzdWJmb2xkZXJNYWluLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgICAgICAgIGNsczogXCJvbGEtZm9sZGVyLW9wZW4tYnV0dG9uXCIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBgJHtzdWJmb2xkZXIubGFiZWx9ICgke3N1YmZvbGRlci5jb3VudH0pYCxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBvcGVuU3ViZm9sZGVyQnV0dG9uLmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgICAgICAgICAgIG9wZW5TdWJmb2xkZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuZm9jdXNlZEZvbGRlciA9IHN1YmZvbGRlci5rZXk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN5bmNHZW5lcmF0b3JPdXRwdXREaXIoKTtcclxuICAgICAgICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHN1YmZvbGRlck1haW4uY3JlYXRlU3Bhbih7XHJcbiAgICAgICAgICAgICAgICBjbHM6IFwib2xhLWJhZGdlIG9sYS1iYWRnZS0tc2NvcmVcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3N1YmZvbGRlci5zZWxlY3RlZENvdW50fS8ke3N1YmZvbGRlci5jb3VudH1gLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHN1YmZvbGRlckFjdGlvbnMgPSBzdWJmb2xkZXJSb3cuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1mb2xkZXItbGluZS1hY3Rpb25zXCIgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc3ViZm9sZGVyU2VsZWN0TGFiZWwgPSBzdWJmb2xkZXJBY3Rpb25zLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyBjbHM6IFwib2xhLWNoZWNrLW9wdGlvbiBvbGEtY2hlY2stb3B0aW9uLS1jb21wYWN0IG9sYS1mb2xkZXItaW5saW5lLWNoZWNrXCIgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc3ViZm9sZGVyQ2hlY2tib3ggPSBzdWJmb2xkZXJTZWxlY3RMYWJlbC5jcmVhdGVFbChcImlucHV0XCIsIHsgYXR0cjogeyB0eXBlOiBcImNoZWNrYm94XCIgfSB9KTtcclxuICAgICAgICAgICAgICBzdWJmb2xkZXJDaGVja2JveC5jaGVja2VkID0gc3ViZm9sZGVyLnNlbGVjdGVkQ291bnQgPT09IHN1YmZvbGRlci5jb3VudDtcclxuICAgICAgICAgICAgICBzdWJmb2xkZXJDaGVja2JveC5pbmRldGVybWluYXRlID0gc3ViZm9sZGVyLnNlbGVjdGVkQ291bnQgPiAwICYmIHN1YmZvbGRlci5zZWxlY3RlZENvdW50IDwgc3ViZm9sZGVyLmNvdW50O1xyXG4gICAgICAgICAgICAgIHN1YmZvbGRlckNoZWNrYm94LmRpc2FibGVkID0gaXNCdXN5IHx8IHNpbmdsZUZpbGVSZWJ1aWxkO1xyXG4gICAgICAgICAgICAgIHN1YmZvbGRlckNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVHZW5lcmF0b3JGb2xkZXIoc3ViZm9sZGVyLmtleSwgc3ViZm9sZGVyQ2hlY2tib3guY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB2b2lkIHRoaXMucmVuZGVyR2VuZXJhdG9yUGFuZWwoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzdWJmb2xkZXJTZWxlY3RMYWJlbC5jcmVhdGVTcGFuKHsgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9yU2VsZWN0QWxsRm9sZGVyXCIpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBmb2N1c2VkVmlldy5jdXJyZW50RmlsZXMpIHtcclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uRWwgPSBmb2xkZXJCb2R5LmNyZWF0ZUVsKFwibGFiZWxcIiwgeyBjbHM6IFwib2xhLWNoZWNrLW9wdGlvbiBvbGEtZmlsZS1vcHRpb25cIiB9KTtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBvcHRpb25FbC5jcmVhdGVFbChcImlucHV0XCIsIHsgYXR0cjogeyB0eXBlOiBcImNoZWNrYm94XCIgfSB9KTtcclxuICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcy5pbmNsdWRlcyhlbnRyeS5wYXRoKTtcclxuICAgICAgICAgICAgY2hlY2tib3guZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICAgICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMgPSBzaW5nbGVGaWxlUmVidWlsZFxyXG4gICAgICAgICAgICAgICAgICA/IFtlbnRyeS5wYXRoXVxyXG4gICAgICAgICAgICAgICAgICA6IFsuLi5uZXcgU2V0KFsuLi50aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMsIGVudHJ5LnBhdGhdKV07XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcyA9IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcy5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZSAhPT0gZW50cnkucGF0aCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgb3B0aW9uRWwuY3JlYXRlU3Bhbih7IHRleHQ6IGAke3RoaXMuZ2V0R2VuZXJhdG9yRW50cnlEaXNwbGF5UGF0aChlbnRyeSl9ICgke3RoaXMuZm9ybWF0Qnl0ZXMoZW50cnkuc2l6ZSl9KWAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoY29uc3QgW2ZvbGRlciwgZW50cmllc10gb2YgZ3JvdXBlZCkge1xyXG4gICAgICAgICAgY29uc3QgZm9sZGVyTWV0YSA9IGVudHJpZXNbMF07XHJcbiAgICAgICAgICBjb25zdCBzZWxlY3RlZENvdW50ID0gZW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiB0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMuaW5jbHVkZXMoZW50cnkucGF0aCkpLmxlbmd0aDtcclxuICAgICAgICAgIGNvbnN0IGdyb3VwQnV0dG9uID0gZ3JvdXBzRWwuY3JlYXRlRWwoXCJidXR0b25cIiwgeyBjbHM6IFwib2xhLWZpbGUtZ3JvdXAtbGlzdGluZyBvbGEtZmlsZS1ncm91cC1saXN0aW5nLS1tYWluIG9sYS1maWxlLWdyb3VwLWxpc3RpbmctLWJ1dHRvblwiIH0pO1xyXG4gICAgICAgICAgZ3JvdXBCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICAgICAgICBncm91cEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLmZvY3VzZWRGb2xkZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgICAgIHRoaXMuc3luY0dlbmVyYXRvck91dHB1dERpcigpO1xyXG4gICAgICAgICAgICB2b2lkIHRoaXMucmVuZGVyR2VuZXJhdG9yUGFuZWwoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY29uc3QgdG9wUm93ID0gZ3JvdXBCdXR0b24uY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1mb2xkZXItbGluZS1tYWluXCIgfSk7XHJcbiAgICAgICAgICBjb25zdCB0aXRsZVJvdyA9IHRvcFJvdy5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWZvbGRlci1saW5lLXRpdGxlXCIgfSk7XHJcbiAgICAgICAgICB0aXRsZVJvdy5jcmVhdGVFbChcInN0cm9uZ1wiLCB7IHRleHQ6IGAke2ZvbGRlck1ldGEuZm9sZGVyTGFiZWx9ICgke2VudHJpZXMubGVuZ3RofSlgIH0pO1xyXG4gICAgICAgICAgaWYgKGZvbGRlck1ldGEuZm9sZGVyUGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRpdGxlUm93LmNyZWF0ZVNwYW4oeyBjbHM6IFwib2xhLWZvbGRlci1saW5lLXBhdGhcIiwgdGV4dDogZm9sZGVyTWV0YS5mb2xkZXJQYXJlbnQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0b3BSb3cuY3JlYXRlU3Bhbih7XHJcbiAgICAgICAgICAgIGNsczogXCJvbGEtYmFkZ2Ugb2xhLWJhZGdlLS1zY29yZVwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBgJHtzZWxlY3RlZENvdW50fS8ke2VudHJpZXMubGVuZ3RofWAsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5nc1N0YWdlRWwgPSB0aGlzLmNyZWF0ZVNlY3Rpb25EZXRhaWxzKFxyXG4gICAgICBib2R5RWwsXHJcbiAgICAgIHRoaXMudChcImdlbmVyYXRvclNlY3Rpb25TZXR0aW5nc1wiKSxcclxuICAgICAgdHJ1ZSxcclxuICAgICAgKHN1bW1hcnlBY3Rpb25zRWwpID0+IHtcclxuICAgICAgICBjb25zdCByZWxvYWRCdXR0b24gPSBzdW1tYXJ5QWN0aW9uc0VsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcclxuICAgICAgICAgIGNsczogXCJvbGEtZ2VuZXJhdG9yLXNldHRpbmdzLXJlbG9hZFwiLFxyXG4gICAgICAgICAgdGV4dDogdGhpcy50KFwid29ya2Zsb3dzUmVmcmVzaFwiKSxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZWxvYWRCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICAgICAgcmVsb2FkQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgIHRoaXMudG9vbENvbmZpZ0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVUb29sRGVmYXVsdHModHJ1ZSk7XHJcbiAgICAgICAgICB2b2lkIHRoaXMubG9hZFRvb2xDb25maWcodHJ1ZSk7XHJcbiAgICAgICAgICB2b2lkIHRoaXMubG9hZEdlbmVyYXRvckZpbGVzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG4gICAgY29uc3QgYWxsUGF0dGVybnMgPSB0aGlzLmdldFBhdHRlcm5LZXlzKCk7XHJcbiAgICBjb25zdCBlZmZlY3RpdmVQYXR0ZXJuS2V5cyA9IHRoaXMuZ2V0RWZmZWN0aXZlR2VuZXJhdG9yUGF0dGVybktleXMoKTtcclxuICAgIGNvbnN0IHZpc2libGVQYXR0ZXJuR3JvdXBzID0gdGhpcy5nZXRQYXR0ZXJuR3JvdXBFbnRyaWVzKClcclxuICAgICAgLm1hcCgoW2dyb3VwTmFtZSwgZ3JvdXBlZFBhdHRlcm5zXSkgPT4gW2dyb3VwTmFtZSwgZ3JvdXBlZFBhdHRlcm5zLmZpbHRlcigocGF0dGVybikgPT4gcGF0dGVybiAhPT0gVElUTEVfUkVCVUlMRF9QQVRURVJOKV0gYXMgW3N0cmluZywgc3RyaW5nW11dKVxyXG4gICAgICAuZmlsdGVyKChbLCBncm91cGVkUGF0dGVybnNdKSA9PiBncm91cGVkUGF0dGVybnMubGVuZ3RoID4gMCk7XHJcbiAgICBjb25zdCBzaG93UmVidWlsZFRpdGxlT3B0aW9uID0gZmFsc2U7XHJcbiAgICBjb25zdCBvdXRwdXRGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoc2V0dGluZ3NTdGFnZUVsLCB0aGlzLnQoXCJnZW5lcmF0b3JPdXRwdXREaXJcIikpO1xyXG4gICAgY29uc3Qgb3V0cHV0RGlyID0gb3V0cHV0RmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XHJcbiAgICBmb3IgKGNvbnN0IGZvbGRlclBhdGggb2YgZm9sZGVyT3B0aW9ucykge1xyXG4gICAgICBvdXRwdXREaXIuY3JlYXRlRWwoXCJvcHRpb25cIiwge1xyXG4gICAgICAgIHZhbHVlOiBmb2xkZXJQYXRoLFxyXG4gICAgICAgIHRleHQ6IGZvbGRlclBhdGggfHwgXCIvXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgb3V0cHV0RGlyLnZhbHVlID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5vdXRwdXREaXI7XHJcbiAgICBvdXRwdXREaXIuZGlzYWJsZWQgPSBpc0J1c3kgfHwgdGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlID09PSBHRU5FUkFUT1JfTU9ERV9OT1RFX1JFQlVJTEQ7XHJcbiAgICBvdXRwdXREaXIuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUub3V0cHV0RGlyID0gb3V0cHV0RGlyLnZhbHVlO1xyXG4gICAgfSk7XHJcbiAgICBpZiAodGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlID09PSBHRU5FUkFUT1JfTU9ERV9OT1RFX1JFQlVJTEQpIHtcclxuICAgICAgb3V0cHV0RmllbGQuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1maWVsZC1oZWxwXCIsIHRleHQ6IFwiXHVCMTc4XHVEMkI4IFx1QzdBQ1x1QUQ2Q1x1QzEzMVx1Qzc0MCBcdUQ2MDRcdUM3QUMgXHVDMTIwXHVEMEREIFx1RDMwQ1x1Qzc3Q1x1Qzc0NCBcdUM5QzFcdUM4MTEgXHVCMzZFXHVDNUI0XHVDNTAxXHVCMkM4XHVCMkU0LlwiIH0pO1xuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5nc0dyaWQgPSBzZXR0aW5nc1N0YWdlRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10b29sLWdyaWQgb2xhLXRvb2wtZ3JpZC0tM1wiIH0pO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKHNldHRpbmdzR3JpZCwgdGhpcy50KFwiZ2VuZXJhdG9yTW9kZWxcIikpO1xyXG4gICAgY29uc3QgbW9kZWxTZWxlY3QgPSBtb2RlbEZpZWxkLmNyZWF0ZUVsKFwic2VsZWN0XCIpO1xyXG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiB0aGlzLmdldE1vZGVsT3B0aW9ucygpKSB7XHJcbiAgICAgIG1vZGVsU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IG1vZGVsLCB0ZXh0OiBtb2RlbCB9KTtcclxuICAgIH1cclxuICAgIG1vZGVsU2VsZWN0LnZhbHVlID0gdGhpcy5nZW5lcmF0b3JTdGF0ZS5tb2RlbE5hbWU7XHJcbiAgICBtb2RlbFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIG1vZGVsU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGVsTmFtZSA9IG1vZGVsU2VsZWN0LnZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgdGVtcEZpZWxkID0gdGhpcy5jcmVhdGVGaWVsZChzZXR0aW5nc0dyaWQsIHRoaXMudChcImdlbmVyYXRvclRlbXBlcmF0dXJlXCIpKTtcclxuICAgIGNvbnN0IHRlbXBJbnB1dCA9IHRlbXBGaWVsZC5jcmVhdGVFbChcImlucHV0XCIsIHtcclxuICAgICAgYXR0cjogeyB0eXBlOiBcIm51bWJlclwiLCBtaW46IFwiMFwiLCBtYXg6IFwiMVwiLCBzdGVwOiBcIjAuMVwiIH0sXHJcbiAgICB9KTtcclxuICAgIHRlbXBJbnB1dC52YWx1ZSA9IFN0cmluZyh0aGlzLmdlbmVyYXRvclN0YXRlLnRlbXBlcmF0dXJlKTtcclxuICAgIHRlbXBJbnB1dC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIHRlbXBJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgY29uc3QgbmV4dCA9IE51bWJlci5wYXJzZUZsb2F0KHRlbXBJbnB1dC52YWx1ZSk7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUudGVtcGVyYXR1cmUgPSBOdW1iZXIuaXNGaW5pdGUobmV4dCkgPyBuZXh0IDogMC4xO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgdGFyZ2V0U2V0RmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKHNldHRpbmdzR3JpZCwgdGhpcy50KFwiZ2VuZXJhdG9yVGFyZ2V0U2V0XCIpKTtcclxuICAgIGNvbnN0IHRhcmdldFNldFNlbGVjdCA9IHRhcmdldFNldEZpZWxkLmNyZWF0ZUVsKFwic2VsZWN0XCIpO1xyXG4gICAgdGFyZ2V0U2V0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHtcclxuICAgICAgdmFsdWU6IE1BTlVBTF9UQVJHRVRfU0VULFxyXG4gICAgICB0ZXh0OiB0aGlzLnQoXCJnZW5lcmF0b3JNYW51YWxUYXJnZXRTZXRcIiksXHJcbiAgICB9KTtcclxuICAgIGZvciAoY29uc3QgdGFyZ2V0U2V0TmFtZSBvZiBPYmplY3Qua2V5cyh0aGlzLmdldFRhcmdldFNldHMoKSkpIHtcclxuICAgICAgdGFyZ2V0U2V0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IHRhcmdldFNldE5hbWUsIHRleHQ6IHRhcmdldFNldE5hbWUgfSk7XHJcbiAgICB9XHJcbiAgICB0YXJnZXRTZXRTZWxlY3QudmFsdWUgPSB0aGlzLmdlbmVyYXRvclN0YXRlLnRhcmdldFNldDtcclxuICAgIHRhcmdldFNldFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIHRhcmdldFNldFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgdGhpcy5hcHBseUdlbmVyYXRvclRhcmdldFNldCh0YXJnZXRTZXRTZWxlY3QudmFsdWUpO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlckdlbmVyYXRvclBhbmVsKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBwYXR0ZXJuU2VjdGlvbiA9IHNldHRpbmdzU3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXN1YnNlY3Rpb24tY2FyZCBvbGEtc3Vic2VjdGlvbi1jYXJkLS1uZXN0ZWRcIiB9KTtcclxuICAgIGNvbnN0IHBhdHRlcm5IZWFkZXIgPSBwYXR0ZXJuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXBhdHRlcm4taGVhZGVyXCIgfSk7XHJcbiAgICBjb25zdCBwYXR0ZXJuSGVhZGVyTWV0YSA9IHBhdHRlcm5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1wYXR0ZXJuLWhlYWRlci1tZXRhXCIgfSk7XHJcbiAgICBwYXR0ZXJuSGVhZGVyTWV0YS5jcmVhdGVFbChcInN0cm9uZ1wiLCB7IHRleHQ6IHRoaXMudChcImdlbmVyYXRvclBhdHRlcm5zXCIpIH0pO1xyXG4gICAgcGF0dGVybkhlYWRlck1ldGEuY3JlYXRlU3Bhbih7XHJcbiAgICAgIGNsczogXCJvbGEtZmllbGQtaGVscFwiLFxyXG4gICAgICB0ZXh0OiBgJHtlZmZlY3RpdmVQYXR0ZXJuS2V5cy5sZW5ndGh9LyR7YWxsUGF0dGVybnMubGVuZ3RofWAsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHBhdHRlcm5IZWFkZXJBY3Rpb25zID0gcGF0dGVybkhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXBhdHRlcm4taGVhZGVyLWFjdGlvbnNcIiB9KTtcclxuICAgIGNvbnN0IGNyZWF0ZVBhdHRlcm5CdXR0b24gPSBwYXR0ZXJuSGVhZGVyQWN0aW9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7XHJcbiAgICAgIHRleHQ6IHRoaXMudChcImdlbmVyYXRvckNyZWF0ZVBhdHRlcm5Ob3RlXCIpLFxyXG4gICAgfSk7XHJcbiAgICBjcmVhdGVQYXR0ZXJuQnV0dG9uLmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgY3JlYXRlUGF0dGVybkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMuY3JlYXRlUGF0dGVybk5vdGUoKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcGF0dGVybkhlbHAgPSBwYXR0ZXJuU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWZpZWxkLWhlbHBcIiB9KTtcclxuICAgIHBhdHRlcm5IZWxwLnNldFRleHQodGhpcy5nZW5lcmF0b3JTdGF0ZS50YXJnZXRTZXQgPT09IE1BTlVBTF9UQVJHRVRfU0VUXHJcbiAgICAgID8gdGhpcy50KFwiZ2VuZXJhdG9yTWFudWFsVGFyZ2V0U2V0XCIpXHJcbiAgICAgIDogYCR7dGhpcy50KFwiZ2VuZXJhdG9yVGFyZ2V0U2V0XCIpfTogJHt0aGlzLmdlbmVyYXRvclN0YXRlLnRhcmdldFNldH1gKTtcclxuXHJcbiAgICBjb25zdCBwYXR0ZXJuR3JvdXBMaXN0ID0gcGF0dGVyblNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1wYXR0ZXJuLWdyb3Vwc1wiIH0pO1xyXG4gICAgZm9yIChjb25zdCBbZ3JvdXBOYW1lLCBncm91cGVkUGF0dGVybnNdIG9mIHZpc2libGVQYXR0ZXJuR3JvdXBzKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwRGV0YWlscyA9IHBhdHRlcm5Hcm91cExpc3QuY3JlYXRlRWwoXCJkZXRhaWxzXCIsIHsgY2xzOiBcIm9sYS1wYXR0ZXJuLWdyb3VwXCIgfSk7XHJcbiAgICAgIGlmIChncm91cE5hbWUgPT09IHRoaXMuZ2VuZXJhdG9yU3RhdGUudGFyZ2V0U2V0IHx8IHZpc2libGVQYXR0ZXJuR3JvdXBzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIGdyb3VwRGV0YWlscy5vcGVuID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBncm91cERldGFpbHMuY3JlYXRlRWwoXCJzdW1tYXJ5XCIsIHtcclxuICAgICAgICBjbHM6IFwib2xhLXBhdHRlcm4tZ3JvdXAtc3VtbWFyeVwiLFxyXG4gICAgICAgIHRleHQ6IGAke2dyb3VwTmFtZX0gKCR7Z3JvdXBlZFBhdHRlcm5zLmxlbmd0aH0pYCxcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGdyb3VwQm9keSA9IGdyb3VwRGV0YWlscy5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXBhdHRlcm4tZ3JvdXAtYm9keVwiIH0pO1xyXG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZ3JvdXBlZFBhdHRlcm5zKSB7XHJcbiAgICAgICAgY29uc3QgcHJldmlldyA9IHRoaXMuZ2V0UGF0dGVyblByZXZpZXcocGF0dGVybik7XHJcbiAgICAgICAgY29uc3QgY2FyZEVsID0gZ3JvdXBCb2R5LmNyZWF0ZURpdih7IGNsczogXCJvbGEtcGF0dGVybi1jYXJkXCIgfSk7XHJcbiAgICAgICAgY29uc3QgdG9wUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtcGF0dGVybi1jYXJkLW1haW5cIiB9KTtcclxuICAgICAgICBjb25zdCBzZWxlY3RMYWJlbCA9IHRvcFJvdy5jcmVhdGVFbChcImxhYmVsXCIsIHsgY2xzOiBcIm9sYS1wYXR0ZXJuLXNlbGVjdFwiIH0pO1xyXG4gICAgICAgIGNvbnN0IGNoZWNrYm94ID0gc2VsZWN0TGFiZWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IGF0dHI6IHsgdHlwZTogXCJjaGVja2JveFwiIH0gfSk7XHJcbiAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9IGVmZmVjdGl2ZVBhdHRlcm5LZXlzLmluY2x1ZGVzKHBhdHRlcm4pO1xyXG4gICAgICAgIGNoZWNrYm94LmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS50YXJnZXRTZXQgPSBNQU5VQUxfVEFSR0VUX1NFVDtcclxuICAgICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUucGF0dGVybktleXMgPSBbLi4ubmV3IFNldChbLi4udGhpcy5nZW5lcmF0b3JTdGF0ZS5wYXR0ZXJuS2V5cywgcGF0dGVybl0pXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUucGF0dGVybktleXMgPSB0aGlzLmdlbmVyYXRvclN0YXRlLnBhdHRlcm5LZXlzLmZpbHRlcigodmFsdWUpID0+IHZhbHVlICE9PSBwYXR0ZXJuKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJHZW5lcmF0b3JQYW5lbCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHRleHRFbCA9IHNlbGVjdExhYmVsLmNyZWF0ZVNwYW4oeyBjbHM6IFwib2xhLXBhdHRlcm4tY2FyZC10ZXh0XCIgfSk7XHJcbiAgICAgICAgdGV4dEVsLmNyZWF0ZUVsKFwic3Ryb25nXCIsIHsgdGV4dDogcGF0dGVybiB9KTtcclxuICAgICAgICBpZiAocHJldmlldy5lZGl0b3Jfbm90ZV9wYXRoKSB7XHJcbiAgICAgICAgICB0ZXh0RWwuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwib2xhLWZpZWxkLWhlbHBcIiwgdGV4dDogcHJldmlldy5lZGl0b3Jfbm90ZV9wYXRoIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FyZEFjdGlvbnMgPSB0b3BSb3cuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1wYXR0ZXJuLWNhcmQtYWN0aW9uc1wiIH0pO1xyXG4gICAgICAgIGNvbnN0IG9wZW5Ob3RlQnV0dG9uID0gY2FyZEFjdGlvbnMuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgY2xzOiBcIm9sYS1wYXR0ZXJuLW9wZW4tYnV0dG9uXCIsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLnQoXCJnZW5lcmF0b3JQYXR0ZXJuT3Blbk5vdGVcIiksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3Blbk5vdGVCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICAgICAgb3Blbk5vdGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgdm9pZCB0aGlzLm9wZW5QYXR0ZXJuTm90ZShwYXR0ZXJuKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgYmFkZ2VSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1iYWRnZS1yb3dcIiB9KTtcclxuICAgICAgICBiYWRnZVJvdy5jcmVhdGVTcGFuKHtcclxuICAgICAgICAgIGNsczogYG9sYS1iYWRnZSAke3ByZXZpZXcuc291cmNlID09PSBcIm9ic2lkaWFuXCIgPyBcIm9sYS1iYWRnZS0tY29udGV4dFwiIDogXCJvbGEtYmFkZ2UtLXJhd1wifWAsXHJcbiAgICAgICAgICB0ZXh0OiBwcmV2aWV3LnNvdXJjZSA9PT0gXCJvYnNpZGlhblwiXHJcbiAgICAgICAgICAgID8gdGhpcy50KFwiZ2VuZXJhdG9yUGF0dGVyblNvdXJjZU9ic2lkaWFuXCIpXHJcbiAgICAgICAgICAgIDogdGhpcy50KFwiZ2VuZXJhdG9yUGF0dGVyblNvdXJjZVlhbWxcIiksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHByZXZpZXcub3V0cHV0X3N1ZmZpeCkge1xyXG4gICAgICAgICAgYmFkZ2VSb3cuY3JlYXRlU3Bhbih7XHJcbiAgICAgICAgICAgIGNsczogXCJvbGEtYmFkZ2Ugb2xhLWJhZGdlLS1zY29yZVwiLFxyXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnQoXCJnZW5lcmF0b3JQYXR0ZXJuT3V0cHV0U3VmZml4XCIsIHsgc3VmZml4OiBwcmV2aWV3Lm91dHB1dF9zdWZmaXggfSksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByZXZpZXcudXNlX3N1YmplY3RfcHJlZml4KSB7XHJcbiAgICAgICAgICBiYWRnZVJvdy5jcmVhdGVTcGFuKHtcclxuICAgICAgICAgICAgY2xzOiBcIm9sYS1iYWRnZSBvbGEtYmFkZ2UtLXN1bW1hcnlcIixcclxuICAgICAgICAgICAgdGV4dDogdGhpcy50KFwiZ2VuZXJhdG9yUGF0dGVyblN1YmplY3RQcmVmaXhcIiksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBydW5CdXR0b24gPSBib2R5RWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICBjbHM6IFwibW9kLWN0YSBvbGEtcnVuLWJ1dHRvblwiLFxyXG4gICAgICB0ZXh0OiB0aGlzLnJ1bm5pbmdUYXNrID09PSBcImdlbmVyYXRvclwiXHJcbiAgICAgICAgPyB0aGlzLnQoXCJnZW5lcmF0b3JTdGF0dXNQcm9ncmVzc1wiLCB7IHByb2dyZXNzOiBwcm9ncmVzc1ZhbHVlIH0pXHJcbiAgICAgICAgOiB0aGlzLnQoXCJnZW5lcmF0b3JSdW5cIiksXHJcbiAgICB9KTtcclxuICAgIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIHJ1bkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMucnVuR2VuZXJhdG9yKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBsb2dzU3RhZ2VFbCA9IHRoaXMuY3JlYXRlU2VjdGlvbkRldGFpbHMoXHJcbiAgICAgIGJvZHlFbCxcclxuICAgICAgdGhpcy50KFwiZ2VuZXJhdG9yU2VjdGlvbkxvZ3NcIiksXHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yTG9ncy5sZW5ndGggPiAwIHx8IHRoaXMucnVubmluZ1Rhc2sgPT09IFwiZ2VuZXJhdG9yXCIsXHJcbiAgICApO1xyXG4gICAgdGhpcy5jcmVhdGVMb2dCbG9jayhsb2dzU3RhZ2VFbCwgdGhpcy5nZW5lcmF0b3JMb2dzLnNsaWNlKC0zMCksIHRoaXMudChcImxvZ3NFbXB0eVwiKSk7XHJcbiAgICBpZiAoaGFkRGV0YWlscykge1xyXG4gICAgICB0aGlzLnJlc3RvcmVPcGVuRGV0YWlscyh0aGlzLmdlbmVyYXRvclBhbmVsRWwsIG9wZW5LZXlzKTtcclxuICAgIH1cclxuICAgIGdlbmVyYXRvclNjcm9sbEhvc3Quc2Nyb2xsVG9wID0gcHJldmlvdXNTY3JvbGxUb3A7XHJcbiAgfVxyXG5cclxuICBhc3luYyByZW5kZXJUYWdnZXJQYW5lbCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGhhZERldGFpbHMgPSB0aGlzLnRhZ2dlclBhbmVsRWwucXVlcnlTZWxlY3RvckFsbChcImRldGFpbHNcIikubGVuZ3RoID4gMDtcclxuICAgIGNvbnN0IG9wZW5LZXlzID0gdGhpcy5jYXB0dXJlT3BlbkRldGFpbHModGhpcy50YWdnZXJQYW5lbEVsKTtcclxuICAgIGNvbnN0IHRhZ2dlclNjcm9sbEhvc3QgPSB0aGlzLnRhZ2dlclBhbmVsRWwucGFyZW50RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XHJcbiAgICAgID8gdGhpcy50YWdnZXJQYW5lbEVsLnBhcmVudEVsZW1lbnRcclxuICAgICAgOiB0aGlzLnRhZ2dlclRhYkVsO1xyXG4gICAgY29uc3QgcHJldmlvdXNTY3JvbGxUb3AgPSB0YWdnZXJTY3JvbGxIb3N0Py5zY3JvbGxUb3AgPz8gMDtcclxuICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMudGFnZ2VyU3RhdGUuc3RhdHVzIHx8IHRoaXMudChcInRhZ2dlclN0YXR1c1JlYWR5XCIpO1xyXG4gICAgY29uc3QgYm9keUVsID0gdGhpcy5yZW5kZXJUb29sU3VtbWFyeSh0aGlzLnRhZ2dlclBhbmVsRWwsIHRoaXMudChcInRvb2xUYWdnZXJcIiksIHN0YXR1cyk7XHJcbiAgICBib2R5RWwuY3JlYXRlRWwoXCJwXCIsIHsgY2xzOiBcIm9sYS13b3JrZmxvdy1pbnRyb1wiLCB0ZXh0OiB0aGlzLnQoXCJ0YWdnZXJJbnRyb0luZGV4ZWRcIikgfSk7XHJcbiAgICBjb25zdCBpc0J1c3kgPSBCb29sZWFuKHRoaXMucnVubmluZ1Rhc2spO1xyXG4gICAgY29uc3QgZm9sZGVyT3B0aW9ucyA9IHRoaXMuZ2V0V29ya2Zsb3dGb2xkZXJPcHRpb25zKFt0aGlzLnRhZ2dlclN0YXRlLmlucHV0RGlyXSk7XHJcbiAgICBjb25zdCBlZmZlY3RpdmVJbnB1dERpciA9IHRoaXMuZ2V0RWZmZWN0aXZlVGFnZ2VySW5wdXREaXIoKTtcclxuICAgIGNvbnN0IG1hbmlmZXN0ID0gdGhpcy50b29sQ29uZmlnPy50YWdnZXJfaW5kZXhfbWFuaWZlc3Q7XHJcbiAgICBjb25zdCBtYW5pZmVzdENvdW50cyA9IG1hbmlmZXN0Py5jb3VudHMgPz8ge307XHJcbiAgICBjb25zdCB0YWdnZXJSdWxlcyA9IHRoaXMuZ2V0VGFnZ2VyUnVsZXNDb25maWcoKTtcclxuICAgIGNvbnN0IHRhZ2dlclRocmVzaG9sZHMgPSB0YWdnZXJSdWxlcy50aHJlc2hvbGRzID8/IHt9O1xyXG4gICAgY29uc3Qgc3VtbWFyeUJhciA9IGJvZHlFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWdlbmVyYXRvci1zdW1tYXJ5LWJhclwiIH0pO1xyXG4gICAgW1xyXG4gICAgICBgJHt0aGlzLnQoXCJ0YWdnZXJUYXJnZXRcIil9OiAke3RoaXMudCh0aGlzLnRhZ2dlclN0YXRlLnRhcmdldCA9PT0gXCJzdW1tYXJ5XCJcclxuICAgICAgICA/IFwiY29tbW9uU3VtbWFyeVwiXHJcbiAgICAgICAgOiB0aGlzLnRhZ2dlclN0YXRlLnRhcmdldCA9PT0gXCJyYXdcIlxyXG4gICAgICAgICAgPyBcImNvbW1vblJhd1wiXHJcbiAgICAgICAgICA6IFwiY29tbW9uQm90aFwiKX1gLFxyXG4gICAgICBgJHt0aGlzLnQoXCJ0YWdnZXJNb2RlXCIpfTogJHt0aGlzLnQodGhpcy50YWdnZXJTdGF0ZS5tb2RlID09PSBcInJlc2V0XCIgPyBcImNvbW1vblJlc2V0XCIgOiBcImNvbW1vbkluY3JlbWVudGFsXCIpfWAsXHJcbiAgICAgIGAke3RoaXMudChcInRhZ2dlclJld3JpdGVTY29wZVwiKX06ICR7ZWZmZWN0aXZlSW5wdXREaXIgfHwgdGhpcy50KFwid29ya2Zsb3dWYXVsdFdpZGVcIil9YCxcclxuICAgICAgbWFuaWZlc3QgPyB0aGlzLnQoXCJ0YWdnZXJJbmRleFJlYWR5XCIpIDogdGhpcy50KFwid29ya2Zsb3dzQ29uZmlnTWlzc2luZ1wiKSxcclxuICAgICAgYExvZ3M6ICR7dGhpcy50YWdnZXJMb2dzLmxlbmd0aH1gLFxyXG4gICAgXS5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgIHN1bW1hcnlCYXIuY3JlYXRlU3Bhbih7IGNsczogXCJvbGEtZ2VuZXJhdG9yLXN1bW1hcnktY2hpcFwiLCB0ZXh0IH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKG1hbmlmZXN0KSB7XHJcbiAgICAgIGNvbnN0IGluZGV4U3RhZ2VFbCA9IHRoaXMuY3JlYXRlU2VjdGlvbkRldGFpbHMoYm9keUVsLCB0aGlzLnQoXCJ0YWdnZXJJbmRleFN0YXR1c1wiKSwgZmFsc2UpO1xyXG4gICAgICBjb25zdCBpbmZvR3JpZCA9IGluZGV4U3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tZ3JpZFwiIH0pO1xyXG4gICAgICBjb25zdCBpbmRleFNjb3BlQ2FyZCA9IGluZm9HcmlkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaW5mby1jYXJkXCIgfSk7XHJcbiAgICAgIGluZGV4U2NvcGVDYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm9sYS1pbmZvLWNhcmQtbGFiZWxcIiwgdGV4dDogdGhpcy50KFwidGFnZ2VySW5kZXhTY29wZVwiKSB9KTtcclxuICAgICAgaW5kZXhTY29wZUNhcmQuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwib2xhLWluZm8tY2FyZC12YWx1ZVwiLCB0ZXh0OiBtYW5pZmVzdC5zY29wZSB8fCBcIm9ic2lkaWFuX3ZhdWx0XCIgfSk7XHJcblxyXG4gICAgICBjb25zdCBub3Rlc0NhcmQgPSBpbmZvR3JpZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tY2FyZFwiIH0pO1xyXG4gICAgICBub3Rlc0NhcmQuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwib2xhLWluZm8tY2FyZC1sYWJlbFwiLCB0ZXh0OiB0aGlzLnQoXCJ0YWdnZXJOb3Rlc1wiKSB9KTtcclxuICAgICAgbm90ZXNDYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm9sYS1pbmZvLWNhcmQtdmFsdWVcIiwgdGV4dDogU3RyaW5nKG1hbmlmZXN0Q291bnRzLm5vdGVzID8/IFwiLVwiKSB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGVkZ2VzQ2FyZCA9IGluZm9HcmlkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaW5mby1jYXJkXCIgfSk7XHJcbiAgICAgIGVkZ2VzQ2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLWxhYmVsXCIsIHRleHQ6IHRoaXMudChcInRhZ2dlckdyYXBoRWRnZXNcIikgfSk7XHJcbiAgICAgIGVkZ2VzQ2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLXZhbHVlXCIsIHRleHQ6IFN0cmluZyhtYW5pZmVzdENvdW50cy5ncmFwaF9lZGdlcyA/PyBcIi1cIikgfSk7XHJcblxyXG4gICAgICBjb25zdCB0b2tlbnNDYXJkID0gaW5mb0dyaWQuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1pbmZvLWNhcmRcIiB9KTtcclxuICAgICAgdG9rZW5zQ2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLWxhYmVsXCIsIHRleHQ6IHRoaXMudChcInRhZ2dlclRva2Vuc1wiKSB9KTtcclxuICAgICAgdG9rZW5zQ2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLXZhbHVlXCIsIHRleHQ6IFN0cmluZyhtYW5pZmVzdENvdW50cy50b2tlbnMgPz8gXCItXCIpIH0pO1xyXG5cclxuICAgICAgaWYgKG1hbmlmZXN0Lm1hbmlmZXN0X3BhdGgpIHtcclxuICAgICAgICBjb25zdCBtYW5pZmVzdENhcmQgPSBpbmZvR3JpZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tY2FyZFwiIH0pO1xyXG4gICAgICAgIG1hbmlmZXN0Q2FyZC5hZGRDbGFzcyhcIm9sYS1pbmZvLWNhcmQtLWZ1bGxcIik7XHJcbiAgICAgICAgbWFuaWZlc3RDYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm9sYS1pbmZvLWNhcmQtbGFiZWxcIiwgdGV4dDogdGhpcy50KFwidGFnZ2VyTWFuaWZlc3RQYXRoXCIpIH0pO1xyXG4gICAgICAgIG1hbmlmZXN0Q2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLXZhbHVlXCIsIHRleHQ6IG1hbmlmZXN0Lm1hbmlmZXN0X3BhdGggfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBydWxlc1N0YWdlRWwgPSB0aGlzLmNyZWF0ZVNlY3Rpb25EZXRhaWxzKGJvZHlFbCwgdGhpcy50KFwidGFnZ2VyU2VjdGlvblJ1bGVzXCIpLCBmYWxzZSk7XHJcbiAgICBydWxlc1N0YWdlRWwuY3JlYXRlRWwoXCJwXCIsIHsgY2xzOiBcIm9sYS13b3JrZmxvdy1pbnRyb1wiLCB0ZXh0OiB0aGlzLnQoXCJ0YWdnZXJSdWxlc0hlbHBcIikgfSk7XHJcbiAgICBjb25zdCBydWxlc1N1bW1hcnlCYXIgPSBydWxlc1N0YWdlRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1nZW5lcmF0b3Itc3VtbWFyeS1iYXJcIiB9KTtcclxuICAgIFtcclxuICAgICAgdGhpcy50KFwidGFnZ2VyQ2Fub25pY2FsQ291bnRcIiwgeyBjb3VudDogdGFnZ2VyUnVsZXMuY2Fub25pY2FsX3RhZ19jb3VudCA/PyAwIH0pLFxyXG4gICAgICB0aGlzLnQoXCJ0YWdnZXJTeW5vbnltQ291bnRcIiwgeyBjb3VudDogdGFnZ2VyUnVsZXMuc3lub255bV9lbnRyaWVzID8/IDAgfSksXHJcbiAgICAgIHRoaXMudChcInRhZ2dlclNlbWFudGljTGltaXRcIiwgeyBjb3VudDogdGFnZ2VyVGhyZXNob2xkcy5zZW1hbnRpY190YWdfbGltaXQgPz8gXCItXCIgfSksXHJcbiAgICAgIHRoaXMudChcInRhZ2dlck1pblNjb3JlXCIsIHsgc2NvcmU6IHRhZ2dlclRocmVzaG9sZHMubWluX3Njb3JlID8/IFwiLVwiIH0pLFxyXG4gICAgXS5mb3JFYWNoKCh0ZXh0KSA9PiB7XHJcbiAgICAgIHJ1bGVzU3VtbWFyeUJhci5jcmVhdGVTcGFuKHsgY2xzOiBcIm9sYS1nZW5lcmF0b3Itc3VtbWFyeS1jaGlwXCIsIHRleHQgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBydWxlc0FjdGlvblJvdyA9IHJ1bGVzU3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWlubGluZS1hY3Rpb25zXCIgfSk7XHJcbiAgICBjb25zdCBvcGVuR3VpZGVCdXR0b24gPSBydWxlc0FjdGlvblJvdy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcInRhZ2dlck9wZW5SdWxlc1JlYWRtZVwiKSB9KTtcclxuICAgIG9wZW5HdWlkZUJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIG9wZW5HdWlkZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMub3BlblRhZ2dlcldvcmtzcGFjZU5vdGUoKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3Qgb3BlbkNhbm9uaWNhbEJ1dHRvbiA9IHJ1bGVzQWN0aW9uUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogdGhpcy50KFwidGFnZ2VyT3BlbkNhbm9uaWNhbFRhZ3NcIikgfSk7XHJcbiAgICBvcGVuQ2Fub25pY2FsQnV0dG9uLmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgb3BlbkNhbm9uaWNhbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMub3BlblRhZ2dlclJ1bGVOb3RlKFwiY2Fub25pY2FsXCIpO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBvcGVuU3lub255bUJ1dHRvbiA9IHJ1bGVzQWN0aW9uUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogdGhpcy50KFwidGFnZ2VyT3BlblN5bm9ueW1NYXBcIikgfSk7XHJcbiAgICBvcGVuU3lub255bUJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIG9wZW5TeW5vbnltQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHZvaWQgdGhpcy5vcGVuVGFnZ2VyUnVsZU5vdGUoXCJzeW5vbnltXCIpO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBvcGVuUHJpb3JpdHlCdXR0b24gPSBydWxlc0FjdGlvblJvdy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IHRoaXMudChcInRhZ2dlck9wZW5UYWdnaW5nUHJpb3JpdHlcIikgfSk7XHJcbiAgICBvcGVuUHJpb3JpdHlCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICBvcGVuUHJpb3JpdHlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgdm9pZCB0aGlzLm9wZW5UYWdnZXJSdWxlTm90ZShcInByaW9yaXR5XCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc2V0dGluZ3NTdGFnZUVsID0gdGhpcy5jcmVhdGVTZWN0aW9uRGV0YWlscyhib2R5RWwsIHRoaXMudChcInRhZ2dlclNlY3Rpb25TZXR0aW5nc1wiKSwgdHJ1ZSk7XHJcbiAgICBjb25zdCBncmlkRWwgPSBzZXR0aW5nc1N0YWdlRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10b29sLWdyaWQgb2xhLXRvb2wtZ3JpZC0tMlwiIH0pO1xyXG4gICAgY29uc3QgaW5wdXRGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoZ3JpZEVsLCB0aGlzLnQoXCJnZW5lcmF0b3JJbnB1dERpclwiKSk7XHJcbiAgICBpbnB1dEZpZWxkLmFkZENsYXNzKFwib2xhLWZpZWxkLS1mdWxsXCIpO1xyXG4gICAgY29uc3QgaW5wdXRTZWxlY3QgPSBpbnB1dEZpZWxkLmNyZWF0ZUVsKFwic2VsZWN0XCIpO1xyXG4gICAgaW5wdXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgdGV4dDogdGhpcy50KFwid29ya2Zsb3dWYXVsdFdpZGVcIikgfSk7XHJcbiAgICBmb3IgKGNvbnN0IGZvbGRlclBhdGggb2YgZm9sZGVyT3B0aW9ucy5maWx0ZXIoQm9vbGVhbikpIHtcclxuICAgICAgaW5wdXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogZm9sZGVyUGF0aCwgdGV4dDogZm9sZGVyUGF0aCB8fCBcIi9cIiB9KTtcclxuICAgIH1cclxuICAgIGlucHV0U2VsZWN0LnZhbHVlID0gdGhpcy50YWdnZXJTdGF0ZS5pbnB1dERpcjtcclxuICAgIGlucHV0U2VsZWN0LmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgaW5wdXRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudGFnZ2VyU3RhdGUuaW5wdXREaXIgPSBpbnB1dFNlbGVjdC52YWx1ZTtcclxuICAgICAgdm9pZCB0aGlzLnJlbmRlclRhZ2dlclBhbmVsKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXRGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoZ3JpZEVsLCB0aGlzLnQoXCJ0YWdnZXJUYXJnZXRcIikpO1xyXG4gICAgY29uc3QgdGFyZ2V0U2VsZWN0ID0gdGFyZ2V0RmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XHJcbiAgICB0YXJnZXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJzdW1tYXJ5XCIsIHRleHQ6IHRoaXMudChcImNvbW1vblN1bW1hcnlcIikgfSk7XHJcbiAgICB0YXJnZXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJyYXdcIiwgdGV4dDogdGhpcy50KFwiY29tbW9uUmF3XCIpIH0pO1xyXG4gICAgdGFyZ2V0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiYWxsXCIsIHRleHQ6IHRoaXMudChcImNvbW1vbkJvdGhcIikgfSk7XHJcbiAgICB0YXJnZXRTZWxlY3QudmFsdWUgPSB0aGlzLnRhZ2dlclN0YXRlLnRhcmdldDtcclxuICAgIHRhcmdldFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIHRhcmdldFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgdGhpcy50YWdnZXJTdGF0ZS50YXJnZXQgPSB0YXJnZXRTZWxlY3QudmFsdWUgYXMgVGFnZ2VyU3RhdGVbXCJ0YXJnZXRcIl07XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBtb2RlRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKGdyaWRFbCwgdGhpcy50KFwidGFnZ2VyTW9kZVwiKSk7XHJcbiAgICBjb25zdCBtb2RlU2VsZWN0ID0gbW9kZUZpZWxkLmNyZWF0ZUVsKFwic2VsZWN0XCIpO1xyXG4gICAgbW9kZVNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBcImluY3JlbWVudGFsXCIsIHRleHQ6IHRoaXMudChcImNvbW1vbkluY3JlbWVudGFsXCIpIH0pO1xyXG4gICAgbW9kZVNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBcInJlc2V0XCIsIHRleHQ6IHRoaXMudChcImNvbW1vblJlc2V0XCIpIH0pO1xyXG4gICAgbW9kZVNlbGVjdC52YWx1ZSA9IHRoaXMudGFnZ2VyU3RhdGUubW9kZTtcclxuICAgIG1vZGVTZWxlY3QuZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICBtb2RlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnRhZ2dlclN0YXRlLm1vZGUgPSBtb2RlU2VsZWN0LnZhbHVlIGFzIFRhZ2dlclN0YXRlW1wibW9kZVwiXTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGFjdGlvblJvdyA9IGJvZHlFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWlubGluZS1hY3Rpb25zIG9sYS1pbmxpbmUtYWN0aW9ucy0tcHJpbWFyeVwiIH0pO1xyXG4gICAgY29uc3QgcnVuQnV0dG9uID0gYWN0aW9uUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogdGhpcy50KFwidGFnZ2VyUnVuXCIpIH0pO1xyXG4gICAgcnVuQnV0dG9uLmFkZENsYXNzKFwibW9kLWN0YVwiKTtcclxuICAgIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIHJ1bkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB2b2lkIHRoaXMucnVuVGFnZ2VyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBsb2dzU3RhZ2VFbCA9IHRoaXMuY3JlYXRlU2VjdGlvbkRldGFpbHMoXHJcbiAgICAgIGJvZHlFbCxcclxuICAgICAgdGhpcy50KFwidGFnZ2VyU2VjdGlvbkxvZ3NcIiksXHJcbiAgICAgIHRoaXMudGFnZ2VyTG9ncy5sZW5ndGggPiAwIHx8IHRoaXMucnVubmluZ1Rhc2sgPT09IFwidGFnZ2VyXCIsXHJcbiAgICApO1xyXG4gICAgdGhpcy5jcmVhdGVMb2dCbG9jayhsb2dzU3RhZ2VFbCwgdGhpcy50YWdnZXJMb2dzLnNsaWNlKC0zMCksIHRoaXMudChcImxvZ3NFbXB0eVwiKSk7XHJcbiAgICBpZiAoaGFkRGV0YWlscykge1xyXG4gICAgICB0aGlzLnJlc3RvcmVPcGVuRGV0YWlscyh0aGlzLnRhZ2dlclBhbmVsRWwsIG9wZW5LZXlzKTtcclxuICAgIH1cclxuICAgIHRhZ2dlclNjcm9sbEhvc3Quc2Nyb2xsVG9wID0gcHJldmlvdXNTY3JvbGxUb3A7XHJcbiAgfVxyXG5cclxuICBhc3luYyByZW5kZXJJbmdlc3RQYW5lbCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGhhZERldGFpbHMgPSB0aGlzLmluZ2VzdFBhbmVsRWwucXVlcnlTZWxlY3RvckFsbChcImRldGFpbHNcIikubGVuZ3RoID4gMDtcclxuICAgIGNvbnN0IG9wZW5LZXlzID0gdGhpcy5jYXB0dXJlT3BlbkRldGFpbHModGhpcy5pbmdlc3RQYW5lbEVsKTtcclxuICAgIGNvbnN0IGluZ2VzdFNjcm9sbEhvc3QgPSB0aGlzLmluZ2VzdFBhbmVsRWwucGFyZW50RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XHJcbiAgICAgID8gdGhpcy5pbmdlc3RQYW5lbEVsLnBhcmVudEVsZW1lbnRcclxuICAgICAgOiB0aGlzLmluZ2VzdFRhYkVsO1xyXG4gICAgY29uc3QgcHJldmlvdXNTY3JvbGxUb3AgPSBpbmdlc3RTY3JvbGxIb3N0Py5zY3JvbGxUb3AgPz8gMDtcclxuICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMuaW5nZXN0U3RhdGUuc3RhdHVzIHx8IHRoaXMudChcImluZ2VzdFN0YXR1c1JlYWR5XCIpO1xyXG4gICAgY29uc3QgYm9keUVsID0gdGhpcy5yZW5kZXJUb29sU3VtbWFyeSh0aGlzLmluZ2VzdFBhbmVsRWwsIHRoaXMudChcInRvb2xJbmdlc3RcIiksIHN0YXR1cyk7XHJcbiAgICBib2R5RWwuY3JlYXRlRWwoXCJwXCIsIHsgY2xzOiBcIm9sYS13b3JrZmxvdy1pbnRyb1wiLCB0ZXh0OiB0aGlzLnQoXCJpbmdlc3RJbnRyb1wiKSB9KTtcclxuICAgIGNvbnN0IGlzQnVzeSA9IEJvb2xlYW4odGhpcy5ydW5uaW5nVGFzayk7XHJcbiAgICBjb25zdCBmb2xkZXJPcHRpb25zID0gdGhpcy5nZXRXb3JrZmxvd0ZvbGRlck9wdGlvbnMoW1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLmlucHV0RGlyLFxyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLm91dHB1dERpcixcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpciA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUwgPyBcIlwiIDogdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpcixcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5vdXRwdXREaXIsXHJcbiAgICBdKTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3RlZEpvYiA9IHRoaXMuaW5nZXN0U3RhdGUuam9iID09PSBcImFsbFwiXHJcbiAgICAgID8gbnVsbFxyXG4gICAgICA6IHRoaXMuZ2V0Sm9iTGlzdCgpLmZpbmQoKGpvYikgPT4gam9iLm5hbWUgPT09IHRoaXMuaW5nZXN0U3RhdGUuam9iKSA/PyBudWxsO1xyXG4gICAgY29uc3QgZWZmZWN0aXZlSW5wdXREaXIgPSB0aGlzLmdldEVmZmVjdGl2ZUluZ2VzdElucHV0RGlyKCk7XHJcbiAgICBjb25zdCBlZmZlY3RpdmVPdXRwdXREaXIgPSB0aGlzLmdldEVmZmVjdGl2ZUluZ2VzdE91dHB1dERpcigpO1xyXG5cclxuICAgIGNvbnN0IHN1bW1hcnlCYXIgPSBib2R5RWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1nZW5lcmF0b3Itc3VtbWFyeS1iYXJcIiB9KTtcclxuICAgIFtcclxuICAgICAgYCR7dGhpcy50KFwiaW5nZXN0Sm9iXCIpfTogJHtzZWxlY3RlZEpvYj8ubmFtZSB8fCB0aGlzLnQoXCJpbmdlc3RBbGxKb2JzXCIpfWAsXHJcbiAgICAgIGAke3RoaXMudChcImluZ2VzdExheWVyXCIpfTogJHt0aGlzLnQodGhpcy5pbmdlc3RTdGF0ZS5sYXllciA9PT0gXCJzdW1tYXJ5XCJcclxuICAgICAgICA/IFwiY29tbW9uU3VtbWFyeVwiXHJcbiAgICAgICAgOiB0aGlzLmluZ2VzdFN0YXRlLmxheWVyID09PSBcInJhd1wiXHJcbiAgICAgICAgICA/IFwiY29tbW9uUmF3XCJcclxuICAgICAgICAgIDogXCJjb21tb25Cb3RoXCIpfWAsXHJcbiAgICAgIGAke3RoaXMudChcImluZ2VzdE1vZGVcIil9OiAke3RoaXMudChcclxuICAgICAgICB0aGlzLmluZ2VzdFN0YXRlLm1vZGUgPT09IFwicmVzZXRcIlxyXG4gICAgICAgICAgPyBcImNvbW1vblJlc2V0XCJcclxuICAgICAgICAgIDogdGhpcy5pbmdlc3RTdGF0ZS5tb2RlID09PSBcImNsZWFudXBcIlxyXG4gICAgICAgICAgICA/IFwiY29tbW9uQ2xlYW51cFwiXHJcbiAgICAgICAgICAgIDogXCJjb21tb25JbmNyZW1lbnRhbFwiLFxyXG4gICAgICApfWAsXHJcbiAgICAgIGAke3RoaXMudChcImluZ2VzdFBvbGljeVwiKX06ICR7dGhpcy50KFxyXG4gICAgICAgIHRoaXMuaW5nZXN0U3RhdGUucG9saWN5ID09PSBcImhlYWRpbmdzXCJcclxuICAgICAgICAgID8gXCJjb21tb25IZWFkaW5nc1wiXHJcbiAgICAgICAgICA6IHRoaXMuaW5nZXN0U3RhdGUucG9saWN5ID09PSBcInBhcmFncmFwaFwiXHJcbiAgICAgICAgICAgID8gXCJjb21tb25QYXJhZ3JhcGhcIlxyXG4gICAgICAgICAgICA6IHRoaXMuaW5nZXN0U3RhdGUucG9saWN5ID09PSBcIm1pbmltYWxcIlxyXG4gICAgICAgICAgICAgID8gXCJjb21tb25NaW5pbWFsXCJcclxuICAgICAgICAgICAgICA6IFwiY29tbW9uQXV0b1wiLFxyXG4gICAgICApfWAsXHJcbiAgICAgIGAke3RoaXMudChcImdlbmVyYXRvcklucHV0RGlyXCIpfTogJHtlZmZlY3RpdmVJbnB1dERpciB8fCB0aGlzLnQoXCJ3b3JrZmxvd1VzZUdlbmVyYXRvclNvdXJjZVwiKX1gLFxyXG4gICAgICBgJHt0aGlzLnQoXCJnZW5lcmF0b3JPdXRwdXREaXJcIil9OiAke2VmZmVjdGl2ZU91dHB1dERpciB8fCB0aGlzLnQoXCJ3b3JrZmxvd1VzZUdlbmVyYXRvclNvdXJjZVwiKX1gLFxyXG4gICAgICB0aGlzLnQoXCJnZW5lcmF0b3JTZWxlY3RlZEZpbGVzXCIsIHtcclxuICAgICAgICBjb3VudDogdGhpcy5pbmdlc3RTdGF0ZS5pbnB1dERpciA/IDAgOiB0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMubGVuZ3RoLFxyXG4gICAgICB9KSxcclxuICAgIF0uZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICBzdW1tYXJ5QmFyLmNyZWF0ZVNwYW4oeyBjbHM6IFwib2xhLWdlbmVyYXRvci1zdW1tYXJ5LWNoaXBcIiwgdGV4dCB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHByb2plY3RTdGFnZUVsID0gdGhpcy5jcmVhdGVTZWN0aW9uRGV0YWlscyhib2R5RWwsIHRoaXMudChcImluZ2VzdFNlY3Rpb25Qcm9qZWN0XCIpLCB0cnVlKTtcclxuICAgIGNvbnN0IHByb2plY3RHcmlkID0gcHJvamVjdFN0YWdlRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS10b29sLWdyaWQgb2xhLXRvb2wtZ3JpZC0tMlwiIH0pO1xyXG4gICAgY29uc3Qgam9iRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKHByb2plY3RHcmlkLCB0aGlzLnQoXCJpbmdlc3RKb2JcIikpO1xyXG4gICAgY29uc3Qgam9iU2VsZWN0ID0gam9iRmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XHJcbiAgICBqb2JTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJhbGxcIiwgdGV4dDogdGhpcy50KFwiaW5nZXN0QWxsSm9ic1wiKSB9KTtcclxuICAgIGZvciAoY29uc3Qgam9iIG9mIHRoaXMuZ2V0Sm9iTGlzdCgpKSB7XHJcbiAgICAgIGpvYlNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBqb2IubmFtZSwgdGV4dDogam9iLm5hbWUgfSk7XHJcbiAgICB9XHJcbiAgICBqb2JTZWxlY3QudmFsdWUgPSB0aGlzLmluZ2VzdFN0YXRlLmpvYjtcclxuICAgIGpvYlNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIGpvYlNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5pbmdlc3RTdGF0ZS5qb2IgPSBqb2JTZWxlY3QudmFsdWU7XHJcbiAgICAgIHZvaWQgdGhpcy5yZW5kZXJJbmdlc3RQYW5lbCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5wdXRGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQocHJvamVjdEdyaWQsIHRoaXMudChcImdlbmVyYXRvcklucHV0RGlyXCIpKTtcclxuICAgIGNvbnN0IGlucHV0U2VsZWN0ID0gaW5wdXRGaWVsZC5jcmVhdGVFbChcInNlbGVjdFwiKTtcclxuICAgIGlucHV0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiXCIsIHRleHQ6IHRoaXMudChcIndvcmtmbG93VXNlR2VuZXJhdG9yU291cmNlXCIpIH0pO1xyXG4gICAgZm9yIChjb25zdCBmb2xkZXJQYXRoIG9mIGZvbGRlck9wdGlvbnMuZmlsdGVyKEJvb2xlYW4pKSB7XHJcbiAgICAgIGlucHV0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IGZvbGRlclBhdGgsIHRleHQ6IGZvbGRlclBhdGggfHwgXCIvXCIgfSk7XHJcbiAgICB9XHJcbiAgICBpbnB1dFNlbGVjdC52YWx1ZSA9IHRoaXMuaW5nZXN0U3RhdGUuaW5wdXREaXI7XHJcbiAgICBpbnB1dFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIGlucHV0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLmlucHV0RGlyID0gaW5wdXRTZWxlY3QudmFsdWU7XHJcbiAgICAgIHZvaWQgdGhpcy5yZW5kZXJJbmdlc3RQYW5lbCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0RmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKHByb2plY3RHcmlkLCB0aGlzLnQoXCJnZW5lcmF0b3JPdXRwdXREaXJcIikpO1xyXG4gICAgY29uc3Qgb3V0cHV0U2VsZWN0ID0gb3V0cHV0RmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XHJcbiAgICBvdXRwdXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgdGV4dDogdGhpcy50KFwid29ya2Zsb3dVc2VHZW5lcmF0b3JTb3VyY2VcIikgfSk7XHJcbiAgICBmb3IgKGNvbnN0IGZvbGRlclBhdGggb2YgZm9sZGVyT3B0aW9ucy5maWx0ZXIoQm9vbGVhbikpIHtcclxuICAgICAgb3V0cHV0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IGZvbGRlclBhdGgsIHRleHQ6IGZvbGRlclBhdGggfHwgXCIvXCIgfSk7XHJcbiAgICB9XHJcbiAgICBvdXRwdXRTZWxlY3QudmFsdWUgPSB0aGlzLmluZ2VzdFN0YXRlLm91dHB1dERpcjtcclxuICAgIG91dHB1dFNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIG91dHB1dFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5pbmdlc3RTdGF0ZS5vdXRwdXREaXIgPSBvdXRwdXRTZWxlY3QudmFsdWU7XHJcbiAgICAgIHZvaWQgdGhpcy5yZW5kZXJJbmdlc3RQYW5lbCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5mb0dyaWQgPSBwcm9qZWN0U3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tZ3JpZFwiIH0pO1xyXG4gICAgY29uc3Qgc291cmNlSW5mbyA9IGluZm9HcmlkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaW5mby1jYXJkXCIgfSk7XHJcbiAgICBzb3VyY2VJbmZvLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm9sYS1pbmZvLWNhcmQtbGFiZWxcIiwgdGV4dDogdGhpcy50KFwiaW5nZXN0UmVzb2x2ZWRJbnB1dFwiKSB9KTtcclxuICAgIHNvdXJjZUluZm8uY3JlYXRlRWwoXCJkaXZcIiwge1xyXG4gICAgICBjbHM6IFwib2xhLWluZm8tY2FyZC12YWx1ZVwiLFxyXG4gICAgICB0ZXh0OiBzZWxlY3RlZEpvYj8uaW5wdXRfZGlyX3Jlc29sdmVkIHx8IHNlbGVjdGVkSm9iPy5pbnB1dF9kaXIgfHwgdGhpcy50b29sQ29uZmlnPy5kZWZhdWx0X2lucHV0X2RpciB8fCBcIi1cIixcclxuICAgIH0pO1xyXG4gICAgY29uc3QgdGFyZ2V0SW5mbyA9IGluZm9HcmlkLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaW5mby1jYXJkXCIgfSk7XHJcbiAgICB0YXJnZXRJbmZvLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcIm9sYS1pbmZvLWNhcmQtbGFiZWxcIiwgdGV4dDogdGhpcy50KFwiaW5nZXN0UmVzb2x2ZWRPdXRwdXRcIikgfSk7XHJcbiAgICB0YXJnZXRJbmZvLmNyZWF0ZUVsKFwiZGl2XCIsIHtcclxuICAgICAgY2xzOiBcIm9sYS1pbmZvLWNhcmQtdmFsdWVcIixcclxuICAgICAgdGV4dDogc2VsZWN0ZWRKb2I/Lm91dHB1dF9kaXJfcmVzb2x2ZWQgfHwgc2VsZWN0ZWRKb2I/Lm91dHB1dF9kaXIgfHwgdGhpcy50b29sQ29uZmlnPy5kZWZhdWx0X291dHB1dF9kaXIgfHwgXCItXCIsXHJcbiAgICB9KTtcclxuICAgIGlmIChzZWxlY3RlZEpvYj8uaW5nZXN0Py5jb2xsZWN0aW9uX3JhdyB8fCBzZWxlY3RlZEpvYj8uaW5nZXN0Py5jb2xsZWN0aW9uX3N1bW1hcnkpIHtcclxuICAgICAgY29uc3QgY29sbGVjdGlvbkluZm8gPSBpbmZvR3JpZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tY2FyZFwiIH0pO1xyXG4gICAgICBjb2xsZWN0aW9uSW5mby5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJvbGEtaW5mby1jYXJkLWxhYmVsXCIsIHRleHQ6IHRoaXMudChcImluZ2VzdENvbGxlY3Rpb25SYXdcIikgfSk7XHJcbiAgICAgIGNvbGxlY3Rpb25JbmZvLmNyZWF0ZUVsKFwiZGl2XCIsIHtcclxuICAgICAgICBjbHM6IFwib2xhLWluZm8tY2FyZC12YWx1ZVwiLFxyXG4gICAgICAgIHRleHQ6IHNlbGVjdGVkSm9iLmluZ2VzdD8uY29sbGVjdGlvbl9yYXcgfHwgXCItXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgICBjb25zdCBjb2xsZWN0aW9uU3VtbWFyeUluZm8gPSBpbmZvR3JpZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWluZm8tY2FyZFwiIH0pO1xyXG4gICAgICBjb2xsZWN0aW9uU3VtbWFyeUluZm8uY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwib2xhLWluZm8tY2FyZC1sYWJlbFwiLCB0ZXh0OiB0aGlzLnQoXCJpbmdlc3RDb2xsZWN0aW9uU3VtbWFyeVwiKSB9KTtcclxuICAgICAgY29sbGVjdGlvblN1bW1hcnlJbmZvLmNyZWF0ZUVsKFwiZGl2XCIsIHtcclxuICAgICAgICBjbHM6IFwib2xhLWluZm8tY2FyZC12YWx1ZVwiLFxyXG4gICAgICAgIHRleHQ6IHNlbGVjdGVkSm9iLmluZ2VzdD8uY29sbGVjdGlvbl9zdW1tYXJ5IHx8IFwiLVwiLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5nc1N0YWdlRWwgPSB0aGlzLmNyZWF0ZVNlY3Rpb25EZXRhaWxzKGJvZHlFbCwgdGhpcy50KFwiaW5nZXN0U2VjdGlvblNldHRpbmdzXCIpLCB0cnVlKTtcclxuICAgIGNvbnN0IGdyaWRFbCA9IHNldHRpbmdzU3RhZ2VFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXRvb2wtZ3JpZCBvbGEtdG9vbC1ncmlkLS0yXCIgfSk7XHJcbiAgICBjb25zdCBsYXllckZpZWxkID0gdGhpcy5jcmVhdGVGaWVsZChncmlkRWwsIHRoaXMudChcImluZ2VzdExheWVyXCIpKTtcclxuICAgIGNvbnN0IGxheWVyU2VsZWN0ID0gbGF5ZXJGaWVsZC5jcmVhdGVFbChcInNlbGVjdFwiKTtcclxuICAgIGxheWVyU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwic3VtbWFyeVwiLCB0ZXh0OiB0aGlzLnQoXCJjb21tb25TdW1tYXJ5XCIpIH0pO1xyXG4gICAgbGF5ZXJTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJyYXdcIiwgdGV4dDogdGhpcy50KFwiY29tbW9uUmF3XCIpIH0pO1xyXG4gICAgbGF5ZXJTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJib3RoXCIsIHRleHQ6IHRoaXMudChcImNvbW1vbkJvdGhcIikgfSk7XHJcbiAgICBsYXllclNlbGVjdC52YWx1ZSA9IHRoaXMuaW5nZXN0U3RhdGUubGF5ZXI7XHJcbiAgICBsYXllclNlbGVjdC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIGxheWVyU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLmxheWVyID0gbGF5ZXJTZWxlY3QudmFsdWUgYXMgSW5nZXN0U3RhdGVbXCJsYXllclwiXTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG1vZGVGaWVsZCA9IHRoaXMuY3JlYXRlRmllbGQoZ3JpZEVsLCB0aGlzLnQoXCJpbmdlc3RNb2RlXCIpKTtcclxuICAgIGNvbnN0IG1vZGVTZWxlY3QgPSBtb2RlRmllbGQuY3JlYXRlRWwoXCJzZWxlY3RcIik7XHJcbiAgICBtb2RlU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiaW5jcmVtZW50YWxcIiwgdGV4dDogdGhpcy50KFwiY29tbW9uSW5jcmVtZW50YWxcIikgfSk7XHJcbiAgICBtb2RlU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwicmVzZXRcIiwgdGV4dDogdGhpcy50KFwiY29tbW9uUmVzZXRcIikgfSk7XHJcbiAgICBtb2RlU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiY2xlYW51cFwiLCB0ZXh0OiB0aGlzLnQoXCJjb21tb25DbGVhbnVwXCIpIH0pO1xyXG4gICAgbW9kZVNlbGVjdC52YWx1ZSA9IHRoaXMuaW5nZXN0U3RhdGUubW9kZTtcclxuICAgIG1vZGVTZWxlY3QuZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICBtb2RlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLm1vZGUgPSBtb2RlU2VsZWN0LnZhbHVlIGFzIEluZ2VzdFN0YXRlW1wibW9kZVwiXTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHBvbGljeUZpZWxkID0gdGhpcy5jcmVhdGVGaWVsZChncmlkRWwsIHRoaXMudChcImluZ2VzdFBvbGljeVwiKSk7XHJcbiAgICBjb25zdCBwb2xpY3lTZWxlY3QgPSBwb2xpY3lGaWVsZC5jcmVhdGVFbChcInNlbGVjdFwiKTtcclxuICAgIHBvbGljeVNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBcImF1dG9cIiwgdGV4dDogdGhpcy50KFwiY29tbW9uQXV0b1wiKSB9KTtcclxuICAgIHBvbGljeVNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBcImhlYWRpbmdzXCIsIHRleHQ6IHRoaXMudChcImNvbW1vbkhlYWRpbmdzXCIpIH0pO1xyXG4gICAgcG9saWN5U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdmFsdWU6IFwicGFyYWdyYXBoXCIsIHRleHQ6IHRoaXMudChcImNvbW1vblBhcmFncmFwaFwiKSB9KTtcclxuICAgIHBvbGljeVNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIm1pbmltYWxcIiwgdGV4dDogdGhpcy50KFwiY29tbW9uTWluaW1hbFwiKSB9KTtcclxuICAgIHBvbGljeVNlbGVjdC52YWx1ZSA9IHRoaXMuaW5nZXN0U3RhdGUucG9saWN5O1xyXG4gICAgcG9saWN5U2VsZWN0LmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgcG9saWN5U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLnBvbGljeSA9IHBvbGljeVNlbGVjdC52YWx1ZSBhcyBJbmdlc3RTdGF0ZVtcInBvbGljeVwiXTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNodW5rRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKGdyaWRFbCwgdGhpcy50KFwiaW5nZXN0Q2h1bmtTaXplXCIpKTtcclxuICAgIGNvbnN0IGNodW5rSW5wdXQgPSBjaHVua0ZpZWxkLmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xyXG4gICAgICBhdHRyOiB7IHR5cGU6IFwibnVtYmVyXCIsIG1pbjogXCI1MDBcIiwgbWF4OiBcIjQwMDBcIiwgc3RlcDogXCI1MFwiIH0sXHJcbiAgICB9KTtcclxuICAgIGNodW5rSW5wdXQudmFsdWUgPSBTdHJpbmcodGhpcy5pbmdlc3RTdGF0ZS5jaHVua1NpemUpO1xyXG4gICAgY2h1bmtJbnB1dC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgIGNodW5rSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5leHQgPSBOdW1iZXIucGFyc2VJbnQoY2h1bmtJbnB1dC52YWx1ZSwgMTApO1xyXG4gICAgICB0aGlzLmluZ2VzdFN0YXRlLmNodW5rU2l6ZSA9IE51bWJlci5pc0Zpbml0ZShuZXh0KSA/IG5leHQgOiA4MDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBvdmVybGFwRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKGdyaWRFbCwgdGhpcy50KFwiaW5nZXN0T3ZlcmxhcFwiKSk7XHJcbiAgICBjb25zdCBvdmVybGFwSW5wdXQgPSBvdmVybGFwRmllbGQuY3JlYXRlRWwoXCJpbnB1dFwiLCB7XHJcbiAgICAgIGF0dHI6IHsgdHlwZTogXCJudW1iZXJcIiwgbWluOiBcIjBcIiwgbWF4OiBcIjUwMFwiLCBzdGVwOiBcIjUwXCIgfSxcclxuICAgIH0pO1xyXG4gICAgb3ZlcmxhcElucHV0LnZhbHVlID0gU3RyaW5nKHRoaXMuaW5nZXN0U3RhdGUub3ZlcmxhcCk7XHJcbiAgICBvdmVybGFwSW5wdXQuZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICBvdmVybGFwSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5leHQgPSBOdW1iZXIucGFyc2VJbnQob3ZlcmxhcElucHV0LnZhbHVlLCAxMCk7XHJcbiAgICAgIHRoaXMuaW5nZXN0U3RhdGUub3ZlcmxhcCA9IE51bWJlci5pc0Zpbml0ZShuZXh0KSA/IG5leHQgOiAxMDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBoZWFkaW5nRmllbGQgPSB0aGlzLmNyZWF0ZUZpZWxkKHNldHRpbmdzU3RhZ2VFbCwgdGhpcy50KFwiaW5nZXN0SGVhZGluZ0xldmVsc1wiKSk7XHJcbiAgICBjb25zdCBoZWFkaW5nR3JpZCA9IGhlYWRpbmdGaWVsZC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLWNoZWNrLWdyaWRcIiB9KTtcclxuICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgWzEsIDIsIDMsIDRdKSB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbkVsID0gaGVhZGluZ0dyaWQuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IGNsczogXCJvbGEtY2hlY2stb3B0aW9uXCIgfSk7XHJcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gb3B0aW9uRWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IGF0dHI6IHsgdHlwZTogXCJjaGVja2JveFwiIH0gfSk7XHJcbiAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB0aGlzLmluZ2VzdFN0YXRlLmhlYWRpbmdMZXZlbHMuaW5jbHVkZXMobGV2ZWwpO1xyXG4gICAgICBjaGVja2JveC5kaXNhYmxlZCA9IGlzQnVzeTtcclxuICAgICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGNoZWNrYm94LmNoZWNrZWQpIHtcclxuICAgICAgICAgIHRoaXMuaW5nZXN0U3RhdGUuaGVhZGluZ0xldmVscyA9IFsuLi5uZXcgU2V0KFsuLi50aGlzLmluZ2VzdFN0YXRlLmhlYWRpbmdMZXZlbHMsIGxldmVsXSldLnNvcnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5pbmdlc3RTdGF0ZS5oZWFkaW5nTGV2ZWxzID0gdGhpcy5pbmdlc3RTdGF0ZS5oZWFkaW5nTGV2ZWxzLmZpbHRlcigodmFsdWUpID0+IHZhbHVlICE9PSBsZXZlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgb3B0aW9uRWwuY3JlYXRlU3Bhbih7IHRleHQ6IGBIJHtsZXZlbH1gIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvZGVBdHRhY2hMYWJlbCA9IHNldHRpbmdzU3RhZ2VFbC5jcmVhdGVFbChcImxhYmVsXCIsIHsgY2xzOiBcIm9sYS1jaGVjay1vcHRpb25cIiB9KTtcclxuICAgIGNvbnN0IGNvZGVBdHRhY2ggPSBjb2RlQXR0YWNoTGFiZWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IGF0dHI6IHsgdHlwZTogXCJjaGVja2JveFwiIH0gfSk7XHJcbiAgICBjb2RlQXR0YWNoLmNoZWNrZWQgPSB0aGlzLmluZ2VzdFN0YXRlLmNvZGVBdHRhY2g7XHJcbiAgICBjb2RlQXR0YWNoLmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgY29kZUF0dGFjaC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgdGhpcy5pbmdlc3RTdGF0ZS5jb2RlQXR0YWNoID0gY29kZUF0dGFjaC5jaGVja2VkO1xyXG4gICAgfSk7XHJcbiAgICBjb2RlQXR0YWNoTGFiZWwuY3JlYXRlU3Bhbih7IHRleHQ6IHRoaXMudChcImluZ2VzdENvZGVBdHRhY2hcIikgfSk7XHJcblxyXG4gICAgY29uc3QgYWN0aW9uUm93ID0gYm9keUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtaW5saW5lLWFjdGlvbnMgb2xhLWlubGluZS1hY3Rpb25zLS1wcmltYXJ5XCIgfSk7XHJcbiAgICBjb25zdCBydW5CdXR0b24gPSBhY3Rpb25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiB0aGlzLnQoXCJpbmdlc3RSdW5cIikgfSk7XHJcbiAgICBydW5CdXR0b24uYWRkQ2xhc3MoXCJtb2QtY3RhXCIpO1xyXG4gICAgcnVuQnV0dG9uLmRpc2FibGVkID0gaXNCdXN5O1xyXG4gICAgcnVuQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHZvaWQgdGhpcy5ydW5Jbmdlc3QoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGxvZ3NTdGFnZUVsID0gdGhpcy5jcmVhdGVTZWN0aW9uRGV0YWlscyhcclxuICAgICAgYm9keUVsLFxyXG4gICAgICB0aGlzLnQoXCJpbmdlc3RTZWN0aW9uTG9nc1wiKSxcclxuICAgICAgdGhpcy5pbmdlc3RMb2dzLmxlbmd0aCA+IDAgfHwgdGhpcy5ydW5uaW5nVGFzayA9PT0gXCJpbmdlc3RcIixcclxuICAgICk7XHJcbiAgICB0aGlzLmNyZWF0ZUxvZ0Jsb2NrKGxvZ3NTdGFnZUVsLCB0aGlzLmluZ2VzdExvZ3Muc2xpY2UoLTMwKSwgdGhpcy50KFwibG9nc0VtcHR5XCIpKTtcclxuICAgIGlmIChoYWREZXRhaWxzKSB7XHJcbiAgICAgIHRoaXMucmVzdG9yZU9wZW5EZXRhaWxzKHRoaXMuaW5nZXN0UGFuZWxFbCwgb3BlbktleXMpO1xyXG4gICAgfVxyXG4gICAgaW5nZXN0U2Nyb2xsSG9zdC5zY3JvbGxUb3AgPSBwcmV2aW91c1Njcm9sbFRvcDtcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlbmRlcldvcmtmbG93TG9nc1BhbmVsKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgaGFkRGV0YWlscyA9IHRoaXMud29ya2Zsb3dMb2dzUGFuZWxFbC5xdWVyeVNlbGVjdG9yQWxsKFwiZGV0YWlsc1wiKS5sZW5ndGggPiAwO1xyXG4gICAgY29uc3Qgb3BlbktleXMgPSB0aGlzLmNhcHR1cmVPcGVuRGV0YWlscyh0aGlzLndvcmtmbG93TG9nc1BhbmVsRWwpO1xyXG4gICAgY29uc3QgYm9keUVsID0gdGhpcy5yZW5kZXJUb29sU3VtbWFyeShcclxuICAgICAgdGhpcy53b3JrZmxvd0xvZ3NQYW5lbEVsLFxyXG4gICAgICB0aGlzLnQoXCJsb2dzVGl0bGVcIiwgeyBjb3VudDogdGhpcy53b3JrZmxvd0xvZ3MubGVuZ3RoIH0pLFxyXG4gICAgICB0aGlzLnJ1bm5pbmdUYXNrID8gdGhpcy50KFwid29ya2Zsb3dzQnVzeVwiLCB7IHRvb2w6IHRoaXMuZ2V0VG9vbExhYmVsKHRoaXMucnVubmluZ1Rhc2spIH0pIDogdGhpcy50KFwic3RhdHVzSWRsZVwiKSxcclxuICAgICk7XHJcbiAgICBjb25zdCBzdW1tYXJ5QmFyID0gYm9keUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZ2VuZXJhdG9yLXN1bW1hcnktYmFyXCIgfSk7XHJcbiAgICBbXHJcbiAgICAgIGBUb3RhbDogJHt0aGlzLndvcmtmbG93TG9ncy5sZW5ndGh9YCxcclxuICAgICAgYEdlbmVyYXRvcjogJHt0aGlzLndvcmtmbG93TG9ncy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS50b29sID09PSBcImdlbmVyYXRvclwiKS5sZW5ndGh9YCxcclxuICAgICAgYFRhZ2dlcjogJHt0aGlzLndvcmtmbG93TG9ncy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS50b29sID09PSBcInRhZ2dlclwiKS5sZW5ndGh9YCxcclxuICAgICAgYEluZ2VzdDogJHt0aGlzLndvcmtmbG93TG9ncy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS50b29sID09PSBcImluZ2VzdFwiKS5sZW5ndGh9YCxcclxuICAgIF0uZm9yRWFjaCgodGV4dCkgPT4ge1xyXG4gICAgICBzdW1tYXJ5QmFyLmNyZWF0ZVNwYW4oeyBjbHM6IFwib2xhLWdlbmVyYXRvci1zdW1tYXJ5LWNoaXBcIiwgdGV4dCB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGxvZ3NTdGFnZUVsID0gdGhpcy5jcmVhdGVTZWN0aW9uRGV0YWlscyhcclxuICAgICAgYm9keUVsLFxyXG4gICAgICB0aGlzLnQoXCJ0b29sTG9nc1wiKSxcclxuICAgICAgdHJ1ZSxcclxuICAgICAgKHN1bW1hcnlBY3Rpb25zRWwpID0+IHtcclxuICAgICAgICBjb25zdCBjbGVhckJ1dHRvbiA9IHN1bW1hcnlBY3Rpb25zRWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgY2xzOiBcIm9sYS1nZW5lcmF0b3Itc2V0dGluZ3MtcmVsb2FkXCIsXHJcbiAgICAgICAgICB0ZXh0OiB0aGlzLnQoXCJsb2dzQ2xlYXJcIiksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgdGhpcy53b3JrZmxvd0xvZ3MgPSBbXTtcclxuICAgICAgICAgIHZvaWQgdGhpcy5yZW5kZXJXb3JrZmxvd0xvZ3NQYW5lbCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy53b3JrZmxvd0xvZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGxvZ3NTdGFnZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtZmllbGQtaGVscFwiLCB0ZXh0OiB0aGlzLnQoXCJsb2dzRW1wdHlcIikgfSk7XHJcbiAgICAgIGlmIChoYWREZXRhaWxzKSB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlT3BlbkRldGFpbHModGhpcy53b3JrZmxvd0xvZ3NQYW5lbEVsLCBvcGVuS2V5cyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3RFbCA9IGxvZ3NTdGFnZUVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtd29ya2Zsb3ctbG9nLWxpc3RcIiB9KTtcclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy53b3JrZmxvd0xvZ3Muc2xpY2UoMCwgNjApKSB7XHJcbiAgICAgIGNvbnN0IGl0ZW1FbCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXdvcmtmbG93LWxvZy1pdGVtXCIgfSk7XHJcbiAgICAgIGl0ZW1FbC5jcmVhdGVTcGFuKHtcclxuICAgICAgICBjbHM6IFwib2xhLWJhZGdlIG9sYS1iYWRnZS0tc2NvcmVcIixcclxuICAgICAgICB0ZXh0OiBgJHtlbnRyeS50aW1lc3RhbXB9ICR7dGhpcy5nZXRUb29sTGFiZWwoZW50cnkudG9vbCl9YCxcclxuICAgICAgfSk7XHJcbiAgICAgIGl0ZW1FbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXdvcmtmbG93LWxvZy10ZXh0XCIsIHRleHQ6IGVudHJ5Lm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoaGFkRGV0YWlscykge1xyXG4gICAgICB0aGlzLnJlc3RvcmVPcGVuRGV0YWlscyh0aGlzLndvcmtmbG93TG9nc1BhbmVsRWwsIG9wZW5LZXlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJ1bkdlbmVyYXRvcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGVmZmVjdGl2ZVBhdHRlcm5LZXlzID0gdGhpcy5nZXRFZmZlY3RpdmVHZW5lcmF0b3JQYXR0ZXJuS2V5cygpO1xyXG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2spIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUb29sQnVzeVwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdlbmVyYXRvclN0YXRlLmlucHV0RGlyID09IG51bGwpIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VOb0lucHV0RGlyXCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZ2VuZXJhdG9yU3RhdGUub3V0cHV0RGlyID09IG51bGwpIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VOb091dHB1dERpclwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdlbmVyYXRvclN0YXRlLmpvYk5hbWUgPT09IE1BTlVBTF9KT0IgJiYgZWZmZWN0aXZlUGF0dGVybktleXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlTm9QYXR0ZXJuc1wiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdlbmVyYXRvclN0YXRlLnNlbGVjdGVkRmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlTm9TZWxlY3RlZEZpbGVzXCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5yZWZyZXNoQmFja2VuZFN0YXRlKCkpKSB7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQmFja2VuZFVuYXZhaWxhYmxlXCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHRoaXMucGx1Z2luLmVuc3VyZUZvbGRlcih0aGlzLmdlbmVyYXRvclN0YXRlLm91dHB1dERpcik7XHJcbiAgICBjb25zdCBhYnNvbHV0ZUlucHV0RGlyID0gdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0Rm9sZGVyUGF0aChcclxuICAgICAgdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpciA9PT0gR0VORVJBVE9SX1JPT1RfU0VOVElORUwgPyBcIlwiIDogdGhpcy5nZW5lcmF0b3JTdGF0ZS5pbnB1dERpcixcclxuICAgICk7XHJcbiAgICBjb25zdCBhYnNvbHV0ZU91dHB1dERpciA9IHRoaXMucGx1Z2luLnJlc29sdmVWYXVsdEZvbGRlclBhdGgodGhpcy5nZW5lcmF0b3JTdGF0ZS5vdXRwdXREaXIpO1xyXG5cclxuICAgIHRoaXMuYWJvcnRBY3RpdmVSZXF1ZXN0KCk7XHJcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICAgIHRoaXMucnVubmluZ1Rhc2sgPSBcImdlbmVyYXRvclwiO1xyXG4gICAgdGhpcy5zZXRBY3RpdmVUYWIoXCJnZW5lcmF0b3JcIik7XHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnN0YXR1cyA9IHRoaXMudChcImdlbmVyYXRvclN0YXR1c1J1bm5pbmdcIik7XHJcbiAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnByb2dyZXNzID0gMDtcclxuICAgIHRoaXMuZ2VuZXJhdG9yTG9ncyA9IFtdO1xyXG4gICAgdGhpcy5hcHBseUJ1c3lTdGF0ZSgpO1xyXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJXb3JrZmxvd1BhbmVscygpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RyZWFtTmRqc29uKFxyXG4gICAgICAgIFwiL2FwaS90b29scy9nZW5lcmF0b3Ivc3RyZWFtXCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgam9iX25hbWU6IHRoaXMuZ2VuZXJhdG9yU3RhdGUuam9iTmFtZSA9PT0gTUFOVUFMX0pPQiA/IFwiXCIgOiB0aGlzLmdlbmVyYXRvclN0YXRlLmpvYk5hbWUsXHJcbiAgICAgICAgICBpbnB1dF9kaXI6IGFic29sdXRlSW5wdXREaXIsXHJcbiAgICAgICAgICBvdXRwdXRfZGlyOiBhYnNvbHV0ZU91dHB1dERpcixcclxuICAgICAgICAgIHN1YmplY3Q6IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc3ViamVjdCxcclxuICAgICAgICAgIHBhdHRlcm5fa2V5czogZWZmZWN0aXZlUGF0dGVybktleXMsXHJcbiAgICAgICAgICBtb2RlbF9uYW1lOiB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGVsTmFtZSxcclxuICAgICAgICAgIHRlbXA6IHRoaXMuZ2VuZXJhdG9yU3RhdGUudGVtcGVyYXR1cmUsXHJcbiAgICAgICAgICBzZWxlY3RlZF9maWxlczogdGhpcy5nZW5lcmF0b3JTdGF0ZS5zZWxlY3RlZEZpbGVzLFxyXG4gICAgICAgICAgZ2VuZXJhdGlvbl9tb2RlOiB0aGlzLmdlbmVyYXRvclN0YXRlLm1vZGUsXHJcbiAgICAgICAgICByZWJ1aWxkX3RpdGxlOiB0aGlzLmdlbmVyYXRvclN0YXRlLnJlYnVpbGRUaXRsZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzeW5jIChjaHVuaykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGNodW5rIGFzIFRvb2xTdHJlYW1DaHVuaztcclxuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YS5wcm9ncmVzcyA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnByb2dyZXNzID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBkYXRhLnByb2dyZXNzKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEubWVzc2FnZSA9PT0gXCJzdHJpbmdcIiAmJiBkYXRhLm1lc3NhZ2UudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yTG9ncy5wdXNoKGRhdGEubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdG9yTG9ncyA9IHRoaXMuZ2VuZXJhdG9yTG9ncy5zbGljZSgtODApO1xyXG4gICAgICAgICAgICB0aGlzLnJlY29yZFdvcmtmbG93TG9nKFwiZ2VuZXJhdG9yXCIsIGRhdGEubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVuZGVyR2VuZXJhdG9yUGFuZWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnN0YXR1cyA9IHRoaXMudChcInN0YXR1c0RvbmVcIik7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yU3RhdGUucHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xyXG4gICAgICB0aGlzLmdlbmVyYXRvclN0YXRlLnN0YXR1cyA9IHRoaXMudChcInN0YXR1c0Vycm9yXCIpO1xyXG4gICAgICB0aGlzLmdlbmVyYXRvckxvZ3MucHVzaChgW2Vycm9yXSAke21lc3NhZ2V9YCk7XHJcbiAgICAgIHRoaXMucmVjb3JkV29ya2Zsb3dMb2coXCJnZW5lcmF0b3JcIiwgYFtlcnJvcl0gJHttZXNzYWdlfWApO1xyXG4gICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZUxvY2FsQWdlbnRFcnJvclwiLCB7IG1lc3NhZ2UgfSkpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5ydW5uaW5nVGFzayA9IG51bGw7XHJcbiAgICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJXb3JrZmxvd1BhbmVscygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcnVuVGFnZ2VyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHRoaXMucnVubmluZ1Rhc2spIHtcclxuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VUb29sQnVzeVwiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFib3J0QWN0aXZlUmVxdWVzdCgpO1xyXG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XHJcbiAgICB0aGlzLnJ1bm5pbmdUYXNrID0gXCJ0YWdnZXJcIjtcclxuICAgIHRoaXMuc2V0QWN0aXZlVGFiKFwidGFnZ2VyXCIpO1xyXG4gICAgdGhpcy50YWdnZXJTdGF0ZS5zdGF0dXMgPSB0aGlzLnQoXCJ0YWdnZXJTdGF0dXNSdW5uaW5nXCIpO1xyXG4gICAgdGhpcy50YWdnZXJMb2dzID0gW107XHJcbiAgICB0aGlzLmFwcGx5QnVzeVN0YXRlKCk7XHJcbiAgICBhd2FpdCB0aGlzLnJlbmRlcldvcmtmbG93UGFuZWxzKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZWZmZWN0aXZlSW5wdXREaXIgPSB0aGlzLmdldEVmZmVjdGl2ZVRhZ2dlcklucHV0RGlyKCk7XHJcbiAgICAgIGNvbnN0IGFic29sdXRlSW5wdXREaXIgPSBlZmZlY3RpdmVJbnB1dERpclxyXG4gICAgICAgID8gdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0Rm9sZGVyUGF0aChlZmZlY3RpdmVJbnB1dERpcilcclxuICAgICAgICA6IFwiXCI7XHJcbiAgICAgIGF3YWl0IHRoaXMuc3RyZWFtTmRqc29uKFxyXG4gICAgICAgIFwiL2FwaS90b29scy90YWdnZXIvc3RyZWFtXCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhZ2dlclN0YXRlLnRhcmdldCxcclxuICAgICAgICAgIG1vZGU6IHRoaXMudGFnZ2VyU3RhdGUubW9kZSxcclxuICAgICAgICAgIGlucHV0X2RpcjogYWJzb2x1dGVJbnB1dERpcixcclxuICAgICAgICAgIHNlbGVjdGVkX2ZpbGVzOiBbXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzeW5jIChjaHVuaykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGNodW5rIGFzIFRvb2xTdHJlYW1DaHVuaztcclxuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YS5tZXNzYWdlID09PSBcInN0cmluZ1wiICYmIGRhdGEubWVzc2FnZS50cmltKCkpIHtcclxuICAgICAgICAgICAgdGhpcy50YWdnZXJMb2dzLnB1c2goZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgdGhpcy50YWdnZXJMb2dzID0gdGhpcy50YWdnZXJMb2dzLnNsaWNlKC04MCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVjb3JkV29ya2Zsb3dMb2coXCJ0YWdnZXJcIiwgZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJUYWdnZXJQYW5lbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMudGFnZ2VyU3RhdGUuc3RhdHVzID0gdGhpcy50KFwic3RhdHVzRG9uZVwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgIHRoaXMudGFnZ2VyU3RhdGUuc3RhdHVzID0gdGhpcy50KFwic3RhdHVzRXJyb3JcIik7XHJcbiAgICAgIHRoaXMudGFnZ2VyTG9ncy5wdXNoKGBbZXJyb3JdICR7bWVzc2FnZX1gKTtcclxuICAgICAgdGhpcy5yZWNvcmRXb3JrZmxvd0xvZyhcInRhZ2dlclwiLCBgW2Vycm9yXSAke21lc3NhZ2V9YCk7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlTG9jYWxBZ2VudEVycm9yXCIsIHsgbWVzc2FnZSB9KSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLnJ1bm5pbmdUYXNrID0gbnVsbDtcclxuICAgICAgdGhpcy5hcHBseUJ1c3lTdGF0ZSgpO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcldvcmtmbG93UGFuZWxzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBydW5Jbmdlc3QoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAodGhpcy5ydW5uaW5nVGFzaykge1xyXG4gICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZVRvb2xCdXN5XCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWJvcnRBY3RpdmVSZXF1ZXN0KCk7XHJcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICAgIHRoaXMucnVubmluZ1Rhc2sgPSBcImluZ2VzdFwiO1xyXG4gICAgdGhpcy5zZXRBY3RpdmVUYWIoXCJpbmdlc3RcIik7XHJcbiAgICB0aGlzLmluZ2VzdFN0YXRlLnN0YXR1cyA9IHRoaXMudChcImluZ2VzdFN0YXR1c1J1bm5pbmdcIik7XHJcbiAgICB0aGlzLmluZ2VzdExvZ3MgPSBbXTtcclxuICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICAgIGF3YWl0IHRoaXMucmVuZGVyV29ya2Zsb3dQYW5lbHMoKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBlZmZlY3RpdmVJbnB1dERpciA9IHRoaXMuZ2V0RWZmZWN0aXZlSW5nZXN0SW5wdXREaXIoKTtcclxuICAgICAgY29uc3QgZWZmZWN0aXZlT3V0cHV0RGlyID0gdGhpcy5nZXRFZmZlY3RpdmVJbmdlc3RPdXRwdXREaXIoKTtcclxuICAgICAgY29uc3QgYWJzb2x1dGVJbnB1dERpciA9IGVmZmVjdGl2ZUlucHV0RGlyXHJcbiAgICAgICAgPyB0aGlzLnBsdWdpbi5yZXNvbHZlVmF1bHRGb2xkZXJQYXRoKGVmZmVjdGl2ZUlucHV0RGlyKVxyXG4gICAgICAgIDogXCJcIjtcclxuICAgICAgY29uc3QgYWJzb2x1dGVPdXRwdXREaXIgPSBlZmZlY3RpdmVPdXRwdXREaXJcclxuICAgICAgICA/IHRoaXMucGx1Z2luLnJlc29sdmVWYXVsdEZvbGRlclBhdGgoZWZmZWN0aXZlT3V0cHV0RGlyKVxyXG4gICAgICAgIDogXCJcIjtcclxuICAgICAgYXdhaXQgdGhpcy5zdHJlYW1OZGpzb24oXHJcbiAgICAgICAgXCIvYXBpL3Rvb2xzL2luZ2VzdC9zdHJlYW1cIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICBqb2I6IHRoaXMuaW5nZXN0U3RhdGUuam9iLFxyXG4gICAgICAgICAgbGF5ZXI6IHRoaXMuaW5nZXN0U3RhdGUubGF5ZXIsXHJcbiAgICAgICAgICBtb2RlOiB0aGlzLmluZ2VzdFN0YXRlLm1vZGUsXHJcbiAgICAgICAgICBwb2xpY3k6IHRoaXMuaW5nZXN0U3RhdGUucG9saWN5LFxyXG4gICAgICAgICAgY2h1bmtfc2l6ZTogdGhpcy5pbmdlc3RTdGF0ZS5jaHVua1NpemUsXHJcbiAgICAgICAgICBvdmVybGFwOiB0aGlzLmluZ2VzdFN0YXRlLm92ZXJsYXAsXHJcbiAgICAgICAgICBoZWFkaW5nX2xldmVsczogdGhpcy5pbmdlc3RTdGF0ZS5oZWFkaW5nTGV2ZWxzLFxyXG4gICAgICAgICAgY29kZV9hdHRhY2g6IHRoaXMuaW5nZXN0U3RhdGUuY29kZUF0dGFjaCxcclxuICAgICAgICAgIGlucHV0X2RpcjogYWJzb2x1dGVJbnB1dERpcixcclxuICAgICAgICAgIG91dHB1dF9kaXI6IGFic29sdXRlT3V0cHV0RGlyLFxyXG4gICAgICAgICAgc2VsZWN0ZWRfZmlsZXM6IHRoaXMuaW5nZXN0U3RhdGUuaW5wdXREaXIgPyBbXSA6IHRoaXMuZ2VuZXJhdG9yU3RhdGUuc2VsZWN0ZWRGaWxlcyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzeW5jIChjaHVuaykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGNodW5rIGFzIFRvb2xTdHJlYW1DaHVuaztcclxuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YS5tZXNzYWdlID09PSBcInN0cmluZ1wiICYmIGRhdGEubWVzc2FnZS50cmltKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmdlc3RMb2dzLnB1c2goZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgdGhpcy5pbmdlc3RMb2dzID0gdGhpcy5pbmdlc3RMb2dzLnNsaWNlKC04MCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVjb3JkV29ya2Zsb3dMb2coXCJpbmdlc3RcIiwgZGF0YS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJJbmdlc3RQYW5lbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuaW5nZXN0U3RhdGUuc3RhdHVzID0gdGhpcy50KFwic3RhdHVzRG9uZVwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgIHRoaXMuaW5nZXN0U3RhdGUuc3RhdHVzID0gdGhpcy50KFwic3RhdHVzRXJyb3JcIik7XHJcbiAgICAgIHRoaXMuaW5nZXN0TG9ncy5wdXNoKGBbZXJyb3JdICR7bWVzc2FnZX1gKTtcclxuICAgICAgdGhpcy5yZWNvcmRXb3JrZmxvd0xvZyhcImluZ2VzdFwiLCBgW2Vycm9yXSAke21lc3NhZ2V9YCk7XHJcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlTG9jYWxBZ2VudEVycm9yXCIsIHsgbWVzc2FnZSB9KSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICB0aGlzLnJ1bm5pbmdUYXNrID0gbnVsbDtcclxuICAgICAgdGhpcy5hcHBseUJ1c3lTdGF0ZSgpO1xyXG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcldvcmtmbG93UGFuZWxzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyByZW5kZXJTZW50Q29udGV4dFBhbmVsKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdGhpcy5zZW50Q29udGV4dERldGFpbHNFbC5lbXB0eSgpO1xyXG4gICAgdGhpcy5zZW50Q29udGV4dERldGFpbHNFbC5vcGVuID0gZmFsc2U7XHJcbiAgICBjb25zdCBzdW1tYXJ5RWwgPSB0aGlzLnNlbnRDb250ZXh0RGV0YWlsc0VsLmNyZWF0ZUVsKFwic3VtbWFyeVwiLCB7XHJcbiAgICAgIHRleHQ6IHRoaXMudChcInBhbmVsU2VudENvbnRleHRcIiwgeyBjb3VudDogdGhpcy5jdXJyZW50Q29udGV4dEVudHJpZXMubGVuZ3RoIH0pLFxyXG4gICAgfSk7XHJcbiAgICBzdW1tYXJ5RWwuYWRkQ2xhc3MoXCJvbGEtbWV0YS1zdW1tYXJ5XCIpO1xyXG5cclxuICAgIGNvbnN0IGJvZHlFbCA9IHRoaXMuc2VudENvbnRleHREZXRhaWxzRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLWJvZHlcIiB9KTtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRDb250ZXh0RW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgYm9keUVsLnNldFRleHQodGhpcy50KFwicGFuZWxOb1NlbnRDb250ZXh0XCIpKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhcmRzID0gdGhpcy5jdXJyZW50Q29udGV4dEVudHJpZXMubWFwPFNvdXJjZUNhcmREYXRhPigoZW50cnkpID0+ICh7XG4gICAgICBsYWJlbDogZW50cnkubmFtZSxcbiAgICAgIHBhdGg6IGVudHJ5LnBhdGgsXG4gICAgICBiYWRnZTogdGhpcy5wbHVnaW4uZ2V0Q29udGV4dFNvdXJjZUxhYmVsKGVudHJ5LnNvdXJjZSksXG4gICAgICBiYWRnZUNsYXNzOiBcIm9sYS1iYWRnZS0tY29udGV4dFwiLFxuICAgICAgc25pcHBldDogdGhpcy5idWlsZFNuaXBwZXRQcmV2aWV3KGVudHJ5LmNvbnRlbnQpLFxuICAgICAgcmVhc29uOiBgJHt0aGlzLnQoXCJkZWJ1Z1NlbGVjdGVkQnlcIil9OiAke3RoaXMucGx1Z2luLmdldENvbnRleHRTb3VyY2VMYWJlbChlbnRyeS5zb3VyY2UpfWAsXG4gICAgICBoaW50OiBlbnRyeS5wYXRoLFxuICAgIH0pKTtcbiAgICB0aGlzLnJlbmRlclNvdXJjZUNhcmRzKGJvZHlFbCwgY2FyZHMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVuZGVyU291cmNlUGFuZWwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zb3VyY2VEZXRhaWxzRWwuZW1wdHkoKTtcbiAgICB0aGlzLnNvdXJjZURldGFpbHNFbC5vcGVuID0gZmFsc2U7XG4gICAgY29uc3Qgc3VtbWFyeUVsID0gdGhpcy5zb3VyY2VEZXRhaWxzRWwuY3JlYXRlRWwoXCJzdW1tYXJ5XCIsIHtcbiAgICAgIHRleHQ6IHRoaXMudChcInBhbmVsUmV0cmlldmVkU291cmNlc1wiLCB7IGNvdW50OiB0aGlzLmJhY2tlbmRTb3VyY2VzLmxlbmd0aCB9KSxcbiAgICB9KTtcclxuICAgIHN1bW1hcnlFbC5hZGRDbGFzcyhcIm9sYS1tZXRhLXN1bW1hcnlcIik7XHJcblxyXG4gICAgY29uc3QgYm9keUVsID0gdGhpcy5zb3VyY2VEZXRhaWxzRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLWJvZHlcIiB9KTtcclxuICAgIGlmICh0aGlzLmJhY2tlbmRTb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBib2R5RWwuc2V0VGV4dCh0aGlzLnQoXCJwYW5lbE5vUmV0cmlldmVkU291cmNlc1wiKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYXJkcyA9IHRoaXMuYmFja2VuZFNvdXJjZXMubWFwPFNvdXJjZUNhcmREYXRhPigoc291cmNlKSA9PiAoe1xyXG4gICAgICBsYWJlbDogdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0RmlsZShzb3VyY2UucGF0aCk/LmJhc2VuYW1lIHx8IHNvdXJjZS5uYW1lIHx8IHNvdXJjZS5wYXRoLFxyXG4gICAgICBwYXRoOiBzb3VyY2UucGF0aCxcclxuICAgICAgYmFkZ2U6IHRoaXMucGx1Z2luLmdldExheWVyTGFiZWwoc291cmNlLmxheWVyKSxcclxuICAgICAgYmFkZ2VDbGFzczogYG9sYS1iYWRnZS0tJHtzb3VyY2UubGF5ZXJ9YCxcclxuICAgICAgc25pcHBldDogdGhpcy5idWlsZFNuaXBwZXRQcmV2aWV3KHNvdXJjZS5zbmlwcGV0KSxcbiAgICAgIHJlYXNvbjogdGhpcy5idWlsZFNvdXJjZVJlYXNvbihzb3VyY2UpLFxuICAgICAgc2Vjb25kYXJ5QmFkZ2U6IHRoaXMudChcImJhZGdlU2NvcmVcIiwge1xuICAgICAgICBzY29yZTogdHlwZW9mIHNvdXJjZS5zY29yZSA9PT0gXCJudW1iZXJcIiA/IHNvdXJjZS5zY29yZS50b0ZpeGVkKDMpIDogXCIwLjAwMFwiLFxuICAgICAgfSksXG4gICAgICBzZWNvbmRhcnlCYWRnZUNsYXNzOiBcIm9sYS1iYWRnZS0tc2NvcmVcIixcbiAgICAgIHRlcnRpYXJ5QmFkZ2U6IHNvdXJjZS5yZWxhdGlvbl90eXBlID8gdGhpcy5nZXRSZWxhdGlvblR5cGVMYWJlbChzb3VyY2UucmVsYXRpb25fdHlwZSkgOiB1bmRlZmluZWQsXG4gICAgICB0ZXJ0aWFyeUJhZGdlQ2xhc3M6IHNvdXJjZS5yZWxhdGlvbl90eXBlID8gXCJvbGEtYmFkZ2UtLXJlbGF0aW9uXCIgOiB1bmRlZmluZWQsXG4gICAgICBxdWF0ZXJuYXJ5QmFkZ2U6IHNvdXJjZS5pc19tYWluID09PSBmYWxzZSA/IHRoaXMudChcImJhZGdlUmVmZXJlbmNlXCIpIDogdW5kZWZpbmVkLFxuICAgICAgcXVhdGVybmFyeUJhZGdlQ2xhc3M6IHNvdXJjZS5pc19tYWluID09PSBmYWxzZSA/IFwib2xhLWJhZGdlLS1yZWZcIiA6IHVuZGVmaW5lZCxcbiAgICAgIGhpbnQ6IFtcbiAgICAgICAgc291cmNlLnByb2plY3RfaWQgPyBgWyR7c291cmNlLnByb2plY3RfaWR9XWAgOiBcIlwiLFxuICAgICAgICBzb3VyY2UuZG9jX3JvbGUgfHwgXCJcIixcbiAgICAgICAgc291cmNlLm5vdGVfdHlwZSB8fCBcIlwiLFxuICAgICAgICBzb3VyY2Uuc2VjdGlvbl9oZWFkaW5nID8gYCMgJHtzb3VyY2Uuc2VjdGlvbl9oZWFkaW5nfWAgOiBcIlwiLFxuICAgICAgICBzb3VyY2UuZm9sZGVyIHx8IHNvdXJjZS5wYXRoLFxuICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcdTAwQjcgXCIpLFxuICAgIH0pKTtcbiAgICB0aGlzLnJlbmRlclNvdXJjZUNhcmRzKGJvZHlFbCwgY2FyZHMpO1xuICB9XG5cbiAgYXN5bmMgcmVuZGVyUmVjb21tZW5kYXRpb25QYW5lbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlY29tbWVuZGF0aW9uRGV0YWlsc0VsLmVtcHR5KCk7XG4gICAgdGhpcy5yZWNvbW1lbmRhdGlvbkRldGFpbHNFbC5vcGVuID0gZmFsc2U7XG4gICAgY29uc3Qgc3VtbWFyeUVsID0gdGhpcy5yZWNvbW1lbmRhdGlvbkRldGFpbHNFbC5jcmVhdGVFbChcInN1bW1hcnlcIiwge1xuICAgICAgdGV4dDogdGhpcy50KFwicGFuZWxGb2xsb3dVcE5vdGVzXCIsIHsgY291bnQ6IHRoaXMuYmFja2VuZFJlY29tbWVuZGF0aW9ucy5sZW5ndGggfSksXG4gICAgfSk7XG4gICAgc3VtbWFyeUVsLmFkZENsYXNzKFwib2xhLW1ldGEtc3VtbWFyeVwiKTtcblxuICAgIGNvbnN0IGJvZHlFbCA9IHRoaXMucmVjb21tZW5kYXRpb25EZXRhaWxzRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1tZXRhLWJvZHlcIiB9KTtcbiAgICBpZiAodGhpcy5iYWNrZW5kUmVjb21tZW5kYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYm9keUVsLnNldFRleHQodGhpcy50KFwicGFuZWxOb0ZvbGxvd1VwTm90ZXNcIikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNhcmRzID0gdGhpcy5iYWNrZW5kUmVjb21tZW5kYXRpb25zLm1hcDxTb3VyY2VDYXJkRGF0YT4oKGl0ZW0pID0+ICh7XG4gICAgICBsYWJlbDogdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0RmlsZShpdGVtLnBhdGgpPy5iYXNlbmFtZSB8fCBpdGVtLm5hbWUgfHwgaXRlbS5wYXRoLFxuICAgICAgcGF0aDogaXRlbS5wYXRoLFxuICAgICAgYmFkZ2U6IHRoaXMuZ2V0UmVsYXRpb25UeXBlTGFiZWwoaXRlbS5yZWxhdGlvbl90eXBlKSxcbiAgICAgIGJhZGdlQ2xhc3M6IFwib2xhLWJhZGdlLS1yZWxhdGlvblwiLFxuICAgICAgcmVhc29uOiB0aGlzLmJ1aWxkUmVjb21tZW5kYXRpb25SZWFzb24oaXRlbSksXG4gICAgICBzZWNvbmRhcnlCYWRnZTogdHlwZW9mIGl0ZW0uY29uZmlkZW5jZSA9PT0gXCJudW1iZXJcIlxuICAgICAgICA/IHRoaXMudChcImJhZGdlQ29uZmlkZW5jZVwiLCB7IHNjb3JlOiBpdGVtLmNvbmZpZGVuY2UudG9GaXhlZCgzKSB9KVxuICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgIHNlY29uZGFyeUJhZGdlQ2xhc3M6IHR5cGVvZiBpdGVtLmNvbmZpZGVuY2UgPT09IFwibnVtYmVyXCIgPyBcIm9sYS1iYWRnZS0tc2NvcmVcIiA6IHVuZGVmaW5lZCxcbiAgICAgIGhpbnQ6IFtcbiAgICAgICAgaXRlbS5wcm9qZWN0X2lkID8gYFske2l0ZW0ucHJvamVjdF9pZH1dYCA6IFwiXCIsXG4gICAgICAgIGl0ZW0uZG9jX3JvbGUgfHwgXCJcIixcbiAgICAgICAgaXRlbS5ub3RlX3R5cGUgfHwgXCJcIixcbiAgICAgICAgaXRlbS5mb2xkZXIgfHwgaXRlbS5wYXRoLFxuICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcdTAwQjcgXCIpLFxuICAgIH0pKTtcbiAgICB0aGlzLnJlbmRlclNvdXJjZUNhcmRzKGJvZHlFbCwgY2FyZHMpO1xuICB9XG5cbiAgcmVuZGVyU291cmNlQ2FyZHMoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBjYXJkczogU291cmNlQ2FyZERhdGFbXSk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RFbCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdih7IGNsczogXCJvbGEtc291cmNlLWxpc3RcIiB9KTtcbiAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgIGNvbnN0IGNhcmRFbCA9IGxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXNvdXJjZS1jYXJkXCIgfSk7XG4gICAgICBjb25zdCBoZWFkZXJFbCA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwib2xhLXNvdXJjZS1oZWFkZXJcIiB9KTtcclxuXHJcbiAgICAgIGNvbnN0IHJlc29sdmVkID0gdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0RmlsZShjYXJkLnBhdGgpO1xyXG4gICAgICBpZiAocmVzb2x2ZWQpIHtcclxuICAgICAgICBjb25zdCBsaW5rRWwgPSBoZWFkZXJFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XHJcbiAgICAgICAgICBjbHM6IFwib2xhLXNvdXJjZS1saW5rXCIsXHJcbiAgICAgICAgICB0ZXh0OiBjYXJkLmxhYmVsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxpbmtFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4ub3BlbkZpbGVGcm9tU291cmNlKHJlc29sdmVkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBoZWFkZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7XHJcbiAgICAgICAgICBjbHM6IFwib2xhLXNvdXJjZS1saW5rIG9sYS1zb3VyY2UtbGluay0tZGlzYWJsZWRcIixcclxuICAgICAgICAgIHRleHQ6IGNhcmQubGFiZWwsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGJhZGdlUm93RWwgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcIm9sYS1iYWRnZS1yb3dcIiB9KTtcclxuICAgICAgYmFkZ2VSb3dFbC5jcmVhdGVTcGFuKHtcclxuICAgICAgICBjbHM6IGBvbGEtYmFkZ2UgJHtjYXJkLmJhZGdlQ2xhc3N9YCxcclxuICAgICAgICB0ZXh0OiBjYXJkLmJhZGdlLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChjYXJkLnNlY29uZGFyeUJhZGdlICYmIGNhcmQuc2Vjb25kYXJ5QmFkZ2VDbGFzcykge1xyXG4gICAgICAgIGJhZGdlUm93RWwuY3JlYXRlU3Bhbih7XHJcbiAgICAgICAgICBjbHM6IGBvbGEtYmFkZ2UgJHtjYXJkLnNlY29uZGFyeUJhZGdlQ2xhc3N9YCxcclxuICAgICAgICAgIHRleHQ6IGNhcmQuc2Vjb25kYXJ5QmFkZ2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjYXJkLnRlcnRpYXJ5QmFkZ2UgJiYgY2FyZC50ZXJ0aWFyeUJhZGdlQ2xhc3MpIHtcbiAgICAgICAgYmFkZ2VSb3dFbC5jcmVhdGVTcGFuKHtcbiAgICAgICAgICBjbHM6IGBvbGEtYmFkZ2UgJHtjYXJkLnRlcnRpYXJ5QmFkZ2VDbGFzc31gLFxuICAgICAgICAgIHRleHQ6IGNhcmQudGVydGlhcnlCYWRnZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjYXJkLnF1YXRlcm5hcnlCYWRnZSAmJiBjYXJkLnF1YXRlcm5hcnlCYWRnZUNsYXNzKSB7XG4gICAgICAgIGJhZGdlUm93RWwuY3JlYXRlU3Bhbih7XG4gICAgICAgICAgY2xzOiBgb2xhLWJhZGdlICR7Y2FyZC5xdWF0ZXJuYXJ5QmFkZ2VDbGFzc31gLFxuICAgICAgICAgIHRleHQ6IGNhcmQucXVhdGVybmFyeUJhZGdlLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNhcmQuc25pcHBldCkge1xuICAgICAgICBjYXJkRWwuY3JlYXRlRGl2KHtcbiAgICAgICAgICBjbHM6IFwib2xhLXNvdXJjZS1zbmlwcGV0XCIsXG4gICAgICAgICAgdGV4dDogY2FyZC5zbmlwcGV0LFxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNhcmQucmVhc29uKSB7XHJcbiAgICAgICAgY2FyZEVsLmNyZWF0ZURpdih7XHJcbiAgICAgICAgICBjbHM6IFwib2xhLXNvdXJjZS1yZWFzb25cIixcclxuICAgICAgICAgIHRleHQ6IGNhcmQucmVhc29uLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYXJkRWwuY3JlYXRlRGl2KHtcclxuICAgICAgICBjbHM6IFwib2xhLXNvdXJjZS1wYXRoXCIsXHJcbiAgICAgICAgdGV4dDogY2FyZC5oaW50LFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGJ1aWxkU291cmNlUmVhc29uKHNvdXJjZTogU3RyZWFtU291cmNlKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VMYWJlbCA9IHRoaXMuZ2V0U291cmNlTGFiZWwoc291cmNlLnNvdXJjZSk7XG4gICAgaWYgKHNvdXJjZUxhYmVsKSB7XG4gICAgICBwYXJ0cy5wdXNoKGAke3RoaXMudChcImRlYnVnU2VsZWN0ZWRCeVwiKX06ICR7c291cmNlTGFiZWx9YCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UucmVsYXRpb25fdHlwZSkge1xuICAgICAgcGFydHMucHVzaChgJHt0aGlzLnQoXCJkZWJ1Z1JlbGF0aW9uVHlwZVwiKX06ICR7dGhpcy5nZXRSZWxhdGlvblR5cGVMYWJlbChzb3VyY2UucmVsYXRpb25fdHlwZSl9YCk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UucmVhc29uKSB7XG4gICAgICBwYXJ0cy5wdXNoKGAke3RoaXMudChcImRlYnVnUmVhc29uUHJlZml4XCIpfTogJHtzb3VyY2UucmVhc29ufWApO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHMuam9pbihcIiB8IFwiKTtcbiAgfVxuXG4gIGJ1aWxkUmVjb21tZW5kYXRpb25SZWFzb24oaXRlbTogUmVjb21tZW5kYXRpb25JdGVtKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAoaXRlbS5yZWxhdGlvbl90eXBlKSB7XG4gICAgICBwYXJ0cy5wdXNoKGAke3RoaXMudChcImRlYnVnUmVsYXRpb25UeXBlXCIpfTogJHt0aGlzLmdldFJlbGF0aW9uVHlwZUxhYmVsKGl0ZW0ucmVsYXRpb25fdHlwZSl9YCk7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0uc2VlZF90aXRsZXMpICYmIGl0ZW0uc2VlZF90aXRsZXMubGVuZ3RoID4gMCkge1xuICAgICAgcGFydHMucHVzaChgJHt0aGlzLnQoXCJkZWJ1Z1NlbGVjdGVkQnlcIil9OiAke2l0ZW0uc2VlZF90aXRsZXMuam9pbihcIiwgXCIpfWApO1xuICAgIH1cbiAgICBpZiAoaXRlbS5yZWFzb24pIHtcbiAgICAgIHBhcnRzLnB1c2goYCR7dGhpcy50KFwiZGVidWdSZWFzb25QcmVmaXhcIil9OiAke2l0ZW0ucmVhc29ufWApO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHMuam9pbihcIiB8IFwiKTtcbiAgfVxuXG4gIGdldFNvdXJjZUxhYmVsKHNvdXJjZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHNvdXJjZSkge1xuICAgICAgY2FzZSBcImN1cnJlbnRcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInNvdXJjZUN1cnJlbnRcIik7XG4gICAgICBjYXNlIFwiY3VycmVudF9jYW5kaWRhdGVcIjpcclxuICAgICAgICByZXR1cm4gdGhpcy50KFwic291cmNlQ3VycmVudENhbmRpZGF0ZVwiKTtcclxuICAgICAgY2FzZSBcInZhdWx0X3NlYXJjaFwiOlxyXG4gICAgICBjYXNlIFwidmF1bHRcIjpcclxuICAgICAgY2FzZSBcInN1bW1hcnlcIjpcclxuICAgICAgY2FzZSBcInJhd1wiOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnQoXCJzb3VyY2VWYXVsdFNlYXJjaFwiKTtcclxuICAgICAgY2FzZSBcImxpbmtzXCI6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInNvdXJjZUxpbmtzXCIpO1xyXG4gICAgICBjYXNlIFwicmVsYXRlZF9maWxlc1wiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwic291cmNlUmVsYXRlZEZpbGVzXCIpO1xuICAgICAgY2FzZSBcImF1dG9fcmVsYXRlZFwiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwic291cmNlQXV0b1JlbGF0ZWRcIik7XG4gICAgICBjYXNlIFwidHlwZWRfcmVsYXRpb25cIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInNvdXJjZVR5cGVkUmVsYXRpb25cIik7XG4gICAgICBjYXNlIFwiZm9sZGVyXCI6XG4gICAgICAgIHJldHVybiB0aGlzLnQoXCJzb3VyY2VGb2xkZXJcIik7XG4gICAgICBjYXNlIFwidGFnc1wiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwic291cmNlVGFnc1wiKTtcbiAgICAgIGNhc2UgXCJiYWNrbGlua3NcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInNvdXJjZUJhY2tsaW5rc1wiKTtcclxuICAgICAgY2FzZSBcImNvbnRleHRcIjpcclxuICAgICAgICByZXR1cm4gdGhpcy50KFwic291cmNlQ29udGV4dFwiKTtcclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHNvdXJjZSA/PyBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGdldFJlbGF0aW9uVHlwZUxhYmVsKHJlbGF0aW9uVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKChyZWxhdGlvblR5cGUgPz8gXCJcIikudHJpbSgpKSB7XG4gICAgICBjYXNlIFwic2FtZV90b3BpY1wiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwicmVsYXRpb25TYW1lVG9waWNcIik7XG4gICAgICBjYXNlIFwicmVmZXJlbmNlc1wiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwicmVsYXRpb25SZWZlcmVuY2VzXCIpO1xuICAgICAgY2FzZSBcInN1bW1hcml6ZXNcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInJlbGF0aW9uU3VtbWFyaXplc1wiKTtcbiAgICAgIGNhc2UgXCJleHBhbmRzXCI6XG4gICAgICAgIHJldHVybiB0aGlzLnQoXCJyZWxhdGlvbkV4cGFuZHNcIik7XG4gICAgICBjYXNlIFwiaW1wbGVtZW50c1wiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwicmVsYXRpb25JbXBsZW1lbnRzXCIpO1xuICAgICAgY2FzZSBcInJldmlld19vZlwiOlxuICAgICAgICByZXR1cm4gdGhpcy50KFwicmVsYXRpb25SZXZpZXdPZlwiKTtcbiAgICAgIGNhc2UgXCJuZXh0X2FjdGlvbl9mb3JcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInJlbGF0aW9uTmV4dEFjdGlvbkZvclwiKTtcbiAgICAgIGNhc2UgXCJkZWNpc2lvbl9mb3JcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMudChcInJlbGF0aW9uRGVjaXNpb25Gb3JcIik7XG4gICAgICBjYXNlIFwiZm9sbG93X3VwXCI6XG4gICAgICAgIHJldHVybiB0aGlzLnQoXCJyZWxhdGlvbkZvbGxvd1VwXCIpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHJlbGF0aW9uVHlwZT8udHJpbSgpIHx8IFwiXCI7XG4gICAgfVxuICB9XG5cclxuICBidWlsZFNuaXBwZXRQcmV2aWV3KHRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgbWF4Q2hhcnMgPSAyMjApOiBzdHJpbmcge1xyXG4gICAgaWYgKCF0ZXh0KSB7XHJcbiAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbXBhY3QgPSB0ZXh0XHJcbiAgICAgIC5yZXBsYWNlKC9eLS0tW1xcc1xcU10qPy0tLS8sIFwiXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cXFtcXFsoW15cXF18XSspKFxcfFteXFxdXSspP1xcXVxcXS9nLCBcIiQxXCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKVxyXG4gICAgICAudHJpbSgpO1xyXG5cclxuICAgIGlmICghY29tcGFjdCkge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICAgIHJldHVybiBjb21wYWN0Lmxlbmd0aCA+IG1heENoYXJzID8gYCR7Y29tcGFjdC5zbGljZSgwLCBtYXhDaGFycykudHJpbSgpfS4uLmAgOiBjb21wYWN0O1xyXG4gIH1cclxuXHJcbiAgbGlua2lmeVZhdWx0UGF0aHMoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoUGF0dGVybiA9IC8oW0EtWmEtel06W1xcXFwvXVteXFxzPD5cIiddK1xcLltBLVphLXowLTldK3woPzpbXFx3XFwtLiBdK1xcLykrW1xcd1xcLS4gXStcXC5bQS1aYS16MC05XSspL2c7XG4gICAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZShwYXRoUGF0dGVybiwgKG1hdGNoKSA9PiB7XG4gICAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucGx1Z2luLnJlc29sdmVWYXVsdEZpbGUobWF0Y2gpO1xuICAgICAgaWYgKCFyZXNvbHZlZCkge1xyXG4gICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBkaXNwbGF5ID0gcmVzb2x2ZWQubmFtZTtcclxuICAgICAgcmV0dXJuIGBbWyR7cmVzb2x2ZWQucGF0aH18JHtkaXNwbGF5fV1dYDtcclxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY2xlYXJDb252ZXJzYXRpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5hYm9ydEFjdGl2ZVJlcXVlc3QoKTtcbiAgICB0aGlzLnJ1bm5pbmdUYXNrID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZVNlc3Npb25JZCA9IFwiXCI7XG4gICAgdGhpcy5yZW5kZXJlZE91dHB1dCA9IFwiXCI7XG4gICAgdGhpcy5sYXN0UXVlc3Rpb24gPSBcIlwiO1xuICAgIHRoaXMuY3VycmVudENvbnRleHRFbnRyaWVzID0gW107XG4gICAgdGhpcy5iYWNrZW5kU291cmNlcyA9IFtdO1xuICAgIHRoaXMuYmFja2VuZFJlY29tbWVuZGF0aW9ucyA9IFtdO1xuICAgIHRoaXMuYW5zd2VyQmFzaXMgPSBcIlwiO1xuICAgIHRoaXMuY2hhdFR1cm5zID0gW107XG4gICAgY29uc3QgdGhyZWFkUmVjb3JkID0gdGhpcy5wbHVnaW4uZ2V0Q2hhdFRocmVhZCh0aGlzLmFjdGl2ZVRocmVhZElkKTtcbiAgICBpZiAodGhyZWFkUmVjb3JkKSB7XG4gICAgICB0aHJlYWRSZWNvcmQudHVybnMgPSBbXTtcbiAgICAgIHRocmVhZFJlY29yZC50aXRsZSA9IHRoaXMudChcInRocmVhZFVudGl0bGVkXCIpO1xuICAgICAgdGhyZWFkUmVjb3JkLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIHRoaXMucGx1Z2luLnNvcnRDaGF0VGhyZWFkc0J5UmVjZW50KCk7XG4gICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY29udmVyc2F0aW9uQWN0aW9uc0VsKSB7XG4gICAgICB0aGlzLmNvbnZlcnNhdGlvbkFjdGlvbnNFbC5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyVGhyZWFkUm93KCk7XG4gICAgdGhpcy5zZXRCdXN5KGZhbHNlKTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlckNvbnRleHRQYW5lbHMoKTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlck91dHB1dCgpO1xuICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQ29udmVyc2F0aW9uQ2xlYXJlZFwiKSk7XG4gIH1cblxuICBhc3luYyBzYXZlQW5zd2VyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHR1cm4gPSB0aGlzLmdldExhdGVzdENvbXBsZXRlZFR1cm4oKTtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5nZXRBbnN3ZXJUYXJnZXRGaWxlKHR1cm4pO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VPcGVuTm90ZVwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0dXJuPy5hbnN3ZXIudHJpbSgpKSB7XG4gICAgICBuZXcgTm90aWNlKHRoaXMudChcIm5vdGljZU5vQW5zd2VyVG9TYXZlXCIpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cclxuICAgIGNvbnN0IGZvbGRlclBhdGggPSBub3JtYWxpemVQYXRoKHRoaXMucGx1Z2luLnNldHRpbmdzLnNhdmVGb2xkZXIpO1xyXG4gICAgYXdhaXQgdGhpcy5wbHVnaW4uZW5zdXJlRm9sZGVyKGZvbGRlclBhdGgpO1xuXG4gICAgY29uc3QgdGl0bGVCYXNlID0gZmlsZS5iYXNlbmFtZS5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgXCItXCIpO1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csIFwiLVwiKTtcbiAgICBjb25zdCBvdXRwdXRQYXRoID0gbm9ybWFsaXplUGF0aChgJHtmb2xkZXJQYXRofS8ke3RpdGxlQmFzZX0tJHt0aW1lc3RhbXB9Lm1kYCk7XG4gICAgY29uc3QgbWFya2Rvd24gPSB0aGlzLmJ1aWxkU2F2ZWRBbnN3ZXJNYXJrZG93bihmaWxlLCB0dXJuLCBcIm5vdGVcIik7XG5cbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQuY3JlYXRlKG91dHB1dFBhdGgsIG1hcmtkb3duKTtcbiAgICBpZiAodGhpcy5jb252ZXJzYXRpb25BY3Rpb25zRWwpIHtcbiAgICAgIHRoaXMuY29udmVyc2F0aW9uQWN0aW9uc0VsLm9wZW4gPSBmYWxzZTtcbiAgICB9XG4gICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VTYXZlZEFuc3dlclwiLCB7IHBhdGg6IG91dHB1dFBhdGggfSkpO1xuICB9XG5cbiAgYXN5bmMgYXBwZW5kQW5zd2VyVG9DdXJyZW50Tm90ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0dXJuID0gdGhpcy5nZXRMYXRlc3RDb21wbGV0ZWRUdXJuKCk7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0QW5zd2VyVGFyZ2V0RmlsZSh0dXJuKTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlT3Blbk5vdGVcIikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdHVybj8uYW5zd2VyLnRyaW0oKSkge1xuICAgICAgbmV3IE5vdGljZSh0aGlzLnQoXCJub3RpY2VOb0Fuc3dlclRvQXBwZW5kXCIpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYXJrZG93biA9IHRoaXMuYnVpbGRTYXZlZEFuc3dlck1hcmtkb3duKGZpbGUsIHR1cm4sIFwiYXBwZW5kXCIpO1xuICAgIGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5hcHBlbmQoZmlsZSwgYFxcblxcbiR7bWFya2Rvd259XFxuYCk7XG4gICAgaWYgKHRoaXMuY29udmVyc2F0aW9uQWN0aW9uc0VsKSB7XG4gICAgICB0aGlzLmNvbnZlcnNhdGlvbkFjdGlvbnNFbC5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIG5ldyBOb3RpY2UodGhpcy50KFwibm90aWNlQXBwZW5kZWRBbnN3ZXJcIiwgeyBwYXRoOiBmaWxlLnBhdGggfSkpO1xuICB9XG5cbiAgZ2V0QW5zd2VyVGFyZ2V0RmlsZSh0dXJuPzogQ2hhdFR1cm4gfCBudWxsKTogVEZpbGUgfCBudWxsIHtcbiAgICBjb25zdCB0YXJnZXRQYXRoID0gdHVybj8uYXR0YWNoZWRGaWxlUGF0aCB8fCB0aGlzLmN1cnJlbnRGaWxlUGF0aDtcbiAgICBpZiAodGFyZ2V0UGF0aCkge1xuICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgodGFyZ2V0UGF0aCk7XG4gICAgICBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wbHVnaW4uYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gIH1cblxuICBidWlsZFNhdmVkQW5zd2VyTWFya2Rvd24oZmlsZTogVEZpbGUsIHR1cm46IENoYXRUdXJuLCBtb2RlOiBcIm5vdGVcIiB8IFwiYXBwZW5kXCIpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcodGhpcy5wbHVnaW4uZ2V0TG9jYWxlKCkpO1xuICAgIGNvbnN0IHRpdGxlID0gbW9kZSA9PT0gXCJub3RlXCJcbiAgICAgID8gdGhpcy50KFwic2F2ZWRUaXRsZU5vdGVcIilcbiAgICAgIDogdGhpcy50KFwic2F2ZWRUaXRsZUFwcGVuZFwiLCB7IG5vdyB9KTtcbiAgICBjb25zdCBhbnN3ZXJIZWFkaW5nID0gbW9kZSA9PT0gXCJub3RlXCIgPyB0aGlzLnQoXCJzYXZlZEFuc3dlckhlYWRpbmdOb3RlXCIpIDogdGhpcy50KFwic2F2ZWRBbnN3ZXJIZWFkaW5nQXBwZW5kXCIpO1xyXG4gICAgY29uc3Qgc291cmNlSGVhZGluZyA9IG1vZGUgPT09IFwibm90ZVwiID8gdGhpcy50KFwic2F2ZWRTb3VyY2VzSGVhZGluZ05vdGVcIikgOiB0aGlzLnQoXCJzYXZlZFNvdXJjZXNIZWFkaW5nQXBwZW5kXCIpO1xyXG4gICAgY29uc3QgY29udGV4dEhlYWRpbmcgPSBtb2RlID09PSBcIm5vdGVcIiA/IHRoaXMudChcInNhdmVkQ29udGV4dEhlYWRpbmdOb3RlXCIpIDogdGhpcy50KFwic2F2ZWRDb250ZXh0SGVhZGluZ0FwcGVuZFwiKTtcclxuICAgIGNvbnN0IHNlY3Rpb25zID0gW1xuICAgICAgdGl0bGUsXG4gICAgICBcIlwiLFxuICAgICAgYC0gJHt0aGlzLnQoXCJzYXZlZFNvdXJjZU5vdGVcIil9OiAke3RoaXMucGx1Z2luLm1ha2VXaWtpTGluayhmaWxlLCBmaWxlLmJhc2VuYW1lKX1gLFxuICAgICAgYC0gJHt0aGlzLnQoXCJzYXZlZFF1ZXN0aW9uXCIpfTogJHt0dXJuLnF1ZXN0aW9uIHx8IHRoaXMudChcInNhdmVkRW1wdHlRdWVzdGlvblwiKX1gLFxuICAgICAgYC0gJHt0aGlzLnQoXCJzYXZlZFNhdmVkQXRcIil9OiAke25vd31gLFxuICAgICAgXCJcIixcbiAgICAgIGFuc3dlckhlYWRpbmcsXG4gICAgICBcIlwiLFxuICAgICAgdGhpcy5saW5raWZ5VmF1bHRQYXRocyh0dXJuLmFuc3dlcikudHJpbSgpLFxuICAgIF07XG5cbiAgICBjb25zdCBzb3VyY2VMaW5lcyA9IHR1cm4uc291cmNlc1xuICAgICAgLm1hcCgoc291cmNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5wbHVnaW4ucmVzb2x2ZVZhdWx0RmlsZShzb3VyY2UucGF0aCk/LmJhc2VuYW1lIHx8IHNvdXJjZS5uYW1lIHx8IHNvdXJjZS5wYXRoO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5tYWtlVmF1bHRMaW5rT3JDb2RlKHNvdXJjZS5wYXRoLCBsYWJlbCksXG4gICAgICAgICAgdGhpcy5wbHVnaW4uZ2V0TGF5ZXJMYWJlbChzb3VyY2UubGF5ZXIpLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgICB0aGlzLnQoXCJiYWRnZVNjb3JlXCIsIHtcclxuICAgICAgICAgICAgc2NvcmU6IHR5cGVvZiBzb3VyY2Uuc2NvcmUgPT09IFwibnVtYmVyXCIgPyBzb3VyY2Uuc2NvcmUudG9GaXhlZCgzKSA6IFwiMC4wMDBcIixcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIF07XHJcbiAgICAgICAgaWYgKHNvdXJjZS5pc19tYWluID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgcGFydHMucHVzaCh0aGlzLnQoXCJiYWRnZVJlZmVyZW5jZVwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBgLSAke3BhcnRzLmpvaW4oXCIgfCBcIil9YDtcclxuICAgICAgfSk7XHJcbiAgICBpZiAoc291cmNlTGluZXMubGVuZ3RoID4gMCkge1xuICAgICAgc2VjdGlvbnMucHVzaChcIlwiLCBzb3VyY2VIZWFkaW5nLCBcIlwiLCAuLi5zb3VyY2VMaW5lcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dExpbmVzID0gdHVybi5jb250ZXh0RW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucGx1Z2luLnJlc29sdmVWYXVsdEZpbGUoZW50cnkucGF0aCk7XG4gICAgICBjb25zdCBsYWJlbCA9IGAke2VudHJ5Lm5hbWV9IC0gJHt0aGlzLnBsdWdpbi5nZXRDb250ZXh0U291cmNlTGFiZWwoZW50cnkuc291cmNlKS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICByZXR1cm4gYC0gJHtyZXNvbHZlZCA/IHRoaXMucGx1Z2luLm1ha2VXaWtpTGluayhyZXNvbHZlZCwgbGFiZWwpIDogYFxcYCR7ZW50cnkucGF0aH1cXGBgfWA7XG4gICAgfSk7XG4gICAgaWYgKGNvbnRleHRMaW5lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHNlY3Rpb25zLnB1c2goXCJcIiwgY29udGV4dEhlYWRpbmcsIFwiXCIsIC4uLmNvbnRleHRMaW5lcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNlY3Rpb25zLmpvaW4oXCJcXG5cIik7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDaGF0QWN0aW9uQnV0dG9uU3RhdGUoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuY2hhdEFjdGlvbkJ1dHRvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNDaGF0UnVubmluZyA9IHRoaXMucnVubmluZ1Rhc2sgPT09IFwiY2hhdFwiO1xyXG4gICAgY29uc3QgaGFzUXVlc3Rpb24gPSB0aGlzLnF1ZXN0aW9uRWw/LnZhbHVlLnRyaW0oKS5sZW5ndGggPiAwO1xyXG4gICAgaWYgKHRoaXMucXVpY2tBY3Rpb25TdWdnZXN0aW9uc0VsKSB7XHJcbiAgICAgIHRoaXMucXVpY2tBY3Rpb25TdWdnZXN0aW9uc0VsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1oaWRkZW5cIiwgaGFzUXVlc3Rpb24gfHwgQm9vbGVhbih0aGlzLnJ1bm5pbmdUYXNrKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbXBvc2VSb3dFbD8uY2xhc3NMaXN0LnRvZ2dsZShcImlzLXN1Z2dlc3RpbmdcIiwgIWhhc1F1ZXN0aW9uICYmICF0aGlzLnJ1bm5pbmdUYXNrKTtcclxuICAgIHRoaXMuY2hhdEFjdGlvbkJ1dHRvbi50ZXh0Q29udGVudCA9IGlzQ2hhdFJ1bm5pbmcgPyBcIlx1MjVBMFwiIDogXCJcdTI3QTRcIjtcclxuICAgIHRoaXMuY2hhdEFjdGlvbkJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGlzQ2hhdFJ1bm5pbmcgPyB0aGlzLnQoXCJidXR0b25TdG9wXCIpIDogdGhpcy50KFwiYnV0dG9uQXNrXCIpKTtcclxuICAgIHRoaXMuY2hhdEFjdGlvbkJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBpc0NoYXRSdW5uaW5nID8gdGhpcy50KFwiYnV0dG9uU3RvcFwiKSA6IHRoaXMudChcImJ1dHRvbkFza1wiKSk7XHJcbiAgICB0aGlzLmNoYXRBY3Rpb25CdXR0b24uY2xhc3NMaXN0LnRvZ2dsZShcImlzLXN0b3BcIiwgaXNDaGF0UnVubmluZyk7XHJcbiAgICB0aGlzLmNoYXRBY3Rpb25CdXR0b24uZGlzYWJsZWQgPSBpc0NoYXRSdW5uaW5nID8gZmFsc2UgOiBCb29sZWFuKHRoaXMucnVubmluZ1Rhc2spIHx8ICFoYXNRdWVzdGlvbjtcclxuICB9XHJcblxyXG4gIGFwcGx5QnVzeVN0YXRlKCk6IHZvaWQge1xyXG4gICAgY29uc3QgaXNCdXN5ID0gQm9vbGVhbih0aGlzLnJ1bm5pbmdUYXNrKTtcclxuICAgIGlmICh0aGlzLmJhY2tlbmRTdGFydEJ1dHRvbikge1xyXG4gICAgICB0aGlzLmJhY2tlbmRTdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeSB8fCB0aGlzLmJhY2tlbmRMYXVuY2hQcm9taXNlICE9PSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuYmFja2VuZFJlc3RhcnRCdXR0b24pIHtcclxuICAgICAgdGhpcy5iYWNrZW5kUmVzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeSB8fCB0aGlzLmJhY2tlbmRMYXVuY2hQcm9taXNlICE9PSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuYmFja2VuZFN0b3BCdXR0b24pIHtcbiAgICAgIHRoaXMuYmFja2VuZFN0b3BCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XG4gICAgfVxuICAgIGlmICh0aGlzLmNsZWFyQ29udmVyc2F0aW9uQnV0dG9uKSB7XG4gICAgICB0aGlzLmNsZWFyQ29udmVyc2F0aW9uQnV0dG9uLmRpc2FibGVkID0gaXNCdXN5IHx8IHRoaXMuY2hhdFR1cm5zLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgY29uc3QgbGF0ZXN0VHVybiA9IHRoaXMuZ2V0TGF0ZXN0Q29tcGxldGVkVHVybigpO1xuICAgIGlmICh0aGlzLmFwcGVuZEJ1dHRvbikge1xuICAgICAgdGhpcy5hcHBlbmRCdXR0b24uZGlzYWJsZWQgPSBpc0J1c3kgfHwgIWxhdGVzdFR1cm4/LmFuc3dlci50cmltKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNhdmVCdXR0b24pIHtcbiAgICAgIHRoaXMuc2F2ZUJ1dHRvbi5kaXNhYmxlZCA9IGlzQnVzeSB8fCAhbGF0ZXN0VHVybj8uYW5zd2VyLnRyaW0oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucXVlc3Rpb25FbCkge1xyXG4gICAgICB0aGlzLnF1ZXN0aW9uRWwuZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiB0aGlzLnF1aWNrQWN0aW9uQnV0dG9ucykge1xyXG4gICAgICBidXR0b24uZGlzYWJsZWQgPSBpc0J1c3k7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZUNoYXRBY3Rpb25CdXR0b25TdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2V0QnVzeShpc0J1c3k6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMuYXBwbHlCdXN5U3RhdGUoKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIExvY2FsQWdlbnRTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBMb2NhbEFnZW50UGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBMb2NhbEFnZW50UGx1Z2luKSB7XHJcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUodGhpcy5wbHVnaW4udChcInNldHRpbmdMYW5ndWFnZU5hbWVcIikpXHJcbiAgICAgIC5zZXREZXNjKHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nTGFuZ3VhZ2VEZXNjXCIpKVxyXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxyXG4gICAgICAgIGRyb3Bkb3duXHJcbiAgICAgICAgICAuYWRkT3B0aW9uKFwia29cIiwgdGhpcy5wbHVnaW4udChcInNldHRpbmdMYW5ndWFnZUtvcmVhblwiKSlcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJlblwiLCB0aGlzLnBsdWdpbi50KFwic2V0dGluZ0xhbmd1YWdlRW5nbGlzaFwiKSlcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYW5ndWFnZSlcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWU6IExhbmd1YWdlQ29kZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5sYW5ndWFnZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJlZnJlc2hPcGVuVmlld3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZSh0aGlzLnBsdWdpbi50KFwic2V0dGluZ0JhY2tlbmROYW1lXCIpKVxyXG4gICAgICAuc2V0RGVzYyh0aGlzLnBsdWdpbi50KFwic2V0dGluZ0JhY2tlbmREZXNjXCIpKVxyXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJodHRwOi8vMTI3LjAuMC4xOjgwMTFcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kVXJsKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kVXJsID0gdmFsdWUudHJpbSgpIHx8IERFRkFVTFRfU0VUVElOR1MuYmFja2VuZFVybDtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUodGhpcy5wbHVnaW4udChcInNldHRpbmdBdXRvU3RhcnRCYWNrZW5kTmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdBdXRvU3RhcnRCYWNrZW5kRGVzY1wiKSlcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9TdGFydEJhY2tlbmQpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9TdGFydEJhY2tlbmQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUodGhpcy5wbHVnaW4udChcInNldHRpbmdCYWNrZW5kUHl0aG9uTmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdCYWNrZW5kUHl0aG9uRGVzY1wiKSlcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKERFRkFVTFRfU0VUVElOR1MuYmFja2VuZFB5dGhvblBhdGgpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYmFja2VuZFB5dGhvblBhdGgpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmJhY2tlbmRQeXRob25QYXRoID0gdmFsdWUudHJpbSgpIHx8IERFRkFVTFRfU0VUVElOR1MuYmFja2VuZFB5dGhvblBhdGg7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nQmFja2VuZFNjcmlwdE5hbWVcIikpXHJcbiAgICAgIC5zZXREZXNjKHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nQmFja2VuZFNjcmlwdERlc2NcIikpXHJcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgIHRleHRcclxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihERUZBVUxUX1NFVFRJTkdTLmJhY2tlbmRTY3JpcHRQYXRoKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmJhY2tlbmRTY3JpcHRQYXRoKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kU2NyaXB0UGF0aCA9IHZhbHVlLnRyaW0oKSB8fCBERUZBVUxUX1NFVFRJTkdTLmJhY2tlbmRTY3JpcHRQYXRoO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZSh0aGlzLnBsdWdpbi50KFwic2V0dGluZ0JhY2tlbmRXb3JraW5nRGlyTmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdCYWNrZW5kV29ya2luZ0RpckRlc2NcIikpXHJcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgIHRleHRcclxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihERUZBVUxUX1NFVFRJTkdTLmJhY2tlbmRXb3JraW5nRGlyKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmJhY2tlbmRXb3JraW5nRGlyKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5iYWNrZW5kV29ya2luZ0RpciA9IHZhbHVlLnRyaW0oKSB8fCBERUZBVUxUX1NFVFRJTkdTLmJhY2tlbmRXb3JraW5nRGlyO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZSh0aGlzLnBsdWdpbi50KFwic2V0dGluZ1Byb2plY3ROYW1lXCIpKVxyXG4gICAgICAuc2V0RGVzYyh0aGlzLnBsdWdpbi50KFwic2V0dGluZ1Byb2plY3REZXNjXCIpKVxyXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cclxuICAgICAgICB0ZXh0XHJcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJEZWZhdWx0XCIpXHJcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFByb2plY3QpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRQcm9qZWN0ID0gdmFsdWUudHJpbSgpIHx8IERFRkFVTFRfU0VUVElOR1MuZGVmYXVsdFByb2plY3Q7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nU2F2ZUZvbGRlck5hbWVcIikpXHJcbiAgICAgIC5zZXREZXNjKHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nU2F2ZUZvbGRlckRlc2NcIikpXHJcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgICAgIHRleHRcclxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkFJIEFuc3dlcnNcIilcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zYXZlRm9sZGVyKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zYXZlRm9sZGVyID0gdmFsdWUudHJpbSgpIHx8IERFRkFVTFRfU0VUVElOR1Muc2F2ZUZvbGRlcjtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUodGhpcy5wbHVnaW4udChcInNldHRpbmdNYXhDb250ZXh0TmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdNYXhDb250ZXh0RGVzY1wiKSlcclxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XHJcbiAgICAgICAgdGV4dFxyXG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiNlwiKVxyXG4gICAgICAgICAgLnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5tYXhDb250ZXh0Tm90ZXMpKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIucGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubWF4Q29udGV4dE5vdGVzID0gTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID4gMCA/IHBhcnNlZCA6IERFRkFVTFRfU0VUVElOR1MubWF4Q29udGV4dE5vdGVzO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZSh0aGlzLnBsdWdpbi50KFwic2V0dGluZ09wZW5Nb2RlTmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdPcGVuTW9kZURlc2NcIikpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XHJcbiAgICAgICAgZHJvcGRvd25cclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJjdXJyZW50XCIsIHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nT3Blbk1vZGVDdXJyZW50XCIpKVxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcInNwbGl0XCIsIHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nT3Blbk1vZGVTcGxpdFwiKSlcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJ0YWJcIiwgdGhpcy5wbHVnaW4udChcInNldHRpbmdPcGVuTW9kZVRhYlwiKSlcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zb3VyY2VPcGVuTW9kZSlcclxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWU6IFwiY3VycmVudFwiIHwgXCJzcGxpdFwiIHwgXCJ0YWJcIikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zb3VyY2VPcGVuTW9kZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZSh0aGlzLnBsdWdpbi50KFwic2V0dGluZ1NwbGl0RGlyZWN0aW9uTmFtZVwiKSlcclxuICAgICAgLnNldERlc2ModGhpcy5wbHVnaW4udChcInNldHRpbmdTcGxpdERpcmVjdGlvbkRlc2NcIikpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XHJcbiAgICAgICAgZHJvcGRvd25cclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJsZWZ0XCIsIHRoaXMucGx1Z2luLnQoXCJzZXR0aW5nRGlyZWN0aW9uTGVmdFwiKSlcclxuICAgICAgICAgIC5hZGRPcHRpb24oXCJyaWdodFwiLCB0aGlzLnBsdWdpbi50KFwic2V0dGluZ0RpcmVjdGlvblJpZ2h0XCIpKVxyXG4gICAgICAgICAgLmFkZE9wdGlvbihcImRvd25cIiwgdGhpcy5wbHVnaW4udChcInNldHRpbmdEaXJlY3Rpb25Eb3duXCIpKVxyXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNwbGl0RGlyZWN0aW9uKVxyXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZTogXCJsZWZ0XCIgfCBcInJpZ2h0XCIgfCBcImRvd25cIikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zcGxpdERpcmVjdGlvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvY2FsQWdlbnRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogTG9jYWxBZ2VudFNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUztcbiAgY2hhdFRocmVhZHM6IENoYXRUaHJlYWRSZWNvcmRbXSA9IFtdO1xuICBhY3RpdmVDaGF0VGhyZWFkSWQgPSBcIlwiO1xuICBsYXN0TWFya2Rvd25MZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RFZGl0b3JTZWxlY3Rpb24gPSBcIlwiO1xuICBsYXN0RWRpdG9yU2VsZWN0aW9uUGF0aCA9IFwiXCI7XG5cclxuICBhc3luYyBvbmxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xyXG5cclxuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFxyXG4gICAgICBWSUVXX1RZUEVfTE9DQUxfQUdFTlQsXHJcbiAgICAgIChsZWFmKSA9PiBuZXcgTG9jYWxBZ2VudFZpZXcobGVhZiwgdGhpcyksXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcImJvdFwiLCB0aGlzLnQoXCJjb21tYW5kT3BlblwiKSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBhd2FpdCB0aGlzLmFjdGl2YXRlVmlldygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwib3Blbi1sb2NhbC1hZ2VudFwiLFxyXG4gICAgICBuYW1lOiB0aGlzLnQoXCJjb21tYW5kT3BlblwiKSxcclxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcclxuICAgICAgICBhd2FpdCB0aGlzLmFjdGl2YXRlVmlldygpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwiYXNrLXNlbGVjdGlvbi13aXRoLWxvY2FsLWFnZW50XCIsXHJcbiAgICAgIG5hbWU6IHRoaXMudChcImNvbW1hbmRBc2tTZWxlY3Rpb25cIiksXHJcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IGF3YWl0IHRoaXMuYWN0aXZhdGVWaWV3KCk7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHZpZXcudXNlU2VsZWN0aW9uKHRydWUpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwic3VtbWFyaXplLWN1cnJlbnQtbm90ZS13aXRoLWxvY2FsLWFnZW50XCIsXHJcbiAgICAgIG5hbWU6IHRoaXMudChcImNvbW1hbmRTdW1tYXJpemVcIiksXHJcbiAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IGF3YWl0IHRoaXMuYWN0aXZhdGVWaWV3KCk7XHJcbiAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IHZpZXcucnVuUXVpY2tBY3Rpb24oXCJzdW1tYXJ5XCIpO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6IFwib3JnYW5pemUtY3VycmVudC1ub3RlLXdpdGgtbG9jYWwtYWdlbnRcIixcclxuICAgICAgbmFtZTogdGhpcy50KFwiY29tbWFuZE9yZ2FuaXplXCIpLFxyXG4gICAgICBjYWxsYmFjazogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBhd2FpdCB0aGlzLmFjdGl2YXRlVmlldygpO1xyXG4gICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhd2FpdCB2aWV3LnJ1blF1aWNrQWN0aW9uKFwib3JnYW5pemVcIik7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICBpZDogXCJleHRyYWN0LW5leHQtYWN0aW9ucy13aXRoLWxvY2FsLWFnZW50XCIsXHJcbiAgICAgIG5hbWU6IHRoaXMudChcImNvbW1hbmROZXh0QWN0aW9uc1wiKSxcclxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCB2aWV3ID0gYXdhaXQgdGhpcy5hY3RpdmF0ZVZpZXcoKTtcclxuICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXdhaXQgdmlldy5ydW5RdWlja0FjdGlvbihcIm5leHQtYWN0aW9uc1wiKTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucmVtZW1iZXJNYXJrZG93bkxlYWYodGhpcy5hcHAud29ya3NwYWNlLmdldE1vc3RSZWNlbnRMZWFmKCkpO1xyXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxyXG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJhY3RpdmUtbGVhZi1jaGFuZ2VcIiwgKGxlYWYpID0+IHtcclxuICAgICAgICB0aGlzLnJlbWVtYmVyTWFya2Rvd25MZWFmKGxlYWYpO1xyXG4gICAgICAgIHRoaXMucmVtZW1iZXJBY3RpdmVTZWxlY3Rpb24oKTtcclxuICAgICAgfSksXHJcbiAgICApO1xyXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxyXG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJmaWxlLW9wZW5cIiwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVtZW1iZXJBY3RpdmVTZWxlY3Rpb24oKTtcclxuICAgICAgICB2b2lkIHRoaXMucmVmcmVzaExpdmVWaWV3cygpO1xyXG4gICAgICB9KSxcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBMb2NhbEFnZW50U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG4gIH1cclxuXHJcbiAgbGFuZ3VhZ2UoKTogTGFuZ3VhZ2VDb2RlIHtcclxuICAgIHJldHVybiB0aGlzLnNldHRpbmdzLmxhbmd1YWdlID8/IERFRkFVTFRfU0VUVElOR1MubGFuZ3VhZ2U7XHJcbiAgfVxyXG5cclxuICBnZXRMb2NhbGUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmxhbmd1YWdlKCkgPT09IFwia29cIiA/IFwia28tS1JcIiA6IFwiZW4tVVNcIjtcclxuICB9XHJcblxyXG4gIHQoa2V5OiBzdHJpbmcsIHZhcnM6IFRyYW5zbGF0aW9uVmFycyA9IHt9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHRlbXBsYXRlTWFwID0ge1xyXG4gICAgICAuLi5XT1JLRkxPV19VSV9TVFJJTkdTLmVuLFxyXG4gICAgICAuLi5VSV9TVFJJTkdTLmVuLFxyXG4gICAgICAuLi4oV09SS0ZMT1dfVUlfU1RSSU5HU1t0aGlzLmxhbmd1YWdlKCldID8/IHt9KSxcclxuICAgICAgLi4uKFVJX1NUUklOR1NbdGhpcy5sYW5ndWFnZSgpXSA/PyB7fSksXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1hcFtrZXldID8/IGtleTtcclxuICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHsoXFx3KylcXH0vZywgKF9tYXRjaCwgbmFtZSkgPT4gU3RyaW5nKHZhcnNbbmFtZV0gPz8gXCJcIikpO1xyXG4gIH1cclxuXHJcbiAgZ2V0UXVpY2tBY3Rpb24oa2V5OiBRdWlja0FjdGlvbktleSk6IHsgbGFiZWw6IHN0cmluZzsgcHJvbXB0OiBzdHJpbmcgfSB7XHJcbiAgICByZXR1cm4gUVVJQ0tfQUNUSU9OU1t0aGlzLmxhbmd1YWdlKCldW2tleV07XHJcbiAgfVxyXG5cclxuICBnZXRMYXllckxhYmVsKGxheWVyOiBcInN1bW1hcnlcIiB8IFwicmF3XCIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGxheWVyID09PSBcInN1bW1hcnlcIiA/IHRoaXMudChcInNvdXJjZUxheWVyU3VtbWFyeVwiKSA6IHRoaXMudChcInNvdXJjZUxheWVyUmF3XCIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29udGV4dFNvdXJjZUxhYmVsKHNvdXJjZTogQ29udGV4dFNvdXJjZSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBtYXA6IFJlY29yZDxDb250ZXh0U291cmNlLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsaW5rczogXCJjb250ZXh0U291cmNlTGlua3NcIixcclxuICAgICAgZm9sZGVyOiBcImNvbnRleHRTb3VyY2VGb2xkZXJcIixcclxuICAgICAgdGFnczogXCJjb250ZXh0U291cmNlVGFnc1wiLFxyXG4gICAgICBiYWNrbGlua3M6IFwiY29udGV4dFNvdXJjZUJhY2tsaW5rc1wiLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGlzLnQobWFwW3NvdXJjZV0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0UmVzcG9uc2VMYW5ndWFnZUluc3RydWN0aW9uKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5sYW5ndWFnZSgpID09PSBcImtvXCJcclxuICAgICAgPyBcIkFuc3dlciBpbiBLb3JlYW4gdW5sZXNzIHRoZSB1c2VyJ3MgcmVxdWVzdCBleHBsaWNpdGx5IGFza3MgZm9yIGFub3RoZXIgbGFuZ3VhZ2UuXCJcclxuICAgICAgOiBcIkFuc3dlciBpbiBFbmdsaXNoIHVubGVzcyB0aGUgdXNlcidzIHJlcXVlc3QgZXhwbGljaXRseSBhc2tzIGZvciBhbm90aGVyIGxhbmd1YWdlLlwiO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVmcmVzaE9wZW5WaWV3cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGZvciAoY29uc3QgbGVhZiBvZiB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9MT0NBTF9BR0VOVCkpIHtcclxuICAgICAgY29uc3QgdmlldyA9IGxlYWYudmlldztcclxuICAgICAgaWYgKHZpZXcgaW5zdGFuY2VvZiBMb2NhbEFnZW50Vmlldykge1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgYXdhaXQgdmlldy5yZWZyZXNoVmlld1N0YXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlZnJlc2hMaXZlVmlld3MoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfTE9DQUxfQUdFTlQpKSB7XHJcbiAgICAgIGNvbnN0IHZpZXcgPSBsZWFmLnZpZXc7XHJcbiAgICAgIGlmICh2aWV3IGluc3RhbmNlb2YgTG9jYWxBZ2VudFZpZXcpIHtcclxuICAgICAgICBhd2FpdCB2aWV3LnJlZnJlc2hDb250ZXh0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIG9udW5sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfTE9DQUxfQUdFTlQpLnJlZHVjZShcclxuICAgICAgYXN5bmMgKHByZXYsIGxlYWYpID0+IHtcclxuICAgICAgICBhd2FpdCBwcmV2O1xyXG4gICAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHsgdHlwZTogXCJlbXB0eVwiIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRNYXJrZG93blZpZXdGcm9tTGVhZihsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCk6IE1hcmtkb3duVmlldyB8IG51bGwge1xyXG4gICAgcmV0dXJuIGxlYWY/LnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcgPyBsZWFmLnZpZXcgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmVtZW1iZXJTZWxlY3Rpb24oc2VsZWN0aW9uOiBzdHJpbmcsIGZpbGVQYXRoID0gXCJcIik6IHZvaWQge1xyXG4gICAgY29uc3QgdHJpbW1lZCA9IHNlbGVjdGlvbi50cmltKCk7XHJcbiAgICBpZiAoIXRyaW1tZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sYXN0RWRpdG9yU2VsZWN0aW9uID0gdHJpbW1lZDtcclxuICAgIHRoaXMubGFzdEVkaXRvclNlbGVjdGlvblBhdGggPSBmaWxlUGF0aDtcclxuICB9XHJcblxyXG4gIHJlbWVtYmVyQWN0aXZlU2VsZWN0aW9uKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGNvbnN0IHByZWZlcnJlZFZpZXcgPSB0aGlzLmdldE1hcmtkb3duVmlld0Zyb21MZWFmKHRoaXMuZ2V0UHJlZmVycmVkTWFya2Rvd25MZWFmKCkpO1xyXG4gICAgY29uc3QgYWN0aXZlU2VsZWN0aW9uID0gYWN0aXZlVmlldz8uZWRpdG9yPy5nZXRTZWxlY3Rpb24oKS50cmltKCkgPz8gXCJcIjtcclxuICAgIGlmIChhY3RpdmVTZWxlY3Rpb24pIHtcclxuICAgICAgdGhpcy5yZW1lbWJlclNlbGVjdGlvbihhY3RpdmVTZWxlY3Rpb24sIGFjdGl2ZVZpZXc/LmZpbGU/LnBhdGggPz8gXCJcIik7XHJcbiAgICAgIHJldHVybiBhY3RpdmVTZWxlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcHJlZmVycmVkU2VsZWN0aW9uID0gcHJlZmVycmVkVmlldz8uZWRpdG9yPy5nZXRTZWxlY3Rpb24oKS50cmltKCkgPz8gXCJcIjtcclxuICAgIGlmIChwcmVmZXJyZWRTZWxlY3Rpb24pIHtcclxuICAgICAgdGhpcy5yZW1lbWJlclNlbGVjdGlvbihwcmVmZXJyZWRTZWxlY3Rpb24sIHByZWZlcnJlZFZpZXc/LmZpbGU/LnBhdGggPz8gXCJcIik7XHJcbiAgICAgIHJldHVybiBwcmVmZXJyZWRTZWxlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG5cclxuICBnZXRBY3RpdmVTZWxlY3Rpb24oKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGN1cnJlbnRTZWxlY3Rpb24gPSB0aGlzLnJlbWVtYmVyQWN0aXZlU2VsZWN0aW9uKCk7XHJcbiAgICBpZiAoY3VycmVudFNlbGVjdGlvbikge1xyXG4gICAgICByZXR1cm4gY3VycmVudFNlbGVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhY3RpdmVWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcclxuICAgIGNvbnN0IHByZWZlcnJlZFZpZXcgPSB0aGlzLmdldE1hcmtkb3duVmlld0Zyb21MZWFmKHRoaXMuZ2V0UHJlZmVycmVkTWFya2Rvd25MZWFmKCkpO1xyXG4gICAgY29uc3QgY2FuZGlkYXRlUGF0aCA9IGFjdGl2ZVZpZXc/LmZpbGU/LnBhdGggPz8gcHJlZmVycmVkVmlldz8uZmlsZT8ucGF0aCA/PyBcIlwiO1xyXG4gICAgaWYgKGNhbmRpZGF0ZVBhdGggJiYgdGhpcy5sYXN0RWRpdG9yU2VsZWN0aW9uUGF0aCAmJiBjYW5kaWRhdGVQYXRoID09PSB0aGlzLmxhc3RFZGl0b3JTZWxlY3Rpb25QYXRoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmxhc3RFZGl0b3JTZWxlY3Rpb247XHJcbiAgICB9XHJcbiAgICByZXR1cm4gXCJcIjtcclxuICB9XHJcblxyXG4gIGFzeW5jIGFjdGl2YXRlVmlldygpOiBQcm9taXNlPExvY2FsQWdlbnRWaWV3IHwgbnVsbD4ge1xyXG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xyXG4gICAgbGV0IGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9MT0NBTF9BR0VOVClbMF07XHJcblxyXG4gICAgaWYgKCFsZWFmKSB7XHJcbiAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKTtcclxuICAgICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEVfTE9DQUxfQUdFTlQsIGFjdGl2ZTogdHJ1ZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICB3b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcclxuICAgIGNvbnN0IHZpZXcgPSBsZWFmLnZpZXc7XHJcbiAgICByZXR1cm4gdmlldyBpbnN0YW5jZW9mIExvY2FsQWdlbnRWaWV3ID8gdmlldyA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBhc3luYyBvcGVuRmlsZUZyb21Tb3VyY2UoZmlsZTogVEZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLnNldHRpbmdzLnNvdXJjZU9wZW5Nb2RlID09PSBcImN1cnJlbnRcIikge1xyXG4gICAgICBjb25zdCBsZWFmID0gdGhpcy5nZXRQcmVmZXJyZWRNYXJrZG93bkxlYWYoKTtcclxuICAgICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlLCB7IGFjdGl2ZTogdHJ1ZSB9KTtcclxuICAgICAgdGhpcy5yZW1lbWJlck1hcmtkb3duTGVhZihsZWFmKTtcclxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zb3VyY2VPcGVuTW9kZSA9PT0gXCJ0YWJcIikge1xyXG4gICAgICBjb25zdCBhbmNob3JMZWFmID0gdGhpcy5nZXRQcmVmZXJyZWRNYXJrZG93bkxlYWYoKTtcclxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLnNldEFjdGl2ZUxlYWYoYW5jaG9yTGVhZiwgeyBmb2N1czogZmFsc2UgfSk7XHJcbiAgICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZih0cnVlKTtcclxuICAgICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlLCB7IGFjdGl2ZTogdHJ1ZSB9KTtcclxuICAgICAgdGhpcy5yZW1lbWJlck1hcmtkb3duTGVhZihsZWFmKTtcclxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCB0aGlzLm9wZW5GaWxlSW5TcGxpdChmaWxlKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIG9wZW5GaWxlSW5TcGxpdChmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgYW5jaG9yTGVhZiA9IHRoaXMuZ2V0UHJlZmVycmVkTWFya2Rvd25MZWFmKCk7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLnNldHRpbmdzLnNwbGl0RGlyZWN0aW9uO1xyXG4gICAgY29uc3Qgc3BsaXQgPSBkaXJlY3Rpb24gPT09IFwiZG93blwiID8gXCJob3Jpem9udGFsXCIgOiBcInZlcnRpY2FsXCI7XHJcbiAgICBjb25zdCBsZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmNyZWF0ZUxlYWZCeVNwbGl0KGFuY2hvckxlYWYsIHNwbGl0LCBkaXJlY3Rpb24gPT09IFwibGVmdFwiKTtcclxuICAgIGF3YWl0IGxlYWYub3BlbkZpbGUoZmlsZSwgeyBhY3RpdmU6IHRydWUgfSk7XHJcbiAgICB0aGlzLnJlbWVtYmVyTWFya2Rvd25MZWFmKGxlYWYpO1xyXG4gICAgdGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XHJcbiAgfVxyXG5cclxuICByZW1lbWJlck1hcmtkb3duTGVhZihsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgaWYgKGxlYWY/LnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcclxuICAgICAgdGhpcy5sYXN0TWFya2Rvd25MZWFmID0gbGVhZjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldFByZWZlcnJlZE1hcmtkb3duTGVhZigpOiBXb3Jrc3BhY2VMZWFmIHtcclxuICAgIGNvbnN0IGFjdGl2ZU1hcmtkb3duVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcbiAgICBpZiAoYWN0aXZlTWFya2Rvd25WaWV3Py5sZWFmKSB7XHJcbiAgICAgIHRoaXMubGFzdE1hcmtkb3duTGVhZiA9IGFjdGl2ZU1hcmtkb3duVmlldy5sZWFmO1xyXG4gICAgICByZXR1cm4gYWN0aXZlTWFya2Rvd25WaWV3LmxlYWY7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubGFzdE1hcmtkb3duTGVhZj8udmlldyBpbnN0YW5jZW9mIE1hcmtkb3duVmlldykge1xyXG4gICAgICByZXR1cm4gdGhpcy5sYXN0TWFya2Rvd25MZWFmO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpcnN0TWFya2Rvd25MZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpWzBdO1xyXG4gICAgaWYgKGZpcnN0TWFya2Rvd25MZWFmKSB7XHJcbiAgICAgIHRoaXMubGFzdE1hcmtkb3duTGVhZiA9IGZpcnN0TWFya2Rvd25MZWFmO1xyXG4gICAgICByZXR1cm4gZmlyc3RNYXJrZG93bkxlYWY7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHJlc29sdmVWYXVsdEZpbGUocmF3UGF0aDogc3RyaW5nKTogVEZpbGUgfCBudWxsIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSByYXdQYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpLnRyaW0oKTtcclxuICAgIGNvbnN0IGRpcmVjdCA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3JtYWxpemVkKTtcclxuICAgIGlmIChkaXJlY3QgaW5zdGFuY2VvZiBURmlsZSkge1xyXG4gICAgICByZXR1cm4gZGlyZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy5nZXRWYXVsdEJhc2VQYXRoKCk7XHJcbiAgICBpZiAoYmFzZVBhdGgpIHtcclxuICAgICAgY29uc3QgYmFzZU5vcm1hbGl6ZWQgPSBiYXNlUGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgICAgaWYgKG5vcm1hbGl6ZWQuc3RhcnRzV2l0aChiYXNlTm9ybWFsaXplZCkpIHtcclxuICAgICAgICBjb25zdCByZWxhdGl2ZSA9IG5vcm1hbGl6ZWQuc2xpY2UoYmFzZU5vcm1hbGl6ZWQubGVuZ3RoKS5yZXBsYWNlKC9eXFwvKy8sIFwiXCIpO1xyXG4gICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChyZWxhdGl2ZSk7XHJcbiAgICAgICAgaWYgKHJlbGF0aXZlRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVsYXRpdmVGaWxlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgZ2V0VmF1bHRCYXNlUGF0aCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLmFwcC52YXVsdC5hZGFwdGVyIGFzIHsgZ2V0QmFzZVBhdGg/OiAoKSA9PiBzdHJpbmcgfTtcclxuICAgIGlmICh0eXBlb2YgYWRhcHRlci5nZXRCYXNlUGF0aCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIHJldHVybiBub3JtYWxpemVQYXRoKGFkYXB0ZXIuZ2V0QmFzZVBhdGgoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHJlc29sdmVWYXVsdEZvbGRlclBhdGgocmF3UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKChyYXdQYXRoIHx8IFwiXCIpLnRyaW0oKSk7XHJcbiAgICBpZiAoL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KG5vcm1hbGl6ZWQpIHx8IG5vcm1hbGl6ZWQuc3RhcnRzV2l0aChcIi9cIikpIHtcclxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XHJcbiAgICB9XHJcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMuZ2V0VmF1bHRCYXNlUGF0aCgpO1xyXG4gICAgaWYgKCFiYXNlUGF0aCkge1xyXG4gICAgICByZXR1cm4gbm9ybWFsaXplZDtcclxuICAgIH1cclxuICAgIHJldHVybiBub3JtYWxpemVkID8gbm9ybWFsaXplUGF0aChgJHtiYXNlUGF0aH0vJHtub3JtYWxpemVkfWApIDogYmFzZVBhdGg7XHJcbiAgfVxyXG5cclxuICBtYWtlV2lraUxpbmsoZmlsZTogVEZpbGUsIGxhYmVsPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHRhcmdldCA9IGZpbGUucGF0aC5yZXBsYWNlKC9cXC5tZCQvaSwgXCJcIik7XHJcbiAgICByZXR1cm4gYFtbJHt0YXJnZXR9JHtsYWJlbCA/IGB8JHtsYWJlbH1gIDogXCJcIn1dXWA7XHJcbiAgfVxyXG5cclxuICBtYWtlVmF1bHRMaW5rT3JDb2RlKHJhd1BhdGg6IHN0cmluZywgbGFiZWw/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmVWYXVsdEZpbGUocmF3UGF0aCk7XHJcbiAgICBpZiAoIXJlc29sdmVkKSB7XHJcbiAgICAgIHJldHVybiBgXFxgJHtyYXdQYXRofVxcYGA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5tYWtlV2lraUxpbmsocmVzb2x2ZWQsIGxhYmVsID8/IHJlc29sdmVkLmJhc2VuYW1lKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGVuc3VyZUZvbGRlcihmb2xkZXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IHBhcnRzID0gZm9sZGVyUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgbGV0IGN1cnJlbnQgPSBcIlwiO1xyXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50ID8gYCR7Y3VycmVudH0vJHtwYXJ0fWAgOiBwYXJ0O1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChjdXJyZW50KTtcclxuICAgICAgaWYgKCFleGlzdGluZykge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihjdXJyZW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvYWRlZCA9IChhd2FpdCB0aGlzLmxvYWREYXRhKCkpIGFzIExvY2FsQWdlbnRQbHVnaW5EYXRhIHwgbnVsbDtcbiAgICBjb25zdCByYXdTZXR0aW5ncyA9IChsb2FkZWQ/LnNldHRpbmdzID8/IGxvYWRlZCA/PyB7fSkgYXMgUGFydGlhbDxMb2NhbEFnZW50U2V0dGluZ3M+O1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAuLi5ERUZBVUxUX1NFVFRJTkdTLFxuICAgICAgLi4ucmF3U2V0dGluZ3MsXG4gICAgICBzY29wZXM6IHtcbiAgICAgICAgLi4uREVGQVVMVF9TRVRUSU5HUy5zY29wZXMsXG4gICAgICAgIC4uLihyYXdTZXR0aW5ncz8uc2NvcGVzID8/IHt9KSxcbiAgICAgIH0sXG4gICAgfTtcbiAgICB0aGlzLmNoYXRUaHJlYWRzID0gQXJyYXkuaXNBcnJheShsb2FkZWQ/LmNoYXRUaHJlYWRzKSA/IGxvYWRlZC5jaGF0VGhyZWFkcyA6IFtdO1xuICAgIHRoaXMuYWN0aXZlQ2hhdFRocmVhZElkID0gdHlwZW9mIGxvYWRlZD8uYWN0aXZlQ2hhdFRocmVhZElkID09PSBcInN0cmluZ1wiID8gbG9hZGVkLmFjdGl2ZUNoYXRUaHJlYWRJZCA6IFwiXCI7XG4gICAgdGhpcy5lbnN1cmVDaGF0VGhyZWFkcygpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEoe1xuICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICBjaGF0VGhyZWFkczogdGhpcy5jaGF0VGhyZWFkcyxcbiAgICAgIGFjdGl2ZUNoYXRUaHJlYWRJZDogdGhpcy5hY3RpdmVDaGF0VGhyZWFkSWQsXG4gICAgfSBzYXRpc2ZpZXMgTG9jYWxBZ2VudFBsdWdpbkRhdGEpO1xuICB9XG5cbiAgY3JlYXRlQ2hhdFRocmVhZCh0aXRsZT86IHN0cmluZyk6IENoYXRUaHJlYWRSZWNvcmQge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGB0aHJlYWQtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWAsXG4gICAgICB0aXRsZTogKHRpdGxlIHx8IHRoaXMudChcInRocmVhZFVudGl0bGVkXCIpKS50cmltKCksXG4gICAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICAgIHVwZGF0ZWRBdDogbm93LFxuICAgICAgdHVybnM6IFtdLFxuICAgIH07XG4gIH1cblxuICBlbnN1cmVDaGF0VGhyZWFkcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jaGF0VGhyZWFkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGluaXRpYWwgPSB0aGlzLmNyZWF0ZUNoYXRUaHJlYWQoKTtcbiAgICAgIHRoaXMuY2hhdFRocmVhZHMgPSBbaW5pdGlhbF07XG4gICAgICB0aGlzLmFjdGl2ZUNoYXRUaHJlYWRJZCA9IGluaXRpYWwuaWQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc29ydENoYXRUaHJlYWRzQnlSZWNlbnQoKTtcbiAgICBpZiAoIXRoaXMuY2hhdFRocmVhZHMuc29tZSgodGhyZWFkKSA9PiB0aHJlYWQuaWQgPT09IHRoaXMuYWN0aXZlQ2hhdFRocmVhZElkKSkge1xuICAgICAgdGhpcy5hY3RpdmVDaGF0VGhyZWFkSWQgPSB0aGlzLmNoYXRUaHJlYWRzWzBdLmlkO1xuICAgIH1cbiAgfVxuXG4gIGdldENoYXRUaHJlYWQodGhyZWFkSWQ6IHN0cmluZyk6IENoYXRUaHJlYWRSZWNvcmQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jaGF0VGhyZWFkcy5maW5kKCh0aHJlYWQpID0+IHRocmVhZC5pZCA9PT0gdGhyZWFkSWQpID8/IG51bGw7XG4gIH1cblxuICBzb3J0Q2hhdFRocmVhZHNCeVJlY2VudCgpOiB2b2lkIHtcbiAgICB0aGlzLmNoYXRUaHJlYWRzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShiLnVwZGF0ZWRBdCB8fCBiLmNyZWF0ZWRBdCkuZ2V0VGltZSgpIC0gbmV3IERhdGUoYS51cGRhdGVkQXQgfHwgYS5jcmVhdGVkQXQpLmdldFRpbWUoKTtcbiAgICB9KTtcbiAgfVxufVxyXG5cclxuXHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUMsc0JBY007QUFDUCxnQ0FBc0I7QUFDdEIscUJBQTJCO0FBQzNCLFdBQXNCO0FBQ3RCLFlBQXVCO0FBRXZCLElBQU0sd0JBQXdCO0FBQzlCLElBQU0saUJBQWlCO0FBQ3ZCLElBQU0seUJBQXlCO0FBQy9CLElBQU0saUNBQWlDLG9CQUFJLElBQUksQ0FBQyxNQUFNLE9BQU8sSUFBSSxDQUFDO0FBQ2xFLElBQU0sOEJBQThCLG9CQUFJLElBQUk7QUFBQSxFQUMxQztBQUFBLEVBQU07QUFBQSxFQUFPO0FBQUEsRUFBTTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFRO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFRO0FBQUEsRUFDNUU7QUFBQSxFQUFPO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQU87QUFBQSxFQUFPO0FBQUEsRUFBUTtBQUFBLEVBQVE7QUFBQSxFQUFPO0FBQUEsRUFDeEU7QUFBQSxFQUFNO0FBQUEsRUFBTTtBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFBSztBQUFBLEVBQU87QUFBQSxFQUFLO0FBQUEsRUFBTztBQUFBLEVBQU07QUFBQSxFQUFPO0FBQ2pFLENBQUM7QUEwREQsSUFBTSxtQkFBdUM7QUFBQSxFQUMzQyxVQUFVO0FBQUEsRUFDVixZQUFZO0FBQUEsRUFDWixrQkFBa0I7QUFBQSxFQUNsQixtQkFBbUI7QUFBQSxFQUNuQixtQkFBbUI7QUFBQSxFQUNuQixtQkFBbUI7QUFBQSxFQUNuQixnQkFBZ0I7QUFBQSxFQUNoQixZQUFZO0FBQUEsRUFDWixpQkFBaUI7QUFBQSxFQUNqQixnQkFBZ0I7QUFBQSxFQUNoQixnQkFBZ0I7QUFBQSxFQUNoQixRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsRUFDYjtBQUNGO0FBS0EsSUFBTSxhQUFhO0FBQUEsRUFDakIsSUFBSTtBQUFBLElBQ0YsWUFBWTtBQUFBLElBQ1osaUJBQWlCO0FBQUEsSUFDakIsWUFBWTtBQUFBLElBQ1osdUJBQXVCO0FBQUEsSUFDdkIsb0JBQW9CO0FBQUEsSUFDcEIsa0JBQWtCO0FBQUEsSUFDbEIscUJBQXFCO0FBQUEsSUFDckIsV0FBVztBQUFBLElBQ1gsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsc0JBQXNCO0FBQUEsSUFDdEIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIseUJBQXlCO0FBQUEsSUFDekIsbUJBQW1CO0FBQUEsSUFDbkIsMkJBQTJCO0FBQUEsSUFDM0IseUJBQXlCO0FBQUEsSUFDekIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsZ0JBQWdCO0FBQUEsSUFDaEIsNkJBQTZCO0FBQUEsSUFDN0IsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsZ0JBQWdCO0FBQUEsSUFDaEIsNkJBQTZCO0FBQUEsSUFDN0Isc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IsMEJBQTBCO0FBQUEsSUFDMUIsaUJBQWlCO0FBQUEsSUFDakIsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsdUJBQXVCO0FBQUEsSUFDdkIsdUJBQXVCO0FBQUEsSUFDdkIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsb0JBQW9CO0FBQUEsSUFDcEIsV0FBVztBQUFBLElBQ1gsZ0JBQWdCO0FBQUEsSUFDaEIsYUFBYTtBQUFBLElBQ2Isb0JBQW9CO0FBQUEsSUFDcEIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsaUJBQWlCO0FBQUEsSUFDakIsbUJBQW1CO0FBQUEsSUFDbkIsbUJBQW1CO0FBQUEsSUFDbkIsZUFBZTtBQUFBLElBQ2Ysd0JBQXdCO0FBQUEsSUFDeEIsbUJBQW1CO0FBQUEsSUFDbkIsYUFBYTtBQUFBLElBQ2Isb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osaUJBQWlCO0FBQUEsSUFDakIsZUFBZTtBQUFBLElBQ2Ysa0JBQWtCO0FBQUEsSUFDbEIscUJBQXFCO0FBQUEsSUFDckIsdUJBQXVCO0FBQUEsSUFDdkIsZ0JBQWdCO0FBQUEsSUFDaEIsWUFBWTtBQUFBLElBQ1osaUJBQWlCO0FBQUEsSUFDakIsb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIsbUJBQW1CO0FBQUEsSUFDbkIsd0JBQXdCO0FBQUEsSUFDeEIsc0JBQXNCO0FBQUEsSUFDdEIsbUJBQW1CO0FBQUEsSUFDbkIsd0JBQXdCO0FBQUEsSUFDeEIsc0JBQXNCO0FBQUEsSUFDdEIsMkJBQTJCO0FBQUEsSUFDM0IscUJBQXFCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsd0JBQXdCO0FBQUEsSUFDeEIsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IsaUJBQWlCO0FB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SUFDaEIsc0JBQXNCO0FBQUEsSUFDdEIsb0JBQW9CO0FBQUEsSUFDcEIsMEJBQTBCO0FBQUEsSUFDMUIsbUJBQW1CO0FBQUEsSUFDbkIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsY0FBYztBQUFBLElBQ2Qsd0JBQXdCO0FBQUEsSUFDeEIsd0JBQXdCO0FBQUEsSUFDeEIsMEJBQTBCO0FBQUEsSUFDMUIsMEJBQTBCO0FBQUEsSUFDMUIscUJBQXFCO0FBQUEsSUFDckIsd0JBQXdCO0FBQUEsSUFDeEIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsNkJBQTZCO0FBQUEsSUFDN0Isd0JBQXdCO0FBQUEsSUFDeEIseUJBQXlCO0FBQUEsSUFDekIsMEJBQTBCO0FBQUEsSUFDMUIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0IsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIsMEJBQTBCO0FBQUEsSUFDMUIsNEJBQTRCO0FBQUEsSUFDNUIsZ0NBQWdDO0FBQUEsSUFDaEMsZ0NBQWdDO0FBQUEsSUFDaEMsNEJBQTRCO0FBQUEsSUFDNUIsMkJBQTJCO0FBQUEsSUFDM0IsOEJBQThCO0FBQUEsSUFDOUIsK0JBQStCO0FBQUEsSUFDL0IsYUFBYTtBQUFBLElBQ2Isb0JBQW9CO0FBQUEsSUFDcEIsdUJBQXVCO0FBQUEsSUFDdkIsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsNEJBQTRCO0FBQUEsSUFDNUIsbUJBQW1CO0FBQUEsSUFDbkIsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsY0FBYztBQUFBLElBQ2Qsb0JBQW9CO0FBQUEsSUFDcEIsaUJBQWlCO0FBQUEsSUFDakIsdUJBQXVCO0FBQUEsSUFDdkIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsMkJBQTJCO0FBQUEsSUFDM0Isc0JBQXNCO0FBQUEsSUFDdEIsb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIsZ0JBQWdCO0FBQUEsSUFDaEIsYUFBYTtBQUFBLElBQ2Isc0JBQXNCO0FBQUEsSUFDdEIsdUJBQXVCO0FBQUEsSUFDdkIsbUJBQW1CO0FBQUEsSUFDbkIsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLElBQ2YscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIseUJBQXlCO0FBQUEsSUFDekIsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsaUJBQWlCO0FBQUEsSUFDakIsZUFBZTtBQUFBLElBQ2YscUJBQXFCO0FBQUEsSUFDckIsa0JBQWtCO0FBQUEsSUFDbEIsV0FBVztBQUFBLElBQ1gsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsZUFBZTtBQUFBLElBQ2YsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osbUJBQW1CO0FBQUEsSUFDbkIsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1osZ0JBQWdCO0FBQUEsSUFDaEIsaUJBQWlCO0FBQUEsSUFDakIsZUFBZTtBQUFBLElBQ2YsNEJBQTRCO0FBQUEsSUFDNUIsMkJBQTJCO0FBQUEsSUFDM0IsNEJBQTRCO0FBQUEsSUFDNUIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0IsMEJBQTBCO0FBQUEsSUFDMUIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1C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QUFRLFlBQVksVUFBVSxDQUFDO0FBQ3BELFNBQUssV0FBVztBQUFBLE1BQ2QsR0FBRztBQUFBLE1BQ0gsR0FBRztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ04sR0FBRyxpQkFBaUI7QUFBQSxRQUNwQixHQUFJLGFBQWEsVUFBVSxDQUFDO0FBQUEsTUFDOUI7QUFBQSxJQUNGO0FBQ0EsU0FBSyxjQUFjLE1BQU0sUUFBUSxRQUFRLFdBQVcsSUFBSSxPQUFPLGNBQWMsQ0FBQztBQUM5RSxTQUFLLHFCQUFxQixPQUFPLFFBQVEsdUJBQXVCLFdBQVcsT0FBTyxxQkFBcUI7QUFDdkcsU0FBSyxrQkFBa0I7QUFBQSxFQUN6QjtBQUFBLEVBRUEsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUztBQUFBLE1BQ2xCLFVBQVUsS0FBSztBQUFBLE1BQ2YsYUFBYSxLQUFLO0FBQUEsTUFDbEIsb0JBQW9CLEtBQUs7QUFBQSxJQUMzQixDQUFnQztBQUFBLEVBQ2xDO0FBQUEsRUFFQSxpQkFBaUIsT0FBa0M7QUFDakQsVUFBTSxPQUFNLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQ25DLFdBQU87QUFBQSxNQUNMLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFBQSxNQUNsRSxRQUFRLFNBQVMsS0FBSyxFQUFFLGdCQUFnQixHQUFHLEtBQUs7QUFBQSxNQUNoRCxXQUFXO0FBQUEsTUFDWCxXQUFXO0FBQUEsTUFDWCxPQUFPLENBQUM7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBRUEsb0JBQTBCO0FBQ3hCLFFBQUksS0FBSyxZQUFZLFdBQVcsR0FBRztBQUNqQyxZQUFNLFVBQVUsS0FBSyxpQkFBaUI7QUFDdEMsV0FBSyxjQUFjLENBQUMsT0FBTztBQUMzQixXQUFLLHFCQUFxQixRQUFRO0FBQ2xDO0FBQUEsSUFDRjtBQUNBLFNBQUssd0JBQXdCO0FBQzdCLFFBQUksQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFdBQVcsT0FBTyxPQUFPLEtBQUssa0JBQWtCLEdBQUc7QUFDN0UsV0FBSyxxQkFBcUIsS0FBSyxZQUFZLENBQUMsRUFBRTtBQUFBLElBQ2hEO0FBQUEsRUFDRjtBQUFBLEVBRUEsY0FBYyxVQUEyQztBQUN2RCxXQUFPLEtBQUssWUFBWSxLQUFLLENBQUMsV0FBVyxPQUFPLE9BQU8sUUFBUSxLQUFLO0FBQUEsRUFDdEU7QUFBQSxFQUVBLDBCQUFnQztBQUM5QixTQUFLLFlBQVksS0FBSyxDQUFDLEdBQUcsTUFBTTtBQUM5QixhQUFPLElBQUksS0FBSyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUTtBQUFBLElBQ3ZHLENBQUM7QUFBQSxFQUNIO0FBQ0Y7IiwKICAibmFtZXMiOiBbInRvb2xiYXJFbCIsICJyZXN1bHQiXQp9Cg==
