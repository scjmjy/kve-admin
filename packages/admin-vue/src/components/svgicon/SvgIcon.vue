<template>
    <svg class="svgIcon" aria-hidden="true">
        <use :xlink:href="props.icon" :fill="props.color" />
    </svg>
</template>

<script setup lang="ts">
const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    // size: {
    //     type: [String, Number],
    //     default: undefined,
    // },
});

</script>

<style lang="scss">
.svgIcon {
    width: 1em;
    height: 1em;
    fill: currentColor;
}
</style>
