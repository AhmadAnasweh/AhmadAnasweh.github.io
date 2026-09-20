---
title: "🛡️ OfflineAutoruns — persistence review"
category: my-tools
status: in-use
tags: [offlineautoruns, persistence, digital-forensics, windows]
updated: 2026-09-20T01:50:00Z
created: 2026-09-20T01:50:00Z
---

OfflineAutoruns reviews Windows startup and persistence artifacts **inside a forensic disk image**. Its repository describes checks across Run keys, services, scheduled tasks, Winlogon, shell extensions, WMI, startup folders, and other locations. It produces an interactive HTML report plus CSV/JSON exports and scan logs.

## Repository and tool files

- [OfflineAutoruns repository](https://github.com/AhmadAnasweh/OfflineAutoruns).
- [Download the CLI executable](https://github.com/AhmadAnasweh/OfflineAutoruns/raw/refs/heads/main/OfflineAutoruns.exe) or [download the GUI executable](https://github.com/AhmadAnasweh/OfflineAutoruns/raw/refs/heads/main/OfflineAutoruns_GUI.exe).

## Launch and example command

The current repository contains the two executables but **does not contain** the `OfflineAutoruns.py` or `OfflineAutoruns_GUI.py` files named in its README. Use the packaged files from the repository root:

```powershell
.\OfflineAutoruns_GUI.exe
.\OfflineAutoruns.exe 'D:\Evidence\PC01.E01' --mode new --output-base 'D:\Cases'
```

Choose the first segment of an E01 chain or a supported raw/virtual-disk image. The documented `--whitelist` and `--blocklist` options allow local allow/deny lists. Review a high-risk entry against its file path, signature, hash, and other evidence before treating it as malicious. The example command follows the repository's documented CLI options; I have not executed the binary against a disk image.

![OfflineAutoruns repository showing its executables and README](/notes/files/offlineautoruns-repository.png)

*Repository screenshot showing the available binaries and documentation. The repository provides no tool UI screenshot or inspectable Python source, so this is labeled as a repository view rather than a scan result.*

[Open the repository screenshot full size](https://ahmad.anasweh.com/notes/files/offlineautoruns-repository.png)

The [README](https://github.com/AhmadAnasweh/OfflineAutoruns/blob/main/README.md) lists image formats, all scanned persistence categories, scoring rules, and output folders.
