
const Validation = {
  /** Filtre la réponse IA : ne garde que les éléments existant dans le DOM. */
  filtrer(reponseIA) {
    if (!reponseIA || typeof reponseIA !== "object") return null;

    const existe = (aid) =>
      typeof aid === "string" && document.querySelector(`[data-nav-aid="${aid}"]`) !== null;

    const elements = (reponseIA.elements || []).filter((e) => e && existe(e.nav_aid));
    const choix = (reponseIA.choix_possibles || []).filter((c) => c && existe(c.nav_aid));

    return {
      reponse: typeof reponseIA.reponse === "string" ? reponseIA.reponse : "",
      elements,  // surlignages validés : [{nav_aid, infobulle}]
      choix,     // choix proposés à l'utilisateur : [{titre, nav_aid}]
      fiable: elements.length > 0, // false → afficher le texte sans pointeur
    };
  },
};
