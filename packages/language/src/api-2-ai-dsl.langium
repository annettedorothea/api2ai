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
        'access' ':' access=Access
        ('intent' ':' intent=STRING)?
        ('summary' ':' summary=STRING)?
        ('description' ':' description=STRING)?
        ('example' ':' example=STRING)?
    '}';

Access:
    PublicAccess | ProtectedAccess | CheckedAccess;

PublicAccess:
    {infer PublicAccess} 'public';

ProtectedAccess:
    {infer ProtectedAccess} 'protected';

CheckedAccess:
    {infer CheckedAccess} 'checked' ('{' checkedBody=CheckedAccessBody '}')?;

CheckedAccessBody:
    ('optionalParams' ':' '[' (optionalParams+=STRING (',' optionalParams+=STRING)*)? ']')?;

AuthLocation returns string:
    'header' | 'query';

HttpMethod returns string:
    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

hidden terminal WS: /\s+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
