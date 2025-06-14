import { lazy } from 'react'

// use lazy for better code splitting, a.k.a. load faster
const MiqaatHome = lazy(() => import('../pages/MiqaatHome'))
// const Member = lazy(() => import('../pages/Batch'))
const Request = lazy(() => import('../pages/Request'))

const Zones = lazy(() => import('../pages/Zone'))
const City = lazy(() => import('../pages/City'))
const Batch = lazy(() => import('../pages/Batch'))


const Containers = lazy(() => import('../pages/Container'))
const UserManagement = lazy(() => import('../pages/Users'))

const Counters = lazy(() => import('../pages/Counter'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))
const Registration = lazy(() => import('../pages/registration'))
const RegistrationHistory = lazy(() => import('../pages/RegistrationsHistory'))


const Page404 = lazy(() => import('../pages/404'))
const Blank = lazy(() => import('../pages/Blank'))

/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: '/event/miqaat-home',
    component: MiqaatHome,
  },
  {
    path: '/city',
    component: City,
  },
  {
  path: '/registration/:miqaat_id',
    component: Registration,
  },
   {
  path: '/miqaat/history',
    component: RegistrationHistory,
  },
  {
    path: '/batch',
    component: Batch,
  },
  {
    path: '/users',
    component: UserManagement,
  },
  {
    path: '/request',
    component: Request,
  },
  {
    path: '/zones',
    component: Zones,
  },
  {
    path: '/containers',
    component: Containers,
  },
  {
    path: '/containers',
    component: Containers,
  },
  {
    path: '/counters',
    component: Counters,
  },
  {
    path: '/modals',
    component: Modals,
  },
  {
    path: '/tables',
    component: Tables,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },

]

export default routes
