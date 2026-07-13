"use strict";

const APP_VERSION = "v101";
const MIDI_MIN = 21;
const MIDI_MAX = 108;
const DEFAULT_WHITE_KEY_WIDTH_PX = 38;
const LANDSCAPE_VISIBLE_WHITE_KEYS = 42;
const TABLET_PORTRAIT_VISIBLE_WHITE_KEYS = 28;
const PHONE_PORTRAIT_VISIBLE_WHITE_KEYS = 21;
const LEFT_PEDAL_CONTROLLERS = new Set([65, 66, 67, 68, 69]);
const HARDWARE_PEDAL_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  " ",
  "Spacebar",
  "Enter",
  "NumpadEnter",
  "Unidentified",
  "MediaPlayPause"
]);
const HARDWARE_PEDAL_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Space",
  "Enter",
  "NumpadEnter",
  "MediaPlayPause",
  "75",
  "78",
  "79",
  "80",
  "81",
  "82",
  "40",
  "44",
  "88",
  "89",
  "select",
  "playPause",
  "leftArrow",
  "rightArrow",
  "upArrow",
  "downArrow",
  "Unidentified"
]);
const HARDWARE_PEDAL_DEBOUNCE_MS = 420;
const WHITE_PATTERN = new Set([0, 2, 4, 5, 7, 9, 11]);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const XML_STEP_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const KEY_RANGE = { min: MIDI_MIN, max: MIDI_MAX };
const SETTINGS_KEY = "piano-midi-staff-settings";
const MIDI_PPQ = 480;
const RECORDING_BPM = 120;
const DISPLAY_FILENAME_MAX = 50;
const SUSTAIN_PEDAL_PAGE_DEBOUNCE_MS = 260;
const AUTO_FOLLOW_ANIMATION_MS = 260;
const ARPEGGIO_DISPLAY_WINDOW_RATIO = 0.125;
const SETTINGS_FIELD_KEYS = {
  keySignature: "piano-midi-staff-key-signature",
  showDegrees: "piano-midi-staff-show-degrees",
  noteLabelMode: "piano-midi-staff-note-label-mode",
  selectedInputId: "piano-midi-staff-midi-input",
  pedalStep: "piano-midi-staff-pedal-step",
  sustainPedalPage: "piano-midi-staff-sustain-pedal-page",
  autoFollowMode: "piano-midi-staff-auto-follow-mode",
  autoFollowTolerance: "piano-midi-staff-auto-follow-tolerance",
  timeSignature: "piano-midi-staff-time-signature",
  language: "piano-midi-staff-language"
};
const MAJOR_SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_KEY_SIGNATURES = {
  C: { tones: [0, 2, 4, 5, 7, 9, 11], accidental: "", count: 0 },
  G: { tones: [7, 9, 11, 0, 2, 4, 6], accidental: "#", count: 1 },
  D: { tones: [2, 4, 6, 7, 9, 11, 1], accidental: "#", count: 2 },
  A: { tones: [9, 11, 1, 2, 4, 6, 8], accidental: "#", count: 3 },
  E: { tones: [4, 6, 8, 9, 11, 1, 3], accidental: "#", count: 4 },
  B: { tones: [11, 1, 3, 4, 6, 8, 10], accidental: "#", count: 5 },
  F: { tones: [5, 7, 9, 10, 0, 2, 4], accidental: "b", count: 1 },
  Bb: { tones: [10, 0, 2, 3, 5, 7, 9], accidental: "b", count: 2 },
  Eb: { tones: [3, 5, 7, 8, 10, 0, 2], accidental: "b", count: 3 },
  Ab: { tones: [8, 10, 0, 1, 3, 5, 7], accidental: "b", count: 4 },
  Db: { tones: [1, 3, 5, 6, 8, 10, 0], accidental: "b", count: 5 },
  Gb: { tones: [6, 8, 10, 11, 1, 3, 5], accidental: "b", count: 6 }
};
const KEY_SIGNATURE_Y = {
  "#": {
    treble: { F: 180, C: 240, G: 160, D: 220, A: 280, E: 200, B: 260 },
    bass: { F: 460, C: 520, G: 440, D: 500, A: 420, E: 480, B: 540 }
  },
  b: {
    treble: { B: 260, E: 200, A: 280, D: 220, G: 300, C: 240, F: 320 },
    bass: { B: 540, E: 480, A: 560, D: 500, G: 580, C: 520, F: 600 }
  }
};
const KEY_SIGNATURE_ORDER = {
  "#": ["F", "C", "G", "D", "A", "E", "B"],
  b: ["B", "E", "A", "D", "G", "C", "F"]
};
const LANGUAGE_LABELS = {
  zh: "中文",
  ja: "日本語",
  en: "EN"
};
const I18N = {
  zh: {
    "label.language": "语言",
    "label.midiInput": "MIDI 输入",
    "label.noteMark": "音符标记",
    "label.leftPedal": "左踏板翻页",
    "label.sustainPedal": "延音踏板翻页",
    "label.autoFollow": "自动跟随",
    "label.tolerance": "容错",
    "label.timeSignature": "拍号",
    "label.keySignature": "调号",
    "button.settings": "设置",
    "button.connect": "连接 MIDI",
    "button.record": "录 MIDI",
    "button.stopRecord": "停止 MIDI",
    "button.saveRecord": "保存 MIDI",
    "button.loadScore": "载入乐谱",
    "button.fullscreen": "全屏",
    "button.exitFullscreen": "退出全屏",
    "button.refresh": "更新",
    "button.install": "安装",
    "button.degree": "级数",
    "button.pitch": "音高",
    "button.none": "无",
    "button.on": "开",
    "button.off": "关",
    "button.measure": "一小节",
    "button.halfMeasure": "半小节",
    "button.halfPage": "半页",
    "button.page": "一页",
    "button.byBeat": "按格",
    "button.start": "开头",
    "button.play": "播放",
    "button.pause": "暂停",
    "button.stop": "停止",
    "option.autoSelect": "自动选择",
    "status.waiting": "等待连接 MIDI 键盘",
    "status.live": "实时显示",
    "status.measure": "{range} / {total} 小节 · {matched}/{visible}",
    "status.recording": "录制中...",
    "status.recorded": "录制完成：{count} 个音，点击保存 MIDI",
    "status.recordedEmpty": "录制完成：没有记录到音符",
    "status.savingIos": "正在打开 iOS 保存面板...",
    "status.midiGenerated": "MIDI 文件已生成",
    "status.loaded": "已载入：{name}",
    "status.loadedEmpty": "{type} 已载入，但没有找到可显示的音符",
    "status.loadFailed": "乐谱读取失败：{message}",
    "status.playUnsupported": "当前浏览器不支持网页播放。",
    "status.connectingIos": "正在连接 iOS MIDI...",
    "status.webMidiUnsupported": "iPad Safari 不能让网页读取 MIDI。蓝牙键盘已连接也只能给原生 CoreMIDI App 使用；请用电脑 Chrome/Edge，或做 iPad 原生版。",
    "status.requestingMidi": "正在请求 MIDI 权限...",
    "status.midiDenied": "MIDI 权限未开启：{message}",
    "status.fullscreenUnsupported": "当前浏览器不支持网页全屏，可以尝试添加到主屏幕使用。",
    "status.fullscreenFailed": "无法进入全屏：{message}",
    "status.noMidiInput": "没有发现 MIDI 输入。USB 线或蓝牙 MIDI 配对后再点连接。",
    "status.connected": "已连接：{name}",
    "status.leftPedalSignal": "左踏板信号：CC{controller}={value}",
    "status.leftPedalPage": "左踏板翻页：CC{controller}",
    "status.leftPedalKeyPage": "左踏板翻页：按键 {key}",
    "status.cacheFailed": "页面可使用，但离线缓存注册失败。",
    "status.refreshing": "正在获取最新版本...",
    "status.reloading": "正在重新载入页面..."
  },
  ja: {
    "label.language": "言語",
    "label.midiInput": "MIDI 入力",
    "label.noteMark": "音符表示",
    "label.leftPedal": "左ペダル送り",
    "label.sustainPedal": "サステイン送り",
    "label.autoFollow": "自動追従",
    "label.tolerance": "許容",
    "label.timeSignature": "拍子",
    "label.keySignature": "調号",
    "button.settings": "設定",
    "button.connect": "MIDI 接続",
    "button.record": "MIDI 録音",
    "button.stopRecord": "録音停止",
    "button.saveRecord": "MIDI 保存",
    "button.loadScore": "楽譜を読む",
    "button.fullscreen": "全画面",
    "button.exitFullscreen": "全画面終了",
    "button.refresh": "更新",
    "button.install": "インストール",
    "button.degree": "度数",
    "button.pitch": "音名",
    "button.none": "なし",
    "button.on": "オン",
    "button.off": "オフ",
    "button.measure": "1小節",
    "button.halfMeasure": "半小節",
    "button.halfPage": "半ページ",
    "button.page": "1ページ",
    "button.byBeat": "コマごと",
    "button.start": "先頭",
    "button.play": "再生",
    "button.pause": "一時停止",
    "button.stop": "停止",
    "option.autoSelect": "自動選択",
    "status.waiting": "MIDI キーボード接続待ち",
    "status.live": "リアルタイム表示",
    "status.measure": "{range} / {total} 小節 · {matched}/{visible}",
    "status.recording": "録音中...",
    "status.recorded": "録音完了：{count} 音。MIDI を保存できます",
    "status.recordedEmpty": "録音完了：音符は記録されませんでした",
    "status.savingIos": "iOS 保存画面を開いています...",
    "status.midiGenerated": "MIDI ファイルを生成しました",
    "status.loaded": "読み込みました：{name}",
    "status.loadedEmpty": "{type} を読み込みましたが、表示できる音符がありません",
    "status.loadFailed": "楽譜の読み込みに失敗：{message}",
    "status.playUnsupported": "このブラウザは再生に対応していません。",
    "status.connectingIos": "iOS MIDI に接続中...",
    "status.webMidiUnsupported": "iPad Safari では Web MIDI を読み取れません。Bluetooth キーボードはネイティブ CoreMIDI App で使用できます。PC の Chrome/Edge、または iPad ネイティブ版を使ってください。",
    "status.requestingMidi": "MIDI 権限を要求中...",
    "status.midiDenied": "MIDI 権限がありません：{message}",
    "status.fullscreenUnsupported": "このブラウザは全画面表示に対応していません。ホーム画面に追加して使ってみてください。",
    "status.fullscreenFailed": "全画面にできません：{message}",
    "status.noMidiInput": "MIDI 入力が見つかりません。USB または Bluetooth MIDI を接続してからもう一度押してください。",
    "status.connected": "接続済み：{name}",
    "status.leftPedalSignal": "左ペダル信号：CC{controller}={value}",
    "status.leftPedalPage": "左ペダル送り：CC{controller}",
    "status.leftPedalKeyPage": "左ペダル送り：キー {key}",
    "status.cacheFailed": "ページは使用できますが、オフラインキャッシュ登録に失敗しました。",
    "status.refreshing": "最新版を取得中...",
    "status.reloading": "ページを再読み込み中..."
  },
  en: {
    "label.language": "Language",
    "label.midiInput": "MIDI Input",
    "label.noteMark": "Note Label",
    "label.leftPedal": "Left Pedal Page",
    "label.sustainPedal": "Sustain Pedal Page",
    "label.autoFollow": "Auto Follow",
    "label.tolerance": "Tolerance",
    "label.timeSignature": "Time Signature",
    "label.keySignature": "Key",
    "button.settings": "Settings",
    "button.connect": "Connect MIDI",
    "button.record": "Record MIDI",
    "button.stopRecord": "Stop MIDI",
    "button.saveRecord": "Save MIDI",
    "button.loadScore": "Load Score",
    "button.fullscreen": "Fullscreen",
    "button.exitFullscreen": "Exit Fullscreen",
    "button.refresh": "Update",
    "button.install": "Install",
    "button.degree": "Degree",
    "button.pitch": "Pitch",
    "button.none": "None",
    "button.on": "On",
    "button.off": "Off",
    "button.measure": "Measure",
    "button.halfMeasure": "Half",
    "button.halfPage": "Half Page",
    "button.page": "Page",
    "button.byBeat": "By Cell",
    "button.start": "Start",
    "button.play": "Play",
    "button.pause": "Pause",
    "button.stop": "Stop",
    "option.autoSelect": "Auto Select",
    "status.waiting": "Waiting for MIDI keyboard",
    "status.live": "Live View",
    "status.measure": "{range} / {total} measures · {matched}/{visible}",
    "status.recording": "Recording...",
    "status.recorded": "Recorded {count} notes. Save MIDI when ready",
    "status.recordedEmpty": "Recording finished: no notes captured",
    "status.savingIos": "Opening iOS save panel...",
    "status.midiGenerated": "MIDI file generated",
    "status.loaded": "Loaded: {name}",
    "status.loadedEmpty": "{type} loaded, but no displayable notes were found",
    "status.loadFailed": "Score load failed: {message}",
    "status.playUnsupported": "This browser does not support web playback.",
    "status.connectingIos": "Connecting iOS MIDI...",
    "status.webMidiUnsupported": "iPad Safari cannot read Web MIDI. A Bluetooth keyboard can be used by native CoreMIDI apps. Use Chrome/Edge on a computer, or the native iPad app.",
    "status.requestingMidi": "Requesting MIDI permission...",
    "status.midiDenied": "MIDI permission is not enabled: {message}",
    "status.fullscreenUnsupported": "This browser does not support web fullscreen. Try adding it to the Home Screen.",
    "status.fullscreenFailed": "Could not enter fullscreen: {message}",
    "status.noMidiInput": "No MIDI input found. Connect USB or Bluetooth MIDI, then tap Connect again.",
    "status.connected": "Connected: {name}",
    "status.leftPedalSignal": "Left pedal signal: CC{controller}={value}",
    "status.leftPedalPage": "Left pedal page: CC{controller}",
    "status.leftPedalKeyPage": "Left pedal page: key {key}",
    "status.cacheFailed": "The page works, but offline cache registration failed.",
    "status.refreshing": "Getting the latest version...",
    "status.reloading": "Reloading page..."
  }
};
const STAFF_VIEWBOX = { width: 1760, height: 720 };
const STAFF_STEP_PX = 20;
const TREBLE_LINE_YS = [180, 220, 260, 300, 340];
const BASS_LINE_YS = [420, 460, 500, 540, 580];
const NOTE_RADIUS = 20;
const MEASURE_NOTE_LEFT_X = 500;
const MEASURE_NOTE_RIGHT_X = 1620;
const BEAT_GRID_TOP_Y = TREBLE_LINE_YS[0];
const BEAT_GRID_BOTTOM_Y = BASS_LINE_YS[4];
const KEY_SIGNATURE_START_X = 270;
const KEY_SIGNATURE_GAP_X = 20;
const PEDAL_TRACK_Y = 650;
const LEDGER_OCTAVE_LIMIT = STAFF_STEP_PX * 6;

