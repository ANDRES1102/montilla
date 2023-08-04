import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }]
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }]
  },
  {
    path: '/admin/colaboradores',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ColaboradoresPage.vue') }]
  },
  {
    path: '/admin/whatsapp',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/WhatsappPage.vue') }]
  },
  {
    path: '/admin/registro',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegistroPage.vue') }]
  },
  {
    path: '/admin/nuevo',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/CrearMensajesPage.vue') }]
  },
  {
    path: '/colaborador',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegistroPage.vue') }]
  },
  {
    path: '/admin/mensajes',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/MensajesPage.vue') }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
