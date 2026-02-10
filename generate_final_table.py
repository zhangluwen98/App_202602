import json

# Mapping of Panel Titles to Chinese Descriptions
# Some titles appear multiple times, so we map by Title string. 
# Ideally we should also check the description but many are empty.
# For those with existing descriptions, we will replace them with Chinese.

translations = {
    # PD Performance
    "PD Instance": "PD 实例数量",
    "Pods by dprank": "按 DP Rank 分组的 Pod 数量",
    "[Prefill] E2E Request Latency in $region": "Prefill 端到端请求延迟（Prefill-Decode 分离模式）",
    "[Prefill] SGL Request": "Prefill 请求处理数量（Prefill-Decode 分离模式）",
    "[Decode] Time To First Token": "首字延迟（TTFT）。在 PD 分离模式下，Decode 实例负责输出首个 Token",
    "[Decode] First Token Latency (By Cluster)": "首字延迟（按集群统计）（Prefill-Decode 分离模式）",
    "[Decode] E2E Request Latency in $region": "Decode 端到端请求延迟（Prefill-Decode 分离模式）",
    "[Decode] SGL Request": "Decode 请求处理数量（Prefill-Decode 分离模式）",
    "[Decode] Inter Token Latency": "Token 间延迟 (ITL)，即输出 Token 间的延迟，反映 Decode 阶段的延迟",
    "[Decode] Inter Token Latency (By Cluster)": "Token 间延迟（按集群统计）（Prefill-Decode 分离模式）",
    "[Prefill] Running Requests in $region": "Prefill 正在运行的请求数",
    "[Prefill] Running Request": "Prefill 正在运行的请求数（按 Pod 统计）",
    "[Prefill] Avg Queue Size": "Prefill 平均队列大小，即等待队列中的请求数",
    "[Prefill] Queue Size": "Prefill 队列大小（按 Pod 统计）",
    "[Decode] Running Requests in $region": "Decode 正在运行的请求数",
    "[Decode] Running Request": "Decode 正在运行的请求数（按 Pod 统计）",
    "[Decode] Avg Queues Size": "Decode 平均队列大小，即等待队列中的请求数",
    "[Decode] Transfer Queue Size": "Decode 传输队列大小（按 Pod 统计）",
    "[Prefill] Queue Size By Instance": "Prefill 队列大小（按实例统计）",
    "[Prefill] Pre-Alloc Queue Size By Instance": "Prefill 预分配队列大小（按实例统计）",
    "[Prefill] Inflight Queue Size By Instance": "Prefill 传输中队列大小（按实例统计）",
    "[Decode] Queue Size": "Decode 队列大小（按 Pod 统计）",
    "[Decode] Pre-Alloc Queue Size": "Decode 预分配队列大小（按 Pod 统计）",
    "[Decode] Transfer Queue Size": "Decode 传输队列大小（按 Pod 统计）",
    "[Prefill] Bootstrap Latency": "Prefill 启动延迟",
    "[Prefill] Waiting Latency": "Prefill 等待延迟（请求已启动但在等待其他请求转发）",
    "[Prefill] Forward Latency": "Prefill 转发延迟",
    "[Prefill] Transfer KV Cache Latency": "Prefill KV Cache 传输延迟",
    "[Decode] Prepare Latency": "Decode 准备延迟（Decode 实例启动前的第一阶段）",
    "[Decode] Bootstrap Latency": "Decode 启动延迟",
    "[Decode] Transferred Latency": "Decode 传输延迟（KV Cache 传输完成前的延迟，包含 Prefill 端的启动+转发+传输）",
    "[Decode] Waiting Latency": "Decode 等待延迟（请求已启动但等待与其他请求批处理转发，通常因 Token 用满或达到最大运行请求数）",
    "[Prefill] Bootstrap Latency By Instance": "Prefill 启动延迟（按实例统计）",
    "[Prefill] Forward Latency By Instance": "Prefill 转发延迟（按实例统计）",
    "[Prefill] Wait Latency By Instance": "Prefill 等待延迟（按实例统计）",
    "[Prefill] Transfer Latency By Instance": "Prefill 传输延迟（按实例统计）",
    "[Decode] Transferred Latency By Instance": "Decode 传输延迟（按实例统计）",
    "[Prefill] Token Usage in $region": "Prefill Token 使用率（反映服务器 KV Cache 内存利用率）",
    "[Prefill] Token Usage (By Cluster)": "Prefill Token 使用率（按集群统计）",
    "[Prefill] Token Usage": "Prefill Token 使用率（按 Pod 统计）",
    "[Prefill] Cached Tokens": "Prefill 缓存 Token 数量速率",
    "[Decode] Token Usage in $region": "Decode Token 使用率（反映服务器 KV Cache 内存利用率）",
    "[Decode] Token Usage (By Cluster)": "Decode Token 使用率（按集群统计）",
    "[Decode] Token Usage": "Decode Token 使用率（按 Pod 统计）",
    "[Prefill] Prefix Cache HitRate": "Prefill 前缀缓存命中率",
    "[Prefill] Prefill Throughput in $region": "Prefill 吞吐量（处理的 Token 总数）",
    "[Prefill] Token Throughput / Instance (by Cluster)": "Prefill 单实例 Token 吞吐量（按集群统计）",
    "[Prefill] Thoughput": "Prefill 吞吐量（按 Pod 统计）",
    "[Decode] Aborted Requests (by Cluster)": "Decode 中止请求数（按集群统计）",
    "[Prefill] Aborted Requests (by Cluster)": "Prefill 中止请求数（按集群统计）",
    "[Decode] Generation Throughput in $region": "Decode 生成吞吐量",
    "[Decode] Throughput / Instance (by Cluster)": "Decode 单实例吞吐量（按集群统计）",
    "[Decode] Thoughput": "Decode 吞吐量（按 Pod 统计，生成的 Token 数）",
    "[Decode] Retracted Requests (by Cluster)": "Decode 撤回请求数（按集群统计）",
    "[Prefill] Avg iB Xmit Speed": "Prefill 平均 IB 发送速度",
    "[Prefill] Avg iB Xmit Packet Rate": "Prefill 平均 IB 发送包速率",
    "[Decode] Accept Length Of Speculative": "投机解码平均接受长度",
    "[Decode] Avg iB Recv Speed": "Decode 平均 IB 接收速度",
    "[Decode] Avg iB Recv Packet Rate": "Decode 平均 IB 接收包速率",
    "[Prefill] Queue Lantency": "Prefill 平均请求队列延迟（最近一批请求）",
    "[Decode] Queue Lantency": "Decode 平均请求队列延迟（最近一批请求）",
    "[Decode] Token Usage (By DP Rank)": "Decode Token 使用率（按 DP Rank 统计）",
    "[Decode] Running Req Num (By DP Rank)": "Decode 运行请求数（按 DP Rank 统计）",

    # PD Network
    "Total Pod Bandwidth": "所有 Decode 和 Prefill Pod 的总带宽 (RX + TX)",
    "Pod Network Receive Rate": "Pod 网络接收速率",
    "Pod Network Transmit Rate": "Pod 网络发送速率",
    "Pod RX/TX Ratio": "Pod 接收/发送比率 (RX/TX)",
    "Decode Pods RX Rate per Instance": "Decode Pod 单实例接收速率",
    "Decode Pods TX Rate per Instance": "Decode Pod 单实例发送速率",
    "Prefill Pods RX Rate per Instance": "Prefill Pod 单实例接收速率",
    "Prefill Pods TX Rate per Instance": "Prefill Pod 单实例发送速率",
    "Decode Pods RX - Max/Avg/Mean": "Decode Pods 接收速率统计 (最大/平均/均值)",
    "Decode Pods TX - Max/Avg/Mean": "Decode Pods 发送速率统计 (最大/平均/均值)",
    "Prefill Pods RX - Max/Avg/Mean": "Prefill Pods 接收速率统计 (最大/平均/均值)",
    "Prefill Pods TX - Max/Avg/Mean": "Prefill Pods 发送速率统计 (最大/平均/均值)",
    "IB RX（Decode Scoped)": "IB 接收速率（Decode 范围）",
    "IB TX（Decode Scoped)": "IB 发送速率（Decode 范围）",
    "IB RX（Prefill Scoped)": "IB 接收速率（Prefill 范围）",
    "IB TX（Prefill Scoped)": "IB 发送速率（Prefill 范围）",
    "IB RX/TX Ratio": "IB 接收/发送比率",
    "InfiniBand Network Transmit Wait": "InfiniBand 网络发送等待",
}

def generate_markdown_table(data, section_name):
    panels = data.get(section_name, [])
    if not panels:
        return f"No panels found for {section_name}"
    
    markdown = f"### {section_name}\n\n"
    markdown += "| Panel Title | Description | Query/Expression |\n"
    markdown += "|---|---|---|\n"
    
    for panel in panels:
        title = panel['title']
        # Use translation if available, otherwise fallback to existing description, or empty string
        desc = translations.get(title, panel['description'])
        
        # Format for Markdown table
        title_esc = title.replace('|', '\\|')
        desc_esc = desc.replace('|', '\\|').replace('\n', '<br>')
        expr = panel['expr'].replace('|', '\\|').replace('\n', ' ')
        expr = expr.replace('`', '\\`')
        if expr:
            expr = f"`{expr}`"
            
        markdown += f"| {title_esc} | {desc_esc} | {expr} |\n"
        
    return markdown

try:
    with open('output.json', 'r') as f:
        data = json.load(f)

    print(generate_markdown_table(data, 'PD Performance'))
    print("\n")
    print(generate_markdown_table(data, 'PD Network'))
except Exception as e:
    print(f"Error: {e}")
