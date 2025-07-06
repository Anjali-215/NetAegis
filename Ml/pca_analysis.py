import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle
import warnings
warnings.filterwarnings('ignore')

def load_cleaned_data():
    """Load the cleaned data"""
    print("Loading cleaned data...")
    
    # Load ML-ready data
    with open('ml_data.pkl', 'rb') as f:
        ml_data = pickle.load(f)
    
    # Load cleaned dataset
    df_cleaned = pd.read_csv('cleaned_network_data.csv')
    
    return df_cleaned, ml_data

def analyze_feature_correlations(X):
    """Analyze feature correlations to understand if PCA is needed"""
    print("\n" + "="*80)
    print("FEATURE CORRELATION ANALYSIS")
    print("="*80)
    
    # Calculate correlation matrix
    corr_matrix = X.corr()
    
    # Count high correlations (>0.8)
    high_corr_pairs = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            if abs(corr_matrix.iloc[i, j]) > 0.8:
                high_corr_pairs.append((corr_matrix.columns[i], corr_matrix.columns[j], corr_matrix.iloc[i, j]))
    
    print(f"Number of highly correlated feature pairs (|r| > 0.8): {len(high_corr_pairs)}")
    
    if high_corr_pairs:
        print("\nHighly correlated feature pairs:")
        for feat1, feat2, corr in high_corr_pairs[:10]:  # Show top 10
            print(f"  {feat1} ↔ {feat2}: {corr:.3f}")
    
    # Calculate average correlation
    upper_triangle = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    avg_corr = upper_triangle.stack().mean()
    print(f"\nAverage correlation between features: {avg_corr:.3f}")
    
    return corr_matrix, high_corr_pairs

def analyze_feature_importance(X, y, feature_names):
    """Analyze feature importance using Random Forest"""
    print("\n" + "="*80)
    print("FEATURE IMPORTANCE ANALYSIS")
    print("="*80)
    
    # Train a Random Forest to get feature importance
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    
    # Get feature importance
    importance = rf.feature_importances_
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': importance
    }).sort_values('importance', ascending=False)
    
    print("Top 10 most important features:")
    for i, (_, row) in enumerate(feature_importance.head(10).iterrows()):
        print(f"  {i+1:2d}. {row['feature']}: {row['importance']:.4f}")
    
    # Calculate cumulative importance
    cumulative_importance = np.cumsum(feature_importance['importance'])
    n_features_80 = np.argmax(cumulative_importance >= 0.8) + 1
    n_features_90 = np.argmax(cumulative_importance >= 0.9) + 1
    
    print(f"\nNumber of features needed for:")
    print(f"  80% of importance: {n_features_80}")
    print(f"  90% of importance: {n_features_90}")
    print(f"  Total features: {len(feature_names)}")
    
    return feature_importance

def perform_pca_analysis(X_scaled, y, feature_names):
    """Perform PCA analysis to see if it's beneficial"""
    print("\n" + "="*80)
    print("PCA ANALYSIS")
    print("="*80)
    
    # Perform PCA
    pca = PCA()
    X_pca = pca.fit_transform(X_scaled)
    
    # Analyze explained variance
    explained_variance_ratio = pca.explained_variance_ratio_
    cumulative_variance = np.cumsum(explained_variance_ratio)
    
    print("Explained variance by components:")
    for i in range(min(10, len(explained_variance_ratio))):
        print(f"  PC{i+1}: {explained_variance_ratio[i]:.4f} ({cumulative_variance[i]:.4f} cumulative)")
    
    # Find number of components for different thresholds
    n_components_80 = np.argmax(cumulative_variance >= 0.8) + 1
    n_components_90 = np.argmax(cumulative_variance >= 0.9) + 1
    n_components_95 = np.argmax(cumulative_variance >= 0.95) + 1
    
    print(f"\nNumber of components needed for:")
    print(f"  80% variance: {n_components_80}")
    print(f"  90% variance: {n_components_90}")
    print(f"  95% variance: {n_components_95}")
    print(f"  Total components: {len(explained_variance_ratio)}")
    
    # Check if PCA reduces dimensionality significantly
    reduction_80 = (len(feature_names) - n_components_80) / len(feature_names) * 100
    reduction_90 = (len(feature_names) - n_components_90) / len(feature_names) * 100
    reduction_95 = (len(feature_names) - n_components_95) / len(feature_names) * 100
    
    print(f"\nDimensionality reduction:")
    print(f"  80% variance: {reduction_80:.1f}% reduction")
    print(f"  90% variance: {reduction_90:.1f}% reduction")
    print(f"  95% variance: {reduction_95:.1f}% reduction")
    
    return pca, X_pca, explained_variance_ratio, cumulative_variance

