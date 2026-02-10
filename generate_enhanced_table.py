import json

# Detailed mapping of Panel Titles to Description, Principle, and Tuning Usage
metric_details = {
    # --- PD Performance ---
    "PD Instance": {
        "desc": "PD 实例数量",
        "principle": "统计当前 PromQL 查询范围内（按 Label 分组）存活的 PD 实例（Prefill/Decode 角色）的总数。",
        "tuning": "**可用性监控**：用于确认集群规模是否符合预期。如果数量异常下降，提示 Pod Crash、被驱逐或调度异常，需立即介入排查 K8s 状态。"
    },
    "Pods by dprank": {
        "desc": "按 DP Rank 分组的 Pod 数量",
        "principle": "根据 Pipeline Parallelism (PP) 或 Data Parallelism (DP) 的 Rank 统计 Pod 分布情况。",
        "tuning": "**负载均衡校验**：确保各个 Rank 的 Pod 数量均匀。如果不均匀，可能导致某些 Rank 成为瓶颈，拖慢整体流水线效率。"
    },
    "[Prefill] E2E Request Latency in $region": {
        "desc": "Prefill 端到端请求延迟",
        "principle": "统计 Prefill 阶段处理请求的 P99/平均 耗时。涵盖从请求到达 Prefill 实例到 KV Cache 传输完成的全过程。",
        "tuning": "**核心 SLA 指标**：直接影响首字延迟（TTFT）。<br>1. 若延迟高，检查 Input Token 长度是否过长。<br>2. 检查计算资源（GPU）是否饱和。<br>3. 检查与 Decode 间的网络传输是否阻塞。"
    },
    "[Prefill] SGL Request": {
        "desc": "Prefill 请求处理数量",
        "principle": "统计 Prefill 实例接收并处理的请求速率（QPS）。",
        "tuning": "**流量监控**：反映系统负载压力。结合 Latency 指标看，若 QPS 升高导致 Latency 恶化，说明系统达到容量瓶颈，需扩容。"
    },
    "[Decode] Time To First Token": {
        "desc": "首字延迟（TTFT）",
        "principle": "从用户发送请求到收到第一个 Token 的时间间隔。在 PD 分离架构中，包含 Prefill 计算 + KV Cache 传输 + Decode 首次推理。",
        "tuning": "**用户体验核心指标**：<br>1. **高 TTFT** 通常由 Prefill 慢或传输慢导致。<br>2. 需对比 Prefill Latency 和 Transfer Latency 定位瓶颈环节。"
    },
    "[Decode] First Token Latency (By Cluster)": {
        "desc": "首字延迟（按集群统计）",
        "principle": "按集群维度聚合的 TTFT 指标。",
        "tuning": "**多集群对比**：用于发现特定集群的硬件或网络问题。若某集群显著慢于其他集群，需排查该集群的基础设施。"
    },
    "[Decode] E2E Request Latency in $region": {
        "desc": "Decode 端到端请求延迟",
        "principle": "统计请求在 Decode 阶段的耗时（从接收 KV Cache 到生成结束）。",
        "tuning": "**生成性能监控**：主要受 Output Token 长度影响。若单位 Token 耗时（TPOT）过高，说明 Decode 算力不足或显存带宽受限。"
    },
    "[Decode] SGL Request": {
        "desc": "Decode 请求处理数量",
        "principle": "统计 Decode 实例处理的请求速率。",
        "tuning": "**负载均衡**：应与 Prefill 请求数大致匹配。若偏差较大，可能存在请求路由丢失或统计口径不一致。"
    },
    "[Decode] Inter Token Latency": {
        "desc": "Token 间延迟 (ITL)",
        "principle": "Decode 阶段生成相邻两个 Token 之间的时间间隔（Time Per Output Token）。",
        "tuning": "**吞吐与延迟的权衡**：<br>1. **高 ITL** 意味着生成慢，用户感觉“卡顿”。<br>2. 原因通常是 Batch Size 过大导致计算延迟增加，或显存带宽瓶颈。<br>3. 需调整 Max Batch Size 或使用推测解码优化。"
    },
    "[Decode] Inter Token Latency (By Cluster)": {
        "desc": "Token 间延迟（按集群统计）",
        "principle": "按集群维度聚合的 ITL 指标。",
        "tuning": "**集群性能基线**：用于对比不同 GPU 型号或网络环境下的生成效率。"
    },
    "[Prefill] Running Requests in $region": {
        "desc": "Prefill 正在运行的请求数",
        "principle": "当前时刻 Prefill 实例正在并发处理的请求数量。",
        "tuning": "**并发度监控**：<br>1. 若接近 Max Concurrency 上限，新请求将进入队列。<br>2. 结合显存使用率，判断是否还有提升 Batch Size 的空间。"
    },
    "[Prefill] Running Request": {
        "desc": "Prefill 正在运行的请求数（按 Pod 统计）",
        "principle": "单 Pod 维度的并发请求数。",
        "tuning": "**负载不均排查**：检查是否有热点 Pod。若某 Pod 负载过高，可能是路由算法（Load Balancer）问题。"
    },
    "[Prefill] Avg Queue Size": {
        "desc": "Prefill 平均队列大小",
        "principle": "Prefill 实例内部等待调度的请求数量。",
        "tuning": "**饱和度告警**：<br>1. **Queue > 0** 意味着系统过载。<br>2. 短期堆积可容忍，长期堆积需扩容或限流。"
    },
    "[Prefill] Queue Size": {
        "desc": "Prefill 队列大小（按 Pod 统计）",
        "principle": "单 Pod 维度的等待队列长度。",
        "tuning": "**单点故障排查**：若仅个别 Pod 队列高，可能是该 Pod 卡死或处理慢请求（Long Context）。"
    },
    "[Decode] Running Requests in $region": {
        "desc": "Decode 正在运行的请求数",
        "principle": "Decode 实例当前的并发请求数。",
        "tuning": "**Batch Size 调优**：Decode 的并发数直接决定 Batch Size。并发越高，吞吐越大，但 ITL 可能变差。需寻找最佳平衡点。"
    },
    "[Decode] Running Request": {
        "desc": "Decode 正在运行的请求数（按 Pod 统计）",
        "principle": "单 Pod 维度的 Decode 并发数。",
        "tuning": "**路由均衡性**：确保请求均匀分发到各 Decode 实例。"
    },
    "[Decode] Avg Queues Size": {
        "desc": "Decode 平均队列大小",
        "principle": "Decode 实例等待调度的请求数。",
        "tuning": "**Decode 瓶颈**：若 Decode 队列堆积，说明生成速度跟不上请求到达速度。需增加 Decode 实例。"
    },
    "[Decode] Transfer Queue Size": {
        "desc": "Decode 传输队列大小（按 Pod 统计）",
        "principle": "等待从 Prefill 接收 KV Cache 的请求数量。",
        "tuning": "**传输阻塞**：若此队列高，说明网络传输是瓶颈，或 Decode 接收处理过慢。"
    },
    "[Prefill] Queue Size By Instance": {
        "desc": "Prefill 队列大小（按实例统计）",
        "principle": "各 Prefill 实例的请求积压情况。",
        "tuning": "**细粒度负载监控**：用于定位具体哪个实例是短板。"
    },
    "[Prefill] Pre-Alloc Queue Size By Instance": {
        "desc": "Prefill 预分配队列大小（按实例统计）",
        "principle": "等待预分配显存/KV Cache Block 的请求数。",
        "tuning": "**显存碎片/不足**：若此队列高，说明显存不足以容纳新请求，需优化内存管理或减少并发。"
    },
    "[Prefill] Inflight Queue Size By Instance": {
        "desc": "Prefill 传输中队列大小（按实例统计）",
        "principle": "正在进行 KV Cache 传输的请求数。",
        "tuning": "**网络并发控制**：限制同时传输的请求数以避免网络拥塞。"
    },
    "[Decode] Queue Size": {
        "desc": "Decode 队列大小（按 Pod 统计）",
        "principle": "Decode 实例的等待队列。",
        "tuning": "**资源不足**：直接反映 Decode 算力缺口。"
    },
    "[Decode] Pre-Alloc Queue Size": {
        "desc": "Decode 预分配队列大小（按 Pod 统计）",
        "principle": "Decode 端等待分配 KV Cache 插槽的请求数。",
        "tuning": "**KV Cache 容量瓶颈**：Decode 显存耗尽，无法接纳新请求。需增加 RadixAttention 显存比例或缩短 Context。"
    },
    "[Prefill] Bootstrap Latency": {
        "desc": "Prefill 启动延迟",
        "principle": "请求进入 Prefill 系统到开始计算的耗时（包含参数解析、分词等）。",
        "tuning": "**框架开销**：若过高，说明 Serving 框架（如 SGLang/vLLM）的调度器或 Python 逻辑有性能问题。"
    },
    "[Prefill] Waiting Latency": {
        "desc": "Prefill 等待延迟",
        "principle": "请求在队列中等待调度的时间。",
        "tuning": "**排队效应**：直接受并发度限制影响。若高，说明资源忙，需扩容。"
    },
    "[Prefill] Forward Latency": {
        "desc": "Prefill 转发延迟",
        "principle": "GPU 执行模型前向传播（Forward Pass）的时间。",
        "tuning": "**计算瓶颈**：<br>1. 与 Input Token 长度成平方/线性关系。<br>2. 若异常高，检查 GPU 频率或 Kernel 优化（FlashAttention）。"
    },
    "[Prefill] Transfer KV Cache Latency": {
        "desc": "Prefill KV Cache 传输延迟",
        "principle": "将 KV Cache 数据通过网络发送给 Decode 的耗时。",
        "tuning": "**PD 分离核心瓶颈**：<br>1. 检查网络带宽（IB/RoCE）。<br>2. 检查序列化/压缩效率。<br>3. 优化传输协议（如使用 RDMA）。"
    },
    "[Decode] Prepare Latency": {
        "desc": "Decode 准备延迟",
        "principle": "Decode 实例接收请求前的准备工作耗时。",
        "tuning": "**调度开销**：通常较短。若长，检查控制面通信延迟。"
    },
    "[Decode] Bootstrap Latency": {
        "desc": "Decode 启动延迟",
        "principle": "Decode 实例初始化请求状态的耗时。",
        "tuning": "**状态管理开销**：涉及 KV Cache 的加载和索引构建。"
    },
    "[Decode] Transferred Latency": {
        "desc": "Decode 传输延迟",
        "principle": "Decode 端视角下的 KV Cache 接收耗时（包含等待 Prefill 发送的时间）。",
        "tuning": "**端到端传输监控**：若远大于 Prefill 的 Transfer Latency，说明存在网络排队或 Decode 接收端处理慢。"
    },
    "[Decode] Waiting Latency": {
        "desc": "Decode 等待延迟",
        "principle": "请求在 Decode 队列中等待加入 Batch 的时间。",
        "tuning": "**调度策略优化**：若高，说明 Decode 忙于处理现有 Batch，无法插入新请求（Continuous Batching 策略）。"
    },
    "[Prefill] Bootstrap Latency By Instance": {
        "desc": "Prefill 启动延迟（按实例统计）",
        "principle": "单实例维度的启动延迟。",
        "tuning": "**异常节点检测**：排除个别节点 CPU 负载过高导致的调度慢。"
    },
    "[Prefill] Forward Latency By Instance": {
        "desc": "Prefill 转发延迟（按实例统计）",
        "principle": "单实例维度的计算延迟。",
        "tuning": "**GPU 性能一致性**：检查是否有 GPU 降频或散热问题。"
    },
    "[Prefill] Wait Latency By Instance": {
        "desc": "Prefill 等待延迟（按实例统计）",
        "principle": "单实例维度的排队延迟。",
        "tuning": "**负载分布**：验证请求分发算法是否导致某些实例排队更久。"
    },
    "[Prefill] Transfer Latency By Instance": {
        "desc": "Prefill 传输延迟（按实例统计）",
        "principle": "单实例维度的传输延迟。",
        "tuning": "**网络故障定位**：定位特定物理机或网卡的网络问题。"
    },
    "[Decode] Transferred Latency By Instance": {
        "desc": "Decode 传输延迟（按实例统计）",
        "principle": "单实例维度的接收延迟。",
        "tuning": "**接收端网络分析**：检查 Decode 节点的网络入口带宽。"
    },
    "[Prefill] Token Usage in $region": {
        "desc": "Prefill Token 使用率",
        "principle": "Prefill 实例 KV Cache 内存池的占用百分比。",
        "tuning": "**内存安全线**：<br>1. 保持在 80%-90% 为佳。<br>2. 100% 会触发 Eviction（驱逐），导致重计算，严重拖慢性能。<br>3. 过低则浪费显存。"
    },
    "[Prefill] Token Usage (By Cluster)": {
        "desc": "Prefill Token 使用率（按集群统计）",
        "principle": "集群维度的平均 Token 使用率。",
        "tuning": "**容量规划**：判断整个集群显存资源是否紧缺。"
    },
    "[Prefill] Token Usage": {
        "desc": "Prefill Token 使用率（按 Pod 统计）",
        "principle": "单 Pod 的显存占用率。",
        "tuning": "**OOM 预警**：防止个别 Pod 显存打满而 Crash。"
    },
    "[Prefill] Cached Tokens": {
        "desc": "Prefill 缓存 Token 数量速率",
        "principle": "系统中被缓存的 Token 总量变化速率。",
        "tuning": "**缓存效益分析**：结合 HitRate 使用，评估 RadixAttention 的效果。"
    },
    "[Decode] Token Usage in $region": {
        "desc": "Decode Token 使用率",
        "principle": "Decode 实例 KV Cache 内存池占用率。",
        "tuning": "**长文本支持能力**：<br>1. Decode 显存占用随生成的 Token 数增长。<br>2. 若频繁打满，限制了最大并发数或最大生成长度。"
    },
    "[Decode] Token Usage (By Cluster)": {
        "desc": "Decode Token 使用率（按集群统计）",
        "principle": "集群维度的 Decode 显存使用情况。",
        "tuning": "**资源分配**：决定是否需要分配更多显存给 KV Cache（相对于权重）。"
    },
    "[Decode] Token Usage": {
        "desc": "Decode Token 使用率（按 Pod 统计）",
        "principle": "单 Pod 显存使用率。",
        "tuning": "**稳定性监控**：监控显存泄漏或碎片化问题。"
    },
    "[Prefill] Prefix Cache HitRate": {
        "desc": "Prefill 前缀缓存命中率",
        "principle": "请求 Prompt 命中 KV Cache 前缀缓存（RadixAttention）的比例。",
        "tuning": "**性能倍增器**：<br>1. 命中率高能显著降低 Prefill Latency 和计算量。<br>2. 调优：通过请求路由优化（将相同前缀发往同一实例）来提升命中率。"
    },
    "[Prefill] Prefill Throughput in $region": {
        "desc": "Prefill 吞吐量",
        "principle": "单位时间处理的 Prompt Token 总数 (Tokens/s)。",
        "tuning": "**系统算力上限**：反映集群整体的 Prompt 处理能力。受限于 GPU FLOPs 和显存带宽。"
    },
    "[Prefill] Token Throughput / Instance (by Cluster)": {
        "desc": "Prefill 单实例 Token 吞吐量",
        "principle": "平均每个实例的处理吞吐量。",
        "tuning": "**单卡效率**：评估不同硬件（如 A100 vs H100）的实际表现。"
    },
    "[Prefill] Thoughput": {
        "desc": "Prefill 吞吐量（按 Pod 统计）",
        "principle": "单 Pod 吞吐量。",
        "tuning": "**异常检测**：发现吞吐量异常低的“慢节点”。"
    },
    "[Decode] Aborted Requests (by Cluster)": {
        "desc": "Decode 中止请求数",
        "principle": "客户端断开或超时的请求数量。",
        "tuning": "**服务质量 (QoS)**：<br>1. 飙升通常意味着服务端处理过慢导致客户端超时。<br>2. 需排查 Latency 升高原因。"
    },
    "[Prefill] Aborted Requests (by Cluster)": {
        "desc": "Prefill 中止请求数",
        "principle": "Prefill 阶段中止的请求。",
        "tuning": "**早期失败**：若请求在 Prefill 就中止，可能是队列积压太久。"
    },
    "[Decode] Generation Throughput in $region": {
        "desc": "Decode 生成吞吐量",
        "principle": "单位时间生成的 Token 总数 (Tokens/s)。",
        "tuning": "**生成能力指标**：反映集群对外的服务产出能力。"
    },
    "[Decode] Throughput / Instance (by Cluster)": {
        "desc": "Decode 单实例吞吐量",
        "principle": "平均单实例的生成速率。",
        "tuning": "**效率基准**：用于 Capacity Planning（容量规划）。"
    },
    "[Decode] Thoughput": {
        "desc": "Decode 吞吐量（按 Pod 统计）",
        "principle": "单 Pod 生成速率。",
        "tuning": "**节点健康度**：低吞吐可能意味着 GPU 故障或网络卡顿。"
    },
    "[Decode] Retracted Requests (by Cluster)": {
        "desc": "Decode 撤回请求数",
        "principle": "被系统主动撤回（Retract）的请求，通常发生在 KV Cache 抢占/重计算场景。",
        "tuning": "**系统颠簸**：<br>1. 出现此指标说明显存严重不足，正在发生“颠簸”。<br>2. 必须降低并发或扩容。"
    },
    "[Prefill] Avg iB Xmit Speed": {
        "desc": "Prefill 平均 IB 发送速度",
        "principle": "InfiniBand 网卡的发送带宽（Gbps）。主要流量是 KV Cache 传输。",
        "tuning": "**网络瓶颈监控**：<br>1. 若接近网卡物理上限（如 200Gbps/400Gbps），将成为硬瓶颈。<br>2. 需启用压缩或升级网络。"
    },
    "[Prefill] Avg iB Xmit Packet Rate": {
        "desc": "Prefill 平均 IB 发送包速率",
        "principle": "InfiniBand 网卡的发送包速率（PPS）。",
        "tuning": "**小包问题**：<br>1. 若带宽不高但 PPS 很高，说明存在大量小包。<br>2. 高 PPS 消耗 CPU，可能导致丢包。需优化传输 Batching。"
    },
    "[Decode] Accept Length Of Speculative": {
        "desc": "投机解码平均接受长度",
        "principle": "在使用投机解码（Speculative Decoding）时，大模型平均每次验证通过的小模型 Token 数量。",
        "tuning": "**加速比评估**：<br>1. 长度越大，加速效果越好。<br>2. 若长度接近 0，说明投机解码失效，反而增加开销，应关闭。"
    },
    "[Decode] Avg iB Recv Speed": {
        "desc": "Decode 平均 IB 接收速度",
        "principle": "Decode 节点接收数据的带宽。主要来自 Prefill 的 KV Cache。",
        "tuning": "**下游带宽监控**：确保 Decode 节点的接收能力不低于 Prefill 的发送能力。"
    },
    "[Decode] Avg iB Recv Packet Rate": {
        "desc": "Decode 平均 IB 接收包速率",
        "principle": "Decode 节点的接收包速率。",
        "tuning": "**软中断负载**：高 PPS 可能导致 ksoftirqd 占用 CPU 过高，影响推理线程。"
    },
    "[Prefill] Queue Lantency": {
        "desc": "Prefill 平均请求队列延迟",
        "principle": "最近采样周期内，请求在队列中的平均停留时间。",
        "tuning": "**即时拥塞指标**：比 Avg Queue Size 更直观地反映对 Latency 的影响。"
    },
    "[Decode] Queue Lantency": {
        "desc": "Decode 平均请求队列延迟",
        "principle": "Decode 阶段的排队时间。",
        "tuning": "**生成阻塞**：反映 Decode 计算资源的紧缺程度。"
    },
    "[Decode] Token Usage (By DP Rank)": {
        "desc": "Decode Token 使用率（按 DP Rank 统计）",
        "principle": "不同 Data Parallel Rank 的显存使用情况。",
        "tuning": "**负载偏斜**：检查是否有特定 Rank 负载过重。"
    },
    "[Decode] Running Req Num (By DP Rank)": {
        "desc": "Decode 运行请求数（按 DP Rank 统计）",
        "principle": "不同 DP Rank 的并发数。",
        "tuning": "**分发逻辑验证**：验证 DP 策略是否生效。"
    },

    # --- PD Network ---
    "Total Pod Bandwidth": {
        "desc": "所有 Decode 和 Prefill Pod 的总带宽",
        "principle": "集群内与 LLM 服务相关的所有容器网络流量总和。",
        "tuning": "**网络大盘**：监控集群网络总负载，评估交换机/核心层压力。"
    },
    "Pod Network Receive Rate": {
        "desc": "Pod 网络接收速率",
        "principle": "容器网络接口（eth0）的入向流量。",
        "tuning": "**流量分析**：Decode Pod 接收高（KV Cache），Prefill Pod 接收高（Input Data）。"
    },
    "Pod Network Transmit Rate": {
        "desc": "Pod 网络发送速率",
        "principle": "容器网络接口（eth0）的出向流量。",
        "tuning": "**流量分析**：Prefill Pod 发送高（KV Cache），Decode Pod 发送高（Output Data - 较小）。"
    },
    "Pod RX/TX Ratio": {
        "desc": "Pod 接收/发送比率 (RX/TX)",
        "principle": "接收流量与发送流量的比值。",
        "tuning": "**角色行为验证**：<br>1. Prefill 节点通常 TX > RX（产生 KV Cache）。<br>2. Decode 节点通常 RX > TX（接收 KV Cache）。<br>3. 比例异常说明角色分配或路由错误。"
    },
    "Decode Pods RX Rate per Instance": {
        "desc": "Decode Pod 单实例接收速率",
        "principle": "平均每个 Decode Pod 的接收带宽。",
        "tuning": "**接收瓶颈**：若单实例打满网卡，限制扩容效果。"
    },
    "Decode Pods TX Rate per Instance": {
        "desc": "Decode Pod 单实例发送速率",
        "principle": "平均每个 Decode Pod 的发送带宽。",
        "tuning": "**异常流量**：通常 Decode 发送量小，若高需排查是否误传大量数据。"
    },
    "Prefill Pods RX Rate per Instance": {
        "desc": "Prefill Pod 单实例接收速率",
        "principle": "平均每个 Prefill Pod 的接收带宽。",
        "tuning": "**数据加载监控**：反映 Prompt 输入的数据量。"
    },
    "Prefill Pods TX Rate per Instance": {
        "desc": "Prefill Pod 单实例发送速率",
        "principle": "平均每个 Prefill Pod 的发送带宽。",
        "tuning": "**传输压力**：关键指标。若过高，需考虑增加 Prefill 节点分摊流量。"
    },
    "Decode Pods RX - Max/Avg/Mean": {
        "desc": "Decode Pods 接收速率统计",
        "principle": "接收速率的统计分布（最大值、平均值）。",
        "tuning": "**长尾问题**：Max 远大于 Avg 说明存在数据倾斜（某些 Pod 处理了超大 Context）。"
    },
    "Decode Pods TX - Max/Avg/Mean": {
        "desc": "Decode Pods 发送速率统计",
        "principle": "发送速率的统计分布。",
        "tuning": "**均衡性分析**：检查发送流量是否均匀。"
    },
    "Prefill Pods RX - Max/Avg/Mean": {
        "desc": "Prefill Pods 接收速率统计",
        "principle": "Prefill 接收速率分布。",
        "tuning": "**输入倾斜**：Max 高说明请求长度分布极不均匀。"
    },
    "Prefill Pods TX - Max/Avg/Mean": {
        "desc": "Prefill Pods 发送速率统计",
        "principle": "Prefill 发送速率分布。",
        "tuning": "**输出热点**：Max 高可能是某个 Pod 承担了超长 Context 的 KV 传输。"
    },
    "IB RX（Decode Scoped)": {
        "desc": "IB 接收速率（Decode 范围）",
        "principle": "Decode 节点 RDMA/IB 网卡的接收速率。",
        "tuning": "**RDMA 监控**：确认 KV Cache 是否走在高速 IB 网络上。"
    },
    "IB TX（Decode Scoped)": {
        "desc": "IB 发送速率（Decode 范围）",
        "principle": "Decode 节点 RDMA/IB 网卡的发送速率。",
        "tuning": "**ACK/控制流**：通常较低，主要用于协议交互。"
    },
    "IB RX（Prefill Scoped)": {
        "desc": "IB 接收速率（Prefill 范围）",
        "principle": "Prefill 节点 IB 接收速率。",
        "tuning": "**RDMA 监控**：通常较低。"
    },
    "IB TX（Prefill Scoped)": {
        "desc": "IB 发送速率（Prefill 范围）",
        "principle": "Prefill 节点 IB 发送速率（核心数据流）。",
        "tuning": "**物理瓶颈**：直接对照交换机端口限速。"
    },
    "IB RX/TX Ratio": {
        "desc": "IB 接收/发送比率",
        "principle": "IB 网络的收发比。",
        "tuning": "**网络健康度**：极端比例可能暗示单向链路拥塞。"
    },
    "InfiniBand Network Transmit Wait": {
        "desc": "InfiniBand 网络发送等待",
        "principle": "IB 端口因拥塞控制（Head-of-Line Blocking 或 Credit 不足）而暂停发送的次数/时间。",
        "tuning": "**网络拥塞金指标**：<br>1. **值 > 0** 意味着物理网络发生拥塞（PFC 触发）。<br>2. 需优化网络拓扑、QoS 配置或减少 Burst 流量。"
    }
}

