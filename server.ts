import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Datastore from "@seald-io/nedb";
import crypto from "crypto";

// Sanitize user inputs to prevent XSS and keep it extremely secure
function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

// Ensure database directory is absolute and persistent
const dbDir = path.join(process.cwd(), "db");

// Initialize secure NeDB databases
const gameStatesDb = new Datastore({ filename: path.join(dbDir, "gamestates.db"), autoload: true });
const leaderboardDb = new Datastore({ filename: path.join(dbDir, "leaderboard.db"), autoload: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json({ limit: "2mb" }));

  // 1. API: Get or create game state securely
  app.get("/api/game-state", async (req, res) => {
    try {
      const playerId = req.query.playerId as string;
      
      if (playerId && typeof playerId === "string" && playerId.length > 5) {
        // Find existing state
        const stateDoc = await gameStatesDb.findOneAsync({ _id: playerId });
        if (stateDoc) {
          return res.json({ playerId, state: stateDoc.state });
        }
      }

      // Generate secure playerId and default state
      const newPlayerId = crypto.randomUUID();
      const defaultState = {
        coins: 150,
        currentLevelId: 1,
        foundWords: [],
        unlockedLevels: [1],
        revealedCells: {},
        bonusWordsFound: [],
        totalBonusWordsCount: 0,
        completedDailyDate: "",
        playerScore: 150,
        playerName: "کاتب جوان"
      };

      await gameStatesDb.insertAsync({ _id: newPlayerId, state: defaultState });
      return res.json({ playerId: newPlayerId, state: defaultState });
    } catch (err) {
      console.error("Error in GET /api/game-state:", err);
      res.status(500).json({ error: "خطای سرور در دریافت اطلاعات" });
    }
  });

  // 2. API: Save game state securely
  app.post("/api/game-state", async (req, res) => {
    try {
      const { playerId, state } = req.body;
      if (!playerId || typeof playerId !== "string" || !state) {
        return res.status(400).json({ error: "اطلاعات نامعتبر" });
      }

      // Sanitize name in state for security
      if (state.playerName) {
        state.playerName = sanitizeString(state.playerName);
      }

      // Update in db
      await gameStatesDb.updateAsync({ _id: playerId }, { $set: { state } }, { upsert: true });

      // Also ensure this user is updated in the leaderboard db
      await leaderboardDb.updateAsync(
        { playerId },
        { 
          $set: { 
            name: state.playerName || "کاتب جوان",
            level: state.currentLevelId || 1,
            score: state.playerScore || 150,
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error in POST /api/game-state:", err);
      res.status(500).json({ error: "خطای سرور در ثبت اطلاعات" });
    }
  });

  // 3. API: Fetch leaderboards sorted by score
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // Find all players in leaderboard
      const players = await leaderboardDb.findAsync({});
      
      // Seed default offline players to ensure leaderboard is rich
      const defaultPlayers = [
        { id: "p1", name: "جعفرخان تبریزی", level: 45, score: 2450, avatarColor: "oklch(0.577 0.245 27.325)" },
        { id: "p2", name: "مریم بانو", level: 34, score: 1850, avatarColor: "oklch(0.488 0.243 264.376)" },
        { id: "p3", name: "الناز شیرازی", level: 28, score: 1420, avatarColor: "oklch(0.704 0.191 22.216)" },
        { id: "p4", name: "سهراب سخندان", level: 21, score: 950, avatarColor: "oklch(0.439 0 0)" },
        { id: "p5", name: "کیان دانا", level: 14, score: 580, avatarColor: "oklch(0.371 0 0)" }
      ];

      const mappedRealPlayers = players.map(p => ({
        id: p.playerId,
        name: p.name,
        level: p.level,
        score: p.score,
        avatarColor: "oklch(0.205 0 0)", // Default color for custom users
        isCurrentUser: false // Client will check matching ID
      }));

      // Combine lists and sort
      const all = [...mappedRealPlayers];
      
      // Ensure default mock records are backfilled if names don't conflict
      for (const dp of defaultPlayers) {
        if (!all.some(p => p.name === dp.name)) {
          all.push({
            id: dp.id,
            name: dp.name,
            level: dp.level,
            score: dp.score,
            avatarColor: dp.avatarColor,
            isCurrentUser: false
          });
        }
      }

      // Sort by score descending
      all.sort((a, b) => b.score - a.score);

      res.json(all.slice(0, 15));
    } catch (err) {
      console.error("Error in GET /api/leaderboard:", err);
      res.status(500).json({ error: "خطای سرور در دریافت جدول رده‌بندی" });
    }
  });

  // 4. API: Submit score and update leaderboard
  app.post("/api/leaderboard/submit", async (req, res) => {
    try {
      const { playerId, name, score, level } = req.body;
      if (!playerId || typeof playerId !== "string" || !name) {
        return res.status(400).json({ error: "اطلاعات نامعتبر" });
      }

      const cleanName = sanitizeString(name);

      await leaderboardDb.updateAsync(
        { playerId },
        { 
          $set: { 
            name: cleanName, 
            score: Number(score) || 0, 
            level: Number(level) || 1, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error in POST /api/leaderboard/submit:", err);
      res.status(500).json({ error: "خطای سرور در ثبت رده‌بندی" });
    }
  });

  // Vite middleware setup or Static file hosting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
