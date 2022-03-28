<template>
    <div class="doubleFaceCard" :class="{ 'is-rotated': props.modelValue }">
        <div class="doubleFaceCard-face doubleFaceCard-face_front">
            <div class="doubleFaceCard-face-content">
                <slot name="front"></slot>
            </div>
        </div>
        <div class="doubleFaceCard-face doubleFaceCard-face_back">
            <div class="doubleFaceCard-face-content">
                <slot name="back"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped lang="scss">
.doubleFaceCard {
    position: relative;
    transition: all 1s ease;
    transform-style: preserve-3d;
    box-shadow: 0px 5px 12px 0px rgba(0, 0, 0, 0.4);

    &:hover {
        transform: scale3d(1.1, 1.1, 1.1);
        box-shadow: 0px 5px 40px 0px rgba(0, 0, 0, 0.8);
    }
    &.is-rotated {
        transform: rotateY(-180deg);
        &:hover {
            transform: rotateY(-180deg) scale3d(1.1, 1.1, 1.1);
        }
    }
    &-face {
        // width: 100%;
        // height: 100%;

        position: absolute;
        // top: 25px;
        // right: 25px;
        // bottom: 25px;
        // left: 25px;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        // width: 100%;
        // height: 100%;
        border-radius: 25px;
        padding: 25px;
        backface-visibility: hidden;
        transform-style: inherit;

        &_front {
            background: linear-gradient(to top left, var(--el-color-info-light-9), var(--el-color-info-light-3));
        }

        &_back {
            transform: rotateY(180deg);
            background: linear-gradient(to bottom right, var(--el-color-info-light-9), var(--el-color-info-light-3));
        }

        &-content {
            height: 100%;

            transform: translateZ(100px);
        }
    }
}
</style>
