<template>
    <div class="metricMonitor" v-loading="state.refreshing">
        <el-card v-if="metricTimeline">
            <template #header>
                <span>更新时间：{{ metricTimeline.timestamp }}</span>
                <el-button class="button" type="primary" :loading="state.refreshing" @click="onRefreshClick"
                    >刷新</el-button
                >
            </template>
            <template v-for="desc of metricTimeline.descriptions" :key="desc.title">
                <el-descriptions v-if="desc.type === 'descriptions'" :column="column" border :title="desc.title">
                    <el-descriptions-item v-for="(item, index) in desc.items" :key="index" :label="item.label">
                        {{ item.value }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-card>
    </div>
</template>

<script setup lang="ts" name="MetricMonitor">
import { computed, onActivated, reactive, ref } from "vue";
import { MetricTimelines } from "admin-common";
import { useResponsiveCollumn } from "@/composables/useDescriptions";
import { getMetrics } from "@/api/monitor";
import { formatDate } from "@/utils/date";

const { column } = useResponsiveCollumn();

const metricTimelines = ref<MetricTimelines>();

const metricTimeline = computed(() => {
    if (!metricTimelines.value) {
        return undefined;
    }
    const timestamps = Object.keys(metricTimelines.value);
    if (timestamps.length === 0) {
        return undefined;
    }

    return {
        timestamp: formatDate(Number(timestamps[0])),
        descriptions: metricTimelines.value[timestamps[0]],
    };
});

const state = reactive({
    refreshing: false,
});

onActivated(() => {
    onRefreshClick();
});

function onRefreshClick() {
    state.refreshing = true;

    getMetrics()
        .then((res) => {
            metricTimelines.value = res.data;
        })
        .finally(() => {
            state.refreshing = false;
        });
}
</script>

<style scoped lang="scss">
.metricMonitor {
    display: flex;
    flex-direction: column;

    :deep(.el-card__header) {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .el-descriptions {
        &:not(:last-of-type) {
            margin-bottom: 15px;
        }
    }
}
</style>
