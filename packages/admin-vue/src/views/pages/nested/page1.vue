<template>
    <div>
        <p>RouteName: NestedPage1</p>
        <p>此页面进入次数: {{ count }}</p>
        <el-table :data="tableData" style="width: 100%" max-height="250">
            <el-table-column fixed prop="date" label="Date" width="150" />
            <el-table-column prop="name" label="Name" width="120" />
            <el-table-column prop="state" label="State" width="120" />
            <el-table-column prop="city" label="City" width="120" />
            <el-table-column prop="address" label="Address" width="600" />
            <el-table-column prop="zip" label="Zip" width="120" />
            <el-table-column fixed="right" label="Operations" width="120">
                <template #default="scope">
                    <el-button type="text" size="small" @click.prevent="deleteRow(scope.$index)"> Remove </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="onAddItem">Add Item</el-button>
    </div>
</template>

<script setup lang="ts" name="NestedPage1">
import { onActivated, ref } from "vue";
import dayjs from "dayjs";

const count = ref(0);

onActivated(() => {
    count.value++;
});

const tableData = ref([
    {
        date: "2016-05-01",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-02",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-03",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
]);

const deleteRow = (index: number) => {
    tableData.value.splice(index, 1);
};

const now = new Date();
const onAddItem = () => {
    now.setDate(now.getDate() + 1);
    tableData.value.push({
        date: dayjs(now).format("YYYY-MM-DD"),
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    });
};
</script>

<style scoped></style>
