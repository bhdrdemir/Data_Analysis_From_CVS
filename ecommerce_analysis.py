import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from prophet import Prophet
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Veri temizleme ve hazırlama

def prepare_data(file):
    """Yüklenen CSV dosyasını temizler ve gerekli sütunları hazırlar."""
    data = pd.read_csv(file, encoding="ISO-8859-1")
    data = data.dropna(subset=['CustomerID'])  # Eksik müşteri verilerini çıkar
    data = data[data['Quantity'] > 0]  # Negatif miktarları çıkar
    data['TotalPrice'] = data['Quantity'] * data['UnitPrice']
    data['InvoiceDate'] = pd.to_datetime(data['InvoiceDate'])
    return data

# Kullanıcı ve ürün bazlı matris oluşturma

def create_similarity_matrices(data):
    """Kullanıcı ve ürün bazlı benzerlik matrislerini oluşturur."""
    user_product_matrix = data.pivot_table(
        index='CustomerID', columns='Description', values='Quantity', aggfunc='sum'
    ).fillna(0)

    product_similarity = cosine_similarity(user_product_matrix.T)
    product_similarity_df = pd.DataFrame(
        product_similarity, index=user_product_matrix.columns, columns=user_product_matrix.columns
    )

    user_similarity = cosine_similarity(user_product_matrix)
    user_similarity_df = pd.DataFrame(
        user_similarity, index=user_product_matrix.index, columns=user_product_matrix.index
    )

    return user_product_matrix, product_similarity_df, user_similarity_df

# Prophet modeli eğitme

def train_prophet(data):
    """Zaman serisi tahmini için Prophet modelini eğitir."""
    daily_sales = data.groupby(data['InvoiceDate'].dt.date)['TotalPrice'].sum()
    sales_data = daily_sales.reset_index()
    sales_data.columns = ['ds', 'y']

    model = Prophet()
    model.fit(sales_data)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    return forecast[['ds', 'yhat']].tail(30).to_json(orient='records')

# Flask Uygulaması

user_product_matrix = None
product_similarity_df = None
user_similarity_df = None
forecast_data = None

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    """Kullanıcıdan alınan CSV dosyasını işler ve modelleri oluşturur."""
    global user_product_matrix, product_similarity_df, user_similarity_df, forecast_data

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        data = prepare_data(file)
        user_product_matrix, product_similarity_df, user_similarity_df = create_similarity_matrices(data)
        forecast_data = train_prophet(data)
        return jsonify({"message": "File processed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ürün öneri sistemi
@app.route('/recommend', methods=['POST'])
def recommend():
    global product_similarity_df
    if product_similarity_df is None:
        return jsonify({"error": "Data not uploaded or processed"}), 400

    data = request.json
    products = data.get('products')

    if not products or not isinstance(products, list):
        return jsonify({"error": "Products should be a list of product names"}), 400

    recommendations = {}
    for product in products:
        if product not in product_similarity_df.columns:
            recommendations[product] = {"error": "Product not found"}
        else:
            similar_products = product_similarity_df[product].sort_values(ascending=False).head(10)
            recommendations[product] = {
                other_product: f"{round(score * 100, 2)}%"
                for other_product, score in similar_products.items()
            }
            recommendations[product] = dict(sorted(recommendations[product].items(), key=lambda item: float(item[1][:-1]), reverse=True))
    return jsonify(recommendations)

# Kullanıcı öneri sistemi
@app.route('/user-recommend', methods=['POST'])
def user_recommend():
    global user_similarity_df, user_product_matrix
    if user_similarity_df is None or user_product_matrix is None:
        return jsonify({"error": "Data not uploaded or processed"}), 400

    req_data = request.json
    user_id = req_data.get('user_id')

    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({"error": "Invalid user ID format"}), 400

    if user_id not in user_similarity_df.index:
        return jsonify({"error": "User not found"}), 404
    
    # Kullanıcının alması olası ürünlerin listesi
    user_recommendations = {}
    if user_id in user_product_matrix.index:
        user_products = user_product_matrix.loc[user_id]
        total_quantity = user_products.sum()
        user_recommendations = {
            product: f"{round((quantity / total_quantity) * 100, 2)}%"
            for product, quantity in user_products[user_products > 0].items()
        }
        user_recommendations = dict(sorted(user_recommendations.items(), key=lambda item: float(item[1][:-1]), reverse=True))

    # Benzer kullanıcıların listesi
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)
    similar_users_list = {
        similar_user: f"{round(score * 100, 2)}%"
        for similar_user, score in similar_users.items() if score > 0
    }
    similar_users_list = dict(sorted(similar_users_list.items(), key=lambda item: float(item[1][:-1]), reverse=True))

    return jsonify({"user_recommendations": user_recommendations, "similar_users": similar_users_list})


@app.route('/forecast-sales', methods=['GET'])
def forecast_sales():
    global forecast_data
    if forecast_data is None:
        return jsonify({"error": "Data not uploaded or processed"}), 400

    return forecast_data

# Flask uygulamasını başlatma
if __name__ == "__main__":
    app.run(debug=True)
