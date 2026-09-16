# THE EPOCH — Tech Investigation Escape Room

> **A story-driven, technology-themed escape room combining web-based investigation, coding, networking, CCTV analysis, physical evidence, and real-time team gameplay.**

---

## 🕵️ Overview

**THE EPOCH** is an interactive technology investigation and escape-room experience designed around a fictional digital security incident.

Players enter the role of an **Emergency Recovery Squad** tasked with investigating a compromised computer system before an automated data wipe permanently destroys the evidence.

The experience combines a **browser-based interactive computer environment** with **physical investigation props**, requiring participants to move between digital interfaces, physical clues, programming challenges, networking puzzles, CCTV footage, and evidence-based decision making.

The game was designed to be:

- Technical, but accessible to non-experts
- Story-driven rather than purely puzzle-based
- Collaborative and team-oriented
- A combination of physical and digital gameplay
- Suitable for simultaneous participation by multiple teams
- Manageable by organizers during a live event

---

# 🏆 Created for ANVIKSHA 3.o

**THE EPOCH was conceptualized, developed, tested, and deployed specifically for ANVIKSHA**, a college technical event organized by us.

The goal was to create a technical event that felt more like an **interactive investigation** than a conventional coding or quiz competition.

Participants were given a fixed amount of time to investigate the incident, solve interconnected challenges, collect evidence, and reach a final conclusion.

### Event Result

The event was successfully conducted with **15+ participating teams**.

Teams simultaneously interacted with the deployed game from separate computers while using physical investigation material provided as part of the experience.

