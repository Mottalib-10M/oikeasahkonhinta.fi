#!/usr/bin/env python3
"""Vérifie src/data/verkot-2026.json contre la source officielle de chaque verkkoyhtiö.

Usage : python3 scripts/data/tarkista-verkot.py [fichier.json] [--id caruna,elenia]
Pour chaque réseau, télécharge la page ou le PDF du tarif (`lahde`), en extrait le texte et
vérifie que :
  · CHAQUE prix du fichier (perusmaksu, siirtomaksu, tehomaksu) y figure, écrit avec une virgule
    ou un point comme dans le tarif ;
  · la définition des plages horaires de chaque produit (`ajat.lainaus`, copiée mot pour mot) y
    figure aussi, dans `ajat.lahde` si les heures sont publiées sur une autre page officielle ;
  · le nombre de clients (`asiakkaat.lainaus`) figure dans sa source (`asiakkaat.lahde`), en milliers si `yksikko` = 1000 ;
  · la structure est cohérente (types, plages, date de lecture `haettu`).
Sortie 1 si un élément manque : le tarif a changé, relire la source.
À relancer à chaque changement de tarif annoncé (en général 1.1, 1.4, 1.7 ou 1.9) et au moins
une fois par trimestre. Dépendance : pypdf (pip install pypdf).
"""
import io, json, re, subprocess, sys, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36'
_cache = {}

def text_of(url):
    if url in _cache: return _cache[url]
    data = subprocess.run(['curl', '-sL', '--compressed', '-A', UA, '-m', '60', url], capture_output=True).stdout
    if data[:4] == b'%PDF':
        from pypdf import PdfReader
        r = PdfReader(io.BytesIO(data))
        t = '\n'.join((p.extract_text() or '') for p in r.pages)
    else:
        t = data.decode('utf-8', 'ignore')
        t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
        t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    _cache[url] = t
    return t

def norm(s):
    """Texte comparable : espaces fusionnés, tirets unifiés, minuscules."""
    s = s.replace(' ', ' ').replace(' ', ' ')
    s = re.sub(r'[‐-―−]', '-', s)
    s = re.sub(r'\s*-\s*', '-', s)
    return re.sub(r'\s+', ' ', s).strip().lower()

def variants(x):
    """Écritures possibles d'un prix dans un tarif : 5,26 / 5,260 / 16,00 / 16,0 / 5.26."""
    out = set()
    for d in (2, 3, 1, 4):
        s = f'{x:.{d}f}'
        out.add(s.replace('.', ','))
        out.add(s)
    if float(x).is_integer(): out.add(str(int(x)))
    return out

def found(x, flat):
    return any(re.search(r'(?<![\d,.])' + re.escape(s) + r'(?![\d])', flat) for s in variants(x))

TYYPIT = {'yleis': {'kaikki'}, 'aika': {'paiva', 'yo'}, 'kausi': {'talvipaiva', 'muu'}}
PAIVAT = {'kaikki', 'ma-la', 'ma-pe'}

