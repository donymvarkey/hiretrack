import { useEffect } from 'react'

const SITE_NAME = 'HireTrack'
const DEFAULT_TITLE = `${SITE_NAME} - Job Application Tracker`
const DEFAULT_DESCRIPTION =
  'Track your job applications, interviews, and follow-ups in one organized place.'
const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://hiretrack.app')
  .replace(/\/$/, '')

function setAttr(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

interface SeoProps {
  /** Page-specific title; combined with the site name. Omit for the default. */
  title?: string
  /** Page-specific description. Falls back to the site default. */
  description?: string
  /** Hide from search engines (use for authenticated, private pages). */
  noindex?: boolean
  /** Canonical path, e.g. "/login". Defaults to the current pathname. */
  path?: string
}

/**
 * Keeps the document title and key meta tags in sync as the user navigates.
 * Updates the tags that already exist in index.html (rather than appending
 * duplicates), so crawlers still get sensible static defaults with no JS.
 */
export function Seo({ title, description, noindex = false, path }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION
    const url = SITE_URL + (path ?? window.location.pathname)

    document.title = fullTitle

    setAttr('meta[name="description"]', 'content', desc)
    setAttr('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    setAttr('meta[name="googlebot"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    setAttr('link[rel="canonical"]', 'href', url)

    setAttr('meta[property="og:title"]', 'content', fullTitle)
    setAttr('meta[property="og:description"]', 'content', desc)
    setAttr('meta[property="og:url"]', 'content', url)
    setAttr('meta[name="twitter:title"]', 'content', fullTitle)
    setAttr('meta[name="twitter:description"]', 'content', desc)

    return () => {
      // Restore indexable defaults so a private page doesn't leave the whole
      // document marked noindex after navigating away.
      setAttr('meta[name="robots"]', 'content', 'index, follow')
      setAttr('meta[name="googlebot"]', 'content', 'index, follow')
    }
  }, [title, description, noindex, path])

  return null
}
