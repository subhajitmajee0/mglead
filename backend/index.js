const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Facebook OAuth Step 1 ---
app.get("/facebook/login", (req, res) => {
  const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=ads_read,leads_retrieval,email,public_profile`;
  res.redirect(url);
});

// --- Facebook OAuth Step 2 ---
app.get("/facebook/callback", async (req, res) => {
  const code = req.query.code;
  const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`;
  try {
    const tokenRes = await axios.get(tokenUrl);
    // Save access token somewhere secure for this user
    res.json(tokenRes.data);
  } catch (err) {
    res.status(500).json({ error: "Facebook OAuth failed" });
  }
});

// --- Fetch Facebook Leads ---
app.post("/facebook/leads", async (req, res) => {
  const { accessToken, pageId, formId } = req.body;
  // You must know your pageId and formId from Facebook Business
  try {
    const leadsUrl = `https://graph.facebook.com/v20.0/${formId}/leads?access_token=${accessToken}`;
    const leadsRes = await axios.get(leadsUrl);
    res.json(leadsRes.data.data); // array of leads
  } catch (err) {
    res.status(500).json({ error: "Facebook lead fetch failed" });
  }
});

// --- Google OAuth Step 1 ---
app.get("/google/login", (req, res) => {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email` +
    `&access_type=offline`;
  res.redirect(url);
});

// --- Google OAuth Step 2 ---
app.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    // Save access token somewhere secure for this user
    res.json(tokenRes.data);
  } catch (err) {
    res.status(500).json({ error: "Google OAuth failed" });
  }
});

// --- Fetch Google Leads (using Ads API) ---
// You’ll need developer token and customer id for real Google Ads API
app.post("/google/leads", async (req, res) => {
  // This is just a placeholder response
  res.json([
    {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "555-2222",
      city: "San Francisco",
      source: "Google",
    },
  ]);
});

app.listen(port, () => console.log(`Backend running on ${port}`));
