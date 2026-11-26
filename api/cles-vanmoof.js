// Relais Funmoov — récupère les clés VanMoof depuis le compte de l'utilisateur.
// Déployé sur Vercel (gratuit). Le mot de passe transite ici une seule fois,
// uniquement pour interroger les serveurs officiels VanMoof. Rien n'est stocké ni journalisé.

const API_KEY = "fcb38d47-f14b-30cf-843b-26283f6a5819"; // clé API publique de l'app VanMoof
const UA = "VanMoof/20 CFNetwork/1404.0.5 Darwin/22.3.0";
const HOSTS = ["https://my.vanmoof.com/api/v8", "https://api.vanmoof-api.com/v8"];

export default async function handler(req, res) {
  // --- CORS : autoriser l'app Funmoov à appeler ce relais ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });

  try {
    const { email, password } = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {};
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });

    // 1) Authentification -> jeton
    const basic = Buffer.from(`${email}:${password}`).toString("base64");
    let base = null, token = null, lastErr = "";
    for (const h of HOSTS) {
      try {
        const r = await fetch(`${h}/authenticate`, {
          method: "POST",
          headers: { Authorization: `Basic ${basic}`, "Api-Key": API_KEY, "User-Agent": UA },
        });
        if (r.status === 401) return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        if (r.ok) { const j = await r.json(); token = j.token; base = h; break; }
        lastErr = "auth " + r.status;
      } catch (e) { lastErr = e.message; }
    }
    if (!base) return res.status(502).json({ error: "Serveurs VanMoof injoignables (" + lastErr + ")." });
    if (!token) return res.status(401).json({ error: "Connexion refusée : vérifie tes identifiants." });

    // 2) Données client + détails des vélos (dont la clé)
    const dr = await fetch(`${base}/getCustomerData?includeBikeDetails`, {
      headers: { Authorization: `Bearer ${token}`, "Api-Key": API_KEY, "User-Agent": UA },
    });
    if (!dr.ok) return res.status(502).json({ error: "Erreur récupération des vélos (" + dr.status + ")." });
    const data = await dr.json();
    const raw = (data && data.data && data.data.bikeDetails) || [];

    const bikes = raw.map((b) => {
      const key = b.key || {};
      return {
        name: b.name || "",
        model: b.modelName || b.bikeModel || "",
        frame: b.frameNumber || "",
        mac: b.macAddress || "",
        key: String(key.encryptionKey || "").toLowerCase(),
        ukid: key.userKeyId != null ? key.userKeyId : 1,
        backup: key.backupCode || key.passcode || "",
      };
    }).filter((b) => /^[0-9a-f]{32}$/.test(b.key));

    return res.status(200).json({ bikes });
  } catch (e) {
    return res.status(500).json({ error: "Erreur interne du relais : " + e.message });
  }
}
