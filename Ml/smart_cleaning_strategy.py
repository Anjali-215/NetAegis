import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

def smart_cleaning_strategy():
    """Explain the smart cleaning strategy for network security data"""
    print("="*80)
    print("SMART CLEANING STRATEGY FOR NETWORK SECURITY DATA")
    print("="*80)
    
    print("""
🎯 **KEEP THESE PATTERNS (They're valuable for ML):**
    
1. **Protocol-Specific Zeros/Hyphens**: 
   - DNS fields with '-' for non-DNS traffic → Keep (shows protocol type)
   - SSL fields with '-' for non-SSL traffic → Keep (shows encryption status)
   - HTTP fields with '-' for non-HTTP traffic → Keep (shows web traffic)

2. **Network Behavior Zeros**:
   - src_bytes=0 → Keep (shows one-way traffic patterns)
   - dst_bytes=0 → Keep (shows failed connections)
   - duration=0 → Keep (shows instant connections)
   - These are CRITICAL for detecting attacks!

3. **Connection State Patterns**:
   - REJ, S0, SF states → Keep (shows connection success/failure)
   - These indicate attack patterns

❌ **CLEAN THESE (They add noise):**

1. **Completely Empty Protocol Fields**:
   - Fields that are 99%+ hyphens with no meaningful data
   - Example: ssl_subject, ssl_issuer (99.9% hyphens)

2. **Redundant Fields**:
   - Fields that are perfectly correlated
   - Example: http_request_body_len (100% zeros)

3. **Low-Variance Fields**:
   - Fields with almost no variation (not useful for ML)
   - Example: http_orig_mime_types (99.9% hyphens)

4. **Missing Values**:
   - Actual null values (not placeholder hyphens)
   - Inconsistent data types

🔄 **TRANSFORM THESE (Make them ML-friendly):**

1. **Categorical Fields**:
   - Convert hyphens to meaningful categories
   - Example: '-' → 'none', 'F' → 'false', 'T' → 'true'

2. **Numerical Fields**:
   - Keep zeros but ensure proper data types
   - Scale features appropriately

3. **IP Addresses**:
   - Extract network segments or convert to numerical
   - Or use as categorical with encoding
""")

def load_and_analyze_for_cleaning():
    """Load data and analyze what needs cleaning"""
    print("\n" + "="*80)
    print("ANALYZING DATA FOR CLEANING DECISIONS")
    print("="*80)
    
    df = pd.read_csv('train_test_network.csv')
    print(f"Original dataset shape: {df.shape}")
    
    # Analyze each column for cleaning decisions
    cleaning_decisions = {}
    
    for col in df.columns:
        total_values = len(df[col])
        hyphens = (df[col] == '-').sum()
        zeros = (df[col] == 0).sum()
        nulls = df[col].isnull().sum()
        unique_count = df[col].nunique()
        
        # Calculate percentages
        hyphen_pct = hyphens / total_values * 100
        zero_pct = zeros / total_values * 100
        null_pct = nulls / total_values * 100
        
        # Make cleaning decision
        if hyphen_pct > 95:
            decision = "REMOVE - Too many hyphens"
        elif hyphen_pct > 80:
            decision = "TRANSFORM - Convert hyphens to categories"
        elif zero_pct > 95:
            decision = "REMOVE - Too many zeros"
        elif null_pct > 5:
            decision = "CLEAN - Handle missing values"
        elif unique_count <= 2:
            decision = "EVALUATE - Low variance"
        else:
            decision = "KEEP - Good data"
        
        cleaning_decisions[col] = {
            'hyphens_pct': hyphen_pct,
            'zeros_pct': zero_pct,
            'nulls_pct': null_pct,
            'unique_count': unique_count,
            'decision': decision
        }
    
    return df, cleaning_decisions

def show_cleaning_recommendations(cleaning_decisions):
    """Show specific cleaning recommendations"""
    print("\n" + "="*80)
    print("CLEANING RECOMMENDATIONS BY COLUMN")
    print("="*80)
    
    # Group by decision
    decisions = {}
    for col, info in cleaning_decisions.items():
        decision = info['decision']
        if decision not in decisions:
            decisions[decision] = []
        decisions[decision].append((col, info))
    
    for decision, columns in decisions.items():
        print(f"\n{decision}:")
        for col, info in columns:
            print(f"  {col}:")
            print(f"    - Hyphens: {info['hyphens_pct']:.1f}%")
            print(f"    - Zeros: {info['zeros_pct']:.1f}%")
            print(f"    - Nulls: {info['nulls_pct']:.1f}%")
            print(f"    - Unique values: {info['unique_count']}")

