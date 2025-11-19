#!/bin/bash

# ==============================================================================
# Update Google Cloud Pub/Sub Subscription Configuration
# ==============================================================================
# This script updates the Pub/Sub subscription to fix the OIDC audience
# authentication issue between the subscription and webhook endpoint.
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="review-ai-reply"
SUBSCRIPTION_NAME="bottie-ai-webhook-subscription"
SERVICE_ACCOUNT="review-ai-reply@appspot.gserviceaccount.com"

echo -e "${BLUE}===========================================\n${NC}"
echo -e "${BLUE}Pub/Sub Subscription Configuration Update${NC}"
echo -e "${BLUE}===========================================\n${NC}"

# Get APP_URL from environment or .env.production
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  if [ -f ".env.production" ]; then
    echo -e "${YELLOW}Reading NEXT_PUBLIC_APP_URL from .env.production...${NC}"
    export $(grep -v '^#' .env.production | grep NEXT_PUBLIC_APP_URL | xargs)
  fi
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo -e "${RED}Error: NEXT_PUBLIC_APP_URL not found in environment or .env.production${NC}"
  echo -e "${YELLOW}Please set it manually:${NC}"
  echo -e "${YELLOW}  export NEXT_PUBLIC_APP_URL=https://bottie.ai${NC}"
  echo -e "${YELLOW}  yarn pubsub:update${NC}"
  exit 1
fi

# Construct the webhook URL
WEBHOOK_URL="${NEXT_PUBLIC_APP_URL}/api/webhooks/google-reviews"

echo -e "${GREEN}Configuration:${NC}"
echo -e "  Project ID:       ${PROJECT_ID}"
echo -e "  Subscription:     ${SUBSCRIPTION_NAME}"
echo -e "  Service Account:  ${SERVICE_ACCOUNT}"
echo -e "  Push Endpoint:    ${WEBHOOK_URL}"
echo -e "  Audience:         ${WEBHOOK_URL}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI is not installed${NC}"
  echo -e "${YELLOW}Please install it from: https://cloud.google.com/sdk/docs/install${NC}"
  exit 1
fi

# Check if user is authenticated
echo -e "${BLUE}Checking gcloud authentication...${NC}"
if ! gcloud auth print-access-token &> /dev/null; then
  echo -e "${RED}Error: Not authenticated with gcloud${NC}"
  echo -e "${YELLOW}Please run: gcloud auth login${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}\n"

# Show current subscription configuration
echo -e "${BLUE}Current subscription configuration:${NC}"
gcloud pubsub subscriptions describe "$SUBSCRIPTION_NAME" \
  --project="$PROJECT_ID" \
  --format="yaml(pushConfig)" || {
  echo -e "${RED}Error: Failed to describe subscription${NC}"
  echo -e "${YELLOW}Make sure you have access to project: ${PROJECT_ID}${NC}"
  exit 1
}
echo ""

# Confirm before updating
echo -e "${YELLOW}Ready to update subscription configuration.${NC}"
echo -e "${YELLOW}This will change:${NC}"
echo -e "  - Push endpoint to: ${WEBHOOK_URL}"
echo -e "  - OIDC audience to: ${WEBHOOK_URL}"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Update cancelled${NC}"
  exit 0
fi

# Update the subscription
echo -e "${BLUE}Updating subscription...${NC}"
gcloud pubsub subscriptions update "$SUBSCRIPTION_NAME" \
  --project="$PROJECT_ID" \
  --push-endpoint="$WEBHOOK_URL" \
  --push-auth-service-account="$SERVICE_ACCOUNT" \
  --push-auth-token-audience="$WEBHOOK_URL" || {
  echo -e "${RED}Error: Failed to update subscription${NC}"
  exit 1
}
echo -e "${GREEN}✓ Subscription updated successfully${NC}\n"

# Verify the update
echo -e "${BLUE}Verifying updated configuration:${NC}"
gcloud pubsub subscriptions describe "$SUBSCRIPTION_NAME" \
  --project="$PROJECT_ID" \
  --format="yaml(pushConfig)"
echo ""

echo -e "${GREEN}===========================================\n${NC}"
echo -e "${GREEN}✓ Successfully updated Pub/Sub subscription${NC}"
echo -e "${GREEN}===========================================\n${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test the webhook by triggering a Google review notification"
echo -e "  2. Check logs to verify authentication succeeds"
echo -e "  3. Monitor for any 'Wrong recipient' errors"
echo ""
