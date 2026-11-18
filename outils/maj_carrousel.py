#!/usr/bin/env python3
"""
MINES SPACE · mise à jour du carrousel de photos
================================================

Rôle : (ré)écrire la liste de SECOURS  assets/carrousel/photos.js.

En ligne, le site lit directement le dossier assets/carrousel/ sur GitHub : déposer
une photo suffit, ce script n'est PAS nécessaire. La liste de secours sert seulement
quand le site est ouvert en local, ou si GitHub ne répond pas.

Utilisation (facultative) : double-cliquer sur « outils/Mettre a jour le carrousel.bat »
ou lancer  python outils/maj_carrousel.py  depuis la racine du site.

Format des noms de fichiers :  « 12 - Légende française = English caption.jpg »
  - le numéro fixe l'ordre ;
  - le texte avant « = » est la légende française, celui après est la légende anglaise
    (facultative : sans « = », la légende française est utilisée partout).

Aucune bibliothèque externe n'est nécessaire (Python 3.8+).
"""
import json
import re
import struct
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "assets" / "carrousel"
LISTE = DOSSIER / "photos.js"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

ENTETE = """/* ==========================================================================
   MINES SPACE · liste de SECOURS des photos du carrousel
   En ligne, le site lit directement ce dossier sur GitHub : inutile de modifier
   ce fichier. Il ne sert qu'en local ou si GitHub ne répond pas.
   Généré par outils/maj_carrousel.py à partir des noms de fichiers.
   ========================================================================== */
window.MS_CARROUSEL = """


def dimensions(chemin: Path):
    """Largeur et hauteur d'une image JPEG, PNG ou GIF, lues dans l'en-tête."""
    try:
        with chemin.open("rb") as f:
            tete = f.read(26)
            if tete[:8] == b"\x89PNG\r\n\x1a\n":
                return struct.unpack(">II", tete[16:24])
            if tete[:6] in (b"GIF87a", b"GIF89a"):
                return struct.unpack("<HH", tete[6:10])
            if tete[:2] == b"\xff\xd8":
                f.seek(2)
                while True:
                    octet = f.read(1)
                    while octet and octet != b"\xff":
                        octet = f.read(1)
                    while octet == b"\xff":
                        octet = f.read(1)
                    if not octet:
                        return None
                    marqueur = octet[0]
                    taille = struct.unpack(">H", f.read(2))[0]
                    # Marqueurs SOF (début d'image) : contiennent hauteur et largeur
                    if marqueur in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                        f.read(1)
                        hauteur, largeur = struct.unpack(">HH", f.read(4))
                        return largeur, hauteur
                    f.seek(taille - 2, 1)
    except (OSError, struct.error):
        pass
    return None


def legendes_depuis_nom(nom: str):
    """« 12 - Légende FR = English caption.jpg » → (légende FR, légende EN)."""
    base = Path(nom).stem
    base = re.sub(r"^\s*\d+\s*[-_.)]?\s*", "", base)   # retire « 12 - »
    fr, _, en = base.partition("=")
    return (fr.strip() or nom), en.strip()


def lire_liste():
    if not LISTE.exists():
        return {}
    texte = LISTE.read_text(encoding="utf-8")
    debut, fin = texte.find("["), texte.rfind("]")
    if debut == -1 or fin == -1:
        return {}
    try:
        return {p["fichier"]: p for p in json.loads(texte[debut:fin + 1])}
    except (json.JSONDecodeError, KeyError, TypeError):
        print("Attention : photos.js illisible, les légendes seront recréées depuis les noms de fichiers.")
        return {}


def main():
    if not DOSSIER.is_dir():
        sys.exit(f"Dossier introuvable : {DOSSIER}")

    anciennes = lire_liste()
    fichiers = sorted(
        (p for p in DOSSIER.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS),
        key=lambda p: p.name.lower(),
    )

    photos = []
    for chemin in fichiers:
        entree = {"fichier": chemin.name}
        entree["legende"], entree["legende_en"] = legendes_depuis_nom(chemin.name)
        dims = dimensions(chemin)
        if dims:
            entree["largeur"], entree["hauteur"] = dims
        photos.append({k: entree[k] for k in ("fichier", "legende", "legende_en", "largeur", "hauteur") if k in entree})

    contenu = ENTETE + json.dumps(photos, ensure_ascii=False, indent=2) + ";\n"
    if LISTE.exists() and LISTE.read_text(encoding="utf-8") == contenu:
        print(f"Rien à changer : {len(photos)} photo(s) dans le carrousel.")
        return
    LISTE.write_text(contenu, encoding="utf-8", newline="\n")
    ajoutees = [p["fichier"] for p in photos if p["fichier"] not in anciennes]
    retirees = [nom for nom in anciennes if nom not in {p["fichier"] for p in photos}]
    print(f"Carrousel mis à jour : {len(photos)} photo(s).")
    for nom in ajoutees:
        print(f"  + {nom}")
    for nom in retirees:
        print(f"  - {nom}")


if __name__ == "__main__":
    main()
