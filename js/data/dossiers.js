/**
 * THE EPOCH - 10 Suspect Dossier Database
 * Data matches the physical dossierA5 print cards exactly.
 * 4 MAIN suspects ("UNDER INVESTIGATION") + 6 WITNESS/decoy records
 * ("UNDER REVIEW"). Suspect clearance is slot-based (see state.js) —
 * these type tags are for GM record-keeping only, not for gating.
 */

export const SUSPECTS = [
  {
    id: "01",
    code: "DOSSIER 01/10",
    name: "Ram Sharma",
    role: "Junior Developer, Database Access: Write",
    type: "MAIN",
    stamp: "UNDER INVESTIGATION",
    lastSeen: "Badge log shows exit at 6:02 PM. No re-entry recorded.",
    alibi: "\"I logged out and went home. I wasn't anywhere near the server room after six.\"",
    motive: "None on record — but his is the only account with write access to the tables that were wiped.",
    notes: ""
  },
  {
    id: "02",
    code: "DOSSIER 02/10",
    name: "Prof. Anand Rao",
    role: "Faculty, Retired Friday",
    type: "MAIN",
    stamp: "UNDER INVESTIGATION",
    lastSeen: "Left the farewell lunch at 5:40 PM. Badge shows no re-entry that night.",
    alibi: "\"I said my goodbyes and I meant them. I had no reason to go back to that server.\"",
    motive: "Pushed into early retirement after a public dispute with Meera over a funding call she made two years ago.",
    notes: ""
  },
  {
    id: "03",
    code: "DOSSIER 03/10",
    name: "Kavya Sethi",
    role: "Receptionist",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Reception Desk",
    alibi: "\"Meera stayed behind after most people had left. I saw Anand leave through the main entrance.\"",
    motive: "None",
    notes: "Places Meera inside the building after the farewell."
  },
  {
    id: "04",
    code: "DOSSIER 04/10",
    name: "Sana Iqbal",
    role: "Security Guard",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Main Security Desk",
    alibi: "\"My shift was the evening shift. Anand Rao left through the main entrance at 5:40 PM. After that, the building gradually emptied.\"",
    motive: "None",
    notes: "Confirms Anand left the building early in the evening."
  },
  {
    id: "05",
    code: "DOSSIER 05/10",
    name: "Divya Mehta",
    role: "AI-Ops Lead, manages agent \"SAGE\"",
    type: "MAIN",
    stamp: "UNDER INVESTIGATION",
    lastSeen: "Calendar shows \"working late — deployment.\" No witnesses.",
    alibi: "\"SAGE runs unattended overnight, I wasn't watching it. I never am.\"",
    motive: "Exposed SAGE's database permissions last month — to the exact tables that are now missing.",
    notes: ""
  },
  {
    id: "06",
    code: "DOSSIER 06/10",
    name: "Nikhil Batra",
    role: "Farewell Party Server",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Main Conference Hall",
    alibi: "\"I was working the farewell party that evening. Meera seemed to be in a good mood. Most people left after the event, but Meera stayed back to speak with a few colleagues.\"",
    motive: "None",
    notes: "No known connection to the murder. Worked the farewell event. Saw Anand speaking with Meera. Helped with cleanup after the party."
  },
  {
    id: "07",
    code: "DOSSIER 07/10",
    name: "Rohan Malhotra",
    role: "Janitor/Housekeeping Staff",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Employee Cabins",
    alibi: "\"I was making my final cleaning round when I found Meera inside her cabin. She wasn't moving, so I called security.\"",
    motive: "None",
    notes: "First person to report the incident. Discovered Meera's condition. Did not touch anything inside the cabin. Was working late because of the farewell cleanup."
  },
  {
    id: "08",
    code: "DOSSIER 08/10",
    name: "K. Verma",
    role: "Grants Accountant",
    type: "MAIN",
    stamp: "UNDER INVESTIGATION",
    lastSeen: "No badge entry recorded that evening — he was never in the building at all.",
    alibi: "\"I was home. Check the logs — I'm not even on them.\"",
    motive: "The grant ledger shows funds routed to a department that, on paper, does not exist.",
    notes: ""
  },
  {
    id: "09",
    code: "DOSSIER 09/10",
    name: "Arjun Nair",
    role: "CCTV & Surveillance Technician",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Security Monitoring Room",
    alibi: "\"I was checking the surveillance system after the incident. The server wipe damaged the CCTV index, so several recordings were initially inaccessible.\"",
    motive: "None",
    notes: "CCTV footage from the night of the incident was initially unavailable. Recovery was possible."
  },
  {
    id: "10",
    code: "DOSSIER 10/10",
    name: "Priya Menon",
    role: "Facilities / Maintenance Assistant",
    type: "DECOY",
    stamp: "UNDER REVIEW",
    lastSeen: "Service Corridor",
    alibi: "\"The rear service door was being used during cleanup. It doesn't record employee badge entries like the main entrance.\"",
    motive: "None",
    notes: "Explains how someone could enter or leave without a normal employee badge record. Assisted with post-party cleanup. Familiar with the service corridor. Service access remained available during cleanup."
  }
];
