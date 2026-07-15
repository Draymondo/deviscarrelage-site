# Site vitrine — DevisCarrelage

Site de présentation et de téléchargement direct de l'app, pour publication en attendant (ou en complément) des stores.

## Structure

```
deviscarrelage-site/
├── index.html          → la page (structure + contenu)
├── css/
│   └── styles.css      → tout le style
├── js/
│   └── main.js         → la démo Mode Express interactive + animations
├── assets/
│   ├── icon.png
│   ├── devis-phone.jpg
│   ├── express-phone.jpg
│   └── historique-phone.jpg
└── DevisCarrelage.apk  → à ajouter toi-même (voir plus bas)
```

Fichiers séparés plutôt qu'un seul bloc : plus facile à modifier (tu retrouves le CSS sans chercher dans du HTML), plus léger à charger (les images ne sont plus dupliquées en base64), et surtout **compatible Git normal** — chaque futur changement d'image ou de style donnera un diff propre au lieu d'un pavé de texte encodé illisible.

## Mettre en ligne (GitHub Pages, comme ta politique de confidentialité)

1. Crée un nouveau repo GitHub (ex. `deviscarrelage-site`), ou un dossier dans un repo existant.
2. Copie tout le contenu de ce dossier à la racine du repo.
3. Ajoute ton fichier `DevisCarrelage.apk` signé à la racine (à côté d'`index.html`).
4. Dans `index.html`, cherche `id="downloadBtn"` (en bas du fichier) et modifie le JS dans `js/main.js` : remplace le `href="#"` du bouton par `DevisCarrelage.apk` (ou l'URL GitHub Releases si tu préfères héberger l'APK séparément — recommandé si le fichier dépasse la limite GitHub Pages).
5. Repo → Settings → Pages → Source → branche `main`, dossier `/ (root)`.
6. Ton site sera en ligne à `https://<ton-pseudo>.github.io/<nom-du-repo>/` en 1-2 minutes.

**Recommandation** : héberge l'APK lui-même via **GitHub Releases** plutôt que dans le repo Pages — c'est fait pour les fichiers binaires, ça donne un lien direct stable (`.../releases/download/v1.0.0/DevisCarrelage.apk`), et ça ne pollue pas l'historique Git du site avec un gros binaire à chaque mise à jour.

## Nom de domaine personnalisé (plus tard)

Quand tu es prêt : Settings → Pages → Custom domain, plus un enregistrement CNAME chez ton registrar pointant vers `<ton-pseudo>.github.io`. Aucune reconstruction du site nécessaire.

## Ce qu'il reste à toi de faire

- [ ] Héberger `DevisCarrelage.apk` (GitHub Releases conseillé) et mettre à jour le lien dans `js/main.js`
- [ ] Vérifier l'empreinte SHA-256 affichée en bas de page correspond bien à ton dernier build signé
- [ ] Remplacer `assets/icon.png` par la bannière `feature_graphic.png` en `og:image` si tu veux un aperçu plus riche au partage WhatsApp (actuellement l'icône carrée est utilisée par défaut)
