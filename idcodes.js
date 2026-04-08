// idcodes.js
// Manages participant ID codes and survey completion tracking
// Uses a JSON file for persistence so data survives server restarts on Render

const fs = require('fs');
const path = require('path');

// ============================================================
// FILE-BASED PERSISTENT STORE
// Saves to participant_store.json so data survives restarts
// ============================================================
const STORE_FILE = path.join(__dirname, 'participant_store.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Warning: Could not load participant store, starting fresh.', err.message);
  }
  return {};
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Warning: Could not save participant store.', err.message);
  }
}

// Load store from file on startup
let participantStore = loadStore();

// ============================================================
// GENERATE ID CODES
// advocateCode: e.g., "ADV01"
// count: number of participants
// ============================================================
function generateIDCodes(advocateCode, count) {
  const codes = [];
  for (let i = 1; i <= count; i++) {
    const paddedNum = String(i).padStart(3, '0');
    codes.push(`${advocateCode}-${paddedNum}`);
  }
  return codes;
}

// Register a new ID code in the system
function registerIDCode(idCode) {
  if (!participantStore[idCode]) {
    participantStore[idCode] = {
      id_code: idCode,
      pre_survey_done: false,
      post_survey_done: false,
      created_at: new Date().toISOString()
    };
    saveStore(participantStore);
  }
  return participantStore[idCode];
}

// Check if an ID code is valid
function isValidIDCode(idCode) {
  // ID code format: ADV01-001 (one dash) or ADV-JOHN-001 (two dashes)
  const pattern = /^[A-Z0-9]+(-[A-Z0-9]+)*-\d{3}$/i;
  if (!pattern.test(idCode)) return false;
  // Auto-register on first valid use (handles server restarts)
  if (!participantStore[idCode]) {
    registerIDCode(idCode);
  }
  return true;
}

// Check which surveys are completed
function getSurveyStatus(idCode) {
  const participant = participantStore[idCode];
  if (!participant) return null;
  return {
    pre_done: participant.pre_survey_done,
    post_done: participant.post_survey_done
  };
}

// Mark a survey as completed
function markSurveyComplete(idCode, surveyType) {
  if (participantStore[idCode]) {
    if (surveyType === 'PRE') {
      participantStore[idCode].pre_survey_done = true;
    } else if (surveyType === 'POST') {
      participantStore[idCode].post_survey_done = true;
    }
    saveStore(participantStore);
  }
}

// Bulk register ID codes (call this when Delphine creates codes for a meeting)
function bulkRegisterCodes(advocateCode, count) {
  const codes = generateIDCodes(advocateCode, count);
  codes.forEach(code => registerIDCode(code));
  return codes;
}

module.exports = {
  generateIDCodes,
  registerIDCode,
  isValidIDCode,
  getSurveyStatus,
  markSurveyComplete,
  bulkRegisterCodes,
  participantStore
};
