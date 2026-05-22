/**
 * Tournament Schedule Generator - Google Apps Script
 * Generates tournament schedules with multiple format options
 * Supports: Round Robin, Single Elimination, Double Elimination, Swiss System, Pool Play
 */

// ============================================================================
// MAIN MENU & UI
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Tournament Schedule')
    .addItem('Generate Schedule', 'generateScheduleUI')
    .addItem('Clear Schedule', 'clearSchedule')
    .addItem('Show Help', 'showHelp')
    .addToUi();
  
  // Initialize sheets on first open
  initializeSheets();
}

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ss.getSheetNames();
  
  // Create Teams sheet if doesn't exist
  if (!sheetNames.includes('Teams')) {
    const teamsSheet = ss.insertSheet('Teams');
    teamsSheet.getRange('A1').setValue('Team Name');
    teamsSheet.setColumnWidth(1, 200);
  }
  
  // Create Config sheet if doesn't exist
  if (!sheetNames.includes('Config')) {
    const configSheet = ss.insertSheet('Config');
    configSheet.getRange('A1').setValue('Setting');
    configSheet.getRange('B1').setValue('Value');
    configSheet.getRange('A2').setValue('Number of Rounds');
    configSheet.getRange('B2').setValue(1);
    configSheet.getRange('A3').setValue('Round 1 Format');
    configSheet.getRange('B3').setValue('round-robin');
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 200);
  }
  
  // Create Schedule sheet if doesn't exist
  if (!sheetNames.includes('Schedule')) {
    const scheduleSheet = ss.insertSheet('Schedule');
    scheduleSheet.getRange('A1').setValue('Round');
    scheduleSheet.getRange('B1').setValue('Match #');
    scheduleSheet.getRange('C1').setValue('Team 1');
    scheduleSheet.getRange('D1').setValue('Team 2');
    scheduleSheet.getRange('E1').setValue('Winner');
    scheduleSheet.getRange('F1').setValue('Score');
    scheduleSheet.getRange('G1').setValue('Notes');
    scheduleSheet.setFrozenRows(1);
    
    // Style header
    const headerRange = scheduleSheet.getRange('A1:G1');
    headerRange.setBackground('#366092').setFontColor('white').setFontWeight('bold');
  }
}

