import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

# Set style for better plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def load_and_analyze_data(file_path):
    """Load and perform initial analysis of the dataset"""
    print("Loading dataset...")
    df = pd.read_csv(file_path)
    
    print(f"\nDataset Shape: {df.shape}")
    print(f"Number of rows: {df.shape[0]:,}")
    print(f"Number of columns: {df.shape[1]}")
    
    return df

def basic_info(df):
    """Display basic information about the dataset"""
    print("\n" + "="*50)
    print("BASIC DATASET INFORMATION")
    print("="*50)
    
    print("\nColumn Names:")
    for i, col in enumerate(df.columns, 1):
        print(f"{i:2d}. {col}")
    
    print(f"\nData Types:")
    print(df.dtypes.value_counts())
    
    print(f"\nMemory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    return df

def check_missing_values(df):
    """Analyze missing values in the dataset"""
    print("\n" + "="*50)
    print("MISSING VALUES ANALYSIS")
    print("="*50)
    
    missing_data = df.isnull().sum()
    missing_percent = (missing_data / len(df)) * 100
    
    missing_df = pd.DataFrame({
        'Column': missing_data.index,
        'Missing_Count': missing_data.values,
        'Missing_Percent': missing_percent.values
    })
    
    missing_df = missing_df[missing_df['Missing_Count'] > 0].sort_values('Missing_Percent', ascending=False)
    
    if len(missing_df) > 0:
        print(f"\nColumns with missing values ({len(missing_df)}):")
        print(missing_df.to_string(index=False))
    else:
        print("\nNo missing values found in the dataset!")
    
    return missing_df

def analyze_target_variables(df):
    """Analyze the target variables (label and type)"""
    print("\n" + "="*50)
    print("TARGET VARIABLES ANALYSIS")
    print("="*50)
    
    if 'label' in df.columns:
        print(f"\nLabel distribution:")
        label_counts = df['label'].value_counts()
        print(label_counts)
        print(f"\nLabel percentages:")
        print((label_counts / len(df) * 100).round(2))
    
    if 'type' in df.columns:
        print(f"\nType distribution:")
        type_counts = df['type'].value_counts()
        print(type_counts)
        print(f"\nType percentages:")
        print((type_counts / len(df) * 100).round(2))
    
    return df

def analyze_numerical_features(df):
    """Analyze numerical features"""
    print("\n" + "="*50)
    print("NUMERICAL FEATURES ANALYSIS")
    print("="*50)
    
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    print(f"\nNumerical columns ({len(numerical_cols)}): {numerical_cols}")
    
    if numerical_cols:
        print(f"\nNumerical features statistics:")
        print(df[numerical_cols].describe())
    
    return numerical_cols

def analyze_categorical_features(df):
    """Analyze categorical features"""
    print("\n" + "="*50)
    print("CATEGORICAL FEATURES ANALYSIS")
    print("="*50)
    
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    print(f"\nCategorical columns ({len(categorical_cols)}): {categorical_cols}")
    
    for col in categorical_cols:
        unique_count = df[col].nunique()
        print(f"\n{col}:")
        print(f"  Unique values: {unique_count}")
        if unique_count <= 20:
            print(f"  Value counts:")
            print(df[col].value_counts().head(10))
        else:
            print(f"  Top 10 values:")
            print(df[col].value_counts().head(10))
    
    return categorical_cols

def clean_data(df):
    """Clean the dataset"""
    print("\n" + "="*50)
    print("DATA CLEANING")
    print("="*50)
    
    df_cleaned = df.copy()
    initial_shape = df_cleaned.shape
    
    # 1. Handle missing values
    print("\n1. Handling missing values...")
    
    # For numerical columns, fill with median
    numerical_cols = df_cleaned.select_dtypes(include=[np.number]).columns
    for col in numerical_cols:
        if df_cleaned[col].isnull().sum() > 0:
            median_val = df_cleaned[col].median()
            df_cleaned[col].fillna(median_val, inplace=True)
            print(f"   Filled missing values in {col} with median: {median_val}")
    
    # For categorical columns, fill with mode
    categorical_cols = df_cleaned.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df_cleaned[col].isnull().sum() > 0:
            mode_val = df_cleaned[col].mode()[0] if len(df_cleaned[col].mode()) > 0 else 'Unknown'
            df_cleaned[col].fillna(mode_val, inplace=True)
            print(f"   Filled missing values in {col} with mode: {mode_val}")
    
    # 2. Remove duplicates
    print("\n2. Removing duplicates...")
    duplicates_before = df_cleaned.duplicated().sum()
    df_cleaned = df_cleaned.drop_duplicates()
    duplicates_after = df_cleaned.duplicated().sum()
    print(f"   Removed {duplicates_before - duplicates_after} duplicate rows")
    
    # 3. Handle infinite values
    print("\n3. Handling infinite values...")
    inf_count = np.isinf(df_cleaned.select_dtypes(include=[np.number])).sum().sum()
    if inf_count > 0:
        print(f"   Found {inf_count} infinite values")
        df_cleaned = df_cleaned.replace([np.inf, -np.inf], np.nan)
        # Fill with median
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
    print(f"   Rows removed: {initial_shape[0] - final_shape[0]}")
    
    return df_cleaned

def create_visualizations(df):
    """Create visualizations for the dataset"""
    print("\n" + "="*50)
    print("CREATING VISUALIZATIONS")
    print("="*50)
    
    # Create a figure with multiple subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Network Security Dataset Analysis', fontsize=16, fontweight='bold')
    
    # 1. Target distribution
    if 'type' in df.columns:
        type_counts = df['type'].value_counts()
        axes[0, 0].pie(type_counts.values, labels=type_counts.index, autopct='%1.1f%%')
        axes[0, 0].set_title('Distribution of Attack Types')
    
    # 2. Protocol distribution
    if 'proto' in df.columns:
        proto_counts = df['proto'].value_counts().head(10)
        axes[0, 1].bar(range(len(proto_counts)), proto_counts.values)
        axes[0, 1].set_xticks(range(len(proto_counts)))
        axes[0, 1].set_xticklabels(proto_counts.index, rotation=45)
        axes[0, 1].set_title('Top 10 Protocols')
        axes[0, 1].set_ylabel('Count')
    
    # 3. Duration distribution (log scale)
    if 'duration' in df.columns:
        axes[1, 0].hist(df['duration'], bins=50, alpha=0.7, edgecolor='black')
        axes[1, 0].set_xlabel('Duration')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].set_title('Connection Duration Distribution')
        axes[1, 0].set_yscale('log')
    
    # 4. Bytes distribution
    if 'src_bytes' in df.columns and 'dst_bytes' in df.columns:
        axes[1, 1].scatter(df['src_bytes'], df['dst_bytes'], alpha=0.5, s=1)
        axes[1, 1].set_xlabel('Source Bytes')
        axes[1, 1].set_ylabel('Destination Bytes')
        axes[1, 1].set_title('Source vs Destination Bytes')
        axes[1, 1].set_xscale('log')
        axes[1, 1].set_yscale('log')
    
    plt.tight_layout()
    plt.savefig('network_data_analysis.png', dpi=300, bbox_inches='tight')
    print("   Saved visualization as 'network_data_analysis.png'")
    plt.show()

