from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Transaction
from bookings.models import Booking
from .mpesa_utils import initiate_stk_push

class InitiatePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        phone_number = request.data.get('phone_number') # Format 2547...
        
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        amount = booking.service.price
        # Note: Need Ngrok or similar for public callback URL during local testing
        # For MVP we can just use a placeholder
        callback_url = "https://mydomain.com/api/payments/callback/"
        
        mpesa_response = initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=f"TaskSoko-{booking.id}",
            transaction_desc=f"Payment for {booking.service.title}",
            callback_url=callback_url
        )
        
        if 'CheckoutRequestID' in mpesa_response:
            Transaction.objects.create(
                booking=booking,
                checkout_request_id=mpesa_response['CheckoutRequestID'],
                merchant_request_id=mpesa_response['MerchantRequestID'],
                amount=amount,
                phone_number=phone_number
            )
            return Response(mpesa_response, status=status.HTTP_200_OK)
            
        return Response({'error': 'M-Pesa request failed', 'details': mpesa_response}, status=status.HTTP_400_BAD_REQUEST)

class MpesaCallbackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.get('Body', {}).get('stkCallback', {})
        merchant_request_id = data.get('MerchantRequestID')
        checkout_request_id = data.get('CheckoutRequestID')
        result_code = data.get('ResultCode')
        result_desc = data.get('ResultDesc')
        
        try:
            transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
        except Transaction.DoesNotExist:
            return Response({"ResultCode": 0, "ResultDesc": "Ignored"})
            
        transaction.result_code = result_code
        transaction.result_desc = result_desc
        
        if result_code == 0:
            # Payment success
            transaction.status = 'SUCCESS'
            callback_metadata = data.get('CallbackMetadata', {}).get('Item', [])
            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    transaction.mpesa_receipt_number = item.get('Value')
                    
            transaction.booking.payment_status = Booking.PaymentStatus.COMPLETED
            transaction.booking.save()
        else:
            transaction.status = 'FAILED'
            transaction.booking.payment_status = Booking.PaymentStatus.FAILED
            transaction.booking.save()
            
        transaction.save()
        
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
