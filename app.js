"use strict";

const APP_VERSION = "v55";
const MIDI_MIN = 21;
const MIDI_MAX = 108;
const WHITE_KEY_WIDTH_PX = 38;
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
const SETTINGS_FIELD_KEYS = {
  keySignature: "piano-midi-staff-key-signature",
  showDegrees: "piano-midi-staff-show-degrees",
  noteLabelMode: "piano-midi-staff-note-label-mode",
  selectedInputId: "piano-midi-staff-midi-input",
  pedalStep: "piano-midi-staff-pedal-step",
  sustainPedalPage: "piano-midi-staff-sustain-pedal-page",
  autoFollowMode: "piano-midi-staff-auto-follow-mode"
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
const STAFF_VIEWBOX = { width: 1760, height: 720 };
const STAFF_STEP_PX = 20;
const TREBLE_LINE_YS = [180, 220, 260, 300, 340];
const BASS_LINE_YS = [420, 460, 500, 540, 580];
const NOTE_RADIUS = 20;
const MEASURE_NOTE_LEFT_X = 500;
const MEASURE_NOTE_RIGHT_X = 1620;
const BEAT_GRID_TOP_Y = TREBLE_LINE_YS[0];
const BEAT_GRID_BOTTOM_Y = BASS_LINE_YS[4];
const LEDGER_OCTAVE_LIMIT = STAFF_STEP_PX * 6;

const state = {
  midiAccess: null,
  selectedInputId: "",
  activeNotes: new Map(),
  releasedWhileSustained: new Set(),
  sustainDown: false,
  softPedalDown: false,
  keySignature: "C",
  noteLabelMode: "degree",
  pedalStep: "measure",
  sustainPedalPage: "off",
  lastSustainPedalPageAt: 0,
  autoFollowMode: "off",
  autoFollow: {
    currentBeatStart: null,
    playedTargetIds: new Set(),
    animationFrame: 0,
    animating: false
  },
  deferredInstallPrompt: null,
  wakeLock: null,
  practice: {
    measures: [],
    notes: [],
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
    stopTimer: 0,
    playing: false
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
  prevMeasureButton: document.getElementById("prevMeasureButton"),
  nextMeasureButton: document.getElementById("nextMeasureButton"),
  playMeasureButton: document.getElementById("playMeasureButton"),
  measureStatus: document.getElementById("measureStatus"),
  versionBadge: document.getElementById("versionBadge"),
  inputField: document.querySelector(".input-field"),
  inputSelect: document.getElementById("inputSelect"),
  keyButtons: [...document.querySelectorAll("[data-key-signature]")],
  modeButtons: [...document.querySelectorAll("[data-label-mode]")],
  pedalStepButtons: [...document.querySelectorAll("[data-pedal-step]")],
  sustainPedalPageButtons: [...document.querySelectorAll("[data-sustain-pedal-page]")],
  autoFollowButtons: [...document.querySelectorAll("[data-auto-follow-mode]")],
  timeSignatureButtons: [...document.querySelectorAll("[data-time-signature]")],
  scoreBoard: document.querySelector(".score-board"),
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
    if (keySignature) settings.keySignature = keySignature;
    if (["degree", "pitch", "none"].includes(noteLabelMode)) settings.noteLabelMode = noteLabelMode;
    if (showDegrees === "true" || showDegrees === "false") settings.showDegrees = showDegrees === "true";
    if (selectedInputId !== null) settings.selectedInputId = selectedInputId;
    if (["measure", "half"].includes(pedalStep)) settings.pedalStep = pedalStep;
    if (["off", "half", "page"].includes(sustainPedalPage)) settings.sustainPedalPage = sustainPedalPage;
    if (["off", "beat"].includes(autoFollowMode)) settings.autoFollowMode = autoFollowMode;
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
    autoFollowMode: state.autoFollowMode
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

function syncRecordingControls() {
  els.recordButton.classList.toggle("hidden", state.recording.active);
  els.stopRecordButton.classList.toggle("hidden", !state.recording.active);
  els.saveRecordButton.disabled = state.recording.active || !state.recording.events.length;
}

function syncPracticeControls() {
  const hasMeasures = state.practice.measures.length > 0;
  els.prevMeasureButton.disabled = !hasMeasures || state.practice.currentMeasure <= 0;
  els.nextMeasureButton.disabled = !hasMeasures || state.practice.currentMeasure >= state.practice.measures.length - 1;
  const measure = state.practice.measures[state.practice.currentMeasure];
  els.playMeasureButton.disabled = !measure || !measure.notes.length;
  els.playMeasureButton.textContent = state.playback.playing ? "停止" : "播放";

  if (!hasMeasures) {
    els.measureStatus.textContent = "实时显示";
    return;
  }

  const total = state.practice.measures.length;
  const visibleNotes = visiblePracticeTargets();
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const startMeasure = Math.max(1, Math.floor((state.practice.viewStartTick || 0) / measureTicks) + 1);
  const endMeasure = Math.min(total, Math.floor(((state.practice.viewStartTick || 0) + measureTicks - 1) / measureTicks) + 1);
  const rangeLabel = startMeasure === endMeasure ? `${startMeasure}` : `${startMeasure}-${endMeasure}`;
  const matched = visibleNotes.filter((note) => isPracticeNoteActive(note.note)).length;
  els.measureStatus.textContent = `${rangeLabel} / ${total} 小节 · ${matched}/${visibleNotes.length}`;
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
  if (["measure", "half"].includes(settings.pedalStep)) {
    state.pedalStep = settings.pedalStep;
  }
  if (["off", "half", "page"].includes(settings.sustainPedalPage)) {
    state.sustainPedalPage = settings.sustainPedalPage;
  }
  if (["off", "beat"].includes(settings.autoFollowMode)) {
    state.autoFollowMode = settings.autoFollowMode;
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

function buildPracticeNoteItems() {
  const visibleNotes = visiblePracticeTargets();
  if (!visibleNotes.length) return [];

  const viewStartTick = state.practice.viewStartTick || 0;
  const timeSpan = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const items = visibleNotes
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note)
    .map((target) => {
      const display = displayInfoForPracticeNote(target.note);
      const durationKind = durationKindForTicks(Math.max(1, target.endTick - target.startTick));
      const progress = Math.max(0, Math.min(1, (target.startTick - viewStartTick) / timeSpan));
      const x = MEASURE_NOTE_LEFT_X + progress * (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X);
      return {
        note: target.note,
        displayNote: display.note,
        clef: display.clef,
        step: midiToStaffStep(display.note),
        x,
        startTick: target.startTick,
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

  for (let index = 0; index < items.length;) {
    const clusterStart = index;
    index += 1;
    while (
      index < items.length &&
      Math.abs(items[index].x - items[clusterStart].x) < 18 &&
      items[index].clef === items[index - 1].clef &&
      items[index].step - items[index - 1].step <= 1
    ) {
      index += 1;
    }

    const cluster = items.slice(clusterStart, index);
    if (cluster.length > 1) {
      const spread = 35;
      cluster.forEach((item, itemIndex) => {
        item.xOffset = (itemIndex - (cluster.length - 1) / 2) * spread;
      });
    }
  }

  return items.map((item) => ({ ...item, x: item.x + item.xOffset }));
}

function visiblePracticeTargets() {
  if (!state.practice.measures.length) return [];
  const viewStartTick = state.practice.viewStartTick || 0;
  const viewEndTick = viewStartTick + Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  return state.practice.measures
    .flatMap((measure) => measure.notes)
    .filter((target) => target.startTick < viewEndTick && target.endTick > viewStartTick);
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
    const filledPracticeNote = isPractice && ["quarter", "eighth", "sixteenth"].includes(item.durationKind) && !matched;
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
  const { note, displayNote, x, y, clef, matched, durationKind, targetId } = item;
  const isFilled = durationKind === "quarter" || durationKind === "eighth" || durationKind === "sixteenth";
  const hasStem = durationKind !== "whole";
  const classes = ["note-head", "practice-note-head", isFilled ? "filled-note" : "open-note"];
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

  if (hasStem) {
    drawStem(svg, x, y, clef, matched, item.trackRole);
  }
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
    const x = 275 + index * 24;
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
  markAutoFollowNote(note);
  updateAll();
  evaluateAutoFollowBeat();
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
  const filename = `piano-midi-take-${String(state.recording.takeNumber).padStart(2, "0")}.mid`;

  if (window.webkit?.messageHandlers?.midiBridge) {
    window.webkit.messageHandlers.midiBridge.postMessage({
      type: "saveMidi",
      filename,
      base64: bytesToBase64(bytes)
    });
    state.recording.takeNumber += 1;
    setStatus("正在打开 iOS 保存面板...");
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
  setStatus("MIDI 文件已生成");
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
  state.practice.currentMeasure = 0;
  state.practice.filename = filename || typeLabel;
  state.practice.timeSignature = parsed.timeSignature;
  state.practice.ticksPerQuarter = parsed.ticksPerQuarter;
  state.practice.measureTicks = parsed.measureTicks;
  state.practice.microsecondsPerQuarter = parsed.microsecondsPerQuarter;
  state.practice.viewStartTick = 0;
  state.practice.measures = buildMeasuresFromPracticeNotes(state.practice.notes);
  resetAutoFollowBeat(0);
  const displayName = displayFilename(state.practice.filename, typeLabel);
  setStatus(parsed.measures.length
    ? `已载入：${displayName}`
    : `${typeLabel} 已载入，但没有找到可显示的音符`);
  updateAll();
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
  resetAutoFollowBeat(currentAutoFollowBeatStart());
  syncControlsFromState();
  updateAll();
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
    state.practice.currentMeasure = 0;
    state.practice.viewStartTick = 0;
    resetAutoFollowBeat(null);
    setStatus(`乐谱读取失败：${error.message || "文件格式不支持"}`);
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
  cancelAutoFollowAnimation();
  stopMeasurePlayback();
  state.practice.currentMeasure = next;
  state.practice.viewStartTick = state.practice.measures[next].startTick;
  resetAutoFollowBeat(currentAutoFollowBeatStart());
  updateAll();
}

function panPracticeView(deltaMeasures) {
  if (!state.practice.measures.length) return;
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  const maxStart = Math.max(0, lastMeasure.endTick - measureTicks);
  const nextStart = Math.max(0, Math.min(maxStart, (state.practice.viewStartTick || 0) + deltaMeasures * measureTicks));
  if (Math.abs(nextStart - (state.practice.viewStartTick || 0)) < 1) return;
  cancelAutoFollowAnimation();
  stopMeasurePlayback();
  state.practice.viewStartTick = nextStart;
  state.practice.currentMeasure = Math.max(0, Math.min(
    state.practice.measures.length - 1,
    Math.floor(nextStart / measureTicks)
  ));
  resetAutoFollowBeat(currentAutoFollowBeatStart());
  updateAll();
}

function practiceBeatTicks() {
  const timeSignature = state.practice.timeSignature || { numerator: 4, denominator: 4 };
  const denominator = Math.max(1, Number(timeSignature.denominator) || 4);
  return Math.max(1, (state.practice.ticksPerQuarter || MIDI_PPQ) * 4 / denominator);
}

function currentAutoFollowBeatStart() {
  const beatTicks = practiceBeatTicks();
  return Math.floor((state.practice.viewStartTick || 0) / beatTicks) * beatTicks;
}

function resetAutoFollowBeat(beatStart = null) {
  state.autoFollow.currentBeatStart = beatStart;
  state.autoFollow.playedTargetIds = new Set();
}

function cancelAutoFollowAnimation() {
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
  state.autoFollow.animationFrame = 0;
  state.autoFollow.animating = false;
}

function targetsForBeat(beatStart) {
  const beatTicks = practiceBeatTicks();
  const beatEnd = beatStart + beatTicks;
  return (state.practice.notes || [])
    .filter((target) => target.startTick >= beatStart && target.startTick < beatEnd)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
}

function markAutoFollowNote(note) {
  if (state.autoFollowMode !== "beat" || !state.practice.measures.length) return;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);
  targetsForBeat(beatStart).forEach((target) => {
    if (target.note === note) state.autoFollow.playedTargetIds.add(target.id);
  });
}

function evaluateAutoFollowBeat() {
  if (state.autoFollowMode !== "beat" || state.autoFollow.animating || !state.practice.measures.length) return;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);

  const targets = targetsForBeat(beatStart);
  if (!targets.length) return;
  if (!targets.every((target) => state.autoFollow.playedTargetIds.has(target.id))) return;
  animatePracticeViewToTick((state.practice.viewStartTick || 0) + practiceBeatTicks());
}

function animatePracticeViewToTick(targetTick) {
  if (!state.practice.measures.length) return;
  const measureTicks = Math.max(1, state.practice.measureTicks || MIDI_PPQ * 4);
  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  const maxStart = Math.max(0, lastMeasure.endTick - measureTicks);
  const startTick = state.practice.viewStartTick || 0;
  const endTick = Math.max(0, Math.min(maxStart, targetTick));
  if (Math.abs(endTick - startTick) < 1) return;

  stopMeasurePlayback();
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
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
    resetAutoFollowBeat(currentAutoFollowBeatStart());
    updateAll();
  };

  state.autoFollow.animationFrame = window.requestAnimationFrame(step);
}

async function toggleMeasurePlayback() {
  if (state.playback.playing) {
    stopMeasurePlayback();
    syncPracticeControls();
    return;
  }
  await playCurrentMeasure();
}

async function playCurrentMeasure() {
  const measure = state.practice.measures[state.practice.currentMeasure];
  if (!measure || !measure.notes.length) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    setStatus("当前浏览器不支持网页播放。");
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

  const secondsPerTick = (state.practice.microsecondsPerQuarter || 500000) / 1000000 / (state.practice.ticksPerQuarter || MIDI_PPQ);
  const startAt = audioContext.currentTime + 0.06;
  const measureStart = measure.startTick;
  const measureDuration = Math.max(0.1, (measure.endTick - measure.startTick) * secondsPerTick);

  state.playback.playing = true;
  state.playback.activeNodes = [];
  measure.notes.forEach((target) => {
    const noteStart = Math.max(0, (target.startTick - measureStart) * secondsPerTick);
    const noteDuration = Math.max(0.08, (target.endTick - target.startTick) * secondsPerTick);
    schedulePracticeTone(audioContext, target.note, startAt + noteStart, noteDuration);
  });

  state.playback.stopTimer = window.setTimeout(() => {
    stopMeasurePlayback();
    syncPracticeControls();
  }, Math.ceil((measureDuration + 0.22) * 1000));
  syncPracticeControls();
}

function schedulePracticeTone(audioContext, note, startAt, duration) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const frequency = 440 * 2 ** ((note - 69) / 12);
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.04);
  state.playback.activeNodes.push(oscillator, gain);
}

function stopMeasurePlayback() {
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
  state.playback.playing = false;
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
    if (trackResult.timeSignature) timeSignature = trackResult.timeSignature;
    if (trackResult.microsecondsPerQuarter) microsecondsPerQuarter = trackResult.microsecondsPerQuarter;
    reader.position = trackEnd;
  }

  const measureTicks = ticksPerQuarter * timeSignature.numerator * 4 / timeSignature.denominator;
  const notes = noteEvents
    .filter((item) => item.note >= MIDI_MIN && item.note <= MIDI_MAX)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  if (!notes.length) return { measures: [], ticksPerQuarter, measureTicks, timeSignature, microsecondsPerQuarter, format };
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

  return { measures, ticksPerQuarter, measureTicks, timeSignature, microsecondsPerQuarter, format };
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

function parseMidiTrack(bytes, start, end) {
  const reader = makeMidiReader(bytes, start);
  const activeNotes = new Map();
  const notes = [];
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
    }
  }

  activeNotes.forEach((stack) => {
    stack.forEach((started) => {
      notes.push({ ...started, endTick: Math.max(tick, started.startTick + 1) });
    });
  });

  return { notes, timeSignature, microsecondsPerQuarter };
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
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    key.classList.toggle("active", state.activeNotes.has(Number(key.dataset.note)));
  });
}

