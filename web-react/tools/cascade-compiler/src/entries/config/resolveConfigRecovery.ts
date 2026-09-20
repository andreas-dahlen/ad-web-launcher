import { createIssueCollector } from '../../diagnostics/issueCollector.ts';
import { compilerConfigKeys, compilerConfigSchema, compilerLoggingKeys, compilerLoggingRecoverySchema, compilerOutputsKeys, compilerOutputsRecoverySchema, compilerPresetIgnoreRecoverySchema, compilerPresetIgnoreSchema } from '../../schema/configSchema.ts';
import type { CompilerOptionsRaw, CompilerOptionsAndIssues } from '../../types/run.types.ts';
import { asArray, asObject } from '../../utils/typeGuards.ts';


export function resolveConfigRecovery(raw: Record<string, unknown>): CompilerOptionsAndIssues {
  const recoveredConfig: CompilerOptionsRaw = {}

  const collector = createIssueCollector()
  collector.setSubject("Config Recovery")

  const outputRaw = asObject(raw.outputs)
  const loggingRaw = asObject(raw.logging)
  const presetIgnoreArray = asArray(raw.presetIgnore)
  collector.scope({
    value: "unknown",
    path: "cascade.config.json",
    //context optional
  })

  const wrongConfigKeys: string[] = Object.keys(raw)
    .filter(key => !compilerConfigKeys.includes(key as keyof typeof compilerConfigSchema.shape))
  if (wrongConfigKeys.length > 0) {
    collector.set({ reason: "found invalid config key", value: wrongConfigKeys.join(', ') })
  }

  if (outputRaw) {
    const wrongOutputKeys: string[] = Object.keys(outputRaw)
      .filter(key => !compilerOutputsKeys.includes(key as keyof typeof compilerOutputsRecoverySchema.shape))

    if (wrongOutputKeys.length > 0) {
      collector.set({ reason: "found invalid outputs key", value: wrongOutputKeys.join(', ') })
    }
  }

  if (loggingRaw) {
    const wrongLoggingKeys: string[] = Object.keys(loggingRaw)
      .filter(key => !compilerLoggingKeys.includes(key as keyof typeof compilerLoggingRecoverySchema.shape))

    if (wrongLoggingKeys.length > 0) {
      collector.set({ reason: "found invalid logging key", value: wrongLoggingKeys.join(', ') })
    }
  }

  if (raw.presetIgnore !== undefined && !Array.isArray(raw.presetIgnore)) {
    collector.set({ reason: "presetIgnore needs to be an array", value: `${typeof raw.presetIgnore}` })
  }

  // if (presetIgnoreArray) {
  //   const wrongPresetIgnoreValues = presetIgnoreArray.filter(value => typeof value !== 'string')

  //   if (wrongPresetIgnoreValues.length > 0) {
  //     collector.set({
  //       reason: "presetIgnore values need to be of type string",
  //       value: wrongPresetIgnoreValues.flatMap(v => `${JSON.stringify(v)} of type: ${typeof v}`).join(', ')
  //     })
  //   }
  // }
  const tokenFolderRaw = compilerConfigSchema.shape.tokenFolder.safeParse(raw.tokenFolder)
  const outputs = compilerOutputsRecoverySchema.safeParse(raw.outputs)
  const logging = compilerLoggingRecoverySchema.safeParse(raw.logging)
  const presetIgnore = compilerPresetIgnoreSchema.safeParse(raw.presetIgnore)

  recoveredConfig.tokenFolder = tokenFolderRaw.data
  recoveredConfig.outputs = outputs.data
  recoveredConfig.logging = logging.data
  recoveredConfig.presetIgnore = presetIgnore.data

  if (tokenFolderRaw.error) {
    collector.set({ reason: "tokenFolder needs to be of type string", value: `${raw.tokenFolder}` })
  }

  if (outputRaw && outputs.error) {
    const outputs: Record<string, unknown> = {}
    for (const key of compilerOutputsKeys) {

      const result = compilerOutputsRecoverySchema.shape[key].safeParse(outputRaw?.[key])

      if (result.error) {
        collector.set({
          reason: "outputs values need to be of type boolean",
          value: String(outputRaw?.[key])
        })
        continue
      }
      outputs[key] = result.data
    }
    recoveredConfig.outputs = outputs
  }
  if (loggingRaw && logging.error) {
    const logging: Record<string, unknown> = {}
    for (const key of compilerLoggingKeys) {

      const result = compilerLoggingRecoverySchema.shape[key].safeParse(loggingRaw?.[key])

      if (result.error) {
        collector.set({
          reason: `invalid logging value for ${key}`,
          value: String(loggingRaw?.[key])
        })
        continue
      }
      logging[key] = result.data
    }
    recoveredConfig.logging = logging
  }
  if (presetIgnoreArray && presetIgnore.error) {
    const presetIgnore = new Set<string>()
    for (const value of presetIgnoreArray) {
      const result = compilerPresetIgnoreRecoverySchema.element.safeParse(value)
      if (result.error) {
        collector.set({
          reason: `invalid presetIgnore value`,
          value: `${value}`
        })
        continue
      }

      presetIgnore.add(result.data)
    }
    recoveredConfig.presetIgnore = [...presetIgnore]
  }

  return {
    config: recoveredConfig,
    issues: collector.flush()
  }
}