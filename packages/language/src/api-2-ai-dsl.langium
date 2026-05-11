grammar Api2AiDsl

entry Model:
    'openapi' openapi=STRING
    'baseUrl' baseUrl=STRING
    auth=Auth?
    (operations += Operation)*;

Auth:
    'auth' 'apiKey' '{'
        'in' ':' location=AuthLocation
        'name' ':' name=STRING
        'env' ':' env=STRING
        ('prefix' ':' prefix=STRING)?
    '}';

Operation:
    method=HttpMethod path=STRING '{'
        'toolName' ':' toolName=STRING
        'intent' ':' intent=STRING
        ('example' ':' example=STRING)?
        ('summary' ':' summary=STRING)?
        ('description' ':' description=STRING)?
    '}';

AuthLocation returns string:
    'header' | 'query';

HttpMethod returns string:
    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

hidden terminal WS: /\s+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
