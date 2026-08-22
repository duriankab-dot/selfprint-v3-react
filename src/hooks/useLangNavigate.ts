import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

/**
 * ROUTELOOP-001 FIX (2026-08-22)
 *
 * Every real route in App.tsx is registered under a /en or /th language
 * prefix — there is no bare "/dashboard", "/analysis", "/worlds", etc.
 * route. react-router's navigate('/dashboard') treats a leading "/" as an
 * ABSOLUTE path, so it doesn't match any route, falls through to the
 * catch-all (<Route path="*" element={<Navigate to="/en/" replace />} />),
 * and silently sends the user to the English home page instead of where
 * they meant to go. In two places (HomeRoute's post-login redirect and
 * useRecoveryRoute) this specifically produced an infinite redirect loop
 * (home -> dashboard -> catch-all -> home -> ...), which is what threw
 * Chrome's "Throttling navigation to prevent the browser from hanging"
 * warning and rendered a permanently blank page.
 *
 * This hook is a drop-in replacement for react-router-dom's useNavigate():
 * same call signature, same return type, so existing `navigate('/foo')`
 * call sites don't need to change — only the import. It prefixes any
 * absolute internal path that doesn't already start with /en or /th with
 * the current language (read from the live URL, not from context, so it
 * works even for components rendered above LanguageProvider). Already-
 * prefixed paths, relative paths, external URLs, and object `To` values are
 * passed through untouched.
 */
export function useLangNavigate() {
  const routerNavigate = useNavigate();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        routerNavigate(to);
        return;
      }

      const path = typeof to === 'string' ? to : to.pathname;

      if (
        typeof path === 'string' &&
        path.startsWith('/') &&
        !path.startsWith('/en') &&
        !path.startsWith('/th')
      ) {
        const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
        const prefixedPath = `${langPrefix}${path}`;

        if (typeof to === 'string') {
          routerNavigate(prefixedPath, options);
        } else {
          routerNavigate({ ...to, pathname: prefixedPath }, options);
        }
        return;
      }

      routerNavigate(to as To, options);
    },
    [routerNavigate]
  );
}
