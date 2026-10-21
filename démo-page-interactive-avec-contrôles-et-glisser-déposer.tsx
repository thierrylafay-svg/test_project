import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const ICONS = [
  { id: "home", emoji: "🏠", label: "Accueil" },
  { id: "search", emoji: "🔍", label: "Recherche" },
  { id: "user", emoji: "👤", label: "Profil" },
  { id: "cart", emoji: "🛒", label: "Panier" },
  { id: "mail", emoji: "✉️", label: "Messages" },
  { id: "gear", emoji: "⚙️", label: "Réglages" },
];

export default function App() {
  const [url, setUrl] = useState("https://exemple.com");
  const [submittedUrl, setSubmittedUrl] = useState(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [zoom, setZoom] = useState([75]);
  const [darkMode, setDarkMode] = useState(false);
  const [compteur, setCompteur] = useState(0);
  const [dropped, setDropped] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const dragItem = useRef(null);

  // --- Mesure du temps de réaction pour un double-clic ---
  const [dernierClic, setDernierClic] = useState(null);      // timestamp du 1er clic
  const [delaiMesure, setDelaiMesure] = useState(null);      // ms entre les 2 clics
  const [historique, setHistorique] = useState([]);
  const [enAttente, setEnAttente] = useState(false);

  const handleClicCible = () => {
    const t = performance.now();
    if (enAttente) {
      // 2e clic : on mesure l'intervalle
      const delai = Math.round(t - dernierClic);
      setDelaiMesure(delai);
      setHistorique((h) => [...h.slice(-9), delai]);
      setEnAttente(false);
    } else {
      // 1er clic : on démarre le chrono
      setDernierClic(t);
      setEnAttente(true);
      setDelaiMesure(null);
    }
  };

  const moyenne = historique.length
    ? Math.round(historique.reduce((a, b) => a + b, 0) / historique.length)
    : null;

  const verdict = (d) =>
    d < 200 ? "⚡ double-clic très rapide" :
    d < 500 ? "✓ double-clic standard (< 500 ms)" :
    d < 1000 ? "⚠ lent : le navigateur ne le détecterait peut-être pas comme un double-clic" :
    "✗ trop lent : deux clics distincts, pas un double-clic";

  // Seuil standard des navigateurs : un "double-clic" est détecté si les
  // deux clics surviennent dans un intervalle d'environ 500 ms (voire moins).
  // On peut aussi écouter nativement l'événement 'dblclick' :
  // element.addEventListener("dblclick", handler)

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const icon = ICONS.find((i) => i.id === id);
    if (icon && !dropped.some((d) => d.id === id)) {
      setDropped((prev) => [...prev, icon]);
    }
  }, [dropped]);

  const chargerPage = () => {
    let u = url.trim();
    if (!/^https?:\/\//.test(u)) u = "https://" + u;
    setSubmittedUrl(u);
    setCompteur(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Page interactive — démo</h1>
          <p className="text-slate-500">
            Saisissez une URL, manipulez les contrôles, et glissez-déposez les icônes.
          </p>
        </div>

        {/* Barre d'URL */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && chargerPage()}
                placeholder="Entrez une URL…"
                className="flex-1 font-mono"
              />
              <Button onClick={chargerPage}>Charger</Button>
            </div>
            {submittedUrl && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-green-600 border-green-300">✓ chargée</Badge>
                <span className="font-mono text-slate-500">{submittedUrl}</span>
                <span className="ml-auto text-slate-400">{zoom[0]}% de zoom</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Champs à remplir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
              </div>
              <div className="space-y-2">
                <Label>Niveau de zoom</Label>
                <Slider value={zoom} onValueChange={setZoom} max={200} min={25} step={5} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark">Mode sombre</Label>
                <Switch id="dark" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setCompteur((c) => c - 1)}>−</Button>
                <span className="text-2xl font-bold w-10 text-center">{compteur}</span>
                <Button onClick={() => setCompteur((c) => c + 1)}>+</Button>
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => { setNom(""); setEmail(""); setCompteur(0); }}
                >
                  Réinitialiser
                </Button>
              </div>
              {(nom || email) && (
                <Progress value={((!!nom) + (!!email)) * 50} className="mt-2" />
              )}
            </CardContent>
          </Card>

          {/* Glisser-déposer */}
          <Card>
            <CardHeader>
              <CardTitle>🖱️ Glisser-déposer d'icônes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">Faites glisser les icônes vers la zone cible :</p>
              <div className="flex flex-wrap gap-2">
                {ICONS.filter((i) => !dropped.some((d) => d.id === i.id)).map((icon) => (
                  <div
                    key={icon.id}
                    draggable
                    onDragStart={(e) => {
                      dragItem.current = icon.id;
                      e.dataTransfer.setData("text/plain", icon.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition"
                    title={`Glisser « ${icon.label} »`}
                  >
                    <span className="text-xl">{icon.emoji}</span>
                    <span className="text-sm">{icon.label}</span>
                  </div>
                ))}
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`min-h-32 rounded-xl border-2 border-dashed p-4 flex flex-wrap gap-3 items-center transition ${
                  dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : "border-slate-300 bg-slate-50"
                }`}
              >
                {dropped.length === 0 ? (
                  <span className="text-slate-400 text-sm mx-auto">Déposez les icônes ici 👇</span>
                ) : (
                  dropped.map((icon) => (
                    <div
                      key={icon.id}
                      onDoubleClick={() => setDropped((prev) => prev.filter((d) => d.id !== icon.id))}
                      className="flex flex-col items-center gap-1 rounded-lg bg-white border px-4 py-2 shadow-sm"
                      title="Double-clic pour retirer"
                    >
                      <span className="text-2xl">{icon.emoji}</span>
                      <span className="text-xs text-slate-500">{icon.label}</span>
                    </div>
                  ))
                )}
              </div>
              {dropped.length > 0 && (
                <p className="text-xs text-slate-400">
                  {dropped.length} icône{dropped.length > 1 ? "s" : ""} déposée{dropped.length > 1 ? "s" : ""} — double-cliquez pour retirer
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Temps de réaction double-clic */}
        <Card>
          <CardHeader>
            <CardTitle>⏱️ Mesure du temps de réaction (double-clic)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 items-center">
              <button
                onClick={handleClicCible}
                className={`md:col-span-2 h-32 rounded-xl border-2 text-lg font-semibold transition select-none ${
                  enAttente
                    ? "border-amber-400 bg-amber-50 text-amber-700 animate-pulse"
                    : "border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-[0.99]"
                }`}
              >
                {enAttente ? "Maintenant, cliquez à nouveau ! 👆" : "Cliquez ici 🎯"}
              </button>
              <div className="space-y-2 text-center">
                {delaiMesure !== null ? (
                  <>
                    <div className="text-4xl font-bold text-blue-600">{delaiMesure}<span className="text-lg text-slate-400"> ms</span></div>
                    <div className="text-xs text-slate-500">{verdict(delaiMesure)}</div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm">Double-clic mesuré : —</div>
                )}
              </div>
            </div>
            {historique.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">Historique :</span>
                {historique.map((d, i) => (
                  <Badge key={i} variant={d < 500 ? "default" : "destructive"}>{d} ms</Badge>
                ))}
                <span className="ml-auto text-slate-500">
                  Moyenne : <strong className="text-slate-700">{moyenne} ms</strong>
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => { setHistorique([]); setDelaiMesure(null); setEnAttente(false); }}>
              Effacer l'historique
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}