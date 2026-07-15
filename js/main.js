// ---- tile background fade-in on load ----
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    const bg = document.getElementById('tileBg');
    if (bg) bg.classList.add('on');
  });
});

// ---- scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---- bilingual live Mode Express demo ----
const pageLang = document.documentElement.lang === 'en' ? 'en' : 'fr';

const examplesByLang = {
  fr: {
    "1": `Mr Koné, Cocody 07 00 00 00
Salon sol 45m²
Chambre sol 24m²
Salle de bain sol 11m² mur 20m²
Pose 2000F/m²`,
    "2": `Mme Diabaté, Bingerville 05 55 12 34
Chambre principale sol 18m² mur 30m²
Dressing sol 6m²
Pose 2500F/m²`
  },
  en: {
    "1": `Mr Mensah, East Legon 024 555 0123
Living room floor 45sqm
Bedroom floor 24sqm
Bathroom floor 11sqm wall 20sqm
Install 25 GHS/sqm`,
    "2": `Mrs Owusu, Tema 020 555 9876
Main bedroom floor 18sqm wall 30sqm
Walk-in closet floor 6sqm
Install 30 GHS/sqm`
  }
};

const zonePatterns = {
  fr: /^([^\d]+?)\s+sol\s+(\d+(?:[.,]\d+)?)\s*(?:m²|sqm)(?:\s+mur\s+(\d+(?:[.,]\d+)?)\s*(?:m²|sqm))?/i,
  en: /^([^\d]+?)\s+floor\s+(\d+(?:[.,]\d+)?)\s*(?:m²|sqm)(?:\s+wall\s+(\d+(?:[.,]\d+)?)\s*(?:m²|sqm))?/i
};

const tarifPatterns = {
  fr: /(\d+(?:[.,]\d+)?)\s*F\s*\/?\s*m²/i,
  en: /(\d+(?:[.,]\d+)?)\s*(?:GHS|USD|\$)\s*\/?\s*(?:m²|sqm)/i
};

const unitLabel = { fr: 'm²', en: 'sqm' };
const currencySuffix = { fr: 'FCFA', en: 'GHS' };

const input = document.getElementById('demoInput');
const btn = document.getElementById('demoBtn');
const result = document.getElementById('demoResult');
const card = document.getElementById('demoCard');
const totalEl = document.getElementById('demoTotal');

if (input && btn) {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = examplesByLang[pageLang][chip.dataset.ex];
      result.classList.remove('show');
    });
  });

  function formatAmount(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + currencySuffix[pageLang];
  }

  function parseDevis(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const zones = [];
    let tarif = 0;
    const zoneRe = zonePatterns[pageLang];
    const tarifRe = tarifPatterns[pageLang];

    lines.forEach(line => {
      const zm = line.match(zoneRe);
      if (zm) {
        const nom = zm[1].trim();
        const sol = parseFloat(zm[2].replace(',', '.'));
        const mur = zm[3] ? parseFloat(zm[3].replace(',', '.')) : 0;
        zones.push({ nom, sol, mur });
        return;
      }
      const tm = line.match(tarifRe);
      if (tm) {
        tarif = parseFloat(tm[1].replace(',', '.'));
      }
    });
    return { zones, tarif };
  }

  function runDemo() {
    const { zones, tarif } = parseDevis(input.value);
    const unit = unitLabel[pageLang];
    if (zones.length === 0) {
      card.innerHTML = `<div class="row"><span class="n">${pageLang === 'en' ? 'No zone detected — try an example ⤴' : 'Aucune zone détectée — essayez un exemple ⤴'}</span></div>`;
      totalEl.textContent = '—';
      result.classList.add('show');
      return;
    }
    let totalSurface = 0;
    let rowsHtml = '';
    zones.forEach(z => {
      const surf = z.sol + z.mur;
      totalSurface += surf;
      const soLabel = pageLang === 'en' ? 'floor' : 'sol';
      const muLabel = pageLang === 'en' ? 'wall' : 'mur';
      const detail = z.mur ? `${soLabel} ${z.sol}${unit} + ${muLabel} ${z.mur}${unit}` : `${soLabel} ${z.sol}${unit}`;
      rowsHtml += `<div class="row"><span class="n">${z.nom}</span><span class="v">${detail}</span></div>`;
    });
    const totalLabel = pageLang === 'en' ? 'Total area' : 'Surface totale';
    rowsHtml += `<div class="row"><span class="n">${totalLabel}</span><span class="v">${totalSurface.toFixed(1).replace('.0', '')} ${unit}</span></div>`;
    card.innerHTML = rowsHtml;

    if (tarif > 0) {
      totalEl.textContent = formatAmount(totalSurface * tarif);
    } else {
      const noTarifLabel = pageLang === 'en' ? 'rate not detected' : 'tarif non détecté';
      totalEl.textContent = totalSurface.toFixed(1).replace('.0', '') + ' ' + unit + ' · ' + noTarifLabel;
    }
    result.classList.remove('show');
    void result.offsetWidth;
    result.classList.add('show');
  }

  btn.addEventListener('click', runDemo);
  window.addEventListener('load', () => setTimeout(runDemo, 900));
}

// ---- language auto-detect + manual switch persistence ----
(function () {
  const STORAGE_KEY = 'devisLangPref';
  const stored = localStorage.getItem(STORAGE_KEY);
  const onEnPage = window.location.pathname.includes('/en/') || window.location.pathname.endsWith('/en');

  if (stored) {
    // Respect explicit user choice, redirect only if mismatched
    if (stored === 'en' && !onEnPage) {
      window.location.replace('en/');
    } else if (stored === 'fr' && onEnPage) {
      window.location.replace('../');
    }
  } else {
    // No explicit choice yet: auto-detect from browser/OS language, like the app does
    const browserLang = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
    const prefersEnglish = browserLang.startsWith('en');
    if (prefersEnglish && !onEnPage) {
      window.location.replace('en/');
    } else if (!prefersEnglish && onEnPage) {
      window.location.replace('../');
    }
  }

  // Manual switch links: any element with [data-lang-switch]
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang-switch]').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = el.getAttribute('data-lang-switch');
        localStorage.setItem(STORAGE_KEY, target);
        // let the normal href navigation proceed
      });
    });
  });
})();

// Fonction utilitaire pour envoyer les événements
const trackEvent = (name) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', name);
  }
};

// 1. Clics (demo, download, privacy, contact)
document.getElementById('demoBtn')?.addEventListener('click', () => trackEvent('demo_used'));
document.getElementById('downloadBtn')?.addEventListener('click', () => trackEvent('download_apk'));
document.querySelector('a[href*="privacy"]').addEventListener('click', () => trackEvent('privacy_view'));
document.querySelector('a[href^="mailto"]').addEventListener('click', () => trackEvent('contact_email'));

// 2. Visibilité de la section Tarifs
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      trackEvent('pricing_view');
      observer.disconnect(); // Pour ne compter la vue qu'une seule fois
    }
  });
});
observer.observe(document.getElementById('tarifs'));

// 3. Site Open (au chargement)
window.addEventListener('load', () => trackEvent('site_open'));
