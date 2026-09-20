---
title: "🧠 RAMBreaker — memory forensics"
category: my-tools
status: in-use
tags: [rambreaker, memory-forensics, volatility, dfir]
updated: 2026-09-20T02:15:00Z
created: 2026-09-20T01:50:00Z
---

# <span class="rambreaker-title">🧠 RAMBreaker — memory forensics</span>

**One memory image. A traceable investigation.** RAMBreaker is my workflow layer around Volatility 2 and 3. It detects the target operating system and suitable engine, runs the relevant plugins, connects their evidence, and builds a self-contained `report.html`. Raw plugin JSON and text remain beside the report, so an analyst can check where a finding came from instead of accepting a summary on faith.

It accepts `.raw`, `.mem`, `.lime`, `.dmp`, and VMware `.vmem` images. The project documents Windows, Linux, and macOS analysis, while its README explicitly says the tool itself has only been tested in a Linux environment. RAMBreaker reports observations for an investigator to assess; a suspicious process or memory region is **not** an automatic malware verdict.

Why look at memory at all? A disk image tells you what was saved. A RAM image can also preserve the processes that were running, their live network connections, commands, and fragments of browser or chat activity at capture time. RAMBreaker brings those separate clues into one case view while retaining the underlying evidence.

## Get the tool and documentation

- [RAMBreaker repository](https://github.com/AhmadAnasweh/RAMBreaker) and [direct link to the Python tool file](https://github.com/AhmadAnasweh/RAMBreaker/raw/refs/heads/main/crescent_toolkit.py).
- [Illustrated guide](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/docs/RAMBreaker_Guide.html), [deep technical reference](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/docs/RAMBreaker_deep_technical.docx), [release history](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/CHANGELOG.md), and [known-good toolchain versions](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/TOOLCHAIN.lock.md).
- [Plain-language explanation](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/docs/RAMBreaker_Explained.docx) and [problem-and-solution slides](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/docs/RAMBreaker_ProblemSolution.pptx) for sharing the idea with someone new to memory forensics.

The source stays in its own repository. This note contains explanations and screenshots, not copies of the tool files.

## Start an investigation

On a Linux analysis machine with the required Volatility toolchain available, clone the repository and either open the menu or run the full workflow:

```bash
git clone https://github.com/AhmadAnasweh/RAMBreaker.git
cd RAMBreaker
python3 crescent_toolkit.py
python3 crescent_toolkit.py full -i /evidence/memory.raw -o /cases/memory-results/
```

The menu is useful when you need a specific operation. `full` runs the core pipeline and, on Windows, also dumps and parses event logs before rebuilding the HTML report. `-i` identifies the memory image and `-o` selects the output folder. Use `python3 crescent_toolkit.py --help` for the current flags; `-i` is the image flag, not `-f`.

![RAMBreaker interactive menu with Core, Default, plugin-only, and Eye modes](/notes/files/rambreaker-menu.png)

*The v6.2 interactive menu, from the RAMBreaker repository. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-menu.png).*

### Choose the right depth

| Command | What it does |
| --- | --- |
| `core` | Runs the eight-stage analysis pipeline without the extra Windows event-log pass. |
| `full` | Runs `core`, then processes Windows event logs and refreshes the report. This is the default analysis path. |
| `plugins` (alias `ctf`) | Runs the pipeline without the slower strings, IOC, browser, and communications pass; useful for quick plugin-focused triage. |
| `eye` (alias `dfir`) | Runs `core`, then tries to dump all recoverable processes and files. This mode is marked experimental in the docs. |

You can also run focused commands against an image or an existing output directory. For example:

```bash
python3 crescent_toolkit.py hunt -i /evidence/memory.raw -o /cases/memory-results/ --hunt-strings "example-string" --hunt-pid 1337
python3 crescent_toolkit.py dump-vad -i /evidence/memory.raw -o /cases/memory-results/ --vad-pid 1337
python3 crescent_toolkit.py report -i /evidence/memory.raw -o /cases/memory-results/
```

`hunt` searches live process memory for a string and can narrow results to a PID. `dump-vad` saves that process's live memory regions, which can differ from its executable file on disk. `report` regenerates the HTML view from analysis already written to the output directory. Replace the example PID and string with values from your case.

## What happens behind the command

