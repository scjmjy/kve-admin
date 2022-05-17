<template>
    <div class="iconSelect">
        <el-input
            v-model="searchIconName"
            style="position: relative"
            clearable
            placeholder="请输入图标名称"
            prefix-icon="Search"
        >
        </el-input>
        <el-tabs>
            <el-tab-pane label="ElementPlus 内置图标">
                <span
                    class="iconSelect-iconItem"
                    v-for="(item, index) in state.elIcons"
                    :key="index"
                    @click="onIconClick(item)"
                >
                    <svg-icon :icon="item" />
                    <span class="iconSelect-iconItem-label">{{ item }}</span>
                </span>
            </el-tab-pane>
            <el-tab-pane label="精灵图标">
                <span
                    class="iconSelect-iconItem"
                    v-for="(item, index) in state.spriteIcons"
                    :key="index"
                    @click="onIconClick(item)"
                >
                    <svg-icon :icon="item" />
                    <span class="iconSelect-iconItem-label">{{ item }}</span>
                </span>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts" name="IconSelect">
import { computed, reactive, ref } from "vue";
import { appSpriteIcons, elementPlusIcons } from "@/components/svgicon";

const emit = defineEmits<{
    (event: "change", icon: string): void;
}>();

const searchIconName = ref("");
const state = reactive({
    elIcons: computed(() =>
        elementPlusIcons.filter((item) => item.toLowerCase().includes(searchIconName.value.toLowerCase())),
    ),
    spriteIcons: computed(() =>
        appSpriteIcons.filter((item) => item.toLowerCase().includes(searchIconName.value.toLowerCase())),
    ),
});

function onIconClick(icon: string) {
    emit("change", icon);
}
</script>

<style scoped lang="scss">
.iconSelect {
    :deep(.el-tab-pane) {
        height: 320px;
        overflow-y: auto;
    }
    &-iconItem {
        cursor: pointer;
        margin: 5px 2px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 100px;

        &:hover {
            color: var(--el-color-primary);
            outline: 1px dashed var(--el-color-primary);
        }

        .el-icon {
            font-size: 2em;
        }

        &-label {
            margin-top: 3px;
            font-size: 0.8em;
        }
    }
}
</style>
