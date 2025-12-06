export default function sitemap() {
  return [
    {
      url: 'https://goldeningressos.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://goldeningressos.com.br/eventos',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Adicione todas as suas páginas aqui
  ]
}
