from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

# Secret key for JWT
app.config["JWT_SECRET_KEY"] = "your-secret-key"  # use env var in production
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")


@app.route('/')
def home():
    return jsonify({"message": "Flask backend running with JWT auth!"})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
