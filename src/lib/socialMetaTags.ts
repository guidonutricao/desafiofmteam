interface SocialMetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  type?: string;
  twitterSite?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function updateSocialMetaTags(options: SocialMetaTagsOptions) {
  const {
    title = 'Shape Express - Desafio Concluído!',
    description = 'Acabei de concluir o desafio de 7 dias! 💪',
    image = '/celebration-og-image.svg',
    url = window.location.href,
    siteName = 'Shape Express',
    locale = 'pt_BR',
    type = 'website',
    twitterSite = '@shapeexpress',
    author = 'Shape Express Team',
    publishedTime,
    modifiedTime,
    section = 'Fitness',
    tags = ['fitness', 'desafio', 'saúde', 'exercícios', 'nutrição', 'shape express']
  } = options;

  // Update document title
  document.title = title;

  // Update or create basic meta tags
  updateMetaTag('description', description);
  updateMetaTag('author', author);
  updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  updateMetaTag('keywords', tags.join(', '));
  updateMetaTag('language', 'pt-BR');
  updateMetaTag('revisit-after', '7 days');
  updateMetaTag('rating', 'general');
  
  // Canonical URL for SEO
  updateLinkTag('canonical', url);
  
  // Open Graph tags for Facebook, LinkedIn, etc.
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:image', getAbsoluteImageUrl(image), 'property');
  updateMetaTag('og:image:alt', `Imagem de celebração do desafio concluído - ${title}`, 'property');
  updateMetaTag('og:image:width', '1200', 'property');
  updateMetaTag('og:image:height', '630', 'property');
  updateMetaTag('og:image:type', 'image/svg+xml', 'property');
  updateMetaTag('og:url', url, 'property');
  updateMetaTag('og:type', type, 'property');
  updateMetaTag('og:site_name', siteName, 'property');
  updateMetaTag('og:locale', locale, 'property');
  updateMetaTag('og:locale:alternate', 'en_US', 'property');
  
  // Additional Open Graph tags for articles
  if (type === 'article') {
    updateMetaTag('og:article:author', author, 'property');
    updateMetaTag('og:article:section', section, 'property');
    if (publishedTime) {
      updateMetaTag('og:article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      updateMetaTag('og:article:modified_time', modifiedTime, 'property');
    }
    // Add article tags
    tags.forEach((tag, index) => {
      updateMetaTag(`og:article:tag`, tag, 'property');
    });
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:site', twitterSite);
  updateMetaTag('twitter:creator', twitterSite);
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', getAbsoluteImageUrl(image));
  updateMetaTag('twitter:image:alt', `Imagem de celebração do desafio concluído - ${title}`);
  updateMetaTag('twitter:domain', window.location.hostname);
  updateMetaTag('twitter:url', url);

  // Additional SEO meta tags
  updateMetaTag('application-name', siteName);
  updateMetaTag('apple-mobile-web-app-title', siteName);
  updateMetaTag('apple-mobile-web-app-capable', 'yes');
  updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
  updateMetaTag('theme-color', '#f59e0b');
  updateMetaTag('msapplication-TileColor', '#f59e0b');
  updateMetaTag('msapplication-navbutton-color', '#f59e0b');
  
  // Additional meta tags for better SEO
  updateMetaTag('format-detection', 'telephone=no');
  updateMetaTag('mobile-web-app-capable', 'yes');
  updateMetaTag('apple-touch-fullscreen', 'yes');
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', href);
}

function getAbsoluteImageUrl(imagePath: string): string {
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative path to absolute URL
  const baseUrl = window.location.origin;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

export function generateCelebrationMetaTags(challengeData: {
  challengeDuration: number;
  totalScore: number;
  patientName: string;
}) {
  const currentUrl = window.location.href;
  const baseTitle = 'Shape Express - Desafio Concluído!';
  const personalizedDescription = `🎉 ${challengeData.patientName} concluiu com sucesso o desafio de ${challengeData.challengeDuration} dias da Shape Express com ${challengeData.totalScore} pontos! Uma jornada incrível de transformação e dedicação. 💪✨`;
  const currentTime = new Date().toISOString();
  
  return {
    title: baseTitle,
    description: personalizedDescription,
    image: '/celebration-og-image.svg',
    url: currentUrl,
    siteName: 'Shape Express',
    locale: 'pt_BR',
    type: 'article', // Changed to article for better social sharing
    author: 'Shape Express Team',
    publishedTime: currentTime,
    modifiedTime: currentTime,
    section: 'Fitness Challenge',
    tags: [
      'fitness',
      'desafio',
      'shape express',
      'saúde',
      'exercícios',
      'nutrição',
      'transformação',
      'dedicação',
      `${challengeData.challengeDuration} dias`,
      'conquista',
      'celebração'
    ]
  };
}

// Function to generate structured data for better SEO
export function addStructuredData(challengeData: {
  challengeDuration: number;
  totalScore: number;
  patientName: string;
}) {
  const currentTime = new Date().toISOString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": window.location.href,
        "url": window.location.href,
        "name": "Shape Express - Desafio Concluído!",
        "description": `${challengeData.patientName} concluiu o desafio de ${challengeData.challengeDuration} dias da Shape Express`,
        "datePublished": currentTime,
        "dateModified": currentTime,
        "inLanguage": "pt-BR",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Shape Express",
          "url": window.location.origin,
          "description": "Aplicação de fitness e nutrição"
        },
        "about": {
          "@type": "Achievement",
          "@id": `${window.location.href}#achievement`,
          "name": `Desafio Shape Express de ${challengeData.challengeDuration} dias concluído`,
          "description": `${challengeData.patientName} completou o desafio de fitness de ${challengeData.challengeDuration} dias com ${challengeData.totalScore} pontos`,
          "achievementType": "Fitness Challenge Completion",
          "dateCompleted": currentTime,
          "isPartOf": {
            "@type": "ExerciseProgram",
            "name": "Shape Express Fitness Challenge",
            "description": "Programa de fitness e nutrição de 7 dias",
            "duration": "P7D",
            "exerciseType": "Fitness Challenge",
            "category": "Health and Fitness"
          },
          "result": {
            "@type": "QuantitativeValue",
            "value": challengeData.totalScore,
            "unitText": "pontos"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Shape Express",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Celebração",
            "item": window.location.href
          }
        ]
      }
    ]
  };

  // Remove existing structured data script if it exists
  const existingScript = document.querySelector('script[type="application/ld+json"][data-celebration]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-celebration', 'true');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

