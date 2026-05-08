<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Falcha Media</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f8f8;
            color: #222;
            min-height: 100vh;
          }
          header {
            background: #111;
            color: #fff;
            padding: 20px 32px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          header h1 {
            font-size: 1.3rem;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          header .badge {
            background: #c0392b;
            color: #fff;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 3px;
            letter-spacing: 0.05em;
          }
          .meta {
            background: #fff;
            border-bottom: 1px solid #e5e5e5;
            padding: 14px 32px;
            font-size: 0.85rem;
            color: #666;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .meta strong { color: #111; }
          main { max-width: 1100px; margin: 32px auto; padding: 0 24px; }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          }
          thead tr { background: #111; color: #fff; }
          thead th {
            padding: 12px 16px;
            text-align: left;
            font-size: 0.78rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          tbody tr { border-bottom: 1px solid #f0f0f0; transition: background 0.1s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #fafafa; }
          tbody td { padding: 11px 16px; font-size: 0.88rem; vertical-align: middle; }
          tbody td a {
            color: #c0392b;
            text-decoration: none;
            word-break: break-all;
          }
          tbody td a:hover { text-decoration: underline; }
          .tag {
            display: inline-block;
            background: #f0f0f0;
            color: #555;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 0.78rem;
            font-weight: 500;
          }
          .sitemap-list { display: flex; flex-direction: column; gap: 12px; }
          .sitemap-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .sitemap-card a { color: #c0392b; text-decoration: none; font-weight: 500; word-break: break-all; }
          .sitemap-card a:hover { text-decoration: underline; }
          .sitemap-card .mod { color: #999; font-size: 0.8rem; }
          footer { text-align: center; padding: 32px 16px; color: #aaa; font-size: 0.8rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>Falcha Media — Sitemap</h1>
          <span class="badge">XML</span>
        </header>
        <div class="meta">
          This is an XML sitemap for search engines.
          <strong><xsl:value-of select="count(//sitemap:url | //sitemap:sitemap)"/></strong> entries listed.
        </div>
        <main>
          <xsl:choose>
            <!-- Sitemap Index -->
            <xsl:when test="//sitemap:sitemapindex">
              <div class="sitemap-list">
                <xsl:for-each select="//sitemap:sitemap">
                  <div class="sitemap-card">
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    <span class="mod"><xsl:value-of select="sitemap:lastmod"/></span>
                  </div>
                </xsl:for-each>
              </div>
            </xsl:when>
            <!-- Regular Sitemap -->
            <xsl:otherwise>
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Last Modified</th>
                    <th>Change Freq</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="//sitemap:url">
                    <tr>
                      <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                      <td><xsl:value-of select="sitemap:lastmod"/></td>
                      <td>
                        <xsl:if test="sitemap:changefreq">
                          <span class="tag"><xsl:value-of select="sitemap:changefreq"/></span>
                        </xsl:if>
                      </td>
                      <td><xsl:value-of select="sitemap:priority"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>
        <footer>Generated for Falcha Media · XML Sitemap</footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
