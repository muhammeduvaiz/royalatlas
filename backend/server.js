const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;
const BONUS_AMOUNT_AED = 50; // 50 AED bonus for trucks passing multiple times within 12h

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer to store uploaded file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Toll Gate 12-Hour Bonus API is running' });
});

// Route to handle Excel file upload & 12-hour bonus eligibility calculation
app.post('/api/upload-tolls', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 1. Read Excel file buffer with cellDates enabled
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read sheet as a 2D Array (header: 1) for multi-block layout
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const truckLogs = {};
    let currentTruckNo = null;

    // 2. Loop through rows to extract truck blocks and transactions
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !Array.isArray(row) || row.length === 0) continue;

      // Check for truck header row
      // Example: Index 1 is 'Truck No :', Index 5 is license plate (e.g., '15940 BB')
      const col1 = row[1] != null ? String(row[1]).trim() : '';
      if (/^truck\s*no\s*:/i.test(col1)) {
        currentTruckNo = row[5] ? String(row[5]).trim() : null;
        if (currentTruckNo && !truckLogs[currentTruckNo]) {
          truckLogs[currentTruckNo] = [];
        }
        continue;
      }

      // Check if it's a numbered transaction row under current truck
      const isTransactionRow =
        currentTruckNo &&
        row[0] != null &&
        (typeof row[0] === 'number' || (!isNaN(Number(row[0])) && String(row[0]).trim() !== ''));

      if (isTransactionRow) {
        // Index 13 contains the 'Passage Date' timestamp
        const passageDate = row[13];
        if (passageDate) {
          const time = new Date(passageDate);
          if (!isNaN(time.getTime())) {
            truckLogs[currentTruckNo].push(time);
          }
        }
      }
    }

    // 3. Apply the 12-hour sliding window bonus calculation
    const bonusTrucks = [];
    const allTrucks = [];

    for (const [truckId, times] of Object.entries(truckLogs)) {
      // Sort crossing times chronologically (oldest to newest)
      times.sort((a, b) => a.getTime() - b.getTime());

      let maxPassesIn12Hours = 0;
      let windowStartTime = null;
      let windowEndTime = null;
      const totalPasses = times.length;

      for (let i = 0; i < times.length; i++) {
        let passesInWindow = 1;
        let lastInWindow = times[i];

        for (let j = i + 1; j < times.length; j++) {
          const diffHours = (times[j].getTime() - times[i].getTime()) / (1000 * 60 * 60);

          if (diffHours <= 12) {
            passesInWindow++;
            lastInWindow = times[j];
          } else {
            // Sorted timestamps -> subsequent will exceed 12 hours
            break;
          }
        }

        if (passesInWindow > maxPassesIn12Hours) {
          maxPassesIn12Hours = passesInWindow;
          windowStartTime = times[i];
          windowEndTime = lastInWindow;
        }
      }

      const isBonusEligible = maxPassesIn12Hours >= 2;
      const bonusEarned = isBonusEligible ? BONUS_AMOUNT_AED : 0;

      const truckSummary = {
        truckId,
        totalPasses,
        maxPassesIn12Hours,
        windowStartTime,
        windowEndTime,
        isBonusEligible,
        bonusEarned
      };

      allTrucks.push(truckSummary);

      if (isBonusEligible) {
        bonusTrucks.push(truckSummary);
      }
    }

    const totalBonusPayout = bonusTrucks.length * BONUS_AMOUNT_AED;

    res.json({
      message: 'Processing complete',
      totalTrucksFound: Object.keys(truckLogs).length,
      bonusEligibleCount: bonusTrucks.length,
      bonusRatePerTruck: BONUS_AMOUNT_AED,
      totalBonusPayout,
      bonusTrucks,
      flaggedTrucks: bonusTrucks, // backwards compatibility
      flaggedCount: bonusTrucks.length,
      allTrucks
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
