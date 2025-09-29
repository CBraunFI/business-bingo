'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function JoinGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<{ title: string; email?: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Ungültiger Einladungslink');
      return;
    }

    // TODO: Validate token and get game info
    setGameInfo({ title: 'Team Meeting Bingo' });
  }, [token]);

  const handleJoin = async () => {
    if (!token) {
      setError('Kein gültiger Token gefunden');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Beitreten');
      }

      const result = await response.json();

      // Store session token
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('playerId', result.player.id);
        localStorage.setItem('gameId', result.game.id);
      }

      // Redirect to lobby or game depending on status
      if (result.game.status === 'running') {
        router.push(`/play/${result.game.id}`);
      } else {
        router.push(`/lobby/${result.game.id}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ungültiger Link</h1>
          <p className="text-gray-600 mb-4">
            Dieser Einladungslink ist ungültig oder abgelaufen.
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Business Bingo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Du wurdest zu Business Bingo eingeladen
            </h2>

            {gameInfo && (
              <p className="text-gray-600 mb-6">
                Spiel: <strong>{gameInfo.title}</strong>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Trete bei...
              </div>
            ) : (
              'Beitreten'
            )}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Du wirst zur Lobby weitergeleitet, wo du auf den Spielstart warten kannst.
          </p>
        </div>
      </main>
    </div>
  );
}