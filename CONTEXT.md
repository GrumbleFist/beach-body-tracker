# Beach Body Weight Tracker - Project Context

## Overview
A Progressive Web App (PWA) for tracking weight with a tropical beach theme. Users log daily weight, and the app projects when they'll reach their "beach body" goal based on the last 4 weeks of data.

## Repository
- **GitHub**: https://github.com/GrumbleFist/beach-body-tracker
- **Live URL** (once Pages enabled): https://grumblefist.github.io/beach-body-tracker/

## Project Structure
```
beach-body-tracker/
├── index.html          # Main app HTML - all screens/modals
├── styles.css          # Tropical beach theme CSS
├── app.js              # All app logic (state, storage, chart, projections)
├── sw.js               # Service worker for offline support
├── manifest.json       # PWA manifest for installability
└── icons/
    ├── generate-icons.html   # Open in browser to create PNG icons
    ├── icon-192.png          # [PENDING] PWA icon 192x192
    └── icon-512.png          # [PENDING] PWA icon 512x512
```

## Specification File
Full requirements documented in:
```
C:\Users\MarkLaptop\Weight Projector\beach-body-app-spec.md
```

## Key Features Implemented
- ✅ Initial setup (current weight, target weight, unit selection)
- ✅ Daily weight entry with OMAD/Fasted checkbox
- ✅ Color-coded entries: Green (loss+fasted), Orange (loss), Red (gain)
- ✅ Celebration screen with confetti after each log
- ✅ Weight history graph with projection line
- ✅ 4-week projection algorithm to target date
- ✅ Edit/delete historical entries
- ✅ Settings page (change target, units, reset data)
- ✅ Offline support via service worker
- ✅ PWA installable to home screen

## Technical Details

### Data Storage
Local storage key: `beachBodyState`
```javascript
{
  settings: {
    unit: 'kg' | 'lbs',
    targetWeight: number,
    targetDate: string | null,
    setupComplete: boolean
  },
  entries: [{
    id: string,
    date: 'YYYY-MM-DD',
    weight: number,
    omadOrFasted: boolean,
    previousWeight: number,
    changeType: 'loss-fasted' | 'loss-regular' | 'gain' | 'no-change' | 'initial'
  }]
}
```

### Projection Algorithm
1. Gather entries from last 28 days
2. Calculate: (oldest weight - newest weight) / days
3. Project: days to target = weight to lose / avg daily loss

### Color Scheme
- Ocean deep: #1a5276
- Ocean mid: #2e86ab
- Turquoise: #48c9b0
- Sand: #f4d03f
- Sunset orange: #e74c3c
- Sunset pink: #ff6b9d
- Palm green: #27ae60

## Pending Tasks
1. **Generate PWA icons**: Open `icons/generate-icons.html` in browser, download both PNGs to icons folder
2. **Enable GitHub Pages**: Settings → Pages → Branch: main → Save
3. **Push icons**: `git add . && git commit -m "Add PWA icons" && git push`

## How to Continue Development

### Local Testing
Just open `index.html` in a browser. For full PWA features (service worker), use a local server:
```bash
cd "C:\Users\MarkLaptop\Weight Projector\beach-body-tracker"
npx serve .
```

### Making Changes
1. Edit the files locally
2. Test in browser
3. Commit and push:
```bash
cd "C:\Users\MarkLaptop\Weight Projector\beach-body-tracker"
git add .
git commit -m "Description of changes"
git push
```

### Key Files to Edit
- **UI/Layout**: `index.html`
- **Styling/Theme**: `styles.css`
- **Logic/Features**: `app.js`
- **Offline caching**: `sw.js` (update CACHE_NAME version when making changes)

## Future Enhancement Ideas (from spec)
- Daily reminder notifications
- Statistics dashboard (total lost, streak, best week)
- Motivational quotes rotation
- Share progress as image
- Tap graph points to edit entries directly

---
*Last updated: January 2026*
*Built with Claude Code*
