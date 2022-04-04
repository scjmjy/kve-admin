import { useBreakpoints as _useBreakpoints } from "@vueuse/core";
export const ElementPlusBreackpoints = {
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1920,
};
const breakpoints = _useBreakpoints(ElementPlusBreackpoints);

export function useBreakpoints() {
    return breakpoints;
}
