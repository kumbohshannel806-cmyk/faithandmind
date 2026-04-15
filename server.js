// server.js
// Faith and Mind Cameroon — USSD Survey System
// Main server file

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const questions = require('./questions');
const { isValidIDCode, getSurveyStatus, markSurveyComplete, registerIDCode, bulkRegisterCodes, participantStore } = require('./idcodes');
const { saveSurveyToSheets } = require('./datasaver');

const app = express();
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Faith and Mind Cameroon USSD System is running!');
});

// ============================================================
// RATE LIMITING
// ============================================================
const ussdLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'END Too many requests. Please wait a moment and try again.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/ussd', ussdLimiter);

// ============================================================
// USSD SESSION STORAGE
// ============================================================
const sessions = {};

// ============================================================
// MAIN USSD ENDPOINT
// ============================================================
app.post('/ussd', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log(`\n📱 USSD Request — Session: ${sessionId}`);
  console.log(`   Phone: ${phoneNumber}`);
  console.log(`   Text: "${text}"`);

  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      phone: phoneNumber,
      language: null,
      id_code: null,
      survey_type: null,
      step: 'language_select',
      answers: {}
    };
  }

  const session = sessions[sessionId];
  const inputs = text.split('*');
  const currentInput = inputs[inputs.length - 1];
  let response = '';

  // STEP 1: LANGUAGE SELECTION
  if (session.step === 'language_select') {
    if (text === '') {
      response = "CON Welcome to Faith & Mind Cameroon!\nBienvenue chez Faith & Mind!\n\nSelect Language / Choisir la Langue:\n1. English\n2. Français";
    } else if (currentInput === '1') {
      session.language = 'EN';
      session.step = 'enter_id';
      response = questions.EN.enter_id;
    } else if (currentInput === '2') {
      session.language = 'FR';
      session.step = 'enter_id';
      response = questions.FR.enter_id;
    } else {
      response = "CON Invalid choice. Please select:\n1. English\n2. Français";
    }
  }

  // STEP 2: ENTER ID CODE
  else if (session.step === 'enter_id') {
    const lang = session.language;
    const enteredCode = currentInput.toUpperCase().trim();

    if (process.env.NODE_ENV === 'sandbox') {
      registerIDCode(enteredCode);
    }

    if (isValidIDCode(enteredCode)) {
      session.id_code = enteredCode;
      const status = getSurveyStatus(enteredCode);

      if (status.pre_done && status.post_done) {
        response = questions[lang].already_done;
        cleanSession(sessionId);
      } else if (!status.pre_done) {
        session.survey_type = 'PRE';
        session.step = 'phq2_q1';
        response = questions[lang].phq2_q1;
      } else {
        session.survey_type = 'POST';
        session.step = 'phq2_q1';
        response = questions[lang].phq2_q1;
      }
    } else {
      response = questions[lang].invalid_id;
      cleanSession(sessionId);
    }
  }

  // PHQ-2 Q1
  else if (session.step === 'phq2_q1') {
    if (['1','2','3','4'].includes(currentInput)) {
      session.answers.phq2_q1 = getAnswerLabel(currentInput, 'frequency');
      session.step = 'phq2_q2';
      response = questions[session.language].phq2_q2;
    } else {
      response = questions[session.language].phq2_q1;
    }
  }

  // PHQ-2 Q2
  else if (session.step === 'phq2_q2') {
    if (['1','2','3','4'].includes(currentInput)) {
      session.answers.phq2_q2 = getAnswerLabel(currentInput, 'frequency');
      session.step = 'mass_q1';
      response = questions[session.language].mass_q1;
    } else {
      response = questions[session.language].phq2_q2;
    }
  }

  // MASS Q1
  else if (session.step === 'mass_q1') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q1 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'mass_q2';
      response = questions[session.language].mass_q2;
    } else {
      response = questions[session.language].mass_q1;
    }
  }

  // MASS Q2
  else if (session.step === 'mass_q2') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q2 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'mass_q3';
      response = questions[session.language].mass_q3;
    } else {
      response = questions[session.language].mass_q2;
    }
  }

  // MASS Q3
  else if (session.step === 'mass_q3') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q3 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'ribs_q1';
      response = questions[session.language].ribs_q1;
    } else {
      response = questions[session.language].mass_q3;
    }
  }

  // RIBS Q1
  else if (session.step === 'ribs_q1') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q1 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'ribs_q2';
      response = questions[session.language].ribs_q2;
    } else {
      response = questions[session.language].ribs_q1;
    }
  }

  // RIBS Q2
  else if (session.step === 'ribs_q2') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q2 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'ribs_q3';
      response = questions[session.language].ribs_q3;
    } else {
      response = questions[session.language].ribs_q2;
    }
  }

  // RIBS Q3
  else if (session.step === 'ribs_q3') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q3 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'cami_q1';
      response = questions[session.language].cami_q1;
    } else {
      response = questions[session.language].ribs_q3;
    }
  }

  // CAMI Q1
  else if (session.step === 'cami_q1') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q1 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'cami_q2';
      response = questions[session.language].cami_q2;
    } else {
      response = questions[session.language].cami_q1;
    }
  }

  // CAMI Q2
  else if (session.step === 'cami_q2') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q2 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'cami_q3';
      response = questions[session.language].cami_q3;
    } else {
      response = questions[session.language].cami_q2;
    }
  }

  // CAMI Q3 — FINAL QUESTION
  else if (session.step === 'cami_q3') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q3 = getAnswerLabel(currentInput, 'agreement5');

      // Save to Google Sheets
      try {
        await saveSurveyToSheets({
          phone: session.phone,
          id_code: session.id_code,
          survey_type: session.survey_type,
          language: session.language,
          answers: session.answers,
          timestamp: new Date().toISOString()
        });
        markSurveyComplete(session.id_code, session.survey_type);
      } catch (err) {
        console.error('❌ Error saving to sheets:', err.message);
      }

      response = questions[session.language].thank_you;
      cleanSession(sessionId);
    } else {
      response = questions[session.language].cami_q3;
    }
  }

  else {
    response = 'END Session error. Please dial again.';
    cleanSession(sessionId);
  }

  console.log(`   Response: ${response.substring(0, 50)}...`);
  res.set('Content-Type', 'text/plain');
  return res.send(response);
});

