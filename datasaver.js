// datasaver.js
// Sends completed survey data to Google Sheets via Google Apps Script

const axios = require('axios');
require('dotenv').config();

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

async function saveSurveyToSheets(surveyData) {
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, surveyData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Data saved to Google Sheets:', surveyData.id_code);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Failed to save to Google Sheets:', error.message);
    
    // Save locally as backup if Google Sheets fails
    saveLocalBackup(surveyData);
    
    return { success: false, error: error.message };
  }
}

// Local backup in case Google Sheets is unavailable
function saveLocalBackup(data) {
  const fs = require('fs');
  const backupFile = './backup_data.json';
  
  let existingData = [];
  if (fs.existsSync(backupFile)) {
    existingData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  }
  
  existingData.push({ ...data, backup_timestamp: new Date().toISOString() });
  fs.writeFileSync(backupFile, JSON.stringify(existingData, null, 2));
  console.log('💾 Backup saved locally to backup_data.json');
}

module.exports = { saveSurveyToSheets };
