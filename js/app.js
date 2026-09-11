/**
 * THE EPOCH - Desktop Application Shell & Window Manager
 * Manages Meera's Workstation OS simulation, window dragging, taskbar,
 * lock screen transitions, component lifecycle, and anti-cheat (tab-switch
 * detection + right-click/image-search blocking).
 */

import { gameState } from './state.js';
import { sound } from './audio.js';
import { TerminalComponent } from './components/terminal.js';
import { CodeEditorComponent } from './components/codeEditor.js';
import { NetworkViewerComponent } from './components/networkViewer.js';
import { CCTVViewerComponent } from './components/cctvViewer.js';
import { SuspectsDbViewerComponent } from './components/suspectsDbViewer.js';
import { RestoreViewerComponent } from './components/restoreViewer.js';
import { OrganizerModalComponent } from './components/organizerModal.js';
import { ServerFolderViewerComponent } from './components/serverFolderViewer.js';

class DesktopApp {
  constructor() {
    this.windows = {};
    this.highestZ = 100;
    this.components = {};
    this.orgModal = null;

    this.init();
  }

  init() {
    this.initModals();
    this.bindGlobalEvents();
    this.bindAntiCheat();
    this.renderScreen();

    gameState.subscribe((event, payload) => {
      this.updateTaskbar();
      if (event === 'LOGIN_SUCCESS' || event === 'GAME_RESET' || event === 'LEVEL_CHANGED') {
        this.renderScreen();
      }
      if (event === 'TIMER_TICK') {
        this.updateTimerDisplay(payload.seconds);
      }
      if (event === 'SUSPECT_FINALIZED') {
        const count = gameState.getFinalizedCount();
        if (count === 1) this.showToast('🔓 ACCESS GRANTED', 'A new recovery file is now available. Open recovery_code inside the SERVER folder.', () => this.openWindow('server'));
        else if (count === 2) this.showToast('🔓 nettrace UNLOCKED', 'nettrace is now accessible inside the SERVER folder.', () => this.openWindow('server'));
        else if (count === 3) this.showToast('🔓 FINAL INVESTIGATION UNLOCKED', 'Open final_investigation to identify the person responsible.', () => this.openWindow('restore'));
      }
      if (event === 'NETTRACE_SOLVED') {
        this.showToast('🔓 CCTV SURVEILLANCE UNLOCKED', 'Click the "cctv_hub" desktop icon to review both camera feeds.', () => this.openWindow('cctv'));
      }
      if (event === 'FINAL_ACCUSATION_SUBMITTED') {
        this.showToast('⚠ 92% DATA WIPED OUT ALREADY', "LOGIN FROM HOST'S ACCOUNT TO STOP THE WIPE", () => this.openWindow('restore'));
      }
      if (event === 'TAB_SWITCH_VIOLATION') {
        this.showViolationOverlay(payload.timestamp);
      }
      if (event === 'VIOLATION_CLEARED') {
        this.hideViolationOverlay();
      }
    });
  }

