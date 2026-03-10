import type { Component } from 'vue'
import { useRoute } from '#imports'
import { Activity, ChartArea, FolderSync, Link } from 'lucide-vue-next'
import { computed } from 'vue'

export interface DashboardRouteConfig {
  readonly paths: readonly string[]
  readonly titleKey: string
  readonly icon: Component
}

export const DASHBOARD_ROUTES = {
  links: {
    paths: ['/dashboard/links'],
    titleKey: 'nav.links',
    icon: Link,
  },
  link: {
    paths: ['/dashboard/link'],
    titleKey: 'nav.links',
    icon: Link,
  },
  analysis: {
    paths: ['/dashboard/analysis'],
    titleKey: 'nav.analysis',
    icon: ChartArea,
  },
  realtime: {
    paths: ['/dashboard/realtime'],
    titleKey: 'nav.realtime',
    icon: Activity,
  },
  migrate: {
    paths: ['/dashboard/migrate'],
    titleKey: 'nav.migrate',
    icon: FolderSync,
  },
} as const satisfies Record<string, DashboardRouteConfig>

export type DashboardRouteName = keyof typeof DASHBOARD_ROUTES

export function useDashboardRoute() {
  const route = useRoute()

  const currentPage = computed<DashboardRouteName | ''>(() => {
    for (const [page, config] of Object.entries(DASHBOARD_ROUTES)) {
      if ((config.paths as readonly string[]).includes(route.path))
        return page as DashboardRouteName
    }
    return ''
  })

  const pageTitle = computed(() => {
    const page = currentPage.value
    return page ? DASHBOARD_ROUTES[page].titleKey : 'dashboard.title'
  })

  const breadcrumbs = computed(() => {
    const route = useRoute()
    const page = currentPage.value
    const items = [
      {
        title: 'dashboard.title',
        url: '/dashboard/links',
      },
    ]

    if (page) {
      items.push({
        title: DASHBOARD_ROUTES[page].titleKey,
        url: '/dashboard/links', // Always point back to the main links list for these categories
      })

      // Add detail level if on single link page
      if (page === 'link' && route.query.slug) {
        items.push({
          title: route.query.slug as string,
          url: route.fullPath,
        })
      }
    }

    return items
  })

  const isActive = (page: DashboardRouteName) => {
    return currentPage.value === page
  }

  return { currentPage, pageTitle, breadcrumbs, isActive }
}
