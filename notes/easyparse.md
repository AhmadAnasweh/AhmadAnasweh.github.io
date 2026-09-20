---
title: "🧩 EasyParse — log parsing"
category: my-tools
status: in-use
tags: [easyparse, log-parsing, windows, dfir]
updated: 2026-09-20T01:50:00Z
created: 2026-09-20T01:50:00Z
---

EasyParse turns raw logs into structured CSV or JSON. Its **Config Builder** lets you highlight fields in sample lines and test the extraction rules; its **Bulk Parser** applies a saved or automatically detected config to whole files and batches. The application uses a React/Electron interface and a Go parsing engine.

## Repository and tool file

- [EasyPrase repository](https://github.com/AhmadAnasweh/EasyPrase) (the repository spelling is **Prase**).
- [Electron application entry file](https://github.com/AhmadAnasweh/EasyPrase/blob/main/log-parser-tool-fixed/src/electron/main.js) and [direct build script](https://github.com/AhmadAnasweh/EasyPrase/raw/refs/heads/main/log-parser-tool-fixed/build.bat).
- The repository does **not** currently include the packaged `EasyParse.exe`. Build it from the source above; the resulting executable stays in your local clone.

## Build and launch on Windows

Install Go 1.23+ and Node.js 20+, then run:

```powershell
git clone https://github.com/AhmadAnasweh/EasyPrase.git
Set-Location .\EasyPrase\log-parser-tool-fixed
.\build.bat
.\src\electron\dist\EasyParse.exe
```

For a quick CSV, open **Mode 2 → Auto Config from File**, choose a log, review the proposed fields, then select **Start Parsing**. For a more deliberate config, use **Mode 1 → Open Log File** or **Paste Sample Logs**, highlight the values you need, choose **Test on All Samples**, and save the config. The bulk parser can then reuse it for several files.

![EasyParse proposes fields from sample Apache logs](/notes/files/easyparse-auto-detect.png)

*The auto-detection proposal, captured from the repository's source-built frontend with its included sample Apache logs.*

[Open the auto-detection screenshot full size](https://ahmad.anasweh.com/notes/files/easyparse-auto-detect.png)

![EasyParse raw logs, extracted fields, and live preview](/notes/files/easyparse-fields.png)

*The same sample after adding the proposed fields. The screenshot shows the frontend preview; the Go engine was not connected for this capture.*

[Open the field-preview screenshot full size](https://ahmad.anasweh.com/notes/files/easyparse-fields.png)

The repository's [user guide](https://github.com/AhmadAnasweh/EasyPrase/blob/main/log-parser-tool-fixed/docs/USER_GUIDE.md) covers templates, mixed log formats, and CSV/JSON output in detail.
