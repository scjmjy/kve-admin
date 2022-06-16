import { computed } from "vue";
import { useSystemStore, ResponsiveScreenMap } from "@/store/modules/system";

export function useResponsiveCollumn(responsiveMap?: ResponsiveScreenMap) {
    if (!responsiveMap) {
        responsiveMap = {
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
        };
    }
    const systemStore = useSystemStore();
    const column = computed(() => {
        return responsiveMap![systemStore.screen.mode] || 1;
    });
    return { column };
}
