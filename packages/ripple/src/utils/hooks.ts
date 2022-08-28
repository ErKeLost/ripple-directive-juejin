import { App } from 'vue'

interface Vue2 {
  default: {
    version: string
  }
}

const isVue3 = (app: Vue2 | App): app is App =>
  'config' in app && 'globalProperties' in app.config

const getHooks = (app: App) => {
  return isVue3(app)
    ? {
      created: 'created',
      mounted: 'mounted',
      updated: 'updated',
      unMounted: 'unmounted'
    }
    : {
      created: 'bind',
      mounted: 'inserted',
      updated: 'updated',
      unMounted: 'unbind'
    }
}

export { getHooks }
