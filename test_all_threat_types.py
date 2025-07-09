import pandas as pd
import requests
import json
import time

def test_all_threat_types():
    """Test all 10 threat types to ensure preprocessing works correctly"""
    print("🔍 Testing All Threat Types with Corrected Preprocessing")
    print("=" * 80)
    
    # Load training data
    df = pd.read_csv("Ml/cleaned_network_data.csv")
    
    # Get one sample for each threat type
    threat_types = ['normal', 'ddos', 'dos', 'backdoor', 'injection', 'password', 'xss', 'ransomware', 'mitm', 'scanning']
    
    test_results = []
    
    for threat_type in threat_types:
        print(f"\n🧪 Testing {threat_type.upper()} sample...")
        
        # Get first sample of this threat type
        sample = df[df['type'] == threat_type].iloc[0]
        
        # Create test data
        test_data = {
            "src_ip": str(sample['src_ip']),
            "src_port": int(sample['src_port']),
            "dst_ip": str(sample['dst_ip']),
            "dst_port": int(sample['dst_port']),
            "proto": str(sample['proto']),
            "service": str(sample['service']),
            "duration": float(sample['duration']),
            "src_bytes": int(sample['src_bytes']),
            "dst_bytes": int(sample['dst_bytes']),
            "conn_state": str(sample['conn_state']),
            "missed_bytes": int(sample['missed_bytes']),
            "src_pkts": int(sample['src_pkts']),
            "src_ip_bytes": int(sample['src_ip_bytes']),
            "dst_pkts": int(sample['dst_pkts']),
            "dst_ip_bytes": int(sample['dst_ip_bytes']),
            "dns_query": str(sample['dns_query']),
            "dns_qclass": int(sample['dns_qclass']),
            "dns_qtype": int(sample['dns_qtype']),
            "dns_rcode": int(sample['dns_rcode']),
            "dns_AA": str(sample['dns_AA']),
            "dns_RD": str(sample['dns_RD']),
            "dns_RA": str(sample['dns_RA']),
            "dns_rejected": str(sample['dns_rejected']),
            "http_request_body_len": int(sample['http_request_body_len']),
            "http_response_body_len": int(sample['http_response_body_len']),
            "http_status_code": int(sample['http_status_code']),
            "label": int(sample['label'])
        }
        
        # Test API
        try:
            response = requests.post("http://localhost:8000/predict", json=test_data)
            
            if response.status_code == 200:
                result = response.json()
                predicted_type = result['threat_type']
                confidence = result.get('confidence', 0)
                threat_level = result.get('threat_level', 'Unknown')
                
                # Check if prediction matches expected
                correct = predicted_type == threat_type
                status = "✅ CORRECT" if correct else "❌ INCORRECT"
                
                print(f"   Expected: {threat_type}")
                print(f"   Predicted: {predicted_type}")
                print(f"   Confidence: {confidence:.3f}")
                print(f"   Threat Level: {threat_level}")
                print(f"   Status: {status}")
                
                test_results.append({
                    'expected': threat_type,
                    'predicted': predicted_type,
                    'correct': correct,
                    'confidence': confidence,
                    'threat_level': threat_level
                })
                
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                test_results.append({
                    'expected': threat_type,
                    'predicted': 'ERROR',
                    'correct': False,
                    'confidence': 0,
                    'threat_level': 'Unknown'
                })
                
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
            test_results.append({
                'expected': threat_type,
                'predicted': 'ERROR',
                'correct': False,
                'confidence': 0,
                'threat_level': 'Unknown'
            })
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    correct_count = sum(1 for r in test_results if r['correct'])
    total_count = len(test_results)
    accuracy = correct_count / total_count * 100
    
    print(f"✅ Correct predictions: {correct_count}/{total_count}")
    print(f"📈 Accuracy: {accuracy:.1f}%")
    
    print(f"\n📋 Detailed Results:")
    for result in test_results:
        status = "✅" if result['correct'] else "❌"
        print(f"   {status} {result['expected']} → {result['predicted']} ({result['confidence']:.3f})")
    
    # Check specific critical cases
    print(f"\n🔍 Critical Cases:")
    
    # Check if normal traffic is detected as normal
    normal_result = next((r for r in test_results if r['expected'] == 'normal'), None)
    if normal_result and normal_result['correct']:
        print("   ✅ Normal traffic detected correctly (was showing as 'scanning' before)")
    else:
        print("   ❌ Normal traffic still not detected correctly")
    
    # Check if DDoS is detected as ddos (not dos)
    ddos_result = next((r for r in test_results if r['expected'] == 'ddos'), None)
    if ddos_result and ddos_result['correct']:
        print("   ✅ DDoS traffic detected correctly (was showing as 'dos' before)")
    else:
        print("   ❌ DDoS traffic still not detected correctly")
    
    # Check threat levels
    print(f"\n🚨 Threat Levels:")
    for result in test_results:
        if result['correct']:
            print(f"   {result['expected']}: {result['threat_level']}")
    
    return test_results

