"use strict";

const MIDI_MIN = 21;
const MIDI_MAX = 108;
const WHITE_KEY_WIDTH_PX = 38;
const WHITE_PATTERN = new Set([0, 2, 4, 5, 7, 9, 11]);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const KEY_RANGE = { min: MIDI_MIN, max: MIDI_MAX };
const SETTINGS_KEY = "piano-midi-staff-settings";
const MIDI_PPQ = 480;
const RECORDING_BPM = 120;
const SETTINGS_FIELD_KEYS = {
  keySignature: "piano-midi-staff-key-signature",
  showDegrees: "piano-midi-staff-show-degrees",
  noteLabelMode: "piano-midi-staff-note-label-mode",
  selectedInputId: "piano-midi-staff-midi-input"
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
    treble: { F: 130, C: 160, G: 120, D: 150, A: 180, E: 140, B: 170 },
    bass: { F: 300, C: 330, G: 290, D: 320, A: 280, E: 310, B: 340 }
  },
  b: {
    treble: { B: 170, E: 140, A: 180, D: 150, G: 190, C: 160, F: 200 },
    bass: { B: 340, E: 310, A: 350, D: 320, G: 360, C: 330, F: 370 }
  }
};
const KEY_SIGNATURE_ORDER = {
  "#": ["F", "C", "G", "D", "A", "E", "B"],
  b: ["B", "E", "A", "D", "G", "C", "F"]
};

const state = {
  midiAccess: null,
  selectedInputId: "",
  activeNotes: new Map(),
  releasedWhileSustained: new Set(),
  sustainDown: false,
  keySignature: "C",
  noteLabelMode: "degree",
  deferredInstallPrompt: null,
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
  installButton: document.getElementById("installButton"),
  inputSelect: document.getElementById("inputSelect"),
  keyButtons: [...document.querySelectorAll("[data-key-signature]")],
  modeButtons: [...document.querySelectorAll("[data-label-mode]")],
  staffSvg: document.getElementById("staffSvg"),
  keyboard: document.getElementById("keyboard")
};

function noteName(note) {
  const octave = Math.floor(note / 12) - 1;
  return `${NOTE_NAMES[note % 12]}${octave}`;
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
  const referenceY = clef === "bass" ? 360 : 210;
  return referenceY - (step - reference) * 10;
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
    if (keySignature) settings.keySignature = keySignature;
    if (["degree", "pitch", "none"].includes(noteLabelMode)) settings.noteLabelMode = noteLabelMode;
    if (showDegrees === "true" || showDegrees === "false") settings.showDegrees = showDegrees === "true";
    if (selectedInputId !== null) settings.selectedInputId = selectedInputId;
  } catch {
    // Storage can be blocked in some browser modes; defaults are fine.
  }
  return settings;
}

function saveSettings() {
  const settings = {
    keySignature: state.keySignature,
    noteLabelMode: state.noteLabelMode,
    selectedInputId: state.selectedInputId
  };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.keySignature, settings.keySignature);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.showDegrees, String(settings.noteLabelMode === "degree"));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.noteLabelMode, settings.noteLabelMode);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.selectedInputId, settings.selectedInputId);
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
}

function syncRecordingControls() {
  els.recordButton.classList.toggle("hidden", state.recording.active);
  els.stopRecordButton.classList.toggle("hidden", !state.recording.active);
  els.saveRecordButton.disabled = state.recording.active || !state.recording.events.length;
}

function applySavedSettings() {
  const settings = readSettings();
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
  syncControlsFromState();
}

