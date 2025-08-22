from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from models.subscription import SubscriptionPlan, CompanySubscription, SubscriptionCreate, SubscriptionResponse
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.subscription_collection = database.get_collection("subscriptions")
        self.plans_collection = database.get_collection("subscription_plans")
        
        # Debug: Log the collections being used
        logger.info(f"SubscriptionService initialized with database: {database.name}")
        logger.info(f"Using collections: subscriptions={self.subscription_collection.name}, subscription_plans={self.plans_collection.name}")
        
        # Don't initialize plans here - do it lazily when needed
    
    async def _ensure_default_plans(self):
        """Ensure default subscription plans exist (called when needed)"""
        try:
            # Check if plans already exist
            existing_plans = await self.plans_collection.count_documents({})
            logger.info(f"Found {existing_plans} existing plans in database")
            
            if existing_plans > 0:
                return
            
            # Create default plans
            from bson import ObjectId
            
            default_plans = [
                {
                    "_id": ObjectId(),
                    "name": "Starter",
                    "max_users": 5,
                    "ml_threat_detection": True,
                    "csv_upload_limit": 100,
                    "email_alerts": False,
                    "storage_limit_gb": 1,
                    "price": 499.0,  # ₹499 monthly
                    "duration_months": 1,
                    "created_at": datetime.now(timezone.utc)
                },
                {
                    "_id": ObjectId(),
                    "name": "Pro",
                    "max_users": 25,
                    "ml_threat_detection": True,
                    "csv_upload_limit": 500,
                    "email_alerts": True,
                    "storage_limit_gb": 5,
                    "price": 1999.0,  # ₹1,999 monthly
                    "duration_months": 1,
                    "created_at": datetime.now(timezone.utc)
                }
            ]
            
            logger.info(f"Inserting {len(default_plans)} default plans")
            result = await self.plans_collection.insert_many(default_plans)
            logger.info(f"Default subscription plans initialized with IDs: {result.inserted_ids}")
            
        except Exception as e:
            logger.error(f"Failed to initialize default plans: {e}")
            logger.error(f"Database connection status: {self.database}")
            raise
    
    async def get_plan_by_name(self, plan_name: str) -> Optional[SubscriptionPlan]:
        """Get subscription plan by name"""
        try:
            # Ensure default plans exist before querying
            await self._ensure_default_plans()
            
            plan_dict = await self.plans_collection.find_one({"name": plan_name})
            if plan_dict:
                # Debug: Log the raw plan data from database
                logger.info(f"Raw plan data from database: {plan_dict}")
                
                return SubscriptionPlan(**plan_dict)
            return None
        except Exception as e:
            logger.error(f"Error getting plan by name: {e}")
            return None
    
    async def get_all_plans(self) -> List[SubscriptionPlan]:
        """Get all available subscription plans"""
        try:
            # Ensure default plans exist before querying
            await self._ensure_default_plans()
            
            plans = []
            cursor = self.plans_collection.find({})
            async for plan_dict in cursor:
                plans.append(SubscriptionPlan(**plan_dict))
            return plans
        except Exception as e:
            logger.error(f"Error getting all plans: {e}")
            return []
    
    async def create_subscription(self, subscription_data: SubscriptionCreate) -> Optional[SubscriptionResponse]:
        """Create a new company subscription"""
        try:
            logger.info(f"Starting subscription creation for: {subscription_data}")
            
            # Validate database connection
            try:
                await self.database.command("ping")
                logger.info("Database connection validated")
            except Exception as db_error:
                logger.error(f"Database connection failed: {db_error}")
                raise ValueError(f"Database connection failed: {db_error}")
            
            # Validate collections exist
            try:
                collections = await self.database.list_collection_names()
                logger.info(f"Available collections: {collections}")
                
                if "subscription_plans" not in collections:
                    logger.error("subscription_plans collection not found")
                    raise ValueError("subscription_plans collection not found")
                
                if "subscriptions" not in collections:
                    logger.error("subscriptions collection not found")
                    raise ValueError("subscriptions collection not found")
                    
                logger.info("Required collections validated")
            except Exception as coll_error:
                logger.error(f"Collection validation failed: {coll_error}")
                raise ValueError(f"Collection validation failed: {coll_error}")
            
            # Validate subscription_plans collection has data
            try:
                plan_count = await self.plans_collection.count_documents({})
                logger.info(f"subscription_plans collection has {plan_count} documents")
                
                if plan_count == 0:
                    logger.warning("subscription_plans collection is empty, will initialize default plans")
            except Exception as count_error:
                logger.error(f"Failed to count documents in subscription_plans: {count_error}")
                raise ValueError(f"Failed to count documents in subscription_plans: {count_error}")
            
            # Get plan details
            plan = await self.get_plan_by_name(subscription_data.plan_name)
            if not plan:
                raise ValueError(f"Plan '{subscription_data.plan_name}' not found")
            
            # Debug: Log the plan data
            logger.info(f"Plan found: {plan.model_dump()}")
            
            # Debug: Check if plan has all required fields
            plan_dict = plan.model_dump()
            logger.info(f"Plan model_dump result: {plan_dict}")
            logger.info(f"Plan fields: name={plan.name}, max_users={plan.max_users}, ml_threat_detection={plan.ml_threat_detection}")
            
            # Ensure plan_dict has all required fields
            required_plan_fields = ['name', 'max_users', 'ml_threat_detection', 'csv_upload_limit', 'email_alerts', 'storage_limit_gb', 'price', 'duration_months', 'created_at']
            missing_fields = [field for field in required_plan_fields if field not in plan_dict]
            if missing_fields:
                logger.error(f"Missing required plan fields: {missing_fields}")
                raise ValueError(f"Plan missing required fields: {missing_fields}")
            
            logger.info(f"Plan validation passed, all required fields present")
            
            # Additional validation: ensure plan_dict values are not None
            for field in required_plan_fields:
                if plan_dict.get(field) is None:
                    logger.error(f"Plan field '{field}' is None")
                    raise ValueError(f"Plan field '{field}' cannot be None")
            
            logger.info(f"Plan field values validation passed")
            
            # Additional validation: ensure plan_dict values are of correct types
            if not isinstance(plan_dict.get('name'), str):
                logger.error(f"Plan field 'name' is not string: {type(plan_dict.get('name'))}")
                raise ValueError(f"Plan field 'name' must be string")
            
            if not isinstance(plan_dict.get('max_users'), int):
                logger.error(f"Plan field 'max_users' is not int: {type(plan_dict.get('max_users'))}")
                raise ValueError(f"Plan field 'max_users' must be int")
            
            if not isinstance(plan_dict.get('ml_threat_detection'), bool):
                logger.error(f"Plan field 'ml_threat_detection' is not bool: {type(plan_dict.get('ml_threat_detection'))}")
                raise ValueError(f"Plan field 'ml_threat_detection' must be bool")
            
            logger.info(f"Plan field types validation passed")
            
            # Handle prelogin users who might not have a company name yet
            company_name = subscription_data.company_name
            if company_name == 'New Company':
                # For prelogin users, we'll use the admin email domain as company name
                # or create a placeholder that can be updated later
                company_name = f"Company_{subscription_data.admin_email.split('@')[1].split('.')[0]}"
            
            logger.info(f"Using company name: {company_name}")
            
            # Calculate end date based on billing period
            start_date = datetime.now(timezone.utc)
            billing_period = subscription_data.billing_period.lower()
            
            # Calculate end date based on billing period
            if billing_period == "yearly":
                # For yearly billing, add exactly 1 year
                end_date = start_date.replace(year=start_date.year + 1)
                logger.info(f"Yearly subscription: {start_date} to {end_date}")
            else:
                # For monthly billing (default), add exactly 1 month
                # Handle month overflow and day-of-month edge cases
                if start_date.month == 12:
                    # December -> January of next year
                    end_date = start_date.replace(year=start_date.year + 1, month=1)
                else:
                    # Regular month increment
                    end_date = start_date.replace(month=start_date.month + 1)
                
                # Handle day-of-month edge cases (e.g., Jan 31 -> Feb 28/29)
                try:
                    # Try to set the same day
                    end_date = end_date.replace(day=start_date.day)
                except ValueError:
                    # If the day doesn't exist in target month, use last day of that month
                    import calendar
                    last_day = calendar.monthrange(end_date.year, end_date.month)[1]
                    end_date = end_date.replace(day=last_day)
                
                logger.info(f"Monthly subscription: {start_date} to {end_date}")
            
            logger.info(f"Calculated subscription period: {start_date.strftime('%Y-%m-%d %H:%M:%S')} to {end_date.strftime('%Y-%m-%d %H:%M:%S')} ({billing_period})")
            
            # Check if company already has an active subscription
            existing_subscription = await self.subscription_collection.find_one({
                "company_name": company_name,
                "status": "active"
            })
            
            if existing_subscription:
                logger.info(f"Found existing subscription for company: {company_name}")
                # Update existing subscription
                update_data = {
                    "plan_name": subscription_data.plan_name,
                    "plan_details": plan.model_dump(),
                    "status": "active",
                    "end_date": end_date,
                    "payment_status": subscription_data.payment_status,
                    "updated_at": datetime.now(timezone.utc)
                }
                
                result = await self.subscription_collection.update_one(
                    {"company_name": company_name},
                    {"$set": update_data}
                )
                
                if result.modified_count > 0:
                    # Get updated subscription
                    updated_sub = await self.subscription_collection.find_one({
                        "company_name": company_name
                    })
                    
                    # Debug: Log the updated subscription data
                    logger.info(f"Updated subscription data: {updated_sub}")
                    
                    try:
                        subscription_response = SubscriptionResponse(**updated_sub)
                        logger.info(f"Successfully created SubscriptionResponse from updated sub: {subscription_response}")
                        return subscription_response
                    except Exception as validation_error:
                        logger.error(f"Failed to create SubscriptionResponse from updated sub: {validation_error}")
                        logger.error(f"Validation error details: {validation_error.errors() if hasattr(validation_error, 'errors') else 'No detailed errors'}")
                        raise
            else:
                logger.info(f"Creating new subscription for company: {company_name}")
                # Create new subscription
                subscription_dict = {
                    "company_name": company_name,
                    "admin_email": subscription_data.admin_email,
                    "plan_name": subscription_data.plan_name,
                    "plan_details": plan.model_dump(),
                    "status": "active",
                    "start_date": start_date,
                    "end_date": end_date,
                    "payment_status": subscription_data.payment_status,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                
                logger.info(f"Inserting new subscription: {subscription_dict}")
                result = await self.subscription_collection.insert_one(subscription_dict)
                subscription_dict["_id"] = result.inserted_id
                
                # Debug: Log the subscription data before creating SubscriptionResponse
                logger.info(f"Creating SubscriptionResponse with data: {subscription_dict}")
                
                # Create a clean dictionary for SubscriptionResponse
                clean_subscription_data = {
                    "_id": subscription_dict["_id"],
                    "company_name": subscription_dict["company_name"],
                    "admin_email": subscription_dict["admin_email"],
                    "plan_name": subscription_dict["plan_name"],
                    "plan_details": subscription_dict["plan_details"],
                    "status": subscription_dict["status"],
                    "start_date": subscription_dict["start_date"],
                    "end_date": subscription_dict["end_date"],
                    "payment_status": subscription_dict["payment_status"],
                    "created_at": subscription_dict["created_at"],
                    "updated_at": subscription_dict["updated_at"]
                }
                
                logger.info(f"Clean subscription data for SubscriptionResponse: {clean_subscription_data}")
                
                try:
                    subscription_response = SubscriptionResponse(**clean_subscription_data)
                    logger.info(f"Successfully created SubscriptionResponse: {subscription_response}")
                    return subscription_response
                except Exception as validation_error:
                    logger.error(f"Failed to create SubscriptionResponse: {validation_error}")
                    logger.error(f"Validation error details: {validation_error.errors() if hasattr(validation_error, 'errors') else 'No detailed errors'}")
                    raise
                
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            logger.error(f"Full error details: {str(e)}")
            raise ValueError(f"Failed to create subscription: {str(e)}")
    
    async def get_company_subscription(self, company_name: str) -> Optional[SubscriptionResponse]:
        """Get active subscription for a company"""
        try:
            subscription_dict = await self.subscription_collection.find_one({
                "company_name": company_name,
                "status": "active"
            })
            
            if subscription_dict:
                return SubscriptionResponse(**subscription_dict)
            return None
            
        except Exception as e:
            logger.error(f"Error getting company subscription: {e}")
            return None
    
    async def get_subscription_by_admin_email(self, admin_email: str) -> Optional[SubscriptionResponse]:
        """Get subscription by admin email"""
        try:
            subscription_dict = await self.subscription_collection.find_one({
                "admin_email": admin_email,
                "status": "active"
            })
            
            if subscription_dict:
                return SubscriptionResponse(**subscription_dict)
            return None
            
        except Exception as e:
            logger.error(f"Error getting subscription by admin email: {e}")
            return None
    
    async def update_subscription_status(self, company_name: str, status: str) -> bool:
        """Update subscription status"""
        try:
            result = await self.subscription_collection.update_one(
                {"company_name": company_name},
                {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating subscription status: {e}")
            return False
    
    async def cancel_subscription(self, company_name: str) -> bool:
        """Cancel a subscription"""
        try:
            result = await self.subscription_collection.update_one(
                {"company_name": company_name},
                {"$set": {
                    "status": "cancelled",
                    "end_date": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error cancelling subscription: {e}")
            return False
    
    async def update_subscription_company_name(self, old_company_name: str, new_company_name: str) -> bool:
        """Update subscription company name (for merging prelogin subscriptions with actual user data)"""
        try:
            logger.info(f"Updating subscription company name from '{old_company_name}' to '{new_company_name}'")
            
            result = await self.subscription_collection.update_one(
                {"company_name": old_company_name, "status": "active"},
                {"$set": {
                    "company_name": new_company_name,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            if result.modified_count > 0:
                logger.info(f"Successfully updated subscription company name")
                return True
            else:
                logger.warning(f"No subscription found to update for company '{old_company_name}'")
                return False
                
        except Exception as e:
            logger.error(f"Error updating subscription company name: {e}")
            return False
    
    async def cancel_subscription_by_admin_email(self, admin_email: str) -> bool:
        """Cancel a subscription by admin email"""
        try:
            logger.info(f"Cancelling subscription for admin email: {admin_email}")
            
            result = await self.subscription_collection.update_one(
                {"admin_email": admin_email, "status": "active"},
                {"$set": {
                    "status": "cancelled",
                    "end_date": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            if result.modified_count > 0:
                logger.info(f"Successfully cancelled subscription for admin: {admin_email}")
                return True
            else:
                logger.warning(f"No active subscription found to cancel for admin: {admin_email}")
                return False
                
        except Exception as e:
            logger.error(f"Error cancelling subscription by admin email: {e}")
            return False
    
    async def cleanup_duplicate_subscriptions(self) -> dict:
        """Clean up duplicate subscriptions and keep only the most recent active one per admin"""
        try:
            logger.info("Starting cleanup of duplicate subscriptions")
            
            # Find all active subscriptions
            active_subscriptions = []
            cursor = self.subscription_collection.find({"status": "active"})
            async for sub in cursor:
                active_subscriptions.append(sub)
            
            logger.info(f"Found {len(active_subscriptions)} active subscriptions")
            
            # Group by admin_email
            admin_subscriptions = {}
            for sub in active_subscriptions:
                admin_email = sub.get("admin_email")
                if admin_email not in admin_subscriptions:
                    admin_subscriptions[admin_email] = []
                admin_subscriptions[admin_email].append(sub)
            
            # Find duplicates and keep only the most recent
            cleaned_count = 0
            for admin_email, subscriptions in admin_subscriptions.items():
                if len(subscriptions) > 1:
                    logger.info(f"Found {len(subscriptions)} duplicate subscriptions for admin: {admin_email}")
                    
                    # Sort by created_at (most recent first)
                    sorted_subs = sorted(subscriptions, key=lambda x: x.get("created_at", datetime.min), reverse=True)
                    
                    # Keep the most recent one, cancel the rest
                    for duplicate_sub in sorted_subs[1:]:
                        result = await self.subscription_collection.update_one(
                            {"_id": duplicate_sub["_id"]},
                            {"$set": {
                                "status": "duplicate_cancelled",
                                "end_date": datetime.now(timezone.utc),
                                "updated_at": datetime.now(timezone.utc),
                                "cancellation_reason": "Duplicate subscription cleanup"
                            }}
                        )
                        if result.modified_count > 0:
                            cleaned_count += 1
                            logger.info(f"Cancelled duplicate subscription {duplicate_sub['_id']} for admin: {admin_email}")
            
            logger.info(f"Cleanup completed. Cancelled {cleaned_count} duplicate subscriptions")
            return {
                "total_active": len(active_subscriptions),
                "duplicates_found": sum(1 for subs in admin_subscriptions.values() if len(subs) > 1),
                "duplicates_cancelled": cleaned_count
            }
            
        except Exception as e:
            logger.error(f"Error during duplicate subscription cleanup: {e}")
            return {"error": str(e)}
