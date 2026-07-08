export interface LocaleText {
  nl: string
  en: string
}

export interface LocaleList {
  nl: string[]
  en: string[]
}

export type KnowledgeBlock =
  | { type: 'paragraph'; content: LocaleText }
  | { type: 'heading'; content: LocaleText }
  | { type: 'list'; content: LocaleList }

export interface KnowledgeCategory {
  id: string
  code: string
  title: LocaleText
  description: LocaleText
  order: number
}

export interface KnowledgeArticle {
  slug: string
  categoryId: string
  question: LocaleText
  answer: LocaleText
  body: KnowledgeBlock[]
  keywords: string[]
  related: string[]
  updated: string
  order: number
}

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: 'services',
    code: 'KB-01',
    title: { nl: 'Diensten & aanpak', en: 'Services & approach' },
    description: {
      nl: 'Wat CPWD bouwt en hoe we werken, van maatwerk websites tot webapps.',
      en: 'What CPWD builds and how we work, from bespoke websites to web apps.',
    },
    order: 1,
  },
  {
    id: 'pricing',
    code: 'KB-02',
    title: { nl: 'Prijzen & offertes', en: 'Pricing & quotes' },
    description: {
      nl: 'Wat een website kost, hoe offertes werken en welke betaalafspraken we maken.',
      en: 'What a website costs, how quotes work and which payment terms we use.',
    },
    order: 2,
  },
  {
    id: 'process',
    code: 'KB-03',
    title: { nl: 'Proces & tijdlijn', en: 'Process & timeline' },
    description: {
      nl: 'Van eerste gesprek tot livegang: de stappen, doorlooptijd en wat we van jou nodig hebben.',
      en: 'From first call to launch: the steps, timeline and what we need from you.',
    },
    order: 3,
  },
  {
    id: 'tech',
    code: 'KB-04',
    title: { nl: 'Techniek & hosting', en: 'Tech & hosting' },
    description: {
      nl: 'De technologie achter je site, hosting, snelheid, beveiliging en contentbeheer.',
      en: 'The technology behind your site, hosting, speed, security and content management.',
    },
    order: 4,
  },
  {
    id: 'seo',
    code: 'KB-05',
    title: { nl: 'SEO & vindbaarheid', en: 'SEO & visibility' },
    description: {
      nl: 'Hoe je site scoort in Google en bij AI-zoekmachines, en wat wij standaard meeleveren.',
      en: 'How your site ranks in Google and AI search engines, and what we include by default.',
    },
    order: 5,
  },
  {
    id: 'support',
    code: 'KB-06',
    title: { nl: 'Onderhoud & support', en: 'Maintenance & support' },
    description: {
      nl: 'Wat er gebeurt na livegang: updates, onderhoud, eigendom en doorontwikkeling.',
      en: 'What happens after launch: updates, maintenance, ownership and further development.',
    },
    order: 6,
  },
]

