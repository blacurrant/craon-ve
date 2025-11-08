from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
import datetime
import re

auth_bp = Blueprint("auth_bp", __name__)

# Temporary in-memory users (replace with DB later)
# Structure: {username: {password: str, email: str, name: str, id: str}}
users = {}
# Revoked tokens (for logout)
revoked_tokens = set()


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    return True, None


# ✅ Signup/Register route
@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        
        # Extract data
        username = data.get("name")  # Frontend sends 'name'
        email = data.get("email")
        password = data.get("password")

        # Validation
        if not username or not email or not password:
            return jsonify({
                "message": "All fields are required",
                "errors": {
                    "username": ["Username is required"] if not username else [],
                    "email": ["Email is required"] if not email else [],
                    "password": ["Password is required"] if not password else []
                }
            }), 422

        # Validate email format
        if not validate_email(email):
            return jsonify({
                "message": "Invalid email format",
                "errors": {"email": ["Please enter a valid email address"]}
            }), 422

        # Validate password strength
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({
                "message": error_msg,
                "errors": {"password": [error_msg]}
            }), 422

        # Check if user already exists
        if email in [u["email"] for u in users.values()]:
            return jsonify({
                "message": "User already exists",
                "error": "user_exists"
            }), 409

        # Generate user ID
        user_id = f"user_{len(users) + 1}"

        # Store user (in production, hash the password!)
        users[email] = {
            "id": user_id,
            "username": username,
            "email": email,
            "password": password,  # TODO: Hash this with bcrypt in production
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        # Create JWT tokens
        access_token = create_access_token(
            identity=email,
            expires_delta=datetime.timedelta(hours=1)
        )
        refresh_token = create_refresh_token(
            identity=email,
            expires_delta=datetime.timedelta(days=30)
        )

        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_id,
                "email": email,
                "username": username
            }
        }), 201

    except Exception as e:
        return jsonify({
            "message": "An error occurred during signup",
            "error": str(e)
        }), 500


# ✅ Login route
@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        username = data.get("username")  # This is actually email from frontend
        password = data.get("password")

        # Validation
        if not username or not password:
            return jsonify({
                "message": "Email and password are required",
                "error": "missing_credentials"
            }), 400

        # Check if user exists
        if username not in users:
            return jsonify({
                "message": "Invalid credentials",
                "error": "authentication_failed"
            }), 401

        # Verify password
        if users[username]["password"] != password:
            return jsonify({
                "message": "Invalid credentials",
                "error": "authentication_failed"
            }), 401

        # Create JWT tokens
        access_token = create_access_token(
            identity=username,
            expires_delta=datetime.timedelta(hours=1)
        )
        refresh_token = create_refresh_token(
            identity=username,
            expires_delta=datetime.timedelta(days=30)
        )

        user_data = users[username]

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "name": user_data["username"]
            }
        }), 200

    except Exception as e:
        return jsonify({
            "message": "An error occurred during login",
            "error": str(e)
        }), 500


# ✅ Refresh token route
@auth_bp.route('/refresh', methods=['POST', 'OPTIONS'])
@jwt_required(refresh=True)
def refresh():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        current_user = get_jwt_identity()
        
        # Create new access token
        new_access_token = create_access_token(
            identity=current_user,
            expires_delta=datetime.timedelta(hours=1)
        )
        
        return jsonify({
            "access_token": new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Token refresh failed",
            "error": str(e)
        }), 401


# ✅ Logout route
@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
@jwt_required()
def logout():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        jti = get_jwt()["jti"]  # JWT ID
        revoked_tokens.add(jti)
        
        return jsonify({
            "message": "Successfully logged out"
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Logout failed",
            "error": str(e)
        }), 500


# ✅ Get user profile
@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
@jwt_required()
def profile():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        current_user = get_jwt_identity()
        
        if current_user not in users:
            return jsonify({
                "message": "User not found",
                "error": "user_not_found"
            }), 404
        
        user_data = users[current_user]
        
        return jsonify({
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["username"],
            "created_at": user_data.get("created_at")
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Failed to fetch profile",
            "error": str(e)
        }), 500


# ✅ Update user profile
@auth_bp.route('/profile', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_profile():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        if current_user not in users:
            return jsonify({
                "message": "User not found",
                "error": "user_not_found"
            }), 404
        
        # Update allowed fields
        if "name" in data:
            users[current_user]["username"] = data["name"]
        
        user_data = users[current_user]
        
        return jsonify({
            "message": "Profile updated successfully",
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["username"]
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Failed to update profile",
            "error": str(e)
        }), 500


# ✅ Change password
@auth_bp.route('/change-password', methods=['POST', 'OPTIONS'])
@jwt_required()
def change_password():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        
        if not current_password or not new_password:
            return jsonify({
                "message": "Current and new password are required",
                "error": "missing_fields"
            }), 400
        
        # Verify current password
        if users[current_user]["password"] != current_password:
            return jsonify({
                "message": "Current password is incorrect",
                "error": "invalid_password"
            }), 401
        
        # Validate new password
        is_valid, error_msg = validate_password(new_password)
        if not is_valid:
            return jsonify({
                "message": error_msg,
                "error": "weak_password"
            }), 422
        
        # Update password
        users[current_user]["password"] = new_password
        
        return jsonify({
            "message": "Password changed successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Failed to change password",
            "error": str(e)
        }), 500