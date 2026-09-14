import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const buttonStyle: {
    readonly component: "button";
    readonly vars: {
        readonly button: {
            readonly position: {
                readonly name: "position";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly display: {
                readonly name: "display";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly align: {
                readonly name: "align";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly justify: {
                readonly name: "justify";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "s", "m", "p", "f"];
            };
            readonly modeDisabledOpacity: {
                readonly name: "mode-disabled-opacity";
                readonly allowed: readonly ["o", "m", "p", "f"];
            };
            readonly interactiveFalseOpacity: {
                readonly name: "interactive-false-opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly width: {
                readonly name: "width";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly height: {
                readonly name: "height";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
        readonly visual: {
            readonly bg: {
                readonly name: "bg";
                readonly allowed: readonly ["o", "m", "t", "f"];
            };
            readonly radius: {
                readonly name: "radius";
                readonly allowed: readonly ["o", "f"];
            };
            readonly border: {
                readonly name: "border";
                readonly allowed: readonly ["o", "s", "p", "f"];
            };
            readonly shadow: {
                readonly name: "shadow";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly filter: {
                readonly name: "filter";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly statePressedScale: {
                readonly name: "state-pressed-scale";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly stateReleasedScale: {
                readonly name: "state-released-scale";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly stateCanceledScale: {
                readonly name: "state-canceled-scale";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly statePressedFilter: {
                readonly name: "state-pressed-filter";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly statePressedShadow: {
                readonly name: "state-pressed-shadow";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly statePressedBorder: {
                readonly name: "state-pressed-border";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly modeOffBg: {
                readonly name: "mode-off-bg";
                readonly allowed: readonly ["o", "s", "f"];
            };
            readonly modeOnBg: {
                readonly name: "mode-on-bg";
                readonly allowed: readonly ["o", "s", "f"];
            };
        };
    };
};
export type ButtonStyle = StyleFromComponent<typeof buttonStyle>;
//# sourceMappingURL=button.token.d.ts.map