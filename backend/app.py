import os

from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token
from flask_cors import CORS
from pymongo import MongoClient
from datetime import timedelta

app = Flask(__name__)
CORS(app, origins=["https://stanghero.vercel.app"])
print("CORS is enabled with origins: https://stanghero.vercel.app")

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
print(os.getenv('JWT_SECRET_KEY'))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

conn = os.getenv('mongodb+srv://stanghero-admin:paWstimes4!@stanghero-cluster.snyvg.mongodb.net/')
print(os.getenv('MONGODB_URI'))
client = MongoClient(f"{conn}") 
db = client["stanghero"] 
users_collection = db["users"] 

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username})

    if user and user["password"] == password:
        access_token = create_access_token(identity=username)
        role = user["role"]
        return jsonify(token=access_token, role=role), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)
