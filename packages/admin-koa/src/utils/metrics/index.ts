import os from "os";
import v8 from "v8";
import { MetricGroup, MetricTimelines } from "admin-common";
import { getCpuUsage } from "./cpu-usage";
// import eventLoop from "event-loop-stats";
// import gcStats from "gc-stats";

/**
 * Get Process, OS, Network etc metrics.
 */
export async function getAllMetrics() {
    const metricTimelines: MetricTimelines = {};

    // --- PROCESS METRICS ---

    const timestamp = Date.now();
    const metricGroups: MetricGroup[] = [];

    const procMem = process.memoryUsage();

    const processMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "Process Metrics",
        items: [
            {
                label: "Process arguments",
                value: process.argv.join(" "),
            },
            {
                label: "Process PID",
                value: process.pid,
            },
            {
                label: "Process parent PID",
                value: process.ppid,
            },
            {
                label: "Process uptime",
                value: process.uptime() + " s",
            },
            {
                label: "Node.js Version",
                value: process.version,
            },
            {
                label: "Process heap size(byte)",
                value: procMem.heapTotal,
            },
            {
                label: "Process used heap size(byte)",
                value: procMem.heapUsed,
            },
            {
                label: "Process RSS size(byte)",
                value: procMem.rss,
            },
            {
                label: "Process external memory size(byte)",
                value: procMem.external,
            },
        ],
    };

    metricGroups.push(processMetricGroup);

    // --- V8 METRICS ---
    const v8HeapSpaceMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "V8 heap spaces",
        items: [],
    };

    const heapSpaceStats = v8.getHeapSpaceStatistics();
    heapSpaceStats.forEach((item) => {
        v8HeapSpaceMetricGroup.items.push({
            label: "Heap Space: " + item.space_name,
            value: `space_size: ${item.space_size}/space_used_size: ${item.space_used_size}/space_available_size: ${item.space_available_size}/physical_space_size: ${item.physical_space_size}`,
        });
    });

    const heapStats = v8.getHeapStatistics();
    v8HeapSpaceMetricGroup.items.push({
        label: "Heap Stats",
        value: `total_heap_size: ${heapStats.total_heap_size}/total_heap_size_executable: ${heapStats.total_heap_size_executable}/total_physical_size: ${heapStats.total_physical_size}/total_available_size: ${heapStats.total_available_size}/used_heap_size: ${heapStats.used_heap_size}/heap_size_limit: ${heapStats.heap_size_limit}/malloced_memory: ${heapStats.malloced_memory}/peak_malloced_memory: ${heapStats.peak_malloced_memory}/does_zap_garbage: ${heapStats.does_zap_garbage}`,
    });

    metricGroups.push(v8HeapSpaceMetricGroup);

    // --- OS METRICS ---

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const osMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "OS Metrics",
        items: [
            {
                label: "Total Memory Size(byte)",
                value: totalMem,
            },
            {
                label: "Used Memory Size(byte)",
                value: usedMem,
            },
            {
                label: "Free Memory Size(byte)",
                value: freeMem,
            },
            {
                label: "OS uptime",
                value: os.uptime() + " s",
            },
            {
                label: "OS type",
                value: os.type(),
            },
            {
                label: "OS release",
                value: os.release(),
            },
            {
                label: "OS hostname",
                value: os.hostname(),
            },
            {
                label: "OS Arch",
                value: os.arch(),
            },
            {
                label: "OS platform",
                value: os.platform(),
            },
        ],
    };

    metricGroups.push(osMetricGroup);

    // --- User METRICS ---

    const userInfo = getUserInfo();
    const userMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "User Infos",
        items: [
            {
                label: "UID/GID",
                value: `${userInfo.uid}/${userInfo.gid}`,
            },
            {
                label: "Username",
                value: userInfo.username,
            },
            {
                label: "User's Home Directory",
                value: userInfo.homedir,
            },
        ],
    };
    metricGroups.push(userMetricGroup);

    // --- Network METRICS ---
    const netMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "Network Interfaces",
        items: [],
    };
    const interfaces = getNetworkInterfaces();
    for (const iface in interfaces) {
        const info = interfaces[iface];
        netMetricGroup.items.push({
            label: iface,
            value: JSON.stringify(info, undefined, 2),
        });
    }
    metricGroups.push(netMetricGroup);

    // --- Datetime METRICS ---

    const d = new Date();
    const dateMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "Server Datetime",
        items: [
            {
                label: "Datetime Locale",
                value: d.toLocaleString(),
            },
            {
                label: "Datetime Unix",
                value: d.valueOf(),
            },
            {
                label: "Datetime ISO",
                value: d.toISOString(),
            },
            {
                label: "Datetime UTC",
                value: d.toUTCString(),
            },
            {
                label: "Datetime TimeZone",
                value: d.getTimezoneOffset(),
            },
        ],
    };
    metricGroups.push(dateMetricGroup);

    // --- CPU METRICS ---

    const cpuUsage = await getCpuUsage();
    const cpus = os.cpus();

    const cpuMetricGroup: MetricGroup = {
        type: "descriptions",
        title: "CPU",
        items: [
            {
                label: "CPU Core Number",
                value: cpus.length,
            },
            {
                label: "CPU Average Usage",
                value: cpuUsage.avg,
            },
            {
                label: "CPU User",
                value: cpus.reduce((a, b) => a + b.times.user, 0),
            },
            {
                label: "CPU System",
                value: cpus.reduce((a, b) => a + b.times.sys, 0),
            },
        ],
    };

    cpus.forEach((cpu, index) => {
        cpuMetricGroup.items.push({
            label: "CPU-" + (index + 1),
            value: `model: ${cpu.model}/ usage: ${cpuUsage.usages[index]}/ speed: ${cpu.speed}/User: ${cpu.times.user}/System: ${cpu.times.sys}`,
        });
    });

    const load = os.loadavg();
    cpuMetricGroup.items.push({
        label: "Load Averages",
        value: `1M: ${load[0]}/5M: ${load[1]}/15M: ${load[2]}`,
    });
    metricGroups.push(cpuMetricGroup);

    // startGCWatcher.call(this);
    // startEventLoopStats.call(this);

    metricTimelines[timestamp] = metricGroups;
    return metricTimelines;
}

