// import type { ResolvedPaths } from '../helpers/resolvePath'
// import * as vscode from 'vscode'



// export function getProblemMatcher(filePaths: ResolvedPaths) {
//   return {
//     problemMatcher: {
//       owner: 'oxlint',
//       source: 'Oxlint',
//       fileLocation: [
//         'relative',
//         filePaths.projectRoot,
//       ],
//       pattern: {
//         regexp: /^(.+):(\d+):(\d+):\s+(.*)\s+\[(Error|Warning)\/([^\]]+)\]$/,
//         file: 1,
//         line: 2,
//         column: 3,
//         message: 4,
//         severity: 5,
//         code: 6,
//       }
//     }
//   }
// }