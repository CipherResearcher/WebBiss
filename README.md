# WebBiss — DVB-CSA1/BISS Security Notes & GPU Performance Context

This project explores high-throughput key-search characteristics of DVB-CSA1 as used in BISS (commonly “BISS-1”-style fixed control words). The focus is the interaction between an older 48-bit effective key space and modern GPU compute, and what that implies for practical security margins.

## Practical Non-Applicability to Live TV

Modern pay-TV and cable/terrestrial broadcast systems typically rotate control words (CW) at very short intervals (often multiple times per minute, and in some deployments even faster). Any approach that requires brute-forcing a CW or a related secret within those intervals is not operationally useful: the search time for a single key vastly exceeds the renewal interval.

As a result, this project has no practical value for live decryption of commercial pay-TV channels and is not realistically applicable as a “working cracking tool”. It is best understood as a controlled proof-of-concept for:

- academic discussion of legacy cipher security margins,
- GPU compute and memory-behavior benchmarking,
- performance engineering experiments on parallel key-search kernels.

## Security Perspective (DVB-CSA1 / BISS-1)

### Effective Key Size

DVB-CSA1 uses a 64-bit control word format, but practical deployments often have an effective security level closer to 48 bits for the secret key material that governs the scrambling control word generation used by BISS-1-like schemes. A 48-bit brute-force search is within reach of contemporary GPUs and, critically, can be parallelized almost perfectly.

### Known-Plaintext Structure

Many MPEG-TS payloads contain highly structured or predictable byte patterns (e.g., PES headers, start codes, adaptation field conventions, codec container markers). That structure can be leveraged for rapid candidate rejection (“early-out” validation), which further reduces the cost per tested key in a brute-force setting.

### What This Means for Risk

From a defensive standpoint:

- Fixed-key schemes with ~48-bit effective security are not future-proof against commodity or prosumer GPU throughput.
- Attack cost is dominated by compute throughput and memory behavior, not by network conditions.
- Security depends heavily on key rotation, access control, and operational practices—not the cipher alone.

If confidentiality is a requirement against well-resourced adversaries, treat DVB-CSA1 / fixed-key BISS-1-style deployments as legacy technology with limited brute-force resistance.

## Modern GPU Throughput Considerations

### Why GPUs Help

Key search is embarrassingly parallel: each candidate key can be tested independently. GPUs offer:

- Massive ALU parallelism (thousands of lanes in flight)
- High memory bandwidth for lookup-heavy code paths (subject to cache behavior)
- Efficient rejection pipelines when candidate validation is cheap relative to key scheduling

### Architectural Bottlenecks

Practical throughput depends on:

- Register pressure (limits occupancy)
- Lookup-table access patterns (cache hit rates vs random access)
- Branch divergence (early-out paths must be carefully shaped)
- Dispatch sizing and host↔GPU synchronization overheads

The most meaningful numbers are produced by timing steady-state kernels over large batches and avoiding per-dispatch CPU overhead dominating the measurement.

## Legal / Ethical Use

This code can be used to evaluate the brute-force resistance of legacy broadcast scrambling in controlled environments. It must only be used on content, signals, or systems that you own or are explicitly authorized to test.

## License

This project is licensed under the GNU General Public License (GPL), version 3 or later (GPL-3.0-or-later).

## Disclaimer

This repository is provided strictly for educational, defensive security research, and performance engineering purposes. The authors and contributors:

- do not endorse, encourage, or facilitate unauthorized access to any broadcast, stream, or protected content;
- make no guarantees about correctness, fitness, or safety of the code;
- are not responsible for any misuse, damages, legal consequences, or third-party claims arising from use of this software.

You are solely responsible for ensuring your activities comply with applicable laws, regulations, contracts, and policies in your jurisdiction and context.

## Speed
| Device Name      | Stream Slice Mode | Bit Slice Mode |
|------------------|-------------------|----------------|
| Apple M4         | **800 M/s**       | 200 M/s        |
| Apple A18 Pro    | **290 M/s**       | 68 M/s         |
| NVIDIA RTX 4070S | 800 M/s           | **3400 M/s**   |
| Intel            | N/A               | N/A            |
| AMD              | N/A               | N/A            |

> Performance varies significantly across platforms and kernel types. On Apple devices (M4 and A18 Pro), the stream slice mode is 4× faster than bit slice mode. In contrast, on an NVIDIA RTX 4070 Super, bit slice mode outperforms stream slice by over 4×. Additionally, compared to native APIs, WebGPU achieves approximately 60% of native performance on Windows (~40% slower) and about 80% on macOS (~20% slower).

## References

- [aycwabtu](https://github.com/aycwabtu/aycwabtu)
- [DVB-CSA1 bruteforce](https://github.com/Greek64/DVB-CSA1_bruteforce)
- [On the Security of Digital Video Broadcast Encryption](https://informatik.rub.de/wp-content/uploads/2021/11/da_diett.pdf)
- [WebGPU Specification](https://gpuweb.github.io/gpuweb/)
- [Unlock GPU computing with WebGPU](https://developer.apple.com/videos/play/wwdc2025/236/)
