module.exports = {
  siteUrl: process.env.SITE_URL || 'https://danelrahmani.com',
  generateRobotsTxt: true,
  autoLastmod: false,
  generateIndexSitemap: false,
  changefreq: null,
  priority: null,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
