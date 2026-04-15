// server.js
// Faith and Mind Cameroon — USSD Survey System
// Main server file

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const questions = require('./questions');
const { isValidIDCode, getSurveyStatus, markSurveyComplete, registerIDCode } = require('./idcodes');
const { saveSurveyToSheets } = require('./datasaver');

const app = express();
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ============================================================
// HEALTH CHECK — Must be first route registered
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Faith and Mind Cameroon USSD System is running!');
});

// ============================================================
// RATE LIMITING — Fix V5
// Limits each phone number/IP to 30 USSD requests per minute
// Prevents flooding and abuse of the endpoint
// ============================================================
const ussdLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute window
  max: 30,                    // max 30 requests per minute per IP
  message: 'END Too many requests. Please wait a moment and try again.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/ussd', ussdLimiter);

// ============================================================
// USSD SESSION STORAGE
// Stores ongoing survey sessions in memory
// ============================================================
const sessions = {};

// ============================================================
// MAIN USSD ENDPOINT
// Africa's Talking sends all USSD requests here
// ============================================================
app.post('/ussd', async (req, res) => {
  
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  console.log(`\n📱 USSD Request — Session: ${sessionId}`);
  console.log(`   Phone: ${phoneNumber}`);
  console.log(`   Text: "${text}"`);
  
  // Initialize session if new
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
  
  // ============================================================
  // STEP 1: LANGUAGE SELECTION
  // ============================================================
  if (session.step === 'language_select') {
    
    if (text === '') {
      // First time — show welcome screen
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
  
  // ============================================================
  // STEP 2: ENTER ID CODE
  // ============================================================
  else if (session.step === 'enter_id') {
    const lang = session.language;
    const enteredCode = currentInput.toUpperCase().trim();
    
    // For sandbox testing, auto-register any code that looks valid
    if (process.env.NODE_ENV === 'sandbox') {
      registerIDCode(enteredCode);
    }
    
    if (isValidIDCode(enteredCode)) {
      session.id_code = enteredCode;
      const status = getSurveyStatus(enteredCode);
      
      if (status.pre_done && status.post_done) {
        // Both surveys completed
        response = questions[lang].already_done;
        cleanSession(sessionId);
        
      } else if (!status.pre_done) {
        // Pre-survey not done yet
        session.survey_type = 'PRE';
        session.step = 'phq2_q1';
        response = questions[lang].phq2_q1;
        
      } else if (status.pre_done && !status.post_done) {
        // Pre done, post not done
        session.survey_type = 'POST';
        session.step = 'phq2_q1';
        response = questions[lang].phq2_q1;
        
      }
    } else {
      response = questions[lang].invalid_id;
      cleanSession(sessionId);
    }
  }
  
  // ============================================================
  // SURVEY QUESTIONS — PHQ-2
  // ============================================================
  else if (session.step === 'phq2_q1') {
    if (['1','2','3','4'].includes(currentInput)) {
      session.answers.phq2_q1 = getAnswerLabel(currentInput, 'frequency');
      session.step = 'phq2_q2';
      response = questions[session.language].phq2_q2;
    } else {
      response = questions[session.language].phq2_q1; // Repeat question
    }
  }
  
  else if (session.step === 'phq2_q2') {
    if (['1','2','3','4'].includes(currentInput)) {
      session.answers.phq2_q2 = getAnswerLabel(currentInput, 'frequency');
      session.step = 'mass_q1';
      response = questions[session.language].mass_q1;
    } else {
      response = questions[session.language].phq2_q2;
    }
  }
  
  // ============================================================
  // SURVEY QUESTIONS — MASS
  // ============================================================
  else if (session.step === 'mass_q1') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q1 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'mass_q2';
      response = questions[session.language].mass_q2;
    } else {
      response = questions[session.language].mass_q1;
    }
  }
  
  else if (session.step === 'mass_q2') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q2 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'mass_q3';
      response = questions[session.language].mass_q3;
    } else {
      response = questions[session.language].mass_q2;
    }
  }
  
  else if (session.step === 'mass_q3') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.mass_q3 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'ribs_q1';
      response = questions[session.language].ribs_q1;
    } else {
      response = questions[session.language].mass_q3;
    }
  }
  
  // ============================================================
  // SURVEY QUESTIONS — RIBS
  // ============================================================
  else if (session.step === 'ribs_q1') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q1 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'ribs_q2';
      response = questions[session.language].ribs_q2;
    } else {
      response = questions[session.language].ribs_q1;
    }
  }
  
  else if (session.step === 'ribs_q2') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q2 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'ribs_q3';
      response = questions[session.language].ribs_q3;
    } else {
      response = questions[session.language].ribs_q2;
    }
  }
  
  else if (session.step === 'ribs_q3') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q3 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'ribs_q4';
      response = questions[session.language].ribs_q4;
    } else {
      response = questions[session.language].ribs_q3;
    }
  }
  
  else if (session.step === 'ribs_q4') {
    if (['1','2','3'].includes(currentInput)) {
      session.answers.ribs_q4 = getAnswerLabel(currentInput, 'agreement3');
      session.step = 'cami_q1';
      response = questions[session.language].cami_q1;
    } else {
      response = questions[session.language].ribs_q4;
    }
  }
  
  // ============================================================
  // SURVEY QUESTIONS — CAMI
  // ============================================================
  else if (session.step === 'cami_q1') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q1 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'cami_q2';
      response = questions[session.language].cami_q2;
    } else {
      response = questions[session.language].cami_q1;
    }
  }
  
  else if (session.step === 'cami_q2') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q2 = getAnswerLabel(currentInput, 'agreement5');
      session.step = 'cami_q3';
      response = questions[session.language].cami_q3;
    } else {
      response = questions[session.language].cami_q2;
    }
  }
  
  else if (session.step === 'cami_q3') {
    if (['1','2','3','4','5'].includes(currentInput)) {
      session.answers.cami_q3 = getAnswerLabel(currentInput, 'agreement5');
      
      // ✅ ALL QUESTIONS ANSWERED — SAVE DATA!
      const surveyData = {
        id_code: session.id_code,
        survey_type: session.survey_type,
        language: session.language,
        phone: session.phone,
        phq2_q1: session.answers.phq2_q1,
        phq2_q2: session.answers.phq2_q2,
        mass_q1: session.answers.mass_q1,
        mass_q2: session.answers.mass_q2,
        mass_q3: session.answers.mass_q3,
        ribs_q1: session.answers.ribs_q1,
        ribs_q2: session.answers.ribs_q2,
        ribs_q3: session.answers.ribs_q3,
        ribs_q4: session.answers.ribs_q4,
        cami_q1: session.answers.cami_q1,
        cami_q2: session.answers.cami_q2,
        cami_q3: session.answers.cami_q3
      };
      
      // Save to Google Sheets
      await saveSurveyToSheets(surveyData);
      
      // Mark survey complete
      markSurveyComplete(session.id_code, session.survey_type);
      
      // Send thank you message
      if (session.survey_type === 'PRE') {
        response = questions[session.language].thank_you_pre;
      } else {
        response = questions[session.language].thank_you_post;
      }
      
      // Send SMS confirmation
      sendSMSConfirmation(session.phone, session.survey_type, session.language);
      
      // Clean up session
      cleanSession(sessionId);
      
    } else {
      response = questions[session.language].cami_q3;
    }
  }
  
  // ============================================================
  // DEFAULT — Should not reach here
  // ============================================================
  else {
    response = questions[session.language || 'EN'].error;
    cleanSession(sessionId);
  }
  
  console.log(`   Response: ${response.substring(0, 50)}...`);
  res.send(response);
});

