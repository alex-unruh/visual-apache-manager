const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/sites', component: () => import('pages/SitesPage.vue') },
      { path: '/modules', component: () => import('pages/ModulesPage.vue') },
      { path: '/php-versions', component: () => import('pages/PhpVersionsPage.vue') },
      { path: '/php-extensions', component: () => import('pages/PhpExtensionsPage.vue') },
      { path: '/virtual-hosts', component: () => import('pages/VirtualHostsPage.vue') },
      { path: '/logs', component: () => import('pages/LogsPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
