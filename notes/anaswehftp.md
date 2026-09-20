---
title: "📁 AnaswehFTP — LAN file sharing"
category: my-tools
status: in-use
tags: [anaswehftp, file-sharing, network, windows]
updated: 2026-09-20T01:50:00Z
created: 2026-09-20T01:50:00Z
---

AnaswehFTP is a small, read-only file server for sharing a folder with other computers on the same LAN. A browser can list folders, download individual files, or download a whole folder as a ZIP. Despite the name, the interface uses **HTTP**, not the FTP protocol.

## Repository and tool file

- [AnaswehFTP repository](https://github.com/AhmadAnasweh/AnaswehFTP).
- [Download the standalone Windows executable](https://github.com/AhmadAnasweh/AnaswehFTP/raw/refs/heads/main/AnaswehFTP.exe) or inspect the [direct Python source file](https://github.com/AhmadAnasweh/AnaswehFTP/blob/main/AnaswehftpCode/anaswehftp.py).

## Start sharing

From a repository clone, pass the folder you want to share:

```powershell
.\AnaswehFTP.exe 'C:\Shared'
```

Without a folder argument, it creates or uses a `Shared` folder under the current working directory. The terminal prints the local and LAN addresses and the login credentials. Open the displayed address in a browser, log in, and download files or use **Download this folder as .zip**. Press `Ctrl+C` or close the terminal to stop sharing.

![AnaswehFTP browser listing with demo files](/notes/files/anaswehftp-browser.png)

*The tool's own page renderer, captured with harmless demo files. No server was exposed to the LAN for this screenshot.*

[Open the browser screenshot full size](https://ahmad.anasweh.com/notes/files/anaswehftp-browser.png)

The current source uses a fixed username/password and plain HTTP Basic authentication. Use it only on a trusted local network and avoid sharing sensitive files until those settings are changed. The [project README](https://github.com/AhmadAnasweh/AnaswehFTP/blob/main/AnaswehftpCode/README.md) explains the read-only behavior and port selection.