// ============================================================
// ADMIN ENDPOINTS (For Delphine to manage ID codes)
// ============================================================

// Register new ID codes for a meeting
app.post('/admin/register-codes', (req, res) => {
  const { advocateCode, participantCount, adminKey } = req.body;
  
  // Simple security check
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { bulkRegisterCodes } = require('./idcodes');
  const codes = bulkRegisterCodes(advocateCode, parseInt(participantCount));
  
  res.json({
    success: true,
    advocate: advocateCode,
    codes_generated: codes.length,
    codes: codes
  });
});

// View all registered codes and their status
app.get('/admin/status', (req, res) => {
  const { participantStore } = require('./idcodes');
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
  }, 5000); // Clean up after 5 seconds
}

async function sendSMSConfirmation(phone, surveyType, language) {
  // Optional: Send SMS confirmation to participant
  // Uncomment and configure when ready for production
  /*
  const AfricasTalking = require('africastalking');
  const at = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
  });
  
  const message = language === 'EN'
    ? `Thank you! Your ${surveyType}-meeting survey is complete. - Faith & Mind Cameroon`
    : `Merci! Votre enquête ${surveyType === 'PRE' ? 'pré' : 'post'}-réunion est complète. - Faith & Mind Cameroun`;
  
  await at.SMS.send({ to: [phone], message, from: 'FaithMind' });
  */
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
