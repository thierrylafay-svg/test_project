
class Orchestrateur {
  constructor() {
    this.overlay = new Overlay();
    this.overlay.onQuestion = (q) => this.traiterQuestion(q);
    this.overlay.suivreDeplacements();
  }

  async traiterQuestion(question) {
    this.overlay.enAttente(true);
    this.overlay.effacer();

    try {
      // 1. Extraction du contexte (couche 2)
      const carte = Extracteur.construireCarte();

      // 2. Appel de la couche 3 via le service worker (clé d'API protégée)
      const rep = await chrome.runtime.sendMessage({
        type: "ASK_IA",
        systemPrompt: Prompt.systeme(),
        userPrompt: Prompt.utilisateur(question, carte),
      });
      if (!rep.ok) throw new Error(rep.erreur);

      // 3. Garde-fou : seuls les nav_aid réellement présents sont conservés
      const valide = Validation.filtrer(rep.json);
      console.log("Réponse IA brute :", rep.json);
      console.log("Après validation :", valide);

      // 4. Restitution UI + surlignage du premier élément pertinent
      this.overlay.afficherReponse(valide);
      if (valide.fiable) {
        const premier = valide.elements[0];
        this.overlay.dernierNavAid = premier.nav_aid;
        this.overlay.dernierMessage = premier.infobulle;
        this.overlay.surligner(premier.nav_aid, premier.infobulle);
      }
    } catch (e) {
      this.overlay.afficherErreur(String(e));
      console.error("Erreur de surlignage :", e);
    } finally {
      this.overlay.enAttente(false);
    }
  }
}

// Point d'entrée : l'orchestrateur démarre une fois le DOM prêt
if (document.readyState !== "loading") new Orchestrateur();
else document.addEventListener("DOMContentLoaded", () => new Orchestrateur());