def prepare_for_ml(df):
    """Prepare the dataset for machine learning"""
    print("\n" + "="*50)
    print("PREPARING FOR MACHINE LEARNING")
    print("="*50)
    
    df_ml = df.copy()
    
    # 1. Encode categorical variables
    print("\n1. Encoding categorical variables...")
    label_encoders = {}
    categorical_cols = df_ml.select_dtypes(include=['object']).columns
    
    for col in categorical_cols:
        if col not in ['label', 'type']:  # Don't encode target variables yet
            le = LabelEncoder()
            df_ml[col] = le.fit_transform(df_ml[col].astype(str))
            label_encoders[col] = le
            print(f"   Encoded {col} with {len(le.classes_)} unique values")
    
    # 2. Create target variables
    print("\n2. Creating target variables...")
    if 'type' in df_ml.columns:
        le_type = LabelEncoder()
        df_ml['type_encoded'] = le_type.fit_transform(df_ml['type'])
        print(f"   Encoded 'type' with {len(le_type.classes_)} classes: {le_type.classes_}")
    
    if 'label' in df_ml.columns:
        le_label = LabelEncoder()
        df_ml['label_encoded'] = le_label.fit_transform(df_ml['label'])
        print(f"   Encoded 'label' with {len(le_label.classes_)} classes: {le_label.classes_}")
    
    # 3. Select features for ML
    print("\n3. Selecting features...")
    feature_cols = [col for col in df_ml.columns if col not in ['label', 'type', 'label_encoded', 'type_encoded']]
    print(f"   Selected {len(feature_cols)} features for ML")
    
    # 4. Split the data
    print("\n4. Splitting the data...")
    X = df_ml[feature_cols]
    
    if 'type_encoded' in df_ml.columns:
        y_type = df_ml['type_encoded']
        X_train_type, X_test_type, y_train_type, y_test_type = train_test_split(
            X, y_type, test_size=0.2, random_state=42, stratify=y_type
        )
        print(f"   Split data for type classification: {X_train_type.shape[0]} train, {X_test_type.shape[0]} test")
    
    if 'label_encoded' in df_ml.columns:
        y_label = df_ml['label_encoded']
        X_train_label, X_test_label, y_train_label, y_test_label = train_test_split(
            X, y_label, test_size=0.2, random_state=42, stratify=y_label
        )
        print(f"   Split data for label classification: {X_train_label.shape[0]} train, {X_test_label.shape[0]} test")
    
    # 5. Scale features
    print("\n5. Scaling features...")
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

