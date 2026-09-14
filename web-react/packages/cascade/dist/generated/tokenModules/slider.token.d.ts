import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const sliderStyle: {
    readonly component: "slider";
    readonly vars: {
        readonly slider: {
            readonly bg: {
                readonly name: "bg";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly radius: {
                readonly name: "radius";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly mainSize: {
                readonly name: "main-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly crossSize: {
                readonly name: "cross-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
        readonly thumb: {
            readonly bg: {
                readonly name: "bg";
                readonly allowed: readonly ["o", "s", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly radius: {
                readonly name: "radius";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly border: {
                readonly name: "border";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly mainSize: {
                readonly name: "main-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly crossSize: {
                readonly name: "cross-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly stateSwipingBg: {
                readonly name: "state-swiping-bg";
                readonly allowed: readonly ["o", "s", "p", "f"];
            };
            readonly statePressingBg: {
                readonly name: "state-pressing-bg";
                readonly allowed: readonly ["o", "s", "p", "f"];
            };
            readonly stateCommittedBg: {
                readonly name: "state-committed-bg";
                readonly allowed: readonly ["o", "s", "p", "f"];
            };
        };
        readonly track: {
            readonly bg: {
                readonly name: "bg";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly radius: {
                readonly name: "radius";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly mainSize: {
                readonly name: "main-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly crossSize: {
                readonly name: "cross-size";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
    };
};
export type SliderStyle = StyleFromComponent<typeof sliderStyle>;
//# sourceMappingURL=slider.token.d.ts.map