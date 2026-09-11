/**
 * THE EPOCH - SAGE Perimeter Firewall Console (nettrace)
 * Inspect held packets at the 03:41 capture window, determine which single
 * packet was permitted through the firewall, and resolve its source IP in
 * the network directory to identify the machine that opened the session
 * that led straight into the wipe: WS-14.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';

const DB_IP = '192.168.14.100'; // GRANT-LEDGER DB

const RULES = [
  { n: 1, act: 'ALLOW', sip: '192.168.14.10', sport: 'ANY', dip: DB_IP, dport: '80', proto: 'TCP' },   // WS-01 Reception
  { n: 2, act: 'ALLOW', sip: '192.168.14.50', sport: 'ANY', dip: DB_IP, dport: '22', proto: 'TCP' },   // WS-11 IT Desk
  { n: 3, act: 'DENY',  sip: '192.168.14.190', sport: 'ANY', dip: 'ANY', dport: 'ANY', proto: 'ANY' }, // Guest Wi-Fi (catering)
  { n: 4, act: 'ALLOW', sip: 'ANY', sport: 'ANY', dip: DB_IP, dport: '53', proto: 'UDP' },              // DNS
  { n: 5, act: 'ALLOW', sip: '192.168.14.18', sport: 'ANY', dip: DB_IP, dport: '443', proto: 'TCP' },  // WS-14
  { n: 6, act: 'ALLOW', sip: '192.168.14.50', sport: 'ANY', dip: DB_IP, dport: '443', proto: 'TCP' },  // WS-11 IT Desk
  { n: 7, act: 'DENY',  sip: 'ANY', sport: 'ANY', dip: 'ANY', dport: 'ANY', proto: 'ANY' }             // Default deny
];

const PACKETS = [
  { t: '03:41:02', sip: '192.168.14.190', sport: '44190', dip: DB_IP, dport: '53', proto: 'UDP',
    why: 'Rule 4 permits DNS from any source — but rule 3 sits above it and blocks everything from the Guest Wi-Fi range (192.168.14.190). The first match wins, so this packet never reaches rule 4.' },
  { t: '03:41:09', sip: '203.0.113.5', sport: '59220', dip: DB_IP, dport: '53', proto: 'TCP',
    why: 'Dressed as DNS, but rule 4 only permits UDP on port 53. No rule matches a TCP packet from an unregistered external address, so the default deny (rule 7) catches it.' },
  { t: '03:41:17', sip: '192.168.14.18', sport: '49110', dip: DB_IP, dport: '22', proto: 'TCP',
    why: 'Rule 5 names this source, but it is bound to port 443 only. An SSH attempt on port 22 matches nothing and falls to the default deny. Note the address — it just tried the door.' },
  { t: '03:41:23', sip: '192.168.14.10', sport: '51204', dip: DB_IP, dport: '443', proto: 'TCP',
    why: 'Rule 1 covers WS-01 (Reception) on port 80 only. On 443 it falls through to the default deny.' },
  { t: '03:41:31', sip: '192.168.14.50', sport: '5301', dip: DB_IP, dport: '22', proto: 'UDP',
    why: 'Rules 2 and 6 both name WS-11: rule 2 needs TCP, rule 6 needs port 443. This packet satisfies neither.' },
  { t: '03:41:38', sip: '192.168.14.18', sport: '49512', dip: DB_IP, dport: '443', proto: 'TCP',
    why: 'All five fields match rule 5. The perimeter opened for workstation WS-14 — three seconds before the audit trail recorded the unauthorized permission change.' }
];

const INDEXED = ['03:02', '03:08', '03:17', '03:21', '03:26', '03:33', '03:41', '03:47', '03:52'];
const TARGET = '03:41';
const EVIDENCE_IP = '192.168.14.18';

const DIRECTORY = {
  '192.168.14.18': { user: 'RAM SHARMA', role: 'Junior Developer', station: 'WS-14 / Developer Bay (Terminal 14)', status: 'ACTIVE' },
  '192.168.14.10': { user: 'ARJUN KAPOOR', role: 'Executive Administrative Assistant', station: 'WS-01 / Executive Reception', status: 'ACTIVE' },
  '192.168.14.50': { user: 'VIKRAM SETHI', role: 'IT Systems Administrator', station: 'WS-11 / IT Service Desk', status: 'ACTIVE' },
  '192.168.14.190': { user: 'GUEST WI-FI (CATERING)', role: 'Unregistered / guest device', station: 'Catering Staging Area', status: 'GUEST' }
};

const fmatch = (r, p) => r === 'ANY' || r === p;
function evaluate(p) {
  for (const r of RULES) {
    if (fmatch(r.sip, p.sip) && fmatch(r.sport, p.sport) && fmatch(r.dip, p.dip) && fmatch(r.dport, p.dport) && fmatch(r.proto, p.proto)) return r;
  }
  return RULES[RULES.length - 1];
}

export class NetworkViewerComponent {
  constructor(container) {
    this.container = container;
    this.phase = 'brief'; // brief | time | inspect | sum | lookup
    this.idx = 0;
    this.pktPhase = 'decide'; // decide | pick | result
    this.picked = null;
    this.choice = null;
    this.errors = 0;
    this.reloads = 0;
    this.verdicts = [];
    this.bufMsg = '';
    this.timeInputVal = '';
    this.ipConfirmVal = '';
    this.ipConfirmMsg = '';
    this.ipLookupVal = '';
    this.ipLookupOut = '';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    gameState.subscribe((event) => {
      if (event === 'LEVEL_CHANGED' || event === 'SUSPECT_FINALIZED' || event === 'NETTRACE_SOLVED' || event === 'GAME_RESET') {
        this.render();
        this.bindEvents();
      }
    });
  }

  render() {
    const isLevelActive = !gameState.isNettraceLocked();
    const isLevelPassed = gameState.isNettraceComplete();

    if (!isLevelActive) {
      this.container.innerHTML = `
        <div class="app-locked-overlay">
          <div class="lock-icon">🔒</div>
          <h3>nettrace ENCRYPTED</h3>
          <p>Finalize 2 suspects in suspects_db to decrypt the firewall capture buffer and network directory.</p>
        </div>
      `;
      return;
    }

    const stepLabels = {
      brief: 'STEP 1 OF 4 — BRIEFING',
      time: 'STEP 2 OF 4 — FILTER THE CAPTURE BUFFER',
      inspect: 'STEP 3 OF 4 — INSPECT PACKETS',
      sum: 'STEP 4 OF 4 — IDENTIFY THE DEVICE',
      lookup: 'STEP 4 OF 4 — IDENTIFY THE DEVICE'
    };

    this.container.innerHTML = `
      <div class="fw-layout">
        <div class="fw-topbar">
          <div class="fw-sys">SAGE PERIMETER FIREWALL</div>
          <div class="fw-mid">EPOCH-01 / RECOVERY CONSOLE</div>
          <div class="fw-step">${stepLabels[this.phase]}</div>
        </div>

        ${this.phase === 'brief' ? this.renderBrief() : ''}
        ${this.phase === 'time' ? this.renderTime() : ''}
        ${this.phase === 'inspect' ? this.renderInspect() : ''}
        ${this.phase === 'sum' ? this.renderSummary() : ''}
        ${this.phase === 'lookup' ? this.renderLookup() : ''}

        ${isLevelPassed ? `
          <div class="solved-banner">
            ✔ nettrace RESOLVED: Origin identified — WS-14. CCTV unlocked. Watch both cameras, then return to suspects_db to finalize your next suspect.
          </div>
        ` : ''}
      </div>
    `;
  }

  renderBrief() {
    return `
      <div class="fw-panel">
        <h2>TRACING THE INTRUDER</h2>
        <p class="fw-muted">Every connection into the GRANT-LEDGER database passes this firewall. Everything it held is still in the capture buffer. Read this once.</p>
        <div class="fw-hr"></div>
        <p><span class="fw-amber">HOW A RULE WORKS.</span> One rule per line. A rule matches a packet only when <span class="fw-white">all five</span> fields match: source IP, source port, destination IP, destination port, protocol. The word ANY matches anything in that column.</p>
        <p><span class="fw-amber">ORDER DECIDES EVERYTHING.</span> Rules are checked top to bottom. The first rule that matches wins and the check stops there. A rule further down cannot overturn it.</p>
        <p><span class="fw-amber">THE LAST RULE.</span> The bottom rule denies everything. A packet only reaches it when no rule above matched.</p>
        <div class="fw-hr"></div>
        <p><span class="fw-amber">YOUR JOB.</span></p>
        <ul>
          <li>Filter the capture buffer to the minute the wipe began — recovered from Level 2 (<strong>0341</strong>).</li>
          <li>Inspect every packet the firewall held in that minute, one at a time.</li>
          <li>For each one, decide GRANT or DENY, then name the rule that made the decision.</li>
          <li>Exactly one packet got through. Its source IP is the machine the session opened from.</li>
        </ul>
        <div class="fw-btnrow">
          <button class="fw-btn" id="fw-go-time">LOAD CAPTURE BUFFER</button>
        </div>
      </div>
    `;
  }

  renderTime() {
    return `
      <div class="fw-panel">
        <h2>CAPTURE BUFFER — FILTER</h2>
        <p class="fw-muted">Buffer covers 03:00–04:00 and is indexed by minute. Held packets are only retained for minutes where the firewall logged a decision.</p>
        <div class="fw-hr"></div>
        <p>ENTER TIMESTAMP <span class="fw-muted">(HH:MM)</span></p>
        <div class="fw-btnrow" style="align-items:center;">
          <input type="text" id="fw-time-in" class="fw-input" maxlength="5" placeholder="__:__" value="${this.timeInputVal}" autocomplete="off">
          <button class="fw-btn" id="fw-load-buffer">LOAD WINDOW</button>
        </div>
        <p class="fw-muted" style="margin-top:14px;">INDEXED MINUTES — click to load</p>
        <div class="fw-chiprow">
          ${INDEXED.map(t => `<span class="fw-chip" data-t="${t}">${t}</span>`).join('')}
        </div>
        <div>${this.bufMsg}</div>
        <p class="fw-muted" style="margin-top:14px;">BUFFER RELOADS LOGGED: <span class="fw-amber">${this.reloads}</span></p>
      </div>
    `;
  }

  renderInspect() {
    const p = PACKETS[this.idx];
    const queueHtml = PACKETS.map((x, i) => `<span class="fw-q ${i < this.idx ? 'done' : ''} ${i === this.idx ? 'now' : ''}">${x.t.slice(0, 5)}</span>`).join('')
      + `<span class="fw-q" style="border:none;">&nbsp;PACKET ${this.idx + 1} / ${PACKETS.length}</span>`;

    const head = ['ACCESS<br>RULE', 'SOURCE<br>IP', 'SOURCE<br>PORT', 'DESTINATION<br>IP', 'DESTINATION<br>PORT', 'PROTOCOL'];
    let rulesHtml = `<tr><td></td>${head.map(h => `<th>${h}</th>`).join('')}</tr>`;
    RULES.forEach(r => {
      const sel = this.picked === r.n ? 'fw-selected' : '';
      const dim = (this.pktPhase === 'pick' && this.picked !== null && this.picked !== r.n) ? 'fw-dimmed' : '';
      const clickable = this.pktPhase === 'pick' ? 'fw-pickable' : '';
      rulesHtml += `<tr class="fw-rule ${clickable} ${sel} ${dim}" data-n="${r.n}">
        <td class="fw-rn">${r.n}</td>
        <td><span class="fw-cell fw-act">${r.act}</span></td>
        <td><span class="fw-cell">${r.sip}</span></td>
        <td><span class="fw-cell">${r.sport}</span></td>
        <td><span class="fw-cell">${r.dip}</span></td>
        <td><span class="fw-cell">${r.dport}</span></td>
        <td><span class="fw-cell">${r.proto}</span></td></tr>`;
    });

    let sideHtml = '';
    if (this.pktPhase === 'decide') {
      sideHtml = `
        <p>Check this packet against the rules above, from rule 1 downward. Stop at the first rule where all five fields match, then record that verdict.</p>
        <div class="fw-btnrow">
          <button class="fw-btn" id="fw-decide-allow">GRANT ACCESS</button>
          <button class="fw-btn deny" id="fw-decide-deny">DENY ACCESS</button>
        </div>
      `;
    } else if (this.pktPhase === 'pick') {
      sideHtml = `
        <p class="fw-amber">VERDICT RECORDED: ${this.choice === 'ALLOW' ? 'GRANT ACCESS' : 'DENY ACCESS'}</p>
        <p>Now name the rule that produced it. Select the row in the table, then confirm.</p>
        <p class="fw-white">↑ SELECT THE DECIDING RULE</p>
        <div class="fw-btnrow">
          <button class="fw-btn" id="fw-confirm-pick" ${this.picked === null ? 'disabled' : ''}>CONFIRM${this.picked !== null ? ' RULE ' + this.picked : ''}</button>
          <button class="fw-btn warn" id="fw-cancel-pick">CANCEL</button>
        </div>
      `;
    } else {
      const r = evaluate(p);
      const ok = this.verdicts[this.idx].correct;
      const last = this.idx === PACKETS.length - 1;
      sideHtml = `
        <p class="${ok ? 'fw-amber' : 'fw-red'}">${ok ? 'CORRECT — DECISION MATCHES FIREWALL LOG' : 'INCORRECT — FIREWALL LOG DISAGREES'}</p>
        <p>Firewall applied <span class="fw-amber">RULE ${r.n} → ${r.act}</span>.</p>
        <p class="fw-muted">${p.why}</p>
        <div class="fw-btnrow">
          <button class="fw-btn" id="fw-next-packet">${last ? 'CLOSE WINDOW 03:41' : 'NEXT PACKET'}</button>
        </div>
      `;
    }

    return `
      <div class="fw-queue">${queueHtml}</div>
      <table class="fw-rules">${rulesHtml}</table>
      <div class="fw-inspect">
        <div class="fw-pkt">
          <div class="fw-pkt-tab">HELD PACKET</div>
          <div class="fw-pf"><span>TIMESTAMP</span><span class="fw-v">${p.t}</span></div>
          <div class="fw-pf"><span>SOURCE IP</span><span class="fw-v">${p.sip}</span></div>
          <div class="fw-pf"><span>SOURCE PORT</span><span class="fw-v">${p.sport}</span></div>
          <div class="fw-pf"><span>DESTINATION IP</span><span class="fw-v">${p.dip}</span></div>
          <div class="fw-pf"><span>DESTINATION PORT</span><span class="fw-v">${p.dport}</span></div>
          <div class="fw-pf"><span>PROTOCOL</span><span class="fw-v">${p.proto}</span></div>
        </div>
        <div class="fw-side"><div class="fw-box">${sideHtml}</div></div>
      </div>
    `;
  }

  renderSummary() {
    let rowsHtml = `<tr><th>TIME</th><th>SOURCE IP</th><th>PORT</th><th>PROTO</th><th>RULE</th><th>RESULT</th></tr>`;
    PACKETS.forEach(p => {
      const r = evaluate(p);
      const hit = r.act === 'ALLOW';
      rowsHtml += `<tr class="${hit ? 'fw-hit' : ''}">
        <td>${p.t}</td><td>${p.sip}</td><td>${p.dport}</td><td>${p.proto}</td>
        <td>RULE ${r.n}</td><td>${r.act}${hit ? ' ◄' : ''}</td></tr>`;
    });

    return `
      <div class="fw-panel">
        <h2>WINDOW 03:41 — DECISION LOG</h2>
        <table class="fw-sum">${rowsHtml}</table>
        <div class="fw-hr"></div>
        <p>Six packets held. Five stopped at the perimeter. One was permitted, and it opened a session on the GRANT-LEDGER database seconds before the wipe began.</p>
        <p class="fw-muted">Verdict errors: <span class="fw-amber">${this.errors}</span> &nbsp;·&nbsp; Buffer reloads: <span class="fw-amber">${this.reloads}</span></p>
        <div class="fw-hr"></div>
        <p>ENTER THE SOURCE IP OF THE PERMITTED PACKET</p>
        <div class="fw-btnrow" style="align-items:center; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="fw-ip-confirm" class="fw-input" maxlength="15" placeholder="0.0.0.0" style="width:200px;" value="${this.ipConfirmVal}" autocomplete="off">
          <button class="fw-btn" id="fw-log-evidence">LOG TO EVIDENCE</button>
          <button class="fw-btn warn" id="fw-back-inspect-btn">◄ RECHECK PACKET ROWS</button>
        </div>
        <div style="margin-top:10px;">${this.ipConfirmMsg}</div>
      </div>
    `;
  }

  renderLookup() {
    return `
      <div class="fw-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2>EMPLOYEE NETWORK DIRECTORY</h2>
          <button class="fw-btn warn" id="fw-back-to-log">◄ BACK TO DECISION LOG</button>
        </div>
        <p class="fw-muted">Internal device registry. Search a private address to resolve its registered owner.</p>
        <div class="fw-btnrow" style="align-items:center;">
          <input type="text" id="fw-ip-lookup" class="fw-input" maxlength="15" placeholder="0.0.0.0" style="width:220px;" value="${this.ipLookupVal}" autocomplete="off">
          <button class="fw-btn" id="fw-search-btn">SEARCH</button>
        </div>
        <div style="margin-top:14px;">${this.ipLookupOut}</div>
      </div>
    `;
  }

  bindEvents() {
    const goTime = this.container.querySelector('#fw-go-time');
    if (goTime) goTime.addEventListener('click', () => { sound.playKeyClick(); this.phase = 'time'; this.render(); this.bindEvents(); });

    const timeIn = this.container.querySelector('#fw-time-in');
    if (timeIn) {
      timeIn.addEventListener('input', (e) => { this.timeInputVal = e.target.value; });
      timeIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.loadBuffer(); });
    }
    const loadBtn = this.container.querySelector('#fw-load-buffer');
    if (loadBtn) loadBtn.addEventListener('click', () => this.loadBuffer());

    const chips = this.container.querySelectorAll('.fw-chip');
    chips.forEach(c => c.addEventListener('click', () => {
      this.timeInputVal = c.getAttribute('data-t');
      this.loadBuffer();
    }));

    // Inspection phase
    const decideAllow = this.container.querySelector('#fw-decide-allow');
    if (decideAllow) decideAllow.addEventListener('click', () => { this.decide('ALLOW'); });
    const decideDeny = this.container.querySelector('#fw-decide-deny');
    if (decideDeny) decideDeny.addEventListener('click', () => { this.decide('DENY'); });

    const rows = this.container.querySelectorAll('tr.fw-pickable');
    rows.forEach(tr => tr.addEventListener('click', () => {
      this.picked = parseInt(tr.getAttribute('data-n'), 10);
      sound.playKeyClick();
      this.render();
      this.bindEvents();
    }));

    const confirmPick = this.container.querySelector('#fw-confirm-pick');
    if (confirmPick) confirmPick.addEventListener('click', () => this.confirmPick());
    const cancelPick = this.container.querySelector('#fw-cancel-pick');
    if (cancelPick) cancelPick.addEventListener('click', () => {
      this.choice = null; this.picked = null; this.pktPhase = 'decide';
      this.render(); this.bindEvents();
    });

    const nextBtn = this.container.querySelector('#fw-next-packet');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextPacket());

    // Summary phase
    const ipConfirmIn = this.container.querySelector('#fw-ip-confirm');
    if (ipConfirmIn) {
      ipConfirmIn.addEventListener('input', (e) => { this.ipConfirmVal = e.target.value; });
      ipConfirmIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.confirmIP(); });
    }
    const logEvidenceBtn = this.container.querySelector('#fw-log-evidence');
    if (logEvidenceBtn) logEvidenceBtn.addEventListener('click', () => this.confirmIP());

    const backInspectBtn = this.container.querySelector('#fw-back-inspect-btn');
    if (backInspectBtn) backInspectBtn.addEventListener('click', () => this.recheckPackets());

    const backInspectErrBtn = this.container.querySelector('#fw-back-inspect-btn-err');
    if (backInspectErrBtn) backInspectErrBtn.addEventListener('click', () => this.recheckPackets());

    const openLookupBtn = this.container.querySelector('#fw-open-lookup');
    if (openLookupBtn) openLookupBtn.addEventListener('click', () => { this.phase = 'lookup'; this.render(); this.bindEvents(); });

    // Lookup phase
    const backToLogBtn = this.container.querySelector('#fw-back-to-log');
    if (backToLogBtn) backToLogBtn.addEventListener('click', () => {
      sound.playKeyClick();
      this.phase = 'sum';
      this.render();
      this.bindEvents();
    });

    const ipLookupIn = this.container.querySelector('#fw-ip-lookup');
    if (ipLookupIn) {
      ipLookupIn.addEventListener('input', (e) => { this.ipLookupVal = e.target.value; });
      ipLookupIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.lookup(); });
    }
    const searchBtn = this.container.querySelector('#fw-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', () => this.lookup());
  }

  recheckPackets() {
    sound.playKeyClick();
    this.idx = 0;
    this.phase = 'inspect';
    this.pktPhase = 'decide';
    this.picked = null;
    this.choice = null;
    this.render();
    this.bindEvents();
  }

  loadBuffer() {
    const raw = (this.timeInputVal || '').trim();
    const norm = raw.replace(/[^0-9]/g, '').padStart(4, '0');
    const t = norm.length === 4 ? norm.slice(0, 2) + ':' + norm.slice(2) : raw;

    if (t === TARGET) {
      this.bufMsg = '<span class="fw-amber">WINDOW 03:41 · 6 PACKETS HELD · 1 DECISION FLAGGED FOR REVIEW</span>';
      sound.playSuccess();
      this.render();
      this.bindEvents();
      setTimeout(() => { this.phase = 'inspect'; this.render(); this.bindEvents(); }, 400);
      return;
    }
    this.reloads++;
    sound.playError();
    if (INDEXED.includes(t)) {
      this.bufMsg = `WINDOW ${t} — 0 packets held. Routine traffic only, no wipe-associated sessions.`;
    } else {
      this.bufMsg = `<span class="fw-red">NO BUFFER SEGMENT AT ${t || '—'}.</span> Use HH:MM within 03:00–04:00.`;
    }
    this.render();
    this.bindEvents();
  }

  decide(c) {
    sound.playKeyClick();
    this.choice = c; this.picked = null; this.pktPhase = 'pick';
    this.render(); this.bindEvents();
  }

  confirmPick() {
    if (this.picked === null) return;
    const p = PACKETS[this.idx];
    const r = evaluate(p);
    const correct = (this.choice === r.act) && (this.picked === r.n);
    if (!correct) { this.errors++; sound.playError(); } else { sound.playSuccess(); }
    this.verdicts[this.idx] = { correct, rule: r.n, act: r.act };
    this.pktPhase = 'result';
    this.render(); this.bindEvents();
  }

  nextPacket() {
    if (this.idx < PACKETS.length - 1) {
      this.idx++; this.pktPhase = 'decide'; this.picked = null; this.choice = null;
      this.render(); this.bindEvents();
    } else {
      this.phase = 'sum';
      this.render(); this.bindEvents();
    }
  }

  confirmIP() {
    const v = (this.ipConfirmVal || '').trim();
    if (v === EVIDENCE_IP) {
      sound.playSuccess();
      this.ipConfirmMsg = `<span class="fw-amber">LOGGED TO EVIDENCE BOARD — ${EVIDENCE_IP}</span><br>
        <span class="fw-muted">Address is inside the internal range. Resolve the owner in the directory.</span>
        <div class="fw-btnrow" style="margin-top:10px;"><button class="fw-btn" id="fw-open-lookup">OPEN NETWORK DIRECTORY</button></div>`;
      gameState.addLog(`NETWORK TRACE: Permitted packet at 03:41:38 traced to source IP ${EVIDENCE_IP}.`);
    } else {
      sound.playError();
      this.ipConfirmMsg = `<div style="margin-top:8px;">
        <span class="fw-red">NOT THE PERMITTED PACKET.</span> <span class="fw-muted">Only one row above ends in ALLOW — read its source column.</span>
        <div class="fw-btnrow" style="margin-top:10px;"><button class="fw-btn warn" id="fw-back-inspect-btn-err">◄ RECHECK & RE-EXAMINE PACKET ROWS</button></div>
      </div>`;
    }
    this.render();
    this.bindEvents();
  }

  lookup() {
    const v = (this.ipLookupVal || '').trim();
    const d = DIRECTORY[v];
    if (!d) {
      this.ipLookupOut = `<span class="fw-red">NO RECORD.</span> <span class="fw-muted">Address is not registered on the internal network.</span>`;
    } else if (v !== EVIDENCE_IP) {
      this.ipLookupOut = `<p>REGISTERED DEVICE</p><p class="fw-amber">${d.station}</p><p class="fw-muted">${d.role} · ${d.status}</p>`;
    } else {
      this.ipLookupOut = `
        <p class="fw-muted">REGISTERED DEVICE — MATCH</p>
        <div class="fw-big">WS-14</div>
        <p style="margin-top:14px;">ASSIGNED TO &nbsp;<span class="fw-amber">${d.user}</span> · ${d.station}<br>
           INTERNAL IP &nbsp;<span class="fw-amber">${EVIDENCE_IP}</span><br>
           SESSION AT &nbsp;<span class="fw-amber">03:41:38</span> — credentials accepted, no failed login attempts<br>
           DATABASE ACCESS &nbsp;<span class="fw-amber">WRITE</span></p>
        <div class="fw-hr"></div>
        <p>The firewall only confirms which terminal opened the session — not who was physically sitting at it that night. Cross-reference this workstation against the CCTV footage before drawing a conclusion.</p>
        <div class="fw-hr"></div>
        <p>nettrace COMPLETE — ORIGIN IDENTIFIED</p>
        <div class="fw-big fw-blink">WS-14</div>
        <p class="fw-muted" style="margin-top:10px;">CCTV Surveillance is now unlocked. Watch both camera feeds, then return to <code>suspects_db</code> and finalize whichever suspect you believe is responsible.</p>
      `;
      gameState.markNettraceComplete();
      gameState.addLog(`NETWORK DIRECTORY: ${EVIDENCE_IP} resolves to WS-14. Session authenticated with no failed attempts — cross-reference against CCTV.`);
    }
    this.render();
    this.bindEvents();
  }
}
