import type { App } from 'vue'
import { rippleDirective } from './src/ripple-directive'

export { rippleDirective }

export default {
  title: 'Ripple 水波纹',
  install(app: App): void {
    rippleDirective(app)
  }
}
