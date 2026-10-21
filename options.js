const champ = document.getElementById("cle");
const statut = document.getElementById("statut");
const basculer = document.getElementById("basculer");

// Affiche/masque la clé (vérification visuelle qu'elle est bien collée)
basculer.addEventListener("click", () => {
  const visible = champ.type === "text";
  champ.type = visible ? "password" : "text";
  basculer.textContent = visible ? "Afficher" : "Masquer";
});

// Au chargement : pré-remplit si une clé est déjà stockée
chrome.storage.local.get("apiKey").then(({ apiKey }) => {
  if (apiKey) {
    champ.value = apiKey;
    statut.textContent = "Une clé est déjà enregistrée — vous pouvez la remplacer.";
    statut.className = "";
  }
});

document.getElementById("enregistrer").addEventListener("click", async () => {
  const valeur = champ.value.trim();
  if (valeur.length < 10) {   // au lieu de startsWith("sk-")
    statut.textContent = "⚠️ La clé semble trop courte — vérifiez la copie complète.";
    statut.className = "ko";
    return;
  }
  try {
    await chrome.storage.local.set({ apiKey: valeur });
    const verification = await chrome.storage.local.get("apiKey");
    if (verification.apiKey === valeur) {
      statut.textContent = "✅ Clé enregistrée et vérifiée.";
      statut.className = "ok";
    } else {
      statut.textContent = "❌ Échec de l'enregistrement — réessayez.";
      statut.className = "ko";
    }
  } catch (e) {
    statut.textContent = "❌ Erreur : " + e;
    statut.className = "ko";
  }
});