// ---- tile background fade-in on load ----
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      document.getElementById('tileBg').classList.add('on');
    });
  });

  // ---- scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // ---- live Mode Express demo (real, tiny parser) ----
  const examples = {
    "1": `Mr Koné, Cocody 07 00 00 00
Salon sol 45m²
Chambre sol 24m²
Salle de bain sol 11m² mur 20m²
Pose 2000F/m²`,
    "2": `Mme Diabaté, Bingerville 05 55 12 34
Chambre principale sol 18m² mur 30m²
Dressing sol 6m²
Pose 2500F/m²`
  };

  const input = document.getElementById('demoInput');
  const btn = document.getElementById('demoBtn');
  const result = document.getElementById('demoResult');
  const card = document.getElementById('demoCard');
  const totalEl = document.getElementById('demoTotal');

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = examples[chip.dataset.ex];
      result.classList.remove('show');
    });
  });

  function formatFCFA(n){
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }

  function parseDevis(text){
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const zones = [];
    let tarif = 0;
    const zoneRe = /^([^\d]+?)\s+sol\s+(\d+(?:[.,]\d+)?)\s*m²(?:\s+mur\s+(\d+(?:[.,]\d+)?)\s*m²)?/i;
    const tarifRe = /(\d+(?:[.,]\d+)?)\s*F\s*\/?\s*m²/i;

    lines.forEach(line => {
      const zm = line.match(zoneRe);
      if(zm){
        const nom = zm[1].trim();
        const sol = parseFloat(zm[2].replace(',', '.'));
        const mur = zm[3] ? parseFloat(zm[3].replace(',', '.')) : 0;
        zones.push({ nom, sol, mur });
        return;
      }
      const tm = line.match(tarifRe);
      if(tm){
        tarif = parseFloat(tm[1].replace(',', '.'));
      }
    });
    return { zones, tarif };
  }

  function runDemo(){
    const { zones, tarif } = parseDevis(input.value);
    if(zones.length === 0){
      card.innerHTML = `<div class="row"><span class="n">Aucune zone détectée — essayez un exemple ⤴</span></div>`;
      totalEl.textContent = '—';
      result.classList.add('show');
      return;
    }
    let totalSurface = 0;
    let rowsHtml = '';
    zones.forEach(z => {
      const surf = z.sol + z.mur;
      totalSurface += surf;
      const detail = z.mur ? `sol ${z.sol}m² + mur ${z.mur}m²` : `sol ${z.sol}m²`;
      rowsHtml += `<div class="row"><span class="n">${z.nom}</span><span class="v">${detail}</span></div>`;
    });
    rowsHtml += `<div class="row"><span class="n">Surface totale</span><span class="v">${totalSurface.toFixed(1).replace('.0','')} m²</span></div>`;
    card.innerHTML = rowsHtml;

    if(tarif > 0){
      totalEl.textContent = formatFCFA(totalSurface * tarif);
    } else {
      totalEl.textContent = totalSurface.toFixed(1).replace('.0','') + ' m² · tarif non détecté';
    }
    result.classList.remove('show');
    void result.offsetWidth; // restart animation
    result.classList.add('show');
  }

  btn.addEventListener('click', runDemo);

  // auto-run once on load so visitors see it working immediately
  window.addEventListener('load', () => setTimeout(runDemo, 900));

  // ---- download button placeholder ----
  document.getElementById('downloadBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert("Lien de téléchargement à configurer : remplace l'attribut href de #downloadBtn par le lien direct vers ton APK (ex. GitHub Releases).");
  });
