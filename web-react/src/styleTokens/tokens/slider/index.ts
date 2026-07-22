import { mergeJson } from '../../tokenHelpers/mergeJson.ts'
import sliderJson from "./slider.json";
import thumbJson from "./thumb.json";
import trackJson from "./track.json";

export default mergeJson(sliderJson, thumbJson, trackJson)