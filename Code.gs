// Tournament Tracker - UEFA Champions League Style
// Configurable rounds, groups, Yankee-style scheduling, and standings

// ============================================================================
// CONFIGURATION FUNCTIONS
// ============================================================================

function getConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config') || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('Config');
  
  const data = sheet.getDataRange().getValues();
  const config = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key) config[key] = value;
  }
  
  return config;
}

function initializeConfig() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Config');
  }
  
  sheet.clear();
  
  const configData = [
    ['Setting', 'Value'],
    ['Tournament Name', 'UEFA Champions League'],
    ['Number of Rounds', 6],
    ['Number of Groups', 4],
    ['Teams per Group', 4],
    ['Point for Win', 2],
    ['Point for Draw', 1],
    ['Point for Loss', 0]
  ];
  
  sheet.getRange(1, 1, configData.length, 2).setValues(configData);
}

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

function initializeTeams() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Teams');
  }
  
  sheet.clear();
  
  const headers = ['Team ID', 'Team Name', 'Group', 'Wins', 'Losses', 'Points For', 'Points Against', 'Total Points'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
}

function addTeam(teamName, groupId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
  const lastRow = sheet.getLastRow();
  const teamId = lastRow; // Simple ID based on row number
  
  const newTeam = [teamId, teamName, groupId, 0, 0, 0, 0, 0];
  sheet.getRange(lastRow + 1, 1, 1, newTeam.length).setValues([newTeam]);
}

function getTeams() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
  const data = sheet.getDataRange().getValues();
  const teams = [];
  
  for (let i = 1; i < data.length; i++) {
    teams.push({
      id: data[i][0],
      name: data[i][1],
      group: data[i][2],
      wins: data[i][3],
      losses: data[i][4],
      pointsFor: data[i][5],
      pointsAgainst: data[i][6],
      totalPoints: data[i][7]
    });
  }
  
  return teams;
}

function updateTeamStats(teamId, wins, losses, pointsFor, pointsAgainst, totalPoints) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == teamId) {
      sheet.getRange(i + 1, 4, 1, 5).setValues([[wins, losses, pointsFor, pointsAgainst, totalPoints]]);
      break;
    }
  }
}

// ============================================================================
// SCHEDULE GENERATION - YANKEE STYLE
// ============================================================================

function generateYankeeSchedule(teams, rounds) {
  // Yankee scheduling algorithm - balanced schedule
  const schedule = [];
  const teamList = [...teams];
  
  // If odd number of teams, add bye
  const hasBye = teamList.length % 2 === 1;
  if (hasBye) {
    teamList.push({ id: -1, name: 'BYE' });
  }
  
  const n = teamList.length;
  
  for (let round = 0; round < rounds; round++) {
    const matches = [];
    
    for (let i = 0; i < n / 2; i++) {
      const team1 = teamList[i];
      const team2 = teamList[n - 1 - i];
      
      if (team1.id !== -1 && team2.id !== -1) {
        matches.push({
          round: round + 1,
          team1Id: team1.id,
          team1Name: team1.name,
          team2Id: team2.id,
          team2Name: team2.name,
          team1Score: null,
          team2Score: null
        });
      }
    }
    
    schedule.push(...matches);
    
    // Rotate teams for next round (Yankee algorithm)
    if (round < rounds - 1) {
      const fixed = teamList[0];
      teamList.splice(0, 1);
      teamList.push(fixed);
    }
  }
  
  return schedule;
}

function generateSchedule() {
  const config = getConfig();
  const numRounds = config['Number of Rounds'] || 6;
  const numGroups = config['Number of Groups'] || 4;
  const teamsPerGroup = config['Teams per Group'] || 4;
  
  const teams = getTeams();
  
  // Group teams by group
  const groupedTeams = {};
  for (let g = 1; g <= numGroups; g++) {
    groupedTeams[g] = teams.filter(t => t.group === g);
  }
  
  let scheduleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedule');
  if (!scheduleSheet) {
    scheduleSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Schedule');
  }
  scheduleSheet.clear();
  
  const headers = ['Round', 'Group', 'Match ID', 'Team 1', 'Team 1 Score', 'Team 2', 'Team 2 Score'];
  scheduleSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  scheduleSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#34A853').setFontColor('white');
  
  let row = 2;
  let matchId = 1;
  
  // Generate schedule for each group
  for (let groupId = 1; groupId <= numGroups; groupId++) {
    const groupTeams = groupedTeams[groupId] || [];
    if (groupTeams.length === 0) continue;
    
    const schedule = generateYankeeSchedule(groupTeams, numRounds);
    
    for (const match of schedule) {
      const matchData = [
        match.round,
        groupId,
        matchId++,
        match.team1Name,
        '',
        match.team2Name,
        ''
      ];
      scheduleSheet.getRange(row, 1, 1, matchData.length).setValues([matchData]);
      row++;
    }
  }
  
  // Auto-resize columns
  scheduleSheet.autoResizeColumns(1, headers.length);
}