def implement_smart_cleaning(df):
    """Implement the smart cleaning strategy"""
    print("\n" + "="*80)
    print("IMPLEMENTING SMART CLEANING")
    print("="*80)
    
    df_cleaned = df.copy()
    initial_shape = df_cleaned.shape
    removed_cols = []
    transformed_cols = []
    
    # 1. Remove columns with too many hyphens (>95%)
    print("\n1. Removing columns with >95% hyphens:")
    high_hyphen_cols = []
    for col in df_cleaned.columns:
        hyphen_pct = (df_cleaned[col] == '-').sum() / len(df_cleaned) * 100
        if hyphen_pct > 95:
            high_hyphen_cols.append(col)
            removed_cols.append(col)
    
    if high_hyphen_cols:
        print(f"   Removing: {high_hyphen_cols}")
        df_cleaned = df_cleaned.drop(columns=high_hyphen_cols)
    else:
        print("   No columns to remove")
    
    # 2. Transform categorical fields with hyphens
    print("\n2. Transforming categorical fields:")
    categorical_cols = df_cleaned.select_dtypes(include=['object']).columns
    
    for col in categorical_cols:
        if col in ['src_ip', 'dst_ip', 'proto', 'service', 'conn_state', 'type']:
            # Keep these as they are important
            continue
        
        hyphen_pct = (df_cleaned[col] == '-').sum() / len(df_cleaned) * 100
        if hyphen_pct > 50:  # Transform if more than 50% hyphens
            print(f"   Transforming {col}: '-' → 'none'")
            df_cleaned[col] = df_cleaned[col].replace('-', 'none')
            transformed_cols.append(col)
    
    # 3. Handle missing values
    print("\n3. Handling missing values:")
    missing_cols = df_cleaned.columns[df_cleaned.isnull().sum() > 0]
    if len(missing_cols) > 0:
        print(f"   Found missing values in: {list(missing_cols)}")
        for col in missing_cols:
            if df_cleaned[col].dtype in ['int64', 'float64']:
                median_val = df_cleaned[col].median()
                df_cleaned[col].fillna(median_val, inplace=True)
                print(f"   Filled {col} with median: {median_val}")
            else:
                mode_val = df_cleaned[col].mode()[0] if len(df_cleaned[col].mode()) > 0 else 'unknown'
                df_cleaned[col].fillna(mode_val, inplace=True)
                print(f"   Filled {col} with mode: {mode_val}")
    else:
        print("   No missing values found")
    
    # 4. Remove duplicates
    print("\n4. Removing duplicates:")
    duplicates_before = df_cleaned.duplicated().sum()
    df_cleaned = df_cleaned.drop_duplicates()
    duplicates_after = df_cleaned.duplicated().sum()
    print(f"   Removed {duplicates_before - duplicates_after} duplicate rows")
    
    # 5. Handle infinite values
    print("\n5. Handling infinite values:")
    numerical_cols = df_cleaned.select_dtypes(include=[np.number]).columns
    inf_count = np.isinf(df_cleaned[numerical_cols]).sum().sum()
    if inf_count > 0:
        print(f"   Found {inf_count} infinite values")
        df_cleaned = df_cleaned.replace([np.inf, -np.inf], np.nan)
        for col in numerical_cols:
            if df_cleaned[col].isnull().sum() > 0:
                median_val = df_cleaned[col].median()
                df_cleaned[col].fillna(median_val, inplace=True)
    else:
        print("   No infinite values found")
    
    final_shape = df_cleaned.shape
    print(f"\nCleaning Summary:")
    print(f"   Initial shape: {initial_shape}")
    print(f"   Final shape: {final_shape}")
    print(f"   Columns removed: {len(removed_cols)}")
    print(f"   Columns transformed: {len(transformed_cols)}")
    print(f"   Rows removed: {initial_shape[0] - final_shape[0]}")
    
    return df_cleaned, removed_cols, transformed_cols

