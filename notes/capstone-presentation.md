---
title: "🎤 CYBERCAMP3 Capstone Presentation"
category: digital-forensics
status: tested
tags: [capstone, presentation, red-team, blue-team, network-security]
updated: 2026-09-21T00:00:00Z
created: 2023-11-22T00:00:00Z
---

# 🎤 CYBERCAMP3 Capstone Presentation

**Controlled educational lab presentation — local copy only.** This note preserves text extracted from the PPTX and presentation PDF and reproduces all 38 embedded presentation images. The slides describe intentionally vulnerable lab systems; do not treat their credentials, addresses, exploit examples, or screenshots as production guidance.

## Source deliverables

- `AhmadAnasweh_CYBERCAMP3_Presentation.pptx` — slide text and 38 embedded images.
- `AhmadAnasweh_CYBERCAMP3_Presentation.pdf` — PDF text extraction retained below.
- Original presentation files were read but **not copied or uploaded**; only embedded images were copied into `/notes/files/capstone/`.

<details><summary>Full extracted PPTX slide text</summary>
<pre>
--- SLIDE 1 ---
Capstoneproject 
By: Ahmad AnaswehSupervised By: Eng.Mohannad Yousef

--- SLIDE 2 ---
Company’s Environment Architecture 
UVPN company operates a network infrastructure that contains multiple operating systems with 2 windows machines , Lubuntu and Pfsense firewall 2.1.3 that is based on FreeBSD operating system, the company&#39;s Network architecture is hybrid containing FTP and MySQL on-premises and S3 storage service running on AWS platform and WEB service running on Ubuntu OS on Azure platform which is both a cloud-based service the employees use day-to-day operations, and all the machines are set up to forward logs to cloud-based Splunk

--- SLIDE 3 ---
Vulnerabilities &amp; Weaknesses
Command injection &amp; privilege escalation
It’s an incorrect use of dynamic memory during program operation. If after freeing a memory location, a program does not clear the pointer to that memory, an attacker can use the error to hack the program.
Use After Free
is a vulnerability that lets a malicious hacker trick an application into executing operating system (OS) commands, in our case this led to privilege escalationThat gave higher privilege user
is&#160;an attack that injects arbitrary characters into a web page. When an application does not properly handle user-supplied data, an attacker can supply content to a web application
Content Injection
a strategy for giving clients access to files with the goal that they don&#39;t have to authenticate themselves to the server
FTP Anonymous access 

--- SLIDE 4 ---
CVE-2014-6305 PfSense =&lt;2.1.4 Command Injection Vulnerability and privilege escalation:In our case such vulnerability has happened through the diag_testport.php page in pfSense that allows users to test network ports using the srcport panel. In this case, the vulnerability allows an attacker to manipulate the input parameters through adding ( ;; ) to the command instead of the port, to inject and execute unauthorized commands. The lack of proper input validation and sanitization in diag_testport.php makes it vulnerable to this type of attack.

--- SLIDE 5 ---
CVE 2018-9958 2018-9948  Foxit reader 9.0 Pointer Overwrite Use-After-Free:Is a vulnerability related to incorrect use of dynamic memory during program operation, If after freeing a memory location, a program does not clear the pointer to that memory, an attacker can use the error to hack the program.The desktop application thinks it has the wanted data, but actually it may not, and there is 3 possibilities on what will happen when the program try to access memory that should not be using anymore, ether it crashes, corrupt the data or cause a vulnerability.

--- SLIDE 6 ---
Look at meI am the boss now

--- SLIDE 7 ---

EDB-ID: 41223  WordPress Core 4.7.0/4.7.1 - Content Injection:is a security vulnerability that allows unauthenticated users to edit posts and contents using REST API , to exploit this vulnerability, an attacker would need to send a POST request to the /wp-json/wp/v2/posts or /wp-json/wp/v2/pages endpoint with a JSON payload containing the updated content. The attacker does not need to be logged in or registered in the first place to the WordPress website to do this.

--- SLIDE 8 ---

--- SLIDE 9 ---
Mitigations for pfsense are as follows:Upgrade to pfSense 2.1.4How did they fix it: The srcport value is now checked to ensure that it is a valid port number.The srcport value is now escaped before being passed to the exec() function.In old versions of PFsense firewalls the hash that was used for the stored passwords in config.xml was md5 which is a vulnerable hash that was compromised. 

--- SLIDE 10 ---
Mitigations for WordPress are as follows:To protect from such vulnerability is update to the 4.7.2 version or the latest version ,which will prevent any content injection attack, the update contains implementation of input validation in the REST API endpoints , that will check any request for editing or updating ether pages or posts (anything editable ), plus the WordPress software now will validate the data too to make sure it does not contain any malicious codeIf the attacker injects malicious data, the new WordPress version will reject the injection and prevent the malicious code from being stored in the database or displayed on the website

--- SLIDE 11 ---
Mitigations for Foxit are as follows:1- Improved memory management and using smart pointers 2- Added additional security checks3- Fixed known user-after-free vulnerabilities in their code

--- SLIDE 12 ---
Mitigations for anonymous login are as follows:Moving any sensitive information on the FTP server and disabling anonymous login making sure no unauthorized access to FTP nor Telnet Making only authenticated people able to access the FTP server and removing any sensitive information out of the FTP to somewhere else.	
</pre>
</details>