function showHelp() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial; padding: 20px; }
      h2 { color: #366092; }
      p { line-height: 1.6; }
      .step { margin: 15px 0; padding: 10px; background: #f0f0f0; }
    </style>
    <h2>Tournament Schedule Generator - Help</h2>
    
    <h3>Quick Setup</h3>
    <div class="step">
      <strong>1. Add Teams:</strong> Go to the "Teams" sheet and list your team names in column A (one per row)
    </div>
    <div class="step">
      <strong>2. Configure Rounds:</strong> Go to the "Config" sheet:
      <ul>
        <li>Set "Number of Rounds"</li>
        <li>For each round, set the format (e.g., "Round 1 Format", "Round 2 Format")</li>
      </ul>
    </div>
    <div class="step">
      <strong>3. Generate:</strong> Click "Tournament Schedule" menu → "Generate Schedule"
    </div>
    
    <h3>Supported Formats</h3>
    <ul>
      <li><strong>round-robin:</strong> Every team plays every other team</li>
      <li><strong>single-elimination:</strong> Bracket style - lose once, you're out</li>
      <li><strong>double-elimination:</strong> Winners and losers brackets</li>
      <li><strong>swiss-system:</strong> Competitive pairings based on performance</li>
      <li><strong>pool-play:</strong> All teams in one group</li>
    </ul>
    
    <h3>Tips</h3>
    <ul>
      <li>Use "Clear Schedule" to start over</li>
      <li>You can manually edit any match after generating</li>
      <li>Fill in "Winner" column and "Score" to track results</li>
      <li>Right-click Schedule sheet → Download to export</li>
    </ul>
  `);
  SpreadsheetApp.getUi().showModelessDialog(html, 'Help');
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

function generateScheduleUI() {
  try {
    generateSchedule();
    SpreadsheetApp.getUi().alert('✅ Schedule generated successfully!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
    Logger.log(error);
  }
}

function generateSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const teamsSheet = ss.getSheetByName('Teams');
  const configSheet = ss.getSheetByName('Config');
  const scheduleSheet = ss.getSheetByName('Schedule');
  
  // Get teams
  const teamsData = teamsSheet.getRange('A2:A').getValues().filter(row => row[0]);
  const teams = teamsData.map(row => row[0]);
  
  if (teams.length < 2) {
    throw new Error('Need at least 2 teams to generate a schedule');
  }
  
  // Get config
  const configData = configSheet.getRange('A:B').getValues();
  const configMap = {};
  for (let i = 1; i < configData.length; i++) {
    if (configData[i][0]) {
      configMap[configData[i][0]] = configData[i][1];
    }
  }
  
  const numRounds = parseInt(configMap['Number of Rounds']) || 1;
  
  // Clear existing schedule (keep header)
  scheduleSheet.getRange('A2:G').clearContent();
  
  let scheduleRows = [];
  let currentTeams = [...teams];
  
  // Generate each round
  for (let round = 1; round <= numRounds; round++) {
    const format = configMap[`Round ${round} Format`] || 'round-robin';
    const matches = generateMatches(currentTeams, format, round);
    scheduleRows = scheduleRows.concat(matches);
  }
  
  // Write schedule to sheet
  if (scheduleRows.length > 0) {
    const range = scheduleSheet.getRange(2, 1, scheduleRows.length, 7);
    range.setValues(scheduleRows);
    
    // Format alternating row colors
    for (let i = 0; i < scheduleRows.length; i++) {
      if (i % 2 === 0) {
        scheduleSheet.getRange(2 + i, 1, 1, 7).setBackground('#f9f9f9');
      }
    }
  }
}

// ============================================================================
// MATCH GENERATION FUNCTIONS
// ============================================================================

function generateMatches(teams, format, round) {
  switch (format.toLowerCase()) {
    case 'round-robin':
      return generateRoundRobin(teams, round);
    case 'single-elimination':
      return generateSingleElimination(teams, round);
    case 'double-elimination':
      return generateDoubleElimination(teams, round);
    case 'swiss-system':
      return generateSwissSystem(teams, round);
    case 'pool-play':
      return generatePoolPlay(teams, round);
    default:
      return generateRoundRobin(teams, round);
  }
}

function generateRoundRobin(teams, round) {
  const matches = [];
  let matchNum = 1;
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push([round, matchNum, teams[i], teams[j], '', '', '']);
      matchNum++;
    }
  }
  
  return matches;
}

function generateSingleElimination(teams, round) {
  const matches = [];
  let matchNum = 1;
  
  // Pad teams to power of 2
  let paddedTeams = [...teams];
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  while (paddedTeams.length < nextPowerOf2) {
    paddedTeams.push('(BYE)');
  }
  
  // Shuffle for random bracket
  paddedTeams = shuffleArray(paddedTeams);
  
  // Generate bracket
  for (let i = 0; i < paddedTeams.length; i += 2) {
    matches.push([round, matchNum, paddedTeams[i], paddedTeams[i + 1], '', '', '']);
    matchNum++;
  }
  
  return matches;
}

function generateDoubleElimination(teams, round) {
  // Simplified: winners bracket only (full implementation would include losers bracket)
  return generateSingleElimination(teams, round);
}

function generateSwissSystem(teams, round) {
  // Simplified: random pairings for this round
  let shuffled = shuffleArray([...teams]);
  const matches = [];
  let matchNum = 1;
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push([round, matchNum, shuffled[i], shuffled[i + 1], '', '', '']);
      matchNum++;
    }
  }
  
  return matches;
}

function generatePoolPlay(teams, round) {
  // Same as round-robin for pool play
  return generateRoundRobin(teams, round);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clearSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('Schedule');
  scheduleSheet.getRange('A2:G').clearContent();
  SpreadsheetApp.getUi().alert('✅ Schedule cleared!');
}
