# 📋 NetAegis Column Mapping Reference

NetAegis automatically maps column names from different network monitoring tools. Use any of these column names in your **CSV**, **JSON**, or **manual entry**.

## 🎯 Quick Reference Table

| **Required Field** | **Alternative Names** | **Tool Examples** |
|-------------------|----------------------|-------------------|
| `src_ip` | `source_ip`, `sourceip`, `source_address`, `src_addr`, `origin_ip`, `orig_h`, `ip.src`, `srcip`, `saddr`, `source`, `from_ip`, `client_ip` | Zeek: `orig_h`, Wireshark: `ip.src` |
| `dst_ip` | `dest_ip`, `destination_ip`, `destip`, `dst_addr`, `target_ip`, `resp_h`, `ip.dst`, `dstip`, `daddr`, `destination`, `to_ip`, `server_ip` | Zeek: `resp_h`, Wireshark: `ip.dst` |
| `src_port` | `source_port`, `sourceport`, `src_prt`, `origin_port`, `orig_p`, `tcp.srcport`, `udp.srcport`, `srcport`, `sport`, `from_port`, `client_port` | Zeek: `orig_p`, Wireshark: `tcp.srcport` |
| `dst_port` | `dest_port`, `destination_port`, `destport`, `dst_prt`, `target_port`, `resp_p`, `tcp.dstport`, `udp.dstport`, `dstport`, `dport`, `to_port`, `server_port` | Zeek: `resp_p`, Wireshark: `tcp.dstport` |
| `proto` | `protocol`, `prot`, `protocol_type`, `ip_protocol`, `ip.proto`, `frame.protocols`, `l4_proto`, `transport` | Wireshark: `ip.proto` |
| `service` | `svc`, `srv`, `service_type`, `application`, `app`, `protocol_service`, `port_service` | - |
| `duration` | `time`, `dur`, `connection_time`, `flow_duration`, `session_time`, `elapsed`, `total_time` | - |
| `src_bytes` | `source_bytes`, `src_size`, `origin_bytes`, `orig_bytes`, `orig_ip_bytes`, `client_bytes`, `upload_bytes`, `sent_bytes`, `tx_bytes` | Zeek: `orig_bytes` |
| `dst_bytes` | `destination_bytes`, `dest_bytes`, `dst_size`, `target_bytes`, `resp_bytes`, `resp_ip_bytes`, `server_bytes`, `download_bytes`, `received_bytes`, `rx_bytes` | Zeek: `resp_bytes` |
| `conn_state` | `state`, `connection_state`, `conn_status`, `status`, `tcp_state`, `flow_state`, `session_state` | - |
| `src_pkts` | `source_packets`, `src_count`, `origin_packets`, `orig_pkts`, `client_packets`, `upload_packets`, `sent_packets`, `tx_packets`, `srcpkts` | Zeek: `orig_pkts` |
| `dst_pkts` | `destination_packets`, `dest_packets`, `dst_count`, `target_packets`, `resp_pkts`, `server_packets`, `download_packets`, `received_packets`, `rx_packets`, `dstpkts` | Zeek: `resp_pkts` |
| `label` | `attack_type`, `threat_type`, `class`, `target`, `attack`, `threat`, `classification`, `category`, `malware`, `intrusion`, `anomaly`, `normal`, `benign` | - |

## 📊 Example CSV Formats

### Standard Format
```csv
src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,missed_bytes,src_pkts,src_ip_bytes,dst_pkts,dst_ip_bytes,dns_query,dns_qclass,dns_qtype,dns_rcode,dns_AA,dns_RD,dns_RA,dns_rejected,http_request_body_len,http_response_body_len,http_status_code,label
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,1
```

### Wireshark Export Format
```csv
ip.src,tcp.srcport,ip.dst,tcp.dstport,ip.proto,service,time,source_bytes,dest_bytes,state,lost,source_packets,src_ip_size,dest_packets,dst_ip_size,dns.qry.name,dns.qry.class,dns.qry.type,dns.flags.rcode,dns.flags.authoritative,dns.flags.recdesired,dns.flags.recavail,rejected,http.request.body.len,http.response.body.len,http.response.code,attack_type
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,1
```

### Zeek/Bro Format
```csv
orig_h,orig_p,resp_h,resp_p,protocol,srv,dur,orig_bytes,resp_bytes,conn_state,missed_bytes,orig_pkts,orig_ip_bytes,resp_pkts,resp_ip_bytes,dns_q,dns_qc,dns_qt,dns_rc,dns_aa,dns_rd,dns_ra,dns_rej,http_req_len,http_resp_len,http_code,classification
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,1
```