  // --- ANTI-CHEAT: tab switching / app switching ends the game ---
  bindAntiCheat() {
    // Persistent one-time warning + block the standard right-click / image
    // search (Google Lens) vector for the whole document.
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showToast('🚫 DISABLED', 'Right-click and image search are disabled during the investigation.');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        gameState.triggerTabSwitchViolation();
      }
    });

    // If a violation is already active on load/refresh, show the overlay.
    if (gameState.data.disqualified) {
      this.showViolationOverlay(gameState.data.disqualifiedTimestamp);
    }
  }

  showViolationOverlay(timestamp) {
    const overlay = document.getElementById('violation-screen');
    if (!overlay) return;
    const ts = overlay.querySelector('#violation-timestamp');
    if (ts) ts.textContent = timestamp || '';

    const gmBtn = overlay.querySelector('#violation-gm-btn');
    if (gmBtn && !gmBtn._bound) {
      gmBtn._bound = true;
      gmBtn.onclick = () => {
        sound.playKeyClick();
        if (this.orgModal) this.orgModal.show();
      };
    }
    overlay.classList.remove('hidden');
  }

  hideViolationOverlay() {
    const overlay = document.getElementById('violation-screen');
    if (overlay) overlay.classList.add('hidden');
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(title, message, onClick) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    `;
    if (onClick) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', () => {
        onClick();
        toast.remove();
      });
    }
    container.appendChild(toast);
    sound.playUnlockLevel();
    setTimeout(() => toast.remove(), 9000);
  }

  renderScreen() {
    const isLocked = gameState.data.currentLevel === 0;
    const lockScreen = document.getElementById('lock-screen');
    const desktopScreen = document.getElementById('desktop-screen');

    if (isLocked) {
      if (lockScreen) lockScreen.classList.remove('hidden');
      if (desktopScreen) desktopScreen.classList.add('hidden');
      this.initLockScreen();
    } else {
      if (lockScreen) lockScreen.classList.add('hidden');
      if (desktopScreen) desktopScreen.classList.remove('hidden');
      this.initDesktop();
    }
  }

  // --- LOCK SCREEN (State 0) ---
  initLockScreen() {
    const pwdInput = document.getElementById('lock-password-input');
    const loginBtn = document.getElementById('lock-login-btn');
    const errorMsg = document.getElementById('lock-error-msg');
    const teamIdField = document.getElementById('team-id-field');
    const teamIdSaveBtn = document.getElementById('team-id-save-btn');
    const teamIdStrip = document.getElementById('team-id-strip');

    if (teamIdField) {
      teamIdField.value = gameState.teamId || '';
      if (gameState.hasTeamId() && teamIdStrip) teamIdStrip.classList.add('saved');
    }
    if (teamIdSaveBtn && teamIdField) {
      teamIdSaveBtn.onclick = () => {
        gameState.setTeamId(teamIdField.value);
        if (teamIdStrip) teamIdStrip.classList.add('saved');
        sound.playSuccess();
      };
    }

    if (loginBtn && pwdInput) {
      const doLogin = () => {
        const res = gameState.submitLoginPassword(pwdInput.value);
        if (!res.success) {
          if (errorMsg) {
            errorMsg.textContent = res.message;
            errorMsg.classList.remove('hidden');
          }
        } else {
          if (errorMsg) errorMsg.classList.add('hidden');
          this.renderScreen();
        }
      };

      loginBtn.onclick = doLogin;
      pwdInput.onkeydown = (e) => {
        sound.playKeyClick();
        if (e.key === 'Enter') doLogin();
      };
    }
  }

  // --- DESKTOP SHELL (State 1-6) ---
  initDesktop() {
    this.initTaskbar();
    this.initDesktopIcons();

    // Open primary windows if not opened
    this.openWindow('terminal');
    this.updateTaskbar();
  }

  initModals() {
    const orgContainer = document.getElementById('org-modal-container');
    if (orgContainer && !this.orgModal) {
      this.orgModal = new OrganizerModalComponent(orgContainer);
    }
  }

  initTaskbar() {
    const orgBtn = document.getElementById('taskbar-org-btn');
    if (orgBtn) {
      orgBtn.onclick = () => {
        sound.playKeyClick();
        if (this.orgModal) this.orgModal.show();
      };
    }

    const audioBtn = document.getElementById('taskbar-audio-btn');
    if (audioBtn) {
      audioBtn.onclick = () => {
        const isMuted = sound.toggleMute();
        audioBtn.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
        audioBtn.classList.toggle('muted', isMuted);
      };
    }

    const fullscreenBtn = document.getElementById('taskbar-fs-btn');
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          fullscreenBtn.textContent = '⛶ Exit Full';
        } else {
          document.exitFullscreen().catch(() => {});
          fullscreenBtn.textContent = '⛶ Fullscreen';
        }
      };
    }
  }

  updateTimerDisplay(seconds) {
    const timerElem = document.getElementById('taskbar-timer-text');
    const timerBox = document.getElementById('taskbar-timer-box');
    if (!timerElem) return;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (seconds <= 300) {
      if (timerBox) timerBox.classList.add('critical-danger');
    } else {
      if (timerBox) timerBox.classList.remove('critical-danger');
    }
  }

  updateTaskbar() {
    const stageTag = document.getElementById('taskbar-stage-tag');
    if (stageTag) {
      const count = gameState.getFinalizedCount();
      let label = `SLOT ${count + 1} OF 3`;
      if (gameState.data.currentLevel === 6) label = 'CASE CLOSED';
      else if (count >= 3) label = 'FINAL INVESTIGATION';
      else if (count === 2 && gameState.isNettraceComplete() && !gameState.isCctvFullyViewed()) label = 'REVIEW CCTV';
      else if (count === 2 && !gameState.isNettraceComplete()) label = 'SOLVE NETTRACE';
      stageTag.textContent = label;
    }
  }

  initDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
      icon.onclick = () => {
        sound.playKeyClick();
        const winId = icon.getAttribute('data-window');
        if (winId) this.openWindow(winId);
      };
    });
  }

  // --- WINDOW MANAGEMENT ---
  openWindow(id) {
    let win = document.getElementById(`window-${id}`);
    if (!win) return;

    win.classList.remove('hidden');
    win.style.display = 'flex';
    this.bringToFront(win);

    // Instantiate component inside window if not already
    const body = win.querySelector('.window-body');
    if (body && !this.components[id]) {
      switch (id) {
        case 'terminal':
          this.components[id] = new TerminalComponent(body);
          break;
        case 'code':
          this.components[id] = new CodeEditorComponent(body);
          break;
        case 'network':
          this.components[id] = new NetworkViewerComponent(body);
          break;
        case 'cctv':
          this.components[id] = new CCTVViewerComponent(body);
          break;
        case 'suspects':
          this.components[id] = new SuspectsDbViewerComponent(body);
          break;
        case 'restore':
          this.components[id] = new RestoreViewerComponent(body);
          break;
        case 'server':
          this.components[id] = new ServerFolderViewerComponent(body, (windowId) => this.openWindow(windowId));
          break;
      }
    }

    this.setupWindowControls(win, id);
  }

  setupWindowControls(win, id) {
    if (win._controlsBound) return;
    win._controlsBound = true;

    // Header buttons
    const closeBtn = win.querySelector('.win-btn-close');
    const minBtn = win.querySelector('.win-btn-min');
    const maxBtn = win.querySelector('.win-btn-max');
    const header = win.querySelector('.window-header');

    if (closeBtn) {
      closeBtn.onclick = () => {
        win.classList.add('hidden');
        win.style.display = 'none';
        sound.playKeyClick();
      };
    }

    if (minBtn) {
      minBtn.onclick = () => {
        win.classList.add('hidden');
        win.style.display = 'none';
        sound.playKeyClick();
      };
    }

    if (maxBtn) {
      maxBtn.onclick = () => {
        win.classList.toggle('maximized');
        sound.playKeyClick();
      };
    }

    // Bring to front on click
    win.onmousedown = () => this.bringToFront(win);

    // Draggable header
    if (header) {
      let isDragging = false;
      let startX, startY, initialX, initialY;

      header.onmousedown = (e) => {
        if (e.target.closest('.win-controls')) return;
        isDragging = true;
        this.bringToFront(win);

        startX = e.clientX;
        startY = e.clientY;

        const rect = win.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        const onMouseMove = (moveEvent) => {
          if (!isDragging || win.classList.contains('maximized')) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          win.style.left = `${Math.max(0, initialX + dx)}px`;
          win.style.top = `${Math.max(0, initialY + dy)}px`;
        };

        const onMouseUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
    }
  }

  bringToFront(win) {
    this.highestZ++;
    win.style.zIndex = this.highestZ;
  }

  bindGlobalEvents() {
    // Keyboard shortcut: Ctrl + Shift + O = Open Organizer Menu
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        if (this.orgModal) this.orgModal.show();
      }
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.grantGame = new DesktopApp();
});
