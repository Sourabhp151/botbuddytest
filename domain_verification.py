import json

def lambda_handler(event, context):
    # Print event for debugging
    print("Received event: ", json.dumps(event))

    # Example: Validate email domain
    email = event['request']['userAttributes']['email']
    allowed_domains = ["redingtongroup.com"]
    email_domain = email.split("@")[-1]
    
    if email_domain not in allowed_domains:
        raise Exception("Email domain is not allowed")

    # Allow auto-confirming user
    event['response']['autoConfirmUser'] = False

    # Optionally auto-verify email
    event['response']['autoVerifyEmail'] = False

    # Optionally auto-verify phone number
    #event['response']['autoVerifyPhone'] = True

    # Return the event for Cognito to proceed
    return event
