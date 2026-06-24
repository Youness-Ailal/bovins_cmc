const { io } = require("socket.io-client");
const BASE = "http://localhost:3001";

(async () => {
  const login = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "youness@bovitrack.ma", password: "password123" }),
  }).then((r) => r.json());
  const token = login.data.token;

  const animaux = await fetch(BASE + "/api/animaux", { headers: { Authorization: "Bearer " + token } }).then((r) => r.json());
  const target = animaux.data.find((a) => a.etatSante !== "Malade") || animaux.data[0];
  console.log("target:", target.identifiant, "| current etat:", target.etatSante);

  const socket = io(BASE, { auth: { token }, transports: ["websocket", "polling"] });
  let got = false;
  const timeout = setTimeout(() => { if (!got) { console.log("FAIL: no alerte:new within 8s"); process.exit(1); } }, 8000);

  socket.on("connect_error", (e) => console.log("connect_error:", e.message));
  socket.on("alerte:new", async (a) => {
    got = true;
    clearTimeout(timeout);
    console.log("RECEIVED alerte:new ->", a.niveau, "|", a.message, "| categorie:", a.categorie);
    await fetch(BASE + "/api/animaux/" + target.id + "/sante", {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ etatSante: "Sain" }),
    }); // cleanup
    socket.disconnect();
    process.exit(0);
  });

  socket.on("connect", async () => {
    console.log("socket connected:", socket.id);
    const r = await fetch(BASE + "/api/animaux/" + target.id + "/sante", {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ etatSante: "Malade" }),
    }).then((x) => x.json());
    console.log("PATCH -> Malade success:", r.success);
  });
})();
