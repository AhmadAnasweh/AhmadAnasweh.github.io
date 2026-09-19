---
category: digital-forensics
status: in-use
tags:
  - windows
updated: 2026-09-19T12:46:00.000Z
title: HireMe Lab
---
## **Scenario**

Karen is a security professional looking for a new job. A company called "TAAUSAI"  offered her a position and asked her to complete a couple of tasks to prove her technical competency. As a soc analyst Analyze the provided disk image and answer the questions based on your understanding of the cases she was assigned to investigate.

**Q1: What is the administrator's username?**

in the following image we can see its karen, using FTK imager

![Screenshot](/notes/files/image-1789828832779-b0409cec.png)

**Q2: What is the OS's build number?**

Go for /Users/windows/system32/config/

you will find SOFTWARE hive file , export it  , Import it into registry editor or explorer

![Screenshot](/notes/files/image-1789829101154-bdd23690.png)

Check the path Microsoft\Windows NT\CurrentVersion

![Screenshot](/notes/files/image-1789830203404-fe9fb2bd.png)

**Q3: What is the hostname of the computer?**



For the **hostname/computer name**, use the `SYSTEM` registry hive:

again , export the file and import it again and go for the path inside it 

ControlSet00X\Control\ComputerName\ComputerName



**then  Check "ControlSet001\Control\ComputerName\ComputerName"**

![Screenshot](/notes/files/image-1789831097456-5fe67a39.png)
