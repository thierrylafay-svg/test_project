
class Overlay {
  constructor() {
    this.racine = null;      // hôte Shadow DOM
    this.surcouche = null;   // div de surlignage
    this.infobulle = null;
    this.creer();
  }

    creer() {
    // Racine unique + Shadow DOM : isolement CSS garanti avec la page hôte
    this.racine = document.createElement("div");
    this.racine.id = "nav-assistant-root";
    document.body.appendChild(this.racine);

    // Styles des surlignages : les .surcouche/.infobulle sont ajoutés à la PAGE
    // (document.body, hors Shadow DOM) — leurs règles doivent donc être injectées
    // dans le document, sinon elles restent enfermées dans le shadow root.
    const stylePage = document.createElement("style");
    stylePage.textContent = `
      .surcouche { position: fixed; pointer-events: none; z-index: 2147483645;
        border: 3px solid #fa541c; border-radius: 6px;
        box-shadow: 0 0 0 4px rgba(250,84,28,.25); transition: all .2s ease; }
      .infobulle { position: fixed; z-index: 2147483647; max-width: 260px;
        background: #1a1a2e; color: #fff; padding: 8px 10px; border-radius: 8px;
        font: 12px/1.4 system-ui, sans-serif; pointer-events: none; }
      .infobulle::before { content: ""; position: absolute; top: -6px; left: 14px;
        border: 6px solid transparent; border-bottom-color: #1a1a2e; border-top: 0; }
    `;
    document.head.appendChild(stylePage);

    const shadow = this.racine.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        #panneau {
          position: fixed; bottom: 16px; right: 16px; width: 340px;
          background: #fff; color: #1a1a2e; border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,.25); font: 13px/1.45 system-ui, sans-serif;
          padding: 12px; z-index: 2147483646;
        }
        #panneau h2 { font-size: 14px; margin: 0 0 8px; }
        #zone-texte { width: 100%; min-height: 54px; resize: vertical;
          border: 1px solid #c9c9d6; border-radius: 8px; padding: 8px; box-sizing: border-box; }
        #bouton-envoyer { margin-top: 8px; width: 100%; padding: 8px;
          background: #fa541c; color: #fff; border: 0; border-radius: 8px; cursor: pointer; }
        #bouton-envoyer:disabled { background: #c9c9d6; }
        #reponse { margin-top: 8px; white-space: pre-wrap; }
        #choix button { display: block; width: 100%; text-align: left; margin: 4px 0;
          padding: 6px 8px; border: 1px solid #e3e3ee; border-radius: 8px;
          background: #f6f6fb; cursor: pointer; }
      </style>
      <div id="panneau">
        <h2>🧭 Assistant de démarche</h2>
        <textarea id="zone-texte" placeholder="Ex. : Comment changer mon adresse ?"></textarea>
        <button id="bouton-envoyer">Demander</button>
        <div id="reponse"></div>
        <div id="choix"></div>
      </div>
    `;

    this.zoneTexte = shadow.getElementById("zone-texte");
    this.bouton = shadow.getElementById("bouton-envoyer");
    this.zoneReponse = shadow.getElementById("reponse");
    this.zoneChoix = shadow.getElementById("choix");

    this.bouton.addEventListener("click", () => {
      const question = this.zoneTexte.value.trim();
      if (question) this.onQuestion(question); // câblé par l'orchestrateur
    });
  }

  /** Affiche une réponse validée + les choix proposés. */
  afficherReponse(reponseIA) {
    this.zoneReponse.textContent = reponseIA.reponse || "(pas de réponse)";
    this.zoneChoix.innerHTML = "";
    reponseIA.choix.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = c.titre;
      b.addEventListener("click", () => this.surligner(c.nav_aid, c.titre));
      this.zoneChoix.appendChild(b);
    });
  }

  afficherErreur(message) {
    this.zoneReponse.textContent = `⚠️ ${message}`;
  }

  enAttente(actif) {
    this.bouton.disabled = actif;
    this.bouton.textContent = actif ? "Analyse…" : "Demander";
  }

  /** Dessine le contour + l'infobulle autour d'un élément (via son nav_aid). */
  surligner(navAid, message) {
    this.effacer();
        const el = document.querySelector(`[data-nav-aid="${navAid}"]`);
    if (!el) return;

    const r = el.getBoundingClientRect();
    this.surcouche = document.createElement("div");
    this.surcouche.className = "surcouche";
    Object.assign(this.surcouche.style, {
      top: `${r.top - 4}px`, left: `${r.left - 4}px`,
      width: `${r.width + 8}px`, height: `${r.height + 8}px`,
    });
    document.body.appendChild(this.surcouche);

    this.infobulle = document.createElement("div");
    this.infobulle.className = "infobulle";
    this.infobulle.textContent = message || "";
    Object.assign(this.infobulle.style, {
      top: `${Math.max(8, r.top - 44)}px`, left: `${Math.max(8, r.left)}px`,
    });
    document.body.appendChild(this.infobulle);

    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /** Retire tout surlignage et recalcule les positions si besoin. */
  effacer() {
    this.surcouche?.remove();
    this.infobulle?.remove();
    this.surcouche = this.infobulle = null;
  }

  /** Recalcule les rectangles au scroll/resize (débouncé). */
  suivreDeplacements() {
    let attente;
    const recalcul = () => {
      clearTimeout(attente);
      attente = setTimeout(() => {
        // simple : re-surligner le même nav_aid si un surlignage est actif
        const actif = document.querySelector(".surcouche");
        if (actif && this.dernierNavAid) this.surligner(this.dernierNavAid, this.dernierMessage);
      }, 150);
    };
    window.addEventListener("scroll", recalcul, { passive: true });
    window.addEventListener("resize", recalcul);
  }
}