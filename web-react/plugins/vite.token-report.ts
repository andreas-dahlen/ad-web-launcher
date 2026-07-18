// import { tokenReport } from "./token-report-state";

// export default function tokenReportPlugin() {
//   return {
//     name: "tokens-report",

//     buildStart() {
//       tokenReport.reset();
//     },

//     closeBundle() {
//       console.log("\n✨ Design Tokens Report");

//       if (tokenReport.injectedTargets.size) {
//         console.log("\n🎯 Injected:");

//         for (const target of tokenReport.injectedTargets) {
//           console.log(`  ✅ ${target}`);
//         }
//       }

//       if (tokenReport.missingFiles.size) {
//         console.log("\n⚠ Missing:");

//         for (const item of tokenReport.missingFiles) {
//           console.log(`  ❌ ${item}`);
//         }
//       }
//     }
//   };
// }