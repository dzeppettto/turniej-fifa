# ⚽ GRZYBOWIT FIFA CUP — drabinka i tabela turnieju

Aplikacja do śledzenia turnieju FIFA w 4 osoby. Działa w przeglądarce, bez serwera.
Wyniki zapisują się lokalnie (`localStorage`), a opcjonalnie można je **współdzielić online** między graczami.

## Funkcje

- 📅 **Kolejki** — wpisywanie wyników meczów (podwójna runda: rewanże)
- 🏆 **Tabela** — automatyczna klasyfikacja po każdym wyniku (punkty, bilans, kolejność)
- 🥇 **Drabinka** — drabinka turniejowa z finałem 2 najlepszych miejsc
- 🎰 **Losowanie** — wizualizacja wylosowanej kolejności meczów rewanżowych
- 👤 **Statystyki i historia** — ranking graczy, bilans per gra, H2H, historia wszystkich turniejów (osobny ekran dostępny ze strony startowej)
- 💾 **Zapis danych** — lokalnie w `localStorage` + opcjonalnie w chmurze
- 🌐 **Współdzielone wyniki online** — wszyscy gracze widzą tę samą tabelę na żywo

## Uruchomienie

Otwórz `index.html` w przeglądarce albo wejdź na wersję online:

**https://dzeppettto.github.io/turniej-fifa/**

## 🌐 Współdzielone wyniki online

Aby wszyscy gracze widzieli te same wyniki:

1. Na stronie startowej kliknij **🌐 Współdzielone wyniki** (albo wskaźnik synchronizacji w prawym górnym rogu).
2. Kliknij **✨ Utwórz kod i udostępnij** — powstanie losowy kod i link.
3. Wyślij link znajomym (np. na czacie). Każdy otwiera go raz — od tej pory jego zmiany wyników pojawiają się u wszystkich automatycznie.
   - Zamiast linku można podać sam **kod** i użyć opcji **Dołącz**.
4. W prawym górnym rogu widać status: `Lokalnie` / `Łączenie…` / `Zapisywanie…` / `Online` / `Błąd`.

Szczegóły:

- Odświeżanie odbywa się co ok. **10 sekund** (a natychmiast po powrocie do karty). Dodatkowo działa przycisk **🔄 Odśwież teraz**.
- Gdy zmiany zrobi kilku graczy naraz, wygrywa **ostatnia** (ostatni zapis).
- Brak internetu niczego nie psuje — wyniki trafiają do `localStorage`, a po odzyskaniu połączenia aplikacja dosyła je do chmury.
- Dane leżą w darmowej usłudze **[textdb.online](https://textdb.online)** pod losowym kodem. **Kod działa jak hasło** — kto go zna, może odczytać i zmienić wyniki, więc podawaj go tylko osobom z turnieju.
- Usługa kasuje wpisy nieużywane przez **30 dni** (jeśli będziecie grać regularnie, dane przetrwają; po długiej przerwie może trzeba będzie utworzyć nowy kod).
- **⛔ Rozłącz** wyłącza synchronizację — wyniki zostają w przeglądarce.

## Struktura

```
index.html   — struktura strony
styles.css   — style
app.js       — logika aplikacji (turniej + synchronizacja online)
```

## Dane

- **Lokalnie:** wszystko trzymane jest w `localStorage` przeglądarki (klucz `fifa15_turnieje_v3`), plus zapamiętany kod synchronizacji (klucz `fifa15_sync_v1`).
- **Online (opcjonalnie):** po połączeniu pełny stan turnieju wysyłany jest do `textdb.online` pod losowym kodem. Bez połączenia aplikacja nie wysyła nigdzie danych.
