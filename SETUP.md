# Quick Start Guide

## 5-Minute Setup

### Step 1: Create a Google Sheet
1. Go to **[Google Sheets](https://sheets.google.com)**
2. Click **+ Create new spreadsheet**
3. Name it: `Tournament Schedule Generator`

### Step 2: Add the Script
1. In your new Sheet, click **Tools** → **Script editor**
2. Delete any starter code
3. Copy the entire code from **Code.gs** in this repository
4. Paste it into the Script editor
5. Click **Save** (top left)
6. Name the project: `Tournament Schedule Generator`
7. Close the script editor (go back to your Sheet)
8. **Refresh your Sheet** (Ctrl+R or Cmd+R)

### Step 3: You'll See a New Menu
At the top of your Sheet, you should now see **"Tournament Schedule"** menu

### Step 4: Add Your Teams
1. The script automatically creates a **Teams** sheet
2. Add your team names in column A:
   - Team A
   - Team B
   - Team C
   - Team D

### Step 5: Configure Tournament Format
1. Go to the **Config** sheet
2. Set `Number of Rounds` to how many rounds you want
3. For each round, choose a format:
   - `round-robin` - Every team plays every other team
   - `single-elimination` - Single bracket
   - `double-elimination` - Winners + losers brackets
   - `swiss-system` - Competitive pairings
   - `pool-play` - Group stages

Example config:
```
Number of Rounds: 3
Round 1 Format: round-robin
Round 2 Format: round-robin
Round 3 Format: single-elimination
```

### Step 6: Generate!
1. Click the **Tournament Schedule** menu
2. Select **Generate Schedule**
3. Done! Check the **Schedule** sheet for all matches

## That's It! 🎉

Your schedule is ready. You can now:
- ✏️ Manually enter results
- 📊 Track team performance
- 🔄 Clear and regenerate anytime
- 📥 Download/print the schedule
- 🔗 Share the Sheet with others

## Need Help?

Click **Tournament Schedule** → **Show Help** for in-app guidance

## Common Questions

**Q: Can I change the tournament setup after generating?**
- A: Yes! Clear the Schedule, modify Config or Teams, then Generate again.

**Q: Can multiple people use it at once?**
- A: Yes! Share the Sheet link. However, only one person should Generate at a time.

**Q: How do I export the schedule?**
- A: Right-click the Schedule sheet tab → Download → Choose format (Excel, PDF, etc.)

**Q: Can I modify the script?**
- A: Yes! Click Tools → Script editor anytime. See Code.gs for detailed comments.

---

**Enjoy your tournament scheduling!** ⚽🏐🏀
