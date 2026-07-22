"use strict";

const APP_VERSION = "v268";
const MIDI_MIN = 21;
const MIDI_MAX = 108;
const FULL_KEYBOARD_WHITE_KEYS = 52;
const FULL_KEYBOARD_TOTAL_KEYS = MIDI_MAX - MIDI_MIN + 1;
const PORTRAIT_VISIBLE_KEYS = 48;
const LEFT_PEDAL_CONTROLLERS = new Set([65, 66, 67, 68, 69]);
const WHITE_PATTERN = new Set([0, 2, 4, 5, 7, 9, 11]);
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const XML_STEP_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const STAFF_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const STAFF_LETTER_TO_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const STAFF_LETTER_TO_PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const STAFF_PITCH_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STAFF_PITCH_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const KEY_RANGE = { min: MIDI_MIN, max: MIDI_MAX };
const SETTINGS_KEY = "piano-midi-staff-settings";
const MIDI_PPQ = 480;
const RECORDING_BPM = 120;
const RECORDING_LEAD_IN_MS = 2000;
const DISPLAY_FILENAME_MAX = 50;
const SUSTAIN_PEDAL_PAGE_DEBOUNCE_MS = 260;
const AUTO_FOLLOW_ANIMATION_MS = 260;
const ARPEGGIO_DISPLAY_WINDOW_RATIO = 0.1;
const PRACTICE_CHORD_WINDOW_SECONDS = 0.09;
const DENSE_SUBDIVISION_PRACTICE_BPM = 70;
const PLAYBACK_VISUAL_FRAME_MS = 24;
const ROBOT_BEAT_VIEW_ANIMATION_MS = 180;
const LIVE_INPUT_TONE_SECONDS = 0.9;
const LIVE_INPUT_RELEASE_FADE_SECONDS = 0.25;
const SUSTAIN_PEDAL_RELEASE_FADE_SECONDS = 0.65;
const ROBOT_TIMING_JITTER_SECONDS = 0.018;
const ROBOT_CHORD_ROLL_SECONDS = 0.009;
const ROBOT_GAIN_VARIATION = 0.22;
const ROBOT_MAX_TIMING_OFFSET_SECONDS = 0.026;
const WATERFALL_LOOKAHEAD_SECONDS = 2.2;
const WATERFALL_FRAME_MS = 33;
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
  language: "piano-midi-staff-language",
  playbackInstrument: "piano-midi-staff-playback-instrument",
  liveInputSound: "piano-midi-staff-live-input-sound",
  silentPlayback: "piano-midi-staff-silent-playback",
  robotPerformance: "piano-midi-staff-robot-performance",
  flowDisplay: "piano-midi-staff-flow-display",
  waterfall: "piano-midi-staff-waterfall",
  fullUnlocked: "piano-midi-staff-full-unlocked"
};
const MAJOR_SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const KEY_SIGNATURE_BY_FIFTHS = {
  "-7": "Cb",
  "-6": "Gb",
  "-5": "Db",
  "-4": "Ab",
  "-3": "Eb",
  "-2": "Bb",
  "-1": "F",
  0: "C",
  1: "G",
  2: "D",
  3: "A",
  4: "E",
  5: "B",
  6: "F#",
  7: "C#"
};
const MAJOR_KEY_SIGNATURES = {
  Cb: { tones: [11, 1, 3, 4, 6, 8, 10], accidental: "b", count: 7 },
  C: { tones: [0, 2, 4, 5, 7, 9, 11], accidental: "", count: 0 },
  G: { tones: [7, 9, 11, 0, 2, 4, 6], accidental: "#", count: 1 },
  D: { tones: [2, 4, 6, 7, 9, 11, 1], accidental: "#", count: 2 },
  A: { tones: [9, 11, 1, 2, 4, 6, 8], accidental: "#", count: 3 },
  E: { tones: [4, 6, 8, 9, 11, 1, 3], accidental: "#", count: 4 },
  B: { tones: [11, 1, 3, 4, 6, 8, 10], accidental: "#", count: 5 },
  "F#": { tones: [6, 8, 10, 11, 1, 3, 5], accidental: "#", count: 6 },
  "C#": { tones: [1, 3, 5, 6, 8, 10, 0], accidental: "#", count: 7 },
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
const CHORD_TEMPLATES = [
  { suffix: "maj9", intervals: [0, 2, 4, 7, 11] },
  { suffix: "m9", intervals: [0, 2, 3, 7, 10] },
  { suffix: "9", intervals: [0, 2, 4, 7, 10] },
  { suffix: "mMaj7", intervals: [0, 3, 7, 11] },
  { suffix: "maj7", intervals: [0, 4, 7, 11] },
  { suffix: "maj7omit3", intervals: [0, 7, 11] },
  { suffix: "maj7omit5", intervals: [0, 4, 11] },
  { suffix: "∅", intervals: [0, 3, 6, 10] },
  { suffix: "dim7", intervals: [0, 3, 6, 9] },
  { suffix: "m7", intervals: [0, 3, 7, 10] },
  { suffix: "m7(omit3)", intervals: [0, 7, 10] },
  { suffix: "m7(omit5)", intervals: [0, 3, 10] },
  { suffix: "7", intervals: [0, 4, 7, 10] },
  { suffix: "m6", intervals: [0, 3, 7, 9] },
  { suffix: "6", intervals: [0, 4, 7, 9] },
  { suffix: "sus4", intervals: [0, 5, 7] },
  { suffix: "sus2", intervals: [0, 2, 7] },
  { suffix: "aug", intervals: [0, 4, 8] },
  { suffix: "dim", intervals: [0, 3, 6] },
  { suffix: "m", intervals: [0, 3, 7] },
  { suffix: "", intervals: [0, 4, 7] }
];
const CHORD_NAMES_SHARP = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const CHORD_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const LANGUAGE_LABELS = {
  zh: "中文",
  ja: "日本語",
  en: "EN"
};
const PLAYBACK_INSTRUMENTS = [
  { id: "grand", labels: { zh: "Easy Piano", ja: "Easy Piano", en: "Easy Piano" }, custom: true },
  { id: "piano", labels: { zh: "原声钢琴", ja: "アコースティックピアノ", en: "Acoustic Piano" }, wave: "triangle", partials: [1, 2, 3, 4.1], levels: [1, 0.34, 0.18, 0.08], attack: 0.006, decay: 3.3, brightness: 3800 },
  { id: "electric", labels: { zh: "电钢琴", ja: "エレピ", en: "Electric Piano" }, wave: "sine", partials: [1, 2, 3.01, 4], levels: [1, 0.42, 0.2, 0.1], attack: 0.012, decay: 3.8, brightness: 2600 },
  { id: "kalimba", labels: { zh: "卡林巴", ja: "カリンバ", en: "Kalimba" }, wave: "sine", partials: [1, 4.03], levels: [1, 0.3], attack: 0.004, decay: 3, brightness: 5200, gain: 0.33 },
  { id: "musicbox", labels: { zh: "八音盒", ja: "オルゴール", en: "Music Box" }, wave: "sine", partials: [1, 2, 3, 5.02], levels: [1, 0.22, 0.18, 0.12], attack: 0.002, decay: 2.8, brightness: 7000 },
  { id: "marimba", labels: { zh: "马林巴／木琴", ja: "マリンバ／木琴", en: "Marimba" }, wave: "sine", partials: [1, 3.99, 9.02], levels: [1, 0.23, 0.08], attack: 0.003, decay: 1.8, brightness: 3200 },
  { id: "harp", labels: { zh: "竖琴", ja: "ハープ", en: "Harp" }, wave: "triangle", partials: [1, 2, 3, 4], levels: [1, 0.25, 0.13, 0.06], attack: 0.01, decay: 4.2, brightness: 4400 },
  { id: "strings", labels: { zh: "弦乐合奏", ja: "ストリングス", en: "Strings" }, wave: "sawtooth", partials: [1, 1.005, 0.995], levels: [0.5, 0.28, 0.28], attack: 0.18, decay: 4.8, brightness: 1700 },
  { id: "organ", labels: { zh: "风琴", ja: "オルガン", en: "Organ" }, wave: "sine", partials: [1, 2, 3, 4], levels: [1, 0.5, 0.28, 0.14], attack: 0.025, decay: 4.6, brightness: 4600 },
  { id: "pad", labels: { zh: "合成器 Pad", ja: "シンセ Pad", en: "Synth Pad" }, wave: "sawtooth", partials: [1, 0.5, 2], levels: [0.62, 0.23, 0.14], attack: 0.32, decay: 5.6, brightness: 1050 },
  { id: "guitar", labels: { zh: "尼龙吉他", ja: "ナイロンギター", en: "Nylon Guitar" }, wave: "triangle", partials: [1, 2, 3, 5], levels: [1, 0.3, 0.15, 0.06], attack: 0.004, decay: 3.1, brightness: 3000 }
];
const TRIAL_SCORES = [
  {
    id: "akatsuka-train",
    url: "samples/trial-akatsuka-train.mid",
    labels: { zh: "sample1", ja: "sample1", en: "sample1" }
  },
  {
    id: "seoul-subway-up",
    url: "samples/trial-seoul-subway-up.mid",
    labels: { zh: "sample2", ja: "sample2", en: "sample2" }
  }
];
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
    "label.currentChord": "和弦",
    "label.liveInputSoundField": "发声",
    "label.liveInputSound": "弹奏时设备发声",
    "label.silentPlayback": "无声播放",
    "label.playbackInstrument": "音色",
    "label.robotPerformanceField": "演奏",
    "label.robotPerformance": "机器人演奏模式",
    "label.waterfallField": "瀑布流",
    "label.waterfall": "瀑布流播放",
    "label.flowDisplay": "流动显示",
    "label.displaySettings": "显示",
    "label.practiceSettings": "练习",
    "label.soundSettings": "声音",
    "label.tempo": "速度",
    "label.mistakes": "弹错记录",
    "label.noMistakes": "暂无",
    "label.mistakeItem": "{measure}小节",
    "label.removeMistake": "删除这条弹错记录",
    "button.settings": "设置",
    "button.connect": "连接 MIDI",
    "button.record": "录 MIDI",
    "button.stopRecord": "停录保存",
    "button.discardRecord": "废弃重录",
    "button.loadScore": "载入乐谱",
    "button.close": "关闭",
    "button.exportPdf": "导出PDF",
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
    "button.saveTempo": "另存变速版",
    "option.autoSelect": "自动选择",
    "status.waiting": "等待连接 MIDI 键盘",
    "status.live": "实时显示",
    "status.measure": "{range} / {total} 小节",
    "status.recording": "录制中...",
    "status.recordingRestarted": "已废弃，重新录制中...",
    "status.recorded": "录制完成：{count} 个音，正在保存录音文件",
    "status.recordedEmpty": "录制完成：没有记录到音符",
    "status.savingIos": "正在打开 iOS 保存面板...",
    "status.midiGenerated": "MIDI 文件已生成",
    "status.tempoSaved": "已另存变速版：{name}",
    "status.tempoSaveUnavailable": "当前文件不能另存变速版，请先载入 MIDI 文件。",
    "status.loaded": "已载入：{name}",
    "status.loadingSample": "正在载入样本乐谱...",
    "trial.title": "免费版乐谱",
    "trial.message": "免费用户只可以使用样本 MIDI。解锁后可以载入自己的乐谱。",
    "button.unlockFull": "解锁全部功能",
    "button.restorePurchase": "恢复购买",
    "status.purchaseChecking": "正在检查购买状态...",
    "status.purchaseUnavailable": "购买功能只在 iOS App 内可用。网页版可以直接使用全部功能。",
    "status.purchaseBridgeMissing": "当前 TestFlight 版本不支持购买，请安装 Build 4 后再试。",
    "status.purchaseStarted": "正在打开购买画面...",
    "status.purchaseUnlocked": "已解锁全部功能",
    "status.purchaseCancelled": "购买已取消",
    "status.purchaseFailed": "购买失败：{message}",
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
    "label.currentChord": "コード",
    "label.liveInputSoundField": "発音",
    "label.liveInputSound": "演奏時に端末発音",
    "label.silentPlayback": "無音再生",
    "label.playbackInstrument": "音色",
    "label.robotPerformanceField": "演奏",
    "label.robotPerformance": "ロボット演奏モード",
    "label.waterfallField": "滝表示",
    "label.waterfall": "滝表示で再生",
    "label.flowDisplay": "フロー表示",
    "label.displaySettings": "表示",
    "label.practiceSettings": "練習",
    "label.soundSettings": "音",
    "label.tempo": "テンポ",
    "label.mistakes": "ミス記録",
    "label.noMistakes": "なし",
    "label.mistakeItem": "{measure}小節",
    "label.removeMistake": "このミス記録を削除",
    "button.settings": "設定",
    "button.connect": "MIDI 接続",
    "button.record": "MIDI 録音",
    "button.stopRecord": "停止して保存",
    "button.discardRecord": "破棄して再録音",
    "button.loadScore": "楽譜を読む",
    "button.close": "閉じる",
    "button.exportPdf": "PDF書き出し",
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
    "button.saveTempo": "変速版を別名保存",
    "option.autoSelect": "自動選択",
    "status.waiting": "MIDI キーボード接続待ち",
    "status.live": "リアルタイム表示",
    "status.measure": "{range} / {total} 小節",
    "status.recording": "録音中...",
    "status.recordingRestarted": "破棄しました。再録音中...",
    "status.recorded": "録音完了：{count} 音。MIDI を保存中",
    "status.recordedEmpty": "録音完了：音符は記録されませんでした",
    "status.savingIos": "iOS 保存画面を開いています...",
    "status.midiGenerated": "MIDI ファイルを生成しました",
    "status.tempoSaved": "変速版を保存しました：{name}",
    "status.tempoSaveUnavailable": "変速版を保存できません。MIDI ファイルを読み込んでください。",
    "status.loaded": "読み込みました：{name}",
    "status.loadingSample": "サンプル楽譜を読み込み中...",
    "trial.title": "無料版の楽譜",
    "trial.message": "無料ユーザーはサンプル MIDI のみ使用できます。解除後は自分の楽譜を読み込めます。",
    "button.unlockFull": "すべての機能を解除",
    "button.restorePurchase": "購入を復元",
    "status.purchaseChecking": "購入状態を確認中...",
    "status.purchaseUnavailable": "購入機能は iOS App 内のみ利用できます。Web版はすべての機能をそのまま使えます。",
    "status.purchaseBridgeMissing": "この TestFlight 版は購入に対応していません。Build 4 をインストールしてからお試しください。",
    "status.purchaseStarted": "購入画面を開いています...",
    "status.purchaseUnlocked": "すべての機能が解除されました",
    "status.purchaseCancelled": "購入をキャンセルしました",
    "status.purchaseFailed": "購入に失敗しました：{message}",
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
    "label.currentChord": "Chord",
    "label.liveInputSoundField": "Sound",
    "label.liveInputSound": "Input Sound",
    "label.silentPlayback": "Silent Play",
    "label.playbackInstrument": "Tone",
    "label.robotPerformanceField": "Performance",
    "label.robotPerformance": "Robot Performance",
    "label.waterfallField": "Waterfall",
    "label.waterfall": "Waterfall Playback",
    "label.flowDisplay": "Flow View",
    "label.displaySettings": "Display",
    "label.practiceSettings": "Practice",
    "label.soundSettings": "Sound",
    "label.tempo": "Tempo",
    "label.mistakes": "Mistakes",
    "label.noMistakes": "None",
    "label.mistakeItem": "Bar {measure}",
    "label.removeMistake": "Remove this mistake",
    "button.settings": "Settings",
    "button.connect": "Connect MIDI",
    "button.record": "Record MIDI",
    "button.stopRecord": "Stop & Save",
    "button.discardRecord": "Discard & Re-record",
    "button.loadScore": "Load Score",
    "button.close": "Close",
    "button.exportPdf": "Export PDF",
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
    "button.saveTempo": "Save Tempo Copy",
    "option.autoSelect": "Auto Select",
    "status.waiting": "Waiting for MIDI keyboard",
    "status.live": "Live View",
    "status.measure": "{range} / {total} measures",
    "status.recording": "Recording...",
    "status.recordingRestarted": "Discarded. Recording again...",
    "status.recorded": "Recorded {count} notes. Saving MIDI",
    "status.recordedEmpty": "Recording finished: no notes captured",
    "status.savingIos": "Opening iOS save panel...",
    "status.midiGenerated": "MIDI file generated",
    "status.tempoSaved": "Saved tempo copy: {name}",
    "status.tempoSaveUnavailable": "Cannot save a tempo copy. Load a MIDI file first.",
    "status.loaded": "Loaded: {name}",
    "status.loadingSample": "Loading sample score...",
    "trial.title": "Free Score Access",
    "trial.message": "Free users can only use sample MIDI files. Unlock to load your own scores.",
    "button.unlockFull": "Unlock All Features",
    "button.restorePurchase": "Restore Purchase",
    "status.purchaseChecking": "Checking purchase status...",
    "status.purchaseUnavailable": "Purchases are only available in the iOS app. The web version keeps all features unlocked.",
    "status.purchaseBridgeMissing": "This TestFlight build does not support purchases. Please install Build 4 and try again.",
    "status.purchaseStarted": "Opening purchase screen...",
    "status.purchaseUnlocked": "All features unlocked",
    "status.purchaseCancelled": "Purchase cancelled",
    "status.purchaseFailed": "Purchase failed: {message}",
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
const STAFF_VIEWBOX = { width: 1760, height: 900 };
const STAFF_STEP_PX = 20;
const TREBLE_LINE_YS = [180, 220, 260, 300, 340];
const BASS_LINE_YS = [420, 460, 500, 540, 580];
const NOTE_RADIUS = 20;
const MEASURE_NOTE_LEFT_X = 500;
const MEASURE_NOTE_RIGHT_X = 1620;
const FLOW_DISPLAY_PLAYHEAD_PROGRESS = 1 / 4;
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

function playbackInstrumentId(id) {
  return PLAYBACK_INSTRUMENTS.some((instrument) => instrument.id === id) ? id : "";
}

function currentPlaybackInstrument() {
  return PLAYBACK_INSTRUMENTS.find((instrument) => instrument.id === state.playbackInstrument) || PLAYBACK_INSTRUMENTS[0];
}

function playbackInstrumentLabel(instrument) {
  return instrument.labels?.[state.language] || instrument.labels?.en || instrument.id;
}

function renderPlaybackInstrumentOptions() {
  if (!els.playbackInstrumentSelect) return;
  const selected = playbackInstrumentId(state.playbackInstrument) || "kalimba";
  els.playbackInstrumentSelect.replaceChildren();
  PLAYBACK_INSTRUMENTS.forEach((instrument) => {
    els.playbackInstrumentSelect.appendChild(new Option(playbackInstrumentLabel(instrument), instrument.id));
  });
  els.playbackInstrumentSelect.value = selected;
  els.playbackInstrumentSelect.setAttribute("aria-label", state.language === "ja" ? "再生音色" : state.language === "en" ? "Playback tone" : "播放音色");
}

function trialScoreLabel(score) {
  return score.labels?.[state.language] || score.labels?.en || score.id;
}

function renderTrialScoreOptions() {
  if (!els.trialScoreList) return;
  els.trialScoreList.replaceChildren();
  TRIAL_SCORES.forEach((score) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost trial-score-button";
    button.dataset.trialScore = score.id;
    button.textContent = trialScoreLabel(score);
    els.trialScoreList.appendChild(button);
  });
}

