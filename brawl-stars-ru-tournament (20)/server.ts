import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to verify admin password securely on the server
  app.post("/api/verify-admin", (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Неверный пароль администратора." });
    }
  });

  // API Route to verify host password securely on the server
  app.post("/api/verify-host", (req, res) => {
    const { password } = req.body;
    if (password === process.env.HOST_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Неверный код доступа ведущего." });
    }
  });
  
  // Discord OAuth Setup
  app.get('/api/auth/discord/url', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "DISCORD_CLIENT_ID not configured" });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/discord/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify',
    });
    res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  });

  app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
       return res.send("Missing code parameter");
    }
    
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/discord/callback`;

    try {
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const tokens = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || "Token request failed");
      }

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokens.token_type} ${tokens.access_token}`
        }
      });
      const userData = await userResponse.json();
      
      // We will send this back to the popup opener
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Успешная авторизация. Это окно закроется автоматически.</p>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      res.send("Authentication failed. " + (err as Error).message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(process.cwd()));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