function detectDeviceLanguage() {
  const language = String(navigator.language || navigator.userLanguage || "en").toLowerCase();
  if (language.startsWith("zh")) return "zh";
  if (language.startsWith("ja")) return "ja";
  return "en";
}

function normalizeLanguage(language) {
  return Object.prototype.hasOwnProperty.call(I18N, language) ? language : "en";
}

const state = {
  midiAccess: null,
  language: detectDeviceLanguage(),
  statusMessage: { key: "status.waiting", params: {} },
  selectedInputId: "",
  activeNotes: new Map(),
  releasedWhileSustained: new Set(),
  sustainDown: false,
  softPedalDown: false,
  keySignature: "C",
  noteLabelMode: "degree",
  pedalStep: "on",
  sustainPedalPage: "off",
  lastSustainPedalPageAt: 0,
  lastHardwarePedalAt: 0,
  autoFollowMode: "off",
  autoFollowTolerance: 50,
  autoFollow: {
    currentBeatStart: null,
    playedNotesByBeat: new Map(),
    animationFrame: 0,
    emptyAdvanceTimer: 0,
    animating: false,
    pausedAfterManualNavigation: false
  },
  deferredInstallPrompt: null,
  wakeLock: null,
  practice: {
    measures: [],
    notes: [],
    pedalEvents: [],
    currentMeasure: 0,
    filename: "",
    timeSignature: { numerator: 4, denominator: 4 },
    ticksPerQuarter: MIDI_PPQ,
    measureTicks: MIDI_PPQ * 4,
    microsecondsPerQuarter: 500000,
    viewStartTick: 0
  },
  playback: {
    audioContext: null,
    activeNodes: [],
    activeNotes: new Set(),
    visualNotes: [],
    pendingNotes: [],
    pendingNoteIndex: 0,
    stopTimer: 0,
    animationFrame: 0,
    playing: false,
    startTick: 0,
    endTick: 0,
    startedAtAudioTime: 0,
    startedAtPerformance: 0,
    lastVisualFrameAt: 0,
    secondsPerTick: 0
  },
  scorePointer: {
    active: false,
    pointerId: 0,
    startX: 0,
    startY: 0
  },
  recording: {
    active: false,
    startedAt: 0,
    events: [],
    lastBlobUrl: "",
    takeNumber: 1
  }
};

const els = {
  statusText: document.getElementById("statusText"),
  connectButton: document.getElementById("connectButton"),
  recordButton: document.getElementById("recordButton"),
  stopRecordButton: document.getElementById("stopRecordButton"),
  saveRecordButton: document.getElementById("saveRecordButton"),
  loadMidiButton: document.getElementById("loadMidiButton"),
  midiFileInput: document.getElementById("midiFileInput"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  refreshButton: document.getElementById("refreshButton"),
  installButton: document.getElementById("installButton"),
  startMeasureButton: document.getElementById("startMeasureButton"),
  playMeasureButton: document.getElementById("playMeasureButton"),
  pausePlaybackButton: document.getElementById("pausePlaybackButton"),
  playbackSlider: document.getElementById("playbackSlider"),
  playbackTime: document.getElementById("playbackTime"),
  measureStatus: document.getElementById("measureStatus"),
  versionBadge: document.getElementById("versionBadge"),
  settingsSummaryLabel: document.getElementById("settingsSummaryLabel"),
  languageLabel: document.getElementById("languageLabel"),
  languageButtons: [...document.querySelectorAll("[data-language]")],
  inputField: document.querySelector(".input-field"),
  inputSelect: document.getElementById("inputSelect"),
  keyButtons: [...document.querySelectorAll("[data-key-signature]")],
  modeButtons: [...document.querySelectorAll("[data-label-mode]")],
  pedalStepButtons: [...document.querySelectorAll("[data-pedal-step]")],
  sustainPedalPageButtons: [...document.querySelectorAll("[data-sustain-pedal-page]")],
  autoFollowButtons: [...document.querySelectorAll("[data-auto-follow-mode]")],
  toleranceSlider: document.getElementById("toleranceSlider"),
  toleranceValue: document.getElementById("toleranceValue"),
  timeSignatureButtons: [...document.querySelectorAll("[data-time-signature]")],
  scoreBoard: document.querySelector(".score-board"),
  staffSvg: document.getElementById("staffSvg"),
  keyboard: document.getElementById("keyboard")
};

function noteName(note) {
  const octave = Math.floor(note / 12) - 1;
  return `${NOTE_NAMES[note % 12]}${octave}`;
}

function t(key, params = {}) {
  const dictionary = I18N[state.language] || I18N.en;
  const template = dictionary[key] || I18N.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (
    Object.prototype.hasOwnProperty.call(params, name) ? params[name] : ""
  ));
}

function setStatusKey(key, params = {}) {
  state.statusMessage = { key, params };
  els.statusText.textContent = t(key, params);
  setStatusTone(statusToneForKey(key));
}

function setStatusTone(tone) {
  els.statusText.classList.toggle("status-alert", tone === "alert");
}

function statusToneForKey(key) {
  const alertKeys = new Set([
    "status.loadedEmpty",
    "status.loadFailed",
    "status.playUnsupported",
    "status.webMidiUnsupported",
    "status.midiDenied",
    "status.fullscreenUnsupported",
    "status.fullscreenFailed",
    "status.noMidiInput",
    "status.cacheFailed"
  ]);
  return alertKeys.has(key) ? "alert" : "info";
}

function updateText(node, text) {
  if (node) node.textContent = text;
}

function updateIconButtonLabel(node, text) {
  if (!node) return;
  node.setAttribute("aria-label", text);
  node.setAttribute("title", text);
}

function applyLanguage() {
  state.language = normalizeLanguage(state.language);
  document.documentElement.lang = state.language === "zh" ? "zh-Hans" : state.language;
  document.title = "Easy Piano";

  updateText(els.languageLabel, t("label.language"));
  updateText(els.settingsSummaryLabel, t("button.settings"));
  updateText(document.querySelector(".input-field span"), t("label.midiInput"));
  updateText(document.querySelector(".mode-field span"), t("label.noteMark"));
  updateText(document.querySelector(".pedal-field span"), t("label.leftPedal"));
  updateText(document.querySelector(".sustain-page-field span"), t("label.sustainPedal"));
  updateText(document.querySelector(".auto-follow-field span"), t("label.autoFollow"));
  updateText(document.querySelector(".tolerance-field span"), `${t("label.tolerance")} `);
  els.toleranceValue.textContent = `${state.autoFollowTolerance}%`;
  document.querySelector(".tolerance-field span").appendChild(els.toleranceValue);
  updateText(document.querySelector(".time-field span"), t("label.timeSignature"));
  updateText(document.querySelector(".key-field span"), t("label.keySignature"));

  updateText(els.connectButton, t("button.connect"));
  updateText(els.recordButton, t("button.record"));
  updateText(els.stopRecordButton, t("button.stopRecord"));
  updateText(els.saveRecordButton, t("button.saveRecord"));
  updateText(els.loadMidiButton, t("button.loadScore"));
  updateText(els.refreshButton, t("button.refresh"));
  updateText(els.installButton, t("button.install"));
  updateIconButtonLabel(els.startMeasureButton, t("button.start"));
  updateIconButtonLabel(els.playMeasureButton, t("button.play"));
  updateIconButtonLabel(els.pausePlaybackButton, t("button.pause"));

  document.querySelector('[data-label-mode="degree"]').textContent = t("button.degree");
  document.querySelector('[data-label-mode="pitch"]').textContent = t("button.pitch");
  document.querySelector('[data-label-mode="none"]').textContent = t("button.none");
  document.querySelector('[data-pedal-step="on"]').textContent = t("button.on");
  document.querySelector('[data-pedal-step="off"]').textContent = t("button.off");
  document.querySelector('[data-sustain-pedal-page="off"]').textContent = t("button.off");
  document.querySelector('[data-sustain-pedal-page="half"]').textContent = t("button.halfPage");
  document.querySelector('[data-sustain-pedal-page="page"]').textContent = t("button.page");
  document.querySelector('[data-auto-follow-mode="off"]').textContent = t("button.off");
  document.querySelector('[data-auto-follow-mode="beat"]').textContent = t("button.byBeat");

  els.inputSelect.options[0].textContent = t("option.autoSelect");
  els.languageButtons.forEach((button) => {
    const active = button.dataset.language === state.language;
    button.textContent = LANGUAGE_LABELS[button.dataset.language] || button.dataset.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  syncFullscreenButton();
  syncPracticeControls();
  if (state.statusMessage?.key) {
    setStatusKey(state.statusMessage.key, state.statusMessage.params);
  }
}

function accidentalForNote(note) {
  const pitchClass = note % 12;
  const key = MAJOR_KEY_SIGNATURES[state.keySignature] || MAJOR_KEY_SIGNATURES.C;
  if (key.tones.includes(pitchClass)) return "";
  if (!isWhite(note)) return key.accidental || "#";
  return "♮";
}

function degreeForNote(note) {
  const key = MAJOR_KEY_SIGNATURES[state.keySignature] || MAJOR_KEY_SIGNATURES.C;
  const tonic = key.tones[0];
  const semitone = (note % 12 - tonic + 12) % 12;
  const exactIndex = MAJOR_SCALE_OFFSETS.indexOf(semitone);
  if (exactIndex >= 0) return String(exactIndex + 1);

  const prefersFlat = key.accidental === "b";
  if (prefersFlat) {
    const nextIndex = MAJOR_SCALE_OFFSETS.findIndex((offset) => offset > semitone);
    return `b${(nextIndex >= 0 ? nextIndex : 0) + 1}`;
  }

  let previousIndex = MAJOR_SCALE_OFFSETS.length - 1;
  for (let index = 0; index < MAJOR_SCALE_OFFSETS.length; index += 1) {
    if (MAJOR_SCALE_OFFSETS[index] < semitone) previousIndex = index;
  }
  return `#${previousIndex + 1}`;
}

function isWhite(note) {
  return WHITE_PATTERN.has(note % 12);
}

function midiToStaffStep(note) {
  const octave = Math.floor(note / 12) - 1;
  const letter = NOTE_NAMES[note % 12][0];
  const letterIndex = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }[letter];
  return octave * 7 + letterIndex;
}

function yForNote(note, clef) {
  const step = midiToStaffStep(note);
  const reference = clef === "bass" ? midiToStaffStep(43) : midiToStaffStep(64);
  const referenceY = clef === "bass" ? BASS_LINE_YS[4] : TREBLE_LINE_YS[4];
  return referenceY - (step - reference) * STAFF_STEP_PX;
}

function preferredClef(note) {
  return note < 60 ? "bass" : "treble";
}

function createSvg(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function readSettings() {
  const settings = {};
  try {
    Object.assign(settings, JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}"));
  } catch {
    // Fall through to individual field recovery below.
  }
  try {
    const keySignature = window.localStorage.getItem(SETTINGS_FIELD_KEYS.keySignature);
    const showDegrees = window.localStorage.getItem(SETTINGS_FIELD_KEYS.showDegrees);
    const noteLabelMode = window.localStorage.getItem(SETTINGS_FIELD_KEYS.noteLabelMode);
    const selectedInputId = window.localStorage.getItem(SETTINGS_FIELD_KEYS.selectedInputId);
    const pedalStep = window.localStorage.getItem(SETTINGS_FIELD_KEYS.pedalStep);
    const sustainPedalPage = window.localStorage.getItem(SETTINGS_FIELD_KEYS.sustainPedalPage);
    const autoFollowMode = window.localStorage.getItem(SETTINGS_FIELD_KEYS.autoFollowMode);
    const autoFollowTolerance = window.localStorage.getItem(SETTINGS_FIELD_KEYS.autoFollowTolerance);
    const timeSignature = window.localStorage.getItem(SETTINGS_FIELD_KEYS.timeSignature);
    const language = window.localStorage.getItem(SETTINGS_FIELD_KEYS.language);
    if (keySignature) settings.keySignature = keySignature;
    if (["degree", "pitch", "none"].includes(noteLabelMode)) settings.noteLabelMode = noteLabelMode;
    if (showDegrees === "true" || showDegrees === "false") settings.showDegrees = showDegrees === "true";
    if (selectedInputId !== null) settings.selectedInputId = selectedInputId;
    if (["on", "off"].includes(pedalStep)) settings.pedalStep = pedalStep;
    if (["measure", "half"].includes(pedalStep)) settings.pedalStep = "on";
    if (["off", "half", "page"].includes(sustainPedalPage)) settings.sustainPedalPage = sustainPedalPage;
    if (["off", "beat"].includes(autoFollowMode)) settings.autoFollowMode = autoFollowMode;
    if (autoFollowTolerance !== null) settings.autoFollowTolerance = clampTolerance(autoFollowTolerance);
    if (/^\d+\/\d+$/.test(timeSignature || "")) settings.timeSignature = timeSignature;
    if (language) settings.language = normalizeLanguage(language);
  } catch {
    // Storage can be blocked in some browser modes; defaults are fine.
  }
  return settings;
}

function saveSettings() {
  const settings = {
    keySignature: state.keySignature,
    noteLabelMode: state.noteLabelMode,
    selectedInputId: state.selectedInputId,
    pedalStep: state.pedalStep,
    sustainPedalPage: state.sustainPedalPage,
    autoFollowMode: state.autoFollowMode,
    autoFollowTolerance: state.autoFollowTolerance,
    timeSignature: timeSignatureKey(state.practice.timeSignature),
    language: state.language
  };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.keySignature, settings.keySignature);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.showDegrees, String(settings.noteLabelMode === "degree"));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.noteLabelMode, settings.noteLabelMode);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.selectedInputId, settings.selectedInputId);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.pedalStep, settings.pedalStep);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.sustainPedalPage, settings.sustainPedalPage);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.autoFollowMode, settings.autoFollowMode);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.autoFollowTolerance, String(settings.autoFollowTolerance));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.timeSignature, settings.timeSignature);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.language, settings.language);
  } catch {
    // Settings are a convenience; the app should still work if storage is blocked.
  }
}

