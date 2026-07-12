import surfaceJson from "../tokens/surface.json";
import { convertJson } from './convert';
import type { StyleFromVars } from '@utils/svsx.types';
export const surface = convertJson(surfaceJson);
export type SurfaceStyle = StyleFromVars<typeof surface.vars, typeof surface.alwaysAllowed>;