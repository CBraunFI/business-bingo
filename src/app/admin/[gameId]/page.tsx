'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  status: 'draft' | 'running' | 'finished';
  ownerEmail: string;
  players: Player[];
  terms: Term[];
}

interface Player {
  id: string;
  name: string;
  icon: string;
  color: string;
  joinedAt: string;
  isWinner: boolean;
}

interface Term {
  id: string;
  text: string;
  source: 'default' | 'custom' | 'replaced';
}

export default function AdminPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'share' | 'players' | 'terms'>('share');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('adminToken');
    const link = localStorage.getItem('shareableLink');
    setAdminToken(token);
    setShareableLink(link);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!adminToken) {
      router.push('/');
      return;
    }

    fetchGame();
  }, [gameId, adminToken, mounted]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Spiel nicht gefunden');
      }

      const data = await response.json();
      setGame(data.game);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Spiels');
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitations = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Versenden der Einladungen');
      }

      alert('Einladungen wurden versendet!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Versenden der Einladungen');
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Starten des Spiels');
      }

      await fetchGame();
      alert('Spiel wurde gestartet!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Starten des Spiels');
    }
  };

  const finishGame = async () => {
    if (!confirm('Möchten Sie das Spiel wirklich beenden?')) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Beenden des Spiels');
      }

      await fetchGame();
      alert('Spiel wurde beendet!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Beenden des Spiels');
    }
  };

  const toggleTerm = async (termId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'toggle',
          termId
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Umschalten des Begriffs');
      }

      await fetchGame();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Umschalten des Begriffs');
    }
  };

  const addTerm = async () => {
    if (!newTerm.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'add',
          text: newTerm.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen des Begriffs');
      }

      setNewTerm('');
      await fetchGame();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Begriffs');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Spiel...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fehler</h1>
          <p className="text-gray-600 mb-4">{error || 'Spiel nicht gefunden'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const joinedPlayers = game.players.filter(p => p.status === 'joined');
  const enabledTerms = game.terms?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Business Bingo
              </Link>
              <span className="ml-4 text-black">Admin - {game.title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                game.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                game.status === 'running' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {game.status === 'draft' ? 'Entwurf' :
                 game.status === 'running' ? 'Läuft' : 'Beendet'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {game.status === 'draft' && (
              <button
                onClick={startGame}
                disabled={game.players.length < 1 || enabledTerms < 25}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Spiel starten
              </button>
            )}
            {game.status === 'running' && (
              <button
                onClick={finishGame}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Spiel beenden
              </button>
            )}
          </div>

          {game.status === 'draft' && (
            <div className="mt-4 text-sm text-black">
              <p>Zum Starten benötigt: Mindestens 1 Spieler ({game.players.length}/1) und 25 aktive Begriffe ({enabledTerms}/25)</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('share')}
                className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'share'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Link teilen
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'players'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Spieler ({game.players.length})
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'terms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Begriffe ({enabledTerms} aktiv)
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'share' ? (
              <div>
                <h3 className="text-lg font-medium text-black mb-4">Spiel-Link teilen</h3>
                {shareableLink && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Teile diesen Link mit deinem Team:
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={shareableLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-black"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(shareableLink)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                        >
                          Kopieren
                        </button>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            So funktioniert's
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Jeder kann über den Link beitreten, indem er seinen Namen eingibt. Automatische Icon- und Farbzuweisung für jeden Spieler.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'players' ? (
              <div>
                <h3 className="text-lg font-medium text-black mb-4">Spieler ({game.players.length})</h3>
                <div className="space-y-3">
                  {game.players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.icon}
                        </div>
                        <span className="text-black font-medium">{player.name}</span>
                        {player.isWinner && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Gewinner
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(player.joinedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {game.players.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Noch keine Spieler beigetreten.</p>
                      <p className="text-sm mt-1">Teile den Link im Tab "Link teilen"</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-black">Begriffe verwalten</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="Neuen Begriff hinzufügen"
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTerm()}
                    />
                    <button
                      onClick={addTerm}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {game.terms?.map(term => (
                    <div key={term.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className={term.source !== 'default' ? 'font-medium text-black' : 'text-black'}>
                        {term.text}
                      </span>
                      <button
                        onClick={() => toggleTerm(term.id)}
                        className={`w-8 h-4 rounded-full bg-green-500 relative transition-colors`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform translate-x-4`} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Mindestens 25 aktive Begriffe nötig. Klicke auf den Schalter, um Begriffe zu aktivieren/deaktivieren.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}