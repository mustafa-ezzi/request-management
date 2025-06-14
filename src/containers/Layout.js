import React, { useContext, Suspense, useEffect, lazy } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import routes from '../routes'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import ThemedSuspense from '../components/ThemedSuspense'
import { SidebarContext } from '../context/SidebarContext'

const Page404 = lazy(() => import('../pages/404'))
const Distribution = lazy(() => import('../pages/Distribution'))
const CounterPacking = lazy(() => import('../pages/CounterPacking'))
const LeftOverDegs = lazy(() => import('../pages/LeftOverDegs'))
const MiqaatAttendance = lazy(() => import('../pages/MiqaatAttendance'))
const MiqaatMenu = lazy(() => import('../pages/MiqaatMenu'))
const EditMiqaatForm = lazy(() => import('../pages/EditMiqaatForm'))
const MiqaatForms = lazy(() => import('../pages/MiqaatForms'))

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  let location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location])

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {routes.map((route, i) => {
                return route.component ? (
                  <Route
                    key={i}
                    exact={true}
                    path={`/app${route.path}`}
                    render={(props) => <route.component {...props} />}
                  />
                ) : null
              })}
              <Route
                path="/app/distribution/:id"
                component={Distribution}
              />
              <Route
                path="/app/leftover-degs/:id"
                component={LeftOverDegs}
              />
              <Route
                path="/app/counter-packing/:id"
                component={CounterPacking}
              />
              <Route
                path="/app/miqaat-attendance/:id"
                component={MiqaatAttendance}
              />
              <Route
                path="/app/miqaat-menu/:id"
                component={MiqaatMenu}
              />
              <Route path="/app/edit-miqaat/:id"
                component={EditMiqaatForm}
              />
              <Route path="/app/forms/"
                component={MiqaatForms}
              />
         

              <Redirect exact from="/app" to="app/event/miqaat-home" />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
      </div>
    </div>
  )
}

export default Layout
