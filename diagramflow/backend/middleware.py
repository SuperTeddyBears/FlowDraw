class DisableHTTPSHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Usuń headers wymuszające HTTPS
        if 'Strict-Transport-Security' in response:
            del response['Strict-Transport-Security']
        if 'Cross-Origin-Opener-Policy' in response:
            del response['Cross-Origin-Opener-Policy']
        if 'Cross-Origin-Embedder-Policy' in response:
            del response['Cross-Origin-Embedder-Policy']

        return response