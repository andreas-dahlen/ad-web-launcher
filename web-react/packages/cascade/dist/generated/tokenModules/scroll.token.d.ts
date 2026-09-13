import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const scrollStyle: {
    readonly component: "scroll";
    readonly vars: {
        readonly knob: {
            readonly bg: {
                readonly name: "bg";
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
        readonly scroll: {
            readonly height: {
                readonly name: "height";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly width: {
                readonly name: "width";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly opacity: {
                readonly name: "opacity";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
    };
};
export type ScrollStyle = StyleFromComponent<typeof scrollStyle>;
//# sourceMappingURL=scroll.token.d.ts.map