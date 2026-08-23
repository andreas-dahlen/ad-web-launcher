import { Linter } from 'eslint'
const config: Linter.Config = {
  files: ['src/**/*.{ts,tsx}'],

  rules: {
    'boundaries/dependencies': ['error',
      {
        default: 'disallow',
        // ----------------------------------
        // BASE
        // ----------------------------------
        policies: [
          {
            from: { element: { type: "*" } },
            allow: {
              to: [
                {
                  element: { type: 'shared', captured: { mod: "types" } },
                  file: { categories: "types" }
                },
                { element: { type: 'shared', captured: { mod: "assertions" } } },
                { element: { type: 'config' } },
                { element: { type: 'api' } },
                { module: { origin: 'external' } }
              ]
            }
          },
          // ----------------------------------
          // APP
          // ----------------------------------

          {
            from: { element: { type: "app", captured: { mod: "*" } } },
            allow: { to: { element: { type: "panels" } } }
          },
          {
            from: { element: { type: "app", captured: { mod: "layers" } } },
            allow: {
              to: [
                { element: { type: "app", captured: { mod: "scenes" } } },
                { element: { type: "primitives", captured: { mod: "Carousel" } } },
                { element: { type: "features" } },
              ]
            }
          },
          {
            from: [
              { element: { type: "app", captured: { mod: "scenes" } } },
              { element: { type: "app", captured: { mod: "layers" } } },
              { element: { type: "app", captured: { mod: "infrastructure" } } },
            ],
            allow: { to: { element: { type: "shared", captured: { mod: "state" } } } }
          },
          {
            from: { file: { categories: "app-entry" } },
            allow: {
              to: [
                { element: { type: "shared" } },
                { element: { type: "config" } },
                { element: { type: "data" } },
                { element: { type: "api" } },
                { element: { type: "app", captured: { mod: "layers" } } },
                { element: { type: "app", captured: { mod: "infrastructure" } } },
                { file: { categories: "app-entry" } }
              ]
            }
          },
          // ----------------------------------
          // BLOCKS
          // ----------------------------------
          {
            from: { element: { type: "blocks" } },
            allow: {
              to: [
                { element: { type: "composites", captured: { mod: "types" } } },
                { element: { type: "shared", captured: { mod: "sxCompiler" } } },
                { element: { type: "styleTokens", captured: { mod: "generated" } } }
              ]
            }
          },
          // ----------------------------------
          // COMPOSITES
          // ----------------------------------
          {
            from: { element: { type: "composites", captured: { mod: "*" } } },
            allow: {
              to: [
                { element: { type: "composites", captured: { mod: "types" } } },
                { element: { type: "composites", captured: { mod: "hooks" } } },
                { element: { type: "primitives", captured: { mod: "*" } } },
                { element: { type: "blocks" } },
                { element: { type: "data", captured: { mod: "generators" } } },
                { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
              ]
            }
          },
          {
            from: { element: { type: "composites", captured: { mod: "types" } }, files: { categories: "types" } },
            allow: { to: { element: { type: "styleTokens", captured: { mod: "generated" } } } }
          },
          // ----------------------------------
          // DATA
          // ----------------------------------
          {
            from: { element: { type: "data", captured: { mod: "external" } } },
            allow: { to: { element: { type: "data", captured: { mod: "icons" } } }, }
          },
          {
            from: { element: { type: "data", captured: { mod: "generators" } } },
            allow: {
              to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
            }
          },
          // ----------------------------------
          // FEATURES
          // ----------------------------------
          {
            from: { element: { type: "features" } },
            allow: {
              to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
            }
          },
          // ----------------------------------
          // INTERACTION
          // ----------------------------------
          {
            from: { element: { type: "interaction", captured: { mod: "*" } } },
            allow: {
              to: [
                { element: { type: "interaction", captured: { mod: "types" } } },
                { element: { type: "interaction", captured: { mod: "assertions" } } }
              ]
            }
          },

          {
            from: { element: { type: "interaction", captured: { mod: "solvers" } } },
            allow: { to: { element: { type: "interaction", captured: { mod: "{{from.element.captured.mod}}" } } } }
          },

          {
            from: { element: { type: "interaction", captured: { mod: "adapter" } } },
            allow: { to: { file: { categories: "pipeline" } } }
          },

          {
            from: { file: { categories: "buildDesc" } },
            allow: {
              to: [
                { element: { type: "primitives" } },
                { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
              ]
            }
          },
          {
            from: { file: { categories: "gestureUtils" } },
            allow: { to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } } }
          },
          {
            from: {
              element: { type: "interaction", captured: { mod: "runtime" } },
              file: { categories: "solverRouter" }
            },
            allow: { to: { element: { type: "interaction", captured: { mod: "solvers" } } }, }
          },
          {
            from: {
              element: { type: "interaction", captured: { mod: "runtime" } },
              file: { categories: "pipeline" }
            },
            allow: {
              to: [
                { element: { type: "interaction", captured: { mod: "input" } } },
                { element: { type: "interaction", captured: { mod: "updater" } } },
                { element: { type: "interaction", captured: { mod: "adapter" } } },
                { element: { type: "primitives" } },
                { element: { type: "shared", captured: { mod: "state" } } }
              ]
            }
          },
          // ----------------------------------
          // PANELS
          // ----------------------------------
          {
            from: { element: { type: "panels", captured: { mod: "*" } } },
            allow: {
              to: [
                { element: { type: "panels", captured: { mod: "{{from.element.captured.mod}}" } } },
                { element: { type: "composites" } },
                { element: { type: "blocks" } },
                { element: { type: "data", captured: { mod: "icons" } } },
                { element: { type: "data", captured: { mod: "generators" } } },
                { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
              ]
            }
          },
          // ----------------------------------
          // PRIMITIVES
          // ----------------------------------
          {
            from: { element: { type: "primitives", captured: { mod: "*" } } },
            allow: {
              to: [
                { element: { type: "primitives", captured: { mod: "{{from.element.captured.mod}}" } } },
                { element: { type: "primitives", captured: { mod: "types" } } },
                {
                  element: { type: "interaction", captured: { mod: "types" } },
                  file: { categories: "types" }
                },
                { element: { type: "interaction", captured: { mod: "adapter" } } },
                { element: { type: "composites", captured: { mod: "styleVars" } } },
                { element: { type: "shared", captured: { mod: "sxCompiler" } } },
                { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } },
                { element: { type: "styleTokens", captured: { mod: "generated" } } }
              ]
            }
          },

          {
            from: { element: { type: "primitives", captured: { mod: "types" } }, file: { categories: "types" } },
            allow: { to: { element: { type: "styleTokens", captured: { mod: "generated" } } } }
          },
          // ----------------------------------
          // SHARED
          // ----------------------------------
          {
            from: { element: { type: "shared", captured: { mod: "*" } } },
            allow: {
              to: [
                { file: { categories: "types" } },
                { element: { type: "shared", captured: { mod: "{{from.element.captured.mod}}" } } }
              ]
            }
          },
          {
            from: { element: { type: "shared", captured: { mod: "sxCompiler" } } },
            allow: { to: { element: { type: "shared", captured: { mod: "tokenUtils" } } } }
          },
          // ----------------------------------
          // styleTokens
          // ----------------------------------

          {
            from: { element: { type: "styleTokens", captured: { mod: "*" } } },
            allow: { to: { file: { categories: "types" } } }
          },

          {
            from: { element: { type: "styleTokens", captured: { mod: "generated" } } },
            allow: {
              to: [
                { element: { type: "shared", captured: { mod: "tokenUtils" } }, file: { categories: "types" } },
                { element: { type: "blocks" } },
                { element: { type: "primitives", captured: { mod: "*" } } },

              ]
            }
          },

          // // ----------------------------------
          // // FILES
          // // ----------------------------------
          {
            from: { file: { categories: "stores" } },
            allow: {
              to: { element: { type: "data", captured: { mod: "generators" } } }
            }
          },
          {
            from: { file: { categories: "types" } },
            allow: {
              to: [
                { element: { captured: { mod: "{{from.element.captured.mod}}" } } },
                { file: { categories: "types" } }
              ]
            }
          }
        ]
      }
    ]
  }
}

export default config