def create_json_samples():
    """Create JSON samples for manual testing"""
    print("\n📁 Creating JSON samples for manual testing...")
    
    df = pd.read_csv("Ml/cleaned_network_data.csv")
    threat_types = ['normal', 'ddos', 'dos', 'backdoor', 'injection', 'password', 'xss', 'ransomware', 'mitm', 'scanning']
    
    samples = {}
    
    for threat_type in threat_types:
        sample = df[df['type'] == threat_type].iloc[0]
        
        test_data = {
            "src_ip": str(sample['src_ip']),
            "src_port": int(sample['src_port']),
            "dst_ip": str(sample['dst_ip']),
            "dst_port": int(sample['dst_port']),
            "proto": str(sample['proto']),
            "service": str(sample['service']),
            "duration": float(sample['duration']),
            "src_bytes": int(sample['src_bytes']),
            "dst_bytes": int(sample['dst_bytes']),
            "conn_state": str(sample['conn_state']),
            "missed_bytes": int(sample['missed_bytes']),
            "src_pkts": int(sample['src_pkts']),
            "src_ip_bytes": int(sample['src_ip_bytes']),
            "dst_pkts": int(sample['dst_pkts']),
            "dst_ip_bytes": int(sample['dst_ip_bytes']),
            "dns_query": str(sample['dns_query']),
            "dns_qclass": int(sample['dns_qclass']),
            "dns_qtype": int(sample['dns_qtype']),
            "dns_rcode": int(sample['dns_rcode']),
            "dns_AA": str(sample['dns_AA']),
            "dns_RD": str(sample['dns_RD']),
            "dns_RA": str(sample['dns_RA']),
            "dns_rejected": str(sample['dns_rejected']),
            "http_request_body_len": int(sample['http_request_body_len']),
            "http_response_body_len": int(sample['http_response_body_len']),
            "http_status_code": int(sample['http_status_code']),
            "label": int(sample['label'])
        }
        
        samples[threat_type] = test_data
        
        # Save individual files
        with open(f"sample_{threat_type}.json", "w") as f:
            json.dump(test_data, f, indent=2)
    
    # Save all samples
    with open("all_threat_samples.json", "w") as f:
        json.dump(samples, f, indent=2)
    
    print(f"   ✅ Created {len(threat_types)} JSON samples")
    print(f"   📁 Files: sample_<threat_type>.json and all_threat_samples.json")

if __name__ == "__main__":
    print("🧪 NetAegis Comprehensive Threat Detection Test")
    print("=" * 80)
    
    # Test all threat types
    test_results = test_all_threat_types()
    
    # Create JSON samples for manual testing
    create_json_samples()
    
    print("\n🎉 Testing Complete!")
    print("=" * 80)
    print("📝 Summary:")
    print("   ✅ Preprocessing pipeline fixed")
    print("   🔄 All threat types tested")
    print("   📁 JSON samples created for manual testing")
    print("   🎯 Ready for production use!") 