// ============================================================================
// STANDINGS MANAGEMENT
// ============================================================================

function calculateStandings() {
  const config = getConfig();
  const pointsForWin = config['Point for Win'] || 2;
  const pointsForDraw = config['Point for Draw'] || 1;
  const pointsForLoss = config['Point for Loss'] || 0;
  
  const scheduleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedule');
  const teamsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
  
  if (!scheduleSheet || !teamsSheet) return;
  
  // Reset team stats
  const teamsData = teamsSheet.getDataRange().getValues();
  for (let i = 1; i < teamsData.length; i++) {
    const teamId = teamsData[i][0];
    updateTeamStats(teamId, 0, 0, 0, 0, 0);
  }
  
  // Process all matches
  const scheduleData = scheduleSheet.getDataRange().getValues();
  const teamStats = {};
  
  for (let i = 1; i < scheduleData.length; i++) {
    const team1 = scheduleData[i][3];
    const score1 = scheduleData[i][4];
    const team2 = scheduleData[i][5];
    const score2 = scheduleData[i][6];
    
    if (score1 === '' || score2 === '') continue; // Skip unplayed matches
    
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    
    // Find team IDs
    let team1Id = null, team2Id = null;
    for (let j = 1; j < teamsData.length; j++) {
      if (teamsData[j][1] === team1) team1Id = teamsData[j][0];
      if (teamsData[j][1] === team2) team2Id = teamsData[j][0];
    }
    
    if (!teamStats[team1Id]) {
      teamStats[team1Id] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, totalPoints: 0 };
    }
    if (!teamStats[team2Id]) {
      teamStats[team2Id] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, totalPoints: 0 };
    }
    
    teamStats[team1Id].pointsFor += s1;
    teamStats[team1Id].pointsAgainst += s2;
    teamStats[team2Id].pointsFor += s2;
    teamStats[team2Id].pointsAgainst += s1;
    
    if (s1 > s2) {
      teamStats[team1Id].wins++;
      teamStats[team1Id].totalPoints += pointsForWin;
      teamStats[team2Id].losses++;
      teamStats[team2Id].totalPoints += pointsForLoss;
    } else if (s2 > s1) {
      teamStats[team2Id].wins++;
      teamStats[team2Id].totalPoints += pointsForWin;
      teamStats[team1Id].losses++;
      teamStats[team1Id].totalPoints += pointsForLoss;
    } else {
      teamStats[team1Id].totalPoints += pointsForDraw;
      teamStats[team2Id].totalPoints += pointsForDraw;
    }
  }
  
  // Update team sheet
  for (const teamId in teamStats) {
    const stats = teamStats[teamId];
    updateTeamStats(teamId, stats.wins, stats.losses, stats.pointsFor, stats.pointsAgainst, stats.totalPoints);
  }
}

function getStandingsByGroup() {
  const teams = getTeams();
  const standing = {};
  
  for (const team of teams) {
    if (!standing[team.group]) {
      standing[team.group] = [];
    }
    standing[team.group].push(team);
  }
  
  // Sort each group by: Total Points (desc) -> Point Differential (desc) -> Points For (desc)
  for (const group in standing) {
    standing[group].sort((a, b) => {
      const pointsDiffA = a.pointsFor - a.pointsAgainst;
      const pointsDiffB = b.pointsFor - b.pointsAgainst;
      
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (pointsDiffB !== pointsDiffA) return pointsDiffB - pointsDiffA;
      return b.pointsFor - a.pointsFor;
    });
  }
  
  return standing;
}

// ============================================================================
// MENU & UI FUNCTIONS
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Tournament')
    .addItem('Initialize Config', 'initializeConfig')
    .addItem('Initialize Teams', 'initializeTeams')
    .addItem('Generate Schedule', 'generateSchedule')
    .addItem('Calculate Standings', 'calculateStandings')
    .addItem('Export to HTML', 'exportToHTML')
    .addToUi();
}

// ============================================================================
// EXPORT TO HTML
// ============================================================================

