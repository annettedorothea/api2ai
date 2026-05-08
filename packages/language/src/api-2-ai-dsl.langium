grammar Api2AiDsl

entry Model:
    'openapi' openapi=STRING
    'baseUrl' baseUrl=STRING
    (operations += Operation)*;

Operation:
    method=HttpMethod path=STRING '{'
        'intent' ':' intent=STRING
        ('example' ':' example=STRING)?
        'toolName' ':' toolName=STRING
    '}';

HttpMethod returns string:
    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

hidden terminal WS: /\s+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
