'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initializeSocketClient, getSocket } from '@/lib/socketClient';

interface Game {
  id: string;
  title: string;
  status: 'draft' | 'running' | 'finished';
}

interface CardCell {
  id: string;
  row: number;
  col: number;
  term: {
    id: string;
    text: string;
  };
  markedByPlayerId: string | null;
  markedAt: string | null;
}

interface Card {
  id: string;
  cells: CardCell[];
}

interface Winner {
  id: string;
  email: string;
}

export default function PlayGame() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerIcon, setPlayerIcon] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setSessionToken(localStorage.getItem('sessionToken'));
      setPlayerId(localStorage.getItem('playerId'));
      setPlayerName(localStorage.getItem('playerName') || '');
      setPlayerIcon(localStorage.getItem('playerIcon') || '');
      setPlayerColor(localStorage.getItem('playerColor') || '');
    }
  }, []);

  const fetchCardData = useCallback(async () => {
    try {
      const [gameResponse, cardResponse] = await Promise.all([
        fetch(`/api/games/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        }),
        fetch(`/api/games/${gameId}/cards/me`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        })
      ]);

      if (!gameResponse.ok || !cardResponse.ok) {
        throw new Error('Fehler beim Laden der Spieldaten');
      }

      const gameData = await gameResponse.json();
      const cardData = await cardResponse.json();

      setGame(gameData.game);
      setCard(cardData.card);

      // Check if game is finished and find winner
      if (gameData.game.status === 'finished') {
        const winnerPlayer = gameData.game.players.find((p: { isWinner: boolean }) => p.isWinner);
        if (winnerPlayer) {
          setWinner(winnerPlayer);
          setShowWinnerModal(true);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Spieldaten');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, sessionToken]);

  const initializeSocket = useCallback(() => {
    if (!sessionToken) return;

    const socket = initializeSocketClient(sessionToken);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('cell_updated', (data) => {
      console.log('Cell updated:', data);
      fetchCardData(); // Refresh card data
    });

    socket.on('bingo', (data) => {
      console.log('Bingo:', data);
      setWinner({ id: data.playerId, email: data.playerEmail });
      setShowWinnerModal(true);
      fetchCardData();
    });

    socket.on('game_finished', (data) => {
      console.log('Game finished:', data);
      fetchCardData();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }, [sessionToken, fetchCardData]);

  useEffect(() => {
    if (!mounted) return;

    if (!sessionToken || !playerId) {
      router.push('/');
      return;
    }

    fetchCardData();
    initializeSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [gameId, sessionToken, playerId, mounted, fetchCardData, initializeSocket, router]);

  const toggleCell = async (cellId: string) => {
    if (!sessionToken || game?.status !== 'running') {
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/cards/me/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ cellId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Markieren');
      }

      const result = await response.json();

      if (result.isBingo) {
        setWinner({ id: playerId!, email: 'Du' });
        setShowWinnerModal(true);
      }

      // Refresh card data
      await fetchCardData();

    } catch (err) {
      console.error('Error toggling cell:', err);
    }
  };

  const renderGrid = () => {
    if (!card) return null;

    // Create 5x5 grid from cells
    const grid: (CardCell | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));

    card.cells.forEach(cell => {
      grid[cell.row][cell.col] = cell;
    });

    return (
      <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto">
        {grid.flat().map((cell, index) => {
          if (!cell) return <div key={index} className="aspect-square" />;

          const isMarked = !!cell.markedByPlayerId;
          const isMarkedByMe = cell.markedByPlayerId === playerId;

          return (
            <button
              key={cell.id}
              onClick={() => toggleCell(cell.id)}
              disabled={game?.status !== 'running'}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium
                flex flex-col items-center justify-center text-center leading-tight relative
                ${isMarked && isMarkedByMe
                  ? 'text-white border-2 shadow-md'
                  : isMarked
                  ? 'bg-gray-300 text-black border-gray-400'
                  : 'bg-white text-black border-gray-300 hover:border-blue-400 hover:shadow-sm'
                }
                ${game?.status !== 'running' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
              `}
              style={isMarked && isMarkedByMe ? {
                backgroundColor: playerColor,
                borderColor: playerColor
              } : {}}
            >
              <span className="break-words hyphens-auto text-center">{cell.term.text}</span>
              {isMarked && isMarkedByMe && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xs">{playerIcon}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
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

  if (error || !game || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fehler</h1>
          <p className="text-gray-600 mb-4">{error || 'Spiel oder Karte nicht gefunden'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Bingo</h1>
              <p className="text-sm text-gray-600">{game.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              {playerName && playerIcon && playerColor && (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: playerColor }}
                  >
                    {playerIcon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{playerName}</span>
                </div>
              )}
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                game.status === 'running' ? 'bg-green-100 text-green-800' :
                game.status === 'finished' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {game.status === 'running' ? 'Spiel läuft' :
                 game.status === 'finished' ? 'Beendet' : 'Entwurf'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 text-center">
          <p className="text-blue-800 font-medium">
            Klicke auf Begriffe, die du selbst im Meeting sagst. Ziel: Eine vollständige Reihe, Spalte oder Diagonale!
          </p>
        </div>

        {/* Bingo Grid */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Deine Bingo-Karte
          </h2>

          {renderGrid()}

          {/* Legend */}
          <div className="mt-8 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: playerColor }}
              ></div>
              <span>Von dir markiert ({playerIcon})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <span>Von anderen markiert</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
              <span>Verfügbar</span>
            </div>
          </div>

          {game.status === 'finished' && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push(`/lobby/${gameId}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Zur Lobby zurück
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Winner Modal */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bingo!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {winner.id === playerId ? 'Du hast gewonnen!' : `Gewinner: ${winner.email}`}
            </p>
            <button
              onClick={() => setShowWinnerModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}