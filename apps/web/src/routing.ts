export const ARCHIVE_PATH = '/archive';
export const HOW_IT_WORKS_PATH = '/how-it-works';
export const DASHBOARD_PATH = '/dashboard';
export const RIVER_SHIFT_PATH = '/river-shift';
export const FIND_DISPLACEMENT_PATH = '/find-displacement';
export const FIND_DISPLACEMENT_RESULTS_PATH = '/find-displacement/results';
export const FIND_DISPLACEMENT_OUTPUTS_PATH = '/find-displacement/view-results';
export const FIND_DISPLACEMENT_DISPLACEMENT_PATH = '/find-displacement/displacements';
export const KNOWN_PLACE_SETUP_PATH = '/known-place-analysis';
export const KNOWN_PLACE_ANALYSIS_PATH = '/known-place-analysis/analysis';

export function isDashboardRoute(pathname: string): boolean {
  return normalizePathname(pathname) === DASHBOARD_PATH;
}

export function isRiverShiftRoute(pathname: string): boolean {
  return normalizePathname(pathname) === RIVER_SHIFT_PATH;
}

export function isArchiveRoute(pathname: string): boolean {
  return normalizePathname(pathname) === ARCHIVE_PATH;
}

export function isHowItWorksRoute(pathname: string): boolean {
  return normalizePathname(pathname) === HOW_IT_WORKS_PATH;
}

export function isLandslideDisplacementRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === FIND_DISPLACEMENT_DISPLACEMENT_PATH;
}

export function isLandslideKnownPlaceSetupRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === KNOWN_PLACE_SETUP_PATH;
}

export function isLandslideKnownPlaceSetupAnalysisRoute(pathname: string): boolean {
  return normalizePathname(pathname) === KNOWN_PLACE_ANALYSIS_PATH;
}

export function isLandslideKnownPlaceAnalysisRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === KNOWN_PLACE_ANALYSIS_PATH;
}

export function normalizePathname(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0];
  return pathOnly || '/';
}

export function isLandslideRoute(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname === FIND_DISPLACEMENT_PATH
    || normalizedPathname.startsWith(`${FIND_DISPLACEMENT_PATH}/`)
    || normalizedPathname === KNOWN_PLACE_SETUP_PATH
    || normalizedPathname === KNOWN_PLACE_ANALYSIS_PATH;
}

export function isLandslideResultsRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === FIND_DISPLACEMENT_RESULTS_PATH;
}

export function isLandslideResultViewsRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === FIND_DISPLACEMENT_OUTPUTS_PATH
    || normalizedPath.startsWith(`${FIND_DISPLACEMENT_OUTPUTS_PATH}/`);
}

export function navigatePath(
  nextPath: string,
  currentPath: string,
  pushState: (state: unknown, unused: string, url?: string | URL | null) => void,
): string {
  const normalizedPath = normalizePathname(nextPath);
  if (normalizePathname(currentPath) !== normalizedPath) {
    pushState({}, '', normalizedPath);
  }
  return normalizedPath;
}
