# app.py
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

jwt = JWTManager(app)

# Mock database for demonstration
users = {
    "user": {"password": "123", "role": "user"},
    "admin": {"password": "admin", "role": "admin"}
}

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Validate user credentials
    if username in users and users[username]["password"] == password:
        # Generate JWT token and return user role (admin or user)
        access_token = create_access_token(identity=username)
        role = users[username]["role"]  # Get role from the mock database
        return jsonify(token=access_token, role=role), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)
