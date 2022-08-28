// can export function.  解构参数类型冗余 新定义insterface IRippleDirectiveOptionWithBinding
import {
  DEFAULT_PLUGIN_OPTIONS,
  IRippleDirectiveOptions,
  IRippleDirectiveOptionWithBinding
} from './options'
import { App } from 'vue'
import { ripple } from './v-ripple'
import { getHooks } from './utils/hooks'
const optionMap = new WeakMap<
  HTMLElement,
  Partial<IRippleDirectiveOptions> | false
>()
const globalOptions = { ...DEFAULT_PLUGIN_OPTIONS }
export const rippleDirective = (app: App) => {
  const hooks = getHooks(app)
  app.directive('ripple', {
    [hooks.mounted](
      el: HTMLElement,
      binding: IRippleDirectiveOptionWithBinding
    ) {
      optionMap.set(el, binding.value ?? {})

      el.addEventListener('pointerdown', (event) => {
        const options = optionMap.get(el)
        if (binding.value?.disabled) return
        if (options === false) return
        ripple(event, el, {
          ...globalOptions,
          ...options
        })
      })
    },
    [hooks.updated](
      el: HTMLElement,
      binding: IRippleDirectiveOptionWithBinding
    ) {
      optionMap.set(el, binding.value ?? {})
    }
  })
}