function syncControlsFromState() {
  els.inputSelect.value = state.selectedInputId;
  els.keyButtons.forEach((button) => {
    const active = button.dataset.keySignature === state.keySignature;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.modeButtons.forEach((button) => {
    const active = button.dataset.labelMode === state.noteLabelMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.pedalStepButtons.forEach((button) => {
    const active = button.dataset.pedalStep === state.pedalStep;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.sustainPedalPageButtons.forEach((button) => {
    const active = button.dataset.sustainPedalPage === state.sustainPedalPage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.autoFollowButtons.forEach((button) => {
    const active = button.dataset.autoFollowMode === state.autoFollowMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.toleranceSlider.value = String(state.autoFollowTolerance);
  els.toleranceValue.textContent = `${state.autoFollowTolerance}%`;
  els.timeSignatureButtons.forEach((button) => {
    const active = button.dataset.timeSignature === timeSignatureKey(state.practice.timeSignature);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function timeSignatureKey(timeSignature) {
  const numerator = Math.max(1, Number(timeSignature?.numerator) || 4);
  const denominator = Math.max(1, Number(timeSignature?.denominator) || 4);
  return `${numerator}/${denominator}`;
}

function parseTimeSignatureKey(value) {
  const [numeratorText, denominatorText] = String(value || "4/4").split("/");
  return {
    numerator: Math.max(1, Number(numeratorText) || 4),
    denominator: Math.max(1, Number(denominatorText) || 4)
  };
}

function clampTolerance(value) {
  return Math.max(0, Math.min(50, Math.round((Number(value) || 0) / 10) * 10));
}

function syncRecordingControls() {
  els.recordButton.classList.toggle("hidden", state.recording.active);
  els.stopRecordButton.classList.toggle("hidden", !state.recording.active);
  els.saveRecordButton.disabled = state.recording.active || !state.recording.events.length;
}

function syncPracticeControls() {
  const hasMeasures = state.practice.measures.length > 0;
  els.startMeasureButton.disabled = !hasMeasures || (state.practice.viewStartTick || 0) <= 0;
  els.playMeasureButton.disabled = !hasMeasures || state.playback.playing;
  updateIconButtonLabel(els.playMeasureButton, t("button.play"));
  els.pausePlaybackButton.disabled = !state.playback.playing;
  updateIconButtonLabel(els.pausePlaybackButton, t("button.pause"));
  syncPlaybackScrubber();

  if (!hasMeasures) {
    els.measureStatus.textContent = t("status.live");
    return;
  }

  const total = state.practice.measures.length;
  const visibleNotes = visiblePracticeTargets();
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const startMeasure = Math.max(1, Math.floor((state.practice.viewStartTick || 0) / measureTicks) + 1);
  const endMeasure = Math.min(total, Math.floor(((state.practice.viewStartTick || 0) + measureTicks - 1) / measureTicks) + 1);
  const rangeLabel = startMeasure === endMeasure ? `${startMeasure}` : `${startMeasure}-${endMeasure}`;
  const matched = visibleNotes.filter((note) => isAutoFollowTargetMatched(note)).length;
  els.measureStatus.textContent = t("status.measure", {
    range: rangeLabel,
    total,
    matched,
    visible: visibleNotes.length
  });
}

function applySavedSettings() {
  const settings = readSettings();
  if (typeof settings.language === "string") {
    state.language = normalizeLanguage(settings.language);
  }
  if (MAJOR_KEY_SIGNATURES[settings.keySignature]) {
    state.keySignature = settings.keySignature;
  }
  if (["degree", "pitch", "none"].includes(settings.noteLabelMode)) {
    state.noteLabelMode = settings.noteLabelMode;
  } else {
    state.noteLabelMode = settings.showDegrees === false ? "none" : "degree";
  }
  if (typeof settings.selectedInputId === "string") {
    state.selectedInputId = settings.selectedInputId;
  }
  if (["on", "off"].includes(settings.pedalStep)) {
    state.pedalStep = settings.pedalStep;
  } else if (["measure", "half"].includes(settings.pedalStep)) {
    state.pedalStep = "on";
  }
  if (["off", "half", "page"].includes(settings.sustainPedalPage)) {
    state.sustainPedalPage = settings.sustainPedalPage;
  }
  if (["off", "beat"].includes(settings.autoFollowMode)) {
    state.autoFollowMode = settings.autoFollowMode;
  }
  if (Number.isFinite(settings.autoFollowTolerance)) {
    state.autoFollowTolerance = clampTolerance(settings.autoFollowTolerance);
  }
  if (typeof settings.timeSignature === "string") {
    state.practice.timeSignature = parseTimeSignatureKey(settings.timeSignature);
    state.practice.measureTicks = measureTicksForTimeSignature(state.practice.timeSignature, state.practice.ticksPerQuarter || MIDI_PPQ);
  }
  syncControlsFromState();
}

function drawStaff() {
  const svg = els.staffSvg;
  svg.replaceChildren();

  const bg = createSvg("rect", { x: 0, y: 0, width: STAFF_VIEWBOX.width, height: STAFF_VIEWBOX.height, fill: "#fffdf8" });
  svg.appendChild(bg);

  [...TREBLE_LINE_YS, ...BASS_LINE_YS].forEach((y) => {
    svg.appendChild(createSvg("line", { x1: 64, y1: y, x2: 1674, y2: y, class: "staff-line" }));
  });
  [64, 1674].forEach((x) => {
    svg.appendChild(createSvg("line", { x1: x, y1: TREBLE_LINE_YS[0], x2: x, y2: BASS_LINE_YS[4], class: "bar-line" }));
  });

  const treble = createSvg("text", { x: 104, y: 324, class: "clef" });
  treble.textContent = "𝄞";
  const bass = createSvg("text", { x: 112, y: 568, class: "clef" });
  bass.textContent = "𝄢";
  svg.append(treble, bass);
  drawKeySignature(svg);

  const hasPracticeScore = state.practice.measures.length > 0;
  if (hasPracticeScore) {
    drawBeatGrid(svg);
    drawPedalTrack(svg);
    const practiceItems = buildPracticeNoteItems();
    practiceItems.forEach((item) => drawNote(svg, item));
    drawPracticeOctaveGroups(svg, practiceItems);
    return;
  }

  const visibleNotes = [...state.activeNotes.keys()].sort((a, b) => a - b);
  if (!visibleNotes.length) {
    return;
  }

  const chordX = STAFF_VIEWBOX.width / 2;
  const noteItems = visibleNotes.map((note) => {
    const clef = preferredClef(note);
    const step = midiToStaffStep(note);
    return { note, clef, step, x: chordX, xOffset: 0 };
  });

  for (let index = 0; index < noteItems.length;) {
    const clusterStart = index;
    index += 1;
    while (
      index < noteItems.length &&
      noteItems[index].clef === noteItems[index - 1].clef &&
      noteItems[index].step - noteItems[index - 1].step <= 1
    ) {
      index += 1;
    }

    const cluster = noteItems.slice(clusterStart, index);
    if (cluster.length > 1) {
      const spread = 35;
      cluster.forEach((item, itemIndex) => {
        item.xOffset = (itemIndex - (cluster.length - 1) / 2) * spread;
      });
    }
  }

  noteItems.forEach((item) => {
    drawNote(svg, { ...item, x: chordX + item.xOffset });
  });
}

function drawBeatGrid(svg) {
  if (!state.practice.measures.length) return;

  const timeSignature = state.practice.timeSignature || { numerator: 4, denominator: 4 };
  const numerator = Math.max(1, Number(timeSignature.numerator) || 4);
  const denominator = Math.max(1, Number(timeSignature.denominator) || 4);
  const beatTicks = Math.max(1, (state.practice.ticksPerQuarter || MIDI_PPQ) * 4 / denominator);
  const viewStartTick = state.practice.viewStartTick || 0;
  const viewSpanTicks = Math.max(1, state.practice.measureTicks || beatTicks * numerator);
  const viewEndTick = viewStartTick + viewSpanTicks;
  const xForTick = (tick) => {
    const progress = (tick - viewStartTick) / viewSpanTicks;
    return MEASURE_NOTE_LEFT_X + progress * (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X);
  };

  state.practice.measures.forEach((measure) => {
    if (measure.endTick <= viewStartTick || measure.startTick >= viewEndTick) return;

    for (let beat = 0; beat <= numerator; beat += 1) {
      const tick = measure.startTick + beat * beatTicks;
      if (tick < viewStartTick || tick > viewEndTick) continue;
      const x = xForTick(tick);
      const isMeasureEdge = beat === 0 || beat === numerator;
      svg.appendChild(createSvg("line", {
        x1: x,
        y1: BEAT_GRID_TOP_Y,
        x2: x,
        y2: BEAT_GRID_BOTTOM_Y,
        class: isMeasureEdge ? "beat-grid-line measure-grid-line" : "beat-grid-line"
      }));
    }
  });
}

function drawPedalTrack(svg) {
  const pedalEvents = state.practice.pedalEvents || [];
  if (!pedalEvents.length) return;

  const viewStartTick = state.practice.viewStartTick || 0;
  const viewSpanTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const viewEndTick = viewStartTick + viewSpanTicks;
  const xForTick = (tick) => {
    const progress = (tick - viewStartTick) / viewSpanTicks;
    return MEASURE_NOTE_LEFT_X + progress * (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X);
  };

  pedalIntervalsForView(viewStartTick, viewEndTick).forEach((interval) => {
    const startX = xForTick(Math.max(interval.startTick, viewStartTick));
    const endX = xForTick(Math.min(interval.endTick, viewEndTick));
    if (endX <= MEASURE_NOTE_LEFT_X || startX >= MEASURE_NOTE_RIGHT_X) return;

    const lineStartX = Math.max(MEASURE_NOTE_LEFT_X, startX + (interval.startsInside ? 56 : 0));
    const lineEndX = Math.min(MEASURE_NOTE_RIGHT_X, endX);
    if (interval.startsInside) {
      const label = createSvg("text", {
        x: Math.max(MEASURE_NOTE_LEFT_X + 6, startX),
        y: PEDAL_TRACK_Y + 7,
        class: "pedal-label"
      });
      label.textContent = "Ped.";
      svg.appendChild(label);
    }

    if (lineEndX > lineStartX) {
      svg.appendChild(createSvg("line", {
        x1: lineStartX,
        y1: PEDAL_TRACK_Y,
        x2: lineEndX,
        y2: PEDAL_TRACK_Y,
        class: "pedal-line"
      }));
    }

    if (interval.endsInside) {
      svg.appendChild(createSvg("line", {
        x1: endX,
        y1: PEDAL_TRACK_Y - 14,
        x2: endX,
        y2: PEDAL_TRACK_Y + 10,
        class: "pedal-release"
      }));
    }
  });
}

function pedalIntervalsForView(viewStartTick, viewEndTick) {
  const events = (state.practice.pedalEvents || [])
    .slice()
    .sort((a, b) => a.tick - b.tick || a.value - b.value);
  const intervals = [];
  let downTick = null;

  events.forEach((event) => {
    const isDown = event.value >= 64;
    if (isDown && downTick === null) {
      downTick = event.tick;
      return;
    }
    if (!isDown && downTick !== null) {
      intervals.push({ startTick: downTick, endTick: Math.max(event.tick, downTick + 1) });
      downTick = null;
    }
  });

  if (downTick !== null) {
    const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
    intervals.push({ startTick: downTick, endTick: Math.max(lastMeasure?.endTick || viewEndTick, downTick + 1) });
  }

  return intervals
    .filter((interval) => interval.startTick < viewEndTick && interval.endTick > viewStartTick)
    .map((interval) => ({
      ...interval,
      startsInside: interval.startTick >= viewStartTick && interval.startTick <= viewEndTick,
      endsInside: interval.endTick >= viewStartTick && interval.endTick <= viewEndTick
    }));
}

function buildPracticeNoteItems() {
  const visibleNotes = visiblePracticeTargets();
  if (!visibleNotes.length) return [];

  const viewStartTick = state.practice.viewStartTick || 0;
  const timeSpan = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const displayStartById = displayStartTicksForTargets(visibleNotes);
  const items = visibleNotes
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note)
    .map((target) => {
      const display = displayInfoForPracticeNote(target.note);
      const durationKind = durationKindForTicks(Math.max(1, target.endTick - target.startTick));
      const displayStartTick = displayStartById.get(target.id) ?? target.startTick;
      const progress = Math.max(0, Math.min(1, (displayStartTick - viewStartTick) / timeSpan));
      const x = MEASURE_NOTE_LEFT_X + progress * (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X);
      return {
        note: target.note,
        displayNote: display.note,
        clef: display.clef,
        step: midiToStaffStep(display.note),
        x,
        startTick: target.startTick,
        displayStartTick,
        endTick: target.endTick,
        durationKind,
        octaveMark: display.octaveMark,
        targetId: target.id,
        matched: isPracticeNoteActive(target.note),
        isPractice: true,
        trackIndex: target.trackIndex ?? 0,
        channel: target.channel ?? 0,
        trackRole: target.trackRole || "primary",
        xOffset: 0
      };
    });

  return items;
}

function displayStartTicksForTargets(targets) {
  const map = new Map();
  const arpeggioWindowTicks = Math.max(1, practiceBeatTicks() * ARPEGGIO_DISPLAY_WINDOW_RATIO);
  const sorted = targets
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);

  let groupStartTick = null;
  sorted.forEach((target) => {
    if (
      groupStartTick === null ||
      target.startTick - groupStartTick > arpeggioWindowTicks
    ) {
      groupStartTick = target.startTick;
    }
    map.set(target.id, groupStartTick);
  });

  return map;
}

function visiblePracticeTargets() {
  if (!state.practice.measures.length) return [];
  const viewStartTick = state.practice.viewStartTick || 0;
  const viewEndTick = viewStartTick + Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  return state.practice.measures
    .flatMap((measure) => measure.notes)
    .filter((target) => target.startTick >= viewStartTick && target.startTick < viewEndTick);
}

function drawNote(svg, item) {
  const { note, clef, x, matched, isPractice, targetId } = item;
  const displayNote = item.displayNote ?? note;
  const y = yForNote(displayNote, clef);
  drawLedgerLines(svg, x, y, clef, item.trackRole);

  if (isPractice) {
    drawPracticeNoteShape(svg, { ...item, y, displayNote });
  } else {
    const noteClasses = ["note-head"];
    if (matched) noteClasses.push("matched-note");
    svg.appendChild(createSvg("circle", {
      cx: x,
      cy: y,
      r: NOTE_RADIUS,
      class: noteClasses.join(" "),
      "data-target-id": targetId || "",
      "data-note": note
    }));
  }

  const innerLabel = noteInnerLabel(note);
  if (innerLabel) {
    const filledPracticeNote = isPractice && !matched;
    const noteInnerLabelText = createSvg("text", {
      x,
      y,
      class: filledPracticeNote ? "note-inner-label light-note-label" : "note-inner-label",
      "data-note-inner-label": innerLabel
    });
    noteInnerLabelText.textContent = innerLabel;
    svg.appendChild(noteInnerLabelText);
  }

  const accidental = accidentalForNote(note);
  if (accidental) {
    const accidentalClasses = ["accidental"];
    if (item.trackRole === "secondary") accidentalClasses.push("secondary-track-text");
    const accidentalText = createSvg("text", {
      x: x - 52,
      y: y + 17,
      class: accidentalClasses.join(" "),
      fill: "#292522",
      "data-accidental": accidental
    });
    accidentalText.textContent = accidental;
    svg.appendChild(accidentalText);
  }
}

function displayInfoForPracticeNote(note) {
  const clef = preferredClef(note);
  let displayNote = note;
  let octaveMark = "";
  const lineYs = clef === "bass" ? BASS_LINE_YS : TREBLE_LINE_YS;
  const topLimit = Math.min(...lineYs) - LEDGER_OCTAVE_LIMIT;
  const bottomLimit = Math.max(...lineYs) + LEDGER_OCTAVE_LIMIT;

  while (yForNote(displayNote, clef) < topLimit && displayNote - 12 >= MIDI_MIN) {
    displayNote -= 12;
    octaveMark = "8va";
  }
  while (yForNote(displayNote, clef) > bottomLimit && displayNote + 12 <= MIDI_MAX) {
    displayNote += 12;
    octaveMark = "8vb";
  }

  return { note: displayNote, clef, octaveMark };
}

function durationKindForTicks(durationTicks) {
  const quarterTicks = state.practice.ticksPerQuarter || MIDI_PPQ;
  const ratio = durationTicks / quarterTicks;
  const candidates = [
    { kind: "whole", ratio: 4 },
    { kind: "half", ratio: 2 },
    { kind: "quarter", ratio: 1 },
    { kind: "eighth", ratio: 0.5 },
    { kind: "sixteenth", ratio: 0.25 }
  ];
  return candidates.reduce((best, item) => (
    Math.abs(item.ratio - ratio) < Math.abs(best.ratio - ratio) ? item : best
  ), candidates[0]).kind;
}

function drawPracticeNoteShape(svg, item) {
  const { note, displayNote, x, y, matched, durationKind, targetId } = item;
  const classes = ["note-head", "practice-note-head", "filled-note"];
  if (item.trackRole === "secondary") classes.push("secondary-track-note");
  if (matched) classes.push("matched-note");
  svg.appendChild(createSvg("ellipse", {
    cx: x,
    cy: y,
    rx: 21,
    ry: 14,
    transform: `rotate(-18 ${x} ${y})`,
    class: classes.join(" "),
    "data-target-id": targetId || "",
    "data-note": note,
    "data-display-note": displayNote
  }));
}

function drawStem(svg, x, y, clef, matched, trackRole = "primary") {
  const lineYs = clef === "bass" ? BASS_LINE_YS : TREBLE_LINE_YS;
  const stemDown = y < lineYs[2];
  const stemX = stemDown ? x - 17 : x + 17;
  const stemEndY = stemDown ? y + 72 : y - 72;
  const classes = ["note-stem"];
  if (trackRole === "secondary") classes.push("secondary-track-stem");
  if (matched) classes.push("matched-stem");
  svg.appendChild(createSvg("line", {
    x1: stemX,
    y1: y,
    x2: stemX,
    y2: stemEndY,
    class: classes.join(" ")
  }));
}

function drawPracticeOctaveGroups(svg, items) {
  const sorted = items.slice().sort((a, b) => a.x - b.x || a.step - b.step);
  const groups = [];
  let current = null;

  sorted.forEach((item) => {
    if (!item.octaveMark) {
      current = null;
      return;
    }
    if (
      current &&
      current.octaveMark === item.octaveMark &&
      current.trackRole === item.trackRole &&
      Math.abs(item.x - current.endX) < 230
    ) {
      current.items.push(item);
      current.endX = Math.max(current.endX, item.x);
      current.markY = current.octaveMark === "8va"
        ? Math.min(current.markY, yForNote(item.displayNote, item.clef) - 62)
        : Math.max(current.markY, yForNote(item.displayNote, item.clef) + 74);
      return;
    }

    const y = yForNote(item.displayNote, item.clef);
    current = {
      octaveMark: item.octaveMark,
      trackRole: item.trackRole,
      items: [item],
      startX: item.x,
      endX: item.x,
      markY: item.octaveMark === "8va" ? y - 62 : y + 74
    };
    groups.push(current);
  });

  groups.forEach((group) => {
    drawOctaveMark(svg, group.startX, group.endX, group.markY, group.octaveMark, group.trackRole);
  });
}

function drawOctaveMark(svg, startX, endX, markY, octaveMark, trackRole = "primary") {
  const isHigh = octaveMark === "8va";
  const markTextClasses = ["octave-mark"];
  const markLineClasses = ["octave-line"];
  if (trackRole === "secondary") {
    markTextClasses.push("secondary-track-text");
    markLineClasses.push("secondary-track-line");
  }
  const text = createSvg("text", {
    x: startX - 8,
    y: markY,
    class: markTextClasses.join(" ")
  });
  text.textContent = octaveMark;
  svg.appendChild(text);
  const lineEndX = Math.max(startX + 78, endX + (endX > startX ? 34 : 78));
  svg.appendChild(createSvg("line", {
    x1: startX + 24,
    y1: markY - (isHigh ? 6 : -8),
    x2: lineEndX,
    y2: markY - (isHigh ? 6 : -8),
    class: markLineClasses.join(" ")
  }));
}

function noteInnerLabel(note) {
  if (state.noteLabelMode === "degree") return degreeForNote(note);
  if (state.noteLabelMode === "pitch") return NOTE_NAMES[note % 12].replace("#", "♯");
  return "";
}

function drawKeySignature(svg) {
  const key = MAJOR_KEY_SIGNATURES[state.keySignature] || MAJOR_KEY_SIGNATURES.C;
  if (!key.accidental || !key.count) return;

  const positions = KEY_SIGNATURE_Y[key.accidental];
  const letters = KEY_SIGNATURE_ORDER[key.accidental];
  const symbol = key.accidental === "b" ? "♭" : "♯";
  for (let index = 0; index < key.count; index += 1) {
    const letter = letters[index];
    const x = KEY_SIGNATURE_START_X + index * KEY_SIGNATURE_GAP_X;
    const trebleMark = createSvg("text", {
      x,
      y: positions.treble[letter],
      class: "key-signature",
      "data-key-letter": letter,
      "data-key-signature": symbol
    });
    trebleMark.textContent = symbol;
    const bassMark = createSvg("text", {
      x,
      y: positions.bass[letter],
      class: "key-signature",
      "data-key-letter": letter,
      "data-key-signature": symbol
    });
    bassMark.textContent = symbol;
    svg.append(trebleMark, bassMark);
  }
}

function drawLedgerLines(svg, x, y, clef, trackRole = "primary") {
  const lineYs = clef === "bass" ? BASS_LINE_YS : TREBLE_LINE_YS;
  const min = Math.min(...lineYs);
  const max = Math.max(...lineYs);
  const ledgerYs = [];
  for (let ly = min - STAFF_STEP_PX * 2; ly >= y - 1; ly -= STAFF_STEP_PX * 2) ledgerYs.push(ly);
  for (let ly = max + STAFF_STEP_PX * 2; ly <= y + 1; ly += STAFF_STEP_PX * 2) ledgerYs.push(ly);
  const classes = ["ledger-line"];
  if (trackRole === "secondary") classes.push("secondary-track-line");
  ledgerYs.forEach((ly) => {
    svg.appendChild(createSvg("line", { x1: x - 52, y1: ly, x2: x + 52, y2: ly, class: classes.join(" ") }));
  });
}

function buildKeyboard() {
  const { min, max } = KEY_RANGE;
  const whiteNotes = [];
  for (let note = min; note <= max; note += 1) {
    if (isWhite(note)) whiteNotes.push(note);
  }
  const whiteWidth = keyboardWhiteWidth();
  const whiteIndex = new Map(whiteNotes.map((note, index) => [note, index]));

  els.keyboard.replaceChildren();
  els.keyboard.style.width = `${whiteNotes.length * whiteWidth}px`;
  els.keyboard.style.minWidth = `${whiteNotes.length * whiteWidth}px`;

  for (let note = min; note <= max; note += 1) {
    if (!isWhite(note)) continue;
    const key = makeKey(note, "white-key");
    const left = whiteIndex.get(note) * whiteWidth;
    key.style.left = `${left}px`;
    key.style.width = `${whiteWidth}px`;
    els.keyboard.appendChild(key);
  }

  for (let note = min; note <= max; note += 1) {
    if (isWhite(note)) continue;
    const previousWhite = findPreviousWhite(note);
    if (!whiteIndex.has(previousWhite)) continue;
    const left = (whiteIndex.get(previousWhite) + 0.72) * whiteWidth;
    const blackWidth = whiteWidth * 0.598;
    const key = makeKey(note, "black-key");
    key.style.left = `${left}px`;
    key.style.width = `${blackWidth}px`;
    els.keyboard.appendChild(key);
  }
  updateKeyboardActive();
  requestAnimationFrame(centerKeyboardOnMiddleC);
}

function keyboardWhiteWidth() {
  const boardWidth = els.keyboard.parentElement?.clientWidth || window.innerWidth || 1024;
  return Math.max(22, Math.min(DEFAULT_WHITE_KEY_WIDTH_PX, boardWidth / visibleKeyboardWhiteKeys(boardWidth)));
}

function visibleKeyboardWhiteKeys(boardWidth) {
  if (boardWidth < 560) return PHONE_PORTRAIT_VISIBLE_WHITE_KEYS;
  if (boardWidth < 900) return TABLET_PORTRAIT_VISIBLE_WHITE_KEYS;
  return LANDSCAPE_VISIBLE_WHITE_KEYS;
}

function centerKeyboardOnMiddleC() {
  const key = els.keyboard.querySelector('[data-note="60"]');
  const board = els.keyboard.parentElement;
  if (!key || !board) return;
  const target = key.offsetLeft + key.offsetWidth / 2 - board.clientWidth / 2;
  board.scrollLeft = Math.max(0, target);
}

function findPreviousWhite(note) {
  let current = note - 1;
  while (current >= MIDI_MIN && !isWhite(current)) current -= 1;
  return current;
}

function makeKey(note, className) {
  const key = document.createElement("button");
  key.type = "button";
  key.className = `key ${className}`;
  const isC = note % 12 === 0;
  if (isC) key.classList.add("c-key-label");
  if (note === 60) key.classList.add("middle-c-key");
  key.dataset.note = String(note);
  key.setAttribute("aria-label", noteName(note));
  key.textContent = className === "black-key" ? "" : isC ? noteName(note) : "";
  key.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    key.setPointerCapture(event.pointerId);
    pressNote(note, 96, "screen");
  });
  key.addEventListener("pointerup", () => releaseNote(note, "screen"));
  key.addEventListener("pointercancel", () => releaseNote(note, "screen"));
  key.addEventListener("lostpointercapture", () => releaseNote(note, "screen"));
  return key;
}

function pressNote(note, velocity = 96, source = "midi") {
  if (note < MIDI_MIN || note > MIDI_MAX) return;
  recordMidiEvent("noteon", { note, velocity });
  state.releasedWhileSustained.delete(note);
  state.activeNotes.set(note, { velocity, source, startedAt: performance.now() });
  state.autoFollow.pausedAfterManualNavigation = false;
  markAutoFollowNote(note);
  updateAll();
  evaluateAutoFollowBeat();
}

function releaseNote(note) {
  if (state.activeNotes.has(note)) {
    recordMidiEvent("noteoff", { note, velocity: 0 });
  }
  if (state.sustainDown) {
    if (state.activeNotes.has(note)) state.releasedWhileSustained.add(note);
    return;
  }
  state.activeNotes.delete(note);
  state.releasedWhileSustained.delete(note);
  updateAll();
}

function releaseSustainedNotes() {
  state.releasedWhileSustained.forEach((note) => {
    state.activeNotes.delete(note);
  });
  state.releasedWhileSustained.clear();
  updateAll();
}

function startRecording() {
  revokeRecordingUrl();
  state.recording.active = true;
  state.recording.startedAt = performance.now();
  state.recording.events = [];
  syncRecordingControls();
  setStatusKey("status.recording");
}

function stopRecording() {
  if (!state.recording.active) return;
  [...state.activeNotes.keys()].forEach((note) => {
    recordMidiEvent("noteoff", { note, velocity: 0 });
  });
  state.recording.active = false;
  syncRecordingControls();
  const count = state.recording.events.filter((event) => event.type === "noteon").length;
  setStatusKey(count ? "status.recorded" : "status.recordedEmpty", { count });
}

function recordMidiEvent(type, detail) {
  if (!state.recording.active) return;
  state.recording.events.push({
    type,
    timeMs: Math.max(0, performance.now() - state.recording.startedAt),
    ...detail
  });
}

function saveRecording() {
  if (state.recording.active || !state.recording.events.length) return;
  const bytes = buildMidiFile(state.recording.events);
  const filename = `EP${timestampFilename(new Date())}.mid`;

  if (window.webkit?.messageHandlers?.midiBridge) {
    window.webkit.messageHandlers.midiBridge.postMessage({
      type: "saveMidi",
      filename,
      base64: bytesToBase64(bytes)
    });
    state.recording.takeNumber += 1;
    setStatusKey("status.savingIos");
    return;
  }

  const blob = new Blob([bytes], { type: "audio/midi" });
  revokeRecordingUrl();
  state.recording.lastBlobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = state.recording.lastBlobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  state.recording.takeNumber += 1;
  setStatusKey("status.midiGenerated");
}

function timestampFilename(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes())
  ].join("");
}

function revokeRecordingUrl() {
  if (!state.recording.lastBlobUrl) return;
  URL.revokeObjectURL(state.recording.lastBlobUrl);
  state.recording.lastBlobUrl = "";
}

function isPracticeNoteActive(note) {
  return state.activeNotes.has(note);
}

function displayFilename(filename, fallback) {
  const value = String(filename || fallback || "").trim();
  if (value.length <= DISPLAY_FILENAME_MAX) return value;
  return `${value.slice(0, DISPLAY_FILENAME_MAX)}...`;
}

function applyParsedScore(parsed, filename, typeLabel) {
  cancelAutoFollowAnimation();
  state.practice.notes = parsed.notes || parsed.measures.flatMap((measure) => measure.notes);
  state.practice.pedalEvents = parsed.pedalEvents || [];
  state.practice.currentMeasure = 0;
  state.practice.filename = filename || typeLabel;
  state.practice.timeSignature = parsed.timeSignature;
  state.practice.ticksPerQuarter = parsed.ticksPerQuarter;
  state.practice.measureTicks = parsed.measureTicks;
  state.practice.microsecondsPerQuarter = parsed.microsecondsPerQuarter;
  state.practice.viewStartTick = 0;
  state.practice.measures = buildMeasuresFromPracticeNotes(state.practice.notes);
  resetAutoFollowBeat(0, { clearPlayed: true });
  const displayName = displayFilename(state.practice.filename, typeLabel);
  setStatusKey(parsed.measures.length ? "status.loaded" : "status.loadedEmpty", {
    name: displayName,
    type: typeLabel
  });
  updateAll();
  scheduleAutoFollowEmptyBeatCheck();
}

function updatePracticeTimeSignature(timeSignature) {
  cancelAutoFollowAnimation();
  stopMeasurePlayback();
  state.practice.timeSignature = timeSignature;
  state.practice.measureTicks = measureTicksForTimeSignature(timeSignature, state.practice.ticksPerQuarter || MIDI_PPQ);
  state.practice.measures = buildMeasuresFromPracticeNotes(state.practice.notes);
  state.practice.currentMeasure = Math.max(0, Math.min(
    state.practice.measures.length - 1,
    Math.floor((state.practice.viewStartTick || 0) / Math.max(1, state.practice.measureTicks))
  ));
  state.practice.viewStartTick = state.practice.currentMeasure * Math.max(1, state.practice.measureTicks);
  resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: true });
  syncControlsFromState();
  updateAll();
  scheduleAutoFollowEmptyBeatCheck();
}

function measureTicksForTimeSignature(timeSignature, ticksPerQuarter) {
  const numerator = Math.max(1, Number(timeSignature?.numerator) || 4);
  const denominator = Math.max(1, Number(timeSignature?.denominator) || 4);
  return Math.max(1, ticksPerQuarter * numerator * 4 / denominator);
}

function buildMeasuresFromPracticeNotes(notes) {
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const validNotes = (notes || [])
    .filter((note) => note.note >= MIDI_MIN && note.note <= MIDI_MAX)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  if (!validNotes.length) return [];

  const lastTick = Math.max(...validNotes.map((note) => Math.max(note.endTick, note.startTick + 1)));
  const measureCount = Math.max(1, Math.ceil(lastTick / measureTicks));
  const measures = Array.from({ length: measureCount }, (_, index) => ({
    index,
    startTick: index * measureTicks,
    endTick: (index + 1) * measureTicks,
    notes: []
  }));

  validNotes.forEach((note) => {
    const measureIndex = Math.max(0, Math.min(measures.length - 1, Math.floor(note.startTick / measureTicks)));
    measures[measureIndex].notes.push(note);
  });

  return measures;
}

async function loadScoreFile(file) {
  if (!file) return;

  try {
    stopMeasurePlayback();
    const name = file.name || "";
    if (isMusicXmlFile(file)) {
      const parsed = parseMusicXmlText(await file.text());
      applyParsedScore(parsed, name || "MusicXML", "MusicXML");
    } else {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const parsed = parseMidiFile(bytes);
      applyParsedScore(parsed, name || "MIDI", "MIDI");
    }
  } catch (error) {
    cancelAutoFollowAnimation();
    state.practice.measures = [];
    state.practice.notes = [];
    state.practice.pedalEvents = [];
    state.practice.currentMeasure = 0;
    state.practice.viewStartTick = 0;
    resetAutoFollowBeat(null, { clearPlayed: true });
    setStatusKey("status.loadFailed", { message: error.message || "文件格式不支持" });
    updateAll();
  } finally {
    els.midiFileInput.value = "";
  }
}

function isMusicXmlFile(file) {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return name.endsWith(".musicxml") ||
    name.endsWith(".xml") ||
    type.includes("musicxml") ||
    type.includes("xml");
}

function goToMeasure(delta) {
  if (!state.practice.measures.length) return;
  const next = Math.max(0, Math.min(state.practice.measures.length - 1, state.practice.currentMeasure + delta));
  if (next === state.practice.currentMeasure) return;
  animatePracticeViewToTick(state.practice.measures[next].startTick, { clearPlayed: true, pauseAutoFollow: true });
}

function goToPracticeStart() {
  if (!state.practice.measures.length) return;
  animatePracticeViewToTick(0, { clearPlayed: true, pauseAutoFollow: true });
}

function panPracticeView(deltaMeasures) {
  if (!state.practice.measures.length) return;
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const nextStart = clampPracticeViewStartTick((state.practice.viewStartTick || 0) + deltaMeasures * measureTicks);
  if (Math.abs(nextStart - (state.practice.viewStartTick || 0)) < 1) return;
  animatePracticeViewToTick(nextStart);
}

function advancePracticeGrid(deltaCells, options = {}) {
  if (!state.practice.measures.length) return;
  const nextStart = clampPracticeViewStartTick((state.practice.viewStartTick || 0) + deltaCells * practiceGridTicks());
  if (Math.abs(nextStart - (state.practice.viewStartTick || 0)) < 1) return;
  if (options.clearPlayed) {
    resetAutoFollowBeat(null, { clearPlayed: true });
  }
  if (options.pauseAutoFollow) {
    state.autoFollow.pausedAfterManualNavigation = true;
  }
  animatePracticeViewToTick(nextStart, options);
}

function practiceBeatTicks() {
  const timeSignature = state.practice.timeSignature || { numerator: 4, denominator: 4 };
  const denominator = Math.max(1, Number(timeSignature.denominator) || 4);
  return Math.max(1, (state.practice.ticksPerQuarter || MIDI_PPQ) * 4 / denominator);
}

function practiceGridTicks() {
  return practiceBeatTicks();
}

function maxPracticeViewStartTick() {
  if (!state.practice.measures.length) return 0;
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  return Math.max(0, lastMeasure.endTick - measureTicks);
}

function practiceEndTick() {
  if (!state.practice.measures.length) return 0;
  return Math.max(...state.practice.measures.map((measure) => measure.endTick));
}

function secondsPerPracticeTick() {
  return (state.practice.microsecondsPerQuarter || 500000) / 1000000 / (state.practice.ticksPerQuarter || MIDI_PPQ);
}

function formatClockTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function syncPlaybackScrubber() {
  if (!els.playbackSlider || !els.playbackTime) return;
  const maxTick = Math.round(maxPracticeViewStartTick());
  const currentTick = Math.round(Math.max(0, Math.min(maxTick, state.practice.viewStartTick || 0)));
  els.playbackSlider.disabled = !state.practice.measures.length;
  els.playbackSlider.max = String(maxTick);
  els.playbackSlider.value = String(currentTick);

  const secondsPerTick = secondsPerPracticeTick();
  const currentSeconds = (state.practice.viewStartTick || 0) * secondsPerTick;
  const totalSeconds = practiceEndTick() * secondsPerTick;
  els.playbackTime.textContent = `${formatClockTime(currentSeconds)} / ${formatClockTime(totalSeconds)}`;
}

function seekPracticeView(tick) {
  if (!state.practice.measures.length) return;
  stopMeasurePlayback();
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const nextTick = clampPracticeViewStartTick(Number(tick) || 0);
  state.practice.viewStartTick = nextTick;
  state.practice.currentMeasure = Math.max(0, Math.min(
    state.practice.measures.length - 1,
    Math.floor(nextTick / measureTicks)
  ));
  state.autoFollow.pausedAfterManualNavigation = true;
  resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: true });
  updateAll();
}

function snapTickToBeat(tick) {
  const gridTicks = practiceGridTicks();
  return Math.round(Math.max(0, tick) / gridTicks) * gridTicks;
}

function clampPracticeViewStartTick(tick) {
  return Math.max(0, Math.min(maxPracticeViewStartTick(), snapTickToBeat(tick)));
}

function currentAutoFollowBeatStart() {
  return clampPracticeViewStartTick(state.practice.viewStartTick || 0);
}

function resetAutoFollowBeat(beatStart = null, options = {}) {
  state.autoFollow.currentBeatStart = beatStart;
  if (options.clearPlayed) {
    state.autoFollow.playedNotesByBeat = new Map();
  }
}

function cancelAutoFollowAnimation() {
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
  window.clearTimeout(state.autoFollow.emptyAdvanceTimer);
  state.autoFollow.animationFrame = 0;
  state.autoFollow.emptyAdvanceTimer = 0;
  state.autoFollow.animating = false;
}

function targetsForBeat(beatStart) {
  const gridTicks = practiceGridTicks();
  const beatEnd = beatStart + gridTicks;
  return (state.practice.notes || [])
    .filter((target) => target.startTick >= beatStart && target.startTick < beatEnd)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
}

function nextPracticeCueNotes() {
  if (!state.practice.measures.length) return new Set();
  const gridTicks = practiceGridTicks();
  const startTick = currentAutoFollowBeatStart();
  const endTick = practiceEndTick();
  for (let tick = startTick; tick <= endTick; tick += gridTicks) {
    const group = firstUnmatchedTargetGroup(targetsForBeat(tick));
    if (group.length) return new Set(group.map((target) => target.note));
  }
  return new Set();
}

function targetGroupsByStartTick(targets) {
  const groups = [];
  let currentTick = null;
  let currentGroup = [];
  targets.forEach((target) => {
    if (currentTick === null || target.startTick !== currentTick) {
      if (currentGroup.length) groups.push(currentGroup);
      currentTick = target.startTick;
      currentGroup = [];
    }
    currentGroup.push(target);
  });
  if (currentGroup.length) groups.push(currentGroup);
  return groups;
}

function firstUnmatchedTargetGroup(targets) {
  const groups = targetGroupsByStartTick(targets);
  for (const group of groups) {
    if (!isTargetGroupMatched(group)) {
      return group.filter((target) => !isAutoFollowTargetMatched(target));
    }
  }
  return [];
}

function markAutoFollowNote(note) {
  if (state.autoFollowMode !== "beat" || !state.practice.measures.length) return;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);
  const target = targetForPlayedNote(note, beatStart);
  if (target) markPlayedNoteForBeat(beatStartForTick(target.startTick), note);
}

function targetForPlayedNote(note, currentBeatStart) {
  const gridTicks = practiceGridTicks();
  const viewStartTick = state.practice.viewStartTick || 0;
  const viewEndTick = viewStartTick + Math.max(1, state.practice.measureTicks || gridTicks);
  const currentBeatEnd = currentBeatStart + gridTicks;
  const candidates = (state.practice.notes || [])
    .filter((target) => (
      target.note === note &&
      target.startTick >= currentBeatStart &&
      target.startTick < viewEndTick
    ))
    .sort((a, b) => {
      const aInCurrentBeat = a.startTick < currentBeatEnd ? 0 : 1;
      const bInCurrentBeat = b.startTick < currentBeatEnd ? 0 : 1;
      return aInCurrentBeat - bInCurrentBeat ||
        Math.abs(a.startTick - viewStartTick) - Math.abs(b.startTick - viewStartTick) ||
        a.startTick - b.startTick;
    });
  return candidates[0] || null;
}

function beatStartForTick(tick) {
  const gridTicks = practiceGridTicks();
  return Math.floor(Math.max(0, tick) / gridTicks) * gridTicks;
}

function markPlayedNoteForBeat(beatStart, note) {
  const key = String(beatStart);
  if (!state.autoFollow.playedNotesByBeat.has(key)) {
    state.autoFollow.playedNotesByBeat.set(key, new Set());
  }
  state.autoFollow.playedNotesByBeat.get(key).add(note);
  prunePlayedAutoFollowNotes(beatStart);
}

function prunePlayedAutoFollowNotes(currentBeatStart) {
  const keepFrom = currentBeatStart - practiceGridTicks();
  [...state.autoFollow.playedNotesByBeat.keys()].forEach((key) => {
    if (Number(key) < keepFrom) state.autoFollow.playedNotesByBeat.delete(key);
  });
}

function scheduleAutoFollowEmptyBeatCheck() {
  window.clearTimeout(state.autoFollow.emptyAdvanceTimer);
  if (
    state.autoFollowMode !== "beat" ||
    state.autoFollow.animating ||
    state.autoFollow.pausedAfterManualNavigation ||
    !state.practice.measures.length
  ) {
    state.autoFollow.emptyAdvanceTimer = 0;
    return;
  }
  state.autoFollow.emptyAdvanceTimer = window.setTimeout(() => {
    state.autoFollow.emptyAdvanceTimer = 0;
    evaluateAutoFollowBeat({ advanceEmptyBeat: true });
  }, 180);
}

function evaluateAutoFollowBeat(options = {}) {
  if (
    state.autoFollowMode !== "beat" ||
    state.autoFollow.animating ||
    state.autoFollow.pausedAfterManualNavigation ||
    !state.practice.measures.length
  ) return;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);

  const targets = targetsForBeat(beatStart);
  if (!targets.length) {
    if (options.advanceEmptyBeat) advancePracticeGrid(1);
    return;
  }
  if (!targetGroupsByStartTick(targets).every((group) => isTargetGroupMatched(group))) return;
  advancePracticeGrid(1);
}

function isAutoFollowTargetMatched(target) {
  if (isPracticeNoteActive(target.note)) return true;
  const notes = state.autoFollow.playedNotesByBeat.get(String(beatStartForTick(target.startTick)));
  return notes?.has(target.note) || false;
}

function requiredAutoFollowMatches(targetCount) {
  const allowedMisses = Math.floor(targetCount * state.autoFollowTolerance / 100);
  return Math.max(1, targetCount - allowedMisses);
}

function isTargetGroupMatched(targets) {
  const matchedCount = targets.filter((target) => isAutoFollowTargetMatched(target)).length;
  return matchedCount >= requiredAutoFollowMatches(targets.length);
}

function animatePracticeViewToTick(targetTick, options = {}) {
  if (!state.practice.measures.length) return;
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const startTick = state.practice.viewStartTick || 0;
  const endTick = clampPracticeViewStartTick(targetTick);
  if (Math.abs(endTick - startTick) < 1) return;

  if (options.clearPlayed) {
    resetAutoFollowBeat(null, { clearPlayed: true });
  }
  if (options.pauseAutoFollow) {
    state.autoFollow.pausedAfterManualNavigation = true;
  }

  stopMeasurePlayback();
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
  window.clearTimeout(state.autoFollow.emptyAdvanceTimer);
  state.autoFollow.emptyAdvanceTimer = 0;
  state.autoFollow.animating = true;
  const startedAt = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / AUTO_FOLLOW_ANIMATION_MS);
    const eased = 1 - Math.pow(1 - progress, 3);
    state.practice.viewStartTick = startTick + (endTick - startTick) * eased;
    state.practice.currentMeasure = Math.max(0, Math.min(
      state.practice.measures.length - 1,
      Math.floor(state.practice.viewStartTick / measureTicks)
    ));
    updateAll();

    if (progress < 1) {
      state.autoFollow.animationFrame = window.requestAnimationFrame(step);
      return;
    }

    state.practice.viewStartTick = endTick;
    state.practice.currentMeasure = Math.max(0, Math.min(
      state.practice.measures.length - 1,
      Math.floor(endTick / measureTicks)
    ));
    state.autoFollow.animating = false;
    resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: Boolean(options.clearPlayed) });
    updateAll();
    scheduleAutoFollowEmptyBeatCheck();
  };

  state.autoFollow.animationFrame = window.requestAnimationFrame(step);
}

