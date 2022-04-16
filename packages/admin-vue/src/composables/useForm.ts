import { computed, ref } from "vue";
import type { FormItemProp, FormRules } from "element-plus";
import Schema, { Rules } from "async-validator";
import { AsyncValidationError } from "async-validator/dist-types/util";

type InvalidProps = Record<string, boolean>;

export function useInvalidProps(formData: Record<string, any>, formRules?: FormRules) {
    if (!formRules) {
        return {
            invalid: ref(false),
            onValidate(_prop: FormItemProp, _isValid: boolean, _msg: string) {},
            resetValidation() {},
        };
    } else {
        const invalidProps = ref<InvalidProps>({});

        function init(data: Record<string, any>, rules: FormRules) {
            const schema = new Schema(rules as Rules);
            schema.validate(data).catch((errors: AsyncValidationError) => {
                for (const field in errors.fields) {
                    invalidProps.value[field] = true;
                }
            });
        }

        init(formData, formRules);

        const invalid = computed(() => {
            return Object.values(invalidProps.value).includes(true);
        });
        return {
            invalid,
            onValidate(prop: FormItemProp, isValid: boolean, _msg: string) {
                invalidProps.value[prop as string] = !isValid;
            },
            resetValidation(formData: Record<string, any>, formRules?: FormRules) {
                invalidProps.value = {};
                if (formRules) {
                    init(formData, formRules);
                }
            },
        };
    }
}
