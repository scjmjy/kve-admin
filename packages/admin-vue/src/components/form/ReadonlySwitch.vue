<template>
    <el-switch :class="{ 'is-readonly': readonly }" @click.capture="onClick" />
</template>

<script setup lang="ts" name="ReadonlySwitch">
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
