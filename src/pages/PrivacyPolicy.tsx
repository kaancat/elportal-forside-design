import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privatlivspolitik</h1>
      <p className="text-gray-600 mb-8">Sidst opdateret: {new Date().toLocaleDateString('da-DK')}</p>
      
      <div className="space-y-6">
        
        {/* Who We Are */}
        <Card>
          <CardHeader>
            <CardTitle>Hvem vi er</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              DinElportal.dk drives af Vindstød A/S (CVR: XXXXXXXX). Vi er en sammenligningstjeneste 
              for elpriser, der hjælper danske forbrugere med at finde den bedste elaftale.
            </p>
            <p>
              <strong>Kontaktoplysninger:</strong><br />
              Vindstød A/S<br />
              Inge Lehmanns Gade 10, 6. sal<br />
              8000 Aarhus C<br />
              Email: kontakt@dinelportal.dk
            </p>
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>Hvilke data indsamler vi</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>Data uden samtykke (nødvendige cookies)</h3>
            <ul>
              <li><strong>Besøgsstatistik</strong>: Anonyme besøgstal og sidevisninger</li>
              <li><strong>Click tracking</strong>: Anonyme identifikatorer når du klikker på partnere</li>
              <li><strong>Sessionsdata</strong>: Teknisk information til at forbedre hjemmesiden</li>
            </ul>
            
            <h3>Data med dit samtykke</h3>
            <h4>Statistikcookies:</h4>
            <ul>
              <li><strong>Google Analytics</strong>: Detaljeret brugeradfærd (anonymiseret)</li>
              <li><strong>Forbedring af tjenesten</strong>: Hvordan du bruger hjemmesiden</li>
            </ul>
            
            <h4>Marketingcookies:</h4>
            <ul>
              <li><strong>Facebook Pixel</strong>: Tilpassede annoncer på Facebook</li>
              <li><strong>Konverteringssporing</strong>: Måling af effektiviteten af vores markedsføring</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle>Hvordan bruger vi dine data</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>Lovlige grunde for behandling</h3>
            <ul>
              <li><strong>Berettiget interesse</strong>: Anonyme click-sporing for partnerskaber</li>
              <li><strong>Samtykke</strong>: Detaljeret analyse og markedsføring</li>
              <li><strong>Kontraktopfyldelse</strong>: Levering af sammenligningstjenester</li>
            </ul>
            
            <h3>Deling med tredjeparter</h3>
            <p>
              Vi deler kun data med:
            </p>
            <ul>
              <li><strong>Elselskaber</strong>: Anonyme henvisninger når du vælger en leverandør</li>
              <li><strong>Google Analytics</strong>: Anonymiserede brugsdata (kun med samtykke)</li>
              <li><strong>Facebook</strong>: Marketingdata (kun med samtykke)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Hvor længe gemmer vi data</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <ul>
              <li><strong>Click tracking</strong>: 90 dage (automatisk sletning)</li>
              <li><strong>Anonyme besøgsdata</strong>: 26 måneder (Google Analytics standard)</li>
              <li><strong>Samtykkeoplysninger</strong>: 12 måneder</li>
              <li><strong>Tekniske logs</strong>: 30 dage</li>
            </ul>
            
            <p>
              Alle data slettes automatisk efter disse perioder eller hurtigere, hvis du anmoder om det.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Dine rettigheder under GDPR</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>Du har følgende rettigheder vedrørende dine personoplysninger:</p>
            
            <ul>
              <li><strong>Ret til indsigt</strong>: Du kan anmode om at se, hvilke data vi har om dig</li>
              <li><strong>Ret til berigtigelse</strong>: Du kan få rettet forkerte oplysninger</li>
              <li><strong>Ret til sletning</strong>: Du kan anmode om at få slettet dine data</li>
              <li><strong>Ret til dataportabilitet</strong>: Du kan få dine data i et læsbart format</li>
              <li><strong>Ret til at trække samtykke tilbage</strong>: Du kan til enhver tid ændre dine cookie-indstillinger</li>
              <li><strong>Ret til at klage</strong>: Du kan klage til Datatilsynet</li>
            </ul>
            
            <p>
              For at udøve dine rettigheder, kontakt os på: <strong>kontakt@dinelportal.dk</strong>
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies og tracking</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>Hvordan fungerer vores tracking</h3>
            <p>
              Vi bruger en tre-lags tilgang til tracking:
            </p>
            
            <h4>Niveau 1: Ingen samtykke påkrævet</h4>
            <ul>
              <li>Anonyme click-identifikatorer i URL'er</li>
              <li>Ingen cookies sat på din enhed</li>
              <li>Ingen personlige data indsamlet</li>
              <li>Bruges til at spore henvisninger til partnere</li>
            </ul>
            
            <h4>Niveau 2: Statistikcookies (med samtykke)</h4>
            <ul>
              <li>Google Analytics for at forstå brugeradfærd</li>
              <li>Anonymiserede data (ingen IP-adresser)</li>
              <li>Hjælper os med at forbedre hjemmesiden</li>
            </ul>
            
            <h4>Niveau 3: Marketingcookies (med samtykke)</h4>
            <ul>
              <li>Facebook Pixel til målrettede annoncer</li>
              <li>Forbedret konverteringssporing</li>
              <li>Personaliseret indhold</li>
            </ul>
            
            <h3>Administrer dine cookie-indstillinger</h3>
            <p>
              Du kan til enhver tid ændre dine cookie-indstillinger ved at klikke på 
              "Cookie-indstillinger" i bunden af siden eller ved at besøge denne side igen.
            </p>
            
            <div id="CookieDeclaration" className="mt-4">
              {/* Cookiebot will auto-populate this */}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt os</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              Har du spørgsmål til denne privatlivspolitik eller ønsker at udøve dine rettigheder, 
              er du velkommen til at kontakte os:
            </p>
            
            <p>
              <strong>Email:</strong> kontakt@dinelportal.dk<br />
              <strong>Telefon:</strong> +45 XX XX XX XX<br />
              <strong>Post:</strong> Vindstød A/S, Inge Lehmanns Gade 10, 6. sal, 8000 Aarhus C
            </p>
            
            <p>
              Vi svarer normalt inden for 30 dage på henvendelser vedrørende persondata.
            </p>
            
            <h3>Klage til Datatilsynet</h3>
            <p>
              Du har ret til at klage til Datatilsynet, hvis du mener, vi behandler dine 
              personoplysninger i strid med reglerne:
            </p>
            <p>
              <strong>Datatilsynet</strong><br />
              Borgergade 28, 5.<br />
              1300 København K<br />
              Telefon: 33 19 32 00<br />
              Email: dt@datatilsynet.dk
            </p>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};

export default PrivacyPolicy;