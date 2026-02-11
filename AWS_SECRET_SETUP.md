# AWS Secrets Manager - Manual Setup Instructions

## Create Secret via AWS Console

Since the AWS CLI is experiencing issues, please create the secret manually:

### Step 1: Go to AWS Secrets Manager Console
Navigate to: https://ap-southeast-2.console.aws.amazon.com/secretsmanager/home?region=ap-southeast-2

### Step 2: Create New Secret
1. Click "Store a new secret"
2. Select "Other type of secret"
3. Choose "Plaintext" tab
4. Paste the following JSON:

```json
{
  "DATABASE_URL": "postgresql://scooter_admin:ScooterPass2026@scooter-db.c3gocgi6okg2.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=require",
  "NEXTAUTH_URL": "https://dev.ceylonrider.com",
  "NEXTAUTH_SECRET": "CHANGE_ME_TO_RANDOM_STRING",
  "GOOGLE_CLIENT_ID": "CHANGE_ME",
  "GOOGLE_CLIENT_SECRET": "CHANGE_ME",
  "AWS_ACCESS_KEY_ID": "CHANGE_ME",
  "AWS_SECRET_ACCESS_KEY": "CHANGE_ME",
  "AWS_S3_BUCKET_NAME": "CHANGE_ME",
  "AWS_S3_BACKUP_BUCKET_NAME": "scooter-rental-dev-backups-managed-by-aws",
  "RESEND_API_KEY": "CHANGE_ME"
}
```

### Step 3: Configure Secret
- **Secret name**: `dev-scooter-secret`
- **Description**: Secrets for scooter-rental dev environment
- **Encryption key**: Use default AWS managed key
- **Automatic rotation**: Disabled

### Step 4: Review and Store
Click "Store" to create the secret.

### Step 5: Update Values to Replace CHANGE_ME
After creating the secret, update the placeholder values with actual credentials:
- `NEXTAUTH_SECRET`: Generate a random string (e.g., using `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: AWS credentials for S3 access
- `AWS_S3_BUCKET_NAME`: Your S3 bucket name for uploads
- `RESEND_API_KEY`: Your Resend API key for emails

---

## Alternative: AWS CLI Command (if CLI issues are resolved)

```bash
aws secretsmanager create-secret \
  --name dev-scooter-secret \
  --description "Secrets for scooter-rental dev environment" \
  --secret-string '{"DATABASE_URL":"postgresql://scooter_admin:ScooterPass2026@scooter-db.c3gocgi6okg2.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=require","NEXTAUTH_URL":"https://dev.ceylonrider.com","NEXTAUTH_SECRET":"CHANGE_ME_TO_RANDOM_STRING","GOOGLE_CLIENT_ID":"CHANGE_ME","GOOGLE_CLIENT_SECRET":"CHANGE_ME","AWS_ACCESS_KEY_ID":"CHANGE_ME","AWS_SECRET_ACCESS_KEY":"CHANGE_ME","AWS_S3_BUCKET_NAME":"CHANGE_ME","AWS_S3_BACKUP_BUCKET_NAME":"scooter-rental-dev-backups-managed-by-aws","RESEND_API_KEY":"CHANGE_ME"}' \
  --region ap-southeast-2
```