### Custom Format
```csv
source_ip,source_port,dest_ip,dest_port,protocol,application,connection_time,upload_bytes,download_bytes,status,lost_bytes,sent_packets,client_ip_bytes,received_packets,server_ip_bytes,query,qclass,qtype,rcode,authoritative,recursion_desired,recursion_available,rejected,request_body_length,response_body_length,status_code,threat_type
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,1
```

## 🔧 JSON Format Examples

### Single Record
```json
{
  "source_ip": "192.168.1.1",
  "source_port": 80,
  "dest_ip": "192.168.1.2",
  "dest_port": 443,
  "protocol": "tcp",
  "application": "http",
  "connection_time": 1.5,
  "upload_bytes": 1024,
  "download_bytes": 2048,
  "status": "SF",
  "lost_bytes": 0,
  "sent_packets": 10,
  "client_ip_bytes": 1024,
  "received_packets": 8,
  "server_ip_bytes": 2048,
  "query": 0,
  "qclass": 0,
  "qtype": 0,
  "rcode": 0,
  "authoritative": "none",
  "recursion_desired": "none",
  "recursion_available": "none",
  "rejected": "none",
  "request_body_length": 0,
  "response_body_length": 0,
  "status_code": 200,
  "threat_type": 1
}
```

### Multiple Records
```json
[
  {
    "orig_h": "192.168.1.1",
    "orig_p": 80,
    "resp_h": "192.168.1.2",
    "resp_p": 443,
    "protocol": "tcp",
    "srv": "http",
    "dur": 1.5,
    "orig_bytes": 1024,
    "resp_bytes": 2048,
    "conn_state": "SF",
    "classification": 1
  },
  {
    "ip.src": "192.168.1.3",
    "tcp.srcport": 22,
    "ip.dst": "192.168.1.4",
    "tcp.dstport": 12345,
    "ip.proto": "tcp",
    "service": "ssh",
    "time": 0.1,
    "source_bytes": 64,
    "dest_bytes": 0,
    "state": "REJ",
    "attack_type": 8
  }
]
```

## 🛠️ Supported Network Monitoring Tools

| **Tool** | **Column Format** | **Example Fields** |
|----------|-------------------|-------------------|
| **Wireshark** | `ip.src`, `tcp.srcport`, `dns.qry.name` | Dot notation format |
| **Zeek/Bro** | `orig_h`, `orig_p`, `resp_h`, `resp_p` | Zeek-specific naming |
| **Suricata** | `src_ip`, `src_port`, `dest_ip`, `dest_port` | Standard naming |
| **pfSense** | `source_ip`, `source_port`, `destination_ip`, `destination_port` | Verbose naming |
| **Custom Tools** | Any variation from the mapping table | Flexible mapping |

## 📋 Field Value Guidelines

### Protocol Values
- **Accepted**: `tcp`, `udp`, `icmp`, `igmp`, `ipv6`, `ipv6-icmp`, `-`
- **Case**: Insensitive

### Service Values
- **Common**: `http`, `https`, `ssh`, `ftp`, `dns`, `smtp`, `ssl`, `mysql`, `postgresql`, `mongodb`, `redis`
- **Default**: `-` (for unknown services)

### Connection State Values
- **TCP States**: `SF` (normal), `S0` (no reply), `REJ` (rejected), `RSTR` (reset), `RSTO` (reset), `OTH` (other)
- **Case**: Insensitive

### DNS Flag Values
- **Boolean**: `true`/`false`, `t`/`f`, `1`/`0`
- **Special**: `none`, `-` (for not applicable)

### Label Values
- **Numeric**: `0-9` (threat type codes)
- **Text**: `normal`, `ddos`, `dos`, `scanning`, `injection`, `backdoor`, `ransomware`, `mitm`, `password`, `xss`

## 💡 Pro Tips

1. **Case Insensitive**: Column names are automatically converted to lowercase
2. **Flexible Mixing**: You can use different naming conventions in the same file
3. **Auto-Fill**: Missing columns get sensible default values
4. **Validation**: The system shows what columns were mapped and what's missing
5. **Multiple Formats**: Same mapping works for CSV, JSON, and manual entry

## 🚀 Quick Start Examples

### Minimal CSV (Required fields only)
```csv
src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,label
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,1
```

### Mixed Format CSV
```csv
ip.src,source_port,resp_h,dest_port,protocol,app,time,orig_bytes,download_bytes,state,threat_type
192.168.1.1,80,192.168.1.2,443,tcp,http,1.5,1024,2048,SF,normal
```

This comprehensive mapping ensures NetAegis works with virtually any network monitoring tool or custom data format! 🎯 