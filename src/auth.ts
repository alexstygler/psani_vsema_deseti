// Use the served document's path, including the repository on GitHub Pages.
// Supabase must also allow this exact URL in Authentication → URL Configuration.
export function authReturnUrl(href: string) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  if (
    url.hostname.endsWith('.github.io') &&
    !url.pathname.endsWith('/') &&
    !url.pathname.split('/').at(-1)!.includes('.')
  )
    url.pathname += '/';
  return url.href;
}

export function hasAuthCallback(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  return (
    url.searchParams.has('code') ||
    url.searchParams.has('token_hash') ||
    url.searchParams.has('error_description') ||
    hash.has('access_token') ||
    hash.has('error_description')
  );
}

export function authLinkError(href: string) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has('error_description') || hash.has('error_description'))
    return 'Potvrzovací odkaz vypršel nebo už byl použit. Zkuste se přihlásit, případně si níže nechte poslat nový odkaz.';
  return '';
}
