'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initializeSocketClient, getSocket } from '@/lib/socketClient';

interface Game {
  id: string;
  title: string;
  status: 'draft' | 'running' | 'finished';
}

interface Player {
  id: string;
  email: string;
  status: 'invited' | 'joined';
  isWinner: boolean;
}

export default function Lobby() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setSessionToken(localStorage.getItem('sessionToken'));
      setPlayerId(localStorage.getItem('playerId'));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!sessionToken || !playerId) {
      router.push('/');
      return;
    }

    fetchGameData();
    initializeSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [gameId, sessionToken, playerId, mounted]);

  const fetchGameData = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Spiel nicht gefunden');
      }

      const data = await response.json();
      setGame(data.game);
      setPlayers(data.game.players);

      const currentPlayerData = data.game.players.find((p: Player) => p.id === playerId);
      setCurrentPlayer(currentPlayerData);

      // If game is running, redirect to play page
      if (data.game.status === 'running') {
        router.push(`/play/${gameId}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Spiels');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocket = () => {
    if (!sessionToken) return;

    const socket = initializeSocketClient(sessionToken);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
      fetchGameData(); // Refresh game data
    });

    socket.on('game_started', (data) => {
      console.log('Game started:', data);
      router.push(`/play/${gameId}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Lobby...</p>
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
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  const joinedPlayers = players.filter(p => p.status === 'joined');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Bingo</h1>
              <p className="text-sm text-black">Lobby: {game.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Warten auf Start</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Status Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Warten, bis der Game Master startet
            </h2>
            <p className="text-gray-600">
              Das Spiel beginnt automatisch, sobald der Game Master es startet.
            </p>
          </div>

          {/* Player List */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-black mb-4">
              Beigetretene Spieler ({joinedPlayers.length})
            </h3>

            {joinedPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Noch keine Spieler beigetreten.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center p-4 rounded-lg border ${
                      player.id === currentPlayer?.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium">
                        {player.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-black">
                        {player.id === currentPlayer?.id ? 'Du' : `Spieler`}
                      </p>
                      <p className="text-sm text-black">
                        {player.id === currentPlayer?.id ? player.email : '***@***.***'}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Game Rules */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Spielregeln</h3>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Jeder Spieler erhält eine einzigartige 5×5 Bingo-Karte mit Business-Buzzwords</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Markiere Begriffe, die du selbst im Meeting sagst</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Bingo bei vollständiger Reihe, Spalte oder Diagonale</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Der erste Spieler mit Bingo gewinnt!</span>
              </li>
            </ul>
          </div>

          {/* Requirements */}
          {joinedPlayers.length < 2 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Mindestens 1 Spieler erforderlich
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Das Spiel kann erst gestartet werden, wenn mindestens 1 Spieler beigetreten ist.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}