export const templateKeys = {
  detail: (templateSlug: string | undefined) => ['templates', 'detail', templateSlug] as const,
}
