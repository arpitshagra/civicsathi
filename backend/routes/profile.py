"""User Profile blueprint and routes."""

import logging
from flask import Blueprint, request, g
from services import firebase_service
from utils.auth_middleware import current_uid, require_auth
from utils.responses import success, APIError
from utils.validators import validate_profile

logger = logging.getLogger("civicsathi.profile")

profile_bp = Blueprint("profile", __name__)


def calculate_completion(data: dict) -> int:
    """Calculate the profile completion percentage dynamically.
    
    Name = 10%
    DOB = 10%
    Location = 20% (state, district, city, pincode - 5% each)
    Education = 10%
    Occupation = 10%
    Income = 15%
    Category = 10%
    Interests = 15% (if non-empty list)
    """
    percentage = 0
    
    if data.get("name"):
        percentage += 10
        
    if data.get("dob"):
        percentage += 10
        
    for f in ["state", "district", "city", "pincode"]:
        if data.get(f):
            percentage += 5
            
    if data.get("education"):
        percentage += 10
        
    if data.get("occupation"):
        percentage += 10
        
    if data.get("annualIncome"):
        percentage += 15
        
    if data.get("category"):
        percentage += 10
        
    interests = data.get("interests")
    if isinstance(interests, list) and len(interests) > 0:
        percentage += 15
        
    return percentage


@profile_bp.get("")
@require_auth
def get_profile():
    """Retrieve the user profile, falling back to Auth details if not found."""
    uid = current_uid()
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
        
    profile = firebase_service.get_document("users", uid)
    user_auth = g.user
    
    if not profile:
        profile = {
            "name": user_auth.get("name") or "",
            "email": user_auth.get("email") or "",
            "photoURL": user_auth.get("picture") or "",
            "profileCompletion": None
        }
    else:
        # Ensure fallback fields are populated
        if not profile.get("name"):
            profile["name"] = user_auth.get("name") or ""
        if not profile.get("email"):
            profile["email"] = user_auth.get("email") or ""
        if not profile.get("photoURL"):
            profile["photoURL"] = user_auth.get("picture") or ""
        if "profileCompletion" not in profile:
            profile["profileCompletion"] = None
            
    return success(data=profile)


@profile_bp.post("")
@require_auth
def save_profile():
    """Create or merge a user profile, calculating the completion percentage."""
    uid = current_uid()
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
        
    payload = validate_profile(request.get_json(silent=True))
    percentage = calculate_completion(payload)
    payload["profileCompletion"] = percentage
    
    # Save/Merge to users collection
    firebase_service.set_document("users", uid, payload, merge=True)
    
    # Retrieve updated document
    updated = firebase_service.get_document("users", uid)
    user_auth = g.user
    # Ensure fallback fields
    if not updated.get("photoURL"):
        updated["photoURL"] = user_auth.get("picture") or ""
        
    return success(data=updated, message="Profile updated successfully.")


@profile_bp.put("")
@require_auth
def update_profile():
    """Update profile details (same as POST save_profile)."""
    return save_profile()


@profile_bp.get("/completion")
@require_auth
def get_completion():
    """Return the profile completion percentage of the user."""
    uid = current_uid()
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
        
    profile = firebase_service.get_document("users", uid)
    if not profile or "profileCompletion" not in profile:
        return success(data={"profileCompletion": None, "exists": False})
        
    return success(data={
        "profileCompletion": profile.get("profileCompletion"),
        "exists": True
    })
