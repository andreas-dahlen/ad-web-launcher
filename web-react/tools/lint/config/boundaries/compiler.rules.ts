import type { BoundaryRule } from './lint.types'
export const compilerRules: {
  'boundaries/dependencies': BoundaryRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',

      policies: [
        // ----------------------------------
        // styleTokens
        // ----------------------------------

        {
          from: [
            { element: { type: "compiler", captured: { mod: "*" } } },
            { element: { type: "diagnostics", captured: { mod: "*" } } },
            { element: { type: "emitters", captured: { mod: "*" } } },
            { element: { type: "postCss", captured: { mod: "*" } } },
            { element: { type: "tokenTypes" } },
            { element: { type: "utils" } },
            { file: { categories: "emitFiles" } },
            { file: { categories: "processModule" } }
          ],
          allow: {
            to: [
              { element: { type: "tokenTypes" } },
              { element: { type: "shared", captured: { mod: "tokenUtils" } } },
              { element: { type: "utils" } }
            ]
          }
        },
        // //compiler
        {
          from: { element: { type: "compiler", captured: { mod: "discovery" } } },
          allow: { to: { element: { type: "compiler", captured: { mod: "resolvers" } } } }
        },
        {
          from: { element: { type: "compiler", captured: { mod: "pipeline" } } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "builders" } } },
              { element: { type: "compiler", captured: { mod: "resolvers" } } },
              { element: { type: "compiler", captured: { mod: "discovery" } } },
              { element: { type: "compiler", captured: { mod: "processing" } } },
              { element: { type: "compiler", captured: { mod: "tracking" } } }
            ]
          }
        },
        {
          from: { element: { type: "compiler", captured: { mod: "processing" } } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { element: { type: "compiler", captured: { mod: "loaders" } } },
              { element: { type: "compiler", captured: { mod: "resolvers" } } },
            ]
          }
        },
        {
          from: { element: { type: "compiler", captured: { mod: "resolvers" } } },
          allow: {
            to: { element: { type: "compiler", captured: { mod: "tracking" } } }
          }
        },
        {
          from: { file: { categories: "compilerService" } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "discovery" } } },
              { element: { type: "compiler", captured: { mod: "pipeline" } } },
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { element: { type: "compiler", captured: { mod: "processing" } } },
              { file: { categories: "processModule" } },
              { file: { categories: "emitFiles" } },
              { file: { categories: "runDiagnostics" } },
              { element: { type: "tokenTypes" }, file: { categories: "types" } }
            ]
          }
        },
        // //emitters
        {
          from: { element: { type: "emitters", captured: { mod: "extract" } } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "resolvers" } } },
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { element: { type: "emitters", captured: { mod: "extract" } } },
            ]
          }
        },
        {
          from: { element: { type: "emitters", captured: { mod: "generate" } } },
          allow: {
            to: [
              { element: { type: "emitters", captured: { mod: "extract" } } },
              { element: { type: "emitters", captured: { mod: "generate" } } },
            ]
          }
        },
        {
          from: { element: { type: "emitters", captured: { mod: "write" } } },
          allow: {
            to: { element: { type: "emitters", captured: { mod: "generate" } } }
          }
        },
        {
          from: { file: { categories: "emitFiles" } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { element: { type: "emitters", captured: { mod: "extract" } } },
              { element: { type: "emitters", captured: { mod: "generate" } } },
              { element: { type: "emitters", captured: { mod: "write" } } }
            ]
          }
        },
        // //diagnostics
        {
          from: { element: { type: "diagnostics", captured: { mod: "data" } } },
          allow: {
            to: [
              { element: { type: "diagnostics", captured: { mod: "print" } } },
              { element: { type: "diagnostics", captured: { mod: "data" } } },
              { element: { type: "emitters", captured: { mod: "write" } } },
              { element: { type: "compiler", captured: { mod: "resolvers" } } },
              { element: { type: "compiler", captured: { mod: "tracking" } } }
            ]
          }
        },
        {
          from: { element: { type: "diagnostics", captured: { mod: "print" } } },
          allow: {
            to: { element: { type: "diagnostics", captured: { mod: "report" } } }
          }
        },
        {
          from: { element: { type: "diagnostics", captured: { mod: "report" } } },
          allow: {
            to: { element: { type: "diagnostics", captured: { mod: "report" } } }
          }
        },
        {
          from: { file: { categories: "runDiagnostics" } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { element: { type: "diagnostics", captured: { mod: "data" } } },
              { element: { type: "diagnostics", captured: { mod: "report" } } },
              { element: { type: "diagnostics", captured: { mod: "print" } } }
            ]
          }
        },
        // postCss
        {
          from: { file: { categories: "processModule" } },
          allow: {
            to: [
              { element: { type: "postCss", captured: { mod: "resolvers" } } },
              { element: { type: "postCss", captured: { mod: "inject" } } }
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
              { file: { categories: "types" } },
              { file: { categories: "compilerService" } }
              // There is no policy allowing dependencies from file of categories "types", "types" belonging to elements of type "tokenTypes" to file of category "compilerService"
            ]
          }
        }
      ] as const
    }
  ]
}