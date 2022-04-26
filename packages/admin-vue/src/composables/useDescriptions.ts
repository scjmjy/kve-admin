import { computed } from "vue";
import { useSystemStore, ResponsiveScreenMap } from "@/store/modules/system";

export function useResponsiveCollumn(responsiveMap?: ResponsiveScreenMap) {
    if (!responsiveMap) {
        responsiveMap = {
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
        };
    }
    const systemStore = useSystemStore();
    const column = computed(() => {
        return responsiveMap![systemStore.screen.mode] || 1;
    });
    return { column };
}