const state = {
  midiAccess: null,
  language: detectDeviceLanguage(),
  statusMessage: { key: "status.waiting", params: {} },
  selectedInputId: "",
  activeNotes: new Map(),
  releasedWhileSustained: new Set(),
  sustainDown: false,
  sustainChannel: 0,
  chordPedalEpoch: 0,
  softPedalDown: false,
  keySignature: "C",
  noteLabelMode: "degree",
  playbackInstrument: "kalimba",
  liveInputSound: false,
  silentPlayback: false,
  robotPerformance: false,
  waterfall: false,
  flowDisplay: true,
  fullUnlocked: false,
  purchaseStateKnown: false,
  purchaseRequestTimer: 0,
  rhythmFollow: false,
  pedalStep: "on",
  sustainPedalPage: "off",
  lastSustainPedalPageAt: 0,
  autoFollowMode: "beat",
  autoFollowTolerance: 50,
  autoFollow: {
    currentBeatStart: null,
    targetGroupIds: [],
    playedNotesByBeat: new Map(),
    correctTargetIds: new Set(),
    animationFrame: 0,
    rhythmFrame: 0,
    rhythmRunning: false,
    rhythmStartedAt: 0,
    rhythmStartTick: 0,
    rhythmStopTick: 0,
    rhythmLastFrameAt: 0,
    emptyAdvanceTimer: 0,
    animating: false,
    finishingRun: false,
    pausedAfterManualNavigation: false
  },
  exportMode: {
    active: false,
    viewSpanTicks: 0,
    rowMeasures: []
  },
  mistakes: [],
  mistakeCounter: 0,
  deferredInstallPrompt: null,
  wakeLock: null,
  practice: {
    measures: [],
    notes: [],
    pedalEvents: [],
    currentMeasure: 0,
    filename: "",
    timeSignature: { numerator: 4, denominator: 4 },
    timeSignatureEvents: [],
    keySignatureEvents: [],
    ticksPerQuarter: MIDI_PPQ,
    measureTicks: MIDI_PPQ * 4,
    microsecondsPerQuarter: 500000,
    originalMicrosecondsPerQuarter: 500000,
    sourceBytes: null,
    sourceType: "",
    viewStartTick: 0
  },
  playback: {
    audioContext: null,
    activeNodes: [],
    activeNotes: new Set(),
    activeTargetIds: new Set(),
    visualNotes: [],
    pendingNotes: [],
    pendingNoteIndex: 0,
    stopTimer: 0,
    animationFrame: 0,
    playing: false,
    paused: false,
    silent: false,
    startTick: 0,
    endTick: 0,
    currentTick: 0,
    startedAtAudioTime: 0,
    startedAtPerformance: 0,
    lastVisualFrameAt: 0,
    visualTargetTick: null,
    visualAnimationFromTick: 0,
    visualAnimationToTick: 0,
    visualAnimationStartedAt: 0,
    secondsPerTick: 0
  },
  waterfallState: {
    lastFrameAt: 0,
    visibleStartIndex: 0,
    keyMetrics: new Map(),
    layoutReady: false
  },
  liveAudio: {
    audioContext: null,
    activeNodes: [],
    notes: new Map()
  },
  scorePointer: {
    active: false,
    pointerId: 0,
    startX: 0,
    startY: 0
  },
  keyboardScrollPointer: {
    active: false,
    pointerId: 0,
    startX: 0,
    startScrollLeft: 0,
    moved: false
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
  stage: document.querySelector(".stage"),
  statusText: document.getElementById("statusText"),
  connectButton: document.getElementById("connectButton"),
  recordButton: document.getElementById("recordButton"),
  stopRecordButton: document.getElementById("stopRecordButton"),
  discardRecordButton: document.getElementById("discardRecordButton"),
  loadMidiButton: document.getElementById("loadMidiButton"),
  trialScoreModal: document.getElementById("trialScoreModal"),
  trialScoreTitle: document.getElementById("trialScoreTitle"),
  trialScoreMessage: document.getElementById("trialScoreMessage"),
  trialScoreList: document.getElementById("trialScoreList"),
  trialScoreCloseButton: document.getElementById("trialScoreCloseButton"),
  unlockFullButton: document.getElementById("unlockFullButton"),
  restorePurchaseButton: document.getElementById("restorePurchaseButton"),
  exportPdfButton: document.getElementById("exportPdfButton"),
  midiFileInput: document.getElementById("midiFileInput"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  refreshButton: document.getElementById("refreshButton"),
  installButton: document.getElementById("installButton"),
  startMeasureButton: document.getElementById("startMeasureButton"),
  playMeasureButton: document.getElementById("playMeasureButton"),
  silentPlaybackToggle: document.getElementById("silentPlaybackToggle"),
  silentPlaybackToggleLabel: document.getElementById("silentPlaybackToggleLabel"),
  tempoDownButton: document.getElementById("tempoDownButton"),
  tempoValue: document.getElementById("tempoValue"),
  tempoUpButton: document.getElementById("tempoUpButton"),
  saveTempoButton: document.getElementById("saveTempoButton"),
  playbackInstrumentSelect: document.getElementById("playbackInstrumentSelect"),
  playbackInstrumentLabel: document.getElementById("playbackInstrumentLabel"),
  liveSoundToggle: document.getElementById("liveSoundToggle"),
  liveSoundFieldLabel: document.getElementById("liveSoundFieldLabel"),
  liveSoundToggleLabel: document.getElementById("liveSoundToggleLabel"),
  robotPerformanceToggle: document.getElementById("robotPerformanceToggle"),
  robotPerformanceFieldLabel: document.getElementById("robotPerformanceFieldLabel"),
  robotPerformanceToggleLabel: document.getElementById("robotPerformanceToggleLabel"),
  waterfallToggle: document.getElementById("waterfallToggle"),
  waterfallFieldLabel: document.getElementById("waterfallFieldLabel"),
  waterfallToggleLabel: document.getElementById("waterfallToggleLabel"),
  flowDisplayLabel: document.getElementById("flowDisplayLabel"),
  displaySettingsTitle: document.getElementById("displaySettingsTitle"),
  practiceSettingsTitle: document.getElementById("practiceSettingsTitle"),
  soundSettingsTitle: document.getElementById("soundSettingsTitle"),
  playbackSlider: document.getElementById("playbackSlider"),
  playbackTime: document.getElementById("playbackTime"),
  measureStatus: document.getElementById("measureStatus"),
  currentChord: document.getElementById("currentChord"),
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
  flowDisplayButtons: [...document.querySelectorAll("[data-flow-display]")],
  toleranceButtons: [...document.querySelectorAll("[data-tolerance-mode]")],
  mistakeLogTitle: document.getElementById("mistakeLogTitle"),
  mistakeLogList: document.getElementById("mistakeLogList"),
  mistakeLogEmpty: document.getElementById("mistakeLogEmpty"),
  timeSignatureButtons: [...document.querySelectorAll("[data-time-signature]")],
  scoreBoard: document.querySelector(".score-board"),
  staffSvg: document.getElementById("staffSvg"),
  waterfallBoard: document.getElementById("waterfallBoard"),
  waterfall: document.getElementById("waterfall"),
  keyboardBoard: document.querySelector(".keyboard-board"),
  keyboard: document.getElementById("keyboard"),
  pdfExportRoot: document.getElementById("pdfExportRoot")
};

function noteName(note) {
  const octave = Math.floor(note / 12) - 1;
  return `${NOTE_NAMES[note % 12]}${octave}`;
}

function chordNoteName(pitchClass, tick = state.practice.viewStartTick || 0) {
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(tick)] || MAJOR_KEY_SIGNATURES.C;
  const names = key.accidental === "b" ? CHORD_NAMES_FLAT : CHORD_NAMES_SHARP;
  return names[((pitchClass % 12) + 12) % 12];
}

function chordToneLabel(pitchClass, tick = state.practice.viewStartTick || 0) {
  if (state.noteLabelMode === "degree") return degreeForNote(((pitchClass % 12) + 12) % 12 + 60, tick);
  return chordNoteName(pitchClass, tick);
}

function chordSuffixLabel(suffix) {
  if (state.noteLabelMode !== "degree") return suffix;
  if (suffix === "7") return "Mm7";
  if (suffix === "9") return "Mm9";
  if (suffix === "maj7") return "M7";
  if (suffix === "maj9") return "M9";
  if (suffix === "mMaj7") return "mM7";
  return suffix;
}

function isInputNoteSounding(note) {
  const active = state.activeNotes.get(note);
  if (!active) return false;
  return !state.sustainDown || active.chordPedalEpoch === state.chordPedalEpoch;
}

function isInputNoteVisuallyHeld(note) {
  return state.activeNotes.has(note);
}

function currentInputSoundingNotes() {
  return [...state.activeNotes.keys()]
    .filter((note) => isInputNoteSounding(note))
    .sort((a, b) => a - b);
}

function currentInputVisualNotes() {
  return [...state.activeNotes.keys()]
    .filter((note) => isInputNoteVisuallyHeld(note))
    .sort((a, b) => a - b);
}

function isPracticeTargetVisuallyActive(target, cueBoundaryTick = Infinity) {
  const activeInput = state.activeNotes.get(target.note);
  const activeByInput = Boolean(activeInput) &&
    target.startTick <= cueBoundaryTick &&
    (
      !flowDisplayEnabled() ||
      target.startTick >= (state.practice.viewStartTick || 0) ||
      activeInput.targetId === target.id
    );
  return (
    (activeByInput || state.playback.activeTargetIds.has(target.id)) &&
    target.startTick <= cueBoundaryTick
  );
}

function currentSoundingNotes() {
  const inputNotes = currentInputSoundingNotes();
  const notes = new Set([...inputNotes, ...state.playback.activeNotes]);
  return [...notes].sort((a, b) => a - b);
}

function currentChordName() {
  const notes = currentSoundingNotes();
  if (notes.length < 3) return "-";
  const pitchClasses = [...new Set(notes.map((note) => note % 12))].sort((a, b) => a - b);
  if (pitchClasses.length < 3) return "-";
  const bass = notes[0] % 12;
  let best = null;

  pitchClasses.forEach((root) => {
    CHORD_TEMPLATES.forEach((template, templateIndex) => {
      const required = template.intervals.map((interval) => (root + interval) % 12);
      if (!required.every((pitchClass) => pitchClasses.includes(pitchClass))) return;
      const extras = pitchClasses.filter((pitchClass) => !required.includes(pitchClass)).length;
      const score = template.intervals.length * 10 - extras * 3 + (root === bass ? 4 : 0) - templateIndex * 0.01;
      if (!best || score > best.score) {
        best = { root, suffix: template.suffix, score };
      }
    });
  });

  if (!best) return "-";
  return `${chordToneLabel(best.root)}${chordSuffixLabel(best.suffix)}`;
}

function syncCurrentChord() {
  if (!els.currentChord) return;
  els.currentChord.textContent = currentChordName();
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
    "status.cacheFailed",
    "status.purchaseFailed"
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
  updateText(document.querySelector(".tolerance-field span"), t("label.tolerance"));
  updateText(document.querySelector(".time-field span"), t("label.timeSignature"));
  updateText(document.querySelector(".key-field span"), t("label.keySignature"));
  updateText(els.liveSoundFieldLabel, t("label.liveInputSoundField"));
  updateText(els.liveSoundToggleLabel, t("label.liveInputSound"));
  updateText(els.silentPlaybackToggleLabel, t("label.silentPlayback"));
  updateText(els.playbackInstrumentLabel, t("label.playbackInstrument"));
  updateText(els.robotPerformanceFieldLabel, t("label.robotPerformanceField"));
  updateText(els.robotPerformanceToggleLabel, t("label.robotPerformance"));
  updateText(els.waterfallFieldLabel, t("label.waterfallField"));
  updateText(els.waterfallToggleLabel, t("label.waterfall"));
  updateText(els.flowDisplayLabel, t("label.flowDisplay"));
  updateText(els.displaySettingsTitle, t("label.displaySettings"));
  updateText(els.practiceSettingsTitle, t("label.practiceSettings"));
  updateText(els.soundSettingsTitle, t("label.soundSettings"));
  updateText(els.mistakeLogTitle, t("label.mistakes"));
  updateText(els.mistakeLogEmpty, t("label.noMistakes"));

  updateText(els.connectButton, t("button.connect"));
  updateText(els.recordButton, t("button.record"));
  updateText(els.stopRecordButton, t("button.stopRecord"));
  updateText(els.discardRecordButton, t("button.discardRecord"));
  updateText(els.loadMidiButton, t("button.loadScore"));
  updateText(els.trialScoreTitle, t("trial.title"));
  updateText(els.trialScoreMessage, t("trial.message"));
  updateIconButtonLabel(els.trialScoreCloseButton, t("button.close"));
  updateText(els.unlockFullButton, t("button.unlockFull"));
  updateText(els.restorePurchaseButton, t("button.restorePurchase"));
  updateText(els.exportPdfButton, t("button.exportPdf"));
  updateText(els.saveTempoButton, t("button.saveTempo"));
  updateText(els.refreshButton, t("button.refresh"));
  updateText(els.installButton, t("button.install"));
  updateIconButtonLabel(els.startMeasureButton, t("button.start"));
  updateIconButtonLabel(els.playMeasureButton, t("button.play"));

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
  document.querySelector('[data-tolerance-mode="off"]').textContent = t("button.off");
  document.querySelector('[data-tolerance-mode="on"]').textContent = t("button.on");
  document.querySelector('[data-flow-display="off"]').textContent = t("button.off");
  document.querySelector('[data-flow-display="on"]').textContent = t("button.on");

  els.inputSelect.options[0].textContent = t("option.autoSelect");
  renderPlaybackInstrumentOptions();
  renderTrialScoreOptions();
  els.languageButtons.forEach((button) => {
    const active = button.dataset.language === state.language;
    button.textContent = LANGUAGE_LABELS[button.dataset.language] || button.dataset.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  syncFullscreenButton();
  syncPracticeControls();
  syncCurrentChord();
  renderMistakeLog();
  if (state.statusMessage?.key) {
    setStatusKey(state.statusMessage.key, state.statusMessage.params);
  }
}

function accidentalForNote(note, tick = state.practice.viewStartTick || 0) {
  const pitchClass = note % 12;
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(tick)] || MAJOR_KEY_SIGNATURES.C;
  if (key.tones.includes(pitchClass)) return "";
  if (!isWhite(note)) return key.accidental || "#";
  return "♮";
}

function degreeForNote(note, tick = state.practice.viewStartTick || 0) {
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(tick)] || MAJOR_KEY_SIGNATURES.C;
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

function staffPitchName(note, tick = state.practice.viewStartTick || 0) {
  const pitchClass = ((note % 12) + 12) % 12;
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(tick)] || MAJOR_KEY_SIGNATURES.C;
  const degreeIndex = key.tones.indexOf(pitchClass);
  if (degreeIndex >= 0) {
    const tonicLetter = keySignatureAtTick(tick).replace(/[#b]/g, "")[0] || "C";
    const tonicIndex = STAFF_LETTER_TO_INDEX[tonicLetter] ?? 0;
    const letter = STAFF_LETTERS[(tonicIndex + degreeIndex) % STAFF_LETTERS.length];
    const naturalPitch = STAFF_LETTER_TO_PITCH[letter];
    const diff = ((pitchClass - naturalPitch + 18) % 12) - 6;
    if (diff === -2) return `${letter}bb`;
    if (diff === -1) return `${letter}b`;
    if (diff === 1) return `${letter}#`;
    if (diff === 2) return `${letter}##`;
    return letter;
  }
  const names = key.accidental === "b" ? STAFF_PITCH_NAMES_FLAT : STAFF_PITCH_NAMES_SHARP;
  return names[pitchClass];
}

function accidentalOffsetForStaffName(name) {
  const accidental = name.slice(1);
  if (accidental === "bb") return -2;
  if (accidental === "b") return -1;
  if (accidental === "#") return 1;
  if (accidental === "##") return 2;
  return 0;
}

function midiToStaffStep(note, tick = state.practice.viewStartTick || 0) {
  const name = staffPitchName(note, tick);
  const letter = name[0] || "C";
  const letterIndex = STAFF_LETTER_TO_INDEX[letter] ?? 0;
  const naturalPitch = STAFF_LETTER_TO_PITCH[letter] ?? 0;
  const accidentalOffset = accidentalOffsetForStaffName(name);
  const octave = Math.floor((note - naturalPitch - accidentalOffset) / 12) - 1;
  return octave * 7 + letterIndex;
}

function yForNote(note, clef, tick = state.practice.viewStartTick || 0) {
  const step = midiToStaffStep(note, tick);
  const reference = clef === "bass" ? midiToStaffStep(43, tick) : midiToStaffStep(64, tick);
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
    const playbackInstrument = window.localStorage.getItem(SETTINGS_FIELD_KEYS.playbackInstrument);
    const liveInputSound = window.localStorage.getItem(SETTINGS_FIELD_KEYS.liveInputSound);
    const silentPlayback = window.localStorage.getItem(SETTINGS_FIELD_KEYS.silentPlayback);
    const robotPerformance = window.localStorage.getItem(SETTINGS_FIELD_KEYS.robotPerformance);
    const flowDisplay = window.localStorage.getItem(SETTINGS_FIELD_KEYS.flowDisplay);
    const waterfall = window.localStorage.getItem(SETTINGS_FIELD_KEYS.waterfall);
    const fullUnlocked = window.localStorage.getItem(SETTINGS_FIELD_KEYS.fullUnlocked);
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
    if (playbackInstrumentId(playbackInstrument)) settings.playbackInstrument = playbackInstrument;
    if (liveInputSound === "true" || liveInputSound === "false") settings.liveInputSound = liveInputSound === "true";
    if (silentPlayback === "true" || silentPlayback === "false") settings.silentPlayback = silentPlayback === "true";
    if (robotPerformance === "true" || robotPerformance === "false") settings.robotPerformance = robotPerformance === "true";
    if (flowDisplay === "true" || flowDisplay === "false") settings.flowDisplay = flowDisplay === "true";
    if (waterfall === "true" || waterfall === "false") settings.waterfall = waterfall === "true";
    if (fullUnlocked === "true" || fullUnlocked === "false") settings.fullUnlocked = fullUnlocked === "true";
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
    language: state.language,
    playbackInstrument: state.playbackInstrument,
    liveInputSound: state.liveInputSound,
    silentPlayback: state.silentPlayback,
    robotPerformance: state.robotPerformance,
    flowDisplay: state.flowDisplay,
    waterfall: state.waterfall,
    fullUnlocked: state.fullUnlocked,
    rhythmFollow: false
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
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.playbackInstrument, settings.playbackInstrument);
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.liveInputSound, String(settings.liveInputSound));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.silentPlayback, String(settings.silentPlayback));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.robotPerformance, String(settings.robotPerformance));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.flowDisplay, String(settings.flowDisplay));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.waterfall, String(settings.waterfall));
    window.localStorage.setItem(SETTINGS_FIELD_KEYS.fullUnlocked, String(settings.fullUnlocked));
  } catch {
    // Settings are a convenience; the app should still work if storage is blocked.
  }
}

