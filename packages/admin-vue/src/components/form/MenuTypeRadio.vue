<template>
    <el-radio-group :class="{ 'is-readonly': readonly }"  v-bind="$attrs" @click.capture="onClick">
        <el-radio-button label="menugroup">菜单组</el-radio-button>
        <el-radio-button label="menuitem">菜单项</el-radio-button>
        <el-radio-button label="action">动作</el-radio-button>
    </el-radio-group>
</template>

<script setup lang="ts" name="MenuTypeRadio">
const props = defineProps({
    readonly: {
        type: Boolean,
        default: true,
    },
});
function onClick(evt: Event) {
    if (props.readonly) {
        evt.preventDefault();
        evt.stopPropagation();
    }
}
</script>

<style scoped></style>