export const knowledgeArticles: KnowledgeArticle[] = [
  // ---------------------------------------------------------------
  // SERVICES
  // ---------------------------------------------------------------
  {
    slug: 'wat-doet-cpwd',
    categoryId: 'services',
    order: 1,
    updated: '2026-07-08',
    keywords: ['webdevelopment bureau', 'webdesign nederland', 'maatwerk website laten maken'],
    related: ['maatwerk-of-template', 'welke-projecten', 'webapp-of-website'],
    question: {
      nl: 'Wat doet CPWD precies?',
      en: 'What exactly does CPWD do?',
    },
    answer: {
      nl: 'CPWD is een webdevelopment-bureau uit Nederland dat maatwerk websites en webapps ontwerpt en bouwt, van eerste concept tot livegang en hosting.',
      en: 'CPWD is a web development agency in the Netherlands that designs and builds bespoke websites and web apps, from first concept to launch and hosting.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'CPWD levert het *complete traject*: strategie, ontwerp, development, livegang en hosting. Je hebt dus geen los ontwerpbureau en developer nodig, alles komt uit één hand.',
          en: 'CPWD delivers the *complete scope*: strategy, design, development, launch and hosting. You do not need a separate design studio and developer, everything comes from one place.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'We richten ons op merken die online serieus genomen willen worden. Dat betekent sites die er premium uitzien, snel laden en bezoekers omzetten in klanten.',
          en: 'We focus on brands that want to be taken seriously online. That means sites that look premium, load fast and turn visitors into customers.',
        },
      },
      {
        type: 'heading',
        content: { nl: 'Waarmee we je helpen', en: 'What we help you with' },
      },
      {
        type: 'list',
        content: {
          nl: [
            'Maatwerk websites en landingspagina\'s',
            'Webapps en klantportalen',
            'Cloud hosting, beveiliging en performance',
            'Motion, interactie en visueel ontwerp',
          ],
          en: [
            'Bespoke websites and landing pages',
            'Web apps and client portals',
            'Cloud hosting, security and performance',
            'Motion, interaction and visual design',
          ],
        },
      },
    ],
  },
  {
    slug: 'maatwerk-of-template',
    categoryId: 'services',
    order: 2,
    updated: '2026-07-08',
    keywords: ['maatwerk website', 'geen wordpress template', 'custom website'],
    related: ['wat-doet-cpwd', 'welke-technologie', 'wat-kost-een-website'],
    question: {
      nl: 'Bouwen jullie op maat of met templates?',
      en: 'Do you build custom or with templates?',
    },
    answer: {
      nl: 'We bouwen volledig op maat. Geen kant-en-klare templates, maar een ontwerp en code die precies passen bij jouw merk, doelen en content.',
      en: 'We build fully custom. No off-the-shelf templates, but a design and code that fit your brand, goals and content exactly.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Templates zijn goedkoop om mee te starten, maar je zit vast aan de keuzes van iemand anders. Je site lijkt op duizenden andere, laadt vaak traag door overbodige code en is lastig uniek te maken.',
          en: 'Templates are cheap to start with, but you are stuck with someone else\'s choices. Your site looks like thousands of others, often loads slowly due to bloated code and is hard to make unique.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'Met maatwerk bepalen wij samen elke pagina, animatie en interactie. Het resultaat is *sneller, unieker en beter converterend*, en volledig van jou.',
          en: 'With custom work we decide every page, animation and interaction together. The result is *faster, more unique and better converting*, and completely yours.',
        },
      },
    ],
  },
  {
    slug: 'webapp-of-website',
    categoryId: 'services',
    order: 3,
    updated: '2026-07-08',
    keywords: ['webapp laten maken', 'verschil website webapp', 'klantportaal'],
    related: ['wat-doet-cpwd', 'welke-technologie', 'wat-kost-een-website'],
    question: {
      nl: 'Wat is het verschil tussen een website en een webapp?',
      en: 'What is the difference between a website and a web app?',
    },
    answer: {
      nl: 'Een website informeert en overtuigt; een webapp laat gebruikers dingen doen, zoals inloggen, data beheren of bestellingen plaatsen. Wij bouwen beide.',
      en: 'A website informs and convinces; a web app lets users do things, like log in, manage data or place orders. We build both.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Een website draait om presentatie: je diensten, je werk en je verhaal, gericht op vertrouwen en conversie. Een webapp is interactief en heeft vaak accounts, een database en logica achter de schermen.',
          en: 'A website is about presentation: your services, your work and your story, aimed at trust and conversion. A web app is interactive and often has accounts, a database and logic behind the scenes.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'Twijfel je wat je nodig hebt? Vertel ons wat je wilt bereiken, dan adviseren we de aanpak die past bij je budget en doelen.',
          en: 'Not sure what you need? Tell us what you want to achieve and we will advise the approach that fits your budget and goals.',
        },
      },
    ],
  },
  {
    slug: 'welke-projecten',
    categoryId: 'services',
    order: 4,
    updated: '2026-07-08',
    keywords: ['soorten projecten', 'branches', 'webdesign voor bedrijven'],
    related: ['wat-doet-cpwd', 'werken-jullie-internationaal'],
    question: {
      nl: 'Voor wat voor projecten kan ik jullie inschakelen?',
      en: 'What kind of projects can I hire you for?',
    },
    answer: {
      nl: 'Van bedrijfswebsites en portfolios tot merkplatformen en webapps. We werken graag aan projecten waar design en techniek samen het verschil maken.',
      en: 'From company websites and portfolios to brand platforms and web apps. We enjoy projects where design and engineering together make the difference.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'We zijn niet gebonden aan één branche. Wel aan een lat: elk project moet er scherp uitzien, snel zijn en een duidelijk doel dienen.',
          en: 'We are not tied to one industry. We are tied to a standard: every project must look sharp, be fast and serve a clear purpose.',
        },
      },
      {
        type: 'list',
        content: {
          nl: [
            'Bedrijfs- en dienstenwebsites',
            'Merkplatformen en portfolios',
            'Landingspagina\'s voor campagnes',
            'Webapps, dashboards en klantportalen',
          ],
          en: [
            'Company and service websites',
            'Brand platforms and portfolios',
            'Campaign landing pages',
            'Web apps, dashboards and client portals',
          ],
        },
      },
    ],
  },
  {
    slug: 'werken-jullie-internationaal',
    categoryId: 'services',
    order: 5,
    updated: '2026-07-08',
    keywords: ['meertalige website', 'internationale website', 'website engels nederlands'],
    related: ['welke-projecten', 'wat-doet-cpwd'],
    question: {
      nl: 'Werken jullie ook voor klanten buiten Nederland?',
      en: 'Do you also work for clients outside the Netherlands?',
    },
    answer: {
      nl: 'Ja. We werken vanuit Nederland voor klanten in binnen- en buitenland en bouwen standaard meertalige sites wanneer dat nodig is.',
      en: 'Yes. We work from the Netherlands for clients at home and abroad, and build multilingual sites by default when needed.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Communicatie loopt in het Nederlands of Engels. Meertalige sites zetten we technisch goed op, met correcte taal-tags en vertalingen die kloppen, zodat je in elke markt vindbaar bent.',
          en: 'Communication runs in Dutch or English. We set up multilingual sites correctly at a technical level, with proper language tags and accurate translations, so you are findable in every market.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------
  // PRICING
  // ---------------------------------------------------------------
  {
    slug: 'wat-kost-een-website',
    categoryId: 'pricing',
    order: 1,
    updated: '2026-07-08',
    keywords: ['wat kost een website', 'prijs website laten maken', 'kosten webdesign'],
    related: ['hoe-werkt-offerte', 'betaalafspraken', 'maatwerk-of-template'],
    question: {
      nl: 'Wat kost een website bij CPWD?',
      en: 'What does a website cost at CPWD?',
    },
    answer: {
      nl: 'Elke prijs is maatwerk en hangt af van omvang en complexiteit. Na een kort gesprek krijg je een heldere offerte met vaste prijs, zonder verrassingen achteraf.',
      en: 'Every price is bespoke and depends on scope and complexity. After a short call you get a clear fixed-price quote, with no surprises afterwards.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Een simpele one-pager kost minder dan een uitgebreid merkplatform of een webapp met accounts en een database. Daarom werken we niet met vaste pakketten, maar met een offerte op basis van jouw wensen.',
          en: 'A simple one-pager costs less than an extensive brand platform or a web app with accounts and a database. That is why we do not use fixed packages, but a quote based on your needs.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'Wat de prijs bepaalt: het aantal pagina\'s, maatwerk-animaties, een CMS, meertaligheid en eventuele koppelingen met externe systemen. We denken altijd mee over wat *echt waarde toevoegt* binnen je budget.',
          en: 'What determines the price: the number of pages, custom animations, a CMS, multilingual support and any integrations with external systems. We always think along about what *truly adds value* within your budget.',
        },
      },
    ],
  },
  {
    slug: 'hoe-werkt-offerte',
    categoryId: 'pricing',
    order: 2,
    updated: '2026-07-08',
    keywords: ['offerte website', 'prijsopgave webdesign', 'vrijblijvende offerte'],
    related: ['wat-kost-een-website', 'betaalafspraken', 'hoe-lang-duurt-website'],
    question: {
      nl: 'Hoe werkt een offerte en is die vrijblijvend?',
      en: 'How does a quote work and is it free of obligation?',
    },
    answer: {
      nl: 'Je krijgt een vrijblijvende offerte met vaste prijs. We bespreken eerst je project, daarna ontvang je een concreet voorstel met scope, planning en prijs.',
      en: 'You get a free, no-obligation fixed-price quote. We discuss your project first, then you receive a concrete proposal with scope, timeline and price.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'We beginnen met een kort gesprek over je doelen, doelgroep en wensen. Op basis daarvan stellen we een offerte op waarin precies staat wat je krijgt, tegen welke prijs en binnen welke termijn.',
          en: 'We start with a short call about your goals, audience and wishes. Based on that we prepare a quote that states exactly what you get, at what price and within what timeframe.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'De offerte is vrijblijvend. Pas als jij akkoord geeft, gaan we van start.',
          en: 'The quote is free of obligation. We only start once you approve.',
        },
      },
    ],
  },
  {
    slug: 'betaalafspraken',
    categoryId: 'pricing',
    order: 3,
    updated: '2026-07-08',
    keywords: ['betaling in termijnen', 'aanbetaling website', 'betaalafspraken webdesign'],
    related: ['wat-kost-een-website', 'hoe-werkt-offerte'],
    question: {
      nl: 'Welke betaalafspraken maken jullie?',
      en: 'What payment terms do you use?',
    },
    answer: {
      nl: 'Meestal werken we met een aanbetaling bij start en het restant bij livegang. Bij grotere projecten spreiden we de betaling over duidelijke fases.',
      en: 'Usually we work with a deposit at the start and the remainder at launch. For larger projects we spread payment across clear phases.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'De exacte afspraken staan altijd in de offerte, zodat je vooraf weet waar je aan toe bent. Geen verborgen kosten en geen onverwachte facturen.',
          en: 'The exact terms are always in the quote, so you know where you stand up front. No hidden costs and no unexpected invoices.',
        },
      },
    ],
  },
  {
    slug: 'wat-kost-onderhoud',
    categoryId: 'pricing',
    order: 4,
    updated: '2026-07-08',
    keywords: ['kosten onderhoud website', 'hosting kosten', 'onderhoudscontract website'],
    related: ['wat-valt-onder-onderhoud', 'hosting-bij-cpwd'],
    question: {
      nl: 'Wat kost hosting en onderhoud per maand?',
      en: 'What do hosting and maintenance cost per month?',
    },
    answer: {
      nl: 'Hosting en onderhoud bieden we aan als een overzichtelijk maandbedrag, afgestemd op je site. Je zit nergens aan vast wat je niet nodig hebt.',
      en: 'We offer hosting and maintenance as a clear monthly fee, tailored to your site. You are never tied to things you do not need.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Het maandbedrag hangt af van de grootte van je site en het gewenste serviceniveau. We leggen vooraf uit wat erin zit, zodat je een bewuste keuze maakt.',
          en: 'The monthly fee depends on the size of your site and the desired service level. We explain up front what is included, so you make an informed choice.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------
  // PROCESS
  // ---------------------------------------------------------------
  {
    slug: 'hoe-lang-duurt-website',
    categoryId: 'process',
    order: 1,
    updated: '2026-07-08',
    keywords: ['hoe lang duurt website bouwen', 'doorlooptijd website', 'levertijd webdesign'],
    related: ['welke-stappen', 'wat-heb-je-nodig', 'hoe-werkt-offerte'],
    question: {
      nl: 'Hoe lang duurt het om een website te bouwen?',
      en: 'How long does it take to build a website?',
    },
    answer: {
      nl: 'Een compacte site is vaak in enkele weken klaar; grotere platformen en webapps duren langer. Na het intakegesprek krijg je een realistische planning.',
      en: 'A compact site is often ready in a few weeks; larger platforms and web apps take longer. After the intake call you get a realistic timeline.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'De doorlooptijd hangt af van de omvang en van hoe snel we content en feedback ontvangen. Projecten waarin de klant vlot aanlevert, lopen merkbaar sneller.',
          en: 'The timeline depends on the scope and on how quickly we receive content and feedback. Projects where the client delivers promptly move noticeably faster.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'We plannen in duidelijke fases met tussentijdse opleveringen, zodat je altijd weet waar we staan.',
          en: 'We plan in clear phases with interim deliveries, so you always know where we stand.',
        },
      },
    ],
  },
  {
    slug: 'welke-stappen',
    categoryId: 'process',
    order: 2,
    updated: '2026-07-08',
    keywords: ['proces website laten maken', 'stappen webdesign', 'werkwijze bureau'],
    related: ['hoe-lang-duurt-website', 'wat-heb-je-nodig', 'hoeveel-feedback'],
    question: {
      nl: 'Welke stappen doorloopt een project?',
      en: 'What steps does a project go through?',
    },
    answer: {
      nl: 'Intake, ontwerp, development, feedbackrondes en livegang. Elke fase sluit je af met een duidelijk akkoord voor we verdergaan.',
      en: 'Intake, design, development, feedback rounds and launch. You sign off each phase clearly before we move on.',
    },
    body: [
      {
        type: 'list',
        content: {
          nl: [
            'Intake: we bepalen doelen, doelgroep en scope',
            'Ontwerp: visueel concept en structuur',
            'Development: we bouwen de site op maat',
            'Feedback: je reviewt en wij verfijnen',
            'Livegang: we lanceren en controleren alles',
          ],
          en: [
            'Intake: we define goals, audience and scope',
            'Design: visual concept and structure',
            'Development: we build the site custom',
            'Feedback: you review and we refine',
            'Launch: we go live and check everything',
          ],
        },
      },
    ],
  },
  {
    slug: 'wat-heb-je-nodig',
    categoryId: 'process',
    order: 3,
    updated: '2026-07-08',
    keywords: ['wat aanleveren website', 'content aanleveren', 'teksten en beeld website'],
    related: ['welke-stappen', 'hoeveel-feedback', 'hoe-lang-duurt-website'],
    question: {
      nl: 'Wat hebben jullie van mij nodig om te starten?',
      en: 'What do you need from me to get started?',
    },
    answer: {
      nl: 'Een idee van je doelen en, waar mogelijk, teksten, beeld en je logo. Heb je die nog niet? Dan denken we mee en helpen we je op weg.',
      en: 'An idea of your goals and, where possible, copy, imagery and your logo. Do not have those yet? We think along and help you get there.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Hoe scherper je input, hoe sneller en gerichter we werken. Maar we snappen dat niet iedereen kant-en-klare content heeft, dus we adviseren graag over structuur, teksten en beeld.',
          en: 'The sharper your input, the faster and more focused we work. But we understand not everyone has ready-made content, so we are happy to advise on structure, copy and imagery.',
        },
      },
    ],
  },
  {
    slug: 'hoeveel-feedback',
    categoryId: 'process',
    order: 4,
    updated: '2026-07-08',
    keywords: ['feedbackrondes', 'revisies website', 'aanpassingen tijdens project'],
    related: ['welke-stappen', 'wat-heb-je-nodig'],
    question: {
      nl: 'Hoeveel feedback en aanpassingen zijn mogelijk?',
      en: 'How much feedback and how many revisions are possible?',
    },
    answer: {
      nl: 'Feedback hoort bij het proces. We plannen vaste rondes in per fase, zodat je site precies goed komt zonder dat het project eindeloos uitloopt.',
      en: 'Feedback is part of the process. We plan set rounds per phase, so your site turns out exactly right without the project dragging on endlessly.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Door feedback per fase te verzamelen, houden we tempo en kwaliteit hoog. Grote koerswijzigingen bespreken we open, inclusief wat het betekent voor planning en prijs.',
          en: 'By collecting feedback per phase, we keep both pace and quality high. We discuss major changes of direction openly, including what they mean for timeline and price.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------
  // TECH
  // ---------------------------------------------------------------
  {
    slug: 'welke-technologie',
    categoryId: 'tech',
    order: 1,
    updated: '2026-07-08',
    keywords: ['nuxt vue website', 'welke techniek website', 'moderne webtechnologie'],
    related: ['is-mijn-site-snel', 'hosting-bij-cpwd', 'kan-ik-zelf-content-beheren'],
    question: {
      nl: 'Welke technologie gebruiken jullie?',
      en: 'What technology do you use?',
    },
    answer: {
      nl: 'We bouwen met moderne, bewezen webtechnologie zoals Nuxt en Vue. Dat levert snelle, veilige en goed onderhoudbare sites op.',
      en: 'We build with modern, proven web technology such as Nuxt and Vue. That results in fast, secure and easily maintainable sites.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Onze standaard is een moderne frontend-stack met server-side rendering voor snelheid en SEO. Voor content, data en koppelingen kiezen we per project de beste tools.',
          en: 'Our default is a modern frontend stack with server-side rendering for speed and SEO. For content, data and integrations we pick the best tools per project.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'We kiezen techniek die *jaren meegaat* en makkelijk uit te breiden is, zodat je site met je bedrijf mee kan groeien.',
          en: 'We choose technology that *lasts for years* and is easy to extend, so your site can grow with your business.',
        },
      },
    ],
  },
  {
    slug: 'is-mijn-site-snel',
    categoryId: 'tech',
    order: 2,
    updated: '2026-07-08',
    keywords: ['snelle website', 'core web vitals', 'laadtijd website'],
    related: ['welke-technologie', 'is-mijn-site-veilig', 'hoe-scoort-mijn-site-google'],
    question: {
      nl: 'Wordt mijn site snel en goed voor mobiel?',
      en: 'Will my site be fast and mobile-friendly?',
    },
    answer: {
      nl: 'Ja. Snelheid en mobiel-first zijn geen extra\'s maar het uitgangspunt. We optimaliseren beelden, code en laadtijd voor elk scherm.',
      en: 'Yes. Speed and mobile-first are not extras but the starting point. We optimise images, code and load time for every screen.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Trage sites kosten bezoekers en ranking. Daarom letten we vanaf de eerste regel code op performance: geoptimaliseerde beelden, slim laden en zo min mogelijk overbodige code.',
          en: 'Slow sites cost visitors and ranking. That is why we watch performance from the first line of code: optimised images, smart loading and as little unnecessary code as possible.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'Het resultaat merk je in de Core Web Vitals van Google en, belangrijker, in hoe soepel je site aanvoelt op telefoon en desktop.',
          en: 'You notice the result in Google\'s Core Web Vitals and, more importantly, in how smoothly your site feels on phone and desktop.',
        },
      },
    ],
  },
  {
    slug: 'is-mijn-site-veilig',
    categoryId: 'tech',
    order: 3,
    updated: '2026-07-08',
    keywords: ['veilige website', 'ssl https', 'website beveiliging'],
    related: ['is-mijn-site-snel', 'hosting-bij-cpwd', 'wat-valt-onder-onderhoud'],
    question: {
      nl: 'Hoe zit het met beveiliging en privacy?',
      en: 'What about security and privacy?',
    },
    answer: {
      nl: 'Je site draait standaard op HTTPS met actuele beveiliging. We bouwen privacybewust en houden rekening met de AVG.',
      en: 'Your site runs on HTTPS with up-to-date security by default. We build with privacy in mind and account for GDPR.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Beveiliging begint bij een solide basis: een versleutelde verbinding, veilige hosting en code zonder bekende lekken. Verwerk je persoonsgegevens, dan zorgen we dat dat netjes en AVG-proof gebeurt.',
          en: 'Security starts with a solid foundation: an encrypted connection, secure hosting and code without known vulnerabilities. If you process personal data, we make sure it is handled properly and GDPR-compliant.',
        },
      },
    ],
  },
  {
    slug: 'kan-ik-zelf-content-beheren',
    categoryId: 'tech',
    order: 4,
    updated: '2026-07-08',
    keywords: ['cms website', 'zelf content beheren', 'website zelf aanpassen'],
    related: ['welke-technologie', 'wat-valt-onder-onderhoud'],
    question: {
      nl: 'Kan ik zelf teksten en content aanpassen?',
      en: 'Can I edit content and copy myself?',
    },
    answer: {
      nl: 'Als je dat wilt, bouwen we een gebruiksvriendelijk CMS in, zodat je zelf teksten, beelden en pagina\'s beheert zonder technische kennis.',
      en: 'If you want, we build in a user-friendly CMS, so you manage copy, images and pages yourself without technical knowledge.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Niet elke site heeft een CMS nodig, maar wil je zelf kunnen publiceren, dan richten we dat overzichtelijk in. We leggen uit hoe het werkt, zodat je meteen zelfstandig aan de slag kunt.',
          en: 'Not every site needs a CMS, but if you want to publish yourself, we set it up clearly. We explain how it works, so you can get going independently right away.',
        },
      },
    ],
  },
  {
    slug: 'hosting-bij-cpwd',
    categoryId: 'tech',
    order: 5,
    updated: '2026-07-08',
    keywords: ['hosting website', 'website laten hosten', 'cloud hosting nederland'],
    related: ['wat-kost-onderhoud', 'is-mijn-site-veilig', 'wat-valt-onder-onderhoud'],
    question: {
      nl: 'Verzorgen jullie ook de hosting?',
      en: 'Do you also handle hosting?',
    },
    answer: {
      nl: 'Ja. We hosten je site op snelle, betrouwbare cloud-infrastructuur en regelen domein, certificaten en back-ups. Je hoeft je nergens zorgen over te maken.',
      en: 'Yes. We host your site on fast, reliable cloud infrastructure and arrange domain, certificates and backups. You do not need to worry about a thing.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Onze hosting is wereldwijd snel en schaalt mee met je bezoekersaantallen. Wil je liever je eigen hosting gebruiken? Ook dat kan, dan zorgen we voor een nette overdracht.',
          en: 'Our hosting is fast worldwide and scales with your visitor numbers. Prefer to use your own hosting? That is possible too, in which case we arrange a clean handover.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------
  // SEO
  // ---------------------------------------------------------------
  {
    slug: 'hoe-scoort-mijn-site-google',
    categoryId: 'seo',
    order: 1,
    updated: '2026-07-08',
    keywords: ['seo website', 'hoger in google', 'vindbaarheid website'],
    related: ['wat-is-seo-standaard', 'gevonden-worden-ai', 'is-mijn-site-snel'],
    question: {
      nl: 'Wordt mijn site goed gevonden in Google?',
      en: 'Will my site be found well in Google?',
    },
    answer: {
      nl: 'We bouwen elke site met een sterke SEO-basis: snelle laadtijd, nette structuur, meta-tags en structured data. Zo geef je Google alles om je goed te ranken.',
      en: 'We build every site with a strong SEO foundation: fast load time, clean structure, meta tags and structured data. That gives Google everything it needs to rank you well.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Goede vindbaarheid begint technisch: een snelle, mobielvriendelijke site met een logische structuur die zoekmachines makkelijk kunnen lezen. Die basis leveren we standaard mee.',
          en: 'Good visibility starts technically: a fast, mobile-friendly site with a logical structure that search engines can read easily. We include that foundation by default.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'SEO is deels een kwestie van *blijven verbeteren*: relevante content, goede zoekwoorden en autoriteit opbouwen. We adviseren je graag over die volgende stappen.',
          en: 'SEO is partly a matter of *continuous improvement*: relevant content, good keywords and building authority. We are happy to advise you on those next steps.',
        },
      },
    ],
  },
  {
    slug: 'wat-is-seo-standaard',
    categoryId: 'seo',
    order: 2,
    updated: '2026-07-08',
    keywords: ['seo inbegrepen', 'technische seo', 'sitemap meta tags'],
    related: ['hoe-scoort-mijn-site-google', 'gevonden-worden-ai'],
    question: {
      nl: 'Welke SEO zit standaard inbegrepen?',
      en: 'What SEO is included by default?',
    },
    answer: {
      nl: 'Elke site krijgt technische SEO als basis: titels, meta-omschrijvingen, Open Graph, structured data, een sitemap en een robots.txt, plus snelle, mobiele pagina\'s.',
      en: 'Every site gets technical SEO as a foundation: titles, meta descriptions, Open Graph, structured data, a sitemap and a robots.txt, plus fast, mobile pages.',
    },
    body: [
      {
        type: 'list',
        content: {
          nl: [
            'Unieke titels en meta-omschrijvingen per pagina',
            'Open Graph en social preview-afbeeldingen',
            'Structured data (schema.org) voor rijke resultaten',
            'Automatische sitemap.xml en robots.txt',
            'Snelle laadtijd en mobiel-first opbouw',
          ],
          en: [
            'Unique titles and meta descriptions per page',
            'Open Graph and social preview images',
            'Structured data (schema.org) for rich results',
            'Automatic sitemap.xml and robots.txt',
            'Fast load time and mobile-first build',
          ],
        },
      },
    ],
  },
  {
    slug: 'gevonden-worden-ai',
    categoryId: 'seo',
    order: 3,
    updated: '2026-07-08',
    keywords: ['ai zoekmachines', 'chatgpt vindbaarheid', 'geo generative engine optimization'],
    related: ['wat-is-seo-standaard', 'hoe-scoort-mijn-site-google'],
    question: {
      nl: 'Word ik ook gevonden door AI-zoekmachines zoals ChatGPT?',
      en: 'Will I also be found by AI search engines like ChatGPT?',
    },
    answer: {
      nl: 'Daar houden we rekening mee. Met heldere content en structured data maken we je site leesbaar voor AI-antwoordmachines, niet alleen voor Google.',
      en: 'We take that into account. With clear content and structured data we make your site readable for AI answer engines, not just Google.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'AI-zoekmachines halen antwoorden uit goed gestructureerde, betrouwbare content. Door je informatie logisch op te bouwen en te voorzien van structured data vergroot je de kans dat jouw site als bron wordt gebruikt.',
          en: 'AI search engines pull answers from well-structured, trustworthy content. By building your information logically and adding structured data, you increase the chance that your site is used as a source.',
        },
      },
      {
        type: 'paragraph',
        content: {
          nl: 'Een kennisbank zoals deze is daar een goed voorbeeld van: duidelijke vragen en antwoorden die machines makkelijk kunnen begrijpen.',
          en: 'A knowledge base like this one is a good example: clear questions and answers that machines can understand easily.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------
  // SUPPORT
  // ---------------------------------------------------------------
  {
    slug: 'wat-valt-onder-onderhoud',
    categoryId: 'support',
    order: 1,
    updated: '2026-07-08',
    keywords: ['website onderhoud', 'updates website', 'onderhoudscontract'],
    related: ['wat-kost-onderhoud', 'wie-is-eigenaar', 'kan-ik-later-uitbreiden'],
    question: {
      nl: 'Wat valt er onder onderhoud na livegang?',
      en: 'What does maintenance cover after launch?',
    },
    answer: {
      nl: 'Onderhoud omvat updates, beveiliging, back-ups en kleine aanpassingen, zodat je site veilig, snel en up-to-date blijft.',
      en: 'Maintenance covers updates, security, backups and small tweaks, keeping your site secure, fast and up to date.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Een website is nooit helemaal af. Techniek verandert en zoekmachines stellen nieuwe eisen. Met onderhoud houden we alles bij en lossen we problemen op voordat jij er last van hebt.',
          en: 'A website is never entirely finished. Technology changes and search engines set new requirements. With maintenance we keep everything current and solve issues before they affect you.',
        },
      },
      {
        type: 'list',
        content: {
          nl: [
            'Technische updates en beveiliging',
            'Regelmatige back-ups',
            'Monitoring van snelheid en beschikbaarheid',
            'Kleine tekst- en beeldwijzigingen',
          ],
          en: [
            'Technical updates and security',
            'Regular backups',
            'Monitoring of speed and uptime',
            'Small text and image changes',
          ],
        },
      },
    ],
  },
  {
    slug: 'wie-is-eigenaar',
    categoryId: 'support',
    order: 2,
    updated: '2026-07-08',
    keywords: ['eigenaar website', 'wie bezit de code', 'website overdracht'],
    related: ['wat-valt-onder-onderhoud', 'kan-ik-later-uitbreiden'],
    question: {
      nl: 'Van wie is de website en de code?',
      en: 'Who owns the website and the code?',
    },
    answer: {
      nl: 'De website is van jou. Na volledige betaling is het eindresultaat jouw eigendom en zit je nergens onnodig aan vast.',
      en: 'The website is yours. After full payment the end result is your property and you are not unnecessarily tied to anything.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'We geloven niet in gijzelconstructies. Je betaalt voor een site en die is daarna van jou. Wil je later met een andere partij verder? Dan werken we mee aan een nette overdracht.',
          en: 'We do not believe in lock-in constructions. You pay for a site and afterwards it is yours. Want to continue with another party later? We cooperate with a clean handover.',
        },
      },
    ],
  },
  {
    slug: 'kan-ik-later-uitbreiden',
    categoryId: 'support',
    order: 3,
    updated: '2026-07-08',
    keywords: ['website uitbreiden', 'doorontwikkelen', 'nieuwe functies toevoegen'],
    related: ['wat-valt-onder-onderhoud', 'wie-is-eigenaar', 'welke-technologie'],
    question: {
      nl: 'Kan ik mijn site later uitbreiden of doorontwikkelen?',
      en: 'Can I expand or develop my site later?',
    },
    answer: {
      nl: 'Zeker. We bouwen schaalbaar, zodat je later eenvoudig pagina\'s, functies of hele secties kunt toevoegen zonder opnieuw te beginnen.',
      en: 'Absolutely. We build for scale, so you can easily add pages, features or entire sections later without starting over.',
    },
    body: [
      {
        type: 'paragraph',
        content: {
          nl: 'Je site groeit mee met je bedrijf. Door vanaf het begin een nette, uitbreidbare structuur te kiezen, is doorontwikkelen later sneller en goedkoper.',
          en: 'Your site grows with your business. By choosing a clean, extensible structure from the start, further development is faster and cheaper later.',
        },
      },
    ],
  },
]

export function getArticleBySlug(slug: string): KnowledgeArticle | undefined {
  return knowledgeArticles.find(article => article.slug === slug)
}

export function getArticlesByCategory(categoryId: string): KnowledgeArticle[] {
  return knowledgeArticles
    .filter(article => article.categoryId === categoryId)
    .sort((a, b) => a.order - b.order)
}

export function getCategoryById(id: string): KnowledgeCategory | undefined {
  return knowledgeCategories.find(category => category.id === id)
}

export function getRelatedArticles(slug: string): KnowledgeArticle[] {
  const article = getArticleBySlug(slug)
  if (!article) return []
  return article.related
    .map(relatedSlug => getArticleBySlug(relatedSlug))
    .filter((item): item is KnowledgeArticle => Boolean(item))
}

export function getAllArticleSlugs(): string[] {
  return knowledgeArticles.map(article => article.slug)
}

export const sortedKnowledgeCategories = [...knowledgeCategories].sort((a, b) => a.order - b.order)
