import { computed, ref } from "vue";

export function useInvalidProps() {
    const invalidProps = ref<Record<string, boolean>>();
    const invalid = computed(() => {
        if (!invalidProps.value) {
            return true;
        }
        return Object.values(invalidProps.value).includes(true);
    });
    return {
        invalid,
        invalidProps,
        onValidate(propName: string, pass: boolean) {
            if (!invalidProps.value) {
                invalidProps.value = {};
            }
            invalidProps.value[propName] = !pass;
        },
    };
}
