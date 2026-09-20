---
title: "🔎 CheckIt — bulk VirusTotal checks"
category: my-tools
status: in-use
tags: [checkit, virustotal, ioc, windows]
updated: 2026-09-20T01:50:00Z
created: 2026-09-20T01:50:00Z
---

CheckIt is a Windows desktop tool for checking batches of hashes, IP addresses, domains, and URLs against VirusTotal. It identifies the indicator type, deduplicates entries, handles common defanged forms, rate-limits requests, and exports the results as CSV or JSON.

## Repository and tool file

- [CheckIt repository](https://github.com/AhmadAnasweh/CheckIt).
- [Download the standalone executable](https://github.com/AhmadAnasweh/CheckIt/raw/refs/heads/main/dist/checkit.exe) or read the [direct Python source file](https://github.com/AhmadAnasweh/CheckIt/blob/main/checkit.py).

## Launch and use

From a repository clone:

```powershell
.\dist\checkit.exe
```

Paste your VirusTotal API key into the top bar, then paste indicators one per line or choose **Load CSV / TXT**. Set **Requests/min** to match your API allowance, click **Check with VirusTotal**, and export the table when it finishes. You can click a row for a breakdown, sort columns, or turn on **Malicious only** before exporting.

![CheckIt input, VirusTotal verdicts, and details](/notes/files/checkit-results.png)

*The tool's own screenshot from its repository README. The API key is masked.*

[Open the CheckIt screenshot full size](https://ahmad.anasweh.com/notes/files/checkit-results.png)

If you select **Remember key**, the tool saves it to `%APPDATA%\CheckIt\config.json`; leave that option off on a shared machine. A `CLEAN` result means the queried engines found no detection at the time of the lookup, not that an indicator is guaranteed safe. See the [README](https://github.com/AhmadAnasweh/CheckIt/blob/main/README.md) for the verdict labels and rate-limit behavior.
