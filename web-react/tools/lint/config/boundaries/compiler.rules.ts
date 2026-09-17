import type { BoundaryRule } from './lint.types.ts'
export const compilerRules: {
  'boundaries/dependencies': BoundaryRule
} = {
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',

      policies: [
        {
          from: [
            { element: { type: "compiler", captured: { mod: "*" } } },
            { element: { type: "entries", captured: { mod: "*" } } },
            { element: { type: "postCss", captured: { mod: "*" } } },
            { element: { type: "analysisAnalyzers" } },
            { element: { type: "reportSections" } },
            { element: { type: "composeFormat" } },
            { element: { type: "extractAssemblers" } },
            { element: { type: "write" } },
            { element: { type: "utils" } },
            { file: { categories: "runDiagnostics" } },
            { file: { categories: "buildAnalysis" } },
            { file: { categories: "buildReport" } },

            { file: { categories: "emitFiles" } },
            { file: { categories: "composeOutput" } },
            { file: { categories: "extractAssemblers" } },
            { file: { categories: "extractData" } },

            { file: { categories: "processModule" } },
            { file: { categories: "processPost" } },
            { file: { categories: "css" } },
            { file: { categories: "entry" } }
          ],
          allow: {
            to: [
              { file: { categories: "types" } },
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
          from: { element: { type: "compiler", captured: { mod: "loaders" } } },
          allow: { to: { element: { type: "schema" } } }
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
              { file: { categories: "processPost" } },
              { file: { categories: "processModule" } },
              { file: { categories: "emitFiles" } },
              { file: { categories: "runDiagnostics" } },
              { file: { categories: "types" } }
            ]
          }
        },
        // diagnostics
        {
          from: { file: { categories: "buildAnalysis" } },
          allow: {
            to: [
              { element: { type: "analysisAnalyzers" } },
              { element: { type: "compiler", captured: { mod: "tracking" } } }, //for token cache type
              { element: { type: "compiler", captured: { mod: "resolvers" } } }
            ]
          }
        },
        {
          from: { element: { type: "reportSections" } },
          allow: { to: { file: { categories: "buildReport" } } }
        },
        {
          from: { file: { categories: "buildReport" } },
          allow: { to: { element: { type: "reportSections" } } }
        },
        {
          from: { file: { categories: "runDiagnostics" } },
          allow: {
            to: [
              { file: { categories: "buildReport" } },
              { file: { categories: "buildAnalysis" } },
              { element: { type: "compiler", captured: { mod: "tracking" } } }
            ]
          }
        },

        //emitters
        {
          from: { file: { categories: "composeOutput" } },
          allow: { to: { element: { type: "composeFormat" } } }
        },
        {
          from: { element: { type: "extractAssemblers" } },
          allow: {
            to: [
              { element: { type: "compiler", captured: { mod: "resolvers" } } },  //for extractGroupName
              { element: { type: "schema" } }
            ]
          }
        },

        {
          from: { file: { categories: "extractData" } },
          allow: {
            to: [
              { element: { type: "extractAssemblers" } },
              { element: { type: "compiler", captured: { mod: "tracking" } } }
            ]
          }
        },

        {
          from: { file: { categories: "emitFiles" } },
          allow: {
            to: [
              { element: { type: "write" } },
              { element: { type: "compiler", captured: { mod: "tracking" } } },
              { file: { categories: "composeOutput" } },
              { file: { categories: "extractData" } },
            ]
          }
        },
        // entries 
        {
          from: { element: { type: "entries", captured: { mod: "*" } } },
          allow: { to: { element: { type: "entries", captured: { mod: "{{from.element.captured.mod}}" } } } }
        },
        {
          from: { element: { type: "entries", captured: { mod: "watch" } } },
          allow: {
            to: [
              { element: { type: "entries", captured: { mod: "config" } } },
              { file: { categories: "compilerService" } }
            ]
          }
        },
        {
          from: { element: { type: "entries", captured: { mod: "config" } } },
          allow: { to: { element: { type: "schema" } } }
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
        {
          from: { file: { categories: "processPost" } },
          allow: {
            to: [
              { element: { type: "postCss", captured: { mod: "resolvers" } } }
            ]
          }
        },
        //public
        {
          from: { file: { categories: "vite" } },
          allow: { to: { element: { type: "vite" } } }
        },
        //vite
        {
          from: { element: { type: "vite" } },
          allow: {
            to: [
              { file: { categories: "compilerService" } },
              { file: { categories: "entry" } }
            ]
          }
        },
        // // ----------------------------------
        // // FILES
        // // ----------------------------------
        {
          from: [
            { file: { categories: "build" } },
            { file: { categories: "css" } },
            { file: { categories: "entry" } }
          ],
          allow: {
            to: { file: { categories: "compilerService" } }
          }
        },
        {
          from: [
            { file: { categories: "build" } },
            { file: { categories: "css" } },
          ],
          allow: {
            to: { element: { type: "entries", captured: { mod: "config" } } }
          }
        },
        {
          from: { file: { categories: "entry" } },
          allow: {
            to: [
              { element: { type: "entries", captured: { mod: "config" } } },
              { file: { categories: "watch" } },
              { file: { categories: "css" } },
              { file: { categories: "build" } }
            ]
          }
        },
        {
          from: { file: { categories: "types" } },
          allow: {
            to: [
              { element: { captured: { mod: "{{from.element.captured.mod}}" } } },
              { file: { categories: "types" } },
              { element: { type: "schema" } },
              { file: { categories: "compilerService" } }
            ]
          }
        },
        {
          from: { file: { categories: "cli" } },
          allow: { to: { file: { categories: "entry" } } }
        }

      ] as const
    }
  ]
}