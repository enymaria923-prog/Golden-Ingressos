export default function sitemap() {
  const baseUrl = 'https://goldeningressos.com.br';
  
  return [
    // Página principal
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Páginas de cidades (eventos por cidade)
    {
      url: `${baseUrl}/cidade/[cidade]`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Páginas de criação de conta
    {
      url: `${baseUrl}/criar-conta`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/criar-conta-produtor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // Página de login
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // Páginas de eventos
    {
      url: `${baseUrl}/evento/[id]`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // MAIS IMPORTANTE - compra de ingressos
    },
    
    // Páginas do produtor
    {
      url: `${baseUrl}/produtor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/produtor/[id]`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Vitrine do produtor
    {
      url: `${baseUrl}/vitrine/[slug]`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Publicar evento
    {
      url: `${baseUrl}/publicar-evento`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    
    // Páginas de perfil
    {
      url: `${baseUrl}/perfil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/meus-ingressos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    
    // ========== PÁGINAS INSTITUCIONAIS/DOCUMENTAÇÃO ==========
    
    // Sobre o marketplace (categorias)
    {
      url: `${baseUrl}/shows`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/teatros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/baladas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stand-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    
    // Páginas informativas
    {
      url: `${baseUrl}/como-vender`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/confianca`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/duvidas-frequentes`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ajuda-produtores`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/fale-conosco`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // Páginas legais
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
