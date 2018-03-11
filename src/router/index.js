import Vue from 'vue'
import Router from 'vue-router'

import UserIndex from '@/components/resource/user/Index'
import UserNew from '@/components/resource/user/New'
import UserShow from '@/components/resource/user/Show'
import RoleIndex from '@/components/resource/role/Index'
import RoleNew from '@/components/resource/role/New'

import Login from '@/components/Login'
import AccountConfirmation from '@/components/AccountConfirmation'
import ApplicationPanel from '@/components/ApplicationPanel'

import Dashboard from '@/components/dashboard/Dashboard'
import RealTime from '@/components/dashboard/RealTime'
import EndpointHistory from '@/components/dashboard/EndpointHistory'
import Incidents from '@/components/dashboard/Incidents'

import store from '@/store'

Vue.use(Router)

const router = new Router({
  // TODO configure nginx to handle history mode: matching url fallback
  // mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/dashboard/real_time'
    },
    {
      path: '/account/confirm',
      name: 'account-confirmation',
      component: AccountConfirmation
    },
    {
      path: '/login',
      name: 'login',
      beforeEnter: (to, from, next) => {
        if (!store.getters['auth/unknownUser']) next({ name: 'application-panel' })
        else next()
      },
      component: Login
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: (to, from, next) => {
        store.dispatch('auth/logout')
          .then(() => next({ name: 'login' }))
      }
    },
    {
      path: '/admin',
      name: 'application-panel',
      component: ApplicationPanel,
      children: [
        // Alias URL for clients. With path beginning with '/' it will be
        // treated as a root path, but the component is still nested under
        // the main ApplicationPanel
        {
          path: '/me',
          name: 'client-view',
          component: UserShow
        },
        {
          path: 'users',
          name: 'users',
          meta: { requiresAdmin: true },
          component: UserIndex
        },
        {
          path: 'roles',
          name: 'roles',
          meta: { requiresAdmin: true },
          component: RoleIndex
        },
        {
          path: 'roles/new',
          name: 'roleNew',
          meta: { requiresAdmin: true },
          component: RoleNew
        },
        {
          path: 'users/new',
          name: 'userNew',
          meta: { requiresAdmin: true },
          component: UserNew
        },
        {
          path: 'users/:userId',
          name: 'userShow',
          props: true,
          meta: { requiresAdmin: true },
          component: UserShow
        }
      ]
    },
    {
      path: '/dashboard',
      component: Dashboard,
      redirect: '/dashboard/real_time',
      children: [
        {
          path: 'real_time',
          name: 'real_time',
          component: RealTime
        },
        {
          path: 'endpoints_history',
          name: 'endpoints_history',
          component: EndpointHistory
        },
        {
          path: 'incidents',
          name: 'incidents',
          component: Incidents
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  /* eslint-disable */

  // the targeted route requires administrator access
  if (to.matched.some(route => route.meta.requiresAdmin))
  {
    if (store.getters['auth/isAdmin']) next() // proceed navigation
    else next({ name: 'application-panel' }) // redirect to main route
  }

  // the required route is a child of application root
  else if (to.matched.some(route => (route.name === 'application-panel')))
  {
    // redirect unauthenticated user to the login page
    if (store.getters['auth/unknownUser']) next({ name: 'login' })

    // this allow the ApplicationPanel component, the root component for
    // the application, to behave like as a proxy : it knows the different
    // home routes for a client and an administrator user and it redirects
    // accordindly. The block is executed when the interface's actions
    // redirect to /admin (named 'application-panel')
    // It also automatically redirects a client trying to navigate to
    // /admin/users for instance
    else if (to.name === 'application-panel')
    {
      // redirect administrator or client to their default home
      const defaultRoute = (store.getters['auth/isAdmin']) ? 'users' : 'client-view'
      next({ name: defaultRoute })
    }

    else
    {
      next()
    }
  }

  // default behaviour
  else
  {
    next()
  }

  /* eslint-enable */
})

export default router
