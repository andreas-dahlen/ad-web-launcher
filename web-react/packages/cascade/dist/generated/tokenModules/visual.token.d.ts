import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const visualStyle: {
    readonly component: "visual";
    readonly vars: {
        readonly visual: {
            readonly bg: {
                readonly name: "bg";
                readonly allowed: readonly ["o", "p", "t", "f"];
            };
            readonly overflow: {
                readonly name: "overflow";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly border: {
                readonly name: "border";
                readonly allowed: readonly ["o", "p", "t", "f"];
            };
            readonly radius: {
                readonly name: "radius";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly shadow: {
                readonly name: "shadow";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly blur: {
                readonly name: "blur";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
    };
};
export type VisualStyle = StyleFromComponent<typeof visualStyle>;
//# sourceMappingURL=visual.token.d.ts.map