async function startContinuousPlayback() {
  if (!state.practice.measures.length || state.playback.playing) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    setStatusKey("status.playUnsupported");
    return;
  }

  stopMeasurePlayback();
  if (!state.playback.audioContext) {
    state.playback.audioContext = new AudioContextClass();
  }
  const audioContext = state.playback.audioContext;
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  unlockPlaybackAudio(audioContext);

  const secondsPerTick = (state.practice.microsecondsPerQuarter || 500000) / 1000000 / (state.practice.ticksPerQuarter || MIDI_PPQ);
  const startAt = audioContext.currentTime + 0.08;
  const playbackStartTick = currentAutoFollowBeatStart();
  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  const playbackEndTick = Math.max(playbackStartTick + 1, lastMeasure?.endTick || playbackStartTick + practiceBeatTicks());
  const playbackDuration = Math.max(0.1, (playbackEndTick - playbackStartTick) * secondsPerTick);

  state.playback.playing = true;
  state.playback.activeNodes = [];
  state.playback.activeNotes = new Set();
  state.playback.visualNotes = [];
  state.playback.pendingNotes = [];
  state.playback.pendingNoteIndex = 0;
  state.playback.startTick = playbackStartTick;
  state.playback.endTick = playbackEndTick;
  state.playback.startedAtAudioTime = startAt;
  state.playback.startedAtPerformance = performance.now() + 80;
  state.playback.lastVisualFrameAt = 0;
  state.playback.secondsPerTick = secondsPerTick;

  const pedalIntervals = pedalIntervalsForPlayback(playbackStartTick, playbackEndTick);
  state.practice.notes
    .filter((target) => target.endTick > playbackStartTick && target.startTick < playbackEndTick)
    .forEach((target) => {
      const audibleStartTick = Math.max(target.startTick, playbackStartTick);
      const effectiveEndTick = sustainedPlaybackEndTick(target, pedalIntervals);
      const audibleEndTick = Math.min(effectiveEndTick, playbackEndTick);
      const noteDuration = Math.max(0.08, (audibleEndTick - audibleStartTick) * secondsPerTick);
      state.playback.pendingNotes.push({
        note: target.note,
        startTick: audibleStartTick,
        duration: noteDuration
      });
      state.playback.visualNotes.push({
        note: target.note,
        startTick: audibleStartTick,
        endTick: Math.max(audibleStartTick + 1, audibleEndTick)
      });
    });
  state.playback.pendingNotes.sort((a, b) => a.startTick - b.startTick || a.note - b.note);

  animatePlaybackView();
  state.playback.stopTimer = window.setTimeout(() => {
    stopMeasurePlayback();
    syncPracticeControls();
  }, Math.ceil((playbackDuration + 0.22) * 1000));
  syncPracticeControls();
}

