#!/usr/bin/env python3
"""Vérifie src/data/verkot-2026.json contre la source officielle de chaque verkkoyhtiö.

Usage : python3 scripts/data/tarkista-verkot.py
Pour chaque réseau, télécharge la page ou le PDF du tarif (`lahde`), en extrait le texte et
vérifie que CHAQUE prix du fichier (perusmaksu, siirtomaksu, tehomaksu, écrit avec une virgule
comme dans le tarif) y figure. Sortie 1 si un prix manque : le tarif a changé, relire la source.
À relancer à chaque changement de tarif annoncé (en général 1.1, 1.4, 1.7 ou 1.9) et au moins
une fois par trimestre. Dépendance : pypdf (pip install pypdf).
"""
import io, json, re, subprocess, sys, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36'

def text_of(url):
    data = subprocess.run(['curl', '-sL', '-A', UA, '-m', '60', url], capture_output=True).stdout
    if data[:4] == b'%PDF':
        from pypdf import PdfReader
        r = PdfReader(io.BytesIO(data))
        return '\n'.join((p.extract_text() or '') for p in r.pages)
    t = data.decode('utf-8', 'ignore')
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>', ' ', t))

def variants(x):
    """Écritures possibles d'un prix dans un tarif : 5,26 / 5,260 / 16,00 / 16,0."""
    out = set()
    for d in (2, 3, 1):
        s = f'{x:.{d}f}'
        out.add(s.replace('.', ','))
    return out

def main():
    d = json.load(open(os.path.join(ROOT, 'src/data/verkot-2026.json')))
    bad = 0
    for v in d['verkot']:
        txt = text_of(v['lahde'])
        flat = re.sub(r'\s+', ' ', txt).replace(' ', ' ')
        miss = []
        for t in v['tuotteet']:
            vals = list((t.get('perus') or {}).values()) + list((t.get('perusVuosi') or {}).values()) + list(t['energia'].values())
            if t.get('teho'): vals.append(t['teho']['eurKwKk'])
            for x in vals:
                if not any(re.search(r'(?<![\d,])' + re.escape(s) + r'(?![\d])', flat) for s in variants(x)):
                    miss.append(f"{t['nimi']}: {x}")
        state = 'OK ' if not miss else 'ÉCART'
        print(f"{state} {v['nimi']:<36} {len(flat):>7} car. {v['lahde']}")
        for m in miss: print('      manque', m)
        bad += bool(miss)
    print(f"\n{len(d['verkot'])} réseaux, {bad} à relire")
    sys.exit(1 if bad else 0)

main()
