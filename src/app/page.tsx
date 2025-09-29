import Link from "next/link";

export default function Home() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Meetings machen mehr Spaß mit Business Bingo
            </h2>
            <p className="text-xl text-black mb-8">
              Erstelle ein Spiel, lade dein Team ein und fangt an zu spielen.
            </p>

            <Link
              href="/create"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Neues Spiel erstellen
            </Link>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Spiel erstellen</h3>
              <p className="text-black">Erstelle ein neues Business Bingo Spiel und lade dein Team per E-Mail ein.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Begriffe anpassen</h3>
              <p className="text-black">Passe die Business-Buzzwords an euer Meeting an oder füge eigene Begriffe hinzu.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Bingo spielen</h3>
              <p className="text-black">Markiert Begriffe, die ihr selbst sagt. Wer zuerst Bingo hat, gewinnt!</p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <h3 className="text-2xl font-bold text-black mb-6">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-black">Echtzeit-Synchronisation</h4>
                  <p className="text-black">Alle Spieler sehen live, was passiert</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-black">Individuelle Karten</h4>
                  <p className="text-black">Jeder Spieler bekommt eine einzigartige Bingo-Karte</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-black">Anpassbare Begriffe</h4>
                  <p className="text-black">100 vordefinierte Business-Buzzwords oder eigene Begriffe</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-black">Kein Account nötig</h4>
                  <p className="text-black">Einfach per E-Mail-Einladung beitreten</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2025 Business Bingo
          </div>
        </div>
      </footer>
    </div>
  );
}