function animatePlaybackView() {
  window.cancelAnimationFrame(state.playback.animationFrame);

  const step = () => {
    if (!state.playback.playing) return;
    const now = performance.now();
    const elapsed = Math.max(0, (now - state.playback.startedAtPerformance) / 1000);
    const playbackTick = state.playback.startTick + elapsed / Math.max(0.000001, state.playback.secondsPerTick);
    triggerPendingPlaybackNotes(playbackTick);
    updatePlaybackActiveNotes(playbackTick);
    if (now - state.playback.lastVisualFrameAt >= 33 || playbackTick >= state.playback.endTick) {
      state.playback.lastVisualFrameAt = now;
      const viewTick = Math.min(maxPracticeViewStartTick(), playbackTick);
      const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
      state.practice.viewStartTick = viewTick;
      state.practice.currentMeasure = Math.max(0, Math.min(
        state.practice.measures.length - 1,
        Math.floor(viewTick / measureTicks)
      ));
      updateAll();
      syncPlaybackScrubber();
    }

    if (playbackTick >= state.playback.endTick) {
      stopMeasurePlayback();
      syncPracticeControls();
      return;
    }

    state.playback.animationFrame = window.requestAnimationFrame(step);
  };

  state.playback.animationFrame = window.requestAnimationFrame(step);
}

