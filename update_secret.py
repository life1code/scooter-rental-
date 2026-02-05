import boto3
import json

client = boto3.client('secretsmanager', region_name='ap-southeast-2')
secret_id = 'scooter-rental-secrets'

data = {
    "DATABASE_URL": "postgresql://scooter_admin:ScooterPass2026@scooter-db.c3gocgi6okg2.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=require",
    "GOOGLE_CLIENT_ID": "1015477203320-evp3sc4pg4fivqjb1klkh96lagiej09m.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET": "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",
    "NEXTAUTH_SECRET": "change-me-to-something-long",
    "NEXTAUTH_URL": "https://ceylonrider.com",
    "RESEND_API_KEY": "re_YADZpPm5_5fgfbTvU32PhWKQKScVhFCqA",
    "AWS_S3_BUCKET_NAME": "amzn-s3-scooter-bucket",
    "AWS_S3_BACKUP_BUCKET_NAME": "scooter-rental-backups-managed-by-aws",
    "AWS_REGION": "ap-southeast-2"
}

try:
    response = client.put_secret_value(
        SecretId=secret_id,
        SecretString=json.dumps(data)
    )
    print("Success:", response['VersionId'])
except Exception as e:
    print("Error:", str(e))
