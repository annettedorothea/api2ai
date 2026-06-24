grammar Api2AiDsl

entry Model:
    'openapi' openapi=STRING
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
        ('toolName' ':' toolName=ID)?
        'access' ':' access=AccessKind
        ('authorize' ':' authorize=AuthorizeSpec)?
        ('prepare' ':' prepare=PrepareSpec)?
        ('intent' ':' intent=DslText)?
        ('summary' ':' summary=DslText)?
        ('description' ':' description=DslText)?
        ('example' ':' example=DslText)?
        ('params' ':' params=ApiParamMap)?
        ('body' ':' body=DslText)?
        ('response' ':' response=DslText)?
    '}';

ApiParamMap:
    '{' (entries += ApiParamEntry)* '}';

ApiParamEntry:
    key=ID ':' spec=ApiParamSpec;

ApiParamSpec:
    '{' (fields += ApiParamSpecField)* '}';

ApiParamSpecField:
    'description' ':' description=DslText |
    'example' ':' example=DslText;

AccessKind:
    PublicAccess | ProtectedAccess;

PublicAccess:
    {infer PublicAccess} 'public';

ProtectedAccess:
    {infer ProtectedAccess} 'protected';

AuthorizeSpec:
    AuthorizeTrue;

AuthorizeTrue:
    {infer AuthorizeTrue} 'true';

PrepareSpec:
    PrepareTrue | PrepareBody;

PrepareTrue:
    {infer PrepareTrue} 'true';

PrepareBody:
    {infer PrepareBody} '{' ('optionalParams' ':' '[' (optionalParams+=ID (',' optionalParams+=ID)*)? ']')? '}';

AuthLocation returns string:
    'header' | 'query';

HttpMethod returns string:
    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

DslText returns string:
    STRING | MULTILINE_STRING;

hidden terminal WS: /\s+/;
terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal MULTILINE_STRING: /'''[\s\S]*?'''|"""[\s\S]*?"""/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