def rakenne(v):
    """Contrôles de structure, sans réseau."""
    e = []
    for k in ('id', 'nimi', 'lyhyt', 'alue', 'lahde', 'ev', 'tuotteet', 'haettu'):
        if not v.get(k): e.append(f'champ {k} manquant')
    if v.get('haettu') and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', v['haettu']): e.append('haettu au format AAAA-MM-JJ')
    if v.get('voimassa') and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', v['voimassa']): e.append('voimassa au format AAAA-MM-JJ')
    for t in v.get('tuotteet', []):
        ty = t.get('tyyppi')
        if ty not in TYYPIT: e.append(f"{t.get('nimi')}: tyyppi {ty}"); continue
        if set(t['energia']) != TYYPIT[ty]: e.append(f"{t['nimi']}: energia {sorted(t['energia'])} ≠ {sorted(TYYPIT[ty])}")
        if not (t.get('perus') or t.get('perusVuosi')): e.append(f"{t['nimi']}: perusmaksu manquant")
        a = t.get('ajat')
        if ty != 'yleis' and not a: e.append(f"{t['nimi']}: ajat manquant")
        if a:
            if not a.get('lainaus') or len(a['lainaus']) < 12: e.append(f"{t['nimi']}: ajat.lainaus manquant")
            if a.get('paivat', 'kaikki') not in PAIVAT: e.append(f"{t['nimi']}: ajat.paivat {a.get('paivat')}")
            tunnit = a.get('tunnit', [7, 22])
            if len(tunnit) != 2 or not all(0 <= h <= 24 for h in tunnit): e.append(f"{t['nimi']}: ajat.tunnit {tunnit}")
            if ty == 'kausi':
                kk = a.get('kuukaudet', [11, 12, 1, 2, 3])
                if not kk or not all(1 <= m <= 12 for m in kk): e.append(f"{t['nimi']}: ajat.kuukaudet {kk}")
            if a.get('pyhat') not in (None, 'muu', 'talvipaiva', 'paiva', 'yo'): e.append(f"{t['nimi']}: ajat.pyhat {a.get('pyhat')}")
        if t.get('teho') and not (t['teho'].get('fi') and t['teho'].get('en')): e.append(f"{t['nimi']}: teho sans explication fi/en")
    a = v.get('asiakkaat')
    if a and not (isinstance(a.get('maara'), int) and a.get('lahde') and a.get('lainaus') and a.get('vuosi')): e.append('asiakkaat incomplet (maara, vuosi, lahde, lainaus)')
    return e

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ids = None
    if '--id' in sys.argv: ids = set(sys.argv[sys.argv.index('--id') + 1].split(',')); args = [a for a in args if a != sys.argv[sys.argv.index('--id') + 1]]
    path = args[0] if args else os.path.join(ROOT, 'src/data/verkot-2026.json')
    d = json.load(open(path))
    verkot = [v for v in d['verkot'] if not ids or v['id'] in ids]
    seen = set(); bad = 0
    for v in verkot:
        miss = rakenne(v)
        if v['id'] in seen: miss.append('id en double')
        seen.add(v['id'])
        txt = text_of(v['lahde'])
        flat = re.sub(r'\s+', ' ', txt).replace(' ', ' ')
        nflat = norm(txt)
        for t in v['tuotteet']:
            vals = list((t.get('perus') or {}).values()) + list((t.get('perusVuosi') or {}).values()) + list(t['energia'].values())
            if t.get('teho'): vals.append(t['teho']['eurKwKk'])
            for x in vals:
                if not found(x, flat): miss.append(f"{t['nimi']}: {x}")
            a = t.get('ajat')
            if a and a.get('lainaus'):
                src = norm(text_of(a['lahde'])) if a.get('lahde') else nflat
                if norm(a['lainaus']) not in src: miss.append(f"{t['nimi']}: plage horaire « {a['lainaus'][:60]} » introuvable")
        a = v.get('asiakkaat')
        if a and a.get('lahde') and a.get('lainaus'):
            if norm(a['lainaus']) not in norm(text_of(a['lahde'])): miss.append(f"asiakkaat « {a['lainaus'][:60]} » introuvable")
            elif not found(a['maara'] // a.get('yksikko', 1), a['lainaus'] if a.get('yksikko', 1) > 1 else re.sub(r'(?<=\d)[   .](?=\d{3}\b)', '', a['lainaus'])): miss.append(f"asiakkaat {a['maara']} absent de la citation")
        state = 'OK ' if not miss else 'ÉCART'
        print(f"{state} {v['nimi']:<40} {len(flat):>7} car. {v['lahde']}")
        for m in miss: print('      manque', m)
        bad += bool(miss)
    print(f"\n{len(verkot)} réseaux, {bad} à relire")
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
