grammar Api2AiDsl

entry Model:
    'openapi' openapi=STRING
    (insecureEnv?='insecureEnv')?
    ('auth' auth=Auth)?
    (operations += Operation)*;

Auth:
    '{'
        ('in' ':' location=AuthLocation)?
        ('name' ':' name=STRING)?
        ('prefix' ':' prefix=STRING)?
    '}';

Operation:
    method=HttpMethod path=STRING '{'
        ('toolName' ':' toolName=STRING)?
        ('intent' ':' intent=STRING)?
        ('summary' ':' summary=STRING)?
        ('description' ':' description=STRING)?
        ('example' ':' example=STRING)?
        ('autofillParams' ':' '[' (autofillParams+=STRING (',' autofillParams+=STRING)*)? ']')?
        (public?='public')?
        (restricted?='restricted')?
    '}';

AuthLocation returns string:
    'header' | 'query';

HttpMethod returns string:
    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

hidden terminal WS: /\s+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