// /**
//  * Start GC watcher listener.
//  */
// function startGCWatcher() {
//     // Load `gc-stats` module for GC metrics.
//     try {
//         const gc = require("gc-stats")();

//         /* istanbul ignore next */
//         if (gc) {
//             // --- GARBAGE COLLECTOR METRICS ---

//             this.register({
//                 name: METRIC.PROCESS_GC_TIME,
//                 type: METRIC.TYPE_GAUGE,
//                 unit: METRIC.UNIT_NANOSECONDS,
//                 description: "GC time",
//             });
//             this.register({
//                 name: METRIC.PROCESS_GC_TOTAL_TIME,
//                 type: METRIC.TYPE_GAUGE,
//                 unit: METRIC.UNIT_MILLISECONDS,
//                 description: "Total time of GC",
//             });
//             this.register({
//                 name: METRIC.PROCESS_GC_EXECUTED_TOTAL,
//                 type: METRIC.TYPE_GAUGE,
//                 labelNames: ["type"],
//                 unit: null,
//                 description: "Number of executed GC",
//             });

//             gc.on("stats", (stats) => {
//                 this.set(METRIC.PROCESS_GC_TIME, stats.pause);
//                 this.increment(METRIC.PROCESS_GC_TOTAL_TIME, null, stats.pause / 1e6);
//                 if (stats.gctype == 1) this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "scavenge" });
//                 if (stats.gctype == 2) this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "marksweep" });
//                 if (stats.gctype == 4) this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "incremental" });
//                 if (stats.gctype == 8) this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "weakphantom" });
//                 if (stats.gctype == 15) {
//                     this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "scavenge" });
//                     this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "marksweep" });
//                     this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "incremental" });
//                     this.increment(METRIC.PROCESS_GC_EXECUTED_TOTAL, { type: "weakphantom" });
//                 }
//             });
//         }
//     } catch (e) {
//         // silent
//     }
// }

// function startEventLoopStats() {
//     // Load `event-loop-stats` metric for Event-loop metrics.
//     try {
//         eventLoop = require("event-loop-stats");
//         if (eventLoop) {
//             this.register({
//                 name: METRIC.PROCESS_EVENTLOOP_LAG_MIN,
//                 type: METRIC.TYPE_GAUGE,
//                 unit: METRIC.UNIT_MILLISECONDS,
//                 description: "Minimum of event loop lag",
//             });
//             this.register({
//                 name: METRIC.PROCESS_EVENTLOOP_LAG_AVG,
//                 type: METRIC.TYPE_GAUGE,
//                 unit: METRIC.UNIT_MILLISECONDS,
//                 description: "Average of event loop lag",
//             });
//             this.register({
//                 name: METRIC.PROCESS_EVENTLOOP_LAG_MAX,
//                 type: METRIC.TYPE_GAUGE,
//                 unit: METRIC.UNIT_MILLISECONDS,
//                 description: "Maximum of event loop lag",
//             });
//             this.register({
//                 name: METRIC.PROCESS_EVENTLOOP_LAG_COUNT,
//                 type: METRIC.TYPE_GAUGE,
//                 description: "Number of event loop lag samples.",
//             });
//         }
//     } catch (e) {
//         // silent
//     }
// }

/**
 * Get OS user info (safe-mode)
 *
 * @returns
 */
function getUserInfo(): os.UserInfo<string> {
    try {
        return os.userInfo();
    } catch (e) {
        /* istanbul ignore next */
        return {
            username: "",
            uid: -1,
            gid: -1,
            shell: "",
            homedir: "",
        };
    }
}

interface InterfaceMap {
    [k: string]: os.NetworkInterfaceInfo;
}
function getNetworkInterfaces() {
    const interfaceMap: InterfaceMap = {};
    const interfaceMap_internal: InterfaceMap = {};
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        const infos = interfaces[iface];
        if (infos) {
            infos.forEach((info) => {
                if (info.internal) {
                    interfaceMap_internal[iface] = info;
                } else {
                    interfaceMap[iface] = info;
                }
            });
        }
    }
    return Object.keys(interfaceMap).length > 0 ? interfaceMap : interfaceMap_internal;
}

/**
 * Measure event loop lag.
 *
 * @returns {Promise<Number>}
 *
function measureEventLoopLag() {
	return new Promise(resolve => {
		const start = process.hrtime();
		setImmediate(() => {
			const delta = process.hrtime(start);
			resolve(delta[0] * 1e9 + delta[1]);
		});
	});
}*/