function triggerPendingPlaybackNotes(playbackTick) {
  const audioContext = state.playback.audioContext;
  if (!audioContext || audioContext.state === "suspended") return;
  const lookaheadSeconds = 0.12;
  const lookaheadTicks = lookaheadSeconds / Math.max(0.000001, state.playback.secondsPerTick);
  const endTick = playbackTick + lookaheadTicks;

  while (
    state.playback.pendingNoteIndex < state.playback.pendingNotes.length &&
    state.playback.pendingNotes[state.playback.pendingNoteIndex].startTick <= endTick
  ) {
    const item = state.playback.pendingNotes[state.playback.pendingNoteIndex];
    const offsetSeconds = Math.max(0.006, (item.startTick - playbackTick) * state.playback.secondsPerTick);
    schedulePracticeTone(audioContext, item.note, audioContext.currentTime + offsetSeconds, item.duration);
    state.playback.pendingNoteIndex += 1;
  }
}

function updatePlaybackActiveNotes(playbackTick) {
  const activeNotes = new Set();
  state.playback.visualNotes.forEach((item) => {
    if (playbackTick >= item.startTick && playbackTick < item.endTick) {
      activeNotes.add(item.note);
    }
  });
  state.playback.activeNotes = activeNotes;
}

function pedalIntervalsForPlayback(startTick, endTick) {
  return pedalIntervalsForView(startTick, endTick)
    .filter((interval) => interval.endTick > startTick && interval.startTick < endTick)
    .sort((a, b) => a.startTick - b.startTick || a.endTick - b.endTick);
}

function sustainedPlaybackEndTick(target, pedalIntervals) {
  let endTick = Math.max(target.endTick, target.startTick + 1);
  pedalIntervals.forEach((interval) => {
    if (endTick >= interval.startTick && endTick <= interval.endTick) {
      endTick = Math.max(endTick, interval.endTick);
    }
  });
  return endTick;
}

function schedulePracticeTone(audioContext, note, startAt, duration) {
  const frequency = 440 * 2 ** ((note - 69) / 12);
  const safeStartAt = Math.max(audioContext.currentTime + 0.004, startAt);
  const output = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const mainOscillator = audioContext.createOscillator();
  const mainGain = audioContext.createGain();
  const harmonicOscillator = audioContext.createOscillator();
  const harmonicGain = audioContext.createGain();
  const attackClick = audioContext.createBufferSource();
  const clickGain = audioContext.createGain();
  const isHighNote = note >= 72;
  const sustainTime = Math.min(Math.max(0.1, duration), isHighNote ? 0.55 : 1.35);
  const releaseAt = safeStartAt + sustainTime;
  const tailEnd = releaseAt + (isHighNote ? 0.2 : 0.34);
  const clickBuffer = audioContext.createBuffer(1, Math.max(1, Math.floor(audioContext.sampleRate * 0.018)), audioContext.sampleRate);
  const clickData = clickBuffer.getChannelData(0);
  for (let index = 0; index < clickData.length; index += 1) {
    const fade = 1 - index / clickData.length;
    clickData[index] = (Math.random() * 2 - 1) * fade * fade;
  }

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(isHighNote ? 3600 : 6200, frequency * (isHighNote ? 5.2 : 8.5)), safeStartAt);
  filter.frequency.exponentialRampToValueAtTime(Math.max(650, frequency * (isHighNote ? 1.8 : 3.2)), releaseAt);
  filter.Q.setValueAtTime(0.62, safeStartAt);

  output.gain.setValueAtTime(0.0001, safeStartAt);
  output.gain.exponentialRampToValueAtTime(isHighNote ? 0.13 : 0.2, safeStartAt + 0.012);
  output.gain.exponentialRampToValueAtTime(isHighNote ? 0.034 : 0.07, safeStartAt + 0.11);
  output.gain.exponentialRampToValueAtTime(isHighNote ? 0.008 : 0.026, releaseAt);
  output.gain.exponentialRampToValueAtTime(0.0001, tailEnd);

  mainOscillator.type = "triangle";
  mainOscillator.frequency.setValueAtTime(frequency, safeStartAt);
  mainGain.gain.setValueAtTime(0.86, safeStartAt);
  mainOscillator.connect(mainGain);
  mainGain.connect(filter);

  harmonicOscillator.type = "sine";
  harmonicOscillator.frequency.setValueAtTime(frequency * 2.01, safeStartAt);
  harmonicGain.gain.setValueAtTime(isHighNote ? 0.035 : 0.12, safeStartAt);
  harmonicGain.gain.exponentialRampToValueAtTime(0.0001, safeStartAt + (isHighNote ? 0.16 : 0.42));
  harmonicOscillator.connect(harmonicGain);
  harmonicGain.connect(filter);

  attackClick.buffer = clickBuffer;
  clickGain.gain.setValueAtTime(isHighNote ? 0.012 : 0.022, safeStartAt);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, safeStartAt + 0.018);
  attackClick.connect(clickGain);
  clickGain.connect(filter);

  filter.connect(output);
  output.connect(audioContext.destination);
  mainOscillator.start(safeStartAt);
  harmonicOscillator.start(safeStartAt);
  attackClick.start(safeStartAt);
  mainOscillator.stop(tailEnd + 0.02);
  harmonicOscillator.stop(tailEnd + 0.02);
  attackClick.stop(safeStartAt + 0.024);
  state.playback.activeNodes.push(mainOscillator, mainGain, harmonicOscillator, harmonicGain, attackClick, clickGain, filter, output);
}

function unlockPlaybackAudio(audioContext) {
  try {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.025);
    state.playback.activeNodes.push(oscillator, gain);
  } catch {
    // Some older browsers are picky about audio warmup; playback can still try normally.
  }
}

function stopMeasurePlayback() {
  window.cancelAnimationFrame(state.playback.animationFrame);
  state.playback.animationFrame = 0;
  if (state.playback.stopTimer) {
    window.clearTimeout(state.playback.stopTimer);
    state.playback.stopTimer = 0;
  }
  state.playback.activeNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    } catch {
      // Audio nodes may already be stopped.
    }
  });
  state.playback.activeNodes = [];
  state.playback.activeNotes = new Set();
  state.playback.visualNotes = [];
  state.playback.pendingNotes = [];
  state.playback.pendingNoteIndex = 0;
  state.playback.playing = false;
  updateKeyboardActive();
}

