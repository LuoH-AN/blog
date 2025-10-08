import type { BundledLanguage, CodeToHastOptions, HighlighterCore, RegexEngine } from 'shiki'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRenderWhitespace,
} from '@shikijs/transformers'

let promise: Promise<HighlighterCore>
let shiki: HighlighterCore

type CustomTransformerOptions = Array<
  | 'ignoreRenderWhitespace'
  | 'ignoreColorizedBrackets'
>

export const useShikiStore = defineStore('shiki', () => {
  const getOptions = (
    lang: string,
    transformerOptions?: CustomTransformerOptions,
  ): CodeToHastOptions<BundledLanguage, string> => ({
    lang,
    themes: {
      light: 'catppuccin-latte',
      dark: 'one-dark-pro',
    },
    transformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
      transformerNotationFocus(),
      transformerNotationErrorLevel(),
      transformerOptions?.includes('ignoreRenderWhitespace') || ['ansi', 'log', 'text'].includes(lang)
        ? {}
        : transformerRenderWhitespace(),
      transformerMetaHighlight(),
      transformerMetaWordHighlight(),
      transformerOptions?.includes('ignoreColorizedBrackets')
        ? {}
        : transformerColorizedBrackets(),
      {
        root: (hast) => ({
          type: 'root',
          children: (hast.children[0] as any).children[0].children,
        }),
        line(node, line) {
          node.properties['data-line'] = line
        },
      },
    ],
  })

  async function load() {
    promise ??= loadShiki()
    shiki ??= await promise
    return shiki
  }

  async function loadShiki() {
    const [
      { createHighlighterCore },
      { createJavaScriptRegexEngine },
      catppuccinLatte,
      oneDarkPro,
    ] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine-javascript.mjs'),
      import('shiki/themes/catppuccin-latte.mjs'),
      import('shiki/themes/one-dark-pro.mjs'),
    ])

    let engine: RegexEngine
    try {
      // Test if modern regex is supported (e.g. (?i:...))
      void new RegExp('(?i: )')
      engine = createJavaScriptRegexEngine()
    } catch {
      // Fallback to Oniguruma with LOCAL WASM
      const { createOnigurumaEngine } = await import('shiki/engine-oniguruma.mjs')
      const wasm = await import('shiki/wasm') // ✅ LOCAL, not esm.sh!
      engine = await createOnigurumaEngine(wasm)
    }

    return createHighlighterCore({ themes: [catppuccinLatte, oneDarkPro], engine })
  }

  async function loadLang(...langs: string[]) {
    // ✅ Use LOCAL shiki/langs, not esm.sh!
    const { bundledLanguages } = await import('shiki/langs')
    const loadedLangs = shiki.getLoadedLanguages()

    await Promise.all(
      langs
        .filter((lang) => !loadedLangs.includes(lang) && lang in bundledLanguages)
        .map((lang) => bundledLanguages[lang as BundledLanguage])
        .map((dynamicLang) => dynamicLang().then((grammar) => shiki.loadLanguage(grammar))),
    )
  }

  return {
    getOptions,
    load,
    loadLang,
  }
})