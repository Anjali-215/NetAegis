# 📋 NetAegis CSV Template Guide

## 🎯 Download Template
**File**: `netaegis_csv_template.csv`

This template contains the exact column structure required for NetAegis threat detection.

## 📊 Column Structure

| Column | Type | Description | Example Values |
|--------|------|-------------|----------------|
| `src_ip` | String | Source IP address | `192.168.1.100` |
| `src_port` | Integer | Source port number | `80`, `443`, `22` |
| `dst_ip` | String | Destination IP address | `192.168.1.200` |
| `dst_port` | Integer | Destination port number | `80`, `443`, `22` |
| `proto` | String | Protocol type | `tcp`, `udp`, `icmp` |
| `service` | String | Service/application | `http`, `https`, `ssh`, `ftp`, `dns` |
| `duration` | Float | Connection duration (seconds) | `1.5`, `0.1`, `0.05` |
| `src_bytes` | Integer | Bytes sent from source | `1024`, `64`, `86` |
| `dst_bytes` | Integer | Bytes sent to destination | `2048`, `0`, `235` |
| `conn_state` | String | Connection state | `SF`, `REJ`, `S0`, `OTH` |
| `missed_bytes` | Integer | Missed/lost bytes | `0` |
| `src_pkts` | Integer | Packets sent from source | `10`, `1`, `2` |
| `src_ip_bytes` | Integer | IP bytes from source | `1024`, `64`, `142` |
| `dst_pkts` | Integer | Packets sent to destination | `8`, `1`, `2` |
| `dst_ip_bytes` | Integer | IP bytes to destination | `2048`, `40`, `291` |
| `dns_query` | String | DNS query name | `google.com`, `0` |
| `dns_qclass` | Integer | DNS query class | `1`, `0` |
| `dns_qtype` | Integer | DNS query type | `1`, `0` |
| `dns_rcode` | Integer | DNS response code | `0` |
| `dns_AA` | String | DNS authoritative answer | `F`, `T`, `none` |
| `dns_RD` | String | DNS recursion desired | `T`, `F`, `none` |
| `dns_RA` | String | DNS recursion available | `T`, `F`, `none` |
| `dns_rejected` | String | DNS rejected flag | `F`, `T`, `none` |
| `http_request_body_len` | Integer | HTTP request body length | `0`, `1024` |
| `http_response_body_len` | Integer | HTTP response body length | `0`, `2048` |
| `http_status_code` | Integer | HTTP status code | `200`, `404`, `0` |
| `label` | Integer | Threat classification | `0` (normal), `1` (threat) |

## 🔧 Field Guidelines

### Protocol Values (`proto`)
- **TCP**: `tcp`
- **UDP**: `udp`
- **ICMP**: `icmp`
- **Unknown**: `-`

### Service Values (`service`)
- **HTTP**: `http`
- **HTTPS**: `https`
- **SSH**: `ssh`
- **FTP**: `ftp`
- **DNS**: `dns`
- **SMTP**: `smtp`
- **Unknown**: `-`

### Connection States (`conn_state`)
- **SF**: Normal connection (SYN, FIN)
- **S0**: Connection attempt, no reply
- **REJ**: Connection rejected
- **RSTR**: Connection reset by originator
- **RSTO**: Connection reset by responder
- **OTH**: Other states
- **SH**: Half-open connection (SYN, SYN-ACK)

### DNS Flags
- **Boolean values**: `T` (true), `F` (false)
- **Not applicable**: `none`

### Label Values
- **0**: Normal traffic
- **1**: DDoS attack
- **2**: DoS attack
- **3**: Scanning attack
- **4**: Injection attack
- **5**: Backdoor attack
- **6**: Ransomware attack
- **7**: Man-in-the-middle attack
- **8**: Password attack
- **9**: XSS attack

## 📝 Usage Instructions

1. **Download the template**: `netaegis_csv_template.csv`
2. **Fill in your data**: Replace the example values with your network traffic data
3. **Keep the header row**: Don't modify the column names
4. **Use proper data types**: Ensure numbers are numeric, strings are text
5. **Upload to NetAegis**: Use the CSV upload feature in the admin dashboard

## 🚀 Quick Examples

### Normal HTTP Traffic
```csv
src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,missed_bytes,src_pkts,src_ip_bytes,dst_pkts,dst_ip_bytes,dns_query,dns_qclass,dns_qtype,dns_rcode,dns_AA,dns_RD,dns_RA,dns_rejected,http_request_body_len,http_response_body_len,http_status_code,label
192.168.1.100,80,192.168.1.200,443,tcp,http,1.5,1024,2048,SF,0,10,1024,8,2048,0,0,0,0,none,none,none,none,0,0,200,0
```

### DNS Query
```csv
src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,missed_bytes,src_pkts,src_ip_bytes,dst_pkts,dst_ip_bytes,dns_query,dns_qclass,dns_qtype,dns_rcode,dns_AA,dns_RD,dns_RA,dns_rejected,http_request_body_len,http_response_body_len,http_status_code,label
192.168.1.102,53,8.8.8.8,53,udp,dns,0.05,86,235,SF,0,2,142,2,291,google.com,1,1,0,F,T,T,F,0,0,0,0
```

### Suspicious Connection
```csv
src_ip,src_port,dst_ip,dst_port,proto,service,duration,src_bytes,dst_bytes,conn_state,missed_bytes,src_pkts,src_ip_bytes,dst_pkts,dst_ip_bytes,dns_query,dns_qclass,dns_qtype,dns_rcode,dns_AA,dns_RD,dns_RA,dns_rejected,http_request_body_len,http_response_body_len,http_status_code,label
192.168.1.101,22,192.168.1.201,22,tcp,ssh,0.1,64,0,REJ,0,1,64,1,40,0,0,0,0,none,none,none,none,0,0,0,1
```

## ⚠️ Important Notes

- **Required fields**: All columns must be present
- **Data validation**: Ensure IP addresses are valid IPv4 format
- **Port ranges**: Use valid port numbers (1-65535)
- **Case sensitivity**: Protocol and service names are case-insensitive
- **Missing data**: Use `0` for numeric fields, `-` or `none` for string fields

## 🔗 Related Files

- `COLUMN_MAPPING_REFERENCE.md` - Alternative column name mappings
- `threat_samples_to_test.csv` - Sample threat data for testing
- `Ml/cleaned_network_data.csv` - Training dataset structure

---

**Need help?** Check the NetAegis documentation or contact support! 🛡️ 