def save_processed_data(df_cleaned, ml_data):
    """Save the processed data"""
    print("\n" + "="*50)
    print("SAVING PROCESSED DATA")
    print("="*50)
    
    # Save cleaned dataset
    df_cleaned.to_csv('cleaned_network_data.csv', index=False)
    print("   Saved cleaned dataset as 'cleaned_network_data.csv'")
    
    # Save ML-ready data
    import pickle
    
    with open('ml_data.pkl', 'wb') as f:
        pickle.dump(ml_data, f)
    print("   Saved ML-ready data as 'ml_data.pkl'")
    
    # Save summary statistics
    summary_stats = {
        'original_shape': (211044, 44),  # From our analysis
        'cleaned_shape': df_cleaned.shape,
        'feature_count': len(ml_data['feature_cols']),
        'categorical_features': len(ml_data['label_encoders']),
        'numerical_features': len(ml_data['feature_cols']) - len(ml_data['label_encoders'])
    }
    
    with open('data_summary.json', 'w') as f:
        import json
        json.dump(summary_stats, f, indent=2)
    print("   Saved data summary as 'data_summary.json'")

def main():
    """Main function to run the complete analysis"""
    print("NETWORK SECURITY DATASET ANALYSIS")
    print("="*50)
    
    # Load data
    df = load_and_analyze_data('train_test_network.csv')
    
    # Basic information
    df = basic_info(df)
    
    # Check missing values
    missing_df = check_missing_values(df)
    
    # Analyze target variables
    df = analyze_target_variables(df)
    
    # Analyze numerical features
    numerical_cols = analyze_numerical_features(df)
    
    # Analyze categorical features
    categorical_cols = analyze_categorical_features(df)
    
    # Clean data
    df_cleaned = clean_data(df)
    
    # Create visualizations
    try:
        create_visualizations(df_cleaned)
    except Exception as e:
        print(f"   Visualization error: {e}")
    
    # Prepare for ML
    ml_data = prepare_for_ml(df_cleaned)
    
    # Save processed data
    save_processed_data(df_cleaned, ml_data)
    
    print("\n" + "="*50)
    print("ANALYSIS COMPLETE!")
    print("="*50)
    print("\nFiles created:")
    print("   - cleaned_network_data.csv (cleaned dataset)")
    print("   - ml_data.pkl (ML-ready data)")
    print("   - data_summary.json (summary statistics)")
    print("   - network_data_analysis.png (visualizations)")

if __name__ == "__main__":
    main() 