function parseMidiFile(bytes) {
  const reader = makeMidiReader(bytes);
  if (reader.readText(4) !== "MThd") throw new Error("不是标准 MIDI 文件");
  const headerLength = reader.readUint32();
  const format = reader.readUint16();
  const trackCount = reader.readUint16();
  const division = reader.readUint16();
  reader.skip(Math.max(0, headerLength - 6));
  if (division & 0x8000) throw new Error("暂不支持 SMPTE 时间格式 MIDI");

  const ticksPerQuarter = division || MIDI_PPQ;
  const noteEvents = [];
  const pedalEvents = [];
  const timeSignatureEvents = [];
  let timeSignature = { numerator: 4, denominator: 4 };
  let microsecondsPerQuarter = 500000;

  for (let trackIndex = 0; trackIndex < trackCount && reader.remaining() >= 8; trackIndex += 1) {
    const chunkType = reader.readText(4);
    const chunkLength = reader.readUint32();
    const trackEnd = reader.position + chunkLength;
    if (chunkType !== "MTrk") {
      reader.position = trackEnd;
      continue;
    }

    const trackResult = parseMidiTrack(bytes, reader.position, trackEnd, ticksPerQuarter);
    noteEvents.push(...trackResult.notes.map((note) => ({ ...note, trackIndex })));
    pedalEvents.push(...trackResult.pedalEvents.map((event) => ({ ...event, trackIndex })));
    timeSignatureEvents.push(...trackResult.timeSignatureEvents);
    if (trackResult.timeSignature) timeSignature = trackResult.timeSignature;
    if (trackResult.microsecondsPerQuarter) microsecondsPerQuarter = trackResult.microsecondsPerQuarter;
    reader.position = trackEnd;
  }

  const notes = noteEvents
    .filter((item) => item.note >= MIDI_MIN && item.note <= MIDI_MAX)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  if (notes.length) {
    const lastNoteTick = Math.max(...notes.map((note) => Math.max(note.endTick, note.startTick + 1)));
    timeSignature = primaryMidiTimeSignature(timeSignatureEvents, lastNoteTick, timeSignature, ticksPerQuarter);
  }
  const measureTicks = ticksPerQuarter * timeSignature.numerator * 4 / timeSignature.denominator;
  if (!notes.length) return { measures: [], pedalEvents, ticksPerQuarter, measureTicks, timeSignature, microsecondsPerQuarter, format };
  const trackRoles = trackRolesForNotes(notes);

  const lastTick = Math.max(...notes.map((note) => Math.max(note.endTick, note.startTick + 1)));
  const measureCount = Math.max(1, Math.ceil(lastTick / measureTicks));
  const measures = Array.from({ length: measureCount }, (_, index) => ({
    index,
    startTick: index * measureTicks,
    endTick: (index + 1) * measureTicks,
    notes: []
  }));

  notes.forEach((note, index) => {
    const measureIndex = Math.max(0, Math.min(measures.length - 1, Math.floor(note.startTick / measureTicks)));
    measures[measureIndex].notes.push({
      ...note,
      trackRole: trackRoles.get(note.trackIndex) || "primary",
      id: `${measureIndex}-${index}-${note.note}-${note.startTick}`
    });
  });

  return {
    measures,
    pedalEvents: pedalEvents.sort((a, b) => a.tick - b.tick || a.value - b.value),
    ticksPerQuarter,
    measureTicks,
    timeSignature,
    microsecondsPerQuarter,
    format
  };
}

function parseMusicXmlText(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("MusicXML 格式不正确");
  const score = firstByLocalName(doc, "score-partwise") || firstByLocalName(doc, "score-timewise");
  if (!score) throw new Error("不是可识别的 MusicXML 文件");
  if (localName(score) === "score-timewise") throw new Error("暂不支持 timewise MusicXML，请导出 partwise 格式");

  const parts = childrenByLocalName(score, "part");
  if (!parts.length) throw new Error("MusicXML 没有找到声部");

  const ticksPerQuarter = MIDI_PPQ;
  const timeSignature = readFirstMusicXmlTime(parts[0]) || { numerator: 4, denominator: 4 };
  const measureTicks = ticksPerQuarter * timeSignature.numerator * 4 / timeSignature.denominator;
  const measureCount = Math.max(...parts.map((part) => childrenByLocalName(part, "measure").length));
  const measures = Array.from({ length: measureCount }, (_, index) => ({
    index,
    startTick: index * measureTicks,
    endTick: (index + 1) * measureTicks,
    notes: []
  }));

  parts.forEach((part, partIndex) => {
    let divisions = 1;
    childrenByLocalName(part, "measure").forEach((measureNode, measureIndex) => {
      const measure = measures[measureIndex];
      if (!measure) return;
      const divisionText = childText(childByLocalName(measureNode, "attributes"), "divisions");
      if (divisionText) divisions = Math.max(1, Number(divisionText) || divisions);

      let cursor = measure.startTick;
      let lastNoteStart = cursor;
      let noteIndex = 0;
      [...measureNode.children].forEach((child) => {
        if (localName(child) === "backup") {
          cursor = Math.max(measure.startTick, cursor - musicXmlDurationToTicks(child, divisions));
          return;
        }
        if (localName(child) === "forward") {
          cursor = Math.min(measure.endTick, cursor + musicXmlDurationToTicks(child, divisions));
          return;
        }
        if (localName(child) !== "note") return;

        const durationTicks = Math.max(1, musicXmlDurationToTicks(child, divisions));
        const isChord = Boolean(childByLocalName(child, "chord"));
        const startTick = isChord ? lastNoteStart : cursor;
        const endTick = Math.max(startTick + 1, startTick + durationTicks);
        const note = musicXmlNoteNumber(child);

        if (note !== null && note >= MIDI_MIN && note <= MIDI_MAX) {
          const staff = Number(childText(child, "staff") || 0);
          measures[measureIndex].notes.push({
            note,
            startTick,
            endTick,
            velocity: 96,
            channel: 0,
            trackIndex: partIndex,
            trackRole: staff === 2 || partIndex > 0 ? "secondary" : "primary",
            id: `${measureIndex}-xml-${partIndex}-${noteIndex}-${note}-${startTick}`
          });
          noteIndex += 1;
        }

        if (!isChord) {
          lastNoteStart = startTick;
          cursor = Math.min(measure.endTick, cursor + durationTicks);
        }
      });
    });
  });

  measures.forEach((measure) => {
    measure.notes.sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  });

  return {
    measures,
    pedalEvents: [],
    ticksPerQuarter,
    measureTicks,
    timeSignature,
    microsecondsPerQuarter: 500000,
    format: "musicxml"
  };
}

function readFirstMusicXmlTime(partNode) {
  const firstMeasure = childByLocalName(partNode, "measure");
  const attributes = childByLocalName(firstMeasure, "attributes");
  const timeNode = childByLocalName(attributes, "time");
  if (!timeNode) return null;
  const beats = Number(childText(timeNode, "beats"));
  const beatType = Number(childText(timeNode, "beat-type"));
  if (!beats || !beatType) return null;
  return { numerator: beats, denominator: beatType };
}

function musicXmlDurationToTicks(node, divisions) {
  const value = Number(childText(node, "duration") || 0);
  return Math.round(value / Math.max(1, divisions) * MIDI_PPQ);
}

function musicXmlNoteNumber(noteNode) {
  if (childByLocalName(noteNode, "rest")) return null;
  const pitch = childByLocalName(noteNode, "pitch");
  if (!pitch) return null;
  const step = childText(pitch, "step");
  const octave = Number(childText(pitch, "octave"));
  const alter = Number(childText(pitch, "alter") || 0);
  if (!(step in XML_STEP_TO_SEMITONE) || !Number.isFinite(octave)) return null;
  return (octave + 1) * 12 + XML_STEP_TO_SEMITONE[step] + alter;
}

function localName(node) {
  return node?.localName || node?.tagName || "";
}

function firstByLocalName(node, name) {
  return [...node.getElementsByTagName("*")].find((child) => localName(child) === name) || null;
}

function childrenByLocalName(node, name) {
  if (!node) return [];
  return [...node.children].filter((child) => localName(child) === name);
}

function childByLocalName(node, name) {
  return childrenByLocalName(node, name)[0] || null;
}

function childText(node, name) {
  return directText(childByLocalName(node, name));
}

function directText(node) {
  return node?.textContent?.trim() || "";
}

function trackRolesForNotes(notes) {
  const stats = new Map();
  notes.forEach((note) => {
    const trackIndex = note.trackIndex ?? 0;
    const current = stats.get(trackIndex) || { count: 0, totalPitch: 0 };
    current.count += 1;
    current.totalPitch += note.note;
    stats.set(trackIndex, current);
  });

  const noteTracks = [...stats.entries()]
    .filter(([, stat]) => stat.count > 0)
    .map(([trackIndex, stat]) => ({
      trackIndex,
      averagePitch: stat.totalPitch / stat.count
    }));

  if (noteTracks.length < 2) return new Map();
  noteTracks.sort((a, b) => a.averagePitch - b.averagePitch || a.trackIndex - b.trackIndex);
  return new Map([[noteTracks[0].trackIndex, "secondary"]]);
}

function primaryMidiTimeSignature(events, lastTick, fallback, ticksPerQuarter) {
  const signatures = (events || [])
    .filter((event) => event.numerator > 0 && event.denominator > 0)
    .sort((a, b) => a.tick - b.tick || a.numerator - b.numerator || a.denominator - b.denominator);
  if (!signatures.length) return fallback || { numerator: 4, denominator: 4 };

  const scoreBySignature = new Map();
  signatures.forEach((event, index) => {
    const nextTick = signatures[index + 1]?.tick ?? Math.max(lastTick, event.tick + 1);
    const span = Math.max(1, nextTick - event.tick);
    const key = `${event.numerator}/${event.denominator}`;
    scoreBySignature.set(key, (scoreBySignature.get(key) || 0) + span);
  });

  const best = [...scoreBySignature.entries()]
    .sort((a, b) => b[1] - a[1] || measureTicksForTimeSignature(parseTimeSignatureKey(b[0]), ticksPerQuarter) - measureTicksForTimeSignature(parseTimeSignatureKey(a[0]), ticksPerQuarter))[0]?.[0];
  const selected = best ? parseTimeSignatureKey(best) : fallback;
  const selectedMeasureTicks = measureTicksForTimeSignature(selected, ticksPerQuarter);
  if (selectedMeasureTicks < ticksPerQuarter * 2 && lastTick > selectedMeasureTicks * 24) {
    return { numerator: 4, denominator: 4 };
  }
  return selected;
}

function parseMidiTrack(bytes, start, end) {
  const reader = makeMidiReader(bytes, start);
  const activeNotes = new Map();
  const notes = [];
  const pedalEvents = [];
  const timeSignatureEvents = [];
  let tick = 0;
  let runningStatus = 0;
  let timeSignature = null;
  let microsecondsPerQuarter = null;

  while (reader.position < end) {
    tick += reader.readVarLen();
    let status = reader.readUint8();
    if (status < 0x80) {
      if (!runningStatus) throw new Error("MIDI running status 无效");
      reader.position -= 1;
      status = runningStatus;
    } else if (status < 0xf0) {
      runningStatus = status;
    }

    if (status === 0xff) {
      const type = reader.readUint8();
      const length = reader.readVarLen();
      if (type === 0x58 && length >= 2) {
        const numerator = reader.readUint8();
        const denominatorPower = reader.readUint8();
        timeSignature = { numerator, denominator: 2 ** denominatorPower };
        timeSignatureEvents.push({ tick, ...timeSignature });
        reader.skip(length - 2);
      } else if (type === 0x51 && length >= 3) {
        microsecondsPerQuarter = (reader.readUint8() << 16) | (reader.readUint8() << 8) | reader.readUint8();
        reader.skip(length - 3);
      } else {
        reader.skip(length);
      }
      continue;
    }

    if (status === 0xf0 || status === 0xf7) {
      reader.skip(reader.readVarLen());
      continue;
    }

    const command = status & 0xf0;
    const channel = status & 0x0f;
    const data1 = reader.readUint8();
    const hasSecondDataByte = command !== 0xc0 && command !== 0xd0;
    const data2 = hasSecondDataByte ? reader.readUint8() : 0;

    if (command === 0x90 && data2 > 0) {
      const key = `${channel}:${data1}`;
      if (!activeNotes.has(key)) activeNotes.set(key, []);
      activeNotes.get(key).push({ note: data1, velocity: data2, channel, startTick: tick });
    } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
      const key = `${channel}:${data1}`;
      const stack = activeNotes.get(key);
      const started = stack?.shift();
      if (started) notes.push({ ...started, endTick: Math.max(tick, started.startTick + 1) });
    } else if (command === 0xb0 && data1 === 64) {
      pedalEvents.push({ tick, value: data2, channel });
    }
  }

  activeNotes.forEach((stack) => {
    stack.forEach((started) => {
      notes.push({ ...started, endTick: Math.max(tick, started.startTick + 1) });
    });
  });

  return { notes, pedalEvents, timeSignature, timeSignatureEvents, microsecondsPerQuarter };
}

function makeMidiReader(bytes, position = 0) {
  return {
    bytes,
    position,
    remaining() {
      return this.bytes.length - this.position;
    },
    readUint8() {
      if (this.position >= this.bytes.length) throw new Error("MIDI 文件不完整");
      return this.bytes[this.position++];
    },
    readUint16() {
      return (this.readUint8() << 8) | this.readUint8();
    },
    readUint32() {
      return ((this.readUint8() << 24) | (this.readUint8() << 16) | (this.readUint8() << 8) | this.readUint8()) >>> 0;
    },
    readText(length) {
      let text = "";
      for (let index = 0; index < length; index += 1) {
        text += String.fromCharCode(this.readUint8());
      }
      return text;
    },
    readVarLen() {
      let value = 0;
      for (let index = 0; index < 4; index += 1) {
        const byte = this.readUint8();
        value = (value << 7) | (byte & 0x7f);
        if (!(byte & 0x80)) return value;
      }
      return value;
    },
    skip(length) {
      this.position = Math.min(this.bytes.length, this.position + Math.max(0, length));
    }
  };
}

function buildMidiFile(events) {
  const track = [];
  let previousTick = 0;
  const microsecondsPerQuarter = Math.round(60000000 / RECORDING_BPM);

  pushVarLen(track, 0);
  track.push(0xff, 0x51, 0x03, (microsecondsPerQuarter >> 16) & 0xff, (microsecondsPerQuarter >> 8) & 0xff, microsecondsPerQuarter & 0xff);

  events
    .slice()
    .sort((a, b) => a.timeMs - b.timeMs)
    .forEach((event) => {
      const tick = Math.max(previousTick, Math.round(event.timeMs * MIDI_PPQ * RECORDING_BPM / 60000));
      pushVarLen(track, tick - previousTick);
      previousTick = tick;
      if (event.type === "noteon") {
        track.push(0x90, clampMidiByte(event.note), clampMidiByte(event.velocity || 96));
      } else if (event.type === "noteoff") {
        track.push(0x80, clampMidiByte(event.note), clampMidiByte(event.velocity || 0));
      } else if (event.type === "cc") {
        track.push(0xb0, clampMidiByte(event.controller), clampMidiByte(event.value));
      }
    });

  pushVarLen(track, 0);
  track.push(0xff, 0x2f, 0x00);

  const header = [
    ...asciiBytes("MThd"),
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    (MIDI_PPQ >> 8) & 0xff, MIDI_PPQ & 0xff
  ];
  const trackHeader = [
    ...asciiBytes("MTrk"),
    (track.length >> 24) & 0xff,
    (track.length >> 16) & 0xff,
    (track.length >> 8) & 0xff,
    track.length & 0xff
  ];
  return new Uint8Array([...header, ...trackHeader, ...track]);
}

function pushVarLen(target, value) {
  const bytes = [value & 0x7f];
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  target.push(...bytes);
}

