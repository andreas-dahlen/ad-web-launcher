import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const labelStyle: {
    readonly component: "label";
    readonly vars: {
        readonly label: {
            readonly col: {
                readonly name: "col";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly align: {
                readonly name: "align";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly position: {
                readonly name: "position";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly offsetX: {
                readonly name: "offset-x";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly offsetY: {
                readonly name: "offset-y";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
    };
};
export type LabelStyle = StyleFromComponent<typeof labelStyle>;
//# sourceMappingURL=label.token.d.ts.map