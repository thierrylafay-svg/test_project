
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MODELE = "mistral-small-latest";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "ASK_IA") return false;

  (async () => {
    const { apiKey } = await chrome.storage.local.get("apiKey");
    if (!apiKey) {
      sendResponse({ ok: false, erreur: "Clé API absente. Ouvrez les options de l'extension." });
      return;
    }

    try {
      const rep = await fetch(MISTRAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODELE,
          temperature: 0.2,
          max_tokens: 600,
          response_format: { type: "json_object" }, // JSON strict garanti
          messages: [
            { role: "system", content: msg.systemPrompt },
            { role: "user", content: msg.userPrompt },
          ],
        }),
      });
      if (!rep.ok) throw new Error(`HTTP ${rep.status}`);
      const data = await rep.json();
      const contenu = data.choices[0].message.content;
      sendResponse({ ok: true, json: JSON.parse(contenu) });
    } catch (e) {
      sendResponse({ ok: false, erreur: String(e) });
    }
  })();

  return true; // réponse asynchrone
});
