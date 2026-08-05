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
        ('hooks' ':' hooks=AuthHooks)?
    '}';

AuthHooks:
    '{'
        ('tokenExchange' ':' tokenExchange=Boolean)?
        ('verifyCredential' ':' verifyCredential=Boolean)?
    '}';

Operation:
    method=HttpMethod path=STRING '{'
        ('toolName' ':' toolName=ID)?
        'access' ':' access=AccessKind
        ('hooks' ':' hooks=ToolHooks)?
        ('intent' ':' intent=DslText)?
        ('summary' ':' summary=DslText)?
        ('description' ':' description=DslText)?
        ('example' ':' example=DslText)?
        ('params' ':' params=ApiParamMap)?
        ('body' ':' body=DslText)?
        ('response' ':' response=DslText)?
    '}';

ToolHooks:
    '{'
        ('checkToolAccess' ':' checkToolAccess=Boolean)?
        ('prepareToolCall' ':' prepareToolCall=PrepareToolCallSpec)?
        ('afterToolCall' ':' afterToolCall=Boolean)?
    '}';

PrepareToolCallSpec:
    PrepareToolCallTrue | PrepareToolCallBody;

PrepareToolCallTrue:
    {infer PrepareToolCallTrue} 'true';

PrepareToolCallBody:
    {infer PrepareToolCallBody} '{' 'clientMayOmit' ':' '[' (clientMayOmit+=ID (',' clientMayOmit+=ID)*)? ']' '}';

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

AuthLocation returns string:
    'header' | 'query';

Boolean returns boolean:
    'true' | 'false';

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
