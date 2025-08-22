from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi import status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging

from models.subscription import SubscriptionCreate, SubscriptionResponse, SubscriptionPlan
from services.subscription_service import SubscriptionService
from api.auth import get_current_user, require_admin, get_db
from models.user import UserResponse

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans(
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all available subscription plans"""
    try:
        subscription_service = SubscriptionService(database)
        plans = await subscription_service.get_all_plans()
        return plans
    except Exception as e:
        logger.error(f"Error getting subscription plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription plans"
        )

@router.post("/subscribe", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate = Body(...),
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new subscription (admin only)"""
    try:
        # Verify user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can create subscriptions"
            )
        
        # Verify admin email matches
        if current_user.email != subscription_data.admin_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin email must match your registered email"
            )
        
        subscription_service = SubscriptionService(database)
        subscription = await subscription_service.create_subscription(subscription_data)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create subscription"
            )
        
        return subscription
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )

@router.post("/subscribe-prelogin", response_model=SubscriptionResponse)
async def create_subscription_prelogin(
    subscription_data: SubscriptionCreate = Body(...),
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new subscription for prelogin users (no authentication required)"""
    try:
        subscription_service = SubscriptionService(database)
        subscription = await subscription_service.create_subscription(subscription_data)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create subscription"
            )
        
        return subscription
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating prelogin subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )

@router.get("/company/{company_name}", response_model=SubscriptionResponse)
async def get_company_subscription(
    company_name: str,
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get subscription details for a company (admin only)"""
    try:
        # Verify user is admin and belongs to the company
        if current_user.role != "admin" or current_user.company != company_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        subscription_service = SubscriptionService(database)
        subscription = await subscription_service.get_company_subscription(company_name)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found for this company"
            )
        
        return subscription
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting company subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription details"
        )

@router.get("/my-subscription", response_model=SubscriptionResponse)
async def get_my_subscription(
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get subscription for current user's email (admin who paid for it)"""
    try:
        logger.info(f"Getting subscription for admin email: {current_user.email}")
        
        subscription_service = SubscriptionService(database)
        
        # Simply find subscription by admin email - much simpler!
        subscription = await subscription_service.get_subscription_by_admin_email(current_user.email)
        
        if not subscription:
            logger.info(f"No subscription found for admin email: {current_user.email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found for your account"
            )
        
        logger.info(f"Successfully found subscription for admin: {current_user.email}")
        return subscription
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription details"
        )

@router.put("/cancel", response_model=dict)
async def cancel_subscription(
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(require_admin)
):
    """Cancel subscription for current admin (admin only)"""
    try:
        subscription_service = SubscriptionService(database)
        success = await subscription_service.cancel_subscription_by_admin_email(current_user.email)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to cancel subscription or no active subscription found"
            )
        
        return {"message": "Subscription cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/admin/subscriptions", response_model=List[SubscriptionResponse])
async def admin_list_subscriptions(
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(require_admin)
):
    """List subscriptions for current admin"""
    try:
        subscription_service = SubscriptionService(database)
        # Return the current admin's subscription
        subscription = await subscription_service.get_subscription_by_admin_email(current_user.email)
        return [subscription] if subscription else []
        
    except Exception as e:
        logger.error(f"Error listing subscriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscriptions"
        )

@router.get("/debug/all-subscriptions")
async def debug_all_subscriptions(
    database: AsyncIOMotorDatabase = Depends(get_db)
):
    """Debug endpoint to see all subscriptions in database"""
    try:
        subscriptions = await database.get_collection("subscriptions").find({}).to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        for sub in subscriptions:
            if '_id' in sub:
                sub['_id'] = str(sub['_id'])
        
        return {
            "total_subscriptions": len(subscriptions),
            "subscriptions": subscriptions
        }
    except Exception as e:
        logger.error(f"Error in debug endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug error: {str(e)}"
        )

@router.get("/debug/user-info")
async def debug_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """Debug endpoint to see current user info"""
    try:
        return {
            "user_email": current_user.email,
            "user_company": current_user.company,
            "user_role": current_user.role,
            "user_name": current_user.name
        }
    except Exception as e:
        logger.error(f"Error in user debug endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug error: {str(e)}"
        )

@router.post("/cleanup-duplicates", response_model=dict)
async def cleanup_duplicate_subscriptions(
    database: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserResponse = Depends(require_admin)
):
    """Clean up duplicate subscriptions (admin only)"""
    try:
        subscription_service = SubscriptionService(database)
        result = await subscription_service.cleanup_duplicate_subscriptions()
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cleanup failed: {result['error']}"
            )
        
        return {
            "message": "Duplicate subscriptions cleaned up successfully",
            "details": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during subscription cleanup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup duplicate subscriptions"
        )