// ============================================================
// ADMIN — Generate ID codes
// ============================================================
app.post('/admin/generate', (req, res) => {
  const { advocateCode, participantCount, adminKey } = req.body;

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const codes = bulkRegisterCodes(advocateCode, parseInt(participantCount));
  res.json({
    success: true,
    advocate: advocateCode,
    codes_generated: codes.length,
    codes: codes
  });
});

// ============================================================
// ADMIN — View status
// ============================================================
app.get('/admin/status', (req, res) => {
  const summary = {
    total_participants: Object.keys(participantStore).length,
    pre_completed: Object.values(participantStore).filter(p => p.pre_survey_done).length,
    post_completed: Object.values(participantStore).filter(p => p.post_survey_done).length,
    both_completed: Object.values(participantStore).filter(p => p.pre_survey_done && p.post_survey_done).length,
    participants: participantStore
  };
  res.json(summary);
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getAnswerLabel(input, type) {
  const labels = {
    frequency: { '1': 'Not at all', '2': 'Several days', '3': 'More than half the days', '4': 'Nearly every day' },
    agreement5: { '1': 'Strongly Disagree', '2': 'Disagree', '3': 'Neutral', '4': 'Agree', '5': 'Strongly Agree' },
    agreement3: { '1': 'Agree', '2': 'Disagree', '3': 'Neutral' }
  };
  return labels[type][input] || input;
}

function cleanSession(sessionId) {
  setTimeout(() => {
    delete sessions[sessionId];
  }, 5000);
}

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Faith and Mind USSD Server running on port ${PORT}`);
  console.log(`📱 USSD Endpoint: http://localhost:${PORT}/ussd`);
  console.log(`📊 Admin Status: http://localhost:${PORT}/admin/status`);
  console.log(`\n✅ Ready to receive USSD requests!\n`);
});