async function connectMidi() {
  els.connectButton.disabled = true;
  if (window.webkit?.messageHandlers?.midiBridge) {
    setStatus("正在连接 iOS MIDI...");
    window.webkit.messageHandlers.midiBridge.postMessage({ type: "connect" });
    els.connectButton.disabled = false;
    return;
  }

  if (!("requestMIDIAccess" in navigator)) {
    setStatus("iPad Safari 不能让网页读取 MIDI。蓝牙键盘已连接也只能给原生 CoreMIDI App 使用；请用电脑 Chrome/Edge，或做 iPad 原生版。");
    els.connectButton.disabled = false;
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
      setStatus("当前浏览器不支持网页全屏，可以尝试添加到主屏幕使用。");
    }
  } catch (error) {
    setStatus(`无法进入全屏：${error.message || "浏览器需要手动允许"}`);
  }
}

function syncFullscreenButton() {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  els.fullscreenButton.textContent = fullscreenElement ? "退出全屏" : "全屏";
}

function refreshMidiInputs() {
  const previous = state.selectedInputId || els.inputSelect.value;
  const inputs = [...state.midiAccess.inputs.values()];
  els.inputField.classList.toggle("hidden", inputs.length <= 1);
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
  handleMidiBytes(event.data);
}

function handleMidiBytes(data) {
  const [status, note, value] = data;
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
    if (pressed && !state.sustainDown) {
      advanceBySustainPedalPage();
    }
    state.sustainDown = pressed;
    if (!state.sustainDown) releaseSustainedNotes();
    return;
  }

  if (command === 0xb0 && note === 67) {
    recordMidiEvent("cc", { controller: 67, value });
    const pressed = value >= 64;
    if (pressed && !state.softPedalDown) {
      advanceByPedalStep();
    }
    state.softPedalDown = pressed;
  }
}

