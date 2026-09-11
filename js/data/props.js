/**
 * THE GRANT LEDGER - Master Physical Prop Bible Digital Facsimiles
 * Contains full textual & visual data representations of evidence props P01 - P29
 */

export const PROPS = {
  // P01: Farewell Card
  "P01": {
    id: "P01",
    title: "Farewell Greeting Card (Prof. Anand Rao)",
    category: "PHYSICAL_DOCUMENT",
    level: 1,
    tag: "HIGH_IMPACT",
    description: "An A5 folded card signed by department colleagues on Friday morning for Prof. Rao's retirement.",
    visualType: "CARD",
    content: {
      header: "HONORING PROFESSOR ANAND RAO — 30 YEARS OF ACADEMIC EXCELLENCE",
      subtext: "Colleagues & Research Department Signatures",
      signatures: [
        { name: "Meera Kapoor", note: "Thank you for the guidance and ethical standard.", ink: "#111111", isBlue: false },
        { name: "Arjun Kapoor", note: "Smooth sailing into retirement!", ink: "#181818", isBlue: false },
        { name: "Divya Mehta", note: "May your servers never crash, Prof!", ink: "#222222", isBlue: false },
        { name: "Prof. Anand Rao", note: "Integrity in research is our only enduring currency. Best wishes always.", ink: "#1a56db", isBlue: true, signatureText: "Prof. Anand Rao" },
        { name: "Vikram Sethi", note: "All the best, Professor.", ink: "#1a1a1a", isBlue: false },
        { name: "Pooja Malhotra", note: "A well deserved rest! Congrats.", ink: "#252525", isBlue: false },
        { name: "Ram Sharma", note: "Learned a ton from you!", ink: "#141414", isBlue: false },
        { name: "K. Verma", note: "Best regards from Financial Operations.", ink: "#0a0a0a", isBlue: false }
      ],
      annotation: "A physical retirement greeting card recovered from the department desk, displaying eight colleague signatures."
    }
  },

  // P02 / P03: Blue Pen & Sticky Note
  "P03": {
    id: "P03",
    title: "Meera's Personal Desk Note (Blue Pen)",
    category: "NOTE",
    level: 1,
    tag: "CRITICAL_CLUE",
    description: "A bright yellow adhesive sticky note recovered from the bottom edge of Meera's monitor bezel.",
    visualType: "STICKY_NOTE",
    content: {
      text: `Dad gave me this pen after our worst argument.

Strange how some things become more valuable after they're almost lost.

He said a gift means more when you give it after choosing to forgive.

I've kept it ever since.

Maybe that's why I don't think of it as a pen anymore.

It's a reminder.

If I ever give this away, it won't be because I forgot what it means.

It will mean I've chosen to trust someone again.`
    }
  },

  // P04: Meera Kapoor Personal Particulars Dossier & Authentication Key
  "P04": {
    id: "P04",
    title: "Personal Particulars Dossier: Meera Kapoor (Lead Profile)",
    category: "DOSSIER",
    level: 0,
    tag: "AUTHENTICATION_KEY",
    description: "Official personal particulars card for Meera Kapoor, Chief Data Scientist & Project SAGE Lead. Recorded as supplied by next of kin and colleagues.",
    visualType: "PERSONAL_PARTICULARS",
    content: {
      header: "PERSONAL PARTICULARS",
      entries: [
        { code: "Cat", name: "Mochi" },
        { code: "Sibling", name: "Aarav (younger brother)" },
        { code: "Car", name: "Civic" },
        { code: "Lucky number", name: "8" },
        { code: "IELTS score", name: "9" },
        { code: "Regular haunt", name: "Saver Cafe" },
        { code: "Desk photo", name: "Her cat, asleep on a keyboard" }
      ],
      recordedNote: "Recorded as supplied by next of kin and colleagues.",
      investigatorNotesHeader: "INVESTIGATOR'S NOTES",
      colleagueStatement: "Colleague statement: \"She used to joke she didn't want one cat, she wanted eight. Just like MOCHI.\"",
      resultCipher: "Password Token: [LUCKY NUMBER] + [CAT'S NAME] = '8MOCHI'"
    }
  },

  // P06: Divya Deployment Report
  "P06": {
    id: "P06",
    title: "CI/CD Pipeline Deployment Audit Report #8812",
    category: "SYSTEM_REPORT",
    level: 2,
    tag: "FORENSIC_PROOF",
    description: "Automated Jenkins/GitLab pipeline execution log for permission module deployment.",
    visualType: "CODE_LOG",
    content: {
      jobName: "JOB-PERMISSIONS-SYNC-PROD",
      triggeredBy: "divya.mehta (DevOps)",
      startTime: "03:10:14 UTC",
      endTime: "03:19:42 UTC",
      exitCode: "EXIT_STATUS 1 (FAILED)",
      summary: `[03:10:14] Pipeline initialized by user: divya.mehta
[03:12:05] Docker container spawned: runner-devops-09
[03:14:22] Running pre-flight security lint... PASS
[03:17:50] Validating authorization signature token...
[03:19:40] ERROR: Signature verification failed. Meera Kapoor reject flag active (PR #104).
[03:19:42] DEPLOYMENT TERMINATED AND ROLLED BACK. ZERO PERMISSION ELEVATIONS APPLIED.
[03:19:43] Container destroyed. User divya.mehta session logged out.`
    }
  },

  // P07: Pull Request #104
  "P07": {
    id: "P07",
    title: "Code Review / Pull Request #104: Permission Override Scope",
    category: "CODE_REVIEW",
    level: 2,
    tag: "EVIDENCE",
    description: "Git repository pull request showing Meera's explicit rejection of the proposed permission expansion.",
    visualType: "GIT_PR",
    content: {
      prNumber: "#104",
      author: "divya.mehta",
      reviewer: "meera.kapoor",
      status: "REJECTED_BLOCKED",
      timestamp: "Thursday 23:45 UTC",
      comment: "Meera Kapoor: 'Divya, this change expands arbitrary grant modification rights without dual comptroller approval. I cannot merge or authorize this in production. Fix the scope or close the PR.'"
    }
  },

  // P10: Badge Turnstile Access Log
  "P10": {
    id: "P10",
    title: "Server Access Log",
    category: "SECURITY_LOG",
    level: 2,
    tag: "RAW_LOG",
    description: "Describes that who have accessed the EPOCH-CORP server at what time.",
    visualType: "TABLE",
    content: {
      date: "Friday, Incident Night",
      records: [
        { time: "01:52:10 AM", badgeId: "EMP-408", name: "Pooja Malhotra", gate: "Exit Turnstile 01", direction: "OUT" },
        { time: "02:15:44 AM", badgeId: "EMP-312", name: "Ritu Ahuja", gate: "Exit Turnstile 02", direction: "OUT" },
        { time: "02:44:18 AM", badgeId: "FAC-002", name: "Prof. Anand Rao", gate: "Exit Turnstile 01", direction: "OUT" },
        { time: "03:27:51 AM", badgeId: "EMP-515", name: "Ram Sharma", gate: "Exit Turnstile 01", direction: "OUT" },
        { time: "03:30:12 AM", badgeId: "SEC-001", name: "Arun Kumar", gate: "Internal Server Corridor", direction: "IN_PATROL" },
        { time: "03:38:47 AM", badgeId: "EMP-209", name: "Divya Mehta", gate: "Server Room Corridor Enetered", direction: "IN (LAST VERIFIED ENTRY)" }
      ],
    }
  },

  // P14 & P15: Office Network Map & DHCP Lease Table
  "P15": {
    id: "P15",
    title: "Network DHCP Lease Table & Endpoint Inventory",
    category: "NETWORK_TABLE",
    level: 3,
    tag: "TECH_TRACE",
    description: "Internal router core DHCP lease table for subnet 192.168.14.0/24.",
    visualType: "TABLE",
    content: {
      leases: [
        { ws: "WS-01", ip: "192.168.14.10", mac: "3C:97:0E:55:12:F1", user: "Arjun Kapoor", room: "Executive Reception", leaseState: "Active" },
        { ws: "WS-02", ip: "192.168.14.12", mac: "B2:44:11:89:FE:02", user: "Prof. Anand Rao", room: "Faculty Annex 3B", leaseState: "Expired (02:45)" },
        { ws: "WS-07", ip: "192.168.14.27", mac: "A4:7B:09:11:2C:8F", user: "(Unassigned)", room: "Developer Bay", leaseState: "Idle" },
        { ws: "WS-09", ip: "192.168.14.32", mac: "B8:2A:72:44:91:10", user: "Divya Mehta", room: "DevOps Lab", leaseState: "Idle" },
        { ws: "WS-11", ip: "192.168.14.50", mac: "E0:D5:5E:77:4A:19", user: "Vikram Sethi", room: "IT Service Desk", leaseState: "Active" },
        { ws: "WS-14", ip: "192.168.14.18", mac: "C1:5F:31:82:17:AA", user: "Ram Sharma", room: "Developer Bay (Terminal 14)", leaseState: "Active" },
        { ws: "WS-15", ip: "192.168.14.41", mac: "D2:11:88:33:5A:04", user: "Ritu Ahuja (Finance)", room: "Finance Room", leaseState: "Idle" }
      ]
    }
  },

  // P17 / P18: Remote Session Log
  "P18": {
    id: "P18",
    title: "Firewall Core Remote-Session Audit Log",
    category: "NETWORK_LOG",
    level: 3,
    tag: "SMOKING_GUN",
    description: "Internal RDP / SSH remote tunnel connection tracking log.",
    visualType: "TERMINAL_SNIPPET",
    content: {
      rawLog: `[03:39:18 UTC] SESSION AUTHENTICATED AT WS-14
SOURCE:      WS-14 (192.168.14.18) [Developer Bay - Terminal 14]
PORT:        443 / TLS 1.3
AUTH:        CREDENTIALS ACCEPTED, NO FAILED ATTEMPTS
STATUS:      SESSION CONFIRMED

[03:40:02 UTC] REMOTE PROCESS SPAWNED: powershell.exe -NoProfile -ExecutionPolicy Bypass
[03:41:00 UTC] QUERY DISPATCHED: GRANT-LEDGER MASTER DB
[03:41:15 UTC] PERMISSION WRITE INJECTED INTO DB AUDIT PIPE
[03:44:30 UTC] DISK WIPE INVOKED: sdelete64.exe -p 3 -z \\\\MEERA-LAPTOP\\C$\\Ledgers\\`
    }
  },

  // P21: Verma Flight Ticket
  "P21": {
    id: "P21",
    title: "Electronic Boarding Pass: Flight QA-402",
    category: "TRAVEL_DOCUMENT",
    level: 4,
    tag: "FALSE_ALIBI",
    description: "Verma's submitted airline boarding pass used to claim presence outside the city.",
    visualType: "BOARDING_PASS",
    content: {
      airline: "Quick Air Regional Lines",
      flight: "QA-402",
      passenger: "VERMA / K MR",
      seat: "D4B (Business Class)",
      from: "DEL (Terminal 3)",
      to: "BOM (Chhatrapati Shivaji Intl)",
      boardingTime: "02:15 AM",
      departureDate: "11 September 2026",
      gate: "G-14",
      pnr: "7XK3LQ",
      ticketNo: "QAR2409875316",
      seq: "072",
      statusNote: "ELECTRONIC TICKET ISSUED ONLINE. VALIDATION PENDING AT AIRPORT SCANNER."
    }
  },

  // P22: Airport Departure Manifest
  "P22": {
    id: "P22",
    title: "Civil Aviation Airport Departure Manifest (Flight QA-402)",
    category: "OFFICIAL_RECORD",
    level: 4,
    tag: "CONTRADICTION",
    description: "Official airline flight manifest submitted to civil aviation authority post-departure.",
    visualType: "TABLE",
    content: {
      flight: "QA-402",
      actualDeparture: "02:51 AM",
      totalManifest: "142 Passengers",
      excerpt: [
        { seat: "04A", name: "Singhania, Rajesh", status: "BOARDED (Gate Scan 02:22)" },
        { seat: "04B", name: "Verma, K.", status: "NO SHOW / NOT BOARDED (NO GATE SCAN)" },
        { seat: "04C", name: "Deshmukh, Sunita", status: "BOARDED (Gate Scan 02:30)" }
      ],
      conclusion: "VERMA, K. DID NOT BOARD FLIGHT QA-402. THE TICKET WAS BOOKED BUT NEVER USED."
    }
  },

  // P23: Campus Parking Garage Receipt
  "P23": {
    id: "P23",
    title: "Campus Smart Parking Garage Sensor Ticket",
    category: "PARKING_TICKET",
    level: 4,
    tag: "PHYSICAL_PRESENCE",
    description: "Automated license plate recognition (ALPR) ticket for underground executive parking.",
    visualType: "RECEIPT",
    content: {
      facility: "EPOCHCORP Executive Parking",
      vehiclePlate: "DL-04-CA-8821 (Toyota Camry — Registered to: K. Verma)",
      entryDate: "11 September 2026",
      entryTimestamp: "01:15 PM",
      exitTimestamp: "ACTIVE / NOT CHECKED OUT",
      currentLocation: "Slot B-14 (Still parked during incident window 03:00 - 04:00 AM)",
      receiptId: "EP-20260911-0115-7783",
      amountDue: "Pending on exit checkout"
    }
  },

  // P24: CCTV Clock Calibration Report
  "P24": {
    id: "P24",
    title: "Security Operations CCTV Clock Calibration Report",
    category: "FORENSIC_REPORT",
    level: 4,
    tag: "CLOCK_OFFSET",
    description: "Internal security memorandum regarding timestamp drift on building surveillance cameras.",
    visualType: "MEMO",
    content: {
      author: "Surveillance Maintenance Division",
      cameraTarget: "CAM-02: 2nd Floor Restricted Admin Corridor",
      date: "Incident Week",
      findings: `AUDIT NOTICE:
Due to an unresolved CMOS battery failure and NTP synchronization timeout on Camera Node 02 (Restricted Admin Corridor), the recorded on-screen timestamp is severely drifted.

MEASURED DRIFT: The camera hardware clock is running EXACTLY 13 MINUTES SLOW (-00:13:00).
CORRECTION FORMULA:
TRUE_NTP_TIME = RECORDED_CCTV_TIME + 00:13:00.

Example: A figure recorded entering at 03:28:15 was ACTUALLY physically present at 03:41:15!`
    }
  },

  // P26: The Grant Ledger (Compromised & Restored)
  "P26": {
    id: "P26",
    title: "Grant Allocation Master Ledger: 2026 Q3 Disbursals",
    category: "FINANCIAL_RECORD",
    level: 5,
    tag: "THE_FRAUD",
    description: "The sensitive financial spreadsheet Meera was maintaining before the remote wipe.",
    visualType: "SPREADSHEET",
    content: {
      organization: "EPOCHCORP Grant Treasury",
      records: [
        { code: "GR-8801", recipient: "Quantum Computing Lab", dept: "Physics Institute", amount: "$350,000", approvedBy: "Meera Kapoor", status: "VERIFIED" },
        { code: "GR-8802", recipient: "Neural Interface Bio-Core", dept: "Neurosciences", amount: "$520,000", approvedBy: "Meera Kapoor", status: "VERIFIED" },
        { code: "GR-8803", recipient: "High-Performance Energy Storage", dept: "Materials Science", amount: "$410,000", approvedBy: "Meera Kapoor", status: "VERIFIED" },
        { code: "GR-8899", recipient: "Discretionary Research Reserve", dept: "NULLDEPT", amount: "$1,480,000", approvedBy: "K. VERMA", status: "EMBEZZLED / SUSPICIOUS" }
      ],
      fraudAnalysis: "Department 'NULLDEPT' does not exist in any university or institutional directory. 1.48 Million Dollars was authorized for diversion directly by K. VERMA, and Meera was targeted right after flagging this record!"
    }
  },

  // SERVER FOLDER PROPS (Dedicated Central Infrastructure Files)
  "S01": {
    id: "S01",
    title: "SAGE Database — Corruption & Recovery Telemetry",
    category: "SERVER_SYSTEM",
    level: 1,
    tag: "WIPE_MONITOR",
    description: "Real-time kernel telemetry dump from mainframe host EPOCH-01, hosting Project SAGE.",
    visualType: "SERVER_WIPE",
    content: {
      progress: "61%",
      recordsDestroyed: "SAGE DATABASE CORRUPTION DETECTED",
      serverTime: "04:12:10",
      process: "sage-integrity-monitor (PID 4412)",
      runningAs: "SYSTEM",
      sessionOrigin: "WS-14 - physical console",
      authenticatedUser: "UNKNOWN",
      stopAuthority: "master recovery key only",
      locksCleared: "1 of 5",
      lastLegitRecoveryAttempt: "02:51 AM",
      recoveryInitiatedBy: "DIVYA MEHTA",
      recoveryResult: "FAILED",
      recoveryFailReason: "EXTERNAL WIPE PROCESS DETECTED",
      firstDetectedWipeActivity: "03:21 AM",
      databaseIntegrityFailure: "03:41 AM",
      attentionRequired: "Current corruption detected: 61%. Last legitimate recovery attempt: 02:51 AM, initiated by DIVYA MEHTA — result: FAILED (reason: EXTERNAL WIPE PROCESS DETECTED). First detected wipe activity: 03:21 AM. Database integrity failure: 03:41 AM."
    }
  },

  "S02": {
    id: "S02",
    title: "Facility Physical Access Log: Prof. Anand Rao",
    category: "ACCESS_LOG",
    level: 1,
    tag: "PHYSICAL_ALIBI",
    description: "Verified keycard and turnstile timestamps for Prof. Anand Rao.",
    visualType: "TABLE",
    content: {
      events: [
        { time: "01:30 PM", gate: "Main Foyer Gate 01", event: "ENTRY - Farewell reception check-in" },
        { time: "02:15 AM", gate: "Faculty Lounge 3B", event: "DOOR UNLOCK - Office clearing" },
        { time: "02:40 AM", gate: "Department Floor 2", event: "PRESENCE - Farewell card signed at Meera's desk" },
        { time: "02:44 AM", gate: "Perimeter Turnstile Exit 01", event: "EXIT - Departed campus on time via transit hub" }
      ],
      note: "Prof. Rao left the campus premises at 02:44 AM and did not re-enter. His physical departure occurred well before the 03:32 AM wipe."
    }
  },

  "S03": {
    id: "S03",
    title: "Server & Terminal Access Log: Dev & DevOps Cluster",
    category: "SERVER_LOG",
    level: 2,
    tag: "TECHNICAL_TRAIL",
    description: "Terminal and database session transactions during the critical window.",
    visualType: "SERVER_ACCESS_LOG",
    content: {
      events: [
        { time: "03:10 AM", user: "divya.mehta", station: "WS-09", action: "SAGE permission restore attempt initiated", targetFile: "sage_permission_audit.py" },
        { time: "03:19 AM", user: "divya.mehta", station: "WS-09", action: "Restore attempt failed and aborted", targetFile: "sage_permission_audit.py" },
        { time: "03:21 AM", user: "ram.sharma", station: "WS-07", action: "Workstation terminal accessed / code push sync", targetFile: "repo_sync.sh" },
        { time: "03:27 AM", user: "ram.sharma", station: "WS-07", action: "Session disconnected / Turnstile exit recorded", targetFile: "logout" },
        { time: "03:41 AM", user: "divya.mehta", station: "WS-07 (Remote via WS-14)", action: "UNAUTHORIZED: Database permission escalation executed", targetFile: "sage_permission_audit.py" }
      ],
      clickableFile: "sage_permission_audit.py"
    }
  },

  "S04": {
    id: "S04",
    title: "Internal Communications: Meera Kapoor & Divya Mehta",
    category: "CHAT_ARCHIVE",
    level: 2,
    tag: "INTERNAL_MSG",
    description: "Archived Slack/Teams direct messaging thread from Thursday evening.",
    visualType: "CHAT",
    content: {
      messages: [
        { sender: "Meera Kapoor", time: "Thursday 23:48", text: "Divya, I rejected PR #104. Your deployment script has multiple errors and array indexing bugs. Do NOT run this in production without fixing the logic. Dual approval is required." },
        { sender: "Divya Mehta", time: "Thursday 23:51", text: "Understood Meera. I'll test it in sandbox first." },
        { sender: "Divya Mehta", time: "Friday 03:19", text: "Meera, tried a dry-run test container. As you said, it failed and aborted at 03:19 with exit status 1. Nothing got deployed. I'm clocking out and heading home." },
        { sender: "Meera Kapoor", time: "Friday 03:20", text: "Good. We will review it on Monday morning. Get some sleep." }
      ]
    }
  }
};