function syncControlsFromState() {
  els.inputSelect.value = state.selectedInputId;
  const activeKeySignature = keySignatureAtTick(state.practice.viewStartTick || 0);
  els.keyButtons.forEach((button) => {
    const active = button.dataset.keySignature === activeKeySignature;
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
  els.flowDisplayButtons.forEach((button) => {
    const active = (button.dataset.flowDisplay === "on") === state.flowDisplay;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.toleranceButtons.forEach((button) => {
    const active = (button.dataset.toleranceMode === "on") === (state.autoFollowTolerance !== 0);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.timeSignatureButtons.forEach((button) => {
    const active = button.dataset.timeSignature === timeSignatureKey(state.practice.timeSignature);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (els.playbackInstrumentSelect) {
    els.playbackInstrumentSelect.value = playbackInstrumentId(state.playbackInstrument) || "kalimba";
  }
  if (els.liveSoundToggle) {
    els.liveSoundToggle.checked = state.liveInputSound;
    const wrapper = els.liveSoundToggle.closest(".live-sound-toggle");
    if (wrapper) wrapper.classList.toggle("active", state.liveInputSound);
  }
  if (els.silentPlaybackToggle) {
    els.silentPlaybackToggle.checked = state.silentPlayback;
    els.silentPlaybackToggle.disabled = state.playback.playing;
    const wrapper = els.silentPlaybackToggle.closest(".silent-playback-toggle");
    if (wrapper) {
      wrapper.classList.toggle("active", state.silentPlayback);
      wrapper.classList.toggle("disabled", state.playback.playing);
    }
  }
  if (els.robotPerformanceToggle) {
    els.robotPerformanceToggle.checked = state.robotPerformance;
    const wrapper = els.robotPerformanceToggle.closest(".robot-performance-toggle");
    if (wrapper) wrapper.classList.toggle("active", state.robotPerformance);
  }
  if (els.waterfallToggle) {
    els.waterfallToggle.checked = state.waterfall;
    const wrapper = els.waterfallToggle.closest(".waterfall-toggle");
    if (wrapper) wrapper.classList.toggle("active", state.waterfall);
  }
  syncWaterfallVisibility();
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
  return Number(value) > 0 ? 50 : 0;
}

function syncRecordingControls() {
  els.recordButton.classList.toggle("hidden", state.recording.active);
  els.stopRecordButton.classList.toggle("hidden", !state.recording.active);
  els.discardRecordButton.classList.toggle("hidden", !state.recording.active);
}

function syncPracticeControls() {
  const hasMeasures = state.practice.measures.length > 0;
  if (els.exportPdfButton) els.exportPdfButton.disabled = !hasMeasures;
  els.startMeasureButton.disabled = !hasMeasures || ((state.practice.viewStartTick || 0) <= 0 && !state.mistakes.length);
  els.playMeasureButton.disabled = !hasMeasures;
  syncPlaybackToggleButton();
  syncPlaybackScrubber();
  syncTempoControls();

  if (!hasMeasures) {
    els.measureStatus.textContent = t("status.live");
    return;
  }

  const total = state.practice.measures.length;
  const startMeasure = measureIndexForTick(state.practice.viewStartTick || 0) + 1;
  const endMeasure = Math.min(total, measureIndexForTick((state.practice.viewStartTick || 0) + currentViewSpanTicks() - 1) + 1);
  const rangeLabel = startMeasure === endMeasure ? `${startMeasure}` : `${startMeasure}-${endMeasure}`;
  els.measureStatus.textContent = t("status.measure", {
    range: rangeLabel,
    total
  });
}

function recordMistake(note) {
  if (!state.practice.measures.length) return;
  const tick = currentAutoFollowBeatStart();
  const measureIndex = measureIndexForTick(tick);
  const measure = state.practice.measures[measureIndex];
  const measureNumber = measureIndex + 1;
  if (state.mistakes.some((entry) => entry.measure === measureNumber)) return;
  state.mistakes.push({
    id: ++state.mistakeCounter,
    tick: measure?.startTick || tick,
    measure: measureNumber,
    note
  });
  renderMistakeLog();
  syncPracticeControls();
}

function clearMistakes() {
  if (!state.mistakes.length) return;
  state.mistakes = [];
  renderMistakeLog();
  syncPracticeControls();
}

function removeMistake(id) {
  const nextMistakes = state.mistakes.filter((entry) => entry.id !== id);
  if (nextMistakes.length === state.mistakes.length) return;
  state.mistakes = nextMistakes;
  renderMistakeLog();
  syncPracticeControls();
}

function renderMistakeLog() {
  if (!els.mistakeLogList || !els.mistakeLogEmpty) return;
  els.mistakeLogList.querySelectorAll(".mistake-log-chip").forEach((chip) => chip.remove());
  els.mistakeLogEmpty.hidden = state.mistakes.length > 0;
  state.mistakes.forEach((entry) => {
    const chip = document.createElement("span");
    chip.className = "mistake-log-chip";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mistake-log-button";
    button.dataset.mistakeId = String(entry.id);
    button.textContent = t("label.mistakeItem", {
      measure: entry.measure
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "mistake-log-remove";
    removeButton.dataset.mistakeRemove = String(entry.id);
    removeButton.setAttribute("aria-label", t("label.removeMistake"));
    removeButton.textContent = "×";

    chip.append(button, removeButton);
    els.mistakeLogList.appendChild(chip);
  });
}

function jumpToMistake(id) {
  const entry = state.mistakes.find((item) => item.id === id);
  if (!entry) return;
  seekPracticeView(entry.tick);
}

function syncPlaybackToggleButton() {
  const icon = els.playMeasureButton.querySelector(".control-icon");
  const running = state.playback.playing || state.autoFollow.rhythmRunning;
  const label = running ? t("button.pause") : t("button.play");
  if (icon) {
    icon.classList.toggle("play-icon", !running);
    icon.classList.toggle("pause-icon", running);
  }
  updateIconButtonLabel(els.playMeasureButton, label);
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
  if (playbackInstrumentId(settings.playbackInstrument)) {
    state.playbackInstrument = settings.playbackInstrument;
  }
  if (typeof settings.liveInputSound === "boolean") {
    state.liveInputSound = settings.liveInputSound;
  }
  if (typeof settings.silentPlayback === "boolean") {
    state.silentPlayback = settings.silentPlayback;
  }
  if (typeof settings.robotPerformance === "boolean") {
    state.robotPerformance = settings.robotPerformance;
  }
  if (typeof settings.waterfall === "boolean") {
    state.waterfall = settings.waterfall;
  }
  if (typeof settings.flowDisplay === "boolean") {
    state.flowDisplay = settings.flowDisplay;
  }
  if (typeof settings.fullUnlocked === "boolean") {
    state.fullUnlocked = settings.fullUnlocked;
  }
  state.rhythmFollow = false;
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
  drawTimeSignature(svg);

  const hasPracticeScore = state.practice.measures.length > 0;
  if (hasPracticeScore) {
    drawBeatGrid(svg);
    if (!state.exportMode.active) drawPracticePlayhead(svg);
    drawPedalTrack(svg);
    const practiceItems = buildPracticeNoteItems();
    if (!state.exportMode.active) drawPracticeDurationLines(svg);
    drawPracticeArpeggioMarks(svg, practiceItems);
    practiceItems.forEach((item) => drawNote(svg, item));
    if (!state.exportMode.active) {
      drawActiveInputNotes(svg);
      drawPlaybackActiveNotes(svg);
    }
    drawPracticeOctaveGroups(svg, practiceItems);
    return;
  }

  const visibleNotes = [...state.activeNotes.keys()].sort((a, b) => a - b);
  if (!visibleNotes.length) {
    return;
  }

  const noteItems = visibleNotes.map((note) => {
    const clef = preferredClef(note);
    const step = midiToStaffStep(note);
    return { note, clef, step, x: STAFF_VIEWBOX.width / 2, xOffset: 0 };
  });

  applyNoteCollisionOffsets(noteItems, 35).forEach((item) => drawNote(svg, item));
}

function drawPracticePlayhead(svg) {
  const x = practicePlayheadX();
  svg.appendChild(createSvg("line", {
    x1: x,
    y1: BEAT_GRID_TOP_Y - 54,
    x2: x,
    y2: BEAT_GRID_BOTTOM_Y + 54,
    class: "practice-playhead-line"
  }));
}

function drawBeatGrid(svg) {
  if (!state.practice.measures.length) return;

  const viewStartTick = currentVisualStartTick();
  const viewEndTick = currentVisualEndTick();
  const xForTick = xForCurrentViewTick;

  state.practice.measures.forEach((measure) => {
    if (measure.endTick <= viewStartTick || measure.startTick >= viewEndTick) return;
    const timeSignature = measure.timeSignature || state.practice.timeSignature || { numerator: 4, denominator: 4 };
    const numerator = Math.max(1, Number(timeSignature.numerator) || 4);
    const denominator = Math.max(1, Number(timeSignature.denominator) || 4);
    const beatTicks = Math.max(1, (state.practice.ticksPerQuarter || MIDI_PPQ) * 4 / denominator);

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

  const viewStartTick = currentVisualStartTick();
  const viewEndTick = currentVisualEndTick();
  const xForTick = xForCurrentViewTick;

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
    .sort((a, b) => (
      a.tick - b.tick ||
      (a.trackIndex ?? -1) - (b.trackIndex ?? -1) ||
      (a.channel ?? -1) - (b.channel ?? -1) ||
      a.value - b.value
    ));
  const intervals = [];
  const downTicks = new Map();

  events.forEach((event) => {
    const isDown = event.value >= 64;
    const scope = pedalEventScope(event);
    if (isDown && !downTicks.has(scope)) {
      downTicks.set(scope, event);
      return;
    }
    if (!isDown && downTicks.has(scope)) {
      const start = downTicks.get(scope);
      intervals.push({
        startTick: start.tick,
        endTick: Math.max(event.tick, start.tick + 1),
        channel: start.channel,
        trackIndex: start.trackIndex
      });
      downTicks.delete(scope);
    }
  });

  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  downTicks.forEach((start) => {
    intervals.push({
      startTick: start.tick,
      endTick: Math.max(lastMeasure?.endTick || viewEndTick, start.tick + 1),
      channel: start.channel,
      trackIndex: start.trackIndex
    });
  });

  return intervals
    .filter((interval) => interval.startTick < viewEndTick && interval.endTick > viewStartTick)
    .map((interval) => ({
      ...interval,
      startsInside: interval.startTick >= viewStartTick && interval.startTick <= viewEndTick,
      endsInside: interval.endTick >= viewStartTick && interval.endTick <= viewEndTick
    }));
}

function pedalEventScope(event) {
  return `${event.trackIndex ?? -1}:${event.channel ?? -1}`;
}

function buildPracticeNoteItems() {
  const visibleNotes = visiblePracticeTargets();
  if (!visibleNotes.length) return [];

  const inputX = activeInputColumnX();
  const displayStartById = displayStartTicksForTargets(visibleNotes);
  const primaryCueTargets = nextPrimaryCueTargets();
  const isPlaybackMode = state.playback.playing || state.playback.paused;
  const cueBoundaryTick = primaryCueTargets.length
    ? Math.max(...primaryCueTargets.map((target) => target.startTick))
    : isPlaybackMode ? (state.practice.viewStartTick || 0) : Infinity;
  const cueTargetIds = new Set(nextPracticeCueTargets().map((target) => target.id));
  const items = visibleNotes
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note)
    .map((target) => {
      const display = displayInfoForPracticeNote(target.note, target.startTick);
      const durationKind = durationKindForTicks(Math.max(1, target.endTick - target.startTick));
      const displayStartTick = displayStartById.get(target.id) ?? target.startTick;
      const targetX = Math.max(MEASURE_NOTE_LEFT_X, Math.min(MEASURE_NOTE_RIGHT_X, xForCurrentViewTick(displayStartTick)));
      const targetEndX = Math.max(MEASURE_NOTE_LEFT_X, Math.min(MEASURE_NOTE_RIGHT_X, xForCurrentViewTick(target.endTick)));
      const matched = isAutoFollowTargetDisplayMatched(target);
      const active = isPracticeTargetVisuallyActive(target, cueBoundaryTick);
      const cue = cueTargetIds.has(target.id) && !matched && !active;
      const exportMode = state.exportMode.active;
      return {
        note: target.note,
        displayNote: display.note,
        clef: display.clef,
        step: midiToStaffStep(display.note, target.startTick),
        x: !exportMode && matched && !flowDisplayEnabled() ? inputX : targetX,
        endX: targetEndX,
        startTick: target.startTick,
        displayStartTick,
        endTick: target.endTick,
        durationKind,
        octaveMark: display.octaveMark,
        targetId: target.id,
        matched: exportMode ? false : matched,
        active: exportMode ? false : active,
        cue: exportMode ? false : cue,
        isPractice: true,
        trackIndex: target.trackIndex ?? 0,
        channel: target.channel ?? 0,
        trackRole: target.trackRole || "primary",
        xOffset: 0
      };
    })
    .filter((item) => shouldDisplayPracticeNoteItem(item));

  return applyNoteCollisionOffsets(items, 34);
}

function isLeftOfPracticePlayheadX(x) {
  return !state.exportMode.active && x < practicePlayheadX() - 1;
}

function shouldDisplayPracticeNoteItem(item) {
  if (!isLeftOfPracticePlayheadX(item.x)) return true;
  if (flowDisplayEnabled() && item.x <= MEASURE_NOTE_LEFT_X + 1) return false;
  return Boolean(item.active);
}

function drawPracticeDurationLines(svg) {
  const targets = visiblePracticeDurationTargets();
  if (!targets.length) return;
  const viewStartTick = currentVisualStartTick();
  const displayStartById = displayStartTicksForTargets(targets);
  const cueTargetIds = new Set(nextPracticeCueTargets().map((target) => target.id));
  const primaryCueTargets = nextPrimaryCueTargets();
  const isPlaybackMode = state.playback.playing || state.playback.paused;
  const cueBoundaryTick = primaryCueTargets.length
    ? Math.max(...primaryCueTargets.map((target) => target.startTick))
    : isPlaybackMode ? (state.practice.viewStartTick || 0) : Infinity;

  targets.forEach((target) => {
    const display = displayInfoForPracticeNote(target.note, target.startTick);
    const displayStartTick = displayStartById.get(target.id) ?? target.startTick;
    const noteStartX = xForCurrentViewTick(displayStartTick);
    const startX = displayStartTick < viewStartTick
      ? MEASURE_NOTE_LEFT_X
      : Math.min(MEASURE_NOTE_RIGHT_X, noteStartX + 27);
    const endX = Math.min(MEASURE_NOTE_RIGHT_X, xForCurrentViewTick(target.endTick));
    if (endX - startX < 16) return;
    const y = yForNote(display.note, display.clef, target.startTick);
    const active = isPracticeTargetVisuallyActive(target, cueBoundaryTick);
    if (isLeftOfPracticePlayheadX(noteStartX) && !active) return;
    const classes = ["note-duration-line"];
    if ((target.trackRole || "primary") === "secondary") classes.push("secondary-track-line");
    if (!state.exportMode.active && active) classes.push("active-duration-line");
    if (!state.exportMode.active && !active && cueTargetIds.has(target.id) && !isAutoFollowTargetDisplayMatched(target)) classes.push("cue-duration-line");
    svg.appendChild(createSvg("line", {
      x1: startX,
      y1: y,
      x2: endX,
      y2: y,
      class: classes.join(" "),
      "data-duration-note": target.note,
      "data-target-id": target.id || ""
    }));
  });
}

function displayStartTicksForTargets(targets) {
  const map = new Map();
  const arpeggioWindowTicks = arpeggioGroupingWindowTicks();
  const sorted = targets
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);

  let groupStartTick = null;
  let previousTick = null;
  sorted.forEach((target) => {
    if (
      groupStartTick === null ||
      previousTick === null ||
      target.startTick - previousTick > arpeggioWindowTicks
    ) {
      groupStartTick = target.startTick;
    }
    map.set(target.id, groupStartTick);
    previousTick = target.startTick;
  });

  return map;
}

function buildActiveInputNoteItems() {
  const visualNotes = currentInputVisualNotes();
  if (!state.practice.measures.length || !visualNotes.length) return [];
  if (state.playback.playing && !state.robotPerformance) {
    return buildLeftColumnNoteItems(
      visualNotes.filter((note) => !state.playback.activeNotes.has(note)),
      "input"
    );
  }
  if (flowDisplayEnabled()) {
    return buildLeftColumnNoteItems(
      visualNotes.filter((note) => Boolean(state.activeNotes.get(note)?.wrong)),
      "input"
    );
  }
  if (state.playback.playing && state.playback.silent) {
    return buildLeftColumnNoteItems(visualNotes, "input");
  }
  const cueNotes = nextPracticeCueNotes();
  const currentTargetNotes = cueNotes.size
    ? cueNotes
    : new Set(targetsForBeat(currentAutoFollowBeatStart()).map((target) => target.note));
  return buildLeftColumnNoteItems(
    visualNotes.filter((note) => !currentTargetNotes.has(note)),
    "input"
  );
}

function buildPlaybackActiveNoteItems() {
  if (!state.practice.measures.length || (!state.playback.playing && !state.playback.paused) || !state.playback.activeNotes.size) {
    return [];
  }
  return buildLeftColumnNoteItems([...state.playback.activeNotes], "playback");
}

function buildLeftColumnNoteItems(notes, trackRole) {
  const inputX = activeInputColumnX();
  const items = notes
    .sort((a, b) => a - b)
    .map((note) => {
      const display = displayInfoForPracticeNote(note);
      return {
        note,
        displayNote: display.note,
        clef: display.clef,
        step: midiToStaffStep(display.note),
        octaveMark: display.octaveMark,
        x: inputX,
        xOffset: 0,
        trackRole,
        wrong: Boolean(state.activeNotes.get(note)?.wrong)
      };
    });

  return applyNoteCollisionOffsets(items, 34);
}

function applyNoteCollisionOffsets(items, spread = 34) {
  const adjusted = items.map((item) => ({ ...item, xOffset: item.xOffset || 0 }));
  const sorted = adjusted
    .slice()
    .sort((a, b) => (
      Math.round(a.x) - Math.round(b.x) ||
      String(a.clef).localeCompare(String(b.clef)) ||
      a.step - b.step ||
      a.note - b.note
    ));

  for (let index = 0; index < sorted.length;) {
    const clusterStart = index;
    index += 1;
    while (
      index < sorted.length &&
      Math.abs(sorted[index].x - sorted[index - 1].x) <= 4 &&
      sorted[index].clef === sorted[index - 1].clef &&
      sorted[index].step - sorted[index - 1].step <= 1
    ) {
      index += 1;
    }

    const cluster = sorted.slice(clusterStart, index);
    if (cluster.length > 1) {
      cluster.forEach((item, itemIndex) => {
        item.xOffset = (itemIndex - (cluster.length - 1) / 2) * spread;
      });
    }
  }

  return adjusted.map((item) => ({ ...item, x: item.x + item.xOffset }));
}

function activeInputColumnX() {
  return flowDisplayEnabled() ? practicePlayheadX() : Math.max(360, MEASURE_NOTE_LEFT_X - 74);
}

function drawActiveInputNotes(svg) {
  drawLeftColumnNotes(svg, buildActiveInputNoteItems());
}

function drawPlaybackActiveNotes(svg) {
  drawLeftColumnNotes(svg, buildPlaybackActiveNoteItems());
}

function drawLeftColumnNotes(svg, items) {
  items.forEach((item) => {
    const y = yForNote(item.displayNote, item.clef, item.startTick);
    drawLedgerLines(svg, item.x, y, item.clef);
    svg.appendChild(createSvg("ellipse", {
      cx: item.x,
      cy: y,
      rx: 21,
      ry: 14,
      transform: `rotate(-18 ${item.x} ${y})`,
      class: `note-head active-input-note${item.wrong ? " wrong-note" : ""}`,
      "data-active-input-note": item.note
    }));
    const innerLabel = noteInnerLabel(item.note, item.startTick);
    if (innerLabel) {
      const text = createSvg("text", {
        x: item.x,
        y,
        class: "note-inner-label active-input-label",
        "data-active-input-label": innerLabel
      });
      text.textContent = innerLabel;
      svg.appendChild(text);
    }
  });
  drawPracticeOctaveGroups(svg, items);
}

function arpeggioGroupingWindowTicks() {
  return Math.max(1, practiceBeatTicks() * ARPEGGIO_DISPLAY_WINDOW_RATIO);
}

function practiceChordWindowTicks() {
  const secondsWindow = PRACTICE_CHORD_WINDOW_SECONDS / Math.max(0.000001, secondsPerPracticeTick());
  const gridWindow = practiceGridTicks() * 0.45;
  return Math.max(1, Math.round(Math.min(secondsWindow, gridWindow)));
}

function visiblePracticeTargets() {
  if (!state.practice.measures.length) return [];
  const viewStartTick = currentVisualStartTick();
  const viewEndTick = currentVisualEndTick();
  return state.practice.measures
    .flatMap((measure) => measure.notes)
    .filter((target) => target.startTick >= viewStartTick && target.startTick < viewEndTick);
}

function visiblePracticeDurationTargets() {
  if (!state.practice.measures.length) return [];
  const viewStartTick = currentVisualStartTick();
  const viewEndTick = currentVisualEndTick();
  return state.practice.measures
    .flatMap((measure) => measure.notes)
    .filter((target) => target.startTick < viewEndTick && target.endTick > viewStartTick);
}

function drawNote(svg, item) {
  const { note, clef, x, matched, isPractice, targetId } = item;
  const displayNote = item.displayNote ?? note;
  const y = yForNote(displayNote, clef, item.startTick);
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

  const innerLabel = noteInnerLabel(note, item.startTick);
  if (innerLabel) {
    const filledPracticeNote = isPractice && !matched && !item.active && !item.cue;
    const noteInnerLabelText = createSvg("text", {
      x,
      y,
      class: filledPracticeNote ? "note-inner-label light-note-label" : "note-inner-label",
      "data-note-inner-label": innerLabel
    });
    noteInnerLabelText.textContent = innerLabel;
    svg.appendChild(noteInnerLabelText);
  }

  const accidental = accidentalForNote(note, item.startTick);
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

function displayInfoForPracticeNote(note, tick = state.practice.viewStartTick || 0) {
  const clef = preferredClef(note);
  let displayNote = note;
  let octaveMark = "";
  const lineYs = clef === "bass" ? BASS_LINE_YS : TREBLE_LINE_YS;
  const topLimit = Math.min(...lineYs) - LEDGER_OCTAVE_LIMIT;
  const bottomLimit = Math.max(...lineYs) + LEDGER_OCTAVE_LIMIT;

  while (yForNote(displayNote, clef, tick) < topLimit && displayNote - 12 >= MIDI_MIN) {
    displayNote -= 12;
    octaveMark = "8va";
  }
  while (yForNote(displayNote, clef, tick) > bottomLimit && displayNote + 12 <= MIDI_MAX) {
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
  const { note, displayNote, x, y, matched, targetId } = item;
  const classes = ["note-head", "practice-note-head", "filled-note"];
  if (item.trackRole === "secondary") classes.push("secondary-track-note");
  if (matched) classes.push("matched-note");
  if (item.active) classes.push("active-note");
  if (item.cue) classes.push("cue-note");
  if (state.exportMode.active) {
    classes.push("export-note-head");
    svg.appendChild(createSvg("circle", {
      cx: x,
      cy: y,
      r: 19,
      class: classes.join(" "),
      "data-target-id": targetId || "",
      "data-note": note,
      "data-display-note": displayNote
    }));
    return;
  }
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

function drawPracticeArpeggioMarks(svg, items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = `${item.displayStartTick}:${item.clef}:${item.trackRole}:${item.trackIndex}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  groups.forEach((group) => {
    const startTicks = new Set(group.map((item) => item.startTick));
    if (group.length < 2 || startTicks.size < 2) return;

    const ys = group.map((item) => yForNote(item.displayNote, item.clef, item.startTick));
    const x = Math.min(...group.map((item) => item.x)) - 46;
    drawArpeggioWave(svg, x, Math.min(...ys) - 18, Math.max(...ys) + 18, group[0].trackRole);
  });
}

function drawArpeggioWave(svg, x, y1, y2, trackRole = "primary") {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const step = 18;
  const amp = 9;
  let y = top;
  let path = `M ${x} ${y}`;
  let direction = 1;
  while (y < bottom) {
    const nextY = Math.min(bottom, y + step);
    const midY = (y + nextY) / 2;
    path += ` Q ${x + amp * direction} ${midY} ${x} ${nextY}`;
    y = nextY;
    direction *= -1;
  }
  const classes = ["arpeggio-mark"];
  if (trackRole === "secondary") classes.push("secondary-track-line");
  svg.appendChild(createSvg("path", {
    d: path,
    class: classes.join(" ")
  }));
}

function drawPracticeOctaveGroups(svg, items) {
  const sorted = items.slice().sort((a, b) => a.x - b.x || a.step - b.step);
  const groups = [];
  let current = null;

  sorted.forEach((item) => {
    if (!item.octaveMark) {
      return;
    }
    if (
      current &&
      current.octaveMark === item.octaveMark &&
      current.trackRole === item.trackRole &&
      current.clef === item.clef &&
      Math.abs(item.x - current.endX) < 420
    ) {
      current.items.push(item);
      current.endX = Math.max(current.endX, item.x);
      current.markY = current.octaveMark === "8va"
        ? Math.min(current.markY, yForNote(item.displayNote, item.clef, item.startTick) - 62)
        : Math.max(current.markY, yForNote(item.displayNote, item.clef, item.startTick) + 74);
      return;
    }

    const y = yForNote(item.displayNote, item.clef, item.startTick);
    current = {
      octaveMark: item.octaveMark,
      trackRole: item.trackRole,
      clef: item.clef,
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

function noteInnerLabel(note, tick = state.practice.viewStartTick || 0) {
  if (state.noteLabelMode === "degree") return degreeForNote(note, tick);
  if (state.noteLabelMode === "pitch") return NOTE_NAMES[note % 12].replace("#", "♯");
  return "";
}

function drawKeySignature(svg) {
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(state.practice.viewStartTick || 0)] || MAJOR_KEY_SIGNATURES.C;
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

function drawTimeSignature(svg) {
  const signature = timeSignatureAtTick(state.practice.viewStartTick || 0);
  const numerator = Math.max(1, Number(signature.numerator) || 4);
  const denominator = Math.max(1, Number(signature.denominator) || 4);
  const key = MAJOR_KEY_SIGNATURES[keySignatureAtTick(state.practice.viewStartTick || 0)] || MAJOR_KEY_SIGNATURES.C;
  const x = KEY_SIGNATURE_START_X + Math.max(1, key.count || 0) * KEY_SIGNATURE_GAP_X + 38;
  [
    { y1: 222, y2: 282 },
    { y1: 502, y2: 562 }
  ].forEach(({ y1, y2 }) => {
    const top = createSvg("text", { x, y: y1, class: "time-signature" });
    top.textContent = String(numerator);
    const bottom = createSvg("text", { x, y: y2, class: "time-signature" });
    bottom.textContent = String(denominator);
    svg.append(top, bottom);
  });
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

function renderExportStaffSvg(rowMeasures) {
  const svg = createSvg("svg", {
    viewBox: `0 15 ${STAFF_VIEWBOX.width} 810`,
    xmlns: "http://www.w3.org/2000/svg",
    role: "img"
  });
  const rowStartTick = rowMeasures[0].startTick;
  const rowEndTick = rowMeasures[rowMeasures.length - 1].endTick;
  const original = {
    staffSvg: els.staffSvg,
    viewStartTick: state.practice.viewStartTick,
    currentMeasure: state.practice.currentMeasure,
    exportMode: { ...state.exportMode }
  };

  try {
    els.staffSvg = svg;
    state.practice.viewStartTick = rowStartTick;
    state.practice.currentMeasure = measureIndexForTick(rowStartTick);
    state.exportMode = {
      active: true,
      viewSpanTicks: Math.max(1, rowEndTick - rowStartTick),
      rowMeasures
    };
    drawStaff();
    return svg.outerHTML;
  } finally {
    els.staffSvg = original.staffSvg;
    state.practice.viewStartTick = original.viewStartTick;
    state.practice.currentMeasure = original.currentMeasure;
    state.exportMode = original.exportMode;
  }
}

function exportScorePdf() {
  if (!state.practice.measures.length) return;

  const rows = [];
  const measuresPerRow = 3;
  const rowsPerPage = 3;
  for (let index = 0; index < state.practice.measures.length; index += measuresPerRow) {
    rows.push(state.practice.measures.slice(index, index + measuresPerRow));
  }

  const pages = [];
  for (let index = 0; index < rows.length; index += rowsPerPage) {
    const pageRows = rows.slice(index, index + rowsPerPage);
    const startMeasure = index * measuresPerRow + 1;
    const endMeasure = Math.min(state.practice.measures.length, (index + pageRows.length) * measuresPerRow);
    pages.push(`
      <section class="pdf-page">
        <header class="pdf-title">
          <span>${escapeHtml(displayFilename(state.practice.filename, "Easy Piano"))}</span>
          <span>${startMeasure}-${endMeasure} / ${state.practice.measures.length}</span>
        </header>
        ${pageRows.map((rowMeasures) => `<div class="score-export-row">${renderExportStaffSvg(rowMeasures)}</div>`).join("")}
      </section>
    `);
  }

  els.pdfExportRoot.innerHTML = `
    <div class="pdf-export-toolbar">
      <strong>PDF Preview</strong>
      <span>Mac/Safari: 如果“打印”是灰色，请点左下角 PDF 菜单保存。</span>
      <button type="button" data-export-print>保存PDF/打印</button>
      <button type="button" data-export-close>关闭</button>
    </div>
    ${pages.join("")}
  `;
  els.pdfExportRoot.setAttribute("aria-hidden", "false");
  document.body.classList.add("pdf-previewing");
  window.setTimeout(printExportPreview, 120);
}

function printExportPreview() {
  document.body.classList.add("print-exporting");
  const cleanup = () => {
    document.body.classList.remove("print-exporting");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 1200);
}

function closeExportPreview() {
  document.body.classList.remove("pdf-previewing", "print-exporting");
  els.pdfExportRoot.setAttribute("aria-hidden", "true");
  els.pdfExportRoot.replaceChildren();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function buildKeyboard(options = {}) {
  const { preserveScroll = false } = options;
  const { min, max } = KEY_RANGE;
  const board = els.keyboard.parentElement;
  const previousScrollRatio = board && els.keyboard.offsetWidth > board.clientWidth
    ? board.scrollLeft / Math.max(1, els.keyboard.offsetWidth - board.clientWidth)
    : 0;
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
  syncWaterfallLayout();
  if (preserveScroll && board) {
    const maxScrollLeft = Math.max(0, els.keyboard.offsetWidth - board.clientWidth);
    board.scrollLeft = Math.max(0, Math.min(maxScrollLeft, previousScrollRatio * maxScrollLeft));
  }
  syncWaterfallScroll();
}

function keyboardWhiteWidth() {
  const boardWidth = els.keyboard.parentElement?.clientWidth || window.innerWidth || 1024;
  const portrait = isPortraitLayout();
  const visibleWhiteKeys = portrait
    ? FULL_KEYBOARD_WHITE_KEYS * (PORTRAIT_VISIBLE_KEYS / FULL_KEYBOARD_TOTAL_KEYS)
    : FULL_KEYBOARD_WHITE_KEYS;
  return Math.max(1, boardWidth / visibleWhiteKeys);
}

function isPortraitLayout() {
  return window.matchMedia?.("(orientation: portrait)")?.matches || window.innerHeight > window.innerWidth;
}

function centerKeyboardOnMiddleC() {
  const key = els.keyboard.querySelector('[data-note="60"]');
  const board = els.keyboard.parentElement;
  if (!key || !board) return;
  const target = key.offsetLeft + key.offsetWidth / 2 - board.clientWidth / 2;
  board.scrollLeft = Math.max(0, target);
  syncWaterfallScroll();
}

function queueCenterKeyboardOnMiddleC() {
  centerKeyboardOnMiddleC();
  window.requestAnimationFrame?.(centerKeyboardOnMiddleC);
  window.setTimeout(centerKeyboardOnMiddleC, 80);
  window.setTimeout(centerKeyboardOnMiddleC, 260);
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
    if (state.playback.paused) return;
    event.preventDefault();
    key.setPointerCapture(event.pointerId);
    pressNote(note, 96, "screen");
  });
  key.addEventListener("pointerup", () => releaseNote(note, "screen"));
  key.addEventListener("pointercancel", () => releaseNote(note, "screen"));
  key.addEventListener("lostpointercapture", () => releaseNote(note, "screen"));
  return key;
}

function syncWaterfallLayout() {
  if (!els.waterfall || !els.keyboard) return;
  els.waterfall.style.width = els.keyboard.style.width || `${els.keyboard.offsetWidth}px`;
  els.waterfall.style.minWidth = els.keyboard.style.minWidth || `${els.keyboard.offsetWidth}px`;
  rebuildWaterfallKeyMetrics();
  syncWaterfallScroll();
}

function rebuildWaterfallKeyMetrics() {
  state.waterfallState.keyMetrics = new Map();
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    const note = Number(key.dataset.note);
    if (!Number.isFinite(note)) return;
    state.waterfallState.keyMetrics.set(note, {
      left: key.offsetLeft,
      width: key.offsetWidth
    });
  });
  state.waterfallState.layoutReady = state.waterfallState.keyMetrics.size > 0;
}

function syncWaterfallScroll() {
  if (!els.waterfallBoard || !els.keyboard?.parentElement) return;
  els.waterfallBoard.scrollLeft = els.keyboard.parentElement.scrollLeft;
}

function syncWaterfallVisibility() {
  if (!els.waterfallBoard) return;
  const visible = Boolean(state.waterfall);
  if (els.stage) els.stage.classList.toggle("waterfall-mode", visible);
  els.waterfallBoard.classList.toggle("hidden", !visible);
  if (els.scoreBoard) els.scoreBoard.classList.toggle("waterfall-playback", visible);
  if (!visible && els.waterfall) els.waterfall.replaceChildren();
  if (visible && !state.waterfallState.layoutReady) syncWaterfallLayout();
}

function renderWaterfall(playbackTick, options = {}) {
  if (!state.waterfall || !els.waterfall || !els.waterfallBoard) {
    syncWaterfallVisibility();
    return;
  }
  const now = performance.now();
  if (!options.force && now - state.waterfallState.lastFrameAt < WATERFALL_FRAME_MS && playbackTick < state.playback.endTick) return;
  state.waterfallState.lastFrameAt = now;
  syncWaterfallVisibility();

  const secondsPerTick = Math.max(0.000001, state.playback.secondsPerTick || secondsPerPracticeTick());
  const lookaheadTicks = WATERFALL_LOOKAHEAD_SECONDS / secondsPerTick;
  const startTick = playbackTick - 1;
  const endTick = playbackTick + lookaheadTicks;
  const laneHeight = els.waterfallBoard.clientHeight || 128;
  const fragment = document.createDocumentFragment();
  const practiceWaterfall = state.practice.notes?.length > 0;
  const notes = practiceWaterfall
    ? state.practice.notes
      .map((target) => ({
        targetId: target.id,
        note: target.note,
        startTick: target.startTick,
        endTick: Math.max(target.startTick + 1, target.endTick)
      }))
      .sort((a, b) => a.startTick - b.startTick || a.note - b.note)
    : state.playback.visualNotes;

  if (!practiceWaterfall) {
    while (
      state.waterfallState.visibleStartIndex < notes.length &&
      notes[state.waterfallState.visibleStartIndex].endTick < startTick
    ) {
      state.waterfallState.visibleStartIndex += 1;
    }
  }

  for (let index = practiceWaterfall ? 0 : state.waterfallState.visibleStartIndex; index < notes.length; index += 1) {
    const item = notes[index];
    if (item.startTick > endTick) break;
    if (item.endTick < startTick) continue;
    const metric = state.waterfallState.keyMetrics.get(item.note);
    if (!metric) continue;
    const active = playbackTick >= item.startTick && playbackTick < item.endTick;
    const untilStartSeconds = (item.startTick - playbackTick) * secondsPerTick;
    const progress = 1 - untilStartSeconds / WATERFALL_LOOKAHEAD_SECONDS;
    const durationSeconds = Math.max(0.08, (item.endTick - item.startTick) * secondsPerTick);
    const height = Math.max(18, Math.min(laneHeight * 0.78, durationSeconds / WATERFALL_LOOKAHEAD_SECONDS * laneHeight));
    const y = Math.max(-height, Math.min(laneHeight - 8, progress * laneHeight - height));
    const bar = document.createElement("span");
    bar.className = `waterfall-note ${active ? "active" : ""} ${isWhite(item.note) ? "white-note" : "black-note"}`;
    bar.style.left = `${metric.left + Math.max(2, metric.width * 0.12)}px`;
    bar.style.width = `${Math.max(8, metric.width * 0.76)}px`;
    bar.style.height = `${height}px`;
    bar.style.transform = `translateY(${y}px)`;
    const label = noteInnerLabel(item.note, item.startTick);
    if (label) {
      const labelNode = document.createElement("span");
      labelNode.className = "waterfall-note-label";
      labelNode.textContent = label;
      bar.appendChild(labelNode);
    }
    fragment.appendChild(bar);
  }
  els.waterfall.replaceChildren(fragment);
}

function pressNote(note, velocity = 96, source = "midi", channel = 0) {
  if (note < MIDI_MIN || note > MIDI_MAX) return;
  recordMidiEvent("noteon", { note, velocity, channel });
  state.releasedWhileSustained.delete(note);
  const wrong = isWrongPracticeInputNote(note);
  state.autoFollow.pausedAfterManualNavigation = false;
  const matchedTarget = markAutoFollowNote(note);
  state.activeNotes.set(note, {
    velocity,
    source,
    channel,
    startedAt: performance.now(),
    wrong,
    chordPedalEpoch: state.chordPedalEpoch,
    targetId: matchedTarget?.id || null
  });
  if (wrong) recordMistake(note);
  startLiveInputTone(note, velocity);
  evaluateAutoFollowBeat();
  updateAll();
}

function isWrongPracticeInputNote(note) {
  if (!state.practice.measures.length || autoFollowBlockedByPlayback()) return false;
  if (state.autoFollowTolerance !== 0) return false;
  const cueNotes = nextPracticeCueNotes();
  return cueNotes.size > 0 && !cueNotes.has(note);
}

function releaseNote(note, source = "midi", channel = 0) {
  if (state.activeNotes.has(note)) {
    recordMidiEvent("noteoff", { note, velocity: 0, channel });
  }
  if (state.sustainDown) {
    if (state.activeNotes.has(note)) state.releasedWhileSustained.add(note);
    return;
  }
  stopLiveInputTone(note);
  state.activeNotes.delete(note);
  state.releasedWhileSustained.delete(note);
  finishPracticeRunIfReleased();
  updateAll();
}

function releaseSustainedNotes() {
  const releasedNotes = [...state.releasedWhileSustained];
  state.releasedWhileSustained.forEach((note) => {
    state.activeNotes.delete(note);
  });
  state.releasedWhileSustained.clear();
  stopReleasedLiveInputTones(releasedNotes);
  finishPracticeRunIfReleased();
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

function discardAndRestartRecording() {
  if (!state.recording.active) return;
  revokeRecordingUrl();
  state.recording.startedAt = performance.now();
  state.recording.events = [];
  syncRecordingControls();
  setStatusKey("status.recordingRestarted");
}

function stopRecording() {
  if (!state.recording.active) return;
  [...state.activeNotes.entries()].forEach(([note, active]) => {
    recordMidiEvent("noteoff", { note, velocity: 0, channel: active.channel ?? 0 });
  });
  if (state.sustainDown) {
    recordMidiEvent("cc", { controller: 64, value: 0, channel: state.sustainChannel ?? 0 });
  }
  state.recording.active = false;
  syncRecordingControls();
  const count = state.recording.events.filter((event) => event.type === "noteon").length;
  if (!count) {
    setStatusKey("status.recordedEmpty");
    return;
  }
  saveRecording();
}

function recordMidiEvent(type, detail) {
  if (!state.recording.active) return;
  recordMidiEventAt(type, detail, performance.now() - state.recording.startedAt);
}

function recordMidiEventAt(type, detail, timeMs) {
  if (!state.recording.active) return;
  state.recording.events.push({
    type,
    timeMs: Math.max(0, Number(timeMs) || 0),
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
    loadGeneratedRecording(bytes, filename);
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
  loadGeneratedRecording(bytes, filename);
}

function loadGeneratedRecording(bytes, filename) {
  try {
    const parsed = parseMidiFile(bytes);
    applyParsedScore(parsed, filename, "MIDI", { sourceBytes: bytes });
  } catch (error) {
    setStatusKey("status.loadFailed", { message: error.message || "录音载入失败" });
  }
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
  return isInputNoteVisuallyHeld(note);
}

function displayFilename(filename, fallback) {
  const value = String(filename || fallback || "").trim();
  if (value.length <= DISPLAY_FILENAME_MAX) return value;
  return `${value.slice(0, DISPLAY_FILENAME_MAX)}...`;
}

function applyParsedScore(parsed, filename, typeLabel, source = {}) {
  cancelAutoFollowAnimation();
  clearMistakes();
  const normalized = trimLeadingScoreSilence(parsed);
  const originalTempo = normalized.microsecondsPerQuarter || 500000;
  state.practice.notes = normalized.notes || normalized.measures.flatMap((measure) => measure.notes);
  state.practice.pedalEvents = normalized.pedalEvents || [];
  state.practice.currentMeasure = 0;
  state.practice.filename = filename || typeLabel;
  state.practice.timeSignature = normalized.timeSignature;
  state.practice.timeSignatureEvents = normalized.timeSignatureEvents || [];
  state.practice.keySignatureEvents = normalized.keySignatureEvents || [];
  state.practice.ticksPerQuarter = normalized.ticksPerQuarter;
  state.practice.measureTicks = normalized.measureTicks;
  state.practice.microsecondsPerQuarter = practiceTempoForParsedScore(normalized);
  state.practice.originalMicrosecondsPerQuarter = originalTempo;
  state.practice.sourceBytes = source.sourceBytes instanceof Uint8Array ? new Uint8Array(source.sourceBytes) : null;
  state.practice.sourceType = typeLabel;
  state.practice.viewStartTick = 0;
  state.practice.measures = normalized.variableMeasures ? normalized.measures : buildMeasuresFromPracticeNotes(state.practice.notes);
  if (normalized.keySignature && MAJOR_KEY_SIGNATURES[normalized.keySignature]) {
    state.keySignature = normalized.keySignature;
    saveSettings();
  }
  resetAutoFollowBeat(0, { clearPlayed: true });
  const displayName = displayFilename(state.practice.filename, typeLabel);
  setStatusKey(normalized.measures.length ? "status.loaded" : "status.loadedEmpty", {
    name: displayName,
    type: typeLabel
  });
  updateAll();
  scheduleAutoFollowEmptyBeatCheck();
}

function trimLeadingScoreSilence(parsed) {
  const sourceMeasures = parsed.measures || [];
  const sourceNotes = parsed.notes || sourceMeasures.flatMap((measure) => measure.notes || []);
  if (!sourceNotes.length) return parsed;

  const firstStartTick = Math.min(...sourceNotes.map((note) => Math.max(0, note.startTick || 0)));
  if (!Number.isFinite(firstStartTick) || firstStartTick <= 0) return parsed;

  const shiftTick = (tick) => Math.max(0, (Number(tick) || 0) - firstStartTick);
  const notesByOldId = new Map();
  const shiftedNotes = sourceNotes.map((note) => {
    const shifted = {
      ...note,
      startTick: shiftTick(note.startTick),
      endTick: Math.max(shiftTick(note.startTick) + 1, shiftTick(note.endTick))
    };
    notesByOldId.set(note.id, shifted);
    return shifted;
  });
  const shiftedPedalEvents = (parsed.pedalEvents || [])
    .map((event) => ({ ...event, tick: shiftTick(event.tick) }))
    .sort((a, b) => a.tick - b.tick || (a.value || 0) - (b.value || 0));
  const shiftedTimeSignatureEvents = (parsed.timeSignatureEvents || [])
    .map((event) => ({ ...event, tick: shiftTick(event.tick) }))
    .sort((a, b) => a.tick - b.tick || (a.numerator || 0) - (b.numerator || 0));
  const shiftedKeySignatureEvents = (parsed.keySignatureEvents || [])
    .map((event) => ({ ...event, tick: shiftTick(event.tick) }))
    .sort((a, b) => a.tick - b.tick);

  if (parsed.variableMeasures) {
    const shiftedMeasures = sourceMeasures
      .filter((measure) => (measure.endTick || 0) > firstStartTick || (measure.notes || []).length)
      .map((measure) => {
        const startTick = shiftTick(measure.startTick);
        return {
          ...measure,
          startTick,
          endTick: Math.max(startTick + 1, shiftTick(measure.endTick)),
          notes: (measure.notes || [])
            .map((note) => notesByOldId.get(note.id))
            .filter(Boolean)
        };
      })
      .map((measure, index) => ({ ...measure, index }));

    return {
      ...parsed,
      notes: shiftedNotes,
      measures: shiftedMeasures.length ? shiftedMeasures : buildMeasuresFromPracticeNotes(shiftedNotes),
      pedalEvents: shiftedPedalEvents,
      timeSignatureEvents: shiftedTimeSignatureEvents,
      keySignatureEvents: shiftedKeySignatureEvents
    };
  }

  return {
    ...parsed,
    notes: shiftedNotes,
    measures: buildMeasuresFromPracticeNotes(shiftedNotes),
    pedalEvents: shiftedPedalEvents,
    timeSignatureEvents: shiftedTimeSignatureEvents,
    keySignatureEvents: shiftedKeySignatureEvents
  };
}

function practiceTempoForParsedScore(score) {
  const originalTempo = score.microsecondsPerQuarter || 500000;
  const originalBpm = bpmFromMicroseconds(originalTempo);
  if (originalBpm <= DENSE_SUBDIVISION_PRACTICE_BPM) return originalTempo;
  return hasDenseSixteenthStarts(score) ? microsecondsFromBpm(DENSE_SUBDIVISION_PRACTICE_BPM) : originalTempo;
}

function hasDenseSixteenthStarts(score) {
  const notes = score.notes || (score.measures || []).flatMap((measure) => measure.notes || []);
  if (notes.length < 8) return false;
  const ticksPerQuarter = score.ticksPerQuarter || MIDI_PPQ;
  const sixteenthTicks = Math.max(1, ticksPerQuarter / 4);
  const tolerance = Math.max(2, sixteenthTicks * 0.15);
  const uniqueStarts = [...new Set(notes.map((note) => Math.round(Math.max(0, note.startTick || 0))))].sort((a, b) => a - b);
  let denseGaps = 0;
  for (let index = 1; index < uniqueStarts.length; index += 1) {
    const gap = uniqueStarts[index] - uniqueStarts[index - 1];
    if (gap > 0 && Math.abs(gap - sixteenthTicks) <= tolerance) denseGaps += 1;
  }
  return denseGaps >= 4;
}

function updatePracticeTimeSignature(timeSignature) {
  cancelAutoFollowAnimation();
  stopMeasurePlayback();
  state.practice.timeSignature = timeSignature;
  state.practice.timeSignatureEvents = [];
  state.practice.measureTicks = measureTicksForTimeSignature(timeSignature, state.practice.ticksPerQuarter || MIDI_PPQ);
  state.practice.measures = buildMeasuresFromPracticeNotes(state.practice.notes);
  state.practice.currentMeasure = Math.max(0, Math.min(state.practice.measures.length - 1, measureIndexForTick(state.practice.viewStartTick || 0)));
  state.practice.viewStartTick = state.practice.measures[state.practice.currentMeasure]?.startTick || 0;
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

function measureIndexForTick(tick) {
  if (!state.practice.measures.length) return 0;
  const safeTick = Math.max(0, Number(tick) || 0);
  const index = state.practice.measures.findIndex((measure) => safeTick >= measure.startTick && safeTick < measure.endTick);
  if (index >= 0) return index;
  if (safeTick >= state.practice.measures[state.practice.measures.length - 1].endTick) return state.practice.measures.length - 1;
  return 0;
}

function currentPracticeMeasure() {
  return state.practice.measures[measureIndexForTick(state.practice.viewStartTick || 0)] || null;
}

function currentViewSpanTicks() {
  if (state.exportMode.active && state.exportMode.viewSpanTicks > 0) {
    return state.exportMode.viewSpanTicks;
  }
  const measure = currentPracticeMeasure();
  return Math.max(1, (measure?.endTick || 0) - (measure?.startTick || 0) || state.practice.measureTicks || MIDI_PPQ * 4);
}

function flowDisplayEnabled() {
  return Boolean(state.flowDisplay && !state.exportMode.active && state.practice.measures.length);
}

function currentVisualSpanTicks() {
  const span = currentViewSpanTicks();
  return flowDisplayEnabled() ? span * 2 : span;
}

function currentVisualStartTick() {
  const viewStartTick = state.practice.viewStartTick || 0;
  if (!flowDisplayEnabled()) return viewStartTick;
  return viewStartTick - currentVisualSpanTicks() * FLOW_DISPLAY_PLAYHEAD_PROGRESS;
}

function autoFollowBlockedByPlayback() {
  return state.playback.playing;
}

function currentVisualEndTick() {
  return currentVisualStartTick() + currentVisualSpanTicks();
}

function practicePlayheadX() {
  if (!flowDisplayEnabled()) return MEASURE_NOTE_LEFT_X;
  return MEASURE_NOTE_LEFT_X + (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X) * FLOW_DISPLAY_PLAYHEAD_PROGRESS;
}

function progressForCurrentViewTick(tick) {
  if (state.exportMode.active && state.exportMode.rowMeasures.length) {
    const rowMeasures = state.exportMode.rowMeasures;
    const measureIndex = rowMeasures.findIndex((measure) => tick >= measure.startTick && tick <= measure.endTick);
    const safeIndex = measureIndex >= 0
      ? measureIndex
      : tick < rowMeasures[0].startTick ? 0 : rowMeasures.length - 1;
    const measure = rowMeasures[safeIndex];
    const measureSpan = Math.max(1, measure.endTick - measure.startTick);
    const localProgress = Math.max(0, Math.min(1, (tick - measure.startTick) / measureSpan));
    return (safeIndex + localProgress) / rowMeasures.length;
  }
  return (tick - currentVisualStartTick()) / currentVisualSpanTicks();
}

function xForCurrentViewTick(tick) {
  return MEASURE_NOTE_LEFT_X + progressForCurrentViewTick(tick) * (MEASURE_NOTE_RIGHT_X - MEASURE_NOTE_LEFT_X);
}

function timeSignatureAtTick(tick) {
  const measure = state.practice.measures[measureIndexForTick(tick)] || currentPracticeMeasure();
  return measure?.timeSignature || state.practice.timeSignature || { numerator: 4, denominator: 4 };
}

function keySignatureAtTick(tick) {
  const events = (state.practice.keySignatureEvents || [])
    .filter((event) => MAJOR_KEY_SIGNATURES[event.keySignature])
    .sort((a, b) => (a.tick || 0) - (b.tick || 0));
  if (!events.length) return MAJOR_KEY_SIGNATURES[state.keySignature] ? state.keySignature : "C";
  const safeTick = Math.max(0, Number(tick) || 0);
  let current = events[0].keySignature || state.keySignature || "C";
  for (const event of events) {
    if ((event.tick || 0) > safeTick) break;
    current = event.keySignature;
  }
  return MAJOR_KEY_SIGNATURES[current] ? current : "C";
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
      applyParsedScore(parsed, name || "MIDI", "MIDI", { sourceBytes: bytes });
    }
  } catch (error) {
    cancelAutoFollowAnimation();
    state.practice.measures = [];
    state.practice.notes = [];
    state.practice.pedalEvents = [];
    state.practice.currentMeasure = 0;
    state.practice.viewStartTick = 0;
    state.practice.sourceBytes = null;
    state.practice.sourceType = "";
    resetAutoFollowBeat(null, { clearPlayed: true });
    setStatusKey("status.loadFailed", { message: error.message || "文件格式不支持" });
    updateAll();
  } finally {
    els.midiFileInput.value = "";
  }
}

async function loadTrialScore(scoreId) {
  const score = TRIAL_SCORES.find((item) => item.id === scoreId);
  if (!score) return;

  try {
    stopMeasurePlayback();
    setStatusKey("status.loadingSample");
    const response = await fetch(score.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const parsed = parseMidiFile(bytes);
    applyParsedScore(parsed, trialScoreLabel(score), "MIDI", { sourceBytes: bytes });
  } catch (error) {
    cancelAutoFollowAnimation();
    state.practice.measures = [];
    state.practice.notes = [];
    state.practice.pedalEvents = [];
    state.practice.currentMeasure = 0;
    state.practice.viewStartTick = 0;
    state.practice.sourceBytes = null;
    state.practice.sourceType = "";
    resetAutoFollowBeat(null, { clearPlayed: true });
    setStatusKey("status.loadFailed", { message: error.message || "样本乐谱读取失败" });
    updateAll();
  } finally {
    closeTrialScoreModal();
  }
}

function openTrialScoreModal() {
  if (!els.trialScoreModal) return;
  els.trialScoreModal.classList.remove("hidden");
  requestNativePurchaseState();
}

function closeTrialScoreModal() {
  if (!els.trialScoreModal) return;
  els.trialScoreModal.classList.add("hidden");
}

function isIosNativeApp() {
  return Boolean(window.webkit?.messageHandlers?.midiBridge);
}

function canLoadOwnScore() {
  return !isIosNativeApp() || state.fullUnlocked;
}

function handleLoadScoreClick() {
  if (canLoadOwnScore()) {
    els.midiFileInput.click();
    return;
  }
  openTrialScoreModal();
}

function postNativePurchaseMessage(type) {
  if (!isIosNativeApp()) {
    setStatusKey("status.purchaseUnavailable");
    return false;
  }
  window.webkit.messageHandlers.midiBridge.postMessage({ type });
  return true;
}

function requestNativePurchaseState() {
  if (!isIosNativeApp()) return;
  postNativePurchaseMessage("getPurchaseState");
}

function clearPurchaseRequestTimer() {
  if (!state.purchaseRequestTimer) return;
  window.clearTimeout(state.purchaseRequestTimer);
  state.purchaseRequestTimer = 0;
}

function waitForNativePurchaseBridge(onReady) {
  if (!isIosNativeApp()) {
    setStatusKey("status.purchaseUnavailable");
    return;
  }
  if (state.purchaseStateKnown) {
    onReady();
    return;
  }

  clearPurchaseRequestTimer();
  setStatusKey("status.purchaseChecking");
  postNativePurchaseMessage("getPurchaseState");
  state.purchaseRequestTimer = window.setTimeout(() => {
    if (!state.purchaseStateKnown) {
      setStatusKey("status.purchaseBridgeMissing");
    }
  }, 1800);
}

function purchaseFullUnlock() {
  if (state.fullUnlocked) {
    closeTrialScoreModal();
    els.midiFileInput.click();
    return;
  }
  waitForNativePurchaseBridge(() => {
    if (postNativePurchaseMessage("purchaseUnlock")) {
      setStatusKey("status.purchaseStarted");
    }
  });
}

function restoreFullUnlock() {
  waitForNativePurchaseBridge(() => {
    if (postNativePurchaseMessage("restoreUnlock")) {
      setStatusKey("status.purchaseChecking");
    }
  });
}

function setFullUnlockState(unlocked) {
  clearPurchaseRequestTimer();
  state.fullUnlocked = Boolean(unlocked);
  state.purchaseStateKnown = true;
  saveSettings();
  syncPurchaseControls();
  if (state.fullUnlocked) {
    closeTrialScoreModal();
    setStatusKey("status.purchaseUnlocked");
  }
}

function syncPurchaseControls() {
  const locked = isIosNativeApp() && !state.fullUnlocked;
  els.unlockFullButton?.classList.toggle("hidden", !locked);
  els.restorePurchaseButton?.classList.toggle("hidden", !locked);
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
  clearMistakes();
  if (!state.practice.measures.length) return;
  animatePracticeViewToTick(0, { clearPlayed: true, pauseAutoFollow: true });
}

function panPracticeView(deltaMeasures) {
  if (!state.practice.measures.length) return;
  const currentIndex = measureIndexForTick(state.practice.viewStartTick || 0);
  const nextIndex = Math.max(0, Math.min(state.practice.measures.length - 1, currentIndex + deltaMeasures));
  const nextStart = clampPracticeViewStartTick(state.practice.measures[nextIndex]?.startTick || 0);
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
  const timeSignature = timeSignatureAtTick(state.practice.viewStartTick || 0);
  const denominator = Math.max(1, Number(timeSignature.denominator) || 4);
  return Math.max(1, (state.practice.ticksPerQuarter || MIDI_PPQ) * 4 / denominator);
}

function practiceGridTicks() {
  return practiceBeatTicks();
}

function maxPracticeViewStartTick() {
  if (!state.practice.measures.length) return 0;
  return Math.max(0, practiceEndTick());
}

function practiceEndTick() {
  if (!state.practice.measures.length) return 0;
  return Math.max(...state.practice.measures.map((measure) => measure.endTick));
}

function secondsPerPracticeTick() {
  return (state.practice.microsecondsPerQuarter || 500000) / 1000000 / (state.practice.ticksPerQuarter || MIDI_PPQ);
}

function hashUnit(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function robotHumanizedPlayback(target, chordIndex, chordSize, secondsPerTick) {
  if (!state.robotPerformance) return { tickOffset: 0, gain: 1 };
  const jitterSeconds = (hashUnit(`${target.id}:timing`) - 0.5) * ROBOT_TIMING_JITTER_SECONDS;
  const centeredChordIndex = chordSize > 1 ? chordIndex - (chordSize - 1) / 2 : 0;
  const rollSeconds = centeredChordIndex * ROBOT_CHORD_ROLL_SECONDS;
  const lowHandLeadSeconds = target.note < 60 ? -0.004 : target.note >= 72 ? 0.003 : 0;
  const rawTimingSeconds = jitterSeconds + rollSeconds + lowHandLeadSeconds;
  const timingSeconds = Math.max(
    -ROBOT_MAX_TIMING_OFFSET_SECONDS,
    Math.min(ROBOT_MAX_TIMING_OFFSET_SECONDS, rawTimingSeconds)
  );
  const positionPulse = target.startTick % Math.max(1, practiceBeatTicks()) === 0 ? 0.035 : -0.01;
  const registerBalance = target.note < 52 ? 0.06 : target.note >= 76 ? -0.06 : 0;
  const gain = Math.max(
    0.78,
    Math.min(
      1.18,
      1 - ROBOT_GAIN_VARIATION / 2 +
        hashUnit(`${target.id}:gain`) * ROBOT_GAIN_VARIATION +
        positionPulse +
        registerBalance
    )
  );
  return {
    tickOffset: timingSeconds / Math.max(0.000001, secondsPerTick),
    gain
  };
}

function bpmFromMicroseconds(microsecondsPerQuarter) {
  return Math.max(20, Math.min(300, Math.round(60000000 / (Number(microsecondsPerQuarter) || 500000))));
}

function microsecondsFromBpm(bpm) {
  return Math.round(60000000 / Math.max(20, Math.min(300, Math.round(Number(bpm) || 120))));
}

function currentTempoBpm() {
  return bpmFromMicroseconds(state.practice.microsecondsPerQuarter || 500000);
}

function adjustPracticeTempo(delta) {
  if (!state.practice.measures.length) return;
  const resumeRhythm = state.autoFollow.rhythmRunning;
  stopMeasurePlayback();
  const nextBpm = Math.max(20, Math.min(300, currentTempoBpm() + delta));
  state.practice.microsecondsPerQuarter = microsecondsFromBpm(nextBpm);
  syncPracticeControls();
  if (resumeRhythm) restartRhythmFollowFromCurrentTick();
}

function saveTempoAdjustedMidi() {
  if (!(state.practice.sourceBytes instanceof Uint8Array) || state.practice.sourceType !== "MIDI") {
    setStatusKey("status.tempoSaveUnavailable");
    return;
  }
  const bpm = currentTempoBpm();
  const bytes = rewriteMidiTempoBytes(state.practice.sourceBytes, microsecondsFromBpm(bpm));
  const filename = tempoAdjustedFilename(state.practice.filename, bpm);

  if (window.webkit?.messageHandlers?.midiBridge) {
    window.webkit.messageHandlers.midiBridge.postMessage({
      type: "saveMidi",
      filename,
      base64: bytesToBase64(bytes)
    });
    loadGeneratedRecording(bytes, filename);
    setStatusKey("status.tempoSaved", { name: displayFilename(filename, "MIDI") });
    return;
  }

  const blob = new Blob([bytes], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  loadGeneratedRecording(bytes, filename);
  setStatusKey("status.tempoSaved", { name: displayFilename(filename, "MIDI") });
}

function tempoAdjustedFilename(filename, bpm) {
  const base = String(filename || "score")
    .replace(/\.(mid|midi)$/i, "")
    .trim() || "score";
  return `${base}_EP${Math.round(bpm)}bpm.mid`;
}

function rewriteMidiTempoBytes(sourceBytes, microsecondsPerQuarter) {
  const bytes = sourceBytes instanceof Uint8Array ? sourceBytes : new Uint8Array(sourceBytes || []);
  if (bytes.length < 14 || textFromBytes(bytes, 0, 4) !== "MThd") throw new Error("不是标准 MIDI 文件");
  const tempo = Math.max(1, Math.min(0xffffff, Math.round(Number(microsecondsPerQuarter) || 500000)));
  const tempoBytes = [(tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff];
  const headerLength = readUint32FromBytes(bytes, 4);
  const headerEnd = Math.min(bytes.length, 8 + headerLength);
  const chunks = [];
  let position = headerEnd;
  let tempoCount = 0;
  let firstTrackIndex = -1;

  chunks.push([...bytes.slice(0, headerEnd)]);
  while (position + 8 <= bytes.length) {
    const type = textFromBytes(bytes, position, 4);
    const length = readUint32FromBytes(bytes, position + 4);
    const dataStart = position + 8;
    const dataEnd = Math.min(bytes.length, dataStart + length);
    const data = bytes.slice(dataStart, dataEnd);
    if (type === "MTrk") {
      if (firstTrackIndex < 0) firstTrackIndex = chunks.length;
      const rewritten = rewriteMidiTrackTempo(data, tempoBytes);
      tempoCount += rewritten.tempoCount;
      chunks.push([...asciiBytes("MTrk"), ...uint32Bytes(rewritten.bytes.length), ...rewritten.bytes]);
    } else {
      chunks.push([...bytes.slice(position, dataEnd)]);
    }
    position = dataStart + length;
  }
  if (position < bytes.length) chunks.push([...bytes.slice(position)]);

  if (!tempoCount && firstTrackIndex >= 0) {
    const trackChunk = chunks[firstTrackIndex];
    const trackBytes = trackChunk.slice(8);
    const inserted = [0x00, 0xff, 0x51, 0x03, ...tempoBytes, ...trackBytes];
    chunks[firstTrackIndex] = [...asciiBytes("MTrk"), ...uint32Bytes(inserted.length), ...inserted];
  }

  return new Uint8Array(chunks.flat());
}

function rewriteMidiTrackTempo(trackBytes, tempoBytes) {
  const bytes = trackBytes instanceof Uint8Array ? trackBytes : new Uint8Array(trackBytes || []);
  const out = [];
  let position = 0;
  let runningStatus = 0;
  let tempoCount = 0;

  while (position < bytes.length) {
    const eventStart = position;
    const deltaEnd = readVarLenEnd(bytes, position);
    if (deltaEnd > bytes.length) break;
    position = deltaEnd;
    if (position >= bytes.length) break;

    let status = bytes[position];
    if (status >= 0x80) {
      position += 1;
      if (status < 0xf0) runningStatus = status;
    } else if (runningStatus) {
      status = runningStatus;
    } else {
      out.push(...bytes.slice(eventStart));
      return { bytes: out, tempoCount };
    }

    if (status === 0xff) {
      if (position >= bytes.length) break;
      const metaType = bytes[position];
      position += 1;
      const lengthStart = position;
      const lengthEnd = readVarLenEnd(bytes, position);
      const length = readVarLenValue(bytes, lengthStart, lengthEnd);
      position = lengthEnd;
      const dataStart = position;
      const dataEnd = Math.min(bytes.length, dataStart + length);
      if (metaType === 0x51 && length >= 3) {
        out.push(...bytes.slice(eventStart, dataStart), ...tempoBytes, ...bytes.slice(dataStart + 3, dataEnd));
        tempoCount += 1;
      } else {
        out.push(...bytes.slice(eventStart, dataEnd));
      }
      position = dataEnd;
      continue;
    }

    if (status === 0xf0 || status === 0xf7) {
      const lengthStart = position;
      const lengthEnd = readVarLenEnd(bytes, position);
      const length = readVarLenValue(bytes, lengthStart, lengthEnd);
      position = Math.min(bytes.length, lengthEnd + length);
      out.push(...bytes.slice(eventStart, position));
      continue;
    }

    const dataLength = midiDataLengthForStatus(status);
    if (!dataLength) {
      out.push(...bytes.slice(eventStart));
      return { bytes: out, tempoCount };
    }
    if (bytes[eventStart + (deltaEnd - eventStart)] >= 0x80) {
      position = Math.min(bytes.length, position + dataLength);
    } else {
      position = Math.min(bytes.length, position + dataLength);
    }
    out.push(...bytes.slice(eventStart, position));
  }

  if (position < bytes.length) out.push(...bytes.slice(position));
  return { bytes: out, tempoCount };
}

function readVarLenEnd(bytes, position) {
  let index = position;
  for (let count = 0; count < 4 && index < bytes.length; count += 1) {
    const byte = bytes[index];
    index += 1;
    if (!(byte & 0x80)) return index;
  }
  return index;
}

function readVarLenValue(bytes, start, end) {
  let value = 0;
  for (let index = start; index < end; index += 1) {
    value = (value << 7) | (bytes[index] & 0x7f);
  }
  return value;
}

function readUint32FromBytes(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function uint32Bytes(value) {
  const safe = Number(value) >>> 0;
  return [(safe >> 24) & 0xff, (safe >> 16) & 0xff, (safe >> 8) & 0xff, safe & 0xff];
}

function textFromBytes(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function syncTempoControls() {
  const hasMeasures = state.practice.measures.length > 0;
  const bpm = currentTempoBpm();
  if (els.tempoValue) els.tempoValue.textContent = String(bpm);
  if (els.tempoDownButton) {
    els.tempoDownButton.disabled = !hasMeasures || bpm <= 20;
    updateIconButtonLabel(els.tempoDownButton, `${t("label.tempo")} -1`);
  }
  if (els.tempoUpButton) {
    els.tempoUpButton.disabled = !hasMeasures || bpm >= 300;
    updateIconButtonLabel(els.tempoUpButton, `${t("label.tempo")} +1`);
  }
  if (els.saveTempoButton) {
    const originalBpm = bpmFromMicroseconds(state.practice.originalMicrosecondsPerQuarter || state.practice.microsecondsPerQuarter || 500000);
    const canSave = hasMeasures &&
      state.practice.sourceType === "MIDI" &&
      state.practice.sourceBytes instanceof Uint8Array &&
      bpm !== originalBpm;
    els.saveTempoButton.disabled = !canSave;
    els.saveTempoButton.classList.toggle("hidden", !canSave);
    els.saveTempoButton.title = t("button.saveTempo");
  }
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
  stopRhythmFollow();
  const nextTick = clampPracticeViewStartTick(Number(tick) || 0);
  state.practice.viewStartTick = nextTick;
  state.practice.currentMeasure = measureIndexForTick(nextTick);
  state.autoFollow.pausedAfterManualNavigation = true;
  resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: true });
  updateAll();
}

function snapTickToBeat(tick) {
  const gridTicks = practiceGridTicks();
  return Math.round(Math.max(0, tick) / gridTicks) * gridTicks;
}

function clampPracticeViewStartTick(tick, options = {}) {
  const safeTick = Math.max(0, Number(tick) || 0);
  const nextTick = options.snap === false ? safeTick : snapTickToBeat(safeTick);
  return Math.max(0, Math.min(maxPracticeViewStartTick(), nextTick));
}

function currentAutoFollowBeatStart() {
  return clampPracticeViewStartTick(state.practice.viewStartTick || 0, { snap: state.autoFollowTolerance !== 0 });
}

function resetAutoFollowBeat(beatStart = null, options = {}) {
  state.autoFollow.currentBeatStart = beatStart;
  state.autoFollow.targetGroupIds = [];
  if (options.clearPlayed) {
    state.autoFollow.playedNotesByBeat = new Map();
    state.autoFollow.correctTargetIds = new Set();
    state.autoFollow.finishingRun = false;
  }
}

function cancelAutoFollowAnimation() {
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
  stopRhythmFollow();
  window.clearTimeout(state.autoFollow.emptyAdvanceTimer);
  state.autoFollow.animationFrame = 0;
  state.autoFollow.emptyAdvanceTimer = 0;
  state.autoFollow.animating = false;
}

function rhythmFollowEnabled() {
  return Boolean(
    state.rhythmFollow &&
    state.autoFollowMode === "beat" &&
    !state.playback.playing &&
    !state.playback.paused &&
    !state.autoFollow.pausedAfterManualNavigation &&
    state.practice.measures.length
  );
}

function startRhythmFollow(stopTick) {
  if (!rhythmFollowEnabled() || state.autoFollow.animating || state.autoFollow.finishingRun) return;
  const targetTick = Math.max(state.practice.viewStartTick || 0, Math.min(Number(stopTick) || 0, maxPracticeViewStartTick()));
  if (targetTick <= (state.practice.viewStartTick || 0) + 0.5) return;
  window.cancelAnimationFrame(state.autoFollow.rhythmFrame);
  state.autoFollow.rhythmRunning = true;
  state.autoFollow.rhythmStartedAt = performance.now();
  state.autoFollow.rhythmStartTick = state.practice.viewStartTick || 0;
  state.autoFollow.rhythmStopTick = targetTick;
  state.autoFollow.rhythmLastFrameAt = 0;

  const step = (now) => {
    if (!rhythmFollowEnabled() || state.autoFollow.animating || state.autoFollow.finishingRun) {
      stopRhythmFollow();
      return;
    }
    const elapsedSeconds = Math.max(0, (now - state.autoFollow.rhythmStartedAt) / 1000);
    const nextTick = Math.min(
      state.autoFollow.rhythmStopTick,
      state.autoFollow.rhythmStartTick + elapsedSeconds / Math.max(0.000001, secondsPerPracticeTick())
    );
    if (now - state.autoFollow.rhythmLastFrameAt >= PLAYBACK_VISUAL_FRAME_MS) {
      state.autoFollow.rhythmLastFrameAt = now;
      state.practice.viewStartTick = nextTick;
      state.practice.currentMeasure = measureIndexForTick(nextTick);
      updateAll();
    }
    if (nextTick >= state.autoFollow.rhythmStopTick) {
      state.practice.viewStartTick = state.autoFollow.rhythmStopTick;
      state.practice.currentMeasure = measureIndexForTick(state.practice.viewStartTick);
      resetAutoFollowBeat(currentAutoFollowBeatStart());
      stopRhythmFollow();
      updateAll();
      return;
    }
    state.autoFollow.rhythmFrame = window.requestAnimationFrame(step);
  };

  state.autoFollow.rhythmFrame = window.requestAnimationFrame(step);
}

function stopRhythmFollow() {
  window.cancelAnimationFrame(state.autoFollow.rhythmFrame);
  state.autoFollow.rhythmFrame = 0;
  state.autoFollow.rhythmRunning = false;
}

function restartRhythmFollowFromCurrentTick() {
  const stopTick = state.autoFollow.rhythmStopTick;
  stopRhythmFollow();
  startRhythmFollow(stopTick);
}

function targetsForBeat(beatStart) {
  const gridTicks = practiceGridTicks();
  const beatEnd = beatStart + gridTicks;
  return (state.practice.notes || [])
    .filter((target) => target.startTick >= beatStart && target.startTick < beatEnd)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
}

function nextPracticeCueNotes() {
  return new Set(nextPracticeCueTargets().map((target) => target.note));
}

function keyboardCueNotes() {
  return new Set(nextKeyboardCueTargets().map((target) => target.note));
}

function nextKeyboardCueTargets() {
  const targets = nextPracticeCueTargets()
    .filter((target) => !isAutoFollowTargetDisplayMatched(target));
  if (!flowDisplayEnabled()) return targets;
  const playheadX = practicePlayheadX();
  return targets.filter((target) => {
    const x = xForCurrentViewTick(target.startTick);
    return x >= playheadX - 1 && x <= MEASURE_NOTE_RIGHT_X + 1;
  });
}

function nextPracticeCueTargets() {
  if (state.robotPerformance && state.playback.playing) {
    return robotPlaybackCueTargets();
  }
  return nextPrimaryCueTargets();
}

function robotPlaybackCueTargets() {
  if (!state.practice.measures.length || !state.playback.playing || !state.robotPerformance) return [];
  const currentTick = state.practice.viewStartTick || state.playback.startTick || 0;
  const cueLeadTicks = Math.max(1, practiceBeatTicks() * 0.03);
  const visibleFutureTargets = visiblePracticeTargets()
    .filter((target) => target.startTick > currentTick + cueLeadTicks);
  const groups = targetGroupsByStartTick(visibleFutureTargets);
  return groups[0] || [];
}

function nextPrimaryCueTargets() {
  if (state.autoFollowTolerance !== 0) return computeNextPrimaryCueTargets();
  return lockedAutoFollowTargetGroup();
}

function lockedAutoFollowTargetGroup() {
  if (!state.practice.measures.length || autoFollowBlockedByPlayback()) return [];
  const locked = targetsForLockedAutoFollowGroup();
  if (locked.length) return locked;

  const group = computeNextPrimaryCueTargets();
  state.autoFollow.targetGroupIds = group.map((target) => target.id);
  return group;
}

function targetsForLockedAutoFollowGroup() {
  if (!state.autoFollow.targetGroupIds.length) return [];
  const ids = new Set(state.autoFollow.targetGroupIds);
  const targets = (state.practice.notes || [])
    .filter((target) => ids.has(target.id))
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  if (targets.length !== state.autoFollow.targetGroupIds.length) {
    state.autoFollow.targetGroupIds = [];
    return [];
  }
  return targets;
}

function computeNextPrimaryCueTargets() {
  if (!state.practice.measures.length || autoFollowBlockedByPlayback()) return [];
  const gridTicks = practiceGridTicks();
  const startTick = currentAutoFollowBeatStart();
  const endTick = practiceEndTick();
  for (let tick = startTick; tick <= endTick; tick += gridTicks) {
    const group = firstUnmatchedTargetGroup(targetsForBeat(tick));
    if (group.length) return group;
  }
  return [];
}

function nextUnmatchedTargetGroupAfterTick(tick) {
  const remainingTargets = (state.practice.notes || [])
    .filter((target) => target.startTick >= tick && !isAutoFollowTargetMatched(target))
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  return autoFollowTargetGroups(remainingTargets)[0] || [];
}

function firstTargetGroupAtOrAfterTick(tick) {
  const targets = (state.practice.notes || [])
    .filter((target) => target.startTick >= tick)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  return autoFollowTargetGroups(targets)[0] || [];
}

function targetGroupsByStartTick(targets, options = {}) {
  const groups = [];
  let currentTick = null;
  let previousTick = null;
  let currentGroup = [];
  const groupingWindowTicks = Math.max(0, options.windowTicks ?? arpeggioGroupingWindowTicks());
  targets
    .slice()
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note)
    .forEach((target) => {
    if (currentTick === null || previousTick === null || target.startTick - previousTick > groupingWindowTicks) {
      if (currentGroup.length) groups.push(currentGroup);
      currentTick = target.startTick;
      currentGroup = [];
    }
    currentGroup.push(target);
    previousTick = target.startTick;
  });
  if (currentGroup.length) groups.push(currentGroup);
  return groups;
}

function autoFollowTargetGroups(targets) {
  return targetGroupsByStartTick(targets, { windowTicks: practiceChordWindowTicks() });
}

function firstUnmatchedTargetGroup(targets) {
  const groups = autoFollowTargetGroups(targets);
  for (const group of groups) {
    if (!isTargetGroupMatched(group)) {
      return group;
    }
  }
  return [];
}

function markAutoFollowNote(note) {
  if (state.autoFollowMode !== "beat" || autoFollowBlockedByPlayback() || !state.practice.measures.length) return null;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);
  const target = targetForPlayedNote(note, beatStart);
  if (target) markPlayedTargetForBeat(beatStartForTick(target.startTick), target);
  return target || null;
}

function targetForPlayedNote(note, currentBeatStart) {
  if (state.autoFollowTolerance === 0) {
    return lockedAutoFollowTargetGroup()
      .find((target) => target.note === note && !isAutoFollowTargetMatched(target)) || null;
  }

  const gridTicks = practiceGridTicks();
  const viewStartTick = state.practice.viewStartTick || 0;
  const currentBeatEnd = currentBeatStart + gridTicks;
  const candidates = (state.practice.notes || [])
    .filter((target) => (
      target.note === note &&
      target.startTick >= currentBeatStart &&
      target.startTick < currentBeatEnd
    ))
    .sort((a, b) => {
      const aInCurrentBeat = a.startTick < currentBeatEnd ? 0 : 1;
      const bInCurrentBeat = b.startTick < currentBeatEnd ? 0 : 1;
      return aInCurrentBeat - bInCurrentBeat ||
        Math.abs(a.startTick - viewStartTick) - Math.abs(b.startTick - viewStartTick) ||
        a.startTick - b.startTick;
    });
  return candidates.find((target) => !isAutoFollowTargetMatched(target)) || candidates[0] || null;
}

function beatStartForTick(tick) {
  const gridTicks = practiceGridTicks();
  return Math.floor(Math.max(0, tick) / gridTicks) * gridTicks;
}

function markPlayedTargetForBeat(beatStart, target) {
  const key = String(beatStart);
  if (!state.autoFollow.playedNotesByBeat.has(key)) {
    state.autoFollow.playedNotesByBeat.set(key, new Set());
  }
  state.autoFollow.playedNotesByBeat.get(key).add(target.id);
  state.autoFollow.correctTargetIds.add(target.id);
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
    state.rhythmFollow ||
    autoFollowBlockedByPlayback() ||
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
    autoFollowBlockedByPlayback() ||
    state.autoFollow.animating ||
    state.autoFollow.pausedAfterManualNavigation ||
    !state.practice.measures.length
  ) return;
  const beatStart = currentAutoFollowBeatStart();
  if (state.autoFollow.currentBeatStart !== beatStart) resetAutoFollowBeat(beatStart);

  if (state.autoFollowTolerance !== 0) {
    const targets = targetsForBeat(beatStart);
    if (!targets.length) {
      if (options.advanceEmptyBeat) advancePracticeGrid(1);
      return;
    }
    if (!isTargetGroupMatched(targets)) return;
    const nextGroup = nextUnmatchedTargetGroupAfterTick(beatStart + practiceGridTicks());
    if (!nextGroup.length) {
      startPracticeRunTailFinish();
      return;
    }
    if (rhythmFollowEnabled()) {
      const nextTick = Math.min(...nextGroup.map((target) => target.startTick));
      animatePracticeViewToTick(beatStart, { snap: false, durationMs: 130, resumeRhythmFollow: true, rhythmStopTick: nextTick });
      return;
    }
    advancePracticeGrid(1);
    return;
  }

  const currentGroup = lockedAutoFollowTargetGroup();
  if (!currentGroup.length) {
    if (options.advanceEmptyBeat) advancePracticeGrid(1);
    return;
  }
  if (!isTargetGroupMatched(currentGroup)) return;

  const groupEndTick = Math.max(...currentGroup.map((target) => target.startTick));
  const nextGroup = nextUnmatchedTargetGroupAfterTick(groupEndTick + 1);
  if (!nextGroup.length) {
    startPracticeRunTailFinish();
    return;
  }
  if (rhythmFollowEnabled()) {
    const alignTick = Math.min(...currentGroup.map((target) => target.startTick));
    const nextTick = Math.min(...nextGroup.map((target) => target.startTick));
    animatePracticeViewToTick(alignTick, { snap: false, durationMs: 130, resumeRhythmFollow: true, rhythmStopTick: nextTick });
    return;
  }
  const nextTick = Math.min(...nextGroup.map((target) => target.startTick));
  animatePracticeViewToTick(nextTick, { snap: false });
}

function evaluateStrictAutoFollow() {
  const currentGroup = firstTargetGroupAtOrAfterTick(state.practice.viewStartTick || 0);
  if (!currentGroup.length) {
    animatePracticeViewToTick(practiceEndTick(), { snap: false });
    return;
  }
  if (!isTargetGroupMatched(currentGroup)) return;

  const groupEndTick = Math.max(...currentGroup.map((target) => target.startTick));
  const nextGroup = nextUnmatchedTargetGroupAfterTick(groupEndTick + 1);
  if (!nextGroup.length) {
    startPracticeRunTailFinish();
    return;
  }
  const nextTick = Math.min(...nextGroup.map((target) => target.startTick));
  animatePracticeViewToTick(nextTick, { snap: false });
}

function startPracticeRunTailFinish() {
  if (!state.practice.measures.length) return;
  if (!currentInputVisualNotes().length) {
    finishPracticeRun();
    return;
  }
  state.autoFollow.finishingRun = true;
  state.autoFollow.pausedAfterManualNavigation = false;
  const tailDurationMs = Math.max(
    AUTO_FOLLOW_ANIMATION_MS,
    (practiceEndTick() - (state.practice.viewStartTick || 0)) * secondsPerPracticeTick() * 1000
  );
  animatePracticeViewToTick(practiceEndTick(), {
    snap: false,
    finishPracticeRun: true,
    durationMs: tailDurationMs,
    linear: true
  });
}

function finishPracticeRunIfReleased() {
  if (state.autoFollow.finishingRun && !currentInputVisualNotes().length) {
    finishPracticeRun();
  }
}

function finishPracticeRun() {
  if (!state.practice.measures.length) return;
  cancelAutoFollowAnimation();
  stopMeasurePlayback();
  state.practice.viewStartTick = 0;
  state.practice.currentMeasure = 0;
  state.autoFollow.finishingRun = false;
  state.autoFollow.pausedAfterManualNavigation = false;
  resetAutoFollowBeat(0, { clearPlayed: true });
  updateAll();
  scheduleAutoFollowEmptyBeatCheck();
}

function isAutoFollowTargetMatched(target) {
  const targetIds = state.autoFollow.playedNotesByBeat.get(String(beatStartForTick(target.startTick)));
  return targetIds?.has(target.id) || false;
}

function isAutoFollowTargetDisplayMatched(target) {
  if (state.autoFollowTolerance !== 0) return isAutoFollowTargetMatched(target);
  return isTargetGroupMatched(targetGroupForTarget(target));
}

function targetGroupForTarget(target) {
  const groups = autoFollowTargetGroups(targetsForBeat(beatStartForTick(target.startTick)));
  return groups.find((group) => group.some((item) => item.id === target.id)) || [target];
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
  const startTick = state.practice.viewStartTick || 0;
  const endTick = clampPracticeViewStartTick(targetTick, { snap: options.snap !== false });
  if (Math.abs(endTick - startTick) < 1) return;

  if (options.clearPlayed) {
    resetAutoFollowBeat(null, { clearPlayed: true });
  }
  if (options.pauseAutoFollow) {
    state.autoFollow.pausedAfterManualNavigation = true;
  }

  stopMeasurePlayback();
  stopRhythmFollow();
  window.cancelAnimationFrame(state.autoFollow.animationFrame);
  window.clearTimeout(state.autoFollow.emptyAdvanceTimer);
  state.autoFollow.emptyAdvanceTimer = 0;
  state.autoFollow.animating = true;
  const startedAt = performance.now();
  const durationMs = Math.max(1, Number(options.durationMs) || AUTO_FOLLOW_ANIMATION_MS);

  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = options.linear ? progress : 1 - Math.pow(1 - progress, 3);
    state.practice.viewStartTick = startTick + (endTick - startTick) * eased;
    state.practice.currentMeasure = measureIndexForTick(state.practice.viewStartTick);
    updateAll();

    if (progress < 1) {
      state.autoFollow.animationFrame = window.requestAnimationFrame(step);
      return;
    }

    state.practice.viewStartTick = endTick;
    state.practice.currentMeasure = measureIndexForTick(endTick);
    state.autoFollow.animating = false;
    resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: Boolean(options.clearPlayed) });
    if (options.finishPracticeRun) {
      finishPracticeRun();
      return;
    }
    updateAll();
    if (options.resumeRhythmFollow) {
      startRhythmFollow(options.rhythmStopTick);
      return;
    }
    scheduleAutoFollowEmptyBeatCheck();
  };

  state.autoFollow.animationFrame = window.requestAnimationFrame(step);
}

function toggleContinuousPlayback() {
  if (state.rhythmFollow && state.autoFollowMode === "beat" && !state.playback.playing) {
    if (state.autoFollow.rhythmRunning) {
      stopRhythmFollow();
    }
    syncPracticeControls();
    return;
  }
  if (state.playback.playing) {
    pauseMeasurePlayback();
    syncPracticeControls();
    return;
  }
  startContinuousPlayback();
}

async function startContinuousPlayback() {
  if (!state.practice.measures.length || state.playback.playing) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const silent = state.silentPlayback;
  const resumeFromPaused = state.playback.paused;
  const resumeTick = resumeFromPaused
    ? Math.max(0, Math.min(state.playback.currentTick || state.practice.viewStartTick || 0, maxPracticeViewStartTick()))
    : null;
  if (!silent && !AudioContextClass) {
    setStatusKey("status.playUnsupported");
    return;
  }

  stopMeasurePlayback();
  if (!silent && !state.playback.audioContext) {
    state.playback.audioContext = new AudioContextClass();
  }
  const audioContext = silent ? null : state.playback.audioContext;
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      setStatusKey("status.playUnsupported");
    }
  }
  if (audioContext && audioContext.state !== "suspended") unlockPlaybackAudio(audioContext);

  const secondsPerTick = (state.practice.microsecondsPerQuarter || 500000) / 1000000 / (state.practice.ticksPerQuarter || MIDI_PPQ);
  const audioReady = audioContext && audioContext.state !== "suspended";
  const startAt = audioReady ? audioContext.currentTime + 0.08 : 0;
  const playbackStartTick = resumeFromPaused ? resumeTick : currentAutoFollowBeatStart();
  const lastMeasure = state.practice.measures[state.practice.measures.length - 1];
  const playbackEndTick = Math.max(playbackStartTick + 1, lastMeasure?.endTick || playbackStartTick + practiceBeatTicks());
  const playbackDuration = Math.max(0.1, (playbackEndTick - playbackStartTick) * secondsPerTick);

  state.playback.playing = true;
  state.playback.paused = false;
  state.playback.activeNodes = [];
  state.playback.activeNotes = new Set();
  state.playback.activeTargetIds = new Set();
  state.playback.visualNotes = [];
  state.playback.pendingNotes = [];
  state.playback.pendingNoteIndex = 0;
  state.playback.startTick = playbackStartTick;
  state.playback.endTick = playbackEndTick;
  state.playback.currentTick = playbackStartTick;
  state.playback.silent = silent;
  state.playback.startedAtAudioTime = startAt;
  state.playback.startedAtPerformance = performance.now() + 80;
  state.playback.lastVisualFrameAt = 0;
  state.playback.visualTargetTick = null;
  state.playback.visualAnimationFromTick = playbackStartTick;
  state.playback.visualAnimationToTick = playbackStartTick;
  state.playback.visualAnimationStartedAt = 0;
  state.playback.secondsPerTick = secondsPerTick;
  state.waterfallState.lastFrameAt = 0;
  state.waterfallState.visibleStartIndex = 0;
  state.waterfallState.layoutReady = false;

  const pedalIntervals = pedalIntervalsForPlayback(playbackStartTick, playbackEndTick);
  const playbackTargets = state.practice.notes
    .filter((target) => target.endTick > playbackStartTick && target.startTick < playbackEndTick)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  const robotGroupInfo = new Map();
  targetGroupsByStartTick(playbackTargets).forEach((group) => {
    const sortedGroup = group.slice().sort((a, b) => a.note - b.note || a.startTick - b.startTick);
    sortedGroup.forEach((target, index) => {
      robotGroupInfo.set(target.id, { index, size: sortedGroup.length });
    });
  });
  playbackTargets
    .forEach((target) => {
      const groupInfo = robotGroupInfo.get(target.id) || { index: 0, size: 1 };
      const human = robotHumanizedPlayback(target, groupInfo.index, groupInfo.size, secondsPerTick);
      const audibleStartTick = Math.max(playbackStartTick, target.startTick + human.tickOffset);
      const effectiveEndTick = sustainedPlaybackEndTick(target, pedalIntervals);
      const audibleEndTick = Math.min(Math.max(effectiveEndTick, audibleStartTick + 1), playbackEndTick);
      const noteDuration = Math.max(0.08, (audibleEndTick - audibleStartTick) * secondsPerTick);
      state.playback.pendingNotes.push({
        targetId: target.id,
        note: target.note,
        velocity: target.velocity || 88,
        channel: target.channel ?? 0,
        startTick: audibleStartTick,
        duration: noteDuration,
        gain: human.gain
      });
      state.playback.visualNotes.push({
        targetId: target.id,
        note: target.note,
        startTick: audibleStartTick,
        endTick: Math.max(audibleStartTick + 1, audibleEndTick)
      });
    });
  state.playback.pendingNotes.sort((a, b) => a.startTick - b.startTick || a.note - b.note);

  animatePlaybackView();
  state.playback.stopTimer = window.setTimeout(() => {
    finishContinuousPlayback();
  }, Math.ceil((playbackDuration + 0.22) * 1000));
  syncPracticeControls();
}

function playbackVisualViewTick(playbackTick) {
  if (flowDisplayEnabled()) return playbackTick;
  if (state.robotPerformance && state.autoFollowTolerance !== 0) {
    const gridTicks = practiceGridTicks();
    const completedGridTick = clampPracticeViewStartTick(Math.floor(Math.max(0, playbackTick) / gridTicks) * gridTicks);
    if (state.playback.visualTargetTick === null) {
      state.playback.visualTargetTick = completedGridTick;
      state.playback.visualAnimationFromTick = completedGridTick;
      state.playback.visualAnimationToTick = completedGridTick;
      state.playback.visualAnimationStartedAt = performance.now();
      return completedGridTick;
    }
    if (Math.abs(completedGridTick - state.playback.visualTargetTick) >= 1) {
      state.playback.visualAnimationFromTick = state.practice.viewStartTick || state.playback.visualTargetTick;
      state.playback.visualAnimationToTick = completedGridTick;
      state.playback.visualTargetTick = completedGridTick;
      state.playback.visualAnimationStartedAt = performance.now();
    }
    const elapsed = performance.now() - state.playback.visualAnimationStartedAt;
    const progress = Math.min(1, elapsed / ROBOT_BEAT_VIEW_ANIMATION_MS);
    const eased = 1 - Math.pow(1 - progress, 3);
    return state.playback.visualAnimationFromTick +
      (state.playback.visualAnimationToTick - state.playback.visualAnimationFromTick) * eased;
  }
  return playbackTick;
}

function animatePlaybackView() {
  window.cancelAnimationFrame(state.playback.animationFrame);

  const step = () => {
    if (!state.playback.playing) return;
    const now = performance.now();
    const audioContext = state.playback.silent ? null : state.playback.audioContext;
    const performanceElapsed = Math.max(0, (now - state.playback.startedAtPerformance) / 1000);
    const audioElapsed = audioContext && audioContext.state !== "suspended"
      ? Math.max(0, audioContext.currentTime - state.playback.startedAtAudioTime)
      : 0;
    const elapsed = Math.max(performanceElapsed, audioElapsed);
    const playbackTick = state.playback.startTick + elapsed / Math.max(0.000001, state.playback.secondsPerTick);
    state.playback.currentTick = playbackTick;
    if (state.playback.silent) {
      state.playback.activeNotes = new Set();
      state.playback.activeTargetIds = new Set();
    } else {
      triggerPendingPlaybackNotes(playbackTick);
      updatePlaybackActiveNotes(playbackTick);
    }
    renderWaterfall(playbackTick);
    if (now - state.playback.lastVisualFrameAt >= PLAYBACK_VISUAL_FRAME_MS || playbackTick >= state.playback.endTick) {
      state.playback.lastVisualFrameAt = now;
      const viewTick = Math.min(maxPracticeViewStartTick(), playbackVisualViewTick(playbackTick));
      state.practice.viewStartTick = viewTick;
      state.practice.currentMeasure = measureIndexForTick(viewTick);
      updateAll();
      syncPlaybackScrubber();
    }

    if (playbackTick >= state.playback.endTick) {
      finishContinuousPlayback();
      return;
    }

    state.playback.animationFrame = window.requestAnimationFrame(step);
  };

  state.playback.animationFrame = window.requestAnimationFrame(step);
}

function finishContinuousPlayback() {
  if (!state.practice.measures.length) {
    stopMeasurePlayback();
    syncPracticeControls();
    return;
  }
  stopMeasurePlayback();
  state.practice.viewStartTick = 0;
  state.practice.currentMeasure = 0;
  resetAutoFollowBeat(0, { clearPlayed: true });
  updateAll();
  scheduleAutoFollowEmptyBeatCheck();
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
    schedulePracticeTone(audioContext, item.note, audioContext.currentTime + offsetSeconds, item.duration, state.playback.activeNodes, item.gain || 1);
    recordScheduledPlaybackNote(item, offsetSeconds);
    state.playback.pendingNoteIndex += 1;
  }
}

function recordScheduledPlaybackNote(item, offsetSeconds) {
  if (!state.recording.active || state.playback.silent) return;
  const startTimeMs = performance.now() - state.recording.startedAt + offsetSeconds * 1000;
  const durationMs = Math.max(1, Number(item.duration) * 1000 || 1);
  recordMidiEventAt("noteon", {
    note: item.note,
    velocity: item.velocity || 88,
    channel: item.channel ?? 0,
    source: "playback"
  }, startTimeMs);
  recordMidiEventAt("noteoff", {
    note: item.note,
    velocity: 0,
    channel: item.channel ?? 0,
    source: "playback"
  }, startTimeMs + durationMs);
}

function updatePlaybackActiveNotes(playbackTick) {
  const activeNotes = new Set();
  const activeTargetIds = new Set();
  state.playback.visualNotes.forEach((item) => {
    if (playbackTick >= item.startTick && playbackTick < item.endTick) {
      activeNotes.add(item.note);
      activeTargetIds.add(item.targetId);
    }
  });
  state.playback.activeNotes = activeNotes;
  state.playback.activeTargetIds = activeTargetIds;
}

function pedalIntervalsForPlayback(startTick, endTick) {
  return pedalIntervalsForView(startTick, endTick)
    .filter((interval) => interval.endTick > startTick && interval.startTick < endTick)
    .sort((a, b) => a.startTick - b.startTick || a.endTick - b.endTick);
}

function sustainedPlaybackEndTick(target, pedalIntervals) {
  let endTick = Math.max(target.endTick, target.startTick + 1);
  pedalIntervals.forEach((interval) => {
    if (!pedalIntervalAppliesToTarget(interval, target)) return;
    if (endTick >= interval.startTick && endTick <= interval.endTick) {
      endTick = Math.max(endTick, interval.endTick);
    }
  });
  return endTick;
}

function pedalIntervalAppliesToTarget(interval, target) {
  if (interval.channel === undefined || target.channel === undefined) return true;
  return interval.channel === target.channel;
}

function registerPlaybackNodes(nodes, cleanupAt, registry = state.playback.activeNodes, audioContext = state.playback.audioContext) {
  registry.push(...nodes);
  const delayMs = Math.max(120, (cleanupAt - (audioContext?.currentTime || 0) + 0.08) * 1000);
  window.setTimeout(() => {
    const nodeSet = new Set(nodes);
    nodes.forEach((node) => {
      try {
        if (typeof node.disconnect === "function") node.disconnect();
      } catch {
        // The node may already be disconnected by a manual stop.
      }
    });
    const remaining = registry.filter((node) => !nodeSet.has(node));
    registry.splice(0, registry.length, ...remaining);
  }, delayMs);
  return nodes;
}

function scheduleSimpleInstrumentTone(audioContext, note, startAt, duration, instrument, registry = state.playback.activeNodes, gainMultiplier = 1) {
  const frequency = 440 * 2 ** ((note - 69) / 12);
  const safeStartAt = Math.max(audioContext.currentTime + 0.004, startAt);
  const output = audioContext.createGain();
  output._easyPianoMasterGain = true;
  const filter = audioContext.createBiquadFilter();
  const activeNodes = [output, filter];
  const decay = Math.max(instrument.decay || 3, duration + 0.2);
  const releaseAt = safeStartAt + Math.min(decay, Math.max(0.12, duration));
  const tailEnd = safeStartAt + decay + 0.08;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(instrument.brightness || 3200, safeStartAt);
  filter.Q.setValueAtTime(instrument.id === "kalimba" ? 1.8 : 0.7, safeStartAt);
  output.gain.setValueAtTime(0.0001, safeStartAt);
  output.gain.linearRampToValueAtTime((instrument.gain || 0.18) * gainMultiplier, safeStartAt + (instrument.attack || 0.01));
  output.gain.exponentialRampToValueAtTime(0.0001, Math.max(releaseAt + 0.04, tailEnd));

  instrument.partials.forEach((partial, index) => {
    if (frequency * partial > audioContext.sampleRate * 0.42) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = instrument.wave || "sine";
    oscillator.frequency.setValueAtTime(frequency * partial, safeStartAt);
    gain.gain.setValueAtTime(instrument.levels[index] || 0.1, safeStartAt);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(safeStartAt);
    oscillator.stop(tailEnd);
    activeNodes.push(oscillator, gain);
  });

  output.connect(filter);
  filter.connect(audioContext.destination);
  return registerPlaybackNodes(activeNodes, tailEnd, registry, audioContext);
}

function schedulePracticeTone(audioContext, note, startAt, duration, registry = state.playback.activeNodes, gainMultiplier = 1) {
  const instrument = currentPlaybackInstrument();
  if (!instrument.custom) {
    return scheduleSimpleInstrumentTone(audioContext, note, startAt, duration, instrument, registry, gainMultiplier);
  }

  const frequency = 440 * 2 ** ((note - 69) / 12);
  const safeStartAt = Math.max(audioContext.currentTime + 0.004, startAt);
  const isLowNote = note < 52;
  const isHighNote = note >= 72;
  const bodyLevel = isLowNote ? 0.26 : isHighNote ? 0.095 : 0.19;
  const sustainTime = Math.min(Math.max(0.18, duration), isHighNote ? 0.98 : isLowNote ? 2.25 : 1.72);
  const releaseAt = safeStartAt + sustainTime;
  const tailSeconds = isHighNote ? 0.58 : isLowNote ? 1.16 : 0.92;
  const tailEnd = releaseAt + tailSeconds;
  const output = audioContext.createGain();
  output._easyPianoMasterGain = true;
  const toneFilter = audioContext.createBiquadFilter();
  const bodyFilter = audioContext.createBiquadFilter();
  const attackClick = audioContext.createBufferSource();
  const clickGain = audioContext.createGain();
  const clickFilter = audioContext.createBiquadFilter();
  const activeNodes = [output, toneFilter, bodyFilter, attackClick, clickGain, clickFilter];

  const clickBuffer = audioContext.createBuffer(1, Math.max(1, Math.floor(audioContext.sampleRate * 0.016)), audioContext.sampleRate);
  const clickData = clickBuffer.getChannelData(0);
  for (let index = 0; index < clickData.length; index += 1) {
    const fade = 1 - index / clickData.length;
    clickData[index] = (Math.random() * 2 - 1) * fade * fade * fade;
  }

  toneFilter.type = "lowpass";
  toneFilter.frequency.setValueAtTime(Math.min(isHighNote ? 4200 : 6900, frequency * (isHighNote ? 4.8 : 8.8)), safeStartAt);
  toneFilter.frequency.exponentialRampToValueAtTime(Math.max(isHighNote ? 920 : 780, frequency * (isHighNote ? 2.0 : 3.35)), releaseAt + tailSeconds * 0.6);
  toneFilter.Q.setValueAtTime(isHighNote ? 0.28 : 0.36, safeStartAt);

  bodyFilter.type = "peaking";
  bodyFilter.frequency.setValueAtTime(isLowNote ? 165 : isHighNote ? 390 : 285, safeStartAt);
  bodyFilter.Q.setValueAtTime(isLowNote ? 0.72 : 0.88, safeStartAt);
  bodyFilter.gain.setValueAtTime(isLowNote ? 4.5 : isHighNote ? 0.8 : 3.0, safeStartAt);

  output.gain.setValueAtTime(0.0001, safeStartAt);
  output.gain.exponentialRampToValueAtTime((isHighNote ? 0.095 : 0.158) * gainMultiplier, safeStartAt + 0.006);
  output.gain.exponentialRampToValueAtTime((isHighNote ? 0.047 : 0.09) * gainMultiplier, safeStartAt + 0.13);
  output.gain.exponentialRampToValueAtTime((isHighNote ? 0.017 : 0.038) * gainMultiplier, releaseAt);
  output.gain.exponentialRampToValueAtTime(0.0001, tailEnd);

  const partials = [
    { ratio: 1, gain: 0.82, decay: sustainTime + tailSeconds * 0.82, type: "triangle", detune: -1.5 },
    { ratio: 1.0015, gain: 0.26, decay: sustainTime + tailSeconds * 0.62, type: "sine", detune: 2.2 },
    { ratio: 2.003, gain: isHighNote ? 0.045 : 0.16, decay: isHighNote ? 0.38 : 0.68, type: "sine", detune: -0.8 },
    { ratio: 3.008, gain: isHighNote ? 0.018 : 0.088, decay: isHighNote ? 0.2 : 0.4, type: "sine", detune: 1.2 },
    { ratio: 4.016, gain: isHighNote ? 0.007 : 0.035, decay: isHighNote ? 0.12 : 0.25, type: "sine", detune: 0 },
    { ratio: 6.02, gain: isHighNote ? 0.0025 : 0.012, decay: isHighNote ? 0.08 : 0.14, type: "sine", detune: 0 }
  ];

  partials.forEach((partial) => {
    if (frequency * partial.ratio > audioContext.sampleRate * 0.42) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = partial.type;
    oscillator.frequency.setValueAtTime(frequency * partial.ratio, safeStartAt);
    oscillator.detune.setValueAtTime(partial.detune || 0, safeStartAt);
    gain.gain.setValueAtTime(0.0001, safeStartAt);
    gain.gain.exponentialRampToValueAtTime(partial.gain, safeStartAt + 0.006);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, partial.gain * 0.34), safeStartAt + Math.min(0.18, partial.decay * 0.32));
    gain.gain.exponentialRampToValueAtTime(0.0001, safeStartAt + partial.decay);
    oscillator.connect(gain);
    gain.connect(toneFilter);
    oscillator.start(safeStartAt);
    oscillator.stop(tailEnd + 0.02);
    activeNodes.push(oscillator, gain);
  });

  if (!isHighNote && frequency * 0.5 > 24) {
    const bodyOscillator = audioContext.createOscillator();
    const bodyGain = audioContext.createGain();
    bodyOscillator.type = "sine";
    bodyOscillator.frequency.setValueAtTime(frequency * 0.5, safeStartAt);
    bodyGain.gain.setValueAtTime(0.0001, safeStartAt);
    bodyGain.gain.exponentialRampToValueAtTime(bodyLevel, safeStartAt + 0.018);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, safeStartAt + Math.min(tailSeconds, 0.9));
    bodyOscillator.connect(bodyGain);
    bodyGain.connect(toneFilter);
    bodyOscillator.start(safeStartAt);
    bodyOscillator.stop(tailEnd + 0.02);
    activeNodes.push(bodyOscillator, bodyGain);
  }

  attackClick.buffer = clickBuffer;
  clickFilter.type = "bandpass";
  clickFilter.frequency.setValueAtTime(isHighNote ? 1850 : 1600, safeStartAt);
  clickFilter.Q.setValueAtTime(0.65, safeStartAt);
  clickGain.gain.setValueAtTime(isHighNote ? 0.004 : 0.014, safeStartAt);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, safeStartAt + 0.012);
  attackClick.connect(clickGain);
  clickGain.connect(clickFilter);
  clickFilter.connect(toneFilter);

  toneFilter.connect(bodyFilter);
  bodyFilter.connect(output);
  output.connect(audioContext.destination);
  attackClick.start(safeStartAt);
  attackClick.stop(safeStartAt + 0.02);
  return registerPlaybackNodes(activeNodes, tailEnd + 0.02, registry, audioContext);
}

function unlockPlaybackAudio(audioContext, registry = state.playback.activeNodes) {
  try {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.025);
    registerPlaybackNodes([oscillator, gain], now + 0.04, registry, audioContext);
  } catch {
    // Some older browsers are picky about audio warmup; playback can still try normally.
  }
}

async function ensureLiveAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    setStatusKey("status.playUnsupported");
    state.liveInputSound = false;
    syncControlsFromState();
    saveSettings();
    return null;
  }
  if (!state.liveAudio.audioContext) {
    state.liveAudio.audioContext = new AudioContextClass();
  }
  const audioContext = state.liveAudio.audioContext;
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  unlockPlaybackAudio(audioContext, state.liveAudio.activeNodes);
  return audioContext;
}

function stopAudioNodes(nodes, registry, options = {}) {
  const nodeSet = new Set(nodes || []);
  const fadeSeconds = Math.max(0, Number(options.fadeSeconds) || 0);
  if (fadeSeconds > 0) {
    const audioContext = [...nodeSet].find((node) => node?.context)?.context;
    const now = audioContext?.currentTime || 0;
    const gainNodes = [...nodeSet].filter((node) => node?.gain);
    const fadeTargets = gainNodes.some((node) => node._easyPianoMasterGain)
      ? gainNodes.filter((node) => node._easyPianoMasterGain)
      : gainNodes;
    fadeTargets.forEach((node) => {
      try {
        if (typeof node.gain.cancelAndHoldAtTime === "function") {
          node.gain.cancelAndHoldAtTime(now);
        } else {
          const value = Math.max(0.0001, Number(node.gain.value) || 0.0001);
          node.gain.cancelScheduledValues(now);
          node.gain.setValueAtTime(value, now);
        }
        node.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
      } catch {
        // Audio params may already be detached.
      }
    });
    nodeSet.forEach((node) => {
      try {
        if (typeof node?.stop === "function") node.stop(now + fadeSeconds + 0.04);
      } catch {
        // Audio nodes may already be stopped.
      }
    });
    window.setTimeout(() => {
      nodeSet.forEach((node) => {
        try {
          if (typeof node?.disconnect === "function") node.disconnect();
        } catch {
          // Audio nodes may already be disconnected.
        }
      });
      if (registry) {
        const remaining = registry.filter((node) => !nodeSet.has(node));
        registry.splice(0, registry.length, ...remaining);
      }
    }, Math.ceil((fadeSeconds + 0.08) * 1000));
    return;
  }

  nodeSet.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    } catch {
      // Audio nodes may already be stopped.
    }
  });
  if (registry) {
    const remaining = registry.filter((node) => !nodeSet.has(node));
    registry.splice(0, registry.length, ...remaining);
  }
}

function startLiveInputTone(note, velocity = 96) {
  if (!state.liveInputSound) return;
  const audioContext = state.liveAudio.audioContext;
  if (!audioContext || audioContext.state === "suspended") {
    ensureLiveAudioContext().then(() => {
      if (state.liveInputSound && state.activeNotes.has(note)) startLiveInputTone(note, velocity);
    }).catch(() => {
      setStatusKey("status.playUnsupported");
    });
    return;
  }

  stopLiveInputTone(note, 0.04);
  const startedAt = audioContext.currentTime + 0.004;
  const nodes = schedulePracticeTone(
    audioContext,
    note,
    startedAt,
    LIVE_INPUT_TONE_SECONDS,
    state.liveAudio.activeNodes
  ) || [];
  state.liveAudio.notes.set(note, { nodes, velocity, startedAt });
}

function stopLiveInputTone(note, fadeSeconds = LIVE_INPUT_RELEASE_FADE_SECONDS) {
  const item = state.liveAudio.notes.get(note);
  if (!item) return;
  stopAudioNodes(item.nodes, state.liveAudio.activeNodes, { fadeSeconds });
  state.liveAudio.notes.delete(note);
}

function stopReleasedLiveInputTones(notes) {
  notes.forEach((note) => stopLiveInputTone(note, SUSTAIN_PEDAL_RELEASE_FADE_SECONDS));
}

function stopAllLiveInputTones() {
  state.liveAudio.notes.clear();
  stopAudioNodes(state.liveAudio.activeNodes, state.liveAudio.activeNodes);
}

function stopMeasurePlayback() {
  stopRhythmFollow();
  window.cancelAnimationFrame(state.playback.animationFrame);
  state.playback.animationFrame = 0;
  if (state.playback.stopTimer) {
    window.clearTimeout(state.playback.stopTimer);
    state.playback.stopTimer = 0;
  }
  stopPlaybackAudioNodes();
  state.playback.activeNotes = new Set();
  state.playback.activeTargetIds = new Set();
  state.playback.visualNotes = [];
  state.playback.pendingNotes = [];
  state.playback.pendingNoteIndex = 0;
  state.playback.visualTargetTick = null;
  state.playback.visualAnimationFromTick = 0;
  state.playback.visualAnimationToTick = 0;
  state.playback.visualAnimationStartedAt = 0;
  state.playback.currentTick = 0;
  state.playback.playing = false;
  state.playback.paused = false;
  state.playback.silent = false;
  syncWaterfallVisibility();
  updateKeyboardActive();
  syncCurrentChord();
}

function pauseMeasurePlayback() {
  const pausedTick = Number.isFinite(state.playback.currentTick)
    ? state.playback.currentTick
    : (state.practice.viewStartTick || state.playback.startTick || 0);
  window.cancelAnimationFrame(state.playback.animationFrame);
  state.playback.animationFrame = 0;
  if (state.playback.stopTimer) {
    window.clearTimeout(state.playback.stopTimer);
    state.playback.stopTimer = 0;
  }
  stopPlaybackAudioNodes();
  state.playback.activeNotes = new Set();
  state.playback.activeTargetIds = new Set();
  state.playback.currentTick = pausedTick;
  state.playback.playing = false;
  state.playback.paused = true;
  syncWaterfallVisibility();
  renderWaterfall(pausedTick, { force: true });
  updateAll();
}

function stopPlaybackAudioNodes() {
  stopAudioNodes(state.playback.activeNodes, state.playback.activeNodes);
}

function keySignatureFromFifths(fifths) {
  const rounded = Math.max(-7, Math.min(7, Math.round(Number(fifths) || 0)));
  return KEY_SIGNATURE_BY_FIFTHS[String(rounded)] || "C";
}

function signedMidiByte(value) {
  const byte = Number(value) & 0xff;
  return byte > 127 ? byte - 256 : byte;
}

function primaryTempoMicroseconds(events, fallback = 500000) {
  const tempos = (events || [])
    .filter((event) => Number.isFinite(event.microsecondsPerQuarter) && event.microsecondsPerQuarter > 0)
    .sort((a, b) => (a.tick || 0) - (b.tick || 0));
  return tempos[0]?.microsecondsPerQuarter || fallback;
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
  const keySignatureEvents = [];
  const tempoEvents = [];
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
    keySignatureEvents.push(...trackResult.keySignatureEvents);
    tempoEvents.push(...trackResult.tempoEvents);
    if (trackResult.timeSignature) timeSignature = trackResult.timeSignature;
    if (trackResult.microsecondsPerQuarter) microsecondsPerQuarter = trackResult.microsecondsPerQuarter;
    reader.position = trackEnd;
  }
  microsecondsPerQuarter = primaryTempoMicroseconds(tempoEvents, microsecondsPerQuarter);
  const sortedKeySignatureEvents = normalizedMidiKeySignatureEvents(keySignatureEvents);
  const keySignature = sortedKeySignatureEvents[0]?.keySignature || null;

  const notes = noteEvents
    .filter((item) => item.note >= MIDI_MIN && item.note <= MIDI_MAX)
    .sort((a, b) => a.startTick - b.startTick || a.note - b.note);
  if (notes.length) {
    const lastNoteTick = Math.max(...notes.map((note) => Math.max(note.endTick, note.startTick + 1)));
    timeSignature = primaryMidiTimeSignature(timeSignatureEvents, lastNoteTick, timeSignature, ticksPerQuarter);
  }
  if (!notes.length) {
    const measureTicks = measureTicksForTimeSignature(timeSignature, ticksPerQuarter);
    return { measures: [], pedalEvents, ticksPerQuarter, measureTicks, timeSignature, timeSignatureEvents: [], keySignatureEvents: sortedKeySignatureEvents, keySignature, microsecondsPerQuarter, format };
  }
  const trackRoles = trackRolesForNotes(notes);

  const lastTick = Math.max(...notes.map((note) => Math.max(note.endTick, note.startTick + 1)));
  const signatureEvents = normalizedMidiTimeSignatureEvents(timeSignatureEvents, lastTick, timeSignature, ticksPerQuarter);
  timeSignature = signatureEvents[0]?.timeSignature || timeSignature;
  const measureTicks = measureTicksForTimeSignature(timeSignature, ticksPerQuarter);
  const measures = buildMidiMeasuresFromTimeSignatures(notes, signatureEvents, lastTick, trackRoles, ticksPerQuarter);

  return {
    measures,
    notes: measures.flatMap((measure) => measure.notes),
    pedalEvents: pedalEvents.sort((a, b) => a.tick - b.tick || a.value - b.value),
    ticksPerQuarter,
    measureTicks,
    timeSignature,
    timeSignatureEvents: signatureEvents.map((event) => ({ tick: event.tick, ...event.timeSignature })),
    keySignatureEvents: sortedKeySignatureEvents,
    keySignature,
    microsecondsPerQuarter,
    format,
    variableMeasures: signatureEvents.length > 1
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
  const keySignature = readFirstMusicXmlKey(parts[0]);
  const microsecondsPerQuarter = microsecondsFromBpm(readFirstMusicXmlTempo(parts) || 120);
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
    keySignatureEvents: keySignature ? [{ tick: 0, keySignature }] : [],
    keySignature,
    microsecondsPerQuarter,
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

function readFirstMusicXmlKey(partNode) {
  const firstMeasure = childByLocalName(partNode, "measure");
  const attributes = childByLocalName(firstMeasure, "attributes");
  const keyNode = childByLocalName(attributes, "key");
  const fifthsText = childText(keyNode, "fifths");
  if (fifthsText === "") return null;
  return keySignatureFromFifths(Number(fifthsText));
}

function readFirstMusicXmlTempo(parts) {
  for (const part of parts) {
    for (const measure of childrenByLocalName(part, "measure")) {
      const soundNode = childrenByLocalName(measure, "sound").find((node) => node.getAttribute("tempo"));
      const soundTempo = Number(soundNode?.getAttribute("tempo"));
      if (Number.isFinite(soundTempo) && soundTempo > 0) return Math.round(soundTempo);

      for (const direction of childrenByLocalName(measure, "direction")) {
        const directionSound = childByLocalName(direction, "sound");
        const directionTempo = Number(directionSound?.getAttribute("tempo"));
        if (Number.isFinite(directionTempo) && directionTempo > 0) return Math.round(directionTempo);

        const directionType = childByLocalName(direction, "direction-type");
        const metronome = childByLocalName(directionType, "metronome");
        const perMinute = Number(childText(metronome, "per-minute"));
        if (Number.isFinite(perMinute) && perMinute > 0) return Math.round(perMinute);
      }
    }
  }
  return null;
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
  return normalizedMidiTimeSignatureEvents(events, lastTick, fallback, ticksPerQuarter)[0]?.timeSignature || fallback || { numerator: 4, denominator: 4 };
}

function normalizedMidiTimeSignatureEvents(events, lastTick, fallback, ticksPerQuarter) {
  const signatures = (events || [])
    .filter((event) => event.numerator > 0 && event.denominator > 0)
    .sort((a, b) => a.tick - b.tick || a.numerator - b.numerator || a.denominator - b.denominator)
    .map((event) => ({ tick: Math.max(0, event.tick || 0), timeSignature: { numerator: event.numerator, denominator: event.denominator } }));
  if (!signatures.length) return [{ tick: 0, timeSignature: fallback || { numerator: 4, denominator: 4 } }];

  const scoreBySignature = new Map();
  signatures.forEach((event, index) => {
    const nextTick = signatures[index + 1]?.tick ?? Math.max(lastTick, event.tick + 1);
    const span = Math.max(1, nextTick - event.tick);
    const key = timeSignatureKey(event.timeSignature);
    scoreBySignature.set(key, (scoreBySignature.get(key) || 0) + span);
  });

  const best = [...scoreBySignature.entries()]
    .sort((a, b) => b[1] - a[1] || measureTicksForTimeSignature(parseTimeSignatureKey(b[0]), ticksPerQuarter) - measureTicksForTimeSignature(parseTimeSignatureKey(a[0]), ticksPerQuarter))[0]?.[0];
  const selected = best ? parseTimeSignatureKey(best) : fallback;
  const selectedMeasureTicks = measureTicksForTimeSignature(selected, ticksPerQuarter);
  if (selectedMeasureTicks < ticksPerQuarter * 2 && lastTick > selectedMeasureTicks * 24) {
    return [{ tick: 0, timeSignature: { numerator: 4, denominator: 4 } }];
  }
  if (signatures[0].tick > 0) {
    signatures.unshift({ tick: 0, timeSignature: fallback || selected || { numerator: 4, denominator: 4 } });
  }
  return signatures;
}

function normalizedMidiKeySignatureEvents(events, fallback = null) {
  const signatures = (events || [])
    .map((event, order) => ({ ...event, order }))
    .filter((event) => MAJOR_KEY_SIGNATURES[event.keySignature])
    .map((event) => ({
      tick: Math.max(0, Number(event.tick) || 0),
      fifths: Number.isFinite(event.fifths) ? event.fifths : undefined,
      mode: Number.isFinite(event.mode) ? event.mode : undefined,
      keySignature: event.keySignature,
      order: event.order
    }))
    .sort((a, b) => a.tick - b.tick || a.order - b.order);
  const normalized = [];
  signatures.forEach((event) => {
    const cleanEvent = {
      tick: event.tick,
      fifths: event.fifths,
      mode: event.mode,
      keySignature: event.keySignature
    };
    const previous = normalized[normalized.length - 1];
    if (previous && previous.tick === event.tick) {
      normalized[normalized.length - 1] = cleanEvent;
      return;
    }
    if (previous && previous.keySignature === event.keySignature) return;
    normalized.push(cleanEvent);
  });
  if (!normalized.length && fallback && MAJOR_KEY_SIGNATURES[fallback]) {
    return [{ tick: 0, keySignature: fallback }];
  }
  if (normalized.length && normalized[0].tick > 0) {
    const initial = fallback && MAJOR_KEY_SIGNATURES[fallback] ? fallback : normalized[0].keySignature;
    normalized.unshift({ tick: 0, keySignature: initial });
  }
  return normalized;
}

function buildMidiMeasuresFromTimeSignatures(notes, signatureEvents, lastTick, trackRoles, ticksPerQuarter) {
  const measures = [];
  const sortedEvents = signatureEvents.length ? signatureEvents : [{ tick: 0, timeSignature: { numerator: 4, denominator: 4 } }];
  sortedEvents.forEach((event, index) => {
    const segmentStart = event.tick;
    const segmentEnd = Math.max(segmentStart + 1, sortedEvents[index + 1]?.tick ?? lastTick);
    const measureTicks = measureTicksForTimeSignature(event.timeSignature, ticksPerQuarter);
    for (let startTick = segmentStart; startTick < segmentEnd; startTick += measureTicks) {
      measures.push({
        index: measures.length,
        startTick,
        endTick: Math.min(segmentEnd, startTick + measureTicks),
        measureTicks,
        timeSignature: event.timeSignature,
        notes: []
      });
    }
  });

  notes.forEach((note, index) => {
    const measureIndex = measures.findIndex((measure) => note.startTick >= measure.startTick && note.startTick < measure.endTick);
    const safeIndex = measureIndex >= 0 ? measureIndex : Math.max(0, measures.length - 1);
    measures[safeIndex].notes.push({
      ...note,
      trackRole: trackRoles.get(note.trackIndex) || "primary",
      id: `${safeIndex}-${index}-${note.note}-${note.startTick}`
    });
  });

  return measures;
}

function parseMidiTrack(bytes, start, end) {
  const reader = makeMidiReader(bytes, start);
  const activeNotes = new Map();
  const notes = [];
  const pedalEvents = [];
  const timeSignatureEvents = [];
  const keySignatureEvents = [];
  const tempoEvents = [];
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
        tempoEvents.push({ tick, microsecondsPerQuarter });
        reader.skip(length - 3);
      } else if (type === 0x59 && length >= 2) {
        const fifths = signedMidiByte(reader.readUint8());
        const mode = reader.readUint8();
        keySignatureEvents.push({ tick, fifths, mode, keySignature: keySignatureFromFifths(fifths) });
        reader.skip(length - 2);
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

  return { notes, pedalEvents, timeSignature, timeSignatureEvents, keySignatureEvents, tempoEvents, microsecondsPerQuarter };
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
  const safeEvents = closeOpenRecordingPedals(events);

  pushVarLen(track, 0);
  track.push(0xff, 0x51, 0x03, (microsecondsPerQuarter >> 16) & 0xff, (microsecondsPerQuarter >> 8) & 0xff, microsecondsPerQuarter & 0xff);

  safeEvents
    .slice()
    .sort((a, b) => a.timeMs - b.timeMs)
    .forEach((event) => {
      const exportTimeMs = Math.max(0, Number(event.timeMs) || 0) + RECORDING_LEAD_IN_MS;
      const tick = Math.max(previousTick, Math.round(exportTimeMs * MIDI_PPQ * RECORDING_BPM / 60000));
      pushVarLen(track, tick - previousTick);
      previousTick = tick;
      const channel = clampMidiChannel(event.channel);
      if (event.type === "noteon") {
        track.push(0x90 | channel, clampMidiByte(event.note), clampMidiByte(event.velocity || 96));
      } else if (event.type === "noteoff") {
        track.push(0x80 | channel, clampMidiByte(event.note), clampMidiByte(event.velocity || 0));
      } else if (event.type === "cc") {
        track.push(0xb0 | channel, clampMidiByte(event.controller), clampMidiByte(event.value));
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

function closeOpenRecordingPedals(events) {
  const result = events.slice();
  const sustainByChannel = new Map();
  result.forEach((event) => {
    if (event.type !== "cc" || event.controller !== 64) return;
    sustainByChannel.set(event.channel ?? 0, event.value >= 64);
  });

  const lastTimeMs = result.reduce((max, event) => Math.max(max, Number(event.timeMs) || 0), 0);
  sustainByChannel.forEach((isDown, channel) => {
    if (!isDown) return;
    result.push({
      type: "cc",
      controller: 64,
      value: 0,
      channel,
      timeMs: lastTimeMs + 1
    });
  });
  return result;
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

function clampMidiChannel(value) {
  return Math.max(0, Math.min(15, Number(value) || 0));
}

function updateAll() {
  syncControlsFromState();
  if (state.waterfall) {
    syncWaterfallVisibility();
    const tick = state.playback.currentTick || state.practice.viewStartTick || 0;
    renderWaterfall(tick, { force: true });
  } else {
    drawStaff();
  }
  updateKeyboardActive();
  syncCurrentChord();
  syncPracticeControls();
}

function updateKeyboardActive() {
  const cueNoteSet = keyboardCueNotes();
  els.keyboardBoard?.classList.toggle("paused-scroll", state.playback.paused);
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    const note = Number(key.dataset.note);
    const inputHeld = isInputNoteVisuallyHeld(note);
    const active = inputHeld || state.playback.activeNotes.has(note);
    const cue = cueNoteSet.has(note);
    const wrong = Boolean(state.activeNotes.get(note)?.wrong);
    key.classList.toggle("active", active);
    key.classList.toggle("input-active", inputHeld && !cueNoteSet.has(note));
    key.classList.toggle("cue", cue);
    key.classList.toggle("wrong", wrong);
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
  const channel = status & 0x0f;

  if (command === 0x90 && value > 0) {
    pressNote(note, value, "midi", channel);
    return;
  }

  if (command === 0x80 || (command === 0x90 && value === 0)) {
    releaseNote(note, "midi", channel);
    return;
  }

  if (command === 0xb0 && note === 64) {
    recordMidiEvent("cc", { controller: 64, value, channel });
    const pressed = value >= 64;
    const wasDown = state.sustainDown;
    if (pressed && !wasDown) state.chordPedalEpoch += 1;
    state.sustainDown = pressed;
    state.sustainChannel = channel;
    if (!state.sustainDown) releaseSustainedNotes();
    updateAll();
    return;
  }

  if (command === 0xb0 && isLeftPedalControl(note)) {
    recordMidiEvent("cc", { controller: note, value, channel });
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
  },
  setPurchaseState(data) {
    setFullUnlockState(Boolean(data?.unlocked));
  },
  setPurchaseError(data) {
    const code = data?.code || "";
    if (code === "cancelled") {
      setStatusKey("status.purchaseCancelled");
      return;
    }
    setStatusKey("status.purchaseFailed", { message: data?.message || code || "unknown" });
  }
};

function setStatus(text) {
  state.statusMessage = null;
  els.statusText.textContent = text;
  setStatusTone("info");
}

function setupPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(APP_VERSION)}`).catch(() => {
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
  setupClickPagingSurface(els.scoreBoard);
  setupClickPagingSurface(els.waterfallBoard);
}

function setupPausedKeyboardScroll() {
  if (!els.keyboardBoard) return;
  els.keyboardBoard.addEventListener("pointerdown", (event) => {
    if (!state.playback.paused || !event.isPrimary) return;
    state.keyboardScrollPointer = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: els.keyboardBoard.scrollLeft,
      moved: false
    };
    els.keyboardBoard.setPointerCapture?.(event.pointerId);
  });

  els.keyboardBoard.addEventListener("pointermove", (event) => {
    if (!state.keyboardScrollPointer.active || event.pointerId !== state.keyboardScrollPointer.pointerId) return;
    const dx = event.clientX - state.keyboardScrollPointer.startX;
    if (Math.abs(dx) > 3) state.keyboardScrollPointer.moved = true;
    els.keyboardBoard.scrollLeft = state.keyboardScrollPointer.startScrollLeft - dx;
    syncWaterfallScroll();
    event.preventDefault();
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    els.keyboardBoard.addEventListener(eventName, (event) => {
      if (event.pointerId !== state.keyboardScrollPointer.pointerId) return;
      state.keyboardScrollPointer.active = false;
    });
  });
}

function setupClickPagingSurface(surface) {
  if (!surface) return;
  surface.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.target.closest("button")) return;
    state.scorePointer = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      surface
    };
  });

  surface.addEventListener("pointerup", (event) => {
    handleScoreClickEnd(event);
  });
  surface.addEventListener("pointercancel", () => {
    state.scorePointer.active = false;
  });
}

function handleScoreClickEnd(event) {
  if (!state.scorePointer.active || event.pointerId !== state.scorePointer.pointerId) return;
  const dx = event.clientX - state.scorePointer.startX;
  const dy = event.clientY - state.scorePointer.startY;
  state.scorePointer.active = false;

  if (Math.abs(dx) > 14 || Math.abs(dy) > 14) return;
  const surface = state.scorePointer.surface || els.scoreBoard;
  const rect = surface.getBoundingClientRect();
  const direction = event.clientX < rect.left + rect.width / 2 ? -1 : 1;
  advancePracticeGrid(direction, { clearPlayed: true, pauseAutoFollow: true });
}

function setupHardwarePedalKeys() {
  const handleKeyEvent = (event) => {
    const target = event.target;
    if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.type !== "keydown") return;
    if (handleHardwarePedalInput({ key: event.key, code: event.code })) {
      event.preventDefault();
    }
  };

  window.addEventListener("keydown", handleKeyEvent);
}

function handleHardwarePedalInput(data) {
  const key = String(data?.key || "");
  const code = String(data?.code || "");
  if (key === "ArrowLeft" || code === "ArrowLeft") {
    advancePracticeGrid(-1, { clearPlayed: true, pauseAutoFollow: true });
    return true;
  }
  if (key === "ArrowRight" || code === "ArrowRight") {
    advancePracticeGrid(1, { clearPlayed: true, pauseAutoFollow: true });
    return true;
  }
  if (key === " " || key === "Spacebar" || code === "Space") {
    toggleContinuousPlayback();
    return true;
  }
  return false;
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

function setupTempoStepButton(button, delta) {
  if (!button) return;
  let holdDelay = 0;
  let holdInterval = 0;
  let didHold = false;

  const clearHold = () => {
    window.clearTimeout(holdDelay);
    window.clearInterval(holdInterval);
    holdDelay = 0;
    holdInterval = 0;
  };

  button.addEventListener("pointerdown", (event) => {
    if (button.disabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    didHold = false;
    clearHold();
    holdDelay = window.setTimeout(() => {
      didHold = true;
      adjustPracticeTempo(delta);
      holdInterval = window.setInterval(() => {
        if (button.disabled) {
          clearHold();
          return;
        }
        adjustPracticeTempo(delta);
      }, 90);
    }, 350);
  });

  ["pointerup", "pointercancel", "pointerleave", "blur"].forEach((eventName) => {
    button.addEventListener(eventName, clearHold);
  });

  button.addEventListener("click", (event) => {
    if (didHold) {
      event.preventDefault();
      event.stopPropagation();
      didHold = false;
      return;
    }
    adjustPracticeTempo(delta);
  });
}

function setupEvents() {
  els.connectButton.addEventListener("click", connectMidi);
  els.recordButton.addEventListener("click", startRecording);
  els.stopRecordButton.addEventListener("click", stopRecording);
  els.discardRecordButton.addEventListener("click", discardAndRestartRecording);
  els.loadMidiButton.addEventListener("click", handleLoadScoreClick);
  els.trialScoreCloseButton.addEventListener("click", closeTrialScoreModal);
  els.unlockFullButton.addEventListener("click", purchaseFullUnlock);
  els.restorePurchaseButton.addEventListener("click", restoreFullUnlock);
  els.trialScoreModal.addEventListener("click", (event) => {
    if (event.target === els.trialScoreModal) closeTrialScoreModal();
  });
  els.trialScoreList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-trial-score]");
    if (button) loadTrialScore(button.dataset.trialScore);
  });
  els.exportPdfButton.addEventListener("click", exportScorePdf);
  els.pdfExportRoot.addEventListener("click", (event) => {
    if (event.target.closest("[data-export-print]")) {
      printExportPreview();
      return;
    }
    if (event.target.closest("[data-export-close]")) {
      closeExportPreview();
    }
  });
  els.midiFileInput.addEventListener("change", () => loadScoreFile(els.midiFileInput.files[0]));
  els.startMeasureButton.addEventListener("click", goToPracticeStart);
  els.playMeasureButton.addEventListener("click", toggleContinuousPlayback);
  els.saveTempoButton.addEventListener("click", saveTempoAdjustedMidi);
  els.mistakeLogList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-mistake-remove]");
    if (removeButton) {
      event.stopPropagation();
      removeMistake(Number(removeButton.dataset.mistakeRemove));
      return;
    }
    const button = event.target.closest("[data-mistake-id]");
    if (!button) return;
    jumpToMistake(Number(button.dataset.mistakeId));
  });
  setupTempoStepButton(els.tempoDownButton, -1);
  setupTempoStepButton(els.tempoUpButton, 1);
  els.silentPlaybackToggle.addEventListener("change", () => {
    state.silentPlayback = els.silentPlaybackToggle.checked;
    syncControlsFromState();
    saveSettings();
  });
  els.playbackInstrumentSelect.addEventListener("change", () => {
    state.playbackInstrument = playbackInstrumentId(els.playbackInstrumentSelect.value) || "kalimba";
    syncControlsFromState();
    saveSettings();
  });
  els.liveSoundToggle.addEventListener("change", async () => {
    state.liveInputSound = els.liveSoundToggle.checked;
    if (state.liveInputSound) {
      await ensureLiveAudioContext();
    } else {
      stopAllLiveInputTones();
    }
    syncControlsFromState();
    saveSettings();
  });
  els.robotPerformanceToggle.addEventListener("change", () => {
    state.robotPerformance = els.robotPerformanceToggle.checked;
    syncControlsFromState();
    saveSettings();
  });
  els.waterfallToggle.addEventListener("change", () => {
    state.waterfall = els.waterfallToggle.checked;
    syncControlsFromState();
    syncWaterfallVisibility();
    syncWaterfallLayout();
    renderWaterfall(state.playback.currentTick || state.practice.viewStartTick || 0, { force: true });
    drawStaff();
    saveSettings();
  });
  els.playbackSlider.addEventListener("input", () => {
    seekPracticeView(els.playbackSlider.value);
  });
  els.keyboard.parentElement.addEventListener("scroll", syncWaterfallScroll, { passive: true });
  els.fullscreenButton.addEventListener("click", toggleFullscreen);
  els.refreshButton.addEventListener("click", forceRefreshApp);
  const unlockLiveInputAudio = () => {
    if (
      state.liveInputSound &&
      (!state.liveAudio.audioContext || state.liveAudio.audioContext.state === "suspended")
    ) {
      ensureLiveAudioContext().catch(() => setStatusKey("status.playUnsupported"));
    }
  };
  window.addEventListener("pointerdown", unlockLiveInputAudio, { passive: true });
  window.addEventListener("keydown", unlockLiveInputAudio, { passive: true });
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
      state.practice.keySignatureEvents = [];
      syncControlsFromState();
      saveSettings();
      drawStaff();
      syncCurrentChord();
    });
  });
  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.noteLabelMode = button.dataset.labelMode;
      syncControlsFromState();
      saveSettings();
      drawStaff();
      syncCurrentChord();
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
      if (state.autoFollowMode !== "beat") state.rhythmFollow = false;
      resetAutoFollowBeat(currentAutoFollowBeatStart(), { clearPlayed: true });
      syncControlsFromState();
      saveSettings();
      scheduleAutoFollowEmptyBeatCheck();
    });
  });
  els.flowDisplayButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.flowDisplay = button.dataset.flowDisplay === "on";
      syncControlsFromState();
      saveSettings();
      drawStaff();
    });
  });
  els.toleranceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.autoFollowTolerance = button.dataset.toleranceMode === "on" ? 50 : 0;
      syncControlsFromState();
      saveSettings();
      evaluateAutoFollowBeat();
    });
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
    buildKeyboard({ preserveScroll: !isPortraitLayout() });
    if (isPortraitLayout()) queueCenterKeyboardOnMiddleC();
    syncWaterfallLayout();
  });
  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => {
      buildKeyboard({ preserveScroll: false });
      queueCenterKeyboardOnMiddleC();
      syncWaterfallLayout();
    }, 120);
  });
  window.visualViewport?.addEventListener("resize", () => {
    if (!isPortraitLayout()) return;
    window.setTimeout(queueCenterKeyboardOnMiddleC, 60);
  }, { passive: true });
  window.addEventListener("load", queueCenterKeyboardOnMiddleC);
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
syncPurchaseControls();
requestNativePurchaseState();
syncRecordingControls();
syncFullscreenButton();
syncPracticeControls();
setupEvents();
setupPwa();
setupWakeLock();
setupScoreClickPaging();
setupPausedKeyboardScroll();
setupHardwarePedalKeys();
preventPageZoom();
buildKeyboard();
queueCenterKeyboardOnMiddleC();
drawStaff();
autoConnectMidi();
