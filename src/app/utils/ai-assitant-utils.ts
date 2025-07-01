type TokenTree = Record<string, any>;

export function flattenTokens(
  obj: TokenTree,
  prefix = "",
  map: Record<string, any> = {}
) {
  for (const key in obj) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && "value" in val) {
      map[path] = val.value;
    } else if (typeof val === "object") {
      flattenTokens(val, path, map);
    }
  }
  return map;
}

export function createResolver(primitives: TokenTree, semantics: TokenTree) {
  const flatPrimitives = flattenTokens(primitives);
  const flatSemantics = flattenTokens(semantics);
  const flatMap = { ...flatPrimitives, ...flatSemantics };

  const resolve = (value: any): any =>
    typeof value === "string" && /^\{.+\}$/.test(value)
      ? resolve(flatMap[value.slice(1, -1)] ?? value)
      : value;

  return resolve;
}

export function mapPalette(primitives: any, semantics: any) {
  const resolve = createResolver(primitives, semantics);

  return {
    primary: { main: resolve(semantics.brand.primary.value) },
    secondary: { main: resolve(semantics.brand.secondary.value) },
    success: { main: resolve(semantics.feedback.success.value) },
    warning: { main: resolve(semantics.feedback.warning.value) },
    error: { main: resolve(semantics.feedback.error.value) },
    info: { main: resolve(semantics.brand.secondary.value) },
    background: {
      default: resolve(semantics.background.primary.value),
      paper: resolve(semantics.background.secondary.value),
    },
    text: {
      primary: resolve(semantics.foreground.primary.value),
      secondary: resolve(semantics.foreground.secondary.value),
      disabled: resolve(semantics.foreground.disabled.value),
    },
    divider: resolve(semantics.border.primary.value),
  };
}

export function transformTheme(primitives: any, semantics: any) {
  return {
    palette: mapPalette(primitives, semantics.color),
    breakpoints: {
      values: {
        xs: Number(semantics.breakpoint.xs.value),
        sm: Number(semantics.breakpoint.sm.value),
        md: Number(semantics.breakpoint.md.value),
        lg: Number(semantics.breakpoint.lg.value),
        xl: Number(semantics.breakpoint.xl.value),
      },
    },
    shape: {
      borderRadius: Number(semantics.border.radius.md.value),
    },
  };
}
