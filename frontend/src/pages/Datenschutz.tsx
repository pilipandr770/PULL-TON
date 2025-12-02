export default function Datenschutz() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Datenschutzerklärung</h1>
      
      <div className="glass rounded-xl p-8 space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Datenschutz auf einen Blick</h2>
          
          <h3 className="text-lg font-medium text-white mt-4 mb-2">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className="text-lg font-medium text-white mt-4 mb-2">Datenerfassung auf dieser Website</h3>
          <p className="font-medium text-white">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</p>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
            Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <p className="font-medium text-white mt-3">Wie erfassen wir Ihre Daten?</p>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. 
            Hierbei kann es sich z.B. um Daten handeln, die Sie bei der Registrierung eingeben.
          </p>
          <p className="mt-2">
            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
            durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, 
            Betriebssystem oder Uhrzeit des Seitenaufrufs).
          </p>

          <p className="font-medium text-white mt-3">Wofür nutzen wir Ihre Daten?</p>
          <p>
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
            gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>

          <p className="font-medium text-white mt-3">Welche Rechte haben Sie bezüglich Ihrer Daten?</p>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und 
            Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem 
            ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
          <div className="mt-2 p-4 bg-slate-800/50 rounded-lg">
            <p>Andrii Pylypchuk</p>
            <p>Bergmannweg 16</p>
            <p>65934 Frankfurt am Main</p>
            <p className="mt-2">Telefon: +49 160 95030120</p>
            <p>E-Mail: andrii.it.info@gmail.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Datenerfassung auf dieser Website</h2>
          
          <h3 className="text-lg font-medium text-white mt-4 mb-2">Cookies</h3>
          <p>
            Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete 
            und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend 
            für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf 
            Ihrem Endgerät gespeichert.
          </p>
          <p className="mt-2">
            Wir verwenden technisch notwendige Cookies für die Authentifizierung und 
            Sitzungsverwaltung.
          </p>

          <h3 className="text-lg font-medium text-white mt-4 mb-2">Server-Log-Dateien</h3>
          <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          <p className="mt-2">
            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. TON Wallet Integration</h2>
          <p>
            Für die Nutzung unserer Staking-Dienste ist die Verbindung mit einer TON-Wallet 
            erforderlich. Bei der Wallet-Verbindung werden folgende Daten verarbeitet:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Öffentliche Wallet-Adresse</li>
            <li>Transaktionsdaten auf der TON-Blockchain</li>
          </ul>
          <p className="mt-2">
            Diese Daten sind auf der TON-Blockchain öffentlich einsehbar. Wir speichern Ihre 
            Wallet-Adresse zur Bereitstellung unserer Dienste und zur Zuordnung Ihrer Einlagen.
          </p>
          <p className="mt-2">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO zur 
            Vertragserfüllung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Zahlungsabwicklung (Stripe)</h2>
          <p>
            Für Abonnement-Zahlungen nutzen wir den Zahlungsdienstleister Stripe. 
            Bei einer Zahlung werden folgende Daten an Stripe übermittelt:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>E-Mail-Adresse</li>
            <li>Zahlungsinformationen (Kreditkartendaten werden direkt bei Stripe verarbeitet)</li>
            <li>Rechnungsadresse (falls angegeben)</li>
          </ul>
          <p className="mt-2">
            Stripe ist ein zertifizierter PCI-DSS Level 1 Dienstleister. Weitere Informationen 
            finden Sie in der{' '}
            <a 
              href="https://stripe.com/de/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ton-400 hover:underline"
            >
              Datenschutzerklärung von Stripe
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Ihre Rechte</h2>
          <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:{' '}
            <a href="mailto:andrii.it.info@gmail.com" className="text-ton-400 hover:underline">
              andrii.it.info@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung 
            Ihrer personenbezogenen Daten zu beschweren.
          </p>
        </section>

        <section className="text-sm text-slate-400 pt-4 border-t border-slate-700">
          <p>Stand: Dezember 2025</p>
        </section>
      </div>
    </div>
  );
}
