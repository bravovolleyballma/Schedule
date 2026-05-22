# Tournament Schedule Generator

A 100% online tournament schedule generator built with **Google Sheets + Google Apps Script**. No downloads, no setup - just open a sheet and go!

## ✨ Features

- ✅ **5 Tournament Formats** - Round Robin, Single Elimination, Double Elimination, Swiss System, Pool Play
- ✅ **Multiple Rounds** - Mix different formats across rounds
- ✅ **100% Online** - Everything runs in Google Sheets
- ✅ **Free** - Uses Google's free services
- ✅ **Shareable** - Share your tournament with others
- ✅ **Easy Setup** - 5 minutes to get started
- ✅ **Customizable** - Edit teams and formats anytime

## 🚀 Quick Start

See **[SETUP.md](SETUP.md)** for detailed instructions, but here's the TL;DR:

1. Create a Google Sheet
2. Go to **Tools → Script Editor**
3. Copy `Code.gs` and paste it
4. Save and reload your Sheet
5. Add teams, configure rounds, click **"Tournament Schedule" → "Generate Schedule"**

Done! ⚽

## 📋 Tournament Formats Explained

### Round Robin
Every team plays every other team once. Best for small tournaments (4-8 teams).
- **Pros:** Fair, comprehensive
- **Cons:** Many matches, slow

### Single Elimination
Classic bracket - lose once, you're out. Fast tournaments.
- **Pros:** Quick, exciting
- **Cons:** Teams might only play 1 match

### Double Elimination
Winners bracket and losers bracket. Second chances available.
- **Pros:** Fair, exciting, more matches
- **Cons:** More complex

### Swiss System
Teams paired by current ranking/performance. Balanced middle ground.
- **Pros:** Efficient, fair
- **Cons:** Needs tracking between rounds

### Pool Play
All teams in one group (like Round Robin). Good for large tournaments to narrow field.
- **Pros:** Comprehensive initial seeding
- **Cons:** Many matches in first round

## 📊 How It Works

```
Your Sheet Sheets:
├─ Teams       → List your team names here
├─ Config      → Set number of rounds & formats
├─ Schedule    → Generated matches appear here
└─ (optional)  → Add more sheets as needed
```

**Example Config:**
```
Number of Rounds: 3
Round 1 Format:   round-robin        (all teams play all)
Round 2 Format:   round-robin        (group by results)
Round 3 Format:   single-elimination (finals)
```

## 🔧 Customization

### Edit Match Formats
Open Script Editor (Tools → Script Editor) and modify the `generateMatches()` function.

### Add Custom Logic
The script is fully editable. Add tie-breaking, seeding algorithms, venue assignment, etc.

### Export Results
Right-click Schedule sheet → Download → Choose format (PDF, Excel, etc.)

## 🎯 Typical Workflow

1. **Setup Tournament**
   - Add team names to "Teams" sheet
   - Configure formats in "Config" sheet

2. **Generate Schedule**
   - Click "Tournament Schedule" menu
   - Select "Generate Schedule"

3. **Run Tournament**
   - Enter match results in "Winner" column
   - Use "Notes" for scores, times, venues

4. **View & Share**
   - Scroll through Schedule sheet
   - Share link with teams
   - Download for printing

## ❓ FAQ

**Q: Can I use this for sports other than volleyball?**
- A: Yes! Works for any tournament - soccer, basketball, chess, esports, etc.

**Q: How many teams can I add?**
- A: Unlimited! But note:
  - Round Robin with 20+ teams = very many matches
  - Single Elimination is better for large tournaments

**Q: Can multiple people edit at once?**
- A: Yes! Share the Sheet. Just don't all hit "Generate" simultaneously.

**Q: Can I modify the schedule after generating?**
- A: Yes! Manually edit any row. Or clear and regenerate.

**Q: What if I make a mistake?**
- A: Click "Clear Schedule" and regenerate.

**Q: Can I download the schedule?**
- A: Yes! Right-click Schedule sheet tab → Download as PDF/Excel/etc.

## 🐛 Troubleshooting

**Script menu doesn't appear after pasting?**
- Reload your Sheet (Ctrl+R or Cmd+R)
- Refresh your browser

**"Not enough permissions" error?**
- Click "Review Permissions"
- Grant permission to the script
- Try again

**Only getting 1 match?**
- Check you have at least 2 teams in Teams sheet
- Check Config sheet has proper format values

**Sheet is slow?**
- Normal if generating 100+ matches
- Wait a few seconds

## 📞 Support

- See **SETUP.md** for setup help
- Click "Show Help" in the Tournament Schedule menu
- Check the script comments in `Code.gs`

## 📝 License

Free to use and modify!

## 🤝 Contributing

Found a bug or have an idea? Open an issue on GitHub!

---

**Ready to schedule? Follow [SETUP.md](SETUP.md)!** 🎉
