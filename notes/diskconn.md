---
title: "💽 DiskConn — disk-image connections"
category: my-tools
status: in-use
tags: [diskconn, digital-forensics, disk-images, network]
updated: 2026-09-20T01:50:00Z
created: 2026-09-20T01:50:00Z
---

DiskConn reads a forensic disk image without mounting it, extracts network and command artifacts, and brings them together in a timeline, CSV/JSONL exports, and a self-contained HTML report. It distinguishes an observed connection from a destination that was merely saved in a configuration or recent-items list. The [repository credits srjtools for the original project](https://github.com/AhmadAnasweh/DiskConn#readme).

## Repository and tool file

- [DiskConn repository](https://github.com/AhmadAnasweh/DiskConn).
- [Download the standalone Windows executable](https://github.com/AhmadAnasweh/DiskConn/raw/refs/heads/main/dist/DiskConn.exe) or inspect the [CLI source file](https://github.com/AhmadAnasweh/DiskConn/blob/main/diskconn/cli.py).

## Commands

From a clone of the repository, first check which image readers are available. Use a **new or empty** case directory for each run:

```powershell
.\dist\DiskConn.exe capabilities
.\dist\DiskConn.exe analyze 'D:\Evidence\PC01.E01' -o 'D:\Cases\PC01' --case-name 'PC01 Network Review'
.\dist\DiskConn.exe analyze-artifacts 'D:\ExportedRoot' -o 'D:\Cases\ArtifactCase'
```

The first analysis command reads an E01 image; the second works from an already exported artifact folder. The output includes `report.html`, connection and command tables, a timeline, provenance, and warnings. Open the report in a browser and use its global search to move across sections. For a quick first pass, add `--quick`; its reduced coverage should be treated as triage rather than a complete negative finding.

![DiskConn example case report overview](/notes/files/diskconn-report.png)

*Screenshot of the repository's included `example-report/report.html`, showing the case overview and navigation. This is a sample report, not a new analysis of your evidence.*

[Open the report screenshot full size](https://ahmad.anasweh.com/notes/files/diskconn-report.png)

The repository [README](https://github.com/AhmadAnasweh/DiskConn/blob/main/README.md) lists supported disk formats, optional dependencies, and the limits of each evidence source.