```text
Event        : ANVIKSHA
Experience   : THE EPOCH
Format       : Tech Investigation Escape Room
Participation: 15+ Teams
Gameplay     : Digital + Physical
Duration     : 60 Minutes
Status       : Successfully Conducted
🎬 The Story

The investigation begins with Meera Kapoor.

Meera discovers suspicious irregularities in sensitive grant records stored within her system. Shortly afterward, her computer is compromised and an automated system wipe begins.

The evidence is at risk.

Participants are brought in as an emergency recovery team with one objective:

Investigate the system, recover the evidence, determine what happened, and stop the wipe before it is too late.

The investigation gradually moves from simple system access into programming, networking, surveillance, and evidence correlation.

🧩 Gameplay

The complete experience follows a progressive investigation pipeline:

┌─────────┐
│ ACCESS  │
└────┬────┘
     ↓
┌─────────┐
│ DEBUG   │
└────┬────┘
     ↓
┌─────────┐
│ TRACE   │
└────┬────┘
     ↓
┌─────────┐
│ RECOVER │
└────┬────┘
     ↓
┌─────────┐
│ RESTORE │
└─────────┘

Each stage unlocks information required for the next stage, creating a connected investigation rather than a collection of independent puzzles.

1. ACCESS — Enter Meera's System

Players begin at Meera's computer authentication screen.

After successfully accessing the system, players enter an interactive desktop environment that becomes the central hub for the investigation.

From the desktop, teams can access different digital tools, databases, and evidence.

2. INVESTIGATE — Suspect Database

The investigation begins with a digital suspect database containing multiple dossiers.

Participants must examine the available information and correlate it with physical evidence supplied during the event.

The database contains:

Main investigation subjects
Witnesses
Decoy dossiers
Statements
Supporting information

Players are required to make evidence-based decisions rather than simply guessing.

Certain suspects can only be finalized after completing the relevant investigation requirements.

3. DEBUG — Programming Challenge

Progressing through the investigation unlocks a corrupted recovery-code challenge.

Participants must inspect the code, identify intentional programming errors, and correct them.

The challenge was designed to be approachable for participants with different programming backgrounds and can be solved using one of multiple supported programming languages.

The intentionally introduced errors involve concepts including:

Indentation
Equality comparison
Variable naming
Range and indexing
Program logic

The challenge demonstrates how programming knowledge can become part of an investigation rather than existing as an isolated coding question.

4. TRACE — Network Investigation

After the debugging stage, players gain access to a network tracing interface.

Teams must analyze the available network information and determine which workstation is relevant to the investigation.

The network investigation leads to:

WS-14

Successfully solving the network challenge unlocks the surveillance stage.

5. RECOVER — CCTV & Travel Evidence

The next stage introduces surveillance evidence.

Players investigate multiple sources, including:

Building corridor/office footage
Executive parking footage
Boarding/gate information

The objective is not simply to watch the footage, but to correlate timestamps, locations, and other available evidence with information discovered earlier in the investigation.

This creates a chain between the digital investigation, network analysis, and physical evidence.

6. FINAL INVESTIGATION — Build the Case

Once the required investigation stages have been completed, teams must make their final submission.

The system records:

Final suspect
Written reasoning
Submission timestamp

The written reasoning is an important part of the investigation because participants must explain why their conclusion follows from the evidence they discovered.

7. RESTORE — Stop the System Wipe

The final objective is to access the recovery environment and stop the automated system wipe.

Successfully completing the final stage results in:

EVIDENCE RESTORED
DATA WIPE STOPPED
SYSTEM SECURED

The team has successfully completed the investigation.

🧠 Physical + Digital Investigation

A major feature of THE EPOCH was its hybrid gameplay model.

The experience was intentionally designed so that participants could not rely exclusively on the website.

Alongside the digital game, teams were provided with physical investigation props that formed part of the evidence chain.

These included physical documents, clue materials, dossiers, and other investigation resources prepared specifically for the event.

Participants had to:

Examine physical evidence
Search for relevant information
Compare physical and digital clues
Correlate information across sources
Discuss findings with teammates
Use evidence to progress through the digital system

This created a physical-digital bridge:

       PHYSICAL EVIDENCE
              │
              ▼
       CLUE / INFORMATION
              │
              ▼
      DIGITAL INVESTIGATION
              │
              ▼
       TECHNICAL CHALLENGE
              │
              ▼
        NEW EVIDENCE
              │
              └───────────────┐
                              ▼
                    PHYSICAL + DIGITAL
                       CORRELATION
📄 Physical Props Documentation

The physical materials used during the ANVIKSHA event can be included in this repository as supplementary documentation.

Recommended structure:

docs/
└── THE_EPOCH_Physical_Props.pdf

The PDF can contain the physical documents, clue cards, dossiers, and other materials created for the live event.

Warning: The physical props may contain clues, answers, or investigation information. They are therefore intended as project documentation and should not be distributed to participants before gameplay.

⏱️ Time-Based Gameplay

THE EPOCH was designed around a 60-minute investigation window.

The time constraint adds urgency to the investigation while requiring teams to decide how to divide their effort between:

Physical clues
Digital investigation
Programming
Networking
Surveillance
Evidence correlation

The objective was to make time management and team communication meaningful parts of the experience.

🖥️ Interactive Game Environment

Rather than presenting the challenges as separate webpages, THE EPOCH simulates a computer environment.

The player interacts with different components through the system interface, including:

Desktop environment
Suspect database
Code editor
Network tracing interface
Server/recovery interface
CCTV viewer
Restore interface

The application uses progression-based unlocking so that completing one stage can reveal or enable the next part of the investigation.

🧑‍💼 Organizer Control

A dedicated organizer control system was implemented to help manage the live event.

The organizer interface can track team-specific information such as:

Current stage
Timer
Game status
Halt state
Halt reason
Suspect finalizations
Final suspect
Final reasoning
Submission timestamp
Wipe status
Event logs

Organizer controls also support:

Monitoring teams
Reviewing submissions
Halting a team session
Resuming a halted session
Reviewing game events

This was particularly important for the live event because multiple teams were playing simultaneously.

🏗️ Technical Architecture
                         PLAYER COMPUTERS
                    ┌─────────┬─────────┬─────────┐
                    │ Team 01 │ Team 02 │ Team .. │
                    └────┬────┴────┬────┴────┬────┘
                         │         │         │
                         └─────────┼─────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │   EXPRESS SERVER   │
                        │      Node.js       │
                        └─────────┬──────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
          Game Components     REST APIs       Team State
                 │                                 │
                 │                                 ▼
                 │                            teams.json
                 │
                 ▼
        ┌──────────────────────────────────────┐
        │                                      │
        │ ACCESS → DEBUG → TRACE → RECOVER    │
        │                          → RESTORE   │
        │                                      │
        └──────────────────────────────────────┘
🛠️ Technology Stack
Frontend
HTML5
CSS3
JavaScript
Modular JavaScript components
Interactive browser UI
Backend
Node.js
Express.js
REST APIs
Data Management
JSON-based team state
Event logging
Team progression tracking
Investigation timestamps
Final submission tracking
Development & Deployment
Git
GitHub
Render
Node Package Manager (npm)
📁 Project Structure
EscapeTheServer-TheEpoch-FINAL/
│
├── assets/
│   ├── boarding_gate_list.png
│   ├── cam_cctv.mp4
│   └── parking.jpeg
│
├── css/
│   ├── components.css
│   └── style.css
│
├── data/
│   └── teams.json
│
├── docs/
│   └── THE_EPOCH_Physical_Props.pdf
│
├── js/
│   ├── components/
│   │   ├── cctvViewer.js
│   │   ├── codeEditor.js
│   │   ├── networkViewer.js
│   │   ├── organizerModal.js
│   │   ├── restoreViewer.js
│   │   ├── serverFolderViewer.js
│   │   ├── suspectsDbViewer.js
│   │   └── terminal.js
│   │
│   ├── data/
│   │   ├── dossiers.js
│   │   └── props.js
│   │
│   ├── app.js
│   ├── audio.js
│   └── state.js
│
├── index.html
├── package.json
├── package-lock.json
├── server.js
├── START_GAME.bat
└── .gitignore
🧪 Testing & Event Validation

The application was tested across the complete gameplay flow before the live event.

Testing covered:

Authentication flow
Desktop navigation
Suspect database
Investigation progression
Code debugging
Network tracing
CCTV functionality
Evidence progression
Final suspect submission
Written reasoning submission
Timer behaviour
Team-specific state
Organizer controls
Halt/resume functionality
System wipe sequence
Final restoration
Deployment and hosted gameplay

The final system was successfully deployed and used during the ANVIKSHA event with 15+ teams.

🚀 Run Locally
Prerequisites

Install:

Node.js
npm
A modern web browser
Clone the Repository
git clone https://github.com/vanshikagoel02/escapetheserver.git

Navigate to the project:

cd escapetheserver

Install dependencies:

npm install

Start the application:

npm start

Open:

http://localhost:3000
🌐 Deployment

THE EPOCH was deployed as a Node.js web service using Render.

The deployment workflow was:

LOCAL DEVELOPMENT
       ↓
     TESTING
       ↓
       GIT
       ↓
    GITHUB
       ↓
     RENDER
       ↓
   LIVE EVENT

The project repository is connected to the deployment environment, allowing updates to be developed locally, committed through Git, pushed to GitHub, and deployed to the hosted application.

🎯 Design Philosophy

THE EPOCH was designed around several principles.

Technical Accessibility

The game introduces programming, networking, digital systems, and investigation concepts without requiring participants to be cybersecurity experts.

Connected Puzzles

Challenges are connected to the overall investigation instead of functioning as unrelated questions.

Evidence Over Guessing

Participants are encouraged to build their conclusion by correlating multiple pieces of evidence.

Physical + Digital Integration

Physical props and digital interfaces were designed to complement one another.

Team-Based Problem Solving

Different team members can investigate different evidence sources simultaneously and combine their findings.

Live Event Scalability

The application was designed to support multiple teams playing simultaneously during a college event.

Immersion

The interface, story, evidence, surveillance footage, system messages, and physical materials were designed to make participants feel like they were actually investigating a compromised system.

📊 Project Outcome

THE EPOCH was successfully taken from initial ideation to a live, deployed event experience.

The project involved:

IDEATION
   ↓
GAME DESIGN
   ↓
STORY & PUZZLE DEVELOPMENT
   ↓
PHYSICAL PROP CREATION
   ↓
WEB DEVELOPMENT
   ↓
TESTING
   ↓
DEPLOYMENT
   ↓
LIVE EVENT

The final experience was successfully conducted with 15+ teams at ANVIKSHA.

This project therefore involved not only software development, but also:

Event-oriented product design
Interactive experience design
Puzzle design
Physical material creation
Full-stack development
Testing
Deployment
Live technical operations
🔮 Future Improvements

Potential future versions of THE EPOCH could include:

Persistent cloud database
Real-time organizer dashboard
Real-time team monitoring
Advanced event analytics
Automatic scoring
More branching investigation paths
Dynamic difficulty
Additional programming challenges
More networking challenges
Expanded CCTV investigation
More sophisticated evidence correlation
Improved authentication and authorization
Dedicated event administration backend
Cloud-based state persistence
Automated team performance reports
Additional physical-digital puzzle interactions
📜 Disclaimer

THE EPOCH is a fictional investigation and escape-room experience created for educational and entertainment purposes as part of the ANVIKSHA college event.

The characters, organizations, records, incidents, and investigation scenario presented within the game are fictional.

# 👨‍💻 Authors

### Vanshika Goel & Kanishka Sharma

**THE EPOCH** was developed as a collaborative project by **Vanshika Goel and Kanishka Sharma** for the ANVIKSHA college event.

The project involved joint work across:

- Game ideation and experience design
- Story and investigation development
- Puzzle and challenge creation
- Physical prop planning
- Digital game development
- Testing and refinement
- Documentation
- Event preparation and coordination
- Deployment and live execution

The two-member team worked together to develop and successfully conduct the complete **THE EPOCH — Tech Investigation Escape Room** experience with **15+ participating teams** at ANVIKSHA.
