# ⚽ Turniej FIFA — drabinka i tabela turnieju

Aplikacja do śledzenia turnieju FIFA w 4 osoby. Działa w przeglądarce, bez serwera — dane zapisują się lokalnie w `localStorage`.

## Funkcje

- 📅 **Kolejki** — wpisywanie wyników meczów (podwójna runda: rewanże)
- 🏆 **Tabela** — automatyczna klasyfikacja po każdym wyniku (punkty, bilans, kolejność)
- 🥇 **Drabinka** — drabinka turniejowa z finałem 2 najlepszych miejsc
- 🎰 **Losowanie** — wizualizacja wylosowanej kolejności meczów rewanżowych
- 👤 **Statystyki i historia** — ranking graczy, bilans per gra, H2H, historia wszystkich turniejów (osobny ekran dostępny ze strony startowej)
- 💾 **Zapis danych** — wszystko trzyma się w `localStorage` przeglądarki

## Uruchomienie

Otwórz `index.html` w przeglądarce albo wejdź na wersję online:

**https://dzeppettto.github.io/turniej-fifa/**

## Struktura

```
index.html   — struktura strony
styles.css   — style
app.js       — logika aplikacji
```

## Dane

Aplikacja nie wysyła nigdzie danych — wyniki leżą wyłącznie w `localStorage` Twojej przeglądarki. Aby je zachować na innym urządzeniu, podejrzyj tabelę przed zmianą przeglądarki/komputera.
