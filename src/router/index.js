import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import ModeSelect from '../views/ModeSelect.vue'
import Home from '../views/Home.vue'
import LocationQuery from '../views/LocationQuery.vue'
import RouteDetail from '../views/RouteDetail.vue'
import RoutePlan from '../views/RoutePlan.vue'
import PathRecover from '../views/PathRecover.vue'
import TravelHome from '../views/TravelHome.vue'
import TravelCity from '../views/TravelCity.vue'
import TravelSpot from '../views/TravelSpot.vue'
import TravelAI from '../views/TravelAI.vue'
const routes = [
  {
    path: '/',
    component: Login
  },

  {
    path: '/mode-select',
    component: ModeSelect
  },
  {
    path: '/academic',
    component: Home
  },
  {
    path: '/location-query',
    component: LocationQuery
  },
  {
    path: '/route-detail',
    component: RouteDetail
  },
  {
    path: '/route-plan',
    component: RoutePlan
  },
  {
    path: '/path-recover',
    component: PathRecover
  },
  {
    path: '/travel',
    component: TravelHome
  },
  {
  path: '/travel-city',
  component: TravelCity
  },{
  path: '/travel-spot',
  component: TravelSpot
  },
  {
  path: '/travel-ai',
  component: TravelAI
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router