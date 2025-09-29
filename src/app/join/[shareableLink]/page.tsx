'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function JoinGame() {
  const router = useRouter();
  const params = useParams();
  const shareableLink = params.shareableLink as string;

  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError('Bitte gib deinen Namen ein');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/join/${shareableLink}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Beitreten');
      }

      const result = await response.json();

      // Store session token and player info
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('playerId', result.player.id);
        localStorage.setItem('gameId', result.game.id);
        localStorage.setItem('playerName', result.player.name);
        localStorage.setItem('playerIcon', result.player.icon);
        localStorage.setItem('playerColor', result.player.color);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold text-black">Business Bingo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-black mb-2">
              Tritt dem Business Bingo bei
            </h2>
            <p className="text-black mb-6">
              Gib deinen Namen ein, um dem Spiel beizutreten
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-black mb-2">
                Dein Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Max Mustermann"
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !playerName.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Trete bei...
                </div>
              ) : (
                'Spiel beitreten'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Du erhältst automatisch ein Icon und eine Farbe zugewiesen
            </p>
          </div>

          {/* Available Icons Preview */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">Verfügbare Spieler-Icons:</p>
            <div className="flex flex-wrap justify-center gap-1">
              {['🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎷', '🎻', '🎲', '🎰'].map((icon, index) => (
                <span key={index} className="text-lg">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}