# Data_Analysis_From_CVS
E-commerce analysis tool that provides personalized product recommendations and user-based suggestions. Built with React.js for the frontend and Flask for the backend, 
this project utilizes machine learning algorithms such as cosine similarity and Prophet for accurate insights. 
This project is designed to process user-uploaded CSV data and provide actionable insights for better decision-making in e-commerce platforms.

FEATURES:
CSV Data Processing:
Upload and process e-commerce data for analysis.

Product Recommendations:
Suggests similar products based on the input. (UNFINISHED)

User Recommendations:
Identifies similar users and suggests products they are likely to purchase.

Sales Forecasting:
Predicts future sales trends using the Prophet model. (UNFINISHED)
Search and Highlight:
Enables searching within recommendations with highlighted results.

User Guide:
Provides an interactive guide to help users understand the application.

Tech Stack:
Frontend:
React.js: For building dynamic and responsive user interfaces.
TypeScript: Ensures type safety in the frontend codebase.
CSS: Custom styling for modern and clean UI.

Backend:
Flask: Lightweight Python framework for building APIs.
Pandas: For data processing and cleaning.
Scikit-learn: To calculate product and user similarities.
Prophet: For time series forecasting.
Flask-CORS: To handle cross-origin requests.

Contributing:
Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

Contact 
For question or feedback, please contact:

Email: ahmedbahadir.demir@gmail.com
GitHub: bhdrdemir
----------------------------------------------------------------------------------------------------------

# quiz.py

import tensorflow as tf  # Derin öğrenme modelleri oluşturmak ve eğitmek için kullanılır
import numpy as np       # Sayısal işlemler için kullanılır
import matplotlib.pyplot as plt  # Görselleştirme işlemleri için kullanılır

def main():
    # Veri setini yükle
    mnist = tf.keras.datasets.fashion_mnist
    (X_train, y_train), (X_test, y_test) = mnist.load_data()

    # Boyutları göster
    print("Eğitim verisi boyutu:", X_train.shape)
    print("Test verisi boyutu:", X_test.shape)

    # İlk 5 resmi görselleştir
    for i in range(5):
        plt.imshow(X_train[i], cmap='gray')
        plt.title(f"Label: {y_train[i]}")
        plt.show()

    # Normalizasyon (ölçekleme)
    X_train = X_train / 255.0
    X_test = X_test / 255.0

    # Modeli oluştur
    model = tf.keras.models.Sequential([
        tf.keras.layers.Flatten(input_shape=(28, 28)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])

    # Modeli derle
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    # Eğitimi başlat
    history = model.fit(X_train, y_train, epochs=5, validation_data=(X_test, y_test))

    # Sonuçları çiz
    plt.plot(history.history['accuracy'], label='Eğitim Doğruluğu')
    plt.plot(history.history['val_accuracy'], label='Doğrulama Doğruluğu')
    plt.xlabel('Epoch')
    plt.ylabel('Doğruluk')
    plt.title('Model Doğruluk Değişimi')
    plt.legend()
    plt.show()

    # Test seti üzerinde değerlendir
    test_loss, test_acc = model.evaluate(X_test, y_test)
    print(f"Test doğruluğu: {test_acc:.4f}")

# Bu satır program doğrudan çalıştırıldığında main() fonksiyonunu çağırır
if __name__ == "__main__":
    main()

###################################################################################################

# Gerekli kütüphaneleri içe aktar
from sklearn import datasets  # Sklearn içindeki veri setlerini yüklemek için
from sklearn.model_selection import train_test_split  # Veri setini eğitim/test olarak ayırmak için
from sklearn.preprocessing import StandardScaler  # Ölçekleme işlemi için
from sklearn.linear_model import LogisticRegression  # Lojistik regresyon modeli
from sklearn.metrics import accuracy_score  # Doğruluk ölçmek için

# Soru 1: Sklearn içindeki Iris veri setini yükleyin ve bağımlı/bağımsız değişkenleri ayırın.
iris = datasets.load_iris()
X, y = iris.data, iris.target

# Soru 2: Veri setini eğitim ve test setlerine ayırın (%80 eğitim, %20 test).
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Soru 3: Eğitim ve test verilerini ölçekleyin.
# Neden ölçekleme gerekir?
# CEVAP: Ölçekleme, özellikle mesafeye duyarlı algoritmalarda (örneğin lojistik regresyon, KNN) daha iyi performans sağlar.
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Soru 4: Lojistik Regresyon modelini eğitin.
model = LogisticRegression(max_iter=200)

# model.fit ne işe yarar?
# CEVAP: Eğitim verisini kullanarak modelin parametrelerini öğrenmesini sağlar (eğitim süreci).
model.fit(X_train_scaled, y_train)

# Soru 5: Modelin doğruluk oranını hesaplayın.
y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Doğruluk Oranı: {accuracy:.2f}")