function asciiBytes(text) {
  return [...text].map((char) => char.charCodeAt(0));
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function clampMidiByte(value) {
  return Math.max(0, Math.min(127, Number(value) || 0));
}

function updateAll() {
  syncControlsFromState();
  drawStaff();
  updateKeyboardActive();
  syncPracticeControls();
}

function updateKeyboardActive() {
  const cueNotes = nextPracticeCueNotes();
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    const note = Number(key.dataset.note);
    const active = state.activeNotes.has(note) || state.playback.activeNotes.has(note);
    key.classList.toggle("active", active);
    key.classList.toggle("cue", !active && cueNotes.has(note));
  });
}

async function connectMidi() {
  els.connectButton.disabled = true;
  if (window.webkit?.messageHandlers?.midiBridge) {
    setStatusKey("status.connectingIos");
    window.webkit.messageHandlers.midiBridge.postMessage({ type: "connect" });
    els.connectButton.disabled = false;
    return;
  }

  if (!("requestMIDIAccess" in navigator)) {
    setStatusKey("status.webMidiUnsupported");
    els.connectButton.disabled = false;
    return;
  }

  try {
    setStatusKey("status.requestingMidi");
    state.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    state.midiAccess.onstatechange = refreshMidiInputs;
    refreshMidiInputs();
    attachSelectedInput();
  } catch (error) {
    setStatusKey("status.midiDenied", { message: error.message || "浏览器拒绝访问" });
  } finally {
    els.connectButton.disabled = false;
  }
}

function autoConnectMidi() {
  window.setTimeout(() => {
    connectMidi();
  }, 350);
}

async function toggleFullscreen() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    if (fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return;
    }

    const target = document.documentElement;
    if (target.requestFullscreen) {
      await target.requestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
    } else {
      setStatusKey("status.fullscreenUnsupported");
    }
  } catch (error) {
    setStatusKey("status.fullscreenFailed", { message: error.message || "浏览器需要手动允许" });
  }
}

function syncFullscreenButton() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  els.fullscreenButton.textContent = fullscreenElement ? t("button.exitFullscreen") : t("button.fullscreen");
}

function refreshMidiInputs() {
  const previous = state.selectedInputId || els.inputSelect.value;
  const inputs = [...state.midiAccess.inputs.values()];
  els.inputField.classList.toggle("hidden", inputs.length <= 1);
  els.inputSelect.replaceChildren(new Option(t("option.autoSelect"), ""));
  inputs.forEach((input) => {
    const label = input.name || input.manufacturer || input.id;
    els.inputSelect.appendChild(new Option(label, input.id));
  });
  const hasPreviousInput = inputs.some((input) => input.id === previous);
  els.inputSelect.value = hasPreviousInput ? previous : "";
  if (hasPreviousInput || !previous) {
    state.selectedInputId = els.inputSelect.value;
    saveSettings();
  }
  attachSelectedInput();
}

function attachSelectedInput() {
  if (!state.midiAccess) return;
  const inputs = [...state.midiAccess.inputs.values()];
  inputs.forEach((input) => {
    input.onmidimessage = null;
  });

  const selectedId = els.inputSelect.value;
  const input = selectedId
    ? inputs.find((item) => item.id === selectedId)
    : inputs.find((item) => item.state === "connected") || inputs[0];

  state.selectedInputId = selectedId;
  saveSettings();
  if (!input) {
    setStatusKey("status.noMidiInput");
    return;
  }

  input.onmidimessage = handleMidiMessage;
  setStatusKey("status.connected", { name: input.name || input.manufacturer || "MIDI 输入" });
}

function handleMidiMessage(event) {
  handleMidiBytes(event.data);
}

function handleMidiBytes(data) {
  const bytes = Array.from(data || [])
    .map((byte) => Number(byte) & 0xff)
    .filter((byte) => Number.isFinite(byte));
  if (!bytes.length) return;

  let index = 0;
  let runningStatus = 0;
  const firstStatus = bytes[0];
  const firstDataLength = firstStatus >= 0x80 && firstStatus < 0xf0
    ? midiDataLengthForStatus(firstStatus)
    : 0;

  if (firstDataLength && bytes.length >= firstDataLength + 1) {
    handleMidiCommand(firstStatus, bytes[1], firstDataLength > 1 ? bytes[2] : 0);
    index = firstDataLength + 1;
    runningStatus = firstStatus;
  }

  while (index < bytes.length) {
    let status = bytes[index];

    if (status >= 0xf8) {
      index += 1;
      continue;
    }

    if (status >= 0x80) {
      runningStatus = status;
      index += 1;
    } else if (runningStatus) {
      status = runningStatus;
    } else {
      index += 1;
      continue;
    }

    const dataLength = midiDataLengthForStatus(status);
    if (!dataLength) {
      runningStatus = 0;
      while (index < bytes.length && bytes[index] < 0x80) index += 1;
      continue;
    }
    if (index + dataLength > bytes.length) break;

    const note = bytes[index];
    const value = dataLength > 1 ? bytes[index + 1] : 0;
    handleMidiCommand(status, note, value);
    index += dataLength;
  }
}

function midiDataLengthForStatus(status) {
  const command = status & 0xf0;
  if (command === 0xc0 || command === 0xd0) return 1;
  if (command >= 0x80 && command <= 0xe0) return 2;
  if (status === 0xf1 || status === 0xf3) return 1;
  if (status === 0xf2) return 2;
  return 0;
}

function handleMidiCommand(status, note, value) {
  const command = status & 0xf0;

  if (command === 0x90 && value > 0) {
    pressNote(note, value, "midi");
    return;
  }

  if (command === 0x80 || (command === 0x90 && value === 0)) {
    releaseNote(note, "midi");
    return;
  }

  if (command === 0xb0 && note === 64) {
    recordMidiEvent("cc", { controller: 64, value });
    const pressed = value >= 64;
    state.sustainDown = pressed;
    if (!state.sustainDown) releaseSustainedNotes();
    return;
  }

  if (command === 0xb0 && isLeftPedalControl(note)) {
    recordMidiEvent("cc", { controller: note, value });
    setStatusKey("status.leftPedalSignal", { controller: note, value });
    const pressed = value > 0;
    if (pressed && !state.softPedalDown) {
      setStatusKey("status.leftPedalPage", { controller: note });
      advanceByPedalStep();
    }
    state.softPedalDown = pressed;
    return;
  }
}

function isLeftPedalControl(controller) {
  if (controller === 64 || controller >= 120) return false;
  return LEFT_PEDAL_CONTROLLERS.has(controller) || controller < 120;
}

function advanceByPedalStep() {
  if (state.pedalStep === "off") return;
  advancePracticeGrid(1, { clearPlayed: true, pauseAutoFollow: true });
}

function advanceBySustainPedalPage() {
  if (state.sustainPedalPage === "off" || !state.practice.measures.length) return;
  const now = performance.now();
  if (now - state.lastSustainPedalPageAt < SUSTAIN_PEDAL_PAGE_DEBOUNCE_MS) return;
  state.lastSustainPedalPageAt = now;

  if (state.sustainPedalPage === "half") {
    panPracticeView(0.5);
    return;
  }
  panPracticeView(1);
}

window.PianoMidiNative = {
  receiveMidiMessage(data) {
    handleMidiBytes(data);
  },
  receiveHardwareKey(data) {
    handleHardwarePedalInput(data);
  },
  setMidiStatus(text) {
    setStatus(text);
  }
};

function setStatus(text) {
  state.statusMessage = null;
  els.statusText.textContent = text;
  setStatusTone("info");
}

function setupPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      setStatusKey("status.cacheFailed");
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    els.installButton.classList.remove("hidden");
  });
}

async function forceRefreshApp() {
  setStatusKey("status.refreshing");

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    setStatusKey("status.reloading");
  }

  const url = new URL(window.location.href);
  url.searchParams.set("v", APP_VERSION);
  url.searchParams.set("fresh", Date.now().toString());
  window.location.replace(url.toString());
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || state.wakeLock) return;

  try {
    state.wakeLock = await navigator.wakeLock.request("screen");
    state.wakeLock.addEventListener("release", () => {
      state.wakeLock = null;
    });
  } catch {
    state.wakeLock = null;
  }
}

function setupWakeLock() {
  requestWakeLock();
  const wakeFromGesture = () => {
    requestWakeLock();
  };

  window.addEventListener("pointerdown", wakeFromGesture, { passive: true });
  window.addEventListener("keydown", wakeFromGesture);
  window.addEventListener("touchstart", wakeFromGesture, { passive: true });
}

function setupScoreClickPaging() {
  els.scoreBoard.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.target.closest("button")) return;
    state.scorePointer = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
  });

  els.scoreBoard.addEventListener("pointerup", (event) => {
    handleScoreClickEnd(event);
  });
  els.scoreBoard.addEventListener("pointercancel", (event) => {
    state.scorePointer.active = false;
  });
}

function handleScoreClickEnd(event) {
  if (!state.scorePointer.active || event.pointerId !== state.scorePointer.pointerId) return;
  const dx = event.clientX - state.scorePointer.startX;
  const dy = event.clientY - state.scorePointer.startY;
  state.scorePointer.active = false;

  if (Math.abs(dx) > 14 || Math.abs(dy) > 14) return;
  const rect = els.scoreBoard.getBoundingClientRect();
  const direction = event.clientX < rect.left + rect.width / 2 ? -1 : 1;
  advancePracticeGrid(direction, { clearPlayed: true, pauseAutoFollow: true });
}

function setupHardwarePedalKeys() {
  const handleKeyEvent = (event) => {
    const target = event.target;
    if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key === " " || event.code === "Space" ? " " : event.key;
    const code = event.code || "";
    const handled = handleHardwarePedalInput({ key, code, phase: event.type });
    if (handled) event.preventDefault();
  };

  window.addEventListener("keydown", handleKeyEvent);
  window.addEventListener("keyup", handleKeyEvent);
}

function handleHardwarePedalInput(data) {
  const key = String(data?.key || "Unidentified");
  const code = String(data?.code || "");

  if (!isHardwarePedalKey(key, code)) return false;
  const now = performance.now();
  if (now - state.lastHardwarePedalAt < HARDWARE_PEDAL_DEBOUNCE_MS) return true;

  state.lastHardwarePedalAt = now;
  setStatusKey("status.leftPedalKeyPage", { key: key || code || "hardware" });
  advanceByPedalStep();
  return true;
}

function isHardwarePedalKey(key, code) {
  if (HARDWARE_PEDAL_KEYS.has(key) || HARDWARE_PEDAL_CODES.has(code)) return true;
  if (key === "Unidentified" || code === "Unidentified") return true;
  return /^[0-9]+$/.test(code);
}

function preventPageZoom() {
  document.addEventListener("touchmove", (event) => {
    if (event.touches && event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      event.preventDefault();
    }, { passive: false });
  });

  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  }, { passive: false });
}

function setupEvents() {
  els.connectButton.addEventListener("click", connectMidi);
  els.recordButton.addEventListener("click", startRecording);
  els.stopRecordButton.addEventListener("click", stopRecording);
  els.saveRecordButton.addEventListener("click", saveRecording);
  els.loadMidiButton.addEventListener("click", () => els.midiFileInput.click());
  els.midiFileInput.addEventListener("change", () => loadScoreFile(els.midiFileInput.files[0]));
  els.startMeasureButton.addEventListener("click", goToPracticeStart);
  els.playMeasureButton.addEventListener("click", startContinuousPlayback);
  els.pausePlaybackButton.addEventListener("click", () => {
    stopMeasurePlayback();
    syncPracticeControls();
  });
  els.playbackSlider.addEventListener("input", () => {
    seekPracticeView(els.playbackSlider.value);
  });
  els.fullscreenButton.addEventListener("click", toggleFullscreen);
  els.refreshButton.addEventListener("click", forceRefreshApp);
  document.addEventListener("fullscreenchange", syncFullscreenButton);
  document.addEventListener("webkitfullscreenchange", syncFullscreenButton);
  els.inputSelect.addEventListener("change", () => {
    state.selectedInputId = els.inputSelect.value;
    saveSettings();
    attachSelectedInput();
  });
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.language = normalizeLanguage(button.dataset.language);
      applyLanguage();
      saveSettings();
    });
  });
  els.keyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.keySignature = button.dataset.keySignature;
      syncControlsFromState();
      saveSettings();
      drawStaff();
    });
  });
  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.noteLabelMode = button.dataset.labelMode;
      syncControlsFromState();
      saveSettings();
      drawStaff();
    });
  });
  els.pedalStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.pedalStep = button.dataset.pedalStep;
      syncControlsFromState();
      saveSettings();
    });
  });
  els.sustainPedalPageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.sustainPedalPage = button.dataset.sustainPedalPage;
      syncControlsFromState();
      saveSettings();
    });
  });
  els.autoFollowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      cancelAutoFollowAnimation();
      state.autoFollowMode = button.dataset.autoFollowMode;
      resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: true });
      syncControlsFromState();
      saveSettings();
      scheduleAutoFollowEmptyBeatCheck();
    });
  });
  els.toleranceSlider.addEventListener("input", () => {
    state.autoFollowTolerance = clampTolerance(els.toleranceSlider.value);
    syncControlsFromState();
    saveSettings();
    evaluateAutoFollowBeat();
  });
  els.toleranceSlider.addEventListener("change", () => {
    state.autoFollowTolerance = clampTolerance(els.toleranceSlider.value);
    syncControlsFromState();
    saveSettings();
    evaluateAutoFollowBeat();
  });
  els.timeSignatureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updatePracticeTimeSignature(parseTimeSignatureKey(button.dataset.timeSignature));
      saveSettings();
    });
  });
  window.addEventListener("pagehide", () => {
    saveSettings();
  });
  window.addEventListener("resize", () => {
    buildKeyboard();
  });
  window.addEventListener("beforeunload", () => {
    stopMeasurePlayback();
    revokeRecordingUrl();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveSettings();
    } else {
      requestWakeLock();
    }
  });
  els.installButton.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    els.installButton.classList.add("hidden");
  });
}

applySavedSettings();
els.versionBadge.textContent = APP_VERSION;
applyLanguage();
syncRecordingControls();
syncFullscreenButton();
syncPracticeControls();
setupEvents();
setupPwa();
setupWakeLock();
setupScoreClickPaging();
setupHardwarePedalKeys();
preventPageZoom();
buildKeyboard();
drawStaff();
autoConnectMidi();