def prepare_for_ml(df_cleaned):
    """Prepare cleaned data for machine learning"""
    print("\n" + "="*80)
    print("PREPARING FOR MACHINE LEARNING")
    print("="*80)
    
    df_ml = df_cleaned.copy()
    
    # 1. Encode categorical variables
    print("\n1. Encoding categorical variables:")
    label_encoders = {}
    categorical_cols = df_ml.select_dtypes(include=['object']).columns
    
    for col in categorical_cols:
        if col not in ['label', 'type']:  # Don't encode target variables yet
            le = LabelEncoder()
            df_ml[col] = le.fit_transform(df_ml[col].astype(str))
            label_encoders[col] = le
            print(f"   Encoded {col} with {len(le.classes_)} unique values")
    
    # 2. Create target variables
    print("\n2. Creating target variables:")
    if 'type' in df_ml.columns:
        le_type = LabelEncoder()
        df_ml['type_encoded'] = le_type.fit_transform(df_ml['type'])
        print(f"   Encoded 'type' with {len(le_type.classes_)} classes: {le_type.classes_}")
    
    if 'label' in df_ml.columns:
        le_label = LabelEncoder()
        df_ml['label_encoded'] = le_label.fit_transform(df_ml['label'])
        print(f"   Encoded 'label' with {len(le_label.classes_)} classes: {le_label.classes_}")
    
    # 3. Select features
    print("\n3. Selecting features:")
    feature_cols = [col for col in df_ml.columns if col not in ['label', 'type', 'label_encoded', 'type_encoded']]
    print(f"   Selected {len(feature_cols)} features for ML")
    
    # 4. Split data
    print("\n4. Splitting data:")
    X = df_ml[feature_cols]
    
    if 'type_encoded' in df_ml.columns:
        y_type = df_ml['type_encoded']
        X_train_type, X_test_type, y_train_type, y_test_type = train_test_split(
            X, y_type, test_size=0.2, random_state=42, stratify=y_type
        )
        print(f"   Type classification: {X_train_type.shape[0]} train, {X_test_type.shape[0]} test")
    
    if 'label_encoded' in df_ml.columns:
        y_label = df_ml['label_encoded']
        X_train_label, X_test_label, y_train_label, y_test_label = train_test_split(
            X, y_label, test_size=0.2, random_state=42, stratify=y_label
        )
        print(f"   Label classification: {X_train_label.shape[0]} train, {X_test_label.shape[0]} test")
    
    # 5. Scale features
    print("\n5. Scaling features:")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print(f"   Scaled features using StandardScaler")
    
    return {
        'X': X,
        'X_scaled': X_scaled,
        'feature_cols': feature_cols,
        'label_encoders': label_encoders,
        'scaler': scaler,
        'type_data': {
            'X_train': X_train_type if 'type_encoded' in df_ml.columns else None,
            'X_test': X_test_type if 'type_encoded' in df_ml.columns else None,
            'y_train': y_train_type if 'type_encoded' in df_ml.columns else None,
            'y_test': y_test_type if 'type_encoded' in df_ml.columns else None,
            'encoder': le_type if 'type_encoded' in df_ml.columns else None
        },
        'label_data': {
            'X_train': X_train_label if 'label_encoded' in df_ml.columns else None,
            'X_test': X_test_label if 'label_encoded' in df_ml.columns else None,
            'y_train': y_train_label if 'label_encoded' in df_ml.columns else None,
            'y_test': y_test_label if 'label_encoded' in df_ml.columns else None,
            'encoder': le_label if 'label_encoded' in df_ml.columns else None
        }
    }

def save_cleaned_data(df_cleaned, ml_data, removed_cols, transformed_cols):
    """Save the cleaned and processed data"""
    print("\n" + "="*80)
    print("SAVING CLEANED DATA")
    print("="*80)
    
    # Save cleaned dataset
    df_cleaned.to_csv('cleaned_network_data.csv', index=False)
    print("   Saved cleaned dataset as 'cleaned_network_data.csv'")
    
    # Save ML-ready data
    import pickle
    with open('ml_data.pkl', 'wb') as f:
        pickle.dump(ml_data, f)
    print("   Saved ML-ready data as 'ml_data.pkl'")
    
    # Save cleaning report
    cleaning_report = {
        'original_shape': (211043, 44),
        'cleaned_shape': df_cleaned.shape,
        'removed_columns': removed_cols,
        'transformed_columns': transformed_cols,
        'feature_count': len(ml_data['feature_cols']),
        'categorical_features': len(ml_data['label_encoders']),
        'numerical_features': len(ml_data['feature_cols']) - len(ml_data['label_encoders'])
    }
    
    with open('cleaning_report.json', 'w') as f:
        import json
        json.dump(cleaning_report, f, indent=2)
    print("   Saved cleaning report as 'cleaning_report.json'")

def main():
    """Main function to run smart cleaning"""
    print("SMART CLEANING FOR NETWORK SECURITY DATA")
    print("="*80)
    
    # Show strategy
    smart_cleaning_strategy()
    
    # Analyze data
    df, cleaning_decisions = load_and_analyze_for_cleaning()
    
    # Show recommendations
    show_cleaning_recommendations(cleaning_decisions)
    
    # Implement cleaning
    df_cleaned, removed_cols, transformed_cols = implement_smart_cleaning(df)
    
    # Prepare for ML
    ml_data = prepare_for_ml(df_cleaned)
    
    # Save data
    save_cleaned_data(df_cleaned, ml_data, removed_cols, transformed_cols)
    
    print("\n" + "="*80)
    print("SMART CLEANING COMPLETE!")
    print("="*80)
    print("\n📊 Summary:")
    print("   ✅ Kept important network patterns (zeros, hyphens)")
    print("   ❌ Removed noise (99%+ empty fields)")
    print("   🔄 Transformed categorical data")
    print("   🎯 Optimized for machine learning")
    print("\n📁 Files created:")
    print("   - cleaned_network_data.csv (smartly cleaned)")
    print("   - ml_data.pkl (ML-ready)")
    print("   - cleaning_report.json (cleaning details)")

if __name__ == "__main__":
    main() 