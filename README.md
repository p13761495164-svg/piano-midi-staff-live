# Easy Piano

这是一个静态 PWA：连接 MIDI 钢琴后，实时把按下的琴键显示在五线谱和 88 键屏幕钢琴键盘上。

## 运行

```sh
python3 -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/
```

如果从本目录外启动服务器，请打开 `outputs/piano-midi-pwa/` 对应的 URL。

## 连接钢琴

- USB MIDI 线：插到电脑后，在 Chrome 或 Edge 中点“连接 MIDI”。
- 蓝牙 MIDI：先在系统蓝牙或系统 MIDI 设置里完成配对，让它成为系统 MIDI 输入设备，再回到网页点“连接 MIDI”。
- 没有真琴时，可以点屏幕上的钢琴键测试谱面和键盘高亮。

## 浏览器限制

这个版本使用浏览器原生 Web MIDI API。Chrome 和 Edge 桌面版支持最好；iPad Safari 和 iOS/iPadOS 上的浏览器通常不能把 CoreMIDI / Bluetooth MIDI 输入暴露给网页。如果目标主要是 iPad，需要做原生 iPad App，用 CoreMIDI 接收 MIDI，再把音符事件桥接到当前网页 UI。
