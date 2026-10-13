# Headers for the files served by Nginx. Proxied API responses keep the headers set by the API.
# This OpenSSL-enabled Nginx generates a fresh 128-bit request_id for the CSP nonce. Cloudflare
# reads the response header and assigns this nonce to its injected JavaScript Detections scripts.
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-$request_id'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