First, RAMBreaker identifies the OS, Volatility engine, and profile. It then resolves the symbols needed to interpret the memory image. Plugins run in parallel, but each one's output is saved separately under `json/` and `txt/`. The later stages read those saved results to assemble a process tree, network map, command and persistence findings, IOCs, timeline, and the final report. That separation makes the source of a finding inspectable.

The repository's worked example uses a WannaCry-infected Windows XP image named `wcry.raw`. In the extraction screenshot, RAMBreaker identifies `WinXPSP2x86`, uses Volatility 3 with four parallel jobs, starts 33 plugins, and runs Volatility 2-only network plugins in the background. This is a **repository example**, not a new analysis of a visitor's device.

![RAMBreaker extracting plugins in parallel from the documented wcry.raw example](/notes/files/rambreaker-processing.png)

*Live extraction in the repository example. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-processing.png).*

### The Linux symbol problem

Volatility needs a matching Intermediate Symbol Format (ISF) file to understand Linux kernel structures. RAMBreaker checks installed symbols, looks for a verified community match, can patch a near-matching kernel banner, and can build an ISF from local debug material. Its v6.2 `btf2isf` path can reconstruct symbols from BTF type data and `kallsyms` **inside the memory image** when the kernel was built with `CONFIG_DEBUG_INFO_BTF`; this can work offline for many modern Linux images. If that path is unavailable, it can try the distribution's debug package and `dwarf2json`. Every candidate is tested against the actual dump before use.

This feature solves missing symbols, not every Volatility incompatibility. Older kernels without embedded BTF, a bare `.vmem` missing its `.vmss`/`.vmsn` companion, or a plugin that does not understand a new kernel structure may still prevent a complete run. macOS symbol coverage is more limited. These are reasons to read the diagnostics, not to interpret an empty tab as a clean system.

On macOS, the repository also includes custom `mac.pagecache` and `mac.list_files` Volatility plugins for recovering file content and walking deep directory trees. Their presence does not remove the symbol-coverage limits above.

### Correlation without automatic verdicts

RAMBreaker joins process, parent, command-line, module, file, and network records so an analyst can follow one process across sources. It also scans for browser and communications traces, persistence locations, and timeline events. The v6.2 injection correlator compares `malfind` findings with loader or process-map data and reports confidence levels; the VAD dumper hashes extracted regions and flags executable-private or read/write/execute memory. These are leads to verify, not proof of malicious activity by themselves.

The run-health check cross-checks process sources and marks a run **healthy**, **degraded**, or **broken**. A plugin that exits successfully but logs a symbol or structure failure is treated as a failure; the report and `run_health.json` make incomplete evidence visible. If a run breaks, inspect `SUMMARY.txt`, the log, `run_health.json`, and any local `crash_report.json` before using the findings. Crash-report sharing is opt-in and off by default.

## Read the report, then verify the evidence

The self-contained `report.html` opens offline. Its tabs cover the device summary, per-process correlation, injection, browser artifacts, plugins, process tree and graph, network, IOCs, timeline, commands, files, persistence, registry, and remaining JSON. Global search helps find a PID, address, domain, or filename across the report.

![RAMBreaker report summary with plugin counts and device information](/notes/files/rambreaker-report.png)

*Report summary from the documented WannaCry example. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-report.png).*

![RAMBreaker process tree linking explorer.exe, tasksche.exe, and WanaDecryptor](/notes/files/rambreaker-process-tree.png)

*The same example's process tree shows `explorer.exe → tasksche.exe → @WanaDecryptor@.exe`, with links back to the plugin JSON. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-process-tree.png).*

The output folder keeps the readable report **and** the evidence behind it: `json/` and `txt/` for plugin results, `iocs/` and `comms/` for extracted artifacts, plus files such as `correlation_report.txt`, `timeline.csv`, `run_health.json`, and `SUMMARY.txt`. Preserve the whole case output when you need to reproduce or review a conclusion; the single HTML file is the convenient handoff view.

![Annotated RAMBreaker output directory showing JSON, text, artifacts, health, timeline, and report](/notes/files/rambreaker-output-overview.png)

*Annotated output directory from the repository. [Open full size](https://ahmad.anasweh.com/notes/files/rambreaker-output-overview.png).*

For implementation detail and current limits, see the [repository README](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/README.md), [illustrated guide](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/docs/RAMBreaker_Guide.html), and [v6.2 changelog](https://github.com/AhmadAnasweh/RAMBreaker/blob/main/CHANGELOG.md).
