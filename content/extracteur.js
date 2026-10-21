
const SELECTEURS_INTERACTIFS = [
  "a[href]",
  "button",
  "input:not([type=hidden])",
  "select",
  "textarea",
  "[role=button]",
  "[role=tab]",
  "[role=checkbox]",
  "[onclick]",
];

function libelleDe(element) {
  return (
    element.getAttribute("aria-label") ||
    element.labels?.[0]?.innerText ||
    element.placeholder ||
    element.innerText ||
    element.value ||
    element.title ||
    ""
  ).trim().slice(0, 80);
}

function sectionParente(element) {
  // Titre de section le plus proche, pour situer l'action dans la démarche
  let courant = element.parentElement;
  while (courant) {
    if (/^H[1-6]$/.test(courant.tagName)) return courant.innerText.trim();
    const h = courant.querySelector?.(":scope > h1, :scope > h2, :scope > h3, :scope > h4");
    if (h) return h.innerText.trim();
    courant = courant.parentElement;
  }
  return "";
}

function elementVisible(el) {
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

class Extracteur {
  /** Construit la carte d'actions de la page courante.
   *  @returns {{url: string, titre: string, actions: Array<Object>}} */
  static construireCarte() {
    const actions = [];
    let compteur = 0;
    const tous = document.querySelectorAll(SELECTEURS_INTERACTIFS.join(","));

    tous.forEach((el) => {
      if (!elementVisible(el)) return;
      const navAid = `a${compteur++}`;

      // Mémorise le lien nav_aid → élément pour la re-localisation (surlignage)
      el.dataset.navAid = navAid;
      el.dataset.navSelector = genererSelecteur(el);

      actions.push({
        nav_aid: navAid,
        type: el.tagName.toLowerCase() + (el.type ? `:${el.type}` : ""),
        libelle: libelleDe(el),
        desactive: el.disabled || el.getAttribute("aria-disabled") === "true",
        obligatoire: el.required === true,
        section: sectionParente(el),
        options: el.tagName === "SELECT"
          ? Array.from(el.options).slice(0, 15).map((o) => o.label)
          : undefined,
      });
    });

    return {
      url: location.href,
      titre: document.title,
      section_courante: sectionParente(document.activeElement) || "",
      actions,
    };
  }
}

function genererSelecteur(el) {
  if (el.id) return `#${el.id}`;
  const partie = (e) =>
    e.tagName.toLowerCase() +
    (e.className && typeof e.className === "string"
      ? "." + e.className.trim().split(/\s+/).slice(0, 2).join(".")
      : "");
  const chemin = [];
  let courant = el;
  while (courant && courant !== document.body && chemin.length < 4) {
    chemin.unshift(partie(courant));
    courant = courant.parentElement;
  }
  return chemin.join(" > ");
}