function drawStaff() {
  const svg = els.staffSvg;
  svg.replaceChildren();

  const bg = createSvg("rect", { x: 0, y: 0, width: 1100, height: 460, fill: "#fffdf8" });
  svg.appendChild(bg);

  [130, 150, 170, 190, 210, 280, 300, 320, 340, 360].forEach((y) => {
    svg.appendChild(createSvg("line", { x1: 88, y1: y, x2: 1036, y2: y, class: "staff-line" }));
  });
  [88, 1036].forEach((x) => {
    svg.appendChild(createSvg("line", { x1: x, y1: 130, x2: x, y2: 360, class: "bar-line" }));
  });

  const treble = createSvg("text", { x: 112, y: 202, class: "clef" });
  treble.textContent = "𝄞";
  const bass = createSvg("text", { x: 118, y: 354, class: "clef" });
  bass.textContent = "𝄢";
  svg.append(treble, bass);
  drawKeySignature(svg);

  const visibleNotes = [...state.activeNotes.keys()].sort((a, b) => a - b);
  if (!visibleNotes.length) {
    return;
  }

  const chordX = 585;
  const noteItems = visibleNotes.map((note) => {
    const clef = preferredClef(note);
    const step = midiToStaffStep(note);
    return { note, clef, step, xOffset: 0 };
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
      const spread = 22;
      cluster.forEach((item, itemIndex) => {
        item.xOffset = (itemIndex - (cluster.length - 1) / 2) * spread;
      });
    }
  }

  noteItems.forEach(({ note, clef, xOffset }) => {
    const x = chordX + xOffset;
    const y = yForNote(note, clef);
    drawLedgerLines(svg, x, y, clef);

    svg.appendChild(createSvg("circle", { cx: x, cy: y, r: 10, class: "note-head" }));

    const innerLabel = noteInnerLabel(note);
    if (innerLabel) {
      const noteInnerLabelText = createSvg("text", {
        x,
        y,
        class: "note-inner-label",
        "data-note-inner-label": innerLabel
      });
      noteInnerLabelText.textContent = innerLabel;
      svg.appendChild(noteInnerLabelText);
    }

    const accidental = accidentalForNote(note);
    if (accidental) {
      const accidentalText = createSvg("text", {
        x: x - 34,
        y: y + 10,
        class: "accidental",
        fill: "#292522",
        "data-accidental": accidental
      });
      accidentalText.textContent = accidental;
      svg.appendChild(accidentalText);
    }

  });
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
    const x = 170 + index * 18;
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

function drawLedgerLines(svg, x, y, clef) {
  const lineYs = clef === "bass" ? [280, 300, 320, 340, 360] : [130, 150, 170, 190, 210];
  const min = Math.min(...lineYs);
  const max = Math.max(...lineYs);
  const ledgerYs = [];
  for (let ly = min - 20; ly >= y - 1; ly -= 20) ledgerYs.push(ly);
  for (let ly = max + 20; ly <= y + 1; ly += 20) ledgerYs.push(ly);
  ledgerYs.forEach((ly) => {
    svg.appendChild(createSvg("line", { x1: x - 28, y1: ly, x2: x + 28, y2: ly, class: "ledger-line" }));
  });
}

function buildKeyboard() {
  const { min, max } = KEY_RANGE;
  const whiteNotes = [];
  for (let note = min; note <= max; note += 1) {
    if (isWhite(note)) whiteNotes.push(note);
  }
  const whiteWidth = 100 / whiteNotes.length;
  const whiteIndex = new Map(whiteNotes.map((note, index) => [note, index]));

  els.keyboard.replaceChildren();
  els.keyboard.style.minWidth = `${whiteNotes.length * WHITE_KEY_WIDTH_PX}px`;

  for (let note = min; note <= max; note += 1) {
    if (!isWhite(note)) continue;
    const key = makeKey(note, "white-key");
    const left = whiteIndex.get(note) * whiteWidth;
    key.style.left = `${left}%`;
    key.style.width = `${whiteWidth}%`;
    els.keyboard.appendChild(key);
  }

  for (let note = min; note <= max; note += 1) {
    if (isWhite(note)) continue;
    const previousWhite = findPreviousWhite(note);
    if (!whiteIndex.has(previousWhite)) continue;
    const left = (whiteIndex.get(previousWhite) + 0.72) * whiteWidth;
    const blackWidth = whiteWidth * 0.598;
    const key = makeKey(note, "black-key");
    key.style.left = `${left}%`;
    key.style.width = `${blackWidth}%`;
    els.keyboard.appendChild(key);
  }
  updateKeyboardActive();
  requestAnimationFrame(centerKeyboardOnMiddleC);
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
  key.dataset.note = String(note);
  key.setAttribute("aria-label", noteName(note));
  key.textContent = className === "black-key" ? "" : note % 12 === 0 ? noteName(note) : "";
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
  updateAll();
}

function releaseNote(note) {
  if (state.activeNotes.has(note)) {
    recordMidiEvent("noteoff", { note, velocity: 0 });
  }
  if (state.sustainDown) {
    state.releasedWhileSustained.add(note);
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
  setStatus("录制中...");
}

function stopRecording() {
  if (!state.recording.active) return;
  [...state.activeNotes.keys()].forEach((note) => {
    recordMidiEvent("noteoff", { note, velocity: 0 });
  });
  state.recording.active = false;
  syncRecordingControls();
  const count = state.recording.events.filter((event) => event.type === "noteon").length;
  setStatus(count ? `录制完成：${count} 个音，点击保存 MIDI` : "录制完成：没有记录到音符");
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
  const blob = new Blob([bytes], { type: "audio/midi" });
  revokeRecordingUrl();
  state.recording.lastBlobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = state.recording.lastBlobUrl;
  anchor.download = `piano-midi-take-${String(state.recording.takeNumber).padStart(2, "0")}.mid`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  state.recording.takeNumber += 1;
  setStatus("MIDI 文件已生成");
}

function revokeRecordingUrl() {
  if (!state.recording.lastBlobUrl) return;
  URL.revokeObjectURL(state.recording.lastBlobUrl);
  state.recording.lastBlobUrl = "";
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

function clampMidiByte(value) {
  return Math.max(0, Math.min(127, Number(value) || 0));
}

function updateAll() {
  drawStaff();
  updateKeyboardActive();
}

function updateKeyboardActive() {
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    key.classList.toggle("active", state.activeNotes.has(Number(key.dataset.note)));
  });
}

async function connectMidi() {
  if (!("requestMIDIAccess" in navigator)) {
    setStatus("iPad Safari 不能让网页读取 MIDI。蓝牙键盘已连接也只能给原生 CoreMIDI App 使用；请用电脑 Chrome/Edge，或做 iPad 原生版。");
    return;
  }

  try {
    setStatus("正在请求 MIDI 权限...");
    state.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    state.midiAccess.onstatechange = refreshMidiInputs;
    refreshMidiInputs();
    attachSelectedInput();
  } catch (error) {
    setStatus(`MIDI 权限未开启：${error.message || "浏览器拒绝访问"}`);
  }
}

function refreshMidiInputs() {
  const previous = state.selectedInputId || els.inputSelect.value;
  const inputs = [...state.midiAccess.inputs.values()];
  els.inputSelect.replaceChildren(new Option("自动选择", ""));
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
    setStatus("没有发现 MIDI 输入。USB 线或蓝牙 MIDI 配对后再点连接。");
    return;
  }

  input.onmidimessage = handleMidiMessage;
  setStatus(`已连接：${input.name || input.manufacturer || "MIDI 输入"}`);
}

function handleMidiMessage(event) {
  const [status, note, value] = event.data;
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
    state.sustainDown = value >= 64;
    if (!state.sustainDown) releaseSustainedNotes();
  }
}

function setStatus(text) {
  els.statusText.textContent = text;
}

function setupPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      setStatus("页面可使用，但离线缓存注册失败。");
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    els.installButton.classList.remove("hidden");
  });
}

function setupEvents() {
  els.connectButton.addEventListener("click", connectMidi);
  els.recordButton.addEventListener("click", startRecording);
  els.stopRecordButton.addEventListener("click", stopRecording);
  els.saveRecordButton.addEventListener("click", saveRecording);
  els.inputSelect.addEventListener("change", () => {
    state.selectedInputId = els.inputSelect.value;
    saveSettings();
    attachSelectedInput();
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
  window.addEventListener("pagehide", saveSettings);
  window.addEventListener("beforeunload", revokeRecordingUrl);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveSettings();
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
syncRecordingControls();
setupEvents();
setupPwa();
buildKeyboard();
drawStaff();
