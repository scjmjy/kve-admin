import { computed, ref, Ref, unref } from "vue";

export function useClientPagination<T>(allData: Ref<T[]>, size = 10) {
    const pageNum = ref(1);
    const pageSize = ref(size);
    const currentData = computed(() => {
        const num = unref(pageNum);
        const size = unref(pageSize);
        return allData.value.slice((num - 1) * size, num * size);
    });
    return {
        pageNum,
        pageSize,
        currentData,
    };
}
