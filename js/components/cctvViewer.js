/**
 * THE EPOCH - CCTV Surveillance Hub (cctv_hub)
 * Unlocks after nettrace / IP game is solved (WS-14 obtained).
 * CAM 01: figure in black struggling to access WS-14.
 * CAM 02: Executive parking lot camera.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';

// =========================================================================
// CHANGE CCTV VIDEO / PHOTO SOURCE HERE
// CAM01 = VIDEO
// CAM02 = PHOTO
// =========================================================================
const CCTV_VIDEO_SOURCES = {
  CAM01: '/assets/cam_cctv.mp4',
  CAM02: '/assets/parking.jpeg',
};

// =========================================================================
// CHANGE BOARDING/ARRIVAL GATE IMAGE HERE
// =========================================================================
const BOARDING_GATE_IMAGE = '/assets/boarding_gate_list.png';

const CAMS = {
  CAM01: {
    key: 'CAM01',
    title: 'CAM 01 — EPOCH BUILDING CORRIDOOR/OFFICE',
  },
  CAM02: {
    key: 'CAM02',
    title: 'CAM 02 — EXECUTIVE PARKING LOT',
  }
};

export class CCTVViewerComponent {
  constructor(container) {
    this.container = container;
    this.activeCam = 'CAM01';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    gameState.subscribe((event) => {
      if (event === 'NETTRACE_SOLVED' || event === 'LEVEL_CHANGED' || event === 'GAME_RESET') {
        this.render();
        this.bindEvents();
      }
    });
  }

  render() {
    if (gameState.isCctvLocked()) {
      this.container.innerHTML = `
        <div class="app-locked-overlay">
          <div class="lock-icon">🔒</div>
          <h3>CCTV SURVEILLANCE ENCRYPTED</h3>
          <p>Solve nettrace (SERVER folder) to unlock the surveillance hub.</p>
        </div>
      `;
      return;
    }

    gameState.markCctvCamViewed(this.activeCam);

    const cam = CAMS[this.activeCam];
    const mediaUrl = CCTV_VIDEO_SOURCES[this.activeCam];
    const bothViewed = gameState.isCctvFullyViewed();

    // CAM01 is an MP4 video.
    // CAM02 is a JPEG image.
    const isImage = this.activeCam === 'CAM02';

    const mediaElement = isImage
      ? `
        <img
          id="cctv-player"
          src="${mediaUrl}"
          alt="CAM 02 Parking Lot Surveillance"
          class="cctv-video-element"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >
      `
      : `
        <video
          id="cctv-player"
          src="${mediaUrl}"
          controls
          autoplay
          loop
          class="cctv-video-element"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        ></video>
      `;

    this.container.innerHTML = `
      <div class="cctv-layout">

        <!-- LEFT: CCTV video / image -->
        <div class="cctv-video-column">

          <div class="cctv-feed-header">
            <div class="feed-tags">
              <span class="rec-dot">● REC</span>
              <span class="feed-name">${cam.title}</span>
            </div>

            <div class="feed-channel-selector">
              <button
                class="cam-btn ${this.activeCam === 'CAM01' ? 'active' : ''}"
                data-cam="CAM01"
              >
                CAM 01: WS-14 CORRIDOR ${gameState.data.cctvCamsViewed.CAM01 ? '✓' : ''}
              </button>

              <button
                class="cam-btn ${this.activeCam === 'CAM02' ? 'active' : ''}"
                data-cam="CAM02"
              >
                CAM 02: PARKING LOT ${gameState.data.cctvCamsViewed.CAM02 ? '✓' : ''}
              </button>
            </div>
          </div>

          <div class="cctv-monitor-screen">

            <div class="scanline-overlay"></div>

            ${mediaElement}

            <div class="cctv-placeholder-frame" style="display:none;">
              <div class="cctv-placeholder-icon">
                ${isImage ? '🖼️' : '📹'}
              </div>

              <div class="cctv-placeholder-text">
                ${isImage ? 'CCTV IMAGE READY' : 'CCTV FEED READY'}
              </div>

              <div class="cctv-placeholder-sub">
                Source path: <code>${mediaUrl}</code>
              </div>
            </div>

            <div class="cctv-osd-overlay">
              <div class="osd-top-left">
                NVR-SEC-NODE-0${this.activeCam === 'CAM01' ? '2' : '3'} // INCIDENT ARCHIVE
              </div>

              <div class="osd-top-right">
                ${cam.key} [HD-IR]
              </div>

              <div class="osd-bottom-right">
                REC TIME: 03:${this.activeCam === 'CAM01' ? '39' : '15'}:00 AM
              </div>
            </div>

          </div>
        </div>

        <!-- RIGHT: Boarding/arrival gate photograph & investigation notes -->
        <div class="cctv-alibi-column">

          <div class="panel-section-title">
            BOARDING / ARRIVAL ENTRY GATE EVIDENCE
          </div>

          <!-- Boarding Gate Photo Container -->
          <div class="cctv-gate-photo-container">

            <img
              src="${BOARDING_GATE_IMAGE}"
              alt="Boarding / Arrival Gate Entry Photo"
              class="cctv-gate-photo"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div class="cctv-gate-photo-fallback" style="display:none;">
              <div class="photo-fallback-icon">🏛️</div>

              <div class="photo-fallback-text">
                BOARDING GATE PHOTO
              </div>

              <div class="photo-fallback-sub">
                <code>${BOARDING_GATE_IMAGE}</code>
              </div>
            </div>

          </div>

          <div class="panel-section-title" style="margin-top: 14px;">
            INVESTIGATIVE OBSERVATION
          </div>

          <p class="matrix-guide">${cam.narrative}</p>

          <div class="key-observation-box" style="margin-top: 10px;">
            🔍 <strong>Note:</strong> ${cam.clue}
          </div>

          <div class="panel-section-title" style="margin-top: 14px;">
            NEXT STEP
          </div>

          <p class="matrix-guide">
            ${bothViewed
              ? 'Both camera feeds reviewed. Return to <strong>suspects_db</strong> and finalize whichever suspect you believe is responsible.'
              : 'Review the other camera feed before returning to suspects_db.'}
          </p>

        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.cam-btn').forEach(b => {
      b.addEventListener('click', () => {
        this.activeCam = b.getAttribute('data-cam');
        gameState.markCctvCamViewed(this.activeCam);
        sound.playKeyClick();
        this.render();
        this.bindEvents();
      });
    });
  }
}