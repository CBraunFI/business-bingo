'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateGame() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    playerName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Spielname ist erforderlich';
    }

    if (!formData.playerName.trim()) {
      newErrors.playerName = 'Dein Name ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          playerName: formData.playerName.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Spiels');
      }

      const result = await response.json();

      // Store both admin and player tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', result.adminToken);
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('playerId', result.player.id);
        localStorage.setItem('gameId', result.game.id);
        localStorage.setItem('playerName', result.player.name);
        localStorage.setItem('playerIcon', result.player.icon);
        localStorage.setItem('playerColor', result.player.color);
        localStorage.setItem('shareableLink', result.game.shareableLink);
      }
      router.push(`/admin/${result.game.id}`);

    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Business Bingo
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Zurück
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              Neues Spiel erstellen
            </h1>
            <p className="text-black">
              Erstelle ein Business Bingo Spiel für dein Team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{errors.general}</div>
              </div>
            )}

            {/* Game Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                Spielname *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="z.B. Weekly Team Meeting Bingo"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Player Name */}
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-black mb-2">
                Dein Name *
              </label>
              <input
                type="text"
                id="playerName"
                value={formData.playerName}
                onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.playerName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="z.B. Max Mustermann"
                maxLength={20}
              />
              {errors.playerName && (
                <p className="mt-1 text-sm text-red-600">{errors.playerName}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Einfaches Link-Sharing
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Nach der Erstellung erhältst du einen Link, den du mit deinem Team teilen kannst. Jeder kann mit seinem Namen beitreten.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Wird erstellt...' : 'Spiel erstellen'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}