const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function getISTTimestamp(date = new Date()) {
  try {
    const timeStr = date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${timeStr} IST`;
  } catch (e) {
    return `${date.toTimeString().split(' ')[0]} IST`;
  }
}

let teams = {};
try {
  if (fs.existsSync(TEAMS_FILE)) {
    teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load existing teams.json, starting fresh.', e.message);
  teams = {};
}

let saveTimeout = null;
function persistTeams() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fs.writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2), (err) => {
      if (err) console.error('Failed to persist teams.json', err);
    });
  }, 300);
}

function initTeam(id) {
  if (!teams[id]) {
    teams[id] = {
      teamId: id,
      stage: 0,
      gameHalted: false,
      haltReason: null,
      haltTimestamp: null,
      startTime: null,
      timerSeconds: 3600,
      finalizations: [],
      finalMurderer: null,
      finalReasoning: null,
      finalSubmissionTimestamp: null,
      wipeStopped: false,
      events: [],
      lastEvent: null,
      lastUpdate: getISTTimestamp()
    };
  }
  return teams[id];
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API endpoint for health check / status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    game: 'THE EPOCH — EscapeServer',
    version: '2.0.0',
    timestamp: getISTTimestamp()
  });
});

// Central multi-team event endpoint
app.post('/api/event', (req, res) => {
  const { teamId, stage, startTime, timerSeconds, event, gameHalted, haltReason, haltTimestamp, finalMurderer, finalReasoning, finalSubmissionTimestamp, finalizations } = req.body || {};
  const id = (teamId || 'UNASSIGNED').toString().toUpperCase();

  const t = initTeam(id);
  t.stage = stage !== undefined ? stage : t.stage;
  t.startTime = startTime !== undefined ? startTime : t.startTime;
  t.timerSeconds = timerSeconds !== undefined ? timerSeconds : t.timerSeconds;
  t.gameHalted = gameHalted !== undefined ? gameHalted : t.gameHalted;
  t.haltReason = haltReason !== undefined ? haltReason : t.haltReason;
  t.haltTimestamp = haltTimestamp !== undefined ? haltTimestamp : t.haltTimestamp;
  t.finalMurderer = finalMurderer !== undefined ? finalMurderer : t.finalMurderer;
  t.finalReasoning = finalReasoning !== undefined ? finalReasoning : t.finalReasoning;
  t.finalSubmissionTimestamp = finalSubmissionTimestamp !== undefined ? finalSubmissionTimestamp : t.finalSubmissionTimestamp;
  if (Array.isArray(finalizations)) t.finalizations = finalizations;
  t.lastUpdate = getISTTimestamp();

  if (event) {
    if (!event.clock) event.clock = getISTTimestamp();
    t.events.push(event);
    if (t.events.length > 500) t.events.shift();
    t.lastEvent = event;
  }

  persistTeams();
  res.json({ ok: true, team: t });
});

// Sync full team status
app.post('/api/teams/:id/status', (req, res) => {
  const id = req.params.id.toUpperCase();
  const t = initTeam(id);
  const data = req.body || {};

  Object.assign(t, {
    stage: data.stage !== undefined ? data.stage : t.stage,
    gameHalted: data.gameHalted !== undefined ? data.gameHalted : t.gameHalted,
    haltReason: data.haltReason !== undefined ? data.haltReason : t.haltReason,
    haltTimestamp: data.haltTimestamp !== undefined ? data.haltTimestamp : t.haltTimestamp,
    startTime: data.startTime !== undefined ? data.startTime : t.startTime,
    timerSeconds: data.timerSeconds !== undefined ? data.timerSeconds : t.timerSeconds,
    finalMurderer: data.finalMurderer !== undefined ? data.finalMurderer : t.finalMurderer,
    finalReasoning: data.finalReasoning !== undefined ? data.finalReasoning : t.finalReasoning,
    finalSubmissionTimestamp: data.finalSubmissionTimestamp !== undefined ? data.finalSubmissionTimestamp : t.finalSubmissionTimestamp,
    wipeStopped: data.wipeStopped !== undefined ? data.wipeStopped : t.wipeStopped,
    lastUpdate: getISTTimestamp()
  });

  if (Array.isArray(data.finalizations)) t.finalizations = data.finalizations;

  persistTeams();
  res.json({ ok: true, team: t });
});

// GM action: Resume a halted team session
app.post('/api/teams/:id/resume', (req, res) => {
  const id = req.params.id.toUpperCase();
  const t = initTeam(id);

  t.gameHalted = false;
  t.haltReason = null;
  t.haltTimestamp = null;
  t.lastUpdate = getISTTimestamp();

  const resumeEvent = {
    ts: Date.now(),
    iso: new Date().toISOString(),
    clock: getISTTimestamp(),
    teamId: id,
    type: 'GM_RESUME',
    message: `GM cleared halt state for Team ${id}. Game resumed.`,
    meta: { organizerAction: 'RESUME_GAME' }
  };

  t.events.push(resumeEvent);
  t.lastEvent = resumeEvent;

  persistTeams();
  res.json({ ok: true, team: t });
});

// Returns a summary of every team for the GM Control "All Teams" tab.
app.get('/api/teams', (req, res) => {
  res.json(teams);
});

// Full event history for a single team.
app.get('/api/teams/:id', (req, res) => {
  const id = req.params.id.toUpperCase();
  res.json(teams[id] || initTeam(id));
});

// Organizer utility: clear a single team's server-side record.
app.delete('/api/teams/:id', (req, res) => {
  const id = req.params.id.toUpperCase();
  delete teams[id];
  persistTeams();
  res.json({ ok: true });
});

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` THE EPOCH — EPOCHCORP ESCAPE SERVER HOST`);
  console.log(` Server active at: http://localhost:${PORT}`);
  console.log(` For other stations on the same network, use this`);
  console.log(` machine's LAN IP instead of localhost, e.g.:`);
  console.log(`   http://<this-machine-ip>:${PORT}/?team=TEAM01`);
  console.log(` Meera's Workstation interface ready.`);
  console.log(` Press Ctrl+C to stop.`);
  console.log(`=======================================================`);
});


