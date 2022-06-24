<template>
    <el-radio-group :class="{ 'is-readonly': readonly }" v-bind="$attrs" @click.capture="onClick">
        <el-radio-button v-for="radio of radios" :label="radio.value" :disabled="radio.disabled">{{
            radio.label
        }}</el-radio-button>
    </el-radio-group>
</template>

<script setup lang="ts" name="MenuTypeRadio">
import { computed, PropType } from "vue";
import { PermissionType } from "admin-common";

export interface MenuTypeRadioProps {
    readonly?: boolean;
    excluded?: PermissionType[];
}

const props = defineProps<MenuTypeRadioProps>();

interface ButtonType {
    disabled?: boolean;
    label: string;
    value: PermissionType;
}

const radios = computed<ButtonType[]>(() => {
    const buttons: ButtonType[] = [
        {
            label: "菜单组",
            value: "menugroup",
            disabled: props.excluded && props.excluded.includes("menugroup"),
        },
        {
            label: "菜单项",
            value: "menuitem",
            disabled: props.excluded && props.excluded.includes("menuitem"),
        },
        {
            label: "动作",
            value: "action",
            disabled: props.excluded && props.excluded.includes("action"),
        },
    ];
    return buttons;
});

function onClick(evt: Event) {
    if (props.readonly) {
        evt.preventDefault();
        evt.stopPropagation();
    }
}
</script>

<style scoped></style>
