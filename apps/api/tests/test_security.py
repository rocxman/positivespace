import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_access_token,
)


class TestPasswordHashing:
    def test_password_hash_and_verify(self):
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)

    def test_different_passwords_different_hashes(self):
        password1 = "Password1"
        password2 = "Password2"
        
        hash1 = get_password_hash(password1)
        hash2 = get_password_hash(password2)
        
        assert hash1 != hash2


class TestJWTTokens:
    def test_create_and_verify_access_token(self):
        user_id = "test-user-id-123"
        token = create_access_token(user_id)
        
        assert token is not None
        assert isinstance(token, str)
        
        decoded_id = verify_access_token(token)
        assert decoded_id == user_id

    def test_verify_invalid_token(self):
        invalid_token = "invalid.token.here"
        result = verify_access_token(invalid_token)
        assert result is None

    def test_token_with_custom_expiry(self):
        from datetime import timedelta
        
        user_id = "test-user-id"
        token = create_access_token(user_id, expires_delta=timedelta(hours=2))
        
        decoded_id = verify_access_token(token)
        assert decoded_id == user_id
