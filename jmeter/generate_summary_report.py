#!/usr/bin/env python3
"""
JMeter JTL to GitHub Step Summary & Quality Gate Parser
Generates standard JMeter Summary/Aggregate Markdown Report for CI/CD pipelines.
"""

import sys
import os
import csv
import math

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def calculate_percentile(sorted_data, percentile):
    if not sorted_data:
        return 0.0
    k = (len(sorted_data) - 1) * (percentile / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return float(sorted_data[int(k)])
    d0 = sorted_data[int(f)] * (c - k)
    d1 = sorted_data[int(c)] * (k - f)
    return float(d0 + d1)

def parse_jtl(jtl_file, max_error_rate=5.0, max_p95_ms=4000.0):
    if not os.path.exists(jtl_file):
        print(f"[ERROR] JTL file not found: {jtl_file}", file=sys.stderr)
        return None, False

    stats = {}
    total_samples = 0
    total_errors = 0
    all_times = []
    all_bytes = 0
    all_sent_bytes = 0
    min_timestamp = float('inf')
    max_timestamp = 0

    with open(jtl_file, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            label = row.get('label', 'Unknown')
            try:
                elapsed = float(row.get('elapsed', 0))
                bytes_received = float(row.get('bytes', 0))
                bytes_sent = float(row.get('sentBytes', 0))
                ts = float(row.get('timeStamp', 0))
            except ValueError:
                continue

            success = row.get('success', 'true').lower() == 'true'

            if label not in stats:
                stats[label] = {
                    "samples": 0,
                    "times": [],
                    "errors": 0,
                    "bytes": 0,
                    "sent_bytes": 0,
                    "min_ts": float('inf'),
                    "max_ts": 0
                }

            stats[label]["samples"] += 1
            stats[label]["times"].append(elapsed)
            stats[label]["bytes"] += bytes_received
            stats[label]["sent_bytes"] += bytes_sent
            stats[label]["min_ts"] = min(stats[label]["min_ts"], ts)
            stats[label]["max_ts"] = max(stats[label]["max_ts"], ts + elapsed)

            total_samples += 1
            all_times.append(elapsed)
            all_bytes += bytes_received
            all_sent_bytes += bytes_sent
            min_timestamp = min(min_timestamp, ts)
            max_timestamp = max(max_timestamp, ts + elapsed)

            if not success:
                stats[label]["errors"] += 1
                total_errors += 1

    if total_samples == 0:
        print("[WARNING] No samples found in JTL file", file=sys.stderr)
        return None, False

    total_duration_sec = max((max_timestamp - min_timestamp) / 1000.0, 0.001)

    # Build Markdown Report
    md = []
    md.append("## 🚀 JMeter Performance Test Summary Report")
    md.append("")
    md.append(f"> **📊 Total Samples:** `{total_samples}` | **⏱️ Duration:** `{total_duration_sec:.2f}s` | **⚡ Throughput:** `{total_samples / total_duration_sec:.2f} req/s` | **❌ Total Errors:** `{total_errors} ({(total_errors/total_samples)*100:.2f}%)`")
    md.append("")
    md.append("| Sampler Label | # Samples | Avg (ms) | Median | 90% Line | 95% Line | 99% Line | Min | Max | Error % | Throughput | Status |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |")

    sla_passed = True

    for label, d in stats.items():
        s = d["samples"]
        times = sorted(d["times"])
        avg_t = sum(times) / s
        med_t = calculate_percentile(times, 50)
        p90_t = calculate_percentile(times, 90)
        p95_t = calculate_percentile(times, 95)
        p99_t = calculate_percentile(times, 99)
        min_t = times[0]
        max_t = times[-1]
        err_pct = (d["errors"] / s) * 100.0
        
        label_duration = max((d["max_ts"] - d["min_ts"]) / 1000.0, 0.001)
        tput = s / label_duration

        is_item_pass = (err_pct <= max_error_rate) and (p95_t <= max_p95_ms)
        if not is_item_pass:
            sla_passed = False
        status_badge = "✅ PASS" if is_item_pass else "❌ FAIL"

        md.append(f"| **{label}** | {s} | {avg_t:.1f} | {med_t:.1f} | {p90_t:.1f} | {p95_t:.1f} | {p99_t:.1f} | {min_t:.0f} | {max_t:.0f} | {err_pct:.2f}% | {tput:.2f}/s | {status_badge} |")

    # TOTAL ROW
    all_times.sort()
    tot_avg = sum(all_times) / total_samples
    tot_med = calculate_percentile(all_times, 50)
    tot_p90 = calculate_percentile(all_times, 90)
    tot_p95 = calculate_percentile(all_times, 95)
    tot_p99 = calculate_percentile(all_times, 99)
    tot_min = all_times[0]
    tot_max = all_times[-1]
    tot_err_pct = (total_errors / total_samples) * 100.0
    tot_tput = total_samples / total_duration_sec
    overall_status = "✅ PASSED" if sla_passed else "❌ FAILED"

    md.append(f"| **TOTAL** | **{total_samples}** | **{tot_avg:.1f}** | **{tot_med:.1f}** | **{tot_p90:.1f}** | **{tot_p95:.1f}** | **{tot_p99:.1f}** | **{tot_min:.0f}** | **{tot_max:.0f}** | **{tot_err_pct:.2f}%** | **{tot_tput:.2f}/s** | **{overall_status}** |")
    md.append("")
    md.append("### 🎯 Quality Gate Evaluation")
    md.append(f"- **Max Allowed Error Rate:** `{max_error_rate}%` $\\rightarrow$ Actual: `{tot_err_pct:.2f}%` ({'✅ Satisfied' if tot_err_pct <= max_error_rate else '❌ Violated'})")
    md.append(f"- **Max Allowed P95 Latency:** `{max_p95_ms}ms` $\\rightarrow$ Actual: `{tot_p95:.1f}ms` ({'✅ Satisfied' if tot_p95 <= max_p95_ms else '❌ Violated'})")
    md.append("")
    md.append("---")
    md.append("*💡 Download full HTML Dashboard Report from Workflow Artifacts for deep graphical analysis.*")

    report_content = "\n".join(md)
    return report_content, sla_passed

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_summary_report.py <path_to_jtl_file> [max_error_rate] [max_p95_ms]")
        sys.exit(1)

    jtl_path = sys.argv[1]
    max_err = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
    max_p95 = float(sys.argv[3]) if len(sys.argv) > 3 else 4000.0

    report, passed = parse_jtl(jtl_path, max_err, max_p95)
    if report:
        print(report)

        # If GITHUB_STEP_SUMMARY environment variable exists, write to it
        github_step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if github_step_summary:
            with open(github_step_summary, "a", encoding="utf-8") as f:
                f.write(report + "\n")

    sys.exit(0 if passed else 1)