function exportToHTML() {
  const config = getConfig();
  const standings = getStandingsByGroup();
  const scheduleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedule');
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config['Tournament Name'] || 'Tournament'} Tracker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .tab-btn {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .tab-btn.active {
            background: white;
            color: #667eea;
            font-weight: bold;
        }

        .tab-btn:hover {
            background: rgba(255, 255, 255, 0.4);
        }

        .content {
            display: none;
            animation: fadeIn 0.3s ease-in;
        }

        .content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .standings-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .group-standings {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .group-title {
            font-size: 1.5em;
            color: #667eea;
            margin-bottom: 15px;
            font-weight: bold;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }

        tr:hover {
            background: #f5f5f5;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .rank {
            font-weight: bold;
            color: #667eea;
            width: 30px;
        }

        .schedule-container {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            margin-bottom: 20px;
        }

        .schedule-title {
            font-size: 1.5em;
            color: #667eea;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .round-section {
            margin-bottom: 25px;
            border-left: 4px solid #34A853;
            padding-left: 15px;
        }

        .round-title {
            font-size: 1.2em;
            font-weight: bold;
            color: #34A853;
            margin-bottom: 10px;
        }

        .match {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f9f9f9;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #34A853;
        }

        .team-info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .team-name {
            font-weight: 600;
            color: #333;
            min-width: 150px;
        }

        .vs {
            color: #999;
            font-weight: bold;
        }

        .score {
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            min-width: 80px;
            text-align: center;
        }

        .no-score {
            color: #999;
        }

        .group-label {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            margin-left: 10px;
        }

        @media (max-width: 768px) {
            .standings-container {
                grid-template-columns: 1fr;
            }

            .match {
                flex-direction: column;
                align-items: flex-start;
            }

            .team-info {
                flex-direction: column;
                align-items: flex-start;
                width: 100%;
            }

            .header h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${config['Tournament Name'] || 'Tournament'}</h1>
            <p>Group Stage Standings & Schedule</p>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('standings')">📊 Standings</button>
            <button class="tab-btn" onclick="switchTab('schedule')">📅 Schedule</button>
        </div>

        <!-- STANDINGS TAB -->
        <div id="standings" class="content active">
            <div class="standings-container">`;

  // Add standings for each group
  for (const group in standings) {
    const groupTeams = standings[group];
    html += `
                <div class="group-standings">
                    <div class="group-title">Group ${group}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>PF</th>
                                <th>PA</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>`;

    groupTeams.forEach((team, index) => {
      const pointDiff = team.pointsFor - team.pointsAgainst;
      html += `
                            <tr>
                                <td class="rank">${index + 1}</td>
                                <td><strong>${team.name}</strong></td>
                                <td>${team.wins}</td>
                                <td>${team.losses}</td>
                                <td>${team.pointsFor}</td>
                                <td>${team.pointsAgainst}</td>
                                <td><strong>${team.totalPoints}</strong></td>
                            </tr>`;
    });

    html += `
                        </tbody>
                    </table>
                </div>`;
  }

  html += `
            </div>
        </div>

        <!-- SCHEDULE TAB -->
        <div id="schedule" class="content">
            <div class="schedule-container">
                <div class="schedule-title">📅 Match Schedule</div>`;

  if (scheduleSheet) {
    const scheduleData = scheduleSheet.getDataRange().getValues();
    let currentRound = null;

    for (let i = 1; i < scheduleData.length; i++) {
      const round = scheduleData[i][0];
      const group = scheduleData[i][1];
      const team1 = scheduleData[i][3];
      const score1 = scheduleData[i][4];
      const team2 = scheduleData[i][5];
      const score2 = scheduleData[i][6];

      if (round !== currentRound) {
        if (currentRound !== null) {
          html += `</div>`;
        }
        currentRound = round;
        html += `<div class="round-section">
                    <div class="round-title">Round ${round}</div>`;
      }

      const scoreDisplay = score1 !== '' && score2 !== '' ? `${score1} - ${score2}` : 'vs';
      const scoreClass = score1 === '' || score2 === '' ? 'no-score' : '';

      html += `
                <div class="match">
                    <div class="team-info">
                        <span class="team-name">${team1}</span>
                        <span class="vs">vs</span>
                        <span class="team-name">${team2}</span>
                    </div>
                    <div class="score ${scoreClass}">${scoreDisplay}</div>
                    <span class="group-label">Group ${group}</span>
                </div>`;
    }

    if (currentRound !== null) {
      html += `</div>`;
    }
  }

  html += `
            </div>
        </div>
    </div>

    <script>
        function switchTab(tabName) {
            // Hide all content
            const contents = document.querySelectorAll('.content');
            contents.forEach(c => c.classList.remove('active'));

            // Remove active class from all buttons
            const buttons = document.querySelectorAll('.tab-btn');
            buttons.forEach(b => b.classList.remove('active'));

            // Show selected content
            document.getElementById(tabName).classList.add('active');

            // Add active class to clicked button
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;

  // Save to file
  const fileName = `${config['Tournament Name'] || 'Tournament'}_Standings.html`;
  saveHTMLFile(fileName, html);
  
  SpreadsheetApp.getUi().alert(`HTML exported to: ${fileName}`);
}

function saveHTMLFile(fileName, htmlContent) {
  // Get the folder of the current spreadsheet
  const file = SpreadsheetApp.getActiveSpreadsheet();
  const fileId = file.getId();
  const parentFolder = DriveApp.getFileById(fileId).getParents().next();
  
  // Create or update HTML file
  const blob = Utilities.newBlob(htmlContent, 'text/html', fileName);
  parentFolder.createFile(blob);
}
