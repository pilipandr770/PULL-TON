export default function AGB() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
      
      <div className="glass rounded-xl p-8 space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 1 Geltungsbereich</h2>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der 
            Community TON Pool Plattform (nachfolgend "Plattform"), betrieben von:
          </p>
          <div className="mt-2 p-4 bg-slate-800/50 rounded-lg">
            <p>Andrii Pylypchuk</p>
            <p>Bergmannweg 16</p>
            <p>65934 Frankfurt am Main</p>
            <p>E-Mail: andrii.it.info@gmail.com</p>
          </div>
          <p className="mt-3">
            (2) Mit der Nutzung der Plattform akzeptieren Sie diese AGB in ihrer jeweils gültigen Fassung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 2 Leistungsbeschreibung</h2>
          <p>(1) Die Plattform bietet folgende Dienste an:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Teilnahme an einem gemeinschaftlichen TON-Staking-Pool</li>
            <li>Verwaltung und Übersicht über eingezahlte TON und erworbene Anteile</li>
            <li>Premium-Dashboard mit erweiterten Funktionen (kostenpflichtig)</li>
          </ul>
          <p className="mt-3">
            (2) Der Staking-Pool arbeitet ohne Gebühren. Die eingezahlten TON werden vollständig 
            für das Staking verwendet.
          </p>
          <p className="mt-2">
            (3) Das Premium-Dashboard ist als Abonnement für 5,00 € pro Monat erhältlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 3 Registrierung und Wallet-Verbindung</h2>
          <p>
            (1) Die Nutzung der Plattform erfordert die Verbindung einer kompatiblen TON-Wallet 
            (z.B. Tonkeeper, TON Wallet).
          </p>
          <p className="mt-2">
            (2) Sie sind für die Sicherheit Ihrer Wallet und Ihrer privaten Schlüssel 
            selbst verantwortlich.
          </p>
          <p className="mt-2">
            (3) Ein Verlust des Zugangs zu Ihrer Wallet kann zum dauerhaften Verlust Ihrer 
            eingezahlten Mittel führen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 4 Einzahlungen und Auszahlungen</h2>
          <p>(1) Mindesteinzahlung: 1 TON</p>
          <p className="mt-2">
            (2) Einzahlungen erfolgen durch Überweisung von TON an die Pool-Adresse. 
            Im Gegenzug erhalten Sie Anteile am Pool proportional zu Ihrer Einzahlung.
          </p>
          <p className="mt-2">
            (3) Auszahlungen können jederzeit durch Einlösen Ihrer Anteile erfolgen. 
            Die Auszahlung erfolgt in TON entsprechend dem aktuellen Anteilswert.
          </p>
          <p className="mt-2">
            (4) Blockchain-Transaktionsgebühren (Gas) werden vom Nutzer getragen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 5 Abonnement und Zahlung</h2>
          <p>
            (1) Das Premium-Dashboard ist als monatliches Abonnement für 5,00 € erhältlich.
          </p>
          <p className="mt-2">
            (2) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es werden 
            gängige Zahlungsmethoden akzeptiert.
          </p>
          <p className="mt-2">
            (3) Das Abonnement verlängert sich automatisch um einen weiteren Monat, 
            sofern es nicht vor Ablauf gekündigt wird.
          </p>
          <p className="mt-2">
            (4) Die Kündigung kann jederzeit über das Dashboard oder per E-Mail erfolgen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 6 Widerrufsrecht</h2>
          <p className="font-medium text-white">Widerrufsbelehrung</p>
          <p className="mt-2">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen 
            Vertrag zu widerrufen.
          </p>
          <p className="mt-2">
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
          </p>
          <p className="mt-2">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen 
            Erklärung (z.B. per E-Mail) über Ihren Entschluss informieren.
          </p>
          <p className="mt-3 p-4 bg-slate-800/50 rounded-lg">
            <strong className="text-white">Kontakt für Widerruf:</strong><br />
            E-Mail: andrii.it.info@gmail.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 7 Risikohinweise</h2>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="font-medium text-yellow-400 mb-2">⚠️ Wichtige Hinweise</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Kryptowährungen unterliegen starken Kursschwankungen. Der Wert Ihrer 
                Einlage kann steigen oder fallen.
              </li>
              <li>
                Staking-Erträge sind nicht garantiert und können variieren.
              </li>
              <li>
                Smart Contracts können Fehler enthalten. Trotz sorgfältiger Entwicklung 
                kann ein Totalverlust nicht ausgeschlossen werden.
              </li>
              <li>
                Investieren Sie nur Mittel, deren Verlust Sie verkraften können.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 8 Haftungsbeschränkung</h2>
          <p>
            (1) Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit.
          </p>
          <p className="mt-2">
            (2) Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher 
            Vertragspflichten und der Höhe nach begrenzt auf den vorhersehbaren, 
            vertragstypischen Schaden.
          </p>
          <p className="mt-2">
            (3) Für Schäden, die durch Fehler in Smart Contracts, Blockchain-Netzwerkprobleme 
            oder Hacking-Angriffe entstehen, haften wir nur bei Vorsatz oder grober Fahrlässigkeit.
          </p>
          <p className="mt-2">
            (4) Die Haftung für Datenverlust wird auf den typischen Wiederherstellungsaufwand 
            beschränkt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 9 Änderungen der AGB</h2>
          <p>
            (1) Wir behalten uns vor, diese AGB jederzeit zu ändern.
          </p>
          <p className="mt-2">
            (2) Über wesentliche Änderungen werden registrierte Nutzer per E-Mail informiert.
          </p>
          <p className="mt-2">
            (3) Die weitere Nutzung der Plattform nach Inkrafttreten der Änderungen gilt 
            als Zustimmung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">§ 10 Schlussbestimmungen</h2>
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des 
            UN-Kaufrechts.
          </p>
          <p className="mt-2">
            (2) Gerichtsstand für alle Streitigkeiten ist Frankfurt am Main, sofern 
            Sie Kaufmann sind.
          </p>
          <p className="mt-2">
            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die 
            Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </section>

        <section className="text-sm text-slate-400 pt-4 border-t border-slate-700">
          <p>Stand: Dezember 2025</p>
        </section>
      </div>
    </div>
  );
}