def compare_ml_performance(X_original, X_pca, y, n_components_list):
    """Compare ML performance with and without PCA"""
    print("\n" + "="*80)
    print("ML PERFORMANCE COMPARISON")
    print("="*80)
    
    from sklearn.model_selection import cross_val_score
    
    # Test original features
    rf_original = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    scores_original = cross_val_score(rf_original, X_original, y, cv=5, scoring='accuracy')
    
    print(f"Original features ({X_original.shape[1]} features):")
    print(f"  Accuracy: {scores_original.mean():.4f} ± {scores_original.std():.4f}")
    
    # Test PCA features
    for n_components in n_components_list:
        if n_components <= X_pca.shape[1]:
            X_pca_subset = X_pca[:, :n_components]
            rf_pca = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
            scores_pca = cross_val_score(rf_pca, X_pca_subset, y, cv=5, scoring='accuracy')
            
            print(f"PCA features ({n_components} components):")
            print(f"  Accuracy: {scores_pca.mean():.4f} ± {scores_pca.std():.4f}")
            
            # Compare performance
            if scores_pca.mean() > scores_original.mean():
                improvement = (scores_pca.mean() - scores_original.mean()) / scores_original.mean() * 100
                print(f"  ✅ PCA improves performance by {improvement:.2f}%")
            else:
                degradation = (scores_original.mean() - scores_pca.mean()) / scores_original.mean() * 100
                print(f"  ❌ PCA degrades performance by {degradation:.2f}%")

def create_visualizations(explained_variance_ratio, cumulative_variance, feature_importance):
    """Create visualizations for PCA analysis"""
    print("\n" + "="*80)
    print("CREATING VISUALIZATIONS")
    print("="*80)
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('PCA Analysis for Network Security Dataset', fontsize=16, fontweight='bold')
    
    # 1. Explained variance plot
    axes[0, 0].plot(range(1, len(explained_variance_ratio) + 1), explained_variance_ratio, 'bo-')
    axes[0, 0].set_xlabel('Principal Component')
    axes[0, 0].set_ylabel('Explained Variance Ratio')
    axes[0, 0].set_title('Explained Variance by Component')
    axes[0, 0].grid(True, alpha=0.3)
    
    # 2. Cumulative variance plot
    axes[0, 1].plot(range(1, len(cumulative_variance) + 1), cumulative_variance, 'ro-')
    axes[0, 1].axhline(y=0.8, color='g', linestyle='--', label='80% threshold')
    axes[0, 1].axhline(y=0.9, color='orange', linestyle='--', label='90% threshold')
    axes[0, 1].axhline(y=0.95, color='red', linestyle='--', label='95% threshold')
    axes[0, 1].set_xlabel('Number of Components')
    axes[0, 1].set_ylabel('Cumulative Explained Variance')
    axes[0, 1].set_title('Cumulative Explained Variance')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # 3. Feature importance plot
    top_features = feature_importance.head(10)
    axes[1, 0].barh(range(len(top_features)), top_features['importance'])
    axes[1, 0].set_yticks(range(len(top_features)))
    axes[1, 0].set_yticklabels(top_features['feature'])
    axes[1, 0].set_xlabel('Feature Importance')
    axes[1, 0].set_title('Top 10 Feature Importance')
    axes[1, 0].grid(True, alpha=0.3)
    
    # 4. Scree plot
    axes[1, 1].plot(range(1, len(explained_variance_ratio) + 1), 
                    np.cumsum(explained_variance_ratio), 'go-')
    axes[1, 1].set_xlabel('Number of Components')
    axes[1, 1].set_ylabel('Cumulative Explained Variance')
    axes[1, 1].set_title('Scree Plot')
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('pca_analysis.png', dpi=300, bbox_inches='tight')
    print("   Saved visualization as 'pca_analysis.png'")
    plt.show()

