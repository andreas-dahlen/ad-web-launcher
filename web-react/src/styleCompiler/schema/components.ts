import { convertJson } from './convert';
import type { StyleFromVars } from '../../shared/sxCompiler/svsx.types';
import surfaceJson from "../tokens/surface.json";
import labelJson from "../tokens/label.json";
import buttonJson from "../tokens/button.json";
import carouselJson from "../tokens/carousel.json"
import scrollJson from "../tokens/scroll.json"
import sliderJson from "../tokens/slider.json"
import svgIconJson from "../tokens/svgIcon.json"

export const surfaceStyle = convertJson(surfaceJson)
export type SurfaceStyle = StyleFromVars<typeof surfaceStyle.vars, typeof surfaceStyle.alwaysAllowed>

export const labelStyle = convertJson(labelJson)
export type LabelStyle = StyleFromVars<typeof labelStyle.vars, typeof labelStyle.alwaysAllowed>

export const buttonStyle = convertJson(buttonJson)
export type ButtonStyle = StyleFromVars<typeof buttonStyle.vars, typeof buttonStyle.alwaysAllowed>

export const carouselStyle = convertJson(carouselJson)
export type CarouselStyle = StyleFromVars<typeof carouselStyle.vars, typeof carouselStyle.alwaysAllowed>

export const scrollStyle = convertJson(scrollJson)
export type ScrollStyle = StyleFromVars<typeof scrollStyle.vars, typeof scrollStyle.alwaysAllowed>

export const sliderStyle = convertJson(sliderJson)
export type SliderStyle = StyleFromVars<typeof sliderStyle.vars, typeof sliderStyle.alwaysAllowed>

export const svgIconStyle = convertJson(svgIconJson)
export type SvgIconStyle = StyleFromVars<typeof svgIconStyle.vars, typeof svgIconStyle.alwaysAllowed>