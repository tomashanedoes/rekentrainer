# RekenTrainer

Nederlandstalige PWA waarin een Speler (groep 3 t/m 6) zelfstandig rekenen oefent. Avontuur, Onderwerp oefenen en Snelle ronde zijn gelijkwaardige ingangen; voortgang blijft lokaal op het apparaat.

## Language

**Speler**:
Het kind (groep 3 t/m 6) dat de app zelfstandig gebruikt. Geen account, geen login.
_Avoid_: User, gebruiker, leerling (tenzij klascontext later), account

**Profiel**:
Lokale identiteit op één apparaat (naam + voortgang), zodat meerdere Spelers hetzelfde toestel kunnen delen.
_Avoid_: Account, user, save slot

**Avontuur**:
Speelmodus waarin Levels in vaste volgorde worden doorlopen, gegroepeerd in Fases.
_Avoid_: Campaign, story mode, parcours

**Fase**:
Groep Levels met hetzelfde rekenniveau (bijv. Tot 10, Tot 20, Tafels).
_Avoid_: World, chapter, zone

**Level**:
Eén oefenstap in het Avontuur met eigen somtype en voortgang (Sterren).
_Avoid_: Stage, missie, challenge

**Ster**:
Beloning (0–3) per Level op basis van beheersing.
_Avoid_: Badge, trophy, score (als synoniem voor sterren)

**Unlock**:
Een Level wordt speelbaar als het vorige Level voldoende is beheerst (nu: minstens 10 sommen en ≥80% goed). Eén vaste ladder voor alle Spelers.
_Avoid_: Gate, progress gate, prerequisite lock

**Onderwerp oefenen**:
Gelijkwaardige modus om één rekenonderwerp gericht te trainen, los van de levelvolgorde.
_Avoid_: Skill mode (in UI-tekst), drill, topic trainer

**Snelle ronde**:
Gelijkwaardige korte timed sessie met gemengde sommen.
_Avoid_: Blitz, arcade, speedrun

**Backupcode**:
Deelbare code waarmee een Speler zijn lokale voortgang op een ander apparaat kan laden. Geen cloud-sync.
_Avoid_: Save file, export, sync token, account backup

**Release**:
Een nieuwe versie van de PWA die via de service worker beschikbaar komt.
_Avoid_: Deploy, build, patch (tenzij technisch in ADR)

**Onderwerp**:
Een oefenbaar rekenthema (optellen, aftrekken, tafels, later ook delen/breuken/grote getallen), beschikbaar via Onderwerp oefenen en/of als Levels in Avontuur.
_Avoid_: Skill, topic, module

**Breukensom**:
Eenvoudige breukenopgave tot en met eenvoudig ongelijknamig rekenen en “deel van een getal” (bijv. ½ van 8). Geen zware breukenleer.
_Avoid_: Fractie-drill, ratio

**Deelsom**:
Een oefening met delen (÷) of het ontbrekende factor-getal bij een product, gebaseerd op tafels.
_Avoid_: Division drill, quotiënt-oefening