// Function to clean up meta tags when leaving the celebration page
export function cleanupSocialMetaTags() {
  // Reset to default values
  document.title = 'Desafio Shape Express';
  
  // Reset basic meta tags
  updateMetaTag('description', 'Desafio do FM TEAM - Aplicação de fitness e nutrição');
  updateMetaTag('author', 'Fabricio Moura');
  updateMetaTag('keywords', 'fitness, desafio, shape express, saúde, exercícios, nutrição');
  updateMetaTag('robots', 'index, follow');
  
  // Reset Open Graph tags
  updateMetaTag('og:title', 'Desafio Shape Express', 'property');
  updateMetaTag('og:description', 'Desafio do FM TEAM - Aplicação de fitness e nutrição', 'property');
  updateMetaTag('og:image', 'https://lovable.dev/opengraph-image-p98pqg.png', 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:url', window.location.href, 'property');
  
  // Reset Twitter Card tags
  updateMetaTag('twitter:title', 'Desafio Shape Express');
  updateMetaTag('twitter:description', 'Desafio do FM TEAM - Aplicação de fitness e nutrição');
  updateMetaTag('twitter:image', 'https://lovable.dev/opengraph-image-p98pqg.png');
  updateMetaTag('twitter:url', window.location.href);
  
  // Reset canonical URL
  updateLinkTag('canonical', window.location.href);
  
  // Remove celebration-specific meta tags
  const celebrationSpecificTags = [
    'og:article:author',
    'og:article:section', 
    'og:article:published_time',
    'og:article:modified_time',
    'og:article:tag',
    'og:image:type',
    'og:locale:alternate',
    'twitter:domain'
  ];
  
  celebrationSpecificTags.forEach(tag => {
    const elements = document.querySelectorAll(`meta[property="${tag}"], meta[name="${tag}"]`);
    elements.forEach(element => element.remove());
  });
  
  // Remove structured data
  const structuredDataScript = document.querySelector('script[type="application/ld+json"][data-celebration]');
  if (structuredDataScript) {
    structuredDataScript.remove();
  }
}