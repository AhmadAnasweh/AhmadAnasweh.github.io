---
title: "🧠 RAMBreaker — memory forensics"
category: my-tools
status: in-use
tags: [rambreaker, memory-forensics, volatility, dfir, windows]
updated: 2026-11-21T14:00:00Z
created: 2026-09-20T01:50:00Z
---

# <span class="rambreaker-title">🧠 RAMBreaker — memory forensics</span>

**One memory image. A traceable investigation.** RAMBreaker is my workflow layer around Volatility 3 and Volatility 2. You give it a RAM image; it detects the operating system, picks the right engine, runs the relevant plugins in parallel, connects their evidence, and shows the result in a desktop app and in a self-contained `report.html`. The raw plugin JSON and text stay beside the report, so you can always check where a finding came from instead of accepting a summary on faith.

**Version 2.6.0 is the Windows edition**: one folder you start with `RAMBreaker.exe` on Windows 10 or 11. Python, Volatility 3 2.28.2 and Volatility 2 2.6.1 are inside; there is nothing to install and no WSL or Docker. It analyses Windows, Linux and macOS memory images (`.raw .mem .vmem .lime .dmp .bin .img`). **Nothing is ever uploaded**: network access is only used to fetch symbol tables for unknown Linux kernels, and for optional threat-intel updates and VirusTotal hash lookups that you switch on yourself.

RAMBreaker reports observations for an investigator to assess. A suspicious process or memory region is **not** an automatic malware verdict.

> **This page is the manual.** Every screenshot below comes from a real v2.5.0 run of the released build on `Windows2.raw`, a public Windows 7 CTF memory image; the threat-intel databases window shows v2.6.0 during a real update.

## Download

- **[Download RAMBreaker v2.6.0 for Windows](https://github.com/AhmadAnasweh/RAMBreaker/releases/latest)** (`RAMBreaker_v2.6.0_windows_x64.zip`, 1.09 GB). SHA-256: `1ecaa476f2843f1bd77f8bbf2c88d128f9eb616cfb098e88ec3c9b7d69b4bc13`
- [Source code](https://github.com/AhmadAnasweh/RAMBreaker), [changelog](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/CHANGELOG.md), [component versions](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/VERSIONS.md).
- The original Linux command-line toolkit (v6.2) stays available as the [`v6.2` tag](https://github.com/AhmadAnasweh/RAMBreaker/tree/v6.2).

**Contents:** [1. Install](#_1-install-and-first-start) · [2. Start an analysis](#_2-start-an-analysis) · [3. Watch the run](#_3-watch-the-run) · [4. Results in the app](#_4-read-the-results-in-the-app) · [5. HTML report](#_5-the-html-report) · [6. Extract evidence](#_6-extract-evidence) · [7. Threat intel](#_7-dfir-threat-intel) · [8. Queue](#_8-several-dumps-the-queue) · [9. Settings and help](#_9-settings-glossary-and-help) · [10. Command line](#_10-command-line) · [11. Output folder](#_11-the-output-folder) · [12. Linux, macOS, VMware](#_12-linux-macos-and-vmware-notes) · [13. Limitations](#_13-known-limitations)

## 1. Install and first start

1. Download the zip and extract it to a folder of your choice, preferably on an SSD (for example `C:\Tools\RAMBreaker_v2.6.0`). The folder is about 1.4 GB, plus room for your cases.
2. Double-click `RAMBreaker.exe`.
3. A guided tour runs on the first start. It points at each part of the window; you can restart it any time with **Tour** in the toolbar.

![RAMBreaker guided tour on the first start](/notes/files/rambreaker-v2-tour.png)

*The guided tour. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-tour.png).*

The main window has five areas: **Case setup** (left) where you choose the dump and options, the **Case navigator** and **Results** in the middle, the **Run monitor** (right) and the **Live log** (bottom). The panels can be moved, resized or detached.

![RAMBreaker main window before an analysis](/notes/files/rambreaker-v2-main.png)

*The main window, ready for a dump. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-main.png).*

**Antivirus:** memory images and carved files can contain live malware, and the threat-intel lists contain malicious addresses. If Windows Defender flags the tool or quarantines downloaded lists, `DEFENDER.md` in the program folder lists the exact folders to exclude. Never disable your antivirus for it.

## 2. Start an analysis

1. Drag a memory dump onto the window, or use **Browse** next to *Memory dump*. RAMBreaker estimates the run time from the dump size and the measured cost of each plugin on your PC.
2. Pick a **Preset** (below) and press **Start analysis**.

![Case setup with a dump chosen and the estimated time](/notes/files/rambreaker-v2-setup.png)

*Case setup with a dump chosen. The estimate is refined live during the run. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-setup.png).*

### Presets

| Preset | What it runs |
| --- | --- |
| **Standard** (recommended) | All plugins, strings, IOCs, e-mail artefacts, Sigma, timeline and the report. Right for most cases. |
| **Quick triage** | Essential plugins only. |
| **Full DFIR** | Standard plus EVTX carving and the slower Volatility 2 extras. |
| **Malware / Network / Persistence / Registry** | A focused plugin set. |
| **DFIR + Threat Intel** | Full DFIR, then every file and process executable is dumped, hashed and checked with YARA, offline threat feeds and, if you want, VirusTotal. See [section 7](#_7-dfir-threat-intel). |

A preset fills in two controls you can still change:

- **Plugin category** (what the plugins look at): All categories, Malware, Network, Persistence or Registry.
- **Fast mode** (how much runs): the quick plugin set, about a third of the plugins. It locks the category to *All categories*.

![Fast mode switched on](/notes/files/rambreaker-v2-fast-mode.png)

*Fast mode on: the category is locked and a note explains why. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-fast-mode.png).*

The **?** next to *Preset*, *Plugin category* and *Fast mode* opens a guide with annotated animations of the real window:

![Animated guide to the presets](/notes/files/rambreaker-v2-guide-presets.gif)

*One of the built-in animated guides. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-guide-presets.gif).*

