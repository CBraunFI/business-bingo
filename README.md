# Business Bingo

Ein Live-Meeting Bingo-Spiel für Teams mit Business-Buzzwords.

## Features

- **Live Meetings**: Erstelle Spiele für Live-Meetings
- **Game Master**: Verwalte Spiele, lade Spieler ein und starte das Spiel
- **Individuelle Karten**: Jeder Spieler erhält eine einzigartige 5×5 Bingo-Karte
- **Anpassbare Begriffe**: 100 vordefinierte Business-Buzzwords, erweiterbar
- **Echtzeit-Sync**: WebSocket-basierte Live-Updates für alle Spieler
- **Kein Account**: Zugang über signierte E-Mail-Einladungen

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT-basierte Magic Links
- **Email**: Nodemailer (SMTP)

## Setup

### 1. Installation

```bash
npm install
```

### 2. Datenbank Setup

```bash
# Starte Prisma Dev Server (für lokale Entwicklung)
npx prisma dev

# Oder verwende eine eigene PostgreSQL-Datenbank
# Aktualisiere DATABASE_URL in .env
```

### 3. Umgebungsvariablen

Kopiere `.env` und aktualisiere die Werte:

```env
# Database
DATABASE_URL="your-database-url"

# Auth
JWT_SECRET="your-super-secret-jwt-key"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
FROM_EMAIL="noreply@businessbingo.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Datenbank Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Entwicklung starten

```bash
npm run dev
```

Die Anwendung ist dann unter http://localhost:3000 verfügbar.

## Spielablauf

### Game Master Flow:
1. Gehe auf die Homepage und klicke "Neues Spiel erstellen"
2. Gib Spielname und E-Mail-Adressen der Spieler ein
3. Passe die Business-Begriffe an (optional)
4. Versende Einladungen per E-Mail
5. Starte das Spiel wenn mindestens 2 Spieler beigetreten sind

### Spieler Flow:
1. Klicke auf den Einladungslink in der E-Mail
2. Warte in der Lobby bis das Spiel startet
3. Markiere Begriffe, die du selbst im Meeting sagst
4. Erreiche als erster eine vollständige Reihe, Spalte oder Diagonale

## API Endpoints

- `POST /api/games` - Spiel erstellen
- `GET /api/games/:gameId` - Spiel-Details abrufen
- `POST /api/games/:gameId/terms` - Begriffe verwalten
- `POST /api/games/:gameId/invite` - Einladungen versenden
- `POST /api/games/:gameId/start` - Spiel starten
- `POST /api/games/:gameId/finish` - Spiel beenden
- `GET /api/games/:gameId/cards/me` - Eigene Karte abrufen
- `POST /api/games/:gameId/cards/me/toggle` - Feld markieren
- `POST /api/join` - Spiel beitreten

## WebSocket Events

- `player_joined` - Spieler ist beigetreten
- `game_started` - Spiel wurde gestartet
- `cell_updated` - Feld wurde markiert
- `bingo` - Spieler hat Bingo
- `game_finished` - Spiel wurde beendet

## Business-Buzzwords

Das Spiel enthält 100 vordefinierte deutsche Business-Buzzwords:

- 90 Einzelwörter (Agilität, Synergie, Roadmap, ...)
- 10 Phrasen ("Wir müssen die PS auf die Straße bringen", ...)

Alle Begriffe können vom Game Master deaktiviert, ersetzt oder durch eigene ergänzt werden.

## Deployment

1. **Database**: Stelle eine PostgreSQL-Datenbank bereit
2. **Environment**: Konfiguriere Produktions-Umgebungsvariablen
3. **Build**: `npm run build`
4. **Start**: `npm start`

Empfohlene Plattformen:
- **Frontend**: Vercel, Netlify
- **Database**: Neon, Supabase, Railway
- **Email**: SendGrid, Postmark

## Lizenz

MIT License