def generate_consolidated_markdown_table(data, sections):
    markdown = "| Panel Group | Panel Title | Description | Principle Explanation | Tuning Role & Usage | Query/Expression |\n"
    markdown += "|---|---|---|---|---|---|\n"
    
    for section_name in sections:
        panels = data.get(section_name, [])
        if not panels:
            continue
        
        for panel in panels:
            title = panel['title']
            details = metric_details.get(title, {})
            
            # Get details or fallback
            desc = details.get("desc", panel['description'])
            principle = details.get("principle", "暂无详细原理解释")
            tuning = details.get("tuning", "暂无调优建议")
            
            # Escape for Markdown table
            def escape_md(text):
                if not text: return ""
                return text.replace('|', '\\|').replace('\n', '<br>')

            group_esc = escape_md(section_name)
            title_esc = escape_md(title)
            desc_esc = escape_md(desc)
            principle_esc = escape_md(principle)
            tuning_esc = escape_md(tuning)
            
            expr = panel['expr'].replace('|', '\\|').replace('\n', ' ')
            expr = expr.replace('`', '\\`')
            if expr:
                expr = f"`{expr}`"
                
            markdown += f"| {group_esc} | {title_esc} | {desc_esc} | {principle_esc} | {tuning_esc} | {expr} |\n"
            
    return markdown

try:
    with open('output.json', 'r') as f:
        data = json.load(f)

    # Define the sections to include
    sections = ['PD Performance', 'PD Network']
    print(generate_consolidated_markdown_table(data, sections))
except Exception as e:
    print(f"Error: {e}")
