import { useBreakpoints as _useBreakpoints } from "@vueuse/core";
/** 和 @/assets/styles/element-plus.scss 中的 $sm/$md/$lg/$xl 保持一致 */
export const ElementPlusBreackpoints = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
};
// export const ElementPlusBreackpoints = {
//     sm: 768,
//     md: 992,
//     lg: 1200,
//     xl: 1920,
// };
const breakpoints = _useBreakpoints(ElementPlusBreackpoints);

export function useBreakpoints() {
    return breakpoints;
}
