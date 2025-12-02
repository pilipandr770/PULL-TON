import { Link } from 'react-router-dom';
import { 
  Coins, 
  Users, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-4">Dokumentation</h1>
      <p className="text-xl text-slate-400 mb-8">
        Alles, was Sie über Community TON Pool wissen müssen
      </p>
      
      <div className="space-y-8">
        {/* Mission */}
        <section className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-8 h-8 text-ton-400" />
            <h2 className="text-2xl font-semibold text-white">Unsere Mission</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            <strong className="text-white">Community TON Pool</strong> wurde geschaffen, um die 
            Einstiegshürden für TON-Staking zu senken. Normalerweise benötigt man für Staking 
            große Mengen an TON. Unser Pool ermöglicht es jedem, bereits ab <strong className="text-ton-400">1 TON</strong> am 
            Staking teilzunehmen und von den Erträgen zu profitieren.
          </p>
          <div className="mt-6 p-4 bg-ton-500/10 border border-ton-500/30 rounded-lg">
            <p className="text-ton-300">
              🎯 <strong>Ziel:</strong> Staking für alle zugänglich machen – unabhängig vom Kapital.
            </p>
          </div>
        </section>

        {/* Testnet Notice */}
        <section className="glass rounded-xl p-8 border-2 border-yellow-500/50">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-semibold text-white">⚠️ Testnet-Phase</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Dieses Projekt befindet sich derzeit im <strong className="text-yellow-400">TON Testnet</strong>. 
            Das bedeutet:
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white">Kostenlos testen:</strong> Sie können alle Funktionen 
                mit Test-TON ausprobieren, ohne echtes Geld zu riskieren.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white">Funktionalität prüfen:</strong> Wir testen alle 
                Smart-Contract-Funktionen gründlich, bevor wir live gehen.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">
                <strong className="text-white">Community aufbauen:</strong> Wir sammeln Feedback 
                und bauen eine starke Community auf.
              </span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-300 font-medium">
              🚀 Sobald genügend Nutzer dabei sind und die Community wächst, wird der 
              Smart Contract im <strong>Mainnet</strong> deployed!
            </p>
          </div>
        </section>

        {/* How it Works */}
        <section className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-8 h-8 text-ton-400" />
            <h2 className="text-2xl font-semibold text-white">Wie funktioniert es?</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ton-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ton-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Wallet verbinden</h3>
                <p className="text-slate-400">
                  Verbinden Sie Ihre TON-Wallet (Tonkeeper, TON Wallet, Telegram Wallet) 
                  über den "Connect Wallet" Button.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ton-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ton-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">TON einzahlen</h3>
                <p className="text-slate-400">
                  Wählen Sie im Dashboard den gewünschten Betrag (min. 1 TON) und klicken 
                  Sie auf "Deposit". Bestätigen Sie die Transaktion in Ihrer Wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ton-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ton-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Anteile erhalten</h3>
                <p className="text-slate-400">
                  Sie erhalten Pool-Anteile proportional zu Ihrer Einzahlung. Diese Anteile 
                  repräsentieren Ihren Besitz am Pool.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ton-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ton-400 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Erträge sammeln</h3>
                <p className="text-slate-400">
                  Der Pool generiert Staking-Erträge. Diese erhöhen den Wert jedes Anteils 
                  automatisch – Sie müssen nichts tun!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ton-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ton-400 font-bold">5</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Jederzeit abheben</h3>
                <p className="text-slate-400">
                  Sie können Ihre Anteile jederzeit einlösen und erhalten TON entsprechend 
                  dem aktuellen Anteilswert zurück.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-8 h-8 text-ton-400" />
            <h2 className="text-2xl font-semibold text-white">Vorteile</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="w-5 h-5 text-green-400" />
                <h3 className="font-medium text-white">0% Gebühren</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Keine versteckten Kosten. 100% Ihrer Einlage arbeitet für Sie.
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="w-5 h-5 text-ton-400" />
                <h3 className="font-medium text-white">Ab 1 TON</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Niedrige Einstiegshürde – jeder kann mitmachen.
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-medium text-white">Community-owned</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Der Pool gehört der Community. Keine zentrale Kontrolle.
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <h3 className="font-medium text-white">Transparent</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Alle Transaktionen sind auf der Blockchain einsehbar.
              </p>
            </div>
          </div>
        </section>

        {/* Get Test TON */}
        <section className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Coins className="w-8 h-8 text-ton-400" />
            <h2 className="text-2xl font-semibold text-white">Test-TON erhalten</h2>
          </div>
          <p className="text-slate-300 mb-4">
            Um die Plattform zu testen, benötigen Sie Test-TON. Diese erhalten Sie kostenlos:
          </p>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start space-x-3">
              <span className="text-ton-400 font-bold">1.</span>
              <span>Stellen Sie Ihre Wallet auf <strong className="text-white">Testnet</strong> um (in den Wallet-Einstellungen)</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-ton-400 font-bold">2.</span>
              <span>
                Besuchen Sie einen Testnet Faucet:
                <ul className="mt-2 ml-4 space-y-1 text-sm">
                  <li>• <a href="https://t.me/testgiver_ton_bot" target="_blank" rel="noopener noreferrer" className="text-ton-400 hover:underline">@testgiver_ton_bot</a> (Telegram)</li>
                  <li>• <a href="https://t.me/tnfaucet_bot" target="_blank" rel="noopener noreferrer" className="text-ton-400 hover:underline">@tnfaucet_bot</a> (Telegram)</li>
                </ul>
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-ton-400 font-bold">3.</span>
              <span>Fordern Sie Test-TON an und beginnen Sie zu testen!</span>
            </li>
          </ol>
        </section>

        {/* Premium Dashboard */}
        <section className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-ton-400" />
            <h2 className="text-2xl font-semibold text-white">Premium Dashboard</h2>
          </div>
          <p className="text-slate-300 mb-4">
            Für <strong className="text-white">5€/Monat</strong> erhalten Sie Zugang zu erweiterten Funktionen:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Detaillierte Transaktionshistorie</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Profit-Tracking und Statistiken</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Erweiterte Analysen</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Prioritäts-Support</span>
            </li>
          </ul>
          <div className="mt-6">
            <Link 
              to="/subscription"
              className="inline-flex items-center space-x-2 gradient-bg px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Premium freischalten</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Roadmap */}
        <section className="glass rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">🗺️ Roadmap</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 rounded-full bg-green-400 mt-2"></div>
              <div>
                <h3 className="font-medium text-white">Phase 1: Testnet Launch ✅</h3>
                <p className="text-slate-400 text-sm">Smart Contract deployed, Grundfunktionen aktiv</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <h3 className="font-medium text-white">Phase 2: Community Building 🔄</h3>
                <p className="text-slate-400 text-sm">Nutzer sammeln, Feedback einholen, Verbesserungen</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 rounded-full bg-slate-600 mt-2"></div>
              <div>
                <h3 className="font-medium text-white">Phase 3: Security Audit</h3>
                <p className="text-slate-400 text-sm">Professionelles Audit des Smart Contracts</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 rounded-full bg-slate-600 mt-2"></div>
              <div>
                <h3 className="font-medium text-white">Phase 4: Mainnet Launch 🚀</h3>
                <p className="text-slate-400 text-sm">Deployment im TON Mainnet mit echten TON</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="glass rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Kontakt & Support</h2>
          <p className="text-slate-300 mb-4">
            Haben Sie Fragen oder Anregungen? Wir freuen uns über Ihr Feedback!
          </p>
          <div className="space-y-2 text-slate-300">
            <p>
              📧 E-Mail:{' '}
              <a href="mailto:andrii.it.info@gmail.com" className="text-ton-400 hover:underline">
                andrii.it.info@gmail.com
              </a>
            </p>
            <p>
              🌐 Website:{' '}
              <a href="https://www.andrii-it.de/" target="_blank" rel="noopener noreferrer" className="text-ton-400 hover:underline">
                www.andrii-it.de
              </a>
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm pt-4">
          <Link to="/impressum" className="text-slate-400 hover:text-white">Impressum</Link>
          <span className="text-slate-600">•</span>
          <Link to="/datenschutz" className="text-slate-400 hover:text-white">Datenschutz</Link>
          <span className="text-slate-600">•</span>
          <Link to="/agb" className="text-slate-400 hover:text-white">AGB</Link>
        </div>
      </div>
    </div>
  );
}