def provide_recommendation(corr_matrix, high_corr_pairs, feature_importance, 
                          explained_variance_ratio, cumulative_variance, n_components_80, n_components_90):
    """Provide recommendation on whether to use PCA"""
    print("\n" + "="*80)
    print("PCA RECOMMENDATION")
    print("="*80)
    
    # Analyze factors
    n_features = len(feature_importance)
    n_high_corr = len(high_corr_pairs)
    reduction_80 = (n_features - n_components_80) / n_features * 100
    reduction_90 = (n_features - n_components_90) / n_features * 100
    
    print("Factors for PCA decision:")
    print(f"  📊 Total features: {n_features}")
    print(f"  🔗 Highly correlated pairs: {n_high_corr}")
    print(f"  📉 Dimensionality reduction (80% variance): {reduction_80:.1f}%")
    print(f"  📉 Dimensionality reduction (90% variance): {reduction_90:.1f}%")
    
    # Decision logic
    print(f"\nDecision factors:")
    
    if n_high_corr > 10:
        print(f"  ✅ High correlation detected ({n_high_corr} pairs) - PCA beneficial")
    else:
        print(f"  ❌ Low correlation ({n_high_corr} pairs) - PCA may not help")
    
    if reduction_80 > 30:
        print(f"  ✅ Significant dimensionality reduction possible ({reduction_80:.1f}%)")
    else:
        print(f"  ❌ Limited dimensionality reduction ({reduction_80:.1f}%)")
    
    if n_features > 50:
        print(f"  ✅ High-dimensional data ({n_features} features) - PCA may help")
    else:
        print(f"  ❌ Low-dimensional data ({n_features} features) - PCA may not be needed")
    
    # Final recommendation
    print(f"\n🎯 RECOMMENDATION:")
    
    if n_high_corr > 10 and reduction_80 > 30:
        print(f"  ✅ USE PCA - High correlation and significant dimensionality reduction")
        print(f"     Recommended components: {n_components_80} (80% variance)")
    elif n_high_corr > 5 and reduction_80 > 20:
        print(f"  🤔 CONSIDER PCA - Moderate benefits")
        print(f"     Test with {n_components_80} components")
    else:
        print(f"  ❌ SKIP PCA - Limited benefits")
        print(f"     Keep original features for better interpretability")

def main():
    """Main function to run PCA analysis"""
    print("PCA ANALYSIS FOR NETWORK SECURITY DATASET")
    print("="*80)
    
    # Load data
    df_cleaned, ml_data = load_cleaned_data()
    
    # Get features and targets
    X = ml_data['X']
    X_scaled = ml_data['X_scaled']
    feature_names = ml_data['feature_cols']
    
    # Use label classification for analysis
    y = ml_data['label_data']['y_train']
    X_train = ml_data['label_data']['X_train']
    X_train_scaled = StandardScaler().fit_transform(X_train)
    
    print(f"Dataset shape: {X.shape}")
    print(f"Features: {len(feature_names)}")
    print(f"Target classes: {len(np.unique(y))}")
    
    # Analyze correlations
    corr_matrix, high_corr_pairs = analyze_feature_correlations(X)
    
    # Analyze feature importance
    feature_importance = analyze_feature_importance(X_train, y, feature_names)
    
    # Perform PCA analysis
    pca, X_pca, explained_variance_ratio, cumulative_variance = perform_pca_analysis(
        X_train_scaled, y, feature_names
    )
    
    # Compare ML performance
    n_components_80 = np.argmax(cumulative_variance >= 0.8) + 1
    n_components_90 = np.argmax(cumulative_variance >= 0.9) + 1
    compare_ml_performance(X_train, X_pca, y, [n_components_80, n_components_90])
    
    # Create visualizations
    create_visualizations(explained_variance_ratio, cumulative_variance, feature_importance)
    
    # Provide recommendation
    provide_recommendation(corr_matrix, high_corr_pairs, feature_importance,
                          explained_variance_ratio, cumulative_variance, n_components_80, n_components_90)
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE!")
    print("="*80)
    print("\n📁 Files created:")
    print("   - pca_analysis.png (visualizations)")
    print("\n💡 Next steps:")
    print("   - Review the recommendation above")
    print("   - Test PCA if recommended")
    print("   - Compare model performance")

if __name__ == "__main__":
    main() 