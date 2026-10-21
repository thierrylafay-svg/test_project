
const Prompt = {
  systeme() {
    return [
      "Tu es un assistant d'aide à la navigation sur un site de démarche.",
      "On te fournit la question d'un utilisateur et la carte JSON des actions",
      "possibles sur la page courante (chaque action a un identifiant nav_aid).",
      "Réponds en français, brièvement (3 phrases max).",
      "Cite UNIQUEMENT des nav_aid présents dans la carte — n'invente jamais d'élément.",
      "Retourne un JSON strict au format :",
      '{"reponse": "…", "elements": [{"nav_aid": "…", "infobulle": "…"}], "choix_possibles": [{"titre": "…", "nav_aid": "…"}]}',
    ].join(" ");
  },

  utilisateur(question, carte) {
    // Blinding : retirer ici toute valeur saisie par l'utilisateur avant l'envoi.
    const carteAnonymisee = { ...carte };
    return `Question de l'utilisateur : « ${question} »\n\nCarte d'actions de la page :\n${JSON.stringify(carteAnonymisee)}`;
  },
};
