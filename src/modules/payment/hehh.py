def create_paystack_transaction(grand_total_amount:float,email:str,order)->dict:
    headers = {
        "Authorization": f"Bearer {current_app.config['PAYSTACK_SECRET_KEY']}",
        "Content-Type": "application/json"
    }
    payload = {
        "amount": int(grand_total_amount * 100), 
        "email": email,
        "currency": "NGN",
        "channels": ["card","bank","ussd","bank_transfer"]
    }
    
    logger.info("Initializing Paystack transaction with payload: %s", payload)
    
    response = httpx.post(PAYSTACK_INIT_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json().get("data", {})
        logger.info("Paystack transaction initialized successfully: %s", data)
        return {
            "payment_url": data.get("authorization_url"),
            "reference": data.get("reference"),
            "access_code": data.get("access_code"),
            "grand_amount_paid": grand_total_amount,
            "total_amount": order.total_price,
            "currency": "NGN",
            "status": "pending",
            "service_fee": order.service_fee,
            "delivery_fee": order.delivery_fee,
            "message": "Transaction successfully initialized."
        }
    else:
        error_message = response.json().get("message", "No error message provided")
        logger.error("Failed to create Paystack transaction: %s", error_message)
        raise Exception(f"Failed to create Paystack transaction: {error_message}")