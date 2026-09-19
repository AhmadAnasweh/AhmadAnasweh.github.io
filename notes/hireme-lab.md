---
category: digital-forensics
status: in-use
tags:
  - windows
updated: 2026-09-19T12:46:00.000Z
created: 2026-09-19T17:42:35+03:00
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

 We can find the .ost file in Users<User>\AppData\Local\Microsoft\Outlook

![Screenshot](/notes/files/image-1789839559036-057e0182.png)

In the following image we can see the .ost file data can be read and viewed using the tool Kernel OST Viewer

![Screenshot](/notes/files/image-1789839565670-3493aa9f.png)

**Q7: How much money was TAAUSAI willing to pay upfront?**

Look for explicit mentions of payment or offers within the email exchanges. The upfront amount should be clearly stated.

![Screenshot](/notes/files/image-1789843232757-d2e85b9e.png)

 **Q8: What country is the admin user meeting the hacker group in?**

Egypt , just threw it at ChatGPT, you can find post on linked in showing the exact same thing btw

![Screenshot](/notes/files/image-1789844559283-7eabb2a8.png)

![Screenshot](/notes/files/image-1789844595210-0045011b.png)

**Q9: What is the machine's timezone? (Use the three-letter abbreviation)**

* The timezone data is stored within the SYSTEM registry hive.
* Explore 

  `HKLM\SYSTEM\ControlSet001\Control\TimeZoneInformation`

   in the SYSTEM hive to find the timezone settings.
* The key 

  `TimeZoneKeyName`

   within the 

  `TimeZoneInformation`

   will give you the timezone abbreviation.

![Screenshot](/notes/files/image-1789845067104-2bb1f845.png)

**Q10: When was AlpacaCare.docx last accessed?**

we can go and check the ftk imager and then see the accessing time in the properties windows on the top left by default , which is 2019-03-17 21:52

![Screenshot](/notes/files/image-1789847312082-5ab5d3f1.png)

**Q11: There was a second partition on the drive. What is the letter assigned to it?**

we find out that the second partition of the drive is store in the “**SYSTEM\MountedDevices”** registry.

![Screenshot](/notes/files/image-1789848687863-43400767.png)

**Q12: What is the answer to the question Company's manager asked Karen?**

Ans : TheCardCriesNoMore

**Q13: What is the job position offered to Karen? (3 words, 2 spaces in between)**

Ans : cyber security analyst

**Q14: When was the admin user password last changed?**

That's stored in the SAM registry

 so we have to analyze the “**SAM**” registry. that

by saved it ,

![Screenshot](/notes/files/image-1789849184085-3bdbb1cc.png)

![Screenshot](/notes/files/image-1789849191657-bf3e063b.png)

![Screenshot](/notes/files/image-1789849199698-1835fe55.png)

**Ans : 03/21/2019 19:13:09**

**Q15: What version of Chrome is installed on the machine?**

here we use Software hive 

 infoormations about last google chrome version is stored in "**SOFTWARE\WOW6432Node\Microsoft\Windows \CurrentVersion\Uninstall\Google Chrome"**.

**Q16: What is the HostUrl of Skype?**

location which store download URL is “**History**”. So, we extract History from the FTK imager 

Location of History is: "\[root]\Users\Karen\AppData\Local\Google\Chrome\User Data\Default\History"

Then open it using SQLite3 or convert.guru

**Q17: What is the domain name of the website Karen browsed on Alpaca care that the file AlpacaCare.docx is based on?**

 we can export the AlpacaCare.docx file  then analyze it

![Screenshot](/notes/files/image-1789849537965-53543800.png)

The hyperlink used in website is  "palominoalapacafarm.com".

**Ans: palominoalpacafarm.com**
