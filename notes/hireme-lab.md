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

**4. A messaging application was used to communicate with a fellow Alpaca enthusiest. What is the name of the software?**

**Skype , mount the image or just keep looking through FTK imager , you will find Skype in the files**

![Screenshot](/notes/files/image-1789831539136-8711a981.png)

or if you want to be more professional

1. Go for /Users/windows/system32/config/
2. Analyze SOFTWARE file through exporting it and reading it through whatever tool you want
3. check the path Microsoft\Windows\CurrentVersion\App Paths  

![Screenshot](/notes/files/image-1789831787041-420bdb6a.png)

Q5: **What is the zip code of the administrator's post?**

![Screenshot](/notes/files/image-1789840384804-af574fff.png)

**Q6: What are the initials of the person who contacted the admin user from TAAUSAI?**

**All the data regarding the emails are stored in** An **OST file** (Offline Storage Table) , its a local data file created by **Microsoft Outlook** to store a synchronized copy of mailbox data for **Exchange**, **Office 365**, or **IMAP** accounts.  This format enables **Cached Exchange Mode**, allowing users to access emails, contacts, calendars, and tasks **offline** without an internet connection.



 We can find the .ost file in Users\<User>\AppData\Local\Microsoft\Outlook

![Screenshot](/notes/files/image-1789839559036-057e0182.png)

in the following image we can see the .ost file data can be read and viewed using the tool Kernel OST Viewer


![Screenshot](/notes/files/image-1789839565670-3493aa9f.png)
