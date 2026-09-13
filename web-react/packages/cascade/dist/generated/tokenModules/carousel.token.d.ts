import type { StyleFromComponent } from "../../types/compiler.types.ts";
export declare const carouselStyle: {
    readonly component: "carousel";
    readonly vars: {
        readonly carousel: {
            readonly width: {
                readonly name: "width";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly height: {
                readonly name: "height";
                readonly allowed: readonly ["o", "p", "f"];
            };
            readonly background: {
                readonly name: "background";
                readonly allowed: readonly ["o", "p", "f"];
            };
        };
    };
};
export type CarouselStyle = StyleFromComponent<typeof carouselStyle>;
//# sourceMappingURL=carousel.token.d.ts.map