function advanceByPedalStep() {
  if (state.pedalStep === "half") {
    panPracticeView(0.5);
    return;
  }
  goToMeasure(1);
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
  setMidiStatus(text) {
    setStatus(text);
  }
};

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

async function forceRefreshApp() {
  setStatus("正在获取最新版本...");

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
    setStatus("正在重新载入页面...");
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
  const direction = event.clientX < rect.left + rect.width / 2 ? -0.5 : 0.5;
  panPracticeView(direction);
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
  els.prevMeasureButton.addEventListener("click", () => goToMeasure(-1));
  els.nextMeasureButton.addEventListener("click", () => goToMeasure(1));
  els.playMeasureButton.addEventListener("click", toggleMeasurePlayback);
  els.fullscreenButton.addEventListener("click", toggleFullscreen);
  els.refreshButton.addEventListener("click", forceRefreshApp);
  document.addEventListener("fullscreenchange", syncFullscreenButton);
  document.addEventListener("webkitfullscreenchange", syncFullscreenButton);
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
      state.autoFollowMode = button.dataset.autoFollowMode;
      resetAutoFollowBeat(currentAutoFollowBeatStart());
      syncControlsFromState();
      saveSettings();
    });
  });
  els.timeSignatureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updatePracticeTimeSignature(parseTimeSignatureKey(button.dataset.timeSignature));
    });
  });
  window.addEventListener("pagehide", () => {
    saveSettings();
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
syncRecordingControls();
syncFullscreenButton();
syncPracticeControls();
setupEvents();
setupPwa();
setupWakeLock();
setupScoreClickPaging();
preventPageZoom();
buildKeyboard();
drawStaff();
autoConnectMidi();
