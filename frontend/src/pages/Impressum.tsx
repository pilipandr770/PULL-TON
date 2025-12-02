export default function Impressum() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Impressum</h1>
      
      <div className="glass rounded-xl p-8 space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Angaben gemäß § 5 TMG</h2>
          <p>Andrii Pylypchuk</p>
          <p>Bergmannweg 16</p>
          <p>65934 Frankfurt am Main</p>
          <p>Deutschland</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Kontakt</h2>
          <p>Telefon: +49 160 95030120</p>
          <p>E-Mail: andrii.it.info@gmail.com</p>
          <p>
            Website:{' '}
            <a 
              href="https://www.andrii-it.de/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ton-400 hover:underline"
            >
              www.andrii-it.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
          <p className="font-mono">DE456902445</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>Andrii Pylypchuk</p>
          <p>Bergmannweg 16</p>
          <p>65934 Frankfurt am Main</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ton-400 hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
            Tätigkeit hinweisen.
          </p>
          <p className="mt-2">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
            erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
            Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
            Seiten verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </div>
  );
}