<details><summary>Full extracted presentation PDF text</summary>
<pre>Vulnerabilities &amp; WeaknessesCommand injection &amp; Use After Free Content Injection privilege escalationis a vulnerability that It’s an incorrect use of is an attack that FTP Anonymous lets a malicious dynamic memory injects arbitrary access 	hacker trick an 	during program 	characters into a application into operation. If after web page. When an a strategy for executing operating freeing a memory application does not giving clients access to files system (OS) 	location, a program 	properly handle commands, in our does not clear the user-supplied data, with the goal case this led to pointer to that an attacker can that they privilege escalation	memory, an attacker 	supply content to a 	don&#39;t have to That gave higher 	can use the error to 	web application	authenticate privilege user	hack the program.	themselves to the server</pre>
</details>

## Embedded presentation figures

<section class="capstone-gallery"><figure><img loading="lazy" src="/notes/files/capstone/presentation-image-001.png" alt="Capstone presentation embedded image presentation-image-001.png"><figcaption>presentation-image-001.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-002.png" alt="Capstone presentation embedded image presentation-image-002.png"><figcaption>presentation-image-002.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-003.jpg" alt="Capstone presentation embedded image presentation-image-003.jpg"><figcaption>presentation-image-003.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-004.png" alt="Capstone presentation embedded image presentation-image-004.png"><figcaption>presentation-image-004.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-005.png" alt="Capstone presentation embedded image presentation-image-005.png"><figcaption>presentation-image-005.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-006.jpg" alt="Capstone presentation embedded image presentation-image-006.jpg"><figcaption>presentation-image-006.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-007.jpg" alt="Capstone presentation embedded image presentation-image-007.jpg"><figcaption>presentation-image-007.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-008.jpg" alt="Capstone presentation embedded image presentation-image-008.jpg"><figcaption>presentation-image-008.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-009.jpg" alt="Capstone presentation embedded image presentation-image-009.jpg"><figcaption>presentation-image-009.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-010.jpg" alt="Capstone presentation embedded image presentation-image-010.jpg"><figcaption>presentation-image-010.jpg</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-011.png" alt="Capstone presentation embedded image presentation-image-011.png"><figcaption>presentation-image-011.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-012.png" alt="Capstone presentation embedded image presentation-image-012.png"><figcaption>presentation-image-012.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-013.png" alt="Capstone presentation embedded image presentation-image-013.png"><figcaption>presentation-image-013.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-014.png" alt="Capstone presentation embedded image presentation-image-014.png"><figcaption>presentation-image-014.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-015.png" alt="Capstone presentation embedded image presentation-image-015.png"><figcaption>presentation-image-015.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-016.png" alt="Capstone presentation embedded image presentation-image-016.png"><figcaption>presentation-image-016.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-017.png" alt="Capstone presentation embedded image presentation-image-017.png"><figcaption>presentation-image-017.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-018.png" alt="Capstone presentation embedded image presentation-image-018.png"><figcaption>presentation-image-018.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-019.png" alt="Capstone presentation embedded image presentation-image-019.png"><figcaption>presentation-image-019.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-020.png" alt="Capstone presentation embedded image presentation-image-020.png"><figcaption>presentation-image-020.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-021.png" alt="Capstone presentation embedded image presentation-image-021.png"><figcaption>presentation-image-021.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-022.png" alt="Capstone presentation embedded image presentation-image-022.png"><figcaption>presentation-image-022.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-023.png" alt="Capstone presentation embedded image presentation-image-023.png"><figcaption>presentation-image-023.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-024.png" alt="Capstone presentation embedded image presentation-image-024.png"><figcaption>presentation-image-024.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-025.png" alt="Capstone presentation embedded image presentation-image-025.png"><figcaption>presentation-image-025.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-026.png" alt="Capstone presentation embedded image presentation-image-026.png"><figcaption>presentation-image-026.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-027.png" alt="Capstone presentation embedded image presentation-image-027.png"><figcaption>presentation-image-027.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-028.png" alt="Capstone presentation embedded image presentation-image-028.png"><figcaption>presentation-image-028.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-029.png" alt="Capstone presentation embedded image presentation-image-029.png"><figcaption>presentation-image-029.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-030.png" alt="Capstone presentation embedded image presentation-image-030.png"><figcaption>presentation-image-030.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-031.png" alt="Capstone presentation embedded image presentation-image-031.png"><figcaption>presentation-image-031.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-032.png" alt="Capstone presentation embedded image presentation-image-032.png"><figcaption>presentation-image-032.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-033.png" alt="Capstone presentation embedded image presentation-image-033.png"><figcaption>presentation-image-033.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-034.png" alt="Capstone presentation embedded image presentation-image-034.png"><figcaption>presentation-image-034.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-035.png" alt="Capstone presentation embedded image presentation-image-035.png"><figcaption>presentation-image-035.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-036.png" alt="Capstone presentation embedded image presentation-image-036.png"><figcaption>presentation-image-036.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-037.png" alt="Capstone presentation embedded image presentation-image-037.png"><figcaption>presentation-image-037.png</figcaption></figure>
<figure><img loading="lazy" src="/notes/files/capstone/presentation-image-038.png" alt="Capstone presentation embedded image presentation-image-038.png"><figcaption>presentation-image-038.png</figcaption></figure>
</section>