### Other options

- **Engine**: *Auto* lets RAMBreaker choose between Volatility 3 and Volatility 2 for the image; you can also force one.
- **I already know this image**: set the OS, Volatility 2 profile, ISF symbol file or a Volatility 2 Linux profile zip yourself and skip detection.
- **Parallel jobs** and **RAM / jobs mode**: how many plugins run at once and how much RAM they may use. These settings change speed, never which plugins run.
- **IOC list**: an optional file with one indicator per line (a CSV with a header also works). RAMBreaker searches the whole dump for each one and tells you where it was found.
- **Output folder**: where the case folder is created (default: `output\` beside the exe).

## 3. Watch the run

The **Run monitor** shows the current stage, overall progress and ETA, a heartbeat, and a row for every plugin with its state, run time and time limit. The memory map fills in as the analysis advances. The **Live log** explains each step in plain words; filter it by level or search it.

![Run monitor and live log three minutes into an analysis](/notes/files/rambreaker-v2-running.png)

*Three minutes into the DFIR + Threat Intel run: 40 of 43 plugins done, each with its measured time and its limit, while the Volatility 2 extras run. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-running.png).*

- **Time limits are calculated per dump** from its size, the OS and the measured cost of each plugin, so a slow plugin on a big image is not killed too early and a hung one does not stall the run.
- **Plugin dependencies:** a plugin that reads another plugin's structures waits for it. `cmdline`, `malfind` and `dlllist` read the process list from `pslist`, `netstat` uses `netscan`'s tables, and the registry plugins need `hivelist`. If the parent really fails, its dependents are marked *skipped (dependency)* instead of all failing the same way. `psscan`, `psxview` and `modscan` never wait: they scan memory directly and are what you need when the list walk fails.
- **Retry:** a plugin that failed, timed out, was skipped or never ran gets a button in the **Retry** column, also for an old case opened with **Load results**. You can give it a new time limit or none. The plugin runs once, its skipped dependents run after it, and every plugin-based part of the report is rebuilt (about 30 s on a 2 GB dump).
- **Stop** ends the run; finished plugins are kept and a later run of the same dump resumes.

![The finished run](/notes/files/rambreaker-v2-finished.png)

*The same case when the analysis has finished. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-finished.png).*

## 4. Read the results in the app

When the run ends, the **Case navigator** lists everything that was found. Click an entry to open it as a tab; every table can be sorted and filtered. **Load results** in the toolbar opens any earlier case folder the same way.

### Summary

The first page: the counters for the case and the run-health check, which cross-checks the process sources (`pslist`, `psscan`, `pstree`) and marks the run **healthy**, **degraded** or **broken**. A plugin that exits successfully but logs a symbol or structure failure counts as failed, so incomplete evidence is visible instead of looking like a clean system.

![Case summary in the app](/notes/files/rambreaker-v2-results-summary.png)

*The real run: 37 processes, 36 network rows, 63,606 IOC values, 47 plugins OK, 0 failed, run health healthy. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-summary.png).*

### Processes and network

![Processes table](/notes/files/rambreaker-v2-results-processes.png)

*Processes: one row per process, 37 here, with its PID, parent and times. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-processes.png).*

![Network table](/notes/files/rambreaker-v2-results-network.png)

*Network: connections and listening sockets with the owning process. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-network.png).*

### Findings

- **Fileless injection** compares `malfind` with the loader and memory-map data and gives each suspicious region a confidence level.
- **Correlation** follows one process across processes, modules, files and network.
- **Timeline** merges the timestamps from every source.
- **Sigma rule hits** lists the rules that matched the events rebuilt from memory (none on this image; see the report's Sigma tab below).

![Fileless injection findings](/notes/files/rambreaker-v2-results-injection.png)

*Fileless injection: 58 regions with their confidence. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-injection.png).*

![Correlation page](/notes/files/rambreaker-v2-results-correlation.png)

*Correlation. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-correlation.png).*

![Timeline page](/notes/files/rambreaker-v2-results-timeline.png)

*Timeline: 163 events, here from the shim cache. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-timeline.png).*

### IOCs

One table per indicator type (domains, IPs, URLs, hashes, paths, registry keys, tokens and more), extracted from the strings of the whole dump. These are leads, not verdicts: memory also holds blocklists, browser data and antivirus signatures.

![IOC table: domains](/notes/files/rambreaker-v2-results-ioc-domain.png)

*8,676 domain names found in memory. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-ioc-domain.png).*

![IOC table: IPv4 addresses](/notes/files/rambreaker-v2-results-ioc-ipv4.png)

*426 IPv4 addresses. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-ioc-ipv4.png).*

### E-mail, browser and every plugin

![E-mail artefacts](/notes/files/rambreaker-v2-results-email.png)

*E-mail artefacts recovered from memory. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-email.png).*

![Browser history](/notes/files/rambreaker-v2-results-browser.png)

*Browser history recovered from memory. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-browser.png).*

Under **Plugins** every plugin's own output is one table, 56 on this case. Each can be filtered and exported to CSV.

![The malfind plugin table](/notes/files/rambreaker-v2-results-plugin-malfind.png)

*One plugin table: `windows.malfind`. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-results-plugin-malfind.png).*

**Theme** in the toolbar switches between dark and light:

![The case in the light theme](/notes/files/rambreaker-v2-light.png)

*Light theme. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-light.png).*

## 5. The HTML report

**HTML report** in the toolbar opens `report.html`: one self-contained file that works offline in any browser, ready to hand over. Global search finds a PID, address, domain or file name in every tab, and each finding links back to the plugin output it came from.

The report has 15 tabs. All of them, from the same run:

![Report: Summary and device](/notes/files/rambreaker-v2-report-summary.png)

*Summary + Device: the counters, the device (host name, Windows build, boot time, IP addresses, accounts) and the correlation summary. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-summary.png).*

![Report: Threat Intelligence](/notes/files/rambreaker-v2-report-ti.png)

*Threat Intelligence (see [section 7](#_7-dfir-threat-intel)). [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-ti.png).*

![Report: Correlation](/notes/files/rambreaker-v2-report-correlation.png)

*Correlation: each process joined with its parent, command line, modules, files and network. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-correlation.png).*

![Report: Injection](/notes/files/rambreaker-v2-report-injection.png)

*Injection: the fileless-injection correlator's findings with confidence levels. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-injection.png).*

![Report: Browser and plugins](/notes/files/rambreaker-v2-report-browser.png)

*Browser + Plugins. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-browser.png).*

![Report: Process tree](/notes/files/rambreaker-v2-report-tree.png)

*Process Tree: parent and child processes. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-tree.png).*

![Report: Process graph and network](/notes/files/rambreaker-v2-report-graph.png)

*Process Graph + Network. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-graph.png).*

![Report: IOCs](/notes/files/rambreaker-v2-report-iocs.png)

*IOCs, one table per type. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-iocs.png).*

![Report: Timeline](/notes/files/rambreaker-v2-report-timeline.png)

*Timeline. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-timeline.png).*

![Report: Shell commands](/notes/files/rambreaker-v2-report-commands.png)

*Shell Commands: command lines and console history. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-commands.png).*

![Report: Popular files](/notes/files/rambreaker-v2-report-files.png)

*Popular Files. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-files.png).*

![Report: Scheduled tasks](/notes/files/rambreaker-v2-report-tasks.png)

*Scheduled Tasks. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-tasks.png).*

![Report: Registry](/notes/files/rambreaker-v2-report-registry.png)

*Registry. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-registry.png).*

![Report: Sigma](/notes/files/rambreaker-v2-report-sigma.png)

*Sigma: 3,159 SigmaHQ rules loaded, 1,594 applicable to memory data, evaluated against 1,771 events rebuilt from memory; none fired on this image. Rules that cannot be evaluated on memory data are listed with the reason. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-sigma.png).*

![Report: Other JSON](/notes/files/rambreaker-v2-report-other.png)

*Other: the remaining plugin output. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-other.png).*

## 6. Extract evidence

**Extract** in the toolbar (Ctrl+E) opens the **Extraction workspace** for the loaded case. Every list comes from the finished analysis, so browsing is instant; only the extraction itself runs Volatility, in the background. The results table at the bottom shows each extracted item with its size, detected type, the share of non-zero data and its SHA-256.

**Protected output (new in v2.5.0).** A file pulled out of memory can be live malware, for example ransomware. By default every extracted file is written straight into its own password-protected ZIP, `<name>.zip`, encrypted with AES-256, password `infected` (the usual convention for exchanging malware; you can change it in the *Safety* row). Volatility writes the encrypted ZIP itself, so the plain file never touches the disk: nothing can be started by a double-click and the antivirus cannot quarantine your evidence. To open one, preferably inside an isolated analysis VM, use 7-Zip, WinRAR or PeaZip, or the `tar` built into Windows 10/11: `tar -xf <name>.zip --passphrase infected`. Windows Explorer cannot open AES-encrypted ZIPs, which is a safe default.

### Files

Search the dump's file list by name or path words, file type or *only recoverable*, tick files and extract them.

![Extraction workspace: Files page](/notes/files/rambreaker-v2-extract-files.png)

*Files: a search for event logs with three files ticked. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-files.png).*

### Processes

Tick processes (flagged ones are highlighted) and extract the executable, its loaded DLLs and/or the full process memory.

![Extraction workspace: Processes page](/notes/files/rambreaker-v2-extract-processes.png)

*Processes, with the protection switch and password in the Safety row. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-processes.png).*

### Memory regions (VAD)

Two modes. **Whole process** dumps every region of the ticked processes. **Selected regions only** lets you tick single regions; one button ticks the regions the injection correlator flagged. The help card explains the difference with an example.

![Memory regions: selected regions of one process](/notes/files/rambreaker-v2-extract-vad-region.png)

*Selected regions only, with the injection-flagged regions ticked. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-vad-region.png).*

![Memory regions: whole-process mode](/notes/files/rambreaker-v2-extract-vad-process.png)

*Whole process mode. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-vad-process.png).*

### String hunt

Enter strings (one per line), optionally limit them to PIDs, and choose case and UTF-16 options. Hits are listed per process and address.

![Extraction workspace: String hunt page](/notes/files/rambreaker-v2-extract-hunt.png)

*String hunt with two search terms. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-hunt.png).*

### Export pack

A zip of the key results with a manifest, for handing a case to someone else.

![Extraction workspace: Export pack page](/notes/files/rambreaker-v2-extract-export.png)

*Export pack. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-extract-export.png).*

Every extraction job gets its own folder under *Save to* (default `<case>\extracted`) with `manifest.json` and `manifest.txt`: each item's status and, for each file, size, type (PE, ELF, EVTX, ...), SHA-256, MD5 and non-zero share. A file whose pages were not in RAM is reported as **empty**, never as a fake success.

## 7. DFIR + Threat Intel

The **DFIR + Threat Intel** preset answers *"is anything in this image known to be bad?"* Before the run starts, an options window asks what to check:

![Threat intel options](/notes/files/rambreaker-v2-ti-dialog.png)

*The threat-intel options. Without a VirusTotal key everything stays on this PC. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-ti-dialog.png).*

1. A Full DFIR analysis.
2. **Every recoverable file and the executable of every process** is dumped (into protected ZIPs). Memory regions are only dumped when the injection correlator flagged them HIGH or MEDIUM, because fileless code never exists as a file.
3. SHA-256, SHA-1 and MD5 of every object, with its **hash quality**: *complete* (every page was in RAM, so the hash should match the file on disk), *partial* (pages were missing) or *rebuilt* (an executable reassembled from memory, which never hashes like the disk file).
4. **Local checks; nothing leaves the PC:** YARA Forge rules (*core*, 5,132 rules, or *extended*, 10,886) plus your own rules in `yara_rules\custom\`; offline feeds (IPsum and Feodo bundled; Maltrail, Spamhaus DROP, Emerging Threats, CINS, OpenPhish and abuse.ch with your own free key after an update); and optional local hash databases (MalwareBazaar, VirusShare, NIST NSRL known files). Every hash, network connection, browser-history entry and extracted IP, domain and URL is compared.
5. A scored **"look here first"** list. Each entry says why it is there.
6. **VirusTotal only if you enter a key.** Only hashes, public IPs and domains from the short list are looked up; files are never uploaded, private IPs and internal names are never sent, and everything that was sent is listed in `vt_sent.txt`. The key is stored DPAPI-encrypted for your Windows user only if you tick *Remember*.

The databases go out of date. The options window and **Settings > Threat-intel databases** show the age and size of each source and offer an **Update**; updating is never automatic. While an update runs you see which database is being fetched, how much is downloaded and how much is left, the download speed and the time left, and you can **Pause**, **Resume** or **Cancel** it. Cancel keeps the previous copy of the database being fetched; VirusShare continues from the last list it installed. **Delete ticked downloads** frees the space of downloaded copies (copies that ship with RAMBreaker stay), and the window shows the free disk space; an update that needs more space than the drive has asks first.

![Threat-intel databases during an update: progress, speed, time left, Pause and Cancel](/notes/files/rambreaker-v2-ti-databases.png)

*The threat-intel databases during an update (v2.6.0): IPsum is downloading, 1.4 MB left at 383.8 KB/s. Sources that may not be redistributed are downloaded to your PC only when you choose Update. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-ti-databases.png).*

Results go to the report's **Threat Intelligence** tab and to `<case>\threat_intelligence\`. **Analysis > Threat intel on this case** adds threat intel to a case analysed earlier.

![Threat Intelligence tab of the report](/notes/files/rambreaker-v2-report-ti.png)

*The Threat Intelligence tab of the real run, local checks only: 1,813 objects dumped and hashed in 118 s (hash quality: 435 complete, 412 partial, 915 rebuilt, 49 empty, 2 regions), 0 YARA and 0 feed hits, VirusTotal off, and 30 entries on the "look here first" list, led by `explorer.exe` with two MEDIUM injection findings. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-report-ti.png).*

## 8. Several dumps: the queue

Add several dumps with **Add to queue** (or drop several files at once) and press **Start queue**. Each dump runs with the options that were set when it was added, one after another, and a summary appears at the end.

![Two dumps in the queue](/notes/files/rambreaker-v2-queue.png)

*Two dumps waiting in the queue. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-queue.png).*

## 9. Settings, glossary and help

Every control has a **?** help card. **Help mode** (F1) turns any click into an explanation, and **Glossary** defines the forensic terms.

![A help card next to the Preset control](/notes/files/rambreaker-v2-help-popup.png)

*A help card. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-help-popup.png).*

![Settings dialog](/notes/files/rambreaker-v2-settings.png)

*Settings: theme, default output folder, parallel jobs, time limits and more. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-settings.png).*

![Glossary](/notes/files/rambreaker-v2-glossary.png)

*The glossary. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-v2-glossary.png).*

## 10. Command line

Everything the app does is also available from the program folder through `rambreaker-cli.cmd`, which uses the bundled Python:

```bat
rambreaker-cli.cmd core -i D:\Cases\memory.raw -o D:\Cases\memory_case
rambreaker-cli.cmd dfir-ti -i D:\Cases\memory.raw --no-vt
rambreaker-cli.cmd ti -o D:\Cases\memory_case
rambreaker-cli.cmd retry -o D:\Cases\memory_case -i D:\Cases\memory.raw --retry-plugins "windows.netscan.NetScan:1200"
rambreaker-cli.cmd --help
```

`-i` is the memory image and `-o` the case folder. Retry limits are in seconds (`0` = no limit, `auto` = calibrated). Extraction jobs run with `xjob --spec job.json`; `--no-protect` and `--zip-password` control protected output. Run `--help` for every command, including `ioc-check` and `sigma`.

## 11. The output folder

Each case is one folder. The readable report **and** the evidence behind it stay together:

| Path | Contents |
| --- | --- |
| `report.html` | The offline report. |
| `SUMMARY.txt`, `run_health.json` | What ran, what failed, and whether the run is **healthy**, **degraded** or **broken**. |
| `json\`, `txt\` | The output of every plugin. |
| `iocs\`, `comms\` | Extracted IOCs, e-mail and chat artefacts. |
| `timeline.csv`, `correlation_report.txt` | The merged timeline and the per-process correlation. |
| `threat_intelligence\` | Threat-intel dumps (protected ZIPs), hashes, YARA and feed hits, `ti_report.json`. |
| `extracted\` | Files, processes and regions from the Extraction workspace, each job with a manifest. |

Preserve the whole case folder when you need to reproduce or review a conclusion; the single HTML file is the convenient handoff view. A plugin that exits successfully but logs a symbol or structure failure is counted as failed, and incomplete evidence is marked in the report, so an empty tab is never silently read as a clean system.

## 12. Linux, macOS and VMware notes

- **Linux symbols.** Volatility needs a symbol table (ISF) that matches the exact kernel. RAMBreaker tries, in order: the community ISF repository, the distribution's debug package converted with `dwarf2json`, a **BTF-to-ISF reconstruction from inside the dump itself** (works offline for modern kernels built with BTF), and a Volatility 2 Linux profile for older kernels. Every candidate is tested against the dump before use.
- **macOS** symbol coverage is more limited; the bundled custom `mac.pagecache` and `mac.list_files` plugins recover file content and deep directory trees.
- **VMware `.vmem` without its `.vmss`/`.vmsn`.** VMware stores the RAM above the PCI hole right after the lower RAM, and only the `.vmss`/`.vmsn` says so. RAMBreaker rebuilds that memory map from the guest's own page tables and applies it to both Volatility versions. If you do have the `.vmss`/`.vmsn`, put it beside the `.vmem` with the same name and it is used.

## 13. Known limitations

- Extraction recovers only what was in RAM. Small files that were not cached come back empty, and that is reported. macOS libraries in the dyld shared cache cannot be extracted as files; dump the process memory instead.
- macOS: Volatility 3 `mac.malfind` flags almost every region (shown as LOW with a note), and IOC-checker hits cannot be tied to a process; the string hunt with PIDs can attribute them.
- Volatility 2 has no Windows 11 / Server 2022 profiles, so the Volatility 2 extras are skipped on those images.
- IOC lists from memory are leads, not verdicts. Broad types (hex blobs, base64, domains) keep some noise, and a string cut at a memory boundary can give a partial value.
- Large dumps are slow on a spinning disk; copy the dump to an SSD (the log suggests it). A 35 GB Windows 11 image is a multi-hour job.
- Resuming a case re-runs the strings and IOC pass.
- The older menu commands (`dump-files`, `dump-procs`, `dump-vad`, `dump-all`) still write plain, unprotected files.

The source, build instructions and full change history are in the [RAMBreaker repository](https://github.com/AhmadAnasweh/RAMBreaker).
