/* ==========================================================================
   Finanční centrum — SAZBY A LIMITY NA JEDNOM MÍSTĚ
   Rok 2026. Při přechodu na nový rok aktualizuj hodnoty tady a pak vyhledej
   "2026" v HTML stránkách (titulky a nadpisy kvůli SEO jsou statické).

   Zdroje pro rok 2026:
   - Průměrná mzda 48 967 Kč — nařízení vlády č. 365/2025 Sb.
   - Minimální mzda 22 400 Kč — MPSV.
   - POZOR: novela z roku 2026 ZPĚTNĚ snížila minimální vyměřovací základ
     sociálního pojištění OSVČ (hlavní činnost) ze 40 % na 35 % průměrné
     mzdy. Minimální záloha klesla z 5 720 Kč na 5 005 Kč (platí od 7/2026,
     přeplatek za 1–6/2026 ČSSZ vrací). Roční výpočet počítá rovnou s 35 %.
   ========================================================================== */

const SAZBY = {
  rok: 2026,

  prumernaMzda: 48967,   // Kč/měsíc — odvíjí se od ní hranice 23% daně, stropy a minima OSVČ
  minimalniMzda: 22400,  // Kč/měsíc — podmínka nároku na daňový bonus

  // Pojistné z hrubé mzdy zaměstnance
  zamestnanec:   { zdravotni: 0.045, socialni: 0.071 },  // sociální = 6,5 % důchodové + 0,6 % nemocenské
  zamestnavatel: { zdravotni: 0.09,  socialni: 0.248 },

  // Daň z příjmů fyzických osob (hranice 23 % = 3× průměrné mzdy měsíčně / 36× ročně)
  dan: { sazbaZakladni: 0.15, sazbaVyssi: 0.23 },

  // Slevy na dani — měsíční částky (roční = 12×)
  slevy: {
    poplatnik: 2570,    // 30 840 Kč/rok
    invalidita12: 210,  // invalidní důchod 1.–2. stupně
    invalidita3: 420,   // invalidní důchod 3. stupně
    ztpp: 1345,         // držitel průkazu ZTP/P
  },

  // Daňové zvýhodnění na děti — měsíční částky; dítě s průkazem ZTP/P má dvojnásobek
  deti: { prvni: 1267, druhe: 1860, tretiADalsi: 2320 },

  // OSVČ
  osvc: {
    socialniSazba: 0.292,
    socialniZakladZisku: 0.55,   // vyměřovací základ = 55 % zisku
    socialniMinHlavni: 0.35,     // min. VZ hlavní činnost = 35 % průměrné mzdy (novela 2026, zpětně od ledna)
    socialniMinVedlejsi: 0.11,   // min. VZ vedlejší činnost = 11 % průměrné mzdy
    rozhodnaCastkaKoef: 2.4,     // vedlejší: do 2,4× průměrné mzdy zisku ročně se sociální neplatí
    zdravotniSazba: 0.135,
    zdravotniZakladZisku: 0.50,  // vyměřovací základ = 50 % zisku
    zdravotniMinHlavni: 0.50,    // min. VZ hlavní činnost = 50 % průměrné mzdy
  },

  // Výdajové paušály OSVČ (strop odpovídá příjmům 2 000 000 Kč)
  pausaly: {
    p80: { sazba: 0.80, strop: 1600000, popis: 'řemesla a zemědělství' },
    p60: { sazba: 0.60, strop: 1200000, popis: 'ostatní živnosti' },
    p40: { sazba: 0.40, strop:  800000, popis: 'svobodná povolání, autoři' },
    p30: { sazba: 0.30, strop:  600000, popis: 'nájem majetku' },
  },

  // Dohody — od jaké hrubé měsíční částky u jednoho zaměstnavatele se platí pojistné
  // (bez pojistného = o korunu méně: DPP do 11 999 Kč, DPČ do 4 499 Kč)
  dohody: {
    DPP: { odKdyPojistne: 12000 },
    DPC: { odKdyPojistne: 4500 },
  },
};

// Odvozené hodnoty — nepřepisuj ručně, počítají se z průměrné mzdy
SAZBY.hranice23Mesic = 3 * SAZBY.prumernaMzda;   // 146 901 Kč (2026)
SAZBY.hranice23Rok   = 36 * SAZBY.prumernaMzda;  // 1 762 812 Kč (2026)
SAZBY.maxVzSocRok    = 48 * SAZBY.prumernaMzda;  // 2 350 416 Kč (2026) — strop sociálního pojištění

// Minima OSVČ odvozená z průměrné mzdy (měsíční VZ se zaokrouhluje na koruny nahoru)
SAZBY.osvcMinVzSocMesic  = Math.ceil(SAZBY.osvc.socialniMinHlavni * SAZBY.prumernaMzda);    // 17 139 Kč
SAZBY.osvcMinVzSocVedl   = Math.ceil(SAZBY.osvc.socialniMinVedlejsi * SAZBY.prumernaMzda);  // 5 387 Kč
SAZBY.osvcMinVzZdrMesic  = SAZBY.osvc.zdravotniMinHlavni * SAZBY.prumernaMzda;              // 24 483,50 Kč
SAZBY.osvcMinZalohaSoc   = Math.ceil(SAZBY.osvcMinVzSocMesic * SAZBY.osvc.socialniSazba);   // 5 005 Kč
SAZBY.osvcMinZalohaZdr   = Math.ceil(SAZBY.osvcMinVzZdrMesic * SAZBY.osvc.zdravotniSazba);  // 3 306 Kč
SAZBY.osvcRozhodnaCastka = Math.floor(SAZBY.osvc.rozhodnaCastkaKoef * SAZBY.prumernaMzda);  // 117 520 Kč/rok

// Sdílené formátování
function formatKc(castka){
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(castka) + ' Kč';
}
function formatProc(podil){
  return new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(podil * 100) + ' %';
}
