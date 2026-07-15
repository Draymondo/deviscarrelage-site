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

